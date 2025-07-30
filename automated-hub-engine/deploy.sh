#!/bin/bash

# ==================== AUTOMATED HUB ENGINE DEPLOYMENT SCRIPT ====================
# Professional deployment to hub.untrapd.com/apps/automated-hub-engine
# Enterprise-grade automation with monitoring and rollback capabilities

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="automated-hub-engine"
DEPLOY_ENV="${DEPLOY_ENV:-production}"
DOMAIN="hub.untrapd.com"
APP_PATH="/apps/automated-hub-engine"
BACKUP_DIR="/var/backups/ahe"
LOG_FILE="/var/log/ahe-deploy.log"

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

# Check prerequisites
check_prerequisites() {
    log "🔍 Checking deployment prerequisites..."
    
    # Check if running as deploy user or root
    if [[ $EUID -ne 0 ]] && [[ $(whoami) != "deploy" ]]; then
        error "This script must be run as root or deploy user"
    fi
    
    # Check required commands
    for cmd in docker docker-compose git curl; do
        if ! command -v $cmd &> /dev/null; then
            error "$cmd is required but not installed"
        fi
    done
    
    # Check if port 80/443 are available or nginx is configured
    if ! systemctl is-active --quiet nginx 2>/dev/null; then
        warning "Nginx is not running - will start it during deployment"
    fi
    
    success "Prerequisites check passed"
}

# Create backup of current deployment
create_backup() {
    log "💾 Creating backup of current deployment..."
    
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_PATH="$BACKUP_DIR/backup_$TIMESTAMP"
    
    mkdir -p "$BACKUP_PATH"
    
    # Backup current files if they exist
    if [[ -d "/var/www$APP_PATH" ]]; then
        cp -r "/var/www$APP_PATH" "$BACKUP_PATH/files"
        success "Current files backed up to $BACKUP_PATH/files"
    fi
    
    # Backup nginx config if it exists
    if [[ -f "/etc/nginx/sites-available/$PROJECT_NAME" ]]; then
        cp "/etc/nginx/sites-available/$PROJECT_NAME" "$BACKUP_PATH/nginx.conf"
        success "Nginx config backed up"
    fi
    
    # Keep only last 5 backups
    find "$BACKUP_DIR" -maxdepth 1 -type d -name "backup_*" | sort | head -n -5 | xargs rm -rf
    
    echo "$BACKUP_PATH" > /tmp/ahe_backup_path
    success "Backup created at $BACKUP_PATH"
}

