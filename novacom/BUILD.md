# Building novacom

This document describes how to build `novacom` on modern systems.

## Supported Platforms

- macOS (Apple Silicon and Intel)
- Linux x64

## Prerequisites

### macOS

Install Xcode Command Line Tools:
```bash
xcode-select --install
```

### Linux

Install build essentials:

**Debian/Ubuntu:**
```bash
sudo apt install build-essential
```

**RHEL/CentOS/Fedora:**
```bash
sudo yum groupinstall 'Development Tools'
```

## Quick Start

The easiest way to build is using the automated build script:

```bash
./build.sh
```

The build script will:
1. Detect your OS and architecture
2. Check for required build tools
3. Build the binary
4. **Offer to install immediately** after a successful build

Or using make directly:

```bash
make
```

The built binary will be at `build-novacom/novacom`.

## Build Options

### Using build.sh

```bash
# Build for native architecture (default)
./build.sh

# Clean build artifacts
./build.sh --clean

# Build universal binary (macOS only - Intel + Apple Silicon)
./build.sh --universal

# Build for specific architecture
./build.sh --arch x86_64    # Intel
./build.sh --arch arm64     # Apple Silicon

# Show help
./build.sh --help
```

### Using make directly

```bash
# Build for native architecture
make

# Build for specific architecture
make BUILD_ARCH=x86_64

# Build universal binary (macOS only)
make UNIVERSAL=1

# Clean build artifacts
make clean

# Remove all build directories
make spotless

# Install to /usr/local/bin (novacom only, not novaterm)
sudo make install

# Uninstall
sudo make uninstall
```

## Build Output

The built binary is located at:
```
build-novacom/novacom
```

## Testing the Build

After building, test the binary:

```bash
# Show version
./build-novacom/novacom -V

# Show usage
./build-novacom/novacom -l
```

## Installation

### Automated Installation (Recommended)

Use the provided install scripts for an interactive installation:

**macOS:**
```bash
sudo ./install-macos.sh
```

**Linux:**
```bash
sudo ./install-linux.sh
```

The install scripts will:
- **Auto-detect** where novacomd is installed and use the same location
- Install both `novacom` binary and `novaterm` helper script
- Create backups of existing installations
- Automatically match symlink setup (if novacomd uses hybrid installation)
- Verify the installation
- Check for novacomd daemon

**Smart Installation**: Since novacomd is a prerequisite for novacom, the install scripts automatically detect where you installed novacomd and install novacom to the same location. You don't need to answer the same installation questions twice!

If novacomd is not found, the scripts will:
- Warn you that novacomd is required
- Offer to install to a standard location anyway
- Provide installation location options as fallback

### Manual Installation

Using make:

```bash
sudo make install
```

This installs `novacom` to `/usr/local/bin/novacom` but does not install the `novaterm` script.

To uninstall:

```bash
sudo make uninstall
```

### What Gets Installed

- **novacom** - Main binary for communicating with webOS devices
- **novaterm** - Convenience script to open a terminal on the device (shortcut for `novacom -t open tty://0`)

## Architecture Support

### macOS

- **Apple Silicon (M1/M2/M3)**: Builds native arm64 binaries
- **Intel**: Builds native x86_64 binaries
- **Universal**: Can build fat binaries containing both architectures

The makefile automatically detects your architecture and builds appropriately.

### Linux

Builds for x86_64 architecture.

## Troubleshooting

### Missing Build Tools

If you get errors about missing compilers or make:

**macOS:**
```bash
xcode-select --install
```

**Linux (Debian/Ubuntu):**
```bash
sudo apt install build-essential
```

**Linux (RHEL/CentOS/Fedora):**
```bash
sudo yum groupinstall 'Development Tools'
```

### Build Failures

1. Make sure you have the latest Command Line Tools (macOS) or build-essential (Linux)
2. Try cleaning first: `make clean` or `./build.sh --clean`
3. Check that you have enough disk space
4. Ensure you're in the novacom directory

### Installation Issues

If the install scripts don't work:
1. Make sure you ran with `sudo`
2. Check that the binary was built first
3. Verify the scripts are executable: `chmod +x install-*.sh`

## Build System Details

The build system uses:
- **GNU Make**: Traditional makefile-based build
- **Platform Detection**: Automatically detects macOS vs Linux
- **Architecture Detection**: Automatically builds for native architecture
- **Universal Binary Support**: macOS can build fat binaries (Intel + Apple Silicon)

### Makefile Features

- Automatic dependency generation
- Platform-specific compiler flags
- Architecture-specific builds
- Clean and install targets
- Optimized builds (-O2)
- Debug symbols included (-g)

### Compiler Flags

- `-Wall -W`: Enable warnings
- `-Wno-multichar -Wno-unused-parameter -Wno-unused-function -Wno-unused-but-set-variable`: Suppress specific warnings
- `-g`: Include debug symbols
- `-O2`: Optimization level 2
- `-DBUILDVERSION`: Embed build version string

## Requirements

novacom requires **novacomd** to be running to communicate with devices. Install novacomd from the parent `novacomd` directory.

## Related Documentation

- [README.md](README.md) - Project overview and description
- [MODERNIZING.md](MODERNIZING.md) - Documentation of modernization changes
- [../novacomd/BUILD_SUMMARY.md](../novacomd/BUILD_SUMMARY.md) - novacomd build documentation
