#!/usr/bin/env node

/**
 * FINDERR IMMEDIATE LAUNCH SCRIPT
 *
 * Uses Ayrshare bridge to launch FINDERR campaign immediately
 * while Postiz native OAuth is being configured
 *
 * Connected Platforms (via Ayrshare):
 * - Instagram: @untrapd.hub (ID: 17841476173887045)
 * - Facebook: untrapd hub page (ID: 750014458192598)
 * - Pinterest: untrapd hub (ID: 871517034080882613)
 *
 * Usage:
 *   node finderr-launch-now.js preview     # Preview Day 1-3 posts
 *   node finderr-launch-now.js launch      # Launch full 30-day campaign
 *   node finderr-launch-now.js test        # Post Day 1 test content
 */

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

class FINDERRLauncher {
  constructor() {
    this.ayrshareKey = process.env.AYRSHARE_API_KEY || 'C158E641-E6B341DE-A058943E-A127B0AA';
    this.ayrshareUrl = 'https://app.ayrshare.com/api';
    this.milestoneAPI = 'https://hub.untrapd.com/.netlify/functions/finderr-milestones';
    this.calendarPath = path.join(__dirname, '../../campaign_execution/finderr_v178_launch_calendar.json');

    // Connected platforms
    this.platforms = {
      instagram: { id: '17841476173887045', username: 'untrapd.hub' },
      facebook: { id: '750014458192598', pageName: 'untrapd hub' },
      pinterest: { id: '871517034080882613', username: 'untrapd hub  Intro' }
    };

    this.contentCalendar = null;
    this.milestoneData = null;

    console.log('🚀 FINDERR Campaign Launcher initialized');
    console.log(`📱 Connected: Instagram, Facebook, Pinterest via Ayrshare`);
  }

  // ============================
  // CONTENT LOADING
  // ============================

  async loadContentCalendar() {
    try {
      console.log('📅 Loading FINDERR content calendar...');
      const calendarJSON = await fs.readFile(this.calendarPath, 'utf-8');
      this.contentCalendar = JSON.parse(calendarJSON);

      const totalPosts = this.contentCalendar.calendar.reduce((total, day) =>
        total + day.posts.length, 0
      );

      console.log(`✅ Loaded ${this.contentCalendar.calendar.length} days, ${totalPosts} total posts`);
      return this.contentCalendar;
    } catch (error) {
      console.error(`❌ Failed to load content calendar: ${error.message}`);
      throw error;
    }
  }

  async fetchMilestoneData() {
    try {
      console.log('📊 Fetching live milestone data...');
      const response = await axios.get(this.milestoneAPI, { timeout: 10000 });
      this.milestoneData = response.data;

      console.log(`✅ ${this.milestoneData.totalSubscribers} subscribers (${this.milestoneData.activeTierName})`);
      return this.milestoneData;
    } catch (error) {
      console.error(`❌ Milestone API error: ${error.message}`);
      // Fallback
      this.milestoneData = {
        totalSubscribers: 150,
        activeTier: 'tier1',
        activeTierName: 'Founder\'s Circle'
      };
      return this.milestoneData;
    }
  }

  // ============================
  // CONTENT PERSONALIZATION
  // ============================

  personalizeContent(content) {
    if (!this.milestoneData) return content;

    const replacements = {
      '{{subscriber_count}}': this.milestoneData.totalSubscribers?.toString() || '150',
      '{{active_tier}}': this.milestoneData.activeTierName || 'Founder\'s Circle',
      '{{tier1_remaining}}': this.milestoneData.tiers?.tier1?.remaining?.toString() || '850',
      '{{tier2_remaining}}': this.milestoneData.tiers?.tier2?.remaining?.toString() || '2000',
      '{{tier3_remaining}}': this.milestoneData.tiers?.tier3?.remaining?.toString() || '2000'
    };

    let personalized = content;
    for (const [placeholder, value] of Object.entries(replacements)) {
      personalized = personalized.replace(new RegExp(placeholder, 'g'), value);
    }

    return personalized;
  }

  // ============================
  // AYRSHARE POSTING
  // ============================

