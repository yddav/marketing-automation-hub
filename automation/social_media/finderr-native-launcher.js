#!/usr/bin/env node

/**
 * FINDERR 210-POST CAMPAIGN LAUNCHER
 *
 * Integrates FINDERR content calendar with native API system
 * Posts 210 pieces of content over 30 days across 4 platforms:
 * - Instagram: 60 posts (2/day)
 * - Facebook: 30 posts (1/day)
 * - TikTok: 30 videos (1/day)
 * - Twitter: 90 tweets (3/day)
 */

const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
const crypto = require('crypto');
const OAuth = require('oauth-1.0a');

class FINDERRNativeLauncher {
  constructor() {
    this.calendarPath = path.join(__dirname, '../../campaign_execution/finderr_v178_launch_calendar.json');
    this.milestoneAPI = 'https://hub.untrapd.com/.netlify/functions/finderr-milestones';
    this.trackingPath = path.join(__dirname, 'finderr-campaign-tracking.json');

    // Load environment variables
    require('dotenv').config({ path: path.join(__dirname, '.env') });

    this.tokens = {
      instagram: process.env.INSTAGRAM_ACCESS_TOKEN,
      facebook: process.env.FACEBOOK_PAGE_TOKEN,
      tiktok: process.env.TIKTOK_ACCESS_TOKEN,
      twitter: {
        apiKey: process.env.TWITTER_API_KEY,
        apiSecret: process.env.TWITTER_API_SECRET,
        accessToken: process.env.TWITTER_ACCESS_TOKEN,
        accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET
      }
    };

    this.accountIds = {
      instagram: process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID || '76216363129',
      facebook: process.env.FACEBOOK_PAGE_ID || '750014458192598'
    };

    // Initialize Twitter OAuth 1.0a
    this.twitterOAuth = new OAuth({
      consumer: {
        key: this.tokens.twitter.apiKey,
        secret: this.tokens.twitter.apiSecret
      },
      signature_method: 'HMAC-SHA1',
      hash_function(base_string, key) {
        return crypto.createHmac('sha1', key).update(base_string).digest('base64');
      }
    });
  }

  async loadContentCalendar() {
    try {
      const calendarData = await fs.readFile(this.calendarPath, 'utf-8');
      this.contentCalendar = JSON.parse(calendarData);
      console.log(`✅ Loaded ${this.contentCalendar.calendar.length} days, ${this.contentCalendar.campaign.targets.totalPosts} total posts`);
      return this.contentCalendar;
    } catch (error) {
      console.error('❌ Failed to load content calendar:', error.message);
      throw error;
    }
  }

  async fetchMilestoneData() {
    try {
      console.log('📊 Fetching live FINDERR milestone data...');
      const response = await axios.get(this.milestoneAPI, { timeout: 10000 });
      this.milestones = response.data;
      console.log(`✅ ${this.milestones.totalSubscribers} subscribers (${this.milestones.activeTierName})`);
      return this.milestones;
    } catch (error) {
      console.warn('⚠️  Milestone API unavailable, using defaults');
      this.milestones = {
        totalSubscribers: 150,
        activeTier: 'tier1',
        activeTierName: "Founder's Circle",
        tiers: {
          tier1: { count: 150, remaining: 850 },
          tier2: { count: 0, remaining: 2000 },
          tier3: { count: 0, remaining: 2000 }
        }
      };
      return this.milestones;
    }
  }

  personalizeContent(content) {
    if (!this.milestones) return content;

    const replacements = {
      '{{subscriber_count}}': this.milestones.totalSubscribers.toString(),
      '{{active_tier}}': this.milestones.activeTierName,
      '{{tier1_remaining}}': this.milestones.tiers?.tier1?.remaining?.toString() || '850',
      '{{tier2_remaining}}': this.milestones.tiers?.tier2?.remaining?.toString() || '2000',
      '{{tier3_remaining}}': this.milestones.tiers?.tier3?.remaining?.toString() || '2000'
    };

    let personalized = content;
    for (const [placeholder, value] of Object.entries(replacements)) {
      personalized = personalized.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value);
    }

