/**
 * Email Sequence Scheduler
 * Runs on cron job (daily) to send scheduled emails based on sequence logic
 * Supports welcome, launch, and retention sequences
 */

const { createClient } = require('@supabase/supabase-js');
const EmailProvider = require('./lib/email-provider');
const { welcomeSequence, findrrDefaults } = require('./email-templates/welcome-sequence-html');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const emailProvider = new EmailProvider(process.env.EMAIL_PROVIDER || 'resend');

/**
 * Main scheduler handler
 */
exports.handler = async (event, context) => {
  try {
    console.log('Starting email sequence scheduler...');

    const results = {
      welcome: { sent: 0, failed: 0 },
      launch: { sent: 0, failed: 0 },
      retention: { sent: 0, failed: 0 }
    };

    // Process welcome sequence
    const welcomeResults = await processWelcomeSequence();
    results.welcome = welcomeResults;

    // Process launch sequence (future implementation)
    // const launchResults = await processLaunchSequence();
    // results.launch = launchResults;

    // Process retention sequence (future implementation)
    // const retentionResults = await processRetentionSequence();
    // results.retention = retentionResults;

    console.log('Email sequence scheduler completed:', results);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        message: 'Email sequences processed',
        results
      })
    };
  } catch (error) {
    console.error('Scheduler error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: error.message,
        stack: process.env.NODE_ENV === 'production' ? undefined : error.stack
      })
    };
  }
};

/**
 * Process welcome sequence
 */
async function processWelcomeSequence() {
  const results = { sent: 0, failed: 0 };

  // Define email schedule
  const emailsToSend = [
    { number: 1, delayHours: 0 },      // Immediate
    { number: 2, delayHours: 24 },     // Day 1
    { number: 3, delayHours: 72 },     // Day 3
    { number: 4, delayHours: 168 },    // Day 7
    { number: 5, delayHours: 336 }     // Day 14
  ];

  for (const { number, delayHours } of emailsToSend) {
    const emailResults = await sendWelcomeEmail(number, delayHours);
    results.sent += emailResults.sent;
    results.failed += emailResults.failed;
  }

  return results;
}

/**
 * Send specific welcome email
 */
async function sendWelcomeEmail(emailNumber, delayHours) {
  const results = { sent: 0, failed: 0 };

  try {
    // Query users who need this email
    const { data: users, error } = await supabase.rpc('get_users_needing_email', {
      p_sequence_type: 'welcome',
      p_email_number: emailNumber,
      p_delay_hours: delayHours
    });

    if (error) {
      console.error(`Error fetching users for welcome email ${emailNumber}:`, error);
      return results;
    }

    console.log(`Found ${users?.length || 0} users needing welcome email ${emailNumber}`);

    // Send email to each user
    for (const user of users || []) {
      const success = await sendEmailToUser(user, 'welcome', emailNumber);
      if (success) {
        results.sent++;
      } else {
        results.failed++;
      }
    }
  } catch (error) {
    console.error(`Error processing welcome email ${emailNumber}:`, error);
  }

  return results;
}

/**
 * Send email to individual user
 */
async function sendEmailToUser(user, sequenceType, emailNumber) {
  try {
    // Get email template
    const emailKey = `email${emailNumber}`;
    const template = welcomeSequence[emailKey];

    if (!template) {
      console.error(`Template not found: ${sequenceType}/${emailKey}`);
      return false;
    }

    // Prepare template variables (merge FINDERR defaults with user-specific data)
    const variables = {
      ...findrrDefaults,
      first_name: user.first_name || 'there',
      email: user.email
    };

    // Generate email content
    const subject = template.subject(variables);
    const html = template.html(variables);
    const text = template.text(variables);

    // Send email
    const result = await emailProvider.sendEmail({
      from: 'FINDERR Team <finderr@hub.untrapd.com>',
      to: user.email,
      subject,
      html,
      text,
      tags: [
        `campaign:welcome-email-${emailNumber}`,
        'sequence:welcome',
        `number:${emailNumber}`
      ]
    });

    if (result.success) {
      // Track in database
      await supabase.from('email_sends').insert({
        user_id: user.id,
        subject,
        provider: emailProvider.provider,
        provider_message_id: result.messageId,
        status: 'sent',
        metadata: {
          campaign: `welcome-email-${emailNumber}`,
          sequence: 'welcome',
          number: emailNumber
        }
      });

      // Update user's last_email_sent
      await supabase
        .from('beta_users')
        .update({ last_email_sent: new Date().toISOString() })
        .eq('id', user.id);

      console.log(`✅ Sent welcome email ${emailNumber} to ${user.email}`);
      return true;
    } else {
      console.error(`❌ Failed to send email to ${user.email}:`, result.error);
      return false;
    }
  } catch (error) {
    console.error(`Error sending email to ${user.email}:`, error);
    return false;
  }
}

/**
 * Process launch sequence (future implementation)
 */
async function processLaunchSequence() {
  // TODO: Implement launch sequence logic
  return { sent: 0, failed: 0 };
}

/**
 * Process retention sequence (future implementation)
 */
async function processRetentionSequence() {
  // TODO: Implement retention sequence logic
  return { sent: 0, failed: 0 };
}
