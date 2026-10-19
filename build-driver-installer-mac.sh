#!/bin/bash
#
# build-driver-installer-mac.sh
# Automated script to build novacom/novacomd macOS installer package
# Works on both Intel and Apple Silicon Macs
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }

usage() {
    echo "Usage: $0 [--notarize] [--keychain-profile <profile>]"
    echo ""
    echo "  --notarize                 Sign the .pkg with a Developer ID Installer"
    echo "                             certificate, submit it to Apple for notarization,"
    echo "                             and staple the ticket to the package."
    echo "  --keychain-profile <name>  notarytool credential profile, created once with:"
    echo "                               xcrun notarytool store-credentials <name> \\"
    echo "                                 --apple-id <apple-id> --team-id <team-id> \\"
    echo "                                 --password <app-specific-password>"
    echo ""
    echo "  --notarize needs Apple credentials from one of these sources:"
    echo "    - APPLE_ID / APPLE_TEAM_ID / APPLE_APP_SPECIFIC_PASSWORD env vars"
    echo "      (auto-loaded from set-apple-vars.sh next to this script, if present)"
    echo "    - --keychain-profile <name>, if you'd rather use notarytool's keychain storage"
    exit 1
}

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Parse arguments
NOTARIZE=false
KEYCHAIN_PROFILE=""
while [ $# -gt 0 ]; do
    case "$1" in
        --notarize)
            NOTARIZE=true
            shift
            ;;
        --keychain-profile)
            KEYCHAIN_PROFILE="$2"
            shift 2
            ;;
        -h|--help)
            usage
            ;;
        *)
            log_error "Unknown argument: $1"
            usage
            ;;
    esac
done

if [ "$NOTARIZE" = true ] && [ -z "$KEYCHAIN_PROFILE" ]; then
    APPLE_VARS_FILE="$SCRIPT_DIR/set-apple-vars.sh"
    if [ -f "$APPLE_VARS_FILE" ]; then
        log_info "Loading Apple credentials from set-apple-vars.sh"
        source "$APPLE_VARS_FILE"
    fi
fi

if [ "$NOTARIZE" = true ] && [ -z "$KEYCHAIN_PROFILE" ] \
   && { [ -z "$APPLE_ID" ] || [ -z "$APPLE_TEAM_ID" ] || [ -z "$APPLE_APP_SPECIFIC_PASSWORD" ]; }; then
    log_error "--notarize requires Apple credentials"
    log_info "Either create $SCRIPT_DIR/set-apple-vars.sh exporting APPLE_ID, APPLE_TEAM_ID, and APPLE_APP_SPECIFIC_PASSWORD,"
    log_info "or pass --keychain-profile <name> (see: xcrun notarytool store-credentials --help)"
    exit 1
fi

echo ""
echo "=========================================="
echo "  novacom/novacomd Installer Builder"
echo "=========================================="
echo ""

# Detect architecture
ARCH=$(uname -m)
log_info "Architecture: $ARCH"

# Detect Homebrew installation
if [ "$ARCH" = "arm64" ]; then
    BREW_PREFIX="/opt/homebrew"
else
    BREW_PREFIX="/usr/local"
fi

if [ ! -d "$BREW_PREFIX" ]; then
    log_error "Homebrew not found at $BREW_PREFIX"
    log_info "Please install Homebrew from https://brew.sh"
    exit 1
fi
log_success "Homebrew found at $BREW_PREFIX"

# When notarizing, the .pkg itself must be signed with a "Developer ID
# Installer" certificate -- a different identity than the "Developer ID
# Application" one used to sign the binaries. Check for it up front so we
# fail fast instead of after doing the whole build.
INSTALLER_IDENTITY=""
if [ "$NOTARIZE" = true ]; then
    log_info "Checking for Developer ID Installer certificate..."
    if security find-identity -v 2>/dev/null | grep -q "Developer ID Installer"; then
        INSTALLER_IDENTITY=$(security find-identity -v | grep "Developer ID Installer" | head -1 | awk -F'"' '{print $2}')
        log_success "Found Developer ID Installer: $INSTALLER_IDENTITY"
    else
        log_error "No Developer ID Installer certificate found (required for --notarize)"
        log_info "This is separate from the 'Developer ID Application' certificate used to sign binaries."
        log_info "Create one at: https://developer.apple.com/account/resources/certificates"
        exit 1
    fi
fi

# Configuration

