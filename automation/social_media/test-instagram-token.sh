#!/bin/bash

# Quick Instagram Token Test

cd "/media/wolfy/D260DD2060DD0BDB/Datas/2025 Projects/AppBuildFlutterVscodiumClaude/Hub_App_Shop_Integ/automation/social_media"

source .env

echo ""
echo "🔍 Testing Instagram Token..."
echo ""

curl -s "https://graph.facebook.com/v18.0/76216363129?fields=id,username,name,followers_count,media_count&access_token=$INSTAGRAM_ACCESS_TOKEN" | jq '.'

echo ""
