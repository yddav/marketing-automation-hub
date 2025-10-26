/**
 * Cross-Platform Performance Correlation Tracker
 * Agent C - Phase 2 Task 2.3
 * 
 * Advanced analytics for tracking performance correlation across platforms
 */

class CrossPlatformCorrelationTracker {
  constructor() {
    this.apiEndpoint = '/api/analytics/correlation';
    this.platforms = ['instagram', 'twitter', 'facebook', 'linkedin', 'email', 'app_store'];
    this.metrics = ['engagement_rate', 'click_through_rate', 'conversion_rate', 'reach'];
    this.correlationData = {};
    this.insights = [];
    
    this.initializeTracker();
  }

  initializeTracker() {
    this.loadCorrelationData();
    this.setupRealTimeUpdates();
  }

  /**
   * Load correlation data from API
   */
  async loadCorrelationData(dateRange = '30d', metricType = 'engagement_rate') {
    try {
      const response = await fetch(`${this.apiEndpoint}?date_range=${dateRange}&metric_type=${metricType}`);
      if (!response.ok) throw new Error('Failed to load correlation data');
      
      const data = await response.json();
      
      this.correlationData = data.data || {};
      this.generateInsights();
      this.updateCorrelationVisualization();
      
      return this.correlationData;
    } catch (error) {
      console.error('Error loading correlation data:', error);
      return {};
    }
  }

  /**
   * Calculate correlation matrix between platforms
   */
  calculateCorrelationMatrix(performanceData) {
    const matrix = {};
    
    // Initialize matrix
    this.platforms.forEach(platform1 => {
      matrix[platform1] = {};
      this.platforms.forEach(platform2 => {
        matrix[platform1][platform2] = 0;
      });
    });

    // Calculate Pearson correlation coefficient for each platform pair
    this.platforms.forEach(platform1 => {
      this.platforms.forEach(platform2 => {
        if (platform1 === platform2) {
          matrix[platform1][platform2] = 1; // Perfect correlation with self
          return;
        }

        const data1 = performanceData[platform1] || [];
        const data2 = performanceData[platform2] || [];
        
        if (data1.length === 0 || data2.length === 0) {
          matrix[platform1][platform2] = 0;
          return;
        }

        const correlation = this.calculatePearsonCorrelation(data1, data2);
        matrix[platform1][platform2] = correlation;
      });
    });

    return matrix;
  }

  /**
   * Calculate Pearson correlation coefficient
   */
  calculatePearsonCorrelation(x, y) {
    const n = Math.min(x.length, y.length);
    if (n < 2) return 0;

    // Take only the overlapping data points
    const xData = x.slice(0, n);
    const yData = y.slice(0, n);

    // Calculate means
    const meanX = xData.reduce((sum, val) => sum + val, 0) / n;
    const meanY = yData.reduce((sum, val) => sum + val, 0) / n;

    // Calculate correlation components
    let numerator = 0;
    let sumXSquared = 0;
    let sumYSquared = 0;

    for (let i = 0; i < n; i++) {
      const xDiff = xData[i] - meanX;
      const yDiff = yData[i] - meanY;
      
      numerator += xDiff * yDiff;
      sumXSquared += xDiff * xDiff;
      sumYSquared += yDiff * yDiff;
    }

    const denominator = Math.sqrt(sumXSquared * sumYSquared);
    
    if (denominator === 0) return 0;
    
    return numerator / denominator;
  }

