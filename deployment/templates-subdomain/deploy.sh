#!/bin/bash

# templates.untrapd.com Deployment Script
# Deploy high-converting marketing templates landing page

echo "🚀 Deploying Marketing Templates to templates.untrapd.com"
echo "=================================================="

# Create deployment directory
mkdir -p dist
echo "✅ Created deployment directory"

# Copy optimized public files
cp -r ../../public/* dist/
echo "✅ Copied public files"

# Update production URLs and configurations
sed -i 's/localhost:8090/templates.untrapd.com/g' dist/index.html
sed -i 's/GA_MEASUREMENT_ID/G-UNTRAPD-TEMPLATES/g' dist/index.html
echo "✅ Updated production configurations"

# Optimize images (if imagemin available)
if command -v imagemin &> /dev/null; then
    echo "🖼️  Optimizing images..."
    imagemin dist/images/* --out-dir=dist/images/
fi

# Copy Netlify configuration
cp netlify.toml dist/
echo "✅ Added Netlify configuration"

# Create deployment info
cat > dist/deployment-info.json << EOF
{
  "site": "templates.untrapd.com",
  "deployed_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "version": "1.0.0",
  "product": "Marketing Templates Landing Page",
  "price": "$97",
  "features": [
    "17+ Marketing Templates",
    "50+ A/B Test Variations", 
    "$1,148 Value Stack",
    "30-Day Money Back Guarantee"
  ]
}
EOF
echo "✅ Created deployment info"

echo ""
echo "🌐 Deployment prepared for templates.untrapd.com"
echo "📁 Files ready in: ./dist/"
echo ""
echo "Next steps:"
echo "1. Push to Git repository"
echo "2. Connect to Netlify/Vercel"
echo "3. Configure DNS: CNAME templates -> main hosting"
echo "4. Update analytics tracking ID"
echo ""
echo "✨ Ready to launch your $97 marketing templates product!"