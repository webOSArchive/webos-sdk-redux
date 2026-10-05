#!/usr/bin/env python3
"""
Teach webos-tools.jar to recognize modern webOS version strings.

Every palm-* CLI tool resolves the connected device's OS version in
com.palm.webos.device.internal.AbstractDeviceConnection.readProductVersion(),
which reads PRODUCT_VERSION_STRING out of /etc/palm-build-info on the device
and matches it against two hard-coded regexes. The stock product regex only
accepts strings that begin with "Palm webOS" or "HP webOS":

    ^(Palm|HP) webOS\\s+([^\\s]+)\\s*(SDK)?

webOS CE 3.1.0 reports

    PRODUCT_VERSION_STRING=webOS CE 3.1.0

which has no vendor prefix, so the match fails and readProductVersion() throws
"unrecognized device version" -- every palm-install / palm-launch / palm-log
against a CE device dies there.

Lunacy (https://github.com/webOSArchive/Lunacy), which runs webOS apps on
Android, says what it is rather than posing as a webOS device:

    PRODUCT_VERSION_STRING=Lunacy 0.5.5

The product regex also recognises that by name. Lunacy's own version number is
not a webOS version, so for Lunacy the regex captures the word "Lunacy" as the
"version"; that doesn't parse as a number, and readProductVersion() falls back
to 1.5.0, which is all the tools ever ask about (see SDK-VERSION-DETECTION.md).

No source for the jar survives, so this script rewrites the two regex string
constants directly in the class file's constant pool. Only the CONSTANT_Utf8
bytes change; no bytecode is touched, and the capturing-group numbering the
bytecode indexes into (group 2 = version, group 3 = "SDK") is preserved.

Usage:
    ./patch-webos-tools-version.py [--check] [--backup] [path/to/webos-tools.jar]

With no path, it patches this repo's own jar (via the Current symlink). Pass a
path to patch an already-installed SDK instead, e.g.

    ./patch-webos-tools-version.py /opt/PalmSDK/Current/share/jars/webos-tools.jar

Restore an unpatched jar in the repo with:
    git checkout -- Current/share/jars/webos-tools.jar
"""

import argparse
import os
import shutil
import sys
import zipfile

CLASS_ENTRY = "com/palm/webos/device/internal/AbstractDeviceConnection.class"
# Resolve through the repo's "Current" symlink so this keeps working across SDK
# version bumps (0.2 -> 0.3 -> …) without editing the script.
DEFAULT_JAR = os.path.join(
    os.path.dirname(os.path.abspath(__file__)), "Current", "share", "jars", "webos-tools.jar"
)

# (description, earlier constants, replacement constant)
#
# These are the raw regex bytes as they appear in the constant pool, i.e. the
# *value* of the Java string literal -- backslashes are literal here. The
# earlier constants are every version this script has ever replaced, oldest
# first, so a jar patched by an earlier release is brought up to date too.
REPLACEMENTS = [
    (
        "product string",
        [
            # HP's original.
            rb"^(Palm|HP) webOS\s+([^\s]+)\s*(SDK)?",
            # 0.3: any vendor prefix (or none) ahead of "webOS", an optional "CE"
            # and an optional "v" on the version (webOS CE 3.1.0).
            rb"^(.*?\bwebOS(?:\s+CE)?)\s+v?([^\s]+)\s*(SDK)?",
        ],
        # As 0.3, or "Lunacy" by name: the lookahead alternative leaves group 1
        # empty and lets group 2 (the version) take the word "Lunacy" itself,
        # which the version regex can't parse, so the device is treated as 1.5.0
        # or later. Groups 2 and 3 keep meaning version and "SDK".
        rb"^(.*?\bwebOS(?:\s+CE)?\s+v?|(?=Lunacy\b))([^\s]+)\s*(SDK)?",
    ),
    (
        "version number",
        # `([0-9])+` captures a single digit repeatedly, so group 1 ends up
        # holding only the LAST digit of the major version: "10.2.1" parses as
        # major 0. `([0-9]+)` captures the whole run. Same length, so this is a
        # free fix; it is a no-op for every single-digit-major webOS release.
        [rb"^([0-9])+\.([0-9]+)(\.([0-9]+)){0,1}(\.([0-9]+)){0,1}"],
        rb"^([0-9]+)\.([0-9]+)(\.([0-9]+)){0,1}(\.([0-9]+)){0,1}",
    ),
]