  /**
   * Generate actionable insights from correlation data
   */
  generateInsights() {
    this.insights = [];
    const matrix = this.correlationData.correlation_matrix || {};
    
    // Find strong positive correlations (> 0.7)
    const strongCorrelations = [];
    this.platforms.forEach(platform1 => {
      this.platforms.forEach(platform2 => {
        if (platform1 !== platform2) {
          const correlation = matrix[platform1]?.[platform2] || 0;
          if (correlation > 0.7) {
            strongCorrelations.push({
              platform1,
              platform2,
              correlation,
              type: 'strong_positive'
            });
          }
        }
      });
    });

    // Find strong negative correlations (< -0.5)
    const negativeCorrelations = [];
    this.platforms.forEach(platform1 => {
      this.platforms.forEach(platform2 => {
        if (platform1 !== platform2) {
          const correlation = matrix[platform1]?.[platform2] || 0;
          if (correlation < -0.5) {
            negativeCorrelations.push({
              platform1,
              platform2,
              correlation,
              type: 'strong_negative'
            });
          }
        }
      });
    });

    // Generate insights for strong correlations
    strongCorrelations.forEach(corr => {
      this.insights.push({
        type: 'opportunity',
        title: 'Cross-Platform Synergy Detected',
        description: `Strong positive correlation (${(corr.correlation * 100).toFixed(1)}%) between ${this.formatPlatformName(corr.platform1)} and ${this.formatPlatformName(corr.platform2)}. Content that performs well on one platform likely performs well on the other.`,
        recommendation: `Consider synchronized campaigns and consistent messaging across ${this.formatPlatformName(corr.platform1)} and ${this.formatPlatformName(corr.platform2)}.`,
        priority: 'high',
        platforms: [corr.platform1, corr.platform2]
      });
    });

    // Generate insights for negative correlations
    negativeCorrelations.forEach(corr => {
      this.insights.push({
        type: 'warning',
        title: 'Platform Performance Divergence',
        description: `Negative correlation (${(corr.correlation * 100).toFixed(1)}%) between ${this.formatPlatformName(corr.platform1)} and ${this.formatPlatformName(corr.platform2)}. Different content strategies may be needed.`,
        recommendation: `Develop platform-specific content strategies for ${this.formatPlatformName(corr.platform1)} and ${this.formatPlatformName(corr.platform2)}.`,
        priority: 'medium',
        platforms: [corr.platform1, corr.platform2]
      });
    });

    // Find best performing platform combinations
    const bestCombinations = this.findBestPlatformCombinations(matrix);
    bestCombinations.forEach(combo => {
      this.insights.push({
        type: 'insight',
        title: 'Optimal Platform Combination',
        description: `The combination of ${combo.platforms.map(p => this.formatPlatformName(p)).join(', ')} shows the highest average correlation (${(combo.averageCorrelation * 100).toFixed(1)}%).`,
        recommendation: `Focus budget and efforts on this platform combination for maximum impact.`,
        priority: 'high',
        platforms: combo.platforms
      });
    });

    // Update insights display
    this.updateInsightsDisplay();
  }

  /**
   * Find best performing platform combinations
   */
  findBestPlatformCombinations(matrix) {
    const combinations = [];
    
    // Generate all possible 2-platform combinations
    for (let i = 0; i < this.platforms.length; i++) {
      for (let j = i + 1; j < this.platforms.length; j++) {
        const platform1 = this.platforms[i];
        const platform2 = this.platforms[j];
        const correlation = matrix[platform1]?.[platform2] || 0;
        
        combinations.push({
          platforms: [platform1, platform2],
          averageCorrelation: Math.abs(correlation)
        });
      }
    }

    // Sort by correlation strength and return top 3
    return combinations
      .sort((a, b) => b.averageCorrelation - a.averageCorrelation)
      .slice(0, 3);
  }

  /**
   * Track performance impact across platforms
   */
  trackCrossPlatformImpact(contentId, primaryPlatform, metrics) {
    const impactData = {
      content_id: contentId,
      primary_platform: primaryPlatform,
      timestamp: new Date().toISOString(),
      cross_platform_metrics: {}
    };

    // Track how performance on primary platform affects others
    this.platforms.forEach(platform => {
      if (platform !== primaryPlatform) {
        const platformMetrics = metrics[platform] || {};
        impactData.cross_platform_metrics[platform] = {
          engagement_spillover: this.calculateEngagementSpillover(primaryPlatform, platform, metrics),
          traffic_attribution: this.calculateTrafficAttribution(primaryPlatform, platform, metrics),
          conversion_lift: this.calculateConversionLift(primaryPlatform, platform, metrics)
        };
      }
    });

    // Send to analytics API
    this.recordCrossPlatformImpact(impactData);
    
    return impactData;
  }

  /**
   * Calculate engagement spillover effect
   */
  calculateEngagementSpillover(primaryPlatform, secondaryPlatform, metrics) {
    const primaryEngagement = metrics[primaryPlatform]?.engagement_rate || 0;
    const secondaryEngagement = metrics[secondaryPlatform]?.engagement_rate || 0;
    const expectedSpillover = this.correlationData.correlation_matrix?.[primaryPlatform]?.[secondaryPlatform] || 0;
    const actualSpillover = secondaryEngagement / (primaryEngagement || 1);
    
    return {
      expected: expectedSpillover,
      actual: actualSpillover,
      variance: actualSpillover - expectedSpillover
    };
  }