# Deploy application files
deploy_application() {
    log "🚀 Deploying Automated Hub Engine application..."
    
    # Create application directory
    mkdir -p "/var/www$APP_PATH"
    
    # Copy landing page files
    cp -r landing-page/* "/var/www$APP_PATH/"
    
    # Set proper permissions
    chown -R www-data:www-data "/var/www$APP_PATH"
    chmod -R 755 "/var/www$APP_PATH"
    
    # Copy additional assets
    mkdir -p "/var/www$APP_PATH/assets"
    
    # Create favicon and basic assets
    cat > "/var/www$APP_PATH/favicon.svg" << 'EOF'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#2563EB;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#059669;stop-opacity:1" />
    </linearGradient>
  </defs>
  <circle cx="20" cy="20" r="18" fill="url(#grad)"/>
  <path d="M15 20l5 5 10-10" stroke="white" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
EOF
    
    # Create basic robots.txt
    cat > "/var/www$APP_PATH/robots.txt" << 'EOF'
User-agent: *
Allow: /
Sitemap: https://hub.untrapd.com/apps/automated-hub-engine/sitemap.xml
EOF
    
    # Create basic sitemap.xml
    cat > "/var/www$APP_PATH/sitemap.xml" << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://hub.untrapd.com/apps/automated-hub-engine/</loc>
    <lastmod>2025-01-29</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
EOF
    
    success "Application files deployed successfully"
}

# Configure Nginx
configure_nginx() {
    log "⚙️ Configuring Nginx for Automated Hub Engine..."
    
    # Create Nginx configuration
    cat > "/etc/nginx/sites-available/$PROJECT_NAME" << EOF
# Automated Hub Engine - Professional Configuration
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN;
    root /var/www$APP_PATH;
    index index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://www.google-analytics.com;" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml+rss application/atom+xml image/svg+xml;

    # Cache static assets
    location ~* \.(css|js|jpg|jpeg|png|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Vary "Accept-Encoding";
    }

    # Main location
    location $APP_PATH/ {
        try_files \$uri \$uri/ /index.html;
        
        # Additional headers for main pages
        add_header X-Robots-Tag "index, follow" always;
    }

    # Health check endpoint
    location $APP_PATH/health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # Block access to sensitive files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }

    location ~ \.(md|yml|yaml|json)$ {
        deny all;
        access_log off;
        log_not_found off;
    }

    # Logging
    access_log /var/log/nginx/$PROJECT_NAME.access.log;
    error_log /var/log/nginx/$PROJECT_NAME.error.log;
}

# HTTPS redirect (if SSL is configured)
# server {
#     listen 443 ssl http2;
#     listen [::]:443 ssl http2;
#     server_name $DOMAIN;
#     
#     ssl_certificate /etc/ssl/certs/$DOMAIN.crt;
#     ssl_certificate_key /etc/ssl/private/$DOMAIN.key;
#     
#     # SSL configuration
#     ssl_protocols TLSv1.2 TLSv1.3;
#     ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
#     ssl_prefer_server_ciphers off;
#     
#     # Include the main server configuration
#     include /etc/nginx/sites-available/$PROJECT_NAME;
# }
EOF

    # Enable the site
    ln -sf "/etc/nginx/sites-available/$PROJECT_NAME" "/etc/nginx/sites-enabled/$PROJECT_NAME"
    
    # Test nginx configuration
    if nginx -t; then
        success "Nginx configuration is valid"
    else
        error "Nginx configuration test failed"
    fi
    
    # Reload nginx
    systemctl reload nginx
    success "Nginx configured and reloaded"
}

# Setup monitoring
setup_monitoring() {
    log "📊 Setting up monitoring and analytics..."
    
    # Create monitoring script
    cat > "/usr/local/bin/ahe-monitor" << 'EOF'
#!/bin/bash
# Automated Hub Engine Monitoring Script

LOGFILE="/var/log/ahe-monitor.log"
APP_URL="https://hub.untrapd.com/apps/automated-hub-engine/health"

# Check application health
check_health() {
    local status_code=$(curl -s -o /dev/null -w "%{http_code}" "$APP_URL" || echo "000")
    
    if [[ "$status_code" == "200" ]]; then
        echo "$(date): ✅ Application healthy (HTTP $status_code)" >> "$LOGFILE"
        return 0
    else
        echo "$(date): ❌ Application unhealthy (HTTP $status_code)" >> "$LOGFILE"
        return 1
    fi
}

# Check disk space
check_disk() {
    local usage=$(df /var/www | tail -1 | awk '{print $5}' | sed 's/%//')
    
    if [[ $usage -gt 80 ]]; then
        echo "$(date): ⚠️ Disk usage high: ${usage}%" >> "$LOGFILE"
        return 1
    else
        echo "$(date): ✅ Disk usage normal: ${usage}%" >> "$LOGFILE"
        return 0
    fi
}

# Main monitoring
if check_health && check_disk; then
    exit 0
else
    # Send alert (implement notification system here)
    echo "$(date): 🚨 Monitoring alert triggered" >> "$LOGFILE"
    exit 1
fi
EOF

    chmod +x "/usr/local/bin/ahe-monitor"
    
    # Create systemd service for monitoring
    cat > "/etc/systemd/system/ahe-monitor.service" << 'EOF'
[Unit]
Description=Automated Hub Engine Monitor
After=network.target

[Service]
Type=oneshot
ExecStart=/usr/local/bin/ahe-monitor
User=www-data
StandardOutput=journal
StandardError=journal
EOF

    # Create timer for regular monitoring
    cat > "/etc/systemd/system/ahe-monitor.timer" << 'EOF'
[Unit]
Description=Run AHE Monitor every 5 minutes
Requires=ahe-monitor.service

[Timer]
OnCalendar=*:0/5
Persistent=true

[Install]
WantedBy=timers.target
EOF

    # Enable and start monitoring
    systemctl daemon-reload
    systemctl enable ahe-monitor.timer
    systemctl start ahe-monitor.timer
    
    success "Monitoring configured and started"
}

# Test deployment
test_deployment() {
    log "🧪 Testing deployment..."
    
    # Wait for services to start
    sleep 5
    
    # Test main page
    local status_code=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost$APP_PATH/" || echo "000")
    
    if [[ "$status_code" == "200" ]]; then
        success "✅ Main page is accessible (HTTP $status_code)"
    else
        error "❌ Main page test failed (HTTP $status_code)"
    fi
    
    # Test health endpoint
    status_code=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost$APP_PATH/health" || echo "000")
    
    if [[ "$status_code" == "200" ]]; then
        success "✅ Health endpoint is working (HTTP $status_code)"
    else
        warning "⚠️ Health endpoint not accessible (HTTP $status_code)"
    fi
    
    # Test static assets
    status_code=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost$APP_PATH/styles.css" || echo "000")
    
    if [[ "$status_code" == "200" ]]; then
        success "✅ Static assets are serving correctly"
    else
        warning "⚠️ Static assets may have issues (HTTP $status_code)"
    fi
    
    success "Deployment testing completed"
}

# Rollback function
rollback() {
    log "🔄 Rolling back deployment..."
    
    if [[ -f "/tmp/ahe_backup_path" ]]; then
        local backup_path=$(cat /tmp/ahe_backup_path)
        
        if [[ -d "$backup_path/files" ]]; then
            rm -rf "/var/www$APP_PATH"
            cp -r "$backup_path/files" "/var/www$APP_PATH"
            chown -R www-data:www-data "/var/www$APP_PATH"
            success "Files rolled back from backup"
        fi
        
        if [[ -f "$backup_path/nginx.conf" ]]; then
            cp "$backup_path/nginx.conf" "/etc/nginx/sites-available/$PROJECT_NAME"
            systemctl reload nginx
            success "Nginx configuration rolled back"
        fi
        
        success "Rollback completed successfully"
    else
        error "No backup found for rollback"
    fi
}

# Main deployment flow
main() {
    log "🚀 Starting Automated Hub Engine deployment to $DEPLOY_ENV"
    log "📍 Target: $DOMAIN$APP_PATH"
    
    # Trap errors for rollback
    trap 'error "Deployment failed! Run with ROLLBACK=1 to rollback"; exit 1' ERR
    
    # Handle rollback flag
    if [[ "${ROLLBACK:-0}" == "1" ]]; then
        rollback
        exit 0
    fi
    
    # Main deployment steps
    check_prerequisites
    create_backup
    deploy_application
    configure_nginx
    setup_monitoring
    test_deployment
    
    # Final success message
    echo ""
    echo "🎉 ==============================================="
    echo "🚀 AUTOMATED HUB ENGINE DEPLOYED SUCCESSFULLY!"
    echo "🎉 ==============================================="
    echo ""
    echo "📍 Application URL: https://$DOMAIN$APP_PATH/"
    echo "📊 Health Check: https://$DOMAIN$APP_PATH/health"
    echo "📋 Logs: $LOG_FILE"
    echo "💾 Backup: $(cat /tmp/ahe_backup_path 2>/dev/null || echo 'None')"
    echo ""
    echo "🔍 Quick Tests:"
    echo "   curl https://$DOMAIN$APP_PATH/"
    echo "   curl https://$DOMAIN$APP_PATH/health"
    echo ""
    echo "🛠️  Rollback Command (if needed):"
    echo "   ROLLBACK=1 ./deploy.sh"
    echo ""
    
    # Send deployment notification
    log "📧 Sending deployment notification..."
    echo "Automated Hub Engine deployed successfully at $(date)" | logger -t "ahe-deployment"
    
    success "Deployment completed successfully! 🎉"
}

# Run main function
main "$@"