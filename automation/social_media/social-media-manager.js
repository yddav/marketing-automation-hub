/**
 * Social Media Automation Manager
 * Handles multi-platform posting, scheduling, and content adaptation
 */

const axios = require('axios');
const cron = require('node-cron');
const { DateTime } = require('luxon');

class SocialMediaManager {
  constructor(config) {
    this.platforms = {
      twitter: {
        api: 'https://api.twitter.com/2',
        bearerToken: config.TWITTER_BEARER_TOKEN,
        maxLength: 280,
        mediaTypes: ['image', 'video', 'gif'],
        optimalTimes: ['8:00', '12:00', '17:00', '20:00']
      },
      instagram: {
        api: 'https://graph.instagram.com',
        accessToken: config.INSTAGRAM_ACCESS_TOKEN,
        businessAccountId: config.INSTAGRAM_BUSINESS_ID,
        maxLength: 2200,
        mediaTypes: ['image', 'video', 'carousel'],
        optimalTimes: ['7:00', '11:00', '18:00', '21:00']
      },
      facebook: {
        api: 'https://graph.facebook.com/v18.0',
        pageAccessToken: config.FACEBOOK_PAGE_TOKEN,
        pageId: config.FACEBOOK_PAGE_ID,
        maxLength: 63206,
        mediaTypes: ['image', 'video', 'link'],
        optimalTimes: ['9:00', '13:00', '15:00', '19:00']
      },
      linkedin: {
        api: 'https://api.linkedin.com/v2',
        accessToken: config.LINKEDIN_ACCESS_TOKEN,
        organizationId: config.LINKEDIN_ORG_ID,
        maxLength: 3000,
        mediaTypes: ['image', 'video', 'article'],
        optimalTimes: ['7:30', '12:00', '17:30']
      }
    };
    
    this.contentQueue = [];
    this.postingSchedule = [];
    this.analytics = {
      posted: 0,
      scheduled: 0,
      failed: 0,
      engagement: {}
    };
  }

  /**
   * Generate 30-day content calendar
   */
  async generateContentCalendar(templates, startDate = DateTime.now()) {
    const calendar = [];
    const endDate = startDate.plus({ days: 30 });
    
    let currentDate = startDate;
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.weekday;
      const weekNumber = currentDate.weekNumber;
      
      // Assign content types based on day patterns
      const contentStrategy = this.getDailyContentStrategy(dayOfWeek, weekNumber);
      
      for (const strategy of contentStrategy) {
        const content = await this.createScheduledContent({
          date: currentDate,
          type: strategy.type,
          platforms: strategy.platforms,
          template: templates[strategy.templateKey],
          timeSlot: strategy.timeSlot
        });
        
        calendar.push(content);
      }
      
      currentDate = currentDate.plus({ days: 1 });
    }
    
