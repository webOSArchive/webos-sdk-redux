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

# Configuration
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
NOVACOMD_BIN="$SCRIPT_DIR/novacomd/build-novacomd/novacomd"
NOVACOM_BIN="$SCRIPT_DIR/novacom/build-novacom/novacom"
NOVATERM_SCRIPT="$SCRIPT_DIR/novacom/scripts/novaterm"

LIBUSB_COMPAT_LIB="$BREW_PREFIX/opt/libusb-compat/lib/libusb-0.1.4.dylib"
LIBUSB_LIB="$BREW_PREFIX/opt/libusb/lib/libusb-1.0.0.dylib"

PKG_DIR="$SCRIPT_DIR/installer-package"
PAYLOAD_DIR="$PKG_DIR/payload"
SCRIPTS_DIR="$PKG_DIR/scripts"

OUTPUT_PKG="$SCRIPT_DIR/novacom-installer-${ARCH}.pkg"

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

# Detect Developer ID Application certificate (for signing binaries/dylibs)
SIGNING_IDENTITY=""
if security find-identity -v -p codesigning 2>/dev/null | grep -q "Developer ID Application"; then
    SIGNING_IDENTITY=$(security find-identity -v -p codesigning | grep "Developer ID Application" | head -1 | awk -F'"' '{print $2}')
    log_info "Found Developer ID Application: $SIGNING_IDENTITY"
else
    log_warning "No Developer ID Application certificate found"
    log_info "Using ad-hoc signing (will work but cannot be notarized)"
    SIGNING_IDENTITY="-"
fi

# Detect Developer ID Installer certificate (for signing the .pkg)
PKG_SIGNING_IDENTITY=""
if security find-identity -v -p basic 2>/dev/null | grep -q "Developer ID Installer"; then
    PKG_SIGNING_IDENTITY=$(security find-identity -v -p basic | grep "Developer ID Installer" | head -1 | awk -F'"' '{print $2}')
    log_info "Found Developer ID Installer: $PKG_SIGNING_IDENTITY"
else
    log_warning "No Developer ID Installer certificate found - package signing and notarization will be skipped"
fi

# Sign libraries first (dependencies must be signed before binaries that use them)
# Dylibs do not need --options runtime
codesign --force --sign "$SIGNING_IDENTITY" "$PAYLOAD_DIR/usr/local/lib/libusb-1.0.0.dylib"
codesign --force --sign "$SIGNING_IDENTITY" "$PAYLOAD_DIR/usr/local/lib/libusb-0.1.4.dylib"

# Sign executables with hardened runtime (--options runtime is required for notarization)
codesign --force --sign "$SIGNING_IDENTITY" --options runtime "$PAYLOAD_DIR/usr/local/bin/novacomd"
codesign --force --sign "$SIGNING_IDENTITY" --options runtime "$PAYLOAD_DIR/usr/local/bin/novacom"

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
rm -f "$OUTPUT_PKG"

pkgbuild \
    --root "$PAYLOAD_DIR" \
    --scripts "$SCRIPTS_DIR" \
    --identifier "com.palm.novacom" \
    --version "1.0.0" \
    --install-location "/" \
    "$OUTPUT_PKG"

if [ ! -f "$OUTPUT_PKG" ]; then
    log_error "Package build failed!"
    exit 1
fi

log_success "Package built successfully!"

# Sign the installer package with Developer ID Installer
# This is a separate certificate from Developer ID Application and is required for notarization
if [ -n "$PKG_SIGNING_IDENTITY" ]; then
    log_info "Signing installer package with Developer ID Installer..."
    SIGNED_PKG="${OUTPUT_PKG%.pkg}-signed.pkg"
    if productsign --sign "$PKG_SIGNING_IDENTITY" "$OUTPUT_PKG" "$SIGNED_PKG"; then
        mv "$SIGNED_PKG" "$OUTPUT_PKG"
        log_success "Package signed: $PKG_SIGNING_IDENTITY"
    else
        log_error "Package signing failed"
        rm -f "$SIGNED_PKG"
        exit 1
    fi
else
    log_warning "Skipping package signing (no Developer ID Installer certificate)"
fi

# Notarize the package
# Credentials can be supplied two ways:
#   1. Keychain profile (recommended): set NOTARYTOOL_PROFILE to the profile name
#      Set up once with: xcrun notarytool store-credentials "notarytool" \
#        --apple-id YOUR_APPLE_ID --team-id YOUR_TEAM_ID --password YOUR_APP_SPECIFIC_PASSWORD
#   2. Environment variables in set-apple-vars.sh (gitignored): APPLE_ID, APPLE_TEAM_ID, APPLE_APP_PASSWORD
if [ -f "$SCRIPT_DIR/set-apple-vars.sh" ]; then
    log_info "Loading Apple credentials from set-apple-vars.sh..."
    # shellcheck source=/dev/null
    source "$SCRIPT_DIR/set-apple-vars.sh"
fi

NOTARIZE=false
NOTARYTOOL_ARGS=()

if [ -n "${NOTARYTOOL_PROFILE:-}" ]; then
    NOTARIZE=true
    NOTARYTOOL_ARGS=(--keychain-profile "$NOTARYTOOL_PROFILE")
    log_info "Notarization: using keychain profile '$NOTARYTOOL_PROFILE'"
elif [ -n "${APPLE_ID:-}" ] && [ -n "${APPLE_TEAM_ID:-}" ] && [ -n "${APPLE_APP_SPECIFIC_PASSWORD:-}" ]; then
    NOTARIZE=true
    NOTARYTOOL_ARGS=(--apple-id "$APPLE_ID" --team-id "$APPLE_TEAM_ID" --password "$APPLE_APP_SPECIFIC_PASSWORD")
    log_info "Notarization: using Apple ID credentials"
fi

if [ "$NOTARIZE" = true ] && [ -z "$PKG_SIGNING_IDENTITY" ]; then
    log_warning "Skipping notarization: package must be signed with Developer ID Installer first"
    NOTARIZE=false
fi

if [ "$NOTARIZE" = true ]; then
    log_info "Submitting package for notarization (this may take a few minutes)..."
    if xcrun notarytool submit "$OUTPUT_PKG" "${NOTARYTOOL_ARGS[@]}" --wait; then
        log_success "Notarization approved"
        log_info "Stapling notarization ticket to package..."
        if xcrun stapler staple "$OUTPUT_PKG"; then
            log_success "Notarization ticket stapled - package is ready for distribution"
        else
            log_warning "Stapling failed - package is notarized but the ticket is not embedded"
            log_info "Users will need an internet connection on first install to verify notarization"
        fi
    else
        log_error "Notarization failed - check output above for details"
        exit 1
    fi
else
    if [ -n "$PKG_SIGNING_IDENTITY" ]; then
        log_info "Notarization skipped - provide credentials via set-apple-vars.sh or env vars:"
        echo "  NOTARYTOOL_PROFILE=<profile> ./build-driver-installer-mac.sh"
        echo "  APPLE_ID=... APPLE_TEAM_ID=... APPLE_APP_SPECIFIC_PASSWORD=... ./build-driver-installer-mac.sh"
        echo ""
        log_info "Or create set-apple-vars.sh (gitignored) exporting those variables"
        echo ""
        log_info "To store credentials in keychain (recommended):"
        echo "  xcrun notarytool store-credentials \"notarytool\" \\"
        echo "    --apple-id YOUR_APPLE_ID \\"
        echo "    --team-id YOUR_TEAM_ID \\"
        echo "    --password YOUR_APP_SPECIFIC_PASSWORD"
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
echo ""
log_success "Done!"