# Package identity. PKG_VERSION tracks the webOS release these drivers are
# published alongside (webOS CE 3.1.0), rather than the driver source itself --
# the community asks "which novacom do I need for CE 3.1.0?", and this makes the
# answer obvious. Note the drivers are not actually OS-specific: they work with
# webOS 1.x/2.x/3.0.5 devices too. Bump this whenever the payload changes, even
# if the OS has not moved -- macOS keys upgrade behaviour off it, and shipping
# two different payloads under one version makes an installed package
# indistinguishable from an older one via `pkgutil --pkg-info`.
PKG_IDENTIFIER="com.palm.novacom"
PKG_VERSION="3.1.0.1"
#
# 3.1.0.1: the 0.4.1 rebuild. The packages published with 0.3 and 0.4 carried an
# older novacomd (no Lunacy/adb support) under --version 1.0.0; this is the
# first with the Lunacy relay.

NOVACOMD_BIN="$SCRIPT_DIR/novacomd/build-novacomd/novacomd"
NOVACOM_BIN="$SCRIPT_DIR/novacom/build-novacom/novacom"
NOVATERM_SCRIPT="$SCRIPT_DIR/novacom/scripts/novaterm"

LIBUSB_COMPAT_LIB="$BREW_PREFIX/opt/libusb-compat/lib/libusb-0.1.4.dylib"
LIBUSB_LIB="$BREW_PREFIX/opt/libusb/lib/libusb-1.0.0.dylib"

PKG_DIR="$SCRIPT_DIR/installer-package"
PAYLOAD_DIR="$PKG_DIR/payload"
SCRIPTS_DIR="$PKG_DIR/scripts"

OUTPUT_PKG="$SCRIPT_DIR/novacom-installer-${ARCH}.pkg"

# Rebuild both binaries from clean, stamped with the package version.
#
# This is a release build, so it must not depend on whatever happens to be
# sitting in the build directories. Two problems it avoids:
#
#   1. Identity leakage. The makefiles' default BUILDVERSION is
#        "..local..$(whoami)@$(hostname)..$(date)"
#      which bakes the builder's username and machine name into a binary that
#      gets published. Setting BUILDVERSION replaces that with
#      "novacomd-<version>". It must be passed through the ENVIRONMENT, not as
#      "make BUILDVERSION=x": a command-line assignment overrides the makefile's
#      own quoting of the value and the build fails to compile.
#
#   2. Stale stamps. BUILDVERSION is compiled into main.o, which an incremental
#      build will not recompile if main.c is unchanged -- so the version string
#      records when main.o was last built, not what is in the binary.
#
# A build run under sudo (build.sh's install step, or `sudo make`) leaves build
# directories owned by root, which `make spotless` can't remove -- and the loop
# below hides make's output -- so catch that first and say what to do.
for d in "$SCRIPT_DIR/novacomd/build-novacomd" "$SCRIPT_DIR/novacom/build-novacom"; do
    if [ -e "$d" ] && [ -n "$(find "$d" ! -user "$(id -u)" -print -quit 2>/dev/null)" ]; then
        log_error "$d holds files you don't own, from an earlier sudo build"
        log_info "Remove it, then run this again: sudo rm -rf \"$d\""
        exit 1
    fi
done
log_info "Rebuilding novacomd and novacom from clean (version $PKG_VERSION)..."
for component in novacomd novacom; do
    [ "$component" = "novacomd" ] && target="host" || target=""
    if ! ( cd "$SCRIPT_DIR/$component" \
           && make spotless >/dev/null 2>&1 \
           && BUILDVERSION="$PKG_VERSION" make $target >/dev/null 2>&1 ); then
        log_error "Failed to build $component"
        log_info "Build it manually to see the error: cd $component && make $target"
        exit 1
    fi
    log_success "Built $component"
done

# Verify binaries exist
log_info "Checking for required binaries..."
if [ ! -f "$NOVACOMD_BIN" ]; then
    log_error "novacomd binary not found at: $NOVACOMD_BIN"
    log_info "Please build novacomd first (cd novacomd && ./build.sh)"
    exit 1
fi
log_success "Found novacomd"

# Verify binary architecture matches host — the bundled Homebrew libs must be the same arch
BINARY_ARCH=$(file "$NOVACOMD_BIN" | grep -o 'arm64\|x86_64' | head -1)
if [ -z "$BINARY_ARCH" ]; then
    log_error "Could not determine architecture of novacomd binary"
    exit 1
