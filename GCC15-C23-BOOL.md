# novacomd: gcc 15 / C23 `bool` build break

*Found 2026-10-17, while porting novacomd to Windows. Not yet fixed. This is the
handoff for fixing it on Linux.*

## Summary

novacomd does not compile with gcc 15 or later. gcc 15 defaults to C23
(`-std=gnu23`), and C23 makes `bool`, `true` and `false` keywords.
`novacomd/include/platform.h` defines its own `typedef int bool`, which C23
rejects, and nearly every source file includes that header, so the whole build
fails.

| Platform | Compiler | Default C standard | Builds today? |
| --- | --- | --- | --- |
| Linux with gcc 15 (Fedora 42, Arch) | gcc 15+ | gnu23 | No |
| Linux with gcc 14 or older (Ubuntu 24.04, Debian 12 and 13) | gcc 12–14 | gnu17 | Yes |
| macOS | Apple clang | gnu17 | Yes |
| Windows (MSYS2 UCRT64) | gcc 16 | gnu23 | Yes, only because the Windows makefile branch passes `-std=gnu11` |

This predates the Windows port and is not caused by it. The port only surfaced
it, because it was the first build with a gcc this new.

## Picking this up

This file is on the `windows-novacomd` branch, which also carries the whole
Windows port of novacomd (see [WINDOWS.md](WINDOWS.md), "novacomd on Windows").
So step 2 of the fix below applies on this branch.

To build the Windows side again, on Windows:

1. Install MSYS2: `winget install MSYS2.MSYS2`.
2. Open the **MSYS2 UCRT64** shell (not plain "MSYS2 MSYS").
3. `cd novacomd && ./build.sh`. It installs `make`, `gcc`, `libusb-1.0` and
   `pkgconf` through pacman, then runs `make host`.
4. The output is `novacomd/build-novacomd/novacomd.exe`, linked statically, so
   it needs no DLLs.
5. As Administrator, `novacomd.exe -i` takes over HP's `NovacomD` service and
   `-u` removes it. To run it in a console instead, stop the service first. Or
   run `install-windows.bat`, which does the `-i` step for you if the exe has
   been built.

It still needs HP's novacom driver package (`windows/NovacomInstaller_*.msi`,
which `install-windows.bat` installs). That package provides the WinUSB binding
libusb opens the device through.

## How it was found

MSYS2's MinGW gcc is 16.2, so the Windows makefile branch needed `-std=gnu11`
to build at all. To check that the port hadn't broken the macOS/Linux code
paths, every host source was syntax-checked with MSYS2's POSIX gcc 15.3, which
doesn't define `_WIN32`. Without a `-std` flag, every file fails at the same
line:

```
include/platform.h:67:13: error: 'bool' cannot be defined via 'typedef'
```

To reproduce on Linux with gcc 15 or newer, from a clean checkout:

```bash
cd novacomd
gcc --version                  # 15.x or later
make host                      # fails: 'bool' cannot be defined via 'typedef'
make host CFLAGS=-std=gnu17    # builds: confirms it is the C standard, not the code
```

The last command works because the makefile adds `CFLAGS` after its own flags,
so a later `-std` wins.

## Root cause

The only definition is in `novacomd/include/platform.h`, inside the
`#if PLATFORM_PTHREADS` block, at lines 67–69:

```c
typedef int bool;
#define true 1
#define false 0
```

It is HP's original code, written instead of using `<stdbool.h>`. In C23,
`bool`, `true` and `false` are keywords, so the typedef is a hard error, and the
two `#define`s, though legal, redefine keywords. `platform.h` is pulled in
directly, or through `debug.h` and `buf_queue.h`, so the error stops nearly
every translation unit.

Nothing else defines them. The `novacom` client already uses `<stdbool.h>`
(`novacom/src/main.c`, `novacom/src/packet.c`) and builds cleanly under C23 as
it is.

## What was checked before changing it

Switching to the standard `bool` changes it from a 4-byte `int` to a 1-byte
`_Bool`, and any nonzero value stored in it becomes 1. The sources (host and
device code, 58 uses) were searched for anything that would notice. Nothing
does.

