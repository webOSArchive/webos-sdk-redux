#!/bin/bash
#
# Automated build script for novacomd
# Detects environment, installs dependencies, and builds the binary
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

# Install dependencies on macOS
install_deps_macos() {
    log_step "Installing macOS dependencies..."

    # Check for Homebrew
    if ! command_exists brew; then
        log_warning "Homebrew not found"
        echo ""
        echo "Homebrew is required to install dependencies."
        echo "Install from: https://brew.sh"
        echo ""
        echo "Quick install command:"
        echo '  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"'
        echo ""
        read -p "Would you like to install Homebrew now? [y/N]: " install_brew

        if [[ $install_brew =~ ^[Yy]$ ]]; then
            log_info "Installing Homebrew..."
            /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

            # Add Homebrew to PATH for current session
            if [ -f "/opt/homebrew/bin/brew" ]; then
                eval "$(/opt/homebrew/bin/brew shellenv)"
            elif [ -f "/usr/local/bin/brew" ]; then
                eval "$(/usr/local/bin/brew shellenv)"
            fi
        else
            log_error "Cannot proceed without Homebrew"
            return 1
        fi
    fi

    log_success "Homebrew found: $(brew --version | head -1)"

    # Check for Xcode Command Line Tools
    if ! xcode-select -p &>/dev/null; then
        log_warning "Xcode Command Line Tools not found"
        log_info "Installing Xcode Command Line Tools..."
        xcode-select --install

        echo ""
        log_warning "Please complete the Xcode Command Line Tools installation"
        log_warning "Then run this script again"
        exit 1
    fi

    log_success "Xcode Command Line Tools installed"

    # Check for libusb-compat
    if brew list libusb-compat &>/dev/null; then
        log_success "libusb-compat already installed"
        LIBUSB_VERSION=$(brew list --versions libusb-compat)
        log_info "Version: $LIBUSB_VERSION"
    else
        log_info "Installing libusb-compat..."
        brew install libusb-compat
        log_success "libusb-compat installed"
    fi

    # Get Homebrew prefix
    HOMEBREW_PREFIX=$(brew --prefix)
    log_info "Homebrew prefix: $HOMEBREW_PREFIX"

    return 0
}

# Install dependencies on Linux
install_deps_linux() {
    log_step "Installing Linux dependencies..."

    case $LINUX_DISTRO in
        ubuntu|debian|pop)
            log_info "Detected Debian/Ubuntu-based system"

            # Check if we can use sudo
            if [ "$EUID" -ne 0 ]; then
                log_info "Installing with sudo..."
                SUDO="sudo"
            else
                SUDO=""
            fi

            # Update package list
            log_info "Updating package list..."
            $SUDO apt-get update -qq

            # Install dependencies
            log_info "Installing build-essential and libusb-dev..."
            $SUDO apt-get install -y build-essential libusb-dev

            log_success "Dependencies installed"
            ;;

        fedora|rhel|centos)
            log_info "Detected RHEL/Fedora-based system"

            if [ "$EUID" -ne 0 ]; then
                SUDO="sudo"
            else
                SUDO=""
            fi

            log_info "Installing gcc, make, and libusb-devel..."
            $SUDO dnf install -y gcc make libusb-devel

            log_success "Dependencies installed"
            ;;

        arch|manjaro)
            log_info "Detected Arch-based system"

            if [ "$EUID" -ne 0 ]; then
                SUDO="sudo"
            else
                SUDO=""
            fi

            log_info "Installing base-devel and libusb-compat..."
            $SUDO pacman -S --noconfirm base-devel libusb-compat

            log_success "Dependencies installed"
            ;;

        *)
            log_warning "Unknown Linux distribution: $LINUX_DISTRO"
            log_info "Please manually install:"
            echo "  - gcc or clang"
            echo "  - make"
            echo "  - libusb-dev or libusb-compat"
            echo ""
            read -p "Press Enter when dependencies are installed, or Ctrl+C to cancel..."
            ;;
    esac

    return 0
}

# Build novacomd
build_novacomd() {
    log_step "Building novacomd..."

    # Clean previous build
    if [ -d "build-novacomd" ]; then
        log_info "Cleaning previous build..."
        make clean >/dev/null 2>&1 || true
    fi

    # Build
    log_info "Running make host..."
    echo ""

    if make host; then
        echo ""
        log_success "Build completed successfully"
        return 0
    else
        echo ""
        log_error "Build failed"
        return 1
    fi
}

