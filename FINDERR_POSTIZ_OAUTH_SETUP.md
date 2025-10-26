# 🔐 FINDERR Postiz OAuth Setup - 10 Minutes

**Why Postiz**: Ayrshare free plan doesn't allow scheduling (requires Premium $15+/month)
**Solution**: Native Postiz OAuth with Instagram, Facebook, TikTok, Twitter

---

## ✅ Current Status

- ✅ Postiz running: http://localhost:4200
- ✅ Login: admin@untrapd.hub / UNTRAPDHub2025!
- ✅ Test post successful to Facebook (Ayrshare)
- ⚠️ Ayrshare scheduling blocked (requires paid plan)

---

## 📱 Accounts to Connect

| Platform | Account | ID |
|----------|---------|-----|
| **Instagram** | @untrapd.hub | 17841476173887045 |
| **Facebook** | untrapd hub | 750014458192598 |
| **TikTok** | @untrapd.hub | - |
| **Twitter** | @untrapd.hub | - |

---

## 🚀 Quick Setup (10 Minutes)

### Step 1: Open Postiz Dashboard
```bash
# Already running at:
open http://localhost:4200
```

**Login credentials**:
- Email: admin@untrapd.hub
- Password: UNTRAPDHub2025!

---

### Step 2: Add Instagram Business Account

1. Click **"Add Channel"** or **"Integrations"**
2. Select **"Instagram"**
3. Click **"Connect with Facebook"** (Instagram requires Facebook auth)
4. Login to Facebook account that manages @untrapd.hub
5. Grant permissions:
   - ✅ Manage Instagram account
   - ✅ Publish content
   - ✅ Read insights
6. Select Instagram Business account: **@untrapd.hub** (17841476173887045)
7. Click **"Connect"**

**Troubleshooting**:
- Must be Instagram **Business** account (not Personal)
- Must be connected to a Facebook Page
- Use Facebook account with admin access

---

### Step 3: Add Facebook Page

1. Click **"Add Channel"**
2. Select **"Facebook"**
3. Click **"Connect with Facebook"**
4. Login to Facebook account
5. Grant permissions:
   - ✅ Manage Pages
   - ✅ Publish content
   - ✅ Read insights
6. Select page: **"untrapd hub"** (750014458192598)
7. Click **"Connect"**

---

### Step 4: Add TikTok Account

1. Click **"Add Channel"**
2. Select **"TikTok"**
3. Click **"Connect with TikTok"**
4. Login to TikTok account: **@untrapd.hub**
5. Grant permissions:
   - ✅ Post videos
   - ✅ Manage content
6. Click **"Authorize"**

---

### Step 5: Add Twitter/X Account

1. Click **"Add Channel"**
2. Select **"Twitter"** (or "X")
3. Click **"Connect with Twitter"**
4. Login to Twitter account: **@untrapd.hub**
5. Grant permissions:
   - ✅ Post tweets
   - ✅ Read timeline
6. Click **"Authorize"**

---

## ✅ Verify Connections

After connecting all accounts, verify with:

```bash
cd automation/social_media
node postiz-working-client.js
```

**Expected output**:
```
✅ Connected Accounts:
1. Instagram (@untrapd.hub)
2. Facebook (untrapd hub)
3. TikTok (@untrapd.hub)
4. Twitter (@untrapd.hub)
```

---

## 🚀 Launch Campaign After Setup

Once all 4 platforms are connected:

```bash
# Validate connections
node finderr-postiz-integration.js validate

# Preview campaign
node finderr-postiz-integration.js preview 7

# Schedule all 210 posts
node finderr-postiz-integration.js schedule
```

---

## 🆘 Common Issues

### Issue: "Instagram connection failed"
**Solution**:
- Verify @untrapd.hub is a **Business** account
- Must be connected to a Facebook Page
- Use Facebook account with Instagram Business access

### Issue: "Facebook page not showing"
**Solution**:
- Verify Facebook account has Page admin access
- Try logging out and back in to Facebook
- Check Page ID is correct: 750014458192598

### Issue: "TikTok authorization failed"
**Solution**:
- Verify TikTok account exists (@untrapd.hub)
- Use correct TikTok login credentials
- May need to verify account via email/SMS

### Issue: "Twitter connection failed"
**Solution**:
- Verify Twitter account exists (@untrapd.hub)
- If account needs to be created, do that first
- Check Twitter is not rate-limiting OAuth

---

## 📊 After Connection - Campaign Stats

**Once connected, you'll be able to schedule**:
- **Instagram**: 60 posts (2/day) over 30 days
- **Facebook**: 30 posts (1/day) over 30 days
- **TikTok**: 30 videos (1/day) over 30 days
- **Twitter**: 90 tweets (3/day) over 30 days

**Total**: 210 posts across 4 platforms

---

## 💡 Why Native Postiz vs Ayrshare?

| Feature | Postiz | Ayrshare |
|---------|--------|----------|
| **Cost** | FREE | $15+/month |
| **Scheduling** | ✅ Unlimited | ❌ Paid only |
| **Platforms** | 4 (IG, FB, TikTok, Twitter) | 3 (IG, FB, Pinterest) |
| **Rate Limits** | Native API limits | 20 posts/month free |
| **Analytics** | Built-in | Limited on free |

**Bottom line**: Postiz is 100% free with full scheduling capability

---

## ⏱️ Time Estimate

- **Instagram**: 2 minutes
- **Facebook**: 2 minutes
- **TikTok**: 3 minutes
- **Twitter**: 3 minutes
- **Total**: ~10 minutes

---

**Ready to connect?** Just open http://localhost:4200 and follow the steps above!

Once connected, run the campaign launch command and you're live! 🚀
