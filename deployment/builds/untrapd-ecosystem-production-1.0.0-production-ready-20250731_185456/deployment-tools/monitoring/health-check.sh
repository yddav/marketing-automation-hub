#!/bin/bash

# UNTRAPD ECOSYSTEM - HEALTH CHECK SCRIPT
set -euo pipefail

# Configuration
DOMAIN="yourdomain.com"
EMAIL_ALERT="admin@yourdomain.com"
LOG_FILE="/var/log/untrapd/health-check.log"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "$(date '+%Y-%m-%d %H:%M:%S') [INFO] $1" | tee -a "$LOG_FILE"; }
log_success() { echo -e "$(date '+%Y-%m-%d %H:%M:%S') ${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"; }
log_warning() { echo -e "$(date '+%Y-%m-%d %H:%M:%S') ${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"; }
log_error() { echo -e "$(date '+%Y-%m-%d %H:%M:%S') ${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"; }

# Check HTTP response
check_http() {
    local url="https://$DOMAIN"
    local response=$(curl -s -o /dev/null -w "%{http_code}" "$url" || echo "000")
    
    if [ "$response" = "200" ]; then
        log_success "HTTP check passed: $url (Status: $response)"
        return 0
    else
        log_error "HTTP check failed: $url (Status: $response)"
        return 1
    fi
}

# Check SSL certificate
check_ssl() {
    local domain="$DOMAIN"
    local expiry_date=$(openssl s_client -servername "$domain" -connect "$domain:443" < /dev/null 2>/dev/null | openssl x509 -noout -dates | grep notAfter | cut -d= -f2)
    local expiry_epoch=$(date -d "$expiry_date" +%s)
    local current_epoch=$(date +%s)
    local days_until_expiry=$(( (expiry_epoch - current_epoch) / 86400 ))
    
    if [ $days_until_expiry -gt 30 ]; then
        log_success "SSL certificate valid for $days_until_expiry days"
        return 0
    elif [ $days_until_expiry -gt 7 ]; then
        log_warning "SSL certificate expires in $days_until_expiry days"
        return 0
    else
        log_error "SSL certificate expires in $days_until_expiry days - URGENT RENEWAL NEEDED"
        return 1
    fi
}

# Check disk space
check_disk_space() {
    local usage=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
    
    if [ $usage -lt 80 ]; then
        log_success "Disk usage: ${usage}%"
        return 0
    elif [ $usage -lt 90 ]; then
        log_warning "Disk usage: ${usage}% - Monitor closely"
        return 0
    else
        log_error "Disk usage: ${usage}% - CRITICAL"
        return 1
    fi
}

# Check memory usage
check_memory() {
    local usage=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
    
    if [ $usage -lt 80 ]; then
        log_success "Memory usage: ${usage}%"
        return 0
    elif [ $usage -lt 90 ]; then
        log_warning "Memory usage: ${usage}% - Monitor closely"
        return 0
    else
        log_error "Memory usage: ${usage}% - CRITICAL"
        return 1
    fi
}

# Main health check
main() {
    log_info "Starting health check for Untrapd Ecosystem..."
    
    local exit_code=0
    
    check_http || exit_code=1
    check_ssl || exit_code=1
    check_disk_space || exit_code=1
    check_memory || exit_code=1
    
    if [ $exit_code -eq 0 ]; then
        log_success "All health checks passed"
    else
        log_error "Some health checks failed"
        # Send alert email (if mail is configured)
        # echo "Health check failures detected on $(hostname)" | mail -s "Untrapd Health Check Alert" "$EMAIL_ALERT"
    fi
    
    exit $exit_code
}

main "$@"
