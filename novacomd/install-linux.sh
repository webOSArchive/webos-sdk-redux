#!/bin/bash
#
# Installation script for novacomd on Linux
# Supports systemd service integration
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_step() { echo -e "${CYAN}[STEP]${NC} $1"; }

# Configuration
NOVACOMD_BIN="./build-novacomd/novacomd"
ARCH=$(uname -m)

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    log_error "Please run with sudo: sudo ./install-linux.sh"
    exit 1
fi

# Check if binary exists first
PREBUILT_MODE=false
if [ -f "$NOVACOMD_BIN" ]; then
    PREBUILT_MODE=true
    log_success "Pre-built binary detected at $NOVACOMD_BIN"
    log_info "Skipping build prerequisite checks (will still verify runtime dependencies)"
    echo ""
    log_info "To clean build output and rebuild from source:"
    echo "  ./build.sh clean"
    echo ""
else
    log_error "Binary not found at $NOVACOMD_BIN"
    log_info "Run './build.sh' first to build the binary"
    exit 1
fi

# Check for runtime dependencies (required for both built and pre-built binaries)
log_info "Checking for runtime dependencies..."
MISSING_RUNTIME_DEPS=()
RUNTIME_INSTALL_CMD=""

# Detect package manager and check for runtime libusb
if command -v dpkg > /dev/null 2>&1; then
    # Debian/Ubuntu-based (apt)
    PKG_MANAGER="apt"

    # Check for libusb runtime library (not -dev)
    if ! dpkg -l | grep -q "^ii.*libusb-0.1-4\|^ii.*libusb-1.0-0"; then
        MISSING_RUNTIME_DEPS+=("libusb-1.0-0")
    fi

    RUNTIME_INSTALL_CMD="sudo apt update && sudo apt install"

elif command -v rpm > /dev/null 2>&1; then
    # RedHat/Fedora-based (dnf/yum)
    PKG_MANAGER="rpm"

    # Check for libusb runtime library
    if ! rpm -qa | grep -q "^libusb-"; then
        MISSING_RUNTIME_DEPS+=("libusb")
    fi

    if command -v dnf > /dev/null 2>&1; then
        RUNTIME_INSTALL_CMD="sudo dnf install"
    else
        RUNTIME_INSTALL_CMD="sudo yum install"
    fi

elif command -v pacman > /dev/null 2>&1; then
    # Arch-based
    PKG_MANAGER="pacman"

    # Check for libusb
    if ! pacman -Q libusb > /dev/null 2>&1 && ! pacman -Q libusb-compat > /dev/null 2>&1; then
        MISSING_RUNTIME_DEPS+=("libusb")
    fi

    RUNTIME_INSTALL_CMD="sudo pacman -S"
else
    log_warning "Unable to detect package manager. Skipping runtime dependency check."
    log_info "Please ensure libusb runtime library is installed."
fi

