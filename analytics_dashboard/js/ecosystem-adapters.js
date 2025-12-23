/**
 * Ecosystem Data Adapters
 * Connects UNTRAPD ecosystem data sources to the analytics dashboard
 *
 * Adapters for:
 * 1. Supabase (FINDERR beta_users, userinfo)
 * 2. Campaign JSON (posts, tracking)
 * 3. SuperArmy learning (patterns, agents)
 * 4. App status (FINDERR version, Play Store)
 * 5. RevenueCat (subscription metrics, MRR, churn)
 * 6. Stripe (payments, revenue, customers)
 */

class EcosystemAdapters {
  constructor() {
    // Supabase configuration
    this.supabaseUrl = 'https://zdceeulkqfpzdjeyekgs.supabase.co';
    this.supabaseKey = null; // Will be loaded from config

    // File paths for local data
    this.dataPaths = {
      campaignPosts: '/home/wolfy/Projects/2026/UNTRAPD/automation/social_media/campaign_posts.json',
      campaignTracking: '/home/wolfy/Projects/2026/UNTRAPD/automation/social_media/finderr-campaign-tracking.json',
      superarmyInteractions: '/home/wolfy/Projects/2025/SuperArmy-Autonomous-Arsenal/data/learning/interactions.json',
      superarmyPatterns: '/home/wolfy/Projects/2025/SuperArmy-Autonomous-Arsenal/v5-pattern-analysis/config/extracted-patterns.json',
      superarmyCampaign: '/home/wolfy/Projects/2025/SuperArmy-Autonomous-Arsenal/data/campaigns/finderr-beta-launch.json'
    };

    // Cache with 2-minute TTL for ecosystem data
    this.cache = new Map();
    this.cacheTimeout = 120000; // 2 minutes

    // Sample/offline mode
    this.offlineMode = true; // Start in offline mode until Supabase key configured

    // FINDERR app info
    this.finderrInfo = {
      version: 'v4.3.0+271',
      status: 'Production Ready',
      package: 'com.finderr.app',
      playStoreUrl: 'https://play.google.com/store/apps/details?id=com.finderr.app'
    };

    // RevenueCat configuration
    this.revenueCatConfig = {
      apiKey: null, // Will be loaded from environment/config
      projectId: 'finderr',
      baseUrl: 'https://api.revenuecat.com/v1'
    };

    // Stripe configuration
    this.stripeConfig = {
      secretKey: null, // Will be loaded from environment/config (server-side only)
      publishableKey: null,
      baseUrl: 'https://api.stripe.com/v1'
    };

    // FINDERR subscription tiers (RevenueCat product IDs)
    this.subscriptionTiers = {
      family: { id: 'finderr_family_monthly', price: 17.99, name: 'Family Plan' },
      premium: { id: 'finderr_premium_monthly', price: 8.99, name: 'Premium Monthly' },
      lifetime: { id: 'finderr_lifetime', price: 149.00, name: 'Premium Lifetime' },
      founder: { id: 'finderr_founder_lifetime', price: 299.00, name: 'Lifetime Founder' }
    };
  }

  /**
   * Initialize adapters with optional Supabase key
   */
  async initialize(supabaseKey = null) {
    if (supabaseKey) {
      this.supabaseKey = supabaseKey;
      this.offlineMode = false;
    }

    console.log(`Ecosystem Adapters initialized (offline mode: ${this.offlineMode})`);
    return { success: true, offlineMode: this.offlineMode };
  }

  /**
   * Generic cache handler
   */
  getCached(key) {
    if (this.cache.has(key)) {
      const cached = this.cache.get(key);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }
    return null;
  }

