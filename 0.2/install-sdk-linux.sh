#!/bin/bash
#
# Installation script for webOS SDK on Linux
# Installs the SDK framework and creates symlinks to command-line tools
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
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SDK_SOURCE="$SCRIPT_DIR"

# Detect SDK version from directory name
# If SCRIPT_DIR is a symlink (Current), resolve it to get the real version
if [ -L "$(dirname "$0")" ]; then
    SDK_REAL_PATH="$(cd "$(dirname "$0")" && pwd -P)"
    SDK_VERSION=$(basename "$SDK_REAL_PATH")
else
    SDK_VERSION=$(basename "$SCRIPT_DIR")
fi

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    log_error "Please run with sudo: sudo ./install-sdk-linux.sh"
    exit 1
fi

# Verify SDK structure
if [ ! -d "$SDK_SOURCE/bin" ]; then
    log_error "SDK bin directory not found at $SDK_SOURCE/bin"
    exit 1
fi

if [ ! -d "$SDK_SOURCE/share" ]; then
    log_error "SDK share directory not found at $SDK_SOURCE/share"
    exit 1
fi

# Count palm-* commands
PALM_COMMANDS=$(ls -1 "$SDK_SOURCE/bin"/palm-* 2>/dev/null | wc -l | tr -d ' ')

# Check Java requirement
log_info "Checking Java requirement..."
if ! command -v java >/dev/null 2>&1; then
    echo ""
    log_error "Java not found - SDK tools require Java 8 or greater"
    echo ""
    log_info "Please install Java before continuing:"
    echo "  - Ubuntu/Debian: sudo apt-get install default-jdk"
    echo "  - Fedora/RHEL:   sudo dnf install java-latest-openjdk"
    echo "  - Arch:          sudo pacman -S jdk-openjdk"
    echo ""
    exit 1
fi

# Parse Java version
JAVA_VERSION_OUTPUT=$(java -version 2>&1 | head -n 1)
log_info "Found: $JAVA_VERSION_OUTPUT"

# Extract major version number (handles both old "1.8" and new "11", "17" format)
JAVA_VERSION=$(java -version 2>&1 | head -n 1 | sed -E 's/.*version "([0-9]+)\.?([0-9]*).*/\1/')
if [ "$JAVA_VERSION" = "1" ]; then
    # Old versioning scheme (1.6, 1.7, 1.8, etc.)
    JAVA_VERSION=$(java -version 2>&1 | head -n 1 | sed -E 's/.*version "1\.([0-9]+).*/\1/')
fi

if [ -z "$JAVA_VERSION" ] || [ "$JAVA_VERSION" -lt 8 ]; then
    echo ""
    log_error "Java version 8 or greater is required (found version $JAVA_VERSION)"
    echo ""
    log_info "Please upgrade Java before continuing:"
    echo "  - Ubuntu/Debian: sudo apt-get install default-jdk"
    echo "  - Fedora/RHEL:   sudo dnf install java-latest-openjdk"
    echo "  - Arch:          sudo pacman -S jdk-openjdk"
    echo ""
    exit 1
fi

log_success "Java version $JAVA_VERSION detected (meets requirement of Java 8+)"

echo ""
echo "=========================================="
echo "  webOS SDK Installation for Linux"
echo "=========================================="
echo ""
log_info "SDK Version: $SDK_VERSION"
log_info "SDK Source: $SDK_SOURCE"
log_info "Palm Commands: $PALM_COMMANDS"
echo ""

# Installation options
echo "Choose SDK installation location:"
echo ""
echo "  1) /opt/PalmSDK (Recommended - Coexists with legacy SDK)"
echo "  2) /usr/local/PalmSDK (Standard for user software)"
echo "  3) Custom location"
echo ""
read -p "Enter choice [1-3]: " sdk_choice

case $sdk_choice in
    1)
        SDK_INSTALL_DIR="/opt/PalmSDK"
        ;;
    2)
        SDK_INSTALL_DIR="/usr/local/PalmSDK"
        ;;
    3)
        read -p "Enter custom SDK installation directory: " SDK_INSTALL_DIR
        ;;
    *)
        log_error "Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "Choose location for palm-* command symlinks (must be in PATH):"
echo ""
echo "  1) /usr/local/bin (Recommended - Usually in PATH)"
echo "  2) Same as SDK location (${SDK_INSTALL_DIR}/bin symlinked to PATH manually)"
echo "  3) Custom location"
echo ""
read -p "Enter choice [1-3]: " bin_choice

