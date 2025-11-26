# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is the HP webOS SDK version 3.0.5 (build 676), a legacy development kit for creating applications for the HP/Palm webOS platform. The SDK includes frameworks, tools, sample applications, and reference implementations of core webOS applications.

## SDK Structure

```
0.1/                          # SDK version 0.1 (symlinked as Current/)
├── bin/                      # Command-line tools (palm-* commands)
└── share/
    ├── addons/              # Additional libraries and utilities
    ├── applications/        # Reference application source code
    │   └── enyo/           # Enyo-based reference apps
    ├── documentation/       # API and SDK documentation
    ├── framework/           # Core frameworks
    │   ├── enyo/           # Enyo 1.0 framework (build 128)
    │   └── mojo/           # Mojo framework (version 506)
    ├── jars/               # Java-based webOS tools
    └── samplecode/         # Example applications
        ├── enyo/           # Enyo examples and templates
        └── mojo/           # Mojo examples and samples
```

## Development Tools

All webOS command-line tools are located in `0.1/bin/` and follow the `palm-*` naming convention. These are bash scripts that invoke Java tools from `0.1/share/jars/webos-tools.jar`.

**Requirements**: Java 1.5 or greater is required to run the SDK tools.

### Common Commands

- `palm-generate` - Generate new app projects from templates
- `palm-package <app-dir> [service-dir] [package-dir]` - Package applications into .ipk files
- `palm-install [-r] <package.ipk>` - Install/remove apps on device or emulator (use `-r` to remove)
- `palm-launch <app-id>` - Launch an installed application
- `palm-log -f <app-id>` - Follow/tail application logs
- `palm-run` - Run applications
- `palm-help` - Display help information

### Packaging Workflow

Standard workflow for building and deploying applications:

```bash
# Package the application
palm-package path/to/app-dir

# Remove old version (optional)
palm-install -r com.example.app

# Install the new package
palm-install com.example.app_1.0.0_all.ipk

# Launch the application
palm-launch com.example.app

# Watch logs
palm-log -f com.example.app
```

## Application Frameworks

### Enyo Framework (Primary for webOS 3.0)

Located at: `0.1/share/framework/enyo/1.0/framework/`

Enyo is a component-based JavaScript framework for building webOS applications with a declarative syntax.

**Key Concepts:**
- Applications use `enyo.kind()` to define UI components
- Entry point is `index.html` which loads `enyo.js` from the framework
- `depends.js` file declares JavaScript and CSS dependencies using `enyo.depends()`
- `appinfo.json` defines app metadata (id, version, title, icon, etc.)
- Set `"uiRevision": 2` in appinfo.json for Enyo apps

**Templates available in** `0.1/share/samplecode/enyo/templates/`:
- `SinglePane` - Single view application
- `MultiPanel` - Multi-panel navigation
- `SplitView` - Split-pane layout

### Mojo Framework (Legacy)

Located at: `0.1/share/framework/mojo/506/`

Older framework for webOS applications, still supported for backward compatibility.

## Application Structure

### Standard Enyo Application

```
app-directory/
├── appinfo.json          # App metadata and configuration
├── index.html           # Main HTML entry point
├── depends.js           # Dependency declarations
├── icon.png            # App icon
└── source/             # Application source files
    ├── App.js          # Main application logic
    └── App.css         # Application styles
```

### appinfo.json Fields

- `id` - Unique reverse-DNS identifier (e.g., "com.palm.app.photos")
- `version` - Version string
- `title` - Display name
- `main` - Entry HTML file (typically "index.html")
- `type` - Application type ("web" for JavaScript apps)
- `icon` - Icon filename
- `uiRevision` - Set to 2 for Enyo apps
- `vendor` - Publisher name
- `keywords` - Array of keywords for universal search

### Service-Based Applications

Applications can include JavaScript services for background processing. These use a `packageinfo.json` at the package level that references both the app and service directories:

```json
{
  "id": "com.example.app",
  "package_format_version": 2,
  "version": "1.0.0",
  "app": "com.example.app",
  "services": ["com.example.app.service"]
}
```

Package with: `palm-package app-dir/ service-dir/ package-dir/`

## Reference Applications

Source code for core webOS applications is available in `0.1/share/applications/enyo/`:

- `com.palm.app.browser` - Web browser
- `com.palm.app.email` - Email client (missing some open source dependencies)
- `com.palm.app.maps` - Maps application
- `com.palm.app.messaging` - Messaging/SMS
- `com.palm.app.notes` - Notes application
- `com.palm.app.photos` - Photos & Videos app

**Note**: Some applications have missing open source components (see readme.txt in applications directory).

## Sample Applications

### Enyo Samples (`0.1/share/samplecode/enyo/`)

- `examples/` - Basic examples (HelloWorld, Maps, Layouts, G11n, Theming, etc.)
- `more-examples/` - Advanced examples (WebView, Accelerometer, Bluetooth, ZeroConf, etc.)
- `templates/` - Project templates for new applications

### Mojo Samples (`0.1/share/samplecode/mojo/`)

Extensive collection including:
- `BasicService` - JavaScript services example
- `DB8BingPhonebook` - DB8 database usage
- `SampleCalendarSync` - Synergy/sync service example
- `AccountApp` - Account integration
- `ActivityManager` - Background activities
- `BluetoothSPPGPS` - Bluetooth Serial Port Profile
- `ZeroConf` - Network service discovery
- And many more...

## Key Architectural Concepts

### webOS Services

Applications communicate with system services using the palm:// URL scheme. Services handle system integration like:
- DB8 database operations
- Bluetooth connectivity
- GPS/location services
- Calendar and contact syncing
- Account management
- Background activities

### Enyo Component Model

Enyo uses a declarative component system where UI is built from `enyo.kind()` definitions that inherit from base kinds like `enyo.Control`, `enyo.VFlexBox`, `enyo.HFlexBox`, etc.

### Dependency Management

The `depends.js` file uses `enyo.depends()` to list JavaScript and CSS files that should be loaded. This is the standard way to declare application dependencies in Enyo apps.

## Version Information

- SDK Version: 3.0.5 (Build 676)
- Enyo Framework: 1.0 (Build 128)
- Mojo Framework: Version 506
- SDK Tools: Version 38
- Novacom: Version 80
- PDK (Native Plugin Development Kit): Version 138
