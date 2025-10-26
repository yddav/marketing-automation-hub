#!/bin/bash

# UNTRAPD ECOSYSTEM - PRODUCTION DEPLOYMENT SCRIPT
set -euo pipefail

# Configuration
DEPLOY_USER="www-data"
DEPLOY_PATH="/var/www/untrapd"
BACKUP_PATH="/var/backups/untrapd"
SERVICE_NAME="nginx"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[DEPLOY]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Pre-deployment checks
check_prerequisites() {
    log_info "Checking deployment prerequisites..."
    
    # Check if running as root or with sudo
    if [[ $EUID -ne 0 ]]; then
        log_error "This script must be run as root or with sudo"
        exit 1
    fi
    
    # Check required commands
    command -v nginx >/dev/null 2>&1 || { log_error "nginx is required but not installed"; exit 1; }
    command -v rsync >/dev/null 2>&1 || { log_error "rsync is required but not installed"; exit 1; }
    
    log_success "Prerequisites check passed"
}

# Create backup
create_backup() {
    if [ -d "$DEPLOY_PATH" ]; then
        log_info "Creating backup of current deployment..."
        BACKUP_DIR="${BACKUP_PATH}/backup_$(date +%Y%m%d_%H%M%S)"
        mkdir -p "$BACKUP_DIR"
        rsync -av "$DEPLOY_PATH/" "$BACKUP_DIR/"
        log_success "Backup created: $BACKUP_DIR"
    fi
}

# Deploy files
deploy_files() {
    log_info "Deploying files to production..."
    
    # Create deployment directory
    mkdir -p "$DEPLOY_PATH"
    
    # Deploy public files
    rsync -av --delete public/ "$DEPLOY_PATH/"
    
    # Set proper permissions
    chown -R "$DEPLOY_USER:$DEPLOY_USER" "$DEPLOY_PATH"
    find "$DEPLOY_PATH" -type f -exec chmod 644 {} \;
    find "$DEPLOY_PATH" -type d -exec chmod 755 {} \;
    
    log_success "Files deployed successfully"
}

# Configure services
configure_services() {
    log_info "Configuring system services..."
    
    # Copy nginx configuration
    if [ -f "config/nginx.conf" ]; then
        cp config/nginx.conf /etc/nginx/sites-available/untrapd
        ln -sf /etc/nginx/sites-available/untrapd /etc/nginx/sites-enabled/
        nginx -t && systemctl reload nginx
        log_success "Nginx configured and reloaded"
    fi
}

# Health check
health_check() {
    log_info "Performing health check..."
    
    # Check if nginx is running
    if systemctl is-active --quiet nginx; then
        log_success "Nginx is running"
    else
        log_error "Nginx is not running"
        exit 1
    fi
    
    # Test HTTP response
    if curl -s -o /dev/null -w "%{http_code}" http://localhost | grep -q "200"; then
        log_success "HTTP health check passed"
    else
        log_error "HTTP health check failed"
        exit 1
    fi
}

# Main deployment process
main() {
    log_info "Starting Untrapd Ecosystem deployment..."
    
    check_prerequisites
    create_backup
    deploy_files
    configure_services
    health_check
    
    log_success "Deployment completed successfully!"
    log_info "Access your site at: https://yourdomain.com"
}

main "$@"
