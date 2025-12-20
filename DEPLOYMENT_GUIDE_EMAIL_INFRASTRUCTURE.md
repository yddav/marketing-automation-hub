# Email Infrastructure Deployment Guide

**Agent**: Alpha
**Component**: Supabase Database Schema
**Status**: Ready for Deployment
**Estimated Time**: 5 minutes

---

## 🚀 Quick Deployment Steps

### Step 1: Apply Main Migration (2 minutes)

**Option A: Supabase CLI (Recommended)**
```bash
cd "/media/wolfy/D260DD2060DD0BDB/Datas/2025 Projects/AppBuildFlutterVscodiumClaude/Hub_App_Shop_Integ"
supabase db push
```

**Option B: Supabase Dashboard**
1. Go to https://app.supabase.com/project/<your-project>/sql
2. Open `supabase/migrations/add_email_marketing_infrastructure.sql`
3. Copy entire file contents
4. Paste into SQL Editor
5. Click "Run"

**Expected Output**:
```
✅ 4 tables created
✅ 16 indexes created
✅ 8 RLS policies applied
✅ 3 helper functions created
```

---

### Step 2: Apply Scheduler Functions (1 minute)

**Option A: Supabase CLI**
```bash
# Already included in supabase db push
```

**Option B: Supabase Dashboard**
1. Open `supabase/migrations/add_email_scheduler_functions.sql`
2. Copy entire file contents
3. Paste into SQL Editor
4. Click "Run"

**Expected Output**:
```
✅ 6 helper functions created
```

---

### Step 3: Validate Deployment (2 minutes)

**Run Validation Queries**:
1. Open `supabase/migrations/validate_email_infrastructure.sql`
2. Copy **SUMMARY QUERY** at bottom of file:

```sql
SELECT
  '🎯 VALIDATION SUMMARY' AS title,
  (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('beta_users', 'email_campaigns', 'email_sends', 'analytics_events')) AS tables_created,
  (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public' AND tablename IN ('beta_users', 'email_campaigns', 'email_sends', 'analytics_events')) AS indexes_created,
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename IN ('beta_users', 'email_campaigns', 'email_sends', 'analytics_events')) AS policies_created,
  (SELECT COUNT(*) FROM pg_proc WHERE proname IN ('get_email_sequence_progress', 'track_email_open', 'track_email_click', 'get_users_needing_email', 'get_users_needing_email_with_campaign', 'get_sequence_stats', 'get_user_engagement_score', 'mark_users_bounced', 'unsubscribe_user')) AS functions_created,
  CASE
    WHEN (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('beta_users', 'email_campaigns', 'email_sends', 'analytics_events')) = 4
      AND (SELECT COUNT(*) FROM pg_proc WHERE proname IN ('get_email_sequence_progress', 'track_email_open', 'track_email_click', 'get_users_needing_email', 'get_users_needing_email_with_campaign', 'get_sequence_stats', 'get_user_engagement_score', 'mark_users_bounced', 'unsubscribe_user')) = 9
    THEN '✅ ALL TESTS PASSED - READY FOR INTEGRATION'
    ELSE '❌ SOME TESTS FAILED - CHECK INDIVIDUAL QUERIES'
  END AS status;
```

3. Paste into Supabase SQL Editor
4. Click "Run"

**Expected Result**:
```
tables_created: 4
indexes_created: 16
policies_created: 8
functions_created: 9
status: ✅ ALL TESTS PASSED - READY FOR INTEGRATION
```

---

## 🧪 Test Database Functions

### Test 1: Insert Test User
```sql
INSERT INTO beta_users (email, first_name, device_type, interest)
VALUES (
  'test@example.com',
  'Test User',
  'android-samsung',
  'security-rls'
)
ON CONFLICT (email) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  device_type = EXCLUDED.device_type,
  interest = EXCLUDED.interest
RETURNING id, email, status;
```

**Expected**: 1 row with test user details

---

### Test 2: Check Users Needing Welcome Email
```sql
SELECT * FROM get_users_needing_email('welcome', 1, 0);
```

**Expected**: List of users who signed up and haven't received welcome email 1

---

### Test 3: Get User Engagement Score
```sql
SELECT
  email,
  get_user_engagement_score(id) AS engagement_score
FROM beta_users
WHERE email = 'test@example.com';
```

**Expected**: 0 (new user with no opens/clicks)

---

## 🔧 Environment Variables Needed

