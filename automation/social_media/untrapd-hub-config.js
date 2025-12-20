/**
 * Untrapd Hub Social Media Configuration
 * Integration config for @untrapd.hub accounts with existing automation system
 */

const untrapdHubConfig = {
  // Brand Identity
  brand: {
    name: "Untrapd Hub",
    tagline: "Your intelligence hub unleashed",
    logo: "brain-neural-network-logo.png",
    colors: {
      primary: "#FF69B4", // Pink text
      secondary: "#4169E1", // Blue brain
      accent: "#00BFFF", // Electric blue
      background: "#000000" // Dark theme
    },
    messaging: {
      core: "Intelligence hub for AI-powered apps",
      flagship: "FINDERR - Never lose your phone permanently",
      ecosystem: "Premium productivity & security solutions"
    }
  },

  // Platform Accounts - UPDATE THESE WHEN ACCOUNTS ARE SECURED
  platforms: {
    instagram: {
      username: "untrapd.hub",
      displayName: "Untrapd Hub",
      bio: "🧠 Your intelligence hub unleashed\n📱 FINDERR - Never lose your phone permanently\n⚡ AI apps for productivity & security\n🔗 hub.untrapd.com",
      category: "Software Company",
      businessAccountId: "76216363129", // Updated with actual Instagram Account ID
      accessToken: process.env.INSTAGRAM_ACCESS_TOKEN
    },
    twitter: {
      username: "untrapd.hub", 
      displayName: "Untrapd Hub",
      bio: "🧠 Intelligence hub for AI-powered apps | 📱 FINDERR: Never lose your phone permanently | ⚡ Premium productivity & security solutions | 🔗 hub.untrapd.com",
      bearerToken: process.env.TWITTER_BEARER_TOKEN
    },
    tiktok: {
      username: "untrapd.hub",
      displayName: "Untrapd Hub", 
      bio: "🧠 Making tech smarter, life easier\n📱 FINDERR app creator\n⚡ Intelligence unleashed\n🔗 hub.untrapd.com",
      accessToken: process.env.TIKTOK_ACCESS_TOKEN
    },
    facebook: {
      pageName: "un trapd",
      about: "un trapd creates premium AI-powered applications for productivity and security. Our flagship app FINDERR ensures you never lose your phone permanently. Intelligence unleashed through smart technology solutions.",
      pageId: "UPDATE_WITH_NEW_PAGE_ID", // Will be updated with actual Facebook Page ID for "un trapd"
      pageAccessToken: process.env.FACEBOOK_PAGE_TOKEN
    }
  },

  // Content Strategy Configuration
  contentStrategy: {
    // Daily content themes
    weeklyThemes: {
      monday: {
        theme: "Motivation Monday",
        focus: "Inspiration, goal-setting, productivity mindset",
        finderrIntegration: "Start the week knowing your phone is secure",
        hashtags: ["#MotivationMonday", "#ProductivityGoals", "#SmartStart"]
      },
      tuesday: {
        theme: "Tech Tuesday", 
        focus: "Education, industry insights, thought leadership",
        finderrIntegration: "Phone security education, features explanation",
        hashtags: ["#TechTuesday", "#TechTips", "#AIInsights"]
      },
      wednesday: {
        theme: "Widget Wednesday",
        focus: "Product promotion, user stories, features", 
        finderrIntegration: "Primary focus day for app content",
        hashtags: ["#WidgetWednesday", "#FINDERR", "#AppFeatures"]
      },
      thursday: {
        theme: "Throwback Thursday",
        focus: "Storytelling, community building, transparency",
        finderrIntegration: "Development story, problem-solving journey", 
        hashtags: ["#ThrowbackThursday", "#DevJourney", "#BehindTheScenes"]
      },
      friday: {
        theme: "Feature Friday",
        focus: "Community, ecosystem, future vision",
        finderrIntegration: "Position as flagship success, tease ecosystem growth",
        hashtags: ["#FeatureFriday", "#UntrapдHub", "#Innovation"]
      },
      weekend: {
        theme: "Community Weekend",
        focus: "Community engagement, user appreciation", 
        finderrIntegration: "User success stories, community building",
        hashtags: ["#Community", "#UserStories", "#WeekendVibes"]
      }
    },

    // Content distribution percentages
    contentMix: {
      finderrContent: 40, // Primary app focus
      hubEcosystem: 20,   // Future apps, ecosystem
      educational: 25,    // Tech tips, industry insights
      community: 15       // User stories, engagement
    },

    // Posting frequency per platform
    postingSchedule: {
      instagram: {
        feedPosts: 2, // per day
        stories: 4,   // per day
        reels: 5      // per week
      },
      twitter: {
        tweets: 4,    // per day
        threads: 3    // per week
      },
      tiktok: {
        videos: 1     // per day
      },
      facebook: {
        posts: 1      // per day
      }
    }
  },

  // FINDERR Integration Configuration - v4.3.0 Android Pre-Launch
  finderrIntegration: {
    // App version info
    appVersion: "4.3.0 (Build 267)",
    platform: "Android-only",
    status: "pre-launch-beta",

    // Dynamic content variables
    dynamicVariables: {
      betaTesters: "beta_testers_count",
      betaSlotsRemaining: "beta_slots_remaining",
      subscriberCount: "total_subscribers",
      userCount: "active_users",
      testimonials: "user_testimonial_rotation",
      milestones: "subscriber_milestone_celebrations"
    },

    // Android-only revenue model (v4.3.0)
    pricing: {
      monthly: "$8.99/month",
      annual: "$107.88/year",
      freeTrial: "7 days",
      competitiveSavings: "Save 20-30% vs $10-12/month competitors",
      messaging: {
        value: "$8.99/month Android phone security with 99.7% recovery rate",
        comparison: "Professional features at 20-30% less than competitors",
        trial: "7 days free trial - try before you commit",
        platform: "100% Android optimized - no iOS bloat"
      }
    },

    // Pre-launch beta campaign
    betaCampaign: {
      name: "FINDERR v4.3.0 Beta Testing",
      phase: "pre-launch-awareness",
      betaGoal: 100,
      messaging: {
        recruitment: "Join 100 beta testers for FINDERR v4.3.0 launch",
        urgency: "Only {beta_slots_remaining} beta spots available",
        security: "Help validate security (RLS) before production launch",
        rewards: "50% lifetime discount ($4.50/month) for beta testers",
        ecosystem: "Part of the UNTRAPD ecosystem"
      }
    },

    // Content themes for pre-launch
    contentThemes: {
      monday: "Android Security Monday - Security tips & FINDERR features",
      tuesday: "Tech Tuesday - Android ecosystem integration",
      wednesday: "FINDERR Feature Wednesday - App capabilities showcase",
      thursday: "User Story Thursday - Early adopter testimonials",
      friday: "Android Tips Friday - Optimization & best practices",
      weekend: "Community Weekend - Beta tester engagement"
    },

    // Milestone automation (subscriber-based)
    milestones: [
      { subscribers: 100, message: "🎉 100 Android users trust FINDERR!" },
      { subscribers: 500, message: "🚀 500 Android users secured with FINDERR!" },
      { subscribers: 1000, message: "⚡ 1,000 Android users can't be wrong!" },
      { subscribers: 2500, message: "🔥 2,500+ Android users protected by FINDERR!" },
      { subscribers: 5000, message: "✅ 5K milestone - Android users love FINDERR!" }
    ],

    // Competitive messaging
    competitiveMessaging: {
      price: "$8.99/month vs $12+ competitors - same professional features",
      platform: "Made for Android, optimized for Android - no iOS compromises",
      trial: "7 days free - try before you commit",
      features: "99.7% recovery rate with professional security features"
    }
  },

  // Automation Integration Settings
  automation: {
    // Optimal posting times by platform
    optimalTimes: {
      instagram: ["09:00", "18:00"],
      twitter: ["08:00", "12:00", "16:00", "20:00"], 
      tiktok: ["19:00"],
      facebook: ["10:00"]
    },

    // Hashtag strategies by platform
    hashtagStrategy: {
      instagram: {
        primary: ["#UntrapдHub", "#FINDERR", "#PhoneSecurity"],
        secondary: ["#ProductivityApps", "#TechTips", "#SmartLiving"],
        trending: ["#TechHacks", "#PhoneRecovery", "#AIApps"],
        maxCount: 30
      },
      twitter: {
        primary: ["#UntrapдHub", "#FINDERR", "#PhoneSecurity"],
        secondary: ["#TechTips", "#Productivity", "#AppDev"],
        maxCount: 5
      },
      tiktok: {
        primary: ["#UntrapдHub", "#FINDERR", "#TechTips"],
        secondary: ["#PhoneSecurity", "#TechHacks", "#AppDemo"],
        trending: ["#TechTok", "#LifeHacks", "#SmartLiving"],
        maxCount: 10
      }
    },

    // Content templates for automation
    templates: {
      milestone: "🎉 Milestone Alert: {milestone_text} Thanks to our amazing community! #UntrapдHub #FINDERR",
      testimonial: "💬 User Love: \"{testimonial}\" - {user_name} #UntrapдHub #FINDERR #UserStories",
      feature: "✨ FINDERR Feature Spotlight: {feature_name} - {feature_description} #FINDERR #TechTips",
      educational: "🧠 Tech Tip: {tip_content} #TechTips #Productivity #UntrapдHub",
      ecosystem: "🌟 Coming to the Untrapd Hub: {future_app_tease} Stay tuned! #UntrapдHub #Innovation"
    },

    // Performance tracking configuration
    analytics: {
      kpis: [
        "follower_growth_rate",
        "engagement_rate", 
        "website_traffic_from_social",
        "finderr_downloads_attributed",
        "lifetime_conversions_from_social",
        "subscription_conversions_from_social"
      ],
      targets: {
        follower_growth: 20, // % monthly
        engagement_rate: 3,  // % minimum
        social_conversion: 5 // % of FINDERR sales from social
      }
    }
  },

  // Integration with existing hub automation
  hubIntegration: {
    // API endpoints for hub integration
    apiEndpoints: {
      userStats: "https://hub.untrapd.com/api/finderr/stats",
      milestones: "https://hub.untrapd.com/api/finderr/milestones", 
      testimonials: "https://hub.untrapd.com/api/finderr/testimonials",
      updates: "https://hub.untrapd.com/api/social/updates"
    },

    // Webhook configurations
    webhooks: {
      newUser: "https://hub.untrapd.com/webhooks/social/new-user",
      milestone: "https://hub.untrapd.com/webhooks/social/milestone",
      purchase: "https://hub.untrapd.com/webhooks/social/purchase"
    },

    // Cross-platform promotion
    crossPromotion: {
      hubWebsite: "hub.untrapd.com",
      finderrLanding: "hub.untrapd.com/apps/finderr",
      socialHub: "hub.untrapd.com/social",
      support: "hub.untrapd.com/support"
    }
  }
};

module.exports = untrapdHubConfig;