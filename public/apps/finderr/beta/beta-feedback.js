// FINDERR Beta Feedback Form
// Submits feedback directly to Supabase beta_feedback table

(function() {
    'use strict';

    // Supabase Configuration
    const SUPABASE_URL = 'https://zdceeulkqfpzdjeyekgs.supabase.co';
    const SUPABASE_ANON_KEY = 'sb_publishable_UOURsZSevFyKJJljIO9FDg_In2B0hdv';

    let supabaseClient = null;

    async function getSupabase() {
        if (supabaseClient) return supabaseClient;

        if (typeof window.supabase === 'undefined') {
            await loadSupabaseScript();
        }

        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        return supabaseClient;
    }

    function loadSupabaseScript() {
        return new Promise((resolve, reject) => {
            if (typeof window.supabase !== 'undefined') {
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // DOM Ready
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    // Initialize form
    function initFeedbackForm() {
        const form = document.getElementById('feedback-form');
        if (!form) return;

        // Show/hide severity based on feedback type
        const typeInputs = document.querySelectorAll('input[name="feedback_type"]');
        const severityGroup = document.getElementById('severity-group');

        typeInputs.forEach(input => {
            input.addEventListener('change', function() {
                if (this.value === 'bug' || this.value === 'performance') {
                    severityGroup.style.display = 'block';
                } else {
                    severityGroup.style.display = 'none';
                }
            });
        });

        // Handle form submission
        form.addEventListener('submit', handleFeedbackSubmit);
    }

    // Handle form submission
    async function handleFeedbackSubmit(e) {
        e.preventDefault();

        const form = e.target;
        const submitBtn = form.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;

        // Get form values
        const email = document.getElementById('feedback-email').value.trim().toLowerCase();
        const feedbackType = document.querySelector('input[name="feedback_type"]:checked')?.value;
        const subject = document.getElementById('feedback-subject').value.trim();
        const description = document.getElementById('feedback-description').value.trim();
        const severity = document.querySelector('input[name="severity"]:checked')?.value || null;
        const device = document.getElementById('feedback-device').value.trim();
        const version = document.getElementById('feedback-version').value.trim();

        // Validation
        if (!email || !feedbackType || !subject || !description) {
            showMessage('error', 'Please fill in all required fields.');
            return;
        }

        // Show loading
        submitBtn.textContent = 'Submitting...';
        submitBtn.disabled = true;

        try {
            const supabase = await getSupabase();

            // First, try to find the beta_user_id
            let betaUserId = null;
            const { data: betaUser } = await supabase
                .from('beta_users')
                .select('id')
                .eq('email', email)
                .single();

            if (betaUser) {
                betaUserId = betaUser.id;
            }

            // Prepare feedback data
            const feedbackData = {
                email: email,
                beta_user_id: betaUserId,
                feedback_type: feedbackType,
                subject: subject,
                description: description,
                severity: severity,
                app_version: version || 'v4.3.0',
                device_info: device || null,
                status: 'new'
            };

            // Insert feedback
            const { data, error } = await supabase
                .from('beta_feedback')
                .insert([feedbackData])
                .select();

            if (error) {
                throw error;
            }

            // Success
            showMessage('success',
                '✅ Thank you for your feedback!\n\n' +
                'We\'ve received your submission and will review it soon.\n\n' +
                'Your feedback helps make FINDERR better for everyone!'
            );

            // Reset form
            form.reset();

            // Track event
            if (typeof gtag !== 'undefined') {
                gtag('event', 'beta_feedback', {
                    'event_category': 'engagement',
                    'event_label': feedbackType,
                    'value': 1
                });
            }

            console.log('Feedback submitted:', data);

        } catch (error) {
            console.error('Feedback submission error:', error);
            showMessage('error',
                '❌ Something went wrong.\n\n' +
                'Please try again or email us directly at beta@untrapd.com\n\n' +
                'Error: ' + (error.message || 'Unknown error')
            );
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    // Show message
    function showMessage(type, text) {
        const messageDiv = document.getElementById('feedback-message');
        if (!messageDiv) return;

        messageDiv.style.display = 'block';
        messageDiv.textContent = text;

        if (type === 'success') {
            messageDiv.style.background = 'rgba(76, 175, 80, 0.1)';
            messageDiv.style.border = '2px solid rgba(76, 175, 80, 0.3)';
            messageDiv.style.color = '#27ae60';
        } else {
            messageDiv.style.background = 'rgba(231, 76, 60, 0.1)';
            messageDiv.style.border = '2px solid rgba(231, 76, 60, 0.3)';
            messageDiv.style.color = '#e74c3c';
        }

        // Auto-hide success after 15 seconds
        if (type === 'success') {
            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 15000);
        }
    }

    // Initialize
    ready(initFeedbackForm);

})();
