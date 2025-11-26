#!/bin/bash
#
# Installation script for novacom on Linux
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
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
NOVACOM_BIN="$SCRIPT_DIR/build-novacom/novacom"
NOVATERM_SCRIPT="$SCRIPT_DIR/scripts/novaterm"
ARCH=$(uname -m)

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    log_error "Please run with sudo: sudo ./install-linux.sh"
    exit 1
fi

# Check if binary exists
if [ ! -f "$NOVACOM_BIN" ]; then
    log_error "Binary not found at $NOVACOM_BIN"
    log_info "Run './build.sh' or 'make' first to build the binary"
    exit 1
fi

# Check if novaterm script exists
if [ ! -f "$NOVATERM_SCRIPT" ]; then
    log_error "Script not found at $NOVATERM_SCRIPT"
    exit 1
fi

echo ""
echo "=========================================="
echo "  novacom Installation for Linux"
echo "=========================================="
echo ""
log_info "Binary: $NOVACOM_BIN"
log_info "Script: $NOVATERM_SCRIPT"
log_info "Architecture: $ARCH"
echo ""

# Auto-detect novacomd installation location
log_info "Detecting novacomd installation..."
NOVACOMD_PATH=""
INSTALL_DIR=""
CREATE_SYMLINK=false

# Check common installation paths in order of preference
for path in "/usr/local/bin" "/opt/nova/bin" "/usr/bin"; do
    if [ -f "$path/novacomd" ]; then
        NOVACOMD_PATH="$path/novacomd"
        INSTALL_DIR="$path"
        log_success "Found novacomd at: $NOVACOMD_PATH"

        # Check if there's also a symlink elsewhere (hybrid setup)
        if [ "$path" = "/opt/nova/bin" ] && [ -L "/usr/local/bin/novacomd" ]; then
            CREATE_SYMLINK=true
            SYMLINK_DIR="/usr/local/bin"
            log_info "Detected hybrid installation (novacomd in /opt/nova/bin with symlink in /usr/local/bin)"
        fi
        break
    fi
done

if [ -z "$NOVACOMD_PATH" ]; then
    log_warning "novacomd not found in standard locations"
    log_warning "novacom requires novacomd to function"
    echo ""
    log_info "Please install novacomd first from the parent novacomd directory"
    log_info "Or specify a custom installation directory for novacom"
    echo ""

    # Fall back to asking user
    echo "Choose installation location:"
    echo ""
    echo "  1) /usr/local/bin (Recommended)"
    echo "  2) /opt/nova/bin"
    echo "  3) /usr/bin"
    echo "  4) Custom location"
    echo ""
    read -p "Enter choice [1-4]: " choice

    case $choice in
        1)
            INSTALL_DIR="/usr/local/bin"
            ;;
        2)
            INSTALL_DIR="/opt/nova/bin"
            ;;
        3)
            INSTALL_DIR="/usr/bin"
            log_warning "Installing to /usr/bin may conflict with package managers"
            ;;
        4)
            read -p "Enter custom installation directory: " INSTALL_DIR
            ;;
        *)
            log_error "Invalid choice"
            exit 1
            ;;
    esac
else
    log_success "Will install novacom to the same location as novacomd"
fi

echo ""
log_info "Installing to: $INSTALL_DIR"
if [ "$CREATE_SYMLINK" = true ]; then
    log_info "Creating symlinks in: $SYMLINK_DIR (matching novacomd setup)"
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
    if ! mkdir -p "$INSTALL_DIR"; then
        log_error "Failed to create directory: $INSTALL_DIR"
        exit 1
    fi
    log_success "Directory created"
fi

# Verify directory exists and is writable
if [ ! -d "$INSTALL_DIR" ]; then
    log_error "Installation directory does not exist: $INSTALL_DIR"
    exit 1
fi

if [ ! -w "$INSTALL_DIR" ]; then
    log_error "Installation directory is not writable: $INSTALL_DIR"
    exit 1
fi

# Backup existing files if present
if [ -f "$INSTALL_DIR/novacom" ]; then
    BACKUP="$INSTALL_DIR/novacom.backup.$(date +%Y%m%d-%H%M%S)"
    log_info "Backing up existing novacom to: $BACKUP"
    cp "$INSTALL_DIR/novacom" "$BACKUP"
    log_success "Backup created"
fi

if [ -f "$INSTALL_DIR/novaterm" ]; then
    BACKUP="$INSTALL_DIR/novaterm.backup.$(date +%Y%m%d-%H%M%S)"
    log_info "Backing up existing novaterm to: $BACKUP"
    cp "$INSTALL_DIR/novaterm" "$BACKUP"
    log_success "Backup created"
fi

# Install novacom binary
log_info "Installing novacom binary..."

