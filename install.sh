#!/bin/bash
#
# Master installation script for webOS SDK Redux
# Builds and installs novacomd, novacom, and the SDK
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_step() { echo -e "${CYAN}${BOLD}[STEP]${NC} $1"; }

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Detect OS
OS="$(uname -s)"
case "$OS" in
    Darwin)
        PLATFORM="macos"
        PLATFORM_NAME="macOS"
        ;;
    Linux)
        PLATFORM="linux"
        PLATFORM_NAME="Linux"
        ;;
    *)
        log_error "Unsupported operating system: $OS"
        log_info "This installer supports macOS and Linux only"
        exit 1
        ;;
esac

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    log_error "Please run with sudo: sudo ./install.sh"
    exit 1
fi

# Determine which user to run brew/package managers as (if running via sudo)
if [ -n "$SUDO_USER" ]; then
    PKG_USER="$SUDO_USER"
    if [ "$PLATFORM" = "macos" ]; then
        BREW_CMD="sudo -u $SUDO_USER brew"
    fi
else
    PKG_USER="$USER"
    if [ "$PLATFORM" = "macos" ]; then
        BREW_CMD="brew"
    fi
fi

echo ""
echo "=========================================="
echo "  webOS SDK Redux - Master Installer"
echo "=========================================="
echo ""
log_info "Platform: $PLATFORM_NAME"
log_info "Installation directory: $SCRIPT_DIR"
echo ""

# Check Java requirement
log_step "1/4 - Checking prerequisites..."
echo ""
log_info "Checking Java requirement..."
if ! command -v java >/dev/null 2>&1; then
    echo ""
    log_error "Java not found - SDK tools require Java 8 or greater"
    echo ""
    log_info "Please install Java before continuing:"
    if [ "$PLATFORM" = "macos" ]; then
        echo "  - Download from: https://www.oracle.com/java/technologies/downloads/"
        echo "  - Or install via Homebrew: brew install openjdk"
    else
        echo "  - Ubuntu/Debian: sudo apt-get install default-jdk"
        echo "  - Fedora/RHEL:   sudo dnf install java-latest-openjdk"
        echo "  - Arch:          sudo pacman -S jdk-openjdk"
    fi
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
    log_info "Please upgrade Java before continuing"
    exit 1
fi

log_success "Java version $JAVA_VERSION detected (meets requirement of Java 8+)"

# Check for existing SDK installations
echo ""
log_info "Checking for existing SDK installations..."
FOUND_OLD_SDK=false
OLD_SDK_COMMANDS=()

if command -v palm-log >/dev/null 2>&1; then
    PALM_LOG_PATH=$(which palm-log)
    OLD_SDK_COMMANDS+=("palm-log at $PALM_LOG_PATH")
    FOUND_OLD_SDK=true
fi

if command -v novacom >/dev/null 2>&1; then
    NOVACOM_PATH=$(which novacom)
    OLD_SDK_COMMANDS+=("novacom at $NOVACOM_PATH")
    FOUND_OLD_SDK=true
fi

if [ "$FOUND_OLD_SDK" = true ]; then
    echo ""
    log_warning "Found existing webOS SDK installation(s):"
    for cmd in "${OLD_SDK_COMMANDS[@]}"; do
        echo "  - $cmd"
    done
    echo ""
    log_warning "Installing webOS SDK Redux alongside the legacy SDK may cause conflicts"
    echo ""
    log_info "Recommended actions:"
    echo "  1. Manually remove the old SDK installation first"
    echo "  2. Common legacy SDK locations:"
    if [ "$PLATFORM" = "macos" ]; then
        echo "     - /opt/Palm/SDK"
        echo "     - /opt/PalmSDK (if previously installed this version)"
        echo "     - Check PATH in ~/.bash_profile or ~/.zshrc"
        echo "     - Disable and remove com.palm.novacomd.plist from launchctl"
    else
        echo "     - /opt/Palm/SDK"
        echo "     - /opt/PalmSDK (if previously installed this version)"
        echo "     - Check PATH in ~/.bashrc or ~/.profile"
        echo "     - Disable and remove palm-novacomd from systemctl"
    fi
    echo "  3. Remove palm-* and novacom* commands from /usr/local/bin or similar"
    echo ""
    read -p "Continue anyway? [y/N]: " continue_anyway
    if [[ ! $continue_anyway =~ ^[Yy]$ ]]; then
        log_info "Installation cancelled"
        log_info "Remove the old SDK and run this installer again"
        exit 0
    fi
    log_warning "Proceeding with installation (conflicts may occur)"
else
    log_success "No conflicting SDK installations detected"
fi

