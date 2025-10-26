/**
 * Email Sequence Builder
 * Creates and manages automated email sequences with personalization
 */

const { DateTime } = require('luxon');

class EmailSequenceBuilder {
  constructor(brandGuidelines, contentTemplates) {
    this.brandGuidelines = brandGuidelines;
    this.contentTemplates = contentTemplates;
    
    this.sequenceTemplates = {
      welcome: {
        name: 'Welcome Series',
        description: 'Onboard new users and drive first actions',
        emails: [
          {
            timing: 0, // Immediate
            type: 'welcome',
            goal: 'Warm welcome and account activation',
            metrics: { openRate: 0.65, clickRate: 0.25 }
          },
          {
            timing: 1, // Day 1
            type: 'quick_win',
            goal: 'Show immediate value with easy automation',
            metrics: { openRate: 0.45, clickRate: 0.18 }
          },
          {
            timing: 3, // Day 3
            type: 'case_study',
            goal: 'Build trust with success stories',
            metrics: { openRate: 0.40, clickRate: 0.15 }
          },
          {
            timing: 7, // Day 7
            type: 'personalized_tips',
            goal: 'Provide custom recommendations',
            metrics: { openRate: 0.38, clickRate: 0.20 }
          },
          {
            timing: 14, // Day 14
            type: 'upgrade_offer',
            goal: 'Convert to paid plan',
            metrics: { openRate: 0.35, clickRate: 0.22 }
          }
        ]
      },
      
      launch: {
        name: 'Product Launch Campaign',
        description: 'Build excitement and drive launch day conversions',
        emails: [
          {
            timing: -7, // 7 days before launch
            type: 'announcement',
            goal: 'Create awareness and anticipation',
            metrics: { openRate: 0.45, clickRate: 0.12 }
          },
          {
            timing: -3, // 3 days before
            type: 'feature_preview',
            goal: 'Showcase key benefits',
            metrics: { openRate: 0.48, clickRate: 0.15 }
          },
          {
            timing: -1, // 1 day before
            type: 'countdown',
            goal: 'Build urgency and excitement',
            metrics: { openRate: 0.52, clickRate: 0.18 }
          },
          {
            timing: 0, // Launch day
            type: 'launch_announcement',
            goal: 'Drive immediate action',
            metrics: { openRate: 0.68, clickRate: 0.35 }
          },
          {
            timing: 1, // 1 day after
            type: 'last_chance',
            goal: 'Convert fence-sitters',
            metrics: { openRate: 0.55, clickRate: 0.28 }
          }
        ]
      },
      
      retention: {
        name: 'User Retention Series',
        description: 'Keep users engaged and reduce churn',
        emails: [
          {
            timing: 30, // Day 30
            type: 'progress_report',
            goal: 'Show value delivered',
            metrics: { openRate: 0.42, clickRate: 0.15 }
          },
          {
            timing: 45, // Day 45
            type: 'advanced_features',
            goal: 'Increase feature adoption',
            metrics: { openRate: 0.38, clickRate: 0.18 }
          },
          {
            timing: 60, // Day 60
            type: 'milestone_celebration',
            goal: 'Celebrate achievements',
            metrics: { openRate: 0.40, clickRate: 0.12 }
          },
          {
            timing: 90, // Day 90
            type: 'feedback_request',
            goal: 'Gather insights and engage',
            metrics: { openRate: 0.35, clickRate: 0.20 }
          },
          {
            timing: 120, // Day 120
            type: 'loyalty_reward',
            goal: 'Reward continued usage',
            metrics: { openRate: 0.45, clickRate: 0.25 }
          },
          {
            timing: 180, // Day 180
            type: 'annual_review',
            goal: 'Show annual value and renew',
            metrics: { openRate: 0.48, clickRate: 0.22 }
          }
        ]
      },
      
      winback: {
        name: 'Win-Back Campaign',
        description: 'Re-engage inactive users',
        emails: [
          {
            timing: 0, // Trigger day
            type: 'we_miss_you',
            goal: 'Acknowledge absence warmly',
            metrics: { openRate: 0.35, clickRate: 0.10 }
          },
          {
            timing: 7, // 7 days later
            type: 'whats_new',
            goal: 'Show improvements and updates',
            metrics: { openRate: 0.32, clickRate: 0.12 }
          },
          {
            timing: 14, // 14 days later
            type: 'special_offer',
            goal: 'Incentivize return',
            metrics: { openRate: 0.38, clickRate: 0.18 }
          }
        ]
      },
      
      education: {
        name: 'Educational Series',
        description: 'Teach users to maximize platform value',
        emails: [
          {
            timing: 0, // Start
            type: 'automation_basics',
            goal: 'Foundation knowledge',
            metrics: { openRate: 0.48, clickRate: 0.22 }
          },
          {
            timing: 2, // Day 2
            type: 'content_strategy',
            goal: 'Strategic thinking',
            metrics: { openRate: 0.45, clickRate: 0.20 }
          },
          {
            timing: 4, // Day 4
            type: 'platform_integration',
            goal: 'Technical knowledge',
            metrics: { openRate: 0.42, clickRate: 0.18 }
          },
          {
            timing: 7, // Day 7
            type: 'analytics_mastery',
            goal: 'Data-driven decisions',
            metrics: { openRate: 0.40, clickRate: 0.16 }
          },
          {
            timing: 10, // Day 10
            type: 'advanced_automation',
            goal: 'Power user features',
            metrics: { openRate: 0.38, clickRate: 0.19 }
          },
          {
            timing: 14, // Day 14
            type: 'best_practices',
            goal: 'Industry insights',
            metrics: { openRate: 0.36, clickRate: 0.17 }
          },
          {
            timing: 21, // Day 21
            type: 'community_showcase',
            goal: 'Peer learning',
            metrics: { openRate: 0.40, clickRate: 0.21 }
          },
          {
            timing: 28, // Day 28
            type: 'certification',
            goal: 'Achievement recognition',
            metrics: { openRate: 0.45, clickRate: 0.25 }
          }
        ]
      }
    };
    
    this.personalizationEngine = {
      userAttributes: [
        'first_name', 'company', 'industry', 'role',
        'signup_date', 'plan_type', 'usage_level',
        'preferred_platforms', 'team_size'
      ],
      behaviorTriggers: [
        'feature_used', 'milestone_reached', 'engagement_level',
        'last_login', 'content_created', 'automation_success'
      ],
      dynamicContent: [
        'recommendations', 'similar_users', 'relevant_features',
        'success_metrics', 'next_steps', 'learning_resources'
      ]
    };
  }

