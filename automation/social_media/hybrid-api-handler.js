#!/usr/bin/env node

/**
 * UNTRAPD HUB HYBRID SOCIAL MEDIA API HANDLER
 * 
 * Hybrid architecture:
 * - Ayrshare API: Instagram, Facebook, Pinterest (3 platforms)
 * - Native APIs: TikTok, Twitter (2 platforms)
 * 
 * Total: 5-platform automation with simplified authentication
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs').promises;
const config = require('./untrapd-hub-config.js');

class HybridSocialMediaAPIHandler {
  constructor(options = {}) {
    this.config = config;
    this.demoMode = options.demoMode || !process.env.AYRSHARE_API_KEY;
    this.logger = options.logger || console;
    
    // API endpoints
    this.endpoints = {
      ayrshare: 'https://app.ayrshare.com/api',
      tiktok: 'https://open.tiktokapis.com',
      twitter: 'https://api.twitter.com/2'
    };
    
    // Platform grouping
    this.ayrshareplatforms = ['instagram', 'facebook', 'pinterest'];
    this.nativePlatforms = ['tiktok', 'twitter'];
    
    // Rate limiting configuration
    this.rateLimits = {
      // Ayrshare platforms (managed by Ayrshare)
      instagram: { postsPerDay: 400, postsPerHour: 50 },
      facebook: { postsPerDay: 200, postsPerHour: 25 },
      pinterest: { postsPerDay: 100, postsPerHour: 15 },
      // Native platforms
      tiktok: { postsPerDay: 50, postsPerHour: 10 },
      twitter: { postsPerDay: 300, postsPerHour: 30 }
    };
    
    this.initializeClients();
  }

  initializeClients() {
    this.logger.log('🔧 Initializing Hybrid API clients...');
    this.logger.log('📱 Ayrshare: Instagram, Facebook, Pinterest');
    this.logger.log('🎵 Native: TikTok, Twitter');
    
    if (this.demoMode) {
      this.logger.log('⚠️  Demo mode enabled - no real API calls');
      return;
    }

    // Ayrshare API Client
    this.ayrshare = axios.create({
      baseURL: this.endpoints.ayrshare,
      timeout: 15000,
      headers: {
        'Authorization': `Bearer ${process.env.AYRSHARE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    // TikTok API Client
    if (process.env.TIKTOK_ACCESS_TOKEN) {
      this.tiktok = axios.create({
        baseURL: this.endpoints.tiktok,
        timeout: 30000,
        headers: {
          'Authorization': `Bearer ${process.env.TIKTOK_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
    }

    // Twitter API Client
    if (process.env.TWITTER_BEARER_TOKEN) {
      this.twitter = axios.create({
        baseURL: this.endpoints.twitter,
        timeout: 10000,
        headers: {
          'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
    }

    this.logger.log('✅ Hybrid API clients initialized');
  }

  // ============================
  // AYRSHARE INTEGRATION (Instagram, Facebook, Pinterest)
  // ============================

  async postToAyrshare(content, platforms = ['instagram', 'facebook', 'pinterest']) {
    if (this.demoMode) {
      this.logger.log(`📝 [DEMO] Ayrshare post to ${platforms.join(', ')}: ${content.text?.substring(0, 50)}...`);
      return { success: true, demo: true, platforms };
    }

    try {
      const postData = {
        post: content.text,
        platforms: platforms,
        mediaUrls: content.mediaUrls || [],
        scheduleDate: content.scheduleDate || null,
        shortenLinks: true,
        isVideo: content.isVideo || false
      };

      // Add platform-specific customizations
      if (content.instagramSpecific) {
        postData.instagramOptions = content.instagramSpecific;
      }
      if (content.facebookSpecific) {
        postData.facebookOptions = content.facebookSpecific;
      }
      if (content.pinterestSpecific) {
        postData.pinterestOptions = content.pinterestSpecific;
      }

      const response = await this.ayrshare.post('/post', postData);
      
      this.logger.log(`✅ Ayrshare post successful to ${platforms.join(', ')}`);
      return {
        success: true,
        platforms: platforms,
        postId: response.data.id,
        response: response.data
      };

    } catch (error) {
      this.logger.error(`❌ Ayrshare post failed: ${error.message}`);
      return {
        success: false,
        error: error.message,
        platforms: platforms
      };
    }
  }

  // ============================
  // NATIVE TIKTOK INTEGRATION
  // ============================

  async postToTikTok(content) {
    if (this.demoMode) {
      this.logger.log(`📝 [DEMO] TikTok post: ${content.text?.substring(0, 50)}...`);
      return { success: true, demo: true, platform: 'tiktok' };
    }

    if (!this.tiktok) {
      this.logger.log('⚠️  TikTok API not configured - skipping');
      return { success: false, error: 'TikTok API not configured' };
    }

    try {
      // TikTok requires video content
      if (!content.videoUrl && !content.mediaUrls?.some(url => url.includes('.mp4'))) {
        throw new Error('TikTok requires video content');
      }

      const postData = {
        source_info: {
          source: 'FILE_UPLOAD',
          video_url: content.videoUrl || content.mediaUrls.find(url => url.includes('.mp4'))
        },
        post_info: {
          title: content.text || '',
          privacy_level: 'SELF_ONLY', // Change to PUBLIC_TO_EVERYONE when ready
          disable_duet: false,
          disable_comment: false,
          disable_stitch: false,
          video_cover_timestamp_ms: 1000
        }
      };

      const response = await this.tiktok.post('/v2/post/publish/video/init/', postData);
      
      this.logger.log('✅ TikTok post initiated successfully');
      return {
        success: true,
        platform: 'tiktok',
        publishId: response.data.data.publish_id,
        response: response.data
      };

    } catch (error) {
      this.logger.error(`❌ TikTok post failed: ${error.message}`);
      return {
        success: false,
        error: error.message,
        platform: 'tiktok'
      };
    }
  }

  // ============================
  // NATIVE TWITTER INTEGRATION
  // ============================

  async postToTwitter(content) {
    if (this.demoMode) {
      this.logger.log(`📝 [DEMO] Twitter post: ${content.text?.substring(0, 50)}...`);
      return { success: true, demo: true, platform: 'twitter' };
    }

    if (!this.twitter) {
      this.logger.log('⚠️  Twitter API not configured - skipping');
      return { success: false, error: 'Twitter API not configured' };
    }

    try {
      // Ensure text is within Twitter's character limit
      const tweetText = content.text.length > 280 ? 
        content.text.substring(0, 277) + '...' : 
        content.text;

      const postData = {
        text: tweetText
      };

      // Add media if provided
      if (content.mediaUrls && content.mediaUrls.length > 0) {
        // Twitter requires media upload first, then reference in tweet
        // For now, we'll post text-only
        this.logger.log('📷 Media detected - text-only post for now (media upload to be implemented)');
      }

      const response = await this.twitter.post('/tweets', postData);
      
      this.logger.log('✅ Twitter post successful');
      return {
        success: true,
        platform: 'twitter',
        tweetId: response.data.data.id,
        response: response.data
      };

    } catch (error) {
      this.logger.error(`❌ Twitter post failed: ${error.message}`);
      return {
        success: false,
        error: error.message,
        platform: 'twitter'
      };
    }
  }

  // ============================
  // UNIFIED POSTING INTERFACE
  // ============================

  async postToAllPlatforms(content, platforms = 'all') {
    const results = [];
    
    // Determine target platforms
    const targetPlatforms = platforms === 'all' ? 
      [...this.ayrshareplatforms, ...this.nativePlatforms] : 
      platforms;

    this.logger.log(`🚀 Posting to platforms: ${targetPlatforms.join(', ')}`);

    // Post to Ayrshare platforms (Instagram, Facebook, Pinterest)
    const ayrshareTargets = targetPlatforms.filter(p => this.ayrshareplatforms.includes(p));
    if (ayrshareTargets.length > 0) {
      const ayrshareResult = await this.postToAyrshare(content, ayrshareTargets);
      results.push(ayrshareResult);
    }

    // Post to TikTok (native)
    if (targetPlatforms.includes('tiktok')) {
      const tiktokResult = await this.postToTikTok(content);
      results.push(tiktokResult);
    }

    // Post to Twitter (native)
    if (targetPlatforms.includes('twitter')) {
      const twitterResult = await this.postToTwitter(content);
      results.push(twitterResult);
    }

    // Compile results
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    this.logger.log(`📊 Posting complete: ${successful.length} successful, ${failed.length} failed`);

    return {
      success: successful.length > 0,
      totalPlatforms: targetPlatforms.length,
      successful: successful.length,
      failed: failed.length,
      results: results
    };
  }

  // ============================
  // ANALYTICS & MONITORING
  // ============================

  async getAyrshareAnalytics(days = 7) {
    if (this.demoMode) {
      return { demo: true, message: 'Demo analytics data' };
    }

    try {
      const response = await this.ayrshare.get(`/analytics/post?lastDays=${days}`);
      return response.data;
    } catch (error) {
      this.logger.error(`❌ Ayrshare analytics failed: ${error.message}`);
      return { error: error.message };
    }
  }

  async validateConnections() {
    const results = {
      ayrshare: { status: 'pending', platforms: [] },
      tiktok: { status: 'pending' },
      twitter: { status: 'pending' }
    };

    if (this.demoMode) {
      results.ayrshare.status = 'demo';
      results.tiktok.status = 'demo';
      results.twitter.status = 'demo';
      return results;
    }

    // Test Ayrshare connection
    try {
      const ayrshareTest = await this.ayrshare.get('/profiles');
      results.ayrshare.status = 'connected';
      results.ayrshare.platforms = ayrshareTest.data.profiles?.map(p => p.type) || [];
      this.logger.log(`✅ Ayrshare connected: ${results.ayrshare.platforms.join(', ')}`);
    } catch (error) {
      results.ayrshare.status = 'error';
      results.ayrshare.error = error.message;
      this.logger.log(`❌ Ayrshare connection failed`);
    }

    // Test TikTok connection
    if (this.tiktok) {
      try {
        // Test with a simple user info call
        results.tiktok.status = 'configured';
        this.logger.log('✅ TikTok API configured');
      } catch (error) {
        results.tiktok.status = 'error';
        results.tiktok.error = error.message;
      }
    } else {
      results.tiktok.status = 'not_configured';
    }

    // Test Twitter connection
    if (this.twitter) {
      try {
        const twitterTest = await this.twitter.get('/users/me');
        results.twitter.status = 'connected';
        results.twitter.username = twitterTest.data.data.username;
        this.logger.log(`✅ Twitter connected: @${results.twitter.username}`);
      } catch (error) {
        results.twitter.status = 'error';
        results.twitter.error = error.message;
      }
    } else {
      results.twitter.status = 'not_configured';
    }

    return results;
  }
}

module.exports = HybridSocialMediaAPIHandler;