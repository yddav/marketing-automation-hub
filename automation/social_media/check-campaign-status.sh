#!/bin/bash

echo "=========================================="
echo "🐦 FINDERR Twitter Campaign Status"
echo "=========================================="
echo ""

# Check if cron job is active
echo "📅 Cron Job:"
if crontab -l | grep -q "daily-twitter-scheduler"; then
    echo "   ✅ Active (runs daily at 9:00 AM)"
    crontab -l | grep twitter
else
    echo "   ❌ Not found!"
fi
echo ""

# Check tracking file
echo "📊 Campaign Progress:"
if [ -f "twitter-campaign-tracking.json" ]; then
    PUBLISHED=$(cat twitter-campaign-tracking.json | grep -o "day[0-9]*-twitter" | wc -l)
    FAILED=$(cat twitter-campaign-tracking.json | grep -o "\"postId\":" | wc -l)
    echo "   ✅ Published: $PUBLISHED tweets"
    echo "   ❌ Failed: $FAILED tweets"
    echo "   📅 Remaining: $((90 - PUBLISHED)) tweets"
else
    echo "   ⚠️  No tracking file yet"
fi
echo ""

# Check last run log
echo "📝 Last Run:"
if [ -f "/tmp/twitter-campaign.log" ]; then
    echo "   Last 10 lines:"
    tail -10 /tmp/twitter-campaign.log
else
    echo "   ⚠️  No log file yet (first run at 9 AM tomorrow)"
fi
echo ""

# Campaign dates
echo "📅 Campaign Timeline:"
echo "   Start: Oct 15, 2025"
echo "   End: Nov 13, 2025"
echo "   Today: $(date +%Y-%m-%d)"
echo ""

echo "=========================================="
echo "✅ System Status: AUTONOMOUS & RUNNING"
echo "=========================================="
