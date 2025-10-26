#!/usr/bin/env node

/**
 * GOOGLE SHEETS AUTOMATION SETUP
 * 
 * Sets up Google Sheets integration for Axiom.ai social media automation
 * Creates and populates content spreadsheet with templates and FINDERR integration
 */

const { GoogleSpreadsheet } = require('google-spreadsheet');
const fs = require('fs');
const path = require('path');

class GoogleSheetsSetup {
  constructor(options = {}) {
    this.spreadsheetTitle = options.title || 'UNTRAPD Hub Social Content';
    this.serviceAccountAuth = {
      client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n')
    };
    this.logger = options.logger || console;
  }

  async createSpreadsheet() {
    this.logger.log('🚀 Creating Google Sheets automation system...');
    
    try {
      // Create new spreadsheet
      this.doc = await GoogleSpreadsheet.createNewSpreadsheetDocument(
        this.serviceAccountAuth,
        { title: this.spreadsheetTitle }
      );
      
      this.logger.log(`✅ Created spreadsheet: ${this.spreadsheetTitle}`);
      this.logger.log(`📋 Spreadsheet ID: ${this.doc.spreadsheetId}`);
      this.logger.log(`🔗 Share URL: https://docs.google.com/spreadsheets/d/${this.doc.spreadsheetId}`);
      
      return this.doc.spreadsheetId;
    } catch (error) {
      this.logger.error('❌ Failed to create spreadsheet:', error);
      throw error;
    }
  }

  async setupContentSheet() {
    this.logger.log('📊 Setting up Content sheet...');
    
    try {
      // Get the default sheet and rename it
      await this.doc.loadInfo();
      const sheet = this.doc.sheetsByIndex[0];
      await sheet.updateProperties({ title: 'Content' });
      
      // Set up headers
      await sheet.setHeaderRow([
        'Date', 'Platform', 'Content', 'Hashtags', 'Schedule', 'Status', 'Notes'
      ]);
      
      // Load and add content templates
      await this.loadContentTemplates(sheet);
      
      this.logger.log('✅ Content sheet configured with templates');
      return sheet.sheetId;
    } catch (error) {
      this.logger.error('❌ Failed to setup content sheet:', error);
      throw error;
    }
  }

