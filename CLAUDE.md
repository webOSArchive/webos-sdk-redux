# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is **PalmSDK 0.3 (Redux)** — a modernization of the 2011-era HP webOS SDK
(3.0.5) and its USB driver stack, so that Palm/HP devices like the Palm Pre and
HP TouchPad can still be developed against from current macOS and Linux hosts.

It is not just the SDK. The repository combines four pieces that HP shipped
separately:

- **novacomd** — the daemon that talks to a webOS device over USB (or TCP)
- **novacom** — the client utility that drives the daemon
- **the SDK** — the `palm-*` command line tools, frameworks and sample code
- **the PDK** — headers and ARM device libraries for native plug-in development

Target devices run either the original **HP webOS 3.0.5** or the community
**webOS CE 3.1.0** update. Both are supported; see "Device version detection"
below, which is the one place that distinction has bitten us.

## Repository layout

```
0.3/                          # The SDK itself — see "SDK versioning" below
├── bin/                      # Command-line tools (palm-* commands)
├── install-sdk-macos.sh      # SDK-only installers
├── install-sdk-linux.sh
├── uninstall-sdk-macos.sh
├── uninstall-sdk-linux.sh
└── share/
    ├── addons/               # Additional libraries and utilities
    ├── applications/enyo/    # Reference application source code
    ├── documentation/        # API and SDK documentation
    ├── framework/
    │   ├── enyo/1.0/         # Enyo framework
    │   └── mojo/506/         # Mojo framework
    ├── jars/                 # webos-tools.jar, worm.jar
    └── samplecode/
        ├── enyo/             # Enyo examples and templates
        └── mojo/             # Mojo examples and samples
Current -> ./0.3              # Always points at the current SDK version

novacom/                      # novacom client source + build/install scripts
novacomd/                     # novacomd daemon source + build/install scripts
novacom-tcp/                  # Wi-Fi novacom helper scripts + device firewall job
pdk/                          # Native plug-in kit -> /opt/PalmPDK (see below)
windows/                      # HP's novacom MSIs (x86 / x64) -- payload only
installer-package/            # Staging area for the macOS driver .pkg

install.sh                    # Installs all four parts (macOS / Linux)
uninstall.sh                  # Removes all four parts (macOS / Linux)
install-windows.bat           # Installs all four parts (Windows, elevated)
uninstall-windows.bat         # Removes them again (Windows, elevated)
build-driver-installer-mac.sh # Builds the signed macOS driver .pkg
patch-webos-tools-version.py  # Re-applies the CE version-detection patch to a jar
set-apple-vars.sh             # Apple signing/notarization credentials
```

### SDK versioning

The SDK lives in a **numbered folder that is renamed each release** (`0.2` →
`0.3` → …), with a `Current` symlink alongside it. The same convention is
reproduced at install time: `$SDK_INSTALL_DIR/Current -> $SDK_INSTALL_DIR/0.3`.

Because of this, **prefer `Current/` over a hardcoded version number** in
scripts and docs — e.g. `Current/share/jars/webos-tools.jar`. The installers
already derive the version from the directory basename (`pwd -P` + `basename`)
and `install.sh` picks the highest-numbered folder automatically, so a version
bump is a `git mv` plus a symlink update, not a hunt for string literals.

## Building and installing

**Requirements**: Java 8 or greater; a C toolchain (`build-essential` /
Xcode Command Line Tools); libusb (`libusb-dev` on Linux, `libusb-compat` from
Homebrew on macOS).

```bash
./install.sh                       # everything: novacomd, novacom, SDK, PDK
```

Or piecemeal — build novacomd first, since novacom installs alongside it:

```bash
cd novacomd && ./build.sh          # offers to install on success
cd novacom  && ./build.sh
cd 0.3      && sudo ./install-sdk-macos.sh    # or install-sdk-linux.sh
cd pdk      && sudo ./install-pdk.sh          # same script on both platforms
```

The SDK installer copies the version folder to `$SDK_INSTALL_DIR` (default
`/opt/PalmSDK`), repoints `Current`, and symlinks the `palm-*` commands into a
bin directory on PATH. Those symlinks point **through `Current`**, so switching
SDK versions is just `ln -sfn`, not a reinstall.

## Device version detection (important)

`0.3/share/jars/webos-tools.jar` in this repo is **patched** and is not
byte-identical to HP's original.

Every `palm-*` tool resolves the device's OS version before doing anything else,
in `AbstractDeviceConnection.readProductVersion()`. HP's regex required a vendor
prefix (`^(Palm|HP) webOS\s+…`), but webOS CE reports
`PRODUCT_VERSION_STRING=webOS CE 3.1.0` — no prefix — so every command against a
CE device died with `unrecognized device version`. Two regex constants in the
class file's constant pool were rewritten to accept modern strings, and the
product regex also accepts `Lunacy <version>` by name (treated as webOS 1.5 or
later, the only distinction the tools make).

**If you ever replace `webos-tools.jar` with an upstream copy, the CE bug comes
back.** Re-apply the patch:

