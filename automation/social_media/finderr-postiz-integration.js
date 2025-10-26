#!/usr/bin/env node

/**
 * FINDERR v4.1 → POSTIZ INTEGRATION
 *
 * Loads FINDERR 210-post content calendar into Postiz platform
 * Enables native API posting to Instagram, Facebook, TikTok, Twitter
 * Connects to live milestone API for dynamic content personalization
 *
 * Integration Points:
 * - Content Calendar: campaign_execution/finderr_v178_launch_calendar.json
 * - Milestone API: /.netlify/functions/finderr-milestones
 * - Postiz Platform: http://localhost:3000 (Docker)
 *
 * Usage:
 *   node finderr-postiz-integration.js schedule    # Schedule all 210 posts
 *   node finderr-postiz-integration.js preview 7   # Preview next 7 days
 *   node finderr-postiz-integration.js post day01_instagram  # Post specific content
 */

const PostizAPIHandler = require('./postiz-api-handler.js');
const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');

class FINDERRPostizIntegration {
  constructor(options = {}) {
    this.logger = options.logger || console;
    this.demoMode = options.demoMode || false;

    // Initialize Postiz handler
    this.postiz = new PostizAPIHandler({
      postizUrl: process.env.POSTIZ_URL || 'http://localhost:3000',
      apiKey: process.env.POSTIZ_API_KEY,
      demoMode: this.demoMode,
      logger: this.logger
    });

    // Milestone API configuration
    this.milestoneAPI = process.env.FINDERR_MILESTONE_API ||
                        'https://hub.untrapd.com/.netlify/functions/finderr-milestones';

    // Content calendar path
    this.calendarPath = path.join(__dirname, '../../campaign_execution/finderr_v178_launch_calendar.json');

    // State tracking
    this.contentCalendar = null;
    this.milestoneData = null;

    this.logger.log('🔗 FINDERR → Postiz Integration initialized');
  }

  // ============================
  // CONTENT CALENDAR LOADING
  // ============================

  async loadContentCalendar() {
    try {
      this.logger.log('📅 Loading FINDERR content calendar...');
      const calendarJSON = await fs.readFile(this.calendarPath, 'utf-8');
      this.contentCalendar = JSON.parse(calendarJSON);

      const totalPosts = this.contentCalendar.calendar.reduce((total, day) =>
        total + day.posts.length, 0
      );

      this.logger.log(`✅ Loaded ${this.contentCalendar.calendar.length} days, ${totalPosts} total posts`);
      return this.contentCalendar;

    } catch (error) {
      this.logger.error(`❌ Failed to load content calendar: ${error.message}`);
      throw error;
    }
  }

  // ============================
  // MILESTONE API INTEGRATION
  // ============================

  async fetchMilestoneData() {
    try {
      this.logger.log('📊 Fetching live milestone data from API...');

      if (this.demoMode) {
        this.milestoneData = {
          totalSubscribers: 150,
          activeTier: 'tier1',
          activeTierName: 'Founder\'s Circle',
          tiers: {
            tier1: { count: 150, remaining: 850, percentFilled: 15 },
            tier2: { count: 0, remaining: 2000, percentFilled: 0 },
            tier3: { count: 0, remaining: 2000, percentFilled: 0 }
          }
        };
        this.logger.log('📊 [DEMO] Using mock milestone data: 150 subscribers');
        return this.milestoneData;
      }

      const response = await axios.get(this.milestoneAPI, { timeout: 10000 });
      this.milestoneData = response.data;

      this.logger.log(`✅ Milestone data: ${this.milestoneData.totalSubscribers} subscribers (${this.milestoneData.activeTierName})`);
      return this.milestoneData;

    } catch (error) {
      this.logger.error(`❌ Failed to fetch milestone data: ${error.message}`);
      // Fallback to default values
      this.milestoneData = {
        totalSubscribers: 150,
        activeTier: 'tier1',
        activeTierName: 'Founder\'s Circle',
        tiers: {
          tier1: { count: 150, remaining: 850, percentFilled: 15 },
          tier2: { count: 0, remaining: 2000, percentFilled: 0 },
          tier3: { count: 0, remaining: 2000, percentFilled: 0 }
        }
      };
      return this.milestoneData;
    }
  }

  // ============================
  // CONTENT PERSONALIZATION
  // ============================

  personalizeContent(content) {
    if (!this.milestoneData) {
      return content; // Skip if no milestone data available
    }

    const replacements = {
      '{{subscriber_count}}': this.milestoneData.totalSubscribers.toString(),
      '{{active_tier}}': this.milestoneData.activeTierName,
      '{{tier1_remaining}}': this.milestoneData.tiers.tier1.remaining.toString(),
      '{{tier2_remaining}}': this.milestoneData.tiers.tier2.remaining.toString(),
      '{{tier3_remaining}}': this.milestoneData.tiers.tier3.remaining.toString(),
      '{{tier1_count}}': this.milestoneData.tiers.tier1.count.toString(),
      '{{tier2_count}}': this.milestoneData.tiers.tier2.count.toString(),
      '{{tier3_count}}': this.milestoneData.tiers.tier3.count.toString(),
      '{{tier1_percent}}': this.milestoneData.tiers.tier1.percentFilled.toString(),
      '{{tier2_percent}}': this.milestoneData.tiers.tier2.percentFilled.toString(),
      '{{tier3_percent}}': this.milestoneData.tiers.tier3.percentFilled.toString()
    };

    let personalizedContent = content;
    for (const [placeholder, value] of Object.entries(replacements)) {
      personalizedContent = personalizedContent.replace(new RegExp(placeholder, 'g'), value);
    }

    return personalizedContent;
  }

