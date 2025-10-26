// Untrapd Hub - Analytics & Tracking
// Advanced analytics for security + automotive ecosystem

// Analytics Configuration
const ANALYTICS_CONFIG = {
    // Google Analytics 4 (replace with actual tracking ID)
    ga4_id: 'G-XXXXXXXXXX',
    
    // Mixpanel (replace with actual project token)
    mixpanel_token: 'your_mixpanel_token',
    
    // Custom analytics endpoint (for Supabase integration)
    custom_endpoint: '/api/analytics',
    
    // Event batching
    batch_size: 10,
    batch_timeout: 5000, // 5 seconds
    
    // Privacy settings
    respect_dnt: true, // Respect Do Not Track
    anonymize_ip: true
};

// Event queue for batching
let eventQueue = [];
let batchTimeout = null;

// Initialize analytics services
function initializeAnalyticsServices() {
    // Check for Do Not Track
    if (ANALYTICS_CONFIG.respect_dnt && navigator.doNotTrack === '1') {
        console.log('🚫 Analytics disabled - Do Not Track enabled');
        return;
    }
    
    initializeGA4();
    initializeMixpanel();
    initializeCustomAnalytics();
    
    console.log('📊 Analytics services initialized');
}

// Google Analytics 4 Integration
function initializeGA4() {
    if (!ANALYTICS_CONFIG.ga4_id || ANALYTICS_CONFIG.ga4_id === 'G-XXXXXXXXXX') {
        console.log('⚠️ GA4 not configured');
        return;
    }
    
    // Load GA4 script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${ANALYTICS_CONFIG.ga4_id}`;
    document.head.appendChild(script);
    
    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    gtag('js', new Date());
    
    // Configure GA4
    gtag('config', ANALYTICS_CONFIG.ga4_id, {
        anonymize_ip: ANALYTICS_CONFIG.anonymize_ip,
        send_page_view: false // We'll send manually for better control
    });
    
    window.gtag = gtag;
}