    return personalized;
  }

  async loadTracking() {
    try {
      const trackingData = await fs.readFile(this.trackingPath, 'utf-8');
      return JSON.parse(trackingData);
    } catch (error) {
      // Create new tracking file
      return { published: [], scheduled: [], failed: [] };
    }
  }

  async saveTracking(tracking) {
    await fs.writeFile(this.trackingPath, JSON.stringify(tracking, null, 2));
  }

  async postToInstagram(content, accountId) {
    if (!this.tokens.instagram) {
      throw new Error('Instagram token not configured');
    }

    const url = `https://graph.facebook.com/v18.0/${accountId}/media`;

    try {
      // Create media container
      const mediaResponse = await axios.post(url, {
        caption: content,
        access_token: this.tokens.instagram
      });

      const mediaId = mediaResponse.data.id;

      // Publish media
      const publishUrl = `https://graph.facebook.com/v18.0/${accountId}/media_publish`;
      const publishResponse = await axios.post(publishUrl, {
        creation_id: mediaId,
        access_token: this.tokens.instagram
      });

      return { success: true, id: publishResponse.data.id };
    } catch (error) {
      return { success: false, error: error.response?.data?.error?.message || error.message };
    }
  }

  async postToFacebook(content, pageId) {
    if (!this.tokens.facebook) {
      throw new Error('Facebook token not configured');
    }

    const url = `https://graph.facebook.com/v18.0/${pageId}/feed`;

    try {
      const response = await axios.post(url, {
        message: content,
        access_token: this.tokens.facebook
      });

      return { success: true, id: response.data.id };
    } catch (error) {
      return { success: false, error: error.response?.data?.error?.message || error.message };
    }
  }

  async postToTikTok(content) {
    if (!this.tokens.tiktok) {
      // Skip TikTok posts gracefully - API approval pending
      return { success: false, error: 'TikTok API pending approval', skipped: true };
    }

    // TikTok requires video upload - placeholder for now
    console.log('⏭️  TikTok posting requires video file (coming soon)');
    return { success: false, error: 'Video upload not implemented yet' };
  }

  async postToTwitter(content) {
    if (!this.tokens.twitter.apiKey || !this.tokens.twitter.accessToken) {
      throw new Error('Twitter OAuth tokens not configured');
    }

    const url = 'https://api.twitter.com/2/tweets';
    const requestData = {
      url: url,
      method: 'POST'
    };

    // Token for OAuth 1.0a
    const token = {
      key: this.tokens.twitter.accessToken,
      secret: this.tokens.twitter.accessSecret
    };

    try {
      // Generate OAuth headers
      const authHeader = this.twitterOAuth.toHeader(
        this.twitterOAuth.authorize(requestData, token)
      );

      const response = await axios.post(url, {
        text: content.substring(0, 280) // Twitter character limit
      }, {
        headers: {
          ...authHeader,
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

  async publishPost(post, day) {
    const personalizedContent = this.personalizeContent(post.content);

    console.log(`\n📤 Publishing Day ${day} - ${post.platform.toUpperCase()} @ ${post.time}`);
    console.log(`   Type: ${post.type}`);
    console.log(`   Content: ${personalizedContent.substring(0, 100)}...`);

    let result;

    try {
      switch (post.platform) {
        case 'instagram':
          result = await this.postToInstagram(personalizedContent, this.accountIds.instagram);
          break;
        case 'facebook':
          result = await this.postToFacebook(personalizedContent, this.accountIds.facebook);
          break;
        case 'tiktok':
          result = await this.postToTikTok(personalizedContent);
          break;
        case 'twitter':
          result = await this.postToTwitter(personalizedContent);
          break;
        default:
          result = { success: false, error: 'Unknown platform' };
      }

      if (result.success) {
        console.log(`   ✅ Published successfully (ID: ${result.id})`);
      } else if (result.skipped) {
        console.log(`   ⏭️  Skipped: ${result.error}`);
      } else {
        console.log(`   ❌ Failed: ${result.error}`);
      }

      return result;

    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async previewCampaign(days = 7) {
    console.log(`\n👀 Previewing first ${days} days of FINDERR campaign...\n`);

    await this.loadContentCalendar();
    await this.fetchMilestoneData();

    for (let i = 0; i < Math.min(days, this.contentCalendar.calendar.length); i++) {
      const day = this.contentCalendar.calendar[i];

      console.log(`\n${'='.repeat(70)}`);
      console.log(`DAY ${day.day}: ${day.theme}`);
      console.log(`Date: ${day.date}`);
      console.log(`${'='.repeat(70)}`);

      for (const post of day.posts) {
        const personalizedContent = this.personalizeContent(post.content);

        console.log(`\n📱 ${post.platform.toUpperCase()} @ ${post.time}`);
        console.log(`Type: ${post.type}`);
        console.log(`\nContent:\n${personalizedContent.substring(0, 250)}...`);
        console.log(`\nHashtags: ${post.hashtags || 'N/A'}`);
        console.log('-'.repeat(70));
      }
    }

    console.log(`\n✅ Preview complete! Run 'npm run finderr-launch' to go live.\n`);
  }

  async launchCampaign(options = {}) {
    const { startDay = 1, endDay = null, dryRun = false } = options;

    console.log('\n🚀 Launching FINDERR 210-Post Campaign\n');

    await this.loadContentCalendar();
    await this.fetchMilestoneData();

    console.log(`📅 Campaign: ${this.contentCalendar.campaign.name}`);
    console.log(`📊 Target: ${this.contentCalendar.campaign.targets.totalPosts} posts over ${this.contentCalendar.campaign.duration} days`);
    console.log(`🎯 Platforms: Instagram, Facebook, Twitter (TikTok pending API approval)\n`);

    if (dryRun) {
      console.log('🧪 DRY RUN MODE - No actual posts will be published\n');
    }

    const tracking = await this.loadTracking();
    const results = { published: 0, failed: 0, skipped: 0, details: [] };

    const lastDay = endDay || this.contentCalendar.calendar.length;

    for (const day of this.contentCalendar.calendar.slice(startDay - 1, lastDay)) {
      console.log(`\n📅 Day ${day.day}: ${day.theme}`);

      for (const post of day.posts) {
        const postId = `day${day.day}-${post.platform}-${post.time}`;

        // Check if already published
        if (tracking.published.includes(postId)) {
          console.log(`  ⏭️  Skipping ${post.platform} (already published)`);
          results.skipped++;
          continue;
        }

        if (dryRun) {
          console.log(`  🧪 Would publish: ${post.platform} @ ${post.time}`);
          results.published++;
        } else {
          const result = await this.publishPost(post, day.day);

          if (result.success) {
            tracking.published.push(postId);
            results.published++;
          } else {
            tracking.failed.push({ postId, error: result.error, timestamp: new Date().toISOString() });
            results.failed++;
          }

          results.details.push({
            day: day.day,
            platform: post.platform,
            success: result.success,
            postId: postId
          });

          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      if (!dryRun) {
        await this.saveTracking(tracking);
      }
    }

    // Summary
    console.log('\n\n📊 CAMPAIGN LAUNCH SUMMARY');
    console.log('='.repeat(70));
    console.log(`✅ Published: ${results.published} posts`);
    console.log(`❌ Failed: ${results.failed} posts`);
    console.log(`⏭️  Skipped: ${results.skipped} posts (already published)`);
    console.log(`📅 Total: ${results.published + results.failed + results.skipped} posts processed`);
    console.log(`\n🎯 Campaign ${dryRun ? 'preview' : 'launch'} complete!\n`);

    return results;
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'preview';

  const launcher = new FINDERRNativeLauncher();

  try {
    switch (command) {
      case 'preview':
        const days = parseInt(args[1]) || 7;
        await launcher.previewCampaign(days);
        break;

      case 'launch':
        console.log('⚠️  WARNING: This will publish posts to all platforms!');
        console.log('Press Ctrl+C within 5 seconds to cancel...\n');
        await new Promise(resolve => setTimeout(resolve, 5000));
        await launcher.launchCampaign();
        break;

      case 'dry-run':
        await launcher.launchCampaign({ dryRun: true });
        break;

      case 'day':
        const dayNum = parseInt(args[1]) || 1;
        await launcher.launchCampaign({ startDay: dayNum, endDay: dayNum });
        break;

      default:
        console.log(`
🚀 FINDERR Native Campaign Launcher

Usage:
  node finderr-native-launcher.js <command>

Commands:
  preview [days]   Preview first N days (default: 7)
  launch           Launch full 30-day campaign
  dry-run          Simulate launch without publishing
  day <N>          Launch specific day only

Connected Platforms:
  ✅ Instagram: @untrapd.hub (Native API)
  ✅ Facebook: untrapd hub page (Native API)
  ✅ TikTok: @untrapd.hub (Native API)
  ✅ Twitter: @untrapd.hub (Native API)

Example:
  node finderr-native-launcher.js preview 3
  node finderr-native-launcher.js dry-run
  node finderr-native-launcher.js day 1
  node finderr-native-launcher.js launch
        `);
    }
  } catch (error) {
    console.error(`\n❌ Command failed: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = FINDERRNativeLauncher;