fi
if [ "$BINARY_ARCH" != "$ARCH" ]; then
    log_error "Binary architecture ($BINARY_ARCH) does not match host architecture ($ARCH)"
    log_info "The bundled libusb libraries must match the binary architecture"
    log_info "Build novacomd on a $ARCH machine, then run this script there"
    exit 1
fi
log_success "Binary architecture matches host: $ARCH"

if [ ! -f "$NOVACOM_BIN" ]; then
    log_error "novacom binary not found at: $NOVACOM_BIN"
    log_info "Please build novacom first (cd novacom && ./build.sh)"
    exit 1
fi
log_success "Found novacom"

if [ ! -f "$NOVATERM_SCRIPT" ]; then
    log_error "novaterm script not found at: $NOVATERM_SCRIPT"
    exit 1
fi
log_success "Found novaterm"

# Verify libusb libraries exist
log_info "Checking for libusb libraries..."
if [ ! -f "$LIBUSB_COMPAT_LIB" ]; then
    log_error "libusb-compat not found at: $LIBUSB_COMPAT_LIB"
    log_info "Please install with: brew install libusb-compat"
    exit 1
fi
log_success "Found libusb-compat"

if [ ! -f "$LIBUSB_LIB" ]; then
    log_error "libusb not found at: $LIBUSB_LIB"
    log_info "Please install with: brew install libusb"
    exit 1
fi
log_success "Found libusb"

# Clean and create directory structure
log_info "Creating package directory structure..."
rm -rf "$PKG_DIR"
mkdir -p "$PAYLOAD_DIR/usr/local/bin"
mkdir -p "$PAYLOAD_DIR/usr/local/lib"
mkdir -p "$SCRIPTS_DIR"
log_success "Directory structure created"

# Copy binaries
log_info "Copying binaries..."
cp "$NOVACOMD_BIN" "$PAYLOAD_DIR/usr/local/bin/"
cp "$NOVACOM_BIN" "$PAYLOAD_DIR/usr/local/bin/"
cp "$NOVATERM_SCRIPT" "$PAYLOAD_DIR/usr/local/bin/"
chmod 755 "$PAYLOAD_DIR/usr/local/bin/"*
log_success "Binaries copied"

# Copy libraries
log_info "Copying libusb libraries..."
cp "$LIBUSB_LIB" "$PAYLOAD_DIR/usr/local/lib/"
cp "$LIBUSB_COMPAT_LIB" "$PAYLOAD_DIR/usr/local/lib/"
chmod 755 "$PAYLOAD_DIR/usr/local/lib/"*.dylib
log_success "Libraries copied"

# Relink libraries using install_name_tool
log_info "Relinking libraries for /usr/local/lib..."

# Update libusb-1.0 install name
install_name_tool -id /usr/local/lib/libusb-1.0.0.dylib \
    "$PAYLOAD_DIR/usr/local/lib/libusb-1.0.0.dylib"

# Update libusb-compat install name and its dependency on libusb-1.0
# Read the actual embedded path from the library rather than assuming it matches BREW_PREFIX
# (the library may have been built on a different architecture with a different Homebrew prefix)
install_name_tool -id /usr/local/lib/libusb-0.1.4.dylib \
    "$PAYLOAD_DIR/usr/local/lib/libusb-0.1.4.dylib"
LIBUSB_COMPAT_LIBUSB_PATH=$(otool -L "$PAYLOAD_DIR/usr/local/lib/libusb-0.1.4.dylib" | awk '/libusb-1\.0\.0/{print $1}')
if [ -n "$LIBUSB_COMPAT_LIBUSB_PATH" ] && [ "$LIBUSB_COMPAT_LIBUSB_PATH" != "/usr/local/lib/libusb-1.0.0.dylib" ]; then
    install_name_tool -change "$LIBUSB_COMPAT_LIBUSB_PATH" \
        /usr/local/lib/libusb-1.0.0.dylib \
        "$PAYLOAD_DIR/usr/local/lib/libusb-0.1.4.dylib"
fi

# Update novacomd to use bundled libusb-compat
# Read the actual embedded path from the binary for the same reason
NOVACOMD_LIBUSB_PATH=$(otool -L "$PAYLOAD_DIR/usr/local/bin/novacomd" | awk '/libusb-0\.1\.4/{print $1}')
if [ -n "$NOVACOMD_LIBUSB_PATH" ] && [ "$NOVACOMD_LIBUSB_PATH" != "/usr/local/lib/libusb-0.1.4.dylib" ]; then
    install_name_tool -change "$NOVACOMD_LIBUSB_PATH" \
        /usr/local/lib/libusb-0.1.4.dylib \
        "$PAYLOAD_DIR/usr/local/bin/novacomd"
