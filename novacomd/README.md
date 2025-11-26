novacomd
========

Modern build of novacomd for macOS and Linux, enabling communication between webOS SDK tools and webOS devices.

This updated version compiles on modern macOS (including Apple Silicon) and Linux systems, replacing the legacy 32-bit binaries from the original HP webOS SDK.

## Supported Platforms

- **macOS 10.13+ (High Sierra and later)**
  - Intel (x86_64)
  - Apple Silicon (arm64)
  - Tested on macOS 15.7.2 (Sequoia)
- **Linux**
  - x86_64, ARM64, ARM (32-bit)

## Prerequisites

### macOS

Install Homebrew and the required library:

```bash
# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install libusb-compat
brew install libusb-compat
```

### Linux

#### Debian/Ubuntu
```bash
sudo apt-get update
sudo apt-get install build-essential libusb-dev
```

#### Fedora/RHEL
```bash
sudo dnf install gcc make libusb-devel
```

#### Arch Linux
```bash
sudo pacman -S base-devel libusb-compat
```

## Building

### Quick Start (Automated)

```bash
# One command - detects environment and installs dependencies
./build.sh
```

The automated build script will:
- Detect your OS and architecture
- Install required dependencies (Homebrew, libusb-compat, build tools)
- Build the binary
- Verify the build
- Optionally run tests and install

### Manual Build

```bash
# Install dependencies first (see Prerequisites section above)

# Build for current architecture
make host

# See all available options
make help

# Show build configuration
make info
```

### Advanced Build Options

```bash
# Clean build artifacts
make clean

# Remove all build directories
make spotless

# Build for specific architecture (macOS)
make host BUILD_ARCH=arm64
make host BUILD_ARCH=x86_64
```

**Note**: Universal binaries (containing both Intel and ARM code) can only be built if libusb-compat is installed with universal support. On most systems, Homebrew installs native binaries only.

## Installation

### Quick Install

```bash
# Install to /opt/nova/bin (default Palm SDK location)
sudo make install

# Install to custom location
sudo make install PREFIX=/usr/local
```

### Manual Install

```bash
# Copy binary to Palm SDK directory
sudo cp build-novacomd/novacomd /opt/nova/bin/

# Or to a custom location
sudo cp build-novacomd/novacomd /usr/local/bin/
```

## Verifying the Build

```bash
# Check binary architecture
file build-novacomd/novacomd

# Check version
./build-novacomd/novacomd -V

# Check library dependencies
otool -L build-novacomd/novacomd  # macOS
ldd build-novacomd/novacomd       # Linux
```

## Dependencies

See [DEPENDENCIES.md](DEPENDENCIES.md) for detailed dependency information.

## Acknowledgments

- Original HP/Palm webOS SDK team
- [NotAlexNoyle](https://github.com/NotAlexNoyle/novacomd) for USB compatibility work

# macOS Service registration

Steps to set up an agent or daemon:

    Create a program that you want to run in the background
    Create a .plist file describing the job to run (See below for how to author one)
    Store it in the relevant spot based on whether or not you're creating a daemon or an agent, and why type of agent or daemon that you want to include (see screenshot below)
    Use launchctl to load the job and set it to run: launchctl load PATH/TO-PLIST
        Note that you only have to run this once when you first author / install the service. Upon reboot / login all agents & daemons will be loaded and run according to the .plist running commands


# Copyright and License Information

Unless otherwise specified, all content, including all source code files 
and documentation files in this repository are:
 Copyright (c) 2008-2012 Hewlett-Packard Development Company, L.P.

Unless otherwise specified, all content, including all source code files
and documentation files in this repository are:
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this content except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.


