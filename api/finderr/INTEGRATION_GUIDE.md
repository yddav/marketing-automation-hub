# FINDERR API Integration Guide

**Quick guide for connecting FINDERR APIs to existing Hub automation system**

## Integration Overview

This guide connects the newly created FINDERR API endpoints with your existing social media automation system located in `automation/social_media/untrapd-hub-launcher.js`.

---

## Step 1: Install Dependencies

```bash
cd /media/wolfy/D260DD2060DD0BDB/Datas/2025\ Projects/AppBuildFlutterVscodiumClaude/Hub_App_Shop_Integ
npm install @supabase/supabase-js
```

---

## Step 2: Configure Environment Variables

Add to `.env` file:

```bash
# Supabase Configuration (FINDERR Database)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key

# Webhook Security
WEBHOOK_SECRET=generate-random-secret-key

# Environment
NODE_ENV=production
```

**Generate Webhook Secret**:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Step 3: Create Supabase Database Tables

Execute in Supabase SQL Editor:

```sql
-- Subscriptions table
CREATE TABLE finderr_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  subscription_type TEXT CHECK (subscription_type IN ('monthly', 'annual', 'trial')),
  status TEXT CHECK (status IN ('active', 'cancelled', 'trial', 'expired')),
  amount DECIMAL(10,2),
  platform TEXT DEFAULT 'android',
  created_at TIMESTAMP DEFAULT NOW(),
  cancelled_at TIMESTAMP,
  cancellation_reason TEXT,
  trial_ends_at TIMESTAMP
);

CREATE INDEX idx_subscriptions_status ON finderr_subscriptions(status);
CREATE INDEX idx_subscriptions_user ON finderr_subscriptions(user_id);

-- Milestones table
CREATE TABLE finderr_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  milestone INTEGER NOT NULL,
  subscriber_count INTEGER NOT NULL,
  reached_at TIMESTAMP DEFAULT NOW(),
  social_post_sent BOOLEAN DEFAULT FALSE,
  UNIQUE(milestone)
);

-- Webhook logs table
CREATE TABLE finderr_webhook_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  payload JSONB,
  status TEXT CHECK (status IN ('success', 'rejected', 'error', 'unknown')),
  error_message TEXT,
  received_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_webhook_logs_type ON finderr_webhook_logs(event_type);
CREATE INDEX idx_webhook_logs_received ON finderr_webhook_logs(received_at);

-- Churn analytics table
CREATE TABLE finderr_churn_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  reason TEXT,
  cancelled_at TIMESTAMP DEFAULT NOW()
);
```

---

## Step 4: Modify Existing Social Media Automation

### Option A: Add to `untrapd-hub-launcher.js`

Add FINDERR milestone monitoring to your existing automation:

```javascript
// At the top of untrapd-hub-launcher.js
const FINDERR_MILESTONES_URL = process.env.NETLIFY_URL
  ? `${process.env.NETLIFY_URL}/.netlify/functions/milestones`
  : 'http://localhost:8888/.netlify/functions/milestones';

// Add FINDERR milestone checking function
async function checkFINDERRMilestones() {
  try {
    const response = await fetch(FINDERR_MILESTONES_URL);
    const { data } = await response.json();

    // If milestone just reached, post to social media
    if (data.socialMediaReady && data.justReached) {
      console.log(`🎉 FINDERR Milestone Reached: ${data.justReached} subscribers!`);

      // Use your existing social posting function
      await postToAllPlatforms({
        message: data.celebrationMessage,
        platforms: ['twitter', 'facebook', 'instagram', 'linkedin'],
        hashtags: ['#FINDERR', '#PhoneSecurity', '#Android', `#${data.justReached}Subscribers`],
        type: 'milestone'
      });

      console.log('✅ Milestone social posts sent!');
    } else {
      console.log(`📊 FINDERR Progress: ${data.currentSubscribers} subscribers (${data.progressPercentage}% to ${data.nextMilestone})`);
    }

  } catch (error) {
    console.error('❌ Error checking FINDERR milestones:', error);
  }
}

// Add to your main automation loop
setInterval(checkFINDERRMilestones, 30 * 60 * 1000); // Check every 30 minutes

// Initial check
checkFINDERRMilestones();
```

### Option B: Create Dedicated FINDERR Monitor

Create new file: `automation/social_media/finderr-milestone-monitor.js`

```javascript
/**
 * FINDERR Milestone Monitor
 * Checks for subscriber milestones and triggers social media posts
 */

const fetch = require('node-fetch');

const MILESTONES_URL = process.env.NETLIFY_URL
  ? `${process.env.NETLIFY_URL}/.netlify/functions/milestones`
  : 'http://localhost:8888/.netlify/functions/milestones';