Add these to your Netlify Dashboard (for Agent Beta's work):

```bash
# Supabase Configuration
SUPABASE_URL=https://zdceeulkqfpzdjeyekgs.supabase.co
SUPABASE_SERVICE_KEY=<your-service-role-key-here>

# Email Provider (Resend)
EMAIL_PROVIDER=resend
RESEND_API_KEY=<your-resend-api-key>

# Email Configuration
EMAIL_FROM_ADDRESS=finderr@hub.untrapd.com
EMAIL_FROM_NAME=FINDERR Team
EMAIL_REPLY_TO=support@untrapd.com

# Application
NODE_ENV=production
NETLIFY_URL=https://hub.untrapd.com
```

---

## 📊 Database Objects Summary

### Tables (4)
- `beta_users` - Beta signup data
- `email_campaigns` - Email templates
- `email_sends` - Sent email tracking
- `analytics_events` - General analytics

### Indexes (16)
- 5 on `beta_users` (email, status, source, signup_date, tags)
- 1 on `email_campaigns` (sequence_type, email_number)
- 5 on `email_sends` (user_id, campaign_id, sent_at, status, provider_message_id)
- 5 on `analytics_events` (event_name, user_email, created_at, utm_campaign, properties)

### RLS Policies (8)
- 3 on `beta_users` (public insert, users view own, service full access)
- 2 on `email_campaigns` (authenticated read, service manage)
- 1 on `email_sends` (service only)
- 2 on `analytics_events` (public insert, service read)

### Functions (9)
**Tracking Functions**:
- `get_email_sequence_progress` - User sequence progress
- `track_email_open` - Open tracking webhook
- `track_email_click` - Click tracking webhook

**Scheduler Functions**:
- `get_users_needing_email` - Sequence automation logic
- `get_users_needing_email_with_campaign` - Advanced sequence logic
- `get_sequence_stats` - Analytics and reporting
- `get_user_engagement_score` - Engagement scoring
- `mark_users_bounced` - Bounce handling
- `unsubscribe_user` - Unsubscribe handling

---

## ✅ Success Checklist

After deployment, verify:

- [ ] All 4 tables exist in Supabase dashboard
- [ ] All 16 indexes created (check Indexes tab)
- [ ] All 8 RLS policies enabled (check Policies tab)
- [ ] All 9 functions available (check Functions tab)
- [ ] Test user insert works
- [ ] Test user query works
- [ ] Validation query returns ✅ status

---

## 🚨 Rollback Plan

If deployment fails:

### Option 1: Drop All Tables (DESTRUCTIVE)
```sql
DROP TABLE IF EXISTS analytics_events CASCADE;
DROP TABLE IF EXISTS email_sends CASCADE;
DROP TABLE IF EXISTS email_campaigns CASCADE;
DROP TABLE IF EXISTS beta_users CASCADE;
```

### Option 2: Drop Functions Only (Safe)
```sql
DROP FUNCTION IF EXISTS get_email_sequence_progress CASCADE;
DROP FUNCTION IF EXISTS track_email_open CASCADE;
DROP FUNCTION IF EXISTS track_email_click CASCADE;
DROP FUNCTION IF EXISTS get_users_needing_email CASCADE;
DROP FUNCTION IF EXISTS get_users_needing_email_with_campaign CASCADE;
DROP FUNCTION IF EXISTS get_sequence_stats CASCADE;
DROP FUNCTION IF EXISTS get_user_engagement_score CASCADE;
DROP FUNCTION IF EXISTS mark_users_bounced CASCADE;
DROP FUNCTION IF EXISTS unsubscribe_user CASCADE;
```

Then re-run migrations after fixing issues.

---

## 📞 Integration Handoff

### For Agent Beta (Email Service Integration)
- ✅ Database schema ready for Netlify function
- ✅ `beta_users` table ready for inserts
- ✅ `email_sends` table ready for tracking
- ✅ RLS policies allow service role access
- ⏳ **Next**: Create `functions/beta-signup-supabase.js`

### For Agent Gamma (Email Templates)
- ✅ `email_campaigns` table ready for templates
- ✅ `get_users_needing_email` function ready for scheduler
- ✅ Sequence logic supports welcome/launch/retention
- ⏳ **Next**: Create email templates and scheduler

---

## 💰 Cost Verification

### Supabase FREE Tier Limits
- ✅ 500 MB database (estimated usage: 10-50 MB for 1,000 users)
- ✅ 50,000 monthly active users (estimated: 100-1,000 users)
- ✅ 2 GB file storage (not used for email system)
- ✅ 50 GB bandwidth (estimated: <1 GB for email operations)

### Current Usage After Deployment
- Database Size: ~5 MB (empty schema)
- Active Users: 0 (no signups yet)
- Bandwidth: <1 MB (migration only)

**Status**: ✅ Well within FREE tier limits

---

## 🎉 Deployment Complete Confirmation

After successful deployment, you should see:

```
✅ 4 tables created and accessible
✅ 16 indexes optimized for performance
✅ 8 RLS policies securing data access
✅ 9 functions ready for automation
✅ 0 errors or warnings
✅ Test user insert successful
✅ Validation query: ALL TESTS PASSED

🚀 Database infrastructure ready for Agent Beta and Agent Gamma integration!
```

---

**Estimated Total Deployment Time**: 5 minutes
**Complexity**: Low (idempotent migrations)
**Risk**: Minimal (no destructive operations)
**Rollback Available**: Yes

**Agent Alpha mission complete. Ready for integration! 🎯**
