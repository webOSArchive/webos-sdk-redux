# Device detection on webOS CE — the PRODUCT_VERSION_STRING fix

The SDK's `palm-*` tools refuse to talk to a device running **webOS CE 3.1.0**:

```
$ palm-install -l
listing packages on device "topaz-linux" {c37f...fac} usb 63195
palm-install: unrecognized device version
```

Every tool fails the same way — `palm-install`, `palm-launch`, `palm-log`,
`palm-run` — because they all share one version-detection routine, and that
routine only recognizes version strings that Palm and HP shipped in 2011.

## The bug

All the `palm-*` scripts are thin wrappers around
`share/jars/webos-tools.jar`. Before doing anything device-side, each tool
calls `DeviceConnection.getOSVersion()`, which lands in
`com.palm.webos.device.internal.AbstractDeviceConnection.readProductVersion()`.
That method reads `/etc/palm-build-info` off the device and matches
`PRODUCT_VERSION_STRING` against a hard-coded regex:

```java
private static final Pattern PRODUCT_STRING_PATTERN =
    Pattern.compile("^(Palm|HP) webOS\\s+([^\\s]+)\\s*(SDK)?");
```

The vendor prefix is **mandatory**, and only two vendors exist. Compare what the
two OS releases actually report:

```
# HP webOS 3.0.5                    # webOS CE 3.1.0
PRODUCT_VERSION_STRING=HP webOS 3.0.5    PRODUCT_VERSION_STRING=webOS CE 3.1.0
BUILDNAME=Nova-HP-Topaz                  BUILDNAME=Nova-HP-Topaz
BUILDNUMBER=…                            BUILDNUMBER=86
```

The community build dropped the defunct "HP" and added a "CE" marker, so the
string no longer starts with `Palm webOS` or `HP webOS`. The match fails,
`readProductVersion()` falls through to its last line, and the tool dies:

```java
throw new IOException("unrecognized device version");
```

Note this is a *hard* failure, not a fallback — the version is never used for
anything more discriminating than a single `< 1.5.0` check (see below), yet
failing to parse it aborts the whole operation.

### A second, latent bug

The regex that then splits the version into components has a misplaced `+`:

```java
Pattern.compile("^([0-9])+\\.([0-9]+)…")   // ← ([0-9])+ not ([0-9]+)
```

`([0-9])+` matches a run of digits but the capturing group only retains the
**last** repetition, so a two-digit major version collapses to its final digit:
`10.2.1` parses as major `0`. Harmless for every webOS release to date (all
single-digit majors), but it would silently mis-detect a future `webOS CE 10.x`
as older than 1.5.0 — which, per the next section, changes tool behavior.

## Why this is safe to widen

It's worth confirming the parsed version isn't used for fine-grained gating
before loosening the regex. It isn't. Every consumer in the jar —
`AppManager`, `AppStateMonitor`, `PackageManager`, `ServiceManager`,
`DisplayUtil` — asks exactly one question:

```java
boolean preBlowFish = version.compareTo(OSVersion.VERSION150) < 0;
```

That is, "is this older than webOS 1.5.0?" ("Blowfish" was the 1.5 release
codename.) There is no upper bound and no per-version branching, so 3.1.0 takes
precisely the same path 3.0.5 already did. Widening the regex changes device
detection and nothing else.

## The fix

Two string constants, no bytecode:

| | |
|---|---|
| **Product string, was** | `^(Palm\|HP) webOS\s+([^\s]+)\s*(SDK)?` |
| **Product string, now** | `^(.*?\bwebOS(?:\s+CE)?)\s+v?([^\s]+)\s*(SDK)?` |
| **Version number, was** | `^([0-9])+\.([0-9]+)(\.([0-9]+)){0,1}(\.([0-9]+)){0,1}` |
| **Version number, now** | `^([0-9]+)\.([0-9]+)(\.([0-9]+)){0,1}(\.([0-9]+)){0,1}` |

The new product regex makes the vendor prefix optional and free-form, accepts an
optional `CE` marker and an optional `v` on the version itself. Group 1 still
soaks up the whole product name, so **groups 2 and 3 keep meaning "version" and
"SDK"** — which matters, because the compiled bytecode indexes those groups by
number.

Behavior across every string either OS family has shipped, plus plausible future
ones:

| `PRODUCT_VERSION_STRING` | Before | After |
|---|---|---|
| `webOS CE 3.1.0` | **unrecognized** | 3.1.0 |
| `HP webOS 3.0.5` | 3.0.5 | 3.0.5 |
| `HP webOS 3.0.5 SDK` | 3.0.5 SDK | 3.0.5 SDK |
| `Palm webOS 1.4.5` | 1.4.5 | 1.4.5 |
| `Palm webOS 1.3.5.1` | 1.3.5.1 | 1.3.5.1 |
| `Palm webOS 2.1.0 SDK` | 2.1.0 SDK | 2.1.0 SDK |
| `Open webOS 1.0.0` | **unrecognized** | 1.0.0 |
| `webOS CE 3.1.0 SDK` | **unrecognized** | 3.1.0 SDK |
| `webOS CE 10.2.1` | **unrecognized** | 10.2.1 |
| `webOS 4.0` | **unrecognized** | 4.0 |
| `garbage string` | unrecognized | unrecognized |

