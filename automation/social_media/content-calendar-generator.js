/**
 * Content Calendar Generator
 * Creates optimized 30-day content plans with A/B testing variants
 */

const { DateTime } = require('luxon');
const fs = require('fs').promises;
const path = require('path');

class ContentCalendarGenerator {
  constructor(contentTemplates, brandGuidelines) {
    this.templates = contentTemplates;
    this.brandGuidelines = brandGuidelines;
    this.campaigns = {
      prelaunch: {
        duration: 30,
        intensity: 'high',
        platforms: ['all'],
        themes: ['countdown', 'features', 'benefits', 'testimonials']
      },
      launch: {
        duration: 7,
        intensity: 'maximum',
        platforms: ['all'],
        themes: ['announcement', 'offers', 'urgency', 'social_proof']
      },
      postlaunch: {
        duration: 14,
        intensity: 'medium',
        platforms: ['all'],
        themes: ['tutorials', 'success_stories', 'updates', 'community']
      },
      maintenance: {
        duration: 'ongoing',
        intensity: 'steady',
        platforms: ['all'],
        themes: ['tips', 'features', 'community', 'industry_news']
      }
    };
  }

  /**
   * Generate complete content calendar for campaign
   */
  async generateCampaignCalendar(campaignType, startDate, options = {}) {
    const campaign = this.campaigns[campaignType];
    if (!campaign) {
      throw new Error(`Unknown campaign type: ${campaignType}`);
    }

    const calendar = {
      campaign: campaignType,
      startDate: startDate.toISO(),
      endDate: startDate.plus({ days: campaign.duration }).toISO(),
      content: [],
      abTests: [],
      performance: {
        expectedReach: 0,
        expectedEngagement: 0,
        budget: 0
      }
    };

    // Generate daily content
    for (let day = 0; day < campaign.duration; day++) {
      const currentDate = startDate.plus({ days: day });
      const dayContent = await this.generateDayContent(
        currentDate,
        campaign,
        day,
        options
      );
      
      calendar.content.push(...dayContent);
    }

    // Create A/B test variations
    calendar.abTests = await this.generateABTestVariations(calendar.content);

    // Calculate performance projections
    calendar.performance = this.calculatePerformanceProjections(calendar);

    return calendar;
  }

  /**
   * Generate content for specific day
   */
  async generateDayContent(date, campaign, dayNumber, options) {
    const dayOfWeek = date.weekday;
    const content = [];

    // Determine content intensity for the day
    const postsPerDay = this.getPostsPerDay(campaign.intensity, dayOfWeek);
    
    // Generate posts for each time slot
    for (let postIndex = 0; postIndex < postsPerDay; postIndex++) {
      const timeSlot = this.getTimeSlot(postIndex, postsPerDay);
      const theme = this.selectTheme(campaign.themes, dayNumber, postIndex);
      
      const post = await this.createPost({
        date,
        timeSlot,
        theme,
        campaign: campaign,
        dayNumber,
        postIndex,
        options
      });
      
      content.push(post);
    }

    return content;
  }

  /**
   * Create individual post with all platform variations
   */
  async createPost(params) {
    const { date, timeSlot, theme, campaign, dayNumber, postIndex, options } = params;
    
    const post = {
      id: `post_${date.toISODate()}_${timeSlot}_${postIndex}`,
      date: date.toISO(),
      timeSlot,
      theme,
      status: 'draft',
      platforms: {},
      metrics: {
        priority: this.calculatePriority(theme, dayNumber, campaign),
        expectedReach: 0,
        expectedEngagement: 0
      }
    };

    // Generate content for each platform
    const platforms = campaign.platforms[0] === 'all' 
      ? ['instagram', 'twitter', 'facebook', 'linkedin'] 
      : campaign.platforms;

    for (const platform of platforms) {
      post.platforms[platform] = await this.generatePlatformContent({
        platform,
        theme,
        dayNumber,
        timeSlot,
        campaign: campaign.type,
        brandVoice: this.brandGuidelines.voice
      });
    }

    // Add cross-promotion elements
    if (options.crossPromote) {
      post.crossPromotion = this.addCrossPromotion(post, options.crossPromote);
    }

    return post;
  }

