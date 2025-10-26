#!/usr/bin/env node

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const APP_ID = '738653215879612';
const REDIRECT_URI = 'https://localhost/';

const PERMISSIONS = [
  'pages_show_list',
  'pages_read_engagement',
  'pages_manage_posts',
  'pages_read_user_content',
  'instagram_basic',
  'instagram_content_publish'
];

console.log(`
╔════════════════════════════════════════════════════════════════════════╗
║            FACEBOOK OAUTH AUTHORIZATION (LOCALHOST)                    ║
╚════════════════════════════════════════════════════════════════════════╝

📋 App ID: ${APP_ID}
📋 Redirect URI: ${REDIRECT_URI} (allowed by default)
📋 Permissions: ${PERMISSIONS.length}

${PERMISSIONS.map(p => `   ✓ ${p}`).join('\n')}

════════════════════════════════════════════════════════════════════════

🔗 AUTHORIZATION URL:
`);

const scope = PERMISSIONS.join(',');
const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${APP_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(scope)}&response_type=token`;

console.log(authUrl);

console.log(`
════════════════════════════════════════════════════════════════════════

📝 IMPORTANT INSTRUCTIONS:

1. The URL above will be opened in Firefox
2. Facebook will ask you to authorize all 6 permissions
3. Click "Continue" or "Authorize"
4. You'll be redirected to: ${REDIRECT_URI}
5. The browser will show "Unable to connect" - THIS IS NORMAL!
6. LOOK AT THE ADDRESS BAR - it contains your token!
7. The URL will look like:
   https://localhost/#access_token=EAAKfzRq...&expires_in=5184000

8. Copy EVERYTHING after "#access_token=" and before "&expires"
9. Run: node update-env-token.js <paste-token-here>

════════════════════════════════════════════════════════════════════════

⏳ Opening authorization URL in 3 seconds...

`);

setTimeout(() => {
  const { exec } = require('child_process');
  exec(`firefox "${authUrl}"`, (err) => {
    if (err) {
      console.log('⚠️  Could not auto-open Firefox. Copy the URL above.\n');
    } else {
      console.log('✅ Firefox opened\n');
      console.log('💡 REMEMBER: When you see "Unable to connect", look at the URL bar!\n');
      console.log('   The access token is IN the URL after #access_token=\n');
    }
  });
}, 3000);
