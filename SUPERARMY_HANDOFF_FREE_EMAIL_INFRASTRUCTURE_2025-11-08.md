# SuperClaude Army Handoff: FREE Email Infrastructure Build

**Date**: 2025-11-08
**Mission**: Build 100% FREE email marketing infrastructure with Resend (primary) + Brevo migration ready
**Execution Mode**: 3-Agent Parallel Deployment
**Estimated Time**: 25 minutes (parallel) vs 70 minutes (sequential) = **64% time savings**

---

## 🎯 Mission Overview

Build complete FREE email marketing infrastructure for FINDERR beta campaign using:
- **Primary**: Resend (3,000 emails/month free, no credit card)
- **Future Migration Ready**: Brevo/Sendinblue (9,000 emails/month free)
- **Database**: Supabase (already in use for FINDERR)
- **Automation**: Supabase Edge Functions + Netlify Functions
- **Cost**: **$0/month** for beta phase (100-1,000 users)

---

## 👥 Agent Assignments

### **Agent Alpha: Supabase Database Infrastructure**
- **Primary Objective**: Create database schema, RLS policies, indexes
- **Estimated Time**: 20 minutes
- **Files to Create**: `supabase/migrations/add_email_marketing_infrastructure.sql`
- **Success Criteria**: 4 tables created, RLS policies applied, migration tested

### **Agent Beta: Email Service Integration (Resend + Brevo-Ready)**
- **Primary Objective**: Build Netlify function with dual-provider support
- **Estimated Time**: 25 minutes
- **Files to Create**: `functions/beta-signup-supabase.js`, email provider abstraction layer
- **Success Criteria**: Resend working, Brevo adapter ready, environment variables documented

### **Agent Gamma: Email Templates & Automation**
- **Primary Objective**: Convert JSON templates to HTML, build sequence automation
- **Estimated Time**: 25 minutes
- **Files to Create**: Email templates, sequence scheduler, tracking system
- **Success Criteria**: 3 sequences (welcome/launch/retention) ready, automation tested

---

## 📋 Agent Alpha Mission Brief

### **Objective**: Supabase Database Schema + RLS Policies

#### **1. Database Schema Creation**

Create migration file: `supabase/migrations/add_email_marketing_infrastructure.sql`

**Tables to Create**:

**A. `beta_users` Table**
```sql
CREATE TABLE IF NOT EXISTS beta_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  device_type TEXT,
  interest TEXT,
  source TEXT DEFAULT 'finderr-beta-signup',
  language TEXT DEFAULT 'en',
  status TEXT DEFAULT 'subscribed', -- subscribed, unsubscribed, bounced
  tags TEXT[] DEFAULT ARRAY['finderr-beta', 'android-tester'],
  signup_date TIMESTAMPTZ DEFAULT NOW(),
  last_email_sent TIMESTAMPTZ,
  email_open_count INTEGER DEFAULT 0,
  email_click_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Indexes
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'),
  CONSTRAINT valid_status CHECK (status IN ('subscribed', 'unsubscribed', 'bounced'))
);

-- Indexes for performance
CREATE INDEX idx_beta_users_email ON beta_users(email);
CREATE INDEX idx_beta_users_status ON beta_users(status);
CREATE INDEX idx_beta_users_source ON beta_users(source);
CREATE INDEX idx_beta_users_signup_date ON beta_users(signup_date DESC);
CREATE INDEX idx_beta_users_tags ON beta_users USING GIN(tags);
```

**B. `email_campaigns` Table**
```sql
CREATE TABLE IF NOT EXISTS email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_name TEXT NOT NULL,
  sequence_type TEXT NOT NULL, -- welcome, launch, retention
  email_number INTEGER NOT NULL,
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  body_text TEXT,
  template_variables JSONB DEFAULT '{}'::jsonb,
  delay_hours INTEGER DEFAULT 0, -- Delay from previous email
  trigger_condition TEXT, -- SQL condition for sending
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_sequence_type CHECK (sequence_type IN ('welcome', 'launch', 'retention')),
  CONSTRAINT unique_sequence_email UNIQUE (sequence_type, email_number)
);

-- Index for sequence retrieval
CREATE INDEX idx_email_campaigns_sequence ON email_campaigns(sequence_type, email_number);
```

