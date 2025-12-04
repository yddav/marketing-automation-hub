#!/usr/bin/env node

/**
 * FINDERR Timeline Clarity Update Script
 * Agent C: Timeline Clarity Specialist
 * Mission: Add Q1/Q2 2026 timeline and detailed feature descriptions
 */

const fs = require('fs');
const path = require('path');

const FILE_PATH = path.join(__dirname, 'finderr-prelaunch-templates.js');
const BACKUP_PATH = path.join(__dirname, 'finderr-prelaunch-templates.js.before_timeline_updates');

console.log('🔄 FINDERR Timeline Clarity Updates Starting...\n');

// Read the file
let content = fs.readFileSync(FILE_PATH, 'utf8');

// Create backup if it doesn't exist
if (!fs.existsSync(BACKUP_PATH)) {
    fs.writeFileSync(BACKUP_PATH, content, 'utf8');
    console.log('✅ Backup created:', BACKUP_PATH, '\n');
}

// Define all replacements
const replacements = [
    {
        name: 'Instagram problem template - Add detailed v5.0 & v6.0 timeline',
        old: `🔮 GPS tracking coming Q1 2026 (v5.0)

🧠 From UNTRAPD.COM - Building the future of Android security.

🧠 UNTRAPD.COM - Your intelligence hub unleashed`,
        new: `🔮 COMING SOON:
📍 v5.0 (Q1 2026): GPS Tracking Suite
  • Real-time GPS location tracking
  • Location history with timeline view
  • Geofencing alerts (notify when phone enters/leaves area)
  • Last known location before battery dies

🌐 v6.0 (Q2 2026): Mesh Network Recovery
  • AirTag-style crowdsourced location
  • Leverage 1+ billion Android devices as mesh network
  • Offline Bluetooth beacon broadcasting
  • Works even when phone is offline or powered off

💰 First 5,000 subscribers get v5.0 & v6.0 FREE!
⚠️ After 5,000: v5.0 (+$3/mo) & v6.0 (+$4/mo) become paid add-ons

🧠 UNTRAPD.COM - Your intelligence hub unleashed`
    },

    {
        name: 'TikTok problem template - Add v5.0 & v6.0 timeline',
        old: `🔮 GPS tracking coming Q1 2026!`,
        new: `🔮 COMING SOON (FREE for first 5,000!):
📍 v5.0 (Q1 2026): GPS Tracking Suite
🌐 v6.0 (Q2 2026): Mesh Network Recovery (AirTag-style)`
    },

    {
        name: 'Twitter problem template - Add v5.0 & v6.0 timeline',
        old: `🔮 GPS tracking coming Q1 2026`,
        new: `🔮 COMING SOON (FREE for first 5,000):
v5.0 (Q1 2026): GPS Tracking Suite
v6.0 (Q2 2026): Mesh Network Recovery`
    },

    {
        name: 'TikTok solution template - Add detailed timeline',
        old: `🔮 GPS tracking + remote lock coming Q1 2026!`,
        new: `🔮 COMING SOON (FREE for first 5,000!):
📍 v5.0 (Q1 2026): GPS Suite (real-time, history, geofencing)
🌐 v6.0 (Q2 2026): Mesh Network (AirTag-style crowdsourcing)`
    },

    {
        name: 'Twitter solution template - Add detailed upgrades',
        old: `🔮 GPS tracking + remote lock coming Q1 2026 (free upgrade!)`,
        new: `🔮 FREE UPGRADES for first 5,000:
v5.0 (Q1 2026): GPS Tracking Suite
v6.0 (Q2 2026): Mesh Network Recovery
⚠️ After 5,000: +$3/mo & +$4/mo add-ons`
    },

    {
        name: 'Brand Instagram - Expand v5.0 & v6.0 feature descriptions',
        old: `🔮 V5.0 (Q1 2026): GPS tracking + remote lock
🔮 V6.0 (Q2 2026): Bluetooth mesh network`,
        new: `🔮 V5.0 (Q1 2026): GPS Tracking Suite
  • Real-time GPS location tracking
  • Location history with timeline view
  • Geofencing alerts
  • Last known location before battery dies
  • Find My Phone on steroids

🔮 V6.0 (Q2 2026): Mesh Network Recovery
  • AirTag-style crowdsourced location
  • 1+ billion Android devices as mesh network
  • Offline Bluetooth beacon broadcasting
  • Anonymous location reports from nearby devices
  • Works even when phone is offline or powered off`
    },

    {
        name: 'Brand Facebook - Expand early adopter bonus',
        old: `• V5.0 (Q1 2026): GPS tracking + remote lock - FREE!
• V6.0 (Q2 2026): Bluetooth mesh network - FREE!`,
        new: `• V5.0 (Q1 2026): GPS Tracking Suite - Real-time location, geofencing, history - FREE!
• V6.0 (Q2 2026): Mesh Network Recovery - AirTag-style crowdsourced recovery - FREE!`
    },

    {
        name: 'Brand Twitter - Add detailed timeline',
        old: `🔮 GPS tracking + remote lock coming Q1 2026 (v5.0)`,
        new: `🔮 COMING SOON (FREE for first 5,000):
v5.0 (Q1 2026): GPS Tracking Suite - Real-time, history, geofencing
v6.0 (Q2 2026): Mesh Network Recovery - AirTag-style crowdsourcing`
    },

    {
        name: 'Incentives Instagram - Expand early adopter bonus',
        old: `🔮 EARLY ADOPTER BONUS: Free GPS tracking upgrade (v5.0 - Q1 2026) for first 5,000 subscribers!`,
        new: `🔮 EARLY ADOPTER BONUS (FIRST 5,000 ONLY):
• v5.0 (Q1 2026): GPS Tracking Suite - Real-time location, history, geofencing - FREE!
• v6.0 (Q2 2026): Mesh Network Recovery - AirTag-style crowdsourced location - FREE!
⚠️ After 5,000: v5.0 (+$3/mo) & v6.0 (+$4/mo) become paid add-ons`
    },

    {
        name: 'Pricing Instagram - Expand coming soon features',
        old: `🔮 COMING Q1 2026 (FREE FOR SUBSCRIBERS):
• GPS tracking + remote lock (v5.0)
• Then you'll have SAME features as competitors at 30-50% lower price!`,
        new: `🔮 COMING SOON (FREE FOR FIRST 5,000 SUBSCRIBERS):
📍 v5.0 (Q1 2026): GPS Tracking Suite
  • Real-time GPS location tracking
  • Location history (7-30 days)
  • Geofencing with custom zones
  • Last known location before battery dies

🌐 v6.0 (Q2 2026): Mesh Network Recovery
  • AirTag-style crowdsourced location
  • 1+ billion Android devices as mesh network
  • Works even when phone offline

⚠️ After 5,000: v5.0 (+$3/mo) & v6.0 (+$4/mo) become paid add-ons
Then you'll have SAME features as competitors at 30-50% lower price!`
    },

    {
        name: 'Pricing Twitter - Add v5.0 & v6.0 timeline',
        old: `🔮 GPS tracking coming Q1 2026 (free upgrade!)`,
        new: `🔮 FREE for first 5,000:
v5.0 (Q1 2026): GPS Tracking Suite
v6.0 (Q2 2026): Mesh Network Recovery
⚠️ After 5,000: +$3/mo & +$4/mo`
    },

    {
        name: 'Features Twitter - Add timeline and pricing warning',
        old: `🔮 Coming Q1 2026:
📍 GPS tracking
🔒 Remote lock`,
        new: `🔮 FREE for First 5,000:
📍 v5.0 (Q1 2026): GPS Tracking Suite
🌐 v6.0 (Q2 2026): Mesh Network Recovery
⚠️ After 5,000: +$3/mo & +$4/mo add-ons`
    },

    {
        name: 'Day 16 early adopter bonus - Expand features',
        old: `First 5,000 subscribers get GPS tracking + remote lock (v5.0) FREE when it launches Q1 2026!`,
        new: `First 5,000 subscribers get:
📍 v5.0 (Q1 2026): GPS Tracking Suite - FREE
🌐 v6.0 (Q2 2026): Mesh Network Recovery - FREE
⚠️ After 5,000: These become +$3/mo & +$4/mo add-ons`
    },

    {
        name: 'Day 17 GPS tracking - Add v6.0',
        old: `🔮 Free GPS tracking when v5.0 launches`,
        new: `🔮 Free v5.0 (GPS Suite) & v6.0 (Mesh Network) upgrades`
    },

    {
        name: 'Day 18 GPS upgrade - Add v6.0',
        old: `🔮 Free GPS upgrade coming Q1 2026`,
        new: `🔮 Free v5.0 (GPS Suite) & v6.0 (Mesh Network) - Q1/Q2 2026`
    },

    {
        name: 'Day 19 GPS upgrade - Add v6.0',
        old: `✅ Free GPS upgrade (v5.0)`,
        new: `✅ Free v5.0 (GPS Suite) & v6.0 (Mesh Network)`
    },

    {
        name: 'Day 20 production timeline - Add v6.0',
        old: `📅 Q1 2026: Add GPS tracking (v5.0)`,
        new: `📅 Q1 2026: v5.0 GPS Tracking Suite
📅 Q2 2026: v6.0 Mesh Network Recovery`
    },

    {
        name: 'Day 21 GPS tracking - Expand to both versions',
        old: `🔮 Free GPS tracking coming Q1 2026`,
        new: `🔮 v5.0 (Q1 2026): GPS Suite
🌐 v6.0 (Q2 2026): Mesh Network
💰 FREE for first 5,000!`
    },

    {
        name: 'Day 24 GPS upgrade - Add v6.0',
        old: `✅ Free GPS upgrade (v5.0)`,
        new: `✅ Free v5.0 (GPS Suite) & v6.0 (Mesh Network)`
    },

    {
        name: 'Day 25 feature voting - Add v6.0',
        old: `🔮 Free GPS upgrade`,
        new: `🔮 Free v5.0 & v6.0 upgrades`
    },

    {
        name: 'Day 26 Founder\'s Circle - Expand benefits',
        old: `✅ Free v5.0 & v6.0 upgrades`,
        new: `✅ v5.0 (GPS Suite) & v6.0 (Mesh Network) - FREE
✅ Lifetime price lock at $8.99/month`
    },

    {
        name: 'Day 29 final hours - Add v6.0',
        old: `✅ Free GPS upgrade`,
        new: `✅ Free v5.0 (GPS Suite) & v6.0 (Mesh Network) upgrades`
    }
];

