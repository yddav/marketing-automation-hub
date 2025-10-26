#!/usr/bin/env node

/**
 * UNTRAPD HUB SOCIAL MEDIA AUTOMATION LAUNCHER
 * 
 * Main automation system that coordinates content generation, scheduling, and posting
 * across Instagram, Facebook, TikTok, and Twitter for @untrapd.hub
 */

const SocialMediaAPIHandler = require('./api-handler.js');
const config = require('./untrapd-hub-config.js');
const fs = require('fs').promises;
const path = require('path');

class UntrapdHubLauncher {
  constructor(options = {}) {
    this.config = config;
    this.demoMode = options.demoMode || false;
    this.logger = options.logger || console;
    
    // Initialize API handler
    this.apiHandler = new SocialMediaAPIHandler({ 
      demoMode: this.demoMode,
      logger: this.logger 
    });
    
    // State management
    this.state = {
      lastPost: null,
      dailyPostCount: {},
      weeklyThemeIndex: 0,
      finderrStats: {
        currentUsers: 150, // Updated to reflect current beta testing status
        lifetimeSlots: 753,
        newUsersToday: 23,
        tier1Count: 150,
        tier2Count: 0,
        tier3Count: 0,
        activeTier: 1
      },
      lastMilestoneReached: null // Track last milestone to prevent duplicate posts
    };

    this.logger.log('🧠 UNTRAPD Hub Automation Launcher initialized');
    this.logger.log('📊 FINDERR Milestone Tracking: 3-tier program (1K, 3K, 5K)');
  }

  // ============================
  // CONTENT GENERATION
  // ============================

  generateDailyContent() {
    const today = new Date();
    const dayName = today.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const themeKey = dayName === 'saturday' || dayName === 'sunday' ? 'weekend' : dayName;
    
    const theme = this.config.contentStrategy.weeklyThemes[themeKey];
    if (!theme) {
      throw new Error(`No theme found for ${dayName}`);
    }

    this.logger.log(`🎯 Generating content for ${theme.theme}`);

    // Select content type based on theme and day
    const contentTypes = this.getContentTypesForTheme(themeKey);
    const selectedType = contentTypes[Math.floor(Math.random() * contentTypes.length)];
    
    return this.generateContentByType(selectedType, theme);
  }

  getContentTypesForTheme(themeKey) {
    const themeMapping = {
      monday: ['educational', 'milestone'],
      tuesday: ['educational', 'feature'],
      wednesday: ['feature', 'testimonial'],
      thursday: ['ecosystem', 'testimonial'],
      friday: ['ecosystem', 'feature'],
      weekend: ['testimonial', 'community']
    };
    
    return themeMapping[themeKey] || ['educational'];
  }

