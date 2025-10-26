#!/bin/bash

# Simple Instagram Token Converter
# Converts the short-lived token to long-lived (60 days)

APP_ID="738653215879612"
SHORT_TOKEN="EAAKfzRqLcbwBPZCTTcQbYMoZBKKWA0WcWkTaQnd1uukjEdAQaAaoUaYV1r1jcQP5geTF3hGZAzCaIlV3ovUsSwMnWcD00sunUlszVOEZB3TvIYf99aK6dZAlA1TNpYSgRE2byyulB8EOZAHEPGZB3Te8kexJPutbGP432oVhpKiN6rBNufNQymNK5SybQXlbwid196psPaU5Y4BV2Ox5IHakUmvbLsopQU8VfvKxkjiEBBfogiH4qNADLVzhI57u8n0oT15hvhI1hv9h0jJpaqNZAEO6"

echo ""
echo "🔄 Instagram Token Converter"
echo "=========================================="
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
echo "YOUR INSTAGRAM LONG-LIVED TOKEN:"
echo "=========================================="
echo "$LONG_LIVED_TOKEN"
echo "=========================================="
echo ""
echo "⏰ Valid for: $DAYS days"
echo ""
echo "📝 NEXT STEPS:"
echo "1. Copy the token above (between the === lines)"
echo "2. Update .env file: INSTAGRAM_ACCESS_TOKEN=token"
echo "3. Then we'll generate the Facebook token"
echo ""