| Risk | Where it would show | Found |
| --- | --- | --- |
| `bool` in a struct sent over USB/TCP or written to disk | `packet_struct.h`, `transport_usb_struct.h`, `novacom.h`, `mux.h` | None. The bools in structs (`novacom_auth_state` in `auth.c`, `active_device` in `main.c`, the control block in `transport_inet.c`) are in memory only |
| A `bool` passed by pointer as `int *` | casts, `bool *` parameters | None |
| A `bool` variable compared with a number, such as `== 2` | `closing`, `inactive`, `tx_squelch`, the auth flags | None |
| A `bool` function returning something other than true/false, such as `-1` | the `auth_*()` functions in `device/auth.c` | None; all return `true`, `false` or another bool |
| Host and device builds disagreeing on its size | the device build (ARM toolchain) | Harmless: no bool crosses the wire, and `<stdbool.h>` exists on every C99 compiler, including the old ARM gcc |

## The fix

Replace the hand-rolled definition with the standard header. That is the whole
source change, and it was tried on a scratch copy before writing this.

1. In `novacomd/include/platform.h`, replace lines 67–69:

    ```c
    typedef int bool;
    #define true 1
    #define false 0
    ```

    with:

    ```c
    #include <stdbool.h>
    ```

    Keep it where it is, inside `#if PLATFORM_PTHREADS`. Both the host and
    device builds define that, and there is no other platform branch any more.
    Under C23, `<stdbool.h>` defines nothing and the keywords take over. Under
    C99/C11/C17 it supplies `bool`, `true` and `false` as before.

2. Drop the workaround in `novacomd/makefile`'s Windows branch: change
   `HOSTCFLAGS += -std=gnu11 -Iinclude/win32 ...` to
   `HOSTCFLAGS += -Iinclude/win32 ...`. With step 1 in, the Windows build links
   under gcc 16's default C23 (tried on the scratch copy). You can make this
   edit on Linux; just mention in the commit that it needs a Windows rebuild to
   confirm.

3. Don't pin `-std=` in the shared flags. Once step 1 is in, nothing in the code
   needs an older standard, and pinning would only hide the next C23 problem.

Suggested commit message:

```
novacomd: use <stdbool.h>, so it builds with gcc 15 (C23)

gcc 15 defaults to -std=gnu23, where bool/true/false are keywords and
platform.h's "typedef int bool" is an error in every file. No bool is
sent over the wire, stored, passed as int *, or compared with a number,
so _Bool is a drop-in replacement.
```

## Verifying on Linux

On a machine with gcc 15 or newer:

```bash
cd novacomd
make clean && make host                      # must build with no -std flag
./build-novacomd/novacomd -V                 # prints the version
make clean && make host CFLAGS=-std=gnu11    # older standards still build
cd ../novacom && make clean && make          # the client, unchanged, also builds
```

Then smoke-test against a device as usual: `novacom -l`, then
`novacom -w run file://bin/cat -- /etc/palm-build-info`.

Done looks like:

- [ ] `make host` succeeds with gcc 15+ and no `-std` flag
- [ ] it still succeeds with `-std=gnu11` (older distros, and the ARM device build)
- [ ] a device lists and answers `run`
- [ ] the Windows makefile branch no longer passes `-std=gnu11`, and a Windows
      rebuild confirms it

Already checked from Windows, with MSYS2's POSIX gcc 15.3 and a stub `<usb.h>`,
so syntax only: with the fix, every novacomd host source compiles under the
default C23 and under gnu11, and the novacom client compiles unchanged under
C23. A real Linux link and a device test are still to do.

Building this branch on Linux is also the first real Linux build of the Windows
port's shared-code changes (`platform_closesocket()` and
friends, the `#ifdef _WIN32` guards, the libusb-0.1 path in `usb-linux.c`). That
has since been done with `-std=gnu17` against a TouchPad and a Lunacy device,
with no regressions against `main`. See
[WINDOWS-PORT-LINUX-REGRESSION.md](WINDOWS-PORT-LINUX-REGRESSION.md). The `bool`
fix itself still needs the Linux build and smoke test above.
