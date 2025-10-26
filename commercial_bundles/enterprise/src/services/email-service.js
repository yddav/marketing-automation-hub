// Email Service Integration Layer
// Agent B - Phase 2 Task 2.2: Email Marketing Automation

const { apiConfig } = require('../config/api-credentials');
const winston = require('winston');

// Email service provider implementations
const MailchimpService = require('./providers/mailchimp-service');
const SendgridService = require('./providers/sendgrid-service');

// Template processing
const Handlebars = require('handlebars');
const fs = require('fs').promises;
const path = require('path');

/**
 * Unified Email Service Layer
 * Automatically selects and manages email service provider based on configuration
 * Supports: Mailchimp (primary), SendGrid (fallback)
 */

class EmailService {
  constructor() {
    this.provider = null;
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console()
      ]
    });
    
    this.initializeProvider();
  }
  
  /**
   * Initialize the appropriate email service provider
   */
  initializeProvider() {
    try {
      switch (apiConfig.emailProvider) {
        case 'mailchimp':
          this.provider = new MailchimpService(apiConfig.mailchimp);
          break;
        case 'sendgrid':
          this.provider = new SendgridService(apiConfig.sendgrid);
          break;
        default:
          throw new Error(`Unsupported email provider: ${apiConfig.emailProvider}`);
      }
      
      this.logger.info(`Email service initialized with provider: ${apiConfig.emailProvider}`);
    } catch (error) {
      this.logger.error('Failed to initialize email provider:', error);
      throw error;
    }
  }
  
  /**
   * Load and process email template from content_templates
   * @param {string} templateType - welcome-sequence, launch-sequence, retention-sequence
   * @param {string} variationId - Specific template variation
   * @param {Object} placeholderData - Data to populate template placeholders
   * @returns {Object} Processed email content
   */
  async loadTemplate(templateType, variationId, placeholderData = {}) {
    try {
      const templatePath = path.join(
        __dirname, 
        '../../content_templates/email_marketing', 
        `${templateType}.json`
      );
      
      const templateContent = await fs.readFile(templatePath, 'utf8');
      const templateData = JSON.parse(templateContent);
      
      // Find specific variation
      const variation = templateData.content.variations.find(v => v.id === variationId);
      if (!variation) {
        throw new Error(`Template variation ${variationId} not found in ${templateType}`);
      }
      
      // Process template with Handlebars
      const template = Handlebars.compile(variation.template);
      const processedContent = template(placeholderData);
      
      // Extract subject and body
      const lines = processedContent.split('\\n');
      const subjectLine = lines.find(line => line.startsWith('Subject:'));
      const subject = subjectLine ? subjectLine.replace('Subject: ', '') : 'Default Subject';
      const body = lines.slice(1).join('\\n').trim();
      
      return {
        subject,
        body,
        metadata: templateData.metadata,
        automation: templateData.automation,
        templateType,
        variationId
      };
    } catch (error) {
      this.logger.error(`Failed to load template ${templateType}:${variationId}:`, error);
      throw error;
    }
  }
  
  /**
   * Send single email
   * @param {Object} emailData - Email configuration
   * @returns {Object} Send result
   */
  async sendEmail(emailData) {
    try {
      const {
        to,
        templateType,
        variationId,
        placeholderData = {},
        metadata = {}
      } = emailData;
      
      // Load and process template
      const processedTemplate = await this.loadTemplate(templateType, variationId, placeholderData);
      
      // Prepare email payload
      const emailPayload = {
        to,
        subject: processedTemplate.subject,
        html: this.convertToHtml(processedTemplate.body),
        text: processedTemplate.body,
        metadata: {
          ...processedTemplate.metadata,
          ...metadata,
          templateType,
          variationId,
          sentAt: new Date().toISOString()
        }
      };
      
      // Send via provider
      const result = await this.provider.sendEmail(emailPayload);
      
      this.logger.info('Email sent successfully:', {
        to,
        templateType,
        variationId,
        provider: apiConfig.emailProvider,
        messageId: result.messageId
      });
      
      return result;
    } catch (error) {
      this.logger.error('Failed to send email:', error);
      throw error;
    }
  }
  
  /**
   * Deploy automated email sequence
   * @param {Object} sequenceConfig - Sequence configuration
   * @returns {Object} Deployment result
   */
  async deploySequence(sequenceConfig) {
    try {
      const {
        sequenceType, // welcome-sequence, launch-sequence, retention-sequence
        triggerEvent,
        subscriberSegment = 'all',
        customizations = {}
      } = sequenceConfig;
      
      // Load sequence template
      const templatePath = path.join(
        __dirname, 
        '../../content_templates/email_marketing', 
        `${sequenceType}.json`
      );
      
      const templateContent = await fs.readFile(templatePath, 'utf8');
      const sequenceData = JSON.parse(templateContent);
      
      // Create sequence in email provider
      const sequenceResult = await this.provider.createSequence({
        name: `${sequenceType}-${Date.now()}`,
        triggerEvent,
        subscriberSegment,
        emails: sequenceData.content.variations.map((variation, index) => ({
          variationId: variation.id,
          delay: this.calculateDelay(variation.test_group, index),
          templateData: sequenceData,
          customizations
        }))
      });
      
      this.logger.info('Email sequence deployed:', {
        sequenceType,
        triggerEvent,
        sequenceId: sequenceResult.sequenceId,
        emailCount: sequenceData.content.variations.length
      });
      
      return sequenceResult;
    } catch (error) {
      this.logger.error('Failed to deploy email sequence:', error);
      throw error;
    }
  }
  
  /**
   * Calculate delay for sequence emails based on test_group
   * @param {string} testGroup - Test group identifier (day_0, day_1, etc.)
   * @param {number} index - Email index in sequence
   * @returns {number} Delay in minutes
   */
  calculateDelay(testGroup, index) {
    if (testGroup.includes('day_')) {
      const dayNumber = parseInt(testGroup.split('_')[1]);
      return dayNumber * 24 * 60; // Convert days to minutes
    }
    
    // Fallback: use index-based delay
    return index * 24 * 60; // 24 hours between emails
  }
  
  /**
   * Convert plain text to HTML (basic formatting)
   * @param {string} text - Plain text content
   * @returns {string} HTML formatted content
   */
  convertToHtml(text) {
    return text
      .replace(/\\n\\n/g, '</p><p>')
      .replace(/\\n/g, '<br>')
      .replace(/^/, '<p>')
      .replace(/$/, '</p>')
      .replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>')
      .replace(/\\*(.*?)\\*/g, '<em>$1</em>')
      .replace(/🎯|⭐|🚀|💡|📊|🎁|⏰|💬|🌟|📱|🔥|✨|🎉/g, '<span style=\"font-size: 1.2em;\">$&</span>');
  }
  
  /**
   * Get email analytics and performance metrics
   * @param {Object} filters - Analytics filters
   * @returns {Object} Analytics data
   */
  async getAnalytics(filters = {}) {
    try {
      const analytics = await this.provider.getAnalytics(filters);
      
      this.logger.info('Retrieved email analytics:', {
        provider: apiConfig.emailProvider,
        dateRange: filters.dateRange,
        templateTypes: filters.templateTypes
      });
      
      return analytics;
    } catch (error) {
      this.logger.error('Failed to retrieve email analytics:', error);
      throw error;
    }
  }
  
  /**
   * Manage subscriber lists and segments
   * @param {Object} subscriberData - Subscriber information
   * @returns {Object} Subscriber management result
   */
  async manageSubscriber(subscriberData) {
    try {
      const result = await this.provider.manageSubscriber(subscriberData);
      
      this.logger.info('Subscriber managed:', {
        action: subscriberData.action,
        email: subscriberData.email,
        provider: apiConfig.emailProvider
      });
      
      return result;
    } catch (error) {
      this.logger.error('Failed to manage subscriber:', error);
      throw error;
    }
  }
  
  /**
   * Test email service connection and configuration
   * @returns {Object} Connection test result
   */
  async testConnection() {
    try {
      const testResult = await this.provider.testConnection();
      
      this.logger.info('Email service connection test:', {
        provider: apiConfig.emailProvider,
        status: testResult.status,
        responseTime: testResult.responseTime
      });
      
      return testResult;
    } catch (error) {
      this.logger.error('Email service connection test failed:', error);
      throw error;
    }
  }
}

module.exports = EmailService;