// Enhanced Analytics Integration
// Advanced tracking and optimization for marketing automation

class EnhancedAnalytics {
    constructor() {
        this.sessionData = {
            start_time: Date.now(),
            page_views: 1,
            interactions: 0,
            scroll_events: 0,
            form_interactions: 0
        };
        
        this.heatmapData = [];
        this.conversionFunnel = {
            page_load: Date.now(),
            section_views: {},
            form_starts: {},
            form_completions: {}
        };
        
        this.init();
    }

    init() {
        this.setupAdvancedTracking();
        this.setupHeatmapTracking();
        this.setupConversionFunnelTracking();
        this.setupPerformanceTracking();
        this.setupABTestingSupport();
        this.startSessionTracking();
    }

    // Advanced Event Tracking
    setupAdvancedTracking() {
        // Track all button clicks with context
        document.addEventListener('click', (e) => {
            if (e.target.matches('button, .btn, a[href*="signup"], a[href*="newsletter"]')) {
                this.trackInteraction('button_click', {
                    element_type: e.target.tagName.toLowerCase(),
                    element_text: e.target.textContent?.trim().substring(0, 100),
                    element_class: e.target.className,
                    href: e.target.href || null,
                    position: this.getElementPosition(e.target),
                    section: this.getCurrentSection()
                });
            }
        });

        // Track form interactions
        document.addEventListener('focus', (e) => {
            if (e.target.matches('input, textarea, select')) {
                const formName = e.target.closest('form')?.name || 'unknown';
                this.trackFormStart(formName);
                
                this.trackInteraction('form_field_focus', {
                    form_name: formName,
                    field_name: e.target.name || e.target.id,
                    field_type: e.target.type,
                    section: this.getCurrentSection()
                });
            }
        });

        // Track navigation events
        window.addEventListener('hashchange', () => {
            this.trackPageView(window.location.hash);
        });

        // Track exit intent
        document.addEventListener('mouseleave', (e) => {
            if (e.clientY <= 0) {
                this.trackExitIntent();
            }
        });
    }

    // Heatmap and Click Tracking
    setupHeatmapTracking() {
        document.addEventListener('click', (e) => {
            const rect = e.target.getBoundingClientRect();
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
            
            this.heatmapData.push({
                x: rect.left + scrollLeft + (rect.width / 2),
                y: rect.top + scrollTop + (rect.height / 2),
                timestamp: Date.now(),
                element: e.target.tagName,
                element_text: e.target.textContent?.trim().substring(0, 50),
                page_section: this.getCurrentSection(),
                viewport_width: window.innerWidth,
                viewport_height: window.innerHeight
            });

            // Send heatmap data periodically
            if (this.heatmapData.length >= 10) {
                this.sendHeatmapData();
            }
        });
    }

