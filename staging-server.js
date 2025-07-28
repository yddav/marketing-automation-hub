// Marketing Automation Hub - Staging Environment Server
// Dedicated staging server with development-friendly configurations

require('dotenv').config({ path: '.env.staging' });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const winston = require('winston');
const path = require('path');

// Import main application
const MarketingAutomationHub = require('./src/index');

/**
 * Staging Environment Server
 * Enhanced with development tools and debugging capabilities
 */
class StagingServer extends MarketingAutomationHub {
  constructor() {
    super();
    this.port = process.env.PORT || 3001;
    this.setupStagingMiddleware();
    this.setupDevelopmentRoutes();
    this.setupStagingErrorHandling();
  }

  /**
   * Enhanced middleware for staging environment
   */
  setupStagingMiddleware() {
    // Enhanced CORS for development
    this.app.use(cors({
      origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:8080'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }));

    // Development-friendly helmet configuration
    this.app.use(helmet({
      contentSecurityPolicy: false, // Disabled for development
      crossOriginEmbedderPolicy: false
    }));

    // Enhanced request logging for staging
    this.app.use((req, res, next) => {
      this.logger.debug(`[STAGING] ${req.method} ${req.path}`, {
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        query: req.query,
        body: req.method !== 'GET' ? req.body : undefined,
        headers: req.headers
      });
      next();
    });

    // Serve static files for demo and testing
    this.app.use('/static', express.static(path.join(__dirname, 'public')));
    this.app.use('/demo', express.static(path.join(__dirname, 'public/demo')));
  }

  /**
   * Development and staging specific routes
   */
  setupDevelopmentRoutes() {
    // Staging health check with detailed information
    this.app.get('/staging/health', (req, res) => {
      res.json({
        status: 'healthy',
        environment: 'staging',
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        services: {
          email: !!this.emailService,
          social: !!this.socialMediaService,
          sequences: !!this.sequenceDeployer,
          analytics: !!this.analyticsCollector,
          payment: !!this.paymentRoutes
        },
        config: {
          nodeEnv: process.env.NODE_ENV,
          port: this.port,
          emailProvider: process.env.EMAIL_PROVIDER,
          enabledFeatures: {
            debugLogging: process.env.ENABLE_DEBUG_LOGGING === 'true',
            analytics: process.env.ENABLE_ANALYTICS_COLLECTION === 'true',
            emailAutomation: process.env.ENABLE_EMAIL_AUTOMATION === 'true',
            socialMedia: process.env.ENABLE_SOCIAL_MEDIA_POSTING === 'true',
            paymentProcessing: process.env.ENABLE_PAYMENT_PROCESSING === 'true',
            abTesting: process.env.ENABLE_A_B_TESTING === 'true'
          }
        }
      });
    });

    // Configuration viewer for debugging
    this.app.get('/staging/config', (req, res) => {
      const safeConfig = {
        nodeEnv: process.env.NODE_ENV,
        port: process.env.PORT,
        appName: process.env.APP_NAME,
        appUrl: process.env.APP_URL,
        emailProvider: process.env.EMAIL_PROVIDER,
        enabledFeatures: {
          debugLogging: process.env.ENABLE_DEBUG_LOGGING,
          analytics: process.env.ENABLE_ANALYTICS_COLLECTION,
          emailAutomation: process.env.ENABLE_EMAIL_AUTOMATION,
          socialMedia: process.env.ENABLE_SOCIAL_MEDIA_POSTING,
          paymentProcessing: process.env.ENABLE_PAYMENT_PROCESSING,
          abTesting: process.env.ENABLE_A_B_TESTING
        },
        staging: {
          mode: process.env.STAGING_MODE,
          mockPayments: process.env.MOCK_PAYMENT_PROCESSING,
          testEmail: process.env.TEST_EMAIL_RECIPIENT
        }
      };
      res.json(safeConfig);
    });

    // Test endpoints for development
    this.app.post('/staging/test-email', async (req, res) => {
      try {
        const testEmail = {
          to: process.env.TEST_EMAIL_RECIPIENT || 'test@example.com',
          subject: 'Staging Test Email',
          text: 'This is a test email from the staging environment.',
          html: '<h1>Staging Test</h1><p>This is a test email from the staging environment.</p>'
        };
        
        const result = await this.emailService.sendEmail(testEmail);
        res.json({ success: true, result, timestamp: new Date().toISOString() });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.post('/staging/test-social', async (req, res) => {
      try {
        const testPost = {
          platforms: ['twitter'], // Safe platform for testing
          content: 'Test post from staging environment - ' + new Date().toISOString(),
          scheduledTime: null
        };
        
        if (process.env.ENABLE_SOCIAL_MEDIA_POSTING === 'true' && !process.env.DISABLE_EXTERNAL_APIS) {
          const result = await this.socialMediaService.postToMultiplePlatforms(testPost);
          res.json({ success: true, result, timestamp: new Date().toISOString() });
        } else {
          res.json({ 
            success: true, 
            result: { message: 'Social media posting disabled in staging' },
            timestamp: new Date().toISOString() 
          });
        }
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Demo page route
    this.app.get('/demo', (req, res) => {
      res.sendFile(path.join(__dirname, 'public/demo/index.html'));
    });

    // Staging dashboard
    this.app.get('/staging/dashboard', (req, res) => {
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Marketing Automation Hub - Staging Dashboard</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
            .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; }
            .header { color: #333; border-bottom: 2px solid #667eea; padding-bottom: 20px; margin-bottom: 30px; }
            .section { margin: 20px 0; }
            .endpoint { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 4px; border-left: 4px solid #667eea; }
            .method { display: inline-block; width: 60px; font-weight: bold; }
            .get { color: #28a745; }
            .post { color: #dc3545; }
            a { color: #667eea; text-decoration: none; }
            a:hover { text-decoration: underline; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Marketing Automation Hub - Staging Environment</h1>
              <p>Development and testing dashboard for version 2.0.0</p>
            </div>
            
            <div class="section">
              <h2>Health & Status</h2>
              <div class="endpoint">
                <span class="method get">GET</span> <a href="/staging/health">/staging/health</a> - Detailed staging health check
              </div>
              <div class="endpoint">
                <span class="method get">GET</span> <a href="/staging/config">/staging/config</a> - Configuration viewer
              </div>
            </div>

            <div class="section">
              <h2>Testing Endpoints</h2>
              <div class="endpoint">
                <span class="method post">POST</span> /staging/test-email - Send test email
              </div>
              <div class="endpoint">
                <span class="method post">POST</span> /staging/test-social - Test social media posting
              </div>
            </div>

            <div class="section">
              <h2>Demo & Documentation</h2>
              <div class="endpoint">
                <span class="method get">GET</span> <a href="/demo">/demo</a> - Interactive demo environment
              </div>
              <div class="endpoint">
                <span class="method get">GET</span> <a href="/health">/health</a> - Production health endpoint
              </div>
            </div>

            <div class="section">
              <h2>Production API Endpoints</h2>
              <div class="endpoint">
                <span class="method get">GET</span> /api/config/validate - API configuration validation
              </div>
              <div class="endpoint">
                <span class="method post">POST</span> /api/campaign/launch - Launch marketing campaign
              </div>
              <div class="endpoint">
                <span class="method get">GET</span> /api/analytics/current - Current analytics data
              </div>
            </div>

            <div class="section">
              <p><strong>Environment:</strong> Staging | <strong>Version:</strong> 2.0.0 | <strong>Port:</strong> ${this.port}</p>
              <p><strong>Features:</strong> Debug logging, Enhanced CORS, Test endpoints, Mock payments</p>
            </div>
          </div>
        </body>
        </html>
      `);
    });
  }

  /**
   * Enhanced error handling for staging
   */
  setupStagingErrorHandling() {
    // Enhanced error logging for development
    this.app.use((error, req, res, next) => {
      this.logger.error('[STAGING] Unhandled error:', {
        error: error.message,
        stack: error.stack,
        path: req.path,
        method: req.method,
        body: req.body,
        query: req.query,
        headers: req.headers
      });
      
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message, // Show full error in staging
        stack: error.stack.split('\n'), // Include stack trace
        environment: 'staging',
        timestamp: new Date().toISOString()
      });
    });
  }

  /**
   * Start staging server with enhanced logging
   */
  async start() {
    try {
      this.logger.info('[STAGING] Starting Marketing Automation Hub in staging mode...');
      
      // Validate staging configuration
      const emailValid = process.env.EMAIL_PROVIDER && process.env.MAILCHIMP_API_KEY;
      const stagingMode = process.env.STAGING_MODE === 'true';
      
      this.logger.info('[STAGING] Configuration validation:', {
        emailConfigured: !!emailValid,
        stagingMode,
        debugLogging: process.env.ENABLE_DEBUG_LOGGING === 'true',
        mockPayments: process.env.MOCK_PAYMENT_PROCESSING === 'true'
      });
      
      // Start server
      this.server = this.app.listen(this.port, () => {
        this.logger.info(`[STAGING] Marketing Automation Hub started on port ${this.port}`, {
          environment: 'staging',
          version: '2.0.0',
          dashboardUrl: `http://localhost:${this.port}/staging/dashboard`,
          demoUrl: `http://localhost:${this.port}/demo`
        });
        
        console.log(`\n🧪 STAGING - Marketing Automation Hub v2.0.0`);
        console.log(`\n📊 Server running at: http://localhost:${this.port}`);
        console.log(`🎛️  Staging Dashboard: http://localhost:${this.port}/staging/dashboard`);
        console.log(`🎨 Demo Environment: http://localhost:${this.port}/demo`);
        console.log(`\n🔧 Staging Features:`);
        console.log(`   • Enhanced debugging and logging`);
        console.log(`   • Development-friendly CORS settings`);
        console.log(`   • Test endpoints for email and social media`);
        console.log(`   • Mock payment processing`);
        console.log(`   • Detailed error reporting`);
        console.log(`\n✅ Ready for development and testing!`);
      });
      
    } catch (error) {
      this.logger.error('[STAGING] Failed to start application:', error);
      process.exit(1);
    }
  }
}

// Initialize and start staging server
const stagingHub = new StagingServer();

// Handle graceful shutdown
process.on('SIGTERM', () => stagingHub.shutdown());
process.on('SIGINT', () => stagingHub.shutdown());

// Start the staging server
if (require.main === module) {
  stagingHub.start().catch(error => {
    console.error('[STAGING] Failed to start application:', error);
    process.exit(1);
  });
}

module.exports = StagingServer;