case $bin_choice in
    1)
        BIN_INSTALL_DIR="/usr/local/bin"
        CREATE_SYMLINKS=true
        ;;
    2)
        BIN_INSTALL_DIR="${SDK_INSTALL_DIR}/bin"
        CREATE_SYMLINKS=false
        ;;
    3)
        read -p "Enter custom bin directory: " BIN_INSTALL_DIR
        CREATE_SYMLINKS=true
        ;;
    *)
        log_error "Invalid choice"
        exit 1
        ;;
esac

echo ""
log_info "SDK will be installed to: $SDK_INSTALL_DIR"
if [ "$CREATE_SYMLINKS" = true ]; then
    log_info "Command symlinks will be created in: $BIN_INSTALL_DIR"
else
    log_info "Commands will be available in: $BIN_INSTALL_DIR"
    log_warning "You will need to add $BIN_INSTALL_DIR to your PATH manually"
fi
echo ""
read -p "Continue with installation? [Y/n]: " confirm
if [[ $confirm =~ ^[Nn]$ ]]; then
    log_info "Installation cancelled"
    exit 0
fi

# Create SDK directory if needed
if [ ! -d "$SDK_INSTALL_DIR" ]; then
    log_info "Creating SDK directory: $SDK_INSTALL_DIR"
    if ! mkdir -p "$SDK_INSTALL_DIR"; then
        log_error "Failed to create directory: $SDK_INSTALL_DIR"
        exit 1
    fi
    log_success "Directory created"
fi

# Backup existing installation if present
if [ -d "$SDK_INSTALL_DIR/$SDK_VERSION" ]; then
    BACKUP="$SDK_INSTALL_DIR/$SDK_VERSION.backup.$(date +%Y%m%d-%H%M%S)"
    log_info "Backing up existing SDK to: $BACKUP"
    if ! mv "$SDK_INSTALL_DIR/$SDK_VERSION" "$BACKUP"; then
        log_error "Failed to backup existing SDK"
        exit 1
    fi
    log_success "Backup created"
fi

# Install SDK
echo ""
log_info "Installing SDK files..."
log_info "This may take a moment..."

if ! cp -R "$SDK_SOURCE" "$SDK_INSTALL_DIR/$SDK_VERSION"; then
    log_error "Failed to copy SDK files"
    exit 1
fi
log_success "SDK files installed to $SDK_INSTALL_DIR/$SDK_VERSION"

# Create/update Current symlink
log_info "Creating Current symlink..."
if [ -L "$SDK_INSTALL_DIR/Current" ] || [ -e "$SDK_INSTALL_DIR/Current" ]; then
    rm -f "$SDK_INSTALL_DIR/Current"
fi
ln -sf "$SDK_INSTALL_DIR/$SDK_VERSION" "$SDK_INSTALL_DIR/Current"
log_success "Symlink created: $SDK_INSTALL_DIR/Current -> $SDK_INSTALL_DIR/$SDK_VERSION"

# Create bin directory for symlinks if needed
if [ "$CREATE_SYMLINKS" = true ]; then
    if [ ! -d "$BIN_INSTALL_DIR" ]; then
        log_info "Creating bin directory: $BIN_INSTALL_DIR"
        mkdir -p "$BIN_INSTALL_DIR"
        log_success "Directory created"
    fi

    # Create symlinks for all palm-* commands
    echo ""
    log_info "Creating command symlinks..."
    SYMLINK_COUNT=0
    for cmd in "$SDK_INSTALL_DIR/$SDK_VERSION/bin"/palm-*; do
        if [ -f "$cmd" ]; then
            CMD_NAME=$(basename "$cmd")

            # Backup existing file if present
            if [ -f "$BIN_INSTALL_DIR/$CMD_NAME" ] && [ ! -L "$BIN_INSTALL_DIR/$CMD_NAME" ]; then
                BACKUP="$BIN_INSTALL_DIR/$CMD_NAME.backup.$(date +%Y%m%d-%H%M%S)"
                log_warning "Backing up existing $CMD_NAME to: $BACKUP"
                cp "$BIN_INSTALL_DIR/$CMD_NAME" "$BACKUP"
            fi

            # Remove existing symlink/file
            if [ -L "$BIN_INSTALL_DIR/$CMD_NAME" ] || [ -f "$BIN_INSTALL_DIR/$CMD_NAME" ]; then
                rm -f "$BIN_INSTALL_DIR/$CMD_NAME"
            fi

            # Create symlink
            ln -sf "$SDK_INSTALL_DIR/$SDK_VERSION/bin/$CMD_NAME" "$BIN_INSTALL_DIR/$CMD_NAME"
            SYMLINK_COUNT=$((SYMLINK_COUNT + 1))
        fi
    done
    log_success "Created $SYMLINK_COUNT command symlinks in $BIN_INSTALL_DIR"
