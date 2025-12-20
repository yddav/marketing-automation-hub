# Netlify Environment Variables - Ready to Deploy

**Status**: ✅ All values collected and ready
**Action Required**: Copy-paste these into Netlify Dashboard

---

## 📍 Where to Add These

**Netlify Dashboard**: https://app.netlify.com

**Steps**:
1. Go to Netlify Dashboard
2. Select your site (hub.untrapd.com)
3. Click **Site configuration** → **Environment variables**
4. Click **Add a variable** for each one below
5. Select scope: **All deploys** for each variable

---

## 🔑 Complete Environment Variables (9 Total)

### 1. SUPABASE_URL
```
https://zdceeulkqfpzdjeyekgs.supabase.co
```

### 2. SUPABASE_ANON_KEY
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkY2VldWxrcWZwemRqZXlla2dzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0ODUxNDYsImV4cCI6MjA2NTA2MTE0Nn0.3ZM_PX8HmlRPtKDrY6oYOwJ0nxN8FMZJJEk3D_Mk7e4
```

### 3. SUPABASE_SERVICE_ROLE_KEY
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkY2VldWxrcWZwemRqZXlla2dzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTQ4NTE0NiwiZXhwIjoyMDY1MDYxMTQ2fQ.waTWz-6b9x7hK8cQLn_nxzLoN6RaJ5Fw9A6eqqdK3yo
```
⚠️ **IMPORTANT**: Server-side only, never expose in client code

### 4. RESEND_API_KEY
```
re_aU13Ydux_CNaTMLzuZGDY4SWBqdGpizr2
```

### 5. RESEND_FROM_EMAIL
```
onboarding@resend.dev
```
📝 **Note**: For testing. Change to your verified domain email for production.

### 6. NODE_ENV
```
production
```

### 7. SITE_URL
```
https://hub.untrapd.com
```

### 8. GA_MEASUREMENT_ID
```
G-K4W61MX38C
```

### 9. EMAIL_SEQUENCE_ENABLED
```
true
```

---

## ✅ Quick Copy Checklist

As you add each variable to Netlify, check it off:

- [ ] SUPABASE_URL
- [ ] SUPABASE_ANON_KEY
- [ ] SUPABASE_SERVICE_ROLE_KEY
- [ ] RESEND_API_KEY
- [ ] RESEND_FROM_EMAIL
- [ ] NODE_ENV
- [ ] SITE_URL
- [ ] GA_MEASUREMENT_ID
- [ ] EMAIL_SEQUENCE_ENABLED

---

## 🚀 After Adding All Variables

### 1. Verify Count
You should see **9 environment variables** in Netlify Dashboard

### 2. Trigger Redeploy

**Option A - Push to GitHub** (recommended):
```bash
cd /media/wolfy/D260DD2060DD0BDB/Datas/2025\ Projects/AppBuildFlutterVscodiumClaude/Hub_App_Shop_Integ
git add .
git commit -m "Deploy: Configure environment variables for beta signup system"
git push origin main
```

**Option B - Manual Redeploy**:
- Netlify Dashboard → Deploys → Trigger deploy → Deploy site

### 3. Monitor Deployment

- **Status**: Deploys tab in Netlify
- **Duration**: 1-2 minutes
- **Success**: "Site is live" message

### 4. Verify Deployment

Check deployment log for:
- ✅ Build successful
- ✅ Functions deployed
- ✅ Environment variables loaded

---

## 🧪 Test Beta Signup Flow

After deployment completes:

### 1. Visit Landing Page
```
https://hub.untrapd.com/apps/finderr/
```

### 2. Fill Out Beta Form
- First name
- Email address
- Device type (Android)
- Primary interest

### 3. Submit Form

**Expected Results**:
- ✅ Form submits successfully (no errors)
- ✅ Confirmation message appears
- ✅ User redirected or thank you message shown

### 4. Verify Database Entry

In Supabase Dashboard SQL Editor:
```sql
SELECT
  email,
  first_name,
  device_type,
  interest,
  signup_date,
  status
FROM beta_users
ORDER BY signup_date DESC
LIMIT 5;
```

**Expected**: Your test signup appears in results

### 5. Check Email Received

- Check inbox for welcome email
- Sender: onboarding@resend.dev
- Subject: "Welcome to FINDERR Beta!"

### 6. Verify Resend Dashboard

- Go to https://resend.com/emails
- Should show sent email
- Check delivery status

### 7. Verify GA4 Tracking

- Go to https://analytics.google.com
- Real-time → Events
- Should show beta_signup event

---

## 🔍 Debugging Guide

### Form Submission Fails

**Check**:
1. Browser console for errors (F12 → Console)
2. Network tab for failed requests
3. Netlify Functions logs

**Common Issues**:
- CORS errors → Check SITE_URL matches
- 500 error → Check Netlify Function logs
- Validation error → Check form data format

### No Email Received

**Check**:
1. Spam/junk folder
2. Resend Dashboard → Emails → Status
3. Netlify Function logs for sending errors

**Common Issues**:
- RESEND_API_KEY incorrect
- RESEND_FROM_EMAIL not verified (if using custom domain)
- Function timeout

### Database Entry Missing

**Check**:
1. Supabase Dashboard → Table Editor → beta_users
2. Netlify Function logs for errors
3. RLS policies aren't blocking insert

**Common Issues**:
- SUPABASE_SERVICE_ROLE_KEY incorrect
- Database table not created (run migrations again)
- Network/timeout error

### GA4 Not Tracking

**Check**:
1. GA4 Real-time report (30 second delay)
2. Browser console for gtag errors
3. GA_MEASUREMENT_ID correct

**Common Issues**:
- Ad blocker blocking gtag.js
- Measurement ID typo
- Script not loaded on page

---

## 📊 Success Metrics

After successful deployment and testing:

### Database
- ✅ beta_users table populated
- ✅ Email sequences ready to trigger
- ✅ Analytics events tracking

### Email System
- ✅ Resend sending successfully
- ✅ Welcome email delivered
- ✅ Email open tracking working

### Analytics
- ✅ GA4 receiving events
- ✅ Real-time tracking visible
- ✅ Conversion funnels configured

### Application
- ✅ Form submits without errors
- ✅ User experience smooth
- ✅ All integrations working

---

## 🎯 What Happens After This

### Automated Email Sequences

Users who sign up will automatically receive:

1. **Immediate**: Welcome email (Resend)
2. **Day 1**: Beta testing guide
3. **Day 3**: Feature highlights
4. **Day 7**: Early access update
5. **Day 14**: Launch countdown

### Analytics Tracking

All events tracked in GA4:
- beta_signup
- email_open
- email_click
- form_submission

### Database Growth

Monitor beta_users table:
- Daily signups
- Engagement metrics
- Email performance

---

## ✅ Deployment Checklist

- [ ] All 9 environment variables added to Netlify
- [ ] Netlify site redeployed
- [ ] Beta form tested successfully
- [ ] User appears in beta_users table
- [ ] Welcome email received
- [ ] GA4 event tracked
- [ ] Resend dashboard shows sent email
- [ ] No errors in browser console
- [ ] No errors in Netlify Function logs

---

**Status**: ✅ Ready for production beta launch
**Next Step**: Add environment variables to Netlify and trigger redeploy
