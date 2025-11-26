# PalmSDK 0.2 Overview

This is a modernization of the 2011-era webOS SDK and driver for the Palm/HP mobile operating system. It works with devices like the Palm Pre or the HP TouchPad.

The SDK consists of three parts, two of which were initially distributed separately. These parts have been combined and modernized for convenience and manageability:

- novacomd: the driver that communicated with the webOS device
- novacom: a utility that interacts with the driver for basic device interaction
- sdk tools and content: command line tools and sample code for building, installing and interacting with webOS apps and services

Most deployments will use all three parts, but you can also pick and choose based on your needs.

## Installation (All Parts)

- Run ./build-and-install from the root of this folder

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
- If you need to troubleshoot, you can separately run `./install.sh`
- See BUILD_SUMMARY.md in the novacom folder for troubleshooting.

## SDK

If you want to build webOS applications, you'll need the SDK. You don't strictly have to install it, but it can be helpful to have it in your path. Typically you'll install this in the same place as novacom (if you built it).

- **Run `./install.sh` from the `Current` folder TBD**