// Mixpanel Integration
function initializeMixpanel() {
    if (!ANALYTICS_CONFIG.mixpanel_token || ANALYTICS_CONFIG.mixpanel_token === 'your_mixpanel_token') {
        console.log('⚠️ Mixpanel not configured');
        return;
    }
    
    // Load Mixpanel script
    (function(c,a){if(!a.__SV){var b=window;try{var d,m,j,k=b.location,f=k.hash;d=function(a,b){return(m=a.match(RegExp(b+"=([^&]*)")))?m[1]:null};f&&d(f,"state")&&(j=JSON.parse(decodeURIComponent(d(f,"state"))),"mpeditor"===j.action&&(b.sessionStorage.setItem("_mpcehash",f),history.replaceState(j.desiredHash||"",c.title,k.pathname+k.search)))}catch(n){}var l,h;window.mixpanel=a;a._i=[];a.init=function(b,d,g){function c(b,i){var a=i.split(".");2==a.length&&(b=b[a[0]],i=a[1]);b[i]=function(){b.push([i].concat(Array.prototype.slice.call(arguments,0)))}}var e=a;"undefined"!==typeof g?e=a[g]=[]:g="mixpanel";e.people=e.people||[];e.toString=function(b){var a="mixpanel";"mixpanel"!==g&&(a+="."+g);b||(a+=" (stub)");return a};e.people.toString=function(){return e.toString(1)+".people (stub)"};l="disable time_event track track_pageview track_links track_forms track_with_groups add_group set_group remove_group register register_once alias unregister identify name_tag set_config reset opt_in_tracking opt_out_tracking has_opted_in_tracking has_opted_out_tracking clear_opt_in_out_tracking start_batch_senders people.set people.set_once people.unset people.increment people.append people.union people.track_charge people.clear_charges people.delete_user people.remove".split(" ");for(h=0;h<l.length;h++)c(e,l[h]);var f="set set_once union unset remove delete".split(" ");e.get_group=function(){function a(c){b[c]=function(){call2_args=arguments;call2=[c].concat(Array.prototype.slice.call(call2_args,0));e.push([d,call2])}}for(var b={},d=["get_group"].concat(Array.prototype.slice.call(arguments,0)),c=0;c<f.length;c++)a(f[c]);return b};a._i.push([b,d,g])};a.__SV=1.2})(document,window.mixpanel||[]);
    
    // Initialize Mixpanel
    mixpanel.init(ANALYTICS_CONFIG.mixpanel_token, {
        debug: false,
        track_pageview: false, // We'll track manually
        persistence: 'localStorage'
    });
}

// Custom Analytics (Supabase Integration)
function initializeCustomAnalytics() {
    // Set up custom analytics for Supabase
    window.customAnalytics = {
        enabled: true,
        userId: null,
        sessionId: generateSessionId()
    };
    
    // Store session info
    sessionStorage.setItem('untrapd_session_id', window.customAnalytics.sessionId);
}

// Enhanced event tracking with multiple services
function trackEvent(eventName, properties = {}) {
    // Add default properties
    const enrichedProperties = {
        ...properties,
        timestamp: new Date().toISOString(),
        session_id: window.customAnalytics?.sessionId,
        page_url: window.location.href,
        page_title: document.title,
        user_agent: navigator.userAgent,
        screen_resolution: `${screen.width}x${screen.height}`,
        viewport_size: `${window.innerWidth}x${window.innerHeight}`,
        referrer: document.referrer || 'direct'
    };
    
    // Track with GA4
    if (window.gtag) {
        gtag('event', eventName, enrichedProperties);
    }
    
    // Track with Mixpanel
    if (window.mixpanel && mixpanel.track) {
        mixpanel.track(eventName, enrichedProperties);
    }
    
    // Track with custom analytics
    trackCustomEvent(eventName, enrichedProperties);
    
    // Console log for debugging
    console.log('📊 Event Tracked:', eventName, enrichedProperties);
}

// Custom event tracking (Supabase)
function trackCustomEvent(eventName, properties) {
    if (!window.customAnalytics?.enabled) return;
    
    const event = {
        event_name: eventName,
        properties: properties,
        user_id: window.customAnalytics.userId,
        session_id: window.customAnalytics.sessionId,
        timestamp: new Date().toISOString()
    };
    
    // Add to queue for batching
    eventQueue.push(event);
    
    // Send batch if queue is full
    if (eventQueue.length >= ANALYTICS_CONFIG.batch_size) {
        sendEventBatch();
    } else {
        // Set timeout for batch sending
        if (batchTimeout) clearTimeout(batchTimeout);
        batchTimeout = setTimeout(sendEventBatch, ANALYTICS_CONFIG.batch_timeout);
    }
}

// Send event batch to custom analytics endpoint
async function sendEventBatch() {
    if (eventQueue.length === 0) return;
    
    const batch = [...eventQueue];
    eventQueue = [];
    
    if (batchTimeout) {
        clearTimeout(batchTimeout);
        batchTimeout = null;
    }
    
    try {
        const response = await fetch(ANALYTICS_CONFIG.custom_endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                events: batch,
                batch_id: generateBatchId(),
                timestamp: new Date().toISOString()
            })
        });
        
        if (!response.ok) {
            throw new Error(`Analytics API error: ${response.status}`);
        }
        
        console.log(`📊 Sent batch of ${batch.length} events`);
    } catch (error) {
        console.error('❌ Failed to send analytics batch:', error);
        
        // Store failed events locally for retry
        const failedEvents = JSON.parse(localStorage.getItem('failed_analytics_events') || '[]');
        failedEvents.push(...batch);
        localStorage.setItem('failed_analytics_events', JSON.stringify(failedEvents));
    }
}

// User identification
function identifyUser(userId, traits = {}) {
    window.customAnalytics.userId = userId;
    
    // GA4 user identification
    if (window.gtag) {
        gtag('config', ANALYTICS_CONFIG.ga4_id, {
            user_id: userId,
            custom_map: traits
        });
    }
    
    // Mixpanel identification
    if (window.mixpanel && mixpanel.identify) {
        mixpanel.identify(userId);
        mixpanel.people.set(traits);
    }
    
    // Track identification event
    trackEvent('user_identified', {
        user_id: userId,
        traits: traits
    });
}

