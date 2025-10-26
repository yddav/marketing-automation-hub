/**
 * User Engagement Tracking System
 * Agent C - Phase 2 Task 2.3
 * 
 * Real-time user engagement tracking across all platforms
 */

class EngagementTracker {
  constructor(config = {}) {
    this.apiEndpoint = config.apiEndpoint || '/api/analytics/events';
    this.batchSize = config.batchSize || 10;
    this.flushInterval = config.flushInterval || 5000; // 5 seconds
    this.eventQueue = [];
    this.sessionId = this.generateSessionId();
    this.userId = this.getUserId();
    this.startTime = Date.now();
    
    this.init();
  }

  init() {
    // Start periodic batch flush
    setInterval(() => this.flushEvents(), this.flushInterval);
    
    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackEvent('page_hidden', { duration: Date.now() - this.startTime });
      } else {
        this.trackEvent('page_visible');
        this.startTime = Date.now();
      }
    });
    
    // Track page unload
    window.addEventListener('beforeunload', () => {
      this.flushEvents(true); // Force immediate flush
    });
    
    // Initialize platform-specific tracking
    this.initializePlatformTracking();
  }

  /**
   * Track a user engagement event
   * @param {string} eventType - Type of event (view, click, like, share, etc.)
   * @param {Object} properties - Additional event properties
   * @param {string} contentId - ID of content that triggered the event
   */
  trackEvent(eventType, properties = {}, contentId = null) {
    const event = {
      user_id: this.userId,
      session_id: this.sessionId,
      platform: this.getPlatform(),
      timestamp: new Date().toISOString(),
      event_type: eventType,
      content_id: contentId,
      event_properties: {
        ...properties,
        user_agent: navigator.userAgent,
        device_type: this.getDeviceType(),
        referrer: document.referrer,
        url: window.location.href,
        viewport_width: window.innerWidth,
        viewport_height: window.innerHeight
      },
      user_properties: {
        first_visit: this.isFirstVisit(),
        user_segment: this.getUserSegment(),
        acquisition_channel: this.getAcquisitionChannel(),
        session_duration: Date.now() - this.startTime
      }
    };

    this.eventQueue.push(event);
    
    // Flush immediately for critical events
    if (this.isCriticalEvent(eventType)) {
      this.flushEvents(true);
    }
    
    // Auto-flush if batch size reached
    if (this.eventQueue.length >= this.batchSize) {
      this.flushEvents();
    }
  }

  /**
   * Track content view with detailed metrics
   */
  trackContentView(contentId, properties = {}) {
    this.trackEvent('view', {
      view_start: Date.now(),
      scroll_depth: 0,
      ...properties
    }, contentId);
    
    // Track scroll depth
    this.trackScrollDepth(contentId);
  }

  /**
   * Track content interaction (like, share, comment, save)
   */
  trackContentInteraction(type, contentId, properties = {}) {
    this.trackEvent(type, {
      interaction_time: Date.now(),
      ...properties
    }, contentId);
  }

  /**
   * Track email engagement
   */
  trackEmailEvent(type, emailId, properties = {}) {
    this.trackEvent(`email_${type}`, {
      email_id: emailId,
      ...properties
    });
  }

  /**
   * Track A/B test participation
   */
  trackABTestView(testId, variantId, contentId) {
    this.trackEvent('ab_test_view', {
      test_id: testId,
      variant_id: variantId,
      assigned_at: Date.now()
    }, contentId);
  }

  /**
   * Track conversion events
   */
  trackConversion(type, value = null, properties = {}) {
    this.trackEvent('conversion', {
      conversion_type: type,
      conversion_value: value,
      conversion_time: Date.now(),
      ...properties
    });
  }

  /**
   * Track app download events
   */
  trackAppDownload(source, contentId = null) {
    this.trackEvent('app_download', {
      download_source: source,
      download_time: Date.now()
    }, contentId);
  }

  /**
   * Track scroll depth for content engagement
   */
  trackScrollDepth(contentId) {
    let maxScroll = 0;
    let scrollCheckpoints = [0.25, 0.5, 0.75, 1.0];
    let triggeredCheckpoints = new Set();

    const handleScroll = () => {
      const scrollPercent = (window.scrollY + window.innerHeight) / document.body.scrollHeight;
      maxScroll = Math.max(maxScroll, scrollPercent);

      scrollCheckpoints.forEach(checkpoint => {
        if (scrollPercent >= checkpoint && !triggeredCheckpoints.has(checkpoint)) {
          triggeredCheckpoints.add(checkpoint);
          this.trackEvent('scroll_checkpoint', {
            checkpoint: checkpoint * 100,
            scroll_depth: scrollPercent
          }, contentId);
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    
    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
      window.removeEventListener('scroll', handleScroll);
      if (maxScroll > 0) {
        this.trackEvent('final_scroll_depth', {
          max_scroll_depth: maxScroll
        }, contentId);
      }
    });
  }

  /**
   * Initialize platform-specific tracking
   */
  initializePlatformTracking() {
    const platform = this.getPlatform();
    
    switch (platform) {
      case 'website':
        this.initWebsiteTracking();
        break;
      case 'mobile_app':
        this.initMobileAppTracking();
        break;
      case 'email':
        this.initEmailTracking();
        break;
    }
  }

  /**
   * Website-specific tracking initialization
   */
  initWebsiteTracking() {
    // Track clicks on CTA buttons
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-cta]')) {
        this.trackEvent('cta_click', {
          cta_type: e.target.dataset.cta,
          cta_text: e.target.textContent,
          button_position: this.getElementPosition(e.target)
        });
      }
      
      // Track external link clicks
      if (e.target.matches('a[href^="http"]')) {
        this.trackEvent('external_link_click', {
          destination: e.target.href,
          link_text: e.target.textContent
        });
      }
    });

    // Track form interactions
    document.addEventListener('submit', (e) => {
      if (e.target.matches('form[data-track]')) {
        this.trackEvent('form_submit', {
          form_type: e.target.dataset.track,
          form_fields: this.getFormFields(e.target)
        });
      }
    });

    // Track time on page
    this.trackTimeOnPage();
  }

  /**
   * Email tracking initialization
   */
  initEmailTracking() {
    // Track email opens (pixel tracking)
    const trackingPixel = document.createElement('img');
    trackingPixel.src = `${this.apiEndpoint}/email-open?user_id=${this.userId}&email_id=${this.getEmailId()}`;
    trackingPixel.style.display = 'none';
    document.body.appendChild(trackingPixel);

    // Track link clicks in emails
    document.addEventListener('click', (e) => {
      if (e.target.matches('a')) {
        this.trackEmailEvent('click', this.getEmailId(), {
          link_url: e.target.href,
          link_text: e.target.textContent
        });
      }
    });
  }

  /**
   * Track time spent on page
   */
  trackTimeOnPage() {
    let startTime = Date.now();
    let isActive = true;

    // Track when user becomes inactive
    ['blur', 'focusout'].forEach(event => {
      window.addEventListener(event, () => {
        if (isActive) {
          this.trackEvent('session_pause', {
            active_time: Date.now() - startTime
          });
          isActive = false;
        }
      });
    });

    // Track when user becomes active again
    ['focus', 'focusin'].forEach(event => {
      window.addEventListener(event, () => {
        if (!isActive) {
          startTime = Date.now();
          this.trackEvent('session_resume');
          isActive = true;
        }
      });
    });
  }

  /**
   * Flush events to server
   */
  async flushEvents(force = false) {
    if (this.eventQueue.length === 0) return;
    
    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(events)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log(`Flushed ${events.length} events`);
    } catch (error) {
      console.error('Failed to flush events:', error);
      
      // Re-queue events if not a force flush
      if (!force) {
        this.eventQueue.unshift(...events);
      }
    }
  }

  // === UTILITY METHODS ===

  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  getUserId() {
    // Check for existing user ID in localStorage
    let userId = localStorage.getItem('analytics_user_id');
    if (!userId) {
      userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('analytics_user_id', userId);
    }
    return userId;
  }

  getPlatform() {
    // Detect platform based on URL or user agent
    const url = window.location.href;
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (url.includes('utm_source=email')) return 'email';
    if (userAgent.includes('mobile')) return 'mobile_app';
    return 'website';
  }

  getDeviceType() {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('mobile')) return 'mobile';
    if (userAgent.includes('tablet')) return 'tablet';
    return 'desktop';
  }

  isFirstVisit() {
    return !localStorage.getItem('analytics_user_id_created');
  }

  getUserSegment() {
    const visitCount = parseInt(localStorage.getItem('visit_count') || '0');
    const lastVisit = localStorage.getItem('last_visit');
    const now = Date.now();
    const daysSinceLastVisit = lastVisit ? (now - parseInt(lastVisit)) / (1000 * 60 * 60 * 24) : 0;

    if (visitCount === 0) return 'new_user';
    if (daysSinceLastVisit > 30) return 'churned_user';
    if (visitCount > 10) return 'power_user';
    return 'returning_user';
  }

  getAcquisitionChannel() {
    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get('utm_source');
    const referrer = document.referrer;

    if (utmSource) {
      if (utmSource.includes('social')) return 'paid_social';
      if (utmSource === 'email') return 'email';
      return utmSource;
    }

    if (referrer) {
      if (referrer.includes('google') || referrer.includes('bing')) return 'search';
      if (referrer.includes('facebook') || referrer.includes('twitter') || referrer.includes('instagram')) return 'organic_social';
      return 'referral';
    }

    return 'direct';
  }

  isCriticalEvent(eventType) {
    const criticalEvents = ['conversion', 'app_download', 'purchase', 'signup'];
    return criticalEvents.includes(eventType);
  }

  getElementPosition(element) {
    const rect = element.getBoundingClientRect();
    return {
      x: rect.left + window.scrollX,
      y: rect.top + window.scrollY,
      viewport_x: rect.left,
      viewport_y: rect.top
    };
  }

  getFormFields(form) {
    const fields = {};
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      if (input.name && input.type !== 'password') {
        fields[input.name] = input.type;
      }
    });
    return fields;
  }

  getEmailId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('email_id') || 'unknown';
  }
}