const STATS_URL = process.env.NETLIFY_URL
  ? `${process.env.NETLIFY_URL}/.netlify/functions/stats`
  : 'http://localhost:8888/.netlify/functions/stats';

// Import your existing social media posting function
const { postToAllPlatforms } = require('./untrapd-hub-launcher.js');

async function checkMilestones() {
  try {
    // Get milestone status
    const milestoneResponse = await fetch(MILESTONES_URL);
    const { data: milestoneData } = await milestoneResponse.json();

    // Get current stats
    const statsResponse = await fetch(STATS_URL);
    const { data: statsData } = await statsResponse.json();

    console.log(`📊 FINDERR Stats: ${statsData.totalSubscribers} subscribers, $${statsData.mrr} MRR`);

    // Check if milestone reached
    if (milestoneData.socialMediaReady && milestoneData.justReached) {
      console.log(`🎉 MILESTONE ALERT: ${milestoneData.justReached} subscribers!`);

      // Prepare social media post
      const post = {
        message: milestoneData.celebrationMessage,
        platforms: ['twitter', 'facebook', 'instagram', 'linkedin'],
        hashtags: [
          '#FINDERR',
          '#PhoneSecurity',
          '#Android',
          `#${milestoneData.justReached}Subscribers`
        ],
        type: 'milestone',
        stats: {
          totalSubscribers: statsData.totalSubscribers,
          mrr: statsData.mrr,
          activeUsers: statsData.activeUsers
        }
      };

      // Post to all platforms
      await postToAllPlatforms(post);

      console.log('✅ Milestone celebration posted to all platforms!');

    } else {
      console.log(`📈 Progress: ${milestoneData.progressPercentage}% to ${milestoneData.nextMilestone} subscribers`);
    }

  } catch (error) {
    console.error('❌ Error in milestone monitor:', error);
  }
}

// Run every 30 minutes
console.log('🚀 FINDERR Milestone Monitor started (checking every 30 minutes)');
setInterval(checkMilestones, 30 * 60 * 1000);

// Initial check
checkMilestones();

module.exports = { checkMilestones };
```

---

## Step 5: Deploy Netlify Functions

```bash
# Test locally first
netlify dev

# Test endpoints
curl http://localhost:8888/.netlify/functions/stats
curl http://localhost:8888/.netlify/functions/milestones

# Deploy to production
netlify deploy --prod

# Verify production endpoints
curl https://your-site.netlify.app/.netlify/functions/stats
curl https://your-site.netlify.app/.netlify/functions/milestones
```

---

## Step 6: Configure FINDERR App Webhooks

In your FINDERR Flutter app (`lib/services/subscription_service.dart`):

```dart
import 'dart:convert';
import 'package:crypto/crypto.dart';
import 'package:http/http.dart' as http;

class WebhookService {
  static const WEBHOOK_URL = 'https://your-site.netlify.app/.netlify/functions/webhooks';
  static const WEBHOOK_SECRET = 'your-shared-secret-key'; // Same as .env

  // Generate HMAC-SHA256 signature
  static String _generateSignature(Map<String, dynamic> payload) {
    final key = utf8.encode(WEBHOOK_SECRET);
    final bytes = utf8.encode(jsonEncode(payload));
    final hmac = Hmac(sha256, key);
    final digest = hmac.convert(bytes);
    return digest.toString();
  }

  // Send webhook
  static Future<void> sendWebhook(String eventType, Map<String, dynamic> data) async {
    final payload = {'eventType': eventType, ...data};
    final signature = _generateSignature(payload);

    try {
      final response = await http.post(
        Uri.parse(WEBHOOK_URL),
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
        },
        body: jsonEncode(payload),
      );

      if (response.statusCode == 200) {
        print('✅ Webhook sent: $eventType');
      } else {
        print('❌ Webhook failed: ${response.statusCode}');
      }
    } catch (e) {
      print('❌ Webhook error: $e');
    }
  }

  // Subscription created webhook
  static Future<void> notifySubscriptionCreated(
    String userId,
    String subscriptionType,
    double amount
  ) async {
    await sendWebhook('subscription-created', {
      'userId': userId,
      'subscriptionType': subscriptionType,
      'amount': amount,
      'platform': 'android',
    });
  }

  // Subscription cancelled webhook
  static Future<void> notifySubscriptionCancelled(
    String userId,
    String reason
  ) async {
    await sendWebhook('subscription-cancelled', {
      'userId': userId,
      'reason': reason,
      'cancelledAt': DateTime.now().toIso8601String(),
    });
  }

  // Trial started webhook
  static Future<void> notifyTrialStarted(
    String userId,
    DateTime trialEndsAt
  ) async {
    await sendWebhook('trial-started', {
      'userId': userId,
      'trialEndsAt': trialEndsAt.toIso8601String(),
    });
  }
}
```

**Integrate into purchase flow**:

```dart
// In your subscription purchase handler
Future<void> handlePurchaseSuccess(PurchaseDetails purchase) async {
  // Process purchase...

  // Send webhook notification
  await WebhookService.notifySubscriptionCreated(
    userId: currentUser.uid,
    subscriptionType: purchase.productID.contains('monthly') ? 'monthly' : 'annual',
    amount: purchase.productID.contains('monthly') ? 6.99 : 69.99,
  );
}

