#!/usr/bin/env node

/**
 * UNTRAPD HUB AYRSHARE API HANDLER
 * 
 * Unified social media automation via Ayrshare API
 * Platforms: Instagram, Facebook, Pinterest
 * Future: TikTok, Twitter can be added via Ayrshare
 */

const axios = require('axios');
const config = require('./untrapd-hub-config.js');

class AyrshareAPIHandler {
  constructor(options = {}) {
    this.config = config;
    this.demoMode = options.demoMode || !process.env.AYRSHARE_API_KEY;
    this.logger = options.logger || console;
    
    // Ayrshare API endpoint
    this.apiUrl = 'https://app.ayrshare.com/api';
    
    // Connected platforms (from your Ayrshare account)
    this.connectedPlatforms = ['instagram', 'facebook', 'pinterest'];
    
    // Platform-specific rate limits (managed by Ayrshare)
    this.rateLimits = {
      instagram: { postsPerDay: 400, postsPerHour: 50 },
      facebook: { postsPerDay: 200, postsPerHour: 25 },
      pinterest: { postsPerDay: 100, postsPerHour: 15 }
    };
    
    this.initializeClient();
  }

  initializeClient() {
    this.logger.log('🔧 Initializing Ayrshare API client...');
    this.logger.log(`📱 Connected platforms: ${this.connectedPlatforms.join(', ')}`);
    
    if (this.demoMode) {
      this.logger.log('⚠️  Demo mode enabled - no real API calls');
      return;
    }

    // Ayrshare API Client
    this.client = axios.create({
      baseURL: this.apiUrl,
      timeout: 15000,
      headers: {
        'Authorization': `Bearer ${process.env.AYRSHARE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    this.logger.log('✅ Ayrshare API client initialized');
  }

  // ============================
  // CORE POSTING FUNCTIONALITY
  // ============================

  async post(content, platforms = 'all') {
    if (this.demoMode) {
      const targetPlatforms = platforms === 'all' ? this.connectedPlatforms : platforms;
      this.logger.log(`📝 [DEMO] Posting to ${targetPlatforms.join(', ')}: ${content.text?.substring(0, 50)}...`);
      return { 
        success: true, 
        demo: true, 
        platforms: targetPlatforms,
        message: 'Demo post successful'
      };
    }

    try {
      // Prepare post data
      const postData = {
        post: content.text,
        platforms: platforms === 'all' ? this.connectedPlatforms : platforms,
        scheduleDate: content.scheduleDate || null,
        shortenLinks: true
      };

      // Add media if provided
      if (content.mediaUrls && content.mediaUrls.length > 0) {
        postData.mediaUrls = content.mediaUrls;
        postData.isVideo = content.isVideo || false;
      }

      // Add platform-specific options
      if (content.instagramOptions) {
        postData.instagramOptions = content.instagramOptions;
      }
      if (content.facebookOptions) {
        postData.facebookOptions = content.facebookOptions;
      }
      if (content.pinterestOptions) {
        postData.pinterestOptions = content.pinterestOptions;
      }

      // Make API call
      const response = await this.client.post('/post', postData);
      
      const targetPlatforms = platforms === 'all' ? this.connectedPlatforms : platforms;
      this.logger.log(`✅ Post successful to ${targetPlatforms.join(', ')}`);
      
      return {
        success: true,
        platforms: targetPlatforms,
        postId: response.data.id,
        status: response.data.status,
        response: response.data
      };

    } catch (error) {
      this.logger.error(`❌ Post failed: ${error.message}`);
      return {
        success: false,
        error: error.message,
        details: error.response?.data
      };
    }
  }

  // ============================
  // CONTENT FORMATTING
  // ============================

  formatContent(rawContent, contentType = 'general') {
    // Base content structure
    const content = {
      text: rawContent.text || '',
      mediaUrls: rawContent.mediaUrls || [],
      isVideo: rawContent.isVideo || false
    };

    // Platform-specific optimizations
    switch (contentType) {
      case 'milestone':
        content.text = this.addHashtags(content.text, ['#UntrapдHub', '#FINDERR', '#Milestone']);
        content.instagramOptions = { type: 'story' }; // Also post as story
        break;
        
      case 'feature':
        content.text = this.addHashtags(content.text, ['#FINDERR', '#TechTips', '#Features']);
        break;
        
      case 'educational':
        content.text = this.addHashtags(content.text, ['#TechTips', '#Productivity', '#Education']);
        break;
        
      case 'community':
        content.text = this.addHashtags(content.text, ['#Community', '#UserStories', '#UntrapдHub']);
        break;
    }

    return content;
  }

  addHashtags(text, hashtags) {
    // Ensure text doesn't exceed platform limits with hashtags
    const hashtagString = ' ' + hashtags.join(' ');
    const maxLength = 2000; // Conservative limit
    
    if ((text + hashtagString).length <= maxLength) {
      return text + hashtagString;
    } else {
      // Truncate text to fit hashtags
      const availableLength = maxLength - hashtagString.length - 3; // -3 for "..."
      return text.substring(0, availableLength) + '...' + hashtagString;
    }
  }

  // ============================
  // SCHEDULING & AUTOMATION
  // ============================

  async schedulePost(content, scheduleDate, platforms = 'all') {
    content.scheduleDate = scheduleDate;
    return await this.post(content, platforms);
  }

  async scheduleDailyContent(contentArray, startDate = new Date()) {
    const results = [];
    
    for (let i = 0; i < contentArray.length; i++) {
      const scheduleDate = new Date(startDate);
      scheduleDate.setDate(scheduleDate.getDate() + i);
      scheduleDate.setHours(9, 0, 0, 0); // 9 AM posting time
      
      const result = await this.schedulePost(contentArray[i], scheduleDate);
      results.push(result);
      
      // Small delay between API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return results;
  }

  // ============================
  // ANALYTICS & MONITORING
  // ============================

  async getAnalytics(days = 7) {
    if (this.demoMode) {
      return { 
        demo: true, 
        message: 'Demo analytics data',
        totalPosts: 15,
        totalEngagement: 1250,
        topPlatform: 'instagram'
      };
    }

    try {
      const response = await this.client.get(`/analytics/post?lastDays=${days}`);
      this.logger.log(`📊 Analytics retrieved for last ${days} days`);
      return response.data;
    } catch (error) {
      this.logger.error(`❌ Analytics failed: ${error.message}`);
      return { error: error.message };
    }
  }

  async getProfiles() {
    if (this.demoMode) {
      return {
        demo: true,
        profiles: [
          { type: 'instagram', handle: '@untrapd.hub' },
          { type: 'facebook', handle: 'un trapd' },
          { type: 'pinterest', handle: 'untrapd.hub' }
        ]
      };
    }

    try {
      const response = await this.client.get('/profiles');
      return response.data;
    } catch (error) {
      if (error.response?.status === 403 && error.response?.data?.code === 167) {
        // Business plan required - return configured platforms instead
        this.logger.log('⚠️  Profiles endpoint requires business plan - using configured platforms');
        return {
          profiles: [
            { type: 'instagram', handle: '@untrapd.hub', note: 'Configured via Ayrshare' },
            { type: 'facebook', handle: 'un trapd', note: 'Configured via Ayrshare' },
            { type: 'pinterest', handle: 'untrapd.hub', note: 'Configured via Ayrshare' }
          ],
          warning: 'Using configured platforms - profiles endpoint requires business plan'
        };
      }
      
      this.logger.error(`❌ Get profiles failed: ${error.message}`);
      return { error: error.message };
    }
  }

  // ============================
  // CONNECTION VALIDATION
  // ============================

  async validateConnection() {
    this.logger.log('🔍 Validating Ayrshare connection...');
    
    if (this.demoMode) {
      this.logger.log('✅ Demo mode - connection validated');
      return {
        success: true,
        demo: true,
        platforms: this.connectedPlatforms,
        message: 'Demo connection successful'
      };
    }

    try {
      // Test with a simple API call instead of profiles (which requires business plan)
      // Try getting analytics first - usually available on free tier
      const testResponse = await this.client.get('/analytics/post?lastDays=1');
      
      this.logger.log('✅ Ayrshare connection successful');
      this.logger.log(`📱 Configured platforms: ${this.connectedPlatforms.join(', ')}`);
      
      return {
        success: true,
        platforms: this.connectedPlatforms,
        status: 'connected',
        message: 'Connection validated via analytics endpoint'
      };

    } catch (error) {
      // If analytics fails too, try a different approach
      if (error.response?.status === 403 && error.response?.data?.code === 167) {
        // Business plan required - but API key is valid
        this.logger.log('⚠️  Free tier detected - some features require business plan');
        this.logger.log('✅ But API authentication is working correctly');
        
        return {
          success: true,
          platforms: this.connectedPlatforms,
          status: 'connected_free_tier',
          message: 'API key valid, free tier limitations apply',
          warning: 'Some analytics features require Ayrshare Business Plan'
        };
      }
      
      this.logger.error(`❌ Connection validation failed: ${error.message}`);
      return {
        success: false,
        error: error.message,
        status: 'failed'
      };
    }
  }

  // ============================
  // UNTRAPD HUB SPECIFIC METHODS
  // ============================

  async postMilestone(userCount, milestoneType = 'user_growth') {
    const milestoneMessages = {
      500: "🎉 500 users joined the Untrapd Hub! Thank you for being part of our growing community!",
      1000: "🚀 1,000 FINDERR users can't be wrong! Your phone security matters - join the movement!",
      1500: "⚡ Only 500 lifetime spots remaining! Secure your FINDERR lifetime access today!",
      1900: "🔥 Final 100 lifetime memberships available! Don't miss out on permanent phone security!",
      2000: "✅ Lifetime access complete - 2,000 members secured! Monthly subscriptions now available!"
    };

    const message = milestoneMessages[userCount] || 
      `🎯 Milestone reached: ${userCount} users! Thank you for trusting FINDERR with your phone security!`;

    const content = this.formatContent({ text: message }, 'milestone');
    return await this.post(content);
  }

  async postDailyTheme(theme, content) {
    const themes = {
      'motivation_monday': 'motivation',
      'tech_tuesday': 'educational', 
      'widget_wednesday': 'feature',
      'throwback_thursday': 'community',
      'feature_friday': 'feature',
      'community_weekend': 'community'
    };

    const contentType = themes[theme] || 'general';
    const formattedContent = this.formatContent(content, contentType);
    
    return await this.post(formattedContent);
  }
}

module.exports = AyrshareAPIHandler;