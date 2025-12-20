# Deploy Database Migrations - Quick Guide

**Time Required**: 5 minutes
**Method**: Copy-paste SQL into Supabase Dashboard

---

## Steps

### 1. Open Supabase SQL Editor

**Go to**: https://supabase.com/dashboard/project/zdceeulkqfpzdjeyekgs/sql/new

---

### 2. Execute Migration 1 (Email Marketing Infrastructure)

**File**: `supabase/migrations/add_email_marketing_infrastructure.sql`

**Steps**:
1. Open the file in your editor
2. Copy ALL 379 lines
3. Paste into Supabase SQL Editor
4. Click "Run" button (or Ctrl+Enter)
5. Wait for "Success. No rows returned" message

**What it creates**:
- ✅ 4 tables: beta_users, email_campaigns, email_sends, analytics_events
- ✅ 15 indexes for performance
- ✅ 10 RLS security policies
- ✅ 3 helper functions

---

### 3. Execute Migration 2 (Email Scheduler Functions)

**File**: `supabase/migrations/add_email_scheduler_functions.sql`

**Steps**:
1. Click "New Query" in SQL Editor
2. Copy ALL 311 lines from the file
3. Paste into editor
4. Click "Run"
5. Wait for "Success. No rows returned"

**What it creates**:
- ✅ 6 SQL functions for automated email sequences
- ✅ Helper functions for delay-based scheduling
- ✅ User eligibility checks

---

### 4. Execute Migration 3 (Validation)

**File**: `supabase/migrations/validate_email_infrastructure.sql`

**Steps**:
1. Click "New Query"
2. Copy ALL 274 lines
3. Paste and run
4. **Expected**: Results showing tables, indexes, policies created

**What it validates**:
- ✅ All 4 tables exist
- ✅ RLS enabled on all tables
- ✅ All indexes created
- ✅ All functions available

---

## After All 3 Migrations

Run this verification query:

```sql
-- Verify all tables exist
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('beta_users', 'email_campaigns', 'email_sends', 'analytics_events')
ORDER BY tablename;
```

**Expected Result**: 4 rows showing all tables

---

## Files to Copy

All migration files are in: `supabase/migrations/`

1. `add_email_marketing_infrastructure.sql` (379 lines)
2. `add_email_scheduler_functions.sql` (311 lines)
3. `validate_email_infrastructure.sql` (274 lines)

---

## Troubleshooting

**"relation already exists" errors**:
- ✅ **This is OK** - Tables already created
- Migrations use `CREATE TABLE IF NOT EXISTS`
- Just continue with next migration

**Permission errors**:
- ❌ Check you're logged into correct Supabase project
- ❌ Verify project ID: zdceeulkqfpzdjeyekgs

---

## Next Steps After Migrations

1. ✅ Database infrastructure ready
2. ⏳ Setup Resend account (3,000 free emails/month)
3. ⏳ Configure Netlify environment variables
4. ⏳ Test beta signup flow
