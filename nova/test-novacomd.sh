#!/bin/bash
#
# Test script for new novacomd build
# This script tests the modernized novacomd driver with a connected webOS device
#
# Usage: sudo ./test-novacomd.sh
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_TOTAL=0

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
    ((TESTS_PASSED++))
    ((TESTS_TOTAL++))
}

log_error() {
    echo -e "${RED}[FAIL]${NC} $1"
    ((TESTS_FAILED++))
    ((TESTS_TOTAL++))
}

log_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_section() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    log_error "Please run as root (sudo ./test-novacomd.sh)"
    exit 1
fi

# Configuration
NOVACOMD_BIN="./build-novacomd-host/novacomd"
NOVACOMD_PID=""
CLEANUP_ON_EXIT=true

# Cleanup function
cleanup() {
    log_section "Cleanup"
    if [ -n "$NOVACOMD_PID" ] && kill -0 $NOVACOMD_PID 2>/dev/null; then
        log_info "Stopping novacomd (PID: $NOVACOMD_PID)..."
        kill $NOVACOMD_PID 2>/dev/null || true
        sleep 1
        kill -9 $NOVACOMD_PID 2>/dev/null || true
        log_success "Novacomd stopped"
    fi
}

# Set up cleanup trap
if [ "$CLEANUP_ON_EXIT" = true ]; then
    trap cleanup EXIT
fi

# ============================================================================
# Test 1: Verify binary exists and is executable
# ============================================================================
log_section "Test 1: Binary Verification"

if [ ! -f "$NOVACOMD_BIN" ]; then
    log_error "Binary not found at $NOVACOMD_BIN"
    exit 1
fi
log_success "Binary exists at $NOVACOMD_BIN"

if [ ! -x "$NOVACOMD_BIN" ]; then
    log_error "Binary is not executable"
    exit 1
fi
log_success "Binary is executable"

# Check architecture
ARCH=$(file "$NOVACOMD_BIN" | grep -o "x86_64\|arm64")
log_info "Binary architecture: $ARCH"

# Check version
VERSION=$($NOVACOMD_BIN -V 2>&1 | grep -o "novacomd version.*" || echo "unknown")
log_info "Version: $VERSION"

# Check dependencies
log_info "Checking library dependencies..."
otool -L "$NOVACOMD_BIN" | grep -E "libusb|System" || true

# ============================================================================
# Test 2: Check for connected webOS devices
# ============================================================================
log_section "Test 2: USB Device Detection"

DEVICE_INFO=$(system_profiler SPUSBDataType 2>/dev/null | grep -A 15 "webOS-device\|Palm\|Pre\|TouchPad" || echo "")

if [ -z "$DEVICE_INFO" ]; then
    log_error "No webOS device detected via USB"
    log_warning "Please ensure a webOS device is connected and in USB mode"
else
    log_success "webOS device detected via USB"
    echo "$DEVICE_INFO" | head -10
fi

# ============================================================================
# Test 3: Check if another novacomd is running
# ============================================================================
log_section "Test 3: Check for Conflicting Processes"

if pgrep -x "novacomd" > /dev/null; then
    log_warning "Another novacomd process is running"
    ps aux | grep "[n]ovacomd"
    log_info "You may want to stop it first: sudo killall novacomd"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    log_success "No conflicting novacomd processes found"
fi

# Check if ports are in use
if lsof -i :6969 > /dev/null 2>&1; then
    log_warning "Port 6969 (NOVACOM_INETPORT) is already in use"
    lsof -i :6969
fi

# ============================================================================
# Test 4: Start novacomd
# ============================================================================
log_section "Test 4: Starting novacomd"

log_info "Starting novacomd in background..."
$NOVACOMD_BIN > /tmp/novacomd-test.log 2>&1 &
NOVACOMD_PID=$!

log_info "Novacomd PID: $NOVACOMD_PID"

# Wait for startup
log_info "Waiting for novacomd to initialize..."
sleep 3

# Check if process is still running
if ! kill -0 $NOVACOMD_PID 2>/dev/null; then
    log_error "Novacomd process died during startup"
    log_info "Log output:"
    cat /tmp/novacomd-test.log
    exit 1