  async postViaAyrshare(content, platforms = ['instagram', 'facebook']) {
    try {
      const postData = {
        post: content,
        platforms: platforms,
        shorten_links: true
      };

      const response = await axios.post(`${this.ayrshareUrl}/post`, postData, {
        headers: {
          'Authorization': `Bearer ${this.ayrshareKey}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        data: response.data,
        platforms: platforms
      };
    } catch (error) {
      console.error(`❌ Ayrshare post failed: ${error.response?.data?.message || error.message}`);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  async scheduleViaAyrshare(content, scheduleDate, platforms = ['instagram', 'facebook']) {
    try {
      const postData = {
        post: content,
        platforms: platforms,
        scheduleDate: scheduleDate, // ISO 8601 format
        shorten_links: true
      };

      const response = await axios.post(`${this.ayrshareUrl}/post`, postData, {
        headers: {
          'Authorization': `Bearer ${this.ayrshareKey}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        data: response.data,
        platforms: platforms,
        scheduled: scheduleDate
      };
    } catch (error) {
      console.error(`❌ Ayrshare schedule failed: ${error.response?.data?.message || error.message}`);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  // ============================
  // CAMPAIGN LAUNCH
  // ============================

  async previewCampaign(days = 3) {
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
        // Only show Instagram and Facebook posts (Ayrshare-compatible)
        if (['instagram', 'facebook'].includes(post.platform)) {
          const personalizedContent = this.personalizeContent(post.content);

          console.log(`\n📱 ${post.platform.toUpperCase()} @ ${post.time}`);
          console.log(`Type: ${post.type}`);
          console.log(`\nContent:\n${personalizedContent.substring(0, 250)}...`);
          console.log(`\nHashtags: ${post.hashtags || 'N/A'}`);
          console.log('-'.repeat(70));
        }
      }
    }

    console.log(`\n✅ Preview complete!`);
  }

  async launchCampaign() {
    console.log('\n🚀 Launching FINDERR 30-Day Campaign via Ayrshare...\n');

    await this.loadContentCalendar();
    await this.fetchMilestoneData();

    const results = {
      scheduled: 0,
      failed: 0,
      skipped: 0,
      details: []
    };

    const startDate = new Date();

    for (const day of this.contentCalendar.calendar) {
      console.log(`\n📅 Day ${day.day}: ${day.theme}`);

      for (const post of day.posts) {
        // Only post to Instagram and Facebook (Ayrshare-compatible)
        if (!['instagram', 'facebook'].includes(post.platform)) {
          console.log(`  ⏭️  Skipping ${post.platform} (not on Ayrshare)`);
          results.skipped++;
          continue;
        }

        try {
          // Calculate schedule date
          const scheduleDate = new Date(startDate);
          scheduleDate.setDate(scheduleDate.getDate() + (day.day - 1));

          // Parse time
          const [hours, minutes] = post.time.split(':').map(Number);
          scheduleDate.setHours(hours, minutes, 0, 0);

          // Personalize content
          const personalizedContent = this.personalizeContent(post.content);

          // Schedule post
          const result = await this.scheduleViaAyrshare(
            personalizedContent,
            scheduleDate.toISOString(),
            [post.platform]
          );

          if (result.success) {
            console.log(`  ✅ Scheduled: ${post.platform} @ ${scheduleDate.toISOString()}`);
            results.scheduled++;
          } else {
            console.log(`  ❌ Failed: ${post.platform} - ${result.error}`);
            results.failed++;
          }

          results.details.push({
            day: day.day,
            platform: post.platform,
            scheduleDate: scheduleDate.toISOString(),
            success: result.success,
            error: result.error || null
          });

          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay

        } catch (error) {
          console.log(`  ❌ Error: ${error.message}`);
          results.failed++;
        }
      }
    }

    // Summary
    console.log('\n\n📊 CAMPAIGN LAUNCH SUMMARY');
    console.log('='.repeat(70));
    console.log(`✅ Scheduled: ${results.scheduled} posts`);
    console.log(`❌ Failed: ${results.failed} posts`);
    console.log(`⏭️  Skipped: ${results.skipped} posts (TikTok, Twitter - not on Ayrshare)`);
    console.log(`📅 Total: ${results.scheduled + results.failed + results.skipped} posts`);
    console.log(`\n🎯 ${results.scheduled} posts scheduled across ${this.contentCalendar.calendar.length} days`);

    return results;
  }

  async testPost() {
    console.log('\n🧪 Testing Day 1 Twitter post (will adapt for Instagram/Facebook)...\n');

    await this.loadContentCalendar();
    await this.fetchMilestoneData();

    // Get Day 1, first Twitter post (we'll adapt it)
    const day1 = this.contentCalendar.calendar[0];
    const twitterPost = day1.posts.find(p => p.platform === 'twitter');

    if (!twitterPost) {
      console.error('❌ No Day 1 Twitter post found');
      return;
    }

    // Adapt content for Instagram/Facebook
    const content = this.personalizeContent(twitterPost.content);
    const platforms = ['instagram', 'facebook'];

    console.log('📝 Test post content:');
    console.log(content);
    console.log(`\n📱 Posting to: ${platforms.join(', ')}`);

    const result = await this.postViaAyrshare(content, platforms);

    if (result.success) {
      console.log('\n✅ Test post published successfully!');
      console.log(`Status: ${JSON.stringify(result.data, null, 2)}`);
    } else {
      console.log('\n❌ Test post failed');
      console.log(`Error: ${result.error}`);
    }

    return result;
  }
}

// ============================
// CLI INTERFACE
// ============================

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'preview';

  const launcher = new FINDERRLauncher();

  try {
    switch (command) {
      case 'preview':
        const days = parseInt(args[1]) || 3;
        await launcher.previewCampaign(days);
        break;

      case 'launch':
        console.log('⚠️  WARNING: This will schedule posts to Instagram and Facebook!');
        console.log('Press Ctrl+C within 5 seconds to cancel...\n');
        await new Promise(resolve => setTimeout(resolve, 5000));
        await launcher.launchCampaign();
        break;

      case 'test':
        await launcher.testPost();
        break;

      default:
        console.log(`
🚀 FINDERR Immediate Launch Script

Usage:
  node finderr-launch-now.js <command>

Commands:
  preview [days]   Preview first N days (default: 3)
  launch           Launch full 30-day campaign
  test             Post Day 1 test content

Connected Platforms (via Ayrshare):
  ✅ Instagram: @untrapd.hub
  ✅ Facebook: untrapd hub page
  ✅ Pinterest: untrapd hub

Note: TikTok and Twitter posts will be skipped (not on Ayrshare)
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

module.exports = FINDERRLauncher;
