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
    // Initialize time range selector
    const timeRangeSelect = document.getElementById('timeRange');
    if (timeRangeSelect) {
      this.currentTimeRange = timeRangeSelect.value;
    }

    // Initialize platform tabs
    this.setupPlatformTabs();
    
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