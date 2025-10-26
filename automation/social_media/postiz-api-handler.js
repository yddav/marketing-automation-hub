#!/usr/bin/env node

/**
 * UNTRAPD HUB POSTIZ API HANDLER
 * 
 * Free social media automation via self-hosted Postiz
 * Platforms: Instagram, Facebook, Pinterest
 * 100% Free & Open Source Solution
 */

const axios = require('axios');
const config = require('./untrapd-hub-config.js');

class PostizAPIHandler {
  constructor(options = {}) {
    this.config = config;
    this.demoMode = options.demoMode || false;
    this.logger = options.logger || console;
    
    // Postiz API configuration
    this.postizUrl = options.postizUrl || process.env.POSTIZ_URL || 'http://localhost:3000';
    this.apiKey = options.apiKey || process.env.POSTIZ_API_KEY;
    
    // Connected platforms (free via Postiz)
    this.connectedPlatforms = ['instagram', 'facebook', 'pinterest'];
    
    // Platform-specific rate limits (Postiz handles platform limits internally)
    this.rateLimits = {
      instagram: { postsPerDay: 50, postsPerHour: 10 }, // Instagram API limits
      facebook: { postsPerDay: 200, postsPerHour: 25 },
      pinterest: { postsPerDay: 100, postsPerHour: 15 }
    };
    
    this.initializeClient();
  }

  initializeClient() {
    this.logger.log('🔧 Initializing Postiz API client...');
    this.logger.log(`📱 Connected platforms: ${this.connectedPlatforms.join(', ')}`);
    this.logger.log(`🌐 Postiz URL: ${this.postizUrl}`);
    
    if (this.demoMode) {
      this.logger.log('⚠️  Demo mode enabled - no real API calls');
      return;
    }

    // Postiz API Client
    this.client = axios.create({
      baseURL: `${this.postizUrl}/api`,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
      }
    });

    this.logger.log('✅ Postiz API client initialized');
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
      // Prepare post data for Postiz
      const postData = {
        content: content.text,
        platforms: platforms === 'all' ? this.connectedPlatforms : platforms,
        publishDate: content.scheduleDate || null,
        settings: {
          shortenUrls: true
        }
      };

      // Add media if provided
      if (content.mediaUrls && content.mediaUrls.length > 0) {
        postData.media = content.mediaUrls.map(url => ({
          url: url,
          type: content.isVideo ? 'video' : 'image'
        }));
      }

      // Add platform-specific options
      if (content.platformSpecific) {
        postData.platformSettings = content.platformSpecific;
      }

      // Make API call to Postiz
      const response = await this.client.post('/posts', postData);
      
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
        content.text = this.addHashtags(content.text, ['#UNTRAPDHub', '#FINDERR', '#Milestone']);
        break;
        
      case 'feature':
        content.text = this.addHashtags(content.text, ['#FINDERR', '#TechTips', '#Features']);
        break;
        
      case 'educational':
        content.text = this.addHashtags(content.text, ['#TechTips', '#Productivity', '#Education']);
        break;
        
      case 'community':
        content.text = this.addHashtags(content.text, ['#Community', '#UserStories', '#UNTRAPDHub']);
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
      const response = await this.client.get(`/analytics?days=${days}`);
      this.logger.log(`📊 Analytics retrieved for last ${days} days`);
      return response.data;
    } catch (error) {
      this.logger.error(`❌ Analytics failed: ${error.message}`);
      return { error: error.message };
    }
  }

  async getPosts(limit = 10) {
    if (this.demoMode) {
      return {
        demo: true,
        posts: [
          { id: 'demo-1', content: 'Demo post 1', platforms: this.connectedPlatforms },
          { id: 'demo-2', content: 'Demo post 2', platforms: this.connectedPlatforms }
        ]
      };
    }

    try {
      const response = await this.client.get(`/posts?limit=${limit}`);
      return response.data;
    } catch (error) {
      this.logger.error(`❌ Get posts failed: ${error.message}`);
      return { error: error.message };
    }
  }

  // ============================
  // CONNECTION VALIDATION
  // ============================

  async validateConnection() {
    this.logger.log('🔍 Validating Postiz connection...');
    
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
      // Test with a simple API call to check if Postiz is running
      const response = await this.client.get('/health');
      
      this.logger.log('✅ Postiz connection successful');
      this.logger.log(`📱 Available platforms: ${this.connectedPlatforms.join(', ')}`);
      
      return {
        success: true,
        platforms: this.connectedPlatforms,
        status: 'connected',
        message: 'Postiz server is running and accessible',
        serverInfo: response.data
      };

    } catch (error) {
      // If health endpoint fails, try a different approach
      if (error.code === 'ECONNREFUSED') {
        this.logger.error('❌ Cannot connect to Postiz server');
        return {
          success: false,
          error: 'Postiz server is not running or not accessible',
          suggestion: 'Run: cd postiz-setup && ./setup-postiz.sh'
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

  // ============================
  // UTILITY METHODS
  // ============================

  async getServerStatus() {
    try {
      const response = await axios.get(`${this.postizUrl}/api/health`, { timeout: 5000 });
      return {
        running: true,
        status: response.status,
        message: 'Postiz server is running'
      };
    } catch (error) {
      return {
        running: false,
        error: error.message,
        suggestion: 'Start Postiz server: cd postiz-setup && ./setup-postiz.sh'
      };
    }
  }
}

module.exports = PostizAPIHandler;