/**
 * A/B Testing Dashboard Component
 * Agent C - Phase 2 Task 2.3
 * 
 * A/B testing results visualization and management
 */

class ABTestingDashboard {
  constructor() {
    this.apiEndpoint = '/api/analytics/ab-tests';
    this.tests = [];
    this.activeTest = null;
    
    this.initializeComponents();
    this.bindEvents();
  }

  initializeComponents() {
    this.container = document.getElementById('abTestsList');
    this.filterSelect = document.getElementById('abTestFilter');
    this.newTestBtn = document.getElementById('newTestBtn');
    
    this.loadABTests();
  }

  bindEvents() {
    // Filter change
    this.filterSelect.addEventListener('change', () => {
      this.filterTests(this.filterSelect.value);
    });

    // New test button
    this.newTestBtn.addEventListener('click', () => {
      this.showNewTestModal();
    });

    // Auto-refresh tests every 30 seconds
    setInterval(() => {
      this.loadABTests();
    }, 30000);
  }

  /**
   * Load A/B tests from API
   */
  async loadABTests() {
    try {
      const response = await fetch(`${this.apiEndpoint}?status=all`);
      if (!response.ok) throw new Error('Failed to load A/B tests');
      
      const data = await response.json();
      this.tests = data.data || [];
      this.renderTests();
    } catch (error) {
      console.error('Error loading A/B tests:', error);
      this.showError('Failed to load A/B tests');
    }
  }

  /**
   * Filter tests by status
   */
  filterTests(status) {
    const filteredTests = status === 'all' 
      ? this.tests 
      : this.tests.filter(test => test.status === status);
    
    this.renderTests(filteredTests);
  }

  /**
   * Render A/B tests list
   */
  renderTests(tests = this.tests) {
    if (tests.length === 0) {
      this.container.innerHTML = `
        <div class="empty-state">
          <i data-lucide="flask" class="empty-icon"></i>
          <h4>No A/B Tests Found</h4>
          <p>Create your first A/B test to start optimizing your content performance.</p>
          <button class="btn-primary" onclick="window.ABTestingDashboard.showNewTestModal()">
            <i data-lucide="plus"></i>
            Create A/B Test
          </button>
        </div>
      `;
      lucide.createIcons();
      return;
    }

    this.container.innerHTML = tests.map(test => this.renderTestCard(test)).join('');
    lucide.createIcons();
    
    // Bind test-specific events
    this.bindTestEvents();
  }