  /**
   * Calculate traffic attribution between platforms
   */
  calculateTrafficAttribution(primaryPlatform, secondaryPlatform, metrics) {
    const primaryTraffic = metrics[primaryPlatform]?.clicks || 0;
    const secondaryTraffic = metrics[secondaryPlatform]?.clicks || 0;
    const totalTraffic = primaryTraffic + secondaryTraffic;
    
    return {
      primary_contribution: totalTraffic > 0 ? primaryTraffic / totalTraffic : 0,
      secondary_contribution: totalTraffic > 0 ? secondaryTraffic / totalTraffic : 0,
      attribution_ratio: secondaryTraffic / (primaryTraffic || 1)
    };
  }

  /**
   * Calculate conversion lift from cross-platform presence
   */
  calculateConversionLift(primaryPlatform, secondaryPlatform, metrics) {
    const primaryConversions = metrics[primaryPlatform]?.conversions || 0;
    const secondaryConversions = metrics[secondaryPlatform]?.conversions || 0;
    const expectedLift = this.correlationData.conversion_multiplier?.[secondaryPlatform] || 1;
    const actualLift = (primaryConversions + secondaryConversions) / (primaryConversions || 1);
    
    return {
      expected: expectedLift,
      actual: actualLift,
      lift_percentage: ((actualLift - 1) * 100).toFixed(2)
    };
  }

  /**
   * Update correlation visualization
   */
  updateCorrelationVisualization() {
    const matrix = this.correlationData.correlation_matrix || {};
    
    if (window.AnalyticsVisualizations) {
      window.AnalyticsVisualizations.updateCorrelationChart(matrix);
    }
  }

  /**
   * Update insights display
   */
  updateInsightsDisplay() {
    const container = document.getElementById('correlationInsights');
    if (!container) return;

    if (this.insights.length === 0) {
      container.innerHTML = `
        <div class="no-insights">
          <i data-lucide="info"></i>
          <p>Analyzing cross-platform correlations...</p>
        </div>
      `;
      return;
    }

    container.innerHTML = this.insights.map(insight => `
      <div class="insight-item ${insight.type}">
        <div class="insight-header">
          <i data-lucide="${this.getInsightIcon(insight.type)}"></i>
          <h5>${insight.title}</h5>
          <span class="priority-badge ${insight.priority}">${insight.priority}</span>
        </div>
        <p class="insight-description">${insight.description}</p>
        <p class="insight-recommendation"><strong>Recommendation:</strong> ${insight.recommendation}</p>
        <div class="insight-platforms">
          ${insight.platforms.map(platform => `
            <span class="platform-tag" style="background-color: ${this.getPlatformColor(platform)}20; color: ${this.getPlatformColor(platform)}">
              ${this.formatPlatformName(platform)}
            </span>
          `).join('')}
        </div>
      </div>
    `).join('');

    lucide.createIcons();
  }

  /**
   * Setup real-time correlation updates
   */
  setupRealTimeUpdates() {
    // Update correlations every 5 minutes
    setInterval(() => {
      const currentMetric = document.getElementById('correlationMetric')?.value || 'engagement_rate';
      this.loadCorrelationData('30d', currentMetric);
    }, 300000); // 5 minutes

    // Listen for correlation metric changes
    const correlationMetricSelect = document.getElementById('correlationMetric');
    if (correlationMetricSelect) {
      correlationMetricSelect.addEventListener('change', (e) => {
        this.loadCorrelationData('30d', e.target.value);
        
        // Track metric change
        trackEvent('correlation_metric_changed', {
          new_metric: e.target.value
        });
      });
    }
  }

