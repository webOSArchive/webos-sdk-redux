# Windows port: Linux regression results

*Tested 2026-10-18, on the `windows-novacomd` branch.*

The Windows port of novacomd (commit `75d80d5`, "novacomd: build and run natively
on Windows") changes code shared with macOS and Linux. This records an A/B test
of that commit against `main` (`5d77edc`) on Linux, with real devices attached.

**Result: no Linux regressions.** In every test, the branch build and the `main`
build gave the same results. Every failure seen was on both builds and is older
than the port. The failures are listed under "Pre-existing issues found".

## Setup

| | |
| --- | --- |
| Host | Ubuntu, kernel 7.0.0, gcc 15.2.0, OpenJDK 21, novacom client `novacom-21` |
| USB device | HP TouchPad (`0830:8072`, `topaz-linux`), webOS CE 3.1.0 |
| Lunacy device | Samsung SM-F966U1 over adb, Lunacy with novacom support |
| Builds | `main` and `windows-novacomd`, each exported with `git archive` and built with `make host CC="gcc -std=gnu17"` (see [GCC15-C23-BOOL.md](GCC15-C23-BOOL.md)) |

The host normally runs HP's 2011 novacomd (`/opt/Palm/novacom/novacomd`, via
`palm-novacomd.service`). That service was stopped for each test run and started
again afterwards, so the two builds under test had the device to themselves.

Runs alternated between the builds (branch, main, branch, …) so that a failure
caused by run order, not by the build, would show up on both.

## Build

| | `main` | branch |
| --- | --- | --- |
| `make host` (with `-std=gnu17`) | builds | builds |
| Warnings | 1: `-Wimplicit-fallthrough` in `src/novacom/packet.c` | the same one |
| USB library linked | libusb-0.1 (`usb_open`, `usb_bulk_read`, …) | libusb-0.1. The libusb-1.0 backend is only compiled with `USB_LIBUSB1`, which only the Windows makefile branch sets |

Linux files the port leaves alone: `novacomd/install-linux.sh`,
`novacomd/uninstall-linux.sh`, `install.sh`, `uninstall.sh`, `novacom/`,
`0.4/bin/` (bash scripts), `0.4/install-sdk-linux.sh`, `pdk/` and `novacom-tcp/`.

## Code review of the shared changes

On Linux, every change to the shared C files is either inside an `#ifdef _WIN32`
block or does exactly what the old code did:

- `platform_closesocket()` is `close()`, `platform_socket_cloexec()` is
  `fcntl(F_SETFD, FD_CLOEXEC)`, and `platform_socket_nonblock()` is
  `fcntl(F_SETFL, … | O_NONBLOCK)`. These are the calls they replace.
- `platform_socket_getlasterrno()` is `errno`, and `E_SOCKET_WOULDBLOCK` is
  `EWOULDBLOCK`. On Linux that is the same value as the `EAGAIN` it replaces in
  `log.c` and `main.c`.
- `platform_init()` now calls `platform_init_socket()`, which does nothing off
  Windows.
- `novacomopt()` now returns 1 rather than calling `exit(0)` when another
  novacomd holds the ports, and `main()` returns 0. That is the same exit status.
  The extra `platform_closesocket(optsock)` added beside it closes a socket that
  is still open, because the block above it that would close it is `#if 0`.
- `tokenstorage.c` buffers grew from 128 bytes to `PATH_MAX`. On Linux the path
  is still built from `getpwuid()`.
- `commands_device.c` and `packet.c` only add `!defined(_WIN32)` guards.

## Results

### TouchPad over USB

Five alternating runs: branch, main, branch, main, branch.

| Test | `main` | branch |
| --- | --- | --- |
| Listed by `novacom -l` | ~0.21 s | ~0.21 s |
| `run file://bin/cat -- /etc/palm-build-info` | pass | pass |
| stdin to a device command | pass | pass |
| `put`, then `get`, of 12.8 MB random data, compared with `cmp` | pass | pass |
| 12.8 MB `get` time | 2.3–3.3 s | 2.3–3.3 s |
| 8 concurrent `run` channels | pass | pass |
| `get` concurrent with 4 `run`s | pass | pass |
| Second novacomd prints "Cannot start novacomd twice!", exits 0, first keeps serving | pass | pass |
| `palm-install -l`, `palm-log -l` (Java tools, via `127.0.0.1:6968`) | pass | pass |
| `-d` daemonizes and serves the device | pass | pass |
| SIGTERM exits | 143 | 143 |

