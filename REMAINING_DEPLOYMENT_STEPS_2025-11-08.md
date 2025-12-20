# Remaining Deployment Steps - Campaign Infrastructure

**Date**: 2025-11-08
**Status**: GA4 deployed ✅ | Database migrations pending ⏳ | Environment variables pending ⏳

---

## ✅ What's Complete

### 1. GA4 Tracking - DEPLOYED
- **Measurement ID**: G-K4W61MX38C
- **Status**: Live on hub.untrapd.com (Netlify deployed)
- **Landing Pages**: Both EN/FR updated
- **Verification**: Wait 2 minutes, then test at GA4 Realtime dashboard

---

## ⏳ What's Remaining (20 Minutes)

### Step 1: Supabase Service Role Key (1 minute)

**I need from you**:
1. Go to: https://supabase.com/dashboard/project/zdceeulkqfpzdjeyekgs/settings/api
2. Find: "Project API keys" section
3. Copy: `service_role` key (starts with `eyJ...`)
4. **Paste it here** → I'll configure Supabase MCP and deploy migrations automatically

**Why I need it**:
- Supabase MCP is already installed globally (`~/.mcp.json`)
- It just needs the service role key to authenticate
- Once configured, I can execute all 3 SQL migrations automatically

---

### Step 2: Database Migrations (5 minutes - automated via MCP)

**Once you provide the service role key, I will**:

1. **Update ~/.mcp.json** with credentials:
```json
{
  "mcpServers": {
    "supabase": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-supabase"],
      "env": {
        "SUPABASE_URL": "https://zdceeulkqfpzdjeyekgs.supabase.co",
        "SUPABASE_SERVICE_ROLE_KEY": "YOUR_KEY_HERE"
      }
    }
  }
}
```

2. **Execute 3 migrations automatically**:
   - Migration 1: Create 4 tables (beta_users, email_campaigns, email_sends, analytics_events)
   - Migration 2: Create 6 SQL helper functions
   - Migration 3: Validate infrastructure

3. **Verify tables created**:
```sql
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('beta_users', 'email_campaigns', 'email_sends', 'analytics_events');
-- Expected: 4 rows
```

---

### Step 3: Resend Email Service (5 minutes)

**Setup Resend Account** (FREE - 3,000 emails/month):

1. **Signup**: https://resend.com/signup
   - No credit card required

2. **Get API Key**:
   - Go to: API Keys → Create API Key
   - Name: "FINDERR Beta Campaign"
   - Copy key (starts with `re_...`)

3. **Domain Options**:
   - **Option A (Instant)**: Use `finderr@resend.dev` (no DNS needed)
   - **Option B (Custom)**: Verify `hub.untrapd.com` (requires DNS setup)

**Recommendation**: Start with Option A (instant), upgrade to Option B later if needed.

---

### Step 4: Netlify Environment Variables (5 minutes)

**Where**: https://app.netlify.com/ → Your site → Site settings → Environment variables

**Add 9 Variables**:

```bash
# Supabase (use YOUR service_role key from Step 1)
SUPABASE_URL=https://zdceeulkqfpzdjeyekgs.supabase.co
SUPABASE_SERVICE_KEY=eyJ... (YOUR service_role key)

# Resend (use YOUR API key from Step 3)
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_... (YOUR Resend API key)

# Email Configuration
EMAIL_FROM_ADDRESS=finderr@resend.dev
EMAIL_FROM_NAME=FINDERR Team
EMAIL_REPLY_TO=support@untrapd.com

# Application Settings
NETLIFY_URL=https://hub.untrapd.com
NODE_ENV=production
```

**After adding variables**:
- Click "Save"
- Trigger new deploy: Deploys → Trigger deploy → "Deploy site"

---

### Step 5: End-to-End Test (5 minutes)

**Test Beta Signup Flow**:

1. **Open**: https://hub.untrapd.com/apps/finderr/
2. **Fill form**:
   - Email: your_test_email@example.com
   - First Name: Test
   - Device: Android Smartphone
   - Interest: Emergency Recovery
3. **Submit**
4. **Check email inbox** → Welcome email should arrive
5. **Verify in Supabase**:
```sql
SELECT * FROM beta_users ORDER BY signup_date DESC LIMIT 1;
-- Expected: Your test signup
```

**Test GA4 Tracking**:
1. Go to: https://analytics.google.com/
2. Reports → Realtime
3. Should see: Your active session + `finderr_beta_signup` event

---

## 🎯 Quick Summary

**To complete deployment, I need**:
1. ✅ Supabase service role key (1 minute - paste it here)
2. ⏳ Resend API key (5 minutes - create account, copy key)

**Then I will**:
1. ✅ Configure Supabase MCP globally (automatic)
2. ✅ Deploy all 3 database migrations (automatic)
3. ✅ Verify infrastructure created (automatic)

**Then you**:
1. ⏳ Add 9 environment variables to Netlify (5 minutes)
2. ⏳ Test beta signup flow (2 minutes)

**Total Time**: 20 minutes after you provide the keys

---

## 📊 Expected Results After Deployment

**Beta Signup System**:
- ✅ Users can signup from EN/FR landing pages
- ✅ Welcome emails sent automatically via Resend
- ✅ Users stored in Supabase `beta_users` table
- ✅ Email tracking (opens, clicks) operational

**Analytics**:
- ✅ GA4 tracking all page views and events
- ✅ Supabase tracking all beta signups
- ✅ Email engagement metrics recorded

**Cost**:
- ✅ $0/month (3,000 free emails with Resend)

---

## 🚀 After Everything is Live

**Immediate**:
- Monitor first beta signups in Supabase dashboard
- Check GA4 real-time for visitor tracking
- Verify welcome emails arriving successfully

**Next 24-48 Hours**:
- Email sequence automation begins (Day 2, 3, 7 emails)
- Collect beta signup metrics
- Monitor email open/click rates

**When ANR Fixed (Phase 2)**:
- Update landing pages with official version
- Send launch notification to all beta users
- Activate lifetime premium for beta testers

---

**Ready to proceed?** Please provide your Supabase service role key and I'll configure the MCP and deploy all migrations automatically.
