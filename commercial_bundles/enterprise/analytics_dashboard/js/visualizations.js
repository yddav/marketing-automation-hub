/**
 * Data Visualization Components
 * Agent C - Phase 2 Task 2.3
 * 
 * Chart.js based visualizations for analytics dashboard
 */

class AnalyticsVisualizations {
  constructor() {
    this.charts = {};
    this.colors = {
      primary: '#3B82F6',
      secondary: '#10B981',
      accent: '#F59E0B',
      danger: '#EF4444',
      instagram: '#E4405F',
      twitter: '#1DA1F2',
      facebook: '#1877F2',
      linkedin: '#0A66C2',
      email: '#6B7280',
      app_store: '#007AFF'
    };
    
    this.initializeCharts();
  }

  initializeCharts() {
    // Performance over time chart
    this.createPerformanceChart();
    
    // Platform performance pie chart
    this.createPlatformChart();
    
    // Platform detail chart
    this.createPlatformDetailChart();
    
    // Correlation heatmap
    this.createCorrelationChart();
  }

  /**
   * Create performance over time line chart
   */
  createPerformanceChart() {
    const ctx = document.getElementById('performanceChart').getContext('2d');
    
    this.charts.performance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [], // Will be populated with dates
        datasets: []
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: function(context) {
                const label = context.dataset.label || '';
                const value = context.parsed.y;
                const metric = document.getElementById('performanceMetric').value;
                
                if (metric.includes('rate')) {
                  return `${label}: ${(value * 100).toFixed(2)}%`;
                }
                return `${label}: ${value.toLocaleString()}`;
              }
            }
          }
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: 'Date'
            }
          },
          y: {
            display: true,
            title: {
              display: true,
              text: 'Value'
            },
            ticks: {
              callback: function(value) {
                const metric = document.getElementById('performanceMetric').value;
                if (metric.includes('rate')) {
                  return (value * 100).toFixed(1) + '%';
                }
                return value.toLocaleString();
              }
            }
          }
        }
      }
    });
  }

  /**
   * Create platform performance doughnut chart
   */
  createPlatformChart() {
    const ctx = document.getElementById('platformChart').getContext('2d');
    
    this.charts.platform = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: [
            this.colors.instagram,
            this.colors.twitter,
            this.colors.facebook,
            this.colors.linkedin,
            this.colors.email,
            this.colors.app_store
          ],
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.parsed;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${value.toLocaleString()} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }

  /**
   * Create platform detail bar chart
   */
  createPlatformDetailChart() {
    const ctx = document.getElementById('platformDetailChart').getContext('2d');
    
    this.charts.platformDetail = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: [],
        datasets: []
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Content Pieces'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Performance Metric'
            },
            ticks: {
              callback: function(value) {
                return (value * 100).toFixed(1) + '%';
              }
            }
          }
        }
      }
    });
  }

  /**
   * Create correlation heatmap
   */
  createCorrelationChart() {
    const ctx = document.getElementById('correlationChart').getContext('2d');
    
    // Custom heatmap implementation using Chart.js scatter plot
    this.charts.correlation = new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: []
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              title: function(context) {
                const point = context[0];
                return `${point.dataset.yLabel} vs ${point.dataset.xLabel}`;
              },
              label: function(context) {
                const correlation = context.parsed.correlation;
                return `Correlation: ${correlation.toFixed(3)}`;
              }
            }
          }
        },
        scales: {
          x: {
            type: 'category',
            labels: ['Instagram', 'Twitter', 'Facebook', 'LinkedIn', 'Email', 'App Store'],
            title: {
              display: true,
              text: 'Platform'
            }
          },
          y: {
            type: 'category',
            labels: ['Instagram', 'Twitter', 'Facebook', 'LinkedIn', 'Email', 'App Store'],
            title: {
              display: true,
              text: 'Platform'
            }
          }
        }
      }
    });
  }

  /**
   * Update performance chart with new data
   */
  updatePerformanceChart(data, metric) {
    const chart = this.charts.performance;
    const platforms = Object.keys(data);
    
    chart.data.labels = data[platforms[0]]?.dates || [];
    chart.data.datasets = platforms.map((platform, index) => ({
      label: this.formatPlatformName(platform),
      data: data[platform]?.[metric] || [],
      borderColor: this.getPlatformColor(platform),
      backgroundColor: this.getPlatformColor(platform, 0.1),
      tension: 0.4,
      fill: false
    }));
    
    // Update y-axis title
    chart.options.scales.y.title.text = this.formatMetricName(metric);
    
    chart.update('none');
  }

  /**
   * Update platform distribution chart
   */
  updatePlatformChart(data) {
    const chart = this.charts.platform;
    const platforms = Object.keys(data);
    
    chart.data.labels = platforms.map(p => this.formatPlatformName(p));
    chart.data.datasets[0].data = platforms.map(p => data[p]);
    chart.data.datasets[0].backgroundColor = platforms.map(p => this.getPlatformColor(p));
    
    chart.update('none');
  }

  /**
   * Update platform detail chart
   */
  updatePlatformDetailChart(data, platform) {
    const chart = this.charts.platformDetail;
    const contentPieces = Object.keys(data);
    
    chart.data.labels = contentPieces.map(c => this.truncateLabel(c, 20));
    chart.data.datasets = [{
      label: 'Engagement Rate',
      data: contentPieces.map(c => data[c].engagement_rate),
      backgroundColor: this.getPlatformColor(platform, 0.7),
      borderColor: this.getPlatformColor(platform),
      borderWidth: 1
    }, {
      label: 'Click-Through Rate',
      data: contentPieces.map(c => data[c].click_through_rate),
      backgroundColor: this.getPlatformColor(platform, 0.4),
      borderColor: this.getPlatformColor(platform),
      borderWidth: 1
    }];
    
    chart.update('none');
  }

  /**
   * Update correlation heatmap
   */
  updateCorrelationChart(correlationMatrix) {
    const chart = this.charts.correlation;
    const platforms = Object.keys(correlationMatrix);
    const datasets = [];
    
    platforms.forEach((platform1, i) => {
      platforms.forEach((platform2, j) => {
        const correlation = correlationMatrix[platform1][platform2];
        const color = this.getCorrelationColor(correlation);
        
        datasets.push({
          label: `${platform1}-${platform2}`,
          data: [{
            x: j,
            y: i,
            correlation: correlation
          }],
          backgroundColor: color,
          borderColor: color,
          pointRadius: 15,
          xLabel: this.formatPlatformName(platform2),
          yLabel: this.formatPlatformName(platform1)
        });
      });
    });
    
    chart.data.datasets = datasets;
    chart.update('none');
  }

  /**
   * Create A/B test comparison chart
   */
  createABTestChart(containerId, testData) {
    const container = document.getElementById(containerId);
    const canvas = document.createElement('canvas');
    canvas.id = `${containerId}Chart`;
    container.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    const variants = testData.variants;
    
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: variants.map(v => `Variant ${v.variant_id.toUpperCase()}`),
        datasets: [{
          label: 'Conversion Rate',
          data: variants.map(v => v.performance.conversion_rate || 0),
          backgroundColor: variants.map((v, i) => 
            i === 0 ? this.colors.primary : this.colors.secondary
          ),
          borderColor: variants.map((v, i) => 
            i === 0 ? this.colors.primary : this.colors.secondary
          ),
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const value = context.parsed.y;
                const variant = testData.variants[context.dataIndex];
                const significance = variant.statistical_significance || 0;
                return [
                  `Conversion Rate: ${(value * 100).toFixed(2)}%`,
                  `Statistical Significance: ${(significance * 100).toFixed(1)}%`
                ];
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return (value * 100).toFixed(1) + '%';
              }
            }
          }
        }
      }
    });
  }

  /**
   * Create sparkline chart for metric cards
   */
  createSparkline(containerId, data, color) {
    const canvas = document.getElementById(containerId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map((_, i) => i),
        datasets: [{
          data: data,
          borderColor: color,
          backgroundColor: color + '20',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            enabled: false
          }
        },
        scales: {
          x: {
            display: false
          },
          y: {
            display: false
          }
        },
        elements: {
          point: {
            radius: 0
          }
        }
      }
    });
  }

  // === UTILITY METHODS ===

  getPlatformColor(platform, alpha = 1) {
    const color = this.colors[platform] || this.colors.primary;
    if (alpha < 1) {
      // Convert hex to rgba
      const hex = color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    return color;
  }

  getCorrelationColor(correlation) {
    // Color scale from red (-1) to white (0) to green (1)
    if (correlation < 0) {
      const intensity = Math.abs(correlation);
      return `rgba(239, 68, 68, ${intensity})`;
    } else {
      const intensity = correlation;
      return `rgba(16, 185, 129, ${intensity})`;
    }
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

  formatMetricName(metric) {
    const names = {
      impressions: 'Impressions',
      engagement_rate: 'Engagement Rate (%)',
      click_through_rate: 'Click-Through Rate (%)',
      conversion_rate: 'Conversion Rate (%)',
      conversions: 'Conversions',
      reach: 'Reach',
      clicks: 'Clicks'
    };
    return names[metric] || metric;
  }

  truncateLabel(label, maxLength) {
    if (label.length <= maxLength) return label;
    return label.substring(0, maxLength - 3) + '...';
  }

  /**
   * Destroy all charts
   */
  destroyCharts() {
    Object.values(this.charts).forEach(chart => {
      if (chart && typeof chart.destroy === 'function') {
        chart.destroy();
      }
    });
    this.charts = {};
  }

  /**
   * Resize all charts
   */
  resizeCharts() {
    Object.values(this.charts).forEach(chart => {
      if (chart && typeof chart.resize === 'function') {
        chart.resize();
      }
    });
  }
}

// Initialize visualizations
const analyticsViz = new AnalyticsVisualizations();

// Handle window resize
window.addEventListener('resize', () => {
  analyticsViz.resizeCharts();
});

// Export for use in other modules
window.AnalyticsVisualizations = analyticsViz;