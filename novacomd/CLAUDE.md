# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is `novacomd`, the daemon that enables communication between the webOS SDK tools on a host machine (desktop/laptop) and webOS devices (Palm Pre, TouchPad, etc.). This is a modernized build that compiles on macOS with 64-bit support, addressing limitations of the original HP/Palm SDK which only supported 32-bit Intel binaries.

## Build Requirements

- **macOS**: Tested on Big Sur 11.0.1, should work on newer versions
- **GNU Make**: 3.81 or newer
- **libusb-compat**: Install via Homebrew: `brew install libusb-compat`
- **Java 1.5+**: Required by SDK tools that communicate with novacomd

## Build Commands

### Building

```bash
# Build host version for current architecture
make host

# Build device version (for webOS device, requires ARM cross-compiler)
make device

# Build both host and device
make all

# Display help with all available targets
make help

# Show current build configuration
make info
```

### Advanced Builds

```bash
# Build for specific architecture (macOS)
make host BUILD_ARCH=arm64
make host BUILD_ARCH=x86_64

# Universal binary (requires universal libusb-compat)
make universal

# Note: Universal binaries require libusb-compat with both architectures.
# Homebrew typically installs native-only binaries.
```

### Cleaning

```bash
# Clean build artifacts but keep build directories
make clean

# Remove all build directories
make spotless
```

### Installation

```bash
# Install to default location (/opt/nova/bin)
sudo make install

# Install to custom location
sudo make install PREFIX=/usr/local

# Manual installation
cp build-novacomd-host/novacomd /opt/nova/bin/
```

## Development Notes

### Build System Modernization (2024-2025)

The Makefile has been updated for modern macOS and Linux systems:

- **Compiler Detection**: Automatically detects Homebrew paths (Intel vs Apple Silicon)
- **Architecture Support**: Native builds for x86_64 and arm64
- **Warning Fixes**: Resolved modern compiler warnings (strncat, unknown pragmas, unused variables)
- **Implicit Rules**: Disabled built-in Make rules to prevent spurious builds
- **Library Paths**: Uses `-rpath` for better library resolution

### Known Limitations

- **USB Driver Variable Substitution**: The `usb-$(HOSTOS).o` pattern in HOSTOBJS caused Make variable expansion issues. Currently hardcoded to `usb-linux.o` for macOS/Linux builds.
- **Universal Binaries**: Require universal libusb-compat library, which Homebrew doesn't provide by default.

## Architecture

novacomd is built in two variants using conditional compilation:

### Host Build (`-DHOST=1`)
- Runs on desktop/laptop (macOS, Linux)
- Communicates with webOS devices via USB (libusb) or network (TCP/IP)
- Provides services for SDK tools (palm-install, palm-log, palm-launch, etc.)
- Manages device list and connection multiplexing
- Handles authentication tokens for secure device communication

### Device Build (`-DDEVICE=1`)
- Runs on webOS devices (ARM architecture)
- Uses USB gadget mode to expose device as USB peripheral
- Provides access to device services and command execution

### Key Components

**Core Communication Layer (`src/novacom/`)**:
- `mux.c/mux.h` - Connection multiplexing, manages multiple logical channels over single USB/network connection
- `packet.c` - Packet framing and serialization
- `buf_queue.c` - Buffer queue management for async I/O
- `commands.c` - Common command handling framework
- `commands_device.c` - Device-side command implementations

**Transport Layer (`src/`)**:
- `transport_usb.c` - USB transport abstraction
- `transport_inet.c` - TCP/IP network transport
- `platform_pthreads.c` - POSIX threads platform implementation

**Host-Specific (`src/host/`)**:
- `usb-linux.c` - USB communication via libusb (works on both Linux and macOS despite the name)
- `device_list.c` - Tracks connected devices
- `tokenstorage.c` - Manages authentication tokens
- `recovery.c` - Device recovery mode handling
- `commands_service.c` - Host-side service command handling

**Device-Specific (`src/device/`)**:
- `usb-gadget.c` - USB gadget mode (device as USB peripheral)
- `auth.c` - Device-side authentication
- `commands_service.c` - Device-side service command handling

**Utilities (`src/lib/`)**:
- `cksum/` - SHA1 and Adler32 checksums for authentication and data integrity
- `buffer.c` - Buffer management utilities

### Communication Protocol

- Uses custom binary protocol over USB or TCP/IP
- Standard ports defined in `include/novacom.h`:
  - `NOVACOM_INETPORT (6969)` - Main communication
  - `NOVACOM_DEVLISTPORT (6968)` - Device listing
  - `NOVACOM_LOGPORT (6970)` - Log streaming
  - `NOVACOM_CTRLPORT (6971)` - Control messages
- Supports channel multiplexing for concurrent operations
- Authentication via token-based system with SHA1 hashing

### Build System

The Makefile handles two separate build configurations:
- Source files compiled twice with different flags (`-DHOST=1` or `-DDEVICE=1`)
- Host build outputs to `build-novacomd-host/`
- Device build outputs to `build-novacomd-device/`
- Automatic dependency tracking via `.d` files

### Platform Abstraction

The code uses `PLATFORM_PTHREADS=1` to enable POSIX threads. On macOS, the makefile pretends it's Linux (`HOSTOS := linux`) to use the libusb-based USB implementation in `src/host/usb-linux.c`.

## License

Apache License 2.0 - Copyright (c) 2008-2012 Hewlett-Packard Development Company, L.P.

## Credits

USB compatibility for modern macOS by [NotAlexNoyle](https://github.com/NotAlexNoyle/novacomd).