// In your cancellation handler
Future<void> handleCancellation(String reason) async {
  await WebhookService.notifySubscriptionCancelled(
    userId: currentUser.uid,
    reason: reason,
  );
}

// In your trial start handler
Future<void> handleTrialStart() async {
  final trialEndsAt = DateTime.now().add(Duration(days: 7));

  await WebhookService.notifyTrialStarted(
    userId: currentUser.uid,
    trialEndsAt: trialEndsAt,
  );
}
```

---

## Step 7: Test End-to-End Flow

### Test Webhook Locally

```bash
# Start local Netlify dev server
netlify dev

# In another terminal, send test webhook
curl -X POST http://localhost:8888/.netlify/functions/webhooks \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Signature: test-signature" \
  -d '{
    "eventType": "subscription-created",
    "userId": "test-user-123",
    "subscriptionType": "monthly",
    "amount": 6.99,
    "platform": "android"
  }'

# Check Supabase to verify subscription was recorded
```

### Test Milestone Detection

```bash
# Manually trigger milestone
curl -X POST http://localhost:8888/.netlify/functions/webhooks \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "milestone-reached",
    "milestone": 1000,
    "subscriberCount": 1000,
    "message": "🎉 FINDERR just hit 1,000 subscribers!"
  }'

# Check if social media posts were triggered
```

### Test Stats API

```bash
# Get current stats
curl http://localhost:8888/.netlify/functions/stats | jq

# Get milestone progress
curl http://localhost:8888/.netlify/functions/milestones | jq
```

---

## Step 8: Production Deployment

```bash
# Deploy everything
netlify deploy --prod

# Set environment variables in Netlify dashboard
# Settings > Environment variables
# - SUPABASE_URL
# - SUPABASE_KEY
# - WEBHOOK_SECRET
# - AUTOMATION_WEBHOOK_URL
# - NODE_ENV=production

# Verify production endpoints
curl https://your-site.netlify.app/.netlify/functions/stats
curl https://your-site.netlify.app/.netlify/functions/milestones
```

---

## Monitoring & Maintenance

### Check Webhook Logs

```sql
-- Recent webhook activity
SELECT
  event_type,
  status,
  received_at
FROM finderr_webhook_logs
ORDER BY received_at DESC
LIMIT 50;

-- Failed webhooks
SELECT * FROM finderr_webhook_logs
WHERE status IN ('rejected', 'error')
ORDER BY received_at DESC;
```

### Monitor Milestone Progress

```sql
-- All reached milestones
SELECT * FROM finderr_milestones
ORDER BY milestone DESC;

-- Current subscriber count
SELECT COUNT(*) FROM finderr_subscriptions
WHERE status IN ('active', 'trial');
```

### Netlify Function Logs

```bash
# View live logs
netlify functions:log

# View specific function
netlify functions:log --name=webhooks
```

---

## Troubleshooting

### Issue: Webhooks not received

**Check**:
1. Webhook URL is correct in FINDERR app
2. Webhook secret matches between app and server
3. Network connectivity from FINDERR app to Netlify
4. Check Netlify function logs: `netlify functions:log --name=webhooks`

### Issue: Social media posts not triggered

**Check**:
1. `AUTOMATION_WEBHOOK_URL` is configured correctly
2. `untrapd-hub-launcher.js` is running
3. Check milestone monitor logs
4. Verify `socialMediaReady` flag is true in API response

### Issue: Stats showing wrong data

**Check**:
1. Supabase connection is working
2. Environment variables are set correctly
3. Database tables exist and have data
4. Check for SQL query errors in Netlify logs

---

## Next Steps

1. **Deploy to production** - Follow Step 8
2. **Test with real FINDERR app** - Implement webhooks in Flutter
3. **Monitor for first milestone** - Watch for 100 subscribers
4. **Set up analytics dashboard** - Consume stats API
5. **Configure email alerts** - Notify on milestones

---

## Support Files

- `/api/finderr/stats.js` - Stats endpoint
- `/api/finderr/milestones.js` - Milestones endpoint
- `/api/finderr/webhooks.js` - Webhook handlers
- `/api/finderr/README.md` - Complete API documentation
- `automation/social_media/untrapd-hub-launcher.js` - Social automation
