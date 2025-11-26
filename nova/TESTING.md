# Testing the Modernized novacomd

This document describes how to test the modernized novacomd driver with your webOS device.

## Prerequisites

1. **Built novacomd binary**: Run `make host` to build `build-novacomd-host/novacomd`
2. **Connected webOS device**: Device must be connected via USB and in developer mode
3. **Root access**: novacomd requires sudo to access USB devices
4. **Palm SDK tools** (optional): For testing device communication
   - Usually located in `/opt/nova/bin`
   - Add to PATH: `export PATH=$PATH:/opt/nova/bin`

## Quick Manual Test

```bash
# 1. Stop any running novacomd
sudo killall novacomd 2>/dev/null || true

# 2. Start the new novacomd
sudo ./build-novacomd-host/novacomd

# Leave it running in this terminal
# Open a new terminal for the following commands:

# 3. Check if it's running
ps aux | grep novacomd

# 4. Check listening ports
lsof -i :6969  # Main port
lsof -i :6968  # Device list port

# 5. Test with SDK tools (if available)
palm-device-info           # Get device information
palm-install --list        # List installed apps
palm-log                   # View device logs (Ctrl+C to stop)
```

## Automated Test Script

We've created a comprehensive test script that automates all testing:

```bash
# Run the automated test
sudo ./test-novacomd.sh
```

### What the Test Script Does

The automated test script performs the following checks:

1. **Binary Verification**
   - Confirms binary exists and is executable
   - Checks architecture (x86_64 or arm64)
   - Displays version information
   - Verifies library dependencies

2. **USB Device Detection**
   - Scans for connected webOS devices
   - Displays device information (vendor, product ID, serial)

3. **Process Conflict Check**
   - Ensures no other novacomd instances are running
   - Checks if required ports are available

4. **Novacomd Startup**
   - Starts novacomd in background
   - Monitors process health
   - Captures startup logs

5. **Network Port Verification**
   - Confirms port 6969 (main communication) is listening
   - Checks port 6968 (device list) status

6. **SDK Tools Detection**
   - Locates Palm SDK tools in PATH
   - Reports which tools are available

7. **Device Communication Tests**
   - Runs `palm-device-info` to get device details
   - Lists installed applications with `palm-install --list`
   - Captures device logs with `palm-log`
   - Measures response times and success rates

8. **Log Analysis**
   - Displays novacomd output
   - Reports any errors or warnings

### Test Script Output

The script provides color-coded output:
- **🔵 [INFO]**: Informational messages
- **✅ [PASS]**: Successful tests
- **❌ [FAIL]**: Failed tests
- **⚠️  [WARN]**: Warnings (non-critical issues)

At the end, it displays a summary:
```
========================================
Test Summary
========================================

Total Tests: 12
Passed: 11
Failed: 1
```

### Script Options

You can modify the script behavior by editing these variables at the top:

```bash
NOVACOMD_BIN="./build-novacomd-host/novacomd"  # Path to binary
CLEANUP_ON_EXIT=true                            # Auto-stop novacomd when done
```

Set `CLEANUP_ON_EXIT=false` if you want to leave novacomd running after tests.

## Common Issues and Solutions

### Issue: "need to run as super user to access usb"
**Solution**: Must run with sudo:
```bash
sudo ./build-novacomd-host/novacomd
```

### Issue: "Port 6969 already in use"
**Solution**: Another novacomd is running. Stop it first:
```bash
sudo killall novacomd
# Wait a few seconds
sudo ./build-novacomd-host/novacomd
```

### Issue: "No webOS device detected"
**Solutions**:
1. Ensure device is connected via USB
2. Put device in developer mode (webOS settings)
3. Try unplugging and reconnecting the device
4. Check USB connection with:
   ```bash
   system_profiler SPUSBDataType | grep -i "palm\|webos\|pre\|touchpad"
   ```

### Issue: "palm-device-info not found"
**Solution**: Palm SDK tools not in PATH. Add them:
```bash
export PATH=$PATH:/opt/nova/bin
# Or wherever your Palm SDK is installed
```

### Issue: Device detected but communication fails
**Solutions**:
1. Restart novacomd: `sudo killall novacomd && sudo ./build-novacomd-host/novacomd`
2. Restart the device
3. Check device USB mode (should be in developer/diagnostics mode)
4. Try a different USB port or cable

## Testing on Different Architectures

### Intel Mac (x86_64)
```bash
make host
sudo ./test-novacomd.sh
```

### Apple Silicon Mac (arm64)
```bash
make host
sudo ./test-novacomd.sh
```

### Cross-Architecture (if libusb-compat supports universal)
```bash
make universal
sudo ./test-novacomd.sh
```

## Manual Testing Checklist

Use this checklist for thorough manual testing:

- [ ] Binary builds without errors or warnings
- [ ] Binary runs and shows version with `-V` flag
- [ ] Novacomd starts without errors
- [ ] Ports 6968 and 6969 are listening
- [ ] Device appears in USB system profiler
- [ ] `palm-device-info` returns device information
- [ ] `palm-install --list` shows installed applications
- [ ] `palm-log` displays device logs
- [ ] Can install an app with `palm-install`
- [ ] Can launch an app with `palm-launch`
- [ ] Can remove an app with `palm-install -r`

## Logging and Debugging

### Enable Verbose Logging

Run novacomd in foreground to see all output:
```bash
sudo ./build-novacomd-host/novacomd
# All logs will appear in terminal
```

### Save Logs to File

```bash
sudo ./build-novacomd-host/novacomd > novacomd.log 2>&1 &
# Check logs: tail -f novacomd.log
```

### USB Debugging

View detailed USB information:
```bash
system_profiler SPUSBDataType > usb-devices.txt
# Search for your device in usb-devices.txt
```

### Network Debugging

Monitor novacomd network activity:
```bash
# Watch connections
watch -n 1 'lsof -i -P | grep novacomd'

# Capture packets (requires root)
sudo tcpdump -i any port 6969 -w novacomd-traffic.pcap
```

## Reporting Issues

If tests fail, please collect this information:

1. **Test script output**:
   ```bash
   sudo ./test-novacomd.sh > test-results.txt 2>&1
   ```

2. **System information**:
   ```bash
   sw_vers > system-info.txt
   uname -a >> system-info.txt
   system_profiler SPUSBDataType | grep -A 20 "webOS\|Palm" >> system-info.txt
   ```

3. **Binary information**:
   ```bash
   file build-novacomd-host/novacomd > binary-info.txt
   otool -L build-novacomd-host/novacomd >> binary-info.txt
   ```

4. **Novacomd logs**: Copy from terminal or log file

Include all of these files when reporting issues.
