#!/bin/bash
#
# Uninstallation script for novacomd on macOS
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    log_error "Please run with sudo: sudo ./uninstall-macos.sh"
    exit 1
fi

echo ""
echo "=========================================="
echo "  novacomd Uninstallation for macOS"
echo "=========================================="
echo ""

# Check for novacom/novaterm installations (dependency check)
NOVACOM_FOUND=false
for path in "/usr/local/bin" "/opt/homebrew/bin" "/opt/nova/bin" "/usr/bin"; do
    if [ -f "$path/novacom" ] || [ -f "$path/novaterm" ]; then
        NOVACOM_FOUND=true
        break
    fi
done

if [ "$NOVACOM_FOUND" = true ]; then
    log_warning "Found novacom/novaterm installation"
    log_info "novacom depends on novacomd - it should be uninstalled first"
    echo ""
    read -p "Would you like to uninstall novacom first? [Y/n]: " uninstall_novacom

    if [[ ! $uninstall_novacom =~ ^[Nn]$ ]]; then
        # Look for novacom uninstall script
        NOVACOM_UNINSTALL="../novacom/uninstall-macos.sh"

        if [ -f "$NOVACOM_UNINSTALL" ]; then
            log_info "Running novacom uninstaller..."
            echo ""
            if "$NOVACOM_UNINSTALL"; then
                log_success "novacom uninstalled successfully"
            else
                log_warning "novacom uninstaller exited with errors"
            fi
            echo ""
        else
            log_warning "novacom uninstaller not found at: $NOVACOM_UNINSTALL"
            log_info "You may need to manually remove novacom and novaterm"
            echo ""
        fi
    else
        log_warning "Proceeding with novacomd uninstall"
        log_warning "Note: novacom will not work without novacomd"
        echo ""
    fi
fi

# Search for novacomd installations
FOUND_LOCATIONS=()

log_info "Searching for novacomd installations..."

for path in "/usr/local/bin" "/opt/homebrew/bin" "/opt/nova/bin" "/usr/bin"; do
    if [ -f "$path/novacomd" ]; then
        FOUND_LOCATIONS+=("$path/novacomd")
        log_info "Found novacomd at: $path/novacomd"
    fi
done

# Check for symlinks
for path in "/usr/local/bin" "/opt/homebrew/bin"; do
    if [ -L "$path/novacomd" ]; then
        FOUND_LOCATIONS+=("$path/novacomd (symlink)")
        log_info "Found novacomd symlink at: $path/novacomd"
    fi
done

if [ ${#FOUND_LOCATIONS[@]} -eq 0 ]; then
    echo ""
    log_warning "No novacomd installations found"
    exit 0
fi

echo ""
log_warning "The following files will be removed:"
for item in "${FOUND_LOCATIONS[@]}"; do
    echo "  - $item"
done

# Check for launchd service
LAUNCHD_PLIST="/Library/LaunchDaemons/com.palm.novacomd.plist"
if [ -f "$LAUNCHD_PLIST" ]; then
    echo "  - $LAUNCHD_PLIST (launchd service)"
fi

echo ""
read -p "Continue with uninstallation? [y/N]: " confirm
if [[ ! $confirm =~ ^[Yy]$ ]]; then
    log_info "Uninstallation cancelled"
    exit 0
fi

echo ""

# Stop and remove launchd service if present
if [ -f "$LAUNCHD_PLIST" ]; then
    log_info "Stopping launchd service..."

    # Check if service is loaded
    if launchctl list | grep -q "com.palm.novacomd"; then
        launchctl unload "$LAUNCHD_PLIST" 2>/dev/null || true
        log_success "Stopped launchd service"
    fi

    log_info "Removing launchd plist..."
    rm -f "$LAUNCHD_PLIST"
    log_success "Removed launchd service"
fi

# Stop any running novacomd
if pgrep -x novacomd > /dev/null; then
    log_info "Stopping running novacomd..."
    killall novacomd 2>/dev/null || true
    sleep 1
    log_success "Stopped novacomd"
fi

# Remove novacomd binaries
REMOVED_COUNT=0
for path in "/usr/local/bin" "/opt/homebrew/bin" "/opt/nova/bin" "/usr/bin"; do
    if [ -f "$path/novacomd" ] || [ -L "$path/novacomd" ]; then
        log_info "Removing $path/novacomd..."
        if rm -f "$path/novacomd"; then
            log_success "Removed $path/novacomd"
            ((REMOVED_COUNT++))
        else
            log_error "Failed to remove $path/novacomd"
        fi
    fi
done

# Offer to remove backups
echo ""
BACKUP_LOCATIONS=()
for path in "/usr/local/bin" "/opt/homebrew/bin" "/opt/nova/bin" "/usr/bin"; do
    if compgen -G "$path/novacomd.backup.*" > /dev/null 2>&1; then
        BACKUP_COUNT=$(ls -1 "$path"/novacomd.backup.* 2>/dev/null | wc -l)
        BACKUP_LOCATIONS+=("$path ($BACKUP_COUNT backups)")
    fi
done

if [ ${#BACKUP_LOCATIONS[@]} -gt 0 ]; then
    log_info "Found backup files in:"
    for item in "${BACKUP_LOCATIONS[@]}"; do
        echo "  - $item"
    done
    echo ""
    read -p "Remove backup files? [y/N]: " remove_backups
    if [[ $remove_backups =~ ^[Yy]$ ]]; then
        for path in "/usr/local/bin" "/opt/homebrew/bin" "/opt/nova/bin" "/usr/bin"; do
            if compgen -G "$path/novacomd.backup.*" > /dev/null 2>&1; then
                rm -f "$path"/novacomd.backup.*
                log_success "Removed backups from $path"
            fi
        done
    fi
fi

# Offer to remove log files
LOG_FILE="/var/log/novacomd.log"
if [ -f "$LOG_FILE" ]; then
    echo ""
    log_info "Found log file: $LOG_FILE"
    read -p "Remove log file? [y/N]: " remove_log
    if [[ $remove_log =~ ^[Yy]$ ]]; then
        rm -f "$LOG_FILE"
        log_success "Removed log file"
    fi
fi

echo ""
echo "=========================================="
log_success "Uninstallation complete!"
echo "=========================================="
echo ""
log_info "Removed $REMOVED_COUNT file(s)"
echo ""
