#!/usr/bin/env node

/**
 * API PERMISSIONS CHECKER & DIAGNOSTIC TOOL
 *
 * Checks current Facebook/Instagram token permissions via Graph API
 * Identifies missing permissions blocking campaign launch
 * Provides actionable next steps for permission fixes
 */

const axios = require('axios');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '.env') });

const REQUIRED_PERMISSIONS = {
  facebook: [
    'pages_show_list',
    'pages_read_engagement',
    'pages_manage_posts',
    'pages_read_user_content'
  ],
  instagram: [
    'instagram_basic',
    'instagram_content_publish'
  ]
};

async function checkTokenPermissions() {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN || process.env.FACEBOOK_PAGE_TOKEN;

  if (!accessToken) {
    console.error('❌ No access token found in .env file');
    process.exit(1);
  }

  console.log('🔍 Checking Facebook/Instagram API Permissions...\n');

  try {
    // Debug token to get permissions
    const debugUrl = `https://graph.facebook.com/v18.0/debug_token`;
    const debugResponse = await axios.get(debugUrl, {
      params: {
        input_token: accessToken,
        access_token: accessToken
      }
    });

    const tokenData = debugResponse.data.data;

    console.log('📊 Token Information:');
    console.log(`   App ID: ${tokenData.app_id}`);
    console.log(`   Valid: ${tokenData.is_valid}`);
    console.log(`   Expires: ${tokenData.expires_at ? new Date(tokenData.expires_at * 1000).toISOString() : 'Never (invalid token)'}`);
    console.log(`   User ID: ${tokenData.user_id}`);
    console.log(`   Type: ${tokenData.type}\n`);

    // Get granted permissions
    const grantedScopes = tokenData.scopes || [];

    console.log('✅ Granted Permissions:');
    if (grantedScopes.length === 0) {
      console.log('   ⚠️  No permissions granted!\n');
    } else {
      grantedScopes.forEach(scope => {
        console.log(`   ✓ ${scope}`);
      });
      console.log('');
    }

    // Check Facebook permissions
    console.log('📋 Facebook Permissions Analysis:');
    const missingFacebook = [];
    REQUIRED_PERMISSIONS.facebook.forEach(perm => {
      const granted = grantedScopes.includes(perm);
      console.log(`   ${granted ? '✅' : '❌'} ${perm}`);
      if (!granted) {
        missingFacebook.push(perm);
      }
    });
    console.log('');

    // Check Instagram permissions
    console.log('📋 Instagram Permissions Analysis:');
    const missingInstagram = [];
    REQUIRED_PERMISSIONS.instagram.forEach(perm => {
      const granted = grantedScopes.includes(perm);
      console.log(`   ${granted ? '✅' : '❌'} ${perm}`);
      if (!granted) {
        missingInstagram.push(perm);
      }
    });
    console.log('');

    // Check Instagram Business Account connection
    try {
      const meResponse = await axios.get('https://graph.facebook.com/v18.0/me', {
        params: {
          fields: 'id,name,instagram_business_account',
          access_token: accessToken
        }
      });

      console.log('📱 Instagram Business Account:');
      if (meResponse.data.instagram_business_account) {
        console.log(`   ✅ Connected: ${meResponse.data.instagram_business_account.id}`);
        const expectedId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
        if (meResponse.data.instagram_business_account.id === expectedId) {
          console.log(`   ✅ Matches .env ID: ${expectedId}`);
        } else {
          console.log(`   ⚠️  ID mismatch! .env: ${expectedId}, actual: ${meResponse.data.instagram_business_account.id}`);
        }
      } else {
        console.log('   ❌ No Instagram Business Account connected to this token');
      }
      console.log('');
    } catch (error) {
      console.log('   ⚠️  Could not check Instagram Business Account connection');
      console.log(`   Error: ${error.response?.data?.error?.message || error.message}\n`);
    }

    // Check Facebook Page access
    try {
      const pagesResponse = await axios.get('https://graph.facebook.com/v18.0/me/accounts', {
        params: {
          access_token: accessToken
        }
      });

      console.log('📄 Facebook Pages:');
      if (pagesResponse.data.data && pagesResponse.data.data.length > 0) {
        pagesResponse.data.data.forEach(page => {
          console.log(`   ✅ ${page.name} (ID: ${page.id})`);
          const expectedId = process.env.FACEBOOK_PAGE_ID;
          if (page.id === expectedId) {
            console.log(`      ✓ Matches .env Page ID`);
          }
        });
      } else {
        console.log('   ❌ No Facebook Pages accessible with this token');
      }
      console.log('');
    } catch (error) {
      console.log('   ⚠️  Could not check Facebook Pages');
      console.log(`   Error: ${error.response?.data?.error?.message || error.message}\n`);
    }

    // Summary and Next Steps
    console.log('=' .repeat(70));
    console.log('📊 PERMISSION DIAGNOSIS SUMMARY');
    console.log('=' .repeat(70));

    const totalMissing = missingFacebook.length + missingInstagram.length;

    if (totalMissing === 0) {
      console.log('✅ All required permissions are granted!');
      console.log('   Campaign should be ready to launch.\n');
    } else {
      console.log(`❌ Missing ${totalMissing} required permissions:\n`);

      if (missingFacebook.length > 0) {
        console.log('Facebook Permissions Missing:');
        missingFacebook.forEach(perm => console.log(`   - ${perm}`));
        console.log('');
      }

      if (missingInstagram.length > 0) {
        console.log('Instagram Permissions Missing:');
        missingInstagram.forEach(perm => console.log(`   - ${perm}`));
        console.log('');
      }

      console.log('🔧 NEXT STEPS:\n');
      console.log('1. Regenerate token with ALL required permissions:');
      console.log('   https://developers.facebook.com/tools/explorer/\n');
      console.log('2. In Graph API Explorer:');
      console.log('   - Select your app: UNTRAPD Social Automation');
      console.log('   - Click "Add a Permission"');
      console.log('   - Add missing permissions listed above');
      console.log('   - Click "Generate Access Token"');
      console.log('   - Extend token to 60 days at:');
      console.log('     https://developers.facebook.com/tools/debug/accesstoken/\n');
      console.log('3. Update .env file with new extended token\n');
      console.log('4. Run this script again to verify all permissions granted\n');
    }

  } catch (error) {
    console.error('❌ Error checking permissions:');
    console.error(`   ${error.response?.data?.error?.message || error.message}\n`);

    if (error.response?.data?.error?.code === 190) {
      console.error('🔑 Token is invalid or expired. Generate a new token at:');
      console.error('   https://developers.facebook.com/tools/explorer/\n');
    }

    process.exit(1);
  }
}

// Run the checker
checkTokenPermissions().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