// Apply all replacements
let changeCount = 0;
let successCount = 0;
let failCount = 0;

replacements.forEach((replacement, index) => {
    const found = content.includes(replacement.old);

    if (found) {
        content = content.replace(replacement.old, replacement.new);
        console.log(`✅ ${index + 1}. ${replacement.name}`);
        successCount++;
    } else {
        console.log(`⚠️  ${index + 1}. ${replacement.name} - NOT FOUND (may have been already updated)`);
        failCount++;
    }

    changeCount++;
});

// Write the updated content
fs.writeFileSync(FILE_PATH, content, 'utf8');

console.log('\n📊 Summary of Changes:');
console.log(`   • Total updates attempted: ${changeCount}`);
console.log(`   • Successful updates: ${successCount}`);
console.log(`   • Already updated/not found: ${failCount}`);
console.log('');
console.log('✅ Timeline clarity updates applied successfully!');
console.log('');
console.log('📝 Key Changes:');
console.log('   • Added Q1 2026 timeline for v5.0 GPS Tracking Suite');
console.log('   • Added Q2 2026 timeline for v6.0 Mesh Network Recovery');
console.log('   • Expanded GPS feature descriptions (5+ capabilities)');
console.log('   • Expanded Mesh Network descriptions (AirTag comparison)');
console.log('   • Clarified early adopter FREE benefit (first 5,000)');
console.log('   • Added "After 5,000" pricing change warnings (+$3/mo & +$4/mo)');
console.log('   • Educational messaging about mesh network (1+ billion devices)');
console.log('');
console.log('💾 Files:');
console.log(`   Backup: ${BACKUP_PATH}`);
console.log(`   Updated: ${FILE_PATH}`);
console.log('');
console.log('🎯 Next Steps:');
console.log('   1. Review changes with: git diff automation/social_media/finderr-prelaunch-templates.js');
console.log('   2. Test content generation to verify updates');
console.log('   3. Commit changes when ready');
console.log('');