**C. `email_sends` Table**
```sql
CREATE TABLE IF NOT EXISTS email_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES beta_users(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES email_campaigns(id),

  -- Email details
  subject TEXT NOT NULL,
  provider TEXT DEFAULT 'resend', -- resend, brevo, manual
  provider_message_id TEXT,

  -- Timestamps
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  bounced_at TIMESTAMPTZ,

  -- Status tracking
  status TEXT DEFAULT 'sent', -- sent, delivered, opened, clicked, bounced, failed
  error_message TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  CONSTRAINT valid_status CHECK (status IN ('sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed'))
);

-- Indexes for tracking queries
CREATE INDEX idx_email_sends_user_id ON email_sends(user_id);
CREATE INDEX idx_email_sends_campaign_id ON email_sends(campaign_id);
CREATE INDEX idx_email_sends_sent_at ON email_sends(sent_at DESC);
CREATE INDEX idx_email_sends_status ON email_sends(status);
CREATE INDEX idx_email_sends_provider_message_id ON email_sends(provider_message_id);
```

**D. `analytics_events` Table**
```sql
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL,
  user_email TEXT,
  user_id UUID REFERENCES beta_users(id),

  -- Event details
  event_properties JSONB DEFAULT '{}'::jsonb,

  -- UTM tracking
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,

  -- Metadata
  session_id TEXT,
  ip_address TEXT,
  user_agent TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for analytics queries
CREATE INDEX idx_analytics_events_name ON analytics_events(event_name);
CREATE INDEX idx_analytics_events_user_email ON analytics_events(user_email);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX idx_analytics_events_utm_campaign ON analytics_events(utm_campaign);
CREATE INDEX idx_analytics_events_properties ON analytics_events USING GIN(event_properties);
```

#### **2. Row Level Security (RLS) Policies**

```sql
-- Enable RLS on all tables
ALTER TABLE beta_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_sends ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- beta_users policies
CREATE POLICY "Public can insert beta signups" ON beta_users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own data" ON beta_users
  FOR SELECT USING (auth.uid()::text = id::text OR auth.role() = 'service_role');

CREATE POLICY "Service role full access" ON beta_users
  FOR ALL USING (auth.role() = 'service_role');

-- email_campaigns policies (read-only for authenticated, full for service)
CREATE POLICY "Campaigns readable by authenticated" ON email_campaigns
  FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Service role campaign management" ON email_campaigns
  FOR ALL USING (auth.role() = 'service_role');

-- email_sends policies (service role only)
CREATE POLICY "Service role email sends" ON email_sends
  FOR ALL USING (auth.role() = 'service_role');

-- analytics_events policies (insert for all, select for service)
CREATE POLICY "Anyone can insert analytics" ON analytics_events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role analytics access" ON analytics_events
  FOR SELECT USING (auth.role() = 'service_role');
```

#### **3. Helper Functions**

```sql
-- Function to get user's email sequence progress
CREATE OR REPLACE FUNCTION get_email_sequence_progress(
  p_user_id UUID,
  p_sequence_type TEXT
)
RETURNS TABLE(
  email_number INTEGER,
  subject TEXT,
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ec.email_number,
    es.subject,
    es.sent_at,
    es.opened_at,
    es.clicked_at
  FROM email_sends es
  JOIN email_campaigns ec ON es.campaign_id = ec.id
  WHERE es.user_id = p_user_id
    AND ec.sequence_type = p_sequence_type
  ORDER BY ec.email_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to track email opens (webhook endpoint)
CREATE OR REPLACE FUNCTION track_email_open(
  p_provider_message_id TEXT
)
RETURNS VOID AS $$
BEGIN
  UPDATE email_sends
  SET
    opened_at = COALESCE(opened_at, NOW()),
    status = CASE
      WHEN status = 'sent' OR status = 'delivered' THEN 'opened'
      ELSE status
    END
  WHERE provider_message_id = p_provider_message_id
    AND opened_at IS NULL;

  -- Update user open count
  UPDATE beta_users
  SET email_open_count = email_open_count + 1
  WHERE id = (SELECT user_id FROM email_sends WHERE provider_message_id = p_provider_message_id LIMIT 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to track email clicks
CREATE OR REPLACE FUNCTION track_email_click(
  p_provider_message_id TEXT,
  p_link_url TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE email_sends
  SET
    clicked_at = COALESCE(clicked_at, NOW()),
    status = 'clicked',
    metadata = metadata || jsonb_build_object('clicked_link', p_link_url)
  WHERE provider_message_id = p_provider_message_id
    AND clicked_at IS NULL;

  -- Update user click count
  UPDATE beta_users
  SET email_click_count = email_click_count + 1
  WHERE id = (SELECT user_id FROM email_sends WHERE provider_message_id = p_provider_message_id LIMIT 1);

  -- Track analytics event
  INSERT INTO analytics_events (event_name, user_email, event_properties)
  SELECT
    'email_clicked',
    bu.email,
    jsonb_build_object(
      'provider_message_id', p_provider_message_id,
      'link_url', p_link_url
    )
  FROM email_sends es
  JOIN beta_users bu ON es.user_id = bu.id
  WHERE es.provider_message_id = p_provider_message_id
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### **4. Validation Queries**

```sql
-- Verify all tables exist
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('beta_users', 'email_campaigns', 'email_sends', 'analytics_events');

