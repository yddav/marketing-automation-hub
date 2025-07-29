#!/bin/bash

# Render Environment Setup Script
# Sets up environment variables for automated deployment

echo "🚀 Render Deployment Environment Setup"
echo "======================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Run this script from the project root directory"
    exit 1
fi

# Function to get user input with default
get_input() {
    local prompt="$1"
    local default="$2"
    local var_name="$3"
    
    echo -n "$prompt"
    if [ -n "$default" ]; then
        echo -n " [$default]"
    fi
    echo -n ": "
    
    read input
    if [ -z "$input" ] && [ -n "$default" ]; then
        input="$default"
    fi
    
    export $var_name="$input"
}

echo ""
echo "📋 Step 1: Render API Configuration"
echo "-----------------------------------"

# Get Render API key
if [ -z "$RENDER_API_KEY" ]; then
    echo "🔑 Get your API key from: https://dashboard.render.com/account/api-keys"
    get_input "Enter your Render API key" "" "RENDER_API_KEY"
else
    echo "✅ Render API key already set"
fi

# Get GitHub repository
if [ -z "$GITHUB_REPO" ]; then
    # Try to detect from git remote
    git_repo=$(git remote get-url origin 2>/dev/null | sed 's/.*github.com[:/]\([^/]*\/[^.]*\).*/\1/')
    get_input "Enter GitHub repository (username/repo-name)" "$git_repo" "GITHUB_REPO"
else
    echo "✅ GitHub repository already set: $GITHUB_REPO"
fi

echo ""
echo "📋 Step 2: API Keys Configuration"
echo "---------------------------------"

echo "🔄 These will be set as placeholders - update them in Render dashboard after deployment:"

# Stripe keys
echo "💳 Stripe Configuration:"
echo "   Get keys from: https://dashboard.stripe.com/test/apikeys"
echo "   ✓ STRIPE_PUBLISHABLE_KEY: Will be set as placeholder"
echo "   ✓ STRIPE_SECRET_KEY: Will be set as placeholder"
echo "   ✓ STRIPE_WEBHOOK_SECRET: Will be set as placeholder"

# SendGrid key
echo "📧 SendGrid Configuration:"
echo "   Get API key from: https://app.sendgrid.com/settings/api_keys"
echo "   ✓ SENDGRID_API_KEY: Will be set as placeholder"
echo "   ✓ SENDGRID_FROM_EMAIL: Will be set as placeholder"

# Create .env file for local development
echo ""
echo "📋 Step 3: Creating Local Environment File"
echo "------------------------------------------"

cat > .env.deployment << EOF
# Render Deployment Configuration
RENDER_API_KEY=$RENDER_API_KEY
GITHUB_REPO=$GITHUB_REPO

# Service Configuration
SERVICE_NAME=marketing-automation-hub
DB_NAME=marketing-automation-db

# Generated on: $(date)
EOF

echo "✅ Created .env.deployment file"

# Make deployment script executable
chmod +x scripts/deploy-render.js

echo ""
echo "🎯 Step 4: Deployment Ready!"
echo "=============================="

echo "📁 Files created:"
echo "   ✓ .env.deployment - Deployment configuration"
echo "   ✓ scripts/deploy-render.js - Automated deployment script"

echo ""
echo "🚀 Run Deployment:"
echo "   source .env.deployment"
echo "   node scripts/deploy-render.js"

echo ""
echo "📋 Post-Deployment Steps:"
echo "1. Update API keys in Render dashboard"
echo "2. Test deployment with verification script"
echo "3. Configure custom domain (optional)"
echo "4. Set up monitoring and alerts"

echo ""
echo "🔗 Useful Links:"
echo "   📊 Render Dashboard: https://dashboard.render.com/"
echo "   🔑 API Keys: https://dashboard.render.com/account/api-keys"
echo "   📖 Documentation: https://render.com/docs"

echo ""
echo "✅ Environment setup complete! Ready for deployment."