  /**
   * Record cross-platform impact data
   */
  async recordCrossPlatformImpact(impactData) {
    try {
      await fetch('/api/analytics/cross-platform-impact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(impactData)
      });
    } catch (error) {
      console.error('Error recording cross-platform impact:', error);
    }
  }

  /**
   * Generate correlation report
   */
  generateCorrelationReport(dateRange = '30d') {
    const report = {
      generated_at: new Date().toISOString(),
      date_range: dateRange,
      correlation_matrix: this.correlationData.correlation_matrix || {},
      insights: this.insights,
      summary: {
        strongest_correlation: this.findStrongestCorrelation(),
        weakest_correlation: this.findWeakestCorrelation(),
        average_correlation: this.calculateAverageCorrelation(),
        platform_rankings: this.calculatePlatformRankings()
      },
      recommendations: this.generateRecommendations()
    };

    return report;
  }

  // === UTILITY METHODS ===

  formatPlatformName(platform) {
    const names = {
      instagram: 'Instagram',
      twitter: 'Twitter',
      facebook: 'Facebook',
      linkedin: 'LinkedIn',
      email: 'Email',
      app_store: 'App Store'
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

  getInsightIcon(type) {
    const icons = {
      opportunity: 'trending-up',
      warning: 'alert-triangle',
      insight: 'lightbulb'
    };
    return icons[type] || 'info';
  }

  findStrongestCorrelation() {
    const matrix = this.correlationData.correlation_matrix || {};
    let strongest = { platforms: [], correlation: 0 };

    this.platforms.forEach(platform1 => {
      this.platforms.forEach(platform2 => {
        if (platform1 !== platform2) {
          const correlation = Math.abs(matrix[platform1]?.[platform2] || 0);
          if (correlation > strongest.correlation) {
            strongest = {
              platforms: [platform1, platform2],
              correlation
            };
          }
        }
      });
    });

    return strongest;
  }

  findWeakestCorrelation() {
    const matrix = this.correlationData.correlation_matrix || {};
    let weakest = { platforms: [], correlation: 1 };

    this.platforms.forEach(platform1 => {
      this.platforms.forEach(platform2 => {
        if (platform1 !== platform2) {
          const correlation = Math.abs(matrix[platform1]?.[platform2] || 0);
          if (correlation < weakest.correlation) {
            weakest = {
              platforms: [platform1, platform2],
              correlation
            };
          }
        }
      });
    });

    return weakest;
  }

  calculateAverageCorrelation() {
    const matrix = this.correlationData.correlation_matrix || {};
    let total = 0;
    let count = 0;

    this.platforms.forEach(platform1 => {
      this.platforms.forEach(platform2 => {
        if (platform1 !== platform2) {
          total += Math.abs(matrix[platform1]?.[platform2] || 0);
          count++;
        }
      });
    });

    return count > 0 ? total / count : 0;
  }

  calculatePlatformRankings() {
    const matrix = this.correlationData.correlation_matrix || {};
    const rankings = {};

    this.platforms.forEach(platform => {
      let totalCorrelation = 0;
      let count = 0;

      this.platforms.forEach(otherPlatform => {
        if (platform !== otherPlatform) {
          totalCorrelation += Math.abs(matrix[platform]?.[otherPlatform] || 0);
          count++;
        }
      });

      rankings[platform] = count > 0 ? totalCorrelation / count : 0;
    });

    return Object.entries(rankings)
      .sort(([,a], [,b]) => b - a)
      .map(([platform, score]) => ({ platform, score }));
  }

  generateRecommendations() {
    const recommendations = [];
    const rankings = this.calculatePlatformRankings();

    // Recommend focusing on top performing platforms
    if (rankings.length > 0) {
      const topPlatform = rankings[0];
      recommendations.push({
        type: 'focus',
        title: 'Focus on High-Correlation Platform',
        description: `${this.formatPlatformName(topPlatform.platform)} shows the highest average correlation (${(topPlatform.score * 100).toFixed(1)}%) with other platforms.`,
        action: 'Increase investment and content frequency on this platform.'
      });
    }

    // Recommend cross-platform campaigns for highly correlated platforms
    const strongCorrelations = this.insights.filter(i => i.type === 'opportunity');
    if (strongCorrelations.length > 0) {
      recommendations.push({
        type: 'campaign',
        title: 'Launch Cross-Platform Campaigns',
        description: 'Several platform pairs show strong positive correlations.',
        action: 'Design synchronized campaigns that leverage these correlations for maximum impact.'
      });
    }

    return recommendations;
  }
}

// Initialize Cross-Platform Correlation Tracker
const correlationTracker = new CrossPlatformCorrelationTracker();

// Export for global access
window.CrossPlatformCorrelationTracker = correlationTracker;