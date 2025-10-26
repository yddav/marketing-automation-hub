#!/usr/bin/env node

const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

console.log(`
╔════════════════════════════════════════════════════════════════════════╗
║              FACEBOOK APP DEVELOPMENT MODE DIAGNOSIS                   ║
╚════════════════════════════════════════════════════════════════════════╝

Your app is likely in Development Mode, which restricts certain permissions.

🔧 SOLUTION FOR DEVELOPMENT MODE APPS:

Since your app is in Development Mode, advanced permissions like
pages_manage_posts and instagram_content_publish require either:

OPTION 1: Switch to Live Mode (⚡ QUICKEST - 5 minutes)
   1. Go to: https://developers.facebook.com/apps/738653215879612/settings/basic/
   2. Scroll down to "App Mode"
   3. Toggle from "Development" to "Live"
   4. Click "Switch Mode"
   5. Run: node generate-oauth-url.js
   6. Authorize all 6 permissions
   
OPTION 2: Add Facebook Page as Test Page
   1. Go to: https://developers.facebook.com/apps/738653215879612/roles/test-users/
   2. Add your Page as test asset
   3. Token will have access to all permissions

OPTION 3: Request App Review (Takes 1-3 days)
   1. Submit app for review
   2. Request pages_manage_posts and instagram_content_publish
   3. Wait for approval

═══════════════════════════════════════════════════════════════════════

💡 RECOMMENDED: Switch app to Live Mode (Option 1)

Opening app settings page in Firefox...
`);

setTimeout(() => {
  const { exec } = require('child_process');
  exec('firefox "https://developers.facebook.com/apps/738653215879612/settings/basic/"', (err) => {
    if (err) {
      console.log('\n⚠️  Firefox not opened. Visit the URL above manually.\n');
    } else {
      console.log('\n✅ Firefox opened. Look for "App Mode" and switch to Live.\n');
    }
  });
}, 2000);