# Check for required tools
echo ""
log_info "Checking for required build tools..."
if [ "$PLATFORM" = "macos" ]; then
    if ! command -v make >/dev/null 2>&1; then
        log_error "make not found - required for building"
        log_info "Install Xcode Command Line Tools: xcode-select --install"
        exit 1
    fi
    log_success "make is available"

    # Check for libusb-compat (non-fatal warning)
    # Use $BREW_CMD to run as the original user when running via sudo
    if ! $BREW_CMD list --versions libusb-compat >/dev/null 2>&1; then
        log_error "libusb-compat not found - required for building"
        log_info "Install libusb-compat via Homebrew (install Homebrew if needed first!)"
        exit 1
    else
        log_success "libusb-compat is installed ($($BREW_CMD list --versions libusb-compat))"
    fi
else
    if ! command -v make >/dev/null 2>&1; then
        log_error "make not found - required for building"
        exit 1
    fi
    log_success "Build tools available"

    # Check for libusb development headers
    if ! dpkg -l | grep -q "^ii.*libusb-dev"; then
        log_error "libusb-dev not found - required for building"
        exit 1
    fi
fi

# Build novacomd
echo ""
log_step "2/4 - Building components..."
echo ""
log_info "Building novacomd..."
log_step "(Some warnings are normal and safe to ignore if the build succeeds)"
cd "$SCRIPT_DIR/novacomd"
if ! make host; then
    log_error "Failed to build novacomd"
    exit 1
fi
log_success "novacomd built successfully"

# Build novacom
echo ""
log_info "Building novacom..."
log_step "(Some warnings are normal and safe to ignore if the build succeeds)"
cd "$SCRIPT_DIR/novacom"
if ! make; then
    log_error "Failed to build novacom"
    exit 1
fi
log_success "novacom built successfully"

# Install novacomd
echo ""
log_step "3/4 - Installing novacomd..."
echo ""
cd "$SCRIPT_DIR/novacomd"
if [ ! -f "install-$PLATFORM.sh" ]; then
    log_error "Installer not found: novacomd/install-$PLATFORM.sh"
    exit 1
fi

if ! ./install-$PLATFORM.sh; then
    log_error "Failed to install novacomd"
    exit 1
fi
log_success "novacomd installed"

# Install novacom
echo ""
log_step "Installing novacom..."
echo ""
cd "$SCRIPT_DIR/novacom"
if [ ! -f "install-$PLATFORM.sh" ]; then
    log_error "Installer not found: novacom/install-$PLATFORM.sh"
    exit 1
fi

if ! ./install-$PLATFORM.sh; then
    log_error "Failed to install novacom"
    exit 1
fi
log_success "novacom installed"

# Install SDK
echo ""
log_step "4/4 - Installing SDK..."
echo ""

# Find the highest numeric version folder (e.g., 0.2, 0.3, etc.)
SDK_VERSION_DIR=""
SDK_VERSION_NUM=""
for dir in "$SCRIPT_DIR"/[0-9]*; do
    if [ -d "$dir" ]; then
        VERSION=$(basename "$dir")
        # Use version comparison (works for major.minor format)
        if [ -z "$SDK_VERSION_NUM" ] || [ "$VERSION" \> "$SDK_VERSION_NUM" ]; then
            SDK_VERSION_NUM="$VERSION"
            SDK_VERSION_DIR="$dir"
        fi
    fi
done

if [ -z "$SDK_VERSION_DIR" ]; then
    log_error "No SDK version directory found (looking for numeric directories like 0.2)"
    exit 1
fi

log_info "Found SDK version: $SDK_VERSION_NUM at $SDK_VERSION_DIR"

cd "$SDK_VERSION_DIR"
if [ ! -f "install-sdk-$PLATFORM.sh" ]; then
    log_error "Installer not found: $SDK_VERSION_NUM/install-sdk-$PLATFORM.sh"
    exit 1
fi

if ! ./install-sdk-$PLATFORM.sh; then
    log_error "Failed to install SDK"
    exit 1
fi
log_success "SDK installed"

# Installation complete
echo ""
echo "=========================================="
log_success "Installation Complete!"
echo "=========================================="
echo ""
log_info "All components have been installed:"
echo "  ✓ novacomd - Device communication daemon"
echo "  ✓ novacom  - Device communication client"
echo "  ✓ SDK      - webOS development tools"
echo ""
log_info "Next steps:"
echo ""
echo "  1. Start novacomd (if not already running):"
if [ "$PLATFORM" = "macos" ]; then
    echo "     sudo novacomd -d"
else
    echo "     sudo systemctl start novacomd  (if using systemd)"
    echo "     or: sudo novacomd -d"
fi
echo ""
echo "  2. Connect your webOS device via USB"
echo ""
echo "  3. Verify connection:"
echo "     novacom -l"
echo ""
echo "  4. Start developing:"
echo "     palm-help"
echo ""

log_success "Done!"