  /**
   * Build complete email sequence
   */
  async buildSequence(sequenceType, userSegment, customizations = {}) {
    const template = this.sequenceTemplates[sequenceType];
    if (!template) {
      throw new Error(`Unknown sequence type: ${sequenceType}`);
    }
    
    const sequence = {
      id: `seq_${sequenceType}_${Date.now()}`,
      type: sequenceType,
      name: template.name,
      description: template.description,
      segment: userSegment,
      emails: [],
      personalization: this.buildPersonalizationRules(userSegment),
      performance: {
        expectedOpenRate: 0,
        expectedClickRate: 0,
        expectedConversion: 0
      },
      customizations
    };
    
    // Build each email in the sequence
    for (const emailTemplate of template.emails) {
      const email = await this.buildEmail(emailTemplate, sequence);
      sequence.emails.push(email);
    }
    
    // Calculate expected performance
    sequence.performance = this.calculateExpectedPerformance(sequence);
    
    // Apply customizations
    if (customizations.brandVoice) {
      sequence.emails = this.applyBrandVoice(sequence.emails, customizations.brandVoice);
    }
    
    return sequence;
  }

  /**
   * Build individual email
   */
  async buildEmail(template, sequence) {
    const email = {
      id: `email_${sequence.id}_${template.timing}`,
      sequenceId: sequence.id,
      timing: template.timing,
      type: template.type,
      goal: template.goal,
      subject: this.generateSubjectLine(template.type, sequence),
      preheader: this.generatePreheader(template.type, sequence),
      content: await this.generateEmailContent(template.type, sequence),
      personalization: this.getEmailPersonalization(template.type),
      expectedMetrics: template.metrics,
      abTests: this.generateABTests(template.type)
    };
    
    return email;
  }

