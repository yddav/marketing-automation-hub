#!/usr/bin/env node

/**
 * TWITTER-ONLY CAMPAIGN LAUNCHER
 * Autonomous 30-day Twitter campaign for FINDERR
 */

const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
const crypto = require('crypto');
const OAuth = require('oauth-1.0a');

class TwitterLauncher {
  constructor() {
    this.calendarPath = path.join(__dirname, '../../campaign_execution/finderr_v178_launch_calendar.json');
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
    console.log(`✅ Loaded ${this.calendar.calendar.length} days`);
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
      console.error('Full error:', JSON.stringify(error.response?.data, null, 2));
      return {
        success: false,
        error: error.response?.data?.detail || error.response?.data?.title || error.message
      };
    }
  }

  async launchDay(dayNum) {
    console.log(`\n🚀 Launching Twitter posts for Day ${dayNum}\n`);

    await this.loadCalendar();
    const tracking = await this.loadTracking();

    const day = this.calendar.calendar.find(d => d.day === dayNum);
    if (!day) {
      console.error(`❌ Day ${dayNum} not found`);
      return;
    }

    console.log(`📅 ${day.theme}\n`);

    const twitterPosts = day.posts.filter(p => p.platform === 'twitter');
    let published = 0;
    let failed = 0;

    for (const post of twitterPosts) {
      const postId = `day${dayNum}-twitter-${post.time}`;

      if (tracking.published.includes(postId)) {
        console.log(`⏭️  Skipping ${post.time} (already published)`);
        continue;
      }

      console.log(`📤 Posting @ ${post.time}...`);
      console.log(`   ${post.content.substring(0, 80)}...`);

      const result = await this.postTweet(post.content);

      if (result.success) {
        console.log(`   ✅ Published! ID: ${result.id}\n`);
        tracking.published.push(postId);
        published++;
      } else {
        console.log(`   ❌ Failed: ${result.error}\n`);
        tracking.failed.push({ postId, error: result.error });
        failed++;
      }

      // Rate limiting
      await new Promise(r => setTimeout(r, 3000));
    }

    await this.saveTracking(tracking);

    console.log(`\n📊 Day ${dayNum} Summary:`);
    console.log(`   ✅ Published: ${published}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   📅 Total: ${twitterPosts.length}\n`);
  }

  async launchFull() {
    console.log('\n🚀 Launching 30-Day Twitter Campaign\n');
    console.log('⚠️  This will post ALL remaining Twitter content');
    console.log('   Press Ctrl+C within 5 seconds to cancel...\n');

    await new Promise(r => setTimeout(r, 5000));

    await this.loadCalendar();

    for (let day = 1; day <= 30; day++) {
      await this.launchDay(day);

      if (day < 30) {
        console.log(`⏸️  Pausing 10 seconds before next day...\n`);
        await new Promise(r => setTimeout(r, 10000));
      }
    }

    console.log('\n🎉 30-Day Twitter Campaign Complete!\n');
  }
}

// CLI
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';

  const launcher = new TwitterLauncher();

  try {
    switch (command) {
      case 'day':
        const dayNum = parseInt(args[1]) || 1;
        await launcher.launchDay(dayNum);
        break;

      case 'launch':
        await launcher.launchFull();
        break;

      default:
        console.log(`
🐦 Twitter-Only Campaign Launcher

Usage:
  node twitter-only-launcher.js day <N>    Launch specific day (1-30)
  node twitter-only-launcher.js launch     Launch full 30-day campaign

Examples:
  node twitter-only-launcher.js day 2
  node twitter-only-launcher.js launch
        `);
    }
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = TwitterLauncher;