# Verify build
verify_build() {
    log_step "Verifying build..."

    local binary="./build-novacomd/novacomd"

    if [ ! -f "$binary" ]; then
        log_error "Binary not found at $binary"
        return 1
    fi
    log_success "Binary exists"

    if [ ! -x "$binary" ]; then
        log_error "Binary is not executable"
        return 1
    fi
    log_success "Binary is executable"

    # Check architecture
    if [ "$OS" = "macos" ]; then
        local binary_arch=$(file "$binary" | grep -o "x86_64\|arm64")
        log_info "Binary architecture: $binary_arch"

        if [ "$binary_arch" != "$ARCH" ] && [ "$ARCH" != "arm64" ]; then
            log_warning "Binary architecture ($binary_arch) differs from system ($ARCH)"
        fi

        # Check dependencies
        log_info "Checking library dependencies..."
        if otool -L "$binary" | grep -q libusb; then
            log_success "libusb dependency linked correctly"
        else
            log_warning "libusb dependency not found"
        fi

        # Show dependencies
        log_info "Library dependencies:"
        otool -L "$binary" | tail -n +2 | sed 's/^/  /'
    else
        local binary_type=$(file "$binary")
        log_info "Binary type: $binary_type"

        # Check dependencies on Linux
        log_info "Checking library dependencies..."
        if ldd "$binary" 2>/dev/null | grep -q libusb; then
            log_success "libusb dependency linked correctly"
        else
            log_warning "libusb dependency not found"
        fi

        # Show dependencies
        log_info "Library dependencies:"
        ldd "$binary" 2>/dev/null | sed 's/^/  /' || log_warning "Could not check dependencies"
    fi

    # Check version
    local version=$("$binary" -V 2>&1 | grep -o "novacomd version.*" || echo "unknown")
    log_info "Version: $version"

    # Check size
    local size=$(ls -lh "$binary" | awk '{print $5}')
    log_info "Binary size: $size"

    return 0
}

# Main script
main() {
    print_header "novacomd Automated Build Script"

    log_info "Detecting environment..."
    detect_os
    detect_arch

    echo ""
    log_info "System Information:"
    log_info "  OS: $OS_NAME"
    if [ "$OS" = "linux" ]; then
        log_info "  Distribution: $LINUX_DISTRO"
    fi
    log_info "  Architecture: $ARCH_NAME"
    log_info "  Shell: $SHELL"
    echo ""

    # Check if we're in the right directory
    if [ ! -f "makefile" ] || [ ! -d "src" ]; then
        log_error "Not in novacomd source directory"
        log_info "Please run this script from the novacomd root directory"
        exit 1
    fi

    # Check build tools
    print_header "Checking Build Environment"

    if ! check_build_tools; then
        if [ "$OS" = "macos" ]; then
            log_info "Install Xcode Command Line Tools:"
            echo "  xcode-select --install"
        else
            log_info "Install build tools using your package manager"
        fi
        exit 1
    fi

    # Install dependencies
    print_header "Installing Dependencies"

    if [ "$OS" = "macos" ]; then
        if ! install_deps_macos; then
            log_error "Failed to install macOS dependencies"
            exit 1
        fi
    elif [ "$OS" = "linux" ]; then
        if ! install_deps_linux; then
            log_error "Failed to install Linux dependencies"
            exit 1
        fi
    else
        log_error "Unsupported operating system: $OS"
        exit 1
    fi

    # Build
    print_header "Building novacomd"

    if ! build_novacomd; then
        log_error "Build failed"
        log_info "Check the output above for errors"
        exit 1
    fi

    # Verify
    print_header "Verifying Build"

    if ! verify_build; then
        log_error "Build verification failed"
        exit 1
    fi

    # Success
    print_header "Build Complete!"

    log_success "novacomd has been built successfully"
    echo ""
    log_info "Binary location: ./build-novacomd/novacomd"
    echo ""
    # Determine install script based on OS
    if [ "$OS" = "macos" ]; then
        INSTALL_SCRIPT="./install-macos.sh"
    else
        INSTALL_SCRIPT="./install-linux.sh"
    fi

    log_info "Next steps:"
    echo ""
    echo "  1. Test the binary:"
    echo "     sudo ./test-novacomd.sh"
    echo ""
    echo "  2. Install the binary:"
    echo "     sudo $INSTALL_SCRIPT"
    echo ""
    echo "  3. Or run directly:"
    echo "     sudo ./build-novacomd/novacomd"
    echo ""

    # Offer to run tests
    echo ""
    read -p "Would you like to run the test script now? [y/N]: " run_tests
    if [[ $run_tests =~ ^[Yy]$ ]]; then
        if [ -x "./test-novacomd.sh" ]; then
            echo ""
            log_info "Running tests..."
            sudo ./test-novacomd.sh
        else
            log_warning "test-novacomd.sh not found or not executable"
        fi
    fi

    # Offer to install
    echo ""
    read -p "Would you like to install novacomd now? [y/N]: " run_install
    if [[ $run_install =~ ^[Yy]$ ]]; then
        if [ -x "$INSTALL_SCRIPT" ]; then
            echo ""
            log_info "Running installer..."
            sudo "$INSTALL_SCRIPT"
        else
            log_warning "$INSTALL_SCRIPT not found or not executable"
        fi
    fi

    echo ""
    log_success "Done!"
}

# Run main function
main "$@"