```bash
./patch-webos-tools-version.py --check    # is this jar patched?
./patch-webos-tools-version.py            # patch it (idempotent)
```

The script also patches an already-installed SDK if you pass it a path. See
[SDK-VERSION-DETECTION.md](SDK-VERSION-DETECTION.md) for the full analysis.

## The PDK

`pdk/` installs to **`/opt/PalmPDK`** — fixed, unversioned, no `Current`
symlink, unlike the SDK. That path is hardcoded in the PDK's own helper scripts,
in every sample's build script, in the bundled Xcode project and throughout HP's
documentation, and it will never change. Do not "improve" this by versioning it.

It ships only the host-agnostic components: `include/` (192 headers, PDL/SDL/
GLES/OpenAL/...), `device/lib/` (50 unstripped ARM shared objects, the link and
debug targets), `bin/` (device helper scripts) and `share/` (samples, plus
on-device gdb and dropbear `.ipk`s).

It deliberately omits `arm-gcc/`, `i686-gcc/`, `host/` and `emulator/` — 283 MB
of 32-bit Intel Mach-O that cannot run on macOS 10.15+. **There is no compiler in
this package**; users bring their own ARM toolchain. An earlier release dropped
the whole PDK on that basis, which was wrong: the symbols are host-agnostic and
are the part that matters. See [PDK.md](PDK.md).

`install-pdk.sh` copies components individually rather than replacing the
directory, so a pre-existing full OEM install keeps its toolchains; the
uninstaller likewise removes only the four components it owns.

## Lunacy devices