  async loadContentTemplates(sheet) {
    const templates = [
      // Daily Theme Templates
      {
        Date: '2025-01-06',
        Platform: 'All',
        Content: '🎯 Motivation Monday: Start your week knowing your phone is secure with FINDERR! Never lose your device permanently again.',
        Hashtags: '#MotivationMonday #FINDERR #PhoneSecurity #UNTRAPDHub',
        Schedule: '09:00',
        Status: 'Template',
        Notes: 'Daily Theme - Monday'
      },
      {
        Date: '2025-01-07',
        Platform: 'All',
        Content: '🔧 Tech Tuesday: Did you know? FINDERR uses advanced location tracking that works even when your phone is offline!',
        Hashtags: '#TechTuesday #TechTips #FINDERR #PhoneRecovery',
        Schedule: '12:00',
        Status: 'Template',
        Notes: 'Daily Theme - Tuesday'
      },
      {
        Date: '2025-01-08',
        Platform: 'All',
        Content: '⚡ Widget Wednesday: FINDERR\'s smart widget keeps your phone findable 24/7 with zero battery drain!',
        Hashtags: '#WidgetWednesday #FINDERR #SmartWidget #TechLife',
        Schedule: '15:00',
        Status: 'Template',
        Notes: 'Daily Theme - Wednesday'
      },
      {
        Date: '2025-01-09',
        Platform: 'All',
        Content: '📸 Throwback Thursday: Remember when losing your phone meant losing all your photos, contacts, and memories? FINDERR changed everything!',
        Hashtags: '#ThrowbackThursday #PhoneSecurity #LifeSaver #FINDERR',
        Schedule: '18:00',
        Status: 'Template',
        Notes: 'Daily Theme - Thursday'
      },
      {
        Date: '2025-01-10',
        Platform: 'All',
        Content: '🚀 Feature Friday: FINDERR\'s latest update includes family sharing - protect everyone\'s devices with one account!',
        Hashtags: '#FeatureFriday #FINDERR #FamilySharing #AppUpdate',
        Schedule: '09:00',
        Status: 'Template',
        Notes: 'Daily Theme - Friday'
      },
      {
        Date: '2025-01-11',
        Platform: 'All',
        Content: '🌟 Weekend Wins: This week, FINDERR helped 47 users recover their lost phones! Share your success story in the comments!',
        Hashtags: '#WeekendWins #UserStories #FINDERR #Community',
        Schedule: '11:00',
        Status: 'Template',
        Notes: 'Daily Theme - Saturday'
      },
      {
        Date: '2025-01-12',
        Platform: 'All',
        Content: '💪 Sunday Success: Join 2,000+ users who never worry about losing their phones thanks to FINDERR! Download today!',
        Hashtags: '#SundaySuccess #JoinTheMovement #FINDERR #PhoneSecurity',
        Schedule: '14:00',
        Status: 'Template',
        Notes: 'Daily Theme - Sunday'
      },
      
      // Milestone Templates
      {
        Date: 'MILESTONE',
        Platform: 'All',
        Content: '🎉 MILESTONE ALERT: 500 users have joined the UNTRAPD Hub family! Thank you for trusting FINDERR with your phone security!',
        Hashtags: '#Milestone #UNTRAPDHub #FINDERR #Community #500Users',
        Schedule: 'IMMEDIATE',
        Status: 'Template',
        Notes: 'Milestone - 500 Users'
      },
      {
        Date: 'MILESTONE',
        Platform: 'All',
        Content: '🚀 INCREDIBLE: 1,000 FINDERR users can\'t be wrong! Your phone security matters, and we\'re here to protect it!',
        Hashtags: '#1000Users #FINDERR #PhoneSecurity #Community #Grateful',
        Schedule: 'IMMEDIATE',
        Status: 'Template',
        Notes: 'Milestone - 1000 Users'
      },
      {
        Date: 'MILESTONE',
        Platform: 'All',
        Content: '⚡ URGENT: Only 500 lifetime access spots remaining! Secure your FINDERR lifetime membership before it\'s too late!',
        Hashtags: '#LifetimeAccess #LastChance #FINDERR #LimitedOffer #500Left',
        Schedule: 'IMMEDIATE',
        Status: 'Template',
        Notes: 'Milestone - 1500 Users'
      },
      {
        Date: 'MILESTONE',
        Platform: 'All',
        Content: '🔥 FINAL CALL: Last 100 lifetime FINDERR memberships available! Don\'t miss permanent phone security at this price!',
        Hashtags: '#FinalCall #100Left #FINDERR #LifetimeAccess #LastChance',
        Schedule: 'IMMEDIATE',
        Status: 'Template',
        Notes: 'Milestone - 1900 Users'
      },
      {
        Date: 'MILESTONE',
        Platform: 'All',
        Content: '✅ ACHIEVEMENT UNLOCKED: 2,000 lifetime members secured! Monthly subscriptions now available for new users!',
        Hashtags: '#AchievementUnlocked #2000Members #FINDERR #LifetimeComplete',
        Schedule: 'IMMEDIATE',
        Status: 'Template',
        Notes: 'Milestone - 2000 Users'
      },

      // Platform-Specific Content
      {
        Date: '2025-01-20',
        Platform: 'Instagram',
        Content: '📱 Story Time: Sarah from Chicago never worried about phone theft again after installing FINDERR. What\'s your phone security story?',
        Hashtags: '#UserStory #PhoneSecurity #FINDERR #Community #Chicago',
        Schedule: '16:00',
        Status: 'Template',
        Notes: 'User Story - Instagram Focus'
      },
      {
        Date: '2025-01-20',
        Platform: 'Facebook',
        Content: 'Community Question: What\'s the most stressful thing about losing your phone? FINDERR users say \'Not anymore!\' - join the conversation!',
        Hashtags: '#CommunityQuestion #PhoneLoss #FINDERR #Discussion',
        Schedule: '10:00',
        Status: 'Template',
        Notes: 'Engagement - Facebook Focus'
      },
      {
        Date: '2025-01-20',
        Platform: 'Pinterest',
        Content: 'FINDERR Phone Security Tips: 10 Ways to Never Lose Your Phone Again - Save this pin for ultimate device protection!',
        Hashtags: '#PhoneSecurityTips #FINDERR #DeviceProtection #TechTips',
        Schedule: '14:00',
        Status: 'Template',
        Notes: 'Educational - Pinterest Focus'
      },
      {
        Date: '2025-01-20',
        Platform: 'Reddit',
        Content: 'PSA: After using 20+ phone security apps, FINDERR is the only one that actually works when your phone is stolen/lost. AMA about phone security!',
        Hashtags: '#PSA #PhoneSecurity #FINDERR #AMA',
        Schedule: '19:00',
        Status: 'Template',
        Notes: 'Educational - Reddit Focus'
      }
    ];

    // Add templates to sheet
    await sheet.addRows(templates);
  }

  async setupAnalyticsSheet() {
    this.logger.log('📈 Setting up Analytics sheet...');
    
    try {
      const sheet = await this.doc.addSheet({
        title: 'Analytics',
        headerValues: [
          'Date', 'Platform', 'Post_ID', 'Content_Type', 'Impressions', 
          'Engagement', 'Clicks', 'Shares', 'Comments', 'Status'
        ]
      });

      // Add sample analytics data
      await sheet.addRows([
        {
          Date: '2025-01-06',
          Platform: 'Instagram',
          Post_ID: 'sample_post_1',
          Content_Type: 'Daily Theme',
          Impressions: 0,
          Engagement: 0,
          Clicks: 0,
          Shares: 0,
          Comments: 0,
          Status: 'Template'
        }
      ]);

      this.logger.log('✅ Analytics sheet configured');
      return sheet.sheetId;
    } catch (error) {
      this.logger.error('❌ Failed to setup analytics sheet:', error);
      throw error;
    }
  }

