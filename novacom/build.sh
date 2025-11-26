#!/bin/bash
#
# Automated build script for novacom
# Detects environment and builds the binary
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

print_header() {
    echo ""
    echo -e "${BLUE}==========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}==========================================${NC}"
    echo ""
}

# Detect operating system
detect_os() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
        OS_NAME="macOS"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        OS="linux"
        OS_NAME="Linux"

        # Detect Linux distribution
        if [ -f /etc/os-release ]; then
            . /etc/os-release
            LINUX_DISTRO=$ID
            LINUX_VERSION=$VERSION_ID
        elif [ -f /etc/redhat-release ]; then
            LINUX_DISTRO="rhel"
        elif [ -f /etc/debian_version ]; then
            LINUX_DISTRO="debian"
        else
            LINUX_DISTRO="unknown"
        fi
    else
        OS="unknown"
        OS_NAME="Unknown"
    fi
}

# Detect architecture
detect_arch() {
    ARCH=$(uname -m)
    case $ARCH in
        x86_64)
            ARCH_NAME="Intel 64-bit (x86_64)"
            ;;
        arm64|aarch64)
            ARCH_NAME="ARM 64-bit (arm64)"
            ;;
        armv7l|armv6l)
            ARCH_NAME="ARM 32-bit"
            ;;
        *)
            ARCH_NAME="$ARCH"
            ;;
    esac
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check for required build tools
check_build_tools() {
    log_step "Checking for build tools..."

    local missing_tools=()

    # Check for make
    if ! command_exists make; then
        missing_tools+=("make")
    fi

    # Check for compiler
    if ! command_exists gcc && ! command_exists clang; then
        missing_tools+=("gcc or clang")
    fi

    if [ ${#missing_tools[@]} -eq 0 ]; then
        log_success "All required build tools found"

        # Show versions
        if command_exists make; then
            MAKE_VERSION=$(make --version 2>&1 | head -1)
            log_info "Make: $MAKE_VERSION"
        fi

        if command_exists clang; then
            CLANG_VERSION=$(clang --version 2>&1 | head -1)
            log_info "Compiler: $CLANG_VERSION"
        elif command_exists gcc; then
            GCC_VERSION=$(gcc --version 2>&1 | head -1)
            log_info "Compiler: $GCC_VERSION"
        fi

        return 0
    else
        log_error "Missing build tools: ${missing_tools[*]}"
        return 1
    fi
}

# Clean previous builds
clean_build() {
    log_step "Cleaning previous builds..."
    if [ -d "build-novacom" ]; then
        make clean
        log_success "Cleaned build artifacts"
    else
        log_info "No previous builds to clean"
    fi
}

# Build the project
build_project() {
    log_step "Building novacom..."
    log_info "(Some warnings are normal and safe to ignore if the build succeeds)"

    # Determine build options
    BUILD_OPTS=""

    if [ "$BUILD_UNIVERSAL" = "1" ]; then
        log_info "Building universal binary (Intel + Apple Silicon)"
        BUILD_OPTS="UNIVERSAL=1"
    elif [ -n "$BUILD_ARCH" ]; then
        log_info "Building for architecture: $BUILD_ARCH"
        BUILD_OPTS="BUILD_ARCH=$BUILD_ARCH"
    else
        log_info "Building for native architecture: $ARCH"
    fi

    # Run make
    if make $BUILD_OPTS; then
        log_success "Build completed successfully"
        return 0
    else
        log_error "Build failed"
        return 1
    fi
}

# Display build information
show_build_info() {
    if [ -f "build-novacom/novacom" ]; then
        print_header "Build Information"

        log_info "Binary location: build-novacom/novacom"

        # Show file info
        if command_exists file; then
            FILE_INFO=$(file build-novacom/novacom)
            log_info "File type: $FILE_INFO"
        fi

        # Show size
        if [[ "$OS" == "macos" ]]; then
            SIZE=$(ls -lh build-novacom/novacom | awk '{print $5}')
        else
            SIZE=$(ls -lh build-novacom/novacom | awk '{print $5}')
        fi
        log_info "Binary size: $SIZE"

        echo ""
        log_success "novacom is ready to use!"
        echo ""
        log_info "To test: ./build-novacom/novacom -V"
        log_info "To install: sudo make install"
    fi
}

# Offer to run installation
offer_install() {
    echo ""
    echo ""

    # Determine which install script to use
    if [[ "$OS" == "macos" ]]; then
        INSTALL_SCRIPT="./install-macos.sh"
    elif [[ "$OS" == "linux" ]]; then
        INSTALL_SCRIPT="./install-linux.sh"
    else
        # Unknown OS, skip install offer
        return 0
    fi

    # Check if install script exists
    if [ ! -f "$INSTALL_SCRIPT" ]; then
        log_warning "Install script not found: $INSTALL_SCRIPT"
        return 0
    fi

    # Check if script is executable
    if [ ! -x "$INSTALL_SCRIPT" ]; then
        chmod +x "$INSTALL_SCRIPT" 2>/dev/null || true
    fi

    log_info "Installation script available: $INSTALL_SCRIPT"
    echo ""
    read -p "Would you like to install novacom now? [y/N]: " install_now

    if [[ $install_now =~ ^[Yy]$ ]]; then
        echo ""
        log_info "Running installation script..."
        log_warning "You may be prompted for your password (sudo required)"
        echo ""

        # Run the install script
        sudo "$INSTALL_SCRIPT"

        INSTALL_EXIT=$?
        echo ""

        if [ $INSTALL_EXIT -eq 0 ]; then
            log_success "Installation completed!"
        else
            log_warning "Installation exited with code: $INSTALL_EXIT"
        fi
    else
        log_info "Skipping installation"
        log_info "You can install later with: sudo $INSTALL_SCRIPT"
    fi
}

# Parse command line arguments
parse_args() {
    CLEAN_ONLY=0
    BUILD_UNIVERSAL=0
    BUILD_ARCH=""

    while [[ $# -gt 0 ]]; do
        case $1 in
            --clean)
                CLEAN_ONLY=1
                shift
                ;;
            --universal)
                BUILD_UNIVERSAL=1
                shift
                ;;
            --arch)
                BUILD_ARCH="$2"
                shift 2
                ;;
            --help|-h)
                echo "Usage: $0 [OPTIONS]"
                echo ""
                echo "Options:"
                echo "  --clean        Clean build artifacts and exit"
                echo "  --universal    Build universal binary (macOS only, Intel + Apple Silicon)"
                echo "  --arch ARCH    Build for specific architecture (x86_64 or arm64)"
                echo "  --help, -h     Show this help message"
                echo ""
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                echo "Use --help for usage information"
                exit 1
                ;;
        esac
    done
}

