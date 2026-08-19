# PalmSDK 0.2 Overview

This is a modernization of the 2011-era webOS SDK and driver for the Palm/HP mobile operating system. It works with devices like the Palm Pre or the HP TouchPad on modern desktop platforms.

The SDK consists of three parts, two of which were initially distributed separately. These parts have been combined and modernized for convenience and manageability:

- novacomd: the driver that communicates with the webOS device
- novacom: a utility that interacts with the driver for basic device commands
- sdk tools and content: command line tools and sample code for building, installing and interacting with webOS apps and services

The easiest, and most common deployment will use all three parts, but you can also pick and choose based on your needs.

## Pre-requisites

- This SDK is for modern *nix-based Operating Systems: macOS (Intel or Apple Silicon) or 64-bit Linux. If you have another platform (Windows, OSX or 32-bit Linux), the legacy SDK will likely work for you.
- You will need some version of Java. This version of the toolchain is very tolerant of different versions of Java, but make sure you have at least Java 8 working!
- You will need build tools for your platform. On Linux these are installed with your package manager and called `build-essential` or `Development Tools`. On macOS this means XCode Command Line tools and [Homebrew](https://brew.sh/).
- You will need libusb. On Linux this is `libusb-dev` or `libusb-devel`. On macOS, this is `libusb-compat` from Homebrew.

The installers will *try* to help you with these pre-reqs, but its always best if you get them working first!

## Installation (All Parts)

- Run ./install.sh from the root of this folder

## Installation (Individual Parts)

### novacomd

Build and install this first!

- Run `./build.sh` from the `novacomd` folder. If the build succeeds it will offer to install.
- If you need to troubleshoot, you can separately run `./install-<platform>.sh`
- See BUILD_SUMMARY.md in the novacomd folder for troubleshooting.

### novacom

This is optional, but useful for some SDK operations and device troubleshooting

- Ensure you have novacomd built and installed -- novacom will use the same path as novacomd.
- Run `./build.sh` from the `novacom` folder. If the build succeeds it will offer to install.
- If you need to troubleshoot, you can separately run `./install-<platform>.sh
- See BUILD_SUMMARY.md in the novacom folder for troubleshooting.

## SDK

If you want to build webOS applications, you'll need the SDK. You don't strictly have to install it, but it can be helpful to have it in your path. Typically you'll install this in the same place as novacom (if you built it).

- Ensure you have installed novacomd and novacom
- Run `./install-<platform>.sh from the `0.2` folder