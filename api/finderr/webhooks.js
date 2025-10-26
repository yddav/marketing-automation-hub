/**
 * FINDERR Webhook Handlers
 *
 * Purpose: Receive subscription events from FINDERR app and trigger automation
 * Used by: Real-time event processing, social media automation, analytics tracking
 *
 * Environment Variables Required:
 * - SUPABASE_URL: Your Supabase project URL
 * - SUPABASE_KEY: Your Supabase service role key
 * - WEBHOOK_SECRET: Shared secret for webhook authentication
 * - AUTOMATION_WEBHOOK_URL: URL to trigger social media automation
 * - NODE_ENV: 'production' or 'development'
 *
 * Webhook Events:
 * - subscription-created: New paid subscriber
 * - subscription-cancelled: User cancels subscription
 * - trial-started: User starts free trial
 * - milestone-reached: Subscriber count reaches milestone
 */

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

// Initialize Supabase client
let supabase = null;
if (process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
  supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
  );
}

/**
 * Verify webhook signature for security
 */
function verifyWebhookSignature(payload, signature, secret) {
  if (!secret) {
    console.warn('⚠️  WEBHOOK_SECRET not configured, skipping signature verification');
    return true; // Allow in development mode
  }

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * Log webhook event to database
 */
async function logWebhookEvent(eventType, payload, status, error = null) {
  if (!supabase) return;

  try {
    await supabase
      .from('finderr_webhook_logs')
      .insert({
        event_type: eventType,
        payload,
        status,
        error_message: error,
        received_at: new Date().toISOString()
      });
  } catch (err) {
    console.error('Failed to log webhook event:', err);
  }
}

/**
 * Trigger social media automation
 */
async function triggerSocialMediaPost(postData) {
  const automationUrl = process.env.AUTOMATION_WEBHOOK_URL;

  if (!automationUrl) {
    console.warn('⚠️  AUTOMATION_WEBHOOK_URL not configured, skipping social post');
    return { success: false, message: 'Automation URL not configured' };
  }

  try {
    const response = await fetch(automationUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postData)
    });

    const result = await response.json();

    console.log('✅ Social media automation triggered:', result);
    return { success: true, result };

  } catch (error) {
    console.error('❌ Failed to trigger social media automation:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Handle subscription-created webhook
 */
async function handleSubscriptionCreated(payload) {
  const { userId, subscriptionType, amount, platform } = payload;

  console.log('📱 New subscription created:', { userId, subscriptionType, platform });

  // Record subscription in database
  if (supabase) {
    await supabase
      .from('finderr_subscriptions')
      .insert({
        user_id: userId,
        subscription_type: subscriptionType,
        status: 'active',
        amount,
        platform: platform || 'android',
        created_at: new Date().toISOString()
      });
  }

  // Check for milestone reach
  if (supabase) {
    const { count } = await supabase
      .from('finderr_subscriptions')
      .select('id', { count: 'exact', head: true })
      .in('status', ['active', 'trial']);

    // Milestone thresholds
    const milestones = [100, 500, 1000, 2500, 5000, 10000];
    if (milestones.includes(count)) {
      console.log(`🎉 MILESTONE REACHED: ${count} subscribers!`);

      await triggerSocialMediaPost({
        type: 'milestone',
        milestone: count,
        message: `🎉 FINDERR just hit ${count} subscribers! Thank you for trusting us with your phone security!`
      });
    }
  }

  return {
    success: true,
    message: 'Subscription created successfully',
    userId
  };
}

/**
 * Handle subscription-cancelled webhook
 */
async function handleSubscriptionCancelled(payload) {
  const { userId, reason, cancelledAt } = payload;

  console.log('❌ Subscription cancelled:', { userId, reason });

  // Update subscription status in database
  if (supabase) {
    await supabase
      .from('finderr_subscriptions')
      .update({
        status: 'cancelled',
        cancelled_at: cancelledAt || new Date().toISOString(),
        cancellation_reason: reason
      })
      .eq('user_id', userId);
  }

  // Track churn analytics
  if (supabase) {
    await supabase
      .from('finderr_churn_analytics')
      .insert({
        user_id: userId,
        reason,
        cancelled_at: cancelledAt || new Date().toISOString()
      });
  }

  return {
    success: true,
    message: 'Subscription cancellation recorded',
    userId
  };
}

/**
 * Handle trial-started webhook
 */
async function handleTrialStarted(payload) {
  const { userId, trialEndsAt } = payload;

  console.log('🎁 Free trial started:', { userId, trialEndsAt });

  // Record trial in database
  if (supabase) {
    await supabase
      .from('finderr_subscriptions')
      .insert({
        user_id: userId,
        subscription_type: 'trial',
        status: 'trial',
        amount: 0,
        created_at: new Date().toISOString(),
        trial_ends_at: trialEndsAt
      });
  }

  return {
    success: true,
    message: 'Trial started successfully',
    userId
  };
}

/**
 * Handle milestone-reached webhook
 */
async function handleMilestoneReached(payload) {
  const { milestone, subscriberCount, message } = payload;

  console.log(`🎯 Milestone webhook received: ${milestone} subscribers!`);

  // Record milestone in database
  if (supabase) {
    await supabase
      .from('finderr_milestones')
      .upsert({
        milestone,
        subscriber_count: subscriberCount,
        reached_at: new Date().toISOString()
      }, {
        onConflict: 'milestone'
      });
  }

  // Trigger social media post
  await triggerSocialMediaPost({
    type: 'milestone',
    milestone,
    subscriberCount,
    message: message || `🎉 FINDERR just hit ${milestone} subscribers!`
  });

  return {
    success: true,
    message: `Milestone ${milestone} processed and social post triggered`,
    milestone
  };
}

/**
 * Netlify Function Handler
 */
exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Webhook-Signature',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse request body
    const payload = JSON.parse(event.body);
    const { eventType } = payload;

    // Verify webhook signature
    const signature = event.headers['x-webhook-signature'];
    const secret = process.env.WEBHOOK_SECRET;

    if (!verifyWebhookSignature(payload, signature, secret)) {
      console.error('❌ Invalid webhook signature');

      await logWebhookEvent(eventType, payload, 'rejected', 'Invalid signature');

      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid webhook signature' })
      };
    }

    console.log(`📥 Webhook received: ${eventType}`);

    // Route to appropriate handler
    let result;
    switch (eventType) {
      case 'subscription-created':
        result = await handleSubscriptionCreated(payload);
        break;

      case 'subscription-cancelled':
        result = await handleSubscriptionCancelled(payload);
        break;

      case 'trial-started':
        result = await handleTrialStarted(payload);
        break;

      case 'milestone-reached':
        result = await handleMilestoneReached(payload);
        break;

      default:
        console.warn(`⚠️  Unknown event type: ${eventType}`);
        await logWebhookEvent(eventType, payload, 'unknown', 'Unknown event type');

        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Unknown event type' })
        };
    }

    // Log successful processing
    await logWebhookEvent(eventType, payload, 'success');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        eventType,
        result
      })
    };

  } catch (error) {
    console.error('Webhook processing error:', error);

    await logWebhookEvent('unknown', {}, 'error', error.message);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Failed to process webhook',
        message: error.message
      })
    };
  }
};