  generateContentByType(type, theme) {
    const templates = this.config.automation.templates;
    const stats = this.state.finderrStats;
    
    let content;
    let mediaUrl = null;

    switch (type) {
      case 'milestone':
        content = templates.milestone
          .replace('{milestone_text}', `${stats.currentUsers} users joined the Untrapd Hub!`);
        break;
        
      case 'testimonial':
        const testimonials = [
          { text: "FINDERR saved my phone when I left it in a taxi! Amazing app!", user: "Sarah M." },
          { text: "Never worried about losing my phone again. FINDERR is a lifesaver!", user: "Mike R." },
          { text: "The remote lock feature is incredible. Peace of mind at its finest.", user: "Lisa K." },
          { text: "Finally, an app that actually works as advertised. 5 stars!", user: "David L." }
        ];
        const randomTestimonial = testimonials[Math.floor(Math.random() * testimonials.length)];
        content = templates.testimonial
          .replace('{testimonial}', randomTestimonial.text)
          .replace('{user_name}', randomTestimonial.user);
        break;
        
      case 'feature':
        const features = [
          { name: "Remote Lock", desc: "Lock your phone remotely if stolen" },
          { name: "GPS Tracking", desc: "Real-time location tracking with 99.7% accuracy" },
          { name: "Theft Alert", desc: "Instant notifications when device moves unexpectedly" },
          { name: "Recovery Mode", desc: "Guided recovery process with law enforcement support" }
        ];
        const randomFeature = features[Math.floor(Math.random() * features.length)];
        content = templates.feature
          .replace('{feature_name}', randomFeature.name)
          .replace('{feature_description}', randomFeature.desc);
        break;
        
      case 'educational':
        const tips = [
          "Always enable location services for better device recovery",
          "Set up Find My Device as a backup to FINDERR for double protection", 
          "Keep your phone charged above 20% for optimal tracking accuracy",
          "Register your device serial number for faster police recovery",
          "Use strong lock screen passwords - first line of defense"
        ];
        const randomTip = tips[Math.floor(Math.random() * tips.length)];
        content = templates.educational
          .replace('{tip_content}', randomTip);
        break;
        
      case 'ecosystem':
        const ecosystemContent = [
          "Coming to the Untrapd Hub: Smart Home Security Suite",
          "Next innovation: AI-powered device protection ecosystem",
          "Building the future: Intelligent security for all your devices",
          "FINDERR is just the beginning - more apps coming soon!"
        ];
        const randomEcosystem = ecosystemContent[Math.floor(Math.random() * ecosystemContent.length)];
        content = templates.ecosystem
          .replace('{future_app_tease}', randomEcosystem);
        break;
        
      default:
        content = "🧠 Your intelligence hub unleashed! 📱 FINDERR keeps your devices secure.";
    }

    // Add theme-specific context
    content = `${content}\n\n💡 ${theme.focus}`;

    return {
      content,
      mediaUrl,
      type,
      theme: theme.theme,
      hashtags: theme.hashtags
    };
  }

  // ============================
  // POSTING LOGIC
  // ============================

  async postToAllPlatforms(contentData, options = {}) {
    const { platforms = ['instagram', 'facebook', 'tiktok'] } = options;
    
    this.logger.log(`🚀 Posting "${contentData.theme}" content to ${platforms.length} platforms`);
    
    const results = [];

    for (const platform of platforms) {
      try {
        // Optimize content for platform
        const optimizedContent = this.apiHandler.optimizeContentForPlatform(
          contentData.content, 
          platform
        );

        // Post to platform
        let result;
        switch (platform) {
          case 'instagram':
            // Instagram requires media, so we'll skip or use a default image
            if (contentData.mediaUrl) {
              result = await this.apiHandler.postToInstagram(optimizedContent, contentData.mediaUrl);
            } else {
              this.logger.log('⏭️  Skipping Instagram (requires media)');
              continue;
            }
            break;
            
          case 'facebook':
            result = await this.apiHandler.postToFacebook(optimizedContent, contentData.mediaUrl);
            break;
            
          case 'tiktok':
            // TikTok requires video content
            if (contentData.mediaUrl && contentData.mediaUrl.includes('.mp4')) {
              result = await this.apiHandler.postToTikTok(optimizedContent, contentData.mediaUrl);
            } else {
              this.logger.log('⏭️  Skipping TikTok (requires video)');
              continue;
            }
            break;
            
          case 'twitter':
            result = await this.apiHandler.postToTwitter(optimizedContent, contentData.mediaUrl);
            break;
        }

        if (result) {
          results.push(result);
          this.updateDailyPostCount(platform);
        }

      } catch (error) {
        this.logger.error(`❌ Failed to post to ${platform}:`, error.message);
        results.push({
          success: false,
          platform,
          error: error.message
        });
      }
    }

    return results;
  }

  updateDailyPostCount(platform) {
    const today = new Date().toISOString().split('T')[0];
    if (!this.state.dailyPostCount[today]) {
      this.state.dailyPostCount[today] = {};
    }
    this.state.dailyPostCount[today][platform] = (this.state.dailyPostCount[today][platform] || 0) + 1;
  }

  // ============================
  // SCHEDULING SYSTEM
  // ============================

