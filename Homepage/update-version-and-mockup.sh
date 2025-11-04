#!/bin/bash

echo "🔄 UNTRAPD Homepage - Critical Enhancements"
echo "=========================================="
echo ""

echo "Step 1: Updating FINDERR version from v4.2.0+241 to v4.2.0+243..."
echo ""

# Update version references in all HTML files
for file in index.html apps/finderr/beta/index.html apps/finderr/index.html apps/index.html fr/index.html; do
  if [ -f "$file" ]; then
    # Update version references
    sed -i 's/v4\.2\.0+241/v4.2.0+243/g' "$file"
    sed -i 's/v241/v243/g' "$file"
    sed -i 's/+241/+243/g' "$file"
    echo "✅ Updated $file"
  else
    echo "⚠️  Warning: $file not found"
  fi
done

echo ""
echo "Step 2: Copying FINDERR emergency screen mockup..."
echo ""

# Create images directory if it doesn't exist
mkdir -p images

# Copy emergency screen mockup
if [ -f "../automation/social_media/screenshot_1.png" ]; then
  cp ../automation/social_media/screenshot_1.png images/finderr-emergency-mockup.png
  echo "✅ Emergency mockup copied to images/finderr-emergency-mockup.png"

  # Check file size
  size=$(du -h images/finderr-emergency-mockup.png | cut -f1)
  echo "   Image size: $size"
else
  echo "⚠️  Warning: Emergency screenshot not found at ../automation/social_media/screenshot_1.png"
  echo "   Please copy manually or check path"
fi

echo ""
echo "Step 3: Verification..."
echo ""

# Verify version updates
v241_count=$(grep -r 'v4\.2\.0+241\|v241\|+241' --include='*.html' 2>/dev/null | wc -l)
v243_count=$(grep -r 'v4\.2\.0+243\|v243\|+243' --include='*.html' 2>/dev/null | wc -l)

echo "📊 Version Update Summary:"
echo "   v4.2.0+241 references remaining: $v241_count (should be 0)"
echo "   v4.2.0+243 references added: $v243_count (should be 19+)"

if [ $v241_count -eq 0 ]; then
  echo "   ✅ All v241 references successfully updated!"
else
  echo "   ⚠️  Warning: Some v241 references still remain"
  echo "   Run: grep -r 'v241' --include='*.html' to find them"
fi

echo ""
echo "📁 Files Modified:"
ls -lh index.html apps/finderr/beta/index.html apps/finderr/index.html apps/index.html fr/index.html 2>/dev/null | awk '{print "   " $9 " (" $5 ")"}'

echo ""
echo "✅ Batch updates complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Update phone mockup src in index.html (search for 'phone-mockup' or similar)"
echo "2. Configure contact form with Netlify Forms (pages/contact.html)"
echo "3. Test changes at http://localhost:8080/index.html"
echo "4. Review HOMEPAGE_ENHANCEMENTS_2025-11-02.md for detailed instructions"
echo "5. Commit and deploy to production"
echo ""
echo "🚀 Ready to continue implementation!"