  /**
   * Generate subject lines
   */
  generateSubjectLine(emailType, sequence) {
    const subjectTemplates = {
      // Welcome series
      welcome: [
        'Welcome to {{app_name}}, {{first_name}}! 🎉',
        '{{first_name}}, your marketing automation journey starts here',
        'Ready to save 10+ hours per week, {{first_name}}?'
      ],
      quick_win: [
        '{{first_name}}, try this 5-minute automation',
        'Your first automation in 3 simple steps',
        'Quick win: Automate {{preferred_platform}} in minutes'
      ],
      case_study: [
        'How {{similar_company}} increased engagement by 300%',
        '{{industry}} success story inside',
        'From 0 to 50K followers: {{similar_company}}\'s journey'
      ],
      personalized_tips: [
        '{{first_name}}, your personalized automation roadmap',
        '3 automations perfect for {{company}}',
        'Based on your usage: Next steps for growth'
      ],
      upgrade_offer: [
        '{{first_name}}, unlock Pro features (40% off)',
        'Special offer for {{company}} expires soon',
        'You\'ve outgrown Free - here\'s 40% off Pro'
      ],
      
      // Launch series
      announcement: [
        '🚀 Big announcement from {{app_name}}',
        'Something exciting is coming to {{app_name}}',
        '{{first_name}}, you\'re invited to our biggest launch yet'
      ],
      feature_preview: [
        'Sneak peek: {{feature_name}} is almost here',
        '3 days until {{feature_name}} changes everything',
        'Early access for {{company}} starts soon'
      ],
      countdown: [
        '⏰ 24 hours until launch + exclusive discount',
        'Tomorrow: Save 40% on {{app_name}} Pro',
        'Final countdown: Your early bird access awaits'
      ],
      launch_announcement: [
        '🎉 IT\'S HERE! Plus your 40% discount code',
        'Doors are open: Welcome to {{app_name}} 2.0',
        '{{first_name}}, your exclusive launch access is live'
      ],
      last_chance: [
        'Last 24 hours: 40% off {{app_name}} Pro',
        '{{first_name}}, your discount expires at midnight',
        'Final call: Launch pricing ends tonight'
      ],
      
      // Retention series
      progress_report: [
        '{{first_name}}, your monthly automation report',
        'You saved {{hours_saved}} hours this month!',
        '{{company}}\'s automation achievements'
      ],
      advanced_features: [
        'Hidden features in {{app_name}} you\'re missing',
        '5 power features for {{role}} professionals',
        'Level up: Advanced automations for {{industry}}'
      ],
      milestone_celebration: [
        '🎯 {{company}} just hit a major milestone!',
        'Celebrating your {{milestone}} with {{app_name}}',
        '{{first_name}}, look what you\'ve accomplished'
      ],
      feedback_request: [
        '{{first_name}}, how are we doing?',
        'Quick question about your {{app_name}} experience',
        'Help us serve {{company}} better'
      ],
      loyalty_reward: [
        '{{first_name}}, a special thank you gift inside',
        'Exclusive perks for loyal {{app_name}} users',
        '{{company}} unlocked VIP benefits'
      ],
      annual_review: [
        'Your year with {{app_name}}: Amazing results inside',
        '{{company}}\'s annual automation report',
        '{{first_name}}, see your incredible ROI'
      ],
      
      // Win-back series
      we_miss_you: [
        'We miss you at {{app_name}}, {{first_name}}',
        'Is everything okay, {{first_name}}?',
        '{{company}}\'s automations are waiting for you'
      ],
      whats_new: [
        'See what\'s new at {{app_name}} since you left',
        '{{first_name}}, you won\'t believe our updates',
        'Major improvements based on feedback like yours'
      ],
      special_offer: [
        '{{first_name}}, here\'s 50% off to welcome you back',
        'We want {{company}} back - special offer inside',
        'Exclusive comeback discount for {{first_name}}'
      ],
      
      // Education series
      automation_basics: [
        'Marketing Automation 101: Start here',
        '{{first_name}}\'s guide to automation success',
        'Master the basics in 15 minutes'
      ],
      content_strategy: [
        'Content strategy secrets for {{industry}}',
        'How to plan content like a pro',
        '{{company}}\'s content calendar blueprint'
      ],
      platform_integration: [
        'Connect all your tools with {{app_name}}',
        'Integration guide for {{preferred_platform}}',
        'Sync your entire marketing stack'
      ],
      analytics_mastery: [
        'Analytics that actually matter for {{role}}',
        'Data-driven decisions for {{company}}',
        'Track what counts: Your analytics guide'
      ],
      advanced_automation: [
        'Advanced: Multi-step automation workflows',
        'Power user secrets for {{app_name}}',
        'Take {{company}} to the next level'
      ],
      best_practices: [
        '{{industry}} marketing automation best practices',
        'What top performers do differently',
        'Proven strategies for {{company}}\'s growth'
      ],
      community_showcase: [
        'Community spotlight: Learn from peers',
        'How companies like {{company}} succeed',
        '{{industry}} automation examples'
      ],
      certification: [
        '{{first_name}}, earn your automation certification',
        'Become a certified {{app_name}} expert',
        'Professional certification for {{role}}'
      ]
    };
    
    const templates = subjectTemplates[emailType] || ['{{app_name}} Update'];
    return templates[Math.floor(Math.random() * templates.length)];
  }