  async runDailyPosting() {
    this.logger.log('📅 Running daily posting routine...');
    
    try {
      // Generate today's content
      const contentData = this.generateDailyContent();
      
      // Check posting limits
      if (this.hasReachedDailyLimit()) {
        this.logger.log('⏸️  Daily posting limit reached, skipping');
        return;
      }

      // Post to platforms
      const results = await this.postToAllPlatforms(contentData);
      
      // Log results
      const successful = results.filter(r => r.success).length;
      this.logger.log(`✅ Daily posting complete: ${successful}/${results.length} successful`);
      
      // Update state
      this.state.lastPost = {
        timestamp: new Date().toISOString(),
        content: contentData,
        results
      };

      return results;

    } catch (error) {
      this.logger.error('❌ Daily posting failed:', error.message);
      throw error;
    }
  }

  hasReachedDailyLimit() {
    const today = new Date().toISOString().split('T')[0];
    const todaysCounts = this.state.dailyPostCount[today] || {};
    
    // Check against posting schedule limits
    const schedule = this.config.contentStrategy.postingSchedule;
    
    for (const platform in schedule) {
      const limit = schedule[platform].feedPosts || schedule[platform].tweets || schedule[platform].posts || schedule[platform].videos || 1;
      const current = todaysCounts[platform] || 0;
      
      if (current < limit) {
        return false; // Still have posts remaining for at least one platform
      }
    }
    
    return true; // All platforms at limit
  }

  // ============================
  // MILESTONE AUTOMATION
  // ============================

