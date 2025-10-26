// Mailchimp Integration & Enhanced Newsletter Functionality
// Handles email signups with sophisticated audience segmentation

class MailchimpIntegration {
    constructor() {
        this.apiEndpoint = '/api/mailchimp-webhook';
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

    // Enhanced Newsletter Form with Mailchimp Integration
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
                    this.showSuccess('Successfully subscribed! Check your email for confirmation.');
                    newsletterForm.reset();
                    
                    // Track successful signup
                    this.trackEvent('newsletter_signup_success', {
                        email: email,
                        interests: interests,
                        subscriber_id: result.subscriber_id,
                        provider: 'mailchimp'
                    });
                } else {
                    throw new Error(result.message || 'Subscription failed');
                }
            } catch (error) {
                console.error('Newsletter subscription error:', error);
                this.showError('Something went wrong. Please try again.');
                
                // Track error
                this.trackEvent('newsletter_signup_error', {
                    email: email,
                    error: error.message,
                    provider: 'mailchimp'
                });
            } finally {
                // Restore button state
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // Subscribe to Newsletter with retry logic
    async subscribeToNewsletter(email, interests, source = 'newsletter') {
        const subscriptionData = {
            email,
            source,
            interests,
            custom_fields: {
                signup_method: 'website_form',
                user_agent: navigator.userAgent,
                referrer: document.referrer,
                page_url: window.location.href
            }
        };

        return await this.makeRequestWithRetry(this.apiEndpoint, subscriptionData);
    }

    // Enhanced Contact Form Integration
    setupContactFormEnhancement() {
        const contactForm = document.querySelector('form[name="contact"]');
        if (!contactForm) return;

        const originalSubmitHandler = contactForm.onsubmit;
        
        contactForm.addEventListener('submit', async (e) => {
            const formData = new FormData(contactForm);
            const email = formData.get('email');
            const name = formData.get('name');
            const message = formData.get('message');

            if (email) {
                // Add to Mailchimp contact list in background
                try {
                    await this.subscribeToNewsletter(email, ['contact'], 'contact');
                    
                    // Track contact form submission
                    this.trackEvent('contact_form_submission', {
                        email: email,
                        name: name,
                        has_message: !!message,
                        provider: 'mailchimp'
                    });
                } catch (error) {
                    console.log('Contact form Mailchimp integration failed:', error);
                }
            }

            // Allow normal form submission to continue
            if (originalSubmitHandler) {
                originalSubmitHandler.call(contactForm, e);
            }
        });
    }

    // Quick Action Button Tracking
    setupQuickActionTracking() {
        // AppFinder Interest Button
        const appfinderBtn = document.querySelector('a[href*="app"]');
        if (appfinderBtn) {
            appfinderBtn.addEventListener('click', (e) => {
                this.trackEvent('appfinder_interest_click', {
                    button_text: appfinderBtn.textContent,
                    href: appfinderBtn.href,
                    provider: 'mailchimp'
                });

                // Optional: Show quick signup modal
                this.showQuickSignupModal('appfinder');
            });
        }

        // Shop Interest Button
        const shopBtn = document.querySelector('a[href*="shop"]');
        if (shopBtn) {
            shopBtn.addEventListener('click', (e) => {
                this.trackEvent('shop_interest_click', {
                    button_text: shopBtn.textContent,
                    href: shopBtn.href,
                    provider: 'mailchimp'
                });

                // Optional: Show quick signup modal
                this.showQuickSignupModal('etsy-shop');
            });
        }
    }

    // User Journey Tracking
    setupUserJourneyTracking() {
        // Track time on page
        const startTime = Date.now();
        
        // Track scroll depth
        let maxScroll = 0;
        window.addEventListener('scroll', () => {
            const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
            if (scrollPercent > maxScroll) {
                maxScroll = scrollPercent;
            }
        });

        // Track when user leaves
        window.addEventListener('beforeunload', () => {
            const timeOnPage = Math.round((Date.now() - startTime) / 1000);
            this.trackEvent('page_engagement', {
                time_on_page: timeOnPage,
                max_scroll_depth: maxScroll,
                provider: 'mailchimp'
            });
        });
    }

    // Quick Signup Modal for Interest Capture
    showQuickSignupModal(source) {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.8); z-index: 10000; display: flex;
            align-items: center; justify-content: center;
        `;

        const content = document.createElement('div');
        content.style.cssText = `
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            padding: 30px; border-radius: 15px; max-width: 400px; width: 90%;
            text-align: center; color: white; border: 1px solid rgba(100, 255, 218, 0.3);
        `;

        const sourceText = {
            'appfinder': 'AppFinder App',
            'etsy-shop': 'Etsy Shop'
        };

        content.innerHTML = `
            <h3 style="margin-bottom: 20px; color: #64ffda;">Stay Updated on ${sourceText[source] || 'Our Projects'}!</h3>
            <p style="margin-bottom: 25px; opacity: 0.9;">Get notified when we launch new features and products.</p>
            <form id="quick-signup-form" style="margin-bottom: 20px;">
                <input type="email" id="quick-email" placeholder="Enter your email" required
                    style="width: 100%; padding: 12px; margin-bottom: 15px; background: rgba(255,255,255,0.1);
                           border: 1px solid rgba(100, 255, 218, 0.3); border-radius: 8px; color: white;"
                />
                <button type="submit" style="width: 100%; padding: 12px; background: linear-gradient(45deg, #64ffda, #00bcd4);
                        border: none; border-radius: 8px; color: #1a1a2e; font-weight: bold; cursor: pointer;">
                    Subscribe Now
                </button>
            </form>
            <button id="close-modal" style="background: none; border: 1px solid rgba(255,255,255,0.3);
                    color: white; padding: 8px 16px; border-radius: 6px; cursor: pointer;">
                Maybe Later
            </button>
        `;

        modal.appendChild(content);
        document.body.appendChild(modal);

        // Handle form submission
        content.querySelector('#quick-signup-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = content.querySelector('#quick-email').value;
            
            try {
                const result = await this.subscribeToNewsletter(email, [source], source);
                if (result.success) {
                    content.innerHTML = `
                        <h3 style="color: #64ffda; margin-bottom: 20px;">✅ Thanks for subscribing!</h3>
                        <p>We'll keep you updated on our latest developments.</p>
                        <button onclick="this.closest('.modal').remove()" 
                            style="margin-top: 20px; background: linear-gradient(45deg, #64ffda, #00bcd4);
                                   border: none; border-radius: 8px; color: #1a1a2e; padding: 10px 20px; cursor: pointer;">
                            Close
                        </button>
                    `;
                }
            } catch (error) {
                this.showError('Subscription failed. Please try again.');
            }
        });

        // Close modal handlers
        content.querySelector('#close-modal').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    // HTTP Request with Retry Logic
    async makeRequestWithRetry(url, data, attempt = 1) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || `HTTP error! status: ${response.status}`);
            }

            return result;
        } catch (error) {
            if (attempt < this.retryAttempts) {
                await new Promise(resolve => setTimeout(resolve, this.retryDelay));
                return this.makeRequestWithRetry(url, data, attempt + 1);
            }
            throw error;
        }
    }

    // Event Tracking Integration
    trackEvent(eventName, parameters = {}) {
        // Enhanced Analytics tracking
        if (window.gtag) {
            gtag('event', eventName, parameters);
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
                    ...parameters,
                    timestamp: new Date().toISOString(),
                    user_agent: navigator.userAgent,
                    page_url: window.location.href
                }
            })
        }).catch(err => console.log('Analytics tracking failed:', err));
    }

    // Utility Functions
    getUserId() {
        let userId = localStorage.getItem('user_id');
        if (!userId) {
            userId = 'user_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('user_id', userId);
        }
        return userId;
    }

    getSessionId() {
        let sessionId = sessionStorage.getItem('session_id');
        if (!sessionId) {
            sessionId = 'session_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('session_id', sessionId);
        }
        return sessionId;
    }

    showSuccess(message) {
        const successDiv = document.getElementById('newsletter-success');
        if (successDiv) {
            successDiv.querySelector('p').textContent = message;
            successDiv.style.display = 'block';
            setTimeout(() => successDiv.style.display = 'none', 5000);
        }
    }

    showError(message) {
        // Create or update error display
        let errorDiv = document.getElementById('newsletter-error');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.id = 'newsletter-error';
            errorDiv.style.cssText = `
                display: none; text-align: center; margin-top: 20px; padding: 20px;
                background: rgba(255, 99, 99, 0.1); border: 1px solid rgba(255, 99, 99, 0.3);
                border-radius: 10px; color: #ff6363;
            `;
            document.getElementById('newsletter-form').insertAdjacentElement('afterend', errorDiv);
        }

        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        setTimeout(() => errorDiv.style.display = 'none', 5000);
    }
}

// Initialize Mailchimp Integration when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new MailchimpIntegration();
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MailchimpIntegration;
}