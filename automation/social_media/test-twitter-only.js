#!/usr/bin/env node

/**
 * TWITTER PERMISSION TEST
 *
 * Quick test to verify Twitter Read+Write permissions work
 * Tests OAuth 1.0a authentication and posting capability
 */

const axios = require('axios');
const crypto = require('crypto');
const OAuth = require('oauth-1.0a');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '.env') });

const tokens = {
  apiKey: process.env.TWITTER_API_KEY,
  apiSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET
};

// Initialize Twitter OAuth 1.0a
const twitterOAuth = new OAuth({
  consumer: {
    key: tokens.apiKey,
    secret: tokens.apiSecret
  },
  signature_method: 'HMAC-SHA1',
  hash_function(base_string, key) {
    return crypto.createHmac('sha1', key).update(base_string).digest('base64');
  }
});

async function testTwitterPost() {
  console.log('🐦 Testing Twitter OAuth 1.0a with Read+Write Permissions\n');

  console.log('📋 Token Configuration:');
  console.log(`   API Key: ${tokens.apiKey.substring(0, 10)}...`);
  console.log(`   Access Token: ${tokens.accessToken.substring(0, 20)}...`);
  console.log('');

  const testContent = `🚀 FINDERR Social Automation Test\n\nTesting OAuth 1.0a Read+Write permissions.\n\nTimestamp: ${new Date().toISOString()}\n\n#FINDERR #TestPost`;

  console.log('📝 Test Tweet Content:');
  console.log(`   ${testContent.substring(0, 100)}...\n`);

  const url = 'https://api.twitter.com/2/tweets';
  const requestData = {
    url: url,
    method: 'POST'
  };

  const token = {
    key: tokens.accessToken,
    secret: tokens.accessSecret
  };

  try {
    console.log('⏳ Sending POST request to Twitter API...\n');

    // Generate OAuth headers
    const authHeader = twitterOAuth.toHeader(
      twitterOAuth.authorize(requestData, token)
    );

    const response = await axios.post(url, {
      text: testContent.substring(0, 280)
    }, {
      headers: {
        ...authHeader,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ SUCCESS! Tweet posted successfully!\n');
    console.log('📊 Response:');
    console.log(`   Tweet ID: ${response.data.data.id}`);
    console.log(`   Tweet URL: https://twitter.com/user/status/${response.data.data.id}`);
    console.log('');
    console.log('🎉 Twitter OAuth 1.0a with Read+Write permissions is working correctly!');
    console.log('');
    console.log('🚀 NEXT STEPS:');
    console.log('1. Fix Facebook/Instagram permissions');
    console.log('2. Run full Day 1 test: node finderr-native-launcher.js day 1');
    console.log('3. Launch campaign: node finderr-native-launcher.js launch\n');

    return true;

  } catch (error) {
    console.log('❌ FAILED! Twitter post unsuccessful\n');

    if (error.response) {
      console.log('📊 Error Details:');
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Message: ${error.response.data?.detail || error.response.data?.title || error.message}`);

      if (error.response.data?.errors) {
        console.log('   Errors:');
        error.response.data.errors.forEach(err => {
          console.log(`     - ${err.message || err.detail}`);
        });
      }
    } else {
      console.log('📊 Error:');
      console.log(`   ${error.message}`);
    }

    console.log('');

    if (error.response?.data?.title?.includes('oauth1')) {
      console.log('🔧 DIAGNOSIS: OAuth 1.0a permission issue detected');
      console.log('');
      console.log('Possible causes:');
      console.log('1. App still has Read-only permissions (not Read+Write)');
      console.log('2. Tokens were not regenerated after changing permissions');
      console.log('3. Old tokens are still in .env file');
      console.log('');
      console.log('Solution:');
      console.log('1. Verify app settings show "Read and write"');
      console.log('2. Regenerate Access Token and Secret in Keys and Tokens');
      console.log('3. Update .env with new tokens');
      console.log('4. Run this test again\n');
    }

    return false;
  }
}

testTwitterPost().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
