/**
 * UNTRAPD Landing Page - Interactive Redirect Experience
 * Premium brand experience with 3-second animated redirect
 */

class UntrapidLanding {
    constructor() {
        this.redirectUrl = 'https://hub.untrapd.com';
        this.redirectDelay = 3000; // 3 seconds
        this.progressDuration = 2800; // Slightly faster than redirect
        this.startTime = Date.now();
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.startLoadingSequence();
        this.trackAnalytics();
    }
    
    setupEventListeners() {
        // Manual continue button
        const continueButton = document.getElementById('continueButton');
        if (continueButton) {
            continueButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.trackEvent('manual_continue_click');
                this.performRedirect();
            });
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.trackEvent('keyboard_continue');
                this.performRedirect();
            }
            if (e.key === 'Escape') {
                this.trackEvent('escape_pressed');
                this.cancelRedirect();
            }
        });
        
        // Visibility change handling
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.trackEvent('tab_hidden');
            } else {
                this.trackEvent('tab_visible');
            }
        });
        
        // Performance monitoring
        window.addEventListener('load', () => {
            this.measurePerformance();
        });
    }
    
    startLoadingSequence() {
        // Start progress bar animation
        this.animateProgressBar();
        
        // Start countdown
        this.startCountdown();
        
        // Show CTA section after animation
        setTimeout(() => {
            this.showCTASection();
        }, 1000);
        
        // Auto redirect after delay
        this.redirectTimer = setTimeout(() => {
            this.trackEvent('auto_redirect');
            this.performRedirect();
        }, this.redirectDelay);
    }
    
    animateProgressBar() {
        const progressFill = document.querySelector('.progress-fill');
        const progressPercentage = document.getElementById('progress-percentage');
        
        if (!progressFill || !progressPercentage) return;
        
        let progress = 0;
        const increment = 100 / (this.progressDuration / 50); // Update every 50ms
        
        const progressInterval = setInterval(() => {
            progress += increment;
            
            if (progress >= 100) {
                progress = 100;
                clearInterval(progressInterval);
            }
            
            progressFill.style.width = `${progress}%`;
            progressPercentage.textContent = `${Math.round(progress)}%`;
        }, 50);
    }
    
    startCountdown() {
        const countdownElement = document.getElementById('countdown');
        if (!countdownElement) return;
        
        let timeLeft = 3;
        
        const countdownInterval = setInterval(() => {
            timeLeft--;
            countdownElement.textContent = timeLeft;
            
            if (timeLeft <= 0) {
                clearInterval(countdownInterval);
                countdownElement.textContent = '0';
            }
        }, 1000);
        
        this.countdownInterval = countdownInterval;
    }
    
    showCTASection() {
        const ctaSection = document.querySelector('.cta-section');
        if (ctaSection) {
            ctaSection.classList.add('visible');
        }
    }
    
    performRedirect() {
        // Clear any existing timers
        if (this.redirectTimer) {
            clearTimeout(this.redirectTimer);
        }
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
        }
        
        // Update UI to show redirecting state
        this.updateRedirectingState();
        
        // Perform redirect with fallback
        try {
            // Try modern approach first
            if (window.location.replace) {
                window.location.replace(this.redirectUrl);
            } else {
                window.location.href = this.redirectUrl;
            }
        } catch (error) {
            // Fallback for edge cases
            console.warn('Redirect failed, using fallback:', error);
            window.open(this.redirectUrl, '_self');
        }
    }
    
    updateRedirectingState() {
        const loadingText = document.querySelector('.loading-text');
        const redirectNote = document.querySelector('.redirect-note');
        const ctaButton = document.querySelector('.cta-button');
        
        if (loadingText) {
            loadingText.textContent = 'Redirecting to hub...';
        }
        
        if (redirectNote) {
            redirectNote.textContent = 'Taking you to the UNTRAPD Hub...';
        }
        
        if (ctaButton) {
            ctaButton.style.opacity = '0.5';
            ctaButton.style.pointerEvents = 'none';
        }
    }
    
    cancelRedirect() {
        if (this.redirectTimer) {
            clearTimeout(this.redirectTimer);
        }
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
        }
        
        const redirectNote = document.querySelector('.redirect-note');
        if (redirectNote) {
            redirectNote.textContent = 'Redirect cancelled. Click Continue to proceed manually.';
        }
        
        this.trackEvent('redirect_cancelled');
    }
    
    trackAnalytics() {
        // Track initial page load
        this.trackEvent('landing_page_load', {
            user_agent: navigator.userAgent,
            screen_resolution: `${screen.width}x${screen.height}`,
            viewport_size: `${window.innerWidth}x${window.innerHeight}`,
            referrer: document.referrer || 'direct',
            timestamp: new Date().toISOString()
        });
        
        // Track engagement time
        this.engagementStartTime = Date.now();
        
        window.addEventListener('beforeunload', () => {
            const engagementTime = Date.now() - this.engagementStartTime;
            this.trackEvent('page_unload', {
                engagement_time_ms: engagementTime,
                engagement_time_seconds: Math.round(engagementTime / 1000)
            });
        });
    }
    
    trackEvent(eventName, eventData = {}) {
        // Google Analytics 4 tracking
        if (typeof gtag === 'function') {
            gtag('event', eventName, {
                custom_parameter: 'untrapd_landing',
                source: 'root_domain',
                timestamp: Date.now(),
                ...eventData
            });
        }
        
        // Console logging for development
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.log(`📊 Event: ${eventName}`, eventData);
        }
        
        // Custom analytics endpoint (if needed)
        this.sendCustomAnalytics(eventName, eventData);
    }
    
    sendCustomAnalytics(eventName, eventData) {
        // Optional: Send to custom analytics endpoint
        try {
            const analyticsData = {
                event: eventName,
                data: eventData,
                session_id: this.getSessionId(),
                timestamp: new Date().toISOString()
            };
            
            // Use beacon API for reliability
            if (navigator.sendBeacon) {
                navigator.sendBeacon('/analytics', JSON.stringify(analyticsData));
            }
        } catch (error) {
            console.warn('Custom analytics failed:', error);
        }
    }
    
    getSessionId() {
        // Simple session ID generation
        if (!this.sessionId) {
            this.sessionId = 'untrapd_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }
        return this.sessionId;
    }
    
    measurePerformance() {
        // Measure and track performance metrics
        if ('performance' in window && 'getEntriesByType' in performance) {
            const navigation = performance.getEntriesByType('navigation')[0];
            const paint = performance.getEntriesByType('paint');
            
            const performanceData = {
                load_time: Math.round(navigation.loadEventEnd - navigation.fetchStart),
                dom_content_loaded: Math.round(navigation.domContentLoadedEventEnd - navigation.fetchStart),
                first_paint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
                first_contentful_paint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
                connection_type: navigator.connection?.effectiveType || 'unknown'
            };
            
            this.trackEvent('performance_metrics', performanceData);
            
            // Log performance for optimization
            console.log('🚀 Performance Metrics:', performanceData);
        }
    }
}

// Error handling and fallback mechanisms
window.addEventListener('error', (event) => {
    console.error('JavaScript error:', event.error);
    
    // Fallback redirect in case of errors
    if (!document.querySelector('.error-handled')) {
        document.body.insertAdjacentHTML('beforeend', 
            `<div class="error-handled" style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);
             background:rgba(255,255,255,0.1);padding:2rem;border-radius:10px;text-align:center;z-index:9999;">
                <p>Redirecting to <a href="https://hub.untrapd.com" style="color:#00ff88;">UNTRAPD Hub</a>...</p>
             </div>`
        );
        
        setTimeout(() => {
            window.location.href = 'https://hub.untrapd.com';
        }, 2000);
    }
});

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.untrapidLanding = new UntrapidLanding();
    });
} else {
    window.untrapidLanding = new UntrapidLanding();
}

// Expose for debugging
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.debugUntrapd = {
        redirect: () => window.untrapidLanding.performRedirect(),
        cancel: () => window.untrapidLanding.cancelRedirect(),
        track: (event, data) => window.untrapidLanding.trackEvent(event, data)
    };
}