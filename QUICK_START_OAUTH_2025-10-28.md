# 🚀 Quick Start: Complete OAuth Setup (30-40 minutes)

**Current Status**: Postiz is running and ready at http://localhost:4200
**You are logged in** and on the Launches calendar page
**Next**: Connect 4 social media accounts via OAuth

---

## ✅ What's Already Done

- ✅ Postiz platform running (Docker containers healthy)
- ✅ ngrok tunnel active for OAuth callbacks
- ✅ Logged into dashboard (`admin@untrapd.hub`)
- ✅ OAuth credentials configured
- ✅ Ready to click "Add Channel" button

---

## 🎯 YOUR TASK: Connect 4 Accounts (30-40 min)

### Step 1: Configure Meta OAuth (15 min) ⚠️ **DO THIS FIRST**

1. Open: https://developers.facebook.com/apps/738653215879612/fb-login/settings/
2. Add these two URLs to "Valid OAuth Redirect URIs":
   ```
   https://jutta-vibrioid-erinn.ngrok-free.dev/integrations/social/instagram
   https://jutta-vibrioid-erinn.ngrok-free.dev/integrations/social/facebook
   ```
3. Click "Save Changes"
4. **Wait 2-3 minutes** for changes to propagate

### Step 2: Connect Accounts in Postiz (20 min)

**You're already here**: http://localhost:4200 (Launches page)

For each platform:
1. Click **"Add Channel"** button (top left)
2. Select platform (Instagram → Facebook → Twitter → TikTok)
3. Click "Connect" and complete OAuth in popup
4. Authorize the account

**Accounts to connect**:
- 📷 Instagram: @untrapd.hub
- 📘 Facebook: "un trapd" page
- 🐦 Twitter: @DavisUntrap (shows as FINDERR)
- 🎵 TikTok: @untrapd.hub

### Step 3: Validate (2 min)

```bash
cd automation/social_media
node postiz-working-client.js
```

Expected: "Found 4 connected channels"

---

## 🚀 After OAuth Complete

### Launch the Campaign:
```bash
cd automation/social_media
node finderr-postiz-integration.js preview 7  # Preview first week
node finderr-postiz-integration.js schedule   # Schedule all 45 posts
```

### Monitor:
- Dashboard: http://localhost:4200/launches
- View scheduled posts in calendar
- Track engagement in Analytics

---

## 🆘 Quick Fixes

**If ngrok stopped running**:
```bash
/tmp/ngrok http 4200 --domain=jutta-vibrioid-erinn.ngrok-free.dev &
```

**If Postiz stopped**:
```bash
docker start untrapd-postiz-db untrapd-postiz-redis untrapd-postiz
```

**If can't login**:
- URL: http://localhost:4200/auth/login
- Email: admin@untrapd.hub
- Password: UntrapdHub2025Strong

---

## 📋 Checklist

- [ ] Meta OAuth redirect URIs configured (Step 1)
- [ ] Instagram @untrapd.hub connected
- [ ] Facebook "un trapd" page connected
- [ ] Twitter @DavisUntrap connected
- [ ] TikTok @untrapd.hub connected
- [ ] Validation: `postiz-working-client.js` shows 4 channels
- [ ] Preview campaign: 45 posts ready
- [ ] Schedule campaign: Posts queued
- [ ] Monitor: Dashboard showing scheduled content

---

**📄 Full Details**: `automation/social_media/OAUTH_SETUP_READY_2025-10-28.md`

**⏱️ Time to Launch**: ~40 minutes from now!
