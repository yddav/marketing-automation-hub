# 🔑 Get Your API Tokens - Complete Visual Guide

**Time Required**: 30 minutes total
**Cost**: 100% FREE (no credit card needed)

---

## 📱 FACEBOOK & INSTAGRAM TOKENS (15 minutes)

### Step 1: Open Graph API Explorer
1. Visit: **https://developers.facebook.com/tools/explorer/**
2. Login with your Facebook account (the one that manages @untrapd.hub)

### Step 2: Get Instagram Token
1. In Graph API Explorer:
   - **Meta App**: Select your app (or click "Create App" if you don't have one)
   - **User or Page**: Select "Instagram Business Account"
   - Look for "@untrapd.hub" or ID "76216363129"

2. Add Permissions (click "Add a permission"):
   - `instagram_basic`
   - `instagram_content_publish` 
   - `instagram_manage_insights`

3. Click **"Generate Access Token"**
4. Copy the token (starts with `EAAG...`)
5. Save it - this is your `INSTAGRAM_ACCESS_TOKEN`

### Step 3: Get Facebook Token
1. Still in Graph API Explorer:
   - **User or Page**: Select "Page"
   - Look for "untrapd hub" or ID "750014458192598"

2. Add Permissions:
   - `pages_show_list`
   - `pages_manage_posts`
   - `pages_read_engagement`

3. Click **"Generate Access Token"**
4. Copy the token (starts with `EAAG...`)
5. Save it - this is your `FACEBOOK_PAGE_TOKEN`

### Step 4: Make Tokens Long-Lived (Optional but Recommended)
1. Visit: **https://developers.facebook.com/tools/debug/accesstoken/**
2. Paste your token
3. Click "Extend Access Token"
4. Copy the new token (lasts 60 days instead of 1 hour)

---

## 🎵 TIKTOK TOKENS (10 minutes)

### Step 1: Create Developer Account
1. Visit: **https://developers.tiktok.com/**
2. Login with @untrapd.hub TikTok account
3. Click "Register" to become a developer (FREE)
4. Complete business profile

### Step 2: Create App
1. Go to "My Apps" → "Create an App"
2. Fill in:
   - **App Name**: "UNTRAPD Hub Automation"
   - **App Type**: "Web App"
   - **Use Case**: "Content Management & Publishing"

3. Enable Products:
   - Select "Content Posting API"
   - Apply for access (usually approved in 24-48 hours)

### Step 3: Get Credentials
1. In App Dashboard:
   - Copy **Client Key** (like app ID)
   - Copy **Client Secret**
   - These are `TIKTOK_CLIENT_KEY` and `TIKTOK_CLIENT_SECRET`

### Step 4: Get Access Token
1. Go to "Authorization" tab
2. Click "Generate Code"
3. Select scopes:
   - `video.upload`
   - `video.publish`
   - `user.info.basic`

4. Authorize with your @untrapd.hub account
5. Copy the **Access Token** and **Refresh Token**
6. These are `TIKTOK_ACCESS_TOKEN` and `TIKTOK_REFRESH_TOKEN`

---

## 🐦 TWITTER TOKENS (5 minutes)

### Step 1: Create Developer Account
1. Visit: **https://developer.twitter.com/en/portal/dashboard**
2. Login with @untrapd.hub Twitter account
3. Apply for developer access (FREE - "Hobbyist" tier)

### Step 2: Create Project & App
1. Click "Create Project"
2. Fill in:
   - **Project Name**: "UNTRAPD Hub Automation"
   - **Use Case**: "Making a bot"

3. Create App:
   - **App Name**: "untrapd-hub-bot"
   - **Environment**: "Production"

### Step 3: Get Tokens
1. In App Settings:
   - Go to "Keys and Tokens"
   - Generate **API Key** and **API Secret**
   - Generate **Bearer Token**

2. Save these:
   - `TWITTER_API_KEY` = API Key
   - `TWITTER_API_SECRET` = API Secret
   - `TWITTER_BEARER_TOKEN` = Bearer Token

---

## 📝 ENTER YOUR TOKENS

Once you have all tokens, create `.env` file:

```bash
cd automation/social_media
nano .env  # or use your favorite editor
```

Paste this template and fill in your tokens:

```bash
# INSTAGRAM
INSTAGRAM_ACCESS_TOKEN=EAAG...your_instagram_token_here
INSTAGRAM_BUSINESS_ACCOUNT_ID=76216363129

# FACEBOOK  
FACEBOOK_PAGE_TOKEN=EAAG...your_facebook_token_here
FACEBOOK_PAGE_ID=750014458192598

# TIKTOK
TIKTOK_CLIENT_KEY=your_tiktok_client_key_here
TIKTOK_CLIENT_SECRET=your_tiktok_client_secret_here
TIKTOK_ACCESS_TOKEN=your_tiktok_access_token_here
TIKTOK_REFRESH_TOKEN=your_tiktok_refresh_token_here

# TWITTER
TWITTER_API_KEY=your_twitter_api_key_here
TWITTER_API_SECRET=your_twitter_api_secret_here
TWITTER_BEARER_TOKEN=your_twitter_bearer_token_here

# FINDERR
FINDERR_MILESTONE_API=https://hub.untrapd.com/.netlify/functions/finderr-milestones

# SYSTEM
NODE_ENV=production
DEMO_MODE=false
```

Save the file (Ctrl+O, Enter, Ctrl+X in nano)

---

## ✅ VALIDATE & LAUNCH

After saving `.env`:

```bash
# Validate tokens
npm run validate

# Preview campaign
npm run finderr-preview

# Launch campaign
npm run finderr-launch

# Or start 24/7 automation
npm install -g pm2
npm run pm2-finderr
```

---

## 🆘 TROUBLESHOOTING

**"Instagram token invalid"**
- Make sure you selected Instagram Business Account (not personal)
- Account must be 76216363129
- Need permissions: instagram_basic, instagram_content_publish

**"Facebook permissions error"**  
- Must have admin access to Page 750014458192598
- Need permissions: pages_show_list, pages_manage_posts

**"TikTok not approved"**
- Content Posting API approval takes 24-48 hours
- Start with Instagram/Facebook while waiting

**"Twitter rate limit"**
- Free tier has limits, system respects them automatically
- Can upgrade to Basic ($100/month) for higher limits if needed

---

## 🎉 YOU'RE READY!

Once tokens are in `.env`, run:

```bash
npm run finderr-launch
```

And your 210-post campaign goes live! 🚀