  /**
   * Generate platform-specific content
   */
  async generatePlatformContent(params) {
    const { platform, theme, dayNumber, timeSlot, campaign, brandVoice } = params;
    
    // Select appropriate template
    const templateKey = `${theme}_${platform}`;
    const template = this.templates[platform]?.[theme] || this.templates.generic[theme];
    
    if (!template) {
      throw new Error(`No template found for ${theme} on ${platform}`);
    }

    // Apply brand voice and campaign context
    const content = this.applyBrandVoice(template, brandVoice);
    const contextualizedContent = this.addCampaignContext(content, {
      dayNumber,
      campaign,
      urgency: this.calculateUrgency(campaign, dayNumber)
    });

    return {
      content: contextualizedContent.text,
      media: contextualizedContent.media,
      hashtags: this.generateHashtags(platform, theme, campaign),
      callToAction: this.generateCTA(theme, campaign, dayNumber),
      format: this.getOptimalFormat(platform, theme),
      characterCount: contextualizedContent.text.length,
      variables: this.extractVariables(contextualizedContent.text)
    };
  }

  /**
   * Generate A/B test variations
   */
  async generateABTestVariations(content) {
    const abTests = [];
    
    // Select posts for A/B testing (20% of content)
    const testCandidates = content
      .filter(post => post.metrics.priority >= 8)
      .slice(0, Math.ceil(content.length * 0.2));

    for (const post of testCandidates) {
      const variations = await this.createVariations(post);
      
      abTests.push({
        originalPostId: post.id,
        testId: `ab_${post.id}`,
        variations,
        metrics: {
          testDuration: 24, // hours
          minimumSampleSize: 1000,
          confidenceLevel: 0.95
        }
      });
    }

    return abTests;
  }

  /**
   * Create A/B test variations for a post
   */
  async createVariations(post) {
    const variations = [];
    const variationTypes = ['headline', 'cta', 'image', 'timing'];
    
    for (const type of variationTypes) {
      const variation = {
        id: `var_${post.id}_${type}`,
        type,
        changes: {}
      };

      switch (type) {
        case 'headline':
          // Test different headline approaches
          variation.changes = {
            emotional: this.createEmotionalHeadline(post),
            practical: this.createPracticalHeadline(post),
            question: this.createQuestionHeadline(post)
          };
          break;
          
        case 'cta':
          // Test different calls to action
          variation.changes = {
            urgent: 'Get Started Now - Limited Time!',
            benefit: 'Start Saving 10 Hours/Week',
            social: 'Join 10,000+ Creators'
          };
          break;
          
        case 'image':
          // Test different visual styles
          variation.changes = {
            screenshot: { type: 'product_screenshot', filter: 'none' },
            illustration: { type: 'custom_illustration', style: 'modern' },
            photo: { type: 'stock_photo', mood: 'professional' }
          };
          break;
          
        case 'timing':
          // Test different posting times
          variation.changes = {
            morning: '08:00',
            lunch: '12:30',
            evening: '18:00'
          };
          break;
      }

      variations.push(variation);
    }

    return variations;
  }

  /**
   * Apply brand voice to content
   */
  applyBrandVoice(template, brandVoice) {
    let content = template.content;
    
    // Apply personality traits
    if (brandVoice.personality.includes('friendly')) {
      content = content.replace(/\bHello\b/g, 'Hey there');
      content = content.replace(/\bThank you\b/g, 'Thanks so much');
    }
    
    if (brandVoice.personality.includes('professional')) {
      content = content.replace(/\bawesome\b/gi, 'excellent');
      content = content.replace(/\bsuper\b/gi, 'highly');
    }
    
    if (brandVoice.personality.includes('innovative')) {
      content = content.replace(/\btraditional\b/gi, 'cutting-edge');
      content = content.replace(/\bstandard\b/gi, 'next-generation');
    }

    // Apply tone adjustments
    const toneAdjustments = {
      casual: (text) => text.replace(/\./g, '!').toLowerCase(),
      formal: (text) => text.replace(/!/g, '.'),
      enthusiastic: (text) => text.toUpperCase() + ' 🎉',
      informative: (text) => `Did you know? ${text}`
    };

    if (toneAdjustments[brandVoice.tone]) {
      content = toneAdjustments[brandVoice.tone](content);
    }

    return { ...template, content };
  }

