# Lunacy devices

[Lunacy](https://github.com/webOSArchive/Lunacy) runs legacy webOS apps on Android. It
serves the device side of novacom, so this SDK's tools work with it as they work with a
TouchPad or a Pre: `novacom`, `novaterm`, `palm-install`, `palm-launch`, `palm-run` and
`palm-log`.

```
$ novacom -l
44079 c37f7a3418b2688e6d933844b48ba803061b4fac usb topaz-linux
44815 39bda514d848b5d5710752050a8920c7b7ff5c1f adb lunacy

$ palm-install -d lunacy com.example.app_1.0.0_all.ipk
$ palm-launch -d lunacy com.example.app
$ palm-log -d lunacy -f com.example.app
```

## What you need

- **A Lunacy build with novacom support** (the first release after 0.5.5) on the Android
  device, running.
- **adb**, with the device attached and authorised (`adb devices` lists it as `device`), over
  USB or Wi-Fi. Turning on USB debugging is Android's equivalent of webOS's developer mode.
- **This SDK's novacomd and novacom**, built from this repo, and **its `webos-tools.jar`**,
  which recognises Lunacy (below). An installed SDK's jar can be brought up to date in place
  with `patch-webos-tools-version.py <path to the jar>`.

There is nothing to configure. novacomd asks the adb server you already run (127.0.0.1:5037,
or `ADB_SERVER_SOCKET` / `ANDROID_ADB_SERVER_PORT`) every few seconds which devices are
attached, and lists every one whose Lunacy answers. It never starts an adb server itself, so
with none running there are simply no Lunacy devices. `novacomd -A` (`--no-adb`) turns the
search off.

A device attached over both USB and Wi-Fi adb is listed once: devices are told apart by their
nduid, which Lunacy reports as a webOS device does (`/proc/nduid`).

## Choosing the device

Lunacy devices are listed after USB and TCP devices, with the connection type `adb` and the
device type `lunacy`. With a TouchPad also attached, the tools still default to the
TouchPad, as they always have; pick Lunacy with `-d`:

| | |
|---|---|
| `-d lunacy` | the first Lunacy device |
| `-d adb` | the same, by connection type |
| `-d <nduid>` or `-d <port>` | one Lunacy device among several |

## How it works

On the Android device, Lunacy listens on the abstract socket
`org.webosarchive.lunacy.novacomd` and speaks the protocol a device's novacomd speaks on a
channel: a command line (`run file://…`, `get file://…`, `put file://…`, `open tty://0`), then
`ok 0` and the packet stream. It serves only peers running as root or as adb's shell user, so
no other Android app can use it.

On the host, novacomd (`novacomd/src/host/adb_relay.c`) gives each Lunacy device a port, as
it does a USB device, and splices each client connection to that port, byte for byte, to a
stream the adb server opens to Lunacy's socket. Nothing is added to the novacom protocol, and
nothing in the tools changes except the device check below.

The novacom client here also tolerates a packet whose payload arrives after its header
(`novacom/src/packet.c`). On a USB device the two always arrive together; through adb they
can be split, and the stock client took that for the connection closing.

Commands run in Lunacy's webOS root: `/bin` and `/usr/bin` are busybox, `/usr/bin/luna-send`
calls Lunacy's bus on the private bus, as root's did, and `/var/log/messages` holds every
app's console output in webOS's format, which is what `palm-log` reads. Inside Lunacy a
command has Lunacy's own Android permissions, not root's.

## The device check

Every tool reads `/etc/palm-build-info` first. Lunacy's says what it is:

```
PRODUCT_VERSION_STRING=Lunacy 0.5.5
BUILDNAME=Lunacy
BUILDNUMBER=153
```

The tools only ever ask whether a device is older than webOS 1.5, and Lunacy's version is
not a webOS version, so `webos-tools.jar` recognises Lunacy by name and treats it as 1.5 or
later. `patch-webos-tools-version.py` applies this along with the webOS CE fix; see
[SDK-VERSION-DETECTION.md](SDK-VERSION-DETECTION.md).

## What isn't there

- The webOS root is not a chroot. Paths in a command's arguments are pointed into it (so
  `novacom run file:///bin/cat -- /etc/palm-build-info` reads Lunacy's), but paths inside a
  script file you copy over and run are not, and `pwd` shows the Android path.
- `connect tcp-port://` (port forwarding, used by the debugger) answers `unrecognized
  command`. Use Chrome's DevTools (`chrome://inspect`) on Lunacy's cards instead.
- `palm-log --system-log-level` sets a level on webOS's log daemon, which Lunacy hasn't got;
  it fails with the bus's own error.
- Windows: the SDK there uses HP's novacomd, which knows nothing of adb.