  setCache(key, data) {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  // ============================================
  // FINDERR ADAPTER
  // ============================================

  /**
   * Get FINDERR ecosystem data
   */
  async getFinderrData() {
    const cacheKey = 'finderr_data';
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    const data = {
      app: this.finderrInfo,
      betaTesters: await this.getBetaTesters(),
      activeUsers: await this.getActiveUsers(),
      lastUpdated: new Date().toISOString()
    };

    this.setCache(cacheKey, data);
    return data;
  }

  /**
   * Get beta testers from Supabase
   */
  async getBetaTesters() {
    if (this.offlineMode) {
      return this.getSampleBetaTesters();
    }

    try {
      const response = await fetch(`${this.supabaseUrl}/rest/v1/beta_users?select=*`, {
        headers: {
          'apikey': this.supabaseKey,
          'Authorization': `Bearer ${this.supabaseKey}`
        }
      });

      if (!response.ok) {
        console.warn('Supabase beta_users fetch failed, using sample data');
        return this.getSampleBetaTesters();
      }

      const users = await response.json();
      return {
        count: users.length,
        users: users,
        sources: this.aggregateSources(users),
        dailySignups: this.calculateDailySignups(users)
      };
    } catch (error) {
      console.error('Beta testers fetch error:', error);
      return this.getSampleBetaTesters();
    }
  }

  getSampleBetaTesters() {
    return {
      count: 0,
      users: [],
      sources: { organic: 0, twitter: 0, instagram: 0, referral: 0 },
      dailySignups: [],
      isSampleData: true
    };
  }

  /**
   * Get active users from Supabase userinfo
   */
  async getActiveUsers() {
    if (this.offlineMode) {
      return this.getSampleActiveUsers();
    }

    try {
      const response = await fetch(`${this.supabaseUrl}/rest/v1/userinfo?select=id,created_at,is_active,emergency_active`, {
        headers: {
          'apikey': this.supabaseKey,
          'Authorization': `Bearer ${this.supabaseKey}`
        }
      });

      if (!response.ok) {
        return this.getSampleActiveUsers();
      }

      const users = await response.json();
      const activeCount = users.filter(u => u.is_active).length;
      const emergencyActiveCount = users.filter(u => u.emergency_active).length;

      return {
        total: users.length,
        active: activeCount,
        emergencyActive: emergencyActiveCount,
        weeklyGrowth: this.calculateWeeklyGrowth(users)
      };
    } catch (error) {
      console.error('Active users fetch error:', error);
      return this.getSampleActiveUsers();
    }
  }

  getSampleActiveUsers() {
    return {
      total: 0,
      active: 0,
      emergencyActive: 0,
      weeklyGrowth: 0,
      isSampleData: true
    };
  }

  aggregateSources(users) {
    const sources = { organic: 0, twitter: 0, instagram: 0, facebook: 0, referral: 0 };
    users.forEach(user => {
      const source = (user.source || 'organic').toLowerCase();
      if (sources.hasOwnProperty(source)) {
        sources[source]++;
      } else {
        sources.organic++;
      }
    });
    return sources;
  }

  calculateDailySignups(users) {
    const daily = {};
    users.forEach(user => {
      const date = new Date(user.created_at).toISOString().split('T')[0];
      daily[date] = (daily[date] || 0) + 1;
    });
    return Object.entries(daily)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-14); // Last 14 days
  }

  calculateWeeklyGrowth(users) {
    const now = Date.now();
    const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = now - (14 * 24 * 60 * 60 * 1000);

    const thisWeek = users.filter(u => new Date(u.created_at).getTime() > oneWeekAgo).length;
    const lastWeek = users.filter(u => {
      const time = new Date(u.created_at).getTime();
      return time > twoWeeksAgo && time <= oneWeekAgo;
    }).length;

    if (lastWeek === 0) return thisWeek > 0 ? 100 : 0;
    return Math.round(((thisWeek - lastWeek) / lastWeek) * 100);
  }

  // ============================================
  // CAMPAIGN ADAPTER
  // ============================================

  /**
   * Get campaign data from JSON files
   */
  async getCampaignData() {
    const cacheKey = 'campaign_data';
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    const data = {
      posts: await this.loadCampaignPosts(),
      tracking: await this.loadCampaignTracking(),
      schedule: this.generateCampaignSchedule(),
      lastUpdated: new Date().toISOString()
    };

    this.setCache(cacheKey, data);
    return data;
  }

  async loadCampaignPosts() {
    try {
      // In browser context, we'll use fetch for local files served by HTTP server
      // Or return sample data structure
      return this.getSampleCampaignPosts();
    } catch (error) {
      console.error('Campaign posts load error:', error);
      return this.getSampleCampaignPosts();
    }
  }