    return calendar;
  }

  /**
   * Get daily content strategy based on patterns
   */
  getDailyContentStrategy(dayOfWeek, weekNumber) {
    const strategies = {
      1: [ // Monday - Motivation & Week Start
        { type: 'motivation', platforms: ['twitter', 'linkedin'], templateKey: 'monday_motivation', timeSlot: 'morning' },
        { type: 'feature', platforms: ['instagram', 'facebook'], templateKey: 'feature_spotlight', timeSlot: 'afternoon' }
      ],
      2: [ // Tuesday - Tips & Education
        { type: 'tip', platforms: ['twitter', 'facebook'], templateKey: 'quick_tip', timeSlot: 'morning' },
        { type: 'tutorial', platforms: ['instagram', 'linkedin'], templateKey: 'mini_tutorial', timeSlot: 'evening' }
      ],
      3: [ // Wednesday - Community & Engagement
        { type: 'poll', platforms: ['twitter', 'linkedin'], templateKey: 'engagement_poll', timeSlot: 'morning' },
        { type: 'ugc', platforms: ['instagram', 'facebook'], templateKey: 'user_content', timeSlot: 'afternoon' }
      ],
      4: [ // Thursday - Behind the Scenes
        { type: 'bts', platforms: ['instagram', 'twitter'], templateKey: 'behind_scenes', timeSlot: 'morning' },
        { type: 'update', platforms: ['linkedin', 'facebook'], templateKey: 'product_update', timeSlot: 'evening' }
      ],
      5: [ // Friday - Fun & Celebration
        { type: 'celebration', platforms: ['twitter', 'instagram'], templateKey: 'friday_fun', timeSlot: 'morning' },
        { type: 'weekend', platforms: ['facebook', 'linkedin'], templateKey: 'weekend_prep', timeSlot: 'afternoon' }
      ],
      6: [ // Saturday - Casual & Community
        { type: 'casual', platforms: ['instagram', 'facebook'], templateKey: 'weekend_vibes', timeSlot: 'morning' },
        { type: 'showcase', platforms: ['twitter'], templateKey: 'user_showcase', timeSlot: 'evening' }
      ],
      7: [ // Sunday - Reflection & Planning
        { type: 'reflection', platforms: ['linkedin', 'facebook'], templateKey: 'week_review', timeSlot: 'morning' },
        { type: 'preview', platforms: ['instagram', 'twitter'], templateKey: 'week_ahead', timeSlot: 'evening' }
      ]
    };
    
    return strategies[dayOfWeek] || strategies[1];
  }

  /**
   * Create scheduled content with platform adaptations
   */
  async createScheduledContent(params) {
    const { date, type, platforms, template, timeSlot } = params;
    
    const content = {
      id: `content_${date.toISODate()}_${type}_${Math.random().toString(36).substr(2, 9)}`,
      scheduledDate: date,
      type,
      status: 'scheduled',
      platforms: {},
      analytics: {
        impressions: 0,
        engagement: 0,
        clicks: 0
      }
    };
    
    // Adapt content for each platform
    for (const platform of platforms) {
      content.platforms[platform] = await this.adaptContentForPlatform({
        platform,
        template,
        type,
        timeSlot,
        date
      });
    }
    
    return content;
  }

  /**
   * Adapt content for specific platform requirements
   */
  async adaptContentForPlatform(params) {
    const { platform, template, type, timeSlot, date } = params;
    const platformConfig = this.platforms[platform];
    
    // Get optimal posting time for the platform
    const postingTime = this.getOptimalPostingTime(platform, timeSlot);
    const scheduledDateTime = date.set({
      hour: parseInt(postingTime.split(':')[0]),
      minute: parseInt(postingTime.split(':')[1])
    });
    
    // Platform-specific adaptations
    const adaptations = {
      twitter: () => this.adaptForTwitter(template),
      instagram: () => this.adaptForInstagram(template),
      facebook: () => this.adaptForFacebook(template),
      linkedin: () => this.adaptForLinkedIn(template)
    };
    
    const adaptedContent = await adaptations[platform]();
    
    return {
      ...adaptedContent,
      scheduledTime: scheduledDateTime.toISO(),
      hashtags: await this.generateHashtags(platform, type),
      media: template.media || null
    };
  }

  /**
   * Platform-specific content adaptations
   */
  async adaptForTwitter(template) {
    const content = template.content.substring(0, 240); // Leave room for hashtags
    return {
      text: content,
      callToAction: 'Reply with your thoughts! 💭',
      format: 'tweet'
    };
  }

  async adaptForInstagram(template) {
    return {
      caption: template.content,
      callToAction: 'Double tap if you agree! Link in bio for more.',
      format: 'post',
      altText: template.altText || 'Marketing automation content'
    };
  }

  async adaptForFacebook(template) {
    return {
      message: template.content,
      callToAction: 'Learn more at our website!',
      format: 'post',
      linkPreview: template.link || null
    };
  }

  async adaptForLinkedIn(template) {
    const professionalContent = template.content.replace(/emoji/gi, '');
    return {
      text: professionalContent,
      callToAction: 'What are your thoughts on this approach?',
      format: 'share',
      article: template.article || null
    };
  }

  /**
   * Generate platform-optimized hashtags
   */
  async generateHashtags(platform, contentType) {
    const baseHashtags = [
      '#MarketingAutomation',
      '#AppMarketing',
      '#IndieDevs',
      '#CreatorEconomy'
    ];
    
    const typeHashtags = {
      motivation: ['#MondayMotivation', '#StartupLife', '#Entrepreneurship'],
      tip: ['#MarketingTips', '#GrowthHacks', '#ProTip'],
      tutorial: ['#HowTo', '#LearnWithUs', '#Tutorial'],
      poll: ['#Question', '#CommunityPoll', '#YourOpinion'],
      ugc: ['#CommunityLove', '#UserStories', '#ThankYou'],
      bts: ['#BehindTheScenes', '#WorkInProgress', '#BuildInPublic'],
      update: ['#ProductUpdate', '#NewFeature', '#Announcement'],
      celebration: ['#FridayFeeling', '#Success', '#Milestone'],
      casual: ['#WeekendVibes', '#SaturdayMood', '#Relax'],
      showcase: ['#CommunityShowcase', '#FeatureFriday', '#Spotlight'],
      reflection: ['#WeeklyReview', '#SundayThoughts', '#Progress'],
      preview: ['#ComingSoon', '#WeekAhead', '#MondayMotivation']
    };
    
    const platformLimits = {
      twitter: 5,
      instagram: 30,
      facebook: 10,
      linkedin: 5
    };
    
    const selectedHashtags = [
      ...baseHashtags.slice(0, 2),
      ...typeHashtags[contentType].slice(0, 2)
    ];
    
    return selectedHashtags.slice(0, platformLimits[platform]);
  }

  /**
   * Get optimal posting time based on platform and time slot
   */
  getOptimalPostingTime(platform, timeSlot) {
    const timeSlots = {
      morning: 0,
      afternoon: 1,
      evening: 2,
      night: 3
    };
    
    const slotIndex = timeSlots[timeSlot] || 0;
    const platformTimes = this.platforms[platform].optimalTimes;
    
    return platformTimes[slotIndex] || platformTimes[0];
  }

  /**
   * Schedule content for posting
   */
  async scheduleContent(content) {
    for (const [platform, platformContent] of Object.entries(content.platforms)) {
      const scheduledTime = DateTime.fromISO(platformContent.scheduledTime);
      
      // Schedule with cron
      const cronExpression = `${scheduledTime.minute} ${scheduledTime.hour} ${scheduledTime.day} ${scheduledTime.month} *`;
      
      cron.schedule(cronExpression, async () => {
        await this.postToPlatform(platform, platformContent, content.id);
      });
      
      this.postingSchedule.push({
        contentId: content.id,
        platform,
        scheduledTime: scheduledTime.toISO(),
        status: 'scheduled'
      });
    }
    
    this.analytics.scheduled++;
    return content;
  }

  /**
   * Post content to specific platform
   */
  async postToPlatform(platform, content, contentId) {
    try {
      const postMethods = {
        twitter: () => this.postToTwitter(content),
        instagram: () => this.postToInstagram(content),
        facebook: () => this.postToFacebook(content),
        linkedin: () => this.postToLinkedIn(content)
      };
      
      const result = await postMethods[platform]();
      
      // Update analytics
      this.analytics.posted++;
      this.analytics.engagement[contentId] = {
        platform,
        postId: result.id,
        timestamp: DateTime.now().toISO()
      };
      
      // Update schedule status
      const scheduleItem = this.postingSchedule.find(
        item => item.contentId === contentId && item.platform === platform
      );
      if (scheduleItem) {
        scheduleItem.status = 'posted';
        scheduleItem.postId = result.id;
      }
      
      return result;
    } catch (error) {
      console.error(`Failed to post to ${platform}:`, error);
      this.analytics.failed++;
      throw error;
    }
  }

  /**
   * Platform-specific posting methods
   */
  async postToTwitter(content) {
    const tweet = {
      text: `${content.text} ${content.hashtags.join(' ')}`
    };
    
    if (content.media) {
      // Upload media first
      const mediaId = await this.uploadTwitterMedia(content.media);
      tweet.media = { media_ids: [mediaId] };
    }
    
    const response = await axios.post(
      `${this.platforms.twitter.api}/tweets`,
      tweet,
      {
        headers: {
          'Authorization': `Bearer ${this.platforms.twitter.bearerToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data.data;
  }

  async postToInstagram(content) {
    // Instagram requires media
    if (!content.media) {
      throw new Error('Instagram posts require media');
    }
    
    // Create media container
    const containerResponse = await axios.post(
      `${this.platforms.instagram.api}/${this.platforms.instagram.businessAccountId}/media`,
      {
        image_url: content.media.url,
        caption: `${content.caption}\n\n${content.hashtags.join(' ')}`,
        access_token: this.platforms.instagram.accessToken
      }
    );
    
    const containerId = containerResponse.data.id;
    
    // Publish the container
    const publishResponse = await axios.post(
      `${this.platforms.instagram.api}/${this.platforms.instagram.businessAccountId}/media_publish`,
      {
        creation_id: containerId,
        access_token: this.platforms.instagram.accessToken
      }
    );
    
    return publishResponse.data;
  }

  async postToFacebook(content) {
    const post = {
      message: `${content.message}\n\n${content.hashtags.join(' ')}`,
      access_token: this.platforms.facebook.pageAccessToken
    };
    
    if (content.media) {
      post.url = content.media.url;
    }
    
    if (content.linkPreview) {
      post.link = content.linkPreview;
    }
    
    const response = await axios.post(
      `${this.platforms.facebook.api}/${this.platforms.facebook.pageId}/feed`,
      post
    );
    
    return response.data;
  }

  async postToLinkedIn(content) {
    const share = {
      author: `urn:li:organization:${this.platforms.linkedin.organizationId}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: `${content.text}\n\n${content.hashtags.join(' ')}`
          },
          shareMediaCategory: content.media ? 'IMAGE' : 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    };
    
    if (content.media) {
      // Upload media to LinkedIn first
      const mediaUrn = await this.uploadLinkedInMedia(content.media);
      share.specificContent['com.linkedin.ugc.ShareContent'].media = [{
        status: 'READY',
        media: mediaUrn
      }];
    }
    
    const response = await axios.post(
      `${this.platforms.linkedin.api}/ugcPosts`,
      share,
      {
        headers: {
          'Authorization': `Bearer ${this.platforms.linkedin.accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0'
        }
      }
    );
    
    return response.data;
  }

  /**
   * Get analytics for posted content
   */
  async getContentAnalytics(contentId, platform) {
    const engagement = this.analytics.engagement[contentId];
    if (!engagement || engagement.platform !== platform) {
      throw new Error('Content not found or not posted to specified platform');
    }
    
    const analyticsMethods = {
      twitter: () => this.getTwitterAnalytics(engagement.postId),
      instagram: () => this.getInstagramAnalytics(engagement.postId),
      facebook: () => this.getFacebookAnalytics(engagement.postId),
      linkedin: () => this.getLinkedInAnalytics(engagement.postId)
    };
    
    return await analyticsMethods[platform]();
  }

  /**
   * Generate performance report
   */
  generatePerformanceReport(dateRange) {
    const report = {
      period: dateRange,
      summary: {
        totalScheduled: this.analytics.scheduled,
        totalPosted: this.analytics.posted,
        totalFailed: this.analytics.failed,
        successRate: (this.analytics.posted / this.analytics.scheduled * 100).toFixed(2) + '%'
      },
      platformBreakdown: {},
      topPerformingContent: [],
      recommendations: []
    };
    
    // Analyze by platform
    for (const [contentId, engagement] of Object.entries(this.analytics.engagement)) {
      const platform = engagement.platform;
      if (!report.platformBreakdown[platform]) {
        report.platformBreakdown[platform] = {
          posts: 0,
          totalEngagement: 0,
          avgEngagement: 0
        };
      }
      report.platformBreakdown[platform].posts++;
    }
    
    // Generate recommendations
    report.recommendations = this.generateRecommendations(report);
    
    return report;
  }

  /**
   * Generate AI-powered recommendations
   */
  generateRecommendations(report) {
    const recommendations = [];
    
    // Platform performance
    for (const [platform, stats] of Object.entries(report.platformBreakdown)) {
      if (stats.avgEngagement < 2) {
        recommendations.push({
          type: 'engagement',
          platform,
          suggestion: `Consider adjusting content strategy for ${platform} - engagement is below average`,
          priority: 'high'
        });
      }
    }
    
    // Posting frequency
    if (report.summary.totalPosted < report.summary.totalScheduled * 0.9) {
      recommendations.push({
        type: 'reliability',
        suggestion: 'Posting success rate is below 90% - check API connections and error logs',
        priority: 'critical'
      });
    }
    
    // Content diversity
    recommendations.push({
      type: 'content',
      suggestion: 'Maintain content variety by rotating through all content types weekly',
      priority: 'medium'
    });
    
    return recommendations;
  }
}

module.exports = SocialMediaManager;