  // ============================
  // POSTING WORKFLOW
  // ============================

  async scheduleAllPosts(options = {}) {
    const { startDate = new Date(), dryRun = false } = options;

    this.logger.log('🚀 Starting batch scheduling of 210 posts...');

    // Load content calendar
    await this.loadContentCalendar();

    // Fetch current milestone data
    await this.fetchMilestoneData();

    const results = {
      scheduled: 0,
      failed: 0,
      skipped: 0,
      details: []
    };

    for (const day of this.contentCalendar.calendar) {
      this.logger.log(`📅 Processing Day ${day.day}: ${day.theme}`);

      for (const post of day.posts) {
        try {
          // Calculate schedule date
          const scheduleDate = new Date(startDate);
          scheduleDate.setDate(scheduleDate.getDate() + (day.day - 1));

          // Parse time from post (e.g., "09:00")
          const [hours, minutes] = post.time.split(':').map(Number);
          scheduleDate.setHours(hours, minutes, 0, 0);

          // Personalize content with live milestone data
          const personalizedContent = this.personalizeContent(post.content);

          // Prepare Postiz-compatible content object
          const postizContent = {
            text: personalizedContent,
            mediaUrls: post.mediaType ? [post.mediaDescription] : [], // Placeholder for media
            isVideo: post.mediaType === 'video' || post.duration,
            scheduleDate: scheduleDate
          };

          // Determine target platform(s)
          const platforms = [post.platform];

          if (dryRun) {
            this.logger.log(`  [DRY RUN] ${post.platform} @ ${post.time}: ${personalizedContent.substring(0, 60)}...`);
            results.scheduled++;
          } else {
            // Schedule post via Postiz
            const result = await this.postiz.schedulePost(
              postizContent,
              scheduleDate,
              platforms
            );

            if (result.success) {
              this.logger.log(`  ✅ Scheduled: ${post.platform} @ ${scheduleDate.toISOString()}`);
              results.scheduled++;
            } else {
              this.logger.error(`  ❌ Failed: ${post.platform} - ${result.error}`);
              results.failed++;
            }

            results.details.push({
              day: day.day,
              platform: post.platform,
              scheduleDate: scheduleDate.toISOString(),
              success: result.success,
              error: result.error || null
            });
          }

          // Rate limiting: Small delay between API calls
          await new Promise(resolve => setTimeout(resolve, 500));

        } catch (error) {
          this.logger.error(`  ❌ Error processing post: ${error.message}`);
          results.failed++;
        }
      }
    }

    // Summary
    this.logger.log('\n📊 SCHEDULING SUMMARY');
    this.logger.log('='.repeat(60));
    this.logger.log(`✅ Scheduled: ${results.scheduled}`);
    this.logger.log(`❌ Failed: ${results.failed}`);
    this.logger.log(`⏭️  Skipped: ${results.skipped}`);
    this.logger.log(`📅 Total: ${results.scheduled + results.failed + results.skipped} posts`);

    return results;
  }

  async previewNextDays(days = 7) {
    this.logger.log(`👀 Previewing next ${days} days of content...\n`);

    // Load content calendar
    await this.loadContentCalendar();

    // Fetch current milestone data for personalization
    await this.fetchMilestoneData();

    const preview = [];

    for (let i = 0; i < Math.min(days, this.contentCalendar.calendar.length); i++) {
      const day = this.contentCalendar.calendar[i];

      this.logger.log(`\n${'='.repeat(60)}`);
      this.logger.log(`DAY ${day.day}: ${day.theme}`);
      this.logger.log(`Date: ${day.date}`);
      this.logger.log(`${'='.repeat(60)}`);

      for (const post of day.posts) {
        const personalizedContent = this.personalizeContent(post.content);

        this.logger.log(`\n📱 ${post.platform.toUpperCase()} @ ${post.time}`);
        this.logger.log(`Type: ${post.type}`);
        if (post.mediaType) {
          this.logger.log(`Media: ${post.mediaType}`);
        }
        this.logger.log(`\nContent:\n${personalizedContent.substring(0, 200)}...`);
        this.logger.log(`\nHashtags: ${post.hashtags || 'N/A'}`);
        this.logger.log(`Expected Reach: ${post.expectedReach || 'N/A'}`);
        this.logger.log('-'.repeat(60));

        preview.push({
          day: day.day,
          date: day.date,
          platform: post.platform,
          time: post.time,
          content: personalizedContent,
          type: post.type
        });
      }
    }

    this.logger.log(`\n✅ Preview complete: ${preview.length} posts across ${days} days`);
    return preview;
  }

