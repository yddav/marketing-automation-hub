# FINDERR API Endpoints

**Real-time subscriber statistics, milestone tracking, and webhook automation for FINDERR phone security app.**

## Overview

This API system provides three core endpoints for tracking FINDERR's Android subscription business ($6.99/month, $69.99/year):

1. **`/stats`** - Real-time subscriber metrics and revenue tracking
2. **`/milestones`** - Milestone progress tracking and celebration automation
3. **`/webhooks`** - Event-driven automation for subscription lifecycle

## Architecture

```
┌─────────────────┐
│ FINDERR App     │
│ (Flutter/Dart)  │
└────────┬────────┘
         │ Webhooks
         ▼
┌─────────────────────────────┐
│ api/finderr/webhooks.js     │
│ • subscription-created      │
│ • subscription-cancelled    │
│ • trial-started             │
│ • milestone-reached         │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Supabase Database           │
│ • finderr_subscriptions     │
│ • finderr_milestones        │
│ • finderr_webhook_logs      │
│ • finderr_churn_analytics   │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ api/finderr/stats.js        │
│ api/finderr/milestones.js   │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Social Media Automation     │
│ automation/social_media/    │
│ untrapd-hub-launcher.js     │
└─────────────────────────────┘
```

## API Endpoints

### 1. Stats API - `/api/finderr/stats`

**Purpose**: Provides real-time subscriber statistics and revenue metrics.

**Method**: `GET`

**Response**:
```json
{
  "success": true,
  "data": {
    "totalSubscribers": 847,
    "monthlySubscribers": 623,
    "annualSubscribers": 224,
    "mrr": 4356.77,
    "arr": 52281.24,
    "freeTrials": 142,
    "activeUsers": 989,
    "churnRate": 4.2,
    "lastUpdated": "2025-01-14T10:30:00.000Z"
  },
  "mode": "production"
}
```

**Use Cases**:
- Analytics dashboards
- Revenue reporting
- Investor metrics
- Social media content ("847 users trust FINDERR!")

---

### 2. Milestones API - `/api/finderr/milestones`

**Purpose**: Tracks subscriber milestones and provides celebration messages.

**Method**: `GET`

**Response**:
```json
{
  "success": true,
  "data": {
    "currentSubscribers": 847,
    "currentMilestone": 500,
    "nextMilestone": 1000,
    "progressPercentage": 69.4,
    "milestonesReached": [100, 500],
    "justReached": null,
    "celebrationMessage": "On track to 1000 subscribers!",
    "socialMediaReady": false
  },
  "mode": "production"
}
```

**Milestone Thresholds**:
- 100, 500, 1K, 2.5K, 5K, 10K, 25K, 50K, 100K subscribers

**Social Media Integration**:
When `socialMediaReady: true`, the system automatically triggers social posts with `celebrationMessage`.

---

### 3. Webhooks API - `/api/finderr/webhooks`

**Purpose**: Receives real-time subscription events from FINDERR app.

**Method**: `POST`

**Authentication**: HMAC-SHA256 signature in `X-Webhook-Signature` header

**Supported Events**:

#### Subscription Created
```json
{
  "eventType": "subscription-created",
  "userId": "uuid-here",
  "subscriptionType": "monthly",
  "amount": 6.99,
  "platform": "android"
}
```

#### Subscription Cancelled
```json
{
  "eventType": "subscription-cancelled",
  "userId": "uuid-here",
  "reason": "Too expensive",
  "cancelledAt": "2025-01-14T10:30:00Z"
}
```

#### Trial Started
```json
{
  "eventType": "trial-started",
  "userId": "uuid-here",
  "trialEndsAt": "2025-01-21T10:30:00Z"
}
```

#### Milestone Reached
```json
{
  "eventType": "milestone-reached",
  "milestone": 1000,
  "subscriberCount": 1000,
  "message": "🎉 FINDERR just hit 1,000 subscribers!"
}
```

---

## Database Schema

### Required Supabase Tables

**finderr_subscriptions**
```sql
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
```

**finderr_milestones**
```sql
CREATE TABLE finderr_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  milestone INTEGER NOT NULL,
  subscriber_count INTEGER NOT NULL,
  reached_at TIMESTAMP DEFAULT NOW(),
  social_post_sent BOOLEAN DEFAULT FALSE,
  UNIQUE(milestone)
);
```

**finderr_webhook_logs**
```sql
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
```

**finderr_churn_analytics**
```sql
CREATE TABLE finderr_churn_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  reason TEXT,
  cancelled_at TIMESTAMP DEFAULT NOW()
);
```

---

## Installation & Setup

### 1. Install Dependencies

```bash
npm install @supabase/supabase-js
```

### 2. Set Environment Variables

Create `.env` file or configure in Netlify:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key

# Webhook Security
WEBHOOK_SECRET=your-shared-secret-key

# Automation Integration
AUTOMATION_WEBHOOK_URL=https://your-site.netlify.app/.netlify/functions/social-post-trigger

# Environment
NODE_ENV=production
```

### 3. Deploy to Netlify

```bash
# Deploy functions
netlify deploy --prod

# Verify endpoints
curl https://your-site.netlify.app/.netlify/functions/stats
curl https://your-site.netlify.app/.netlify/functions/milestones
```

### 4. Configure FINDERR App Webhooks

In your FINDERR Flutter app, configure webhook URL:

```dart
const WEBHOOK_URL = 'https://your-site.netlify.app/.netlify/functions/webhooks';
const WEBHOOK_SECRET = 'your-shared-secret-key';

// Generate signature
String generateSignature(Map<String, dynamic> payload) {
  final hmac = Hmac(sha256, utf8.encode(WEBHOOK_SECRET));
  final digest = hmac.convert(utf8.encode(jsonEncode(payload)));
  return digest.toString();
}

