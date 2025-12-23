/**
 * Main Dashboard Controller
 * Agent C - Phase 2 Task 2.3
 * 
 * Orchestrates all dashboard components and coordinates with Agent A/B
 */

class AnalyticsDashboard {
  constructor() {
    this.apiBase = '/api/analytics';
    this.refreshInterval = 60000; // 1 minute
    this.autoRefreshTimer = null;
    this.isLoading = false;
    this.currentTimeRange = '7d';
    this.activePlatform = 'all';
    
    this.initialize();
  }

  async initialize() {
    this.showLoading(true);
    
    try {
      // Initialize all dashboard components
      await this.initializeComponents();
      
      // Load initial data
      await this.loadDashboardData();
      
      // Setup event listeners
      this.setupEventListeners();
      
      // Start auto-refresh
      this.startAutoRefresh();
      
      console.log('Analytics Dashboard initialized successfully');
    } catch (error) {
      console.error('Failed to initialize dashboard:', error);
      this.showError('Failed to load dashboard data');
    } finally {
      this.showLoading(false);
    }
  }

  async initializeComponents() {
    // Initialize theme toggle FIRST (before any data loading)
    this.setupThemeToggle();

    // Initialize time range selector
    const timeRangeSelect = document.getElementById('timeRange');
    if (timeRangeSelect) {
      this.currentTimeRange = timeRangeSelect.value;
    }

    // Initialize platform tabs
    this.setupPlatformTabs();

    // Initialize ecosystem tabs
    this.setupEcosystemTabs();

    // Initialize metric selectors
    this.setupMetricSelectors();

    // Set initial update time
    this.updateLastRefreshTime();
  }

  async loadDashboardData() {
    try {
      // Load overview metrics
      await this.loadOverviewMetrics();
      
      // Load performance charts
      await this.loadPerformanceCharts();
      
      // Load platform analytics
      await this.loadPlatformAnalytics();
      
      // Load top content
      await this.loadTopContent();
      
      // Load alerts
      await this.loadPerformanceAlerts();
      
      console.log('Dashboard data loaded successfully');
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      throw error;
    }
  }

  async loadOverviewMetrics() {
    try {
      const response = await fetch(`${this.apiBase}/dashboard/overview?timeframe=${this.currentTimeRange}`);
      if (!response.ok) throw new Error('Failed to load overview metrics');
      
      const data = await response.json();
      const metrics = data.data || {};
      
      // Update metric cards
      this.updateMetricCard('totalImpressions', metrics.total_impressions, metrics.impressions_change);
      this.updateMetricCard('engagementRate', metrics.engagement_rate, metrics.engagement_change, '%');
      this.updateMetricCard('totalConversions', metrics.total_conversions, metrics.conversions_change);
      this.updateMetricCard('totalROI', metrics.roi, metrics.roi_change, '%');
      
      // Track dashboard overview load
      trackEvent('dashboard_overview_loaded', {
        timeframe: this.currentTimeRange,
        metrics_loaded: Object.keys(metrics).length
      });
      
    } catch (error) {
      console.error('Error loading overview metrics:', error);
      // Show placeholder values
      this.updateMetricCard('totalImpressions', 0, 0);
      this.updateMetricCard('engagementRate', 0, 0, '%');
      this.updateMetricCard('totalConversions', 0, 0);
      this.updateMetricCard('totalROI', 0, 0, '%');
    }
  }

  async loadPerformanceCharts() {
    try {
      const metric = document.getElementById('performanceMetric')?.value || 'engagement_rate';
      
      const response = await fetch(`${this.apiBase}/content-performance?date_range=${this.currentTimeRange}&metric=${metric}`);
      if (!response.ok) throw new Error('Failed to load performance data');
      
      const data = await response.json();
      const performanceData = data.data || {};
      
      // Update performance chart
      if (window.AnalyticsVisualizations) {
        window.AnalyticsVisualizations.updatePerformanceChart(performanceData, metric);
      }
      
      // Update platform distribution chart
      const platformData = this.aggregatePlatformData(performanceData);
      if (window.AnalyticsVisualizations) {
        window.AnalyticsVisualizations.updatePlatformChart(platformData);
      }
      
    } catch (error) {
      console.error('Error loading performance charts:', error);
    }
  }

