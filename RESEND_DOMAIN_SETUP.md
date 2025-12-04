# Resend Domain Verification - Production Email Setup

**Purpose**: Enable sending emails to all beta users (not just e.linetools@gmail.com)
**Time Required**: 10-15 minutes
**Status**: Ready to configure

---

## 🎯 Current Status

**Sandbox Mode Limitations:**
- ❌ Can only send to: e.linetools@gmail.com
- ❌ Cannot send to beta signups (test.beta@example.com, etc.)
- ❌ "Testing emails" watermark on all emails

**After Domain Verification:**
- ✅ Send to ANY email address
- ✅ Send to all beta signups
- ✅ Professional branded emails (from: hello@untrapd.com)
- ✅ No "testing emails" watermark

---

## 📋 Step 1: Choose Your Domain

**Recommended Options:**

### Option A: Use untrapd.com (RECOMMENDED)
```
From address: hello@untrapd.com
             beta@untrapd.com
             no-reply@untrapd.com
```
**Pros**: Matches your brand, professional, users already know domain
**Cons**: Need DNS access to untrapd.com

### Option B: Use subdomain finderr.untrapd.com
```
From address: hello@finderr.untrapd.com
             beta@finderr.untrapd.com
```
**Pros**: Dedicated for FINDERR, easier to manage separately
**Cons**: Slightly longer email address

### Option C: Register new domain (NOT RECOMMENDED for beta)
```
From address: hello@finderr.app
```
**Pros**: Dedicated domain
**Cons**: Costs money, takes time, not necessary for beta

**Recommendation**: Use **untrapd.com** with email addresses like:
- `hello@untrapd.com` (general)
- `beta@untrapd.com` (beta program)
- `no-reply@untrapd.com` (automated emails)

---

## 📋 Step 2: Add Domain to Resend

**Navigate to**: https://resend.com/domains

**Steps**:
1. Click **"Add Domain"**
2. Enter domain: `untrapd.com`
3. Click **"Add"**

**What happens**: Resend will provide DNS records to verify ownership

---

## 📋 Step 3: Get DNS Records from Resend

After adding domain, Resend will show you DNS records to add:

**Typical Records (examples, yours will be different):**

### SPF Record (TXT)
```
Type: TXT
Name: @
Value: v=spf1 include:_spf.resend.com ~all
TTL: 3600
```

### DKIM Record (TXT)
```
Type: TXT
Name: resend._domainkey
Value: p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKB... (long key)
TTL: 3600
```

