// FINDERR Beta Tester Signup Integration
// Connects beta form to Mailchimp via Netlify Functions

(function() {
    'use strict';

    // Wait for DOM
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    // Setup beta signup form
    function setupBetaForm() {
        var form = document.getElementById('beta-signup-form');
        if (!form) {
            console.log('Beta signup form not found, will create it');
            createBetaForm();
            return;
        }

        form.addEventListener('submit', handleBetaSubmit);
    }

    // Create beta signup form if it doesn't exist
    function createBetaForm() {
        // Find the CTA section
        var ctaSection = document.querySelector('.beta-signup-cta');
        if (!ctaSection) return;

        // Create form HTML
        var formHTML = `
            <form id="beta-signup-form" style="max-width: 600px; margin: 40px auto;">
                <div style="background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; color: #333; font-weight: 600;">
                            Email Address *
                        </label>
                        <input
                            type="email"
                            id="beta-email"
                            name="email"
                            required
                            placeholder="your.email@example.com"
                            style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px;"
                        />
                    </div>

                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; color: #333; font-weight: 600;">
                            Full Name *
                        </label>
                        <input
                            type="text"
                            id="beta-name"
                            name="name"
                            required
                            placeholder="John Doe"
                            style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px;"
                        />
                    </div>

                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; color: #333; font-weight: 600;">
                            Android Device *
                        </label>
                        <input
                            type="text"
                            id="beta-device"
                            name="device"
                            required
                            placeholder="Samsung Galaxy S23, Google Pixel 7, etc."
                            style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px;"
                        />
                    </div>

                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; color: #333; font-weight: 600;">
                            Testing Focus (optional)
                        </label>
                        <textarea
                            id="beta-focus"
                            name="focus"
                            rows="3"
                            placeholder="What aspects of FINDERR are you most interested in testing? (e.g., security, UI/UX, emergency features, GPS tracking)"
                            style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px; resize: vertical;"
                        ></textarea>
                    </div>

                    <div style="margin-bottom: 20px;">
                        <label style="display: flex; align-items: start; gap: 10px;">
                            <input type="checkbox" id="beta-agree" name="agree" required style="margin-top: 4px;">
                            <span style="color: #666; font-size: 14px;">
                                I agree to test FINDERR for 14 days and provide feedback. I understand this is a beta version and may have bugs.
                            </span>
                        </label>
                    </div>

                    <button
                        type="submit"
                        style="width: 100%; padding: 16px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; font-size: 18px; font-weight: 700; cursor: pointer; transition: transform 0.2s;"
                        onmouseover="this.style.transform='scale(1.02)'"
                        onmouseout="this.style.transform='scale(1)'"
                    >
                        Join Beta Testing →
                    </button>

                    <div id="beta-message" style="margin-top: 20px; padding: 15px; border-radius: 8px; display: none;"></div>
                </div>
            </form>
        `;

        // Insert form before the existing CTA button
        var existingCTA = ctaSection.querySelector('.cta-button-large');
        if (existingCTA) {
            existingCTA.style.display = 'none'; // Hide the placeholder button
        }

        var formContainer = document.createElement('div');
        formContainer.innerHTML = formHTML;
        ctaSection.appendChild(formContainer);

        // Attach event listener
        var newForm = document.getElementById('beta-signup-form');
        if (newForm) {
            newForm.addEventListener('submit', handleBetaSubmit);
        }
    }

    // Handle beta signup submission
    function handleBetaSubmit(e) {
        e.preventDefault();

        var form = e.target;
        var submitBtn = form.querySelector('button[type="submit"]');
        var originalText = submitBtn.textContent;

        // Get form data
        var email = document.getElementById('beta-email').value;
        var name = document.getElementById('beta-name').value;
        var device = document.getElementById('beta-device').value;
        var focus = document.getElementById('beta-focus').value;

        // Show loading state
        submitBtn.textContent = 'Joining Beta...';
        submitBtn.disabled = true;

        // Prepare data for Mailchimp
        var data = {
            email: email,
            name: name,
            source: 'finderr_beta',
            tags: ['FINDERR Beta Tester', 'Android User'],
            custom_fields: {
                DEVICE: device,
                FOCUS: focus || 'General testing',
                SIGNUP_DATE: new Date().toISOString(),
                BETA_VERSION: 'v4.3'
            }
        };

        // Submit to Mailchimp webhook
        fetch('/.netlify/functions/mailchimp-webhook', {
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
                showMessage('success',
                    '🎉 Welcome to FINDERR Beta!\n\n' +
                    'You\'ve been added to our beta tester list. We\'ll send you an email with:\n' +
                    '• Google Play testing link (when errors are fixed)\n' +
                    '• Beta testing guidelines\n' +
                    '• How to provide feedback\n\n' +
                    'Check your inbox in the next 24-48 hours!'
                );
                form.reset();

                // Track event
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'beta_signup', {
                        'event_category': 'engagement',
                        'event_label': 'FINDERR Beta',
                        'value': 1
                    });
                }
            } else {
                throw new Error(result.message || 'Signup failed');
            }
        })
        .catch(function(error) {
            console.error('Beta signup error:', error);
            showMessage('error',
                '❌ Something went wrong.\n\n' +
                'Please try again or email us directly at beta@untrapd.com'
            );
        })
        .finally(function() {
            // Restore button
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        });
    }

    // Show message
    function showMessage(type, text) {
        var messageDiv = document.getElementById('beta-message');
        if (!messageDiv) return;

        messageDiv.style.display = 'block';
        messageDiv.textContent = text;
        messageDiv.style.whiteSpace = 'pre-line';

        if (type === 'success') {
            messageDiv.style.background = 'rgba(76, 175, 80, 0.1)';
            messageDiv.style.border = '2px solid rgba(76, 175, 80, 0.3)';
            messageDiv.style.color = '#4CAF50';
        } else {
            messageDiv.style.background = 'rgba(244, 67, 54, 0.1)';
            messageDiv.style.border = '2px solid rgba(244, 67, 54, 0.3)';
            messageDiv.style.color = '#f44336';
        }

        // Auto-hide success messages after 10 seconds
        if (type === 'success') {
            setTimeout(function() {
                messageDiv.style.display = 'none';
            }, 10000);
        }
    }

    // Initialize
    ready(function() {
        setupBetaForm();
    });

})();
