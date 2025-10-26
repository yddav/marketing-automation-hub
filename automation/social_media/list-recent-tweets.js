#!/usr/bin/env node

/**
 * LIST RECENT TWEETS
 * Shows your recent tweets so we can identify which ones to delete
 */

const axios = require('axios');
const crypto = require('crypto');
const OAuth = require('oauth-1.0a');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '.env') });

const oauth = OAuth({
  consumer: {
    key: process.env.TWITTER_API_KEY,
    secret: process.env.TWITTER_API_SECRET
  },
  signature_method: 'HMAC-SHA1',
  hash_function(base_string, key) {
    return crypto.createHmac('sha1', key).update(base_string).digest('base64');
  }
});

const token = {
  key: process.env.TWITTER_ACCESS_TOKEN,
  secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
};

async function listRecentTweets() {
  console.log('\n🐦 Fetching your recent tweets...\n');

  // First, get your user ID
  const meUrl = 'https://api.twitter.com/2/users/me';
  const meRequestData = { url: meUrl, method: 'GET' };

  try {
    const meResponse = await axios.get(meUrl, {
      headers: {
        ...oauth.toHeader(oauth.authorize(meRequestData, token))
      }
    });

    const userId = meResponse.data.data.id;
    console.log(`✅ Authenticated as: @${meResponse.data.data.username} (ID: ${userId})\n`);

    // Now get recent tweets
    const tweetsUrl = `https://api.twitter.com/2/users/${userId}/tweets?max_results=10&tweet.fields=created_at,text`;
    const tweetsRequestData = { url: tweetsUrl, method: 'GET' };

    const tweetsResponse = await axios.get(tweetsUrl, {
      headers: {
        ...oauth.toHeader(oauth.authorize(tweetsRequestData, token))
      }
    });

    if (!tweetsResponse.data.data || tweetsResponse.data.data.length === 0) {
      console.log('ℹ️  No recent tweets found.\n');
      return;
    }

    console.log(`📋 Your ${tweetsResponse.data.data.length} most recent tweets:\n`);
    console.log('─'.repeat(80));

    tweetsResponse.data.data.forEach((tweet, index) => {
      console.log(`\n${index + 1}. Tweet ID: ${tweet.id}`);
      console.log(`   Created: ${tweet.created_at}`);
      console.log(`   URL: https://twitter.com/i/web/status/${tweet.id}`);
      console.log(`   Content: ${tweet.text.substring(0, 100)}${tweet.text.length > 100 ? '...' : ''}`);

      // Check if it contains the broken Google Play link
      if (tweet.text.includes('play.google.com/store/apps/details?id=com.untrapd.finderr')) {
        console.log(`   ⚠️  CONTAINS BROKEN GOOGLE PLAY LINK - SHOULD DELETE`);
      }
    });

    console.log('\n' + '─'.repeat(80));
    console.log('\n💡 To delete tweets with broken links, note their IDs and I\'ll create a deletion script.\n');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

listRecentTweets();
