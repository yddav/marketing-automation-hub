// Social Media Integration Service
// Agent B - Phase 2 Task 2.2: Social Media API Connections

const { apiConfig } = require('../config/api-credentials');
const winston = require('winston');

// Social media provider implementations
const InstagramService = require('./providers/instagram-service');
const TwitterService = require('./providers/twitter-service');
const FacebookService = require('./providers/facebook-service');

// Template processing
const Handlebars = require('handlebars');
const fs = require('fs').promises;
const path = require('path');

/**
 * Unified Social Media Service Layer
 * Manages posting, scheduling, and analytics across multiple platforms
 * Supports: Instagram, Twitter, Facebook
 */

class SocialMediaService {
  constructor() {
    this.providers = {};
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console()
      ]
    });
    
    this.initializeProviders();
  }
  
  /**
   * Initialize available social media providers
   */
  initializeProviders() {
    try {
      // Instagram
      if (apiConfig.instagram.appId && apiConfig.instagram.accessToken) {
        this.providers.instagram = new InstagramService(apiConfig.instagram);
        this.logger.info('Instagram service initialized');
      }
      
      // Twitter
      if (apiConfig.twitter.bearerToken) {
        this.providers.twitter = new TwitterService(apiConfig.twitter);
        this.logger.info('Twitter service initialized');
      }
      
      // Facebook
      if (apiConfig.facebook.appId && apiConfig.facebook.accessToken) {
        this.providers.facebook = new FacebookService(apiConfig.facebook);
        this.logger.info('Facebook service initialized');
      }
      
      
      const enabledPlatforms = Object.keys(this.providers);
      this.logger.info(`Social media service ready with platforms: ${enabledPlatforms.join(', ')}`);
      
      if (enabledPlatforms.length === 0) {
        this.logger.warn('No social media platforms configured');
      }
    } catch (error) {
      this.logger.error('Failed to initialize social media providers:', error);
      throw error;
    }
  }
  
  /**
   * Load and process social media template from content_templates
   * @param {string} platform - instagram, twitter, facebook, linkedin
   * @param {string} templateId - Specific template ID
   * @param {Object} placeholderData - Data to populate template placeholders
   * @returns {Object} Processed content
   */
  async loadTemplate(platform, templateId, placeholderData = {}) {
    try {
      const templatePath = path.join(
        __dirname, 
        '../../content_templates/social_media', 
        `${platform}-templates.json`
      );
      
      const templateContent = await fs.readFile(templatePath, 'utf8');
      const templateData = JSON.parse(templateContent);
      
      // Find specific template
      const template = templateData.content.variations.find(v => v.id === templateId);
      if (!template) {
        throw new Error(`Template ${templateId} not found for platform ${platform}`);
      }
      
      // Process template with Handlebars
      const templateEngine = Handlebars.compile(template.template);
      const processedContent = templateEngine(placeholderData);
      
      // Extract hashtags from metadata
      const hashtags = templateData.metadata.hashtags || [];
      
      return {
        content: processedContent,
        hashtags,
        metadata: templateData.metadata,
        platform,
        templateId,
        characterLimits: templateData.metadata.character_limits
      };
    } catch (error) {
      this.logger.error(`Failed to load template ${platform}:${templateId}:`, error);
      throw error;
    }
  }
  
  /**
   * Post content to single platform
   * @param {Object} postData - Post configuration
   * @returns {Object} Post result
   */
  async postToPlatform(postData) {
    try {
      const {
        platform,
        templateId,
        content,
        placeholderData = {},
        mediaUrls = [],
        scheduledTime = null,
        metadata = {}
      } = postData;
      
      if (!this.providers[platform]) {
        throw new Error(`Platform ${platform} not configured or unavailable`);
      }
      
      let processedContent, hashtags;
      
      // Direct content posting (for integration testing)
      if (content && !templateId) {
        processedContent = content;
        hashtags = postData.hashtags || [];
      } else {
        // Load and process template
        const processedTemplate = await this.loadTemplate(platform, templateId, placeholderData);
        processedContent = processedTemplate.content;
        hashtags = processedTemplate.hashtags;
      }
      
      // Prepare post payload
      const postPayload = {
        content: processedContent,
        hashtags: hashtags,
        mediaUrls,
        scheduledTime,
        metadata: {
          ...metadata,
          templateId,
          platform,
          postedAt: new Date().toISOString()
        }
      };
      
      // Post via provider
      const result = await this.providers[platform].createPost(postPayload);
      
      this.logger.info('Social media post created:', {
        platform,
        templateId,
        postId: result.postId,
        scheduled: !!scheduledTime
      });
      
      return result;
    } catch (error) {
      this.logger.error('Failed to post to platform:', error);
      throw error;
    }
  }
  
  /**
   * Post to multiple platforms simultaneously
   * @param {Object} multiPostData - Multi-platform post configuration
   * @returns {Object} Multi-post results
   */
  async postToMultiplePlatforms(multiPostData) {
    try {
      const {
        platforms,
        templateMappings, // { platform: templateId }
        placeholderData = {},
        mediaUrls = [],
        scheduledTime = null,
        metadata = {}
      } = multiPostData;
      
      const postPromises = platforms.map(async (platform) => {
        try {
          const templateId = templateMappings[platform] || templateMappings.default;
          
          const result = await this.postToplatform({
            platform,
            templateId,
            placeholderData,
            mediaUrls,
            scheduledTime,
            metadata
          });
          
          return { platform, success: true, result };
        } catch (error) {
          this.logger.error(`Failed to post to ${platform}:`, error);
          return { platform, success: false, error: error.message };
        }
      });
      
      const results = await Promise.all(postPromises);
      
      const successCount = results.filter(r => r.success).length;
      this.logger.info(`Multi-platform post completed: ${successCount}/${platforms.length} successful`);
      
      return {
        totalPlatforms: platforms.length,
        successCount,
        results
      };
    } catch (error) {
      this.logger.error('Failed to execute multi-platform post:', error);
      throw error;
    }
  }
  
  /**
   * Schedule content series across platforms
   * @param {Object} seriesConfig - Content series configuration
   * @returns {Object} Scheduling result
   */
  async scheduleContentSeries(seriesConfig) {
    try {
      const {
        seriesName,
        platforms,
        contentSchedule, // Array of { templateId, scheduledTime, placeholderData }
        globalPlaceholderData = {},
        metadata = {}
      } = seriesConfig;
      
      const schedulingPromises = contentSchedule.map(async (scheduleItem, index) => {
        const {
          templateId,
          scheduledTime,
          placeholderData: itemPlaceholderData = {},
          platforms: itemPlatforms = platforms
        } = scheduleItem;
        
        const combinedPlaceholderData = {
          ...globalPlaceholderData,
          ...itemPlaceholderData,
          series_name: seriesName,
          series_index: index + 1,
          series_total: contentSchedule.length
        };
        
        return await this.postToMultiplePlatforms({
          platforms: itemPlatforms,
          templateMappings: { default: templateId },
          placeholderData: combinedPlaceholderData,
          scheduledTime,
          metadata: {
            ...metadata,
            seriesName,
            seriesIndex: index + 1
          }
        });
      });
      
      const seriesResults = await Promise.all(schedulingPromises);
      
      this.logger.info('Content series scheduled:', {
        seriesName,
        totalPosts: contentSchedule.length,
        platforms: platforms.length
      });
      
      return {
        seriesName,
        totalPosts: contentSchedule.length,
        platforms,
        results: seriesResults
      };
    } catch (error) {
      this.logger.error('Failed to schedule content series:', error);
      throw error;
    }
  }
  
  /**
   * Get analytics across all platforms
   * @param {Object} filters - Analytics filters
   * @returns {Object} Combined analytics data
   */
  async getAnalytics(filters = {}) {
    try {
      const { dateRange, platforms = Object.keys(this.providers) } = filters;
      
      const analyticsPromises = platforms.map(async (platform) => {
        if (!this.providers[platform]) {
          return { platform, error: 'Provider not available' };
        }
        
        try {
          const platformAnalytics = await this.providers[platform].getAnalytics({
            dateRange
          });
          
          return { platform, success: true, data: platformAnalytics };
        } catch (error) {
          this.logger.error(`Failed to get ${platform} analytics:`, error);
          return { platform, success: false, error: error.message };
        }
      });
      
      const analyticsResults = await Promise.all(analyticsPromises);
      
      // Aggregate analytics
      const aggregatedData = {
        dateRange,
        platforms: analyticsResults.length,
        summary: {
          totalPosts: 0,
          totalEngagement: 0,
          totalReach: 0,
          averageEngagementRate: 0
        },
        platformData: analyticsResults
      };
      
      // Calculate aggregated metrics
      const successfulResults = analyticsResults.filter(r => r.success);
      if (successfulResults.length > 0) {
        aggregatedData.summary.totalPosts = successfulResults.reduce((sum, r) => sum + (r.data.totalPosts || 0), 0);
        aggregatedData.summary.totalEngagement = successfulResults.reduce((sum, r) => sum + (r.data.totalEngagement || 0), 0);
        aggregatedData.summary.totalReach = successfulResults.reduce((sum, r) => sum + (r.data.totalReach || 0), 0);
        
        const avgEngagement = successfulResults.reduce((sum, r) => sum + (r.data.averageEngagementRate || 0), 0) / successfulResults.length;
        aggregatedData.summary.averageEngagementRate = parseFloat(avgEngagement.toFixed(4));
      }
      
      this.logger.info('Retrieved social media analytics:', {
        platforms: platforms.length,
        successfulPlatforms: successfulResults.length,
        dateRange
      });
      
      return aggregatedData;
    } catch (error) {
      this.logger.error('Failed to retrieve social media analytics:', error);
      throw error;
    }
  }
  
  /**
   * Test connections to all configured platforms
   * @returns {Object} Connection test results
   */
  async testConnections() {
    try {
      const testPromises = Object.keys(this.providers).map(async (platform) => {
        try {
          const testResult = await this.providers[platform].testConnection();
          return { platform, success: true, result: testResult };
        } catch (error) {
          return { platform, success: false, error: error.message };
        }
      });
      
      const testResults = await Promise.all(testPromises);
      
      const successCount = testResults.filter(r => r.success).length;
      this.logger.info(`Social media connection tests: ${successCount}/${testResults.length} successful`);
      
      return {
        totalPlatforms: testResults.length,
        successCount,
        results: testResults
      };
    } catch (error) {
      this.logger.error('Failed to test social media connections:', error);
      throw error;
    }
  }
  
  /**
   * Get available platforms and their status
   * @returns {Object} Platform availability status
   */
  getAvailablePlatforms() {
    const platformStatus = {};
    
    ['instagram', 'twitter', 'facebook', 'linkedin'].forEach(platform => {
      platformStatus[platform] = {
        configured: !!this.providers[platform],
        rateLimits: apiConfig[platform]?.rateLimits || null
      };
    });
    
    return platformStatus;
  }
}

module.exports = SocialMediaService;