/**
 * Integration Instructions:
 *
 * 1. Create webhook logs table in Supabase:
 *    CREATE TABLE finderr_webhook_logs (
 *      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 *      event_type TEXT NOT NULL,
 *      payload JSONB,
 *      status TEXT CHECK (status IN ('success', 'rejected', 'error', 'unknown')),
 *      error_message TEXT,
 *      received_at TIMESTAMP DEFAULT NOW()
 *    );
 *
 * 2. Create churn analytics table:
 *    CREATE TABLE finderr_churn_analytics (
 *      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 *      user_id UUID NOT NULL,
 *      reason TEXT,
 *      cancelled_at TIMESTAMP DEFAULT NOW()
 *    );
 *
 * 3. Set environment variables in Netlify:
 *    WEBHOOK_SECRET=your-shared-secret-key
 *    AUTOMATION_WEBHOOK_URL=https://your-site.netlify.app/.netlify/functions/social-post-trigger
 *
 * 4. Configure webhook in FINDERR app:
 *    POST https://your-site.netlify.app/.netlify/functions/webhooks
 *    Headers:
 *      Content-Type: application/json
 *      X-Webhook-Signature: <HMAC-SHA256 signature>
 *
 * 5. Webhook payload examples:
 *
 *    Subscription Created:
 *    {
 *      "eventType": "subscription-created",
 *      "userId": "uuid-here",
 *      "subscriptionType": "monthly",
 *      "amount": 6.99,
 *      "platform": "android"
 *    }
 *
 *    Subscription Cancelled:
 *    {
 *      "eventType": "subscription-cancelled",
 *      "userId": "uuid-here",
 *      "reason": "Too expensive",
 *      "cancelledAt": "2025-01-14T10:30:00Z"
 *    }
 *
 *    Trial Started:
 *    {
 *      "eventType": "trial-started",
 *      "userId": "uuid-here",
 *      "trialEndsAt": "2025-01-21T10:30:00Z"
 *    }
 *
 *    Milestone Reached:
 *    {
 *      "eventType": "milestone-reached",
 *      "milestone": 1000,
 *      "subscriberCount": 1000,
 *      "message": "🎉 FINDERR just hit 1,000 subscribers!"
 *    }
 *
 * 6. Testing webhooks locally:
 *    curl -X POST http://localhost:8888/.netlify/functions/webhooks \
 *      -H "Content-Type: application/json" \
 *      -H "X-Webhook-Signature: test-signature" \
 *      -d '{"eventType":"subscription-created","userId":"test-123","subscriptionType":"monthly","amount":6.99}'
 */
