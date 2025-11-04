# Postiz OAuth Setup - Quick Checklist

**Status**: Ready to execute
**Time Required**: ~60 minutes
**Result**: Launch-ready automation system

---

## 📋 Step-by-Step Execution Checklist

### Phase 1: Create OAuth Apps (45 minutes)

#### Meta (Facebook/Instagram) - 20 minutes
- [ ] Go to https://developers.facebook.com/apps/
- [ ] Create new app: "UNTRAPD Hub Social Automation"
- [ ] Add "Instagram Basic Display" product
- [ ] Add "Instagram Graph API" product
- [ ] Add "Facebook Login" product
- [ ] Configure redirect URIs (see guide Section 1.2-1.4):
  ```
  http://localhost:4200/integrations/social/instagram
  http://localhost:4200/integrations/social/facebook
  ```
- [ ] Save **App ID**: _________________
- [ ] Save **App Secret**: _________________

#### TikTok - 15 minutes
- [ ] Go to https://developers.tiktok.com/apps/
- [ ] Create new app: "UNTRAPD Hub Automation"
- [ ] Enable "Login Kit" product
- [ ] Enable "Content Posting API" product
- [ ] Configure redirect URI:
  ```
  http://localhost:4200/integrations/social/tiktok
  ```
- [ ] Save **Client Key**: _________________
- [ ] Save **Client Secret**: _________________

#### Twitter/X - 10 minutes
- [ ] Go to https://developer.twitter.com/en/portal/projects-and-apps
- [ ] Select your existing app (with credentials in .env)
- [ ] Navigate to "User authentication settings"
- [ ] Enable OAuth 2.0 with redirect URI:
  ```
  http://localhost:4200/integrations/social/twitter
  ```
- [ ] Verify read/write permissions enabled
- [ ] ✅ No new credentials needed (already in .env)

---

### Phase 2: Configure Postiz (10 minutes)

#### Update Environment File
- [ ] Copy template: `cp postiz-oauth-credentials-template.env postiz-oauth.env`
- [ ] Edit `postiz-oauth.env` with your OAuth credentials
- [ ] Verify all placeholders replaced with real values
- [ ] Check: No "YOUR_*_HERE" text remaining

#### Restart Postiz Container
```bash
# Stop current container
docker stop untrapd-postiz

# Remove old container
docker rm untrapd-postiz

# Start with OAuth configuration
docker run -d --name untrapd-postiz \
  --network postiz-network \
  -p 3000:3000 -p 4200:4200 \
  --env-file automation/social_media/postiz-oauth.env \
  -e NEXTAUTH_SECRET=$(openssl rand -base64 32) \
  -e JWT_SECRET=$(openssl rand -base64 32) \
  ghcr.io/gitroomhq/postiz-app:latest
```

- [ ] Container started successfully
- [ ] Check logs: `docker logs untrapd-postiz --tail 50`
- [ ] No errors in logs

---

### Phase 3: Connect Accounts (12 minutes)

#### Login to Postiz
- [ ] Open http://localhost:4200
- [ ] Login: admin@untrapd.hub / UNTRAPDHub2025!

#### Connect Instagram (3 min)
- [ ] Settings → Integrations → Add Channel → Instagram
- [ ] Click "Connect with Instagram"
- [ ] Authorize @untrapd.hub account
- [ ] Select business account (ID: 76216363129)
- [ ] ✅ Account appears in Connected Channels

#### Connect Facebook (3 min)
- [ ] Settings → Integrations → Add Channel → Facebook
- [ ] Click "Connect with Facebook"
- [ ] Select "un trapd" page (ID: 750014458192598)
- [ ] Grant permissions
- [ ] ✅ Page appears in Connected Channels

#### Connect TikTok (3 min)
- [ ] Settings → Integrations → Add Channel → TikTok
- [ ] Click "Connect with TikTok"
- [ ] Login to @untrapd.hub
- [ ] Grant permissions (user info, video upload, video publish)
- [ ] ✅ Account appears in Connected Channels

#### Connect Twitter (3 min)
- [ ] Settings → Integrations → Add Channel → Twitter
- [ ] Click "Connect with Twitter"
- [ ] Authorize @DavisUntrap account
- [ ] Grant read/write permissions
- [ ] ✅ Account appears as "FINDERR"

---

### Phase 4: Validate Setup (3 minutes)

#### Run Validation Script
```bash
cd automation/social_media
node postiz-working-client.js
```

**Expected Output**:
- [ ] ✅ Authentication successful
- [ ] ✅ Found 4 connected channels
- [ ] ✅ Instagram: @untrapd.hub
- [ ] ✅ Facebook: un trapd
- [ ] ✅ TikTok: @untrapd.hub
- [ ] ✅ Twitter: FINDERR

#### Test Campaign Import
```bash
cd automation/social_media
node finderr-postiz-integration.js validate
```

**Expected Output**:
- [ ] ✅ Postiz connection validated
- [ ] ✅ 4 accounts connected
- [ ] ✅ Campaign content loaded: 45 posts
- [ ] ✅ Ready to schedule campaign

---

## ✅ Launch Readiness Confirmation

### All Systems Go Checklist
- [ ] Postiz running (3 containers healthy)
- [ ] 4 OAuth apps created (Meta, TikTok, Twitter configured)
- [ ] Postiz environment updated with credentials
- [ ] 4 social media accounts connected
- [ ] Validation scripts pass
- [ ] Campaign content validated (45 posts)

### When All Checked ✅ Above:
**Status**: 🟢 **100% LAUNCH READY**

### Launch Campaign When Ready:
```bash
cd automation/social_media

# Option 1: Preview first week
node finderr-postiz-integration.js preview 7

# Option 2: Schedule full 30-day campaign
node finderr-postiz-integration.js schedule
```

---

## 🚨 Troubleshooting Quick Reference

### OAuth App Issues
- **"App ID not found"**: Double-check copied correctly from developer console
- **"Redirect URI mismatch"**: Ensure URIs match exactly (no trailing slash)
- **"Permissions denied"**: Verify required permissions enabled in OAuth app

### Postiz Container Issues
- **Won't start**: Check logs with `docker logs untrapd-postiz`
- **Port conflict**: Ensure ports 3000/4200 available
- **Database error**: Verify DATABASE_URL format correct

### Account Connection Issues
- **Instagram no business account**: Link Instagram to Facebook page first
- **TikTok permissions missing**: Ensure Content Posting API approved
- **Twitter can't authorize**: Verify read/write access enabled
- **Facebook page not found**: Confirm you're admin of the page

### Validation Script Issues
- **0 channels found**: Wait 30 seconds after connecting, try again
- **Authentication failed**: Check admin credentials correct
- **Campaign content error**: Verify `finderr-prelaunch-templates.js` exists

---

## 📞 Reference Documentation

- **Complete Setup Guide**: `POSTIZ_OAUTH_SETUP_GUIDE.md`
- **Launch Handoff**: `../../LAUNCH_READY_SESSION_HANDOFF_2025-10-27.md`
- **Validation Script**: `postiz-working-client.js`
- **Campaign Launcher**: `finderr-postiz-integration.js`
- **Campaign Content**: `finderr-prelaunch-templates.js`

---

**Ready to configure?** Follow each checkbox in order. When all ✅ checked, you're launch-ready! 🚀