-- Verify RLS enabled
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('beta_users', 'email_campaigns', 'email_sends', 'analytics_events');

-- Verify indexes
SELECT indexname, tablename FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('beta_users', 'email_campaigns', 'email_sends', 'analytics_events')
ORDER BY tablename, indexname;
```

#### **Success Criteria**
- ✅ All 4 tables created with proper constraints
- ✅ All indexes created for performance
- ✅ RLS policies applied and tested
- ✅ Helper functions created and working
- ✅ Validation queries return expected results

---

## 📋 Agent Beta Mission Brief

### **Objective**: Email Service Integration (Resend Primary + Brevo Migration Ready)

#### **1. Email Provider Abstraction Layer**

Create file: `functions/lib/email-provider.js`

```javascript
/**
 * Email Provider Abstraction Layer
 * Supports: Resend (primary), Brevo (migration ready)
 * Allows seamless switching between providers
 */

class EmailProvider {
  constructor(provider = 'resend') {
    this.provider = provider;
    this.initializeProvider();
  }

  initializeProvider() {
    switch (this.provider) {
      case 'resend':
        this.client = this.initializeResend();
        break;
      case 'brevo':
        this.client = this.initializeBrevo();
        break;
      default:
        throw new Error(`Unknown email provider: ${this.provider}`);
    }
  }

  initializeResend() {
    const { Resend } = require('resend');

    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY environment variable not set');
    }

    return new Resend(process.env.RESEND_API_KEY);
  }

  initializeBrevo() {
    const SibApiV3Sdk = require('sib-api-v3-sdk');

    if (!process.env.BREVO_API_KEY) {
      throw new Error('BREVO_API_KEY environment variable not set');
    }

    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = process.env.BREVO_API_KEY;

    return new SibApiV3Sdk.TransactionalEmailsApi();
  }

  /**
   * Send email - unified interface for all providers
   */
  async sendEmail({ from, to, subject, html, text, tags = [] }) {
    switch (this.provider) {
      case 'resend':
        return await this.sendWithResend({ from, to, subject, html, text, tags });
      case 'brevo':
        return await this.sendWithBrevo({ from, to, subject, html, text, tags });
      default:
        throw new Error(`Provider ${this.provider} not implemented`);
    }
  }

  /**
   * Resend implementation
   */
  async sendWithResend({ from, to, subject, html, text, tags }) {
    try {
      const result = await this.client.emails.send({
        from,
        to,
        subject,
        html,
        text,
        tags: tags.map(tag => ({
          name: typeof tag === 'string' ? 'tag' : tag.name,
          value: typeof tag === 'string' ? tag : tag.value
        }))
      });

      return {
        success: true,
        provider: 'resend',
        messageId: result.data.id,
        response: result
      };
    } catch (error) {
      console.error('Resend send error:', error);
      return {
        success: false,
        provider: 'resend',
        error: error.message,
        details: error
      };
    }
  }

  /**
   * Brevo implementation (migration ready)
   */
  async sendWithBrevo({ from, to, subject, html, text, tags }) {
    try {
      // Parse from address
      const fromMatch = from.match(/^(.+?)\s*<(.+?)>$/) || [null, from, from];
      const fromName = fromMatch[1].trim();
      const fromEmail = fromMatch[2].trim();

      const sendSmtpEmail = {
        sender: { name: fromName, email: fromEmail },
        to: [{ email: to }],
        subject,
        htmlContent: html,
        textContent: text,
        tags: tags.map(tag => typeof tag === 'string' ? tag : tag.value)
      };

      const result = await this.client.sendTransacEmail(sendSmtpEmail);

      return {
        success: true,
        provider: 'brevo',
        messageId: result.messageId,
        response: result
      };
    } catch (error) {
      console.error('Brevo send error:', error);
      return {
        success: false,
        provider: 'brevo',
        error: error.message,
        details: error
      };
    }
  }

  /**
   * Get provider-specific tracking URL
   */
  getTrackingPixelUrl(messageId) {
    const baseUrl = process.env.NETLIFY_URL || 'https://hub.untrapd.com';
    return `${baseUrl}/.netlify/functions/email-tracking?event=open&id=${messageId}`;
  }

  /**
   * Get provider-specific click tracking URL
   */
  getClickTrackingUrl(messageId, destinationUrl) {
    const baseUrl = process.env.NETLIFY_URL || 'https://hub.untrapd.com';
    return `${baseUrl}/.netlify/functions/email-tracking?event=click&id=${messageId}&url=${encodeURIComponent(destinationUrl)}`;
  }
}

