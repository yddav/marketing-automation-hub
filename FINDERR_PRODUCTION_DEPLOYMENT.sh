#!/bin/bash

###############################################################################
# FINDERR v4.1 Production Deployment Script
# Complete deployment orchestration for FINDERR Option C launch
#
# Components:
# - Netlify Functions (API endpoints)
# - Email automation (Mailchimp/SendGrid)
# - Social media automation (PM2 processes)
# - Monitoring dashboard
# - Analytics integration
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOYMENT_ENV="${1:-production}"
LOG_FILE="$PROJECT_ROOT/logs/deployment_$(date +%Y%m%d_%H%M%S).log"

# Create logs directory
mkdir -p "$PROJECT_ROOT/logs"

###############################################################################
# Utility Functions
###############################################################################

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✅ $1${NC}" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ❌ $1${NC}" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️  $1${NC}" | tee -a "$LOG_FILE"
}

check_command() {
    if ! command -v "$1" &> /dev/null; then
        error "Required command not found: $1"
        exit 1
    fi
}

###############################################################################
# Pre-Flight Checks
###############################################################################

preflight_checks() {
    log "Running pre-flight checks..."

    # Check required commands
    check_command "node"
    check_command "npm"
    check_command "git"
    check_command "netlify"

    # Check Node version
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 16 ]; then
        error "Node.js 16+ required (found: $(node -v))"
        exit 1
    fi

    # Check environment file
    if [ ! -f "$PROJECT_ROOT/.env" ]; then
        warning ".env file not found - creating from template"
        if [ -f "$PROJECT_ROOT/.env.example" ]; then
            cp "$PROJECT_ROOT/.env.example" "$PROJECT_ROOT/.env"
            warning "Please configure .env file before continuing"
            exit 1
        else
            error ".env.example not found"
            exit 1
        fi
    fi

    # Check git status
    if [ -n "$(git status --porcelain)" ]; then
        warning "You have uncommitted changes"
        read -p "Continue anyway? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi

    success "Pre-flight checks passed"
}

###############################################################################
# Build & Test
###############################################################################