// === GLOBAL ENGAGEMENT TRACKER INSTANCE ===

// Initialize global tracker
window.EngagementTracker = new EngagementTracker({
  apiEndpoint: '/api/analytics/events',
  batchSize: 10,
  flushInterval: 5000
});

// Expose tracking methods globally for easy use
window.trackEvent = (type, properties, contentId) => {
  window.EngagementTracker.trackEvent(type, properties, contentId);
};

window.trackContentView = (contentId, properties) => {
  window.EngagementTracker.trackContentView(contentId, properties);
};

window.trackContentInteraction = (type, contentId, properties) => {
  window.EngagementTracker.trackContentInteraction(type, contentId, properties);
};

window.trackConversion = (type, value, properties) => {
  window.EngagementTracker.trackConversion(type, value, properties);
};

window.trackAppDownload = (source, contentId) => {
  window.EngagementTracker.trackAppDownload(source, contentId);
};

// === READY STATE INITIALIZATION ===

document.addEventListener('DOMContentLoaded', () => {
  // Track page view on load
  window.trackEvent('page_view', {
    page_title: document.title,
    page_url: window.location.href,
    load_time: Date.now()
  });

  // Update visit tracking
  const visitCount = parseInt(localStorage.getItem('visit_count') || '0') + 1;
  localStorage.setItem('visit_count', visitCount.toString());
  localStorage.setItem('last_visit', Date.now().toString());
});

export default EngagementTracker;