module.exports = EmailProvider;
```

#### **2. Beta Signup Netlify Function**

Create file: `functions/beta-signup-supabase.js`

```javascript
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
        <li style="margin-bottom: 10px;">Download FINDERR v4.2.0+241 from Google Play</li>
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
3. Download FINDERR v4.2.0+241 from Google Play
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
```

#### **3. Email Tracking Netlify Function**

Create file: `functions/email-tracking.js`

```javascript
/**
 * Email Tracking Handler
 * Tracks opens and clicks for both Resend and Brevo
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

exports.handler = async (event, context) => {
  const { event: trackingEvent, id: messageId, url: destinationUrl } = event.queryStringParameters || {};

  if (!messageId) {
    return { statusCode: 400, body: 'Missing message ID' };
  }

  try {
    if (trackingEvent === 'open') {
      // Track email open
      await supabase.rpc('track_email_open', { p_provider_message_id: messageId });

      // Return 1x1 transparent pixel
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'image/gif' },
        body: Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64').toString('base64'),
        isBase64Encoded: true
      };
    } else if (trackingEvent === 'click') {
      // Track email click
      await supabase.rpc('track_email_click', {
        p_provider_message_id: messageId,
        p_link_url: destinationUrl
      });

      // Redirect to destination
      return {
        statusCode: 302,
        headers: { Location: decodeURIComponent(destinationUrl) },
        body: ''
      };
    }

    return { statusCode: 400, body: 'Invalid tracking event' };
  } catch (error) {
    console.error('Tracking error:', error);
    return { statusCode: 500, body: 'Tracking failed' };
  }
};
```

#### **4. Environment Variables Setup**

Create file: `ENVIRONMENT_VARIABLES_EMAIL.md`

```markdown
# Email Infrastructure Environment Variables

## Required for Netlify Functions

Add these to Netlify Dashboard → Site settings → Environment variables

### Supabase Configuration
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key_here
```

### Email Provider - Resend (Primary)
```
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_your_resend_api_key_here
```

### Email Provider - Brevo (Migration Ready)
```
# Uncomment when switching to Brevo:
# EMAIL_PROVIDER=brevo
# BREVO_API_KEY=xkeysib-your_brevo_api_key_here
```

### Email Configuration
```
EMAIL_FROM_ADDRESS=finderr@hub.untrapd.com
EMAIL_FROM_NAME=FINDERR Team
EMAIL_REPLY_TO=support@untrapd.com
```

### Application Settings
```
NODE_ENV=production
NETLIFY_URL=https://hub.untrapd.com
```

## How to Get API Keys

### Resend (3,000 emails/month FREE)
1. Go to https://resend.com/signup
2. No credit card required
3. Verify your sending domain (hub.untrapd.com)
4. Copy API key from Dashboard → API Keys

### Brevo (9,000 emails/month FREE - for future)
1. Go to https://app.brevo.com/account/register
2. No credit card required
3. Verify your sending domain
4. Copy API key from Settings → SMTP & API → API Keys
```

#### **5. Package Dependencies**

Create file: `package.json` (if not exists, or update existing)

```json
{
  "name": "hub-email-infrastructure",
  "version": "1.0.0",
  "dependencies": {
    "@supabase/supabase-js": "^2.38.0",
    "resend": "^2.0.0",
    "sib-api-v3-sdk": "^8.5.0"
  }
}
```

#### **Success Criteria**
- ✅ Email provider abstraction layer supports Resend + Brevo
- ✅ Beta signup function working with Supabase
- ✅ Welcome email sending successfully
- ✅ Email tracking (opens/clicks) implemented
- ✅ Environment variables documented
- ✅ Package dependencies listed

---

## 📋 Agent Gamma Mission Brief

### **Objective**: Email Templates & Automation Logic

#### **1. Email Template Conversion**

Convert existing JSON templates to HTML email templates.

Create file: `functions/email-templates/welcome-sequence-html.js`

```javascript
/**
 * Welcome Sequence Email Templates (HTML)
 * Converted from content_templates/email_marketing/welcome-sequence.json
 */

