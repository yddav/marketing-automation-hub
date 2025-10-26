#!/bin/bash

# Unified Token Converter - Works for BOTH Instagram AND Facebook!
# Converts the short-lived token to long-lived (60 days)

APP_ID="738653215879612"
SHORT_TOKEN="EAAKfzRqLcbwBP7zdCXEBX8BQKjCA3Y3uQjgCCtI9ZBHqZCjsP6FPzyI66ZBTxyEme96YRZAj2BEOPeMN6vRsqNZBm6iQbNSM3sthDtTZC8gJiZBmd1hbXNOl42V5Rv6MZCpISBHk6MiTkVhFAy4GoG3lUcmdTtLH51N45ecLLrZB4AWSUPsZBz2V1ZC3q0ZCyHbXbffQRrJYJ4LCqsjt7FaSVtTXZBZAlrZAKM4N7eZB4uh4L45THZABXyTe1QyV31yi7WTvSjZA1sX95aFarhiUbYr9TKyGX41PsvG9oZD"

echo ""
echo "🔄 UNIFIED Token Converter"
echo "=========================================="
echo "This token works for BOTH Instagram AND Facebook!"
echo ""
echo "Enter your App Secret (from Facebook Developer settings):"
read -r APP_SECRET

if [ -z "$APP_SECRET" ]; then
    echo "❌ App Secret is required!"
    exit 1
fi

echo ""
echo "🔄 Converting to long-lived token..."
echo ""

# Make the API call
RESPONSE=$(curl -s "https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${APP_ID}&client_secret=${APP_SECRET}&fb_exchange_token=${SHORT_TOKEN}")

# Check if there's an error
if echo "$RESPONSE" | grep -q "error"; then
    echo "❌ ERROR:"
    echo "$RESPONSE" | jq '.'
    exit 1
fi

# Extract the token
LONG_LIVED_TOKEN=$(echo "$RESPONSE" | jq -r '.access_token')
EXPIRES_IN=$(echo "$RESPONSE" | jq -r '.expires_in')

if [ -z "$LONG_LIVED_TOKEN" ] || [ "$LONG_LIVED_TOKEN" == "null" ]; then
    echo "❌ Failed to extract token from response:"
    echo "$RESPONSE"
    exit 1
fi

DAYS=$((EXPIRES_IN / 86400))

echo "✅ SUCCESS!"
echo ""
echo "=========================================="
echo "YOUR UNIFIED LONG-LIVED TOKEN:"
echo "=========================================="
echo "$LONG_LIVED_TOKEN"
echo "=========================================="
echo ""
echo "⏰ Valid for: $DAYS days"
echo ""
echo "🎯 This token works for:"
echo "   ✅ Instagram posting (@untrapd.hub)"
echo "   ✅ Facebook posting (Untrapd Hub page)"
echo ""
echo "📝 NEXT STEPS:"
echo "1. Copy the token above (between the === lines)"
echo "2. I'll update your .env file with this token for BOTH:"
echo "   - INSTAGRAM_ACCESS_TOKEN"
echo "   - FACEBOOK_PAGE_TOKEN"
echo "3. Then we'll validate and launch your campaign!"
echo ""
