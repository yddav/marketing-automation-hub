# Deploy Database Migrations - Simple Instructions

**Time Required**: 5 minutes
**Method**: Copy-paste SQL into Supabase Dashboard

---

## Step-by-Step Instructions

### 1. Open Supabase SQL Editor

**Go to**: https://supabase.com/dashboard/project/zdceeulkqfpzdjeyekgs/sql/new

---

### 2. Execute Migration 1 (Email Marketing Infrastructure)

**Copy entire file**: `supabase/migrations/add_email_marketing_infrastructure.sql`

**Steps**:
1. In SQL Editor, paste the entire contents (379 lines)
2. Click "Run" button (or Ctrl+Enter)
3. Wait for "Success. No rows returned" message

**What it creates**:
- ✅ 4 tables: beta_users, email_campaigns, email_sends, analytics_events
- ✅ 15 indexes for performance
- ✅ 10 RLS security policies
- ✅ 3 helper functions (sequence progress, email tracking)

---

### 3. Execute Migration 2 (Email Scheduler Functions)

**Copy entire file**: `supabase/migrations/add_email_scheduler_functions.sql`

**Steps**:
1. Click "New Query" in SQL Editor
2. Paste the entire contents (311 lines)
3. Click "Run"
4. Wait for "Success. No rows returned"

**What it creates**:
- ✅ 6 SQL functions for automated email sequences
- ✅ Helper functions for delay-based scheduling
- ✅ User eligibility checks

---

### 4. Execute Migration 3 (Validation)

**Copy entire file**: `supabase/migrations/validate_email_infrastructure.sql`

**Steps**:
1. Click "New Query"
2. Paste the entire contents (274 lines)
3. Click "Run"
4. **Expected**: Results showing tables, indexes, policies created

**What it validates**:
- ✅ All 4 tables exist
- ✅ RLS enabled on all tables
- ✅ All indexes created
- ✅ All functions available

---

## Verification Query

**After all 3 migrations**, run this query to confirm:

```sql
-- Verify all tables exist
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('beta_users', 'email_campaigns', 'email_sends', 'analytics_events')
ORDER BY tablename;
```

**Expected Result**: 4 rows

| tablename |
|-----------|
| analytics_events |
| beta_users |
| email_campaigns |
| email_sends |

---

## Alternative: File Locations

If you need to open the files:

1. **Migration 1**: `/media/wolfy/D260DD2060DD0BDB/Datas/2025 Projects/AppBuildFlutterVscodiumClaude/Hub_App_Shop_Integ/supabase/migrations/add_email_marketing_infrastructure.sql`

2. **Migration 2**: `/media/wolfy/D260DD2060DD0BDB/Datas/2025 Projects/AppBuildFlutterVscodiumClaude/Hub_App_Shop_Integ/supabase/migrations/add_email_scheduler_functions.sql`

3. **Migration 3**: `/media/wolfy/D260DD2060DD0BDB/Datas/2025 Projects/AppBuildFlutterVscodiumClaude/Hub_App_Shop_Integ/supabase/migrations/validate_email_infrastructure.sql`

---

## Troubleshooting

**If you get "relation already exists" errors**:
- ✅ **This is OK** - It means some tables were already created
- The migrations use `CREATE TABLE IF NOT EXISTS`, so they're safe to re-run
- Just continue with the next migration

**If you get permission errors**:
- ❌ Check that you're logged into the correct Supabase project
- ❌ Verify the project ID matches: zdceeulkqfpzdjeyekgs

---

## After Deployment Complete

✅ **Database infrastructure ready**
⏳ **Next step**: Configure Netlify environment variables (5 minutes)
⏳ **Then**: Test beta signup flow

**See**: `REMAINING_DEPLOYMENT_STEPS_2025-11-08.md` for next steps