else
    log_warning "novacomd already references /usr/local/lib/libusb-0.1.4.dylib or libusb not found in binary"
fi

log_success "Libraries relinked"

# Sign binaries and libraries
# After modifying with install_name_tool, signatures are invalidated and must be re-signed
log_info "Signing binaries and libraries..."

# Check if user has a signing identity
SIGNING_IDENTITY=""
if security find-identity -v -p codesigning 2>/dev/null | grep -q "Developer ID Application"; then
    SIGNING_IDENTITY=$(security find-identity -v -p codesigning | grep "Developer ID Application" | head -1 | awk -F'"' '{print $2}')
    log_info "Found Developer ID: $SIGNING_IDENTITY"
    log_info "Using Developer ID for signing (recommended for distribution)"
else
    log_warning "No Developer ID certificate found"
    log_info "Using ad-hoc signing (will work but may show warnings on other Macs)"
    SIGNING_IDENTITY="-"
fi

# Sign libraries first (dependencies must be signed before binaries that use them)
codesign --force --sign "$SIGNING_IDENTITY" "$PAYLOAD_DIR/usr/local/lib/libusb-1.0.0.dylib" 2>/dev/null || {
    log_warning "Failed to sign libusb-1.0.0.dylib, trying with --deep"
    codesign --force --deep --sign "$SIGNING_IDENTITY" "$PAYLOAD_DIR/usr/local/lib/libusb-1.0.0.dylib"
}

codesign --force --sign "$SIGNING_IDENTITY" "$PAYLOAD_DIR/usr/local/lib/libusb-0.1.4.dylib" 2>/dev/null || {
    log_warning "Failed to sign libusb-0.1.4.dylib, trying with --deep"
    codesign --force --deep --sign "$SIGNING_IDENTITY" "$PAYLOAD_DIR/usr/local/lib/libusb-0.1.4.dylib"
}

# Sign binaries with hardened runtime enabled (required for notarization).
# Note: no --entitlements flag is passed -- "/dev/null" as an empty
# entitlements plist fails on newer codesign ("cannot read entitlement
# data"), and neither binary needs any special entitlements anyway.
sign_binary() {
    local bin="$1"
    if codesign --force --sign "$SIGNING_IDENTITY" --options runtime "$bin"; then
        return 0
    fi
    if [ "$NOTARIZE" = true ]; then
        log_error "Failed to sign $(basename "$bin") with hardened runtime (required for notarization)"
        exit 1
    fi
    log_warning "Failed to sign $(basename "$bin") with hardened runtime, falling back to a plain signature (this build will not be notarizable)"
    codesign --force --sign "$SIGNING_IDENTITY" "$bin"
}

sign_binary "$PAYLOAD_DIR/usr/local/bin/novacomd"
sign_binary "$PAYLOAD_DIR/usr/local/bin/novacom"

log_success "Binaries and libraries signed"

# Verify signatures
log_info "Verifying signatures..."
for file in "$PAYLOAD_DIR/usr/local/bin/novacomd" \
            "$PAYLOAD_DIR/usr/local/bin/novacom" \
            "$PAYLOAD_DIR/usr/local/lib/libusb-0.1.4.dylib" \
            "$PAYLOAD_DIR/usr/local/lib/libusb-1.0.0.dylib"; do
    if codesign --verify --verbose "$file" 2>&1 | grep -q "valid on disk"; then
        log_success "$(basename "$file"): signature valid"
    else
        log_warning "$(basename "$file"): signature may be invalid (but should still work)"
    fi
done
echo ""

# Verify relinking
log_info "Verifying library links..."
echo ""
echo "novacomd dependencies:"
otool -L "$PAYLOAD_DIR/usr/local/bin/novacomd" | grep -v ":" | sed 's/^/  /'
echo ""
echo "libusb-0.1.4.dylib dependencies:"
otool -L "$PAYLOAD_DIR/usr/local/lib/libusb-0.1.4.dylib" | grep -v ":" | sed 's/^/  /'
echo ""

# Create postinstall script
log_info "Creating postinstall script..."
cat > "$SCRIPTS_DIR/postinstall" << 'POSTINSTALL_EOF'
#!/bin/bash
#
# Post-installation script for novacom/novacomd
# This script sets up the novacomd launchd service
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }

