// Dynamic Pricing Engine - Real-time price optimization
// Agent C - Phase 3: Advanced Revenue Optimization Systems

const winston = require('winston');
const moment = require('moment');

/**
 * Dynamic Pricing Engine
 * Real-time price optimization based on demand, user segments, and market conditions
 * 
 * Key Features:
 * - Real-time demand-based pricing
 * - User segment pricing optimization
 * - A/B testing for price points
 * - Market condition adjustments
 * - Revenue maximization algorithms
 */
class DynamicPricingEngine {
  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: 'logs/pricing-engine.log' }),
        new winston.transports.Console()
      ]
    });

    // Base pricing configuration
    this.basePrices = {
      starter_bundle: {
        base: 199,
        min: 99,
        max: 399,
        currency: 'USD'
      },
      pro_bundle: {
        base: 499,
        min: 299,
        max: 799,
        currency: 'USD'
      },
      enterprise_bundle: {
        base: 999,
        min: 699,
        max: 1499,
        currency: 'USD'
      }
    };

    // User segments for targeted pricing
    this.userSegments = {
      price_sensitive: {
        multiplier: 0.8,
        maxDiscount: 0.6,
        triggers: ['mobile_only', 'developing_country', 'student_email']
      },
      value_seekers: {
        multiplier: 0.9,
        maxDiscount: 0.8,
        triggers: ['comparison_shopping', 'abandoned_cart', 'return_visitor']
      },
      premium_buyers: {
        multiplier: 1.2,
        maxDiscount: 0.95,
        triggers: ['enterprise_email', 'high_engagement', 'quick_decision']
      },
      enterprise_clients: {
        multiplier: 1.5,
        maxDiscount: 1.1,
        triggers: ['large_team', 'enterprise_features', 'custom_requirements']
      }
    };

    // Market conditions that affect pricing
    this.marketConditions = {
      high_demand: { multiplier: 1.15, threshold: 0.8 },
      normal_demand: { multiplier: 1.0, threshold: 0.5 },
      low_demand: { multiplier: 0.85, threshold: 0.2 },
      flash_sale: { multiplier: 0.7, duration: 24 * 60 * 60 * 1000 }, // 24 hours
      launch_promo: { multiplier: 0.8, duration: 7 * 24 * 60 * 60 * 1000 } // 7 days
    };

    // A/B testing configurations
    this.priceTests = new Map();
    this.testResults = new Map();

    // Pricing cache for performance
    this.pricingCache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes

    // Initialize pricing analytics
    this.pricingAnalytics = {
      conversionRates: new Map(),
      revenueByPrice: new Map(),
      segmentPerformance: new Map(),
      demandMetrics: {
        hourly: new Array(24).fill(0),
        daily: new Array(7).fill(0),
        monthly: new Array(12).fill(0)
      }
    };

    this.startPricingEngine();
  }

  /**
   * Start the pricing engine
   */
  startPricingEngine() {
    this.logger.info('Dynamic Pricing Engine starting...');

    // Update demand metrics every 5 minutes
    setInterval(() => {
      this.updateDemandMetrics();
    }, 5 * 60 * 1000);

    // Clear pricing cache every hour
    setInterval(() => {
      this.pricingCache.clear();
      this.logger.info('Pricing cache cleared');
    }, 60 * 60 * 1000);

    // Generate pricing reports daily
    setInterval(() => {
      this.generateDailyPricingReport();
    }, 24 * 60 * 60 * 1000);

    this.logger.info('Dynamic Pricing Engine started successfully');
  }

  /**
   * Get optimized price for a product and user
   * @param {string} productId - Product identifier
   * @param {Object} userContext - User context and behavioral data
   * @param {Object} marketContext - Current market conditions
   * @returns {Object} Optimized pricing information
   */
  async getOptimizedPrice(productId, userContext = {}, marketContext = {}) {
    try {
      // Check cache first
      const cacheKey = this.generateCacheKey(productId, userContext, marketContext);
      const cached = this.pricingCache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.pricing;
      }

      // Calculate base price
      const basePrice = this.basePrices[productId];
      if (!basePrice) {
        throw new Error(`Product ${productId} not found in pricing configuration`);
      }

      // Determine user segment
      const userSegment = this.determineUserSegment(userContext);
      
      // Calculate demand-based pricing
      const demandMultiplier = this.calculateDemandMultiplier(productId, marketContext);
      
      // Apply market conditions
      const marketMultiplier = this.calculateMarketMultiplier(marketContext);
      
      // Check for active A/B tests
      const testPrice = await this.getTestPrice(productId, userContext);
      
      // Calculate final price
      let finalPrice = basePrice.base;
      
      if (testPrice) {
        finalPrice = testPrice;
      } else {
        finalPrice = Math.round(
          basePrice.base * 
          userSegment.multiplier * 
          demandMultiplier * 
          marketMultiplier
        );
      }

      // Ensure price stays within bounds
      finalPrice = Math.max(basePrice.min, Math.min(basePrice.max, finalPrice));

      // Calculate discount percentage
      const discountPercent = Math.round(((basePrice.base - finalPrice) / basePrice.base) * 100);

      const pricingResult = {
        productId,
        originalPrice: basePrice.base,
        optimizedPrice: finalPrice,
        discountPercent: discountPercent > 0 ? discountPercent : 0,
        currency: basePrice.currency,
        userSegment: userSegment.name || 'default',
        factors: {
          userSegment: userSegment.multiplier,
          demand: demandMultiplier,
          market: marketMultiplier,
          testGroup: testPrice ? 'test' : 'control'
        },
        timestamp: new Date().toISOString(),
        expiresAt: new Date(Date.now() + this.cacheTimeout).toISOString()
      };

      // Cache the result
      this.pricingCache.set(cacheKey, {
        pricing: pricingResult,
        timestamp: Date.now()
      });

      // Track pricing analytics
      this.trackPricingAnalytics(pricingResult, userContext);

      this.logger.info('Price optimized', {
        productId,
        originalPrice: basePrice.base,
        optimizedPrice: finalPrice,
        userSegment: userSegment.name,
        discountPercent
      });

      return pricingResult;

    } catch (error) {
      this.logger.error('Error optimizing price:', error);
      
      // Fallback to base price
      const basePrice = this.basePrices[productId];
      return {
        productId,
        optimizedPrice: basePrice?.base || 199,
        currency: basePrice?.currency || 'USD',
        error: 'Fallback pricing used',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Determine user segment based on context
   * @param {Object} userContext - User behavioral and demographic data
   * @returns {Object} User segment information
   */
  determineUserSegment(userContext) {
    const {
      email = '',
      country = '',
      device = '',
      behaviorFlags = [],
      visitCount = 1,
      timeOnSite = 0,
      referrer = ''
    } = userContext;

    // Check for segment triggers
    for (const [segmentName, segment] of Object.entries(this.userSegments)) {
      const triggerMatch = segment.triggers.some(trigger => {
        switch (trigger) {
          case 'mobile_only':
            return device === 'mobile';
          case 'developing_country':
            return ['IN', 'BR', 'MX', 'ID', 'PH'].includes(country);
          case 'student_email':
            return email.includes('.edu') || email.includes('student');
          case 'comparison_shopping':
            return referrer.includes('compare') || behaviorFlags.includes('comparison');
          case 'abandoned_cart':
            return behaviorFlags.includes('abandoned_cart');
          case 'return_visitor':
            return visitCount > 1;
          case 'enterprise_email':
            return email.includes('@') && !email.includes('gmail') && !email.includes('yahoo');
          case 'high_engagement':
            return timeOnSite > 300; // 5 minutes
          case 'quick_decision':
            return timeOnSite < 120 && behaviorFlags.includes('direct_purchase');
          case 'large_team':
            return behaviorFlags.includes('team_size_large');
          case 'enterprise_features':
            return behaviorFlags.includes('enterprise_interest');
          case 'custom_requirements':
            return behaviorFlags.includes('custom_needs');
          default:
            return false;
        }
      });

      if (triggerMatch) {
        return { name: segmentName, ...segment };
      }
    }

    // Default segment
    return { name: 'default', multiplier: 1.0, maxDiscount: 0.9 };
  }

  /**
   * Calculate demand-based pricing multiplier
   * @param {string} productId - Product identifier
   * @param {Object} marketContext - Market conditions
   * @returns {number} Demand multiplier
   */
  calculateDemandMultiplier(productId, marketContext) {
    const currentHour = new Date().getHours();
    const currentDay = new Date().getDay();
    
    // Base demand from analytics
    const hourlyDemand = this.pricingAnalytics.demandMetrics.hourly[currentHour] || 0;
    const dailyDemand = this.pricingAnalytics.demandMetrics.daily[currentDay] || 0;
    
    // Normalize demand (0-1 scale)
    const maxHourlyDemand = Math.max(...this.pricingAnalytics.demandMetrics.hourly);
    const maxDailyDemand = Math.max(...this.pricingAnalytics.demandMetrics.daily);
    
    const normalizedHourly = maxHourlyDemand > 0 ? hourlyDemand / maxHourlyDemand : 0.5;
    const normalizedDaily = maxDailyDemand > 0 ? dailyDemand / maxDailyDemand : 0.5;
    
    // Combine demand signals
    const combinedDemand = (normalizedHourly * 0.6) + (normalizedDaily * 0.4);
    
    // Apply demand-based multiplier
    if (combinedDemand > 0.8) {
      return 1.1; // High demand, increase price
    } else if (combinedDemand > 0.6) {
      return 1.05; // Medium-high demand
    } else if (combinedDemand > 0.4) {
      return 1.0; // Normal demand
    } else if (combinedDemand > 0.2) {
      return 0.95; // Low demand, slight decrease
    } else {
      return 0.9; // Very low demand, decrease price
    }
  }

  /**
   * Calculate market condition multiplier
   * @param {Object} marketContext - Current market conditions
   * @returns {number} Market multiplier
   */
  calculateMarketMultiplier(marketContext) {
    const {
      seasonality = 'normal',
      competitorPricing = 'unknown',
      economicIndicators = 'stable',
      specialEvents = []
    } = marketContext;

    let multiplier = 1.0;

    // Seasonality adjustments
    switch (seasonality) {
      case 'high_season':
        multiplier *= 1.1;
        break;
      case 'low_season':
        multiplier *= 0.9;
        break;
      case 'holiday':
        multiplier *= 1.05;
        break;
    }

    // Competitor pricing adjustments
    switch (competitorPricing) {
      case 'higher':
        multiplier *= 1.08;
        break;
      case 'lower':
        multiplier *= 0.95;
        break;
      case 'similar':
        multiplier *= 1.0;
        break;
    }

    // Economic indicators
    switch (economicIndicators) {
      case 'recession':
        multiplier *= 0.85;
        break;
      case 'growth':
        multiplier *= 1.1;
        break;
      case 'volatile':
        multiplier *= 0.95;
        break;
    }

    // Special events
    if (specialEvents.includes('product_launch')) {
      multiplier *= 0.9; // Launch discount
    }
    if (specialEvents.includes('competitor_launch')) {
      multiplier *= 0.95; // Competitive response
    }
    if (specialEvents.includes('market_expansion')) {
      multiplier *= 1.05; // Market expansion premium
    }

    return multiplier;
  }

  /**
   * Get test price if user is in A/B test
   * @param {string} productId - Product identifier
   * @param {Object} userContext - User context
   * @returns {number|null} Test price or null
   */
  async getTestPrice(productId, userContext) {
    const activeTests = this.priceTests.get(productId);
    if (!activeTests || activeTests.length === 0) {
      return null;
    }

    // Determine test group based on user ID or session
    const userId = userContext.userId || userContext.sessionId || 'anonymous';
    const hash = this.hashString(userId + productId);
    const testIndex = hash % activeTests.length;
    
    const test = activeTests[testIndex];
    
    // Check if test is still active
    if (test.endDate && new Date() > new Date(test.endDate)) {
      return null;
    }

    // Track test participation
    if (!this.testResults.has(test.id)) {
      this.testResults.set(test.id, {
        participants: 0,
        conversions: 0,
        revenue: 0,
        startDate: test.startDate
      });
    }

    const testData = this.testResults.get(test.id);
    testData.participants++;

    return test.price;
  }

  /**
   * Start A/B price test
   * @param {Object} testConfig - Test configuration
   * @returns {string} Test ID
   */
  startPriceTest(testConfig) {
    const {
      productId,
      testPrices,
      duration = 7, // days
      name = 'Price Test',
      description = ''
    } = testConfig;

    const testId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + (duration * 24 * 60 * 60 * 1000));

    const tests = testPrices.map((price, index) => ({
      id: `${testId}_variant_${index}`,
      price,
      weight: 1 / testPrices.length,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    }));

    if (!this.priceTests.has(productId)) {
      this.priceTests.set(productId, []);
    }

    this.priceTests.get(productId).push(...tests);

    this.logger.info('Price test started', {
      testId,
      productId,
      testPrices,
      duration,
      name
    });

    return testId;
  }

  /**
   * Record conversion for pricing analytics
   * @param {Object} conversionData - Conversion data
   */
  recordConversion(conversionData) {
    const {
      productId,
      price,
      userSegment,
      testId = null,
      revenue,
      timestamp = new Date().toISOString()
    } = conversionData;

    // Update conversion rates
    const segmentKey = `${productId}_${userSegment}`;
    if (!this.pricingAnalytics.conversionRates.has(segmentKey)) {
      this.pricingAnalytics.conversionRates.set(segmentKey, {
        conversions: 0,
        views: 0,
        rate: 0
      });
    }

    const conversionData_segment = this.pricingAnalytics.conversionRates.get(segmentKey);
    conversionData_segment.conversions++;
    conversionData_segment.rate = conversionData_segment.conversions / Math.max(conversionData_segment.views, 1);

    // Update revenue by price
    const priceKey = `${productId}_${price}`;
    if (!this.pricingAnalytics.revenueByPrice.has(priceKey)) {
      this.pricingAnalytics.revenueByPrice.set(priceKey, {
        revenue: 0,
        conversions: 0,
        avgRevenue: 0
      });
    }

    const revenueData = this.pricingAnalytics.revenueByPrice.get(priceKey);
    revenueData.revenue += revenue;
    revenueData.conversions++;
    revenueData.avgRevenue = revenueData.revenue / revenueData.conversions;

    // Update test results if applicable
    if (testId && this.testResults.has(testId)) {
      const testData = this.testResults.get(testId);
      testData.conversions++;
      testData.revenue += revenue;
    }

    this.logger.info('Conversion recorded', {
      productId,
      price,
      userSegment,
      revenue,
      testId
    });
  }

  /**
   * Update demand metrics
   */
  updateDemandMetrics() {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    const month = now.getMonth();

    // Simulate demand updates (in real implementation, this would come from actual data)
    this.pricingAnalytics.demandMetrics.hourly[hour] += Math.random() * 10;
    this.pricingAnalytics.demandMetrics.daily[day] += Math.random() * 50;
    this.pricingAnalytics.demandMetrics.monthly[month] += Math.random() * 1000;

    // Decay old metrics to maintain relevance
    this.pricingAnalytics.demandMetrics.hourly = this.pricingAnalytics.demandMetrics.hourly.map(val => val * 0.95);
    this.pricingAnalytics.demandMetrics.daily = this.pricingAnalytics.demandMetrics.daily.map(val => val * 0.98);
    this.pricingAnalytics.demandMetrics.monthly = this.pricingAnalytics.demandMetrics.monthly.map(val => val * 0.99);
  }

  /**
   * Generate cache key for pricing
   * @param {string} productId - Product ID
   * @param {Object} userContext - User context
   * @param {Object} marketContext - Market context
   * @returns {string} Cache key
   */
  generateCacheKey(productId, userContext, marketContext) {
    const userHash = this.hashString(JSON.stringify(userContext));
    const marketHash = this.hashString(JSON.stringify(marketContext));
    return `${productId}_${userHash}_${marketHash}`;
  }

  /**
   * Hash string for consistent bucketing
   * @param {string} str - String to hash
   * @returns {number} Hash value
   */
  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Track pricing analytics
   * @param {Object} pricingResult - Pricing result
   * @param {Object} userContext - User context
   */
  trackPricingAnalytics(pricingResult, userContext) {
    const segmentKey = `${pricingResult.productId}_${pricingResult.userSegment}`;
    
    if (!this.pricingAnalytics.conversionRates.has(segmentKey)) {
      this.pricingAnalytics.conversionRates.set(segmentKey, {
        conversions: 0,
        views: 0,
        rate: 0
      });
    }

    const segmentAnalytics = this.pricingAnalytics.conversionRates.get(segmentKey);
    segmentAnalytics.views++;
    segmentAnalytics.rate = segmentAnalytics.conversions / segmentAnalytics.views;
  }

  /**
   * Generate daily pricing report
   */
  generateDailyPricingReport() {
    const report = {
      date: new Date().toISOString().split('T')[0],
      totalPriceRequests: this.pricingCache.size,
      avgDiscountPercent: this.calculateAvgDiscount(),
      topPerformingSegments: this.getTopPerformingSegments(),
      activeTests: Array.from(this.priceTests.entries()),
      demandMetrics: this.pricingAnalytics.demandMetrics,
      recommendations: this.generatePricingRecommendations()
    };

    this.logger.info('Daily pricing report generated', report);
    return report;
  }

  /**
   * Calculate average discount percentage
   * @returns {number} Average discount percentage
   */
  calculateAvgDiscount() {
    let totalDiscount = 0;
    let count = 0;

    for (const [key, cached] of this.pricingCache.entries()) {
      if (cached.pricing.discountPercent > 0) {
        totalDiscount += cached.pricing.discountPercent;
        count++;
      }
    }

    return count > 0 ? Math.round(totalDiscount / count) : 0;
  }

  /**
   * Get top performing user segments
   * @returns {Array} Top performing segments
   */
  getTopPerformingSegments() {
    const segments = [];

    for (const [key, data] of this.pricingAnalytics.conversionRates.entries()) {
      segments.push({
        segment: key,
        conversionRate: data.rate,
        conversions: data.conversions,
        views: data.views
      });
    }

    return segments
      .sort((a, b) => b.conversionRate - a.conversionRate)
      .slice(0, 5);
  }

  /**
   * Generate pricing recommendations
   * @returns {Array} Pricing recommendations
   */
  generatePricingRecommendations() {
    const recommendations = [];

    // Check for underperforming segments
    for (const [key, data] of this.pricingAnalytics.conversionRates.entries()) {
      if (data.views > 100 && data.rate < 0.02) {
        recommendations.push({
          type: 'price_reduction',
          segment: key,
          reason: 'Low conversion rate',
          currentRate: data.rate,
          suggestedAction: 'Consider reducing price by 10-15%'
        });
      }
    }

    // Check for high-performing segments
    for (const [key, data] of this.pricingAnalytics.conversionRates.entries()) {
      if (data.views > 50 && data.rate > 0.15) {
        recommendations.push({
          type: 'price_increase',
          segment: key,
          reason: 'High conversion rate',
          currentRate: data.rate,
          suggestedAction: 'Consider increasing price by 5-10%'
        });
      }
    }

    return recommendations;
  }

  /**
   * Get pricing analytics
   * @returns {Object} Pricing analytics data
   */
  getPricingAnalytics() {
    return {
      conversionRates: Object.fromEntries(this.pricingAnalytics.conversionRates),
      revenueByPrice: Object.fromEntries(this.pricingAnalytics.revenueByPrice),
      segmentPerformance: Object.fromEntries(this.pricingAnalytics.segmentPerformance),
      demandMetrics: this.pricingAnalytics.demandMetrics,
      activeTests: Object.fromEntries(this.priceTests),
      testResults: Object.fromEntries(this.testResults),
      cacheStats: {
        size: this.pricingCache.size,
        timeout: this.cacheTimeout
      }
    };
  }
}

module.exports = DynamicPricingEngine;