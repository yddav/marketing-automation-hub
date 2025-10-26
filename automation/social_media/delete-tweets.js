#!/usr/bin/env node

/**
 * DELETE SPECIFIC TWEETS
 * Deletes tweets by their IDs
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

// Tweets to delete (from the list-recent-tweets.js output)
const TWEETS_TO_DELETE = [
  '1979285905354510425', // Battery usage comparison
  '1979285891584586010', // Android-first vs iOS-ported
  '1979284843469897750', // What makes FINDERR different
  '1979284572710821928', // LAUNCH DAY tweet
  '1979224632247919069'  // Launch thread
];

async function deleteTweet(tweetId) {
  const url = `https://api.twitter.com/2/tweets/${tweetId}`;
  const requestData = { url, method: 'DELETE' };

  try {
    await axios.delete(url, {
      headers: {
        ...oauth.toHeader(oauth.authorize(requestData, token))
      }
    });
    console.log(`✅ Deleted tweet: ${tweetId}`);
    console.log(`   URL was: https://twitter.com/i/web/status/${tweetId}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to delete ${tweetId}:`, error.response?.data?.detail || error.message);
    return false;
  }
}

async function deleteAllTweets() {
  console.log('\n🗑️  Deleting tweets with broken Google Play links...\n');
  console.log(`Found ${TWEETS_TO_DELETE.length} tweets to delete\n`);

  let deleted = 0;
  let failed = 0;

  for (const tweetId of TWEETS_TO_DELETE) {
    const success = await deleteTweet(tweetId);
    if (success) {
      deleted++;
    } else {
      failed++;
    }

    // Rate limiting: wait 1 second between deletions
    if (TWEETS_TO_DELETE.indexOf(tweetId) < TWEETS_TO_DELETE.length - 1) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  console.log('\n' + '─'.repeat(80));
  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Deleted: ${deleted}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📅 Total: ${TWEETS_TO_DELETE.length}\n`);

  if (deleted > 0) {
    console.log('✨ Successfully cleaned up tweets with broken links!');
    console.log('   Ready to relaunch campaign when FINDERR is public.\n');
  }
}

deleteAllTweets();
