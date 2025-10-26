// Kit Integration & Enhanced Newsletter Functionality
// Handles email signups with sophisticated audience segmentation

class KitIntegration {
    constructor() {
        this.apiEndpoint = '/api/kit-webhook';
        this.retryAttempts = 3;
        this.retryDelay = 1000;
        this.init();
    }

    init() {
        this.setupNewsletterForm();
        this.setupContactFormEnhancement();
        this.setupQuickActionTracking();
        this.setupUserJourneyTracking();
    }

    // Enhanced Newsletter Form with Kit Integration
    setupNewsletterForm() {
        const newsletterForm = document.getElementById('newsletter-form');
        if (!newsletterForm) return;

        newsletterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('newsletter-email').value;
            const interests = Array.from(document.querySelectorAll('input[name="interests"]:checked'))
                .map(checkbox => checkbox.value);
            
            if (!email) {
                this.showError('Please enter your email address');
                return;
            }

            if (interests.length === 0) {
                this.showError('Please select at least one interest');
                return;
            }

            // Show loading state
            const submitBtn = newsletterForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Subscribing...';
            submitBtn.disabled = true;

            try {
                const result = await this.subscribeToNewsletter(email, interests);
                
                if (result.success) {
                    this.showSuccess();
                    this.trackConversion('newsletter_signup', {
                        interests: interests,
                        source: 'website_footer'
                    });
                    
                    // Reset form
                    newsletterForm.reset();
                    
                    // Re-check default interest
                    const generalCheckbox = document.querySelector('input[value="general"]');
                    if (generalCheckbox) generalCheckbox.checked = true;
                } else {
                    throw new Error(result.message || 'Subscription failed');
                }
            } catch (error) {
                console.error('Newsletter signup error:', error);
                this.showError('Something went wrong. Please try again.');
            } finally {
                // Restore button state
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // Enhanced Contact Form Integration
    setupContactFormEnhancement() {
        const contactForm = document.querySelector('form[name="contact"]');
        if (!contactForm) return;

        contactForm.addEventListener('submit', async (e) => {
            const email = contactForm.querySelector('#email').value;
            const inquiryType = contactForm.querySelector('#inquiry-type').value;
            const name = contactForm.querySelector('#name').value;

            // Track detailed contact form submission
            this.trackUserJourney('contact_form_submit', {
                inquiry_type: inquiryType,
                has_name: !!name,
                form_completion_time: this.getFormCompletionTime('contact')
            });

            // Add to Kit with contact form tag (parallel to Netlify form)
            try {
                await this.subscribeToNewsletter(email, ['contact'], {
                    name: name,
                    inquiry_type: inquiryType,
                    source: 'contact_form'
                });
            } catch (error) {
                console.log('Kit contact integration failed (non-critical):', error);
            }
        });
    }

    // Quick Action Tracking
    setupQuickActionTracking() {
        // Track AppFinder waitlist clicks
        document.querySelectorAll('a[href="/app-signup"]').forEach(link => {
            link.addEventListener('click', (e) => {
                this.trackConversion('appfinder_interest', {
                    source: 'quick_action_button',
                    location: this.getElementLocation(e.target)
                });
            });
        });

        // Track shop newsletter clicks
        document.querySelectorAll('a[href="/shop-newsletter"]').forEach(link => {
            link.addEventListener('click', (e) => {
                this.trackConversion('shop_interest', {
                    source: 'quick_action_button',
                    location: this.getElementLocation(e.target)
                });
            });
        });

        // Track Etsy store visits
        document.querySelectorAll('a[href*="etsy.com"]').forEach(link => {
            link.addEventListener('click', (e) => {
                this.trackConversion('etsy_visit', {
                    source: 'website_link',
                    location: this.getElementLocation(e.target)
                });
            });
        });
    }

    // Advanced User Journey Tracking
    setupUserJourneyTracking() {
        // Track section views
        this.setupIntersectionObserver();
        
        // Track engagement metrics
        this.trackEngagementMetrics();
        
        // Track scroll depth
        this.trackScrollDepth();
    }

    // Core Kit API Integration
    async subscribeToNewsletter(email, interests, customData = {}) {
        const payload = {
            email: email,
            source: this.determineSource(interests),
            interests: interests,
            custom_fields: {
                signup_timestamp: new Date().toISOString(),
                user_agent: navigator.userAgent,
                referrer: document.referrer,
                page_url: window.location.href,
                ...customData
            }
        };

        for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
            try {
                const response = await fetch(this.apiEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                return await response.json();
            } catch (error) {
                console.error(`Kit subscription attempt ${attempt} failed:`, error);
                
                if (attempt === this.retryAttempts) {
                    throw error;
                }
                
                // Wait before retry
                await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
            }
        }
    }

    // Determine Kit source based on interests
    determineSource(interests) {
        if (interests.includes('appfinder')) return 'appfinder';
        if (interests.includes('etsy-shop')) return 'etsy-shop';
        return 'newsletter';
    }

    // UI Feedback Methods
    showSuccess() {
        const successDiv = document.getElementById('newsletter-success');
        if (successDiv) {
            successDiv.style.display = 'block';
            successDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Hide after 5 seconds
            setTimeout(() => {
                successDiv.style.display = 'none';
            }, 5000);
        }
    }

    showError(message) {
        // Create or update error message
        let errorDiv = document.getElementById('newsletter-error');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.id = 'newsletter-error';
            errorDiv.style.cssText = `
                display: none; text-align: center; margin-top: 20px; padding: 20px;
                background: rgba(255, 100, 100, 0.1); border: 1px solid rgba(255, 100, 100, 0.3);
                border-radius: 10px; color: #ff6464;
            `;
            
            const newsletterForm = document.getElementById('newsletter-form');
            if (newsletterForm) {
                newsletterForm.parentNode.insertBefore(errorDiv, newsletterForm.nextSibling);
            }
        }
        
        errorDiv.textContent = `⚠️ ${message}`;
        errorDiv.style.display = 'block';
        
        // Hide after 5 seconds
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }

    // Analytics Integration
    trackConversion(eventName, properties = {}) {
        // Google Analytics 4
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, {
                event_category: 'conversion',
                event_label: properties.source || 'unknown',
                value: 1,
                custom_properties: properties
            });
        }