  /**
   * Add campaign-specific context
   */
  addCampaignContext(content, context) {
    const { dayNumber, campaign, urgency } = context;
    
    let contextualizedText = content.content;
    
    // Add countdown for prelaunch
    if (campaign === 'prelaunch') {
      const daysLeft = 30 - dayNumber;
      contextualizedText = contextualizedText.replace(
        '{{countdown}}',
        `${daysLeft} days until launch`
      );
    }
    
    // Add urgency markers
    if (urgency > 0.7) {
      contextualizedText += '\n\n⏰ Limited time offer!';
    }
    
    // Add social proof
    if (content.socialProof) {
      contextualizedText = contextualizedText.replace(
        '{{social_proof}}',
        content.socialProof[Math.floor(Math.random() * content.socialProof.length)]
      );
    }

    return {
      text: contextualizedText,
      media: content.media || null
    };
  }

  /**
   * Generate relevant hashtags
   */
  generateHashtags(platform, theme, campaign) {
    const hashtagLibrary = {
      base: ['#MarketingAutomation', '#CreatorTools', '#AppLaunch'],
      themes: {
        countdown: ['#ComingSoon', '#LaunchCountdown', '#GetReady'],
        features: ['#NewFeatures', '#ProductShowcase', '#Innovation'],
        benefits: ['#SaveTime', '#GrowYourBusiness', '#Efficiency'],
        testimonials: ['#CustomerSuccess', '#Reviews', '#HappyCustomers'],
        announcement: ['#LaunchDay', '#NowLive', '#Available'],
        offers: ['#LimitedOffer', '#LaunchSpecial', '#Discount'],
        tutorials: ['#HowTo', '#Tutorial', '#LearnWithUs'],
        tips: ['#MarketingTips', '#ProTip', '#TuesdayTips'],
        community: ['#Community', '#CreatorCommunity', '#TogetherWeGrow']
      },
      campaigns: {
        prelaunch: ['#PreLaunch', '#BetaAccess', '#EarlyBird'],
        launch: ['#Launch', '#GoLive', '#NewRelease'],
        postlaunch: ['#ThankYou', '#Milestone', '#Success']
      }
    };

    const platformLimits = {
      twitter: 5,
      instagram: 30,
      facebook: 10,
      linkedin: 5
    };

    const selectedHashtags = [
      ...hashtagLibrary.base.slice(0, 2),
      ...hashtagLibrary.themes[theme].slice(0, 2),
      ...hashtagLibrary.campaigns[campaign] || []
    ];

    return selectedHashtags.slice(0, platformLimits[platform] || 10);
  }

  /**
   * Calculate post priority
   */
  calculatePriority(theme, dayNumber, campaign) {
    let priority = 5; // Base priority
    
    // Theme importance
    const themeWeights = {
      announcement: 10,
      offers: 9,
      countdown: 7,
      features: 6,
      benefits: 6,
      testimonials: 5,
      tutorials: 4,
      tips: 3
    };
    
    priority = themeWeights[theme] || priority;
    
    // Adjust for campaign phase
    if (campaign.intensity === 'maximum') {
      priority = Math.min(10, priority + 2);
    }
    
    // Boost priority near launch
    if (campaign.type === 'prelaunch' && dayNumber > 25) {
      priority = Math.min(10, priority + 1);
    }
    
    return priority;
  }

  /**
   * Calculate urgency level
   */
  calculateUrgency(campaign, dayNumber) {
    if (campaign === 'prelaunch') {
      const daysLeft = 30 - dayNumber;
      if (daysLeft <= 3) return 0.9;
      if (daysLeft <= 7) return 0.7;
      if (daysLeft <= 14) return 0.5;
      return 0.3;
    }
    
    if (campaign === 'launch') {
      return 1.0; // Maximum urgency during launch
    }
    
    return 0.2; // Low urgency for maintenance
  }

