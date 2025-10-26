/**
 * UNTRAPD Landing Page Script
 * Premium redirect experience with analytics tracking
 * Performance optimized for <50KB bundle
 */

(function() {
    'use strict';
    
    // Configuration
    const CONFIG = {
        REDIRECT_URL: 'https://hub.untrapd.com',
        REDIRECT_DELAY: 3000, // 3 seconds
        PROGRESS_STEPS: [
            { progress: 10, text: 'Initializing...', delay: 100 },
            { progress: 25, text: 'Loading UNTRAPD Hub...', delay: 300 },
            { progress: 50, text: 'Preparing Experience...', delay: 800 },
            { progress: 75, text: 'Optimizing Performance...', delay: 1200 },
            { progress: 90, text: 'Almost Ready...', delay: 1800 },
            { progress: 100, text: 'Redirecting...', delay: 2400 }
        ],
        FALLBACK_DELAY: 5000 // Show manual redirect after 5s if auto fails
    };

    // State management
    const state = {
        redirectInitiated: false,
        progressComplete: false,
        errorOccurred: false,
        startTime: Date.now(),
        userInteracted: false
    };

    // DOM elements
    const elements = {
        loadingOverlay: null,
        mainContent: null,
        errorFallback: null,
        progressFill: null,
        progressText: null,
        manualRedirectBtn: null
    };

    /**
     * Initialize the application
     */
    function init() {
        try {
            // Cache DOM elements
            cacheElements();
            
            // Setup event listeners
            setupEventListeners();
            
            // Start the experience
            startLoadingSequence();
            
            // Setup fallback mechanisms
            setupFallbacks();
            
            // Track page load
            trackEvent('page_load', {
                event_category: 'engagement',
                event_label: 'landing_page_loaded',
                value: 1
            });
            
        } catch (error) {
            console.error('Initialization failed:', error);
            showErrorFallback();
        }
    }

    /**
     * Cache DOM elements for performance
     */
    function cacheElements() {
        elements.loadingOverlay = document.getElementById('loading-overlay');
        elements.mainContent = document.getElementById('main-content');
        elements.errorFallback = document.getElementById('error-fallback');
        elements.progressFill = document.getElementById('progress-fill');
        elements.progressText = document.getElementById('progress-text');
        elements.manualRedirectBtn = document.getElementById('manual-redirect');
        
        // Verify critical elements exist
        if (!elements.loadingOverlay || !elements.progressFill || !elements.progressText) {
            throw new Error('Critical DOM elements not found');
        }
    }

    /**
     * Setup event listeners
     */
    function setupEventListeners() {
        // Manual redirect button
        if (elements.manualRedirectBtn) {
            elements.manualRedirectBtn.addEventListener('click', handleManualRedirect);
        }

        // Keyboard accessibility
        document.addEventListener('keydown', handleKeydown);

        // Visibility change (tab switching)
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Page unload tracking
        window.addEventListener('beforeunload', handleBeforeUnload);

        // Error handling
        window.addEventListener('error', handleGlobalError);
        window.addEventListener('unhandledrejection', handleUnhandledRejection);

        // Performance monitoring
        if ('performance' in window) {
            window.addEventListener('load', trackPerformanceMetrics);
        }

        // User interaction tracking
        ['click', 'touch', 'keydown'].forEach(event => {
            document.addEventListener(event, markUserInteraction, { once: true, passive: true });
        });
    }

    /**
     * Start the loading sequence with progress animation
     */
    function startLoadingSequence() {
        if (state.redirectInitiated) return;

        // Animate through progress steps
        CONFIG.PROGRESS_STEPS.forEach((step, index) => {
            setTimeout(() => {
                if (state.errorOccurred) return;
                
                updateProgress(step.progress, step.text);
                
                // Final step - initiate redirect
                if (step.progress === 100) {
                    setTimeout(initiateRedirect, 400);
                }
            }, step.delay);
        });
    }

    /**
     * Update progress bar and text
     */
    function updateProgress(percentage, text) {
        if (elements.progressFill) {
            elements.progressFill.style.width = `${percentage}%`;
        }
        
        if (elements.progressText) {
            elements.progressText.textContent = text;
        }

        // Track progress milestones
        if (percentage === 25 || percentage === 50 || percentage === 75) {
            trackEvent('progress_milestone', {
                event_category: 'engagement',
                event_label: `progress_${percentage}`,
                value: percentage
            });
        }
    }

    /**
     * Initiate the redirect with tracking
     */
    function initiateRedirect() {
        if (state.redirectInitiated || state.errorOccurred) return;
        
        state.redirectInitiated = true;
        
        try {
            // Track redirect attempt
            trackRedirect();
            
            // Preload destination
            preloadDestination();
            
            // Show redirect text
            if (elements.progressText) {
                elements.progressText.textContent = 'Redirecting to UNTRAPD Hub...';
            }

            // Perform redirect
            setTimeout(() => {
                if (!state.errorOccurred) {
                    window.location.href = CONFIG.REDIRECT_URL;
                }
            }, 300);

        } catch (error) {
            console.error('Redirect failed:', error);
            handleRedirectError();
        }
    }

    /**
     * Preload destination for faster navigation
     */
    function preloadDestination() {
        try {
            // DNS prefetch
            const linkDNS = document.createElement('link');
            linkDNS.rel = 'dns-prefetch';
            linkDNS.href = CONFIG.REDIRECT_URL;
            document.head.appendChild(linkDNS);

            // Preconnect
            const linkPreconnect = document.createElement('link');
            linkPreconnect.rel = 'preconnect';
            linkPreconnect.href = CONFIG.REDIRECT_URL;
            document.head.appendChild(linkPreconnect);

            // Prefetch (if supported)
            if ('HTMLLinkElement' in window && 'prefetch' in HTMLLinkElement.prototype) {
                const linkPrefetch = document.createElement('link');
                linkPrefetch.rel = 'prefetch';
                linkPrefetch.href = CONFIG.REDIRECT_URL;
                document.head.appendChild(linkPrefetch);
            }
        } catch (error) {
            console.warn('Preload failed:', error);
        }
    }

    /**
     * Setup fallback mechanisms
     */
    function setupFallbacks() {
        // Show manual redirect button after delay
        setTimeout(() => {
            if (!state.redirectInitiated && elements.manualRedirectBtn) {
                elements.manualRedirectBtn.style.display = 'inline-block';
                elements.manualRedirectBtn.style.animation = 'fadeIn 0.5s ease-out';
                
                trackEvent('fallback_shown', {
                    event_category: 'error',
                    event_label: 'manual_redirect_shown',
                    value: 1
                });
            }
        }, CONFIG.FALLBACK_DELAY);

        // Ultimate fallback - show error page
        setTimeout(() => {
            if (!state.redirectInitiated && !state.errorOccurred) {
                showErrorFallback();
            }
        }, CONFIG.FALLBACK_DELAY + 2000);
    }

    /**
     * Handle manual redirect click
     */
    function handleManualRedirect(event) {
        event.preventDefault();
        
        trackEvent('manual_redirect', {
            event_category: 'navigation',
            event_label: 'manual_redirect_clicked',
            value: 1
        });

        window.location.href = CONFIG.REDIRECT_URL;
    }

    /**
     * Handle keyboard navigation
     */
    function handleKeydown(event) {
        // Enter or Space to trigger manual redirect
        if ((event.key === 'Enter' || event.key === ' ') && elements.manualRedirectBtn && 
            elements.manualRedirectBtn.style.display !== 'none') {
            event.preventDefault();
            handleManualRedirect(event);
        }

        // Escape to show main content (for testing)
        if (event.key === 'Escape' && !state.redirectInitiated) {
            showMainContent();
        }
    }

    /**
     * Handle visibility changes (tab switching)
     */
    function handleVisibilityChange() {
        if (document.hidden) {
            trackEvent('tab_hidden', {
                event_category: 'engagement',
                event_label: 'tab_switched_away',
                value: Date.now() - state.startTime
            });
        } else {
            trackEvent('tab_visible', {
                event_category: 'engagement',
                event_label: 'tab_switched_back',
                value: Date.now() - state.startTime
            });
        }
    }

    /**
     * Handle page unload
     */
    function handleBeforeUnload() {
        const timeOnPage = Date.now() - state.startTime;
        
        trackEvent('page_unload', {
            event_category: 'engagement',
            event_label: 'time_on_page',
            value: Math.round(timeOnPage / 1000)
        });
    }

    /**
     * Handle global errors
     */
    function handleGlobalError(event) {
        console.error('Global error:', event.error);
        
        trackEvent('javascript_error', {
            event_category: 'error',
            event_label: event.error?.message || 'unknown_error',
            value: 1
        });

        if (!state.errorOccurred) {
            showErrorFallback();
        }
    }

    /**
     * Handle unhandled promise rejections
     */
    function handleUnhandledRejection(event) {
        console.error('Unhandled promise rejection:', event.reason);
        
        trackEvent('promise_rejection', {
            event_category: 'error',
            event_label: event.reason?.message || 'unknown_rejection',
            value: 1
        });
    }

    /**
     * Handle redirect errors
     */
    function handleRedirectError() {
        state.errorOccurred = true;
        
        trackEvent('redirect_error', {
            event_category: 'error',
            event_label: 'redirect_failed',
            value: 1
        });

        showErrorFallback();
    }

    /**
     * Show error fallback
     */
    function showErrorFallback() {
        state.errorOccurred = true;
        
        if (elements.loadingOverlay) {
            elements.loadingOverlay.style.display = 'none';
        }
        
        if (elements.errorFallback) {
            elements.errorFallback.style.display = 'flex';
            elements.errorFallback.style.animation = 'fadeIn 0.5s ease-out';
        }
    }

    /**
     * Show main content (for testing or manual navigation)
     */
    function showMainContent() {
        if (elements.loadingOverlay) {
            elements.loadingOverlay.style.opacity = '0';
            setTimeout(() => {
                elements.loadingOverlay.style.display = 'none';
            }, 300);
        }
        
        if (elements.mainContent) {
            elements.mainContent.style.display = 'flex';
            elements.mainContent.style.animation = 'fadeIn 0.5s ease-out';
        }
    }

    /**
     * Mark user interaction
     */
    function markUserInteraction() {
        state.userInteracted = true;
        
        trackEvent('user_interaction', {
            event_category: 'engagement',
            event_label: 'first_interaction',
            value: Date.now() - state.startTime
        });
    }

    /**
     * Track performance metrics
     */
    function trackPerformanceMetrics() {
        if (!('performance' in window) || !performance.timing) return;

        try {
            const timing = performance.timing;
            const loadTime = timing.loadEventEnd - timing.navigationStart;
            const domReady = timing.domContentLoadedEventEnd - timing.navigationStart;
            const firstPaint = performance.getEntriesByType('paint')
                .find(entry => entry.name === 'first-paint')?.startTime || 0;

            // Track Core Web Vitals
            trackEvent('page_performance', {
                event_category: 'performance',
                event_label: 'load_time',
                value: Math.round(loadTime)
            });

            trackEvent('dom_ready', {
                event_category: 'performance',
                event_label: 'dom_content_loaded',
                value: Math.round(domReady)
            });

            if (firstPaint) {
                trackEvent('first_paint', {
                    event_category: 'performance',
                    event_label: 'first_paint_time',
                    value: Math.round(firstPaint)
                });
            }

            // Track bundle size (estimated)
            const navigationEntry = performance.getEntriesByType('navigation')[0];
            if (navigationEntry) {
                trackEvent('bundle_size', {
                    event_category: 'performance',
                    event_label: 'transfer_size',
                    value: Math.round(navigationEntry.transferSize / 1024) // KB
                });
            }

        } catch (error) {
            console.warn('Performance tracking failed:', error);
        }
    }

    /**
     * Track events with Google Analytics
     */
    function trackEvent(eventName, parameters = {}) {
        try {
            // Google Analytics 4
            if (typeof gtag === 'function') {
                gtag('event', eventName, {
                    custom_map: { dimension1: 'landing_page' },
                    ...parameters
                });
            }

            // Fallback: console log for development
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                console.log('Analytics Event:', eventName, parameters);
            }

        } catch (error) {
            console.warn('Analytics tracking failed:', error);
        }
    }

    /**
     * Track redirect with enhanced data
     */
    function trackRedirect() {
        const redirectData = {
            event_category: 'navigation',
            event_label: 'auto_redirect_to_hub',
            value: 3,
            time_to_redirect: Date.now() - state.startTime,
            user_interacted: state.userInteracted,
            page_visible: !document.hidden
        };

        trackEvent('redirect_initiated', redirectData);

        // Also call the global tracking function if available
        if (typeof trackRedirect === 'function') {
            window.trackRedirect();
        }
    }

    /**
     * Utility: Debounce function
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Utility: Check if device is mobile
     */
    function isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    /**
     * Utility: Check connection quality
     */
    function getConnectionInfo() {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            return {
                effectiveType: connection.effectiveType,
                downlink: connection.downlink,
                rtt: connection.rtt,
                saveData: connection.saveData
            };
        }
        return null;
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Export for testing purposes
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = {
            init,
            trackEvent,
            showMainContent,
            CONFIG
        };
    }

    // Global access for debugging
    window.UNTRAPD_Landing = {
        showMainContent,
        trackEvent,
        state,
        CONFIG
    };

})();