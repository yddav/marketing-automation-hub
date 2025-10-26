#!/bin/bash

# Marketing Automation Hub - Local Demo Server
# Mission: Rapid local deployment for immediate demonstration

echo "🚀 LAUNCHING MARKETING AUTOMATION HUB DEMO..."
echo "=============================================="

# Check if we're in the right directory
if [ ! -f "vercel.json" ]; then
    echo "❌ Error: vercel.json not found. Run this script from the project root."
    exit 1
fi

# Check if public directory exists
if [ ! -d "public" ]; then
    echo "❌ Error: public directory not found."
    exit 1
fi

echo "✅ Project structure verified"

# Validate deployment files
echo "🔍 Validating deployment files..."

required_files=(
    "public/index.html"
    "public/templates.html"
    "public/dashboard/index.html"
    "public/css/main.css"
    "public/css/templates.css"
    "public/js/templates.js"
    "public/content_templates/content-schema.json"
)

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Missing required file: $file"
        exit 1
    fi
done

echo "✅ All required files present"

# Count templates for verification
template_count=$(find public/content_templates -name "*.json" -not -name "content-schema.json" | wc -l)
echo "📊 Found $template_count template files"

echo "✅ Pre-deployment checks complete"

# Launch local server
echo "🚀 Starting local demo server..."
echo "Target: http://localhost:8000"

cd public

echo ""
echo "🎉 DEMO SERVER READY!"
echo "===================="
echo ""
echo "🌐 Homepage: http://localhost:8000"
echo "📊 Analytics: http://localhost:8000/dashboard/"
echo "📝 Templates: http://localhost:8000/templates.html"
echo ""
echo "✅ Features Available:"
echo "   • Conversion-optimized homepage"
echo "   • Interactive template showcase (17+ templates)"
echo "   • Live analytics dashboard demo"
echo "   • Mobile-responsive design"
echo "   • Performance optimized"
echo ""
echo "💰 Ready for Sales Demo!"
echo "   • Clear $97 pricing display"
echo "   • Multiple strategic CTAs"
echo "   • Social proof & testimonials"
echo "   • Professional presentation"
echo ""
echo "📱 Test on mobile: http://[your-ip]:8000"
echo ""
echo "Press Ctrl+C to stop the server"
echo "==============================="

# Start Python HTTP server
python3 -m http.server 8000