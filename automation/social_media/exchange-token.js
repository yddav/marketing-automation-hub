#!/usr/bin/env node

/**
 * TOKEN EXCHANGE UTILITY
 * Converts short-lived tokens to long-lived tokens (60 days)
 */

const axios = require('axios');

const APP_ID = '738653215879612';
const SHORT_LIVED_TOKEN = 'EAAKfzRqLcbwBPZCTTcQbYMoZBKKWA0WcWkTaQnd1uukjEdAQaAaoUaYV1r1jcQP5geTF3hGZAzCaIlV3ovUsSwMnWcD00sunUlszVOEZB3TvIYf99aK6dZAlA1TNpYSgRE2byyulB8EOZAHEPGZB3Te8kexJPutbGP432oVhpKiN6rBNufNQymNK5SybQXlbwid196psPaU5Y4BV2Ox5IHakUmvbLsopQU8VfvKxkjiEBBfogiH4qNADLVzhI57u8n0oT15hvhI1hv9h0jJpaqNZAEO6';

// You need to provide your App Secret
// Get it from: https://developers.facebook.com/apps/738653215879612/settings/basic/
const APP_SECRET = process.argv[2];

async function exchangeToken() {
  if (!APP_SECRET) {
    console.log('');
    console.log('🔐 APP SECRET REQUIRED');
    console.log('='.repeat(70));
    console.log('');
    console.log('To get your App Secret:');
    console.log('1. Open: https://developers.facebook.com/apps/738653215879612/settings/basic/');
    console.log('2. Find "App Secret" field');
    console.log('3. Click "Show" button');
    console.log('4. Copy the secret');
    console.log('');
    console.log('Then run:');
    console.log(`node exchange-token.js YOUR_APP_SECRET_HERE`);
    console.log('');
    process.exit(1);
  }

  console.log('');
  console.log('🔄 EXCHANGING TOKEN FOR LONG-LIVED VERSION');
  console.log('='.repeat(70));
  console.log('');

  try {
    const response = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
      params: {
        grant_type: 'fb_exchange_token',
        client_id: APP_ID,
        client_secret: APP_SECRET,
        fb_exchange_token: SHORT_LIVED_TOKEN
      }
    });

    const longLivedToken = response.data.access_token;
    const expiresIn = response.data.expires_in;

    const daysValid = Math.floor(expiresIn / 86400);

    console.log('✅ SUCCESS! Long-Lived Token Generated');
    console.log('');
    console.log('📋 YOUR INSTAGRAM LONG-LIVED TOKEN:');
    console.log('='.repeat(70));
    console.log(longLivedToken);
    console.log('='.repeat(70));
    console.log('');
    console.log(`⏰ Valid for: ${daysValid} days (${expiresIn} seconds)`);
    console.log(`📅 Expires: ${new Date(Date.now() + expiresIn * 1000).toISOString()}`);
    console.log('');
    console.log('💾 SAVE THIS TOKEN!');
    console.log('This is your INSTAGRAM_ACCESS_TOKEN for the .env file');
    console.log('');
    console.log('Next Steps:');
    console.log('1. Copy the token above (between the === lines)');
    console.log('2. Save it to your .env file as INSTAGRAM_ACCESS_TOKEN');
    console.log('3. Then generate the Facebook Page token');
    console.log('');

    return longLivedToken;

  } catch (error) {
    console.error('❌ ERROR:', error.response?.data || error.message);
    console.log('');
    console.log('Common issues:');
    console.log('- App Secret is incorrect (check for spaces/typos)');
    console.log('- Short-lived token has expired (generate new one)');
    console.log('- App ID is incorrect');
    console.log('');
    process.exit(1);
  }
}

if (require.main === module) {
  exchangeToken();
}

module.exports = { exchangeToken };
