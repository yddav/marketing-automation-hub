# 🚀 Full Steam Launch - Get Remaining Tokens

## What We Have ✅
- ✅ Instagram token: READY
- ✅ Facebook token: READY

## What We Need 🔧

### 1. TikTok Business API Tokens (10 minutes)
### 2. Twitter/X API Tokens (10 minutes)

---

## 🎬 TIKTOK TOKENS (Priority 1)

### Quick Method - TikTok Business API

**You need 4 tokens**:
1. `TIKTOK_CLIENT_KEY` (App Client Key)
2. `TIKTOK_CLIENT_SECRET` (App Client Secret)
3. `TIKTOK_ACCESS_TOKEN` (User Access Token)
4. `TIKTOK_REFRESH_TOKEN` (Refresh Token)

### Steps:

1. **Go to TikTok Developer Portal**
   - URL: https://developers.tiktok.com/
   - Login with your @untrapd.hub TikTok account

2. **Create Developer Account** (if not done)
   - Click "Register" or "Get Started"
   - Verify email
   - Complete profile

3. **Create New App**
   - Click "Manage apps" → "Create an app"
   - App name: `UNTRAPD Social Automation`
   - Category: `Utilities` or `Social Media`

4. **Enable Content Posting API**
   - In app settings, find "Products"
   - Enable "Content Posting API" (or "Video Kit")
   - Accept terms

5. **Get Client Credentials**
   - Go to app dashboard
   - Find "Client Key" and "Client Secret"
   - Copy both

6. **Generate Access Token**
   - Go to "Authorization" or "OAuth" section
   - Click "Generate token" or use OAuth flow
   - Authorize your @untrapd.hub account
   - Copy "Access Token" and "Refresh Token"

**What to copy**:
```
TIKTOK_CLIENT_KEY=awXXXXXXXXXXXXXXXXXX
TIKTOK_CLIENT_SECRET=YYYYYYYYYYYYYYYYYYYY
TIKTOK_ACCESS_TOKEN=act.ZZZZZZZZZZZZZZZZZZZZ
TIKTOK_REFRESH_TOKEN=rft.WWWWWWWWWWWWWWWWWW
```

---

## 🐦 TWITTER/X TOKENS (Priority 2)

### Quick Method - Twitter Developer Portal

**You need 5 tokens**:
1. `TWITTER_API_KEY` (Consumer Key)
2. `TWITTER_API_SECRET` (Consumer Secret)
3. `TWITTER_BEARER_TOKEN`
4. `TWITTER_ACCESS_TOKEN`
5. `TWITTER_ACCESS_TOKEN_SECRET`

### Steps:

1. **Go to Twitter Developer Portal**
   - URL: https://developer.twitter.com/en/portal/dashboard
   - Login with @DavisUntrap account

2. **Apply for Developer Account** (if not done)
   - Click "Apply for a developer account"
   - Select "Hobbyist" → "Making a bot"
   - Fill in description: "Automated social media posting for FINDERR app launch campaign"
   - Submit and wait for approval (usually instant to 24 hours)

3. **Create Project & App**
   - Once approved, click "Create Project"
   - Project name: `UNTRAPD Automation`
   - Use case: `Making a bot`
   - Description: `Automated posting for FINDERR Android app`
   - Click "Next" and "Create App"
   - App name: `FINDERR Campaign Bot`

4. **Get API Keys** (shown immediately after app creation)
   - **API Key** (Consumer Key)
   - **API Secret** (Consumer Secret)
   - **Bearer Token**
   - **SAVE THESE!** You can only see them once.

5. **Generate Access Tokens**
   - Go to app settings → "Keys and tokens"
   - Under "Access Token and Secret", click "Generate"
   - Copy **Access Token** and **Access Token Secret**

6. **Set Permissions**
   - Go to "User authentication settings"
   - Click "Set up"
   - App permissions: **Read and Write** (NOT Read-only!)
   - Type of App: **Web App**
   - Callback URL: `https://hub.untrapd.com/callback`
   - Website URL: `https://hub.untrapd.com`
   - Save

**What to copy**:
```
TWITTER_API_KEY=XXXXXXXXXXXXXXXXXXXXXXXXXXXX
TWITTER_API_SECRET=YYYYYYYYYYYYYYYYYYYYYYYYYYYY
TWITTER_BEARER_TOKEN=AAAAAAAAAAAAAAAAAAAAAAAAAAAAA
TWITTER_ACCESS_TOKEN=1234567890-ZZZZZZZZZZZZZZZZZ
TWITTER_ACCESS_TOKEN_SECRET=WWWWWWWWWWWWWWWWWWWWW
```

---

## ⚡ FASTEST PATH TO LAUNCH

### Option A: Let Me Help You Get Them (Recommended)

**For Twitter**: I can open the developer portal and guide you through with browser automation.

**For TikTok**: I can open the developer portal and guide you through with browser automation.

### Option B: You Get Them Manually

Open the URLs above in your browser and follow the steps. Should take about 20 minutes total.

---

## 📋 Once You Have the Tokens

**Method 1: Paste them directly to me**
Just paste all the tokens here and I'll add them to `.env`

**Method 2: Edit `.env` yourself**
Open `automation/social_media/.env` and fill in the empty fields

**Method 3: Use the wizard**
The terminal wizard (Bash 522d63) is still running if you want to paste them there

---

## 🎯 What Happens After We Add Tokens?

```bash
npm run finderr-launch
```

This starts the full 210-post campaign:
- ✅ 60 Instagram posts (2/day)
- ✅ 30 Facebook posts (1/day)
- ✅ 30 TikTok videos (1/day)
- ✅ 90 Twitter posts (3/day)

All running automatically for 30 days! 🚀

---

## 🤖 Let Me Help!

**Do you want me to**:
1. **Open Twitter Developer Portal** and guide you through?
2. **Open TikTok Developer Portal** and guide you through?
3. **Wait for you** to get the tokens manually?

Just let me know and I'll help you get this launched in the next 20 minutes!
