/**
 * Smart Selector AI for Translation Decision Engine
 *
 * Intelligently determines which social media posts should be translated
 * based on content type, target audience, engagement potential, and ROI.
 *
 * Uses scoring algorithm to make data-driven translation decisions.
 *
 * @module automation/translation/smart-selector
 */

class SmartSelector {
  constructor(config = {}) {
    this.config = {
      translationThreshold: config.translationThreshold || 70, // Minimum score to translate
      confidenceThreshold: config.confidenceThreshold || 80, // Minimum confidence for auto-translate
      ...config
    };

    // Content type classification with translation scores
    this.contentTypes = {
      'product_launch': { score: 95, priority: 'high', reason: 'High-value announcement' },
      'promotion': { score: 90, priority: 'high', reason: 'Revenue-generating content' },
      'announcement': { score: 85, priority: 'high', reason: 'Important company news' },
      'tutorial': { score: 80, priority: 'medium', reason: 'Educational value' },
      'feature_highlight': { score: 75, priority: 'medium', reason: 'Product value communication' },
      'user_testimonial': { score: 70, priority: 'medium', reason: 'Social proof' },
      'engagement': { score: 60, priority: 'low', reason: 'Community building' },
      'news': { score: 50, priority: 'low', reason: 'Time-sensitive content' },
      'meme': { score: 20, priority: 'skip', reason: 'Culture-specific humor' },
      'retweet': { score: 30, priority: 'skip', reason: 'Third-party content' },
      'reply': { score: 25, priority: 'skip', reason: 'Conversational context' }
    };

    // Platform-specific translation weights
    this.platformWeights = {
      'instagram': 1.2,  // Visual content translates well
      'facebook': 1.15,  // Good reach in international markets
      'twitter': 0.9,    // Time-sensitive, fast-paced
      'linkedin': 1.1,   // Professional audience, good for B2B
      'tiktok': 1.0      // Global platform, mixed results
    };

    // Language-specific market potential
    this.marketPotential = {
      'ES': { weight: 1.3, regions: ['US', 'LATAM', 'Spain'], androidShare: 0.70 },
      'FR': { weight: 1.1, regions: ['France', 'Canada', 'Africa'], androidShare: 0.65 },
      'DE': { weight: 1.0, regions: ['Germany', 'Austria', 'Switzerland'], androidShare: 0.60 }
    };
  }

  /**
   * Analyze post and decide if it should be translated
   *
   * @param {Object} post - Post object with content and metadata
   * @param {Array<string>} targetLanguages - Target languages to consider
   * @returns {Object} Decision object with scores and recommendations
   */
  analyzePost(post, targetLanguages = ['ES', 'FR', 'DE']) {
    if (!post || !post.content) {
      throw new Error('Post object must contain content');
    }

    const analysis = {
      postId: post.id || 'unknown',
      contentType: this._classifyContent(post.content, post.type),
      platform: post.platform || 'unknown',
      shouldTranslate: false,
      recommendations: [],
      scores: {},
      reasoning: []
    };

    // Analyze for each target language
    for (const lang of targetLanguages) {
      const score = this._calculateTranslationScore(post, lang, analysis.contentType);
      analysis.scores[lang] = score;

      if (score.total >= this.config.translationThreshold) {
        analysis.recommendations.push({
          language: lang,
          score: score.total,
          confidence: score.confidence,
          action: score.confidence >= this.config.confidenceThreshold ? 'auto_translate' : 'review_needed',
          estimatedROI: this._estimateROI(post, lang, score.total)
        });
      }
    }

    // Set overall translation decision
    analysis.shouldTranslate = analysis.recommendations.length > 0;

    // Add reasoning
    if (analysis.shouldTranslate) {
      analysis.reasoning.push(`Content type "${analysis.contentType.name}" scores high for translation (${analysis.contentType.score}/100)`);
      analysis.reasoning.push(`Recommended for ${analysis.recommendations.length} language(s)`);
    } else {
      analysis.reasoning.push(`Content type "${analysis.contentType.name}" below translation threshold`);
      analysis.reasoning.push('Consider manual translation if strategically important');
    }

    return analysis;
  }

  /**
   * Batch analyze multiple posts
   *
   * @param {Array<Object>} posts - Array of post objects
   * @param {Array<string>} targetLanguages - Target languages
   * @returns {Array<Object>} Array of analysis results
   */
  analyzeBatch(posts, targetLanguages = ['ES', 'FR', 'DE']) {
    return posts.map(post => this.analyzePost(post, targetLanguages));
  }

