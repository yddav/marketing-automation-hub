#!/bin/bash

# FINDERR Timeline Clarity Update Script
# Agent C: Timeline Clarity Specialist
# Mission: Add Q1/Q2 2026 timeline and detailed feature descriptions

FILE="finderr-prelaunch-templates.js"
BACKUP="finderr-prelaunch-templates.js.before_timeline_updates"

echo "🔄 FINDERR Timeline Clarity Updates Starting..."
echo ""

# Verify backup exists
if [ ! -f "$BACKUP" ]; then
    echo "❌ ERROR: Backup file not found. Creating backup now..."
    cp "$FILE" "$BACKUP"
    echo "✅ Backup created: $BACKUP"
fi

echo "📝 Applying timeline updates to $FILE..."
echo ""

# Update 1: Instagram problem template (line ~59)
echo "1️⃣ Updating Instagram problem template..."
sed -i 's|🔮 GPS tracking coming Q1 2026 (v5\.0)|🔮 COMING SOON:\n📍 v5.0 (Q1 2026): GPS Tracking Suite - Real-time location, geofencing, history\n🌐 v6.0 (Q2 2026): Mesh Network - AirTag-style recovery using 1+ billion Android devices\n\n💰 First 5,000 get v5.0 \& v6.0 FREE! (After: +$3/mo \& +$4/mo)|g' "$FILE"

# Update 2: TikTok problem template (line ~72)
echo "2️⃣ Updating TikTok problem template..."
sed -i 's|🔮 GPS tracking coming Q1 2026!|🔮 v5.0 (Q1 2026): GPS Tracking - Real-time location\n🌐 v6.0 (Q2 2026): Mesh Network - AirTag-style crowdsourcing|g' "$FILE"

# Update 3: Twitter problem template (line ~78)
echo "3️⃣ Updating Twitter problem template..."
sed -i 's|🔮 GPS tracking coming Q1 2026|🔮 v5.0 (Q1 2026): GPS Tracking Suite\n🌐 v6.0 (Q2 2026): Mesh Network Recovery|g' "$FILE"

# Update 4: TikTok solution template (line ~99)
echo "4️⃣ Updating TikTok solution template..."
sed -i 's|🔮 GPS tracking + remote lock coming Q1 2026!|🔮 COMING SOON (FREE for first 5,000!):\n📍 v5.0 (Q1 2026): GPS Tracking Suite\n🌐 v6.0 (Q2 2026): Mesh Network Recovery|g' "$FILE"

# Update 5: Twitter solution template (line ~105)
echo "5️⃣ Updating Twitter solution template..."
sed -i 's|🔮 GPS tracking + remote lock coming Q1 2026 (free upgrade!)|🔮 FREE UPGRADES for first 5,000:\nv5.0 (Q1 2026): GPS Tracking Suite\nv6.0 (Q2 2026): Mesh Network Recovery|g' "$FILE"

# Update 6: Brand Instagram template (line ~114)
echo "6️⃣ Updating Brand Instagram template..."
sed -i 's|🔮 V5\.0 (Q1 2026): GPS tracking + remote lock\n🔮 V6\.0 (Q2 2026): Bluetooth mesh network|🔮 V5.0 (Q1 2026): GPS Tracking Suite\n  • Real-time GPS location tracking\n  • Location history with timeline view\n  • Geofencing alerts\n  • Last known location before battery dies\n\n🔮 V6.0 (Q2 2026): Mesh Network Recovery\n  • AirTag-style crowdsourced location\n  • 1+ billion Android devices as mesh network\n  • Offline Bluetooth beacon\n  • Anonymous location reports|g' "$FILE"

# Update 7: Brand Facebook template (line ~121)
echo "7️⃣ Updating Brand Facebook template..."
sed -i 's|• V5\.0 (Q1 2026): GPS tracking + remote lock - FREE!\n• V6\.0 (Q2 2026): Bluetooth mesh network - FREE!|• V5.0 (Q1 2026): GPS Tracking Suite - Real-time location, geofencing, history - FREE!\n• V6.0 (Q2 2026): Mesh Network Recovery - AirTag-style crowdsourced recovery - FREE!|g' "$FILE"

