#!/bin/bash

# BULLETPROOF DEPLOYMENT SYSTEM
# Agent Charlie - Mission Critical Launch Infrastructure

echo "🚀 BULLETPROOF DEPLOYMENT SYSTEM"
echo "================================="
echo ""

# Check if we're in the right directory
if [ ! -f "vercel.json" ]; then
    echo "❌ Error: vercel.json not found. Run this script from the project root."
    exit 1
fi

echo "✅ Project structure verified"
echo ""

# Function to check if a port is available
check_port() {
    local port=$1
    if command -v lsof >/dev/null 2>&1; then
        ! lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1
    else
        ! netstat -ln 2>/dev/null | grep -q ":$port "
    fi
}

# Function to find available port
find_available_port() {
    local start_port=$1
    local port=$start_port
    while ! check_port $port; do
        port=$((port + 1))
        if [ $port -gt $((start_port + 100)) ]; then
            echo "❌ No available ports found in range $start_port-$((start_port + 100))"
            return 1
        fi
    done
    echo $port
}

# Display deployment options
echo "🎯 DEPLOYMENT OPTIONS:"
echo "====================="
echo ""
echo "1. Python HTTP Server (Most Reliable)"
echo "2. Node.js Simple Server (Feature Rich)"
echo "3. Node.js Full Server (Complete API)"
echo "4. Static File Server (Lightweight)"
echo "5. Auto-Select Best Option"
echo ""

# Get user choice or auto-select
if [ "$1" ]; then
    choice=$1
else
    read -p "Choose deployment method (1-5, default: 5): " choice
    choice=${choice:-5}
fi

echo ""
echo "🔍 DEPLOYMENT METHOD: $choice"
echo ""

case $choice in
    1)
        echo "🐍 DEPLOYING WITH PYTHON HTTP SERVER"
        echo "===================================="
        
        # Find available port
        port=$(find_available_port 8000)
        if [ $? -ne 0 ]; then
            echo "❌ Failed to find available port"
            exit 1
        fi
        
        echo "✅ Using port: $port"
        echo ""
        echo "🎉 PYTHON SERVER READY!"
        echo "======================"
        echo ""
        echo "🌐 Homepage: http://localhost:$port"
        echo "📊 Dashboard: http://localhost:$port/dashboard/"
        echo "📝 Templates: http://localhost:$port/templates.html"
        echo "💰 Payment: http://localhost:$port/payment-dashboard.html"
        echo ""
        echo "✅ Features Available:"
        echo "   • Conversion-optimized homepage"
        echo "   • Interactive template showcase"
        echo "   • Live analytics dashboard"
        echo "   • Payment system demo"
        echo "   • Mobile-responsive design"
        echo ""
        echo "📱 Test on mobile: http://[your-ip]:$port"
        echo ""
        echo "Press Ctrl+C to stop the server"
        echo "==============================="
        echo ""
        
        cd public
        python3 -m http.server $port
        ;;
        
    2)
        echo "⚡ DEPLOYING WITH NODE.JS SIMPLE SERVER"
        echo "======================================"
        
        # Check if Node.js is available
        if ! command -v node >/dev/null 2>&1; then
            echo "❌ Node.js not found. Falling back to Python server..."
            exec $0 1
        fi
        
        # Find available port
        port=$(find_available_port 3000)
        if [ $? -ne 0 ]; then
            echo "❌ Failed to find available port"
            exit 1
        fi
        
        echo "✅ Using port: $port"
        
        PORT=$port node deploy-nodejs-simple.js
        ;;
        
    3)
        echo "🏢 DEPLOYING WITH NODE.JS FULL SERVER"
        echo "====================================="
        
        # Check if Node.js and npm are available
        if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
            echo "❌ Node.js/npm not found. Falling back to Python server..."
            exec $0 1
        fi
        
        echo "🔧 Installing dependencies..."
        npm install --silent
        
        if [ $? -ne 0 ]; then
            echo "⚠️  npm install failed. Trying simple server..."
            exec $0 2
        fi
        
        echo "🚀 Starting full Node.js server..."
        npm start
        ;;
        
    4)
        echo "📁 DEPLOYING WITH STATIC FILE SERVER"
        echo "===================================="
        
        # Try to use any available static server
        port=$(find_available_port 8080)
        if [ $? -ne 0 ]; then
            echo "❌ Failed to find available port"
            exit 1
        fi
        
        echo "✅ Using port: $port"
        
        # Try various static server options
        if command -v http-server >/dev/null 2>&1; then
            echo "🌐 Using http-server..."
            cd public && http-server -p $port
        elif command -v serve >/dev/null 2>&1; then
            echo "🌐 Using serve..."
            cd public && serve -p $port
        else
            echo "🐍 Using Python fallback..."
            cd public && python3 -m http.server $port
        fi
        ;;
        
    5|*)
        echo "🤖 AUTO-SELECTING BEST DEPLOYMENT METHOD"
        echo "========================================"
        
        # Auto-select based on available tools
        if command -v node >/dev/null 2>&1; then
            echo "✅ Node.js detected - using simple server"
            exec $0 2
        elif command -v python3 >/dev/null 2>&1; then
            echo "✅ Python3 detected - using HTTP server"
            exec $0 1
        elif command -v python >/dev/null 2>&1; then
            echo "✅ Python detected - using HTTP server"
            cd public && python -m SimpleHTTPServer 8000
        else
            echo "❌ No suitable server found"
            echo "Please install Node.js or Python3"
            exit 1
        fi
        ;;
esac