  /**
   * Check FINDERR tiered milestone progress and trigger celebration posts
   * Monitors 3-tier early adopter program:
   * - Tier 1 (Founder's Circle): 1,000 subscribers
   * - Tier 2 (Early Adopter): 3,000 subscribers (cumulative)
   * - Tier 3 (Launch Supporter): 5,000 subscribers (cumulative)
   *
   * Integration point: /api/finderr/milestones endpoint
   * Check frequency: Every 30 minutes (via milestoneInterval)
   *
   * @returns {Promise<boolean>} True if milestone was reached and post triggered
   */
  async checkFINDERRMilestones() {
    try {
      // TODO: Replace with actual API call when endpoint is ready
      // const response = await fetch('/api/finderr/milestones');
      // const milestoneData = await response.json();

      // Placeholder data structure (replace with API response)
      const milestoneData = {
        totalSubscribers: this.state.finderrStats.currentUsers,
        tier1Count: Math.min(this.state.finderrStats.currentUsers, 1000),
        tier2Count: Math.max(0, Math.min(this.state.finderrStats.currentUsers - 1000, 2000)),
        tier3Count: Math.max(0, Math.min(this.state.finderrStats.currentUsers - 3000, 2000)),
        activeTier: this.state.finderrStats.currentUsers <= 1000 ? 1 :
                    this.state.finderrStats.currentUsers <= 3000 ? 2 :
                    this.state.finderrStats.currentUsers <= 5000 ? 3 : 4,
        lastMilestoneReached: null // Track last milestone to avoid duplicate posts
      };

      // Define tier milestones
      const tierMilestones = [
        {
          threshold: 1000,
          tier: 1,
          name: 'Founder\'s Circle',
          message: '🎉 MILESTONE REACHED: 1,000 Founders!\n\n' +
                   'Tier 1 (Founder\'s Circle) is now FULL! 🏆\n\n' +
                   '✅ 1,000 Android users secured:\n' +
                   '• v5.0 & v6.0 FREE (lifetime)\n' +
                   '• v7.0 early access\n' +
                   '• Lifetime price lock at $6.99\n\n' +
                   '🚀 Tier 2 (Early Adopter) NOW OPEN!\n' +
                   '2,000 spots available for next wave.\n\n' +
                   '#FINDERR #AndroidSecurity #MilestoneReached',
          hashtags: ['#FINDERR', '#Milestone', '#FoundersCircle', '#AndroidSecurity']
        },
        {
          threshold: 3000,
          tier: 2,
          name: 'Early Adopter',
          message: '🎉 MILESTONE REACHED: 3,000 Subscribers!\n\n' +
                   'Tier 2 (Early Adopter) is now FULL! 🏆\n\n' +
                   '✅ 3,000 total users (1,000 Founders + 2,000 Early Adopters)\n' +
                   '✅ All secured FREE v5.0 & v6.0 upgrades\n\n' +
                   '🚀 Tier 3 (Launch Supporter) NOW OPEN!\n' +
                   'FINAL 2,000 spots for FREE upgrades.\n\n' +
                   'After 5,000: v5.0 costs +$3/mo, v6.0 costs +$4/mo!\n\n' +
                   '#FINDERR #AndroidSecurity #MilestoneReached',
          hashtags: ['#FINDERR', '#Milestone', '#EarlyAdopter', '#AndroidSecurity']
        },
        {
          threshold: 5000,
          tier: 3,
          name: 'Launch Supporter',
          message: '🎉 MAJOR MILESTONE: 5,000 SUBSCRIBERS! 🎉\n\n' +
                   'Early Adopter Program is now CLOSED! 🏆\n\n' +
                   '✅ 5,000 Android users secured FREE upgrades:\n' +
                   '• 1,000 Founders (Tier 1)\n' +
                   '• 2,000 Early Adopters (Tier 2)\n' +
                   '• 2,000 Launch Supporters (Tier 3)\n\n' +
                   '🚨 NEW PRICING EFFECTIVE NOW:\n' +
                   '• v4.1 Base: $6.99/mo\n' +
                   '• v5.0 GPS Tracking: +$3/mo\n' +
                   '• v6.0 Mesh Network: +$4/mo\n' +
                   '• Full Suite: $12.97/mo\n\n' +
                   'Join 5,000+ happy FINDERR users! 🚀\n\n' +
                   '#FINDERR #AndroidSecurity #5000Subscribers #MilestoneReached',
          hashtags: ['#FINDERR', '#Milestone', '#5000Subscribers', '#AndroidSecurity', '#LaunchSuccess']
        }
      ];

      // Check if we've hit a tier milestone
      const currentTotal = milestoneData.totalSubscribers;
      const hitMilestone = tierMilestones.find(m =>
        currentTotal >= m.threshold &&
        (!this.state.lastMilestoneReached || this.state.lastMilestoneReached < m.threshold)
      );

      if (hitMilestone) {
        this.logger.log(`🎉 Tier ${hitMilestone.tier} milestone reached: ${currentTotal} subscribers!`);

        // Create milestone celebration content
        const milestoneContent = {
          content: hitMilestone.message,
          type: 'milestone',
          theme: `Tier ${hitMilestone.tier} Milestone: ${hitMilestone.name}`,
          hashtags: hitMilestone.hashtags
        };

        // Post immediately to all platforms
        const results = await this.postToAllPlatforms(milestoneContent, {
          platforms: ['instagram', 'facebook', 'twitter'] // Prioritize high-reach platforms
        });

        // Update state to prevent duplicate milestone posts
        this.state.lastMilestoneReached = hitMilestone.threshold;

        // Log milestone achievement
        this.logger.log(`✅ Tier ${hitMilestone.tier} milestone celebration posted to ${results.filter(r => r.success).length} platforms`);

        return true;
      }

      // Log progress toward next milestone if close (within 50 subscribers)
      const nextMilestone = tierMilestones.find(m => m.threshold > currentTotal);
      if (nextMilestone && (nextMilestone.threshold - currentTotal) <= 50) {
        this.logger.log(`📊 Approaching Tier ${nextMilestone.tier} milestone: ${currentTotal}/${nextMilestone.threshold} (${nextMilestone.threshold - currentTotal} to go)`);
      }

      return false;

    } catch (error) {
      this.logger.error('❌ Failed to check FINDERR milestones:', error.message);
      return false;
    }
  }

  /**
   * Legacy milestone checker (backward compatibility)
   * Use checkFINDERRMilestones() for tiered program
   */
  async checkAndPostMilestones() {
    return await this.checkFINDERRMilestones();
  }

  // ============================
  // ANALYTICS & MONITORING
  // ============================