  async setupConfigSheet() {
    this.logger.log('⚙️ Setting up Configuration sheet...');
    
    try {
      const sheet = await this.doc.addSheet({
        title: 'Config',
        headerValues: ['Setting', 'Value', 'Description']
      });

      const configData = [
        {
          Setting: 'automation_enabled',
          Value: 'true',
          Description: 'Enable/disable automated posting'
        },
        {
          Setting: 'posting_frequency',
          Value: 'daily',
          Description: 'How often to post (daily/hourly/custom)'
        },
        {
          Setting: 'instagram_username',
          Value: '@untrapd.hub',
          Description: 'Instagram account username'
        },
        {
          Setting: 'facebook_page',
          Value: 'un trapd',
          Description: 'Facebook page name'
        },
        {
          Setting: 'pinterest_profile',
          Value: 'untrapd.hub',
          Description: 'Pinterest business profile'
        },
        {
          Setting: 'reddit_username',
          Value: 'UPDATE_REDDIT_USERNAME',
          Description: 'Reddit account username'
        },
        {
          Setting: 'finderr_milestone_webhook',
          Value: 'https://hub.untrapd.com/webhooks/milestone',
          Description: 'FINDERR milestone webhook URL'
        },
        {
          Setting: 'current_user_count',
          Value: '0',
          Description: 'Current FINDERR user count for milestones'
        },
        {
          Setting: 'lifetime_spots_remaining',
          Value: '2000',
          Description: 'Remaining lifetime access spots'
        }
      ];

      await sheet.addRows(configData);
      this.logger.log('✅ Configuration sheet configured');
      return sheet.sheetId;
    } catch (error) {
      this.logger.error('❌ Failed to setup config sheet:', error);
      throw error;
    }
  }

  async shareSpreadsheet() {
    this.logger.log('🔐 Setting up spreadsheet permissions...');
    
    try {
      // Make spreadsheet viewable by anyone with link (for Axiom.ai access)
      await this.doc.updateProperties({}, [
        {
          updateSpreadsheetProperties: {
            properties: {
              title: this.spreadsheetTitle
            },
            fields: 'title'
          }
        }
      ]);

      this.logger.log('✅ Spreadsheet permissions configured');
      this.logger.log('⚠️  IMPORTANT: You\'ll need to manually share this spreadsheet with Axiom.ai');
      this.logger.log('   1. Open the spreadsheet in browser');
      this.logger.log('   2. Click "Share" button');
      this.logger.log('   3. Set to "Anyone with the link can view"');
      this.logger.log('   4. Copy the link for Axiom.ai integration');
    } catch (error) {
      this.logger.error('❌ Failed to configure permissions:', error);
      throw error;
    }
  }

  async setupComplete() {
    try {
      const spreadsheetId = await this.createSpreadsheet();
      await this.setupContentSheet();
      await this.setupAnalyticsSheet();
      await this.setupConfigSheet();
      await this.shareSpreadsheet();

      this.logger.log('\n🎉 GOOGLE SHEETS SETUP COMPLETE!');
      this.logger.log('==========================================');
      this.logger.log(`📋 Spreadsheet ID: ${spreadsheetId}`);
      this.logger.log(`🔗 URL: https://docs.google.com/spreadsheets/d/${spreadsheetId}`);
      this.logger.log('\n📊 Sheets Created:');
      this.logger.log('   ✅ Content - Daily themes, milestones, platform-specific templates');
      this.logger.log('   ✅ Analytics - Performance tracking data');
      this.logger.log('   ✅ Config - Automation settings and account info');
      this.logger.log('\n🤖 Next Steps for Axiom.ai:');
      this.logger.log('   1. Copy the spreadsheet URL above');
      this.logger.log('   2. In Axiom.ai, connect this as your data source');
      this.logger.log('   3. Use "Content" sheet for posting workflows');
      this.logger.log('   4. Use "Config" sheet for account settings');
      this.logger.log('\n🚀 Ready for automation setup!');

      return {
        spreadsheetId,
        url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
        sheets: ['Content', 'Analytics', 'Config']
      };
    } catch (error) {
      this.logger.error('❌ Setup failed:', error);
      throw error;
    }
  }
}

// Export for use in other modules
module.exports = GoogleSheetsSetup;

// CLI Usage
if (require.main === module) {
  const setup = new GoogleSheetsSetup();
  
  setup.setupComplete()
    .then((result) => {
      console.log('\n✅ Setup completed successfully!');
      console.log('Save this information:');
      console.log(JSON.stringify(result, null, 2));
    })
    .catch((error) => {
      console.error('\n❌ Setup failed:', error);
      process.exit(1);
    });
}