### DMARC Record (TXT) - Optional but recommended
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:hello@untrapd.com
TTL: 3600
```

---

## 📋 Step 4: Add DNS Records to Your Domain

**Where to add DNS records** (depends on your DNS provider):

### Common DNS Providers:

**Cloudflare**:
1. Dashboard → DNS → Records
2. Click "Add record"
3. Enter each record from Resend

**Namecheap**:
1. Domain List → Manage → Advanced DNS
2. Add new record
3. Enter each record from Resend

**GoDaddy**:
1. My Products → Domains → DNS
2. Add → TXT record
3. Enter each record from Resend

**Google Domains / Squarespace Domains**:
1. DNS → Custom records
2. Create new record
3. Enter each record from Resend

---

## 📋 Step 5: Verify Domain in Resend

**After adding DNS records**:

1. Wait 5-10 minutes for DNS propagation
2. Go to Resend Dashboard → Domains
3. Click **"Verify Domain"** next to untrapd.com
4. Resend will check DNS records

**Verification Statuses**:
- ⏳ **Pending**: DNS records not found yet (wait longer)
- ✅ **Verified**: Domain ready to send emails!
- ❌ **Failed**: DNS records incorrect (check values)

---

## 📋 Step 6: Update Netlify Environment Variable

Once domain is verified, update the sender email:

```bash
netlify env:set RESEND_FROM_EMAIL "hello@untrapd.com"
```

Or choose a different address:
- `beta@untrapd.com` (beta program specific)
- `no-reply@untrapd.com` (no replies expected)
- `finderr@untrapd.com` (FINDERR branded)

---

## 📋 Step 7: Test Production Email Sending

After domain verification and env update:

```bash
# Test sending to a different email (not your own)
RESEND_API_KEY="re_aU13Ydux_CNaTMLzuZGDY4SWBqdGpizr2" \
RESEND_FROM_EMAIL="hello@untrapd.com" \
TEST_EMAIL="test.beta@example.com" \
node /home/wolfy/.local/lib/supabase-mcp-server/test-welcome-email.mjs
```

**Expected**: Email sends successfully (no "sandbox mode" error)

---

## 🔍 Troubleshooting

### "Domain not verified"

**Check**:
1. DNS records added correctly (no typos)
2. Wait 30-60 minutes for DNS propagation
3. Use DNS checker: https://dnschecker.org

**Fix**:
```bash
# Check DNS records are visible
dig TXT untrapd.com
dig TXT resend._domainkey.untrapd.com
```

### "SPF record already exists"

**Cause**: Domain already has SPF record for other email service

**Fix**: Merge records
```
Before: v=spf1 include:_spf.google.com ~all
After:  v=spf1 include:_spf.google.com include:_spf.resend.com ~all
```

### Emails go to spam

**Solutions**:
1. ✅ Add DMARC record (improves deliverability)
2. ✅ Warm up domain (send gradually: 10/day → 50/day → 100/day)
3. ✅ Authenticate with DKIM (should already be verified)
4. ✅ Use professional content (no spammy words)

---

## ✅ Verification Checklist

Before marking domain setup complete:

- [ ] Domain added to Resend
- [ ] SPF record added to DNS
- [ ] DKIM record added to DNS
- [ ] DMARC record added to DNS (optional)
- [ ] Wait 10-30 minutes for DNS propagation
- [ ] Domain verified in Resend Dashboard (green checkmark)
- [ ] RESEND_FROM_EMAIL updated in Netlify
- [ ] Netlify redeployed with new email address
- [ ] Test email sent successfully to non-sandbox address
- [ ] Email received (check inbox and spam)

---

## 📊 After Domain Verification

**What changes**:

### Before (Sandbox):
```
From: onboarding@resend.dev
To: e.linetools@gmail.com ONLY
Subject: [TEST] Welcome to FINDERR Beta!
```

### After (Production):
```
From: hello@untrapd.com
To: ANY email address
Subject: Welcome to FINDERR Beta!
```

**Beta signup flow**:
1. User signs up → Saved to beta_users table
2. Welcome email automatically sent to their email
3. User receives professional branded email
4. Email tracking (opens/clicks) works
5. Unsubscribe links work

---

## 🚀 Next Steps After Domain Setup

Once domain is verified and working:

1. **Email Sequences**: Automated welcome series will work for all users
2. **Beta Launch**: Share signup form publicly
3. **Monitoring**: Watch Resend dashboard for delivery metrics
4. **Scaling**: Resend free tier = 3,000 emails/month (plenty for beta)

---

## 📞 Need Help?

**Resend Support**:
- Documentation: https://resend.com/docs
- Status: https://resend.com/status
- Email: support@resend.com

**Common Questions**:

**Q: How long does verification take?**
A: DNS records: 5-60 minutes. Verification: instant after DNS propagates.

**Q: Can I use multiple domains?**
A: Yes! Add untrapd.com AND finderr.untrapd.com if you want.

**Q: What if I don't have DNS access?**
A: Contact your domain registrar or IT team for DNS access.

**Q: Can I verify later?**
A: Yes! Sandbox mode works for testing. Verify domain before public beta launch.

---

**Current Status**: ⏳ Waiting for domain verification
**Next Action**: Add domain to Resend and get DNS records
**Estimated Time**: 15 minutes setup + 30 minutes DNS propagation