  async generateDailyReport() {
    this.logger.log('📊 Generating daily analytics report...');
    
    const insights = await this.apiHandler.getAllInsights();
    const today = new Date().toISOString().split('T')[0];
    const todaysPosts = this.state.dailyPostCount[today] || {};
    
    const report = {
      date: today,
      posting: {
        totalPosts: Object.values(todaysPosts).reduce((a, b) => a + b, 0),
        byPlatform: todaysPosts
      },
      followers: insights.totals,
      finderrStats: this.state.finderrStats,
      lastContent: this.state.lastPost?.content || null,
      timestamp: new Date().toISOString()
    };

    // Save report
    await this.saveReport(report);
    
    this.logger.log(`📈 Report: ${report.posting.totalPosts} posts, ${insights.totals.followers} total followers`);
    return report;
  }

  async saveReport(report) {
    try {
      const reportsDir = path.join(__dirname, 'reports');
      await fs.mkdir(reportsDir, { recursive: true });
      
      const filename = `daily-report-${report.date}.json`;
      const filepath = path.join(reportsDir, filename);
      
      await fs.writeFile(filepath, JSON.stringify(report, null, 2));
      this.logger.log(`💾 Report saved: ${filename}`);
      
    } catch (error) {
      this.logger.error('❌ Failed to save report:', error.message);
    }
  }

  // ============================
  // MAIN AUTOMATION LOOP
  // ============================

  async start(options = {}) {
    const { runOnce = false, skipValidation = false } = options;
    
    this.logger.log('🚀 Starting UNTRAPD Hub Social Media Automation');
    this.logger.log('='.repeat(60));
    
    // Validate API tokens
    if (!skipValidation && !this.demoMode) {
      const validations = await this.apiHandler.validateApiTokens();
      const validCount = Object.values(validations).filter(v => v).length;
      
      if (validCount === 0) {
        this.logger.error('❌ No valid API tokens found. Check your .env configuration.');
        return;
      }
      
      this.logger.log(`✅ API validation complete: ${validCount}/4 platforms ready`);
    }

    if (runOnce) {
      // Run once and exit
      await this.runDailyPosting();
      await this.checkAndPostMilestones();
      await this.generateDailyReport();
      this.logger.log('✅ Single run complete');
      return;
    }

    // Continuous operation (for production)
    this.logger.log('🔄 Starting continuous automation...');
    this.logger.log('Press Ctrl+C to stop');
    
    // Run initial posting
    await this.runDailyPosting();
    
    // Set up intervals
    const dailyInterval = setInterval(async () => {
      try {
        await this.runDailyPosting();
        await this.generateDailyReport();
      } catch (error) {
        this.logger.error('❌ Daily routine failed:', error.message);
      }
    }, 24 * 60 * 60 * 1000); // Every 24 hours

    // Check FINDERR milestones every 30 minutes for 3-tier program
    const milestoneInterval = setInterval(async () => {
      try {
        await this.checkFINDERRMilestones();
      } catch (error) {
        this.logger.error('❌ Milestone check failed:', error.message);
      }
    }, 30 * 60 * 1000); // Every 30 minutes (increased frequency for tier tracking)

    // Graceful shutdown
    process.on('SIGINT', () => {
      this.logger.log('🛑 Shutting down automation...');
      clearInterval(dailyInterval);
      clearInterval(milestoneInterval);
      process.exit(0);
    });
  }

  // ============================
  // UTILITY METHODS
  // ============================

  async updateFinderrStats(newStats) {
    this.state.finderrStats = { ...this.state.finderrStats, ...newStats };
    this.logger.log(`📊 FINDERR stats updated: ${this.state.finderrStats.currentUsers} users`);
  }

  getStatus() {
    return {
      isRunning: true,
      demoMode: this.demoMode,
      lastPost: this.state.lastPost,
      dailyPostCount: this.state.dailyPostCount,
      finderrStats: this.state.finderrStats
    };
  }
}

// CLI Interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const demoMode = args.includes('--demo');
  const runOnce = args.includes('--once');
  const skipValidation = args.includes('--skip-validation');

  const launcher = new UntrapdHubLauncher({ demoMode });
  
  launcher.start({ runOnce, skipValidation }).catch(error => {
    console.error('❌ Launcher failed:', error.message);
    process.exit(1);
  });
}

module.exports = UntrapdHubLauncher;