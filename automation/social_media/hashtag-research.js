/**
 * Hashtag Research and Optimization System
 * Analyzes trending hashtags and optimizes for maximum reach
 */

const axios = require('axios');

class HashtagResearch {
  constructor(config) {
    this.config = config;
    this.hashtagDatabase = {
      core: {
        '#MarketingAutomation': { reach: 2500000, engagement: 0.045, competition: 'high' },
        '#CreatorEconomy': { reach: 1800000, engagement: 0.062, competition: 'medium' },
        '#IndieDevs': { reach: 950000, engagement: 0.081, competition: 'low' },
        '#AppMarketing': { reach: 1200000, engagement: 0.053, competition: 'medium' },
        '#StartupTools': { reach: 780000, engagement: 0.069, competition: 'low' }
      },
      trending: {},
      nicheBranded: {
        '#MarketingHubLaunch': { reach: 0, engagement: 0, competition: 'none' },
        '#AutomateYourMarketing': { reach: 0, engagement: 0, competition: 'none' },
        '#CreatorAutomation': { reach: 0, engagement: 0, competition: 'none' }
      }
    };
    this.platformStrategies = {
      instagram: {
        maxHashtags: 30,
        optimalCount: 25,
        mix: { high: 0.2, medium: 0.5, low: 0.3 }
      },
      twitter: {
        maxHashtags: 5,
        optimalCount: 3,
        mix: { high: 0.3, medium: 0.5, low: 0.2 }
      },
      facebook: {
        maxHashtags: 10,
        optimalCount: 5,
        mix: { high: 0.3, medium: 0.4, low: 0.3 }
      },
      linkedin: {
        maxHashtags: 5,
        optimalCount: 3,
        mix: { high: 0.5, medium: 0.3, low: 0.2 }
      }
    };
  }

  /**
   * Research and generate optimal hashtag set
   */
  async generateOptimalHashtags(platform, contentType, campaignPhase) {
    // Get platform strategy
    const strategy = this.platformStrategies[platform];
    
    // Refresh trending hashtags
    await this.updateTrendingHashtags(platform);
    
    // Generate hashtag mix
    const hashtagMix = await this.createHashtagMix({
      platform,
      contentType,
      campaignPhase,
      strategy
    });
    
    // Optimize for reach and engagement
    const optimizedSet = this.optimizeHashtagSet(hashtagMix, strategy);
    
    // Add rotation strategy
    const rotationStrategy = this.createRotationStrategy(optimizedSet);
    
    return {
      primary: optimizedSet.slice(0, strategy.optimalCount),
      alternatives: rotationStrategy,
      performance: this.calculateExpectedPerformance(optimizedSet),
      insights: this.generateInsights(optimizedSet, platform)
    };
  }

  /**
   * Update trending hashtags (simulated for now)
   */
  async updateTrendingHashtags(platform) {
    // In production, this would call real APIs
    const trendingTopics = {
      instagram: ['#MondayMotivation', '#TechTuesday', '#StartupLife', '#ProductivityHacks'],
      twitter: ['#BuildInPublic', '#100DaysOfCode', '#NoCode', '#SaaS'],
      facebook: ['#SmallBusiness', '#DigitalMarketing', '#Entrepreneurship', '#WorkFromHome'],
      linkedin: ['#MarketingStrategy', '#B2B', '#DigitalTransformation', '#Leadership']
    };
    
    const trending = trendingTopics[platform] || [];
    
    // Simulate API data
    for (const tag of trending) {
      this.hashtagDatabase.trending[tag] = {
        reach: Math.floor(Math.random() * 500000) + 100000,
        engagement: Math.random() * 0.05 + 0.03,
        competition: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
        trendingScore: Math.random() * 0.3 + 0.7
      };
    }
  }

