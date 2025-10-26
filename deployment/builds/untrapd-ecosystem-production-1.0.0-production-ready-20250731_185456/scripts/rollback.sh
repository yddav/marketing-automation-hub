#!/bin/bash

# UNTRAPD ECOSYSTEM - ROLLBACK SCRIPT
set -euo pipefail

BACKUP_PATH="/var/backups/untrapd"
DEPLOY_PATH="/var/www/untrapd"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[ROLLBACK]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# List available backups
list_backups() {
    log_info "Available backups:"
    ls -la "$BACKUP_PATH/" | grep backup_ | nl
}

# Perform rollback
perform_rollback() {
    local backup_dir="$1"
    
    if [ ! -d "$backup_dir" ]; then
        log_error "Backup directory does not exist: $backup_dir"
        exit 1
    fi
    
    log_info "Rolling back to: $backup_dir"
    
    # Stop services
    systemctl stop nginx
    
    # Restore files
    rsync -av --delete "$backup_dir/" "$DEPLOY_PATH/"
    
    # Restart services
    systemctl start nginx
    
    log_success "Rollback completed successfully"
}

# Main rollback process
main() {
    if [ $# -eq 0 ]; then
        list_backups
        echo
        read -p "Enter backup directory name to rollback to: " backup_name
        perform_rollback "${BACKUP_PATH}/${backup_name}"
    else
        perform_rollback "$1"
    fi
}

main "$@"
