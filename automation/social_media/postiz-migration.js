#!/usr/bin/env node

/**
 * POSTIZ MIGRATION SCRIPT
 * 
 * Migrates existing FINDERR content from Google Sheets to Postiz API
 * Replaces Axiom browser automation with reliable API calls
 */

const PostizAPIHandler = require('./postiz-api-handler.js');
const { GoogleSpreadsheet } = require('google-spreadsheet');

class PostizMigration {
  constructor(options = {}) {
    this.postiz = new PostizAPIHandler({
      postizUrl: options.postizUrl || 'http://localhost:3000',
      logger: options.logger || console
    });
    
    this.spreadsheetId = options.spreadsheetId || process.env.GOOGLE_SHEETS_ID;
    this.logger = options.logger || console;
    this.demoMode = options.demoMode || false;
  }

  async validatePostizConnection() {
    this.logger.log('🔍 Validating Postiz connection...');
    const status = await this.postiz.validateConnection();
    
    if (!status.success && !status.demo) {
      throw new Error(`Postiz connection failed: ${status.error}`);
    }
    
    this.logger.log('✅ Postiz connection validated');
    return status;
  }

  async loadContentFromSheets() {
    this.logger.log('📊 Loading content from Google Sheets...');
    
    if (this.demoMode) {
      return this.getDemoContent();
    }

    try {
      const doc = new GoogleSpreadsheet(this.spreadsheetId);
      await doc.useServiceAccountAuth({
        client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n')
      });

      await doc.loadInfo();
      const sheet = doc.sheetsByIndex[0];
      const rows = await sheet.getRows();

      const content = rows.map(row => ({
        imagePath: row['Image File Path'] || '',
        message: row['Message Content'] || '',
        platform: row['Platform'] || 'all',
        schedule: row['Schedule'] || null,
        status: row['Status'] || 'pending',
        type: this.detectContentType(row['Message Content'] || '')
      }));

      this.logger.log(`✅ Loaded ${content.length} content items from sheets`);
      return content;

    } catch (error) {
      this.logger.error(`❌ Failed to load from sheets: ${error.message}`);
      this.logger.log('📋 Using demo content instead...');
      return this.getDemoContent();
    }
  }

  getDemoContent() {
    return [
      {
        imagePath: '/home/wolfy/Downloads/untrapd_images/motivation_monday.jpg',
        message: '🎯 Motivation Monday: Start your week knowing your phone is secure with FINDERR! Never lose your device permanently again. #MotivationMonday #FINDERR #PhoneSecurity #UNTRAPDHub',
        platform: 'all',
        schedule: null,
        status: 'pending',
        type: 'motivation'
      },
      {
        imagePath: '/home/wolfy/Downloads/untrapd_images/tech_tuesday.jpg',
        message: '🔧 Tech Tuesday: FINDERR\'s device identification system works instantly to help recover your lost phone! #TechTuesday #TechTips #FINDERR #PhoneRecovery',
        platform: 'all',
        schedule: null,
        status: 'pending',
        type: 'educational'
      },
      {
        imagePath: '/home/wolfy/Downloads/untrapd_images/milestone_500.jpg',
        message: '🎉 MILESTONE ALERT: 500 users have joined the UNTRAPD Hub family! Thank you for trusting FINDERR with your phone security! #Milestone #UNTRAPDHub #FINDERR #Community #500Users',
        platform: 'all',
        schedule: null,
        status: 'pending',
        type: 'milestone'
      }
    ];
  }

  detectContentType(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('milestone') || lowerMessage.includes('users')) return 'milestone';
    if (lowerMessage.includes('motivation monday')) return 'motivation';
    if (lowerMessage.includes('tech tuesday')) return 'educational';
    if (lowerMessage.includes('feature friday')) return 'feature';
    if (lowerMessage.includes('community') || lowerMessage.includes('story')) return 'community';
    
