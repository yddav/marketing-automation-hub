# 🎬 TikTok - Get Access Token & Refresh Token

## ✅ What You Have
- ✅ Client Key: `awzpr6gs8tayotje`
- ✅ Client Secret: `zMeV70hup8dxHGstbS474TiQLIty5lAf`

## 🔧 What You Need
- 🔧 Access Token
- 🔧 Refresh Token

---

## 📋 Steps to Get Access & Refresh Tokens

### Step 1: Go to App Settings

In your TikTok Developer Dashboard (Firefox):

1. Go to **"Manage apps"** or find your app
2. Click on your app name to open app details

### Step 2: Set Up Authorization

1. Look for **"Authorization"** or **"OAuth"** section
2. Click **"Set up"** or **"Configure"**

### Step 3: Add Redirect URL

You'll need to provide a redirect URL (can be any URL you control):

```
https://hub.untrapd.com/tiktok/callback
```

Or use:
```
http://localhost:3000/callback
```

### Step 4: Select Scopes/Permissions

Select these permissions:
- ✅ **video.upload** (to post videos)
- ✅ **user.info.basic** (basic account info)
- ✅ **video.publish** (publish videos)

### Step 5: Generate Authorization URL

TikTok will give you an authorization URL that looks like:
```
https://www.tiktok.com/v2/auth/authorize?client_key=awzpr6gs8tayotje&scope=user.info.basic,video.upload,video.publish&response_type=code&redirect_uri=...
```

1. **Copy this URL**
2. **Open it in your browser**
3. **Log in with @untrapd.hub** TikTok account
4. **Authorize the app**

### Step 6: Get Authorization Code

After authorizing, you'll be redirected to your redirect URL with a `code` parameter:
```
https://hub.untrapd.com/tiktok/callback?code=AUTHORIZATION_CODE_HERE
```

**Copy the authorization code** from the URL

### Step 7: Exchange Code for Tokens

You need to make an API call to exchange the code for tokens. I can help with this!

**Paste the authorization code here** and I'll run the exchange for you, or:

Use this curl command:
```bash
curl -X POST 'https://open.tiktokapis.com/v2/oauth/token/' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'client_key=awzpr6gs8tayotje' \
  -d 'client_secret=zMeV70hup8dxHGstbS474TiQLIty5lAf' \
  -d 'code=YOUR_AUTHORIZATION_CODE' \
  -d 'grant_type=authorization_code' \
  -d 'redirect_uri=https://hub.untrapd.com/tiktok/callback'
```

This will return:
```json
{
  "access_token": "act.XXXXXXXXX",
  "refresh_token": "rft.YYYYYYYYY",
  "expires_in": 86400
}
```

---

## ⚡ EASIER METHOD: Use TikTok's Test Token

If the OAuth flow is too complex, TikTok provides **test tokens** for development:

### In Your App Dashboard:

1. Go to **"Testing"** or **"Tools"** section
2. Look for **"Generate Test Token"** or **"Get Access Token"**
3. Select your @untrapd.hub account
4. Click **"Generate"**
5. Copy the **Access Token** and **Refresh Token**

**This is the fastest method!**

---

## 📸 Send Me Screenshots

If you're stuck, send me screenshots of:
1. Your TikTok app dashboard
2. The OAuth or Authorization section
3. Any error messages

I'll guide you through it! 🚀

---

## 🎯 Once You Have the Tokens

Just paste them here:
```
Access Token: [paste]
Refresh Token: [paste]
```

And I'll add them to .env and launch the full 210-post campaign! 🚀
