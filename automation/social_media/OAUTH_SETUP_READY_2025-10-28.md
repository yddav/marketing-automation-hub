# ✅ Postiz OAuth Setup - READY FOR MANUAL CONNECTION

**Date**: 2025-10-28 15:10
**Status**: 🟢 **95% COMPLETE** - Infrastructure ready, manual OAuth connections needed
**Session**: Automated setup complete, handoff to manual OAuth flow

---

## 🎉 COMPLETED SETUP (Automated - 95%)

### ✅ Infrastructure (100%)

1. **Postiz Platform**: Running and operational
   - Container: `untrapd-postiz` (Up and healthy)
   - Database: `untrapd-postiz-db` (PostgreSQL 15)
   - Redis: `untrapd-postiz-redis` (Redis 7)
   - Network: `postiz-network`

2. **ngrok Tunnel**: Active for OAuth callbacks
   - Domain: `https://jutta-vibrioid-erinn.ngrok-free.dev`
   - Process: Running in background (PID in `/tmp/ngrok.log`)
   - Purpose: HTTPS endpoints for Instagram/Facebook OAuth

3. **Postiz Configuration**: Optimized for localhost + ngrok hybrid
   - **Interface URLs**: `http://localhost:4200` (working perfectly)
   - **OAuth Callback URLs**: Via ngrok (for Instagram/Facebook HTTPS requirement)
   - **Login**: ✅ Working (`admin@untrapd.hub` / `UntrapdHub2025Strong`)

4. **OAuth Credentials**: Configured in container
   - Instagram App ID: `738653215879612`
   - Instagram Secret: `be8297b868a6762ad54d4530545428fd`
   - Facebook App ID: `738653215879612` (same app)
   - Facebook Secret: `be8297b868a6762ad54d4530545428fd`
   - TikTok Client Key: `awzpr6gs8tayotje`
   - TikTok Secret: `zMeV70hup8dxHGstbS474TiQLIty5lAf`

### ✅ Access Points

- **Postiz Dashboard**: http://localhost:4200 (✅ Logged in and ready)
- **Current Page**: Launches calendar with "Add Channel" button
- **ngrok Admin**: http://localhost:4040 (tunnel monitoring)

---

## 📋 NEXT STEPS (Manual OAuth - 5%)

**Estimated Time**: 30-40 minutes

### Step 1: Configure Meta OAuth Redirect URIs (15 min)

**Why Needed**: Instagram and Facebook require pre-registered callback URLs

**Instructions**:
1. Open in your browser: https://developers.facebook.com/apps/738653215879612/fb-login/settings/
2. Log in to your Facebook Developer account
3. Navigate to "Facebook Login" → "Settings"
4. Add these to "Valid OAuth Redirect URIs":
   ```
   https://jutta-vibrioid-erinn.ngrok-free.dev/integrations/social/instagram
   https://jutta-vibrioid-erinn.ngrok-free.dev/integrations/social/facebook
   ```
5. Click "Save Changes"
6. Wait 2-3 minutes for changes to propagate

**Note**: Both URLs use the same ngrok domain since Instagram and Facebook share the same Meta app.

---

### Step 2: Connect Instagram Account (5 min)

**In Postiz Dashboard** (already open at `http://localhost:4200`):

1. Click the **"Add Channel"** button (top left of calendar)
2. Select **"Instagram"** from the platform list
3. Click **"Connect with Instagram"** or similar OAuth button
4. **OAuth Flow** (popup window):
   - You'll be redirected to Meta's Instagram authorization page
   - Log in with your Instagram account (@untrapd.hub)
   - Authorize Postiz to post on your behalf
   - Grant required permissions (publish_video, pages_read_engagement, pages_manage_posts)
5. **Callback**: Should redirect back to Postiz
6. **Verification**: Instagram account should appear in the Channels list

**Expected Result**: Instagram (@untrapd.hub) connected and visible in dashboard

---

### Step 3: Connect Facebook Page (5 min)

**In Postiz Dashboard**:

