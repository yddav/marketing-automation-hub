// Templates Page JavaScript

let templatesData = [];
let filteredTemplates = [];
let currentView = 'grid';

// Initialize templates page
document.addEventListener('DOMContentLoaded', function() {
    loadTemplatesData();
    initializeFilters();
    initializeViewToggle();
});

// Load all template data from JSON files
async function loadTemplatesData() {
    showLoading();
    
    try {
        // Load templates from various sources
        const templateSources = [
            { file: 'content_templates/social_media/instagram-templates.json', platform: 'instagram' },
            { file: 'content_templates/social_media/twitter-templates.json', platform: 'twitter' },
            { file: 'content_templates/social_media/facebook-templates.json', platform: 'facebook' },
            { file: 'content_templates/social_media/linkedin-templates.json', platform: 'linkedin' },
            { file: 'content_templates/email_marketing/welcome-sequence.json', platform: 'email' },
            { file: 'content_templates/email_marketing/launch-sequence.json', platform: 'email' },
            { file: 'content_templates/email_marketing/retention-sequence.json', platform: 'email' },
            { file: 'content_templates/app_store/app-store-descriptions.json', platform: 'app_store' },
            { file: 'content_templates/blog_posts/blog-templates.json', platform: 'blog' },
            { file: 'content_templates/press_releases/press-release-templates.json', platform: 'press' }
        ];

        const promises = templateSources.map(async (source) => {
            try {
                const response = await fetch(source.file);
                if (response.ok) {
                    const data = await response.json();
                    return { ...data, sourcePlatform: source.platform };
                }
                return null;
            } catch (error) {
                console.warn(`Failed to load ${source.file}:`, error);
                return null;
            }
        });

        const results = await Promise.all(promises);
        
        // Process loaded data
        templatesData = [];
        results.forEach((data, index) => {
            if (data) {
                const source = templateSources[index];
                if (Array.isArray(data)) {
                    // Handle array of templates
                    data.forEach(template => {
                        templatesData.push({
                            ...template,
                            sourcePlatform: source.platform
                        });
                    });
                } else if (data.templates) {
                    // Handle object with templates array
                    data.templates.forEach(template => {
                        templatesData.push({
                            ...template,
                            sourcePlatform: source.platform
                        });
                    });
                } else {
                    // Handle single template object
                    templatesData.push({
                        ...data,
                        sourcePlatform: source.platform
                    });
                }
            }
        });

        // Add sample templates if no data loaded
        if (templatesData.length === 0) {
            templatesData = generateSampleTemplates();
        }

        filteredTemplates = [...templatesData];
        renderTemplates();
        hideLoading();
        
    } catch (error) {
        console.error('Error loading templates:', error);
        // Fallback to sample data
        templatesData = generateSampleTemplates();
        filteredTemplates = [...templatesData];
        renderTemplates();
        hideLoading();
    }
}

