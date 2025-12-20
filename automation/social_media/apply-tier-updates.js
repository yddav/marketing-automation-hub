const fs = require('fs');

const file = 'finderr-prelaunch-templates.js';
let content = fs.readFileSync(file, 'utf8');

console.log('Starting beta recruitment template updates...\n');

// Track changes
let changesApplied = [];

// 1. UPDATE URGENCY.INSTAGRAM TEMPLATE
const urgencyInstagramOld = `⏰ CURRENT STATUS: 15 out of 100 spots filled

Why RLS validation matters:
Before launching FINDERR v4.3.0 to production, we need real-world testing to ensure enterprise-grade security.`;

const urgencyInstagramNew = `🏆 3-TIER EARLY ADOPTER PROGRAM:

**TIER 1 (First 1,000)**: Founder's Circle
→ v5.0 & v6.0 FREE + v7.0 early access + price lock

**TIER 2 (1,001-3,000)**: Early Adopter
→ v5.0 & v6.0 FREE + v7.0 50% off

**TIER 3 (3,001-5,000)**: Launch Supporter
→ v5.0 & v6.0 FREE when they launch

**After 5,000**: Full pricing ($12.97/month for complete suite)

⏰ ONLY 85 SPOTS LEFT (15/100 filled)

Why RLS validation matters:
🔒 Before launching FINDERR v4.3.0 to production, we need real-world testing to ensure enterprise-grade security.`;

if (content.includes(urgencyInstagramOld)) {
  content = content.replace(urgencyInstagramOld, urgencyInstagramNew);
  changesApplied.push('✅ urgency.instagram: Added 3-tier structure');
}

// 2. UPDATE URGENCY.FACEBOOK TEMPLATE
const urgencyFacebookOld = `⏰ FIRST COME, FIRST SERVED: 15/100 spots filled

Join beta testing: hub.untrapd.com/apps/finderr/#join-beta`;

const urgencyFacebookNew = `⏰ FIRST COME, FIRST SERVED: 15/100 spots filled

⚠️ After 5,000 subscribers: v5.0 (+$3/mo) & v6.0 (+$4/mo) become paid add-ons!

Join beta testing: hub.untrapd.com/apps/finderr/#join-beta`;

if (content.includes(urgencyFacebookOld)) {
  content = content.replace(urgencyFacebookOld, urgencyFacebookNew);
  changesApplied.push('✅ urgency.facebook: Added \"After 5,000\" urgency');
}

// 3. UPDATE INCENTIVES.INSTAGRAM TEMPLATE
const incentivesInstagramOld = `🔮 EARLY ADOPTER BONUS: Free GPS tracking upgrade (v5.0 - Q1 2026) for first 5,000 subscribers!

🏆 UNTRAPD ECOSYSTEM STATUS:`;

const incentivesInstagramNew = `🔮 EARLY ADOPTER BONUS: Free GPS tracking upgrade (v5.0 - Q1 2026) for first 5,000 subscribers!

🏆 3-TIER EARLY ADOPTER PROGRAM:

**TIER 1 (First 1,000)**: Founder's Circle
→ v5.0 & v6.0 FREE + v7.0 early access + price lock

**TIER 2 (1,001-3,000)**: Early Adopter
→ v5.0 & v6.0 FREE + v7.0 50% off

**TIER 3 (3,001-5,000)**: Launch Supporter
→ v5.0 & v6.0 FREE when they launch

**After 5,000**: Full pricing ($12.97/month for complete suite)

🏆 UNTRAPD ECOSYSTEM STATUS:`;

if (content.includes(incentivesInstagramOld)) {
  content = content.replace(incentivesInstagramOld, incentivesInstagramNew);
  changesApplied.push('✅ incentives.instagram: Added 3-tier structure');
}

// 4. UPDATE INCENTIVES.FACEBOOK TEMPLATE
const incentivesFacebookOld = `🔮 EARLY ADOPTER BONUS (FIRST 5,000 SUBSCRIBERS ONLY):
• GPS tracking + remote lock (v5.0 - Q1 2026) - FREE!
• Bluetooth mesh network (v6.0 - Q2 2026) - FREE!
• After 5,000: These will be paid add-ons`;

