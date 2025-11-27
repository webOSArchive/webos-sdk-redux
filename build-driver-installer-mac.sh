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

# Update libusb-compat install name and dependency
install_name_tool -id /usr/local/lib/libusb-0.1.4.dylib \
    "$PAYLOAD_DIR/usr/local/lib/libusb-0.1.4.dylib"
install_name_tool -change "$BREW_PREFIX/opt/libusb/lib/libusb-1.0.0.dylib" \
    /usr/local/lib/libusb-1.0.0.dylib \
    "$PAYLOAD_DIR/usr/local/lib/libusb-0.1.4.dylib"

# Update novacomd to use bundled libusb
install_name_tool -change "$BREW_PREFIX/opt/libusb-compat/lib/libusb-0.1.4.dylib" \
    /usr/local/lib/libusb-0.1.4.dylib \
    "$PAYLOAD_DIR/usr/local/bin/novacomd"

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

# Sign binaries
codesign --force --sign "$SIGNING_IDENTITY" --options runtime --entitlements /dev/null "$PAYLOAD_DIR/usr/local/bin/novacomd" 2>/dev/null || {
    log_warning "Failed to sign with runtime option, trying without"
    codesign --force --sign "$SIGNING_IDENTITY" "$PAYLOAD_DIR/usr/local/bin/novacomd"
}

codesign --force --sign "$SIGNING_IDENTITY" "$PAYLOAD_DIR/usr/local/bin/novacom" 2>/dev/null || {
    log_warning "Failed to sign novacom"
    codesign --force --sign "$SIGNING_IDENTITY" "$PAYLOAD_DIR/usr/local/bin/novacom"
}

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