# If runtime dependencies are missing, show error and exit
if [ ${#MISSING_RUNTIME_DEPS[@]} -gt 0 ]; then
    echo ""
    log_error "Missing required runtime dependencies!"
    echo ""
    log_info "The following packages are required but not installed:"
    for dep in "${MISSING_RUNTIME_DEPS[@]}"; do
        echo "  - $dep"
    done
    echo ""
    log_info "To install the missing dependencies, run:"
    echo ""
    echo "  $RUNTIME_INSTALL_CMD ${MISSING_RUNTIME_DEPS[@]}"
    echo ""
    log_error "Installation cancelled. Please install the runtime dependencies and try again."
    exit 1
fi

log_success "All required runtime dependencies are installed"
echo ""

# Only check BUILD dependencies if we're not in prebuilt mode
if [ "$PREBUILT_MODE" = false ]; then
    log_info "Checking for build dependencies..."
    MISSING_BUILD_DEPS=()

    # Detect package manager and check for build dependencies
    if [ "$PKG_MANAGER" = "apt" ]; then
        # Check for libusb development headers
        if ! dpkg -l | grep -q "^ii.*libusb-dev"; then
            MISSING_BUILD_DEPS+=("libusb-dev")
        fi

        # Check for build-essential
        if ! dpkg -l | grep -q "^ii.*build-essential"; then
            MISSING_BUILD_DEPS+=("build-essential")
        fi

        BUILD_INSTALL_CMD="sudo apt update && sudo apt install"

    elif [ "$PKG_MANAGER" = "rpm" ]; then
        # Check for libusb development headers
        if ! rpm -qa | grep -q "libusb-devel"; then
            MISSING_BUILD_DEPS+=("libusb-devel")
        fi

        # Check for development tools
        if ! rpm -qa | grep -q "gcc\|make"; then
            MISSING_BUILD_DEPS+=("gcc" "make")
        fi

        if command -v dnf > /dev/null 2>&1; then
            BUILD_INSTALL_CMD="sudo dnf install"
        else
            BUILD_INSTALL_CMD="sudo yum install"
        fi

    elif [ "$PKG_MANAGER" = "pacman" ]; then
        # Check for base-devel
        if ! pacman -Q base-devel > /dev/null 2>&1; then
            MISSING_BUILD_DEPS+=("base-devel")
        fi

        BUILD_INSTALL_CMD="sudo pacman -S"
    fi

    # If build dependencies are missing, show error and exit
    if [ ${#MISSING_BUILD_DEPS[@]} -gt 0 ]; then
        echo ""
        log_error "Missing required build dependencies!"
        echo ""
        log_info "The following packages are required but not installed:"
        for dep in "${MISSING_BUILD_DEPS[@]}"; do
            echo "  - $dep"
        done
        echo ""
        log_info "To install the missing dependencies, run:"
        echo ""
        echo "  $BUILD_INSTALL_CMD ${MISSING_BUILD_DEPS[@]}"
        echo ""
        log_error "Installation cancelled. Please install the build dependencies and try again."
        exit 1
    fi

    log_success "All required build dependencies are installed"
    echo ""
fi

echo ""
echo "=========================================="
echo "  novacomd Installation for Linux"
echo "=========================================="
echo ""
log_info "Binary: $NOVACOMD_BIN"
log_info "Architecture: $ARCH"
echo ""

# Installation options
echo "Choose installation location:"
echo ""
echo "  1) /usr/local/bin (Recommended - Standard for user-installed binaries)"
echo "  2) /opt/nova/bin (Legacy Palm SDK location)"
echo "  3) /usr/bin (System binaries location)"
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
        INSTALL_DIR="/opt/nova/bin"
        CREATE_SYMLINK=false
        ;;
    3)
        INSTALL_DIR="/usr/bin"
        CREATE_SYMLINK=false
        log_warning "Installing to /usr/bin may conflict with package managers"
        read -p "Continue anyway? [y/N]: " confirm
        if [[ ! $confirm =~ ^[Yy]$ ]]; then
            exit 1
        fi
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

# Stop systemd service if running
if systemctl is-active --quiet novacomd.service 2>/dev/null; then
    log_warning "Stopping novacomd systemd service..."
    systemctl stop novacomd.service
    log_success "Service stopped"
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
chown root:root "$INSTALL_DIR/novacomd"
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
if ldd "$INSTALL_DIR/novacomd" 2>/dev/null | grep -q libusb; then
    log_success "libusb dependency found"

    # Show libusb location
    LIBUSB_PATH=$(ldd "$INSTALL_DIR/novacomd" 2>/dev/null | grep libusb | awk '{print $3}')
    if [ -n "$LIBUSB_PATH" ]; then
        log_info "libusb location: $LIBUSB_PATH"
    fi
else
    log_error "libusb dependency not found"
    log_warning "You may need to install libusb-dev or libusb-compat"
fi

# PATH check
echo ""
log_info "Checking PATH configuration..."
if echo "$PATH" | grep -q "$INSTALL_DIR"; then
    log_success "$INSTALL_DIR is in your PATH"
else
    log_warning "$INSTALL_DIR is NOT in your PATH"

    log_info "To add it to your PATH, add this to ~/.bashrc or ~/.profile:"
    echo ""
    echo "  export PATH=\"\$PATH:$INSTALL_DIR\""
    echo ""
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
log_info "To start novacomd manually:"
echo "  sudo $INSTALL_DIR/novacomd"
echo ""
log_info "To start as daemon:"
echo "  sudo $INSTALL_DIR/novacomd -d"
echo ""

# Offer to create systemd service
echo ""
read -p "Would you like to create a systemd service for automatic startup? [Y/n]: " create_service
if [[ ! $create_service =~ ^[Nn]$ ]]; then
    SERVICE_FILE="/etc/systemd/system/novacomd.service"

    log_step "Creating systemd service unit..."
    log_info "Service file: $SERVICE_FILE"

    cat > "$SERVICE_FILE" << EOF
[Unit]
Description=Palm/HP webOS novacom daemon
Documentation=https://github.com/webos-internals/novacomd
After=network.target

[Service]
Type=simple
ExecStart=$INSTALL_DIR/novacomd
Restart=on-failure
RestartSec=5s
StandardOutput=journal
StandardError=journal

# Security hardening
NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
EOF

    chmod 644 "$SERVICE_FILE"
    log_success "Systemd service unit created"

    # Reload systemd
    log_info "Reloading systemd daemon..."
    systemctl daemon-reload
    log_success "Systemd reloaded"

    echo ""
    log_info "Systemd service commands:"
    echo ""
    echo "  Start service now:"
    echo "    sudo systemctl start novacomd.service"
    echo ""
    echo "  Enable service at boot:"
    echo "    sudo systemctl enable novacomd.service"
    echo ""
    echo "  Start and enable service:"
    echo "    sudo systemctl enable --now novacomd.service"
    echo ""
    echo "  Check service status:"
    echo "    sudo systemctl status novacomd.service"
    echo ""
    echo "  View service logs:"
    echo "    sudo journalctl -u novacomd.service -f"
    echo ""
    echo "  Stop service:"
    echo "    sudo systemctl stop novacomd.service"
    echo ""
    echo "  Disable service:"
    echo "    sudo systemctl disable novacomd.service"
    echo ""

    # Automatically enable and start the service
    log_info "Enabling and starting novacomd service..."
    if systemctl enable --now novacomd.service 2>/dev/null; then
        sleep 2

        # Check if service is running
        if systemctl is-active --quiet novacomd.service; then
            log_success "Service is running!"
            echo ""
            log_info "Service status:"
            systemctl status novacomd.service --no-pager | head -10
        else
            log_warning "Service enabled but may not be running"
            log_info "Check logs with: sudo journalctl -u novacomd.service -n 50"
        fi
    else
        log_warning "Failed to enable service automatically"
        log_info "Enable manually with: sudo systemctl enable --now novacomd.service"
    fi
fi

echo ""
log_success "Done!"
