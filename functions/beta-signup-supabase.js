/**
 * Beta Signup Handler - Supabase + Email Provider
 * Supports: Resend (primary), Brevo (fallback)
 */

const { createClient } = require('@supabase/supabase-js');
const EmailProvider = require('./lib/email-provider');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Initialize email provider (defaults to Resend, can switch to Brevo via env var)
const emailProvider = new EmailProvider(process.env.EMAIL_PROVIDER || 'resend');

/**
 * Email validation
 */
const isValidEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Main handler
 */
exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle OPTIONS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse request body
    const body = JSON.parse(event.body);
    const {
      email,
      name,
      firstName,
      deviceType,
      interest,
      source = 'finderr-beta-signup',
      language = 'en',
      tags = []
    } = body;

    // Validate required fields
    if (!email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Missing required field',
          message: 'Email is required'
        })
      };
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Invalid email format',
          message: 'Please provide a valid email address'
        })
      };
    }

    // Prepare user data
    const userData = {
      email: email.toLowerCase().trim(),
      first_name: firstName || name || '',
      device_type: deviceType,
      interest,
      source,
      language,
      tags: [
        'finderr-beta',
        'android-tester',
        ...(Array.isArray(tags) ? tags : [tags]),
        deviceType,
        interest
      ].filter(Boolean),
      metadata: {
        signup_ip: event.headers['x-forwarded-for'] || event.headers['client-ip'],
        user_agent: event.headers['user-agent'],
        referrer: event.headers['referer']
      }
    };

    // 1. Insert into Supabase beta_users table
    const { data: user, error: insertError } = await supabase
      .from('beta_users')
      .insert(userData)
      .select()
      .single();

    // Handle duplicate email (23505 = unique violation)
    if (insertError) {
      if (insertError.code === '23505') {
        // User already exists, update instead
        const { data: existingUser, error: updateError } = await supabase
          .from('beta_users')
          .update({
            first_name: userData.first_name,
            device_type: userData.device_type,
            interest: userData.interest,
            tags: userData.tags
          })
          .eq('email', userData.email)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating existing user:', updateError);
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
              error: 'Database error',
              message: 'Failed to update user information'
            })
          };
        }

        // Return success but indicate user already exists
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            message: 'Welcome back! Your information has been updated.',
            user_id: existingUser.id,
            already_subscribed: true
          })
        };
      }

      // Other database errors
      console.error('Database insert error:', insertError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Database error',
          message: insertError.message
        })
      };
    }

    // 2. Send welcome email
    const welcomeEmailResult = await sendWelcomeEmail(user);

    if (!welcomeEmailResult.success) {
      console.error('Welcome email failed:', welcomeEmailResult.error);
      // Don't fail the signup if email fails
    }

    // 3. Track analytics event
    await trackSignupEvent(user);

    // 4. Return success
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Successfully subscribed to FINDERR beta',
        user_id: user.id,
        email_sent: welcomeEmailResult.success,
        provider: emailProvider.provider
      })
    };

  } catch (error) {
    console.error('Unexpected error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'production'
          ? 'Something went wrong'
          : error.message
      })
    };
  }
};

/**
 * Send welcome email
 */
async function sendWelcomeEmail(user) {
  try {
    const betaUrl = 'https://play.google.com/apps/testing/com.finderr.app';
    const emailContent = generateWelcomeEmail(user, betaUrl);

    const result = await emailProvider.sendEmail({
      from: 'FINDERR Team <finderr@hub.untrapd.com>',
      to: user.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
      tags: ['campaign:welcome-email-1', 'sequence:welcome', 'number:1']
    });

    // Track email send in database
    if (result.success) {
      await supabase.from('email_sends').insert({
        user_id: user.id,
        subject: emailContent.subject,
        provider: emailProvider.provider,
        provider_message_id: result.messageId,
        status: 'sent',
        metadata: {
          campaign: 'welcome-email-1',
          sequence: 'welcome',
          number: 1
        }
      });
    }

    return result;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Track signup analytics event
 */
async function trackSignupEvent(user) {
  try {
    await supabase.from('analytics_events').insert({
      event_name: 'beta_signup',
      user_email: user.email,
      user_id: user.id,
      event_properties: {
        source: user.source,
        device_type: user.device_type,
        interest: user.interest,
        language: user.language
      },
      utm_source: user.source
    });
  } catch (error) {
    console.error('Error tracking signup event:', error);
  }
}

/**
 * Generate welcome email content
 */
function generateWelcomeEmail(user, betaUrl) {
  const firstName = user.first_name || 'there';

  const subject = `Welcome to FINDERR Beta Testing! 🚀`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Welcome to FINDERR Beta!</h1>
  </div>

  <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
    <p style="font-size: 18px; margin-top: 0;">Hi ${firstName},</p>

    <p>Thank you for joining the FINDERR Beta Testing program! You're now part of an exclusive group helping us build the world's first system lockscreen modification app for Android phone recovery.</p>

    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
      <h2 style="margin-top: 0; color: #667eea; font-size: 20px;">📱 Next Steps:</h2>
      <ol style="margin: 15px 0; padding-left: 20px;">
        <li style="margin-bottom: 10px;">Click the button below to become a tester</li>
        <li style="margin-bottom: 10px;">Download FINDERR v4.3 from Google Play</li>
        <li style="margin-bottom: 10px;">Test emergency activation & wallpaper features</li>
        <li>Share feedback via email or in-app support</li>
      </ol>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${betaUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Join Beta Testing Now</a>
    </div>

    <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 25px 0;">
      <p style="margin: 0; color: #856404;"><strong>🔒 Priority Testing:</strong> We especially need validation for Row Level Security (RLS) and emergency system reliability. Your testing is crucial for our production launch!</p>
    </div>

    <p>Questions or need help? Just reply to this email - we read every message!</p>

    <p style="margin-bottom: 0;">Cheers,<br><strong>The FINDERR Team</strong></p>
  </div>

  <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
    <p>FINDERR by UNTRAPD - World's First System Lockscreen Modification App</p>
    <p>
      <a href="https://hub.untrapd.com/apps/finderr" style="color: #667eea; text-decoration: none;">Learn More</a> •
      <a href="https://hub.untrapd.com/privacy" style="color: #667eea; text-decoration: none;">Privacy Policy</a> •
      <a href="{{unsubscribe_url}}" style="color: #999; text-decoration: none;">Unsubscribe</a>
    </p>
  </div>
</body>
</html>
  `.trim();

  const text = `
Hi ${firstName},

Thank you for joining the FINDERR Beta Testing program!

NEXT STEPS:
1. Open this link on your Android device: ${betaUrl}
2. Click "Become a Tester"
3. Download FINDERR v4.3 from Google Play
4. Test emergency activation & wallpaper features
5. Share feedback via email or in-app support

🔒 PRIORITY TESTING: We especially need validation for Row Level Security (RLS) and emergency system reliability.

Questions? Just reply to this email!

Cheers,
The FINDERR Team

---
FINDERR by UNTRAPD - World's First System Lockscreen Modification App
Learn More: https://hub.untrapd.com/apps/finderr
Privacy: https://hub.untrapd.com/privacy
Unsubscribe: {{unsubscribe_url}}
  `.trim();

  return { subject, html, text };
}