const BASE_STYLES = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
  color: #333;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
`;

const HEADER_GRADIENT = `background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);`;

function replaceVariables(template, variables) {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value || '');
  }
  return result;
}

const welcomeSequence = {
  email1: {
    subject: (vars) => `Welcome to ${vars.app_name}! Let's get you started 🚀`,
    html: (vars) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="${BASE_STYLES}">
  <div style="${HEADER_GRADIENT} padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to ${vars.app_name}! 🚀</h1>
  </div>

  <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
    <p style="font-size: 18px; margin-top: 0;">Hi ${vars.first_name},</p>

    <p>Welcome to the ${vars.app_name} family! 🎉</p>

    <p>I'm ${vars.sender_name}, ${vars.sender_title} at ${vars.company_name}. I wanted to personally thank you for downloading ${vars.app_name} and share what makes our community special.</p>

    <p>${vars.app_name} has already helped ${vars.user_count}+ people ${vars.primary_benefit}. You're joining a community that values ${vars.core_value_1}, ${vars.core_value_2}, and ${vars.core_value_3}.</p>

    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
      <h2 style="margin-top: 0; color: #667eea;">🎯 Here's what happens next:</h2>
      <ul>
        <li><strong>Today:</strong> ${vars.immediate_action}</li>
        <li><strong>Tomorrow:</strong> ${vars.day_1_expectation}</li>
        <li><strong>This week:</strong> ${vars.week_1_expectation}</li>
      </ul>
    </div>

    <div style="background: #e7f3ff; border-left: 4px solid #2196f3; padding: 15px; margin: 25px 0;">
      <p style="margin: 0;"><strong>💡 Quick Start Tip:</strong></p>
      <p style="margin: 10px 0 0 0;">${vars.quick_start_tip}</p>
      <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">This simple step will ${vars.tip_benefit}.</p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${vars.cta_url}" style="display: inline-block; ${HEADER_GRADIENT} color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold;">Get Started</a>
    </div>

    <p>Questions? Just reply to this email - I read every single one.</p>

    <p>Cheering you on,<br><strong>${vars.sender_name}</strong></p>

    <p style="font-size: 14px; color: #666; border-top: 1px solid #e0e0e0; padding-top: 15px; margin-top: 30px;">
      <strong>P.S.</strong> ${vars.ps_message}
    </p>
  </div>
</body>
</html>
    `,
    text: (vars) => `
Hi ${vars.first_name},

Welcome to the ${vars.app_name} family! 🎉

I'm ${vars.sender_name}, ${vars.sender_title} at ${vars.company_name}. I wanted to personally thank you for downloading ${vars.app_name} and share what makes our community special.

${vars.app_name} has already helped ${vars.user_count}+ people ${vars.primary_benefit}. You're joining a community that values ${vars.core_value_1}, ${vars.core_value_2}, and ${vars.core_value_3}.

🎯 HERE'S WHAT HAPPENS NEXT:
• Today: ${vars.immediate_action}
• Tomorrow: ${vars.day_1_expectation}
• This week: ${vars.week_1_expectation}

💡 QUICK START TIP:
${vars.quick_start_tip}

This simple step will ${vars.tip_benefit}.

Get Started: ${vars.cta_url}

Questions? Just reply to this email - I read every single one.

Cheering you on,
${vars.sender_name}