fi
log_success "Novacomd process is running (PID: $NOVACOMD_PID)"

# ============================================================================
# Test 5: Check network ports
# ============================================================================
log_section "Test 5: Network Port Verification"

sleep 2  # Extra time for ports to open

if lsof -i :6969 -P | grep -q novacomd; then
    log_success "Port 6969 (NOVACOM_INETPORT) is listening"
else
    log_error "Port 6969 (NOVACOM_INETPORT) is not listening"
    log_info "Checking what ports novacomd is using:"
    lsof -p $NOVACOMD_PID -i -P 2>/dev/null || log_warning "Could not list open ports"
fi

if lsof -i :6968 -P | grep -q novacomd; then
    log_success "Port 6968 (NOVACOM_DEVLISTPORT) is listening"
else
    log_warning "Port 6968 (NOVACOM_DEVLISTPORT) is not listening (may be normal)"
fi

# ============================================================================
# Test 6: Check SDK tools availability
# ============================================================================
log_section "Test 6: Palm SDK Tools Detection"

SDK_TOOLS=("palm-device-info" "palm-install" "palm-log" "palm-launch")
TOOLS_FOUND=0

for tool in "${SDK_TOOLS[@]}"; do
    if command -v $tool &> /dev/null; then
        log_success "Found: $tool"
        ((TOOLS_FOUND++))
    else
        log_warning "Not found: $tool"
    fi
done

if [ $TOOLS_FOUND -eq 0 ]; then
    log_error "No Palm SDK tools found in PATH"
    log_warning "You may need to add /opt/nova/bin or Palm SDK to your PATH"
    log_info "Current PATH: $PATH"
fi

# ============================================================================
# Test 7: Test device communication
# ============================================================================
log_section "Test 7: Device Communication Tests"

# Give novacomd more time to detect device
log_info "Waiting for device detection..."
sleep 3

# Test 7a: Device info
if command -v palm-device-info &> /dev/null; then
    log_info "Running: palm-device-info"
    if timeout 10 palm-device-info > /tmp/device-info.txt 2>&1; then
        log_success "palm-device-info succeeded"
        cat /tmp/device-info.txt
    else
        log_error "palm-device-info failed or timed out"
        cat /tmp/device-info.txt 2>/dev/null || true
    fi
else
    log_warning "palm-device-info not available, skipping"
fi

# Test 7b: List installed apps
if command -v palm-install &> /dev/null; then
    log_info "Running: palm-install --list"
    if timeout 15 palm-install --list > /tmp/app-list.txt 2>&1; then
        log_success "palm-install --list succeeded"
        log_info "First 10 installed apps:"
        head -10 /tmp/app-list.txt
    else
        log_error "palm-install --list failed or timed out"
        cat /tmp/app-list.txt 2>/dev/null || true
    fi
else
    log_warning "palm-install not available, skipping"
fi

# Test 7c: Check logs
if command -v palm-log &> /dev/null; then
    log_info "Testing palm-log (will run for 5 seconds)..."
    timeout 5 palm-log > /tmp/device-log.txt 2>&1 || true
    if [ -s /tmp/device-log.txt ]; then
        log_success "palm-log is receiving data"
        log_info "Log sample:"
        head -5 /tmp/device-log.txt
    else
        log_warning "palm-log did not receive data (device may not be logging)"
    fi
else
    log_warning "palm-log not available, skipping"
fi

# ============================================================================
# Test 8: Check novacomd logs
# ============================================================================
log_section "Test 8: Novacomd Log Output"

if [ -f /tmp/novacomd-test.log ]; then
    log_info "Novacomd log output:"
    cat /tmp/novacomd-test.log
else
    log_warning "No log file found"
fi

# ============================================================================
# Test Summary
# ============================================================================
log_section "Test Summary"

echo ""
echo "Total Tests: $TESTS_TOTAL"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    log_success "All tests passed!"
    exit 0
else
    log_error "Some tests failed"
    exit 1
fi