echo ""
echo "=========================================="
echo "  novacom/novacomd Post-Install Setup"
echo "=========================================="
echo ""

# Verify installed files
log_info "Verifying installed files..."
if [ ! -f "/usr/local/bin/novacomd" ]; then
    log_error "novacomd binary not found at /usr/local/bin/novacomd"
    exit 1
fi

if [ ! -f "/usr/local/lib/libusb-0.1.4.dylib" ]; then
    log_error "libusb library not found at /usr/local/lib/libusb-0.1.4.dylib"
    exit 1
fi

log_success "All files verified"

# Install launchd plist
PLIST_DEST="/Library/LaunchDaemons/com.palm.novacomd.plist"

log_info "Installing launchd service..."

# Stop and unload existing service if present
if launchctl list | grep -q "com.palm.novacomd" 2>/dev/null; then
    log_info "Stopping existing novacomd service..."
    launchctl stop com.palm.novacomd 2>/dev/null || true
    launchctl unload "$PLIST_DEST" 2>/dev/null || true
    sleep 1
fi

# Create the plist file
log_info "Creating launchd plist at: $PLIST_DEST"
cat > "$PLIST_DEST" << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.palm.novacomd</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/novacomd</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/var/log/novacomd.log</string>
    <key>StandardErrorPath</key>
    <string>/var/log/novacomd.log</string>
</dict>
</plist>
EOF

chmod 644 "$PLIST_DEST"
chown root:wheel "$PLIST_DEST"
log_success "Launchd plist created"

# Load and start the service
log_info "Loading and starting novacomd service..."
if launchctl load "$PLIST_DEST" 2>/dev/null; then
    log_success "Service loaded!"

    # Give it a moment to start
    sleep 2

    # Verify it's running
    if launchctl list | grep -q "com.palm.novacomd"; then
        log_success "novacomd service is running"
    else
        log_warning "Service loaded but may not be running"
        log_info "Check status with: sudo launchctl list | grep novacomd"
        log_info "Check logs at: /var/log/novacomd.log"
    fi
else
    log_warning "Failed to load service automatically"
    log_info "Load manually with: sudo launchctl load $PLIST_DEST"
fi

echo ""
log_success "Installation complete!"
echo ""
log_info "Installed files:"
echo "  - /usr/local/bin/novacomd (daemon)"
echo "  - /usr/local/bin/novacom (client)"
echo "  - /usr/local/bin/novaterm (terminal script)"
echo "  - /usr/local/lib/libusb-0.1.4.dylib (bundled)"
echo "  - /usr/local/lib/libusb-1.0.0.dylib (bundled)"
echo "  - $PLIST_DEST (launchd service)"
echo ""
log_info "Service management commands:"
echo "  Check status:  sudo launchctl list | grep novacomd"
echo "  Stop service:  sudo launchctl stop com.palm.novacomd"
echo "  Start service: sudo launchctl start com.palm.novacomd"
echo "  Unload:        sudo launchctl unload $PLIST_DEST"
echo "  View logs:     tail -f /var/log/novacomd.log"
echo ""
log_info "Usage examples:"
echo "  List devices:  novacom -l"
echo "  Open terminal: novaterm"
echo ""

exit 0
POSTINSTALL_EOF

chmod 755 "$SCRIPTS_DIR/postinstall"
log_success "Postinstall script created"

# Build the package
log_info "Building installer package..."

# Echo the version strings actually compiled into the payload. A wrong stamp is
# then visible in the build log rather than discovered after release, and any
# "..local..user@host.." here means the BUILDVERSION override above did not take
# and the package would publish the builder's identity.
log_info "Payload version strings:"
for b in "$PAYLOAD_DIR/usr/local/bin/novacomd" "$PAYLOAD_DIR/usr/local/bin/novacom"; do
    [ -f "$b" ] || continue
    stamp=$(strings "$b" 2>/dev/null | grep -oE '(novacomd?-[0-9][^ "]*|\.\.local\.\.[^ "]*)' | head -1)
    printf '    %-10s %s\n' "$(basename "$b")" "${stamp:-<none found>}"
    case "$stamp" in
        ..local..*) log_warning "$(basename "$b") carries a local build stamp with user@host" ;;
    esac
done

rm -f "$OUTPUT_PKG"

pkgbuild \
    --root "$PAYLOAD_DIR" \
    --scripts "$SCRIPTS_DIR" \
    --identifier "$PKG_IDENTIFIER" \
    --version "$PKG_VERSION" \
    --install-location "/" \
    "$OUTPUT_PKG"

