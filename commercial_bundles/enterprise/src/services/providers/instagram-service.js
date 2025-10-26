// Instagram Basic Display API Service Implementation
// Agent B - Phase 2 Task 2.2: Social Media API Integration

const axios = require('axios');

/**
 * Instagram API Service Implementation
 * Handles Instagram Basic Display API operations for posting and analytics
 */

class InstagramService {
  constructor(config) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: 10000
    });
  }
  
  /**
   * Create Instagram post
   * @param {Object} postPayload - Post data
   * @returns {Object} Post creation result
   */
  async createPost(postPayload) {
    try {
      const {
        content,
        hashtags = [],
        mediaUrls = [],
        scheduledTime = null,
        metadata = {}
      } = postPayload;
      
      // Combine content with hashtags
      const fullContent = this.formatContent(content, hashtags);
      
      if (mediaUrls.length === 0) {
        throw new Error('Instagram posts require at least one media item');
      }
      
      // Step 1: Create media containers
      const mediaContainers = await this.createMediaContainers(mediaUrls, fullContent);
      
      // Step 2: Publish media containers
      const publishResult = await this.publishMedia(mediaContainers, scheduledTime);
      
      return {
        postId: publishResult.id,
        platform: 'instagram',
        status: scheduledTime ? 'scheduled' : 'published',
        url: `https://www.instagram.com/p/${publishResult.id}`,
        metadata: {
          ...metadata,
          mediaCount: mediaUrls.length,
          hashtagCount: hashtags.length,
          characterCount: fullContent.length
        }
      };
    } catch (error) {
      throw new Error(`Instagram post creation error: ${error.response?.data?.error?.message || error.message}`);
    }
  }
  
  /**
   * Create media containers for Instagram post
   * @param {Array} mediaUrls - Array of media URLs
   * @param {string} caption - Post caption
   * @returns {Array} Media container IDs
   */
  async createMediaContainers(mediaUrls, caption) {
    const containers = [];
    
    for (const [index, mediaUrl] of mediaUrls.entries()) {
      const isVideo = this.isVideoUrl(mediaUrl);
      
      const containerData = {
        image_url: isVideo ? undefined : mediaUrl,
        video_url: isVideo ? mediaUrl : undefined,
        media_type: isVideo ? 'VIDEO' : 'IMAGE',
        caption: index === 0 ? caption : undefined, // Only add caption to first media
        access_token: this.config.accessToken
      };
      
      const response = await this.client.post(`/me/media`, containerData);
      containers.push(response.data.id);
      
      // Wait a bit between container creations to avoid rate limits
      if (index < mediaUrls.length - 1) {
        await this.delay(1000);
      }
    }
    
    return containers;
  }
  
  /**
   * Publish media containers
   * @param {Array} containerIds - Media container IDs
   * @param {string} scheduledTime - Optional scheduled time
   * @returns {Object} Publish result
   */
  async publishMedia(containerIds, scheduledTime = null) {
    const publishData = {
      creation_id: containerIds.length === 1 ? containerIds[0] : undefined,
      children: containerIds.length > 1 ? containerIds : undefined,
      media_type: containerIds.length > 1 ? 'CAROUSEL' : undefined,
      access_token: this.config.accessToken
    };
    
    if (scheduledTime) {
      // Instagram doesn't support scheduling via Basic Display API
      // This would require Instagram Business API
      throw new Error('Scheduling not supported with Instagram Basic Display API. Use Instagram Business API instead.');
    }
    
    const response = await this.client.post('/me/media_publish', publishData);
    return response.data;
  }
  
  /**
   * Format content with hashtags
   * @param {string} content - Main content
   * @param {Array} hashtags - Array of hashtags
   * @returns {string} Formatted content
   */
  formatContent(content, hashtags) {
    const maxLength = 2200; // Instagram caption limit
    let formattedContent = content;
    
    if (hashtags.length > 0) {
      const hashtagString = hashtags.map(tag => tag.startsWith('#') ? tag : `#${tag}`).join(' ');
      formattedContent = `${content}\\n\\n${hashtagString}`;
    }
    
    // Truncate if too long
    if (formattedContent.length > maxLength) {
      formattedContent = formattedContent.substring(0, maxLength - 3) + '...';
    }
    
    return formattedContent;
  }
  
  /**
   * Check if URL is a video
   * @param {string} url - Media URL
   * @returns {boolean} Is video
   */
  isVideoUrl(url) {
    const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv'];
    return videoExtensions.some(ext => url.toLowerCase().includes(ext));
  }
  
  /**
   * Get Instagram analytics
   * @param {Object} filters - Analytics filters
   * @returns {Object} Analytics data
   */
  async getAnalytics(filters = {}) {
    try {
      const { dateRange } = filters;
      
      // Get user media
      const mediaResponse = await this.client.get('/me/media', {
        params: {
          fields: 'id,media_type,media_url,permalink,timestamp,caption',
          access_token: this.config.accessToken,
          limit: 100
        }
      });
      
      const media = mediaResponse.data.data;
      
      // Filter by date range if provided
      let filteredMedia = media;
      if (dateRange) {
        filteredMedia = media.filter(item => {
          const itemDate = new Date(item.timestamp);
          const startDate = new Date(dateRange.start);
          const endDate = new Date(dateRange.end);
          return itemDate >= startDate && itemDate <= endDate;
        });
      }
      
      // Get insights for each media item (requires Instagram Business API)
      // For Basic Display API, we can only get basic media info
      const analytics = {
        totalPosts: filteredMedia.length,
        mediaBreakdown: {
          images: filteredMedia.filter(m => m.media_type === 'IMAGE').length,
          videos: filteredMedia.filter(m => m.media_type === 'VIDEO').length,
          carousels: filteredMedia.filter(m => m.media_type === 'CAROUSEL_ALBUM').length
        },
        posts: filteredMedia.map(item => ({
          id: item.id,
          type: item.media_type,
          url: item.permalink,
          timestamp: item.timestamp,
          caption: item.caption ? item.caption.substring(0, 100) + '...' : null
        }))
      };
      
      return analytics;
    } catch (error) {
      throw new Error(`Instagram analytics error: ${error.response?.data?.error?.message || error.message}`);
    }
  }
  
  /**
   * Test Instagram API connection
   * @returns {Object} Connection test result
   */
  async testConnection() {
    try {
      const startTime = Date.now();
      const response = await this.client.get('/me', {
        params: {
          fields: 'id,username',
          access_token: this.config.accessToken
        }
      });
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'success',
        provider: 'instagram',
        responseTime: `${responseTime}ms`,
        userId: response.data.id,
        username: response.data.username
      };
    } catch (error) {
      return {
        status: 'error',
        provider: 'instagram',
        error: error.response?.data?.error?.message || error.message
      };
    }
  }
  
  /**
   * Get user profile information
   * @returns {Object} Profile data
   */
  async getProfile() {
    try {
      const response = await this.client.get('/me', {
        params: {
          fields: 'id,username,account_type,media_count',
          access_token: this.config.accessToken
        }
      });
      
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get Instagram profile: ${error.message}`);
    }
  }
  
  /**
   * Utility function to add delay
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise} Delay promise
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Get rate limit status
   * @returns {Object} Rate limit information
   */
  getRateLimitInfo() {
    return {
      platform: 'instagram',
      limits: this.config.rateLimits,
      note: 'Instagram Basic Display API has rate limits per app/user. Monitor usage carefully.'
    };
  }
}

module.exports = InstagramService;