// Send webhook
Future<void> sendWebhook(String eventType, Map<String, dynamic> data) async {
  final payload = {'eventType': eventType, ...data};
  final signature = generateSignature(payload);

  await http.post(
    Uri.parse(WEBHOOK_URL),
    headers: {
      'Content-Type': 'application/json',
      'X-Webhook-Signature': signature,
    },
    body: jsonEncode(payload),
  );
}
```

---

## Social Media Automation Integration

### Connect to Existing Automation System

The webhooks API is designed to work with your existing social media automation:

**File**: `automation/social_media/untrapd-hub-launcher.js`

**Integration Point**:
```javascript
// Add FINDERR milestone monitoring
async function checkFINDERRMilestones() {
  const response = await fetch('https://your-site.netlify.app/.netlify/functions/milestones');
  const { data } = await response.json();

  if (data.socialMediaReady) {
    // Trigger social media post
    await postToAllPlatforms({
      message: data.celebrationMessage,
      platforms: ['twitter', 'facebook', 'instagram', 'linkedin']
    });
  }
}

// Run every 30 minutes
setInterval(checkFINDERRMilestones, 30 * 60 * 1000);
```

**Webhook Trigger** (for real-time automation):
```javascript
// In your social automation system
app.post('/social-post-trigger', async (req, res) => {
  const { type, milestone, message } = req.body;

  if (type === 'milestone') {
    await postToAllPlatforms({
      message,
      hashtags: ['#FINDERR', '#PhoneSecurity', '#Android', `#${milestone}Subscribers`]
    });
  }

  res.json({ success: true });
});
```

---

## Testing

### Local Testing

```bash
# Start Netlify dev server
netlify dev

# Test stats endpoint
curl http://localhost:8888/.netlify/functions/stats

# Test milestones endpoint
curl http://localhost:8888/.netlify/functions/milestones

# Test webhook (subscription created)
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

# Test webhook (milestone reached)
curl -X POST http://localhost:8888/.netlify/functions/webhooks \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "milestone-reached",
    "milestone": 1000,
    "subscriberCount": 1000,
    "message": "🎉 FINDERR just hit 1,000 subscribers!"
  }'
```

### Mock Data Mode

All endpoints automatically use mock data when `SUPABASE_URL` is not configured:

```javascript
// Mock data automatically returned
{
  totalSubscribers: 847,
  monthlySubscribers: 623,
  annualSubscribers: 224,
  // ... etc
}
```

---

## Production Checklist

- [ ] Configure Supabase environment variables
- [ ] Create all required database tables
- [ ] Set up webhook secret key
- [ ] Deploy Netlify functions
- [ ] Configure FINDERR app webhook endpoint
- [ ] Test webhook signature verification
- [ ] Set up social media automation trigger URL
- [ ] Configure milestone monitoring (30-minute intervals)
- [ ] Set up analytics dashboard to consume stats API
- [ ] Enable webhook logging for debugging

---

## Security Considerations

### Webhook Signature Verification
All webhooks MUST include `X-Webhook-Signature` header with HMAC-SHA256 signature:

```javascript
// Generate signature (FINDERR app side)
const signature = crypto
  .createHmac('sha256', WEBHOOK_SECRET)
  .update(JSON.stringify(payload))
  .digest('hex');
```

### Rate Limiting
Consider implementing rate limiting for webhook endpoints:

```javascript
// Example rate limit: 100 requests per minute per IP
const rateLimit = new Map();
```

### Environment Variables
NEVER commit secrets to version control. Use Netlify environment variables.

---

## Monitoring & Debugging

### Webhook Logs

Query webhook logs in Supabase:

```sql
-- Recent webhook events
SELECT * FROM finderr_webhook_logs
ORDER BY received_at DESC
LIMIT 100;

-- Failed webhooks
SELECT * FROM finderr_webhook_logs
WHERE status IN ('rejected', 'error')
ORDER BY received_at DESC;

-- Event type breakdown
SELECT event_type, COUNT(*),
       COUNT(*) FILTER (WHERE status = 'success') as successful
FROM finderr_webhook_logs
GROUP BY event_type;
```

### Netlify Function Logs

```bash
# View live logs
netlify functions:log

# View specific function
netlify functions:log --name=webhooks
```

---

## Next Steps

### Immediate Integration Tasks (Agent B)

1. **Connect to Supabase Database** (15 minutes)
   - Configure environment variables
   - Create database tables
   - Test connection

2. **Integrate with Social Media Automation** (30 minutes)
   - Modify `untrapd-hub-launcher.js`
   - Add milestone monitoring
   - Test automated posting

3. **Deploy to Production** (15 minutes)
   - Deploy Netlify functions
   - Configure FINDERR app webhooks
   - Validate end-to-end flow

### Future Enhancements

- [ ] Advanced analytics dashboard
- [ ] Email notifications for milestones
- [ ] Churn prediction analytics
- [ ] A/B test tracking integration
- [ ] Revenue forecasting models
- [ ] Subscriber retention campaigns

---

## Support & Documentation

**File Locations**:
- `/api/finderr/stats.js` - Stats endpoint implementation
- `/api/finderr/milestones.js` - Milestones endpoint implementation
- `/api/finderr/webhooks.js` - Webhook handlers implementation
- `/api/finderr/README.md` - This documentation

**Related Documentation**:
- `FINDERR_ANDROID_REVENUE_STRATEGY_2025-01-14.md` - Revenue strategy
- `FINDERR_PRODUCTION_INTEGRATION_ROADMAP.md` - Integration roadmap
- `automation/social_media/untrapd-hub-launcher.js` - Social automation

**Questions?** Refer to inline code documentation in each endpoint file.
