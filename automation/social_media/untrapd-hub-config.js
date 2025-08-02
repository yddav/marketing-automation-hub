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
      pageName: "Untrapd Hub",
      about: "Untrapd Hub creates premium AI-powered applications for productivity and security. Our flagship app FINDERR ensures you never lose your phone permanently. Intelligence unleashed through smart technology solutions.",
      pageId: "750014458192598", // Updated with actual Facebook Page ID
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

  // FINDERR Integration Configuration
  finderrIntegration: {
    // Dynamic content variables
    dynamicVariables: {
      lifetimeSlots: "lifetime_slots_remaining",
      userCount: "new_users_today", 
      downloads: "app_downloads",
      testimonials: "user_testimonial_rotation",
      milestones: "user_milestone_celebrations"
    },

    // Hybrid revenue model campaign
    hybridCampaign: {
      phase1: {
        name: "Early Adopter Lifetime",
        userLimit: 2000,
        messaging: {
          ios: "Lifetime access $24.99 vs $71.88/year with competitors",
          android: "Lifetime access $16.99 vs $53.88/year ongoing costs",
          urgency: "Only {lifetime_slots_remaining} exclusive spots left",
          social_proof: "{filled_slots} smart users already secured their spot"
        }
      },
      phase2: {
        name: "Subscription Launch", 
        messaging: {
          achievement: "Lifetime access now closed - 2,000 members secured",
          continuation: "Monthly access still 50% less than competitors",
          social_proof: "Join thousands of satisfied users",
          value: "Proven by 2,000+ users, now monthly"
        }
      }
    },

    // Milestone automation
    milestones: [
      { users: 500, message: "🎉 500 users joined the Untrapd Hub!" },
      { users: 1000, message: "🚀 1,000 FINDERR users can't be wrong!" },
      { users: 1500, message: "⚡ Only 500 lifetime spots remaining!" },
      { users: 1900, message: "🔥 Final 100 lifetime memberships available!" },
      { users: 2000, message: "✅ Lifetime access complete - monthly now available!" }
    ]
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