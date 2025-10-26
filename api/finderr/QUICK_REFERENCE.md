# FINDERR API Quick Reference

**Fast reference for FINDERR API endpoints**

---

## Endpoints

### Stats API
```
GET /.netlify/functions/stats
```

**Response**:
```json
{
  "totalSubscribers": 847,
  "monthlySubscribers": 623,
  "annualSubscribers": 224,
  "mrr": 4356.77,
  "arr": 52281.24,
  "freeTrials": 142,
  "activeUsers": 989,
  "churnRate": 4.2
}
```

---

### Milestones API
```
GET /.netlify/functions/milestones
```

**Response**:
```json
{
  "currentSubscribers": 847,
  "nextMilestone": 1000,
  "progressPercentage": 69.4,
  "celebrationMessage": "On track to 1000 subscribers!",
  "socialMediaReady": false
}
```

---

### Webhooks API
```
POST /.netlify/functions/webhooks
Headers:
  Content-Type: application/json
  X-Webhook-Signature: <HMAC-SHA256 signature>
```

**Events**:
- `subscription-created`
- `subscription-cancelled`
- `trial-started`
- `milestone-reached`

---

## Environment Variables

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key
WEBHOOK_SECRET=your-shared-secret
NODE_ENV=production
```

---

## Database Tables

```sql
finderr_subscriptions     # Subscriber data
finderr_milestones        # Milestone tracking
finderr_webhook_logs      # Event logs
finderr_churn_analytics   # Cancellation reasons
```

---

## Testing

```bash
# Local dev server
netlify dev

# Test stats
curl http://localhost:8888/.netlify/functions/stats

# Test milestones
curl http://localhost:8888/.netlify/functions/milestones

# Test webhook
curl -X POST http://localhost:8888/.netlify/functions/webhooks \
  -H "Content-Type: application/json" \
  -d '{"eventType":"subscription-created","userId":"test","subscriptionType":"monthly","amount":6.99}'
```

---

## Deployment

```bash
# Deploy to production
netlify deploy --prod

# View logs
netlify functions:log
```

---

## Social Media Integration

```javascript
// Add to untrapd-hub-launcher.js
async function checkFINDERRMilestones() {
  const response = await fetch(MILESTONES_URL);
  const { data } = await response.json();

  if (data.socialMediaReady) {
    await postToAllPlatforms({
      message: data.celebrationMessage,
      platforms: ['twitter', 'facebook', 'instagram', 'linkedin']
    });
  }
}

// Check every 30 minutes
setInterval(checkFINDERRMilestones, 30 * 60 * 1000);
```

---

## Complete Documentation

- **API Reference**: `/api/finderr/README.md`
- **Integration Guide**: `/api/finderr/INTEGRATION_GUIDE.md`
- **Completion Report**: `/FINDERR_API_COMPLETION_REPORT.md`

---

## Support

**File Locations**:
- `/api/finderr/stats.js`
- `/api/finderr/milestones.js`
- `/api/finderr/webhooks.js`

**Next Steps**: See `INTEGRATION_GUIDE.md` for step-by-step setup