  /**
   * Render individual test card
   */
  renderTestCard(test) {
    const statusClass = this.getStatusClass(test.status);
    const statusIcon = this.getStatusIcon(test.status);
    const winner = test.winner;
    const isCompleted = test.status === 'completed';
    
    return `
      <div class="ab-test-card" data-test-id="${test.test_id}">
        <div class="test-header">
          <div class="test-info">
            <h4 class="test-name">${test.test_name}</h4>
            <div class="test-meta">
              <span class="test-type">${this.formatTestType(test.test_type)}</span>
              <span class="test-duration">${this.formatDuration(test.start_date, test.end_date)}</span>
            </div>
          </div>
          <div class="test-status">
            <span class="status-badge ${statusClass}">
              <i data-lucide="${statusIcon}"></i>
              ${test.status}
            </span>
            <button class="test-actions-btn" data-test-id="${test.test_id}">
              <i data-lucide="more-horizontal"></i>
            </button>
          </div>
        </div>

        <div class="test-variants">
          ${test.variants.map((variant, index) => this.renderVariant(variant, index, winner)).join('')}
        </div>

        ${isCompleted && winner ? this.renderWinnerSummary(winner) : ''}

        <div class="test-metrics">
          <div class="metric-summary">
            <div class="metric-item">
              <span class="metric-label">Total Traffic</span>
              <span class="metric-value">${this.getTotalTraffic(test.variants)}</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">Conversion Rate</span>
              <span class="metric-value">${this.getAverageConversionRate(test.variants)}%</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">Statistical Significance</span>
              <span class="metric-value">${this.getMaxSignificance(test.variants)}%</span>
            </div>
          </div>
          
          <div class="test-actions">
            <button class="btn-secondary view-details-btn" data-test-id="${test.test_id}">
              View Details
            </button>
            ${test.status === 'running' ? `
              <button class="btn-danger pause-test-btn" data-test-id="${test.test_id}">
                Pause Test
              </button>
            ` : ''}
            ${test.status === 'paused' ? `
              <button class="btn-primary resume-test-btn" data-test-id="${test.test_id}">
                Resume Test
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render variant performance
   */
  renderVariant(variant, index, winner) {
    const isWinner = winner && winner.variant_id === variant.variant_id;
    const isControl = index === 0;
    const performance = variant.performance;
    const conversionRate = ((performance.conversions || 0) / (performance.clicks || 1) * 100).toFixed(2);
    const significance = (variant.statistical_significance * 100).toFixed(1);
    
    return `
      <div class="test-variant ${isWinner ? 'winner' : ''} ${isControl ? 'control' : ''}">
        <div class="variant-header">
          <span class="variant-label">
            Variant ${variant.variant_id.toUpperCase()}
            ${isControl ? '(Control)' : ''}
            ${isWinner ? '🏆 Winner' : ''}
          </span>
          <span class="variant-allocation">${(variant.traffic_allocation * 100).toFixed(0)}% traffic</span>
        </div>
        
        <div class="variant-metrics">
          <div class="variant-metric">
            <span class="metric-label">Impressions</span>
            <span class="metric-value">${(performance.impressions || 0).toLocaleString()}</span>
          </div>
          <div class="variant-metric">
            <span class="metric-label">Clicks</span>
            <span class="metric-value">${(performance.clicks || 0).toLocaleString()}</span>
          </div>
          <div class="variant-metric">
            <span class="metric-label">Conversions</span>
            <span class="metric-value">${(performance.conversions || 0).toLocaleString()}</span>
          </div>
          <div class="variant-metric">
            <span class="metric-label">Conv. Rate</span>
            <span class="metric-value">${conversionRate}%</span>
          </div>
        </div>
        
        <div class="variant-performance">
          <div class="performance-bar">
            <div class="performance-fill" style="width: ${Math.min(parseFloat(conversionRate) * 10, 100)}%"></div>
          </div>
          <span class="significance-badge ${significance > 95 ? 'high' : significance > 80 ? 'medium' : 'low'}">
            ${significance}% confidence
          </span>
        </div>
      </div>
    `;
  }

  /**
   * Render winner summary
   */
  renderWinnerSummary(winner) {
    return `
      <div class="winner-summary">
        <div class="winner-badge">
          <i data-lucide="trophy"></i>
          <span>Winner: Variant ${winner.variant_id.toUpperCase()}</span>
        </div>
        <div class="winner-stats">
          <span class="improvement">+${winner.improvement.toFixed(1)}% improvement</span>
          <span class="confidence">${(winner.confidence * 100).toFixed(1)}% confidence</span>
        </div>
      </div>
    `;
  }

  /**
   * Bind test-specific event handlers
   */
  bindTestEvents() {
    // View details buttons
    document.querySelectorAll('.view-details-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const testId = e.target.dataset.testId;
        this.showTestDetails(testId);
      });
    });

    // Pause test buttons
    document.querySelectorAll('.pause-test-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const testId = e.target.dataset.testId;
        this.pauseTest(testId);
      });
    });

    // Resume test buttons
    document.querySelectorAll('.resume-test-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const testId = e.target.dataset.testId;
        this.resumeTest(testId);
      });
    });

    // Test actions menus
    document.querySelectorAll('.test-actions-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const testId = e.target.dataset.testId;
        this.showTestActionsMenu(testId, e.target);
      });
    });
  }

  /**
   * Show test details modal
   */
  async showTestDetails(testId) {
    try {
      const response = await fetch(`${this.apiEndpoint}/${testId}/results`);
      if (!response.ok) throw new Error('Failed to load test results');
      
      const data = await response.json();
      const testDetails = data.data;
      
      this.renderTestDetailsModal(testDetails);
      
      // Track modal view
      trackEvent('ab_test_details_view', { test_id: testId });
    } catch (error) {
      console.error('Error loading test details:', error);
      this.showError('Failed to load test details');
    }
  }

  /**
   * Render test details modal
   */
  renderTestDetailsModal(test) {
    const modalHtml = `
      <div class="modal-overlay" id="testDetailsModal">
        <div class="modal-content large">
          <div class="modal-header">
            <h3>${test.test_name} - Detailed Results</h3>
            <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
              <i data-lucide="x"></i>
            </button>
          </div>
          
          <div class="modal-body">
            <div class="test-overview">
              <div class="overview-stats">
                <div class="stat-item">
                  <span class="stat-label">Test Type</span>
                  <span class="stat-value">${this.formatTestType(test.test_type)}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Duration</span>
                  <span class="stat-value">${this.formatDuration(test.start_date, test.end_date)}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Status</span>
                  <span class="stat-value">${test.status}</span>
                </div>
              </div>
            </div>
            
            <div class="detailed-results">
              <div class="results-chart">
                <canvas id="testResultsChart"></canvas>
              </div>
              
              <div class="variant-details">
                ${test.variants.map(variant => this.renderDetailedVariant(variant)).join('')}
              </div>
            </div>
            
            ${test.winner ? `
              <div class="winner-analysis">
                <h4>Winner Analysis</h4>
                <div class="analysis-content">
                  <p>Variant ${test.winner.variant_id.toUpperCase()} achieved a 
                     <strong>${test.winner.improvement.toFixed(1)}%</strong> improvement 
                     over the control with <strong>${(test.winner.confidence * 100).toFixed(1)}%</strong> 
                     statistical confidence.</p>
                  
                  <div class="recommendations">
                    <h5>Recommendations:</h5>
                    <ul>
                      <li>Implement the winning variant across all traffic</li>
                      <li>Apply similar changes to related content pieces</li>
                      <li>Plan follow-up tests to further optimize performance</li>
                    </ul>
                  </div>
                </div>
              </div>
            ` : ''}
          </div>
          
          <div class="modal-footer">
            <button class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">
              Close
            </button>
            <button class="btn-primary export-results-btn" data-test-id="${test.test_id}">
              Export Results
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    lucide.createIcons();
    
    // Create detailed chart
    setTimeout(() => {
      window.AnalyticsVisualizations.createABTestChart('testResultsChart', test);
    }, 100);
  }

  /**
   * Render detailed variant information
   */
  renderDetailedVariant(variant) {
    const performance = variant.performance;
    const ctr = ((performance.clicks || 0) / (performance.impressions || 1) * 100).toFixed(2);
    const conversionRate = ((performance.conversions || 0) / (performance.clicks || 1) * 100).toFixed(2);
    
    return `
      <div class="detailed-variant">
        <h5>Variant ${variant.variant_id.toUpperCase()}</h5>
        <div class="detailed-metrics">
          <div class="detailed-metric">
            <span class="label">Impressions:</span>
            <span class="value">${(performance.impressions || 0).toLocaleString()}</span>
          </div>
          <div class="detailed-metric">
            <span class="label">Clicks:</span>
            <span class="value">${(performance.clicks || 0).toLocaleString()}</span>
          </div>
          <div class="detailed-metric">
            <span class="label">Click-Through Rate:</span>
            <span class="value">${ctr}%</span>
          </div>
          <div class="detailed-metric">
            <span class="label">Conversions:</span>
            <span class="value">${(performance.conversions || 0).toLocaleString()}</span>
          </div>
          <div class="detailed-metric">
            <span class="label">Conversion Rate:</span>
            <span class="value">${conversionRate}%</span>
          </div>
          <div class="detailed-metric">
            <span class="label">Statistical Significance:</span>
            <span class="value">${(variant.statistical_significance * 100).toFixed(1)}%</span>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Show new test creation modal
   */
  showNewTestModal() {
    // This would open a modal for creating new A/B tests
    // For now, show a placeholder
    alert('New A/B Test creation modal would open here. This will be implemented by Agent A for social media automation.');
    
    trackEvent('ab_test_create_modal_open');
  }

  /**
   * Pause a running test
   */
  async pauseTest(testId) {
    try {
      const response = await fetch(`${this.apiEndpoint}/${testId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'paused' })
      });
      
      if (!response.ok) throw new Error('Failed to pause test');
      
      this.loadABTests(); // Refresh the list
      trackEvent('ab_test_paused', { test_id: testId });
    } catch (error) {
      console.error('Error pausing test:', error);
      this.showError('Failed to pause test');
    }
  }

  /**
   * Resume a paused test
   */
  async resumeTest(testId) {
    try {
      const response = await fetch(`${this.apiEndpoint}/${testId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'running' })
      });
      
      if (!response.ok) throw new Error('Failed to resume test');
      
      this.loadABTests(); // Refresh the list
      trackEvent('ab_test_resumed', { test_id: testId });
    } catch (error) {
      console.error('Error resuming test:', error);
      this.showError('Failed to resume test');
    }
  }

  // === UTILITY METHODS ===

  getStatusClass(status) {
    const classes = {
      running: 'status-running',
      completed: 'status-completed',
      paused: 'status-paused',
      cancelled: 'status-cancelled'
    };
    return classes[status] || 'status-default';
  }

  getStatusIcon(status) {
    const icons = {
      running: 'play-circle',
      completed: 'check-circle',
      paused: 'pause-circle',
      cancelled: 'x-circle'
    };
    return icons[status] || 'circle';
  }

  formatTestType(type) {
    const types = {
      content_variation: 'Content Variation',
      timing_test: 'Timing Test',
      audience_test: 'Audience Test',
      cta_test: 'CTA Test',
      subject_line_test: 'Subject Line Test'
    };
    return types[type] || type;
  }

  formatDuration(startDate, endDate) {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return `${days} days`;
  }

  getTotalTraffic(variants) {
    return variants.reduce((total, variant) => 
      total + (variant.performance.impressions || 0), 0
    ).toLocaleString();
  }

  getAverageConversionRate(variants) {
    const rates = variants.map(v => 
      (v.performance.conversions || 0) / (v.performance.clicks || 1) * 100
    );
    const average = rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
    return average.toFixed(2);
  }

  getMaxSignificance(variants) {
    const maxSig = Math.max(...variants.map(v => v.statistical_significance || 0));
    return (maxSig * 100).toFixed(0);
  }

  showError(message) {
    console.error(message);
    // Could show a toast notification here
  }
}

// Initialize A/B Testing Dashboard
const abTestingDashboard = new ABTestingDashboard();

// Export for global access
window.ABTestingDashboard = abTestingDashboard;