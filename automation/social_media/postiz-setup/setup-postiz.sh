#!/bin/bash

# UNTRAPD HUB POSTIZ SETUP SCRIPT
# Deploy free social media automation with Postiz

echo "🚀 UNTRAPD HUB POSTIZ SETUP"
echo "=========================="
echo "Setting up free social media automation..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Ubuntu: sudo apt install docker.io docker-compose"
    echo "   macOS: Install Docker Desktop"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p uploads data

# Generate secure secrets
echo "🔐 Generating secure secrets..."
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# Update .env file with generated secret
sed -i "s/untrapd_hub_social_automation_secret_change_this_in_production/$NEXTAUTH_SECRET/g" .env

echo "✅ Secrets generated and configured"

# Pull latest images
echo "📥 Pulling Docker images..."
docker-compose pull

# Start the services
echo "🚀 Starting Postiz services..."
docker-compose up -d

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 30

# Check service health
echo "🔍 Checking service health..."
docker-compose ps

# Show service status
if docker-compose ps | grep -q "Up"; then
    echo ""
    echo "✅ POSTIZ SETUP COMPLETE!"
    echo "========================"
    echo "🌐 Access Postiz at: http://localhost:3000"
    echo "📱 Configure your social media accounts:"
    echo "   • Instagram: @untrapd.hub"
    echo "   • Facebook: un trapd page"
    echo "   • Pinterest: untrapd.hub"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Open http://localhost:3000 in your browser"
    echo "2. Create your admin account"
    echo "3. Connect Instagram, Facebook, Pinterest via OAuth"
    echo "4. Start scheduling posts!"
    echo ""
    echo "🔧 Management Commands:"
    echo "   Stop:    docker-compose down"
    echo "   Restart: docker-compose restart"
    echo "   Logs:    docker-compose logs -f"
    echo ""
    echo "🎯 Ready for UNTRAPD Hub automation integration!"
else
    echo ""
    echo "❌ Some services failed to start. Check logs:"
    echo "   docker-compose logs"
fi