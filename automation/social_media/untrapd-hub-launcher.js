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
        currentUsers: 1247,
        lifetimeSlots: 753,
        newUsersToday: 23
      }
    };
    
    this.logger.log('🧠 UNTRAPD Hub Automation Launcher initialized');
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

  async checkAndPostMilestones() {
    const currentUsers = this.state.finderrStats.currentUsers;
    const milestones = this.config.finderrIntegration.milestones;
    
    // Find if we've hit a milestone
    const hitMilestone = milestones.find(m => m.users === currentUsers);
    
    if (hitMilestone) {
      this.logger.log(`🎉 Milestone reached: ${currentUsers} users!`);
      
      // Create milestone content
      const milestoneContent = {
        content: hitMilestone.message,
        type: 'milestone',
        theme: 'Milestone Celebration',
        hashtags: ['#UntrapдHub', '#FINDERR', '#Milestone']
      };

      // Post immediately to all platforms
      await this.postToAllPlatforms(milestoneContent);
      
      return true;
    }
    
    return false;
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

    const milestoneInterval = setInterval(async () => {
      try {
        await this.checkAndPostMilestones();
      } catch (error) {
        this.logger.error('❌ Milestone check failed:', error.message);
      }
    }, 60 * 60 * 1000); // Every hour

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