  /**
   * Generate preheader text
   */
  generatePreheader(emailType, sequence) {
    const preheaderTemplates = {
      welcome: 'Let\'s get your first automation running in minutes',
      quick_win: 'The easiest automation you\'ll ever create',
      case_study: 'Real results from real users like you',
      personalized_tips: 'Custom recommendations based on your usage',
      upgrade_offer: 'Exclusive discount expires in 48 hours',
      announcement: 'Be the first to know about our biggest update',
      feature_preview: 'Get early access before everyone else',
      countdown: 'Your exclusive discount code is waiting',
      launch_announcement: 'Limited time launch pricing available now',
      last_chance: 'Don\'t miss out on 40% savings',
      progress_report: 'See your automation wins this month',
      advanced_features: 'Unlock the full power of automation',
      milestone_celebration: 'You\'ve achieved something special',
      feedback_request: '2-minute survey + surprise reward',
      loyalty_reward: 'Thank you for being an amazing user',
      annual_review: 'Your year in review + special bonus',
      we_miss_you: 'Let\'s get your automations running again',
      whats_new: 'Major updates you\'ll love',
      special_offer: 'Welcome back with 50% off',
      automation_basics: 'Everything you need to get started',
      content_strategy: 'Plan like a marketing pro',
      platform_integration: 'Connect all your favorite tools',
      analytics_mastery: 'Make data-driven decisions',
      advanced_automation: 'Take your skills to the next level',
      best_practices: 'Learn from the best in your industry',
      community_showcase: 'Get inspired by success stories',
      certification: 'Validate your expertise'
    };
    
    return preheaderTemplates[emailType] || 'Important update from ' + sequence.customizations.appName;
  }

  /**
   * Generate email content structure
   */
  async generateEmailContent(emailType, sequence) {
    const content = {
      hero: this.generateHeroSection(emailType),
      body: this.generateBodyContent(emailType, sequence),
      cta: this.generateCTASection(emailType),
      footer: this.generateFooterContent(sequence),
      design: this.getEmailDesign(emailType)
    };
    
    return content;
  }

