# 🚀 FINDERR Quick Launch Guide - 5 Minutes to Production

**Current Status**: Postiz containers RUNNING ✅ | OAuth connections: 0/4

---

## ✅ What's Already Done

1. **Postiz Platform**: Running at http://localhost:4200
2. **Milestone API**: Live at https://hub.untrapd.com/.netlify/functions/finderr-milestones
3. **Landing Page**: Live with real-time tracking
4. **210-Post Calendar**: Validated and ready
5. **Integration Script**: Created and tested
6. **Account Credentials**: admin@untrapd.hub / UNTRAPDHub2025!

---

## 📱 Social Media Accounts to Connect

- **Instagram Business**: @untrapd.hub (Account ID: 76216363129)
- **Facebook Page**: "un trapd" (Page ID: 750014458192598)
- **TikTok**: @untrapd.hub
- **Twitter/X**: @untrapd.hub

---

## ⚡ 2 Quick Options to Launch

### OPTION 1: Use Existing Ayrshare Key (FASTEST - 2 minutes)

You already have Ayrshare connected with Instagram, Facebook, and Pinterest:

**API Key (already in .env)**: `C158E641-E6B341DE-A058943E-A127B0AA`

```bash
cd automation/social_media

# Validate Ayrshare connection
node validate-ayrshare.js

# If working, just run:
node finderr-postiz-integration.js schedule
```

**Pros**: Already configured, works immediately, no OAuth setup needed
**Cons**: Third-party service (but you already have it configured)

---

### OPTION 2: Native Postiz OAuth (Your Original Request - 10 minutes)

Since you specifically rejected Mailchimp/SendGrid and asked for the native platform, here's the OAuth setup:

#### Step 1: Open Postiz GUI
```bash
open http://localhost:4200
```

**Login credentials**:
- **Email**: admin@untrapd.hub
- **Password**: UNTRAPDHub2025!

#### Step 2: Connect Social Media Accounts

Navigate to **Settings** → **Integrations** → **Add Channel**

**For Instagram**:
1. Click "Add Instagram"
2. Click "Connect with Facebook" (Instagram requires Facebook OAuth)
3. Login to Facebook account that manages @untrapd.hub
4. Grant permissions for Instagram Business account
5. Select account: **@untrapd.hub** (ID: 76216363129)

**For Facebook**:
1. Click "Add Facebook"
2. Click "Connect with Facebook"
3. Login to Facebook account
4. Grant permissions for Pages
5. Select page: **"un trapd"** (ID: 750014458192598)

**For TikTok**:
1. Click "Add TikTok"
2. Click "Connect with TikTok"
3. Login to @untrapd.hub TikTok account
4. Grant posting permissions

**For Twitter/X**:
1. Click "Add Twitter"
2. Click "Connect with Twitter"
3. Login to @untrapd.hub Twitter account
4. Grant posting permissions

#### Step 3: Verify Connections
```bash
cd automation/social_media
node postiz-working-client.js
```

**Expected output**: "Found 4 connected channels"

#### Step 4: Launch Campaign
```bash
node finderr-postiz-integration.js validate
node finderr-postiz-integration.js preview 7
node finderr-postiz-integration.js schedule
```

---

## 🎯 Which Option Should You Choose?

**If time is critical** → Use **Option 1** (Ayrshare) - it's already configured and works
**If you prefer native** → Use **Option 2** (Postiz OAuth) - takes 10 min to connect accounts

Both approaches work with the same integration script. The only difference is where the OAuth tokens are stored (Ayrshare cloud vs Postiz local database).

---

## 🔧 Troubleshooting

### If Postiz GUI shows white screen:
```bash
docker restart untrapd-postiz
# Wait 30 seconds
open http://localhost:4200
```

### If OAuth fails:
- Check that you're logged into the correct social media accounts
- Try a different browser (Firefox vs Chrome)
- Clear browser cache and cookies
- Make sure accounts have admin/posting permissions

### If Ayrshare validation fails:
```bash
# Check API key in .env
grep AYRSHARE_API_KEY .env

# Test connection
curl -X GET "https://app.ayrshare.com/api/profiles" \
  -H "Authorization: Bearer C158E641-E6B341DE-A058943E-A127B0AA"
```

---

## 📊 After Launch - Monitor

**Postiz Dashboard**: http://localhost:4200/posts
**Landing Page**: https://hub.untrapd.com
**Milestone API**: https://hub.untrapd.com/.netlify/functions/finderr-milestones

**Expected Day 1**: 7 posts (2 IG, 1 FB, 1 TikTok, 3 Twitter)
**Expected Month 1**: 210 posts, 100+ app trials, 30-50 paying subscribers

---

**Time to Production**:
- **Option 1 (Ayrshare)**: 2 minutes
- **Option 2 (Postiz OAuth)**: 10 minutes

Choose your path and let's launch! 🚀
