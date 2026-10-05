#!/bin/sh
#
# Rebuilds the SDK's Enyo and Mojo from the reference TouchPad's own frameworks plus Lunacy's
# patches, so a desktop-browser preview runs the framework a TouchPad runs, with the fixes
# that make it run right on a modern engine. See FRAMEWORKS.md.
#
#   ./update-frameworks.sh [path/to/Lunacy] [path/to/touchpad-frameworks]
#
# Lunacy defaults to ../Lunacy (a checkout of github.com/webOSArchive/Lunacy). The TouchPad's
# frameworks default to Lunacy's Workbench/vendor/touchpad, which holds enyo-0.10, mojo and
# mojocommon as copied off the device (/usr/palm/frameworks, webOS CE 3.1.0); that folder is
# not in Lunacy's repository, so pass a copy of your own if you have one elsewhere.
#
# Symlinks in the device's trees are written as real files: the SDK is checked out and
# installed on Windows too, where a link in git is a text file.
#
set -e
cd "$(dirname "$0")"
HERE=$(pwd)
LUNACY=$(cd "${1:-../Lunacy}" && pwd)
TP=$(cd "${2:-$LUNACY/Workbench/vendor/touchpad}" && pwd)
F="$HERE/$(readlink Current || echo Current)/share/framework"
F=$(cd "$F" && pwd)

for d in "$TP/enyo-0.10/framework" "$TP/mojo/submissions/506" "$LUNACY/LunaRuntimes/enyo-1.0/patches"; do
    [ -d "$d" ] || { echo "update-frameworks: $d not found" >&2; exit 1; }
done
LUNACY_REV=$(git -C "$LUNACY" rev-parse --short HEAD 2>/dev/null || echo unknown)

# ---- Enyo: the TouchPad's tree, then Lunacy's series ----
rm -rf "$F/enyo/1.0"
mkdir -p "$F/enyo"
cp -RL "$TP/enyo-0.10" "$F/enyo/1.0"
for p in "$LUNACY"/LunaRuntimes/enyo-1.0/patches/*.patch; do
    (cd "$F/enyo/1.0" && patch -p1 --forward --silent --fuzz=0 --no-backup-if-mismatch < "$p") ||
        { echo "update-frameworks: $(basename "$p") does not apply to the TouchPad's Enyo" >&2; exit 1; }
    echo "enyo: applied $(basename "$p")"
done
cat > "$F/enyo/1.0/NOTICE" <<NOTICE
Enyo 1.0 as it is on the reference TouchPad (webOS CE 3.1.0), /usr/palm/frameworks/enyo/0.10,
with Lunacy's patches applied (LunaRuntimes/enyo-1.0/patches at Lunacy $LUNACY_REV,
github.com/webOSArchive/Lunacy). Enyo itself is Apache 2.0 (Hewlett-Packard;
github.com/enyojs/enyo-1.0). The libraries and localized resources HP shipped on the device and
never released with the source (lib/networkproxy among them) are Palm/HP's, distributed as
abandonware, like Mojo.
NOTICE

# ---- Mojo: the SDK's submission 506, with the device's mojocommon files in place ----
# On a device, much of submission 506 (stylesheets, images, templates, localized resources) is
# symlinks into /usr/palm/frameworks/mojocommon. The SDK shipped those links without
# mojocommon, so they pointed nowhere; each is now the file it names on the device.
M="$F/mojo/506"
[ -d "$M" ] || { echo "update-frameworks: $M not found" >&2; exit 1; }
(cd "$TP/mojo/submissions/506" && find . -type l) | while read -r l; do
    rm -rf "$M/$l"
    mkdir -p "$(dirname "$M/$l")"
    cp -RL "$TP/mojo/submissions/506/$l" "$M/$l"
done
# Lunacy's Mojo patches that a desktop browser reaches. 0001 and 0002 change the builtins that
# webOS's browser had compiled in, which a desktop page never loads (it takes javascripts/);
# 0003 is the stylesheet a scene's height comes from.
for name in 0003-scene-fills-its-scroller; do
    p="$LUNACY/LunaRuntimes/mojo/patches/$name.patch"
    [ -e "$p" ] || continue
    # The patch names submissions/506/...; here the submission is the folder itself.
    (cd "$M" && patch -p3 --forward --silent --fuzz=0 --no-backup-if-mismatch < "$p") ||
        { echo "update-frameworks: $name does not apply to the SDK's Mojo" >&2; exit 1; }
    echo "mojo: applied $name"
done
cat > "$M/NOTICE" <<NOTICE
Palm's Mojo framework, submission 506, as HP's 3.0.5 SDK shipped it for desktop browsers. The
files a device links into /usr/palm/frameworks/mojocommon (stylesheets, images, templates and
localized resources) are copied from the reference TouchPad (webOS CE 3.1.0), and Lunacy's
patch 0003-scene-fills-its-scroller is applied (Lunacy $LUNACY_REV,
github.com/webOSArchive/Lunacy). Palm's code, distributed as abandonware.
NOTICE

echo "frameworks updated from the TouchPad's trees and Lunacy $LUNACY_REV"
