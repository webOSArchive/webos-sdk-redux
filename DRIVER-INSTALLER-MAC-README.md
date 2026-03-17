# novacom/novacomd macOS Installer

This package provides a simple, self-contained macOS installer for the novacom client tools and novacomd daemon, which enable communication with webOS devices (Palm Pre, TouchPad, etc.).

## What's Included

The installer package (`novacom-installer.pkg`) contains:

- **novacomd** - The daemon that communicates with webOS devices via USB
- **novacom** - Command-line client for device communication
- **novaterm** - Terminal script for interactive shell access to devices
- **libusb libraries** - Bundled USB communication libraries (no Homebrew required!)
- **Automatic launchd service setup** - novacomd will automatically start on boot

## Installation Location

All files are installed to `/usr/local/`:

**Binaries** (`/usr/local/bin/`):
- `/usr/local/bin/novacomd`
- `/usr/local/bin/novacom`
- `/usr/local/bin/novaterm`

**Libraries** (`/usr/local/lib/`):
- `/usr/local/lib/libusb-0.1.4.dylib`
- `/usr/local/lib/libusb-1.0.0.dylib`

**LaunchDaemon**:
- `/Library/LaunchDaemons/com.palm.novacomd.plist`

## Prerequisites

**None!** The installer is completely self-contained and includes all necessary USB libraries. You do not need to install Homebrew or any dependencies.

## Installation Steps

1. **Double-click** `novacom-installer.pkg` to run the installer

2. **Follow the installation wizard**
   - You'll need administrator privileges
   - The installer will automatically set up the launchd service

3. **Verify installation**:
   ```bash
   # Check that novacomd service is running
   sudo launchctl list | grep novacomd

   # Check installed binaries
   which novacomd novacom novaterm

   # View novacomd logs
   tail -f /var/log/novacomd.log
   ```

That's it! No manual dependency installation required.

## Usage

### Basic Commands

**List connected devices:**
```bash
novacom -l
```

**Open terminal on device:**
```bash
novaterm
```

**Run command on device:**
```bash
novacom -t run file:///bin/ls
```

**Get device information:**
```bash
novacom -t run file:///bin/uname -a
```

### Service Management

The novacomd daemon runs automatically as a system service. You can manage it with:

**Check service status:**
```bash
sudo launchctl list | grep novacomd
```

**Stop the service:**
```bash
sudo launchctl stop com.palm.novacomd
```

**Start the service:**
```bash
sudo launchctl start com.palm.novacomd
```

**Unload the service (prevent auto-start):**
```bash
sudo launchctl unload /Library/LaunchDaemons/com.palm.novacomd.plist
```

**Reload the service (after unloading):**
```bash
sudo launchctl load /Library/LaunchDaemons/com.palm.novacomd.plist
```

**View logs:**
```bash
tail -f /var/log/novacomd.log
```

## Troubleshooting

### Service won't start

If the novacomd service fails to start:

1. **Check the logs:**
   ```bash
   cat /var/log/novacomd.log
   ```

2. **Verify libraries are installed:**
   ```bash
   ls -la /usr/local/lib/libusb*
   ```

3. **Try running manually to see error messages:**
   ```bash
   sudo /usr/local/bin/novacomd
   ```

4. **Check service status:**
   ```bash
   sudo launchctl list | grep novacomd
   ```

### Device not detected

If your webOS device isn't showing up:

1. Make sure novacomd is running:
   ```bash
   sudo launchctl list | grep novacomd
   ```

2. Check USB connection and cable

3. Try restarting the service:
   ```bash
   sudo launchctl stop com.palm.novacomd
   sudo launchctl start com.palm.novacomd
   ```

4. Check for error messages in logs:
   ```bash
   tail -f /var/log/novacomd.log
   ```

### PATH issues

If commands aren't found, make sure `/usr/local/bin` is in your PATH:

```bash
echo $PATH
```

To add it (if needed):
```bash
# For zsh (default on modern macOS)
echo 'export PATH="/usr/local/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# For bash
echo 'export PATH="/usr/local/bin:$PATH"' >> ~/.bash_profile
source ~/.bash_profile
```

### Library conflicts

If you have Homebrew's libusb-compat installed and encounter issues, you can either:

1. Keep both (they shouldn't conflict as they're in different locations)
2. Uninstall Homebrew's version:
   ```bash
   brew uninstall libusb-compat libusb
   ```

The installer uses `/usr/local/lib` which takes precedence over Homebrew's `/opt/homebrew/lib`.

## Uninstallation

To remove novacom/novacomd:

1. **Stop and unload the service:**
   ```bash
   sudo launchctl stop com.palm.novacomd
   sudo launchctl unload /Library/LaunchDaemons/com.palm.novacomd.plist
   ```

2. **Remove files:**
   ```bash
   sudo rm -f /usr/local/bin/novacomd
   sudo rm -f /usr/local/bin/novacom
   sudo rm -f /usr/local/bin/novaterm
   sudo rm -f /usr/local/lib/libusb-0.1.4.dylib
   sudo rm -f /usr/local/lib/libusb-1.0.0.dylib
   sudo rm -f /Library/LaunchDaemons/com.palm.novacomd.plist
   sudo rm -f /var/log/novacomd.log
   ```

## Architecture Support

This package was built on Apple Silicon (arm64) and includes binaries for:
- **novacomd**: Linked against bundled libusb libraries
- **novacom**: Standalone binary with no external dependencies
- **libusb libraries**: arm64 architecture from Homebrew

The binaries should work on Apple Silicon Macs. For Intel Macs, you may need to rebuild from source or request an Intel-compatible package.

## What's Bundled

The installer includes pre-compiled libraries from Homebrew:
- **libusb-compat 0.1.4** - Legacy libusb API compatibility layer
- **libusb 1.0.0** - Modern USB library for macOS

These are bundled directly in the package, so you don't need Homebrew installed. The binaries have been relinked to use `/usr/local/lib` instead of Homebrew paths.

## Technical Details

### Why bundle libusb?

The original novacomd requires `libusb-compat` which isn't part of macOS. Rather than requiring users to install Homebrew and manually install dependencies, this installer bundles the necessary libraries directly. This makes distribution much simpler and ensures the package works on any compatible Mac.

### Library relinking

The installer uses `install_name_tool` to update library paths:
- `novacomd` references `/usr/local/lib/libusb-0.1.4.dylib`
- `libusb-0.1.4.dylib` references `/usr/local/lib/libusb-1.0.0.dylib`

This ensures the binaries find the bundled libraries instead of looking for Homebrew installations.

## System Requirements

- **macOS**: 11.0 (Big Sur) or later recommended
- **Architecture**: Apple Silicon (arm64) - built and tested on Apple Silicon
- **Permissions**: Administrator/root access required for installation

## License

novacom and novacomd are licensed under the Apache License 2.0
Copyright (c) 2008-2012 Hewlett-Packard Development Company, L.P.

libusb and libusb-compat are licensed under the LGPL 2.1

## Credits

- Original software: HP/Palm
- macOS modernization: [NotAlexNoyle](https://github.com/NotAlexNoyle/novacomd)
- Installer package with bundled dependencies: Created for simplified distribution

## Support

For issues with:
- **novacomd/novacom functionality**: See the original project documentation
- **This installer package**: Contact the package creator
- **webOS devices**: Consult webOS community resources

## Version History

### 1.0.0
- Initial release
- Bundled libusb-compat and libusb libraries
- Automatic launchd service setup
- Self-contained installation (no Homebrew required)
