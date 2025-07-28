// Real-time Analytics Data Collection System
// Agent B - Phase 2 Task 2.2: Analytics Integration

const { apiConfig } = require('../config/api-credentials');
const winston = require('winston');
const EventEmitter = require('events');

// Service imports
const EmailService = require('../services/email-service');
const SocialMediaService = require('../services/social-media-service');

// Analytics storage (in production, use proper database)
const analyticsStore = new Map();

/**
 * Real-time Analytics Data Collection System
 * Collects, aggregates, and provides analytics from all integrated platforms
 */

class AnalyticsCollector extends EventEmitter {
  constructor() {
    super();
    
    this.emailService = new EmailService();
    this.socialMediaService = new SocialMediaService();
    
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logs/analytics-collector.log' })
      ]
    });
    
    this.collectionIntervals = new Map();
    this.isCollecting = false;
  }
  
  /**
   * Start real-time analytics collection
   * @param {Object} config - Collection configuration
   */
  async startCollection(config = {}) {
    try {
      if (this.isCollecting) {
        this.logger.warn('Analytics collection is already running');
        return;
      }
      
      const {
        emailInterval = 300000,    // 5 minutes
        socialInterval = 600000,   // 10 minutes
        aggregationInterval = 900000 // 15 minutes
      } = config;
      
      this.logger.info('Starting real-time analytics collection', {
        emailInterval: `${emailInterval/1000}s`,
        socialInterval: `${socialInterval/1000}s`,
        aggregationInterval: `${aggregationInterval/1000}s`
      });
      
      // Start email analytics collection
      await this.startEmailAnalyticsCollection(emailInterval);
      
      // Start social media analytics collection
      await this.startSocialMediaAnalyticsCollection(socialInterval);
      
      // Start data aggregation
      await this.startDataAggregation(aggregationInterval);
      
      this.isCollecting = true;
      this.emit('collectionStarted', { timestamp: new Date().toISOString() });
      
    } catch (error) {
      this.logger.error('Failed to start analytics collection:', error);
      throw error;
    }
  }
  
  /**
   * Start email analytics collection
   * @param {number} interval - Collection interval in milliseconds
   */
  async startEmailAnalyticsCollection(interval) {
    try {
      const collectEmailData = async () => {
        try {
          const analytics = await this.emailService.getAnalytics({
            dateRange: {
              start: new Date(Date.now() - interval).toISOString(),
              end: new Date().toISOString()
            }
          });
          
          this.storeAnalytics('email', analytics);
          this.emit('emailAnalyticsCollected', analytics);
          
        } catch (error) {
          this.logger.error('Failed to collect email analytics:', error);
        }
      };
      
      // Initial collection
      await collectEmailData();
      
      // Set up interval
      const intervalId = setInterval(collectEmailData, interval);
      this.collectionIntervals.set('email', intervalId);
      
      this.logger.info('Email analytics collection started', { interval: `${interval/1000}s` });
      
    } catch (error) {
      this.logger.error('Failed to start email analytics collection:', error);
      throw error;
    }
  }
  
  /**
   * Start social media analytics collection
   * @param {number} interval - Collection interval in milliseconds
   */
  async startSocialMediaAnalyticsCollection(interval) {
    try {
      const collectSocialData = async () => {
        try {
          const analytics = await this.socialMediaService.getAnalytics({
            dateRange: {
              start: new Date(Date.now() - interval).toISOString(),
              end: new Date().toISOString()
            }
          });
          
          this.storeAnalytics('social', analytics);
          this.emit('socialAnalyticsCollected', analytics);
          
        } catch (error) {
          this.logger.error('Failed to collect social media analytics:', error);
        }
      };
      
      // Initial collection
      await collectSocialData();
      
      // Set up interval
      const intervalId = setInterval(collectSocialData, interval);
      this.collectionIntervals.set('social', intervalId);
      
      this.logger.info('Social media analytics collection started', { interval: `${interval/1000}s` });
      
    } catch (error) {
      this.logger.error('Failed to start social media analytics collection:', error);
      throw error;
    }
  }
  
  /**
   * Start data aggregation process
   * @param {number} interval - Aggregation interval in milliseconds
   */
  async startDataAggregation(interval) {
    try {
      const aggregateData = async () => {
        try {
          const aggregatedData = await this.aggregateAllAnalytics();
          this.storeAnalytics('aggregated', aggregatedData);
          this.emit('dataAggregated', aggregatedData);
          
        } catch (error) {
          this.logger.error('Failed to aggregate analytics data:', error);
        }
      };
      
      // Initial aggregation
      await aggregateData();
      
      // Set up interval
      const intervalId = setInterval(aggregateData, interval);
      this.collectionIntervals.set('aggregation', intervalId);
      
      this.logger.info('Data aggregation started', { interval: `${interval/1000}s` });
      
    } catch (error) {
      this.logger.error('Failed to start data aggregation:', error);
      throw error;
    }
  }
  
  /**
   * Store analytics data with timestamp
   * @param {string} type - Analytics type (email, social, aggregated)
   * @param {Object} data - Analytics data
   */
  storeAnalytics(type, data) {
    const timestamp = new Date().toISOString();
    const key = `${type}-${timestamp}`;
    
    analyticsStore.set(key, {
      type,
      timestamp,
      data
    });
    
    // Keep only last 1000 entries per type to prevent memory issues
    this.cleanupOldData(type);
    
    this.logger.debug(`Stored ${type} analytics`, { key, dataSize: JSON.stringify(data).length });
  }
  
  /**
   * Clean up old analytics data
   * @param {string} type - Analytics type
   */
  cleanupOldData(type) {
    const entries = Array.from(analyticsStore.entries())
      .filter(([key]) => key.startsWith(type))
      .sort(([a], [b]) => b.localeCompare(a)); // Sort by timestamp desc
    
    if (entries.length > 1000) {
      const toDelete = entries.slice(1000);
      toDelete.forEach(([key]) => analyticsStore.delete(key));
      
      this.logger.debug(`Cleaned up ${toDelete.length} old ${type} analytics entries`);
    }
  }
  
  /**
   * Aggregate all analytics data
   * @returns {Object} Aggregated analytics
   */
  async aggregateAllAnalytics() {
    try {
      const now = new Date();
      const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);
      
      // Get recent data
      const emailData = this.getRecentAnalytics('email', oneDayAgo);
      const socialData = this.getRecentAnalytics('social', oneDayAgo);
      
      // Calculate aggregated metrics
      const aggregated = {
        timestamp: now.toISOString(),
        timeRange: {
          start: oneDayAgo.toISOString(),
          end: now.toISOString()
        },
        email: this.aggregateEmailMetrics(emailData),
        social: this.aggregateSocialMetrics(socialData),
        combined: {}
      };
      
      // Calculate combined metrics
      aggregated.combined = {
        totalEngagement: (aggregated.email.totalEngagement || 0) + (aggregated.social.totalEngagement || 0),
        totalReach: (aggregated.email.totalRecipients || 0) + (aggregated.social.totalReach || 0),
        averageEngagementRate: this.calculateCombinedEngagementRate(aggregated.email, aggregated.social),
        topPerformingContent: this.identifyTopPerformingContent(emailData, socialData)
      };
      
      return aggregated;
    } catch (error) {
      this.logger.error('Failed to aggregate analytics:', error);
      throw error;
    }
  }
  
  /**
   * Get recent analytics data by type
   * @param {string} type - Analytics type
   * @param {Date} since - Since date
   * @returns {Array} Recent analytics data
   */
  getRecentAnalytics(type, since) {
    return Array.from(analyticsStore.values())
      .filter(entry => entry.type === type && new Date(entry.timestamp) >= since)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }
  
  /**
   * Aggregate email metrics
   * @param {Array} emailData - Email analytics data
   * @returns {Object} Aggregated email metrics
   */
  aggregateEmailMetrics(emailData) {
    if (emailData.length === 0) {
      return {
        totalEmails: 0,
        totalRecipients: 0,
        totalOpens: 0,
        totalClicks: 0,
        averageOpenRate: 0,
        averageClickRate: 0,
        totalEngagement: 0
      };
    }
    
    const latest = emailData[0].data;
    const totalEmails = latest.totalCampaigns || 0;
    
    let totalOpens = 0;
    let totalClicks = 0;
    let totalRecipients = 0;
    
    if (latest.campaigns) {
      latest.campaigns.forEach(campaign => {
        const stats = campaign.stats || {};
        totalOpens += stats.opens || 0;
        totalClicks += stats.clicks || 0;
        totalRecipients += campaign.recipients || 0;
      });
    }
    
    return {
      totalEmails,
      totalRecipients,
      totalOpens,
      totalClicks,
      averageOpenRate: totalRecipients > 0 ? totalOpens / totalRecipients : 0,
      averageClickRate: totalRecipients > 0 ? totalClicks / totalRecipients : 0,
      totalEngagement: totalOpens + totalClicks
    };
  }
  
  /**
   * Aggregate social media metrics
   * @param {Array} socialData - Social media analytics data
   * @returns {Object} Aggregated social metrics
   */
  aggregateSocialMetrics(socialData) {
    if (socialData.length === 0) {
      return {
        totalPosts: 0,
        totalEngagement: 0,
        totalReach: 0,
        averageEngagementRate: 0,
        platformBreakdown: {}
      };
    }
    
    const latest = socialData[0].data;
    
    return {
      totalPosts: latest.summary?.totalPosts || 0,
      totalEngagement: latest.summary?.totalEngagement || 0,
      totalReach: latest.summary?.totalReach || 0,
      averageEngagementRate: latest.summary?.averageEngagementRate || 0,
      platformBreakdown: this.calculatePlatformBreakdown(latest.platformData || [])
    };
  }
  
  /**
   * Calculate platform breakdown for social media
   * @param {Array} platformData - Platform-specific data
   * @returns {Object} Platform breakdown
   */
  calculatePlatformBreakdown(platformData) {
    const breakdown = {};
    
    platformData.forEach(platform => {
      if (platform.success && platform.data) {
        breakdown[platform.platform] = {
          posts: platform.data.totalPosts || 0,
          engagement: platform.data.totalEngagement || 0,
          reach: platform.data.totalReach || 0,
          engagementRate: platform.data.averageEngagementRate || 0
        };
      }
    });
    
    return breakdown;
  }
  
  /**
   * Calculate combined engagement rate
   * @param {Object} emailMetrics - Email metrics
   * @param {Object} socialMetrics - Social metrics
   * @returns {number} Combined engagement rate
   */
  calculateCombinedEngagementRate(emailMetrics, socialMetrics) {
    const totalEngagement = (emailMetrics.totalEngagement || 0) + (socialMetrics.totalEngagement || 0);
    const totalReach = (emailMetrics.totalRecipients || 0) + (socialMetrics.totalReach || 0);
    
    return totalReach > 0 ? totalEngagement / totalReach : 0;
  }
  
  /**
   * Identify top performing content
   * @param {Array} emailData - Email data
   * @param {Array} socialData - Social data
   * @returns {Array} Top performing content
   */
  identifyTopPerformingContent(emailData, socialData) {
    const topContent = [];
    
    // Analyze email campaigns
    if (emailData.length > 0 && emailData[0].data.campaigns) {
      const topEmailCampaigns = emailData[0].data.campaigns
        .sort((a, b) => (b.stats?.clicks || 0) - (a.stats?.clicks || 0))
        .slice(0, 3)
        .map(campaign => ({
          type: 'email',
          subject: campaign.subject,
          engagement: campaign.stats?.clicks || 0,
          platform: 'email'
        }));
      
      topContent.push(...topEmailCampaigns);
    }
    
    // Analyze social media posts
    if (socialData.length > 0 && socialData[0].data.platformData) {
      socialData[0].data.platformData.forEach(platform => {
        if (platform.success && platform.data.posts) {
          const topPosts = platform.data.posts
            .sort((a, b) => (b.metrics?.engagement || 0) - (a.metrics?.engagement || 0))
            .slice(0, 2)
            .map(post => ({
              type: 'social',
              content: post.text || post.caption,
              engagement: post.metrics?.engagement || 0,
              platform: platform.platform
            }));
          
          topContent.push(...topPosts);
        }
      });
    }
    
    return topContent
      .sort((a, b) => b.engagement - a.engagement)
      .slice(0, 5);
  }
  
  /**
   * Get current analytics summary
   * @param {Object} options - Query options
   * @returns {Object} Analytics summary
   */
  getCurrentAnalytics(options = {}) {
    const {
      timeRange = '24h',
      includeRawData = false
    } = options;
    
    const cutoffTime = this.getTimeRangeCutoff(timeRange);
    
    // Get latest aggregated data
    const aggregatedEntries = Array.from(analyticsStore.values())
      .filter(entry => entry.type === 'aggregated' && new Date(entry.timestamp) >= cutoffTime)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    const summary = {
      lastUpdated: aggregatedEntries.length > 0 ? aggregatedEntries[0].timestamp : null,
      timeRange,
      isCollecting: this.isCollecting,
      data: aggregatedEntries.length > 0 ? aggregatedEntries[0].data : null
    };
    
    if (includeRawData) {
      summary.rawData = {
        email: this.getRecentAnalytics('email', cutoffTime),
        social: this.getRecentAnalytics('social', cutoffTime)
      };
    }
    
    return summary;
  }
  
  /**
   * Get time range cutoff date
   * @param {string} timeRange - Time range (1h, 24h, 7d, 30d)
   * @returns {Date} Cutoff date
   */
  getTimeRangeCutoff(timeRange) {
    const now = new Date();
    const ranges = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    };
    
    const milliseconds = ranges[timeRange] || ranges['24h'];
    return new Date(now - milliseconds);
  }
  
  /**
   * Stop analytics collection
   */
  stopCollection() {
    try {
      if (!this.isCollecting) {
        this.logger.warn('Analytics collection is not running');
        return;
      }
      
      // Clear all intervals
      for (const [name, intervalId] of this.collectionIntervals) {
        clearInterval(intervalId);
        this.logger.info(`Stopped ${name} collection interval`);
      }
      
      this.collectionIntervals.clear();
      this.isCollecting = false;
      
      this.emit('collectionStopped', { timestamp: new Date().toISOString() });
      this.logger.info('Analytics collection stopped');
      
    } catch (error) {
      this.logger.error('Failed to stop analytics collection:', error);
      throw error;
    }
  }
  
  /**
   * Get collection status
   * @returns {Object} Collection status
   */
  getCollectionStatus() {
    return {
      isCollecting: this.isCollecting,
      activeIntervals: Array.from(this.collectionIntervals.keys()),
      totalStoredEntries: analyticsStore.size,
      lastActivity: this.getCurrentAnalytics({ timeRange: '1h' }).lastUpdated
    };
  }
}

module.exports = AnalyticsCollector;