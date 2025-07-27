// API Credentials Management System
// Agent B - Phase 2 Task 2.2: Email Marketing & API Integration

const dotenv = require('dotenv');
dotenv.config();

/**
 * Centralized API credentials management with validation and security
 * Supports multiple email service providers and social media platforms
 */

// Environment variable validation
const requiredEnvVars = {
  // Email Service APIs (choose one primary)
  MAILCHIMP_API_KEY: process.env.MAILCHIMP_API_KEY,
  MAILCHIMP_SERVER_PREFIX: process.env.MAILCHIMP_SERVER_PREFIX,
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
  
  // Social Media APIs
  INSTAGRAM_APP_ID: process.env.INSTAGRAM_APP_ID,
  INSTAGRAM_APP_SECRET: process.env.INSTAGRAM_APP_SECRET,
  INSTAGRAM_ACCESS_TOKEN: process.env.INSTAGRAM_ACCESS_TOKEN,
  
  TWITTER_API_KEY: process.env.TWITTER_API_KEY,
  TWITTER_API_SECRET: process.env.TWITTER_API_SECRET,
  TWITTER_ACCESS_TOKEN: process.env.TWITTER_ACCESS_TOKEN,
  TWITTER_ACCESS_TOKEN_SECRET: process.env.TWITTER_ACCESS_TOKEN_SECRET,
  TWITTER_BEARER_TOKEN: process.env.TWITTER_BEARER_TOKEN,
  
  FACEBOOK_APP_ID: process.env.FACEBOOK_APP_ID,
  FACEBOOK_APP_SECRET: process.env.FACEBOOK_APP_SECRET,
  FACEBOOK_ACCESS_TOKEN: process.env.FACEBOOK_ACCESS_TOKEN,
  
  
  // Analytics APIs
  GOOGLE_ANALYTICS_TRACKING_ID: process.env.GOOGLE_ANALYTICS_TRACKING_ID,
  GOOGLE_ANALYTICS_CLIENT_EMAIL: process.env.GOOGLE_ANALYTICS_CLIENT_EMAIL,
  GOOGLE_ANALYTICS_PRIVATE_KEY: process.env.GOOGLE_ANALYTICS_PRIVATE_KEY,
  
  // Database and Cache
  DATABASE_URL: process.env.DATABASE_URL,
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  
  // App Configuration
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3000,
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS || 900000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS || 100
};

// Email Service Provider Selection Logic (Mailchimp preferred)
const getEmailProvider = () => {
  if (requiredEnvVars.MAILCHIMP_API_KEY && requiredEnvVars.MAILCHIMP_SERVER_PREFIX) {
    return 'mailchimp';
  } else if (requiredEnvVars.SENDGRID_API_KEY) {
    return 'sendgrid';
  } else {
    console.warn('No email service provider configured. Email features will be disabled.');
    return null;
  }
};

// API Configuration Objects
const apiConfig = {
  emailProvider: getEmailProvider(),
  
  mailchimp: {
    apiKey: requiredEnvVars.MAILCHIMP_API_KEY,
    serverPrefix: requiredEnvVars.MAILCHIMP_SERVER_PREFIX,
    baseUrl: `https://${requiredEnvVars.MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0`,
    rateLimits: {
      requests: 10,
      per: 'second'
    }
  },
  
  
  sendgrid: {
    apiKey: requiredEnvVars.SENDGRID_API_KEY,
    baseUrl: 'https://api.sendgrid.com/v3',
    rateLimits: {
      requests: 600,
      per: 'minute'
    }
  },
  
  instagram: {
    appId: requiredEnvVars.INSTAGRAM_APP_ID,
    appSecret: requiredEnvVars.INSTAGRAM_APP_SECRET,
    accessToken: requiredEnvVars.INSTAGRAM_ACCESS_TOKEN,
    baseUrl: 'https://graph.instagram.com',
    rateLimits: {
      requests: 200,
      per: 'hour'
    }
  },
  
  twitter: {
    apiKey: requiredEnvVars.TWITTER_API_KEY,
    apiSecret: requiredEnvVars.TWITTER_API_SECRET,
    accessToken: requiredEnvVars.TWITTER_ACCESS_TOKEN,
    accessTokenSecret: requiredEnvVars.TWITTER_ACCESS_TOKEN_SECRET,
    bearerToken: requiredEnvVars.TWITTER_BEARER_TOKEN,
    baseUrl: 'https://api.twitter.com/2',
    rateLimits: {
      requests: 300,
      per: '15-minutes'
    }
  },
  
  facebook: {
    appId: requiredEnvVars.FACEBOOK_APP_ID,
    appSecret: requiredEnvVars.FACEBOOK_APP_SECRET,
    accessToken: requiredEnvVars.FACEBOOK_ACCESS_TOKEN,
    baseUrl: 'https://graph.facebook.com/v18.0',
    rateLimits: {
      requests: 200,
      per: 'hour'
    }
  },
  
  
  analytics: {
    google: {
      trackingId: requiredEnvVars.GOOGLE_ANALYTICS_TRACKING_ID,
      clientEmail: requiredEnvVars.GOOGLE_ANALYTICS_CLIENT_EMAIL,
      privateKey: requiredEnvVars.GOOGLE_ANALYTICS_PRIVATE_KEY
    }
  },
  
  database: {
    url: requiredEnvVars.DATABASE_URL,
    redis: requiredEnvVars.REDIS_URL
  },
  
  app: {
    port: requiredEnvVars.PORT,
    nodeEnv: requiredEnvVars.NODE_ENV,
    jwtSecret: requiredEnvVars.JWT_SECRET,
    rateLimiting: {
      windowMs: parseInt(requiredEnvVars.RATE_LIMIT_WINDOW_MS),
      maxRequests: parseInt(requiredEnvVars.RATE_LIMIT_MAX_REQUESTS)
    }
  }
};

// Validation Functions
const validateEmailConfig = () => {
  try {
    getEmailProvider();
    return true;
  } catch (error) {
    console.warn('Email validation warning:', error.message);
    return false;
  }
};

const validateSocialMediaConfig = () => {
  const platforms = ['instagram', 'twitter', 'facebook'];
  const validPlatforms = [];
  
  platforms.forEach(platform => {
    const config = apiConfig[platform];
    if (platform === 'instagram' && config.appId && config.accessToken) {
      validPlatforms.push(platform);
    } else if (platform === 'twitter' && config.bearerToken) {
      validPlatforms.push(platform);
    } else if (platform === 'facebook' && config.appId && config.accessToken) {
      validPlatforms.push(platform);
    }
  });
  
  return validPlatforms;
};

// Security helpers
const maskSensitiveData = (config) => {
  const masked = JSON.parse(JSON.stringify(config));
  
  const sensitiveKeys = ['apiKey', 'apiSecret', 'accessToken', 'bearerToken', 'privateKey', 'jwtSecret'];
  
  const maskValue = (obj) => {
    Object.keys(obj).forEach(key => {
      if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive.toLowerCase()))) {
        if (typeof obj[key] === 'string' && obj[key].length > 4) {
          obj[key] = obj[key].substring(0, 4) + '***';
        }
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        maskValue(obj[key]);
      }
    });
  };
  
  maskValue(masked);
  return masked;
};

// Export configuration and utilities
module.exports = {
  apiConfig,
  validateEmailConfig,
  validateSocialMediaConfig,
  maskSensitiveData,
  requiredEnvVars: Object.keys(requiredEnvVars)
};