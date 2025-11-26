#!/bin/bash
#
# Uninstallation script for webOS SDK on macOS
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
    log_error "Please run with sudo: sudo ./uninstall-sdk-macos.sh"
    exit 1
fi

echo ""
echo "=========================================="
echo "  webOS SDK Uninstallation for macOS"
echo "=========================================="
echo ""

# Search for SDK installations
FOUND_SDK_LOCATIONS=()
FOUND_SYMLINK_LOCATIONS=()

log_info "Searching for webOS SDK installations..."

# Check common SDK installation paths
for path in "/opt/PalmSDK" "/usr/local/PalmSDK" "/opt/homebrew/PalmSDK"; do
    if [ -d "$path" ]; then
        FOUND_SDK_LOCATIONS+=("$path")
        log_info "Found SDK at: $path"
    fi
done

# Check for palm-* command symlinks in common bin directories
PALM_CMD_DIRS=()
for path in "/usr/local/bin" "/opt/homebrew/bin" "/opt/nova/bin"; do
    if compgen -G "$path/palm-*" > /dev/null 2>&1; then
        CMD_COUNT=$(ls -1 "$path"/palm-* 2>/dev/null | wc -l | tr -d ' ')
        if [ "$CMD_COUNT" -gt 0 ]; then
            FOUND_SYMLINK_LOCATIONS+=("$path")
            PALM_CMD_DIRS+=("$path ($CMD_COUNT commands)")
            log_info "Found palm-* commands in: $path"
        fi
    fi
done

if [ ${#FOUND_SDK_LOCATIONS[@]} -eq 0 ] && [ ${#FOUND_SYMLINK_LOCATIONS[@]} -eq 0 ]; then
    echo ""
    log_warning "No webOS SDK installations found"
    exit 0
fi

echo ""
log_warning "The following will be removed:"

if [ ${#FOUND_SDK_LOCATIONS[@]} -gt 0 ]; then
    echo ""
    echo "SDK Directories:"
    for item in "${FOUND_SDK_LOCATIONS[@]}"; do
        echo "  - $item"
    done
fi

if [ ${#PALM_CMD_DIRS[@]} -gt 0 ]; then
    echo ""
    echo "Palm Command Symlinks:"
    for item in "${PALM_CMD_DIRS[@]}"; do
        echo "  - $item"
    done
fi

echo ""
read -p "Continue with uninstallation? [y/N]: " confirm
if [[ ! $confirm =~ ^[Yy]$ ]]; then
    log_info "Uninstallation cancelled"
    exit 0
fi

echo ""
REMOVED_COUNT=0

# Remove SDK directories
if [ ${#FOUND_SDK_LOCATIONS[@]} -gt 0 ]; then
    log_info "Removing SDK directories..."
    for path in "${FOUND_SDK_LOCATIONS[@]}"; do
        if [ -d "$path" ]; then
            # Offer to backup
            BACKUP="$path.backup.$(date +%Y%m%d-%H%M%S)"
            read -p "Backup $path before removing? [Y/n]: " do_backup
            if [[ ! $do_backup =~ ^[Nn]$ ]]; then
                log_info "Creating backup at: $BACKUP"
                if mv "$path" "$BACKUP"; then
                    log_success "Backup created: $BACKUP"
                    ((REMOVED_COUNT++))
                else
                    log_error "Failed to backup $path"
                    continue
                fi
            else
                log_info "Removing $path..."
                if rm -rf "$path"; then
                    log_success "Removed $path"
                    ((REMOVED_COUNT++))
                else
                    log_error "Failed to remove $path"
                fi
            fi
        fi
    done
fi

# Remove palm-* command symlinks
if [ ${#FOUND_SYMLINK_LOCATIONS[@]} -gt 0 ]; then
    echo ""
    log_info "Removing palm-* command symlinks..."
    for path in "${FOUND_SYMLINK_LOCATIONS[@]}"; do
        # Count how many we'll remove
        CMD_COUNT=$(ls -1 "$path"/palm-* 2>/dev/null | wc -l | tr -d ' ')
        if [ "$CMD_COUNT" -gt 0 ]; then
            log_info "Removing $CMD_COUNT commands from $path..."

            # List the commands that will be removed
            for cmd in "$path"/palm-*; do
                if [ -L "$cmd" ] || [ -f "$cmd" ]; then
                    CMD_NAME=$(basename "$cmd")
                    if rm -f "$cmd"; then
                        log_success "Removed $path/$CMD_NAME"
                        ((REMOVED_COUNT++))
                    else
                        log_error "Failed to remove $path/$CMD_NAME"
                    fi
                fi
            done
        fi
    done
fi

# Offer to remove backups
echo ""
BACKUP_LOCATIONS=()
for base_path in "/opt" "/usr/local" "/opt/homebrew"; do
    if compgen -G "$base_path/PalmSDK.backup.*" > /dev/null 2>&1; then
        for backup in "$base_path"/PalmSDK.backup.*; do
            if [ -d "$backup" ]; then
                BACKUP_LOCATIONS+=("$backup")
            fi
        done
    fi
done

for bin_path in "/usr/local/bin" "/opt/homebrew/bin" "/opt/nova/bin"; do
    if compgen -G "$bin_path/palm-*.backup.*" > /dev/null 2>&1; then
        BACKUP_COUNT=$(ls -1 "$bin_path"/palm-*.backup.* 2>/dev/null | wc -l)
        if [ "$BACKUP_COUNT" -gt 0 ]; then
            BACKUP_LOCATIONS+=("$bin_path ($BACKUP_COUNT palm command backups)")
        fi
    fi
done

if [ ${#BACKUP_LOCATIONS[@]} -gt 0 ]; then
    log_info "Found backup files:"
    for item in "${BACKUP_LOCATIONS[@]}"; do
        echo "  - $item"
    done
    echo ""
    read -p "Remove backup files? [y/N]: " remove_backups
    if [[ $remove_backups =~ ^[Yy]$ ]]; then
        # Remove SDK directory backups
        for path in "/opt" "/usr/local" "/opt/homebrew"; do
            if compgen -G "$path/PalmSDK.backup.*" > /dev/null 2>&1; then
                for backup in "$path"/PalmSDK.backup.*; do
                    if [ -d "$backup" ]; then
                        rm -rf "$backup"
                        log_success "Removed SDK backup: $backup"
                    fi
                done
            fi
        done

        # Remove palm command backups
        for bin_path in "/usr/local/bin" "/opt/homebrew/bin" "/opt/nova/bin"; do
            if compgen -G "$bin_path/palm-*.backup.*" > /dev/null 2>&1; then
                rm -f "$bin_path"/palm-*.backup.*
                log_success "Removed palm command backups from $bin_path"
            fi
        done
    fi
fi

echo ""
echo "=========================================="
log_success "Uninstallation complete!"
echo "=========================================="
echo ""
log_info "Removed/backed up $REMOVED_COUNT item(s)"
echo ""
log_info "To verify removal, check:"
echo "  - SDK directories: /opt/PalmSDK, /usr/local/PalmSDK"
echo "  - Palm commands: which palm-help"
echo ""
