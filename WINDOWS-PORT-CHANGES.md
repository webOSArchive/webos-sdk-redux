# Windows port: what changed

*The `windows-novacomd` branch, 2026-10-17 to 18, against `main` (`5d77edc`).*

**Windows now runs this repo's own novacomd**, built from the same sources as
macOS and Linux, in place of HP's 2011 daemon. That gives Windows what `main`
only gave macOS and Linux: Lunacy devices over adb. Windows also gets a setup
wizard, and the batch installer needs nothing compiled.

## Why it was needed

On `main`, `install-windows.bat` installs HP's 2011 `novacomd.exe` from HP's
MSI. The Lunacy support added in `f356bd0` lives in novacomd
(`novacomd/src/host/adb_relay.c`) and in `webos-tools.jar`. Windows got the jar
half and never the daemon half, so Lunacy was never listed. `LUNACY.md` on
`main` says so: "Windows: the SDK there uses HP's novacomd, which knows nothing
of adb."

Checked on Windows 11 with a Samsung SM-F966U1 running Lunacy 0.8.0 on adb and a
Palm Pre 3 on USB, each daemon running as the `NovacomD` service:

| Daemon | adb/Lunacy strings in the exe | `novacom -l` | `novacom -d lunacy run` |
| --- | --- | --- | --- |
| HP's, from `main`'s MSI (amd64, 2011-06-24) | 0 | Pre 3 only | `unable to find device` |
| HP's, from HP's SDK (x86, 2011-09-19) | 0 | Pre 3 only | `unable to find device` |
| this branch's | 5 | Pre 3 and `adb lunacy` | `PRODUCT_VERSION_STRING=Lunacy 0.8.0` |

A fresh install of the 0.4 release also listed no Lunacy device. Meanwhile
Lunacy answered directly, through
`adb forward tcp:46970 localabstract:org.webosarchive.lunacy.novacomd`, with
`get` and `run` both exiting 0. Lunacy was fine; Windows was missing the daemon
that relays to it.

## What changed

### novacomd builds and runs on Windows (`75d80d5`)

- **One source tree.** `novacomd/include/win32/` stands in for the POSIX socket
  headers (`<sys/socket.h>`, `<poll.h>`, `<syslog.h>`, `<sys/queue.h>`, …), so
  shared files keep their includes. What Winsock spells differently goes through
  `platform_closesocket()`, `platform_socket_cloexec()` and
  `platform_socket_nonblock()`.
- **USB through libusb-1.0** (`USB_LIBUSB1`, beside the 0.1 code in
  `host/usb-linux.c`), over the WinUSB binding of HP's driver package. No Zadig
  or libwdi step is needed.
- **A Windows service** (`host/service_win32.c`) replaces daemonizing.
  `novacomd -i` registers it under HP's name, `NovacomD`, and `-u` (or HP's `-d`)
  removes it.
- **Fixes found on the way:**
  - Listen sockets use `SO_EXCLUSIVEADDRUSE`, because Winsock's `SO_REUSEADDR`
    lets two daemons share a port.
  - Session ids come from `rand_s()`. The Windows CRT seeds `rand()` per thread,
    so every process's first USB session was 41, and a device still holding
    session 41 never re-synced.
  - `-i` waits for the old service's process to exit.
  - A failed USB open is logged.
  - `hexdump8` no longer truncates pointers on 64-bit.
- **Build:** MSYS2 UCRT64, `novacomd/build.sh`, linked statically.
- **Also:** `GCC15-C23-BOOL.md` records a break that predates the port and
  directs its fix: gcc 15's C23 rejects `platform.h`'s `typedef int bool` on
  Linux.

### Ready to install

- **`e08ca99`:** `windows/novacomd.exe` is committed, so nobody has to build it.
  It's x64, stripped, stamped `novacomd-redux-0.4-75d80d5`, with SHA-256
  `a2a61ae20494e97c2e6ba199766fbaa81d0a169a1c16a6081f01a4ec84520ba8`.
  `install-windows.bat` installs it as the service, keeping HP's driver. It saves
  HP's registration first, and `uninstall-windows.bat` hands the service back.
- **`80e5cf1`, `8392409`:** a setup wizard built with Inno Setup
  (`installer-windows/`):
  - components to choose;
  - a Java page that links to Eclipse Temurin and can install it;
  - an entry in Settings → Apps, and a Start menu folder;
  - detection of earlier installs: upgrade, reinstall, refuse a downgrade, take
    over a batch install, skip a driver that's already installed, and put this
    SDK's `palm-*` ahead of HP's original SDK on the `PATH`.

  HP's service registration is kept in the registry, outside the install folder.
  The wizard is not committed; `installer-windows/build.ps1` builds it.

### Docs

- **`f95671b`:** the Linux A/B regression results:
  [WINDOWS-PORT-LINUX-REGRESSION.md](WINDOWS-PORT-LINUX-REGRESSION.md).
- **`0d07bc6`, `2264759`:** `README.md`, `WINDOWS.md`, `LUNACY.md` and
  `CLAUDE.md` describe the port. The stated gains are Lunacy and a buildable
  daemon. The TCP fix in `NOVACOM-TCP.md` most likely never mattered on Windows,
  since Winsock ignores `SO_RCVLOWAT`.

## Tested

On Windows 11 (build 26200):

| | |
| --- | --- |
| HP TouchPad, webOS CE 3.1.0 | `run`, 12.8 MB `get`/`put` with matching checksums, 6 concurrent commands, `palm-install`; in a console and as the service; reattached after the daemon was killed |
| Palm Pre 3, HP webOS 2.2.4 | through the service: `run`, `palm-install -l`, 15 MB `get`/`put` with matching checksums |
| Lunacy 0.8.0 over adb | through the service, beside the Pre 3: listed, `run`, 12 MB round trip with matching checksums, `palm-install -d lunacy -l`, 3 + 3 concurrent commands |
| `install-windows.bat` | run end to end; its uninstaller's hand-back run on its own |
| Setup wizard | silent install, uninstall and reinstall; an upgrade, a reinstall, a refused downgrade and a batch takeover; clicked through by hand |
| Linux | A/B against `main` with a TouchPad and Lunacy: no regressions |

## Not done or not tested

- **The Java download in the wizard:** the test PC already had Java. The
  Adoptium link was checked to resolve to the Temurin 21 JRE `.msi`.
- **Driver install on a machine that never had it:** untested on Windows 10/11.
- **Not tried:** TCP to a device on Windows, unplug and replug while connected,
  Windows 10, and 32-bit Windows (which keeps HP's daemon).
- **Unsigned:** `novacomd.exe` and the setup `.exe` are unsigned. SmartScreen
  warns on first run.
- **The `novacom` client is still HP's on Windows.**
- **The gcc 15 fix is not applied:** see `GCC15-C23-BOOL.md`.

## Also found, on Linux

- **A device can hold a stale USB session** after a quick daemon restart; see
  the regression notes.

## Releasing the wizard

```
powershell -ExecutionPolicy Bypass -File installer-windows\build.ps1
```

That produces `installer-windows\Output\webOS-SDK-Redux-0.4-Setup.exe` (76 MB),
the file to attach to a release. The build tested here had SHA-256
`17af6cf2cff3b0dedba0f0014902fd77c5ea00cd6a0e46643ffa680f058adb4e`; a rebuild
prints its own.
