#!/usr/bin/env node

/**
 * DAILY TWITTER SCHEDULER
 * Runs once per day - posts TODAY's Twitter content according to calendar
 * Usage: Run via cron or manually once per day
 */

const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
const crypto = require('crypto');
const OAuth = require('oauth-1.0a');

class DailyTwitterScheduler {
  constructor() {
    // Using BETA campaign calendar (email collection phase)
    this.calendarPath = path.join(__dirname, '../../campaign_execution/finderr_beta_campaign.json');
    this.trackingPath = path.join(__dirname, 'twitter-campaign-tracking.json');

    require('dotenv').config({ path: path.join(__dirname, '.env') });

    this.oauth = OAuth({
      consumer: {
        key: process.env.TWITTER_API_KEY,
        secret: process.env.TWITTER_API_SECRET
      },
      signature_method: 'HMAC-SHA1',
      hash_function(base_string, key) {
        return crypto.createHmac('sha1', key).update(base_string).digest('base64');
      }
    });

    this.token = {
      key: process.env.TWITTER_ACCESS_TOKEN,
      secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
    };
  }

  async loadCalendar() {
    const data = await fs.readFile(this.calendarPath, 'utf-8');
    this.calendar = JSON.parse(data);
  }

  async loadTracking() {
    try {
      const data = await fs.readFile(this.trackingPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return { published: [], failed: [] };
    }
  }

  async saveTracking(tracking) {
    await fs.writeFile(this.trackingPath, JSON.stringify(tracking, null, 2));
  }

  getTodaysDay() {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const startDate = new Date(this.calendar.campaign.startDate);
    const currentDate = new Date(today);

    const diffTime = currentDate - startDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    const campaignDay = diffDays + 1;

    console.log(`📅 Campaign Start: ${this.calendar.campaign.startDate}`);
    console.log(`📅 Today: ${today}`);
    console.log(`📅 Campaign Day: ${campaignDay} of 30`);

    return campaignDay;
  }

  async postTweet(content) {
    const url = 'https://api.twitter.com/2/tweets';
    const requestData = { url, method: 'POST' };

    try {
      const response = await axios.post(url, {
        text: content.substring(0, 280)
      }, {
        headers: {
          ...this.oauth.toHeader(this.oauth.authorize(requestData, this.token)),
          'Content-Type': 'application/json'
        }
      });

      return { success: true, id: response.data.data.id };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || error.response?.data?.title || error.message
      };
    }
  }

  async runToday() {
    console.log('\n🐦 Daily Twitter Scheduler - Running...\n');

    await this.loadCalendar();
    const tracking = await this.loadTracking();

    const campaignDay = this.getTodaysDay();

    if (campaignDay < 1 || campaignDay > 30) {
      console.log(`\n⚠️  Campaign Day ${campaignDay} is outside range (1-30)`);
      console.log('   Campaign has either not started or already ended.');
      return;
    }

    const day = this.calendar.calendar.find(d => d.day === campaignDay);
    if (!day) {
      console.error(`\n❌ Day ${campaignDay} not found in calendar`);
      return;
    }

    console.log(`\n📅 Theme: ${day.theme}`);
    console.log(`📅 Date: ${day.date}\n`);

    const twitterPosts = day.posts.filter(p => p.platform === 'twitter');

    if (twitterPosts.length === 0) {
      console.log('ℹ️  No Twitter posts scheduled for today');
      return;
    }

    let published = 0;
    let failed = 0;
    let skipped = 0;

    for (const post of twitterPosts) {
      const postId = `day${campaignDay}-twitter-${post.time}`;

      if (tracking.published.includes(postId)) {
        console.log(`⏭️  ${post.time} - Already published`);
        skipped++;
        continue;
      }

      console.log(`\n📤 Posting @ ${post.time}...`);
      console.log(`   ${post.content.substring(0, 80)}...`);

      const result = await this.postTweet(post.content);

      if (result.success) {
        console.log(`   ✅ Published! ID: ${result.id}`);
        tracking.published.push(postId);
        published++;
      } else {
        console.log(`   ❌ Failed: ${result.error}`);
        tracking.failed.push({ postId, error: result.error, timestamp: new Date().toISOString() });
        failed++;
      }

      // Rate limiting: 5 seconds between tweets
      if (twitterPosts.indexOf(post) < twitterPosts.length - 1) {
        console.log('   ⏱️  Waiting 5 seconds (rate limiting)...');
        await new Promise(r => setTimeout(r, 5000));
      }
    }

    await this.saveTracking(tracking);

    console.log(`\n📊 Today's Summary:`);
    console.log(`   ✅ Published: ${published}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   📅 Total: ${twitterPosts.length}\n`);

    if (published > 0) {
      console.log('✨ Success! Today\'s tweets have been posted.');
      console.log('   Run this script again tomorrow for next day\'s posts.\n');
    }
  }
}

// CLI
async function main() {
  const scheduler = new DailyTwitterScheduler();

  try {
    await scheduler.runToday();
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = DailyTwitterScheduler;