  /**
   * Get translation priority queue
   *
   * @param {Array<Object>} analyses - Array of analysis results
   * @returns {Array<Object>} Sorted by translation priority
   */
  getPriorityQueue(analyses) {
    return analyses
      .filter(analysis => analysis.shouldTranslate)
      .sort((a, b) => {
        // Sort by highest average score across languages
        const avgScoreA = this._getAverageScore(a.scores);
        const avgScoreB = this._getAverageScore(b.scores);
        return avgScoreB - avgScoreA;
      });
  }

  /**
   * Classify content type from post content
   *
   * @private
   * @param {string} content - Post content text
   * @param {string} explicitType - Explicit type if provided
   * @returns {Object} Content type with score and metadata
   */
  _classifyContent(content, explicitType = null) {
    // If explicit type provided, use it
    if (explicitType && this.contentTypes[explicitType]) {
      return {
        name: explicitType,
        ...this.contentTypes[explicitType]
      };
    }

    const contentLower = content.toLowerCase();

    // Keyword-based classification
    const keywords = {
      'product_launch': ['launching', 'introducing', 'new release', 'now available', 'just launched'],
      'promotion': ['discount', 'sale', '% off', 'limited time', 'offer', 'deal', 'promo'],
      'announcement': ['announcing', 'excited to', 'we are pleased', 'important update'],
      'tutorial': ['how to', 'step by step', 'guide', 'tutorial', 'learn', 'tip'],
      'feature_highlight': ['feature', 'capability', 'now you can', 'check out'],
      'user_testimonial': ['review', 'testimonial', '"', 'customer says', 'love'],
      'engagement': ['what do you think', 'comment', 'share your', 'poll', 'question'],
      'news': ['breaking', 'update', 'just in', 'today'],
      'meme': ['lol', '😂', 'when you', 'me:', 'that feeling'],
      'retweet': ['RT @', 'via @'],
      'reply': ['@', 'thanks for', 'appreciate']
    };

    // Score each type based on keyword matches
    const typeScores = {};
    for (const [type, typeKeywords] of Object.entries(keywords)) {
      typeScores[type] = typeKeywords.filter(kw => contentLower.includes(kw)).length;
    }

    // Find best match
    const bestMatch = Object.entries(typeScores)
      .sort((a, b) => b[1] - a[1])[0];

    const matchedType = bestMatch[1] > 0 ? bestMatch[0] : 'engagement'; // Default to engagement

    return {
      name: matchedType,
      ...this.contentTypes[matchedType],
      matchConfidence: bestMatch[1] > 0 ? Math.min(100, bestMatch[1] * 30) : 50
    };
  }

  /**
   * Calculate translation score for specific language
   *
   * @private
   * @param {Object} post - Post object
   * @param {string} lang - Target language code
   * @param {Object} contentType - Classified content type
   * @returns {Object} Detailed score breakdown
   */
  _calculateTranslationScore(post, lang, contentType) {
    const score = {
      baseScore: contentType.score,
      adjustments: [],
      total: contentType.score,
      confidence: contentType.matchConfidence || 80
    };

    // Platform weight adjustment
    if (post.platform && this.platformWeights[post.platform]) {
      const platformAdjust = (this.platformWeights[post.platform] - 1) * 20;
      score.adjustments.push({
        factor: 'platform',
        value: platformAdjust,
        reason: `${post.platform} platform weight`
      });
      score.total += platformAdjust;
    }

    // Market potential adjustment
    if (this.marketPotential[lang]) {
      const marketAdjust = (this.marketPotential[lang].weight - 1) * 15;
      score.adjustments.push({
        factor: 'market',
        value: marketAdjust,
        reason: `${lang} market potential`
      });
      score.total += marketAdjust;
    }

    // Content length adjustment (very short or very long posts)
    if (post.content) {
      const length = post.content.length;
      if (length < 50) {
        score.adjustments.push({
          factor: 'length',
          value: -10,
          reason: 'Very short content'
        });
        score.total -= 10;
      } else if (length > 500) {
        score.adjustments.push({
          factor: 'length',
          value: -5,
          reason: 'Very long content (higher translation cost)'
        });
        score.total -= 5;
      }
    }

    // Has media adjustment (visual content translates better)
    if (post.hasMedia || post.imageUrl || post.videoUrl) {
      score.adjustments.push({
        factor: 'media',
        value: 10,
        reason: 'Visual content enhances translation value'
      });
      score.total += 10;
    }

    // Time-sensitivity penalty (breaking news, real-time)
    if (post.timeSensitive || contentType.name === 'news') {
      score.adjustments.push({
        factor: 'timeliness',
        value: -15,
        reason: 'Time-sensitive content loses value quickly'
      });
      score.total -= 15;
    }

    // Cultural sensitivity check
    const culturalRisk = this._assessCulturalRisk(post.content);
    if (culturalRisk > 0) {
      score.adjustments.push({
        factor: 'cultural_risk',
        value: -culturalRisk,
        reason: 'Content may need cultural adaptation'
      });
      score.total -= culturalRisk;
      score.confidence -= culturalRisk / 2; // Reduce confidence for culturally sensitive content
    }

    // Cap total score between 0-100
    score.total = Math.max(0, Math.min(100, score.total));
    score.confidence = Math.max(0, Math.min(100, score.confidence));

    return score;
  }