Garbage is still rejected, so a genuinely unreadable device still produces the
original error rather than a bogus 0.0.0.

## Lunacy, by name

[Lunacy](https://github.com/webOSArchive/Lunacy) runs webOS apps on Android and
reaches these tools through novacomd ([LUNACY.md](LUNACY.md)). It says what it is
rather than posing as a webOS device:

```
PRODUCT_VERSION_STRING=Lunacy 0.5.5
```

Its version is Lunacy's, not webOS's, and parsing it as one would be wrong in the
one way that matters: `0.5.5` is older than 1.5.0, which would send every tool
down the pre-Blowfish paths. So the product regex recognises Lunacy by name and
lets group 2 (the "version") take the word `Lunacy` itself:

| | |
|---|---|
| **Product string, 0.3** | `^(.*?\bwebOS(?:\s+CE)?)\s+v?([^\s]+)\s*(SDK)?` |
| **Product string, now** | `^(.*?\bwebOS(?:\s+CE)?\s+v?\|(?=Lunacy\b))([^\s]+)\s*(SDK)?` |

`Lunacy` doesn't parse as a number, and `readProductVersion()` already answers
1.5.0 for a recognised product whose version doesn't parse. Every webOS string in
the table above parses exactly as before; `LunacyX 1.0` and garbage are still
unrecognized. Still two string constants, no bytecode; the script replaces either
HP's original or the 0.3 constant.

## Applying it

No source for `webos-tools.jar` survives, so the fix is applied by rewriting the
two regex constants in the class file's constant pool. `patch-webos-tools-version.py`
does this — it edits `CONSTANT_Utf8` entries only, leaving all bytecode and every
other jar entry byte-for-byte identical:

```bash
./patch-webos-tools-version.py            # apply (idempotent)
./patch-webos-tools-version.py --check    # report status, change nothing
./patch-webos-tools-version.py --backup   # keep <jar>.orig alongside
```

The jar in this repo is **already patched**; the script is checked in so the
change stays auditable and can be re-applied to a pristine jar from elsewhere.
To revert:

```bash
git checkout -- Current/share/jars/webos-tools.jar
```

Verify the result by decompiling before and after (e.g. with
[CFR](https://www.benf.org/other/cfr/)) — the only difference across the entire
jar is the two `Pattern.compile(…)` lines in `AbstractDeviceConnection`.

## Hot-swapping the jar onto an existing install

The jar is entirely self-contained and version-agnostic — the `palm-*` scripts
just `java -jar` it — so patching an already-installed SDK needs no reinstall
and no restart. There are only two copies that matter:

| | Path |
|---|---|
| **This repo** (patched) | `Current/share/jars/webos-tools.jar` → `0.3/share/jars/webos-tools.jar` |
| **Installed SDK** | `<SDK_INSTALL_DIR>/Current/share/jars/webos-tools.jar` |

`<SDK_INSTALL_DIR>` is whatever was chosen at install time — `/opt/PalmSDK`
(default), `/usr/local/PalmSDK`, or `/opt/homebrew/PalmSDK`. Confirm which one a
given machine uses with:

```bash
readlink -f "$(command -v palm-install)"
```

To patch an installed SDK in place, point the script at it:

```bash
./patch-webos-tools-version.py --check  /opt/PalmSDK/Current/share/jars/webos-tools.jar
sudo ./patch-webos-tools-version.py     /opt/PalmSDK/Current/share/jars/webos-tools.jar
```

Or just drop this repo's jar over it — same result, and it doesn't need Python
on the target machine:

```bash
sudo cp Current/share/jars/webos-tools.jar /opt/PalmSDK/Current/share/jars/webos-tools.jar
```

`--check` is safe to run against any jar and tells you whether that copy is
already patched, which makes it easy to sweep a fleet of dev machines.

## Verified against hardware

Round-tripped on an HP TouchPad running webOS CE 3.1.0 over USB novacom:

```
$ novacom -w run file://bin/cat -- /etc/palm-build-info
PRODUCT_VERSION_STRING=webOS CE 3.1.0
BUILDNAME=Nova-HP-Topaz
BUILDNUMBER=86

$ palm-package hw/ && palm-install com.palmdts.enyo.helloworld_1.0.0_all.ipk
$ palm-launch com.palmdts.enyo.helloworld
$ palm-log com.palmdts.enyo.helloworld
$ palm-install -r com.palmdts.enyo.helloworld
```

`palm-package`, `palm-install` (install, list, remove), `palm-launch` and
`palm-log` (list and retrieve) all succeed where they previously stopped at
`unrecognized device version`.