novacomd also lists [Lunacy](https://github.com/webOSArchive/Lunacy) on Android devices,
found through the host's adb server (`novacomd/src/host/adb_relay.c`; `-A` turns it off):
connection type `adb`, device type `lunacy`, after the USB and TCP devices so the default
device is unchanged. Each client connection is spliced byte for byte to Lunacy's abstract
socket `org.webosarchive.lunacy.novacomd`, which speaks a device's side of the protocol.
Lunacy's `/etc/palm-build-info` says `PRODUCT_VERSION_STRING=Lunacy <version>`, which the
jar patch recognises by name. See [LUNACY.md](LUNACY.md).

## Novacom over TCP

novacomd here also fixes an `SO_RCVLOWAT` bug that prevented Palm's TCP
transport from completing its handshake on Linux, which makes novacom-over-Wi-Fi
usable. See [NOVACOM-TCP.md](NOVACOM-TCP.md) and `novacom-tcp/`. Note that
network novacom is an unauthenticated root shell — trusted networks only.

## macOS driver installer

`build-driver-installer-mac.sh` builds architecture-specific `.pkg` installers
that bundle the novacom/novacomd binaries with their libusb dependencies, code
signed with a launchd service integration. See
[BUILD-DRIVER-INSTALLER-MAC.md](BUILD-DRIVER-INSTALLER-MAC.md).

This package is **drivers only** — it contains no SDK and no `webos-tools.jar`,
so it does not carry the webOS CE fix. There is no graphical installer for the
SDK; that is the shell installer described above.

`PKG_VERSION` in the build script tracks the **webOS release** the drivers ship
alongside (currently `3.1.0`), not the driver source version — the drivers
themselves work with webOS 1.x/2.x/3.0.5 devices too. Bump it whenever the
payload changes, even if the OS release has not, since macOS keys package
upgrade behaviour off it. Do not confuse `com.palm.novacom` (the package
identifier) with `com.palm.novacomd` (the launchd daemon label).

## Windows

`install-windows.bat` at the repo root (elevated) installs the SDK to
`%ProgramFiles%\PalmSDK\<version>` with a `Current` **junction** — `mklink /J`,
not a symlink, since junctions need no developer mode — the PDK to
`C:\PalmPDK`, and novacom via HP's MSI. `uninstall-windows.bat` reverses
it, except novacom, which must go through the MSI.

Two things drive the whole design:

- **The Java tools reach the device over TCP `127.0.0.1:6968`** (`Novacom.java`)
  and never shell out to a `novacom` binary. So the SDK only needs *something*
  answering that port, and the installer's readiness check probes the port
  rather than a service name — which is not discoverable anyway, since
  `novacomd.exe` self-registers via `-i` and the MSI has no `ServiceInstall`
  table.
- **novacom cannot be built from source on Windows.** `windows/NovacomInstaller_{x86,x64}.msi`
  are HP's 2011 originals, committed deliberately. The driver binds Palm's USB
  IDs to Microsoft's in-box WinUSB (no third-party kernel driver) and is
  WHQL-signed, but with a SHA-1 catalog that modern Windows may reject. Untested
  on hardware.

`0.3/bin/palm-*.bat` are the Windows launchers, one per command, sharing
`palm-common.bat` for Java detection. They were written from the bash scripts
and the jar's `command.properties`, not extracted from HP's Windows SDK — that
installer is an InstallShield ISSetupStream archive that neither 7-Zip nor
unshield can unpack. Batch files are stored **CRLF**; keep them that way.

See [WINDOWS.md](WINDOWS.md).

## SDK command-line tools

All tools live in `Current/bin/` and follow the `palm-*` convention. They are
thin bash wrappers that `java -jar` the tools jar.

- `palm-generate` — Generate new app projects from templates
- `palm-package <app-dir> [service-dir] [package-dir]` — Package into an .ipk
- `palm-install [-r] <package.ipk>` — Install/remove on device (`-r` removes, `-l` lists)
- `palm-launch <app-id>` — Launch an installed application
- `palm-log [-f] <app-id>` — Show/follow application logs (`-l` lists apps)
- `palm-run` — Package, install and launch in one step
- `palm-help` — Display help information

Most accept `-d <device>` to pick a device (`usb`, `tcp`, or an id from
`--device-list`) when more than one is attached.

### Packaging workflow

```bash
palm-package path/to/app-dir
palm-install -r com.example.app                 # remove old version (optional)
palm-install com.example.app_1.0.0_all.ipk
palm-launch com.example.app
palm-log -f com.example.app
```

### Verifying against a device

`novacom -l` lists attached devices. To read something off a device directly:

```bash
novacom -w run file://bin/cat -- /etc/palm-build-info
```

## Application frameworks

### Enyo (primary for webOS 3.x)

Located at `Current/share/framework/enyo/1.0/framework/`. A component-based
JavaScript framework with a declarative syntax.

- Applications use `enyo.kind()` to define UI components
- Entry point is `index.html`, which loads `enyo.js` from the framework
- `depends.js` declares JS/CSS dependencies via `enyo.depends()`
- `appinfo.json` holds app metadata
- Set `"uiRevision": 2` in appinfo.json for Enyo apps

Templates in `Current/share/samplecode/enyo/templates/`:
`SinglePane`, `MultiPanel`, `SplitView`.

### Mojo (legacy)

Located at `Current/share/framework/mojo/506/`. The older framework, retained
for backward compatibility.

## Application structure

```
app-directory/
├── appinfo.json          # App metadata and configuration
├── index.html            # Main HTML entry point
├── depends.js            # Dependency declarations
├── icon.png              # App icon
└── source/
    ├── App.js
    └── App.css
```

### appinfo.json fields

- `id` — Unique reverse-DNS identifier (e.g. `com.palm.app.photos`)
- `version` — Version string
- `title` — Display name
- `main` — Entry HTML file (typically `index.html`)
- `type` — Application type (`web` for JavaScript apps)
- `icon` — Icon filename
- `uiRevision` — Set to 2 for Enyo apps
- `vendor` — Publisher name
- `keywords` — Array of keywords for universal search

### Service-based applications

Applications can include JavaScript services for background processing. These
use a `packageinfo.json` at the package level referencing both directories:

```json
{
  "id": "com.example.app",
  "package_format_version": 2,
  "version": "1.0.0",
  "app": "com.example.app",
  "services": ["com.example.app.service"]
}
```

Package with `palm-package app-dir/ service-dir/ package-dir/`.

## Reference applications

Source for core webOS apps is in `Current/share/applications/enyo/`:
`com.palm.app.browser`, `com.palm.app.email`, `com.palm.app.maps`,
`com.palm.app.messaging`, `com.palm.app.notes`, `com.palm.app.photos`.

**Note**: some have missing open source components — see `readme.txt` in that
directory.

## Sample applications

- `Current/share/samplecode/enyo/examples/` — HelloWorld, Maps, Layouts, G11n, Theming, …
- `Current/share/samplecode/enyo/more-examples/` — WebView, Accelerometer, Bluetooth, ZeroConf, …
- `Current/share/samplecode/enyo/templates/` — project templates
- `Current/share/samplecode/mojo/` — BasicService, DB8BingPhonebook, SampleCalendarSync,
  AccountApp, ActivityManager, BluetoothSPPGPS, ZeroConf, and many more

## Key architectural concepts

### webOS services

Applications talk to system services over the `palm://` URL scheme: DB8 database
operations, Bluetooth, GPS/location, calendar and contact syncing, account
management, and background activities.

### Enyo component model

UI is built from `enyo.kind()` definitions inheriting from base kinds such as
`enyo.Control`, `enyo.VFlexBox` and `enyo.HFlexBox`.

### Dependency management

`depends.js` uses `enyo.depends()` to list the JS and CSS files to load — the
standard way to declare dependencies in an Enyo app.

## Version information

- PalmSDK Redux: 0.3
- SDK tools: 3.0.5b38 (`palm-install --version`)
- Enyo framework: 1.0
- Mojo framework: 506
- PDK: symbols only, from the OEM 3.0.5.676 `palmpdk.pkg` (no toolchains)
- novacom / novacomd: built from source in this repo; `novacom -V` reports a
  local build stamp rather than HP's original version number
- Supported device OS: HP webOS 3.0.5 and webOS CE 3.1.0
