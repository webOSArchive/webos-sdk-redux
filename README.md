# PalmSDK 0.3 Overview

This is a modernization of the 2011-era webOS SDK and driver for the Palm/HP mobile operating system. It works with devices like the Palm Pre or the HP TouchPad on modern desktop platforms.

The SDK consists of four parts, most of which were initially distributed separately. These parts have been combined and modernized for convenience and manageability:

- novacomd: the driver that communicates with the webOS device
- novacom: a utility that interacts with the driver for basic device commands
- sdk tools and content: command line tools and sample code for building, installing and interacting with webOS apps and services
- pdk: headers and device libraries for native (C/C++ and SDL) plug-in development

The easiest, and most common deployment will use all four parts, but you can also pick and choose based on your needs.

## What's new in 0.3

- **webOS CE 3.1.0 device support.** The SDK tools previously refused to talk to
  a device running the community OS update, failing with `unrecognized device
  version`. See [webOS CE support](#webos-ce-support) below.
- **The PDK is back.** Native plug-in headers and the unstripped ARM device
  libraries now ship again, so you can build, link and debug C/C++ and SDL
  plug-ins. See [PDK](#pdk) below.
- **`palm-*` commands now resolve through `Current`**, so changing SDK versions
  no longer means rerunning the installer.
- **Installing a new version reports older ones** instead of leaving them
  silently orphaned, and tells you how to roll back.
- **Fixed installing via the `Current` symlink**, which previously copied the
  symlink instead of the SDK tree and still reported success.

## Pre-requisites

- This SDK targets macOS (Intel or Apple Silicon) and 64-bit Linux. Windows is supported via a batch installer — see [Windows](#windows) below. On 32-bit Linux or very old OSX, the legacy SDK will likely work for you.
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
- Run `./install-<platform>.sh` from the `0.3` folder

The SDK ships in a numbered folder that changes with each release, with a
`Current` symlink beside it. The installer mirrors that layout where it installs
— `/opt/PalmSDK/Current -> /opt/PalmSDK/0.3` by default — and the `palm-*`
commands it puts on your PATH point *through* `Current`. Switching or rolling
back a version is therefore one command, with no reinstall:

```bash
sudo ln -sfn /opt/PalmSDK/0.2 /opt/PalmSDK/Current
```

Older versions are left in place when you install a new one; the installer tells
you which it found rather than deleting anything.

### PDK

If you want to build native (C/C++ or SDL) plug-ins rather than JavaScript apps,
you'll also want the PDK. It installs to `/opt/PalmPDK`.

- Run `sudo ./install-pdk.sh` from the `pdk` folder (the top-level `install.sh`
  does this for you)

This ships the headers, the unstripped ARM device libraries you link and debug
against, the device helper scripts, and the sample code. It deliberately does
**not** ship HP's cross-compilers: those were 32-bit Intel binaries and cannot
run on macOS 10.15 or later. Bring your own ARM toolchain and point it at
`/opt/PalmPDK/include` and `/opt/PalmPDK/device/lib`.

Earlier releases dropped the PDK entirely on the grounds that none of it ran on
a modern Mac. That was true of the compilers and false of everything else — see
[PDK.md](PDK.md).

## Windows

Windows gets a batch installer rather than a GUI. Run it from an **elevated**
command prompt:

```
install-windows.bat
```

It installs the SDK to `%ProgramFiles%\PalmSDK` (with the same `Current`
junction convention), puts the `palm-*` commands on the system PATH, installs
the PDK to `C:\PalmPDK`, and runs HP's novacom MSI for the USB driver and
`novacomd`. Options: `/y`, `/sdkdir <path>`, `/nopdk`, `/nonovacom`.

The one thing that cannot be built from source here is the driver — Windows
needs HP's original `NovacomInstaller_{x86,x64}.msi`, which is committed under
`windows/`. It binds the device to Microsoft's in-box WinUSB rather than
shipping its own kernel driver, and its catalog is WHQL-signed by Microsoft, but
with a **SHA-1 digest from 2011** that modern Windows may reject. That is
untested on real hardware. If it fails, the SDK still installs and works — you
just won't be able to reach a device.

See [WINDOWS.md](WINDOWS.md) for the details.

## macOS driver installer (.pkg)

For distributing the drivers to people who won't build from source, there's a
signed, notarized macOS installer package containing novacomd, novacom, novaterm
and their libusb dependencies:

```bash
./build-driver-installer-mac.sh     # produces novacom-installer-<arch>.pkg
```

It builds both binaries from clean, stamped with the package version, and prints
the version strings it packaged so a stale or misattributed build is visible in
the log. Signing and notarization need your Apple credentials in
`set-apple-vars.sh` (gitignored).

Note this package is **drivers only** — it contains no SDK and no PDK, so it is
not a substitute for `install.sh`.

See [DRIVER-INSTALLER-MAC-README.md](DRIVER-INSTALLER-MAC-README.md) for what it
installs and [BUILD-DRIVER-INSTALLER-MAC.md](BUILD-DRIVER-INSTALLER-MAC.md) for
building, signing and notarizing it.

## webOS CE support

The stock SDK tools only recognize devices whose `PRODUCT_VERSION_STRING` starts
with `Palm webOS` or `HP webOS`, so every `palm-*` command against a device
running **webOS CE 3.1.0** failed with `unrecognized device version`. The
`webos-tools.jar` in this repo is patched to accept modern version strings —
webOS CE, Open webOS, and unprefixed `webOS x.y.z` — while still parsing every
2011-era string exactly as before.

See [SDK-VERSION-DETECTION.md](SDK-VERSION-DETECTION.md) for the bug and the fix,
and [patch-webos-tools-version.py](patch-webos-tools-version.py) to re-apply it
to a pristine jar or to check whether a given jar is patched.

## Novacom over Wi-Fi (TCP)

This SDK's novacomd fixes a bug that kept Palm's TCP transport from ever
completing its handshake on Linux, so a device can attach over Wi-Fi instead of
USB — handy when the device's only USB port is needed for something else. Every
tool (`novacom`, `novaterm`, `palm-install`, `palm-log`, …) then works over it
unchanged.

See [NOVACOM-TCP.md](NOVACOM-TCP.md) for the bug, the fix and the setup, and
[novacom-tcp/](novacom-tcp/) for ready-made host scripts and the device-side
firewall job.

Note that network novacom is an unauthenticated root shell — treat a device with
it enabled as lab equipment on a trusted network.
