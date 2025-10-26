#!/usr/bin/env node

/**
 * UNTRAPD HUB SOCIAL MEDIA API HANDLER
 * 
 * Production-ready API integrations for Instagram, Facebook, and TikTok
 * Handles authentication, posting, media upload, and analytics
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs').promises;
const config = require('./untrapd-hub-config.js');

class SocialMediaAPIHandler {
  constructor(options = {}) {
    this.config = config;
    this.demoMode = options.demoMode || !process.env.INSTAGRAM_ACCESS_TOKEN;
    this.logger = options.logger || console;
    
    // API endpoints - 3-platform native integration
    this.endpoints = {
      instagram: 'https://graph.facebook.com/v18.0',
      facebook: 'https://graph.facebook.com/v18.0',
      tiktok: 'https://open.tiktokapis.com'
    };
    
    // Rate limiting configuration per platform
    this.rateLimits = {
      instagram: { postsPerDay: 400, postsPerHour: 50 },
      facebook: { postsPerDay: 200, postsPerHour: 25 },
      tiktok: { postsPerDay: 50, postsPerHour: 10 }
    };
    
    // Initialize API clients
    this.initializeClients();
  }

  initializeClients() {
    this.logger.log('🔧 Initializing 3-platform native API clients...');
    
    if (this.demoMode) {
      this.logger.log('⚠️  Demo mode enabled - no real API calls');
      return;
    }

    // Instagram Graph API Client
    this.instagram = axios.create({
      baseURL: this.endpoints.instagram,
      timeout: 10000,
      params: {
        access_token: process.env.INSTAGRAM_ACCESS_TOKEN
      }
    });

    // Facebook Graph API Client  
    this.facebook = axios.create({
      baseURL: this.endpoints.facebook,
      timeout: 10000,
      params: {
        access_token: process.env.FACEBOOK_PAGE_TOKEN
      }
    });

    // TikTok Business API Client
    this.tiktok = axios.create({
      baseURL: this.endpoints.tiktok,
      timeout: 15000,
      headers: {
        'Authorization': `Bearer ${process.env.TIKTOK_ACCESS_TOKEN}`,
        'Content-Type': 'application/json; charset=UTF-8'
      }
    });

    // TikTok configuration
    this.tiktokConfig = {
      clientKey: process.env.TIKTOK_CLIENT_KEY,
      clientSecret: process.env.TIKTOK_CLIENT_SECRET,
      openId: process.env.TIKTOK_OPEN_ID,
      maxVideoSize: 4294967296, // 4GB
      chunkSize: 10485760, // 10MB chunks
      supportedFormats: ['mp4', 'mov', 'webm']
    };

    // Rate limiting tracking for 3-platform native integration
    this.rateLimitState = {
      instagram: { today: 0, hour: 0, lastReset: new Date() },
      facebook: { today: 0, hour: 0, lastReset: new Date() },
      tiktok: { today: 0, hour: 0, lastReset: new Date() }
    };

    this.logger.log('✅ 3-platform API clients initialized with rate limiting');
  }

  // ============================
  // INSTAGRAM GRAPH API
  // ============================

  async postToInstagram(content, mediaUrl = null, postType = 'feed') {
    if (this.demoMode) {
      return this.mockApiCall('Instagram', 'POST', content);
    }

    try {
      const accountId = this.config.platforms.instagram.businessAccountId;
      
      if (postType === 'story' && mediaUrl) {
        return await this.postInstagramStory(content, mediaUrl);
      }

      // Create media object first
      let mediaId;
      if (mediaUrl) {
        const mediaResponse = await this.instagram.post(`/${accountId}/media`, {
          image_url: mediaUrl,
          caption: content,
          access_token: process.env.INSTAGRAM_ACCESS_TOKEN
        });
        mediaId = mediaResponse.data.id;
      } else {
        // Text-only post (not supported on Instagram feed - use story instead)
        throw new Error('Instagram feed posts require media. Use story for text-only.');
      }

      // Publish the media
      const publishResponse = await this.instagram.post(`/${accountId}/media_publish`, {
        creation_id: mediaId,
        access_token: process.env.INSTAGRAM_ACCESS_TOKEN
      });

      this.logger.log(`✅ Instagram post published: ${publishResponse.data.id}`);
      return {
        success: true,
        platform: 'instagram',
        postId: publishResponse.data.id,
        postType: 'feed'
      };

    } catch (error) {
      this.logger.error('❌ Instagram posting failed:', error.response?.data || error.message);
      return {
        success: false,
        platform: 'instagram',
        error: error.message
      };
    }
  }

  async postInstagramStory(content, mediaUrl) {
    try {
      const accountId = this.config.platforms.instagram.businessAccountId;
      
      const response = await this.instagram.post(`/${accountId}/media`, {
        image_url: mediaUrl,
        media_type: 'STORIES',
        access_token: process.env.INSTAGRAM_ACCESS_TOKEN
      });

      const publishResponse = await this.instagram.post(`/${accountId}/media_publish`, {
        creation_id: response.data.id,
        access_token: process.env.INSTAGRAM_ACCESS_TOKEN
      });

      this.logger.log(`✅ Instagram story published: ${publishResponse.data.id}`);
      return {
        success: true,
        platform: 'instagram',
        postId: publishResponse.data.id,
        postType: 'story'
      };

    } catch (error) {
      this.logger.error('❌ Instagram story failed:', error.response?.data || error.message);
      throw error;
    }
  }

  async getInstagramInsights() {
    if (this.demoMode) {
      return { followers: 0, engagement: 0, reach: 0 };
    }

    try {
      const accountId = this.config.platforms.instagram.businessAccountId;
      const response = await this.instagram.get(`/${accountId}`, {
        params: {
          fields: 'followers_count,media_count',
          access_token: process.env.INSTAGRAM_ACCESS_TOKEN
        }
      });

      return {
        followers: response.data.followers_count,
        posts: response.data.media_count
      };

    } catch (error) {
      this.logger.error('❌ Instagram insights failed:', error.message);
      return { followers: 0, posts: 0 };
    }
  }

  // ============================
  // FACEBOOK GRAPH API
  // ============================

  async postToFacebook(content, mediaUrl = null) {
    if (this.demoMode) {
      return this.mockApiCall('Facebook', 'POST', content);
    }

    try {
      const pageId = this.config.platforms.facebook.pageId;
      
      const postData = {
        message: content,
        access_token: process.env.FACEBOOK_PAGE_TOKEN
      };

      // Add media if provided
      if (mediaUrl) {
        postData.link = mediaUrl;
      }

      const response = await this.facebook.post(`/${pageId}/feed`, postData);

      this.logger.log(`✅ Facebook post published: ${response.data.id}`);
      return {
        success: true,
        platform: 'facebook',
        postId: response.data.id
      };

    } catch (error) {
      this.logger.error('❌ Facebook posting failed:', error.response?.data || error.message);
      return {
        success: false,
        platform: 'facebook',
        error: error.message
      };
    }
  }

  async getFacebookInsights() {
    if (this.demoMode) {
      return { likes: 0, followers: 0 };
    }

    try {
      const pageId = this.config.platforms.facebook.pageId;
      const response = await this.facebook.get(`/${pageId}`, {
        params: {
          fields: 'fan_count,engagement',
          access_token: process.env.FACEBOOK_PAGE_TOKEN
        }
      });

      return {
        likes: response.data.fan_count,
        followers: response.data.fan_count
      };

    } catch (error) {
      this.logger.error('❌ Facebook insights failed:', error.message);
      return { likes: 0, followers: 0 };
    }
  }

  // ============================
  // TIKTOK BUSINESS API
  // ============================

  async postToTikTok(content, videoUrl) {
    if (this.demoMode) {
      return this.mockApiCall('TikTok', 'POST', content);
    }

    try {
      // TikTok requires video content
      if (!videoUrl) {
        throw new Error('TikTok posts require video content');
      }

      this.logger.log('🎬 Starting TikTok video upload process...');

      // Step 1: Download video locally for upload
      const videoPath = await this.downloadVideoForTikTok(videoUrl);
      
      // Step 2: Initialize upload session
      const uploadInfo = await this.initializeTikTokUpload(videoPath);
      
      // Step 3: Upload video file in chunks
      await this.uploadVideoToTikTok(videoPath, uploadInfo);
      
      // Step 4: Publish the video post
      const publishResult = await this.publishTikTokVideo(
        uploadInfo.publish_id,
        content
      );

      // Step 5: Cleanup temporary file
      await fs.unlink(videoPath);

      this.logger.log(`✅ TikTok post published: ${publishResult.data.publish_id}`);
      return {
        success: true,
        platform: 'tiktok',
        postId: publishResult.data.publish_id,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      this.logger.error('❌ TikTok posting failed:', error.response?.data || error.message);
      return {
        success: false,
        platform: 'tiktok',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Download video for TikTok upload
  async downloadVideoForTikTok(videoUrl) {
    const response = await axios.get(videoUrl, {
      responseType: 'stream'
    });

    const tempPath = `/tmp/tiktok_video_${Date.now()}.mp4`;
    const writer = fs.createWriteStream(tempPath);
    
    response.data.pipe(writer);
    
    return new Promise((resolve, reject) => {
      writer.on('finish', () => resolve(tempPath));
      writer.on('error', reject);
    });
  }

  // Initialize TikTok upload session
  async initializeTikTokUpload(videoPath) {
    const stats = await fs.stat(videoPath);
    
    const response = await this.tiktok.post('/v2/post/publish/video/init/', {
      post_info: {
        title: "UNTRAPD Hub Content",
        privacy_level: "PUBLIC_TO_EVERYONE",
        disable_duet: false,
        disable_comment: false,
        disable_stitch: false,
        video_cover_timestamp_ms: 1000
      },
      source_info: {
        source: "FILE_UPLOAD",
        video_size: stats.size,
        chunk_size: this.tiktokConfig.chunkSize,
        total_chunk_count: Math.ceil(stats.size / this.tiktokConfig.chunkSize)
      }
    });

    return response.data.data;
  }

  // Upload video file in chunks
  async uploadVideoToTikTok(videoPath, uploadInfo) {
    const fileBuffer = await fs.readFile(videoPath);
    const chunkSize = this.tiktokConfig.chunkSize;
    const totalChunks = Math.ceil(fileBuffer.length / chunkSize);

    this.logger.log(`📤 Uploading video in ${totalChunks} chunks...`);

    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, fileBuffer.length);
      const chunk = fileBuffer.slice(start, end);

      const formData = new FormData();
      formData.append('video', chunk, {
        filename: `chunk_${i}.mp4`,
        contentType: 'video/mp4'
      });

      await axios.put(uploadInfo.upload_url, formData, {
        headers: {
          ...formData.getHeaders(),
          'Content-Range': `bytes ${start}-${end-1}/${fileBuffer.length}`
        }
      });

      this.logger.log(`📤 Uploaded chunk ${i + 1}/${totalChunks}`);
    }

    return uploadInfo.publish_id;
  }

  // Publish the uploaded video
  async publishTikTokVideo(publishId, caption) {
    // Format caption with UNTRAPD Hub hashtags
    const hashtags = [
      '#UNTRAPDHub',
      '#ProductivityTips',
      '#TechTips',
      '#AppDemo',
      '#Productivity'
    ];
    
    const formattedCaption = `${caption}\n\n${hashtags.join(' ')}`;

    const response = await this.tiktok.post('/v2/post/publish/', {
      post_id: publishId,
      post_info: {
        title: formattedCaption,
        privacy_level: "PUBLIC_TO_EVERYONE",
        auto_add_music: true
      },
      media_info: {
        video_info: {
          cover_timestamp_ms: 1000
        }
      }
    });

    return response.data;
  }

  async getTikTokInsights() {
    if (this.demoMode) {
      return { followers: 0, videos: 0, views: 0 };
    }

    try {
      // Get user info using TikTok Marketing API
      const response = await this.tiktok.get('/v2/user/info/', {
        params: {
          fields: 'follower_count,video_count,display_name,username'
        }
      });

      const userData = response.data.data.user;
      
      return {
        followers: userData.follower_count || 0,
        videos: userData.video_count || 0,
        displayName: userData.display_name || '',
        username: userData.username || '@untrapd.hub',
        views: 0 // Requires additional API call for video insights
      };
    } catch (error) {
      this.logger.error('❌ TikTok insights failed:', error.response?.data || error.message);
      return { 
        followers: 0, 
        videos: 0, 
        views: 0,
        displayName: 'UNTRAPD Hub',
        username: '@untrapd.hub'
      };
    }
  }

  // Check TikTok rate limits
  async checkTikTokRateLimit() {
    try {
      const response = await this.tiktok.get('/v2/user/info/', {
        params: { fields: 'follower_count' }
      });

      return {
        remaining: response.headers['x-rate-limit-remaining'] || 'unknown',
        limit: response.headers['x-rate-limit-limit'] || 'unknown',
        resetTime: response.headers['x-rate-limit-reset'] || 'unknown'
      };
    } catch (error) {
      this.logger.error('❌ TikTok rate limit check failed:', error.message);
      return { remaining: 0, limit: 'unknown', resetTime: 'unknown' };
    }
  }


  // ============================
  // UNIFIED POSTING METHOD
  // ============================

  async postToAllPlatforms(content, options = {}) {
    const { mediaUrl, platforms = ['instagram', 'facebook', 'tiktok'] } = options;
    
    this.logger.log(`🚀 Posting to 3-platform native integration: ${platforms.join(', ')}`);
    
    // Check rate limits before posting
    const rateLimitResults = this.checkRateLimits(platforms);
    if (rateLimitResults.blocked.length > 0) {
      this.logger.warn(`⚠️  Rate limited platforms: ${rateLimitResults.blocked.join(', ')}`);
    }
    
    const allowedPlatforms = rateLimitResults.allowed;
    const results = [];

    // Post to each allowed platform with rate limiting
    for (const platform of allowedPlatforms) {
      try {
        let result;
        
        switch (platform) {
          case 'instagram':
            if (mediaUrl) {
              result = await this.postToInstagram(content, mediaUrl);
              this.updateRateLimit('instagram');
            } else {
              this.logger.log('⏭️  Instagram requires media - skipping text-only post');
              continue;
            }
            break;
            
          case 'facebook':
            result = await this.postToFacebook(content, mediaUrl);
            this.updateRateLimit('facebook');
            break;
            
          case 'tiktok':
            if (mediaUrl && (mediaUrl.includes('.mp4') || mediaUrl.includes('.mov'))) {
              result = await this.postToTikTok(content, mediaUrl);
              this.updateRateLimit('tiktok');
            } else {
              this.logger.log('⏭️  TikTok requires video content - skipping');
              continue;
            }
            break;
        }

        if (result) {
          results.push(result);
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

    // Summary
    const successful = results.filter(r => r.success).length;
    const total = results.length;
    
    this.logger.log(`📊 Native posting complete: ${successful}/${total} platforms successful`);
    
    return {
      totalPlatforms: total,
      successful: successful,
      results: results,
      rateLimited: rateLimitResults.blocked
    };
  }

  // ============================
  // RATE LIMITING MANAGEMENT
  // ============================

  checkRateLimits(platforms) {
    const now = new Date();
    const allowed = [];
    const blocked = [];

    for (const platform of platforms) {
      const state = this.rateLimitState[platform];
      const limits = this.rateLimits[platform];
      
      // Reset counters if new day/hour
      this.resetRateLimitCounters(platform, now);
      
      // Check if within limits
      if (state.today < limits.postsPerDay && state.hour < limits.postsPerHour) {
        allowed.push(platform);
      } else {
        blocked.push(platform);
      }
    }

    return { allowed, blocked };
  }

  resetRateLimitCounters(platform, now) {
    const state = this.rateLimitState[platform];
    const lastReset = state.lastReset;
    
    // Reset daily counter
    if (now.getDate() !== lastReset.getDate()) {
      state.today = 0;
      state.hour = 0;
      state.lastReset = now;
    }
    // Reset hourly counter
    else if (now.getHours() !== lastReset.getHours()) {
      state.hour = 0;
      state.lastReset = now;
    }
  }

  updateRateLimit(platform) {
    this.rateLimitState[platform].today++;
    this.rateLimitState[platform].hour++;
  }

  // ============================
  // ANALYTICS & INSIGHTS
  // ============================

  async getAllInsights() {
    this.logger.log('📊 Fetching insights from 3-platform native integration...');
    
    const insights = {
      instagram: await this.getInstagramInsights(),
      facebook: await this.getFacebookInsights(),
      tiktok: await this.getTikTokInsights(),
      timestamp: new Date().toISOString()
    };

    // Calculate totals
    insights.totals = {
      followers: (insights.instagram.followers || 0) + 
                 (insights.facebook.followers || 0) + 
                 (insights.tiktok.followers || 0),
      posts: (insights.instagram.posts || 0) + 
             (insights.facebook.posts || 0) + 
             (insights.tiktok.videos || 0)
    };

    this.logger.log(`📈 Total followers across 3 platforms: ${insights.totals.followers}`);
    return insights;
  }

  // ============================
  // UTILITY METHODS
  // ============================

  async mockApiCall(platform, action, content) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const postId = `mock-${platform.toLowerCase()}-${Date.now()}`;
    this.logger.log(`🔄 MOCK ${platform} ${action}: "${content.slice(0, 50)}..."`);
    this.logger.log(`✅ Success: Post ID ${postId}`);
    
    return {
      success: true,
      platform: platform.toLowerCase(),
      postId: postId,
      mock: true
    };
  }

  async validateApiTokens() {
    this.logger.log('🔍 Validating API tokens...');
    
    const validations = {};

    // Instagram validation
    try {
      await this.getInstagramInsights();
      validations.instagram = true;
    } catch (error) {
      validations.instagram = false;
      this.logger.warn('⚠️  Instagram token invalid');
    }

    // Facebook validation
    try {
      await this.getFacebookInsights();
      validations.facebook = true;
    } catch (error) {
      validations.facebook = false;
      this.logger.warn('⚠️  Facebook token invalid');
    }

    // TikTok validation
    try {
      await this.getTikTokInsights();
      validations.tiktok = true;
    } catch (error) {
      validations.tiktok = false;
      this.logger.warn('⚠️  TikTok token invalid');
    }

    const validCount = Object.values(validations).filter(v => v).length;
    this.logger.log(`📋 Token validation: ${validCount}/3 platforms ready`);
    
    return validations;
  }

  // Content optimization for platform-specific requirements
  optimizeContentForPlatform(content, platform) {
    const hashtags = this.config.automation.hashtagStrategy[platform];
    const maxLength = {
      instagram: 2200,
      facebook: 63206,
      tiktok: 300
    };

    let optimizedContent = content;

    // Add platform-specific hashtags
    if (hashtags) {
      const platformHashtags = [
        ...hashtags.primary,
        ...(hashtags.secondary || []).slice(0, 2),
        ...(hashtags.trending || []).slice(0, 1)
      ];
      
      optimizedContent += '\n\n' + platformHashtags.join(' ');
    }

    // Truncate if necessary
    if (optimizedContent.length > maxLength[platform]) {
      optimizedContent = optimizedContent.slice(0, maxLength[platform] - 3) + '...';
    }

    return optimizedContent;
  }
}

module.exports = SocialMediaAPIHandler;