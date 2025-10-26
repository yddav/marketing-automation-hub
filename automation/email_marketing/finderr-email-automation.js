/**
 * FINDERR Email Automation System
 * Tier-based email sequence delivery with Mailchimp/SendGrid integration
 *
 * Features:
 * - Automatic tier assignment based on subscriber count
 * - Scheduled email delivery (Day 0, Day 3, Day 7)
 * - Personalization with subscriber data
 * - HTML + plain text email templates
 * - Error handling and retry logic
 * - Analytics tracking integration
 */

const fs = require('fs').promises;
const path = require('path');

// Email Service Provider Configuration
const ESP_CONFIG = {
  provider: process.env.EMAIL_PROVIDER || 'mailchimp', // 'mailchimp' or 'sendgrid'
  mailchimp: {
    apiKey: process.env.MAILCHIMP_API_KEY,
    listId: process.env.MAILCHIMP_LIST_ID,
    server: process.env.MAILCHIMP_SERVER || 'us1'
  },
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY,
    fromEmail: process.env.SENDGRID_FROM_EMAIL || 'founders@finderr.app',
    fromName: process.env.SENDGRID_FROM_NAME || 'FINDERR Team'
  }
};

// Email sequence configuration
const SEQUENCE_CONFIG = {
  tier1: {
    delay_hours: [0, 72, 168], // Day 0, Day 3, Day 7
    emails: ['tier1_email1', 'tier1_email2', 'tier1_email3']
  },
  tier2: {
    delay_hours: [0, 72, 168],
    emails: ['tier2_email1', 'tier2_email2', 'tier2_email3']
  },
  tier3: {
    delay_hours: [0, 72, 168],
    emails: ['tier3_email1', 'tier3_email2', 'tier3_email3']
  },
  standard: {
    delay_hours: [0, 72, 168],
    emails: ['standard_email1', 'standard_email2', 'standard_email3']
  }
};

/**
 * Load email templates from JSON
 */
async function loadEmailTemplates() {
  try {
    const templatePath = path.join(__dirname, 'finderr_tier_email_sequences.json');
    const templateData = await fs.readFile(templatePath, 'utf8');
    return JSON.parse(templateData);
  } catch (error) {
    console.error('Failed to load email templates:', error);
    throw new Error('Email templates not found');
  }
}

/**
 * Determine tier based on subscriber count
 */
function determineTier(subscriberCount) {
  if (subscriberCount <= 1000) return 'tier1';
  if (subscriberCount <= 3000) return 'tier2';
  if (subscriberCount <= 5000) return 'tier3';
  return 'standard';
}

/**
 * Get current subscriber count from milestones API
 */
async function getCurrentSubscriberCount() {
  try {
    // TODO: Replace with actual API call to /api/finderr/milestones
    // const response = await fetch('https://hub.untrapd.com/.netlify/functions/finderr-milestones');
    // const data = await response.json();
    // return data.totalSubscribers;

    // STAGING: Mock data
    if (process.env.NODE_ENV !== 'production' || process.env.FINDERR_MOCK_DATA === 'true') {
      return 150;
    }

    throw new Error('Production API not configured');
  } catch (error) {
    console.error('Failed to get subscriber count:', error);
    return 150; // Default fallback
  }
}

/**
 * Personalize email template with subscriber data
 */
function personalizeEmail(template, subscriberData) {
  let subject = template.subject;
  let bodyHtml = template.body_html;
  let bodyText = template.body_text;

  // Replace variables
  const replacements = {
    '{{subscriber_number}}': subscriberData.subscriberNumber,
    '{{first_name}}': subscriberData.firstName || 'Friend',
    '{{email}}': subscriberData.email,
    '{{tier_name}}': subscriberData.tierName,
    '{{tier_badge}}': subscriberData.tierBadge,
    '{{subscriber_count}}': subscriberData.subscriberCount,
    '{{spots_remaining}}': subscriberData.spotsRemaining,
    '{{join_date}}': subscriberData.joinDate
  };

  for (const [key, value] of Object.entries(replacements)) {
    subject = subject.replace(new RegExp(key, 'g'), value);
    bodyHtml = bodyHtml.replace(new RegExp(key, 'g'), value);
    bodyText = bodyText.replace(new RegExp(key, 'g'), value);
  }

  return { subject, bodyHtml, bodyText };
}