const incentivesFacebookNew = `🏆 3-TIER EARLY ADOPTER PROGRAM:

**TIER 1 (First 1,000)**: Founder's Circle
→ v5.0 & v6.0 FREE + v7.0 early access + lifetime price lock

**TIER 2 (1,001-3,000)**: Early Adopter
→ v5.0 & v6.0 FREE + v7.0 50% off

**TIER 3 (3,001-5,000)**: Launch Supporter
→ v5.0 & v6.0 FREE when they launch

**After 5,000**: v5.0 (+$3/mo) & v6.0 (+$4/mo) become paid add-ons!`;

if (content.includes(incentivesFacebookOld)) {
  content = content.replace(incentivesFacebookOld, incentivesFacebookNew);
  changesApplied.push('✅ incentives.facebook: Added 3-tier structure with pricing');
}

// 5. UPDATE INCENTIVES.TWITTER TEMPLATE
const incentivesTwitterOld = `⏰ 85/100 spots left

hub.untrapd.com/apps/finderr

#BetaTesting #FINDERR`;

const incentivesTwitterNew = `🏆 TIER 1-3 early adopter benefits

⏰ 85/100 spots left
⚠️ After 5,000: paid add-ons

hub.untrapd.com/apps/finderr

#BetaTesting #FINDERR`;

if (content.includes(incentivesTwitterOld)) {
  content = content.replace(incentivesTwitterOld, incentivesTwitterNew);
  changesApplied.push('✅ incentives.twitter: Added tier reference and urgency');
}

// 6. UPDATE PROGRESS.INSTAGRAM TEMPLATE
const progressInstagramOld = `🎁 BETA REWARDS:
• 50% lifetime discount ($4.50/month forever)
• Free v4.3.0 testing access
• UNTRAPD ecosystem contributor status

🧠 From UNTRAPD.COM - Building Android security right`;

const progressInstagramNew = `🎁 BETA REWARDS:
• 50% lifetime discount ($4.50/month forever)
• Free v4.3.0 testing access
• UNTRAPD ecosystem contributor status
• Secure your tier NOW for FREE v5.0 & v6.0 upgrades

⚠️ After 5,000 subscribers: v5.0 & v6.0 become paid add-ons ($12.97/month total)

🧠 From UNTRAPD.COM - Building Android security right`;

if (content.includes(progressInstagramOld)) {
  content = content.replace(progressInstagramOld, progressInstagramNew);
  changesApplied.push('✅ progress.instagram: Added tier urgency messaging');
}

// 7. UPDATE PROGRESS.FACEBOOK TEMPLATE
const progressFacebookOld = `FIRST 25 TESTERS GET:
🎁 Bonus: Priority access to FINDERR Pro Analytics (Q2 2025)

🧠 From UNTRAPD.COM - Building the future of Android apps`;

const progressFacebookNew = `FIRST 25 TESTERS GET:
🎁 Bonus: Priority access to FINDERR Pro Analytics (Q2 2025)

🏆 EARLY ADOPTER TIERS (First 5,000):
• Tier 1 (1-1,000): FREE v5.0, v6.0, v7.0 early access
• Tier 2 (1,001-3,000): FREE v5.0, v6.0, 50% off v7.0
• Tier 3 (3,001-5,000): FREE v5.0, v6.0
• After 5,000: v5.0 & v6.0 become +$7/mo paid add-ons

🧠 From UNTRAPD.COM - Building the future of Android apps`;

if (content.includes(progressFacebookOld)) {
  content = content.replace(progressFacebookOld, progressFacebookNew);
  changesApplied.push('✅ progress.facebook: Added tier breakdown');
}

// 8. UPDATE PROGRESS.TWITTER TEMPLATE
const progressTwitterOld = `🎁 50% lifetime discount

⏰ First 25 get early access to FINDERR Pro Analytics`;

const progressTwitterNew = `🎁 50% lifetime discount
🏆 Lock in tier for FREE upgrades

⏰ First 25 get early access to FINDERR Pro Analytics
⚠️ After 5,000: upgrades become paid add-ons`;

if (content.includes(progressTwitterOld)) {
  content = content.replace(progressTwitterOld, progressTwitterNew);
  changesApplied.push('✅ progress.twitter: Added tier lock-in messaging');
}

// Write updated content
fs.writeFileSync(file, content, 'utf8');

// Display results
console.log('CHANGES APPLIED:\n');
changesApplied.forEach(change => console.log(change));
console.log('\n📊 Total templates updated:', changesApplied.length);
console.log('\n✅ All updates completed successfully!');
