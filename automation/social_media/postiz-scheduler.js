#!/usr/bin/env node

/**
 * POSTIZ SCHEDULER
 * 
 * Replaces Axiom browser automation with reliable API-based scheduling
 * Handles daily themes, milestones, and content automation
 */

const PostizAPIHandler = require('./postiz-api-handler.js');
const cron = require('node-cron');

class PostizScheduler {
  constructor(options = {}) {
    this.postiz = new PostizAPIHandler({
      postizUrl: options.postizUrl || 'http://localhost:3000',
      demoMode: options.demoMode || false,
      logger: options.logger || console
    });
    
    this.logger = options.logger || console;
    this.isRunning = false;
    this.scheduledJobs = new Map();
  }

  // ============================
  // DAILY THEME AUTOMATION
  // ============================

  async setupDailyThemes() {
    this.logger.log('📅 Setting up daily theme automation...');

    const themes = {
      // Monday - 9:00 AM
      '0 9 * * 1': {
        name: 'Motivation Monday',
        content: {
          text: '🎯 Motivation Monday: Start your week knowing your phone is secure with FINDERR! Never lose your device permanently again. #MotivationMonday #FINDERR #PhoneSecurity #UNTRAPDHub',
          mediaUrls: ['/home/wolfy/Downloads/untrapd_images/motivation_monday.jpg']
        },
        theme: 'motivation_monday'
      },

      // Tuesday - 12:00 PM
      '0 12 * * 2': {
        name: 'Tech Tuesday',
        content: {
          text: '🔧 Tech Tuesday: FINDERR\'s device identification system works instantly to help recover your lost phone! #TechTuesday #TechTips #FINDERR #PhoneRecovery',
          mediaUrls: ['/home/wolfy/Downloads/untrapd_images/tech_tuesday.jpg']
        },
        theme: 'tech_tuesday'
      },

      // Wednesday - 3:00 PM
      '0 15 * * 3': {
        name: 'Widget Wednesday',
        content: {
          text: '⚡ Widget Wednesday: FINDERR\'s smart widget keeps your phone findable 24/7 with zero battery drain! #WidgetWednesday #FINDERR #SmartWidget #TechLife',
          mediaUrls: ['/home/wolfy/Downloads/untrapd_images/widget_wednesday.jpg']
        },
        theme: 'widget_wednesday'
      },

      // Thursday - 6:00 PM
      '0 18 * * 4': {
        name: 'Throwback Thursday',
        content: {
          text: '📸 Throwback Thursday: Remember when losing your phone meant losing all your photos, contacts, and memories? FINDERR changed everything! #ThrowbackThursday #PhoneSecurity #LifeSaver #FINDERR',
          mediaUrls: ['/home/wolfy/Downloads/untrapd_images/throwback_thursday.jpg']
        },
        theme: 'throwback_thursday'
      },

      // Friday - 9:00 AM
      '0 9 * * 5': {
        name: 'Feature Friday',
        content: {
          text: '🚀 Feature Friday: FINDERR\'s core device identification features keep getting better! Family sharing coming in future updates! #FeatureFriday #FINDERR #DeviceID #AppUpdate',
          mediaUrls: ['/home/wolfy/Downloads/untrapd_images/feature_friday.jpg']
        },
        theme: 'feature_friday'
      },

      // Saturday - 11:00 AM
      '0 11 * * 6': {
        name: 'Weekend Wins',
        content: {
          text: '🌟 Weekend Wins: This week, FINDERR helped 47 users recover their lost phones! Share your success story in the comments! #WeekendWins #UserStories #FINDERR #Community',
          mediaUrls: ['/home/wolfy/Downloads/untrapd_images/weekend_wins.jpg']
        },
        theme: 'community_weekend'
      },

      // Sunday - 2:00 PM
      '0 14 * * 0': {
        name: 'Sunday Success',
        content: {
          text: '💪 Sunday Success: Join 2,000+ users who never worry about losing their phones thanks to FINDERR! Download today! #SundaySuccess #JoinTheMovement #FINDERR #PhoneSecurity',
          mediaUrls: ['/home/wolfy/Downloads/untrapd_images/sunday_success.jpg']
        },
        theme: 'community_weekend'
      }
    };

    // Schedule each theme
    for (const [cronPattern, themeData] of Object.entries(themes)) {
      const job = cron.schedule(cronPattern, async () => {
        await this.postDailyTheme(themeData);
      }, {
        scheduled: false,
        timezone: 'America/New_York'
      });

      this.scheduledJobs.set(themeData.name, job);
      this.logger.log(`📋 Scheduled: ${themeData.name} (${cronPattern})`);
    }

    this.logger.log(`✅ ${Object.keys(themes).length} daily themes configured`);
    return themes;
  }