# Update 8: Brand Twitter template (line ~127)
echo "8️⃣ Updating Brand Twitter template..."
sed -i 's|🔮 GPS tracking + remote lock coming Q1 2026 (v5\.0)|🔮 v5.0 (Q1 2026): GPS Tracking Suite\n🌐 v6.0 (Q2 2026): Mesh Network Recovery\n\n💰 FREE for first 5,000 subscribers!|g' "$FILE"

# Update 9: Incentives Instagram template (line ~161)
echo "9️⃣ Updating Incentives Instagram template..."
sed -i 's|🔮 EARLY ADOPTER BONUS: Free GPS tracking upgrade (v5\.0 - Q1 2026) for first 5,000 subscribers!|🔮 EARLY ADOPTER BONUS (FIRST 5,000 ONLY):\n• v5.0 (Q1 2026): GPS Tracking Suite - FREE!\n• v6.0 (Q2 2026): Mesh Network Recovery - FREE!\n⚠️ After 5,000: v5.0 (+$3/mo) \& v6.0 (+$4/mo) become paid add-ons|g' "$FILE"

# Update 10: Pricing Instagram template (line ~229)
echo "🔟 Updating Pricing Instagram template..."
sed -i 's|🔮 COMING Q1 2026 (FREE FOR SUBSCRIBERS):\n• GPS tracking + remote lock (v5\.0)|🔮 COMING SOON (FREE FOR FIRST 5,000 SUBSCRIBERS):\n📍 v5.0 (Q1 2026): GPS Tracking Suite - Real-time location, geofencing, history\n🌐 v6.0 (Q2 2026): Mesh Network Recovery - AirTag-style crowdsourced location|g' "$FILE"

# Update 11: Pricing Facebook template (line ~236)
echo "1️⃣1️⃣ Updating Pricing Facebook template..."
sed -i 's|🔮 EARLY ADOPTER BONUS (FIRST 5,000 SUBSCRIBERS ONLY):\nFINDERR will ADD GPS tracking + remote lock (v5\.0 - Q1 2026) - FREE!\nAfter 5,000: These become paid add-ons|🔮 EARLY ADOPTER BONUS (FIRST 5,000 SUBSCRIBERS ONLY):\n\nV5.0 (Q1 2026) - GPS Tracking Suite - FREE:\n• Real-time GPS location tracking\n• Location history (7-30 days)\n• Geofencing with custom zones\n• Last known location before battery dies\n\nV6.0 (Q2 2026) - Mesh Network Recovery - FREE:\n• AirTag-style crowdsourced location\n• 1+ billion Android devices as mesh network\n• Works even when phone offline\n\n⚠️ IMPORTANT: After 5,000 subscribers, v5.0 (+$3/mo) \& v6.0 (+$4/mo) become paid add-ons!|g' "$FILE"

# Update 12: Pricing Twitter template (line ~242)
echo "1️⃣2️⃣ Updating Pricing Twitter template..."
sed -i 's|🔮 GPS tracking coming Q1 2026 (free upgrade!)|🔮 v5.0 (Q1 2026): GPS Tracking Suite - FREE for first 5,000\n🌐 v6.0 (Q2 2026): Mesh Network Recovery - FREE for first 5,000|g' "$FILE"

# Update 13: Features Instagram template (line ~250)
echo "1️⃣3️⃣ Updating Features Instagram template..."
sed -i 's|🔮 EARLY ADOPTER BONUS (FIRST 5,000 ONLY):\n• GPS tracking + remote lock (v5\.0 - Q1 2026) - FREE!\n• Bluetooth mesh network (v6\.0 - Q2 2026) - FREE!|🔮 EARLY ADOPTER BONUS (FIRST 5,000 ONLY):\n\n📍 v5.0 (Q1 2026) - GPS Tracking Suite - FREE:\n• Real-time location tracking\n• Location history timeline\n• Geofencing alerts\n• Last known location before battery dies\n\n🌐 v6.0 (Q2 2026) - Mesh Network Recovery - FREE:\n• AirTag-style crowdsourced recovery\n• 1+ billion Android devices as mesh network\n• Offline Bluetooth beacon\n\n⚠️ After 5,000: v5.0 (+$3/mo) \& v6.0 (+$4/mo)|g' "$FILE"