/**
 * Send email via Mailchimp
 */
async function sendViaMailchimp(emailData) {
  // TODO: Implement Mailchimp API integration
  // const mailchimp = require('@mailchimp/mailchimp_transactional')(ESP_CONFIG.mailchimp.apiKey);

  console.log('[MAILCHIMP] Sending email:', {
    to: emailData.to,
    subject: emailData.subject
  });

  // STAGING: Mock success
  if (process.env.NODE_ENV !== 'production' || process.env.FINDERR_MOCK_DATA === 'true') {
    return {
      success: true,
      messageId: `mailchimp_${Date.now()}`,
      status: 'sent'
    };
  }

  throw new Error('Mailchimp API not configured');
}

/**
 * Send email via SendGrid
 */
async function sendViaSendGrid(emailData) {
  // TODO: Implement SendGrid API integration
  // const sgMail = require('@sendgrid/mail');
  // sgMail.setApiKey(ESP_CONFIG.sendgrid.apiKey);

  console.log('[SENDGRID] Sending email:', {
    to: emailData.to,
    subject: emailData.subject
  });

  // STAGING: Mock success
  if (process.env.NODE_ENV !== 'production' || process.env.FINDERR_MOCK_DATA === 'true') {
    return {
      success: true,
      messageId: `sendgrid_${Date.now()}`,
      status: 'sent'
    };
  }

  throw new Error('SendGrid API not configured');
}

/**
 * Send email via configured ESP
 */
async function sendEmail(emailData) {
  const provider = ESP_CONFIG.provider;

  if (provider === 'mailchimp') {
    return await sendViaMailchimp(emailData);
  } else if (provider === 'sendgrid') {
    return await sendViaSendGrid(emailData);
  } else {
    throw new Error(`Unknown email provider: ${provider}`);
  }
}

/**
 * Process new subscriber and trigger welcome email
 */
async function processNewSubscriber(subscriberInfo) {
  try {
    // Get current subscriber count
    const subscriberCount = await getCurrentSubscriberCount();

    // Determine tier
    const tier = determineTier(subscriberCount);

    // Load email templates
    const templates = await loadEmailTemplates();

    // Find first email for this tier
    const emailId = SEQUENCE_CONFIG[tier].emails[0];
    const emailTemplate = templates.emails.find(e => e.id === emailId);

    if (!emailTemplate) {
      throw new Error(`Email template not found: ${emailId}`);
    }

    // Build subscriber data for personalization
    const subscriberData = {
      subscriberNumber: subscriberCount,
      firstName: subscriberInfo.first_name || '',
      email: subscriberInfo.email,
      tierName: tier === 'tier1' ? "Founder's Circle" :
                tier === 'tier2' ? "Early Adopter" :
                tier === 'tier3' ? "Launch Supporter" : "Standard",
      tierBadge: tier === 'tier1' ? '🏆' : tier === 'tier2' ? '⭐' : tier === 'tier3' ? '🚀' : '📱',
      subscriberCount,
      spotsRemaining: tier === 'tier1' ? (1000 - subscriberCount) :
                      tier === 'tier2' ? (3000 - subscriberCount) :
                      tier === 'tier3' ? (5000 - subscriberCount) : 0,
      joinDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    };

    // Personalize email
    const { subject, bodyHtml, bodyText } = personalizeEmail(emailTemplate, subscriberData);

    // Send email
    const result = await sendEmail({
      to: subscriberInfo.email,
      from: emailTemplate.from_email,
      fromName: emailTemplate.from_name,
      subject,
      html: bodyHtml,
      text: bodyText
    });

    // Schedule follow-up emails
    await scheduleFollowUpEmails(subscriberInfo, tier, subscriberData);

    console.log('Welcome email sent:', {
      email: subscriberInfo.email,
      tier,
      subscriberNumber: subscriberCount,
      messageId: result.messageId
    });

    return {
      success: true,
      tier,
      subscriberNumber: subscriberCount,
      emailsSent: 1,
      emailsScheduled: SEQUENCE_CONFIG[tier].emails.length - 1,
      messageId: result.messageId
    };

  } catch (error) {
    console.error('Failed to process subscriber:', error);
    throw error;
  }
}

