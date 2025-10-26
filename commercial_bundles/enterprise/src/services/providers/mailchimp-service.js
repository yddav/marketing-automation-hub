// Mailchimp Email Service Provider Implementation
// Agent B - Phase 2 Task 2.2: Email Marketing API Integration

const axios = require('axios');
const crypto = require('crypto');

/**
 * Mailchimp API Service Implementation
 * Handles Mailchimp-specific email operations, list management, and automation
 */

class MailchimpService {
  constructor(config) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.baseUrl,
      headers: {
        'Authorization': `apikey ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
  }
  
  /**
   * Send individual email via Mailchimp
   * @param {Object} emailPayload - Email data
   * @returns {Object} Send result
   */
  async sendEmail(emailPayload) {
    try {
      // Mailchimp doesn't support transactional emails directly
      // Use campaigns for automated sequences
      const campaignData = {
        type: 'regular',
        recipients: {
          list_id: await this.getOrCreateList('App Users'),
          segment_opts: {
            conditions: [{
              condition_type: 'EmailAddress',
              field: 'EMAIL',
              op: 'is',
              value: emailPayload.to
            }]
          }
        },
        settings: {
          subject_line: emailPayload.subject,
          from_name: process.env.EMAIL_FROM_NAME || 'App Team',
          reply_to: process.env.EMAIL_REPLY_TO || 'support@yourapp.com',
          template_id: await this.createTemplate(emailPayload.html)
        }
      };
      
      const campaign = await this.client.post('/campaigns', campaignData);
      const sendResult = await this.client.post(`/campaigns/${campaign.data.id}/actions/send`);
      
      return {
        messageId: campaign.data.id,
        status: 'sent',
        provider: 'mailchimp',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Mailchimp send error: ${error.response?.data?.detail || error.message}`);
    }
  }
  
  /**
   * Create automated email sequence in Mailchimp
   * @param {Object} sequenceConfig - Sequence configuration
   * @returns {Object} Sequence creation result
   */
  async createSequence(sequenceConfig) {
    try {
      // Create automation workflow
      const automationData = {
        recipients: {
          list_id: await this.getOrCreateList('App Users')
        },
        settings: {
          title: sequenceConfig.name,
          from_name: process.env.EMAIL_FROM_NAME || 'App Team',
          reply_to: process.env.EMAIL_REPLY_TO || 'support@yourapp.com'
        },
        trigger_settings: {
          workflow_type: 'emailSeries',
          trigger_on_import: true
        }
      };
      
      const automation = await this.client.post('/automations', automationData);
      
      // Add emails to automation workflow
      for (const [index, email] of sequenceConfig.emails.entries()) {
        await this.addEmailToAutomation(automation.data.id, email, index);
      }
      
      // Start automation
      await this.client.post(`/automations/${automation.data.id}/actions/start-all-emails`);
      
      return {
        sequenceId: automation.data.id,
        status: 'active',
        emailCount: sequenceConfig.emails.length,
        provider: 'mailchimp'
      };
    } catch (error) {
      throw new Error(`Mailchimp sequence creation error: ${error.response?.data?.detail || error.message}`);
    }
  }
  
  /**
   * Add email to automation workflow
   * @param {string} automationId - Automation ID
   * @param {Object} emailData - Email configuration
   * @param {number} index - Email index in sequence
   */
  async addEmailToAutomation(automationId, emailData, index) {
    try {
      const emailConfig = {
        delay: {
          amount: emailData.delay || (index * 1440), // Default 24 hours
          type: 'minute'
        },
        settings: {
          subject_line: `Email ${index + 1} Subject`, // Will be updated with actual content
          from_name: process.env.EMAIL_FROM_NAME || 'App Team',
          reply_to: process.env.EMAIL_REPLY_TO || 'support@yourapp.com'
        }
      };
      
      return await this.client.post(`/automations/${automationId}/emails`, emailConfig);
    } catch (error) {
      throw new Error(`Failed to add email to automation: ${error.message}`);
    }
  }
  
  /**
   * Get or create Mailchimp list
   * @param {string} listName - List name
   * @returns {string} List ID
   */
  async getOrCreateList(listName) {
    try {
      // Check if list exists
      const lists = await this.client.get('/lists');
      const existingList = lists.data.lists.find(list => list.name === listName);
      
      if (existingList) {
        return existingList.id;
      }
      
      // Create new list
      const listData = {
        name: listName,
        contact: {
          company: process.env.DEFAULT_COMPANY_NAME || 'Your Company',
          address1: '123 Main St',
          city: 'Anytown',
          state: 'NY',
          zip: '12345',
          country: 'US'
        },
        permission_reminder: 'You subscribed to our app updates',
        campaign_defaults: {
          from_name: process.env.EMAIL_FROM_NAME || 'App Team',
          from_email: process.env.EMAIL_FROM_ADDRESS || 'hello@yourapp.com',
          subject: 'Default Subject',
          language: 'EN_US'
        },
        email_type_option: true
      };
      
      const newList = await this.client.post('/lists', listData);
      return newList.data.id;
    } catch (error) {
      throw new Error(`Failed to get/create list: ${error.message}`);
    }
  }
  
  /**
   * Create email template in Mailchimp
   * @param {string} htmlContent - HTML content
   * @returns {number} Template ID
   */
  async createTemplate(htmlContent) {
    try {
      const templateData = {
        name: `Template-${Date.now()}`,
        html: htmlContent
      };
      
      const template = await this.client.post('/templates', templateData);
      return template.data.id;
    } catch (error) {
      throw new Error(`Failed to create template: ${error.message}`);
    }
  }
  
  /**
   * Manage subscriber in Mailchimp
   * @param {Object} subscriberData - Subscriber information
   * @returns {Object} Management result
   */
  async manageSubscriber(subscriberData) {
    try {
      const { action, email, firstName, lastName, tags = [] } = subscriberData;
      const listId = await this.getOrCreateList('App Users');
      const subscriberHash = crypto.createHash('md5').update(email.toLowerCase()).digest('hex');
      
      switch (action) {
        case 'subscribe':
          const subscribeData = {
            email_address: email,
            status: 'subscribed',
            merge_fields: {
              FNAME: firstName || '',
              LNAME: lastName || ''
            },
            tags: tags
          };
          
          return await this.client.put(`/lists/${listId}/members/${subscriberHash}`, subscribeData);
          
        case 'unsubscribe':
          return await this.client.patch(`/lists/${listId}/members/${subscriberHash}`, {
            status: 'unsubscribed'
          });
          
        case 'update':
          const updateData = {
            merge_fields: {
              FNAME: firstName || '',
              LNAME: lastName || ''
            }
          };
          
          if (tags.length > 0) {
            updateData.tags = tags;
          }
          
          return await this.client.patch(`/lists/${listId}/members/${subscriberHash}`, updateData);
          
        default:
          throw new Error(`Unsupported subscriber action: ${action}`);
      }
    } catch (error) {
      throw new Error(`Subscriber management error: ${error.response?.data?.detail || error.message}`);
    }
  }
  
  /**
   * Get email analytics from Mailchimp
   * @param {Object} filters - Analytics filters
   * @returns {Object} Analytics data
   */
  async getAnalytics(filters = {}) {
    try {
      const { dateRange, campaignIds } = filters;
      
      // Get campaigns analytics
      const campaigns = await this.client.get('/campaigns', {
        params: {
          count: 100,
          since_send_time: dateRange?.start,
          before_send_time: dateRange?.end
        }
      });
      
      const analytics = {
        totalCampaigns: campaigns.data.total_items,
        campaigns: campaigns.data.campaigns.map(campaign => ({
          id: campaign.id,
          subject: campaign.settings.subject_line,
          sendTime: campaign.send_time,
          stats: {
            opens: campaign.report_statistics?.open_rate || 0,
            clicks: campaign.report_statistics?.click_rate || 0,
            unsubscribes: campaign.report_statistics?.unsubscribe_rate || 0,
            bounces: campaign.report_statistics?.bounce_rate || 0
          }
        }))
      };
      
      return analytics;
    } catch (error) {
      throw new Error(`Analytics retrieval error: ${error.message}`);
    }
  }
  
  /**
   * Test Mailchimp API connection
   * @returns {Object} Connection test result
   */
  async testConnection() {
    try {
      const startTime = Date.now();
      const response = await this.client.get('/ping');
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'success',
        provider: 'mailchimp',
        responseTime: `${responseTime}ms`,
        apiStatus: response.data.health_status
      };
    } catch (error) {
      return {
        status: 'error',
        provider: 'mailchimp',
        error: error.response?.data?.detail || error.message
      };
    }
  }
}

module.exports = MailchimpService;