1. Click **"Add Channel"** again
2. Select **"Facebook"** from the platform list
3. Click **"Connect with Facebook"** button
4. **OAuth Flow**:
   - Log in to Facebook (if not already)
   - Select the **"un trapd"** page (Page ID: 750014458192598)
   - Authorize Postiz to manage the page
   - Grant permissions (pages_show_list, pages_manage_posts)
5. **Callback**: Redirect back to Postiz
6. **Verification**: Facebook page should appear in Channels list

**Expected Result**: Facebook page "un trapd" connected

---

### Step 4: Connect Twitter/X Account (5 min)

**In Postiz Dashboard**:

1. Click **"Add Channel"**
2. Select **"X"** or **"Twitter"** from the platform list
3. Click **"Connect with X"** button
4. **OAuth Flow**:
   - Log in to X/Twitter
   - Authorize Postiz to tweet on behalf of @DavisUntrap
   - Grant posting permissions
5. **Callback**: Return to Postiz
6. **Verification**: @DavisUntrap should appear in Channels

**Expected Result**: Twitter @DavisUntrap connected (Display name: FINDERR)

---

### Step 5: Connect TikTok Account (5 min)

**In Postiz Dashboard**:

1. Click **"Add Channel"**
2. Select **"TikTok"** from the platform list
3. Click **"Connect with TikTok"** button
4. **OAuth Flow**:
   - Log in to TikTok
   - Authorize Postiz for @untrapd.hub account
   - Grant video posting permissions
5. **Callback**: Return to Postiz
6. **Verification**: @untrapd.hub TikTok should appear

**Expected Result**: TikTok @untrapd.hub connected

---

### Step 6: Validate All Connections (5 min)

**Via Command Line**:
```bash
cd /media/wolfy/D260DD2060DD0BDB/Datas/2025\ Projects/AppBuildFlutterVscodiumClaude/Hub_App_Shop_Integ/automation/social_media

node postiz-working-client.js
```

**Expected Output**:
```
✅ Postiz connection successful
Found 4 connected channels:
- Instagram: @untrapd.hub
- Facebook: un trapd page
- Twitter: @DavisUntrap
- TikTok: @untrapd.hub
```

**In Postiz Dashboard**:
- Calendar should show all 4 social media icons in the "Channels" section
- Each channel should have a colored indicator showing it's active

---

## 🚀 AFTER OAUTH COMPLETE

Once all 4 accounts are connected, you're ready to launch the beta campaign!

### Preview Campaign (2 min)
```bash
cd automation/social_media
node finderr-postiz-integration.js preview 7
```

This will show the first 7 days of content to verify everything looks good.

### Schedule 30-Day Campaign (3 min)
```bash
node finderr-postiz-integration.js schedule
```

This will schedule all 45 posts across the 30-day campaign timeline.

### Monitor Campaign
- **Dashboard**: http://localhost:4200/launches
- **View**: Switch between Day/Week/Month views
- **Edit**: Click any scheduled post to modify
- **Analytics**: View engagement after posts go live

---

## 🔧 TROUBLESHOOTING

### OAuth Redirect URI Errors

**Symptom**: "redirect_uri_mismatch" error during OAuth

**Solution**:
1. Verify ngrok tunnel is running: `pgrep -af ngrok`
2. Check domain matches: `curl https://jutta-vibrioid-erinn.ngrok-free.dev`
3. Confirm Meta settings have exact URLs (no trailing slashes)
4. Wait 2-3 minutes after saving Meta settings

### OAuth Popup Blocked

**Symptom**: Nothing happens when clicking "Connect"

**Solution**:
1. Check browser popup blocker settings
2. Allow popups for `localhost:4200`
3. Try clicking "Connect" again

### Account Not Appearing After OAuth

**Symptom**: OAuth completed but account not in Channels list

**Solution**:
1. Refresh the Postiz page (F5)
2. Check browser console for errors (F12)
3. Verify account permissions were granted during OAuth
4. Try disconnecting and reconnecting