  /**
   * Create optimal hashtag mix
   */
  async createHashtagMix(params) {
    const { platform, contentType, campaignPhase, strategy } = params;
    
    const hashtagPool = {
      high: [],
      medium: [],
      low: []
    };
    
    // Categorize all available hashtags
    const allHashtags = {
      ...this.hashtagDatabase.core,
      ...this.hashtagDatabase.trending,
      ...this.hashtagDatabase.nicheBranded
    };
    
    for (const [tag, data] of Object.entries(allHashtags)) {
      if (this.isRelevant(tag, contentType, campaignPhase)) {
        hashtagPool[data.competition].push({ tag, ...data });
      }
    }
    
    // Build mix according to strategy
    const mix = [];
    
    for (const [competition, percentage] of Object.entries(strategy.mix)) {
      const count = Math.ceil(strategy.optimalCount * percentage);
      const selected = this.selectBestHashtags(hashtagPool[competition], count);
      mix.push(...selected);
    }
    
    // Add content-specific hashtags
    const contentHashtags = this.getContentSpecificHashtags(contentType, campaignPhase);
    mix.push(...contentHashtags);
    
    return mix;
  }

  /**
   * Check if hashtag is relevant
   */
  isRelevant(hashtag, contentType, campaignPhase) {
    const relevanceMap = {
      motivation: ['motivation', 'monday', 'inspire', 'success'],
      tutorial: ['howto', 'tutorial', 'learn', 'tips'],
      feature: ['feature', 'product', 'update', 'new'],
      announcement: ['launch', 'announce', 'new', 'available'],
      community: ['community', 'together', 'share', 'connect']
    };
    
    const phaseMap = {
      prelaunch: ['coming', 'soon', 'launch', 'beta'],
      launch: ['launch', 'new', 'available', 'live'],
      postlaunch: ['success', 'milestone', 'thank', 'growth']
    };
    
    const tagLower = hashtag.toLowerCase();
    
    // Check content type relevance
    const contentKeywords = relevanceMap[contentType] || [];
    const hasContentRelevance = contentKeywords.some(keyword => 
      tagLower.includes(keyword)
    );
    
    // Check phase relevance
    const phaseKeywords = phaseMap[campaignPhase] || [];
    const hasPhaseRelevance = phaseKeywords.some(keyword => 
      tagLower.includes(keyword)
    );
    
    // Always include branded and core hashtags
    const isBranded = Object.keys(this.hashtagDatabase.nicheBranded).includes(hashtag);
    const isCore = Object.keys(this.hashtagDatabase.core).includes(hashtag);
    
    return hasContentRelevance || hasPhaseRelevance || isBranded || isCore;
  }

  /**
   * Select best hashtags from pool
   */
  selectBestHashtags(pool, count) {
    if (!pool || pool.length === 0) return [];
    
    // Sort by engagement rate and trending score
    const sorted = pool.sort((a, b) => {
      const scoreA = a.engagement + (a.trendingScore || 0);
      const scoreB = b.engagement + (b.trendingScore || 0);
      return scoreB - scoreA;
    });
    
    return sorted.slice(0, count);
  }