if [ ! -f "$OUTPUT_PKG" ]; then
    log_error "Package build failed!"
    exit 1
fi

log_success "Package built successfully!"

# Sign, notarize, and staple the installer package
if [ "$NOTARIZE" = true ]; then
    log_info "Signing package with Developer ID Installer..."
    SIGNED_PKG="${OUTPUT_PKG%.pkg}-signed.pkg"
    rm -f "$SIGNED_PKG"
    productsign --sign "$INSTALLER_IDENTITY" "$OUTPUT_PKG" "$SIGNED_PKG"
    mv "$SIGNED_PKG" "$OUTPUT_PKG"
    log_success "Package signed"

    if [ -n "$KEYCHAIN_PROFILE" ]; then
        NOTARY_AUTH=(--keychain-profile "$KEYCHAIN_PROFILE")
        NOTARY_AUTH_DESC="--keychain-profile $KEYCHAIN_PROFILE"
    else
        NOTARY_AUTH=(--apple-id "$APPLE_ID" --team-id "$APPLE_TEAM_ID" --password "$APPLE_APP_SPECIFIC_PASSWORD")
        NOTARY_AUTH_DESC="--apple-id $APPLE_ID --team-id $APPLE_TEAM_ID --password <redacted>"
    fi

    log_info "Submitting package to Apple notary service (this can take several minutes)..."
    if xcrun notarytool submit "$OUTPUT_PKG" "${NOTARY_AUTH[@]}" --wait; then
        log_success "Notarization accepted"
    else
        log_error "Notarization failed"
        log_info "View the log with: xcrun notarytool log $NOTARY_AUTH_DESC <submission-id>"
        log_info "List recent submissions with: xcrun notarytool history $NOTARY_AUTH_DESC"
        exit 1
    fi

    # Even after notarytool reports the submission Accepted, the ticket can
    # take a short while to propagate to Apple's CloudKit-backed lookup
    # service, so an immediate staple attempt can fail with "Record not
    # found". Retry with a backoff rather than treating that as fatal.
    log_info "Stapling notarization ticket to package..."
    STAPLE_ATTEMPTS=5
    STAPLE_DELAY=15
    staple_ok=false
    for attempt in $(seq 1 "$STAPLE_ATTEMPTS"); do
        if xcrun stapler staple "$OUTPUT_PKG"; then
            staple_ok=true
            break
        fi
        if [ "$attempt" -lt "$STAPLE_ATTEMPTS" ]; then
            log_warning "Staple attempt $attempt/$STAPLE_ATTEMPTS failed (ticket may not have propagated yet), retrying in ${STAPLE_DELAY}s..."
            sleep "$STAPLE_DELAY"
        fi
    done

    if [ "$staple_ok" = true ]; then
        log_success "Package notarized and stapled"
    else
        log_warning "Notarization succeeded, but stapling failed after $STAPLE_ATTEMPTS attempts"
        log_info "The package is still notarized (Gatekeeper can check online); retry stapling later with:"
        log_info "  xcrun stapler staple $OUTPUT_PKG"
    fi
fi

# Show package info
echo ""
echo "=========================================="
log_success "Build Complete!"
echo "=========================================="
echo ""
log_info "Package: $OUTPUT_PKG"
log_info "Size: $(ls -lh "$OUTPUT_PKG" | awk '{print $5}')"
log_info "Architecture: $ARCH"
log_info "Version: $PKG_VERSION ($PKG_IDENTIFIER)"
echo ""
log_info "Package contents:"
pkgutil --payload-files "$OUTPUT_PKG" | sed 's/^/  /'
echo ""
log_info "To install:"
echo "  Double-click: $OUTPUT_PKG"
echo "  Or via CLI:   sudo installer -pkg $OUTPUT_PKG -target /"
echo ""
log_info "To verify package:"
echo "  pkgutil --check-signature $OUTPUT_PKG"
echo "  pkgutil --payload-files $OUTPUT_PKG"
if [ "$NOTARIZE" = true ]; then
    echo "  xcrun stapler validate $OUTPUT_PKG"
    echo "  spctl -a -vvv -t install $OUTPUT_PKG"
else
    echo ""
    log_info "Package was not notarized. Re-run with --notarize --keychain-profile <name> for a fully trusted, gatekeeper-clean installer."
fi
echo ""
log_success "Done!"