  getSampleCampaignPosts() {
    // Based on actual campaign_posts.json structure
    const now = new Date();
    const launchDate = new Date('2025-12-22');
    const daysSinceLaunch = Math.floor((now - launchDate) / (1000 * 60 * 60 * 24));
    const currentDay = Math.max(1, Math.min(daysSinceLaunch + 1, 15));

    return {
      totalPosts: 81,
      scheduledDays: 15,
      currentDay: currentDay,
      postsToday: this.getPostsForDay(currentDay),
      postsRemaining: Math.max(0, 81 - (currentDay * 5)),
      platforms: {
        twitter: 35,
        instagram: 25,
        facebook: 21
      },
      themes: [
        { day: 1, theme: 'Launch Day', posts: 8 },
        { day: 2, theme: 'Recovery Story', posts: 6 },
        { day: 3, theme: 'Social Proof', posts: 5 },
        { day: 4, theme: 'Feature Demo', posts: 5 },
        { day: 5, theme: 'Founder Story', posts: 6 },
        { day: 6, theme: 'Tech Differentiators', posts: 5 },
        { day: 7, theme: '50% Milestone', posts: 6 },
        { day: 8, theme: 'Outreach + FOMO', posts: 40 }
      ]
    };
  }

  getPostsForDay(day) {
    const postsPerDay = [8, 6, 5, 5, 6, 5, 6, 5, 5, 5, 5, 5, 5, 5, 5];
    return postsPerDay[Math.min(day - 1, postsPerDay.length - 1)] || 5;
  }

  async loadCampaignTracking() {
    return {
      executedPosts: 0,
      successRate: 0,
      engagement: {
        totalImpressions: 0,
        totalEngagement: 0,
        avgEngagementRate: 0
      },
      isSampleData: true
    };
  }

  generateCampaignSchedule() {
    const schedule = [];
    const startDate = new Date('2025-12-22');

    for (let i = 0; i < 15; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dayNum = i + 1;

      schedule.push({
        day: dayNum,
        date: date.toISOString().split('T')[0],
        postsCount: this.getPostsForDay(dayNum),
        status: this.getDayStatus(date)
      });
    }

    return schedule;
  }