  async loadPlatformAnalytics(platform = 'all') {
    try {
      let endpoint = `${this.apiBase}/platforms/all/insights?date_range=${this.currentTimeRange}`;
      if (platform !== 'all') {
        endpoint = `${this.apiBase}/platforms/${platform}/insights?date_range=${this.currentTimeRange}`;
      }
      
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error('Failed to load platform analytics');
      
      const data = await response.json();
      const analytics = data.data || {};
      
      // Update platform metrics
      this.updatePlatformMetrics(analytics);
      
      // Update platform detail chart
      if (analytics.content_performance && window.AnalyticsVisualizations) {
        window.AnalyticsVisualizations.updatePlatformDetailChart(analytics.content_performance, platform);
      }
      
    } catch (error) {
      console.error('Error loading platform analytics:', error);
    }
  }

  async loadTopContent() {
    try {
      const platform = document.getElementById('contentPlatformFilter')?.value || 'all';
      const metric = document.getElementById('contentMetricFilter')?.value || 'engagement_rate';
      
      let endpoint = `${this.apiBase}/content-performance?date_range=${this.currentTimeRange}&sort_by=${metric}&limit=10`;
      if (platform !== 'all') {
        endpoint += `&platform=${platform}`;
      }
      
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error('Failed to load top content');
      
      const data = await response.json();
      const content = data.data || [];
      
      this.updateTopContentTable(content);
      
    } catch (error) {
      console.error('Error loading top content:', error);
      this.updateTopContentTable([]);
    }
  }

  async loadPerformanceAlerts() {
    try {
      const severity = document.getElementById('alertSeverity')?.value || 'all';
      
      let endpoint = `${this.apiBase}/dashboard/alerts`;
      if (severity !== 'all') {
        endpoint += `?severity=${severity}`;
      }
      
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error('Failed to load alerts');
      
      const data = await response.json();
      const alerts = data.data || [];
      
      this.updateAlertsDisplay(alerts);
      
    } catch (error) {
      console.error('Error loading alerts:', error);
      this.updateAlertsDisplay([]);
    }
  }

