#!/bin/bash
#
# Uninstallation script for novacomd on Linux
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_step() { echo -e "${CYAN}[STEP]${NC} $1"; }

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    log_error "Please run with sudo: sudo ./uninstall-linux.sh"
    exit 1
fi

echo ""
echo "=========================================="
echo "  novacomd Uninstallation for Linux"
echo "=========================================="
echo ""

# Check for novacom/novaterm installations (dependency check)
NOVACOM_FOUND=false
for path in "/usr/local/bin" "/opt/nova/bin" "/usr/bin"; do
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
        NOVACOM_UNINSTALL="../novacom/uninstall-linux.sh"

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

for path in "/usr/local/bin" "/opt/nova/bin" "/usr/bin"; do
    if [ -f "$path/novacomd" ]; then
        FOUND_LOCATIONS+=("$path/novacomd")
        log_info "Found novacomd at: $path/novacomd"
    fi
done

# Check for symlinks
for path in "/usr/local/bin"; do
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

# Check for systemd service
SERVICE_FILE="/etc/systemd/system/novacomd.service"
if [ -f "$SERVICE_FILE" ]; then
    echo "  - $SERVICE_FILE (systemd service)"
fi

echo ""
read -p "Continue with uninstallation? [y/N]: " confirm
if [[ ! $confirm =~ ^[Yy]$ ]]; then
    log_info "Uninstallation cancelled"
    exit 0
fi

echo ""

# Stop and remove systemd service if present
if [ -f "$SERVICE_FILE" ]; then
    log_step "Managing systemd service..."

    # Check if service is active
    if systemctl is-active --quiet novacomd.service 2>/dev/null; then
        log_info "Stopping novacomd service..."
        systemctl stop novacomd.service
        log_success "Service stopped"
    fi

    # Check if service is enabled
    if systemctl is-enabled --quiet novacomd.service 2>/dev/null; then
        log_info "Disabling novacomd service..."
        systemctl disable novacomd.service
        log_success "Service disabled"
    fi

    log_info "Removing systemd service unit..."
    rm -f "$SERVICE_FILE"
    systemctl daemon-reload
    log_success "Removed systemd service"
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
for path in "/usr/local/bin" "/opt/nova/bin" "/usr/bin"; do
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
for path in "/usr/local/bin" "/opt/nova/bin" "/usr/bin"; do
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
        for path in "/usr/local/bin" "/opt/nova/bin" "/usr/bin"; do
            if compgen -G "$path/novacomd.backup.*" > /dev/null 2>&1; then
                rm -f "$path"/novacomd.backup.*
                log_success "Removed backups from $path"
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