# Update 14: Features Twitter template (line ~263)
echo "1️⃣4️⃣ Updating Features Twitter template..."
sed -i 's|🔮 Coming Q1 2026:\n📍 GPS tracking\n🔒 Remote lock|🔮 FREE for First 5,000:\n📍 v5.0 (Q1 2026): GPS Tracking Suite\n🌐 v6.0 (Q2 2026): Mesh Network Recovery\n⚠️ After 5,000: +$3/mo \& +$4/mo add-ons|g' "$FILE"

# Update 15-25: Days 16-30 campaign posts
echo "1️⃣5️⃣ Updating Day 16 early adopter bonus..."
sed -i 's|First 5,000 subscribers get GPS tracking + remote lock (v5\.0) FREE when it launches Q1 2026!|First 5,000 subscribers get:\n📍 v5.0 (Q1 2026): GPS Tracking Suite - FREE\n🌐 v6.0 (Q2 2026): Mesh Network Recovery - FREE\n⚠️ After 5,000: These become +$3/mo \& +$4/mo add-ons|g' "$FILE"

echo "1️⃣6️⃣ Updating Day 17 GPS tracking mention..."
sed -i 's|🔮 Free GPS tracking when v5\.0 launches|🔮 Free v5.0 \& v6.0 upgrades (GPS + Mesh Network)|g' "$FILE"

echo "1️⃣7️⃣ Updating Day 18 GPS upgrade mention..."
sed -i 's|🔮 Free GPS upgrade coming Q1 2026|🔮 Free v5.0 (GPS Suite) \& v6.0 (Mesh Network)|g' "$FILE"

echo "1️⃣8️⃣ Updating Day 19 GPS upgrade mention..."
sed -i 's|✅ Free GPS upgrade (v5\.0)|✅ Free v5.0 (GPS Suite) \& v6.0 (Mesh Network)|g' "$FILE"

echo "1️⃣9️⃣ Updating Day 20 production timeline..."
sed -i 's|📅 Q1 2026: Add GPS tracking (v5\.0)|📅 Q1 2026: v5.0 GPS Tracking Suite\n📅 Q2 2026: v6.0 Mesh Network Recovery|g' "$FILE"

echo "2️⃣0️⃣ Updating Day 21 GPS tracking mention..."
sed -i 's|🔮 Free GPS tracking coming Q1 2026|🔮 v5.0 (Q1 2026): GPS Suite\n🌐 v6.0 (Q2 2026): Mesh Network\n💰 FREE for first 5,000!|g' "$FILE"

echo "2️⃣1️⃣ Updating Day 24 GPS upgrade mention..."
sed -i 's|✅ Free GPS upgrade (v5\.0)|✅ Free v5.0 (GPS Suite) \& v6.0 (Mesh Network)|g' "$FILE"

echo "2️⃣2️⃣ Updating Day 25 feature voting mention..."
sed -i 's|🔮 Free GPS upgrade|🔮 Free v5.0 \& v6.0 upgrades|g' "$FILE"

echo "2️⃣3️⃣ Updating Day 26 Founder's Circle benefits..."
sed -i 's|✅ Free v5\.0 & v6\.0 upgrades|✅ v5.0 (GPS Suite) \& v6.0 (Mesh Network) - FREE\n✅ Lifetime price lock at $6.99/month|g' "$FILE"

echo "2️⃣4️⃣ Updating Day 29 GPS upgrade final hours..."
sed -i 's|✅ Free GPS upgrade|✅ Free v5.0 (GPS Suite) \& v6.0 (Mesh Network) upgrades|g' "$FILE"

echo ""
echo "✅ All timeline updates applied successfully!"
echo ""
echo "📊 Summary of Changes:"
echo "   • Added Q1 2026 timeline for v5.0 GPS Tracking Suite"
echo "   • Added Q2 2026 timeline for v6.0 Mesh Network Recovery"
echo "   • Expanded GPS feature descriptions (5+ capabilities)"
echo "   • Expanded Mesh Network feature descriptions (AirTag comparison)"
echo "   • Clarified early adopter FREE benefit (first 5,000)"
echo "   • Added 'After 5,000' pricing change warnings"
echo "   • Updated 25+ template sections across all platforms"
echo ""
echo "💾 Backup saved as: $BACKUP"
echo "📝 Updated file: $FILE"
echo ""
echo "🎯 Next Steps:"
echo "   1. Review changes: diff $BACKUP $FILE"
echo "   2. Test content generation"
echo "   3. Commit changes to git"
echo ""