  /**
   * Get content-specific hashtags
   */
  getContentSpecificHashtags(contentType, campaignPhase) {
    const contentHashtags = {
      motivation: [
        { tag: '#MondayMotivation', reach: 3500000, engagement: 0.048, competition: 'high' },
        { tag: '#MotivationMonday', reach: 2800000, engagement: 0.052, competition: 'high' }
      ],
      tutorial: [
        { tag: '#HowTo', reach: 2100000, engagement: 0.041, competition: 'medium' },
        { tag: '#Tutorial', reach: 1900000, engagement: 0.039, competition: 'medium' }
      ],
      feature: [
        { tag: '#NewFeature', reach: 450000, engagement: 0.065, competition: 'low' },
        { tag: '#ProductUpdate', reach: 380000, engagement: 0.072, competition: 'low' }
      ],
      announcement: [
        { tag: '#LaunchDay', reach: 680000, engagement: 0.089, competition: 'medium' },
        { tag: '#NewRelease', reach: 520000, engagement: 0.076, competition: 'medium' }
      ],
      community: [
        { tag: '#CommunityLove', reach: 890000, engagement: 0.093, competition: 'low' },
        { tag: '#TogetherWeCan', reach: 760000, engagement: 0.087, competition: 'low' }
      ]
    };
    
    const phaseHashtags = {
      prelaunch: [
        { tag: '#ComingSoon', reach: 1200000, engagement: 0.058, competition: 'medium' },
        { tag: '#SneakPeek', reach: 950000, engagement: 0.071, competition: 'low' }
      ],
      launch: [
        { tag: '#LaunchWeek', reach: 420000, engagement: 0.095, competition: 'low' },
        { tag: '#NowAvailable', reach: 580000, engagement: 0.082, competition: 'medium' }
      ],
      postlaunch: [
        { tag: '#ThankYou', reach: 2800000, engagement: 0.036, competition: 'high' },
        { tag: '#Milestone', reach: 1100000, engagement: 0.064, competition: 'medium' }
      ]
    };
    
    return [
      ...(contentHashtags[contentType] || []),
      ...(phaseHashtags[campaignPhase] || [])
    ];
  }

  /**
   * Optimize hashtag set for maximum performance
   */
  optimizeHashtagSet(hashtagMix, strategy) {
    // Remove duplicates
    const unique = Array.from(new Map(
      hashtagMix.map(item => [item.tag, item])
    ).values());
    
    // Balance reach and engagement
    const scored = unique.map(hashtag => ({
      ...hashtag,
      score: this.calculateHashtagScore(hashtag)
    }));
    
    // Sort by score and limit to optimal count
    const optimized = scored
      .sort((a, b) => b.score - a.score)
      .slice(0, strategy.optimalCount);
    
    // Ensure at least one branded hashtag
    const hasBranded = optimized.some(h => 
      Object.keys(this.hashtagDatabase.nicheBranded).includes(h.tag)
    );
    
    if (!hasBranded) {
      const brandedOptions = Object.entries(this.hashtagDatabase.nicheBranded);
      if (brandedOptions.length > 0) {
        optimized[optimized.length - 1] = {
          tag: brandedOptions[0][0],
          ...brandedOptions[0][1],
          score: 0.8 // High score for branded
        };
      }
    }
    
    return optimized;
  }

  /**
   * Calculate hashtag performance score
   */
  calculateHashtagScore(hashtag) {
    // Weighted scoring algorithm
    const weights = {
      reach: 0.3,
      engagement: 0.4,
      competition: 0.2,
      trending: 0.1
    };
    
    // Normalize reach (0-1 scale)
    const normalizedReach = Math.min(hashtag.reach / 5000000, 1);
    
    // Competition score (inverse)
    const competitionScore = {
      low: 1.0,
      medium: 0.5,
      high: 0.2,
      none: 0.8
    }[hashtag.competition] || 0.5;
    
    // Calculate weighted score
    const score = 
      normalizedReach * weights.reach +
      hashtag.engagement * 10 * weights.engagement +
      competitionScore * weights.competition +
      (hashtag.trendingScore || 0) * weights.trending;
    
    return score;
  }

  /**
   * Create rotation strategy for hashtag variety
   */
  createRotationStrategy(primarySet) {
    const alternatives = [];
    
    // Create 3 alternative sets with slight variations
    for (let i = 0; i < 3; i++) {
      const altSet = [...primarySet];
      
      // Replace 20% of hashtags with alternatives
      const replaceCount = Math.ceil(altSet.length * 0.2);
      const indicesToReplace = this.getRandomIndices(altSet.length, replaceCount);
      
      for (const index of indicesToReplace) {
        const currentTag = altSet[index];
        const alternative = this.findAlternativeHashtag(currentTag);
        if (alternative) {
          altSet[index] = alternative;
        }
      }
      
      alternatives.push(altSet);
    }
    
    return alternatives;
  }