P.S. ${vars.ps_message}
    `.trim(),
    delay_hours: 0 // Immediate
  },

  email2: {
    subject: (vars) => `Your first day with ${vars.app_name} - here's what to focus on`,
    html: (vars) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="${BASE_STYLES}">
  <div style="${HEADER_GRADIENT} padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Day 1: Focus on This</h1>
  </div>

  <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
    <p style="font-size: 18px; margin-top: 0;">Hi ${vars.first_name},</p>

    <p>How did your first experience with ${vars.app_name} go yesterday?</p>

    <p>If you haven't had a chance to ${vars.core_action} yet, no worries! Life gets busy.</p>

    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
      <h2 style="margin-top: 0; color: #667eea;">🎯 Today's Focus: ${vars.day_1_goal}</h2>
      <p>Here's exactly how to do it:</p>
      <ol>
        <li>${vars.step_1}</li>
        <li>${vars.step_2}</li>
        <li>${vars.step_3}</li>
      </ol>
      <p style="margin-bottom: 0;"><small>⏰ This takes about ${vars.time_estimate} and will ${vars.expected_result}.</small></p>
    </div>

    <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 25px 0;">
      <p style="margin: 0; color: #856404;"><strong>💡 Pro Tip from our community:</strong></p>
      <p style="margin: 10px 0 0 0; font-style: italic;">"${vars.user_tip}"</p>
      <p style="margin: 5px 0 0 0; font-size: 14px;">— ${vars.user_name}, ${vars.user_title}</p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${vars.cta_url}" style="display: inline-block; ${HEADER_GRADIENT} color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold;">${vars.cta_text}</a>
    </div>

    <p><strong>Stuck on something?</strong> Here are the most common questions from new users:</p>

    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
      <p style="margin: 0;"><strong>Q:</strong> ${vars.faq_1_question}</p>
      <p style="margin: 10px 0 0 20px; color: #666;"><strong>A:</strong> ${vars.faq_1_answer}</p>
    </div>

    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
      <p style="margin: 0;"><strong>Q:</strong> ${vars.faq_2_question}</p>
      <p style="margin: 10px 0 0 20px; color: #666;"><strong>A:</strong> ${vars.faq_2_answer}</p>
    </div>

    <p>Tomorrow, I'll show you ${vars.tomorrow_preview}.</p>

    <p>Talk soon,<br><strong>${vars.sender_name}</strong></p>
  </div>
</body>
</html>
    `,
    text: (vars) => `
Hi ${vars.first_name},

How did your first experience with ${vars.app_name} go yesterday?

If you haven't had a chance to ${vars.core_action} yet, no worries! Life gets busy.

🎯 TODAY'S FOCUS: ${vars.day_1_goal}

Here's exactly how to do it:
1. ${vars.step_1}
2. ${vars.step_2}
3. ${vars.step_3}

⏰ This takes about ${vars.time_estimate} and will ${vars.expected_result}.

💡 PRO TIP FROM OUR COMMUNITY:
"${vars.user_tip}"
— ${vars.user_name}, ${vars.user_title}

${vars.cta_text}: ${vars.cta_url}

STUCK ON SOMETHING?

Q: ${vars.faq_1_question}
A: ${vars.faq_1_answer}

Q: ${vars.faq_2_question}
A: ${vars.faq_2_answer}

Tomorrow, I'll show you ${vars.tomorrow_preview}.

Talk soon,
${vars.sender_name}
    `.trim(),
    delay_hours: 24 // 1 day after email 1
  },

  // Add email3, email4, email5 following same pattern...
  // (Truncated for brevity - full implementation would include all 5 emails)
};

module.exports = { welcomeSequence };
```

#### **2. Email Sequence Scheduler**

Create file: `functions/email-sequence-scheduler.js`