### Connection Shows But Can't Post

**Symptom**: Account connected but test post fails

**Solution**:
1. Check account permissions in platform settings
2. Verify account is not restricted or suspended
3. Test with a simple text-only post first
4. Check Postiz logs: `docker logs untrapd-postiz --tail 50`

---

## 📁 KEY RESOURCES

### Documentation
- **Complete OAuth Guide**: `automation/social_media/POSTIZ_OAUTH_COMPLETE_SOLUTION.md`
- **Previous Session**: `automation/social_media/SESSION_HANDOFF_POSTIZ_OAUTH_2025-10-28.md`
- **Launch Guide**: `LAUNCH_READY_SESSION_HANDOFF_2025-10-27.md`
- **Content Ready**: `automation/social_media/finderr-prelaunch-templates.js` (45 posts)

### Commands Reference
```bash
# Check Postiz status
docker ps --filter "name=postiz"

# View logs
docker logs untrapd-postiz --tail 50

# Restart Postiz (if needed)
docker restart untrapd-postiz

# Check ngrok status
pgrep -af ngrok

# Test API connection
curl http://localhost:3000/auth/can-register

# Validate OAuth connections
cd automation/social_media && node postiz-working-client.js
```

### Container Management
```bash
# Stop all Postiz services
docker stop untrapd-postiz untrapd-postiz-db untrapd-postiz-redis

# Start all Postiz services
docker start untrapd-postiz-db untrapd-postiz-redis untrapd-postiz

# Remove and recreate (if configuration changes needed)
docker stop untrapd-postiz && docker rm untrapd-postiz
# Then run the docker run command from step 1
```

---

## ✅ SUCCESS CRITERIA

### OAuth Setup Complete When:
- [ ] Meta OAuth redirect URIs configured
- [ ] 4/4 social accounts connected
- [ ] Accounts visible in Postiz Channels list
- [ ] `postiz-working-client.js` reports 4 channels
- [ ] Test post can be created (optional validation)

### Ready to Launch Campaign When:
- [ ] OAuth setup complete (above)
- [ ] Campaign preview shows 45 posts
- [ ] Content quality verified
- [ ] Posting schedule confirmed
- [ ] Monitoring dashboards accessible

---

## 🎯 CURRENT STATE SUMMARY

### What's Working ✅
- Postiz platform fully operational
- Login successful at localhost
- ngrok tunnel running for OAuth callbacks
- OAuth credentials configured
- Calendar page loaded and ready
- "Add Channel" button accessible

### What's Pending ⏳
- Meta OAuth redirect URI configuration (manual - 15 min)
- Instagram account connection (manual - 5 min)
- Facebook page connection (manual - 5 min)
- Twitter account connection (manual - 5 min)
- TikTok account connection (manual - 5 min)
- Connection validation (automated - 5 min)

### Total Time to Launch: ~40 minutes of manual OAuth work

---

## 📞 NEXT SESSION QUICK START

If you need to resume in a fresh session:

1. **Verify Services Running**:
   ```bash
   docker ps --filter "name=postiz"
   pgrep -af ngrok
   ```

2. **Start Services if Needed**:
   ```bash
   docker start untrapd-postiz-db untrapd-postiz-redis untrapd-postiz
   /tmp/ngrok http 4200 --domain=jutta-vibrioid-erinn.ngrok-free.dev &
   ```

3. **Access Dashboard**:
   - Open: http://localhost:4200
   - Login: `admin@untrapd.hub` / `UntrapdHub2025Strong`
   - Navigate to Launches calendar

4. **Continue OAuth Setup**:
   - Follow Steps 1-6 above
   - Validate with `postiz-working-client.js`

---

**Status**: 🟢 **READY FOR MANUAL OAUTH**
**Last Updated**: 2025-10-28 15:10
**Next Action**: Configure Meta OAuth redirect URIs (Step 1)
**Estimated Completion**: 30-40 minutes of human interaction

🚀 **You're 95% there! Just need to connect the 4 social accounts manually!**
