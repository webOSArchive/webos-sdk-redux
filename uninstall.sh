#!/bin/bash
#
# Master uninstallation script for webOS SDK Redux
# Uninstalls the SDK, novacom, and novacomd
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
        log_info "This uninstaller supports macOS and Linux only"
        exit 1
        ;;
esac

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    log_error "Please run with sudo: sudo ./uninstall.sh"
    exit 1
fi

echo ""
echo "=========================================="
echo "  webOS SDK Redux - Master Uninstaller"
echo "=========================================="
echo ""
log_info "Platform: $PLATFORM_NAME"
echo ""

log_warning "This will uninstall all webOS SDK Redux components:"
echo "  - SDK (webOS development tools)"
echo "  - novacom (device communication client)"
echo "  - novacomd (device communication daemon)"
echo ""
read -p "Continue with uninstallation? [y/N]: " confirm
if [[ ! $confirm =~ ^[Yy]$ ]]; then
    log_info "Uninstallation cancelled"
    exit 0
fi

# Uninstall SDK
echo ""
log_step "1/3 - Uninstalling SDK..."
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
    log_warning "No SDK version directory found (looking for numeric directories like 0.2)"
    log_info "Skipping SDK uninstallation"
else
    log_info "Found SDK version: $SDK_VERSION_NUM"
    cd "$SDK_VERSION_DIR"
    if [ ! -f "uninstall-sdk-$PLATFORM.sh" ]; then
        log_warning "SDK uninstaller not found: $SDK_VERSION_NUM/uninstall-sdk-$PLATFORM.sh"
        log_info "Skipping SDK uninstallation"
    else
        if ./uninstall-sdk-$PLATFORM.sh; then
            log_success "SDK uninstalled"
        else
            log_warning "SDK uninstallation failed or was cancelled"
        fi
    fi
fi

# Uninstall novacom
echo ""
log_step "2/3 - Uninstalling novacom..."
echo ""
cd "$SCRIPT_DIR/novacom"
if [ ! -f "uninstall-$PLATFORM.sh" ]; then
    log_warning "novacom uninstaller not found: novacom/uninstall-$PLATFORM.sh"
    log_info "Skipping novacom uninstallation"
else
    if ./uninstall-$PLATFORM.sh; then
        log_success "novacom uninstalled"
    else
        log_warning "novacom uninstallation failed or was cancelled"
    fi
fi

# Uninstall novacomd
echo ""
log_step "3/3 - Uninstalling novacomd..."
echo ""
cd "$SCRIPT_DIR/novacomd"
if [ ! -f "uninstall-$PLATFORM.sh" ]; then
    log_warning "novacomd uninstaller not found: novacomd/uninstall-$PLATFORM.sh"
    log_info "Skipping novacomd uninstallation"
else
    # Stop novacomd if running
    if pgrep -x novacomd > /dev/null; then
        log_info "Stopping running novacomd..."
        killall novacomd 2>/dev/null || true
        sleep 2
    fi

    if [ "$PLATFORM" = "linux" ]; then
        # Stop systemd service if running
        if systemctl is-active --quiet novacomd.service 2>/dev/null; then
            log_info "Stopping novacomd systemd service..."
            systemctl stop novacomd.service
        fi
    fi

    if ./uninstall-$PLATFORM.sh; then
        log_success "novacomd uninstalled"
    else
        log_warning "novacomd uninstallation failed or was cancelled"
    fi
fi

# Uninstallation complete
echo ""
echo "=========================================="
log_success "Uninstallation Complete!"
echo "=========================================="
echo ""
log_info "All webOS SDK Redux components have been removed"
echo ""
log_info "To verify removal:"
echo "  - Check for palm commands: which palm-help"
echo "  - Check for novacom: which novacom"
echo "  - Check for novacomd: which novacomd"
echo ""

log_success "Done!"
