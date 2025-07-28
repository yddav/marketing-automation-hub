// Payment System API Routes
// AGENT BRAVO - PAYMENT SYSTEM DEPLOYMENT

const express = require('express');
const cors = require('cors');
const { rateLimit } = require('express-rate-limit');
const winston = require('winston');

const GumroadWebhookHandler = require('./gumroad-webhook');
const FulfillmentService = require('./fulfillment-service');
const CustomerDatabase = require('./customer-database');
const AnalyticsTracker = require('./analytics-tracker');

/**
 * Payment System Routes
 * Handles all payment processing, fulfillment, and analytics endpoints
 */
class PaymentRoutes {
  constructor() {
    this.router = express.Router();
    
    // Initialize services
    this.gumroadHandler = new GumroadWebhookHandler();
    this.fulfillmentService = new FulfillmentService();
    this.customerDatabase = new CustomerDatabase();
    this.analyticsTracker = new AnalyticsTracker();

    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: 'logs/payment-routes.log' }),
        new winston.transports.Console()
      ]
    });

    this.setupMiddleware();
    this.setupRoutes();
  }

  /**
   * Setup middleware
   */
  setupMiddleware() {
    // Rate limiting for sensitive endpoints
    this.webhookLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: 'Too many webhook requests from this IP'
    });

    this.analyticsLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes  
      max: 300, // limit each IP to 300 requests per windowMs
      message: 'Too many analytics requests from this IP'
    });

    // CORS for payment endpoints
    this.router.use(cors({
      origin: [
        'https://gumroad.com',
        'https://api.gumroad.com',
        process.env.FRONTEND_URL || 'http://localhost:3000'
      ],
      credentials: true
    }));

    // Body parsing with size limits
    this.router.use(express.json({ limit: '1mb' }));
    this.router.use(express.urlencoded({ extended: true, limit: '1mb' }));
  }

  /**
   * Setup all payment routes
   */
  setupRoutes() {
    // Webhook routes
    this.setupWebhookRoutes();
    
    // Download routes
    this.setupDownloadRoutes();
    
    // Analytics routes
    this.setupAnalyticsRoutes();
    
    // Customer management routes
    this.setupCustomerRoutes();
    
    // Admin routes
    this.setupAdminRoutes();
  }

  /**
   * Webhook handling routes
   */
  setupWebhookRoutes() {
    // Main Gumroad webhook endpoint
    this.router.post('/webhook/gumroad', this.webhookLimiter, async (req, res) => {
      await this.gumroadHandler.handleWebhook(req, res);
    });

    // Webhook test endpoint
    this.router.post('/webhook/gumroad/test', async (req, res) => {
      try {
        const testData = {
          sale_id: `TEST-${Date.now()}`,
          product_id: 'starter_bundle',
          product_name: 'Marketing Automation Starter Bundle',
          purchaser_email: req.body.email || 'test@example.com',
          purchaser_name: req.body.name || 'Test Customer',
          price: '199',
          currency: 'USD',
          sale_timestamp: new Date().toISOString(),
          ip_country: 'US',
          recurrence: 'one_time'
        };

        // Process test sale
        await this.gumroadHandler.processSale(testData);

        res.json({
          success: true,
          message: 'Test webhook processed successfully',
          testData: testData
        });

      } catch (error) {
        this.logger.error('Test webhook failed:', error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Webhook configuration info
    this.router.get('/webhook/gumroad/setup', (req, res) => {
      res.json(this.gumroadHandler.getWebhookSetupInstructions());
    });
  }

  /**
   * Download handling routes
   */
  setupDownloadRoutes() {
    // Secure download endpoint
    this.router.get('/download/:token', async (req, res) => {
      const { token } = req.params;
      await this.fulfillmentService.handleDownloadRequest(token, req, res);
    });

    // Download status check
    this.router.get('/download/:token/status', async (req, res) => {
      try {
        const { token } = req.params;
        const record = await this.fulfillmentService.getDownloadRecord(token);

        if (!record) {
          return res.status(404).json({ error: 'Download not found' });
        }

        res.json({
          success: true,
          status: {
            exists: true,
            expired: new Date() > new Date(record.expiresAt),
            downloadCount: record.downloadCount,
            maxDownloads: record.maxDownloads,
            expiresAt: record.expiresAt,
            productTier: record.productTier
          }
        });

      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });
  }

  /**
   * Analytics routes
   */
  setupAnalyticsRoutes() {
    // Dashboard data
    this.router.get('/analytics/dashboard', this.analyticsLimiter, async (req, res) => {
      try {
        const data = await this.analyticsTracker.getDashboardData();
        res.json({
          success: true,
          data: data
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Sales report
    this.router.get('/analytics/sales-report', this.analyticsLimiter, async (req, res) => {
      try {
        const { timeframe = '30d' } = req.query;
        const report = await this.analyticsTracker.generateSalesReport(timeframe);
        
        res.json({
          success: true,
          report: report
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Revenue metrics
    this.router.get('/analytics/revenue', this.analyticsLimiter, async (req, res) => {
      try {
        const analytics = await this.customerDatabase.getCustomerAnalytics();
        
        res.json({
          success: true,
          revenue: {
            total: analytics.totalRevenue[0]?.revenue || 0,
            customers: analytics.totalCustomers[0]?.count || 0,
            averageOrderValue: analytics.avgOrderValue[0]?.avg_value || 0,
            tierBreakdown: analytics.tierBreakdown,
            monthlyTrend: analytics.monthlyRevenue
          }
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });
  }

  /**
   * Customer management routes
   */
  setupCustomerRoutes() {
    // Get customer by email
    this.router.get('/customer/:email', async (req, res) => {
      try {
        const { email } = req.params;
        const customer = await this.customerDatabase.getCustomerByEmail(email);
        
        if (!customer) {
          return res.status(404).json({
            success: false,
            error: 'Customer not found'
          });
        }

        const purchases = await this.customerDatabase.getCustomerPurchases(email);

        res.json({
          success: true,
          customer: customer,
          purchases: purchases
        });

      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Create support ticket
    this.router.post('/support/ticket', async (req, res) => {
      try {
        const {
          customerEmail,
          subject,
          description,
          category = 'general',
          priority = 'normal'
        } = req.body;

        if (!customerEmail || !subject || !description) {
          return res.status(400).json({
            success: false,
            error: 'Missing required fields: customerEmail, subject, description'
          });
        }

        const ticket = await this.customerDatabase.createSupportTicket(customerEmail, {
          subject,
          description,
          category,
          priority
        });

        res.json({
          success: true,
          ticket: ticket
        });

      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });
  }

  /**
   * Admin routes
   */
  setupAdminRoutes() {
    // Admin authentication middleware
    const adminAuth = (req, res, next) => {
      const adminKey = req.headers['x-admin-key'] || req.query.adminKey;
      
      if (adminKey !== process.env.ADMIN_KEY) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized - Invalid admin key'
        });
      }
      
      next();
    };

    // Manual fulfillment (for failed orders)
    this.router.post('/admin/fulfill-order', adminAuth, async (req, res) => {
      try {
        const { saleId, customerEmail, productTier } = req.body;

        // Get customer
        const customer = await this.customerDatabase.getCustomerByEmail(customerEmail);
        if (!customer) {
          return res.status(404).json({
            success: false,
            error: 'Customer not found'
          });
        }

        // Manual fulfillment
        const result = await this.fulfillmentService.fulfillOrder({
          customer: customer,
          productTier: productTier,
          saleId: saleId
        });

        res.json({
          success: true,
          result: result
        });

      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Reset analytics (testing)
    this.router.post('/admin/reset-analytics', adminAuth, async (req, res) => {
      try {
        await this.analyticsTracker.resetMetrics();
        
        res.json({
          success: true,
          message: 'Analytics reset successfully'
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Cleanup expired downloads
    this.router.post('/admin/cleanup-downloads', adminAuth, async (req, res) => {
      try {
        await this.fulfillmentService.cleanupExpiredDownloads();
        
        res.json({
          success: true,
          message: 'Cleanup completed successfully'
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // System health check
    this.router.get('/admin/health', adminAuth, (req, res) => {
      res.json({
        success: true,
        health: {
          gumroadHandler: !!this.gumroadHandler,
          fulfillmentService: !!this.fulfillmentService,
          customerDatabase: !!this.customerDatabase,
          analyticsTracker: !!this.analyticsTracker,
          timestamp: new Date().toISOString()
        }
      });
    });
  }

  /**
   * Get configured router
   */
  getRouter() {
    return this.router;
  }
}

module.exports = PaymentRoutes;