```javascript
/**
 * Email Sequence Scheduler
 * Runs on Supabase Edge Function cron job (daily)
 * Sends scheduled emails based on sequence logic
 */

const { createClient } = require('@supabase/supabase-js');
const EmailProvider = require('./lib/email-provider');
const { welcomeSequence } = require('./email-templates/welcome-sequence-html');

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

    // Process each sequence type
    await processWelcomeSequence();
    // await processLaunchSequence();
    // await processRetentionSequence();

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: 'Email sequences processed' })
    };
  } catch (error) {
    console.error('Scheduler error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

/**
 * Process welcome sequence
 */
async function processWelcomeSequence() {
  // Get users who need welcome emails
  const emailsToSend = [
    { number: 1, delayHours: 0 },      // Immediate
    { number: 2, delayHours: 24 },     // Day 1
    { number: 3, delayHours: 72 },     // Day 3
    { number: 4, delayHours: 168 },    // Day 7
    { number: 5, delayHours: 336 }     // Day 14
  ];

  for (const { number, delayHours } of emailsToSend) {
    await sendWelcomeEmail(number, delayHours);
  }
}

/**
 * Send specific welcome email
 */
async function sendWelcomeEmail(emailNumber, delayHours) {
  try {
    // Query users who need this email
    const { data: users, error } = await supabase.rpc('get_users_needing_email', {
      p_sequence_type: 'welcome',
      p_email_number: emailNumber,
      p_delay_hours: delayHours
    });

    if (error) {
      console.error(`Error fetching users for welcome email ${emailNumber}:`, error);
      return;
    }

    console.log(`Found ${users?.length || 0} users needing welcome email ${emailNumber}`);

    // Send email to each user
    for (const user of users || []) {
      await sendEmailToUser(user, 'welcome', emailNumber);
    }
  } catch (error) {
    console.error(`Error processing welcome email ${emailNumber}:`, error);
  }
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
      return;
    }

    // Prepare template variables (FINDERR-specific)
    const variables = {
      app_name: 'FINDERR',
      first_name: user.first_name || 'there',
      sender_name: 'The FINDERR Team',
      sender_title: 'Support Team',
      company_name: 'UNTRAPD',
      user_count: '5,000',
      primary_benefit: 'secure their lost or stolen Android phones',
      core_value_1: 'privacy',
      core_value_2: 'security',
      core_value_3: 'reliability',
      immediate_action: 'Download FINDERR and set up emergency contacts',
      day_1_expectation: 'Test emergency activation via SMS',
      week_1_expectation: 'Master all emergency features',
      quick_start_tip: 'Test emergency mode in a safe environment first',
      tip_benefit: 'ensure you know exactly how it works when you need it',
      cta_url: 'https://play.google.com/apps/testing/com.finderr.app',
      cta_text: 'Open FINDERR',
      ps_message: 'Early beta testers get 50% lifetime discount when we launch!',

      // Email 2 specific
      core_action: 'test emergency activation',
      day_1_goal: 'Activate Emergency Mode',
      step_1: 'Send SMS "FINDERR_ON" to your phone',
      step_2: 'Check lockscreen for emergency wallpaper',
      step_3: 'Send "FINDERR_OFF" to restore',
      time_estimate: '5 minutes',
      expected_result: 'confirm emergency system works perfectly',
      user_tip: 'Test with airplane mode on first to avoid accidental emergency alerts!',
      user_name: 'Sarah M.',
      user_title: 'Beta Tester',
      faq_1_question: 'How do I activate emergency mode?',
      faq_1_answer: 'Send SMS "FINDERR_ON" or use web dashboard',
      faq_2_question: 'Will my wallpaper be saved?',
      faq_2_answer: 'Yes! FINDERR automatically backs up and restores your original wallpaper',
      tomorrow_preview: 'how to customize your emergency wallpaper'
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
    } else {
      console.error(`❌ Failed to send email to ${user.email}:`, result.error);
    }
  } catch (error) {
    console.error(`Error sending email to ${user.email}:`, error);
  }
}
```

#### **3. Helper SQL Functions for Scheduler**

Create file: `supabase/migrations/add_email_scheduler_functions.sql`

```sql
-- Function to get users needing specific email in sequence
CREATE OR REPLACE FUNCTION get_users_needing_email(
  p_sequence_type TEXT,
  p_email_number INTEGER,
  p_delay_hours INTEGER
)
RETURNS TABLE(
  id UUID,
  email TEXT,
  first_name TEXT,
  signup_date TIMESTAMPTZ,
  last_email_sent TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    bu.id,
    bu.email,
    bu.first_name,
    bu.signup_date,
    bu.last_email_sent
  FROM beta_users bu
  WHERE bu.status = 'subscribed'
    -- User signed up at least delay_hours ago
    AND bu.signup_date <= NOW() - INTERVAL '1 hour' * p_delay_hours
    -- User hasn't already received this email
    AND NOT EXISTS (
      SELECT 1 FROM email_sends es
      JOIN email_campaigns ec ON es.campaign_id = ec.id
      WHERE es.user_id = bu.id
        AND ec.sequence_type = p_sequence_type
        AND ec.email_number = p_email_number
    )
    -- If not first email (number > 1), check previous email was sent
    AND (
      p_email_number = 1
      OR EXISTS (
        SELECT 1 FROM email_sends es
        JOIN email_campaigns ec ON es.campaign_id = ec.id
        WHERE es.user_id = bu.id
          AND ec.sequence_type = p_sequence_type
          AND ec.email_number = p_email_number - 1
          AND es.status IN ('sent', 'delivered', 'opened', 'clicked')
      )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### **Success Criteria**
- ✅ All 3 email sequences converted to HTML (welcome, launch, retention)
- ✅ Email scheduler logic implemented
- ✅ Template variables mapped to FINDERR context
- ✅ SQL helper functions for sequence logic
- ✅ Scheduler tested with test email addresses

---

## 🔄 Integration & Testing Phase

### **Post-Agent Completion: Integration Checklist**

After all 3 agents complete their missions:

#### **1. Deploy Supabase Migration**
```bash
# Run Agent Alpha's migration
supabase db push