// Generate sample templates for demo
function generateSampleTemplates() {
    return [
        {
            id: 'instagram-launch-1',
            type: 'social_media_post',
            platform: ['instagram'],
            sourcePlatform: 'instagram',
            content: {
                template: '🚀 {{app_name}} is here! {{feature_highlight}} Download now and {{call_to_action}} #{{hashtag}}',
                variations: [
                    { id: 'a', template: '🎉 Introducing {{app_name}}! {{feature_highlight}} Get it now: {{call_to_action}}', test_group: 'A' },
                    { id: 'b', template: '✨ {{app_name}} launches today! {{feature_highlight}} {{call_to_action}} #NewApp', test_group: 'B' }
                ]
            },
            metadata: {
                created_at: '2025-01-01T00:00:00Z',
                updated_at: '2025-01-15T00:00:00Z',
                version: '1.2.0',
                tags: ['launch', 'social', 'announcement'],
                brand_voice: 'professional',
                tone: 'promotional',
                hashtags: ['#AppLaunch', '#NewApp', '#Innovation']
            },
            title: 'Instagram App Launch Post',
            description: 'High-converting Instagram post template for app launches with A/B test variations.',
            features: ['A/B tested', 'Emoji optimized', 'Hashtag strategy']
        },
        {
            id: 'twitter-engagement-1',
            type: 'social_media_post',
            platform: ['twitter'],
            sourcePlatform: 'twitter',
            content: {
                template: 'Just shipped {{feature_name}} in {{app_name}}! 🎯 {{benefit_description}} What feature should we build next? 🤔 {{call_to_action}}',
                variations: [
                    { id: 'a', template: '🔥 New in {{app_name}}: {{feature_name}}! {{benefit_description}} Try it: {{call_to_action}}', test_group: 'A' },
                    { id: 'b', template: '⚡ {{app_name}} update: {{feature_name}} is live! {{benefit_description}} Download: {{call_to_action}}', test_group: 'B' }
                ]
            },
            metadata: {
                created_at: '2025-01-01T00:00:00Z',
                updated_at: '2025-01-15T00:00:00Z',
                version: '1.1.0',
                tags: ['engagement', 'feature', 'community'],
                brand_voice: 'casual',
                tone: 'informative',
                hashtags: ['#ProductUpdate', '#UserFeedback']
            },
            title: 'Twitter Engagement Post',
            description: 'Community-building Twitter template that drives engagement and feedback.',
            features: ['Community focused', 'Question format', 'Feature highlight']
        },
        {
            id: 'email-welcome-1',
            type: 'email_template',
            platform: ['email'],
            sourcePlatform: 'email',
            content: {
                template: 'Welcome to {{app_name}}, {{user_name}}! Here\'s how to get started: {{onboarding_steps}} Need help? Reply to this email!',
                variations: [
                    { id: 'a', template: 'Hi {{user_name}}! Welcome to {{app_name}} 👋 Let\'s get you started: {{onboarding_steps}}', test_group: 'A' },
                    { id: 'b', template: '{{user_name}}, you\'re in! Here\'s your {{app_name}} quick start guide: {{onboarding_steps}}', test_group: 'B' }
                ]
            },
            metadata: {
                created_at: '2025-01-01T00:00:00Z',
                updated_at: '2025-01-15T00:00:00Z',
                version: '1.3.0',
                tags: ['welcome', 'onboarding', 'email'],
                brand_voice: 'friendly',
                tone: 'supportive',
                character_limits: { min: 50, max: 200, optimal: 120 }
            },
            title: 'Welcome Email Sequence',
            description: 'Warm welcome email that guides new users through onboarding.',
            features: ['Personalized', 'Action-oriented', 'Support focused']
        },
        {
            id: 'app-store-ios-1',
            type: 'app_store_description',
            platform: ['app_store_ios'],
            sourcePlatform: 'app_store',
            content: {
                template: '{{app_name}} - {{tagline}}\n\n{{key_benefits}}\n\nFeatures:\n{{feature_list}}\n\nDownload now and {{call_to_action}}!',
                variations: [
                    { id: 'a', template: '{{tagline}} - {{app_name}}\n\nTransform how you {{main_benefit}}:\n{{feature_list}}\n\nJoin {{user_count}} users!', test_group: 'A' },
                    { id: 'b', template: '{{app_name}}: {{tagline}}\n\n⭐ {{key_benefits}}\n🚀 {{feature_list}}\n\nStart free today!', test_group: 'B' }
                ]
            },
            metadata: {
                created_at: '2025-01-01T00:00:00Z',
                updated_at: '2025-01-15T00:00:00Z',
                version: '1.0.0',
                tags: ['app-store', 'description', 'ios'],
                brand_voice: 'professional',
                tone: 'persuasive',
                character_limits: { min: 170, max: 4000, optimal: 500 }
            },
            title: 'iOS App Store Description',
            description: 'Optimized App Store description that maximizes downloads and conversions.',
            features: ['ASO optimized', 'Keyword rich', 'Conversion focused']
        },
        {
            id: 'facebook-ads-1',
            type: 'social_media_post',
            platform: ['facebook'],
            sourcePlatform: 'facebook',
            content: {
                template: 'Struggling with {{problem}}? {{app_name}} solves this in {{time_frame}}. {{social_proof}} Try it free: {{call_to_action}}',
                variations: [
                    { id: 'a', template: '{{problem}} getting you down? {{app_name}} fixes it fast. {{social_proof}} Get started: {{call_to_action}}', test_group: 'A' },
                    { id: 'b', template: 'Say goodbye to {{problem}} with {{app_name}}. {{social_proof}} Free trial: {{call_to_action}}', test_group: 'B' }
                ]
            },
            metadata: {
                created_at: '2025-01-01T00:00:00Z',
                updated_at: '2025-01-15T00:00:00Z',
                version: '1.1.0',
                tags: ['facebook', 'ads', 'problem-solution'],
                brand_voice: 'professional',
                tone: 'persuasive',
                performance_tracking: {
                    metrics: ['clicks', 'conversions', 'engagement_rate'],
                    goals: { click_through_rate: 2.5, conversion_rate: 5.0 }
                }
            },
            title: 'Facebook Problem-Solution Ad',
            description: 'High-converting Facebook ad template focused on problem-solving.',
            features: ['Problem-focused', 'Social proof', 'Free trial CTA']
        }
    ];
}

