#!/bin/bash

# UNTRAPD ECOSYSTEM - SSL CERTIFICATE SETUP SCRIPT
# Supports both Let's Encrypt and custom certificates

set -euo pipefail

DOMAIN="yourdomain.com"
EMAIL="admin@yourdomain.com"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[SSL]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Install Certbot (Let's Encrypt)
install_certbot() {
    log_info "Installing Certbot for Let's Encrypt..."
    
    if command -v certbot >/dev/null 2>&1; then
        log_success "Certbot already installed"
        return 0
    fi
    
    # Ubuntu/Debian
    if command -v apt >/dev/null 2>&1; then
        apt update
        apt install -y certbot python3-certbot-nginx
    # CentOS/RHEL
    elif command -v yum >/dev/null 2>&1; then
        yum install -y certbot python3-certbot-nginx
    else
        log_error "Unsupported package manager"
        exit 1
    fi
    
    log_success "Certbot installed successfully"
}

# Obtain Let's Encrypt certificate
obtain_letsencrypt_cert() {
    log_info "Obtaining Let's Encrypt certificate for $DOMAIN..."
    
    certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" \
        --email "$EMAIL" \
        --agree-tos \
        --no-eff-email \
        --redirect
    
    log_success "Let's Encrypt certificate obtained and configured"
}

# Setup certificate auto-renewal
setup_auto_renewal() {
    log_info "Setting up automatic certificate renewal..."
    
    # Add cron job for renewal
    (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
    
    # Test renewal
    certbot renew --dry-run
    
    log_success "Auto-renewal configured and tested"
}

# Custom certificate installation
install_custom_cert() {
    local cert_file="$1"
    local key_file="$2"
    
    log_info "Installing custom SSL certificate..."
    
    if [ ! -f "$cert_file" ] || [ ! -f "$key_file" ]; then
        log_error "Certificate or key file not found"
        exit 1
    fi
    
    # Copy certificates to standard location
    cp "$cert_file" /etc/ssl/certs/untrapd.crt
    cp "$key_file" /etc/ssl/private/untrapd.key
    
    # Set permissions
    chmod 644 /etc/ssl/certs/untrapd.crt
    chmod 600 /etc/ssl/private/untrapd.key
    
    # Test nginx configuration
    nginx -t
    
    log_success "Custom SSL certificate installed"
}

# Main SSL setup
main() {
    case "${1:-letsencrypt}" in
        letsencrypt)
            install_certbot
            obtain_letsencrypt_cert
            setup_auto_renewal
            ;;
        custom)
            if [ $# -ne 3 ]; then
                echo "Usage: $0 custom <cert_file> <key_file>"
                exit 1
            fi
            install_custom_cert "$2" "$3"
            ;;
        *)
            echo "Usage: $0 [letsencrypt|custom <cert_file> <key_file>]"
            exit 1
            ;;
    esac
}

main "$@"