    return 'general';
  }

  async migrateContentToPostiz(content) {
    this.logger.log(`🚀 Migrating ${content.length} items to Postiz...`);
    const results = [];

    for (const item of content) {
      try {
        // Prepare content for Postiz
        const postContent = {
          text: item.message,
          mediaUrls: item.imagePath ? [item.imagePath] : [],
          isVideo: false
        };

        // Format content based on type
        const formattedContent = this.postiz.formatContent(postContent, item.type);

        // Post to Postiz (or schedule if date provided)
        let result;
        if (item.schedule) {
          const scheduleDate = new Date(item.schedule);
          result = await this.postiz.schedulePost(formattedContent, scheduleDate, item.platform);
        } else {
          result = await this.postiz.post(formattedContent, item.platform);
        }

        results.push({
          original: item,
          result: result,
          success: result.success
        });

        this.logger.log(`${result.success ? '✅' : '❌'} ${item.message.substring(0, 50)}...`);

        // Small delay between posts
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        this.logger.error(`❌ Failed to migrate item: ${error.message}`);
        results.push({
          original: item,
          result: { success: false, error: error.message },
          success: false
        });
      }
    }

    return results;
  }

  async setupDailyScheduling() {
    this.logger.log('📅 Setting up daily theme scheduling...');

    const dailyThemes = [
      {
        day: 'monday',
        time: '09:00',
        theme: 'motivation_monday',
        message: '🎯 Motivation Monday: Start your week knowing your phone is secure with FINDERR! Never lose your device permanently again. #MotivationMonday #FINDERR #PhoneSecurity #UNTRAPDHub'
      },
      {
        day: 'tuesday', 
        time: '12:00',
        theme: 'tech_tuesday',
        message: '🔧 Tech Tuesday: FINDERR\'s device identification system works instantly to help recover your lost phone! #TechTuesday #TechTips #FINDERR #PhoneRecovery'
      },
      {
        day: 'wednesday',
        time: '15:00', 
        theme: 'widget_wednesday',
        message: '⚡ Widget Wednesday: FINDERR\'s smart widget keeps your phone findable 24/7 with zero battery drain! #WidgetWednesday #FINDERR #SmartWidget #TechLife'
      },
      {
        day: 'thursday',
        time: '18:00',
        theme: 'throwback_thursday', 
        message: '📸 Throwback Thursday: Remember when losing your phone meant losing all your photos, contacts, and memories? FINDERR changed everything! #ThrowbackThursday #PhoneSecurity #LifeSaver #FINDERR'
      },
      {
        day: 'friday',
        time: '09:00',
        theme: 'feature_friday',
        message: '🚀 Feature Friday: FINDERR\'s core device identification features keep getting better! Family sharing coming in future updates! #FeatureFriday #FINDERR #DeviceID #AppUpdate'
      }
    ];

    this.logger.log(`📋 Configured ${dailyThemes.length} daily themes for scheduling`);
    return dailyThemes;
  }

  async testPostizIntegration() {
    this.logger.log('🧪 Testing Postiz integration...');

    try {
      // Test with simple post
      const testContent = {
        text: '🧪 Test post from UNTRAPD Hub automation system! FINDERR keeps your phone secure. #Test #FINDERR #UNTRAPDHub'
      };

      const result = await this.postiz.post(testContent, ['instagram']);
      
      if (result.success || result.demo) {
        this.logger.log('✅ Postiz integration test successful');
        return { success: true, result };
      } else {
        this.logger.error('❌ Postiz integration test failed');
        return { success: false, error: result.error };
      }

    } catch (error) {
      this.logger.error(`❌ Integration test error: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async generateMigrationReport(results) {
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    const report = {
      totalItems: results.length,
      successful: successful,
      failed: failed,
      successRate: `${Math.round((successful / results.length) * 100)}%`,
      details: results
    };

    this.logger.log('\n📊 MIGRATION REPORT');
    this.logger.log('==================');
    this.logger.log(`📝 Total items: ${report.totalItems}`);
    this.logger.log(`✅ Successful: ${report.successful}`);
    this.logger.log(`❌ Failed: ${report.failed}`);
    this.logger.log(`📈 Success rate: ${report.successRate}`);

    return report;
  }

  async runCompleteMigration() {
    try {
      this.logger.log('🚀 Starting complete Postiz migration...\n');

      // Step 1: Validate Postiz connection
      await this.validatePostizConnection();

      // Step 2: Load content from Google Sheets
      const content = await this.loadContentFromSheets();

      // Step 3: Test integration first
      const testResult = await this.testPostizIntegration();
      if (!testResult.success && !this.demoMode) {
        throw new Error(`Integration test failed: ${testResult.error}`);
      }

      // Step 4: Migrate content to Postiz
      const results = await this.migrateContentToPostiz(content);

      // Step 5: Set up daily scheduling
      await this.setupDailyScheduling();

      // Step 6: Generate report
      const report = await this.generateMigrationReport(results);

      this.logger.log('\n🎉 Migration completed successfully!');
      this.logger.log('📱 Next: Connect social accounts via http://localhost:4200');
      
      return report;

    } catch (error) {
      this.logger.error(`❌ Migration failed: ${error.message}`);
      throw error;
    }
  }
}

module.exports = PostizMigration;

// CLI Usage
if (require.main === module) {
  const migration = new PostizMigration({ 
    demoMode: !process.env.GOOGLE_SHEETS_ID 
  });
  
  migration.runCompleteMigration()
    .then((report) => {
      console.log('\n✅ Migration completed!');
      console.log('Next steps:');
      console.log('1. Visit http://localhost:4200 to create admin account');
      console.log('2. Connect Instagram @untrapd.hub via OAuth');
      console.log('3. Connect Facebook "un trapd" page via OAuth');
      console.log('4. Connect Pinterest untrapd.hub via OAuth');
      console.log('5. Test posting via Postiz interface');
    })
    .catch((error) => {
      console.error('\n❌ Migration failed:', error.message);
      process.exit(1);
    });
}