// Initialize filter controls
function initializeFilters() {
    const platformFilter = document.getElementById('platformFilter');
    const typeFilter = document.getElementById('typeFilter');
    const searchFilter = document.getElementById('searchFilter');

    if (platformFilter) {
        platformFilter.addEventListener('change', applyFilters);
    }
    
    if (typeFilter) {
        typeFilter.addEventListener('change', applyFilters);
    }
    
    if (searchFilter) {
        searchFilter.addEventListener('input', debounce(applyFilters, 300));
    }
}

// Initialize view toggle
function initializeViewToggle() {
    const viewBtns = document.querySelectorAll('.view-btn');
    
    viewBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            viewBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentView = this.dataset.view;
            renderTemplates();
        });
    });
}

// Apply filters to templates
function applyFilters() {
    const platformFilter = document.getElementById('platformFilter')?.value || 'all';
    const typeFilter = document.getElementById('typeFilter')?.value || 'all';
    const searchFilter = document.getElementById('searchFilter')?.value.toLowerCase() || '';

    filteredTemplates = templatesData.filter(template => {
        // Platform filter
        if (platformFilter !== 'all' && !isTemplateForPlatform(template, platformFilter)) {
            return false;
        }

        // Type filter
        if (typeFilter !== 'all' && template.type !== typeFilter) {
            return false;
        }

        // Search filter
        if (searchFilter && !templateMatchesSearch(template, searchFilter)) {
            return false;
        }

        return true;
    });

    renderTemplates();
}

// Check if template is for specific platform
function isTemplateForPlatform(template, platform) {
    if (template.sourcePlatform === platform) return true;
    if (template.platform && template.platform.includes(platform)) return true;
    if (template.platform && template.platform.includes(`${platform}_ios`)) return true;
    if (template.platform && template.platform.includes(`${platform}_android`)) return true;
    return false;
}

// Check if template matches search query
function templateMatchesSearch(template, query) {
    const searchableText = [
        template.title || '',
        template.description || '',
        template.content?.template || '',
        template.metadata?.tags?.join(' ') || '',
        template.type || '',
        template.sourcePlatform || ''
    ].join(' ').toLowerCase();

    return searchableText.includes(query);
}