  /**
   * Generate hero section
   */
  generateHeroSection(emailType) {
    const heroTemplates = {
      welcome: {
        image: 'welcome-hero.png',
        headline: 'Welcome to the Future of Marketing Automation',
        subheadline: 'Let\'s get your first automation live in the next 5 minutes'
      },
      launch_announcement: {
        image: 'launch-hero.png',
        headline: '🎉 The Wait is Over!',
        subheadline: 'Marketing Automation Hub 2.0 is here with your exclusive discount'
      },
      progress_report: {
        image: 'progress-hero.png',
        headline: 'Your Monthly Automation Report',
        subheadline: 'See how much time and money you\'ve saved'
      },
      we_miss_you: {
        image: 'comeback-hero.png',
        headline: 'We\'ve Missed You!',
        subheadline: 'Your automations are waiting for you to return'
      }
    };
    
    return heroTemplates[emailType] || {
      image: 'default-hero.png',
      headline: 'Marketing Automation Update',
      subheadline: 'Important information for your success'
    };
  }

  /**
   * Generate body content
   */
  generateBodyContent(emailType, sequence) {
    const contentBlocks = {
      welcome: [
        {
          type: 'text',
          content: 'Hi {{first_name}},\n\nI\'m thrilled to welcome you to {{app_name}}! You\'ve just joined thousands of creators and marketers who are saving 10+ hours every week on repetitive marketing tasks.'
        },
        {
          type: 'steps',
          title: 'Get Started in 3 Simple Steps:',
          items: [
            'Connect your first platform (takes 30 seconds)',
            'Choose a pre-built automation template',
            'Customize and activate - you\'re done!'
          ]
        },
        {
          type: 'button',
          text: 'Create Your First Automation',
          url: '{{app_url}}/onboarding',
          style: 'primary'
        },
        {
          type: 'testimonial',
          quote: 'I set up my first automation in 5 minutes and it\'s been running perfectly for months!',
          author: 'Sarah Chen, Content Creator',
          image: 'testimonial-sarah.jpg'
        }
      ],
      
      case_study: [
        {
          type: 'text',
          content: '{{first_name}}, I wanted to share an inspiring story from a {{industry}} company just like yours.'
        },
        {
          type: 'case_study_metrics',
          company: '{{similar_company}}',
          metrics: [
            { label: 'Time Saved', value: '15 hours/week' },
            { label: 'Engagement Increase', value: '312%' },
            { label: 'ROI', value: '450%' }
          ]
        },
        {
          type: 'quote',
          content: 'The biggest transformation was being able to maintain consistent posting across 8 platforms without the daily stress.',
          author: 'Marketing Director, {{similar_company}}'
        },
        {
          type: 'button',
          text: 'See How They Did It',
          url: '{{app_url}}/case-studies/{{similar_company_slug}}',
          style: 'primary'
        }
      ],
      
      progress_report: [
        {
          type: 'greeting',
          content: 'Hi {{first_name}},\n\nHere\'s your monthly automation report for {{company}}:'
        },
        {
          type: 'metrics_dashboard',
          title: 'Your Automation Achievements',
          metrics: [
            { icon: '⏰', label: 'Hours Saved', value: '{{hours_saved}}' },
            { icon: '📈', label: 'Posts Published', value: '{{posts_published}}' },
            { icon: '💰', label: 'Estimated Value', value: '${{value_generated}}' },
            { icon: '🎯', label: 'Engagement Rate', value: '{{engagement_rate}}%' }
          ]
        },
        {
          type: 'chart',
          title: 'Engagement Trend',
          chartType: 'line',
          dataKey: 'monthly_engagement'
        },
        {
          type: 'recommendations',
          title: 'Recommended Next Steps:',
          items: '{{personalized_recommendations}}'
        }
      ],
      
      special_offer: [
        {
          type: 'text',
          content: '{{first_name}}, we really want you back at {{app_name}}. Here\'s an exclusive offer just for you:'
        },
        {
          type: 'offer_box',
          discount: '50% OFF',
          description: 'Any plan for your first 3 months back',
          code: 'COMEBACK50',
          expires: '{{expiry_date}}'
        },
        {
          type: 'features_grid',
          title: 'Plus, check out what\'s new:',
          features: [
            { icon: '🤖', title: 'AI Content Generation', description: 'Create posts 10x faster' },
            { icon: '📊', title: 'Advanced Analytics', description: 'Deeper insights than ever' },
            { icon: '🔗', title: '20+ New Integrations', description: 'Connect all your tools' },
            { icon: '📱', title: 'Mobile App', description: 'Manage on the go' }
          ]
        },
        {
          type: 'button',
          text: 'Claim Your 50% Discount',
          url: '{{app_url}}/comeback?code=COMEBACK50',
          style: 'primary',
          size: 'large'
        }
      ]
    };
    
    return contentBlocks[emailType] || contentBlocks.welcome;
  }