        // Custom analytics API
        fetch('/api/analytics-api/track-event', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                event_name: eventName,
                user_id: this.getUserId(),
                session_id: this.getSessionId(),
                parameters: {
                    ...properties,
                    timestamp: new Date().toISOString(),
                    page_url: window.location.href,
                    user_agent: navigator.userAgent
                }
            })
        }).catch(err => console.log('Analytics tracking failed:', err));
    }

    trackUserJourney(step, metadata = {}) {
        fetch('/api/analytics-api/user-journey', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: this.getUserId(),
                session_id: this.getSessionId(),
                journey_step: step,
                page_section: this.getCurrentSection(),
                interaction_type: metadata.interaction_type || 'action',
                value: metadata.value || 1,
                metadata: metadata
            })
        }).catch(err => console.log('User journey tracking failed:', err));
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
        const sections = ['home', 'hub', 'app', 'shop', 'contact'];
        const hash = window.location.hash.slice(1);
        return sections.includes(hash) ? hash : 'home';
    }

    getElementLocation(element) {
        const rect = element.getBoundingClientRect();
        return {
            x: rect.left,
            y: rect.top,
            section: this.getCurrentSection(),
            element_text: element.textContent?.trim().substring(0, 50)
        };
    }

    getFormCompletionTime(formType) {
        const startKey = `${formType}_form_start`;
        const startTime = sessionStorage.getItem(startKey);
        if (startTime) {
            return Date.now() - parseInt(startTime);
        }
        return null;
    }

    // Advanced Tracking Methods
    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionId = entry.target.id;
                    this.trackUserJourney('section_view', {
                        section: sectionId,
                        visibility_ratio: entry.intersectionRatio
                    });
                }
            });
        }, { threshold: 0.5 });

        // Observe all main sections
        document.querySelectorAll('section[id]').forEach(section => {
            observer.observe(section);
        });
    }

    trackEngagementMetrics() {
        let startTime = Date.now();
        let isActive = true;
        
        // Track time on page
        setInterval(() => {
            if (isActive) {
                this.trackUserJourney('engagement_ping', {
                    time_on_page: Date.now() - startTime,
                    active: true
                });
            }
        }, 30000); // Every 30 seconds

        // Track active/inactive states
        document.addEventListener('visibilitychange', () => {
            isActive = !document.hidden;
        });
    }

    trackScrollDepth() {
        let maxScroll = 0;
        
        window.addEventListener('scroll', () => {
            const scrollPercent = Math.round(
                (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
            );
            
            if (scrollPercent > maxScroll) {
                maxScroll = scrollPercent;
                
                // Track milestone scrolls
                if (maxScroll >= 25 && maxScroll < 50) {
                    this.trackUserJourney('scroll_depth', { depth: '25%' });
                } else if (maxScroll >= 50 && maxScroll < 75) {
                    this.trackUserJourney('scroll_depth', { depth: '50%' });
                } else if (maxScroll >= 75 && maxScroll < 90) {
                    this.trackUserJourney('scroll_depth', { depth: '75%' });
                } else if (maxScroll >= 90) {
                    this.trackUserJourney('scroll_depth', { depth: '90%' });
                }
            }
        });
    }
}

// Initialize Kit Integration when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new KitIntegration();
});