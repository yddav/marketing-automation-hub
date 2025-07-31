// Untrapd Ecosystem Mailchimp Configuration
// Agent C - Marketing Integration & Revenue Optimization

/**
 * Mailchimp configuration specifically for Untrapd ecosystem
 * Handles FINDERR users → Etsy shop cross-promotion → Hub engagement
 */

const untrapdMailchimpConfig = {
  // API Configuration
  apiKey: process.env.MAILCHIMP_API_KEY,
  serverPrefix: process.env.MAILCHIMP_SERVER_PREFIX || 'us21', // Update based on your Mailchimp account
  baseUrl: `https://${process.env.MAILCHIMP_SERVER_PREFIX || 'us21'}.api.mailchimp.com/3.0`,
  
  // Brand Configuration
  branding: {
    companyName: 'Untrapd',
    fromName: 'The Untrapd Team',
    fromEmail: 'hello@untrapd.com',
    replyTo: 'support@untrapd.com',
    websiteUrl: 'https://hub.untrapd.com',
    appStoreUrls: {
      ios: 'https://apps.apple.com/app/finderr', // Update when available
      android: 'https://play.google.com/store/apps/details?id=com.untrapd.finderr' // Update when available
    },
    etsyShopUrl: 'https://www.etsy.com/shop/SuperHyperCar' // Update with actual URL
  },

  // Audience Lists Configuration
  audienceLists: {
    finderrUsers: {
      name: 'FINDERR Users',
      description: 'Users who downloaded and use FINDERR app',
      tags: ['finderr', 'app-users', 'productivity'],
      customFields: {
        'APP_INSTALL_DATE': 'date',
        'USER_ENGAGEMENT': 'text', // high, medium, low
        'PLATFORM': 'text', // ios, android, web
        'REFERRAL_SOURCE': 'text'
      }
    },
    etsyCustomers: {
      name: 'SuperHyperCar Customers',
      description: 'Customers who purchased from Etsy shop',
      tags: ['etsy', 'customers', 'automotive', 'apparel'],
      customFields: {
        'PURCHASE_DATE': 'date',
        'ORDER_VALUE': 'number',
        'PRODUCT_CATEGORIES': 'text',
        'REPEAT_CUSTOMER': 'text' // yes, no
      }
    },
    hubCommunity: {
      name: 'Hub Community Members',
      description: 'Engaged community members from hub.untrapd.com',
      tags: ['hub', 'community', 'engaged'],
      customFields: {
        'SIGNUP_DATE': 'date',
        'INTERESTS': 'text', // apps, automotive, both
        'ENGAGEMENT_SCORE': 'number'
      }
    }
  },

  // Email Sequences Configuration
  emailSequences: {
    finderrWelcome: {
      name: 'FINDERR Welcome & Cross-Promotion',
      description: 'Welcome new FINDERR users and introduce Etsy shop',
      audience: 'finderrUsers',
      trigger: 'app_download',
      emails: [
        {
          day: 0,
          subject: '🎉 Welcome to FINDERR - Your app discovery journey starts now!',
          template: 'finderr_welcome_day0',
          goals: ['onboarding', 'engagement'],
          crossPromotion: 'subtle_etsy_mention'
        },
        {
          day: 1,
          subject: '📱 Your first 3 app recommendations are ready (+ a surprise)',
          template: 'finderr_day1_recommendations',
          goals: ['feature_usage', 'etsy_awareness'],
          crossPromotion: 'etsy_discount_15_percent'
        },
        {
          day: 3,
          subject: 'The #1 mistake new app discoverers make',
          template: 'finderr_common_mistakes',
          goals: ['education', 'retention'],
          crossPromotion: 'lifestyle_alignment'
        },
        {
          day: 7,
          subject: '🚀 One week with FINDERR: How many new apps did you discover?',
          template: 'finderr_week1_celebration',
          goals: ['milestone_celebration', 'community_building'],
          crossPromotion: 'community_spotlight'
        },
        {
          day: 14,
          subject: '🏎️ From discovering apps to expressing your style',
          template: 'finderr_etsy_integration',
          goals: ['cross_platform_conversion', 'lifestyle_bridge'],
          crossPromotion: 'direct_etsy_promotion'
        }
      ]
    },
    etsyCustomerWelcome: {
      name: 'Etsy Customer Welcome & FINDERR Intro',
      description: 'Welcome Etsy customers and introduce FINDERR',
      audience: 'etsyCustomers',
      trigger: 'etsy_purchase',
      emails: [
        {
          day: 0,
          subject: '🏎️ Thanks for your SuperHyperCar order - you\'re going to love it!',
          template: 'etsy_welcome_day0',
          goals: ['order_confirmation', 'brand_introduction'],
          crossPromotion: 'finderr_teaser'
        },
        {
          day: 3,
          subject: '📱 Love supercars? You\'ll love discovering apps too',
          template: 'etsy_finderr_intro',
          goals: ['cross_platform_conversion', 'value_alignment'],
          crossPromotion: 'finderr_direct_promotion'
        },
        {
          day: 7,
          subject: '🎨 Behind the design: Your SuperHyperCar hoodie story',
          template: 'etsy_design_story',
          goals: ['brand_storytelling', 'engagement'],
          crossPromotion: 'hub_community_invite'
        }
      ]
    },
    unifiedEcosystem: {
      name: 'Unified Ecosystem Engagement',
      description: 'For users engaged with multiple platforms',
      audience: 'hubCommunity',
      trigger: 'multi_platform_engagement',
      emails: [
        {
          day: 0,
          subject: '🌟 Welcome to the complete Untrapd experience',
          template: 'ecosystem_welcome',
          goals: ['ecosystem_overview', 'premium_positioning'],
          crossPromotion: 'all_platforms'
        },
        {
          day: 7,
          subject: '📊 Your Untrapd activity recap + exclusive offers',
          template: 'ecosystem_weekly_recap',
          goals: ['engagement_summary', 'retention'],
          crossPromotion: 'personalized_recommendations'
        }
      ]
    }
  },

  // Automation Rules
  automationRules: {
    crossPromotionTriggers: {
      // FINDERR user to Etsy
      appToEtsy: {
        condition: 'app_engagement >= 7_days AND no_etsy_purchase',
        action: 'send_etsy_promotion_email',
        discount: '15_percent_first_order'
      },
      // Etsy customer to AppFinder
      etsyToApp: {
        condition: 'etsy_purchase_complete AND no_app_download',
        action: 'send_finderr_promotion_email',
        incentive: 'productivity_lifestyle_alignment'
      },
      // Hub engagement boost
      hubEngagement: {
        condition: 'multi_platform_user AND low_hub_engagement',
        action: 'send_hub_community_invitation',
        incentive: 'exclusive_content_access'
      }
    },
    
    segmentationRules: {
      highValueUsers: {
        criteria: ['app_daily_user', 'etsy_repeat_customer', 'hub_active'],
        treatment: 'vip_sequence',
        benefits: ['early_access', 'exclusive_designs', 'priority_support']
      },
      newUserNurture: {
        criteria: ['recent_signup', 'single_platform'],
        treatment: 'ecosystem_introduction',
        goal: 'cross_platform_adoption'
      }
    }
  },

  // Template Variables for Untrapd Brand
  templateVariables: {
    // Core brand variables
    app_name: 'FINDERR',
    company_name: 'Untrapd',
    sender_name: 'The Untrapd Team',
    sender_title: 'Community Manager',
    
    // FINDERR specific
    primary_benefit: 'discover apps that actually improve their productivity',
    core_value_1: 'efficiency',
    core_value_2: 'quality',
    core_value_3: 'community',
    
    // Cross-promotion variables
    etsy_shop_name: 'SuperHyperCar Designs',
    etsy_product_focus: 'premium automotive-inspired hoodies',
    hub_url: 'https://hub.untrapd.com',
    community_value_prop: 'where tech innovation meets automotive passion',
    
    // Lifestyle bridge messaging
    lifestyle_connection: 'Just like you appreciate precision in apps, you value excellence in design',
    value_alignment: 'Quality apps, premium style - both reflect your attention to detail',
    
    // Call-to-action buttons
    cta_finderr: 'Discover Your Next App',
    cta_etsy: 'Shop Premium Hoodies',
    cta_hub: 'Join the Community',
    cta_ecosystem: 'Explore Everything'
  },

  // Performance Tracking Configuration
  tracking: {
    goals: {
      crossPlatformConversion: {
        appToEtsy: 0.03, // 3% of app users make Etsy purchase
        etsyToApp: 0.08, // 8% of Etsy customers download app
        hubEngagement: 0.12 // 12% become active hub members
      },
      emailPerformance: {
        openRate: 0.45,
        clickThroughRate: 0.08,
        unsubscribeRate: 0.02,
        sequenceCompletion: 0.35
      },
      revenueAttribution: {
        emailToEtsySales: 0.15, // 15% of Etsy sales from email
        emailToAppUpgrade: 0.20, // 20% of premium upgrades from email
        crossPlatformLTV: 2.5 // 2.5x higher lifetime value for multi-platform users
      }
    },
    
    customEvents: [
      'app_download_from_email',
      'etsy_visit_from_email',
      'hub_signup_from_email',
      'cross_platform_purchase',
      'sequence_completion',
      'referral_generated'
    ]
  }
};

module.exports = untrapdMailchimpConfig;