# Main execution
main() {
    print_header "novacom Build Script"

    # Parse arguments
    parse_args "$@"

    # Detect system
    detect_os
    detect_arch

    log_info "Operating System: $OS_NAME"
    log_info "Architecture: $ARCH_NAME"
    echo ""

    # Check build tools
    if ! check_build_tools; then
        echo ""
        log_error "Please install required build tools and try again"

        if [[ "$OS" == "macos" ]]; then
            echo ""
            log_info "On macOS, install Command Line Tools:"
            echo "  xcode-select --install"
        elif [[ "$OS" == "linux" ]]; then
            echo ""
            log_info "On Debian/Ubuntu:"
            echo "  sudo apt install build-essential"
            log_info "On RHEL/CentOS/Fedora:"
            echo "  sudo yum groupinstall 'Development Tools'"
        fi

        exit 1
    fi

    echo ""

    # Clean if requested
    if [ "$CLEAN_ONLY" = "1" ]; then
        clean_build
        exit 0
    fi

    # Clean previous builds
    clean_build
    echo ""

    # Build
    if build_project; then
        echo ""
        show_build_info

        # Offer to install
        offer_install

        exit 0
    else
        echo ""
        log_error "Build process failed"
        exit 1
    fi
}

# Run main function with all arguments
main "$@"