def utf8_constant(value):
    """Encode a CONSTANT_Utf8_info entry: tag 0x01, u2 length, then the bytes."""
    if len(value) > 0xFFFF:
        raise ValueError("constant too long for a CONSTANT_Utf8_info entry")
    return b"\x01" + len(value).to_bytes(2, "big") + value


def patch_class(data):
    """Return (patched_bytes, list_of_applied, list_of_already_applied)."""
    applied, already = [], []
    for label, olds, new in REPLACEMENTS:
        new_entry = utf8_constant(new)
        present = [(o, data.count(utf8_constant(o))) for o in olds]
        present = [(o, n) for o, n in present if n]
        found = sum(n for _, n in present)
        if found == 1:
            data = data.replace(utf8_constant(present[0][0]), new_entry)
            applied.append(label)
        elif found == 0 and new_entry in data:
            already.append(label)
        elif found == 0:
            raise SystemExit(
                "error: %s regex not found in %s -- unexpected jar build" % (label, CLASS_ENTRY)
            )
        else:
            raise SystemExit(
                "error: %s regex appears %d times in %s -- refusing to guess"
                % (label, found, CLASS_ENTRY)
            )
    return data, applied, already


def rewrite_jar(jar_path, patched_class):
    """Rewrite the jar with one entry replaced, preserving entry order and metadata."""
    tmp_path = jar_path + ".tmp"
    with zipfile.ZipFile(jar_path, "r") as src, zipfile.ZipFile(tmp_path, "w") as dst:
        for info in src.infolist():
            payload = patched_class if info.filename == CLASS_ENTRY else src.read(info.filename)
            # Reuse the source ZipInfo so name, order, timestamp and compression
            # method all survive; only the (now different) size is recomputed.
            out = zipfile.ZipInfo(info.filename, date_time=info.date_time)
            out.compress_type = info.compress_type
            out.external_attr = info.external_attr
            out.internal_attr = info.internal_attr
            out.create_system = info.create_system
            dst.writestr(out, payload)
    os.replace(tmp_path, jar_path)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("jar", nargs="?", default=DEFAULT_JAR, help="path to webos-tools.jar")
    parser.add_argument("--check", action="store_true", help="report status, change nothing")
    parser.add_argument("--backup", action="store_true", help="save <jar>.orig before patching")
    args = parser.parse_args()

    if not os.path.isfile(args.jar):
        raise SystemExit("error: no such jar: %s" % args.jar)

    with zipfile.ZipFile(args.jar, "r") as jar:
        if CLASS_ENTRY not in jar.namelist():
            raise SystemExit("error: %s not present in %s" % (CLASS_ENTRY, args.jar))
        original = jar.read(CLASS_ENTRY)

    patched, applied, already = patch_class(original)

    if args.check:
        if applied:
            print("UNPATCHED: %s (%s not current)" % (args.jar, ", ".join(applied)))
            return 1
        print("PATCHED: %s (%s)" % (args.jar, ", ".join(already)))
        return 0

    if not applied:
        print("already patched: %s" % args.jar)
        return 0

    if args.backup:
        shutil.copy2(args.jar, args.jar + ".orig")
        print("backed up to %s.orig" % args.jar)

    rewrite_jar(args.jar, patched)

    with zipfile.ZipFile(args.jar, "r") as jar:
        if jar.read(CLASS_ENTRY) != patched:
            raise SystemExit("error: verification failed after rewriting %s" % args.jar)
        if jar.testzip() is not None:
            raise SystemExit("error: rewritten jar failed its CRC check")

    print("patched %s (%s)" % (args.jar, ", ".join(applied)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
