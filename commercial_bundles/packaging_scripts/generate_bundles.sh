#!/bin/bash

# App Marketing Automation Hub - Commercial Bundle Generator
# Generates production-ready commercial bundles for immediate sale

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BUNDLES_DIR="$PROJECT_ROOT"
SOURCE_DIR="$(dirname "$PROJECT_ROOT")"

echo "🚀 EMERGENCY BUNDLE GENERATION - 24 HOUR LAUNCH MODE"
echo "=================================================="

# Create timestamps
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
VERSION="v1.0.0"

# Function to create ZIP with checksums
create_bundle_zip() {
    local bundle_name=$1
    local bundle_dir=$2
    local target_size=$3
    
    echo "📦 Packaging $bundle_name bundle..."
    
    cd "$BUNDLES_DIR"
    
    # Create ZIP with compression
    zip -r "${bundle_name}_${VERSION}_${TIMESTAMP}.zip" "$bundle_name/" -x "*.DS_Store*" "*/node_modules/*" "*/.git/*"
    
    # Generate MD5 checksum
    md5sum "${bundle_name}_${VERSION}_${TIMESTAMP}.zip" > "${bundle_name}_${VERSION}_${TIMESTAMP}.md5"
    
    # Get file size
    local size=$(du -h "${bundle_name}_${VERSION}_${TIMESTAMP}.zip" | cut -f1)
    echo "✅ $bundle_name bundle: $size (target: $target_size)"
    
    # Create symlink to latest version
    ln -sf "${bundle_name}_${VERSION}_${TIMESTAMP}.zip" "${bundle_name}_latest.zip"
    ln -sf "${bundle_name}_${VERSION}_${TIMESTAMP}.md5" "${bundle_name}_latest.md5"
}

# Generate all bundles
echo "🔄 Generating Starter Bundle ($199 launch price)..."
create_bundle_zip "starter" "$BUNDLES_DIR/starter" "50MB"

echo "🔄 Generating Professional Bundle ($299 launch price)..."
create_bundle_zip "professional" "$BUNDLES_DIR/professional" "200MB"

echo "🔄 Generating Enterprise Bundle ($597 launch price)..."
create_bundle_zip "enterprise" "$BUNDLES_DIR/enterprise" "500MB"

# Generate bundle manifest
echo "📄 Creating bundle manifest..."
cat > "$BUNDLES_DIR/bundle_manifest.json" << EOF
{
  "generated": "$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")",
  "version": "$VERSION",
  "timestamp": "$TIMESTAMP",
  "bundles": {
    "starter": {
      "price": {
        "regular": 297,
        "launch": 199,
        "currency": "USD"
      },
      "file": "starter_${VERSION}_${TIMESTAMP}.zip",
      "checksum": "starter_${VERSION}_${TIMESTAMP}.md5",
      "target_size": "50MB",
      "description": "Core content templates, brand system, email sequences, quick start guide"
    },
    "professional": {
      "price": {
        "regular": 497,
        "launch": 299,
        "currency": "USD"
      },
      "file": "professional_${VERSION}_${TIMESTAMP}.zip",
      "checksum": "professional_${VERSION}_${TIMESTAMP}.md5",
      "target_size": "200MB",
      "description": "Complete content system, analytics dashboard, API guides, social automation"
    },
    "enterprise": {
      "price": {
        "regular": 997,
        "launch": 597,
        "currency": "USD"
      },
      "file": "enterprise_${VERSION}_${TIMESTAMP}.zip",
      "checksum": "enterprise_${VERSION}_${TIMESTAMP}.md5",
      "target_size": "500MB",
      "description": "Full source code, multi-agent framework, production configs, consultation materials"
    }
  },
  "launch_ready": true,
  "emergency_packaging": true,
  "ready_for_sale": "2025-01-28T00:00:00.000Z"
}
EOF

echo ""
echo "🎉 EMERGENCY BUNDLE GENERATION COMPLETE!"
echo "========================================"
echo "✅ Starter Bundle: Ready for $199 launch"
echo "✅ Professional Bundle: Ready for $299 launch"  
echo "✅ Enterprise Bundle: Ready for $597 launch"
echo ""
echo "📦 Files generated:"
echo "   - starter_${VERSION}_${TIMESTAMP}.zip + .md5"
echo "   - professional_${VERSION}_${TIMESTAMP}.zip + .md5"
echo "   - enterprise_${VERSION}_${TIMESTAMP}.zip + .md5"
echo "   - bundle_manifest.json"
echo ""
echo "🚀 READY FOR IMMEDIATE SALE - 24 HOUR DEADLINE MET!"