// Page view tracking
function trackPageView(page = window.location.pathname, title = document.title) {
    const pageViewData = {
        page_location: window.location.href,
        page_path: page,
        page_title: title
    };
    
    // GA4 page view
    if (window.gtag) {
        gtag('event', 'page_view', pageViewData);
    }
    
    // Mixpanel page view
    if (window.mixpanel && mixpanel.track) {
        mixpanel.track('Page View', pageViewData);
    }
    
    // Custom page view tracking
    trackEvent('page_view', pageViewData);
}

// E-commerce tracking
function trackPurchase(transactionId, items, revenue, currency = 'USD') {
    const purchaseData = {
        transaction_id: transactionId,
        value: revenue,
        currency: currency,
        items: items
    };
    
    // GA4 purchase event
    if (window.gtag) {
        gtag('event', 'purchase', purchaseData);
    }
    
    // Mixpanel purchase tracking
    if (window.mixpanel && mixpanel.track) {
        mixpanel.track('Purchase', purchaseData);
        mixpanel.people.track_charge(revenue);
    }
    
    // Custom purchase tracking
    trackEvent('purchase', purchaseData);
}

// Conversion funnel tracking
function trackFunnelStep(funnelName, stepName, stepNumber, properties = {}) {
    const funnelData = {
        funnel_name: funnelName,
        step_name: stepName,
        step_number: stepNumber,
        ...properties
    };
    
    trackEvent('funnel_step', funnelData);
}

// A/B test tracking
function trackABTest(testName, variant, properties = {}) {
    const abTestData = {
        test_name: testName,
        variant: variant,
        ...properties
    };
    
    // Store A/B test info for session
    sessionStorage.setItem(`ab_test_${testName}`, variant);
    
    trackEvent('ab_test_impression', abTestData);
}

// Performance tracking
function trackPerformance() {
    if (!('performance' in window)) return;
    
    const perfData = performance.getEntriesByType('navigation')[0];
    const paintEntries = performance.getEntriesByType('paint');
    
    const performanceMetrics = {
        // Navigation timing
        dns_lookup: Math.round(perfData.domainLookupEnd - perfData.domainLookupStart),
        tcp_connection: Math.round(perfData.connectEnd - perfData.connectStart),
        server_response: Math.round(perfData.responseEnd - perfData.requestStart),
        dom_parsing: Math.round(perfData.domContentLoadedEventEnd - perfData.responseEnd),
        total_load_time: Math.round(perfData.loadEventEnd - perfData.fetchStart),
        
        // Paint timing
        first_paint: paintEntries.find(entry => entry.name === 'first-paint')?.startTime || 0,
        first_contentful_paint: paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
        
        // Core Web Vitals (if available)
        largest_contentful_paint: 0, // Will be updated by observer
        first_input_delay: 0, // Will be updated by observer
        cumulative_layout_shift: 0 // Will be updated by observer
    };
    
    trackEvent('performance_metrics', performanceMetrics);
    
    // Track Core Web Vitals
    trackCoreWebVitals();
}

// Core Web Vitals tracking
function trackCoreWebVitals() {
    // Largest Contentful Paint
    if ('PerformanceObserver' in window) {
        try {
            const lcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                
                trackEvent('core_web_vital', {
                    metric: 'largest_contentful_paint',
                    value: Math.round(lastEntry.startTime),
                    rating: lastEntry.startTime < 2500 ? 'good' : lastEntry.startTime < 4000 ? 'needs_improvement' : 'poor'
                });
            });
            
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (error) {
            console.warn('LCP observer not supported');
        }
        
        // First Input Delay
        try {
            const fidObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    trackEvent('core_web_vital', {
                        metric: 'first_input_delay',
                        value: Math.round(entry.processingStart - entry.startTime),
                        rating: entry.processingStart - entry.startTime < 100 ? 'good' : entry.processingStart - entry.startTime < 300 ? 'needs_improvement' : 'poor'
                    });
                });
            });
            
            fidObserver.observe({ entryTypes: ['first-input'] });
        } catch (error) {
            console.warn('FID observer not supported');
        }
        
        // Cumulative Layout Shift
        try {
            let clsValue = 0;
            const clsObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                });
                
                trackEvent('core_web_vital', {
                    metric: 'cumulative_layout_shift',
                    value: Math.round(clsValue * 1000) / 1000,
                    rating: clsValue < 0.1 ? 'good' : clsValue < 0.25 ? 'needs_improvement' : 'poor'
                });
            });
            
            clsObserver.observe({ entryTypes: ['layout-shift'] });
        } catch (error) {
            console.warn('CLS observer not supported');
        }
    }
}

