#!/usr/bin/env node

/**
 * ENV TOKEN UPDATER
 *
 * Updates .env file with new Facebook/Instagram access token
 * Validates token before updating
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');

const newToken = process.argv[2];

if (!newToken) {
  console.error('❌ Usage: node update-env-token.js <your-new-token>');
  console.error('Example: node update-env-token.js EAAKfzRqLcbwBO...\n');
  process.exit(1);
}

if (!newToken.startsWith('EAAK')) {
  console.error('⚠️  Warning: Token doesn\'t start with EAAK (standard format)');
  console.error('   Continuing anyway...\n');
}

async function validateAndUpdateToken() {
  console.log('🔍 Validating new token...\n');

  try {
    // Validate token with Graph API
    const debugResponse = await axios.get('https://graph.facebook.com/v18.0/debug_token', {
      params: {
        input_token: newToken,
        access_token: newToken
      }
    });

    const tokenData = debugResponse.data.data;

    if (!tokenData.is_valid) {
      console.error('❌ Token is INVALID!');
      console.error('   Please regenerate the token and try again.\n');
      process.exit(1);
    }

    console.log('✅ Token is valid!');
    console.log(`   App ID: ${tokenData.app_id}`);
    console.log(`   User ID: ${tokenData.user_id}`);
    console.log(`   Expires: ${tokenData.expires_at ? new Date(tokenData.expires_at * 1000).toLocaleString() : 'Never'}`);

    const grantedScopes = tokenData.scopes || [];
    console.log(`\n📋 Granted Permissions (${grantedScopes.length}):`);
    grantedScopes.forEach(scope => {
      console.log(`   ✓ ${scope}`);
    });

    // Check for required permissions
    const requiredPermissions = [
      'pages_show_list',
      'pages_read_engagement',
      'pages_manage_posts',
      'instagram_basic',
      'instagram_content_publish'
    ];

    const missing = requiredPermissions.filter(perm => !grantedScopes.includes(perm));

    if (missing.length > 0) {
      console.log('\n⚠️  WARNING: Missing some required permissions:');
      missing.forEach(perm => console.log(`   ❌ ${perm}`));
      console.log('\nToken will be updated, but campaign may not work correctly.');
      console.log('Consider regenerating with ALL required permissions.\n');
    } else {
      console.log('\n✅ All required permissions present!\n');
    }

    // Update .env file
    const envPath = path.join(__dirname, '.env');
    let envContent = fs.readFileSync(envPath, 'utf-8');

    // Update both Instagram and Facebook tokens
    envContent = envContent.replace(
      /INSTAGRAM_ACCESS_TOKEN=.*/,
      `INSTAGRAM_ACCESS_TOKEN=${newToken}`
    );

    envContent = envContent.replace(
      /FACEBOOK_PAGE_TOKEN=.*/,
      `FACEBOOK_PAGE_TOKEN=${newToken}`
    );

    fs.writeFileSync(envPath, envContent);

    console.log('✅ Updated .env file with new token');
    console.log('   → INSTAGRAM_ACCESS_TOKEN');
    console.log('   → FACEBOOK_PAGE_TOKEN\n');

    console.log('🔧 NEXT STEPS:\n');
    console.log('1. Run permission checker to verify:');
    console.log('   node check-permissions.js\n');
    console.log('2. If all permissions present, test Day 1:');
    console.log('   node finderr-native-launcher.js day 1\n');
    console.log('3. If test succeeds, launch full campaign:');
    console.log('   node finderr-native-launcher.js launch\n');

  } catch (error) {
    console.error('❌ Error validating token:');
    console.error(`   ${error.response?.data?.error?.message || error.message}\n`);

    if (error.response?.data?.error?.code === 190) {
      console.error('Token is invalid or expired. Please:');
      console.error('1. Generate a new token at: https://developers.facebook.com/tools/explorer/');
      console.error('2. Make sure to add ALL required permissions');
      console.error('3. Extend the token to 60 days\n');
    }

    process.exit(1);
  }
}

validateAndUpdateToken();
