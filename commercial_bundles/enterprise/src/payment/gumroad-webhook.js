// Gumroad Payment Webhook Handler
// AGENT BRAVO - PAYMENT SYSTEM DEPLOYMENT

const crypto = require('crypto');
const winston = require('winston');
const FulfillmentService = require('./fulfillment-service');
const CustomerDatabase = require('./customer-database');
const AnalyticsTracker = require('./analytics-tracker');

/**
 * Gumroad Webhook Handler for Payment Processing
 * Handles payment verification, order fulfillment, and customer management
 */
class GumroadWebhookHandler {
  constructor() {
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
        new winston.transports.File({ filename: 'logs/payments.log' }),
        new winston.transports.Console()
      ]
    });

    // Gumroad product configuration
    this.products = {
      'starter_bundle': {
        id: 'starter_bundle',
        name: 'Marketing Automation Starter Bundle',
        price: 199,
        originalPrice: 297,
        tier: 'starter'
      },
      'professional_bundle': {
        id: 'professional_bundle', 
        name: 'Marketing Automation Professional Bundle',
        price: 299,
        originalPrice: 497,
        tier: 'professional'
      },
      'enterprise_bundle': {
        id: 'enterprise_bundle',
        name: 'Marketing Automation Enterprise Bundle', 
        price: 597,
        originalPrice: 997,
        tier: 'enterprise'
      }
    };
  }

  /**
   * Verify Gumroad webhook signature
   */
  verifyWebhookSignature(payload, signature) {
    try {
      const secret = process.env.GUMROAD_WEBHOOK_SECRET;
      if (!secret) {
        throw new Error('GUMROAD_WEBHOOK_SECRET not configured');
      }

      const computedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');

      return computedSignature === signature;
    } catch (error) {
      this.logger.error('Webhook signature verification failed:', error);
      return false;
    }
  }

  /**
   * Main webhook handler
   */
  async handleWebhook(req, res) {
    try {
      const payload = JSON.stringify(req.body);
      const signature = req.headers['x-gumroad-signature'];

      // Verify webhook authenticity
      if (!this.verifyWebhookSignature(payload, signature)) {
        this.logger.warn('Invalid webhook signature received');
        return res.status(401).json({ error: 'Invalid signature' });
      }

      const data = req.body;
      
      this.logger.info('Gumroad webhook received:', {
        sale_id: data.sale_id,
        product_name: data.product_name,
        purchaser_email: data.purchaser_email,
        price: data.price,
        currency: data.currency
      });

      // Process the sale
      await this.processSale(data);

      res.status(200).json({ 
        success: true, 
        message: 'Webhook processed successfully',
        sale_id: data.sale_id 
      });

    } catch (error) {
      this.logger.error('Webhook processing failed:', error);
      res.status(500).json({ 
        error: 'Webhook processing failed',
        message: error.message 
      });
    }
  }

  /**
   * Process successful sale
   */
  async processSale(saleData) {
    const {
      sale_id,
      product_id,
      product_name,
      purchaser_email,
      purchaser_name,
      price,
      currency,
      sale_timestamp,
      ip_country,
      recurrence,
      variants = {}
    } = saleData;

    try {
      // Identify product tier
      const productTier = this.identifyProductTier(product_id, product_name);
      
      if (!productTier) {
        throw new Error(`Unknown product: ${product_name} (ID: ${product_id})`);
      }

      // Create customer record
      const customer = await this.customerDatabase.createCustomer({
        email: purchaser_email,
        name: purchaser_name,
        saleId: sale_id,
        productTier: productTier,
        price: parseFloat(price),
        currency: currency,
        purchaseDate: new Date(sale_timestamp),
        country: ip_country,
        isRecurring: recurrence !== 'one_time'
      });

      // Generate and deliver bundle
      const fulfillmentResult = await this.fulfillmentService.fulfillOrder({
        customer: customer,
        productTier: productTier,
        saleId: sale_id
      });

      // Track analytics
      await this.analyticsTracker.trackSale({
        saleId: sale_id,
        productTier: productTier,
        price: parseFloat(price),
        customerEmail: purchaser_email,
        country: ip_country,
        timestamp: new Date(sale_timestamp)
      });

      // Send confirmation email
      await this.sendConfirmationEmail(customer, fulfillmentResult);

      this.logger.info('Sale processed successfully:', {
        sale_id,
        customer_email: purchaser_email,
        product_tier: productTier,
        fulfillment_status: fulfillmentResult.status
      });

    } catch (error) {
      this.logger.error('Sale processing failed:', {
        sale_id,
        error: error.message,
        stack: error.stack
      });
      
      // Send failure notification
      await this.sendFailureNotification(saleData, error);
      throw error;
    }
  }

  /**
   * Identify product tier from Gumroad data
   */
  identifyProductTier(productId, productName) {
    // Direct product ID match
    if (this.products[productId]) {
      return this.products[productId].tier;
    }

    // Fallback to name matching
    const lowerName = productName.toLowerCase();
    
    if (lowerName.includes('starter')) {
      return 'starter';
    } else if (lowerName.includes('professional')) {
      return 'professional';
    } else if (lowerName.includes('enterprise')) {
      return 'enterprise';
    }

    return null;
  }

  /**
   * Send order confirmation email
   */
  async sendConfirmationEmail(customer, fulfillmentResult) {
    try {
      const EmailService = require('../services/email-service');
      const emailService = new EmailService();

      const template = {
        to: customer.email,
        subject: `Your ${customer.productTier.charAt(0).toUpperCase() + customer.productTier.slice(1)} Bundle is Ready!`,
        template: 'purchase-confirmation',
        variables: {
          customer_name: customer.name || customer.email.split('@')[0],
          product_tier: customer.productTier,
          download_link: fulfillmentResult.downloadLink,
          download_expires: fulfillmentResult.expiresAt,
          support_email: process.env.SUPPORT_EMAIL || 'support@marketingautomationhub.com',
          purchase_date: customer.purchaseDate.toLocaleDateString(),
          price_paid: `$${customer.price}`,
          sale_id: customer.saleId
        }
      };

      await emailService.sendEmail(template);
      
    } catch (error) {
      this.logger.error('Failed to send confirmation email:', error);
      // Don't throw - fulfillment should still succeed
    }
  }

  /**
   * Send failure notification to admin
   */
  async sendFailureNotification(saleData, error) {
    try {
      const EmailService = require('../services/email-service');
      const emailService = new EmailService();

      const adminEmail = process.env.ADMIN_EMAIL || process.env.SUPPORT_EMAIL;
      if (!adminEmail) return;

      await emailService.sendEmail({
        to: adminEmail,
        subject: `URGENT: Payment Processing Failed - Sale ${saleData.sale_id}`,
        template: 'payment-failure-alert', 
        variables: {
          sale_id: saleData.sale_id,
          customer_email: saleData.purchaser_email,
          product_name: saleData.product_name,
          price: saleData.price,
          error_message: error.message,
          timestamp: new Date().toISOString()
        }
      });

    } catch (emailError) {
      this.logger.error('Failed to send failure notification:', emailError);
    }
  }

  /**
   * Handle refund webhook
   */
  async handleRefund(refundData) {
    try {
      const { sale_id, refund_amount, refund_reason } = refundData;

      // Update customer record
      await this.customerDatabase.processRefund(sale_id, {
        refundAmount: parseFloat(refund_amount),
        refundReason: refund_reason,
        refundDate: new Date()
      });

      // Revoke access (if applicable)
      await this.fulfillmentService.revokeAccess(sale_id);

      // Track refund analytics
      await this.analyticsTracker.trackRefund({
        saleId: sale_id,
        refundAmount: parseFloat(refund_amount),
        reason: refund_reason
      });

      this.logger.info('Refund processed:', {
        sale_id,
        refund_amount,
        refund_reason
      });

    } catch (error) {
      this.logger.error('Refund processing failed:', error);
      throw error;
    }
  }

  /**
   * Get webhook configuration instructions
   */
  getWebhookSetupInstructions() {
    const baseUrl = process.env.BASE_URL || 'https://your-domain.com';
    
    return {
      webhook_url: `${baseUrl}/webhook/gumroad`,
      secret_setup: 'Set GUMROAD_WEBHOOK_SECRET in environment variables',
      events_to_enable: [
        'sale',
        'refund',
        'dispute'
      ],
      test_endpoint: `${baseUrl}/webhook/gumroad/test`,
      configuration_steps: [
        '1. Log into Gumroad account',
        '2. Go to Settings > Webhooks',
        '3. Add new webhook with above URL',
        '4. Enable sale and refund events',
        '5. Copy webhook secret to environment variables',
        '6. Test webhook using test endpoint'
      ]
    };
  }
}

module.exports = GumroadWebhookHandler;