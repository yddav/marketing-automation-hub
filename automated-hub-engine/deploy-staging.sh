#!/bin/bash

# ==================== AUTOMATED HUB ENGINE STAGING DEPLOYMENT ====================
# Staging deployment to staging.hub.untrapd.com/apps/automated-hub-engine
# Safe testing environment before production

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="automated-hub-engine-staging"
DEPLOY_ENV="staging"
DOMAIN="staging.hub.untrapd.com"
APP_PATH="/apps/automated-hub-engine"
BACKUP_DIR="./backups"
LOG_FILE="./staging-deploy.log"

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

# Check prerequisites for staging
check_prerequisites() {
    log "🔍 Checking staging deployment prerequisites..."
    
    # Create necessary directories
    mkdir -p "$BACKUP_DIR"
    mkdir -p "./staging-deployment"
    
    # Check if we have the landing page files
    if [[ ! -d "landing-page" ]]; then
        error "landing-page directory not found"
    fi
    
    # Check required commands
    for cmd in python3 nginx; do
        if ! command -v $cmd &> /dev/null; then
            warning "$cmd not found - will use Python simple server for staging"
        fi
    done
    
    success "Prerequisites check passed for staging"
}

# Create staging backup
create_backup() {
    log "💾 Creating backup of current staging deployment..."
    
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_PATH="$BACKUP_DIR/staging_backup_$TIMESTAMP"
    
    mkdir -p "$BACKUP_PATH"
    
    # Backup current staging files if they exist
    if [[ -d "./staging-deployment" ]]; then
        cp -r "./staging-deployment" "$BACKUP_PATH/files"
        success "Current staging files backed up to $BACKUP_PATH/files"
    fi
    
    # Keep only last 3 backups for staging
    find "$BACKUP_DIR" -maxdepth 1 -type d -name "staging_backup_*" | sort | head -n -3 | xargs rm -rf
    
    echo "$BACKUP_PATH" > /tmp/ahe_staging_backup_path
    success "Staging backup created at $BACKUP_PATH"
}

# Deploy staging application
deploy_staging_application() {
    log "🚀 Deploying Automated Hub Engine to staging..."
    
    # Create staging directory
    mkdir -p "./staging-deployment$APP_PATH"
    
    # Copy landing page files
    cp -r landing-page/* "./staging-deployment$APP_PATH/"
    
    # Create staging-specific modifications
    # Add staging banner to HTML
    sed -i 's/<nav class="nav">/<div class="staging-banner">🚧 STAGING ENVIRONMENT - FOR TESTING ONLY 🚧<\/div>\n<nav class="nav">/' "./staging-deployment$APP_PATH/index.html"
    
    # Add staging CSS
    cat >> "./staging-deployment$APP_PATH/styles.css" << 'EOF'

/* Staging Environment Banner */
.staging-banner {
    background: #F59E0B;
    color: #000;
    text-align: center;
    padding: 0.5rem;
    font-weight: bold;
    font-size: 0.875rem;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1001;
}

.nav {
    top: 2rem !important;
}

.hero {
    padding-top: 10rem !important;
}
EOF
    
    # Update analytics to staging mode
    sed -i 's/production/staging/g' "./staging-deployment$APP_PATH/script.js"
    
    # Create staging favicon
    cat > "./staging-deployment$APP_PATH/favicon.svg" << 'EOF'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#F59E0B;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#D97706;stop-opacity:1" />
    </linearGradient>
  </defs>
  <circle cx="20" cy="20" r="18" fill="url(#grad)"/>
  <text x="20" y="25" text-anchor="middle" fill="white" font-size="12" font-weight="bold">S</text>
</svg>
EOF
    
    # Create staging robots.txt
    cat > "./staging-deployment$APP_PATH/robots.txt" << 'EOF'
User-agent: *
Disallow: /
# Staging environment - not for indexing
EOF
    
    success "Staging application files deployed successfully"
}

# Start staging server
start_staging_server() {
    log "⚙️ Starting staging server..."
    
    # Kill any existing staging server
    pkill -f "python.*staging-deployment" || true
    
    # Start Python simple server for staging
    cd "./staging-deployment"
    
    # Find available port (default 8080, fallback to 8081-8090)
    PORT=8080
    for p in {8080..8090}; do
        if ! netstat -tuln | grep ":$p " > /dev/null 2>&1; then
            PORT=$p
            break
        fi
    done
    
    log "Starting staging server on port $PORT..."
    nohup python3 -m http.server $PORT > ../staging-server.log 2>&1 &
    SERVER_PID=$!
    echo $SERVER_PID > ../staging-server.pid
    
    # Wait for server to start
    sleep 3
    
    cd ..
    success "Staging server started on port $PORT (PID: $SERVER_PID)"
    echo "PORT=$PORT" > staging-config.env
}

