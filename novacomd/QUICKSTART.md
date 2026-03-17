# Quick Start Guide

Get novacomd built and running on modern macOS/Linux in 3 simple steps.

## One-Command Build

```bash
./build.sh
```

That's it! The script will:
- ✅ Detect your OS and architecture automatically
- ✅ Check for required build tools
- ✅ Install dependencies (Homebrew, libusb-compat, etc.)
- ✅ Build the binary
- ✅ Verify the build
- ✅ Optionally run tests and install

## Manual Build (if you prefer)

```bash
# Install dependencies first
brew install libusb-compat  # macOS
# or
sudo apt install build-essential libusb-dev  # Debian/Ubuntu

# Build
make host

# Test
sudo ./test-novacomd.sh

# Install (use the appropriate script for your OS)
sudo ./install-macos.sh   # macOS
sudo ./install-linux.sh   # Linux
```

## What Gets Detected

The `build.sh` script automatically detects:

### macOS
- Intel (x86_64) or Apple Silicon (arm64)
- Homebrew installation (or offers to install it)
- Xcode Command Line Tools
- libusb-compat availability

### Linux
- Distribution (Ubuntu, Debian, Fedora, Arch, etc.)
- Architecture (x86_64, ARM64, ARM)
- Package manager (apt, dnf, pacman)
- Build tools and dependencies

## Output Example

```
==========================================
  novacomd Automated Build Script
==========================================

[INFO] Detecting environment...

System Information:
  OS: macOS
  Architecture: Intel 64-bit (x86_64)

==========================================
Checking Build Environment
==========================================

[SUCCESS] All required build tools found
[INFO] Make: GNU Make 3.81
[INFO] Compiler: Apple clang version 16.0.0

==========================================
Installing Dependencies
==========================================

[SUCCESS] Homebrew found: Homebrew 4.1.0
[SUCCESS] Xcode Command Line Tools installed
[SUCCESS] libusb-compat already installed

==========================================
Building novacomd
==========================================

[INFO] Running make host...
HOST compiling src/main.c
...
HOST linking build-novacomd/novacomd

[SUCCESS] Build completed successfully

==========================================
Verifying Build
==========================================

[SUCCESS] Binary exists
[SUCCESS] Binary is executable
[INFO] Binary architecture: x86_64
[SUCCESS] libusb dependency linked correctly

==========================================
Build Complete!
==========================================

[SUCCESS] novacomd has been built successfully

Binary location: ./build-novacomd/novacomd
```

## Troubleshooting

### "Homebrew not found" (macOS)
The script will offer to install Homebrew for you. Just answer 'y' when prompted.

### "Xcode Command Line Tools not found" (macOS)
The script will start the installation. Complete it and run `./build.sh` again.

### Build errors
Check that you have:
- macOS: Xcode Command Line Tools, Homebrew, libusb-compat
- Linux: gcc/make, libusb-dev

View detailed requirements: `cat DEPENDENCIES.md`

## After Building

### Test the driver
```bash
sudo ./test-novacomd.sh
```

### Install system-wide
```bash
# macOS
sudo ./install-macos.sh
# Choose option 4 (Hybrid) for best compatibility

# Linux (with optional systemd service)
sudo ./install-linux.sh
# Choose option 4 (Hybrid) for best compatibility
# Optionally set up systemd service for auto-start
```

### Run directly
```bash
# Connect your webOS device via USB first
sudo ./build-novacomd/novacomd
```

## Complete Workflow

```bash
# 1. Build (one command does everything)
./build.sh

# 2. Test with connected device
sudo ./test-novacomd.sh

# 3. Install if tests pass
sudo ./install-macos.sh   # macOS
sudo ./install-linux.sh   # Linux

# 4. Use Palm SDK tools
palm-device-info
palm-install --list
```

## File Overview

- **`build.sh`** - Automated build with dependency installation
- **`test-novacomd.sh`** - Comprehensive test suite
- **`install-macos.sh`** - Interactive installation wizard for macOS
- **`install-linux.sh`** - Interactive installation wizard for Linux (with systemd support)
- **`makefile`** - Build configuration (use via build.sh or directly)

## Getting Help

```bash
# Build help
make help

# Test what will be done (dry-run)
make -n host

# View build configuration
make info
```

For detailed documentation:
- **`README.md`** - Complete overview
- **`DEPENDENCIES.md`** - Detailed dependency information
- **`TESTING.md`** - Testing documentation
- **`BUILD_SUMMARY.md`** - Technical changes and known issues
- **`CLAUDE.md`** - Developer/architecture documentation
