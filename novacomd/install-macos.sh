#!/bin/bash
#
# Installation script for modernized novacomd
# Supports multiple installation strategies for modern macOS
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

# Configuration
NOVACOMD_BIN="./build-novacomd/novacomd"
ARCH=$(uname -m)

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    log_error "Please run with sudo: sudo ./install-macos.sh"
    exit 1
fi

# Check for required dependencies
log_info "Checking for required dependencies..."
MISSING_DEPS=()
HOMEBREW_MISSING=false

# Check if Homebrew is installed
if ! command -v brew > /dev/null 2>&1; then
    HOMEBREW_MISSING=true
    log_error "Homebrew is not installed!"
    echo ""
    log_info "Homebrew is required to install libusb-compat dependency."
    log_info "To install Homebrew, visit: https://brew.sh"
    echo ""
    log_info "Or run this command:"
    echo ""
    echo '  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"'
    echo ""
    log_error "Installation cancelled. Please install Homebrew and try again."
    exit 1
else
    log_success "Homebrew is installed"

    # Check for libusb-compat
    if ! brew list libusb-compat > /dev/null 2>&1; then
        MISSING_DEPS+=("libusb-compat")
    fi
fi

# If dependencies are missing, show error and exit
if [ ${#MISSING_DEPS[@]} -gt 0 ]; then
    echo ""
    log_error "Missing required dependencies!"
    echo ""
    log_info "The following packages are required but not installed:"
    for dep in "${MISSING_DEPS[@]}"; do
        echo "  - $dep"
    done
    echo ""
    log_info "To install the missing dependencies, run:"
    echo ""
    echo "  brew install ${MISSING_DEPS[@]}"
    echo ""
    log_error "Installation cancelled. Please install the dependencies and try again."
    exit 1
fi

log_success "All required dependencies are installed"
echo ""

# Check if binary exists
if [ ! -f "$NOVACOMD_BIN" ]; then
    log_error "Binary not found at $NOVACOMD_BIN"
    log_info "Run './build.sh' or 'make host' first to build the binary"
    exit 1
fi

echo ""
echo "=========================================="
echo "  novacomd Installation for Modern macOS"
echo "=========================================="
echo ""
log_info "Binary: $NOVACOMD_BIN"
log_info "Architecture: $ARCH"
echo ""

# Installation options
echo "Choose installation location:"
echo ""
echo "  1) /usr/local/bin (Recommended - Standard for user binaries)"
echo "  2) /opt/homebrew/bin (Apple Silicon Homebrew standard)"
echo "  3) /opt/nova/bin (Legacy Palm SDK location)"
echo "  4) Hybrid (Both /opt/nova/bin + symlink to /usr/local/bin)"
echo "  5) Custom location"
echo ""
read -p "Enter choice [1-5]: " choice

case $choice in
    1)
        INSTALL_DIR="/usr/local/bin"
        CREATE_SYMLINK=false
        ;;
    2)
        INSTALL_DIR="/opt/homebrew/bin"
        CREATE_SYMLINK=false
        if [ ! -d "/opt/homebrew" ]; then
            log_warning "/opt/homebrew does not exist - is Homebrew installed?"
            read -p "Continue anyway? [y/N]: " confirm
            if [[ ! $confirm =~ ^[Yy]$ ]]; then
                exit 1
            fi
        fi
        ;;
    3)
        INSTALL_DIR="/opt/nova/bin"
        CREATE_SYMLINK=false
        ;;
    4)
        INSTALL_DIR="/opt/nova/bin"
        CREATE_SYMLINK=true
        SYMLINK_DIR="/usr/local/bin"
        ;;
    5)
        read -p "Enter custom installation directory: " INSTALL_DIR
        CREATE_SYMLINK=false
        ;;
    *)
        log_error "Invalid choice"
        exit 1
        ;;
esac

echo ""
log_info "Installing to: $INSTALL_DIR"
if [ "$CREATE_SYMLINK" = true ]; then
    log_info "Creating symlink: $SYMLINK_DIR/novacomd -> $INSTALL_DIR/novacomd"
fi
echo ""
read -p "Continue with installation? [Y/n]: " confirm
if [[ $confirm =~ ^[Nn]$ ]]; then
    log_info "Installation cancelled"
    exit 0
fi

# Create directory if needed
if [ ! -d "$INSTALL_DIR" ]; then
    log_info "Creating directory: $INSTALL_DIR"
    mkdir -p "$INSTALL_DIR"
    log_success "Directory created"
fi

# Stop any running novacomd
if pgrep -x novacomd > /dev/null; then
    log_warning "Stopping running novacomd..."
    killall novacomd 2>/dev/null || true
    sleep 2
    log_success "Stopped"
fi