  /**
   * Get optimal posting times
   */
  getTimeSlot(postIndex, totalPosts) {
    const timeSlots = {
      1: ['morning'],
      2: ['morning', 'evening'],
      3: ['morning', 'afternoon', 'evening'],
      4: ['morning', 'lunch', 'afternoon', 'evening']
    };
    
    const slots = timeSlots[totalPosts] || timeSlots[3];
    return slots[postIndex] || 'morning';
  }

  /**
   * Determine posts per day based on intensity
   */
  getPostsPerDay(intensity, dayOfWeek) {
    const intensityMap = {
      maximum: { weekday: 4, weekend: 3 },
      high: { weekday: 3, weekend: 2 },
      medium: { weekday: 2, weekend: 1 },
      steady: { weekday: 1, weekend: 1 }
    };
    
    const isWeekend = dayOfWeek === 6 || dayOfWeek === 7;
    const config = intensityMap[intensity] || intensityMap.medium;
    
    return isWeekend ? config.weekend : config.weekday;
  }

  /**
   * Select theme for the day
   */
  selectTheme(themes, dayNumber, postIndex) {
    // Rotate through themes with some intelligence
    const themeIndex = (dayNumber + postIndex) % themes.length;
    return themes[themeIndex];
  }

  /**
   * Generate call to action
   */
  generateCTA(theme, campaign, dayNumber) {
    const ctaLibrary = {
      prelaunch: {
        countdown: 'Join the waitlist',
        features: 'See all features',
        benefits: 'Start saving time',
        testimonials: 'Read more reviews'
      },
      launch: {
        announcement: 'Get started now',
        offers: 'Claim your discount',
        urgency: 'Limited time - Act now',
        social_proof: 'Join thousands of users'
      },
      postlaunch: {
        tutorials: 'Watch tutorial',
        success_stories: 'Share your story',
        updates: 'See what\'s new',
        community: 'Join our community'
      },
      maintenance: {
        tips: 'Learn more',
        features: 'Try it now',
        community: 'Connect with us',
        industry_news: 'Stay updated'
      }
    };

    return ctaLibrary[campaign]?.[theme] || 'Learn more';
  }

  /**
   * Get optimal content format for platform and theme
   */
  getOptimalFormat(platform, theme) {
    const formatMap = {
      instagram: {
        features: 'carousel',
        testimonials: 'story',
        tips: 'reel',
        default: 'post'
      },
      twitter: {
        tips: 'thread',
        announcement: 'tweet',
        default: 'tweet'
      },
      facebook: {
        tutorials: 'video',
        features: 'carousel',
        default: 'post'
      },
      linkedin: {
        industry_news: 'article',
        tips: 'post',
        default: 'post'
      }
    };

    return formatMap[platform]?.[theme] || formatMap[platform]?.default || 'post';
  }

  /**
   * Extract template variables for personalization
   */
  extractVariables(text) {
    const variablePattern = /\{\{(\w+)\}\}/g;
    const variables = [];
    let match;

    while ((match = variablePattern.exec(text)) !== null) {
      variables.push({
        name: match[1],
        placeholder: match[0],
        required: true
      });
    }

    return variables;
  }

  /**
   * Add cross-promotion elements
   */
  addCrossPromotion(post, crossPromoteConfig) {
    return {
      platforms: crossPromoteConfig.platforms || [],
      message: crossPromoteConfig.message || 'Check out our other platforms!',
      timing: crossPromoteConfig.timing || 'end',
      trackingLinks: this.generateTrackingLinks(post.id, crossPromoteConfig.platforms)
    };
  }

  /**
   * Generate tracking links for cross-promotion
   */
  generateTrackingLinks(postId, platforms) {
    const links = {};
    
    for (const platform of platforms) {
      links[platform] = {
        url: `https://hub.marketingautomation.com/redirect/${platform}?source=${postId}`,
        utm: {
          source: 'social',
          medium: platform,
          campaign: postId
        }
      };
    }

    return links;
  }

