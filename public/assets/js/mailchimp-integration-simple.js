// Simple Mailchimp Integration - Browser Compatible
// Handles newsletter signup without complex dependencies

(function() {
    'use strict';
    
    // Wait for DOM to be ready
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }
    
    // Simple newsletter form handler
    function setupNewsletterForm() {
        var form = document.getElementById('newsletter-form');
        if (!form) return;
        
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            var emailInput = document.getElementById('newsletter-email');
            var email = emailInput ? emailInput.value : '';
            
            // Get checked interests
            var interestBoxes = document.querySelectorAll('input[name="interests"]:checked');
            var interests = [];
            for (var i = 0; i < interestBoxes.length; i++) {
                interests.push(interestBoxes[i].value);
            }
            
            // Basic validation
            if (!email) {
                showError('Please enter your email address');
                return;
            }
            
            if (interests.length === 0) {
                showError('Please select at least one interest');
                return;
            }
            
            // Get submit button
            var submitBtn = form.querySelector('button[type="submit"]');
            var originalText = submitBtn ? submitBtn.textContent : 'Subscribe';
            
            // Show loading state
            if (submitBtn) {
                submitBtn.textContent = 'Subscribing...';
                submitBtn.disabled = true;
            }
            
            // Prepare data
            var data = {
                email: email,
                source: 'newsletter',
                interests: interests,
                name: '', // Could add name field later
                custom_fields: {
                    signup_method: 'website_form',
                    timestamp: new Date().toISOString()
                }
            };
            
            // Make request
            fetch('/api/mailchimp-webhook', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(function(response) {
                return response.json();
            })
            .then(function(result) {
                if (result.success) {
                    showSuccess('🎉 Welcome to Untrapd! You\'re now part of our exclusive community. We\'ll keep you updated on AppFinder launches, new Etsy designs, and behind-the-scenes content!');
                    form.reset();
                    
                    // Track success
                    trackEvent('newsletter_signup_success', {
                        email: email,
                        interests: interests,
                        provider: 'mailchimp'
                    });
                } else {
                    throw new Error(result.message || 'Subscription failed');
                }
            })
            .catch(function(error) {
                console.error('Newsletter subscription error:', error);
                showError('Something went wrong. Please try again.');
                
                // Track error
                trackEvent('newsletter_signup_error', {
                    email: email,
                    error: error.message,
                    provider: 'mailchimp'
                });
            })
            .finally(function() {
                // Restore button state
                if (submitBtn) {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }
            });
        });
    }
    
    // Show success message
    function showSuccess(message) {
        var successDiv = document.getElementById('newsletter-success');
        if (successDiv) {
            var messageElement = successDiv.querySelector('p') || successDiv;
            messageElement.textContent = message;
            successDiv.style.display = 'block';
            
            // Hide after 5 seconds
            setTimeout(function() {
                successDiv.style.display = 'none';
            }, 5000);
        }
    }
    
    // Show error message
    function showError(message) {
        // Remove existing error
        var existingError = document.getElementById('newsletter-error');
        if (existingError) {
            existingError.remove();
        }
        
        // Create error div
        var errorDiv = document.createElement('div');
        errorDiv.id = 'newsletter-error';
        errorDiv.style.cssText = 'display: block; text-align: center; margin-top: 20px; padding: 20px; ' +
            'background: rgba(255, 99, 99, 0.1); border: 1px solid rgba(255, 99, 99, 0.3); ' +
            'border-radius: 10px; color: #ff6363; font-size: 14px;';
        errorDiv.textContent = message;
        
        // Insert after form
        var form = document.getElementById('newsletter-form');
        if (form && form.parentNode) {
            form.parentNode.insertBefore(errorDiv, form.nextSibling);
        }
        
        // Hide after 5 seconds
        setTimeout(function() {
            if (errorDiv && errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }
    
    // Simple event tracking
    function trackEvent(eventName, parameters) {
        // Google Analytics tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, parameters);
        }
        
        // Custom analytics (optional)
        fetch('/api/analytics-api/track-event', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                event_name: eventName,
                parameters: parameters
            })
        }).catch(function(err) {
            console.log('Analytics tracking failed:', err);
        });
    }
    
    // Initialize when DOM is ready
    ready(function() {
        setupNewsletterForm();
    });
    
})();