  async postDailyTheme(themeData) {
    this.logger.log(`🎯 Posting daily theme: ${themeData.name}`);

    try {
      const result = await this.postiz.postDailyTheme(themeData.theme, themeData.content);
      
      if (result.success) {
        this.logger.log(`✅ ${themeData.name} posted successfully`);
      } else {
        this.logger.error(`❌ ${themeData.name} failed: ${result.error}`);
      }

      return result;

    } catch (error) {
      this.logger.error(`❌ ${themeData.name} error: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  // ============================
  // MILESTONE AUTOMATION
  // ============================

  async setupMilestoneWebhook(port = 8080) {
    this.logger.log('🎯 Setting up milestone webhook listener...');

    const express = require('express');
    const app = express();
    
    app.use(express.json());

    // Webhook endpoint for FINDERR milestones
    app.post('/webhook/milestone', async (req, res) => {
      try {
        const { userCount, additionalData } = req.body;
        
        this.logger.log(`🎉 Milestone webhook received: ${userCount} users`);
        
        const result = await this.postiz.postMilestone(userCount);
        
        if (result.success) {
          this.logger.log(`✅ Milestone ${userCount} posted successfully`);
          res.json({ success: true, message: 'Milestone posted' });
        } else {
          this.logger.error(`❌ Milestone ${userCount} failed: ${result.error}`);
          res.status(500).json({ success: false, error: result.error });
        }

      } catch (error) {
        this.logger.error(`❌ Webhook error: ${error.message}`);
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Health check endpoint
    app.get('/health', (req, res) => {
      res.json({ 
        status: 'running',
        uptime: process.uptime(),
        scheduler: this.isRunning ? 'active' : 'stopped'
      });
    });

    app.listen(port, () => {
      this.logger.log(`📡 Milestone webhook listening on port ${port}`);
      this.logger.log(`🔗 Webhook URL: http://localhost:${port}/webhook/milestone`);
    });

    return app;
  }

  // ============================
  // SCHEDULER CONTROL
  // ============================

  start() {
    if (this.isRunning) {
      this.logger.log('⚠️ Scheduler already running');
      return;
    }

    this.logger.log('🚀 Starting Postiz scheduler...');
    
    // Start all scheduled jobs
    for (const [name, job] of this.scheduledJobs) {
      job.start();
      this.logger.log(`▶️ Started: ${name}`);
    }

    this.isRunning = true;
    this.logger.log('✅ Postiz scheduler is running');
  }

  stop() {
    if (!this.isRunning) {
      this.logger.log('⚠️ Scheduler not running');
      return;
    }

    this.logger.log('⏹️ Stopping Postiz scheduler...');
    
    // Stop all scheduled jobs
    for (const [name, job] of this.scheduledJobs) {
      job.stop();
      this.logger.log(`⏸️ Stopped: ${name}`);
    }

    this.isRunning = false;
    this.logger.log('✅ Postiz scheduler stopped');
  }

  status() {
    const jobStatuses = Array.from(this.scheduledJobs.entries()).map(([name, job]) => ({
      name,
      running: job.running,
      pattern: job.cronTime.source
    }));

    return {
      isRunning: this.isRunning,
      totalJobs: this.scheduledJobs.size,
      activeJobs: jobStatuses.filter(j => j.running).length,
      jobs: jobStatuses
    };
  }

  // ============================
  // MANUAL POSTING
  // ============================

  async postNow(contentType, customContent = null) {
    this.logger.log(`🚀 Manual post triggered: ${contentType}`);

    try {
      let result;

      switch (contentType) {
        case 'milestone':
          const userCount = customContent?.userCount || 500;
          result = await this.postiz.postMilestone(userCount);
          break;

        case 'test':
          const testContent = customContent || {
            text: '🧪 Manual test post from UNTRAPD Hub! FINDERR automation is working perfectly. #Test #FINDERR #UNTRAPDHub'
          };
          result = await this.postiz.post(testContent);
          break;

        default:
          throw new Error(`Unknown content type: ${contentType}`);
      }

      return result;

    } catch (error) {
      this.logger.error(`❌ Manual post failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
}

module.exports = PostizScheduler;

// CLI Usage
if (require.main === module) {
  const scheduler = new PostizScheduler({ 
    demoMode: process.env.NODE_ENV !== 'production' 
  });

  async function main() {
    try {
      console.log('🎯 Initializing Postiz Scheduler...\n');

      // Setup daily themes
      await scheduler.setupDailyThemes();

      // Setup milestone webhook
      await scheduler.setupMilestoneWebhook(8080);

      // Start scheduler
      scheduler.start();

      // Show status
      const status = scheduler.status();
      console.log('\n📊 SCHEDULER STATUS:');
      console.log(`Running: ${status.isRunning ? '✅' : '❌'}`);
      console.log(`Jobs: ${status.activeJobs}/${status.totalJobs} active`);

      console.log('\n🎉 Postiz automation ready!');
      console.log('📱 Daily themes will post automatically');
      console.log('🎯 Milestone webhook ready for FINDERR integration');
      console.log('🔗 Webhook URL: http://localhost:8080/webhook/milestone');

      // Keep process running
      process.on('SIGINT', () => {
        console.log('\n⏹️ Shutting down scheduler...');
        scheduler.stop();
        process.exit(0);
      });

    } catch (error) {
      console.error(`❌ Scheduler setup failed: ${error.message}`);
      process.exit(1);
    }
  }

  main();
}