// Error tracking
function trackError(error, context = {}) {
    const errorData = {
        error_message: error.message || 'Unknown error',
        error_stack: error.stack || 'No stack trace',
        error_filename: error.filename || 'Unknown file',
        error_line: error.lineno || 0,
        error_column: error.colno || 0,
        context: context
    };
    
    trackEvent('javascript_error', errorData);
}

// Utility functions
function generateSessionId() {
    return 'sess_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}

function generateBatchId() {
    return 'batch_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}

// Retry failed analytics events
function retryFailedEvents() {
    const failedEvents = JSON.parse(localStorage.getItem('failed_analytics_events') || '[]');
    
    if (failedEvents.length > 0) {
        console.log(`📊 Retrying ${failedEvents.length} failed analytics events`);
        
        // Add to current queue
        eventQueue.push(...failedEvents);
        
        // Clear failed events
        localStorage.removeItem('failed_analytics_events');
        
        // Send batch
        sendEventBatch();
    }
}

// Privacy controls
function optOutOfTracking() {
    // Set Do Not Track flag
    localStorage.setItem('untrapd_opt_out', 'true');
    
    // Disable custom analytics
    if (window.customAnalytics) {
        window.customAnalytics.enabled = false;
    }
    
    // GA4 opt-out
    if (window.gtag) {
        gtag('consent', 'update', {
            analytics_storage: 'denied'
        });
    }
    
    // Mixpanel opt-out
    if (window.mixpanel && mixpanel.opt_out_tracking) {
        mixpanel.opt_out_tracking();
    }
    
    console.log('🚫 Analytics tracking disabled');
}

function optInToTracking() {
    // Remove opt-out flag
    localStorage.removeItem('untrapd_opt_out');
    
    // Enable custom analytics
    if (window.customAnalytics) {
        window.customAnalytics.enabled = true;
    }
    
    // GA4 opt-in
    if (window.gtag) {
        gtag('consent', 'update', {
            analytics_storage: 'granted'
        });
    }
    
    // Mixpanel opt-in
    if (window.mixpanel && mixpanel.opt_in_tracking) {
        mixpanel.opt_in_tracking();
    }
    
    console.log('✅ Analytics tracking enabled');
}

// Check if user has opted out
function hasOptedOut() {
    return localStorage.getItem('untrapd_opt_out') === 'true' || navigator.doNotTrack === '1';
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', function() {
    if (!hasOptedOut()) {
        initializeAnalyticsServices();
        
        // Track initial page view
        setTimeout(() => {
            trackPageView();
            trackPerformance();
        }, 1000);
        
        // Retry failed events
        setTimeout(retryFailedEvents, 2000);
    }
});

// Send any remaining events before page unload
window.addEventListener('beforeunload', function() {
    if (eventQueue.length > 0) {
        sendEventBatch();
    }
});

// Export functions for global use
window.untrapdAnalytics = {
    track: trackEvent,
    identify: identifyUser,
    trackPageView: trackPageView,
    trackPurchase: trackPurchase,
    trackFunnelStep: trackFunnelStep,
    trackABTest: trackABTest,
    trackError: trackError,
    optOut: optOutOfTracking,
    optIn: optInToTracking,
    hasOptedOut: hasOptedOut
};