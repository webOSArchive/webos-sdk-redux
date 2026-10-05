# Windows support

Windows gets a batch installer rather than a GUI. It covers the same three
pieces the Unix installers do — SDK, novacom, PDK — with one important
difference: **novacom is not built from source on Windows.** It comes from HP's
original MSI, which is committed to `windows/`.

```
install-windows.bat            :: run from the repo root, elevated (Administrator)
```

Options: `/y` (no prompts), `/sdkdir <path>`, `/nopdk`, `/nonovacom`.

| Component | Lands at |
|---|---|
| SDK | `%ProgramFiles%\PalmSDK\<version>`, with a `Current` junction |
| `palm-*` commands | `%ProgramFiles%\PalmSDK\Current\bin`, added to the system PATH |
| novacom driver + `novacomd.exe` | `%ProgramFiles%\Palm, Inc\novacomd` (placed by the MSI) |
| PDK | `C:\PalmPDK` |

Open a **new** terminal afterwards so the PATH change is visible, then
`palm-install --version`.

## How the pieces fit together

The important structural fact, which shapes everything else: **the Java tools
never shell out to a `novacom` binary.** They open a TCP connection to novacomd
on `127.0.0.1:6968` (`Novacom.DEFAULT_HOST` / `DEFAULT_PORT` in the jar) and
speak the protocol directly.

That means the SDK half of Windows support is trivial and the driver half is
everything:

- `webos-tools.jar` is **pure Java with zero native libraries** and no
  OS-specific code paths, so each `palm-*` command is one `java` invocation.
- Anything that makes port 6968 answer will satisfy the SDK. On Windows that is
  `novacomd.exe`, which needs the USB driver underneath it.

## The `palm-*.bat` launchers

`0.4/bin/palm-*.bat` sit alongside their bash equivalents. Each one is a
wrapper around a single command:

```bat
java -Dpalm.command=palm-install -jar "...\share\jars\webos-tools.jar" %*
```

The jar reads `palm.command` (`Shell.java`) and looks it up in
`command.properties`, which maps the seven commands (`palm-generate`,
`palm-package`, `palm-install`, `palm-launch`, `palm-log`, `palm-help`,
`palm-run`). `palm-worm` is the exception: it drives `worm.jar` with a larger
heap.

Shared Java detection lives in `palm-common.bat`, which each launcher `call`s.
It looks for `java` on PATH, falls back to `%JAVA_HOME%`, and requires major
version 8 or greater — the same contract as the bash scripts. There is no
Cygwin-style path translation, because a native batch file already runs with
native Windows paths.

These were written from the bash scripts and the jar's own dispatch table, not
extracted from HP's Windows SDK: that installer is an InstallShield
ISSetupStream archive whose payload is individually compressed, and neither
7-Zip nor unshield can open it. Nothing was lost by rebuilding them — the
invocation is fully determined by `command.properties` and `Shell.java`.

## The novacom driver

`windows/NovacomInstaller_{x86,x64}.msi` are HP's originals, dated 25 Jun 2011.
The installer picks the right one for the machine's architecture and runs
`msiexec /i ... /passive /norestart`.

What the MSI actually does, since none of it is obvious from the outside:

- Installs `novacom.inf`, `novacom.cat`, `novacomd.exe`, `dpinst.exe` and the
  WinUSB/UMDF co-installers, plus the VC++ 2005 (`msvcr80`) runtime that
  `novacomd.exe` links against.
- Runs `dpinst.exe -lm -sw` to install the driver package.
- Registers the daemon by invoking **`novacomd.exe -i`** — not through an MSI
  `ServiceInstall` entry, so the MSI has no `ServiceInstall` or `ServiceControl`
  table at all. Removal is `novacomd.exe -d`.

**There is no third-party kernel driver.** `novacom.inf` binds Palm's USB IDs
(VID `0830`, the various TouchPad and Pre PIDs) to Microsoft's in-box
`WinUSB.sys`:

```
Include = WinUSB.inf
Needs   = WinUSB.NT
AddService = WinUSB, 0x00000002, WinUSB_ServiceInstall
ServiceBinary = %12%\WinUSB.sys
```

That matters for whether it still installs on modern Windows. The only kernel
binary involved is Microsoft's own, which is always trusted; the `.cat` is used
for driver-package integrity during PnP install, not to authorise loading a
third-party kernel module.

The catalog is signed by **Microsoft** through the WHQL programme:

```
Subject: CN=Microsoft Windows Hardware Compatibility Publisher, OU=MOPR, O=Microsoft Corporation
Issuer : CN=Microsoft Windows Hardware Compatibility PCA
Digest : SHA1
Timestamp: 11 Mar 2011
```

So it is about as well-signed as a 2011 driver package can be — not a
self-signed or expired third-party certificate. The residual risk is the
**SHA-1** digest: modern Windows distrusts SHA-1 code signatures, generally for
anything timestamped after the 2016 cutoff. This one is countersigned in 2011,
which is on the permissive side of that line, but Windows 11 in particular may
still refuse it.

**This has not been verified on real hardware.** If Windows rejects the driver,
the SDK half still installs and works fine — you simply have no way to reach a
device, because nothing will be listening on 6968.

After installing, the script probes that port and tells you what it found. It
checks the port rather than a service name deliberately: the port is the actual
contract the SDK depends on, and the service name is not discoverable from the
MSI, since novacomd registers itself.

## The PDK

`C:\PalmPDK` receives `include\`, `device\` and `share\`. `pdk\bin\` is skipped
— those helpers (`pdk-device-install`, `pdk-ssh-init`) are bash scripts.

As on macOS and Linux, **no compiler is included**; see [PDK.md](PDK.md). The
bundled samples' build scripts are Unix shell and will not run under `cmd`
either, so on Windows the PDK is headers and ARM device libraries for your own
toolchain, nothing more.

## Uninstalling

```
uninstall-windows.bat
```

Removes the SDK, the PATH entry, and the PDK components this repo installed
(leaving anything else under `C:\PalmPDK` alone). It deliberately does **not**
remove novacom: that came from an MSI, so removing it by hand would leave the
Windows installer database inconsistent. Uninstall "Palm Novacom" from
Settings → Apps, or `msiexec /x NovacomInstaller_<arch>.msi`.

## Known gaps

- The driver's SHA-1 WHQL signature is untested on Windows 10/11.
- `novacomd.exe` is unsigned. Only the driver catalog carries a signature.
- novacom over TCP (see [NOVACOM-TCP.md](NOVACOM-TCP.md)) uses the Unix
  novacomd; the Windows binary is HP's 2011 build and predates that fix.
- The installer has been syntax- and logic-checked, and its PowerShell fragments
  were executed directly, but the batch files themselves have not been run on
  Windows.