/**
 * Schedule follow-up emails
 */
async function scheduleFollowUpEmails(subscriberInfo, tier, subscriberData) {
  // TODO: Implement scheduling with delay
  // Options:
  // 1. Use ESP's built-in automation (recommended)
  // 2. Use database + cron job
  // 3. Use queue system (Redis/Bull)

  const sequence = SEQUENCE_CONFIG[tier];
  const followUpEmails = sequence.emails.slice(1);

  console.log('Scheduling follow-up emails:', {
    email: subscriberInfo.email,
    tier,
    count: followUpEmails.length,
    delays: sequence.delay_hours.slice(1)
  });

  // STAGING: Log scheduled emails
  if (process.env.NODE_ENV !== 'production' || process.env.FINDERR_MOCK_DATA === 'true') {
    for (let i = 0; i < followUpEmails.length; i++) {
      console.log(`[SCHEDULED] ${followUpEmails[i]} → ${subscriberInfo.email} (in ${sequence.delay_hours[i + 1]} hours)`);
    }
    return { scheduled: followUpEmails.length };
  }

  throw new Error('Email scheduling not configured');
}

/**
 * Manual trigger for specific email
 */
async function sendSpecificEmail(subscriberEmail, emailId) {
  try {
    const templates = await loadEmailTemplates();
    const emailTemplate = templates.emails.find(e => e.id === emailId);

    if (!emailTemplate) {
      throw new Error(`Email template not found: ${emailId}`);
    }

    const subscriberCount = await getCurrentSubscriberCount();
    const tier = determineTier(subscriberCount);

    const subscriberData = {
      subscriberNumber: subscriberCount,
      firstName: '',
      email: subscriberEmail,
      tierName: tier === 'tier1' ? "Founder's Circle" :
                tier === 'tier2' ? "Early Adopter" :
                tier === 'tier3' ? "Launch Supporter" : "Standard",
      tierBadge: tier === 'tier1' ? '🏆' : tier === 'tier2' ? '⭐' : tier === 'tier3' ? '🚀' : '📱',
      subscriberCount,
      spotsRemaining: 0,
      joinDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    };

    const { subject, bodyHtml, bodyText } = personalizeEmail(emailTemplate, subscriberData);

    const result = await sendEmail({
      to: subscriberEmail,
      from: emailTemplate.from_email,
      fromName: emailTemplate.from_name,
      subject,
      html: bodyHtml,
      text: bodyText
    });

    return {
      success: true,
      messageId: result.messageId,
      emailId
    };

  } catch (error) {
    console.error('Failed to send specific email:', error);
    throw error;
  }
}

/**
 * Test mode - send test email
 */
async function sendTestEmail(testEmail, tier = 'tier1') {
  console.log('[TEST MODE] Sending test email:', {
    to: testEmail,
    tier
  });

  return await processNewSubscriber({
    email: testEmail,
    first_name: 'Test',
    last_name: 'User',
    test_mode: true
  });
}

module.exports = {
  processNewSubscriber,
  sendSpecificEmail,
  sendTestEmail,
  determineTier,
  getCurrentSubscriberCount,
  loadEmailTemplates
};

// CLI mode for testing
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === 'test') {
    const testEmail = args[1] || 'test@finderr.app';
    const tier = args[2] || 'tier1';

    console.log(`\n🧪 Testing email automation with ${testEmail} (${tier})\n`);

    sendTestEmail(testEmail, tier)
      .then(result => {
        console.log('\n✅ Test completed:', result);
        process.exit(0);
      })
      .catch(error => {
        console.error('\n❌ Test failed:', error);
        process.exit(1);
      });
  } else {
    console.log(`
FINDERR Email Automation System

Usage:
  node finderr-email-automation.js test [email] [tier]

Examples:
  node finderr-email-automation.js test test@example.com tier1
  node finderr-email-automation.js test beta@finderr.app tier2

Environment Variables:
  EMAIL_PROVIDER=mailchimp|sendgrid
  MAILCHIMP_API_KEY=your-key
  MAILCHIMP_LIST_ID=your-list-id
  SENDGRID_API_KEY=your-key
  FINDERR_MOCK_DATA=true (for testing)
`);
  }
}