# Test staging deployment
test_staging_deployment() {
    log "🧪 Testing staging deployment..."
    
    # Read port from config
    source staging-config.env
    
    # Wait for server to be ready
    sleep 2
    
    # Test main page
    local status_code
    status_code=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$PORT$APP_PATH/" 2>/dev/null || echo "000")
    
    if [[ "$status_code" == "200" ]]; then
        success "✅ Staging main page is accessible (HTTP $status_code)"
    else
        error "❌ Staging main page test failed (HTTP $status_code)"
    fi
    
    # Test static assets
    status_code=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$PORT$APP_PATH/styles.css" 2>/dev/null || echo "000")
    
    if [[ "$status_code" == "200" ]]; then
        success "✅ Static assets are serving correctly"
    else
        warning "⚠️ Static assets may have issues (HTTP $status_code)"
    fi
    
    success "Staging deployment testing completed"
}

# Generate staging access info
generate_staging_info() {
    source staging-config.env
    
    cat > staging-access.md << EOF
# 🚧 Automated Hub Engine - Staging Environment

## Access Information

**Staging URL**: http://localhost:$PORT$APP_PATH/
**Status**: Active
**Environment**: Testing/Development
**Last Deployed**: $(date)

## Quick Links
- Main Page: http://localhost:$PORT$APP_PATH/
- Styles: http://localhost:$PORT$APP_PATH/styles.css
- Scripts: http://localhost:$PORT$APP_PATH/script.js

## Server Management
- **Start**: ./start-staging.sh
- **Stop**: ./stop-staging.sh
- **Restart**: ./restart-staging.sh
- **Logs**: tail -f staging-server.log

## Testing Checklist
- [ ] Page loads correctly
- [ ] Navigation works
- [ ] Forms submit properly
- [ ] Responsive design
- [ ] Analytics tracking
- [ ] Contact form validation

## Notes
- Staging banner visible at top
- Analytics in staging mode
- Robots.txt blocks indexing
- Server runs on Python SimpleHTTPServer

EOF
    
    success "Staging access information generated"
}

# Create staging management scripts
create_staging_scripts() {
    log "📝 Creating staging management scripts..."
    
    # Start script
    cat > start-staging.sh << 'EOF'
#!/bin/bash
source staging-config.env
cd staging-deployment
nohup python3 -m http.server $PORT > ../staging-server.log 2>&1 &
echo $! > ../staging-server.pid
echo "Staging server started on port $PORT"
EOF
    
    # Stop script
    cat > stop-staging.sh << 'EOF'
#!/bin/bash
if [[ -f staging-server.pid ]]; then
    PID=$(cat staging-server.pid)
    if kill -0 $PID 2>/dev/null; then
        kill $PID
        echo "Staging server stopped (PID: $PID)"
        rm staging-server.pid
    else
        echo "Staging server not running"
        rm -f staging-server.pid
    fi
else
    echo "No staging server PID file found"
fi
EOF
    
    # Restart script
    cat > restart-staging.sh << 'EOF'
#!/bin/bash
./stop-staging.sh
sleep 2
./start-staging.sh
EOF
    
    chmod +x start-staging.sh stop-staging.sh restart-staging.sh
    
    success "Staging management scripts created"
}

# Main staging deployment flow
main() {
    log "🚀 Starting Automated Hub Engine STAGING deployment"
    log "📍 Environment: $DEPLOY_ENV"
    
    # Main deployment steps
    check_prerequisites
    create_backup
    deploy_staging_application
    start_staging_server
    test_staging_deployment
    create_staging_scripts
    generate_staging_info
    
    # Read final config
    source staging-config.env
    
    # Final success message
    echo ""
    echo "🎉 ========================================================"
    echo "🚧 AUTOMATED HUB ENGINE STAGING DEPLOYED SUCCESSFULLY!"
    echo "🎉 ========================================================"
    echo ""
    echo "📍 Staging URL: http://localhost:$PORT$APP_PATH/"
    echo "📊 Server Logs: tail -f staging-server.log"
    echo "📋 Access Info: cat staging-access.md"
    echo "💾 Backup: $(cat /tmp/ahe_staging_backup_path 2>/dev/null || echo 'None')"
    echo ""
    echo "🔍 Quick Tests:"
    echo "   curl http://localhost:$PORT$APP_PATH/"
    echo "   open http://localhost:$PORT$APP_PATH/"
    echo ""
    echo "🛠️  Management Commands:"
    echo "   ./start-staging.sh   # Start server"
    echo "   ./stop-staging.sh    # Stop server"
    echo "   ./restart-staging.sh # Restart server"
    echo ""
    echo "🚀 When ready for production:"
    echo "   ./deploy.sh          # Deploy to production"
    echo ""
    
    success "Staging deployment completed successfully! 🎉"
}

# Run main function
main "$@"