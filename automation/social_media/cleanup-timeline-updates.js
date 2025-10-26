#!/usr/bin/env node

/**
 * FINDERR Timeline Cleanup Script
 * Fix remaining issues from initial timeline updates
 */

const fs = require('fs');
const path = require('path');

const FILE_PATH = path.join(__dirname, 'finderr-prelaunch-templates.js');

console.log('🔧 FINDERR Timeline Cleanup Starting...\n');

// Read the file
let content = fs.readFileSync(FILE_PATH, 'utf8');

// Fix 1: Remove duplicate UNTRAPD signatures throughout the file
console.log('1️⃣ Removing duplicate UNTRAPD.COM signatures...');
const duplicateSignaturePattern = /🧠 UNTRAPD\.COM - Your intelligence hub unleashed\n\n🧠 UNTRAPD\.COM - Your intelligence hub unleashed/g;
content = content.replace(duplicateSignaturePattern, '🧠 UNTRAPD.COM - Your intelligence hub unleashed');

// Fix 2: Remove stray "(v5.0)" text in Instagram problem template
console.log('2️⃣ Removing stray (v5.0) text...');
content = content.replace('v6.0 (Q2 2026): Mesh Network Recovery (v5.0)', 'v6.0 (Q2 2026): Mesh Network Recovery');

// Fix 3: Fix Twitter problem template (line ~82 has old text)
console.log('3️⃣ Updating Twitter problem template...');
const oldTwitterProblem = `🔮 GPS tracking coming Q1 2026

🧠 From @untrapd.com - First of many premium Android apps.

Join 100 beta testers: hub.untrapd.com

🧠 UNTRAPD.COM - Your intelligence hub unleashed`;

const newTwitterProblem = `🔮 COMING SOON (FREE for first 5,000):
v5.0 (Q1 2026): GPS Tracking Suite
v6.0 (Q2 2026): Mesh Network Recovery

🧠 From @untrapd.com - First of many premium Android apps.

Join 100 beta testers: hub.untrapd.com`;

if (content.includes(oldTwitterProblem)) {
    content = content.replace(oldTwitterProblem, newTwitterProblem);
    console.log('   ✅ Twitter problem template updated');
} else {
    console.log('   ⚠️  Twitter problem template already updated');
}

// Fix 4: Brand Instagram - Replace old v5.0/v6.0 text
console.log('4️⃣ Updating Brand Instagram template...');
const oldBrandInsta = `🔮 V5.0 (Q1 2026): GPS tracking + remote lock
🔮 V6.0 (Q2 2026): Bluetooth mesh network`;

const newBrandInsta = `🔮 V5.0 (Q1 2026): GPS Tracking Suite
  • Real-time GPS location tracking
  • Location history with timeline view
  • Geofencing alerts
  • Last known location before battery dies

🔮 V6.0 (Q2 2026): Mesh Network Recovery
  • AirTag-style crowdsourced location
  • 1+ billion Android devices as mesh network
  • Offline Bluetooth beacon
  • Works even when phone is offline`;

if (content.includes(oldBrandInsta)) {
    content = content.replace(oldBrandInsta, newBrandInsta);
    console.log('   ✅ Brand Instagram template updated');
} else {
    console.log('   ⚠️  Brand Instagram template already updated');
}

// Fix 5: Brand Facebook - Replace old v5.0/v6.0 text
console.log('5️⃣ Updating Brand Facebook template...');
const oldBrandFB = `• V5.0 (Q1 2026): GPS tracking + remote lock - FREE!
• V6.0 (Q2 2026): Bluetooth mesh network - FREE!`;

const newBrandFB = `• V5.0 (Q1 2026): GPS Tracking Suite - Real-time location, geofencing, history - FREE!
• V6.0 (Q2 2026): Mesh Network Recovery - AirTag-style crowdsourced recovery - FREE!`;

if (content.includes(oldBrandFB)) {
    content = content.replace(oldBrandFB, newBrandFB);
    console.log('   ✅ Brand Facebook template updated');
} else {
    console.log('   ⚠️  Brand Facebook template already updated');
}

// Fix 6: Pricing Instagram - Expand feature details
console.log('6️⃣ Updating Pricing Instagram template...');
const oldPricingInsta = `🔮 COMING Q1 2026 (FREE FOR SUBSCRIBERS):
• GPS tracking + remote lock (v5.0)
• Then you'll have SAME features as competitors at 30-50% lower price!`;

const newPricingInsta = `🔮 COMING SOON (FREE FOR FIRST 5,000 SUBSCRIBERS):
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
Then you'll have SAME features as competitors at 30-50% lower price!`;

if (content.includes(oldPricingInsta)) {
    content = content.replace(oldPricingInsta, newPricingInsta);
    console.log('   ✅ Pricing Instagram template updated');
} else {
    console.log('   ⚠️  Pricing Instagram template already updated');
}

// Fix 7: Features Twitter - Update timeline
console.log('7️⃣ Updating Features Twitter template...');
const oldFeaturesTwitter = `🔮 Coming Q1 2026:
📍 GPS tracking
🔒 Remote lock`;

const newFeaturesTwitter = `🔮 FREE for First 5,000:
📍 v5.0 (Q1 2026): GPS Tracking Suite
🌐 v6.0 (Q2 2026): Mesh Network Recovery
⚠️ After 5,000: +$3/mo & +$4/mo add-ons`;

if (content.includes(oldFeaturesTwitter)) {
    content = content.replace(oldFeaturesTwitter, newFeaturesTwitter);
    console.log('   ✅ Features Twitter template updated');
} else {
    console.log('   ⚠️  Features Twitter template already updated');
}

// Fix 8: Day 25 feature voting - Add v6.0
console.log('8️⃣ Updating Day 25 feature voting template...');
content = content.replace(/🔮 Free GPS upgrade(?!s)/g, '🔮 Free v5.0 & v6.0 upgrades');

// Fix 9: Remove any remaining old single GPS tracking mentions
console.log('9️⃣ Cleaning up remaining old GPS-only references...');
// Fix remaining standalone "GPS tracking" in favor of "GPS Tracking Suite"
content = content.replace(/GPS tracking(?! Suite)/gi, 'GPS Tracking Suite');

// Write the updated content
fs.writeFileSync(FILE_PATH, content, 'utf8');

console.log('\n✅ Timeline cleanup completed successfully!');
console.log('');
console.log('📝 Cleanup Actions:');
console.log('   • Removed duplicate UNTRAPD.COM signatures');
console.log('   • Fixed stray (v5.0) text in Instagram problem template');
console.log('   • Updated Twitter problem template with full timeline');
console.log('   • Expanded Brand Instagram v5.0/v6.0 descriptions');
console.log('   • Expanded Brand Facebook v5.0/v6.0 descriptions');
console.log('   • Expanded Pricing Instagram with detailed features');
console.log('   • Updated Features Twitter with timeline and pricing');
console.log('   • Fixed Day 25 feature voting references');
console.log('   • Standardized "GPS Tracking Suite" terminology');
console.log('');
console.log('🎯 Final Review:');
console.log('   Run: git diff automation/social_media/finderr-prelaunch-templates.js');
console.log('');