  /**
   * Generate CTA section
   */
  generateCTASection(emailType) {
    const ctaTemplates = {
      welcome: {
        primary: { text: 'Start First Automation', url: '/onboarding' },
        secondary: { text: 'Explore Features', url: '/features' }
      },
      quick_win: {
        primary: { text: 'Try This Automation', url: '/quick-start' },
        secondary: { text: 'See More Templates', url: '/templates' }
      },
      case_study: {
        primary: { text: 'Read Full Story', url: '/case-study' },
        secondary: { text: 'Start Free Trial', url: '/trial' }
      },
      upgrade_offer: {
        primary: { text: 'Upgrade Now - 40% Off', url: '/upgrade' },
        secondary: { text: 'Compare Plans', url: '/pricing' }
      },
      launch_announcement: {
        primary: { text: 'Get 40% Off Now', url: '/launch-offer' },
        secondary: { text: 'Learn More', url: '/whats-new' }
      },
      we_miss_you: {
        primary: { text: 'Reactivate Account', url: '/reactivate' },
        secondary: { text: 'See What\'s New', url: '/updates' }
      }
    };
    
    return ctaTemplates[emailType] || ctaTemplates.welcome;
  }

  /**
   * Build personalization rules
   */
  buildPersonalizationRules(userSegment) {
    const rules = {
      dynamicFields: [],
      conditionalContent: [],
      behaviorTriggers: []
    };
    
    // Segment-specific personalization
    switch (userSegment) {
      case 'new_users':
        rules.dynamicFields = ['first_name', 'company', 'signup_date'];
        rules.conditionalContent = [
          { condition: 'plan_type == "free"', content: 'upgrade_prompts' },
          { condition: 'industry', content: 'industry_examples' }
        ];
        break;
        
      case 'power_users':
        rules.dynamicFields = ['first_name', 'usage_stats', 'advanced_features'];
        rules.conditionalContent = [
          { condition: 'team_size > 5', content: 'team_features' },
          { condition: 'automations_count > 10', content: 'scale_tips' }
        ];
        break;
        
      case 'at_risk':
        rules.dynamicFields = ['first_name', 'last_active', 'favorite_feature'];
        rules.conditionalContent = [
          { condition: 'churn_risk > 0.7', content: 'urgent_offer' },
          { condition: 'support_tickets > 2', content: 'help_resources' }
        ];
        break;
    }
    
    return rules;
  }

  /**
   * Get email-specific personalization
   */
  getEmailPersonalization(emailType) {
    const personalizationMap = {
      welcome: {
        fields: ['first_name', 'company', 'industry'],
        dynamic: ['onboarding_progress', 'recommended_templates']
      },
      case_study: {
        fields: ['first_name', 'industry', 'company_size'],
        dynamic: ['similar_company', 'relevant_metrics']
      },
      progress_report: {
        fields: ['first_name', 'company'],
        dynamic: ['hours_saved', 'posts_published', 'engagement_rate', 'value_generated']
      },
      special_offer: {
        fields: ['first_name', 'plan_type'],
        dynamic: ['discount_amount', 'expiry_date', 'personalized_benefits']
      }
    };
    
    return personalizationMap[emailType] || {
      fields: ['first_name'],
      dynamic: []
    };
  }

