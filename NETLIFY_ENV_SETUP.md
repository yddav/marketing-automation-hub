# Netlify Environment Variables Setup

**Time Required**: 3 minutes
**Purpose**: Configure environment variables for beta signup system

---

## 📍 Where to Add Variables

**Netlify Dashboard**: https://app.netlify.com/sites/YOUR_SITE/configuration/env

**Steps to Access**:
1. Go to Netlify Dashboard
2. Select your site (hub.untrapd.com)
3. Click **Site configuration** → **Environment variables**
4. Click **Add a variable** for each one below

---

## 🔑 Required Environment Variables

### 1. Supabase Configuration (3 variables)

**SUPABASE_URL**
```
https://zdceeulkqfpzdjeyekgs.supabase.co
```
- **Scope**: All deploys
- **Description**: Supabase project URL

**SUPABASE_ANON_KEY**
```
[Get from Supabase Dashboard → Settings → API → anon/public key]
```
- **Scope**: All deploys
- **Description**: Supabase anonymous key (public, safe for client-side)

**SUPABASE_SERVICE_ROLE_KEY**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkY2VldWxrcWZwemRqZXlla2dzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTQ4NTE0NiwiZXhwIjoyMDY1MDYxMTQ2fQ.waTWz-6b9x7hK8cQLn_nxzLoN6RaJ5Fw9A6eqqdK3yo
```
- **Scope**: All deploys
- **Description**: Supabase service role key (private, server-side only)
- ⚠️ **IMPORTANT**: This bypasses RLS - only use in Netlify Functions

---

### 2. Resend Configuration (2 variables)

**RESEND_API_KEY**
```
[Paste your Resend API key here after creating it]
```
- **Scope**: All deploys
- **Description**: Resend API key for sending emails
- **Format**: `re_xxxxxxxxxxxxxxxxxxxxxxxxxx`

**RESEND_FROM_EMAIL**
```
onboarding@resend.dev
```
- **Scope**: All deploys
- **Description**: Sender email address
- **Note**: Use `onboarding@resend.dev` for testing, or your verified domain email for production

---

### 3. Application Configuration (4 variables)

**NODE_ENV**
```
production
```
- **Scope**: All deploys
- **Description**: Environment mode

**SITE_URL**
```
https://hub.untrapd.com
```
- **Scope**: All deploys
- **Description**: Main site URL for redirects and links

**GA_MEASUREMENT_ID**
```
G-K4W61MX38C
```
- **Scope**: All deploys
- **Description**: Google Analytics 4 measurement ID

**EMAIL_SEQUENCE_ENABLED**
```
true
```
- **Scope**: All deploys
- **Description**: Enable automated email sequences
- **Values**: `true` or `false`

---

## 📋 Quick Copy List (9 Variables Total)

1. ✅ SUPABASE_URL
2. ✅ SUPABASE_ANON_KEY (need to get)
3. ✅ SUPABASE_SERVICE_ROLE_KEY
4. ⏳ RESEND_API_KEY (you're creating this now)
5. ⏳ RESEND_FROM_EMAIL
6. ✅ NODE_ENV
7. ✅ SITE_URL
8. ✅ GA_MEASUREMENT_ID
9. ✅ EMAIL_SEQUENCE_ENABLED

---

## 🔍 How to Get Missing Values

### SUPABASE_ANON_KEY

**Location**: Supabase Dashboard → Settings → API

**Steps**:
1. Go to https://supabase.com/dashboard/project/zdceeulkqfpzdjeyekgs/settings/api
2. Find **Project API keys** section
3. Copy the **anon** / **public** key
4. Format: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (different from service_role key)

**Why needed**: Safe to expose in client-side code, respects RLS policies

---

### RESEND_API_KEY

**Location**: Resend Dashboard → API Keys

**Steps**:
1. Go to https://resend.com/api-keys
2. Click "Create API Key"
3. Name: "FINDERR Beta Campaign"
4. Permissions: **Sending access** only
5. Copy the key (format: `re_xxxxxxxxxxxx`)
6. ⚠️ **Save it now** - you'll only see it once!

---

## ⚙️ After Adding All Variables

### 1. Verify Configuration

In Netlify Dashboard, you should see **9 environment variables** listed.

### 2. Trigger Redeploy

**Option A - Automatic**:
- Push any change to GitHub → auto-deploy

**Option B - Manual**:
- Netlify Dashboard → Deploys → Trigger deploy → Deploy site

**Why**: Environment variables only take effect after redeploy

### 3. Wait for Deployment

- **Status**: Check Deploys tab
- **Time**: ~1-2 minutes
- **Confirmation**: Deploy log shows "Site is live"

---

## 🧪 Test After Deployment

### Test Beta Signup

1. Go to: https://hub.untrapd.com/apps/finderr/
2. Fill out beta signup form
3. Submit

**Expected Results**:
- ✅ Form submits successfully
- ✅ User added to `beta_users` table in Supabase
- ✅ Welcome email sent via Resend
- ✅ Analytics event tracked in GA4

### Verify in Supabase

```sql
SELECT email, first_name, device_type, signup_date
FROM beta_users
ORDER BY signup_date DESC
LIMIT 10;
```

### Check Resend Dashboard

- Emails → Should show sent welcome email
- Analytics → Delivery status

---

## 🔐 Security Best Practices

### Environment Variable Scopes

- ✅ **All deploys**: Variables available in all environments
- ❌ **Don't use** production-only for beta (keep simple)

### Key Security

- ✅ **SUPABASE_SERVICE_ROLE_KEY**: Never expose in client-side code
- ✅ **RESEND_API_KEY**: Only use in Netlify Functions (server-side)
- ✅ **SUPABASE_ANON_KEY**: Safe to expose (RLS protected)

### Monitoring

- Check Netlify Functions logs for errors
- Monitor Resend for bounce/complaint rates
- Review Supabase for unauthorized access attempts

---

## 🛠️ Troubleshooting

### "Environment variable not found" error

**Cause**: Variables not loaded after adding
**Solution**: Trigger manual redeploy in Netlify

### Email not sending

**Causes**:
1. `RESEND_API_KEY` incorrect or missing
2. `RESEND_FROM_EMAIL` not verified (if using custom domain)
3. Netlify Function error

**Debug**:
- Check Netlify Functions logs: Dashboard → Functions → [function name] → Logs
- Verify Resend API key hasn't expired

### Database connection error

**Causes**:
1. `SUPABASE_URL` or keys incorrect
2. RLS policies blocking access

**Debug**:
- Test connection in Netlify Function logs
- Verify service role key in Supabase Dashboard

---

## ✅ Checklist

Before marking this step complete:

- [ ] All 9 environment variables added to Netlify
- [ ] SUPABASE_ANON_KEY retrieved from Supabase Dashboard
- [ ] RESEND_API_KEY created with "Sending access" permission
- [ ] Netlify site redeployed successfully
- [ ] Beta signup form tested end-to-end
- [ ] User appears in Supabase `beta_users` table
- [ ] Welcome email received in inbox
- [ ] GA4 tracking verified in real-time reports

---

**Next Step**: Test the complete beta signup flow!