// Render templates grid
function renderTemplates() {
    const container = document.getElementById('templatesContainer');
    if (!container) return;

    container.className = `templates-container ${currentView}-view`;
    
    if (filteredTemplates.length === 0) {
        container.innerHTML = `
            <div class="no-templates">
                <h3>No templates found</h3>
                <p>Try adjusting your filters or search terms.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filteredTemplates.map(template => `
        <div class="template-card" onclick="showTemplateModal('${template.id}')">
            <div class="template-header">
                <h3 class="template-title">${template.title || `Template ${template.id}`}</h3>
                <div class="template-meta">
                    <span class="template-platform" data-platform="${template.sourcePlatform}">
                        ${formatPlatformName(template.sourcePlatform)}
                    </span>
                    <span class="template-type">${formatTypeName(template.type)}</span>
                    <span class="template-variations">
                        ${template.content?.variations?.length || 1} variation${(template.content?.variations?.length || 1) !== 1 ? 's' : ''}
                    </span>
                </div>
            </div>
            <div class="template-content">
                <div class="template-preview">
                    ${truncateText(template.content?.template || template.description || 'Preview not available', 150)}
                </div>
                <div class="template-features">
                    ${(template.features || []).map(feature => `<span class="feature-tag">${feature}</span>`).join('')}
                    ${template.metadata?.tags?.slice(0, 3).map(tag => `<span class="feature-tag">${tag}</span>`).join('') || ''}
                </div>
                <div class="template-actions">
                    <button class="btn secondary" onclick="event.stopPropagation(); showTemplateModal('${template.id}')">
                        View Details
                    </button>
                    <button class="btn primary" onclick="event.stopPropagation(); trackTemplateInterest('${template.id}'); window.location.href='#buy-now'">
                        Get Template
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Show template modal
function showTemplateModal(templateId) {
    const template = templatesData.find(t => t.id === templateId);
    if (!template) return;

    const modal = document.getElementById('templateModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    modalTitle.textContent = template.title || `Template ${template.id}`;
    
    modalBody.innerHTML = `
        <div class="template-details">
            <div class="template-info">
                <div class="info-row">
                    <strong>Platform:</strong> ${formatPlatformName(template.sourcePlatform)}
                </div>
                <div class="info-row">
                    <strong>Type:</strong> ${formatTypeName(template.type)}
                </div>
                <div class="info-row">
                    <strong>Brand Voice:</strong> ${template.metadata?.brand_voice || 'Not specified'}
                </div>
                <div class="info-row">
                    <strong>Tone:</strong> ${template.metadata?.tone || 'Not specified'}
                </div>
            </div>
            
            <div class="template-content-detail">
                <h4>Template Content:</h4>
                <div class="content-preview">
                    ${template.content?.template || template.description || 'Content not available'}
                </div>
            </div>
            
            ${template.content?.variations ? `
                <div class="template-variations">
                    <h4>A/B Test Variations (${template.content.variations.length}):</h4>
                    ${template.content.variations.map(variation => `
                        <div class="variation-item">
                            <strong>Variation ${variation.id.toUpperCase()}:</strong>
                            <div class="variation-content">${variation.template}</div>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            
            ${template.metadata?.tags ? `
                <div class="template-tags">
                    <h4>Tags:</h4>
                    <div class="tags-list">
                        ${template.metadata.tags.map(tag => `<span class="feature-tag">${tag}</span>`).join('')}
                    </div>
                </div>
            ` : ''}
            
            ${template.metadata?.hashtags ? `
                <div class="template-hashtags">
                    <h4>Suggested Hashtags:</h4>
                    <div class="hashtags-list">
                        ${template.metadata.hashtags.map(hashtag => `<span class="hashtag">${hashtag}</span>`).join('')}
                    </div>
                </div>
            ` : ''}
        </div>
    `;

    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
    
    // Track modal view
    trackTemplateView(templateId);
}

// Close template modal
function closeTemplateModal() {
    const modal = document.getElementById('templateModal');
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
}

// Handle purchase
function handlePurchase() {
    // Track purchase intent
    if (typeof gtag !== 'undefined') {
        gtag('event', 'begin_checkout', {
            currency: 'USD',
            value: 97,
            items: [{
                item_id: 'marketing-templates-bundle',
                item_name: 'Marketing Templates Bundle',
                category: 'Digital Product',
                quantity: 1,
                price: 97
            }]
        });
    }
    
    // For demo purposes, show alert
    alert('🎉 Thank you for your interest! This is a demo. In production, this would redirect to a secure payment processor like Stripe.');
    
    // In production, redirect to payment processor
    // window.location.href = 'https://buy.stripe.com/your-payment-link';
}

// Utility functions
function formatPlatformName(platform) {
    const names = {
        'instagram': 'Instagram',
        'twitter': 'Twitter',
        'facebook': 'Facebook',
        'linkedin': 'LinkedIn',
        'email': 'Email',
        'app_store': 'App Store',
        'blog': 'Blog',
        'press': 'Press'
    };
    return names[platform] || platform;
}

function formatTypeName(type) {
    return type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown';
}

function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

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

function showLoading() {
    const loading = document.getElementById('templatesLoading');
    if (loading) loading.classList.add('show');
}

function hideLoading() {
    const loading = document.getElementById('templatesLoading');
    if (loading) loading.classList.remove('show');
}

// Analytics tracking
function trackTemplateView(templateId) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'view_template', {
            template_id: templateId,
            template_category: 'marketing'
        });
    }
}

function trackTemplateInterest(templateId) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'template_interest', {
            template_id: templateId,
            action: 'get_template_click'
        });
    }
}

// Close modal when clicking outside
document.addEventListener('click', function(event) {
    const modal = document.getElementById('templateModal');
    if (event.target === modal) {
        closeTemplateModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeTemplateModal();
    }
});