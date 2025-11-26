#!/bin/bash
#
# Uninstallation script for novacom on macOS
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
echo "  novacom Uninstallation for macOS"
echo "=========================================="
echo ""

# Search for novacom installations
FOUND_LOCATIONS=()
FOUND_NOVATERM=()

log_info "Searching for novacom installations..."

for path in "/usr/local/bin" "/opt/homebrew/bin" "/opt/nova/bin" "/usr/bin"; do
    if [ -f "$path/novacom" ]; then
        FOUND_LOCATIONS+=("$path/novacom")
        log_info "Found novacom at: $path/novacom"
    fi
    if [ -f "$path/novaterm" ]; then
        FOUND_NOVATERM+=("$path/novaterm")
        log_info "Found novaterm at: $path/novaterm"
    fi
done

# Check for symlinks in common locations
for path in "/usr/local/bin" "/opt/homebrew/bin"; do
    if [ -L "$path/novacom" ]; then
        FOUND_LOCATIONS+=("$path/novacom (symlink)")
        log_info "Found novacom symlink at: $path/novacom"
    fi
    if [ -L "$path/novaterm" ]; then
        FOUND_NOVATERM+=("$path/novaterm (symlink)")
        log_info "Found novaterm symlink at: $path/novaterm"
    fi
done

if [ ${#FOUND_LOCATIONS[@]} -eq 0 ] && [ ${#FOUND_NOVATERM[@]} -eq 0 ]; then
    echo ""
    log_warning "No novacom or novaterm installations found"
    exit 0
fi

echo ""
log_warning "The following files will be removed:"
for item in "${FOUND_LOCATIONS[@]}"; do
    echo "  - $item"
done
for item in "${FOUND_NOVATERM[@]}"; do
    echo "  - $item"
done

echo ""
read -p "Continue with uninstallation? [y/N]: " confirm
if [[ ! $confirm =~ ^[Yy]$ ]]; then
    log_info "Uninstallation cancelled"
    exit 0
fi

echo ""

# Remove novacom binaries
REMOVED_COUNT=0
for path in "/usr/local/bin" "/opt/homebrew/bin" "/opt/nova/bin" "/usr/bin"; do
    if [ -f "$path/novacom" ] || [ -L "$path/novacom" ]; then
        log_info "Removing $path/novacom..."
        if rm -f "$path/novacom"; then
            log_success "Removed $path/novacom"
            ((REMOVED_COUNT++))
        else
            log_error "Failed to remove $path/novacom"
        fi
    fi
done

# Remove novaterm scripts
for path in "/usr/local/bin" "/opt/homebrew/bin" "/opt/nova/bin" "/usr/bin"; do
    if [ -f "$path/novaterm" ] || [ -L "$path/novaterm" ]; then
        log_info "Removing $path/novaterm..."
        if rm -f "$path/novaterm"; then
            log_success "Removed $path/novaterm"
            ((REMOVED_COUNT++))
        else
            log_error "Failed to remove $path/novaterm"
        fi
    fi
done

# Offer to remove backups
echo ""
BACKUP_LOCATIONS=()
for path in "/usr/local/bin" "/opt/homebrew/bin" "/opt/nova/bin" "/usr/bin"; do
    if compgen -G "$path/novacom.backup.*" > /dev/null 2>&1; then
        BACKUP_COUNT=$(ls -1 "$path"/novacom.backup.* 2>/dev/null | wc -l)
        BACKUP_LOCATIONS+=("$path ($BACKUP_COUNT backups)")
    fi
    if compgen -G "$path/novaterm.backup.*" > /dev/null 2>&1; then
        BACKUP_COUNT=$(ls -1 "$path"/novaterm.backup.* 2>/dev/null | wc -l)
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
            if compgen -G "$path/novacom.backup.*" > /dev/null 2>&1; then
                rm -f "$path"/novacom.backup.*
                log_success "Removed novacom backups from $path"
            fi
            if compgen -G "$path/novaterm.backup.*" > /dev/null 2>&1; then
                rm -f "$path"/novaterm.backup.*
                log_success "Removed novaterm backups from $path"
            fi
        done
    fi
fi

echo ""
echo "=========================================="
log_success "Uninstallation complete!"
echo "=========================================="
echo ""
log_info "Removed $REMOVED_COUNT file(s)"
echo ""