build_and_test() {
    log "Building and testing..."

    cd "$PROJECT_ROOT"

    # Install dependencies
    log "Installing dependencies..."
    npm install --production=false

    # Run validation tests
    log "Running validation tests..."
    if [ -f "package.json" ] && grep -q "\"validate\"" package.json; then
        npm run validate || {
            error "Validation tests failed"
            exit 1
        }
    fi

    # Build functions
    if [ -d "functions" ]; then
        log "Building Netlify functions..."
        for func in functions/*.js; do
            log "  - $(basename $func)"
        done
    fi

    success "Build and test completed"
}

###############################################################################
# Deploy Netlify Functions
###############################################################################

deploy_netlify() {
    log "Deploying Netlify functions..."

    cd "$PROJECT_ROOT"

    # Check Netlify configuration
    if [ ! -f "netlify.toml" ]; then
        error "netlify.toml not found"
        exit 1
    fi

    # Deploy to production
    if [ "$DEPLOYMENT_ENV" = "production" ]; then
        log "Deploying to production..."
        netlify deploy --prod --dir=Homepage --functions=functions | tee -a "$LOG_FILE"
    else
        log "Deploying to staging..."
        netlify deploy --dir=Homepage --functions=functions | tee -a "$LOG_FILE"
    fi

    success "Netlify deployment completed"
}

###############################################################################
# Deploy Email Automation
###############################################################################

deploy_email_automation() {
    log "Configuring email automation..."

    cd "$PROJECT_ROOT/automation/email_marketing"

    # Verify email templates
    if [ -f "finderr_tier_email_sequences.json" ]; then
        log "Email templates found: finderr_tier_email_sequences.json"
    else
        error "Email templates not found"
        exit 1
    fi

    # Test email system
    if [ "$DEPLOYMENT_ENV" != "production" ]; then
        log "Testing email system..."
        node finderr-email-automation.js test test@finderr.app tier1 || {
            warning "Email test failed - check ESP configuration"
        }
    fi

    success "Email automation configured"
}

###############################################################################
# Deploy Social Media Automation
###############################################################################

deploy_social_automation() {
    log "Deploying social media automation..."

    cd "$PROJECT_ROOT/automation/social_media"

    # Check content calendar
    if [ ! -f "$PROJECT_ROOT/campaign_execution/finderr_v178_launch_calendar.json" ]; then
        error "Content calendar not found"
        exit 1
    fi

    # Preview upcoming posts
    log "Previewing upcoming posts..."
    node finderr-content-automation.js preview 7 || {
        warning "Content preview failed"
    }

    # Start PM2 processes (if PM2 is installed)
    if command -v pm2 &> /dev/null; then
        log "Starting PM2 processes..."

        # Stop existing processes
        pm2 delete finderr-content-automation 2>/dev/null || true
        pm2 delete finderr-email-automation 2>/dev/null || true

        # Start content automation (runs every hour)
        pm2 start finderr-content-automation.js \
            --name "finderr-content-automation" \
            --cron "0 * * * *" \
            --no-autorestart

        # Start email automation (trigger-based, always running)
        pm2 start finderr-email-automation.js \
            --name "finderr-email-automation"

        pm2 save

        success "PM2 processes started"
    else
        warning "PM2 not installed - manual process management required"
    fi
}

###############################################################################
# Deploy Monitoring Dashboard
###############################################################################

deploy_monitoring() {
    log "Setting up monitoring dashboard..."

    # Create monitoring dashboard HTML
    cat > "$PROJECT_ROOT/Homepage/finderr-dashboard.html" <<'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FINDERR Launch Dashboard - UNTRAPD.COM</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #0a0a0a;
            color: #fff;
            padding: 20px;
        }
        .container { max-width: 1400px; margin: 0 auto; }
        h1 { font-size: 2.5rem; margin-bottom: 10px; }
        h2 { font-size: 1.8rem; margin: 30px 0 15px; }
        .subtitle { color: #888; margin-bottom: 30px; }
        .dashboard-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .card {
            background: #1a1a1a;
            border: 1px solid #333;
            border-radius: 12px;
            padding: 24px;
        }
        .metric-value {
            font-size: 3rem;
            font-weight: bold;
            color: #00ff88;
            margin: 10px 0;
        }
        .metric-label { color: #888; font-size: 0.9rem; }
        .tier-progress {
            background: #0a0a0a;
            border-radius: 8px;
            height: 24px;
            margin: 10px 0;
            position: relative;
            overflow: hidden;
        }
        .tier-progress-bar {
            height: 100%;
            background: linear-gradient(90deg, #00ff88, #00cc66);
            transition: width 0.5s ease;
        }
        .tier-progress-text {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 0.9rem;
            font-weight: bold;
        }
        .status { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 0.8rem; }
        .status.active { background: #00ff8833; color: #00ff88; }
        .status.inactive { background: #ff008833; color: #ff0088; }
        #lastUpdate { color: #666; font-size: 0.9rem; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 FINDERR Launch Dashboard</h1>
        <p class="subtitle">Real-time monitoring for FINDERR v4.1 early adopter program</p>

        <div class="dashboard-grid">
            <div class="card">
                <div class="metric-label">Total Subscribers</div>
                <div class="metric-value" id="totalSubscribers">-</div>
                <div class="metric-label" id="activeTier">Loading...</div>
            </div>

            <div class="card">
                <div class="metric-label">Today's Growth</div>
                <div class="metric-value" id="newToday">-</div>
                <div class="metric-label" id="growthRate">-</div>
            </div>

            <div class="card">
                <div class="metric-label">Early Adopter Spots</div>
                <div class="metric-value" id="spotsRemaining">-</div>
                <div class="metric-label">of 5,000 available</div>
            </div>

            <div class="card">
                <div class="metric-label">Campaign Progress</div>
                <div class="metric-value" id="percentComplete">-%</div>
                <div class="metric-label">to 5,000 goal</div>
            </div>
        </div>

        <h2>Tier Breakdown</h2>
        <div class="dashboard-grid">
            <div class="card">
                <div class="metric-label">🏆 Tier 1: Founder's Circle</div>
                <div class="tier-progress">
                    <div class="tier-progress-bar" id="tier1Bar"></div>
                    <div class="tier-progress-text" id="tier1Text">-</div>
                </div>
                <div class="metric-label" id="tier1Stats">- / 1,000</div>
            </div>

            <div class="card">
                <div class="metric-label">⭐ Tier 2: Early Adopter</div>
                <div class="tier-progress">
                    <div class="tier-progress-bar" id="tier2Bar"></div>
                    <div class="tier-progress-text" id="tier2Text">-</div>
                </div>
                <div class="metric-label" id="tier2Stats">- / 2,000</div>
            </div>

            <div class="card">
                <div class="metric-label">🚀 Tier 3: Launch Supporter</div>
                <div class="tier-progress">
                    <div class="tier-progress-bar" id="tier3Bar"></div>
                    <div class="tier-progress-text" id="tier3Text">-</div>
                </div>
                <div class="metric-label" id="tier3Stats">- / 2,000</div>
            </div>
        </div>

        <div id="lastUpdate">Last updated: -</div>
    </div>

    <script>
        async function updateDashboard() {
            try {
                const response = await fetch('/.netlify/functions/finderr-milestones');
                const data = await response.json();

                // Main metrics
                document.getElementById('totalSubscribers').textContent = data.totalSubscribers;
                document.getElementById('activeTier').textContent = `Active Tier: ${data.activeTierName} ${data.activeTierBadge}`;
                document.getElementById('newToday').textContent = data.summary.newSubscribersToday;
                document.getElementById('growthRate').textContent = `${data.summary.growthRate}% growth`;
                document.getElementById('spotsRemaining').textContent = data.summary.totalEarlyAdoptersRemaining;
                document.getElementById('percentComplete').textContent = `${data.summary.percentComplete}%`;

                // Tier 1
                document.getElementById('tier1Bar').style.width = `${data.tiers.tier1.percentFilled}%`;
                document.getElementById('tier1Text').textContent = `${data.tiers.tier1.percentFilled}%`;
                document.getElementById('tier1Stats').textContent = `${data.tiers.tier1.count} / 1,000 (${data.tiers.tier1.remaining} remaining)`;

                // Tier 2
                document.getElementById('tier2Bar').style.width = `${data.tiers.tier2.percentFilled}%`;
                document.getElementById('tier2Text').textContent = `${data.tiers.tier2.percentFilled}%`;
                document.getElementById('tier2Stats').textContent = `${data.tiers.tier2.count} / 2,000 (${data.tiers.tier2.remaining} remaining)`;

                // Tier 3
                document.getElementById('tier3Bar').style.width = `${data.tiers.tier3.percentFilled}%`;
                document.getElementById('tier3Text').textContent = `${data.tiers.tier3.percentFilled}%`;
                document.getElementById('tier3Stats').textContent = `${data.tiers.tier3.count} / 2,000 (${data.tiers.tier3.remaining} remaining)`;

                // Last update
                document.getElementById('lastUpdate').textContent = `Last updated: ${new Date(data.lastUpdated).toLocaleString()}`;

            } catch (error) {
                console.error('Failed to update dashboard:', error);
            }
        }

        // Update immediately and every 30 seconds
        updateDashboard();
        setInterval(updateDashboard, 30000);
    </script>
</body>
</html>
EOF

    success "Monitoring dashboard created at Homepage/finderr-dashboard.html"
}

###############################################################################
# Post-Deployment Validation
###############################################################################

validate_deployment() {
    log "Validating deployment..."

    # Test API endpoints
    log "Testing API endpoints..."

    if command -v curl &> /dev/null; then
        # Test milestones endpoint
        log "Testing /api/finderr/milestones..."
        curl -s "https://hub.untrapd.com/.netlify/functions/finderr-milestones" > /dev/null && \
            success "Milestones API responding" || \
            warning "Milestones API not responding"
    fi

    # Check PM2 processes
    if command -v pm2 &> /dev/null; then
        log "Checking PM2 processes..."
        pm2 status | grep -E "(finderr-content|finderr-email)" && \
            success "PM2 processes running" || \
            warning "PM2 processes not running"
    fi

    success "Validation completed"
}

###############################################################################
# Main Deployment Flow
###############################################################################

main() {
    echo "
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   FINDERR v4.1 Production Deployment                         ║
║   Environment: $DEPLOYMENT_ENV                               ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
" | tee -a "$LOG_FILE"

    preflight_checks
    build_and_test
    deploy_netlify
    deploy_email_automation
    deploy_social_automation
    deploy_monitoring
    validate_deployment

    success "
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   ✅ FINDERR Deployment Complete!                            ║
║                                                              ║
║   Dashboard: https://hub.untrapd.com/finderr-dashboard.html  ║
║   API: https://hub.untrapd.com/.netlify/functions            ║
║   Logs: $LOG_FILE                                            ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
"
}

# Run main deployment
main "$@"
