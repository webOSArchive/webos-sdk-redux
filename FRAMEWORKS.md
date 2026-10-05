# The SDK's Enyo and Mojo

The frameworks under `Current/share/framework/` are what the SDK's samples and templates load
when you open them in a desktop browser. Apps on a device never use them: a TouchPad, a Pre or
[Lunacy](https://github.com/webOSArchive/Lunacy) gives an app the framework the OS carries.
So they are only good for one thing, previewing, and a preview is only as good as it is like
the device.

Since 0.4 both are built from the reference TouchPad's own frameworks (webOS CE 3.1.0,
`/usr/palm/frameworks`), plus Lunacy's patches: the fixes that make webOS's frameworks behave
as they did on the TouchPad in a modern engine. Lunacy serves exactly the same Enyo to the apps
it runs, so a desktop preview, Lunacy and a TouchPad all start from one tree.

`update-frameworks.sh` rebuilds both:

```bash
./update-frameworks.sh [path/to/Lunacy] [path/to/touchpad-frameworks]
```

Lunacy defaults to `../Lunacy`. The TouchPad's frameworks (`enyo-0.10`, `mojo`, `mojocommon`,
copied off a device) default to Lunacy's `Workbench/vendor/touchpad`, which is not in Lunacy's
repository; pass your own copy if it lives elsewhere. Each framework's `NOTICE` records the
Lunacy revision its patches came from. Re-run it when Lunacy's patch series changes, and commit
the result.

## Enyo 1.0

The device's tree with Lunacy's series (`LunaRuntimes/enyo-1.0/patches`, documented in its
[CHANGES.md](https://github.com/webOSArchive/Lunacy/blob/main/LunaRuntimes/enyo-1.0/CHANGES.md))
applied with no fuzz; a patch that no longer applies stops the script.

0.3 shipped the copy from HP's 3.0.5 SDK. Its built `enyo-build.js` is byte-identical to the
TouchPad's, but it lacked the device's localized `resources/` folders and some of its
libraries (`lib/networkproxy`, newer `accounts` files). Measured against 0.3 by rendering every
Enyo example and template in headless Chromium: all draw the same except the Key Manager
sample, whose algorithm picker read "AE" and now reads "AES" (the flex-box fixes, patches 0003 and 0004).

What the patches do in a desktop browser:

| Patch | Effect here |
|---|---|
| 0001 screen orientation | none (only Luna calls `Mojo.screenOrientationChanged`) |
| 0002 `enyo.WebView` over an iframe | the control shows a page instead of an `<object>` that throws |
| 0003, 0004 flex shares | boxes split and size as on the TouchPad's WebKit |
| 0005 native web view | none (it only takes over inside Lunacy) |

## Mojo (submission 506)

The SDK's own packaging stays: a desktop page loads `javascripts/`, which a device doesn't
have, where the device's browser had the framework compiled in. What changed:

- **The files a device links into `mojocommon` are there.** On a TouchPad much of submission 506
  (stylesheets, images, templates, localized resources) is symlinks into
  `/usr/palm/frameworks/mojocommon`. 0.3 shipped 483 of those links and no `mojocommon`, so
  every one pointed nowhere and a Mojo page had no stylesheets. Each is now the real file from
  the device, 489 in all.
- **Lunacy's patch 0003** (`scene-fills-its-scroller`): a scene is at least as tall as its
  card, which a modern engine needs because it has no `-webkit-palm-overflow`. Lunacy's 0001
  and 0002 change the compiled-in builtins, which a desktop page never loads, so they aren't
  applied.
- **The desktop forms of Lunacy's other Mojo patches** (`LunaRuntimes/mojo/sdk-patches` there):
  a fix Lunacy makes to the builtins, made again in `javascripts/`. The first is 0004
  (`whole-pixel-dimensions`, in `javascripts/view.js`): `Mojo.View.getDimensions` is
  `offsetWidth`, which a modern engine rounds up from fractional layout, and a TextField fixed
  at the rounded width drops below its label, so a labelled field comes out double height. A
  size that rounded up by under a pixel now comes back as the element's whole pixels, as the
  TouchPad's integer layout gave it. These files aren't refreshed from the device, so
  `update-frameworks.sh` leaves a patch that is already in place alone.
- **Widgets are cleaned up again** (`compat-mutation-events`, at the top of
  `javascripts/framework.js`). Mojo cleans a widget up when its element gets
  `DOMNodeRemovedFromDocument`, and a current browser fires no DOM mutation events, so no widget
  was ever cleaned up: every closed dialog left the focus guard it puts on its scene, which
  blurs any field taking focus. Where the browser lacks them, a `MutationObserver` sends
  `DOMNodeRemovedFromDocument` and `DOMNodeInsertedIntoDocument` as webOS's WebKit did. In
  Lunacy the same code is in its compat layer, which a desktop preview doesn't have.

Every Enyo or Mojo patch Lunacy makes comes here too: Lunacy's rule 4 says so, and each Mojo
entry in its [CHANGES.md](https://github.com/webOSArchive/Lunacy/blob/main/LunaRuntimes/mojo/CHANGES.md)
says how it reaches the SDK.

**Not done:** Mojo samples still don't open in a current desktop browser, in 0.3 or 0.4. They
close their `mojo.js` script tag XHTML-style (`<script … />`), which an HTML parser reads as an
unclosed tag that swallows the rest of the head, and they load the framework from the device
path `/usr/palm/frameworks/mojo/mojo.js`. Lunacy handles both with serve-time transforms; a
preview server for the SDK would have to do the same.
