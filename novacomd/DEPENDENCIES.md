# Build Dependencies

This document lists all dependencies required to build and run novacomd on modern systems.

## macOS Dependencies

### Required
- **Xcode Command Line Tools**: Provides gcc/clang compiler and build tools
  ```bash
  xcode-select --install
  ```

- **Homebrew**: Package manager for macOS
  ```bash
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  ```

- **libusb-compat**: USB 0.1 compatibility layer (wraps libusb 1.0)
  ```bash
  brew install libusb-compat
  ```
  - Provides: `libusb-0.1.4.dylib`
  - Location: `/usr/local/opt/libusb-compat/` (Intel) or `/opt/homebrew/opt/libusb-compat/` (Apple Silicon)

### Runtime Dependencies
- **libusb-compat**: Required at runtime for USB communication
  - The binary links against this library dynamically

## Linux Dependencies

### Debian/Ubuntu
```bash
sudo apt-get update
sudo apt-get install build-essential libusb-dev
```

### Fedora/RHEL
```bash
sudo dnf install gcc make libusb-devel
```

### Arch Linux
```bash
sudo pacman -S base-devel libusb-compat
```

## Supported Platforms

- **macOS 10.13+** (High Sierra and later)
  - Intel (x86_64)
  - Apple Silicon (arm64)
  - Universal binaries supported

- **Linux**
  - x86_64
  - ARM64 (including Raspberry Pi)
  - ARM (32-bit)

## Library Versions

- **libusb-compat**: 0.1.7 or later
- **libusb**: 1.0.20 or later (dependency of libusb-compat)

## Build Tools

- **Make**: GNU Make 3.81 or later
- **GCC/Clang**: GCC 4.2+ or Clang 3.0+
- **pkg-config**: For library detection (recommended)