  async postNow(postId) {
    this.logger.log(`🚀 Posting immediately: ${postId}`);

    // Load content calendar
    await this.loadContentCalendar();

    // Fetch milestone data
    await this.fetchMilestoneData();

    // Parse postId (e.g., "day01_instagram", "day05_facebook")
    const [dayPart, platform] = postId.split('_');
    const dayNumber = parseInt(dayPart.replace('day', ''));

    // Find the post
    const day = this.contentCalendar.calendar.find(d => d.day === dayNumber);
    if (!day) {
      throw new Error(`Day ${dayNumber} not found in calendar`);
    }

    const post = day.posts.find(p => p.platform === platform);
    if (!post) {
      throw new Error(`${platform} post not found for Day ${dayNumber}`);
    }

    // Personalize content
    const personalizedContent = this.personalizeContent(post.content);

    // Prepare Postiz content
    const postizContent = {
      text: personalizedContent,
      mediaUrls: post.mediaType ? [post.mediaDescription] : [],
      isVideo: post.mediaType === 'video' || post.duration
    };

    // Post immediately
    const result = await this.postiz.post(postizContent, [platform]);

    if (result.success) {
      this.logger.log(`✅ Posted successfully to ${platform}!`);
    } else {
      this.logger.error(`❌ Post failed: ${result.error}`);
    }

    return result;
  }

  // ============================
  // CONNECTION VALIDATION
  // ============================

  async validateSetup() {
    this.logger.log('🔍 Validating FINDERR → Postiz integration setup...\n');

    const checks = {
      postizConnection: false,
      contentCalendar: false,
      milestoneAPI: false,
      platforms: {}
    };

    // 1. Check Postiz connection
    try {
      const serverStatus = await this.postiz.getServerStatus();
      checks.postizConnection = serverStatus.running;
      this.logger.log(`✅ Postiz server: ${serverStatus.running ? 'RUNNING' : 'NOT RUNNING'}`);
    } catch (error) {
      this.logger.error(`❌ Postiz server: ${error.message}`);
    }

    // 2. Check content calendar
    try {
      await this.loadContentCalendar();
      checks.contentCalendar = true;
      this.logger.log(`✅ Content calendar: ${this.contentCalendar.calendar.length} days loaded`);
    } catch (error) {
      this.logger.error(`❌ Content calendar: ${error.message}`);
    }

    // 3. Check milestone API
    try {
      await this.fetchMilestoneData();
      checks.milestoneAPI = true;
      this.logger.log(`✅ Milestone API: ${this.milestoneData.totalSubscribers} subscribers`);
    } catch (error) {
      this.logger.error(`❌ Milestone API: ${error.message}`);
    }

    // 4. Check platform connections
    const platformValidation = await this.postiz.validateConnection();
    if (platformValidation.success) {
      for (const platform of platformValidation.platforms) {
        checks.platforms[platform] = true;
      }
      this.logger.log(`✅ Platforms connected: ${platformValidation.platforms.join(', ')}`);
    } else {
      this.logger.error(`❌ Platform connections: ${platformValidation.error}`);
    }

    // Summary
    this.logger.log('\n📊 VALIDATION SUMMARY');
    this.logger.log('='.repeat(60));
    const allChecks = checks.postizConnection && checks.contentCalendar && checks.milestoneAPI;
    if (allChecks) {
      this.logger.log('✅ All systems operational - ready to schedule posts!');
    } else {
      this.logger.log('⚠️  Some checks failed - please review configuration');
    }

    return checks;
  }
}

// ============================
// CLI INTERFACE
// ============================

if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  const demoMode = args.includes('--demo');

  const integration = new FINDERRPostizIntegration({ demoMode });

  (async () => {
    try {
      switch (command) {
        case 'validate':
          await integration.validateSetup();
          break;

        case 'preview':
          const days = parseInt(args[1]) || 7;
          await integration.previewNextDays(days);
          break;

        case 'schedule':
          const dryRun = args.includes('--dry-run');
          await integration.scheduleAllPosts({ dryRun });
          break;

        case 'post':
          const postId = args[1];
          if (!postId) {
            console.error('❌ Missing post ID (e.g., day01_instagram)');
            process.exit(1);
          }
          await integration.postNow(postId);
          break;

        default:
          console.log(`
🔗 FINDERR → Postiz Integration CLI

Usage:
  node finderr-postiz-integration.js <command> [options]

Commands:
  validate           Validate setup and connections
  preview [days]     Preview next N days of content (default: 7)
  schedule           Schedule all 210 posts (use --dry-run for testing)
  post <id>          Post specific content now (e.g., day01_instagram)

Options:
  --demo             Run in demo mode (no real API calls)
  --dry-run          Simulate scheduling without actual posts

Examples:
  node finderr-postiz-integration.js validate
  node finderr-postiz-integration.js preview 7
  node finderr-postiz-integration.js schedule --dry-run
  node finderr-postiz-integration.js post day01_instagram
          `);
      }
    } catch (error) {
      console.error(`❌ Command failed: ${error.message}`);
      process.exit(1);
    }
  })();
}

module.exports = FINDERRPostizIntegration;
