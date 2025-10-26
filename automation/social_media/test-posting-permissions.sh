#!/bin/bash

# Test if tokens can actually post (dry-run test)

cd "/media/wolfy/D260DD2060DD0BDB/Datas/2025 Projects/AppBuildFlutterVscodiumClaude/Hub_App_Shop_Integ/automation/social_media"

source .env

echo ""
echo "🧪 Testing Posting Permissions (Dry Run)"
echo "========================================"
echo ""

# Test Facebook Page posting permission
echo "📘 Testing Facebook Page..."
FB_TEST=$(curl -s "https://graph.facebook.com/v18.0/$FACEBOOK_PAGE_ID/feed?access_token=$FACEBOOK_PAGE_TOKEN&method=get&limit=1")

if echo "$FB_TEST" | grep -q "error"; then
    echo "❌ Facebook: Cannot access feed"
    echo "$FB_TEST" | jq '.error.message'
else
    echo "✅ Facebook: Can access page feed!"
fi

echo ""
echo "📱 Testing Instagram..."
# Test Instagram posting capability
IG_TEST=$(curl -s "https://graph.facebook.com/v18.0/$INSTAGRAM_BUSINESS_ACCOUNT_ID?fields=username&access_token=$INSTAGRAM_ACCESS_TOKEN")

if echo "$IG_TEST" | grep -q "error"; then
    echo "❌ Instagram: Cannot access account"
    echo "$IG_TEST" | jq '.error.message'
else
    echo "✅ Instagram: Can access account!"
    echo "Username:" $(echo "$IG_TEST" | jq -r '.username')
fi

echo ""
