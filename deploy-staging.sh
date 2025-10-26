#!/bin/bash

# UNTRAPD STAGING DEPLOYMENT
# Complete staging environment for entire Untrapd ecosystem
# Handles: hub.untrapd.com, templates, apps, shop, contact, landing pages

echo "🌟 UNTRAPD STAGING DEPLOYMENT"
echo "============================="

# Check if we're on the right branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "untrapd-ecosystem-staging" ]; then
    echo "⚠️  WARNING: Not on untrapd-ecosystem-staging branch"
    echo "   Current branch: $CURRENT_BRANCH"
    echo "   Switching to untrapd-ecosystem-staging..."
    git checkout untrapd-ecosystem-staging
fi

# Display current commit info
echo "📝 Current Commit:"
git log --oneline -1
echo ""

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "⚠️  Uncommitted changes detected:"
    git status --porcelain
    echo ""
    read -p "🤔 Continue with uncommitted changes? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Deployment cancelled"
        exit 1
    fi
fi

# Create staging snapshot
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
STAGING_TAG="untrapd-staging-$TIMESTAMP"

echo "📸 Creating staging snapshot: $STAGING_TAG"
git tag -a "$STAGING_TAG" -m "Untrapd Ecosystem Staging: Complete site deployment - $TIMESTAMP"

# Check required files exist
echo "🔍 Validating staging files..."
REQUIRED_FILES=(
    "public/index.html"
    "templates/index.html"
    "templates/marketing-automation/index.html"
    "public/apps/index.html"
    "public/shop/index.html"
    "public/contact/index.html"
    "untrapd-landing/index.html"
    "untrapd-staging-server.js"
    "package.json"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file"
    else
        echo "   ❌ Missing: $file"
        echo "🚨 Staging deployment failed - missing required files"
        exit 1
    fi
done

# Start staging server
echo ""
echo "🌐 Starting Untrapd staging server..."
echo "   Port: 8080"
echo "   Branch: $CURRENT_BRANCH"
echo "   Tag: $STAGING_TAG"
echo "   Scope: Full Untrapd ecosystem"
echo ""

# Check if port is available
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port 8080 is already in use"
    echo "   Attempting to stop existing server..."
    pkill -f "untrapd-staging-server.js" 2>/dev/null || true
    sleep 2
fi

# Set environment variables for staging
export GIT_BRANCH="$CURRENT_BRANCH"
export GIT_COMMIT="$(git rev-parse --short HEAD)"
export STAGING_PORT="8080"

# Launch staging server
node untrapd-staging-server.js &
STAGING_PID=$!

# Wait for server to start
sleep 3

# Test server health
echo "🩺 Testing staging server health..."
if curl -s http://localhost:8080/health > /dev/null; then
    echo "✅ Staging server is healthy!"
    echo ""
    echo "🌟 UNTRAPD STAGING READY FOR TESTING"
    echo "===================================="
    echo "🔗 Main URLs:"
    echo "   Hub Homepage:    http://localhost:8080/"
    echo "   Templates Hub:   http://localhost:8080/templates/"
    echo "   Marketing Auto:  http://localhost:8080/templates/marketing-automation/"
    echo "   Apps Section:    http://localhost:8080/apps/"
    echo "   Shop (Coming):   http://localhost:8080/shop/"
    echo "   Contact:         http://localhost:8080/contact/"
    echo "   Landing Page:    http://localhost:8080/untrapd-landing/"
    echo ""
    echo "🛠️  API Endpoints:"
    echo "   Health Check:    http://localhost:8080/health"
    echo "   Site Config:     http://localhost:8080/api/site-config"
    echo "   Templates API:   http://localhost:8080/api/templates"
    echo "   Apps API:        http://localhost:8080/api/apps"
    echo "   Features Test:   http://localhost:8080/staging/features"
    echo ""
    echo "🌿 Git Info:"
    echo "   Branch: $CURRENT_BRANCH"
    echo "   Tag: $STAGING_TAG"
    echo "   Commit: $(git log --oneline -1)"
    echo ""
    echo "🔄 Management Commands:"
    echo "   Stop staging: ./staging-manager.sh stop"
    echo "   Run tests: ./staging-manager.sh test"
    echo "   View status: ./staging-manager.sh status"
    echo "   Full restart: ./staging-manager.sh restart"
    echo ""
    echo "🎯 Test Focus Areas:"
    echo "   ✅ Navigation flow (Home → Apps/Templates → Products)"
    echo "   ✅ Cross-product marketing integration"
    echo "   ✅ Mobile responsiveness across all pages"
    echo "   ✅ API endpoints and data consistency"
    echo "   ✅ User journey optimization"
    echo ""
    echo "🚀 Ready for complete Untrapd ecosystem testing!"
    
    # Save PID for easy cleanup
    echo $STAGING_PID > staging.pid
    
else
    echo "❌ Staging server failed to start"
    kill $STAGING_PID 2>/dev/null || true
    exit 1
fi