  /**
   * Find alternative hashtag
   */
  findAlternativeHashtag(hashtag) {
    // Find similar hashtags based on keywords
    const keywords = hashtag.tag.toLowerCase()
      .replace('#', '')
      .split(/(?=[A-Z])/)
      .join(' ')
      .split(' ')
      .filter(word => word.length > 3);
    
    const allHashtags = {
      ...this.hashtagDatabase.core,
      ...this.hashtagDatabase.trending
    };
    
    const alternatives = Object.entries(allHashtags)
      .filter(([tag, data]) => {
        if (tag === hashtag.tag) return false;
        const tagLower = tag.toLowerCase();
        return keywords.some(keyword => tagLower.includes(keyword));
      })
      .map(([tag, data]) => ({ tag, ...data }));
    
    if (alternatives.length > 0) {
      // Return random alternative
      return alternatives[Math.floor(Math.random() * alternatives.length)];
    }
    
    return null;
  }

  /**
   * Get random indices
   */
  getRandomIndices(length, count) {
    const indices = [];
    while (indices.length < count) {
      const index = Math.floor(Math.random() * length);
      if (!indices.includes(index)) {
        indices.push(index);
      }
    }
    return indices;
  }

  /**
   * Calculate expected performance
   */
  calculateExpectedPerformance(hashtagSet) {
    const totalReach = hashtagSet.reduce((sum, h) => sum + h.reach, 0);
    const avgEngagement = hashtagSet.reduce((sum, h) => sum + h.engagement, 0) / hashtagSet.length;
    
    // Competition factor
    const competitionFactors = {
      low: 1.2,
      medium: 1.0,
      high: 0.8,
      none: 1.1
    };
    
    const avgCompetitionFactor = hashtagSet.reduce((sum, h) => 
      sum + (competitionFactors[h.competition] || 1.0), 0
    ) / hashtagSet.length;
    
    return {
      estimatedReach: Math.round(totalReach * avgCompetitionFactor * 0.1), // 10% of total hashtag reach
      estimatedEngagement: Math.round(totalReach * avgEngagement * avgCompetitionFactor * 0.1),
      engagementRate: (avgEngagement * 100).toFixed(2) + '%',
      competitionLevel: this.getAverageCompetition(hashtagSet)
    };
  }

  /**
   * Get average competition level
   */
  getAverageCompetition(hashtagSet) {
    const competitionScores = {
      low: 1,
      medium: 2,
      high: 3,
      none: 0
    };
    
    const avgScore = hashtagSet.reduce((sum, h) => 
      sum + (competitionScores[h.competition] || 2), 0
    ) / hashtagSet.length;
    
    if (avgScore < 1) return 'low';
    if (avgScore < 2) return 'medium';
    return 'high';
  }

  /**
   * Generate insights and recommendations
   */
  generateInsights(hashtagSet, platform) {
    const insights = [];
    
    // Check reach distribution
    const totalReach = hashtagSet.reduce((sum, h) => sum + h.reach, 0);
    const avgReach = totalReach / hashtagSet.length;
    
    if (avgReach > 2000000) {
      insights.push({
        type: 'reach',
        message: 'High-reach hashtag mix - great for awareness campaigns',
        recommendation: 'Consider adding more niche hashtags for targeted engagement'
      });
    } else if (avgReach < 500000) {
      insights.push({
        type: 'reach',
        message: 'Niche hashtag focus - excellent for targeted audiences',
        recommendation: 'Mix in 1-2 high-reach hashtags for broader visibility'
      });
    }
    
    // Check engagement rates
    const avgEngagement = hashtagSet.reduce((sum, h) => sum + h.engagement, 0) / hashtagSet.length;
    
    if (avgEngagement > 0.07) {
      insights.push({
        type: 'engagement',
        message: 'High engagement potential detected',
        recommendation: 'This mix should drive strong interaction rates'
      });
    }
    
    // Platform-specific insights
    const platformInsights = {
      instagram: 'Use all 30 hashtags for maximum reach on Instagram',
      twitter: 'Keep hashtags concise and memorable on Twitter',
      facebook: 'Facebook users respond better to 3-5 strategic hashtags',
      linkedin: 'Professional hashtags perform best on LinkedIn'
    };
    
    insights.push({
      type: 'platform',
      message: platformInsights[platform],
      recommendation: `Currently using ${hashtagSet.length} hashtags`
    });
    
    // Branded hashtag insight
    const brandedCount = hashtagSet.filter(h => 
      Object.keys(this.hashtagDatabase.nicheBranded).includes(h.tag)
    ).length;
    
    if (brandedCount === 0) {
      insights.push({
        type: 'branding',
        message: 'No branded hashtags detected',
        recommendation: 'Add your campaign hashtag for brand building'
      });
    }
    
    return insights;
  }