fi

# Set ownership
log_info "Setting ownership..."
chown -R root:root "$SDK_INSTALL_DIR/$SDK_VERSION"
log_success "Ownership set"

# Verify installation
echo ""
log_info "Verifying installation..."

# Check bin directory
if [ -d "$SDK_INSTALL_DIR/$SDK_VERSION/bin" ]; then
    log_success "SDK bin directory exists"
else
    log_error "SDK bin directory not found"
    exit 1
fi

# Check share directory
if [ -d "$SDK_INSTALL_DIR/$SDK_VERSION/share" ]; then
    log_success "SDK share directory exists"
else
    log_error "SDK share directory not found"
    exit 1
fi

# Check Current symlink
if [ -L "$SDK_INSTALL_DIR/Current" ]; then
    LINK_TARGET=$(readlink "$SDK_INSTALL_DIR/Current")
    log_success "Current symlink points to: $LINK_TARGET"
else
    log_error "Current symlink not created"
    exit 1
fi

# Verify a command is accessible
if [ "$CREATE_SYMLINKS" = true ]; then
    if [ -x "$BIN_INSTALL_DIR/palm-help" ]; then
        log_success "palm-help command is accessible"
    else
        log_error "palm-help command is not accessible"
    fi
fi

# PATH check
echo ""
log_info "Checking PATH configuration..."
if [ "$CREATE_SYMLINKS" = true ]; then
    if echo "$PATH" | grep -q "$BIN_INSTALL_DIR"; then
        log_success "$BIN_INSTALL_DIR is in your PATH"
    else
        log_warning "$BIN_INSTALL_DIR is NOT in your PATH"

        log_info "To add it to your PATH, add this to ~/.bashrc or ~/.profile:"
        echo ""
        echo "  export PATH=\"\$PATH:$BIN_INSTALL_DIR\""
        echo ""
    fi
else
    log_warning "Commands are in: $SDK_INSTALL_DIR/$SDK_VERSION/bin"
    log_info "To add SDK commands to your PATH, add this to ~/.bashrc or ~/.profile:"
    echo ""
    echo "  export PATH=\"\$PATH:$SDK_INSTALL_DIR/$SDK_VERSION/bin\""
    echo ""
fi

# Installation complete
echo ""
echo "=========================================="
log_success "Installation complete!"
echo "=========================================="
echo ""
log_info "SDK installed to: $SDK_INSTALL_DIR/$SDK_VERSION"
log_info "Current symlink: $SDK_INSTALL_DIR/Current"
if [ "$CREATE_SYMLINKS" = true ]; then
    log_info "Commands available in: $BIN_INSTALL_DIR"
else
    log_info "Commands available in: $SDK_INSTALL_DIR/$SDK_VERSION/bin"
fi
echo ""
log_info "Available commands:"
echo "  - palm-generate   Generate new app projects"
echo "  - palm-package    Package applications into .ipk files"
echo "  - palm-install    Install/remove apps on device"
echo "  - palm-launch     Launch installed applications"
echo "  - palm-log        View application logs"
echo "  - palm-run        Run applications"
echo "  - palm-help       Display help information"
echo ""
log_info "Usage examples:"
echo ""
echo "  Generate a new app:"
echo "    palm-generate -p \"{id:'com.mycompany.app', version:'1.0.0', vendor:'My Company', title:'My App'}\" MyApp"
echo ""
echo "  Package an app:"
echo "    palm-package MyApp/"
echo ""
echo "  Install on device:"
echo "    palm-install com.mycompany.app_1.0.0_all.ipk"
echo ""
echo "  Get help:"
echo "    palm-help"
echo ""
log_info "SDK Documentation: $SDK_INSTALL_DIR/Current/share/documentation/"
log_info "Sample Code: $SDK_INSTALL_DIR/Current/share/samplecode/"
log_info "Frameworks: $SDK_INSTALL_DIR/Current/share/framework/"
echo ""

log_success "Done!"