  /**
   * Generate A/B tests for email
   */
  generateABTests(emailType) {
    const tests = [];
    
    // Subject line tests
    tests.push({
      element: 'subject',
      variants: 3,
      testPercentage: 20,
      metric: 'open_rate'
    });
    
    // CTA tests for conversion-focused emails
    if (['upgrade_offer', 'launch_announcement', 'special_offer'].includes(emailType)) {
      tests.push({
        element: 'cta_text',
        variants: 2,
        testPercentage: 30,
        metric: 'click_rate'
      });
      
      tests.push({
        element: 'cta_color',
        variants: 2,
        options: ['#5B4EFF', '#FF5B5B'],
        testPercentage: 20,
        metric: 'conversion_rate'
      });
    }
    
    // Send time tests
    tests.push({
      element: 'send_time',
      variants: 3,
      options: ['morning', 'afternoon', 'evening'],
      testPercentage: 15,
      metric: 'open_rate'
    });
    
    return tests;
  }

  /**
   * Apply brand voice to emails
   */
  applyBrandVoice(emails, brandVoice) {
    return emails.map(email => {
      // Apply tone adjustments
      if (brandVoice.tone === 'professional') {
        email.content.body = this.professionalizeContent(email.content.body);
      } else if (brandVoice.tone === 'casual') {
        email.content.body = this.casualizeContent(email.content.body);
      }
      
      // Apply personality traits
      if (brandVoice.personality.includes('enthusiastic')) {
        email.subject = this.addEnthusiasm(email.subject);
      }
      
      return email;
    });
  }

  /**
   * Calculate expected performance
   */
  calculateExpectedPerformance(sequence) {
    const performance = {
      expectedOpenRate: 0,
      expectedClickRate: 0,
      expectedConversion: 0,
      projectedRevenue: 0
    };
    
    // Average the expected metrics across all emails
    const totalEmails = sequence.emails.length;
    
    sequence.emails.forEach(email => {
      performance.expectedOpenRate += email.expectedMetrics.openRate;
      performance.expectedClickRate += email.expectedMetrics.clickRate;
    });
    
    performance.expectedOpenRate = (performance.expectedOpenRate / totalEmails * 100).toFixed(1) + '%';
    performance.expectedClickRate = (performance.expectedClickRate / totalEmails * 100).toFixed(1) + '%';
    
    // Conversion estimates based on sequence type
    const conversionRates = {
      welcome: 0.15,
      launch: 0.25,
      retention: 0.10,
      winback: 0.08,
      education: 0.12
    };
    
    performance.expectedConversion = (conversionRates[sequence.type] * 100).toFixed(1) + '%';
    
    // Revenue projections (simplified)
    const avgOrderValues = {
      welcome: 97,    // Starter plan
      launch: 297,    // Pro plan with discount
      retention: 397, // Pro plan renewal
      winback: 197,   // Discounted return
      education: 297  // Upgrade to Pro
    };
    
    const segmentSize = sequence.customizations.segmentSize || 1000;
    const conversions = segmentSize * conversionRates[sequence.type];
    performance.projectedRevenue = '$' + (conversions * avgOrderValues[sequence.type]).toLocaleString();
    
    return performance;
  }

  /**
   * Generate email design settings
   */
  getEmailDesign(emailType) {
    const designs = {
      welcome: {
        template: 'clean-centered',
        primaryColor: '#5B4EFF',
        headerImage: true,
        socialLinks: true
      },
      launch_announcement: {
        template: 'hero-focused',
        primaryColor: '#FF5B5B',
        headerImage: true,
        countdown: true
      },
      progress_report: {
        template: 'data-rich',
        primaryColor: '#5B4EFF',
        charts: true,
        metrics: true
      },
      case_study: {
        template: 'story-focused',
        primaryColor: '#5B4EFF',
        testimonials: true,
        images: true
      }
    };
    
    return designs[emailType] || designs.welcome;
  }