  /**
   * Track hashtag performance over time
   */
  async trackHashtagPerformance(usedHashtags, actualMetrics) {
    // Update hashtag database with real performance data
    for (const hashtag of usedHashtags) {
      if (this.hashtagDatabase.core[hashtag] || this.hashtagDatabase.trending[hashtag]) {
        const currentData = this.hashtagDatabase.core[hashtag] || this.hashtagDatabase.trending[hashtag];
        
        // Apply weighted average with new data
        const weight = 0.1; // Give 10% weight to new data
        currentData.engagement = currentData.engagement * (1 - weight) + actualMetrics.engagementRate * weight;
        
        // Track performance history
        if (!currentData.history) {
          currentData.history = [];
        }
        
        currentData.history.push({
          date: new Date().toISOString(),
          reach: actualMetrics.reach,
          engagement: actualMetrics.engagementRate,
          platform: actualMetrics.platform
        });
        
        // Keep only last 30 days of history
        if (currentData.history.length > 30) {
          currentData.history.shift();
        }
      }
    }
  }

  /**
   * Generate hashtag performance report
   */
  generatePerformanceReport() {
    const report = {
      topPerforming: [],
      trending: [],
      declining: [],
      recommendations: []
    };
    
    // Analyze all tracked hashtags
    const allHashtags = {
      ...this.hashtagDatabase.core,
      ...this.hashtagDatabase.trending
    };
    
    // Find top performing
    report.topPerforming = Object.entries(allHashtags)
      .filter(([tag, data]) => data.history && data.history.length > 5)
      .map(([tag, data]) => ({
        tag,
        avgEngagement: data.engagement,
        uses: data.history.length,
        trend: this.calculateTrend(data.history)
      }))
      .sort((a, b) => b.avgEngagement - a.avgEngagement)
      .slice(0, 10);
    
    // Find trending up
    report.trending = report.topPerforming
      .filter(h => h.trend > 0.1)
      .slice(0, 5);
    
    // Find declining
    report.declining = report.topPerforming
      .filter(h => h.trend < -0.1)
      .slice(0, 5);
    
    // Generate recommendations
    if (report.trending.length > 0) {
      report.recommendations.push(
        `Focus on trending hashtags: ${report.trending.map(h => h.tag).join(', ')}`
      );
    }
    
    if (report.declining.length > 0) {
      report.recommendations.push(
        `Consider replacing declining hashtags: ${report.declining.map(h => h.tag).join(', ')}`
      );
    }
    
    return report;
  }

  /**
   * Calculate trend from history
   */
  calculateTrend(history) {
    if (history.length < 2) return 0;
    
    const recent = history.slice(-5);
    const older = history.slice(-10, -5);
    
    const recentAvg = recent.reduce((sum, h) => sum + h.engagement, 0) / recent.length;
    const olderAvg = older.reduce((sum, h) => sum + h.engagement, 0) / older.length || recentAvg;
    
    return (recentAvg - olderAvg) / olderAvg;
  }
}

module.exports = HashtagResearch;