  setupEventListeners() {
    // Time range selector
    const timeRangeSelect = document.getElementById('timeRange');
    if (timeRangeSelect) {
      timeRangeSelect.addEventListener('change', (e) => {
        this.currentTimeRange = e.target.value;
        this.refreshDashboard();
        
        trackEvent('timerange_changed', {
          new_range: e.target.value
        });
      });
    }

    // Refresh button
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        this.refreshDashboard();
        trackEvent('manual_refresh');
      });
    }

    // Performance metric selector
    const performanceMetric = document.getElementById('performanceMetric');
    if (performanceMetric) {
      performanceMetric.addEventListener('change', () => {
        this.loadPerformanceCharts();
      });
    }

    // Content filters
    const contentPlatformFilter = document.getElementById('contentPlatformFilter');
    const contentMetricFilter = document.getElementById('contentMetricFilter');
    
    if (contentPlatformFilter) {
      contentPlatformFilter.addEventListener('change', () => {
        this.loadTopContent();
      });
    }
    
    if (contentMetricFilter) {
      contentMetricFilter.addEventListener('change', () => {
        this.loadTopContent();
      });
    }

    // Alert severity filter
    const alertSeverity = document.getElementById('alertSeverity');
    if (alertSeverity) {
      alertSeverity.addEventListener('change', () => {
        this.loadPerformanceAlerts();
      });
    }

    // Window visibility change (pause/resume auto-refresh)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.stopAutoRefresh();
      } else {
        this.startAutoRefresh();
        this.refreshDashboard(); // Refresh when page becomes visible
      }
    });

    // Theme toggle
    this.setupThemeToggle();
  }

  setupThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;

    // Load saved theme preference
    const savedTheme = localStorage.getItem('dashboard-theme') || 'light';
    this.setTheme(savedTheme);

    themeToggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      this.setTheme(newTheme);
      localStorage.setItem('dashboard-theme', newTheme);

      if (typeof trackEvent === 'function') {
        trackEvent('theme_changed', { theme: newTheme });
      }
    });
  }

  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);

    // Update theme toggle icon
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      const icon = themeToggle.querySelector('img');
      if (icon) {
        icon.style.filter = theme === 'dark' ? 'invert(1)' : 'none';
      }
    }

    // Update Chart.js colors if charts are initialized
    if (window.AnalyticsVisualizations && typeof window.AnalyticsVisualizations.updateChartTheme === 'function') {
      try {
        window.AnalyticsVisualizations.updateChartTheme(theme);
      } catch (e) {
        console.log('Chart theme update skipped:', e.message);
      }
    }

    console.log('Theme set to:', theme);
  }

  setupPlatformTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        // Update active tab
        tabBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        
        // Load platform data
        const platform = e.target.dataset.platform;
        this.activePlatform = platform;
        this.loadPlatformAnalytics(platform);
        
        trackEvent('platform_tab_clicked', {
          platform: platform
        });
      });
    });
  }

  setupMetricSelectors() {
    // Setup any additional metric selectors here
    console.log('Metric selectors initialized');
  }

  // === ECOSYSTEM TAB HANDLING ===

  setupEcosystemTabs() {
    const ecosystemTabs = document.querySelectorAll('.ecosystem-tab-btn');
    const ecosystemPanels = document.querySelectorAll('.ecosystem-content');

    if (ecosystemTabs.length === 0) {
      console.log('No ecosystem tabs found - skipping ecosystem setup');
      return;
    }

    ecosystemTabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        // Update active tab
        ecosystemTabs.forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');

        // Show corresponding panel
        const targetPanel = e.target.dataset.ecosystem;
        ecosystemPanels.forEach(panel => {
          panel.classList.remove('active');
          if (panel.id === `ecosystem-${targetPanel}`) {
            panel.classList.add('active');
          }
        });

        // Load ecosystem data for the selected tab
        this.loadEcosystemTab(targetPanel);

        // Track tab click
        if (typeof trackEvent === 'function') {
          trackEvent('ecosystem_tab_clicked', { tab: targetPanel });
        }
      });
    });

    // Load initial ecosystem overview
    this.loadEcosystemTab('overview');
    console.log('Ecosystem tabs initialized');
  }

  async loadEcosystemTab(tab) {
    // Check if ecosystem adapters are available
    if (!window.EcosystemAdapters) {
      console.warn('EcosystemAdapters not loaded - using placeholder data');
      return;
    }

    try {
      switch (tab) {
        case 'overview':
          await this.loadEcosystemOverview();
          break;
        case 'finderr':
          await this.loadFinderrData();
          break;
        case 'campaign':
          await this.loadCampaignData();
          break;
        case 'superarmy':
          await this.loadSuperArmyData();
          break;
        case 'untrapd':
          await this.loadUntrapdData();
          break;
        case 'revenue':
          await this.loadRevenueData();
          break;
        default:
          console.warn(`Unknown ecosystem tab: ${tab}`);
      }
    } catch (error) {
      console.error(`Error loading ecosystem ${tab} data:`, error);
    }
  }

  async loadEcosystemOverview() {
    try {
      const overview = await window.EcosystemAdapters.getEcosystemOverview();

      // Update FINDERR card
      this.updateElement('eco-finderr-version', overview.finderr.version);
      this.updateElement('eco-finderr-status', overview.finderr.status);
      this.updateStatusBadge('eco-finderr-badge', overview.finderr.status === 'Production Ready');

      // Update Campaign card
      this.updateElement('eco-campaign-day', `Day ${overview.campaign.day}/${overview.campaign.totalDays}`);
      this.updateElement('eco-campaign-posts', `${overview.campaign.postsRemaining} posts remaining`);
      this.updateStatusBadge('eco-campaign-badge', overview.campaign.day <= overview.campaign.totalDays);

      // Update SuperArmy card
      this.updateElement('eco-superarmy-tier', `Tier ${overview.superarmy.tier}: ${overview.superarmy.tierName}`);
      this.updateElement('eco-superarmy-patterns', `${overview.superarmy.patterns} patterns`);
      this.updateStatusBadge('eco-superarmy-badge', overview.superarmy.trustScore >= 0.8);

      // Update Hub card
      this.updateElement('eco-hub-status', overview.hub.status);
      this.updateElement('eco-hub-url', overview.hub.url);
      this.updateStatusBadge('eco-hub-badge', overview.hub.status === 'live');

      // Update last sync time
      this.updateElement('eco-last-sync', new Date(overview.lastUpdated).toLocaleTimeString());

      console.log('Ecosystem overview loaded');
    } catch (error) {
      console.error('Error loading ecosystem overview:', error);
    }
  }

  async loadFinderrData() {
    try {
      const finderrData = await window.EcosystemAdapters.getFinderrData();

      // App info
      this.updateElement('finderr-version', finderrData.app.version);
      this.updateElement('finderr-status', finderrData.app.status);

      // Beta testers
      this.updateElement('finderr-beta-count', finderrData.betaTesters.count);
      this.updateElement('finderr-beta-today', finderrData.betaTesters.dailySignups?.length > 0
        ? finderrData.betaTesters.dailySignups[finderrData.betaTesters.dailySignups.length - 1].count
        : 0);

      // Active users
      this.updateElement('finderr-active-users', finderrData.activeUsers.total);
      this.updateElement('finderr-emergency-active', finderrData.activeUsers.emergencyActive);

      // Sources breakdown
      if (finderrData.betaTesters.sources) {
        this.updateSourcesDisplay(finderrData.betaTesters.sources);
      }

      console.log('FINDERR data loaded');
    } catch (error) {
      console.error('Error loading FINDERR data:', error);
    }
  }

  async loadCampaignData() {
    try {
      const campaignData = await window.EcosystemAdapters.getCampaignData();

      // Campaign overview
      this.updateElement('campaign-day', campaignData.posts.currentDay);
      this.updateElement('campaign-total-posts', campaignData.posts.totalPosts);
      this.updateElement('campaign-posts-remaining', campaignData.posts.postsRemaining);
      this.updateElement('campaign-posts-today', campaignData.posts.postsToday);

      // Platform breakdown
      if (campaignData.posts.platforms) {
        this.updateElement('campaign-twitter', campaignData.posts.platforms.twitter);
        this.updateElement('campaign-instagram', campaignData.posts.platforms.instagram);
        this.updateElement('campaign-facebook', campaignData.posts.platforms.facebook);
      }

      // Schedule
      this.updateCampaignSchedule(campaignData.schedule);

      // Tracking
      if (campaignData.tracking) {
        this.updateElement('campaign-executed', campaignData.tracking.executedPosts);
        this.updateElement('campaign-success-rate', `${(campaignData.tracking.successRate * 100).toFixed(0)}%`);
      }

      console.log('Campaign data loaded');
    } catch (error) {
      console.error('Error loading campaign data:', error);
    }
  }

  async loadSuperArmyData() {
    try {
      const superarmyData = await window.EcosystemAdapters.getSuperArmyData();

      // Autonomy status
      this.updateElement('superarmy-tier', superarmyData.autonomy.currentTier);
      this.updateElement('superarmy-tier-name', superarmyData.autonomy.tierName);
      this.updateElement('superarmy-tier-desc', superarmyData.autonomy.description);
      this.updateElement('superarmy-trust', `${(superarmyData.autonomy.trustScore * 100).toFixed(0)}%`);

      // Pattern stats
      this.updateElement('superarmy-patterns', superarmyData.patterns.totalPatterns);
      this.updateElement('superarmy-recent', superarmyData.patterns.recentAdditions);
      this.updateElement('superarmy-confidence', `${(superarmyData.patterns.avgConfidence * 100).toFixed(0)}%`);

      // Agent status
      this.updateAgentStatusGrid(superarmyData.agents);

      // Top patterns
      this.updateTopPatternsDisplay(superarmyData.patterns.topPatterns);

      // Interactions
      this.updateElement('superarmy-interactions', superarmyData.interactions.total);
      this.updateElement('superarmy-success', `${(superarmyData.interactions.successRate * 100).toFixed(0)}%`);

      console.log('SuperArmy data loaded');
    } catch (error) {
      console.error('Error loading SuperArmy data:', error);
    }
  }

  async loadUntrapdData() {
    try {
      // UNTRAPD data is mostly static identity info + Hub website status
      const hubData = await window.EcosystemAdapters.getHubData();

      // Identity info (static)
      this.updateElement('untrapd-mission', 'Like-Minded People, Authentic Brand, Location-Independent Life');
      this.updateElement('untrapd-status', 'Building Community');

      // Projects under umbrella
      this.updateElement('untrapd-finderr-status', 'v4.3.0+271 Ready');
      this.updateElement('untrapd-hub-status', hubData.website.status === 'live' ? 'Live' : 'Development');
      this.updateElement('untrapd-automation-status', 'Active');
      this.updateElement('untrapd-superarmy-status', 'Operational');

      // Hub website
      this.updateElement('untrapd-hub-url', hubData.website.url);
      this.updateElement('untrapd-hub-deploy', hubData.website.lastDeploy);

      console.log('UNTRAPD data loaded');
    } catch (error) {
      console.error('Error loading UNTRAPD data:', error);
    }
  }

  async loadRevenueData() {
    try {
      const revenueData = await window.EcosystemAdapters.getRevenueOverview();

      // Ensure kpis object exists with defaults
      const kpis = revenueData?.kpis || {};
      const mrr = kpis.mrr ?? 0;
      const mrrChange = kpis.mrrChange ?? 0;
      const totalSubscribers = kpis.totalSubscribers ?? 0;
      const subscriberChange = kpis.subscriberChange ?? 0;
      const monthlyRevenue = kpis.monthlyRevenue ?? 0;
      const revenueChange = kpis.revenueChange ?? 0;
      const ltv = kpis.ltv ?? 0;
      const ltvChange = kpis.ltvChange ?? 0;

      // KPIs (using camelCase IDs matching HTML)
      this.updateElement('revenueMrr', `€${mrr.toLocaleString()}`);
      this.updateElement('revenueMrrGrowth', `${mrrChange >= 0 ? '+' : ''}${mrrChange.toFixed(1)}%`);
      this.updateElement('revenueSubscribers', totalSubscribers.toLocaleString());
      this.updateElement('revenueTrials', `${subscriberChange} trials`);
      this.updateElement('revenueMonthly', `€${monthlyRevenue.toLocaleString()}`);
      this.updateElement('revenueMonthlyGrowth', `${revenueChange >= 0 ? '+' : ''}${revenueChange.toFixed(1)}%`);
      this.updateElement('revenueLtv', `€${ltv.toLocaleString()}`);
      this.updateElement('revenueArpu', `ARPU: €${ltvChange.toLocaleString()}`);

      // Add change classes for positive/negative styling
      this.setChangeClass('revenueMrrGrowth', mrrChange);
      this.setChangeClass('revenueMonthlyGrowth', revenueChange);

      // Subscription tiers from RevenueCat (using camelCase IDs)
      if (revenueData?.revenuecat?.tiers) {
        const tiers = revenueData.revenuecat.tiers;

        this.updateElement('tierFamilyCount', tiers.family?.activeSubscribers || 0);
        this.updateElement('tierFamilyMrr', `€${(tiers.family?.mrr || 0).toFixed(0)}`);

        this.updateElement('tierPremiumCount', tiers.premium?.activeSubscribers || 0);
        this.updateElement('tierPremiumMrr', `€${(tiers.premium?.mrr || 0).toFixed(0)}`);

        this.updateElement('tierLifetimeCount', tiers.lifetime?.totalPurchases || 0);
        this.updateElement('tierLifetimeRevenue', `€${(tiers.lifetime?.totalRevenue || 0).toFixed(0)}`);

        this.updateElement('tierFounderCount', tiers.founder?.totalPurchases || 0);
        this.updateElement('tierFounderRevenue', `€${(tiers.founder?.totalRevenue || 0).toFixed(0)}`);
      }

      // Health metrics (using camelCase IDs)
      const metrics = revenueData?.revenuecat?.metrics || {};
      const successRate = (metrics.paymentSuccessRate ?? 0.95) * 100;
      const conversionRate = (metrics.trialConversionRate ?? 0.25) * 100;
      const retentionRate = (metrics.monthlyRetention ?? 0.92) * 100;
      const refundRate = (metrics.refundRate ?? 0.02) * 100;

      // Update health bars
      const successBar = document.getElementById('healthSuccessBar');
      const successValue = document.getElementById('healthSuccessRate');
      if (successBar) successBar.style.width = `${successRate}%`;
      if (successValue) successValue.textContent = `${successRate.toFixed(0)}%`;

      const conversionBar = document.getElementById('healthConversionBar');
      const conversionValue = document.getElementById('healthConversion');
      if (conversionBar) conversionBar.style.width = `${conversionRate}%`;
      if (conversionValue) conversionValue.textContent = `${conversionRate.toFixed(0)}%`;

      const retentionBar = document.getElementById('healthRetentionBar');
      const retentionValue = document.getElementById('healthRetention');
      if (retentionBar) retentionBar.style.width = `${retentionRate}%`;
      if (retentionValue) retentionValue.textContent = `${retentionRate.toFixed(0)}%`;

      const refundBar = document.getElementById('healthRefundBar');
      const refundValue = document.getElementById('healthRefund');
      if (refundBar) refundBar.style.width = `${refundRate}%`;
      if (refundValue) refundValue.textContent = `${refundRate.toFixed(0)}%`;

      console.log('Revenue data loaded');
    } catch (error) {
      console.error('Error loading Revenue data:', error);
    }
  }

  setChangeClass(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
      element.classList.remove('positive', 'negative');
      element.classList.add(value >= 0 ? 'positive' : 'negative');
    }
  }

  updateHealthBar(prefix, percentage, inverted = false) {
    const barFill = document.getElementById(`${prefix}-fill`);
    const valueEl = document.getElementById(`${prefix}-value`);

    if (barFill) {
      barFill.style.width = `${Math.min(percentage, 100)}%`;
      // Set bar class based on health level
      barFill.classList.remove('excellent', 'good', 'warning', 'critical');
      if (inverted) {
        // For refund rate: lower is better
        if (percentage <= 2) barFill.classList.add('excellent');
        else if (percentage <= 5) barFill.classList.add('good');
        else if (percentage <= 10) barFill.classList.add('warning');
        else barFill.classList.add('critical');
      } else {
        // For other metrics: higher is better
        if (percentage >= 90) barFill.classList.add('excellent');
        else if (percentage >= 70) barFill.classList.add('good');
        else if (percentage >= 50) barFill.classList.add('warning');
        else barFill.classList.add('critical');
      }
    }

    if (valueEl) {
      valueEl.textContent = `${percentage.toFixed(1)}%`;
    }
  }

  updateAPIStatus(elementId, isSample) {
    const badge = document.getElementById(elementId);
    if (!badge) return;

    const dot = badge.querySelector('.status-dot');
    const text = badge.querySelector('span:last-child') || badge;

    if (dot) {
      dot.classList.remove('connected', 'sample', 'disconnected');
      dot.classList.add(isSample ? 'sample' : 'connected');
    }

    // Update status text
    const statusText = isSample ? 'Sample Data' : 'Connected';
    if (text && text.textContent) {
      // Keep the original service name
    }
  }

  // Ecosystem helper methods
  updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value;
    }
  }

  updateStatusBadge(id, isGood) {
    const element = document.getElementById(id);
    if (element) {
      element.className = `status-badge ${isGood ? 'status-live' : 'status-pending'}`;
      element.textContent = isGood ? '✓' : '○';
    }
  }

  updateSourcesDisplay(sources) {
    const container = document.getElementById('finderr-sources');
    if (!container) return;

    const total = Object.values(sources).reduce((a, b) => a + b, 0) || 1;
    container.innerHTML = Object.entries(sources).map(([source, count]) => `
      <div class="source-item">
        <span class="source-name">${source}</span>
        <span class="source-count">${count}</span>
        <div class="source-bar" style="width: ${(count / total) * 100}%"></div>
      </div>
    `).join('');
  }

  updateCampaignSchedule(schedule) {
    const container = document.getElementById('campaign-schedule');
    if (!container || !schedule) return;

    container.innerHTML = schedule.slice(0, 7).map(day => `
      <div class="schedule-day ${day.status}">
        <span class="day-num">Day ${day.day}</span>
        <span class="day-date">${day.date}</span>
        <span class="day-posts">${day.postsCount} posts</span>
        <span class="day-status">${day.status}</span>
      </div>
    `).join('');
  }

  updateAgentStatusGrid(agents) {
    const container = document.getElementById('superarmy-agents');
    if (!container || !agents) return;

    container.innerHTML = Object.entries(agents).map(([name, info]) => `
      <div class="agent-card ${info.status}">
        <span class="agent-name">${name.toUpperCase()}</span>
        <span class="agent-status">${info.status}</span>
        ${info.tier ? `<span class="agent-tier">Tier ${info.tier}</span>` : ''}
      </div>
    `).join('');
  }

  updateTopPatternsDisplay(patterns) {
    const container = document.getElementById('superarmy-top-patterns');
    if (!container || !patterns) return;

    container.innerHTML = patterns.slice(0, 5).map(p => `
      <div class="pattern-item">
        <span class="pattern-name">${p.name}</span>
        <span class="pattern-confidence">${(p.confidence * 100).toFixed(0)}%</span>
      </div>
    `).join('');
  }

  updateMetricCard(cardId, value, change, suffix = '') {
    const valueElement = document.getElementById(cardId);
    const changeElement = document.getElementById(cardId.replace(/total|Rate/i, '') + 'Change');
    
    if (valueElement) {
      if (suffix === '%') {
        valueElement.textContent = `${(value * 100).toFixed(1)}${suffix}`;
      } else {
        valueElement.textContent = this.formatNumber(value);
      }
    }
    
    if (changeElement && change !== undefined) {
      const changeText = change > 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`;
      changeElement.textContent = changeText;
      
      // Update change class
      changeElement.className = 'metric-change';
      if (change > 0) {
        changeElement.classList.add('positive');
      } else if (change < 0) {
        changeElement.classList.add('negative');
      } else {
        changeElement.classList.add('neutral');
      }
    }
  }

  updatePlatformMetrics(analytics) {
    const metrics = analytics.summary || {};
    
    // Update platform-specific metrics
    const elements = {
      platformReach: metrics.reach || 0,
      platformEngagement: (metrics.engagement_rate || 0) * 100,
      platformClickRate: (metrics.click_through_rate || 0) * 100,
      platformConversionRate: (metrics.conversion_rate || 0) * 100
    };
    
    Object.entries(elements).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) {
        if (id.includes('Rate') || id.includes('Engagement')) {
          element.textContent = `${value.toFixed(1)}%`;
        } else {
          element.textContent = this.formatNumber(value);
        }
      }
    });
  }

  updateTopContentTable(content) {
    const tableBody = document.getElementById('topContentBody');
    if (!tableBody) return;
    
    if (content.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center">No content data available</td>
        </tr>
      `;
      return;
    }
    
    tableBody.innerHTML = content.map(item => `
      <tr>
        <td>${this.truncateText(item.content_title || item.content_id, 30)}</td>
        <td>
          <span class="platform-tag" style="background-color: ${this.getPlatformColor(item.platform)}20; color: ${this.getPlatformColor(item.platform)}">
            ${this.formatPlatformName(item.platform)}
          </span>
        </td>
        <td>${item.content_type || 'N/A'}</td>
        <td>${((item.engagement_rate || 0) * 100).toFixed(2)}%</td>
        <td>${this.formatNumber(item.clicks || 0)}</td>
        <td>${this.formatNumber(item.conversions || 0)}</td>
        <td>
          <div class="performance-indicator ${this.getPerformanceClass(item.performance_score || 0)}">
            ${this.getPerformanceIcon(item.performance_score || 0)}
          </div>
        </td>
      </tr>
    `).join('');
  }

  updateAlertsDisplay(alerts) {
    const alertsList = document.getElementById('alertsList');
    if (!alertsList) return;
    
    if (alerts.length === 0) {
      alertsList.innerHTML = `
        <div class="empty-state">
          <i data-lucide="check-circle" class="empty-icon"></i>
          <h4>No Active Alerts</h4>
          <p>All systems are performing within normal parameters.</p>
        </div>
      `;
      lucide.createIcons();
      return;
    }
    
    alertsList.innerHTML = alerts.map(alert => `
      <div class="alert-item ${alert.severity}">
        <i data-lucide="${this.getAlertIcon(alert.severity)}"></i>
        <div class="alert-content">
          <h5>${alert.title}</h5>
          <p>${alert.description}</p>
          <small>Platform: ${this.formatPlatformName(alert.platform)} | ${this.formatDate(alert.created_at)}</small>
        </div>
      </div>
    `).join('');
    
    lucide.createIcons();
  }

  aggregatePlatformData(performanceData) {
    const platformTotals = {};
    
    Object.entries(performanceData).forEach(([platform, data]) => {
      if (data.total_impressions) {
        platformTotals[platform] = data.total_impressions;
      }
    });
    
    return platformTotals;
  }

  async refreshDashboard() {
    if (this.isLoading) return;
    
    this.showLoading(true);
    
    try {
      await this.loadDashboardData();
      this.updateLastRefreshTime();
      console.log('Dashboard refreshed successfully');
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
      this.showError('Failed to refresh dashboard');
    } finally {
      this.showLoading(false);
    }
  }

  startAutoRefresh() {
    this.stopAutoRefresh(); // Clear any existing timer
    
    this.autoRefreshTimer = setInterval(() => {
      if (!document.hidden) {
        this.refreshDashboard();
      }
    }, this.refreshInterval);
  }

  stopAutoRefresh() {
    if (this.autoRefreshTimer) {
      clearInterval(this.autoRefreshTimer);
      this.autoRefreshTimer = null;
    }
  }

  showLoading(show) {
    this.isLoading = show;
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
      overlay.style.display = show ? 'flex' : 'none';
    }
  }

  showError(message) {
    console.error(message);
    // Could implement toast notifications here
    alert(message); // Temporary error display
  }

  updateLastRefreshTime() {
    const lastUpdatedElement = document.getElementById('lastUpdated');
    if (lastUpdatedElement) {
      lastUpdatedElement.textContent = new Date().toLocaleTimeString();
    }
  }

  // === UTILITY METHODS ===

  formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  }

  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString();
  }

  formatPlatformName(platform) {
    const names = {
      instagram: 'Instagram',
      twitter: 'Twitter',
      facebook: 'Facebook',
      linkedin: 'LinkedIn',
      email: 'Email',
      app_store: 'App Store',
      app_store_ios: 'iOS App Store',
      app_store_android: 'Google Play'
    };
    return names[platform] || platform;
  }

  getPlatformColor(platform) {
    const colors = {
      instagram: '#E4405F',
      twitter: '#1DA1F2',
      facebook: '#1877F2',
      linkedin: '#0A66C2',
      email: '#6B7280',
      app_store: '#007AFF'
    };
    return colors[platform] || '#3B82F6';
  }

  getPerformanceClass(score) {
    if (score >= 0.8) return 'excellent';
    if (score >= 0.6) return 'good';
    if (score >= 0.4) return 'average';
    return 'poor';
  }

  getPerformanceIcon(score) {
    if (score >= 0.8) return '🚀';
    if (score >= 0.6) return '📈';
    if (score >= 0.4) return '📊';
    return '⚠️';
  }

  getAlertIcon(severity) {
    const icons = {
      critical: 'alert-circle',
      warning: 'alert-triangle',
      info: 'info'
    };
    return icons[severity] || 'info';
  }

  truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }

  /**
   * Export dashboard data for Agent B integration
   */
  async exportDashboardData(format = 'json') {
    try {
      const response = await fetch(`${this.apiBase}/export?format=${format}&date_range=${this.currentTimeRange}`);
      if (!response.ok) throw new Error('Failed to export data');
      
      const data = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-dashboard-${this.currentTimeRange}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      trackEvent('dashboard_data_exported', {
        format: format,
        timeframe: this.currentTimeRange
      });
      
    } catch (error) {
      console.error('Error exporting dashboard data:', error);
      this.showError('Failed to export dashboard data');
    }
  }

  /**
   * Coordinate with Agent A for social media metrics
   */
  async coordinateWithAgentA(action, data) {
    try {
      const response = await fetch('/api/agent-coordination/agent-a', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: action,
          data: data,
          from_agent: 'agent_c',
          timestamp: new Date().toISOString()
        })
      });
      
      if (!response.ok) throw new Error('Failed to coordinate with Agent A');
      
      const result = await response.json();
      console.log('Agent A coordination successful:', result);
      
      return result;
    } catch (error) {
      console.error('Agent A coordination failed:', error);
      return null;
    }
  }

  /**
   * Coordinate with Agent B for API data
   */
  async coordinateWithAgentB(action, data) {
    try {
      const response = await fetch('/api/agent-coordination/agent-b', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: action,
          data: data,
          from_agent: 'agent_c',
          timestamp: new Date().toISOString()
        })
      });
      
      if (!response.ok) throw new Error('Failed to coordinate with Agent B');
      
      const result = await response.json();
      console.log('Agent B coordination successful:', result);
      
      return result;
    } catch (error) {
      console.error('Agent B coordination failed:', error);
      return null;
    }
  }
}

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.AnalyticsDashboard = new AnalyticsDashboard();
  
  // Track dashboard initialization
  trackEvent('dashboard_initialized', {
    timestamp: new Date().toISOString(),
    user_agent: navigator.userAgent
  });
});

// Export for testing and coordination
window.AnalyticsDashboard = AnalyticsDashboard;