  /**
   * Calculate performance projections
   */
  calculatePerformanceProjections(calendar) {
    let totalReach = 0;
    let totalEngagement = 0;
    let estimatedBudget = 0;

    // Base metrics per platform (average estimates)
    const platformMetrics = {
      instagram: { reach: 1500, engagement: 0.05, cpm: 6.5 },
      twitter: { reach: 1000, engagement: 0.02, cpm: 5.0 },
      facebook: { reach: 2000, engagement: 0.03, cpm: 7.5 },
      linkedin: { reach: 800, engagement: 0.04, cpm: 8.0 }
    };

    for (const post of calendar.content) {
      for (const platform of Object.keys(post.platforms)) {
        const metrics = platformMetrics[platform];
        const priorityMultiplier = post.metrics.priority / 10;
        
        totalReach += metrics.reach * priorityMultiplier;
        totalEngagement += metrics.reach * metrics.engagement * priorityMultiplier;
        
        // Calculate budget for promoted posts (high priority only)
        if (post.metrics.priority >= 8) {
          estimatedBudget += (metrics.reach / 1000) * metrics.cpm;
        }
      }
    }

    return {
      expectedReach: Math.round(totalReach),
      expectedEngagement: Math.round(totalEngagement),
      budget: Math.round(estimatedBudget * 100) / 100,
      roi: Math.round((totalEngagement / estimatedBudget) * 100) / 100
    };
  }

  /**
   * Save calendar to file
   */
  async saveCalendar(calendar, outputPath) {
    const filename = `content-calendar-${calendar.campaign}-${DateTime.now().toISODate()}.json`;
    const filepath = path.join(outputPath, filename);
    
    await fs.writeFile(filepath, JSON.stringify(calendar, null, 2));
    
    // Also create a human-readable version
    const readableFilename = filename.replace('.json', '.md');
    const readableContent = this.generateReadableCalendar(calendar);
    await fs.writeFile(path.join(outputPath, readableFilename), readableContent);
    
    return {
      json: filepath,
      markdown: path.join(outputPath, readableFilename)
    };
  }

  /**
   * Generate human-readable calendar format
   */
  generateReadableCalendar(calendar) {
    let markdown = `# Content Calendar: ${calendar.campaign}\n\n`;
    markdown += `**Duration**: ${calendar.startDate} to ${calendar.endDate}\n`;
    markdown += `**Total Posts**: ${calendar.content.length}\n`;
    markdown += `**Expected Reach**: ${calendar.performance.expectedReach.toLocaleString()}\n`;
    markdown += `**Expected Engagement**: ${calendar.performance.expectedEngagement.toLocaleString()}\n`;
    markdown += `**Estimated Budget**: $${calendar.performance.budget}\n\n`;
    
    // Group by date
    const contentByDate = {};
    for (const post of calendar.content) {
      const date = post.date.split('T')[0];
      if (!contentByDate[date]) {
        contentByDate[date] = [];
      }
      contentByDate[date].push(post);
    }
    
    // Generate daily breakdown
    for (const [date, posts] of Object.entries(contentByDate)) {
      markdown += `## ${date}\n\n`;
      
      for (const post of posts) {
        markdown += `### ${post.timeSlot} - ${post.theme}\n`;
        markdown += `**Priority**: ${post.metrics.priority}/10\n`;
        markdown += `**Platforms**: ${Object.keys(post.platforms).join(', ')}\n`;
        
        // Show sample content from first platform
        const firstPlatform = Object.keys(post.platforms)[0];
        const content = post.platforms[firstPlatform];
        markdown += `**Sample Content**: ${content.content.substring(0, 100)}...\n`;
        markdown += `**Hashtags**: ${content.hashtags.join(' ')}\n`;
        markdown += `**CTA**: ${content.callToAction}\n\n`;
      }
    }
    
    // Add A/B tests section
    if (calendar.abTests.length > 0) {
      markdown += `## A/B Tests\n\n`;
      for (const test of calendar.abTests) {
        markdown += `### Test: ${test.testId}\n`;
        markdown += `**Original Post**: ${test.originalPostId}\n`;
        markdown += `**Variations**: ${test.variations.map(v => v.type).join(', ')}\n\n`;
      }
    }
    
    return markdown;
  }
}

module.exports = ContentCalendarGenerator;