In the very first pass, the branch build's suite failed straight after attaching
(`Got RESET packet ... restart`, then `unable to find device`). It had started
seconds after `main`'s `-d` instance was killed. In the five-run pass, `main`
failed the same way in run 2, in the same position, and the branch passed all
three of its runs. See "Stale USB session after a restart" below.

### Lunacy over adb

Four alternating runs, all commands with `-d lunacy`, while the TouchPad was
unplugged.

| Test | `main` | branch |
| --- | --- | --- |
| Listed as `adb lunacy` | ~0.21 s | ~0.21 s |
| `run file:///bin/cat -- /etc/palm-build-info` gives `PRODUCT_VERSION_STRING=Lunacy …` | pass | pass |
| stdin to a device command | pass | pass |
| `put`/`get` of 12.8 MB to `/tmp`, compared with `cmp` | pass | pass |
| 12.8 MB `get` time | ~0.37 s | ~0.37 s |
| 8 concurrent `run` channels | pass | pass |
| `get` concurrent with 4 `run`s | pass | pass |
| `palm-install -d lunacy -l`, `palm-log -d lunacy -l` | pass | pass |

### TouchPad and Lunacy together

Four alternating runs, with both devices attached.

| Test | `main` | branch |
| --- | --- | --- |
| TouchPad listed first; `novacom run` with no `-d` reaches the TouchPad | pass | pass |
| 4 TouchPad and 4 Lunacy `run`s at the same time, each output checked | pass | pass |
| `-A`: TouchPad listed, Lunacy not, after 8 s of adb scan intervals | pass | pass |
| `-A`: `-d lunacy` unreachable, `-d usb` still reachable | pass | pass |

## Not covered

- **The device-side build** (ARM novacomd, `make device`). There is no
  cross-compiler on the test host. The port's changes there are only
  `!defined(_WIN32)` guards.
- **macOS.** Its makefile branch is unchanged, and it shares the libusb-0.1
  path tested here, but it was not built.
- **Novacom over TCP** (`-c`, `novacom-tcp/`). `transport_inet.c` only had its
  `close`/`fcntl` calls replaced with the helpers above.

## Pre-existing issues found

None of these come from the Windows port. Each happened on `main` too.

### gcc 15 cannot build novacomd

`make host` fails with gcc 15 or newer, because its default C23 rejects
`platform.h`'s `typedef int bool`. Both builds here needed `-std=gnu17`. The fix
is in [GCC15-C23-BOOL.md](GCC15-C23-BOOL.md).

### Stale USB session after a restart

If a novacomd is killed and another starts within a few seconds, the TouchPad
can still be holding the old session. The new daemon lists the device, then gets
a `RESET` and drops it, and commands fail with `unable to find device` for a
while. Waiting for a `run` to succeed before testing avoids it. This is close to
the Windows session-id problem the port fixes with `rand_s()`. On Linux,
`platform_init()` seeds `rand()` with `srand(time(NULL))`, so session ids
differ between runs. The cause is different, but the symptom matches.

### novacom does not pass exit codes back

`novacom run file://bin/sh -- -c "exit 3"` never exits with 3. Against Lunacy it
exits 0. Against the TouchPad the exact code was not recorded, only that it was
not 3. This is the same with both daemons, so the cause is the `novacom` client
or the device side, not novacomd. It was not investigated further.

### `/proc/nduid` inside Lunacy

[LUNACY.md](LUNACY.md) says Lunacy reports its nduid "as a webOS device does
(`/proc/nduid`)". Inside Lunacy's webOS root, `cat /proc/nduid` fails with
"No such file or directory", but novacomd still lists the device with an nduid.
The doc's wording may be out of date.

## Reproducing

1. Build both trees with gcc 15, e.g. `make host CC="gcc -std=gnu17"`.
2. `sudo systemctl stop palm-novacomd.service`.
3. Start one build in the foreground as root. Wait until
   `novacom -d usb run file://bin/true` succeeds, not just until the device is
   listed.
4. Run the tests above. Kill the build, wait for ports 6968, 6970 and 6971 to
   free, then start the other build.
5. `sudo systemctl start palm-novacomd.service` when done.
