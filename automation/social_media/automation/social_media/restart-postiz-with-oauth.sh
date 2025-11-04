#!/bin/bash
# Restart Postiz with OAuth Configuration
# Usage: ./restart-postiz-with-oauth.sh

set -e

echo "🚀 Restarting Postiz with OAuth Configuration"
echo "=============================================="
echo ""

# Check if OAuth credentials file exists
if [ ! -f "postiz-oauth.env" ]; then
    echo "❌ Error: postiz-oauth.env not found!"
    echo ""
    echo "Please create it from template:"
    echo "  cp postiz-oauth-credentials-template.env postiz-oauth.env"
    echo "  nano postiz-oauth.env  # Fill in your OAuth credentials"
    echo ""
    exit 1
fi

# Check if credentials are still placeholders
if grep -q "YOUR_.*_HERE" postiz-oauth.env; then
    echo "⚠️  Warning: Found placeholder values in postiz-oauth.env"
    echo ""
    echo "Please replace all YOUR_*_HERE values with actual credentials:"
    grep "YOUR_.*_HERE" postiz-oauth.env
    echo ""
    read -p "Continue anyway? (y/N): " confirm
    if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
        echo "Aborted. Please update credentials first."
        exit 1
    fi
fi

echo "📦 Stopping current Postiz container..."
docker stop untrapd-postiz 2>/dev/null || true

echo "🗑️  Removing old container..."
docker rm untrapd-postiz 2>/dev/null || true

echo "🔐 Generating secure secrets..."
NEXTAUTH_SECRET=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 32)

echo "🚀 Starting Postiz with OAuth configuration..."
docker run -d --name untrapd-postiz \
  --network postiz-network \
  -p 3000:3000 -p 4200:4200 \
  --env-file postiz-oauth.env \
  -e NEXTAUTH_SECRET="$NEXTAUTH_SECRET" \
  -e JWT_SECRET="$JWT_SECRET" \
  ghcr.io/gitroomhq/postiz-app:latest

echo ""
echo "⏳ Waiting for Postiz to start (10 seconds)..."
sleep 10

echo ""
echo "📊 Container Status:"
docker ps --filter "name=postiz" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "📋 Recent Logs:"
docker logs untrapd-postiz --tail 20

echo ""
echo "✅ Postiz restarted successfully!"
echo ""
echo "🌐 Access Postiz at: http://localhost:4200"
echo "🔐 Login: admin@untrapd.hub / UNTRAPDHub2025!"
echo ""
echo "📝 Next Steps:"
echo "  1. Open http://localhost:4200"
echo "  2. Navigate to Settings → Integrations"
echo "  3. Connect your social media accounts"
echo "  4. Run: node postiz-working-client.js to validate"
echo ""