  /**
   * Generate footer content
   */
  generateFooterContent(sequence) {
    return {
      company: '{{company_name}}',
      address: '{{company_address}}',
      unsubscribe: '{{unsubscribe_url}}',
      preferences: '{{preferences_url}}',
      socialLinks: {
        twitter: 'https://twitter.com/marketingautohub',
        linkedin: 'https://linkedin.com/company/marketingautohub',
        facebook: 'https://facebook.com/marketingautohub'
      },
      legalText: 'You received this email because you signed up for {{app_name}}. We promise to only send valuable content.',
      customMessage: sequence.customizations.footerMessage || ''
    };
  }

  /**
   * Content transformation helpers
   */
  professionalizeContent(content) {
    // Transform casual language to professional
    if (Array.isArray(content)) {
      return content.map(block => {
        if (block.content && typeof block.content === 'string') {
          block.content = block.content
            .replace(/Hey/g, 'Hello')
            .replace(/awesome/gi, 'excellent')
            .replace(/!/g, '.')
            .replace(/cool/gi, 'impressive');
        }
        return block;
      });
    }
    return content;
  }

  casualizeContent(content) {
    // Transform professional language to casual
    if (Array.isArray(content)) {
      return content.map(block => {
        if (block.content && typeof block.content === 'string') {
          block.content = block.content
            .replace(/Hello/g, 'Hey')
            .replace(/\./g, '!')
            .replace(/impressive/gi, 'cool');
        }
        return block;
      });
    }
    return content;
  }

  addEnthusiasm(text) {
    // Add excitement to subject lines
    if (!text.includes('!') && !text.includes('🎉')) {
      return text + ' 🎉';
    }
    return text;
  }

  /**
   * Export sequence for use
   */
  exportSequence(sequence, format = 'json') {
    if (format === 'json') {
      return JSON.stringify(sequence, null, 2);
    } else if (format === 'markdown') {
      return this.generateMarkdownExport(sequence);
    } else if (format === 'html') {
      return this.generateHTMLExport(sequence);
    }
    
    throw new Error(`Unsupported export format: ${format}`);
  }

  /**
   * Generate markdown documentation
   */
  generateMarkdownExport(sequence) {
    let markdown = `# Email Sequence: ${sequence.name}\n\n`;
    markdown += `**Type**: ${sequence.type}\n`;
    markdown += `**Description**: ${sequence.description}\n`;
    markdown += `**Target Segment**: ${sequence.segment}\n\n`;
    
    markdown += `## Expected Performance\n`;
    markdown += `- Open Rate: ${sequence.performance.expectedOpenRate}\n`;
    markdown += `- Click Rate: ${sequence.performance.expectedClickRate}\n`;
    markdown += `- Conversion: ${sequence.performance.expectedConversion}\n`;
    markdown += `- Revenue: ${sequence.performance.projectedRevenue}\n\n`;
    
    markdown += `## Email Sequence\n\n`;
    
    sequence.emails.forEach((email, index) => {
      markdown += `### Email ${index + 1}: ${email.type}\n`;
      markdown += `**Timing**: Day ${email.timing}\n`;
      markdown += `**Goal**: ${email.goal}\n`;
      markdown += `**Subject**: ${email.subject}\n`;
      markdown += `**Preheader**: ${email.preheader}\n\n`;
      
      if (email.abTests.length > 0) {
        markdown += `**A/B Tests**:\n`;
        email.abTests.forEach(test => {
          markdown += `- ${test.element} (${test.variants} variants, ${test.testPercentage}% test)\n`;
        });
        markdown += '\n';
      }
    });
    
    return markdown;
  }

  /**
   * Generate HTML preview
   */
  generateHTMLExport(sequence) {
    // Generate full HTML preview of sequence
    // This would create a visual timeline of all emails
    return `<html><!-- Sequence preview --></html>`;
  }
}

module.exports = EmailSequenceBuilder;