# Or manually via Supabase dashboard SQL editor
```

#### **2. Install NPM Dependencies**
```bash
npm install @supabase/supabase-js resend sib-api-v3-sdk
```

#### **3. Configure Netlify Environment Variables**
- Go to Netlify Dashboard → Site settings → Environment variables
- Add all variables from `ENVIRONMENT_VARIABLES_EMAIL.md`

#### **4. Deploy Netlify Functions**
```bash
# Functions automatically deploy with next git push
git add functions/
git commit -m "Add FREE email infrastructure (Resend + Brevo ready)"
git push origin main
```

#### **5. Test Email Flow**

**Test Signup**:
```bash
curl -X POST https://hub.untrapd.com/.netlify/functions/beta-signup-supabase \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "firstName": "Test",
    "deviceType": "android-samsung",
    "interest": "security-rls",
    "source": "test-signup"
  }'
```

**Expected Result**:
```json
{
  "success": true,
  "message": "Successfully subscribed to FINDERR beta",
  "user_id": "uuid-here",
  "email_sent": true,
  "provider": "resend"
}
```

#### **6. Verify Database**
```sql
-- Check user was created
SELECT * FROM beta_users WHERE email = 'test@example.com';

-- Check welcome email was sent
SELECT * FROM email_sends WHERE user_id = (
  SELECT id FROM beta_users WHERE email = 'test@example.com'
);

-- Check analytics event
SELECT * FROM analytics_events WHERE user_email = 'test@example.com';
```

#### **7. Setup Email Scheduler**

Option A: Netlify Scheduled Functions (Recommended)
```javascript
// Add to netlify.toml
[[functions]]
  directory = "functions/"

[[plugins]]
  package = "@netlify/plugin-functions-core"

# Schedule email-sequence-scheduler to run daily at 10 AM
```

Option B: Supabase pg_cron
```sql
SELECT cron.schedule(
  'send-email-sequences',
  '0 10 * * *', -- 10 AM daily
  $$
  SELECT net.http_post(
    url := 'https://hub.untrapd.com/.netlify/functions/email-sequence-scheduler',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);
```

---

## 📊 Success Metrics

**Infrastructure is READY when**:
- ✅ 4 Supabase tables created and accessible
- ✅ RLS policies applied and tested
- ✅ Email provider abstraction supports Resend + Brevo
- ✅ Beta signup function working end-to-end
- ✅ Welcome email sending successfully
- ✅ Email tracking (opens/clicks) functional
- ✅ Email scheduler logic tested
- ✅ 3 email sequences ready (welcome/launch/retention)

**Cost Verification**:
- ✅ Supabase: FREE tier (500MB database)
- ✅ Resend: FREE tier (3,000 emails/month)
- ✅ Netlify Functions: FREE tier (125K requests/month)
- ✅ **Total Cost: $0/month**

**Migration Readiness**:
- ✅ Switch to Brevo: Change `EMAIL_PROVIDER=brevo` + add `BREVO_API_KEY`
- ✅ Zero code changes required (abstraction layer)
- ✅ Brevo gets 9,000 emails/month FREE (3x Resend limit)

---

## 🚀 Next Steps After Infrastructure Complete

1. **Update Landing Pages**: Point EN/FR forms to new Supabase endpoint
2. **Test Campaign**: Send test emails to verify sequences
3. **Monitor Deliverability**: Check Resend dashboard for bounce/complaint rates
4. **Scale Plan**: If approaching 3,000 emails/month, switch to Brevo
5. **Advanced Features**: Add unsubscribe handling, A/B testing, segmentation

---

## 📞 Agent Coordination

**Communication Protocol**:
- Each agent works independently in parallel
- No file conflicts (separate directories)
- Integration happens AFTER all agents complete
- Testing coordinator validates combined system

**Estimated Timeline**:
- Agent Alpha: 20 minutes (database)
- Agent Beta: 25 minutes (email integration)
- Agent Gamma: 25 minutes (templates)
- **Total Parallel Time: 25 minutes**
- Integration & Testing: 15 minutes
- **Grand Total: 40 minutes** (vs 85 minutes sequential)

---

**🎉 Ready for SuperClaude Army Deployment!**

**Deployment Command**: Deploy 3 agents in parallel for FREE email infrastructure build
