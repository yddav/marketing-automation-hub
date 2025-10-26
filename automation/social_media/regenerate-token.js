#!/usr/bin/env node

/**
 * AUTOMATED TOKEN REGENERATION WITH PERMISSIONS
 *
 * Opens Graph API Explorer in Firefox and guides user through
 * adding all required permissions and generating a new token
 */

const path = require('path');

// Load environment
require('dotenv').config({ path: path.join(__dirname, '.env') });

const REQUIRED_PERMISSIONS = [
  'pages_show_list',
  'pages_read_engagement',
  'pages_manage_posts',
  'pages_read_user_content',
  'instagram_basic',
  'instagram_content_publish'
];

console.log(`
╔════════════════════════════════════════════════════════════════════════╗
║                  FACEBOOK/INSTAGRAM TOKEN REGENERATION                 ║
╚════════════════════════════════════════════════════════════════════════╝

📋 Required Permissions:
${REQUIRED_PERMISSIONS.map(p => `   ✓ ${p}`).join('\n')}

🔧 AUTOMATED SETUP PROCESS:

STEP 1: Open Graph API Explorer (Opening in Firefox now...)
   → https://developers.facebook.com/tools/explorer/

STEP 2: Select Your App
   → Look for dropdown at top: "Meta App"
   → Select: "UNTRAPD Social Automation" (App ID: 738653215879612)

STEP 3: Add Permissions
   → Click "Add a Permission" button
   → Search for and enable each permission:
`);

REQUIRED_PERMISSIONS.forEach((perm, i) => {
  console.log(`     ${i + 1}. ${perm}`);
});

console.log(`
STEP 4: Generate Access Token
   → Click blue "Generate Access Token" button
   → Click "I Understand" or "Continue" on popup
   → Copy the token (starts with EAAK...)

STEP 5: Extend Token (CRITICAL!)
   → Go to: https://developers.facebook.com/tools/debug/accesstoken/
   → Paste your token
   → Click "Extend Access Token"
   → Copy the NEW extended token

STEP 6: Update .env File
   → Run: node update-env-token.js <your-new-extended-token>

════════════════════════════════════════════════════════════════════════

⏳ Opening Graph API Explorer in Firefox in 3 seconds...
   Press Ctrl+C to cancel

`);

// Wait 3 seconds then open Firefox
setTimeout(() => {
  const { exec } = require('child_process');

  const graphExplorerUrl = 'https://developers.facebook.com/tools/explorer/738653215879612/';

  exec(`firefox "${graphExplorerUrl}"`, (err) => {
    if (err) {
      console.log('⚠️  Could not auto-open Firefox. Please manually visit:');
      console.log(`   ${graphExplorerUrl}\n`);
    } else {
      console.log('✅ Firefox opened with Graph API Explorer\n');
    }
  });

  console.log('💡 TIP: Follow the steps above carefully');
  console.log('💡 Make sure to EXTEND the token to 60 days in Step 5!\n');
  console.log('When you have the extended token, run:');
  console.log('   node update-env-token.js <your-extended-token>\n');

}, 3000);