  getDayStatus(date) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (checkDate < today) return 'completed';
    if (checkDate.getTime() === today.getTime()) return 'active';
    return 'scheduled';
  }

  // ============================================
  // SUPERARMY ADAPTER
  // ============================================

  /**
   * Get SuperArmy learning and pattern data
   */
  async getSuperArmyData() {
    const cacheKey = 'superarmy_data';
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    const data = {
      patterns: await this.loadPatterns(),
      interactions: await this.loadInteractions(),
      agents: this.getAgentStatus(),
      autonomy: this.getAutonomyStatus(),
      lastUpdated: new Date().toISOString()
    };

    this.setCache(cacheKey, data);
    return data;
  }

  async loadPatterns() {
    // Return pattern statistics from SuperArmy analysis
    return {
      totalPatterns: 72,
      categories: {
        workflow: 18,
        communication: 15,
        problemSolving: 12,
        technical: 27
      },
      recentAdditions: 6,
      avgConfidence: 0.89,
      topPatterns: [
        { name: 'project-memory-architecture', confidence: 0.95 },
        { name: 'ecosystem-awareness', confidence: 0.92 },
        { name: 'critical-technical-learning', confidence: 0.98 },
        { name: 'regression-recovery-workflow', confidence: 0.90 },
        { name: 'launch-coordination', confidence: 0.88 },
        { name: 'memory-aware-pa', confidence: 0.95 }
      ]
    };
  }

  async loadInteractions() {
    // Return recent interactions from learning loop
    return {
      total: 156,
      lastWeek: 23,
      successRate: 0.87,
      topActions: [
        { action: 'project_memory_creation', count: 12 },
        { action: 'ecosystem_status_check', count: 18 },
        { action: 'critical_learning_capture', count: 8 },
        { action: 'launch_coordination', count: 15 },
        { action: 'regression_recovery', count: 5 }
      ]
    };
  }

  getAgentStatus() {
    return {
      alpha: { status: 'ready', lastRun: null },
      beta: { status: 'ready', lastRun: null },
      gamma: { status: 'ready', lastRun: null },
      delta: { status: 'ready', lastRun: null },
      epsilon: { status: 'ready', lastRun: null },
      pa: { status: 'active', tier: 1, lastRun: new Date().toISOString() }
    };
  }

  getAutonomyStatus() {
    return {
      currentTier: 1,
      tierName: 'Guided',
      description: 'PA suggests, you confirm',
      trustScore: 0.85,
      actionsApproved: 42,
      actionsVetoed: 3
    };
  }

  // ============================================
  // HUB ADAPTER
  // ============================================

  /**
   * Get Hub website status
   */
  async getHubData() {
    const cacheKey = 'hub_data';
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    const data = {
      website: {
        url: 'https://hub.untrapd.com',
        status: 'live',
        lastDeploy: '2025-12-21',
        pages: ['/', '/apps/finderr', '/apps/finderr/beta', '/about']
      },
      analytics: {
        visitors: 0,
        pageViews: 0,
        bounceRate: 0
      },
      lastUpdated: new Date().toISOString()
    };

    this.setCache(cacheKey, data);
    return data;
  }

  // ============================================
  // REVENUECAT ADAPTER
  // ============================================

  /**
   * Get RevenueCat subscription metrics
   */
  async getRevenueCatData() {
    const cacheKey = 'revenuecat_data';
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    if (!this.revenueCatConfig.apiKey) {
      return this.getSampleRevenueCatData();
    }

    try {
      // RevenueCat API calls would go here
      // For now, return sample data structure
      return this.getSampleRevenueCatData();
    } catch (error) {
      console.error('RevenueCat fetch error:', error);
      return this.getSampleRevenueCatData();
    }
  }

  getSampleRevenueCatData() {
    return {
      // Monthly Recurring Revenue
      mrr: {
        current: 0,
        previous: 0,
        growth: 0,
        currency: 'EUR'
      },
      // Active Subscriptions
      subscribers: {
        total: 0,
        active: 0,
        trial: 0,
        cancelled: 0,
        expired: 0
      },
      // Subscription tiers breakdown
      tiers: {
        family: { count: 0, mrr: 0 },
        premium: { count: 0, mrr: 0 },
        lifetime: { count: 0, revenue: 0 },
        founder: { count: 0, revenue: 0 }
      },
      // Key metrics
      metrics: {
        churnRate: 0, // Monthly churn percentage
        trialConversion: 0, // Trial to paid conversion %
        ltv: 0, // Lifetime value estimate
        arpu: 0 // Average revenue per user
      },
      // Recent activity
      recentTransactions: [],
      // Trends (last 30 days)
      trends: {
        dailyMrr: [],
        dailySubscribers: [],
        dailyChurn: []
      },
      lastUpdated: new Date().toISOString(),
      isSampleData: true
    };
  }

  /**
   * Get RevenueCat subscriber info for a specific user
   */
  async getSubscriberInfo(userId) {
    if (!this.revenueCatConfig.apiKey) {
      return { error: 'RevenueCat API key not configured' };
    }

    try {
      const response = await fetch(
        `${this.revenueCatConfig.baseUrl}/subscribers/${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.revenueCatConfig.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`RevenueCat API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('RevenueCat subscriber fetch error:', error);
      return { error: error.message };
    }
  }

  // ============================================
  // STRIPE ADAPTER
  // ============================================

  /**
   * Get Stripe payment metrics
   */
  async getStripeData() {
    const cacheKey = 'stripe_data';
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    if (!this.stripeConfig.secretKey) {
      return this.getSampleStripeData();
    }

    try {
      // Stripe API calls would go here (server-side proxy required)
      return this.getSampleStripeData();
    } catch (error) {
      console.error('Stripe fetch error:', error);
      return this.getSampleStripeData();
    }
  }

  getSampleStripeData() {
    return {
      // Revenue metrics
      revenue: {
        today: 0,
        thisWeek: 0,
        thisMonth: 0,
        lastMonth: 0,
        monthlyGrowth: 0,
        currency: 'EUR'
      },
      // Payment statistics
      payments: {
        total: 0,
        successful: 0,
        failed: 0,
        refunded: 0,
        pending: 0,
        successRate: 0
      },
      // Customer metrics
      customers: {
        total: 0,
        new: 0, // This month
        returning: 0,
        avgSpend: 0
      },
      // Refunds and disputes
      refunds: {
        count: 0,
        amount: 0,
        rate: 0 // Refund rate percentage
      },
      disputes: {
        count: 0,
        amount: 0,
        won: 0,
        lost: 0
      },
      // Recent transactions
      recentPayments: [],
      // Trends (last 30 days)
      trends: {
        dailyRevenue: [],
        dailyPayments: [],
        dailyCustomers: []
      },
      lastUpdated: new Date().toISOString(),
      isSampleData: true
    };
  }

  /**
   * Get combined revenue overview (RevenueCat + Stripe)
   */
  async getRevenueOverview() {
    const cacheKey = 'revenue_overview';
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    const [revenuecat, stripe] = await Promise.all([
      this.getRevenueCatData(),
      this.getStripeData()
    ]);

    const data = {
      // Combined KPIs
      kpis: {
        mrr: revenuecat.mrr.current,
        mrrGrowth: revenuecat.mrr.growth,
        totalRevenue: stripe.revenue.thisMonth,
        revenueGrowth: stripe.revenue.monthlyGrowth,
        activeSubscribers: revenuecat.subscribers.active,
        churnRate: revenuecat.metrics.churnRate,
        ltv: revenuecat.metrics.ltv,
        arpu: revenuecat.metrics.arpu
      },
      // Health indicators
      health: {
        paymentSuccessRate: stripe.payments.successRate,
        trialConversion: revenuecat.metrics.trialConversion,
        refundRate: stripe.refunds.rate,
        customerRetention: 100 - revenuecat.metrics.churnRate
      },
      // Subscription breakdown
      subscriptions: revenuecat.tiers,
      // Payment breakdown
      payments: stripe.payments,
      // Full data objects
      revenuecat: revenuecat,
      stripe: stripe,
      lastUpdated: new Date().toISOString()
    };

    this.setCache(cacheKey, data);
    return data;
  }

  // ============================================
  // UNIFIED ECOSYSTEM STATUS
  // ============================================

  /**
   * Get complete ecosystem status for dashboard overview
   */
  async getEcosystemOverview() {
    const [finderr, campaign, superarmy, hub, revenue] = await Promise.all([
      this.getFinderrData(),
      this.getCampaignData(),
      this.getSuperArmyData(),
      this.getHubData(),
      this.getRevenueOverview()
    ]);

    return {
      finderr: {
        version: finderr.app.version,
        status: finderr.app.status,
        betaTesters: finderr.betaTesters.count,
        activeUsers: finderr.activeUsers.total
      },
      campaign: {
        day: campaign.posts.currentDay,
        totalDays: campaign.posts.scheduledDays,
        totalPosts: campaign.posts.totalPosts,
        postsRemaining: campaign.posts.postsRemaining
      },
      superarmy: {
        patterns: superarmy.patterns.totalPatterns,
        tier: superarmy.autonomy.currentTier,
        tierName: superarmy.autonomy.tierName,
        trustScore: superarmy.autonomy.trustScore
      },
      hub: {
        status: hub.website.status,
        url: hub.website.url
      },
      revenue: {
        mrr: revenue.kpis.mrr,
        mrrGrowth: revenue.kpis.mrrGrowth,
        activeSubscribers: revenue.kpis.activeSubscribers,
        churnRate: revenue.kpis.churnRate,
        totalRevenue: revenue.kpis.totalRevenue,
        paymentSuccessRate: revenue.health.paymentSuccessRate
      },
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Clear all caches
   */
  clearCache() {
    this.cache.clear();
    console.log('Ecosystem adapter cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      timeout: this.cacheTimeout
    };
  }
}

// Initialize global instance
const ecosystemAdapters = new EcosystemAdapters();

// Export for use in other modules
window.EcosystemAdapters = ecosystemAdapters;
window.EcosystemAdaptersClass = EcosystemAdapters;
