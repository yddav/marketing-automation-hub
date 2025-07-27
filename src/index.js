// App Marketing Automation Hub - Main Application Entry Point
// Agent B - Phase 2 Task 2.2: API Integration & Email Marketing Automation

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const winston = require('winston');
require('dotenv').config();

// Service imports
const EmailService = require('./services/email-service');
const SocialMediaService = require('./services/social-media-service');
const SequenceDeployer = require('./automation/sequence-deployer');
const AnalyticsCollector = require('./analytics/analytics-collector');

// Configuration
const { apiConfig, validateEmailConfig, validateSocialMediaConfig } = require('./config/api-credentials');

/**
 * Main Application Server
 * Coordinates email marketing, social media, and analytics systems
 */

class MarketingAutomationHub {
  constructor() {
    this.app = express();
    this.port = apiConfig.app.port;
    this.server = null;
    
    // Initialize services
    this.emailService = new EmailService();
    this.socialMediaService = new SocialMediaService();
    this.sequenceDeployer = new SequenceDeployer();
    this.analyticsCollector = new AnalyticsCollector();
    
    // Set up logging
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logs/app.log' })
      ]
    });
    
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }
  
  /**
   * Set up Express middleware
   */
  setupMiddleware() {
    // Security
    this.app.use(helmet());
    this.app.use(cors());
    
    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));
    
    // Request logging
    this.app.use((req, res, next) => {
      this.logger.info(`${req.method} ${req.path}`, {
        userAgent: req.get('User-Agent'),
        ip: req.ip
      });
      next();
    });
  }
  
  /**
   * Set up API routes
   */
  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          email: !!this.emailService,
          social: !!this.socialMediaService,
          sequences: !!this.sequenceDeployer,
          analytics: !!this.analyticsCollector
        }
      });
    });
    
    // Configuration validation
    this.app.get('/api/config/validate', async (req, res) => {
      try {
        const validation = {
          email: validateEmailConfig(),
          social: validateSocialMediaConfig(),
          platforms: this.socialMediaService.getAvailablePlatforms()
        };
        
        res.json({
          success: true,
          validation,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });
    
    // Email service routes
    this.app.post('/api/email/send', async (req, res) => {
      try {
        const result = await this.emailService.sendEmail(req.body);
        res.json({ success: true, result });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });
    
    this.app.get('/api/email/analytics', async (req, res) => {
      try {
        const analytics = await this.emailService.getAnalytics(req.query);
        res.json({ success: true, analytics });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });
    
    this.app.get('/api/email/test', async (req, res) => {
      try {
        const testResult = await this.emailService.testConnection();
        res.json({ success: true, testResult });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });
    
    // Social media routes
    this.app.post('/api/social/post', async (req, res) => {
      try {
        const result = await this.socialMediaService.postToPlatform(req.body);
        res.json({ success: true, result });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });
    
    this.app.post('/api/social/multi-post', async (req, res) => {
      try {
        const result = await this.socialMediaService.postToMultiplePlatforms(req.body);
        res.json({ success: true, result });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });
    
    this.app.get('/api/social/analytics', async (req, res) => {
      try {
        const analytics = await this.socialMediaService.getAnalytics(req.query);
        res.json({ success: true, analytics });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });
    
    this.app.get('/api/social/test', async (req, res) => {
      try {
        const testResult = await this.socialMediaService.testConnections();
        res.json({ success: true, testResult });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });
    
    this.app.get('/api/social/platforms', (req, res) => {
      try {
        const platforms = this.socialMediaService.getAvailablePlatforms();
        res.json({ success: true, platforms });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });
    
    // Email sequence routes
    this.app.post('/api/sequences/deploy-all', async (req, res) => {
      try {
        const result = await this.sequenceDeployer.deployAllSequences();
        res.json({ success: true, result });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });
    
    this.app.post('/api/sequences/deploy/:sequenceType', async (req, res) => {
      try {
        const { sequenceType } = req.params;
        const result = await this.sequenceDeployer.deploySequence(sequenceType, req.body);
        res.json({ success: true, result });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });
    
    this.app.get('/api/sequences/status', (req, res) => {
      try {
        const status = this.sequenceDeployer.getDeploymentStatus();
        res.json({ success: true, status });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });
    
    this.app.get('/api/sequences/test/:sequenceType', async (req, res) => {
      try {
        const { sequenceType } = req.params;
        const testResult = await this.sequenceDeployer.testSequenceDeployment(sequenceType);
        res.json({ success: true, testResult });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });
    
    // Analytics routes
    this.app.post('/api/analytics/start', async (req, res) => {
      try {
        await this.analyticsCollector.startCollection(req.body);
        res.json({ success: true, message: 'Analytics collection started' });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });
    
    this.app.post('/api/analytics/stop', (req, res) => {
      try {
        this.analyticsCollector.stopCollection();
        res.json({ success: true, message: 'Analytics collection stopped' });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });
    
    this.app.get('/api/analytics/current', (req, res) => {
      try {
        const analytics = this.analyticsCollector.getCurrentAnalytics(req.query);
        res.json({ success: true, analytics });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });
    
    this.app.get('/api/analytics/status', (req, res) => {
      try {
        const status = this.analyticsCollector.getCollectionStatus();
        res.json({ success: true, status });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });
    
    // Combined operations
    this.app.post('/api/campaign/launch', async (req, res) => {
      try {
        const {
          campaignName,
          emailSequence,
          socialPosts,
          analyticsConfig = {}
        } = req.body;
        
        const results = {
          campaignName,
          timestamp: new Date().toISOString(),
          email: null,
          social: null,
          analytics: null
        };
        
        // Deploy email sequence if provided
        if (emailSequence) {
          results.email = await this.sequenceDeployer.deploySequence(
            emailSequence.type,
            emailSequence.customizations
          );
        }
        
        // Post to social media if provided
        if (socialPosts) {
          results.social = await this.socialMediaService.postToMultiplePlatforms(socialPosts);
        }
        
        // Start analytics collection
        if (!this.analyticsCollector.isCollecting) {
          await this.analyticsCollector.startCollection(analyticsConfig);
          results.analytics = 'started';
        } else {
          results.analytics = 'already_running';
        }
        
        this.logger.info('Campaign launched successfully', {
          campaignName,
          email: !!results.email,
          social: !!results.social,
          analytics: results.analytics
        });
        
        res.json({ success: true, results });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });
  }
  
  /**
   * Set up error handling
   */
  setupErrorHandling() {
    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        path: req.path
      });
    });
    
    // Global error handler
    this.app.use((error, req, res, next) => {
      this.logger.error('Unhandled error:', {
        error: error.message,
        stack: error.stack,
        path: req.path,
        method: req.method
      });
      
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: apiConfig.app.nodeEnv === 'development' ? error.message : 'Something went wrong'
      });
    });
  }
  
  /**
   * Start the application server
   */
  async start() {
    try {
      // Validate configuration
      this.logger.info('Validating configuration...');
      const emailValid = validateEmailConfig();
      const socialPlatforms = validateSocialMediaConfig();
      
      this.logger.info('Configuration validation complete', {
        emailConfigured: emailValid,
        socialPlatforms: socialPlatforms.length,
        platforms: socialPlatforms
      });
      
      // Start server
      this.server = this.app.listen(this.port, () => {
        this.logger.info(`Marketing Automation Hub started on port ${this.port}`, {
          environment: apiConfig.app.nodeEnv,
          emailProvider: apiConfig.emailProvider,
          socialPlatforms: socialPlatforms.length
        });
        
        console.log(`\\n🚀 App Marketing Automation Hub - Agent B Phase 2 Complete!`);
        console.log(`\\n📊 Server running at: http://localhost:${this.port}`);
        console.log(`\\n🔗 Available endpoints:`);
        console.log(`   GET  /health                    - Health check`);
        console.log(`   GET  /api/config/validate       - Validate API configuration`);
        console.log(`   POST /api/email/send            - Send individual email`);
        console.log(`   POST /api/social/post           - Post to single platform`);
        console.log(`   POST /api/social/multi-post     - Post to multiple platforms`);
        console.log(`   POST /api/sequences/deploy-all  - Deploy all email sequences`);
        console.log(`   POST /api/analytics/start       - Start analytics collection`);
        console.log(`   POST /api/campaign/launch       - Launch complete campaign`);
        console.log(`   GET  /api/analytics/current     - Get current analytics`);
        console.log(`\\n📧 Email Provider: ${apiConfig.emailProvider}`);
        console.log(`🌐 Social Platforms: ${socialPlatforms.join(', ') || 'None configured'}`);
        console.log(`\\n✅ Phase 2 Task 2.2 Complete - Email Marketing & API Integration Ready!`);
      });
      
    } catch (error) {
      this.logger.error('Failed to start application:', error);
      process.exit(1);
    }
  }
  
  /**
   * Graceful shutdown
   */
  async shutdown() {
    try {
      this.logger.info('Shutting down Marketing Automation Hub...');
      
      // Stop analytics collection
      if (this.analyticsCollector.isCollecting) {
        this.analyticsCollector.stopCollection();
      }
      
      // Stop sequence monitoring
      this.sequenceDeployer.stopAllMonitoring();
      
      // Close server
      if (this.server) {
        this.server.close(() => {
          this.logger.info('Server closed successfully');
          process.exit(0);
        });
      }
      
    } catch (error) {
      this.logger.error('Error during shutdown:', error);
      process.exit(1);
    }
  }
}

// Initialize and start application
const hub = new MarketingAutomationHub();

// Handle graceful shutdown
process.on('SIGTERM', () => hub.shutdown());
process.on('SIGINT', () => hub.shutdown());

// Start the application
if (require.main === module) {
  hub.start().catch(error => {
    console.error('Failed to start application:', error);
    process.exit(1);
  });
}

module.exports = MarketingAutomationHub;