    // Conversion Funnel Tracking
    setupConversionFunnelTracking() {
        // Track section views for funnel analysis
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
                    const sectionId = entry.target.id;
                    if (!this.conversionFunnel.section_views[sectionId]) {
                        this.conversionFunnel.section_views[sectionId] = Date.now();
                        
                        this.trackFunnelStep('section_view', {
                            section: sectionId,
                            time_to_section: Date.now() - this.conversionFunnel.page_load,
                            scroll_position: window.scrollY
                        });
                    }
                }
            });
        }, { threshold: 0.5 });

        document.querySelectorAll('section[id]').forEach(section => {
            sectionObserver.observe(section);
        });

        // Track CTA visibility and interactions
        const ctaObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const ctaText = entry.target.textContent?.trim();
                    this.trackFunnelStep('cta_visible', {
                        cta_text: ctaText,
                        cta_position: this.getElementPosition(entry.target),
                        section: this.getCurrentSection()
                    });
                }
            });
        }, { threshold: 0.8 });

        document.querySelectorAll('.btn, button, a[href*="signup"]').forEach(cta => {
            ctaObserver.observe(cta);
        });
    }

    // Performance Tracking
    setupPerformanceTracking() {
        // Track page load performance
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                if (perfData) {
                    this.trackPerformance('page_load', {
                        load_time: perfData.loadEventEnd - perfData.loadEventStart,
                        dom_content_loaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                        first_paint: this.getFirstPaint(),
                        largest_contentful_paint: this.getLargestContentfulPaint(),
                        cumulative_layout_shift: this.getCumulativeLayoutShift()
                    });
                }
            }, 1000);
        });

        // Track Core Web Vitals
        this.trackCoreWebVitals();
    }

    // A/B Testing Support
    setupABTestingSupport() {
        // Check for A/B test parameters
        const urlParams = new URLSearchParams(window.location.search);
        const testVariant = urlParams.get('variant') || this.getABTestVariant();
        
        if (testVariant) {
            this.activeABTest = {
                test_name: urlParams.get('test') || 'default',
                variant: testVariant,
                start_time: Date.now()
            };
            
            // Track A/B test participation
            this.trackABTestParticipation(this.activeABTest);
            
            // Apply variant if needed
            this.applyABTestVariant(testVariant);
        }
    }

    // Session Tracking
    startSessionTracking() {
        // Send session data periodically
        setInterval(() => {
            this.updateSessionData();
            this.sendSessionData();
        }, 30000); // Every 30 seconds

        // Send data before page unload
        window.addEventListener('beforeunload', () => {
            this.sendFinalSessionData();
        });
    }

    // Core Tracking Methods
    trackInteraction(eventType, data = {}) {
        this.sessionData.interactions++;
        
        const interactionEvent = {
            event_type: eventType,
            timestamp: Date.now(),
            session_id: this.getSessionId(),
            user_id: this.getUserId(),
            data: {
                ...data,
                session_duration: Date.now() - this.sessionData.start_time,
                page_url: window.location.href,
                referrer: document.referrer,
                user_agent: navigator.userAgent
            }
        };

        // Send to analytics API
        this.sendAnalyticsEvent('interaction', interactionEvent);

        // Track for marketing automation
        this.sendToMarketingAutomation('user_interaction', interactionEvent);
    }

    trackPageView(section) {
        this.sessionData.page_views++;
        
        const pageViewEvent = {
            section: section,
            timestamp: Date.now(),
            session_id: this.getSessionId(),
            user_id: this.getUserId(),
            page_url: window.location.href,
            referrer: document.referrer,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            }
        };

        this.sendAnalyticsEvent('page_view', pageViewEvent);
    }

    trackFormStart(formName) {
        if (!this.conversionFunnel.form_starts[formName]) {
            this.conversionFunnel.form_starts[formName] = Date.now();
            this.sessionData.form_interactions++;
            
            this.trackFunnelStep('form_start', {
                form_name: formName,
                time_to_form: Date.now() - this.conversionFunnel.page_load
            });
        }
    }

    trackFunnelStep(step, data = {}) {
        const funnelEvent = {
            step: step,
            timestamp: Date.now(),
            session_id: this.getSessionId(),
            user_id: this.getUserId(),
            data: data
        };

        this.sendAnalyticsEvent('funnel_step', funnelEvent);
    }

    trackPerformance(metric, data = {}) {
        const performanceEvent = {
            metric: metric,
            timestamp: Date.now(),
            session_id: this.getSessionId(),
            user_id: this.getUserId(),
            data: data
        };

        this.sendAnalyticsEvent('performance', performanceEvent);
    }

    trackExitIntent() {
        const exitData = {
            time_on_page: Date.now() - this.sessionData.start_time,
            scroll_depth: this.getScrollDepth(),
            interactions: this.sessionData.interactions,
            sections_viewed: Object.keys(this.conversionFunnel.section_views).length,
            last_section: this.getCurrentSection()
        };

        this.trackInteraction('exit_intent', exitData);
    }

    // A/B Testing Methods
    trackABTestParticipation(testConfig) {
        const participationEvent = {
            test_name: testConfig.test_name,
            variant: testConfig.variant,
            timestamp: Date.now(),
            session_id: this.getSessionId(),
            user_id: this.getUserId()
        };

        this.sendAnalyticsEvent('ab_test_participation', participationEvent);
    }

    trackABTestConversion(conversionType) {
        if (this.activeABTest) {
            const conversionEvent = {
                test_name: this.activeABTest.test_name,
                variant: this.activeABTest.variant,
                conversion_type: conversionType,
                test_duration: Date.now() - this.activeABTest.start_time,
                timestamp: Date.now(),
                session_id: this.getSessionId(),
                user_id: this.getUserId()
            };

            this.sendAnalyticsEvent('ab_test_conversion', conversionEvent);
            
            // Send to A/B test API
            fetch('/api/analytics-api/ab-test-result', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(conversionEvent)
            }).catch(err => console.log('A/B test tracking failed:', err));
        }
    }

    getABTestVariant() {
        // Simple A/B test assignment based on user ID
        const userId = this.getUserId();
        const hash = this.simpleHash(userId);
        return hash % 2 === 0 ? 'A' : 'B';
    }

    applyABTestVariant(variant) {
        // Apply A/B test changes based on variant
        document.body.setAttribute('data-ab-variant', variant);
        
        // Example variant implementations
        if (variant === 'B') {
            // Variant B: Different CTA text
            const ctaButtons = document.querySelectorAll('.btn');
            ctaButtons.forEach(btn => {
                if (btn.textContent.includes('Subscribe')) {
                    btn.textContent = btn.textContent.replace('Subscribe', 'Join Now');
                }
            });
        }
    }

    // Data Transmission Methods
    sendAnalyticsEvent(eventType, eventData) {
        fetch('/api/analytics-api/track-event', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                event_name: eventType,
                user_id: eventData.user_id,
                session_id: eventData.session_id,
                parameters: eventData
            })
        }).catch(err => console.log('Analytics event failed:', err));
    }

    sendToMarketingAutomation(eventType, eventData) {
        // Send events to marketing automation system for real-time optimization
        if (window.marketingAutomationEndpoint) {
            fetch(window.marketingAutomationEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: eventType,
                    data: eventData,
                    timestamp: new Date().toISOString()
                })
            }).catch(err => console.log('Marketing automation event failed:', err));
        }
    }

    sendHeatmapData() {
        if (this.heatmapData.length > 0) {
            fetch('/api/analytics-api/heatmap-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    session_id: this.getSessionId(),
                    user_id: this.getUserId(),
                    clicks: this.heatmapData
                })
            }).catch(err => console.log('Heatmap data failed:', err));
            
            this.heatmapData = []; // Clear sent data
        }
    }

    updateSessionData() {
        this.sessionData.current_time = Date.now();
        this.sessionData.scroll_depth = this.getScrollDepth();
        this.sessionData.current_section = this.getCurrentSection();
    }

    sendSessionData() {
        fetch('/api/analytics-api/session-update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                session_id: this.getSessionId(),
                user_id: this.getUserId(),
                session_data: this.sessionData
            })
        }).catch(err => console.log('Session update failed:', err));
    }

    sendFinalSessionData() {
        this.updateSessionData();
        this.sessionData.session_end = Date.now();
        this.sessionData.total_duration = this.sessionData.session_end - this.sessionData.start_time;
        
        // Use sendBeacon for reliability on page unload
        const data = JSON.stringify({
            session_id: this.getSessionId(),
            user_id: this.getUserId(),
            session_data: this.sessionData,
            final: true
        });
        
        if (navigator.sendBeacon) {
            navigator.sendBeacon('/api/analytics-api/session-final', data);
        }
    }

    // Core Web Vitals Tracking
    trackCoreWebVitals() {
        // Largest Contentful Paint
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            this.trackPerformance('largest_contentful_paint', {
                value: lastEntry.startTime,
                element: lastEntry.element?.tagName
            });
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // First Input Delay
        new PerformanceObserver((entryList) => {
            const firstInput = entryList.getEntries()[0];
            this.trackPerformance('first_input_delay', {
                value: firstInput.processingStart - firstInput.startTime,
                event_type: firstInput.name
            });
        }).observe({ entryTypes: ['first-input'], buffered: true });

        // Cumulative Layout Shift
        let clsValue = 0;
        new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
                if (!entry.hadRecentInput) {
                    clsValue += entry.value;
                }
            }
            this.trackPerformance('cumulative_layout_shift', { value: clsValue });
        }).observe({ entryTypes: ['layout-shift'], buffered: true });
    }

    // Utility Methods
    getUserId() {
        let userId = localStorage.getItem('untrapd_user_id');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('untrapd_user_id', userId);
        }
        return userId;
    }

    getSessionId() {
        let sessionId = sessionStorage.getItem('untrapd_session_id');
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('untrapd_session_id', sessionId);
        }
        return sessionId;
    }

    getCurrentSection() {
        const hash = window.location.hash.slice(1);
        const sections = ['home', 'hub', 'app', 'shop', 'contact'];
        return sections.includes(hash) ? hash : 'home';
    }

    getElementPosition(element) {
        const rect = element.getBoundingClientRect();
        return {
            x: rect.left,
            y: rect.top,
            width: rect.width,
            height: rect.height
        };
    }

    getScrollDepth() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.body.scrollHeight - window.innerHeight;
        return Math.round((scrollTop / scrollHeight) * 100);
    }

    getFirstPaint() {
        const paintEntries = performance.getEntriesByType('paint');
        const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
        return firstPaint ? firstPaint.startTime : null;
    }

    getLargestContentfulPaint() {
        const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
        return lcpEntries.length > 0 ? lcpEntries[lcpEntries.length - 1].startTime : null;
    }

    getCumulativeLayoutShift() {
        let clsValue = 0;
        const clsEntries = performance.getEntriesByType('layout-shift');
        clsEntries.forEach(entry => {
            if (!entry.hadRecentInput) {
                clsValue += entry.value;
            }
        });
        return clsValue;
    }

    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash);
    }
}

// Initialize Enhanced Analytics
document.addEventListener('DOMContentLoaded', () => {
    window.enhancedAnalytics = new EnhancedAnalytics();
    
    // Global function for manual conversion tracking
    window.trackConversion = (type, properties) => {
        window.enhancedAnalytics.trackABTestConversion(type);
        window.enhancedAnalytics.trackInteraction('manual_conversion', {
            conversion_type: type,
            ...properties
        });
    };
});