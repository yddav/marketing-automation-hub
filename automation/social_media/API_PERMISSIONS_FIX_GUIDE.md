# 🔧 API Permissions Fix Guide - CRITICAL

**Issue**: All 3 platforms failing due to missing permissions
**Status**: BLOCKING CAMPAIGN LAUNCH
**Estimated Fix Time**: 30-45 minutes

---

## ❌ Current Errors

### Instagram Error:
```
Object with ID '76216363129' does not exist, cannot be loaded due to missing permissions
```

### Facebook Error:
```
requires both pages_read_engagement and pages_manage_posts as an admin with sufficient administrative permission
```

### Twitter Error:
```
Your client app is not configured with the appropriate oauth1 app permissions for this endpoint
```

---

## 🔧 FIX 1: Instagram/Facebook Permissions

### Step 1: Add Required Permissions to Your App

1. Go to: https://developers.facebook.com/apps/738653215879613/app-review/permissions/
2. Click **"Request Advanced Access"** for these permissions:
   - ✅ `pages_read_engagement`
   - ✅ `pages_manage_posts`
   - ✅ `instagram_basic`
   - ✅ `instagram_content_publish`

3. **Or** if permissions are already listed, click "Upgrade to Advanced Access"

### Step 2: Connect Instagram Business Account

1. Go to: https://developers.facebook.com/apps/738653215879613/instagram-basic-display/
2. Or navigate to: **Products** → **Instagram** → **Basic Display**
3. Add Instagram Tester: @untrapd.hub
4. Accept the invitation on Instagram

### Step 3: Verify Account IDs

**Check Instagram Business Account ID:**
```bash
# In Firefox, open Graph API Explorer
https://developers.facebook.com/tools/explorer/

# Run this query:
me?fields=id,name,instagram_business_account

# Should return:
{
  "instagram_business_account": {
    "id": "76216363129"  # ← This should match
  }
}
```

**Check Facebook Page ID:**
```bash
# In Graph API Explorer, run:
me/accounts

# Should return your page with ID: 750014458192598
```

### Step 4: Regenerate Token with All Permissions

1. Go to: https://developers.facebook.com/tools/explorer/
2. Select your app: **UNTRAPD Social Automation (738653215879613)**
3. Select: **User or Page** → **untrapd hub (Facebook Page)**
4. Click **"Add a Permission"** and add:
   - `pages_show_list`
   - `pages_read_engagement`
   - `pages_manage_posts`
   - `instagram_basic`
   - `instagram_content_publish`
   - `pages_read_user_content`

5. Click **"Generate Access Token"**
6. **IMPORTANT**: Extend token to 60 days:
   - Go to: https://developers.facebook.com/tools/debug/accesstoken/
   - Paste your new token
   - Click "Extend Access Token"
   - Copy the extended token

7. Update `.env` file with new token

---

## 🔧 FIX 2: Twitter App Permissions

### Step 1: Enable Read & Write Permissions

1. Go to: https://developer.twitter.com/en/portal/projects/1979161952715722752/apps/1979161952715722752DavisUntrap/settings
2. Click **"User authentication settings"** → **"Set up"**
3. Select **"Read and write"** permissions (NOT just "Read-only")
4. **App permissions**:
   - ✅ Read and write
   - ✅ Direct messages (optional)

5. **Type of App**: Web App, Automated App or Bot
6. **App info**:
   - Callback URL: `https://hub.untrapd.com/twitter/callback`
   - Website URL: `https://hub.untrapd.com`

7. Click **"Save"**

### Step 2: Regenerate Access Tokens

**IMPORTANT**: After changing permissions, you MUST regenerate tokens!

1. Go to: **Keys and tokens** tab
2. **Regenerate** both:
   - ✅ Access Token
   - ✅ Access Token Secret

3. Copy the NEW tokens (old ones won't work with write permissions)

4. Update `.env` file:
```bash
TWITTER_ACCESS_TOKEN=<new_access_token>
TWITTER_ACCESS_TOKEN_SECRET=<new_access_token_secret>
```

### Step 3: Verify Permissions

```bash
# Test with curl:
curl -X POST https://api.twitter.com/2/tweets \
  -H "Authorization: OAuth ..." \
  -H "Content-Type: application/json" \
  -d '{"text": "Test tweet from FINDERR automation"}'
```

---

## 🔧 FIX 3: Alternative - Use Different Endpoints

If permissions are blocked, we can use alternative approaches:

### Instagram Alternative: Direct Upload API

```javascript
// Instead of media container, use direct upload:
const formData = new FormData();
formData.append('image_url', imageUrl);
formData.append('caption', caption);

// Post directly
axios.post(`https://graph.facebook.com/v18.0/${pageId}/photos`, formData);
```

### Facebook Alternative: Page Post Without Advanced Permissions

```javascript
// Use page token for simpler posting:
axios.post(`https://graph.facebook.com/v18.0/${pageId}/feed`, {
  message: content,
  access_token: pageToken
});
```

### Twitter Alternative: Use Twitter API v1.1

```javascript
// Fallback to v1.1 endpoint:
POST https://api.twitter.com/1.1/statuses/update.json
```

---

## ✅ Verification Checklist

### Instagram/Facebook:
- [ ] App has Advanced Access for all required permissions
- [ ] Instagram Business Account connected to app
- [ ] Page admin role confirmed
- [ ] New token generated with all permissions
- [ ] Token extended to 60 days

### Twitter:
- [ ] App permissions changed to "Read and write"
- [ ] Access tokens regenerated (CRITICAL!)
- [ ] New tokens updated in .env
- [ ] Test tweet successful

---

## 🚀 After Fixes - Test Commands

### Test Single Platform:
```bash
# Test Instagram
curl -X POST "https://graph.facebook.com/v18.0/76216363129/media" \
  -d "caption=Test post" \
  -d "access_token=YOUR_TOKEN"

# Test Facebook
curl -X POST "https://graph.facebook.com/v18.0/750014458192598/feed" \
  -d "message=Test post" \
  -d "access_token=YOUR_TOKEN"

# Test Twitter (after OAuth implementation)
node finderr-native-launcher.js day 1
```

### Test Full Day 1:
```bash
cd automation/social_media
node finderr-native-launcher.js day 1
```

### Launch Full Campaign:
```bash
node finderr-native-launcher.js launch
```

---

## 📞 Support Resources

- **Facebook/Instagram**: https://developers.facebook.com/support/
- **Twitter**: https://twittercommunity.com/c/rest-api/61
- **Documentation**:
  - Facebook Graph API: https://developers.facebook.com/docs/graph-api/
  - Twitter API v2: https://developer.twitter.com/en/docs/twitter-api

---

## ⚡ Quick Fix Summary

1. **Instagram/Facebook** (15 min):
   - Add advanced permissions to app
   - Connect Instagram Business Account
   - Regenerate & extend token

2. **Twitter** (10 min):
   - Enable read+write permissions
   - Regenerate access tokens
   - Update .env

3. **Test** (5 min):
   - Run `node finderr-native-launcher.js day 1`
   - Verify at least 1 post succeeds on each platform

4. **Launch** (1 min):
   - Run `node finderr-native-launcher.js launch`
   - Monitor first batch of posts

---

**Last Updated**: 2025-10-17
**Status**: AWAITING PERMISSION FIXES
**Next Action**: Complete permission setup for all 3 platforms
