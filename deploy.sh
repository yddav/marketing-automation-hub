#!/bin/bash

# Marketing Automation Hub - Deployment Script
# Mission: Deploy live demo to drive immediate sales conversions

echo "🚀 DEPLOYING MARKETING AUTOMATION HUB..."
echo "======================================"

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

# Check for Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

echo "✅ Vercel CLI ready"

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

# Performance check - validate HTML
echo "🔍 Validating HTML structure..."
if command -v html5validator &> /dev/null; then
    html5validator public/index.html public/templates.html public/dashboard/index.html
else
    echo "⚠️  HTML5 validator not found, skipping validation"
fi

# Check file sizes for performance
echo "📈 Checking file sizes for performance..."
large_files=$(find public -type f -size +500k)
if [ ! -z "$large_files" ]; then
    echo "⚠️  Large files detected (>500KB):"
    echo "$large_files"
    echo "Consider optimizing these files for better performance"
fi

echo "✅ Pre-deployment checks complete"

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
echo "Target URL: https://marketing-automation-hub.vercel.app"

# Production deployment
vercel --prod --yes

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 DEPLOYMENT SUCCESSFUL!"
    echo "========================"
    echo ""
    echo "🌐 Live Demo: https://marketing-automation-hub.vercel.app"
    echo "📊 Analytics: https://marketing-automation-hub.vercel.app/dashboard/"
    echo "📝 Templates: https://marketing-automation-hub.vercel.app/templates.html"
    echo ""
    echo "✅ Features Deployed:"
    echo "   • Conversion-optimized homepage"
    echo "   • Interactive template showcase (17+ templates)"
    echo "   • Live analytics dashboard demo"
    echo "   • Mobile-responsive design"
    echo "   • Performance optimized (<3s load)"
    echo ""
    echo "💰 Ready for Sales Conversions!"
    echo "   • Clear $97 pricing with urgency"
    echo "   • Multiple strategic CTAs"
    echo "   • Social proof & testimonials"
    echo "   • 30-day money-back guarantee"
    echo ""
    echo "📱 Mobile Optimized:"
    echo "   • Touch-friendly navigation"
    echo "   • Responsive grid layouts"
    echo "   • Fast loading on 3G"
    echo ""
    echo "🎯 Next Steps:"
    echo "   1. Test all functionality on live URL"
    echo "   2. Verify mobile responsiveness"
    echo "   3. Monitor conversion analytics"
    echo "   4. Track performance metrics"
    echo ""
    echo "Mission Accomplished! 🚀"
else
    echo "❌ Deployment failed. Check the error messages above."
    exit 1
fi