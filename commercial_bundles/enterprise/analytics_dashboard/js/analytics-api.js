/**
 * Analytics API Integration Layer
 * Agent C - Phase 2 Task 2.3
 * 
 * Handles API communication and data processing for Agent A/B coordination
 */

class AnalyticsAPI {
  constructor() {
    this.baseURL = '/api/analytics';
    this.sampleDataMode = true; // Toggle for testing vs production
    this.cache = new Map();
    this.cacheTimeout = 300000; // 5 minutes
    
    this.loadSampleData();
  }

  /**
   * Load sample data for testing dashboard functionality
   */
  async loadSampleData() {
    try {
      const response = await fetch('/analytics_dashboard/data/sample-data.json');
      if (response.ok) {
        this.sampleData = await response.json();
        console.log('Sample data loaded successfully');
      }
    } catch (error) {
      console.error('Failed to load sample data:', error);
      this.sampleData = {};
    }
  }

  /**
   * Generic API request handler with caching and error handling
   */
  async request(endpoint, options = {}) {
    const cacheKey = `${endpoint}_${JSON.stringify(options)}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      let data;
      
      if (this.sampleDataMode) {
        // Return sample data for testing
        data = this.getSampleData(endpoint, options);
      } else {
        // Make actual API request
        const response = await fetch(`${this.baseURL}${endpoint}`, {
          method: options.method || 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...options.headers
          },
          body: options.body ? JSON.stringify(options.body) : null
        });

        if (!response.ok) {
          throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        data = result.data || result;
      }

      // Cache the result
      this.cache.set(cacheKey, {
        data: data,
        timestamp: Date.now()
      });

      return data;
    } catch (error) {
      console.error(`API request error for ${endpoint}:`, error);
      
      // Return cached data if available, even if expired
      if (this.cache.has(cacheKey)) {
        console.warn('Returning expired cached data due to API error');
        return this.cache.get(cacheKey).data;
      }
      
      throw error;
    }
  }

  /**
   * Get sample data based on endpoint and options
   */
  getSampleData(endpoint, options = {}) {
    const { query } = options;
    
    switch (endpoint) {
      case '/dashboard/overview':
        return this.sampleData.dashboard_overview || {};
        
      case '/content-performance':
        return this.sampleData.performance_data || {};
        
      case '/ab-tests':
        const status = query?.status;
        let tests = this.sampleData.ab_tests || [];
        if (status && status !== 'all') {
          tests = tests.filter(test => test.status === status);
        }
        return tests;
        
      case '/platforms/all/insights':
        return this.sampleData.platform_insights || {};
        
      case '/correlation':
        return this.sampleData.correlation_data || {};
        
      case '/dashboard/alerts':
        const severity = query?.severity;
        let alerts = this.sampleData.alerts || [];
        if (severity && severity !== 'all') {
          alerts = alerts.filter(alert => alert.severity === severity);
        }
        return alerts;
        
      case '/campaigns':
        return this.sampleData.campaign_performance || {};
        
      default:
        return {};
    }
  }

  /**
   * Get dashboard overview metrics
   */
  async getDashboardOverview(timeframe = '7d') {
    return await this.request('/dashboard/overview', {
      query: { timeframe }
    });
  }

  /**
   * Get content performance data
   */
  async getContentPerformance(filters = {}) {
    return await this.request('/content-performance', {
      query: filters
    });
  }

  /**
   * Get A/B testing data
   */
  async getABTests(filters = {}) {
    return await this.request('/ab-tests', {
      query: filters
    });
  }

  /**
   * Get A/B test results for specific test
   */
  async getABTestResults(testId) {
    const tests = await this.getABTests();
    return tests.find(test => test.test_id === testId) || null;
  }

  /**
   * Create or update A/B test
   */
  async saveABTest(testData) {
    if (this.sampleDataMode) {
      console.log('Would save A/B test:', testData);
      return { success: true, test_id: testData.test_id || `test_${Date.now()}` };
    }
    
    return await this.request('/ab-tests', {
      method: 'POST',
      body: testData
    });
  }

  /**
   * Update A/B test status
   */
  async updateABTestStatus(testId, status) {
    if (this.sampleDataMode) {
      console.log(`Would update test ${testId} to status: ${status}`);
      return { success: true };
    }
    
    return await this.request(`/ab-tests/${testId}`, {
      method: 'PATCH',
      body: { status }
    });
  }

  /**
   * Get platform insights
   */
  async getPlatformInsights(platform = 'all', dateRange = '30d') {
    return await this.request(`/platforms/${platform}/insights`, {
      query: { date_range: dateRange }
    });
  }

  /**
   * Get cross-platform correlation data
   */
  async getCorrelationData(dateRange = '30d', metricType = 'engagement_rate') {
    return await this.request('/correlation', {
      query: {
        date_range: dateRange,
        metric_type: metricType
      }
    });
  }

  /**
   * Get performance alerts
   */
  async getPerformanceAlerts(filters = {}) {
    return await this.request('/dashboard/alerts', {
      query: filters
    });
  }

  /**
   * Record user engagement event
   */
  async recordEngagementEvent(eventData) {
    if (this.sampleDataMode) {
      console.log('Would record engagement event:', eventData);
      return { success: true, event_id: `event_${Date.now()}` };
    }
    
    return await this.request('/events', {
      method: 'POST',
      body: eventData
    });
  }

  /**
   * Record multiple engagement events (batch)
   */
  async recordEngagementEvents(events) {
    if (this.sampleDataMode) {
      console.log(`Would record ${events.length} engagement events`);
      return { success: true, processed: events.length };
    }
    
    return await this.request('/events', {
      method: 'POST',
      body: events
    });
  }

  /**
   * Get campaign performance data
   */
  async getCampaignPerformance(filters = {}) {
    return await this.request('/campaigns', {
      query: filters
    });
  }

  /**
   * Get campaign ROI data
   */
  async getCampaignROI(campaignId) {
    return await this.request(`/campaigns/${campaignId}/roi`);
  }

  /**
   * Export analytics data
   */
  async exportData(format = 'json', filters = {}) {
    if (this.sampleDataMode) {
      // Generate mock export data
      const exportData = {
        export_timestamp: new Date().toISOString(),
        filters: filters,
        data: this.sampleData
      };
      
      if (format === 'csv') {
        return this.convertToCSV(exportData);
      }
      
      return JSON.stringify(exportData, null, 2);
    }
    
    const response = await fetch(`${this.baseURL}/export`, {
      method: 'GET',
      headers: {
        'Accept': format === 'csv' ? 'text/csv' : 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Export failed');
    }
    
    return await response.text();
  }

  /**
   * Agent A coordination - Social media metrics sync
   */
  async coordinateWithAgentA(action, data) {
    const coordinationData = {
      action: action,
      data: data,
      from_agent: 'agent_c',
      timestamp: new Date().toISOString()
    };

    if (this.sampleDataMode) {
      console.log('Agent A coordination request:', coordinationData);
      
      // Simulate coordination responses
      switch (action) {
        case 'request_social_metrics':
          return {
            success: true,
            data: this.sampleData.performance_data || {},
            message: 'Social media metrics provided'
          };
          
        case 'sync_ab_test_results':
          return {
            success: true,
            data: { test_synced: true },
            message: 'A/B test results synchronized with social media automation'
          };
          
        case 'request_content_performance':
          return {
            success: true,
            data: this.sampleData.top_content || [],
            message: 'Top performing content data provided'
          };
          
        default:
          return {
            success: true,
            message: `Agent A coordination completed for action: ${action}`
          };
      }
    }

    return await this.request('/agent-coordination/agent-a', {
      method: 'POST',
      body: coordinationData
    });
  }

  /**
   * Agent B coordination - API integration and data feeds
   */
  async coordinateWithAgentB(action, data) {
    const coordinationData = {
      action: action,
      data: data,
      from_agent: 'agent_c',
      timestamp: new Date().toISOString()
    };

    if (this.sampleDataMode) {
      console.log('Agent B coordination request:', coordinationData);
      
      // Simulate coordination responses
      switch (action) {
        case 'request_api_data':
          return {
            success: true,
            data: this.sampleData.performance_data || {},
            message: 'API data feeds provided'
          };
          
        case 'sync_email_metrics':
          return {
            success: true,
            data: this.sampleData.performance_data.email || {},
            message: 'Email marketing metrics synchronized'
          };
          
        case 'setup_data_pipeline':
          return {
            success: true,
            data: { pipeline_id: 'pipeline_123', status: 'active' },
            message: 'Data pipeline established for real-time analytics'
          };
          
        default:
          return {
            success: true,
            message: `Agent B coordination completed for action: ${action}`
          };
      }
    }

    return await this.request('/agent-coordination/agent-b', {
      method: 'POST',
      body: coordinationData
    });
  }

  /**
   * Test API connectivity and Agent coordination
   */
  async testConnectivity() {
    const tests = {
      dashboard_overview: false,
      content_performance: false,
      ab_tests: false,
      platform_insights: false,
      correlation_data: false,
      agent_a_coordination: false,
      agent_b_coordination: false
    };

    try {
      // Test dashboard overview
      await this.getDashboardOverview();
      tests.dashboard_overview = true;
    } catch (error) {
      console.error('Dashboard overview test failed:', error);
    }

    try {
      // Test content performance
      await this.getContentPerformance();
      tests.content_performance = true;
    } catch (error) {
      console.error('Content performance test failed:', error);
    }

    try {
      // Test A/B tests
      await this.getABTests();
      tests.ab_tests = true;
    } catch (error) {
      console.error('A/B tests test failed:', error);
    }

    try {
      // Test platform insights
      await this.getPlatformInsights();
      tests.platform_insights = true;
    } catch (error) {
      console.error('Platform insights test failed:', error);
    }

    try {
      // Test correlation data
      await this.getCorrelationData();
      tests.correlation_data = true;
    } catch (error) {
      console.error('Correlation data test failed:', error);
    }

    try {
      // Test Agent A coordination
      await this.coordinateWithAgentA('test_connection', {});
      tests.agent_a_coordination = true;
    } catch (error) {
      console.error('Agent A coordination test failed:', error);
    }

    try {
      // Test Agent B coordination
      await this.coordinateWithAgentB('test_connection', {});
      tests.agent_b_coordination = true;
    } catch (error) {
      console.error('Agent B coordination test failed:', error);
    }

    return tests;
  }

  /**
   * Clear API cache
   */
  clearCache() {
    this.cache.clear();
    console.log('API cache cleared');
  }

  /**
   * Convert data to CSV format
   */
  convertToCSV(data) {
    const headers = Object.keys(data.data);
    const rows = [headers.join(',')];
    
    // Simple CSV conversion for sample data
    headers.forEach(header => {
      const value = JSON.stringify(data.data[header]);
      rows.push(`${header},"${value}"`);
    });
    
    return rows.join('\n');
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      oldest_entry: Math.min(...Array.from(this.cache.values()).map(v => v.timestamp)),
      newest_entry: Math.max(...Array.from(this.cache.values()).map(v => v.timestamp))
    };
  }

  /**
   * Toggle between sample data mode and production mode
   */
  toggleSampleDataMode(enabled = null) {
    if (enabled === null) {
      this.sampleDataMode = !this.sampleDataMode;
    } else {
      this.sampleDataMode = enabled;
    }
    
    this.clearCache(); // Clear cache when switching modes
    
    console.log(`Sample data mode: ${this.sampleDataMode ? 'enabled' : 'disabled'}`);
    return this.sampleDataMode;
  }
}

// Initialize global API instance
const analyticsAPI = new AnalyticsAPI();

// Export for use in other modules
window.AnalyticsAPI = analyticsAPI;

// Export class for testing
window.AnalyticsAPIClass = AnalyticsAPI;