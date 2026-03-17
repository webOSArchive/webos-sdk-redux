# Building the macOS Installer Package

This guide explains how to build the novacom/novacomd installer package on any Mac (Intel or Apple Silicon).

## Important: Code Signing

**The build script automatically signs all binaries and libraries.** This fixes the issue where novacomd would be "instantly killed" when installed on other Macs. See [SIGNING-AND-DISTRIBUTION.md](SIGNING-AND-DISTRIBUTION.md) for detailed information about code signing.

## Prerequisites

1. **Homebrew** installed from [https://brew.sh](https://brew.sh)
2. **libusb and libusb-compat** installed via Homebrew:
   ```bash
   brew install libusb libusb-compat
   ```
3. **Built binaries** for novacom and novacomd:
   ```bash
   # Build novacomd
   cd novacomd
   ./build.sh
   cd ..

   # Build novacom
   cd novacom
   ./build.sh
   cd ..
   ```

## Building the Installer

Simply run the build script:

```bash
./build-installer.sh
```

The script will:
1. Detect your architecture (Intel x86_64 or Apple Silicon arm64)
2. Locate Homebrew and verify libusb libraries
3. Copy binaries and libraries
4. Relink libraries to use `/usr/local/lib` instead of Homebrew paths
5. **Sign all binaries and libraries** (fixes "instantly killed" issue on other Macs)
6. Create the postinstall script
7. Build the installer package

## Output

The script creates an architecture-specific package, depending on the environment you run the script on:
- **Apple Silicon**: `novacom-installer-arm64.pkg`
- **Intel Mac**: `novacom-installer-x86_64.pkg`

## What the Script Does

### 1. Architecture Detection
Automatically detects whether you're on Intel or Apple Silicon and adjusts Homebrew paths accordingly:
- Apple Silicon: `/opt/homebrew`
- Intel: `/usr/local`

### 1.5. Code Signing Detection
Checks for Developer ID certificate:
- **If found**: Uses Developer ID for professional signing
- **If not found**: Uses ad-hoc signing (still works, may show warnings)

This ensures binaries work on **all Macs**, not just the build machine.

### 2. File Collection
Copies:
- `novacomd/build-novacomd/novacomd`
- `novacom/build-novacom/novacom`
- `novacom/scripts/novaterm`
- Homebrew's libusb-compat and libusb libraries

### 3. Library Relinking
Uses `install_name_tool` to update library paths:
- Changes libusb references from Homebrew paths to `/usr/local/lib`
- Updates novacomd to use bundled libraries
- Cross-links libusb-compat and libusb

### 3.5. Code Signing
**Critical for distribution!** After relinking, all binaries are re-signed:
- Signs libraries first (dependencies)
- Then signs binaries that use them
- Uses Developer ID if available, otherwise ad-hoc signing
- Verifies all signatures are valid

Without this step, binaries would be killed instantly on other Macs.

### 4. Package Creation
Creates a `.pkg` installer with:
- Payload files in proper directory structure
- Postinstall script that sets up the launchd service
- Proper permissions and ownership

## Verification

After building, verify the package:

```bash
# Check package signature
pkgutil --check-signature novacom-installer-*.pkg

# List package contents
pkgutil --payload-files novacom-installer-*.pkg

# View library dependencies
otool -L installer-package/payload/usr/local/bin/novacomd
```

## Building on Different Architectures

### On Apple Silicon Mac

```bash
./build-installer.sh
# Creates: novacom-installer-arm64.pkg
```

### On Intel Mac

```bash
./build-installer.sh
# Creates: novacom-installer-x86_64.pkg
```

## Distributing Both Architectures

For universal distribution, build on both architectures:

1. **Build on Apple Silicon Mac** → `novacom-installer-arm64.pkg`
2. **Build on Intel Mac** → `novacom-installer-x86_64.pkg`
3. Distribute both packages, or users can choose the appropriate one

Alternatively, create a distribution package that includes both as choices (advanced).

## Troubleshooting

### Script fails with "novacomd binary not found"
Build novacomd first:
```bash
cd novacomd
./build.sh
```

### Script fails with "libusb-compat not found"
Install the required libraries:
```bash
brew install libusb libusb-compat
```

### Script fails with "Homebrew not found"
Install Homebrew:
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### Package build fails
Make sure you have Xcode Command Line Tools:
```bash
xcode-select --install
```

## Script Output

The build script provides detailed output showing:
- Architecture detection
- File verification
- Library relinking operations
- Package contents
- Installation instructions

Example output:
```
==========================================
  novacom/novacomd Installer Builder
==========================================

[INFO] Architecture: arm64
[SUCCESS] Homebrew found at /opt/homebrew
[INFO] Checking for required binaries...
[SUCCESS] Found novacomd
[SUCCESS] Found novacom
[SUCCESS] Found novaterm
...
[SUCCESS] Package built successfully!
```

## Clean Build

To clean all build artifacts and rebuild from scratch:

```bash
# Clean installer package directory
rm -rf installer-package
rm -f novacom-installer-*.pkg

# Rebuild binaries (optional)
cd novacomd && ./build.sh clean && ./build.sh && cd ..
cd novacom && ./build.sh clean && ./build.sh && cd ..

# Rebuild package
./build-installer.sh
```

## Advanced: Customization

To customize the installer, edit these sections in `build-installer.sh`:

### Change package identifier
```bash
--identifier "com.palm.novacom"
```

### Change version
```bash
--version "1.0.0"
```

### Change install location
The binaries install to `/usr/local/bin` and `/usr/local/lib`. To change this, you'll need to modify:
1. The payload directory structure
2. The library relinking paths
3. The postinstall script paths

## Files Created

The build script creates:
```
installer-package/
├── payload/
│   └── usr/
│       └── local/
│           ├── bin/
│           │   ├── novacomd
│           │   ├── novacom
│           │   └── novaterm
│           └── lib/
│               ├── libusb-0.1.4.dylib
│               └── libusb-1.0.0.dylib
└── scripts/
    └── postinstall

novacom-installer-{arch}.pkg  (final package)
```

## License

The build script is provided as-is for building installers for novacom/novacomd.

---

# Code Signing and Distribution Guide

## The Problem

When you modify binaries with `install_name_tool` (as we do to relink the libusb libraries), it invalidates their code signatures. On modern macOS:

- **Same Mac**: Unsigned/modified binaries may work locally
- **Other Macs**: macOS immediately kills unsigned binaries for security reasons

This is why novacomd was being "instantly killed" on the other Apple Silicon Mac.

## The Solution: Code Signing

The updated `build-installer.sh` script now automatically signs all binaries and libraries after relinking them.

### Ad-hoc Signing (Default)

If you don't have a Developer ID certificate, the script uses **ad-hoc signing** (signature with `-`):

```bash
codesign --force --sign "-" /path/to/binary
```

**Pros:**
- ✅ Works immediately, no certificate needed
- ✅ Binaries will run on other Macs
- ✅ Free

**Cons:**
- ⚠️ Users may see warnings on first launch
- ⚠️ May need to approve in System Settings > Privacy & Security
- ⚠️ Cannot be notarized by Apple

### Developer ID Signing (Recommended for Distribution)

If you have an Apple Developer ID certificate ($99/year), the script automatically detects and uses it:

**Pros:**
- ✅ No warnings for users
- ✅ Can be notarized by Apple
- ✅ Professional distribution
- ✅ Users trust it more

**Cons:**
- 💰 Requires $99/year Apple Developer membership
- 📝 More complex setup

## How the Build Script Handles Signing

The script automatically:

1. **Detects signing identity**:
   ```bash
   security find-identity -v -p codesigning
   ```

2. **Uses Developer ID if available**:
   - Script finds: "Developer ID Application: Your Name (TEAM123)"
   - Uses it automatically

3. **Falls back to ad-hoc signing**:
   - If no Developer ID found
   - Still allows binaries to run on other Macs

4. **Signs in correct order**:
   - Libraries first (libusb-1.0.0.dylib → libusb-0.1.4.dylib)
   - Then binaries that depend on them (novacomd, novacom)

5. **Verifies all signatures**:
   - Confirms each file is properly signed
   - Reports any issues

## Verification

### Check if binaries are signed:

```bash
codesign -dvvv /usr/local/bin/novacomd
```

Look for:
- **Ad-hoc signed**: `Signature=adhoc`
- **Developer ID signed**: `Authority=Developer ID Application: Your Name`

### Verify signature is valid:

```bash
codesign --verify --verbose /usr/local/bin/novacomd
```

Should output: `/usr/local/bin/novacomd: valid on disk`

### Check all signatures in package:

```bash
pkgutil --expand novacom-installer-arm64.pkg expanded_pkg
codesign -dvvv expanded_pkg/Payload
```

## Distribution Scenarios

### Scenario 1: Personal/Internal Use (Ad-hoc Signing)

**Who**: Hobbyists, internal company use, small teams

**How**: Just run `./build-installer.sh` (no certificate needed)

**User Experience**:
1. Install package normally
2. First time running novacomd: May see warning in System Settings
3. Go to System Settings > Privacy & Security
4. Click "Allow Anyway" next to novacomd warning
5. Works normally after that

### Scenario 2: Public Distribution (Developer ID Signing)

**Who**: Public releases, app store alternative, professional distribution

**Requirements**:
1. Apple Developer account ($99/year)
2. Developer ID Application certificate installed

**How**:
1. Get Developer ID from Apple Developer portal
2. Download and install certificate to Keychain
3. Run `./build-installer.sh` (auto-detects certificate)
4. Optionally notarize: `xcrun notarytool submit novacom-installer-arm64.pkg`

**User Experience**:
- No warnings
- Installs smoothly
- Professional experience

## Setting Up Developer ID (Optional)

If you want to do proper signing for distribution:

### 1. Join Apple Developer Program

Visit: https://developer.apple.com/programs/

Cost: $99/year

### 2. Create Certificate Signing Request (CSR)

```bash
# Open Keychain Access app
# Keychain Access > Certificate Assistant > Request a Certificate from a Certificate Authority
# Fill in your info, select "Saved to disk"
```

### 3. Create Developer ID Certificate

1. Go to: https://developer.apple.com/account/resources/certificates
2. Click "+" to create new certificate
3. Select "Developer ID Application"
4. Upload your CSR file
5. Download the certificate
6. Double-click to install in Keychain

### 4. Verify Installation

```bash
security find-identity -v -p codesigning
```

Should show:
```
1) ABC123DEF456 "Developer ID Application: Your Name (TEAM123)"
```

### 5. Build Installer

```bash
./build-installer.sh
```

Script will automatically detect and use your Developer ID!

## Notarization (Advanced)

For maximum trust, you can notarize your package with Apple:

```bash
# Upload for notarization
xcrun notarytool submit novacom-installer-arm64.pkg \
  --apple-id "your@email.com" \
  --team-id "TEAM123" \
  --password "app-specific-password" \
  --wait

# Check status
xcrun notarytool info <submission-id> \
  --apple-id "your@email.com" \
  --team-id "TEAM123" \
  --password "app-specific-password"

# Staple notarization to package
xcrun stapler staple novacom-installer-arm64.pkg
```

**Note**: Notarization requires Developer ID signing first.

## Troubleshooting

### "novacomd was killed" on other Mac

**Cause**: Binaries not signed or signature invalid

**Solution**: Rebuild with updated `build-installer.sh` script

### "Developer ID not found" but I have one

**Check Keychain**:
```bash
security find-identity -v -p codesigning
```

If not listed, re-download certificate from Apple Developer portal.

### "code signature invalid" error

**Cause**: Binary modified after signing

**Solution**: Don't modify binaries after signing. The script signs at the end of the build process.

### User sees "Apple cannot check for malicious software"

**Cause**: Ad-hoc signed (not notarized)

**Solution**: Either:
1. User clicks "Open Anyway" in System Settings
2. Or get Developer ID and optionally notarize

### Signature verification fails

```bash
codesign --verify --verbose /usr/local/bin/novacomd
```

If it fails, rebuild:
```bash
./build-installer.sh
```

## Best Practices

1. **Always sign**: The updated script does this automatically
2. **Sign after all modifications**: Script signs after install_name_tool
3. **Sign dependencies first**: Libraries before binaries that use them
4. **Verify signatures**: Check codesign output in script
5. **Test on another Mac**: Before distributing widely
6. **Consider Developer ID**: For professional distribution
7. **Document for users**: Include installation instructions

## What Changed in build-installer.sh

The script now includes:

```bash
# Sign libraries first (dependencies)
codesign --force --sign "$SIGNING_IDENTITY" libusb-1.0.0.dylib
codesign --force --sign "$SIGNING_IDENTITY" libusb-0.1.4.dylib

# Sign binaries
codesign --force --sign "$SIGNING_IDENTITY" novacomd
codesign --force --sign "$SIGNING_IDENTITY" novacom

# Verify all signatures
codesign --verify --verbose [each file]
```

This ensures all binaries work on any Mac, not just the build machine.

## Summary

| Signing Type | Cost | User Experience | Best For |
|-------------|------|-----------------|----------|
| **Ad-hoc** (default) | Free | May see warning | Personal use, testing |
| **Developer ID** | $99/year | No warnings | Public distribution |
| **Developer ID + Notarized** | $99/year + time | Seamless | Professional releases |

The updated build script handles all of this automatically - just run `./build-installer.sh` and it will sign with the best available method.