  /**
   * Assess cultural translation risk
   *
   * @private
   * @param {string} content - Post content
   * @returns {number} Risk score (0-30)
   */
  _assessCulturalRisk(content) {
    let risk = 0;

    const contentLower = content.toLowerCase();

    // Idioms and cultural references
    const idioms = ['piece of cake', 'break a leg', 'hit the nail', 'kick the bucket', 'spill the beans'];
    if (idioms.some(idiom => contentLower.includes(idiom))) {
      risk += 20;
    }

    // Slang and informal language
    const slang = ['gonna', 'wanna', 'gotta', 'kinda', 'sorta', 'yeah', 'nope', 'cool', 'awesome'];
    const slangCount = slang.filter(word => contentLower.includes(word)).length;
    risk += Math.min(15, slangCount * 5);

    // Pop culture references (harder to translate)
    const popCulture = ['netflix', 'spotify', 'tiktok trend', 'viral', 'meme'];
    if (popCulture.some(ref => contentLower.includes(ref))) {
      risk += 10;
    }

    return Math.min(30, risk); // Cap at 30
  }

  /**
   * Estimate ROI for translation
   *
   * @private
   * @param {Object} post - Post object
   * @param {string} lang - Target language
   * @param {number} score - Translation score
   * @returns {Object} ROI estimation
   */
  _estimateROI(post, lang, score) {
    const marketData = this.marketPotential[lang];

    // Estimated cost per translation (DeepL pricing ~$25/1M chars)
    const estimatedCost = (post.content.length / 1000000) * 25;

    // Estimated additional reach (based on market size and Android share)
    const baseReach = post.estimatedReach || 1000;
    const additionalReach = baseReach * marketData.androidShare * 0.3; // 30% of Android users in that market

    // Estimated engagement increase (based on score)
    const engagementMultiplier = 1 + (score / 200); // Higher scores = higher engagement

    return {
      estimatedCost: estimatedCost.toFixed(4),
      estimatedAdditionalReach: Math.round(additional Reach),
      estimatedEngagementIncrease: `${((engagementMultiplier - 1) * 100).toFixed(1)}%`,
      roiScore: score / estimatedCost, // Score per dollar
      breakEvenEngagement: Math.round(estimatedCost * 100) // Engagements needed to break even
    };
  }

  /**
   * Get average score across all languages
   *
   * @private
   * @param {Object} scores - Language scores object
   * @returns {number} Average score
   */
  _getAverageScore(scores) {
    const values = Object.values(scores).map(s => s.total);
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  /**
   * Generate translation recommendations report
   *
   * @param {Array<Object>} analyses - Array of analysis results
   * @returns {Object} Summary report
   */
  generateReport(analyses) {
    const report = {
      totalPosts: analyses.length,
      recommendedForTranslation: 0,
      autoTranslate: 0,
      reviewNeeded: 0,
      skip: 0,
      byLanguage: {},
      byContentType: {},
      estimatedCost: 0
    };

    for (const analysis of analyses) {
      if (analysis.shouldTranslate) {
        report.recommendedForTranslation++;

        for (const rec of analysis.recommendations) {
          // By language stats
          if (!report.byLanguage[rec.language]) {
            report.byLanguage[rec.language] = { count: 0, totalScore: 0 };
          }
          report.byLanguage[rec.language].count++;
          report.byLanguage[rec.language].totalScore += rec.score;

          // Action counts
          if (rec.action === 'auto_translate') {
            report.autoTranslate++;
          } else {
            report.reviewNeeded++;
          }

          // Cost estimation
          report.estimatedCost += parseFloat(rec.estimatedROI.estimatedCost);
        }
      } else {
        report.skip++;
      }

      // By content type
      const typeName = analysis.contentType.name;
      if (!report.byContentType[typeName]) {
        report.byContentType[typeName] = 0;
      }
      report.byContentType[typeName]++;
    }

    // Calculate averages
    for (const lang in report.byLanguage) {
      report.byLanguage[lang].avgScore =
        (report.byLanguage[lang].totalScore / report.byLanguage[lang].count).toFixed(1);
    }

    report.estimatedCost = `$${report.estimatedCost.toFixed(2)}`;

    return report;
  }
}

module.exports = { SmartSelector };