# Backup existing binary if present
if [ -f "$INSTALL_DIR/novacomd" ]; then
    BACKUP="$INSTALL_DIR/novacomd.backup.$(date +%Y%m%d-%H%M%S)"
    log_info "Backing up existing binary to: $BACKUP"
    cp "$INSTALL_DIR/novacomd" "$BACKUP"
    log_success "Backup created"
fi

# Install binary
log_info "Installing novacomd..."
cp "$NOVACOMD_BIN" "$INSTALL_DIR/novacomd"
chmod 755 "$INSTALL_DIR/novacomd"
chown root:wheel "$INSTALL_DIR/novacomd"
log_success "Binary installed to $INSTALL_DIR/novacomd"

# Create symlink if requested
if [ "$CREATE_SYMLINK" = true ]; then
    if [ ! -d "$SYMLINK_DIR" ]; then
        mkdir -p "$SYMLINK_DIR"
    fi

    if [ -L "$SYMLINK_DIR/novacomd" ] || [ -f "$SYMLINK_DIR/novacomd" ]; then
        log_info "Removing existing symlink/file at $SYMLINK_DIR/novacomd"
        rm -f "$SYMLINK_DIR/novacomd"
    fi

    ln -sf "$INSTALL_DIR/novacomd" "$SYMLINK_DIR/novacomd"
    log_success "Symlink created: $SYMLINK_DIR/novacomd"
fi

# Verify installation
echo ""
log_info "Verifying installation..."
if [ -x "$INSTALL_DIR/novacomd" ]; then
    log_success "Binary is executable"
    VERSION=$("$INSTALL_DIR/novacomd" -V 2>&1 | grep "novacomd version" || echo "unknown")
    log_info "Version: $VERSION"
else
    log_error "Binary is not executable"
    exit 1
fi

# Check dependencies
log_info "Checking dependencies..."
if otool -L "$INSTALL_DIR/novacomd" | grep -q libusb; then
    log_success "libusb dependency found"
else
    log_error "libusb dependency not found"
fi

# PATH check
echo ""
log_info "Checking PATH configuration..."
if echo "$PATH" | grep -q "$INSTALL_DIR"; then
    log_success "$INSTALL_DIR is in your PATH"
else
    log_warning "$INSTALL_DIR is NOT in your PATH"

    SHELL_RC=""
    if [ -n "$ZSH_VERSION" ]; then
        SHELL_RC="$HOME/.zshrc"
    elif [ -n "$BASH_VERSION" ]; then
        SHELL_RC="$HOME/.bash_profile"
    fi

    if [ -n "$SHELL_RC" ]; then
        log_info "To add it to your PATH, run:"
        echo ""
        echo "  echo 'export PATH=\"\$PATH:$INSTALL_DIR\"' >> $SHELL_RC"
        echo "  source $SHELL_RC"
        echo ""
    fi
fi

# Installation complete
echo ""
echo "=========================================="
log_success "Installation complete!"
echo "=========================================="
echo ""
log_info "Installed to: $INSTALL_DIR/novacomd"
if [ "$CREATE_SYMLINK" = true ]; then
    log_info "Symlink at: $SYMLINK_DIR/novacomd"
fi
echo ""
log_info "To start novacomd:"
echo "  sudo $INSTALL_DIR/novacomd"
echo ""
log_info "To start as daemon:"
echo "  sudo $INSTALL_DIR/novacomd -d"
echo ""
log_info "To test the installation:"
echo "  sudo ./test-novacomd.sh"
echo ""

# Offer to create launchd service
echo ""
read -p "Would you like to create a launchd service for automatic startup? [Y/n]: " create_service
if [[ ! $create_service =~ ^[Nn]$ ]]; then
    PLIST="/Library/LaunchDaemons/com.palm.novacomd.plist"

    log_info "Creating launchd plist at: $PLIST"

    cat > "$PLIST" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.palm.novacomd</string>
    <key>ProgramArguments</key>
    <array>
        <string>$INSTALL_DIR/novacomd</string>
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

    chmod 644 "$PLIST"
    chown root:wheel "$PLIST"

    log_success "Launchd plist created"

    # Load and start the service
    log_info "Loading and starting the service..."
    if launchctl load "$PLIST" 2>/dev/null; then
        log_success "Service loaded and started!"

        # Give it a moment to start
        sleep 2

        # Verify it's running
        if launchctl list | grep -q "com.palm.novacomd"; then
            log_success "novacomd service is running"
        else
            log_warning "Service loaded but may not be running"
            log_info "Check status with: sudo launchctl list | grep novacomd"
        fi
    else
        log_warning "Failed to load service automatically"
        log_info "Load manually with: sudo launchctl load $PLIST"
    fi

    echo ""
    log_info "Service management commands:"
    echo "  Check status:  sudo launchctl list | grep novacomd"
    echo "  Stop service:  sudo launchctl stop com.palm.novacomd"
    echo "  Unload:        sudo launchctl unload $PLIST"
fi

echo ""
log_success "Done!"