# Debug: verify source file
if [ ! -f "$NOVACOM_BIN" ]; then
    log_error "Source binary not found: $NOVACOM_BIN"
    log_info "Current directory: $(pwd)"
    log_info "Looking for: $NOVACOM_BIN"
    ls -la "$(dirname "$NOVACOM_BIN")" 2>/dev/null || log_error "Directory $(dirname "$NOVACOM_BIN") does not exist"
    exit 1
fi

# Debug: show what we're copying
log_info "Copying from: $NOVACOM_BIN"
log_info "Copying to: $INSTALL_DIR/novacom"

# Use install command for more robust copying
if ! install -m 755 "$NOVACOM_BIN" "$INSTALL_DIR/novacom"; then
    log_error "Failed to install novacom to $INSTALL_DIR/novacom"
    log_error "Source: $NOVACOM_BIN ($(ls -lh "$NOVACOM_BIN" 2>&1))"
    log_error "Dest dir: $INSTALL_DIR ($(ls -ld "$INSTALL_DIR" 2>&1))"
    exit 1
fi
chown root:root "$INSTALL_DIR/novacom"
log_success "Binary installed to $INSTALL_DIR/novacom"

# Install novaterm script
log_info "Installing novaterm script..."
if ! install -m 755 "$NOVATERM_SCRIPT" "$INSTALL_DIR/novaterm"; then
    log_error "Failed to install novaterm to $INSTALL_DIR/novaterm"
    exit 1
fi
chown root:root "$INSTALL_DIR/novaterm"
log_success "Script installed to $INSTALL_DIR/novaterm"

# Create symlinks if requested
if [ "$CREATE_SYMLINK" = true ]; then
    if [ ! -d "$SYMLINK_DIR" ]; then
        mkdir -p "$SYMLINK_DIR"
    fi

    # Symlink for novacom
    if [ -L "$SYMLINK_DIR/novacom" ] || [ -f "$SYMLINK_DIR/novacom" ]; then
        log_info "Removing existing symlink/file at $SYMLINK_DIR/novacom"
        rm -f "$SYMLINK_DIR/novacom"
    fi
    ln -sf "$INSTALL_DIR/novacom" "$SYMLINK_DIR/novacom"
    log_success "Symlink created: $SYMLINK_DIR/novacom"

    # Symlink for novaterm
    if [ -L "$SYMLINK_DIR/novaterm" ] || [ -f "$SYMLINK_DIR/novaterm" ]; then
        log_info "Removing existing symlink/file at $SYMLINK_DIR/novaterm"
        rm -f "$SYMLINK_DIR/novaterm"
    fi
    ln -sf "$INSTALL_DIR/novaterm" "$SYMLINK_DIR/novaterm"
    log_success "Symlink created: $SYMLINK_DIR/novaterm"
fi

# Verify installation
echo ""
log_info "Verifying installation..."

# Check novacom
if [ -x "$INSTALL_DIR/novacom" ]; then
    log_success "novacom binary is executable"
    VERSION=$("$INSTALL_DIR/novacom" -V 2>&1 || echo "version check complete")
    if [ -n "$VERSION" ]; then
        log_info "Version: $VERSION"
    fi
else
    log_error "novacom binary is not executable"
    exit 1
fi

# Check novaterm
if [ -x "$INSTALL_DIR/novaterm" ]; then
    log_success "novaterm script is executable"
else
    log_error "novaterm script is not executable"
    exit 1
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

# Check for novacomd
echo ""
log_info "Checking for novacomd daemon..."
if command -v novacomd >/dev/null 2>&1; then
    log_success "novacomd is available in PATH"
    NOVACOMD_PATH=$(which novacomd)
    log_info "Location: $NOVACOMD_PATH"

    # Check if novacomd is running
    if pgrep -x novacomd >/dev/null 2>&1; then
        log_success "novacomd is currently running"
    else
        log_warning "novacomd is installed but not running"
        log_info "Start it with: sudo novacomd"
    fi
else
    log_warning "novacomd not found in PATH"
    log_info "novacom requires novacomd to be running to communicate with devices"
    log_info "Install novacomd from the parent novacomd directory"
fi

# Installation complete
echo ""
echo "=========================================="
log_success "Installation complete!"
echo "=========================================="
echo ""
log_info "Installed files:"
echo "  - $INSTALL_DIR/novacom"
echo "  - $INSTALL_DIR/novaterm"
if [ "$CREATE_SYMLINK" = true ]; then
    echo ""
    log_info "Symlinks created in: $SYMLINK_DIR"
fi
echo ""
log_info "Usage examples:"
echo ""
echo "  List connected devices:"
echo "    novacom -l"
echo ""
echo "  Open terminal on device:"
echo "    novaterm"
echo ""
echo "  Run command on device:"
echo "    novacom -t run file:///bin/ls"
echo ""
log_info "Note: Make sure novacomd is running before using novacom"
echo ""

log_success "Done!"
