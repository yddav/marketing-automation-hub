# 🚀 Quick Token Collection Guide - 30 Minutes

The interactive wizard is running and waiting for your tokens. Follow these steps:

## Step 1: Facebook App Creation (5 minutes)

You're already on the Facebook Developer Portal. Complete the app creation:

1. **Fill in App Details**:
   - App name: `UNTRAPD Hub Social Automation`
   - App contact email: `untrapd77@gmail.com` (already filled)
   - Click **Next**

2. **Select Use Case**:
   - Choose **Other** or **Business**
   - Click **Next**

3. **Skip Business Portfolio** (if asked)
   - Click **Skip** or **Next**

4. **Review and Create**:
   - Click **Create App**

5. **Copy Your App ID and App Secret**:
   - You'll see them on the app dashboard
   - Save these for later reference

---

## Step 2: Get Instagram Token (5 minutes)

1. **Navigate to Graph API Explorer**:
   - Visit: https://developers.facebook.com/tools/explorer/
   - Select your new app: "UNTRAPD Hub Social Automation"

2. **Configure for Instagram**:
   - Click on "User or Page" dropdown
   - Select **Instagram Business Account**
   - Look for `@untrapd.hub` or ID `76216363129`

3. **Add Permissions**:
   - Click "Add a permission" button
   - Select these permissions:
     - ✅ `instagram_basic`
     - ✅ `instagram_content_publish`
     - ✅ `instagram_manage_insights`
   - Click **Add**

4. **Generate Token**:
   - Click **"Generate Access Token"** button
   - Authorize the permissions when prompted
   - **Copy the entire token** (starts with `EAAG...`)
   - This is your `INSTAGRAM_ACCESS_TOKEN`

---

## Step 3: Get Facebook Page Token (3 minutes)

1. **Still in Graph API Explorer**:
   - Change "User or Page" dropdown to **Page**
   - Select `untrapd hub` or ID `750014458192598`

2. **Add Permissions**:
   - ✅ `pages_show_list`
   - ✅ `pages_manage_posts`
   - ✅ `pages_read_engagement`

3. **Generate Token**:
   - Click **"Generate Access Token"**
   - **Copy the token** (starts with `EAAG...`)
   - This is your `FACEBOOK_PAGE_TOKEN`

---

## Step 4: Make Tokens Long-Lived (Optional - 2 minutes)

Your tokens expire in 1 hour by default. To extend them to 60 days:

1. Visit: https://developers.facebook.com/tools/debug/accesstoken/
2. Paste your Instagram token → Click **"Extend Access Token"**
3. Copy the new extended token
4. Repeat for Facebook token

---

## Step 5: Enter Tokens in Wizard

The wizard is currently waiting for your Instagram token. You can:

**Option A: Enter tokens interactively**
- Go to the terminal running `setup-tokens.js`
- Paste Instagram token when prompted
- Continue with Facebook, TikTok, Twitter tokens

**Option B: Create .env file manually**
- Create file: `automation/social_media/.env`
- Copy template below and fill in tokens
- Run `npm run validate` to test

---

## .env Template

```bash
# INSTAGRAM
INSTAGRAM_ACCESS_TOKEN=EAAG...paste_your_token_here
INSTAGRAM_BUSINESS_ACCOUNT_ID=76216363129

# FACEBOOK
FACEBOOK_PAGE_TOKEN=EAAG...paste_your_token_here
FACEBOOK_PAGE_ID=750014458192598

# TIKTOK (skip for now - can add later)
TIKTOK_CLIENT_KEY=
TIKTOK_CLIENT_SECRET=
TIKTOK_ACCESS_TOKEN=
TIKTOK_REFRESH_TOKEN=

# TWITTER (skip for now - can add later)
TWITTER_API_KEY=
TWITTER_API_SECRET=
TWITTER_BEARER_TOKEN=

# FINDERR
FINDERR_MILESTONE_API=https://hub.untrapd.com/.netlify/functions/finderr-milestones

# SYSTEM
NODE_ENV=production
DEMO_MODE=false
```

---

## Quick Start with Instagram + Facebook Only

You can start with just Instagram and Facebook tokens:

1. Get Instagram token (Step 2 above)
2. Get Facebook token (Step 3 above)
3. Create `.env` file with just these 2 tokens
4. Skip TikTok and Twitter for now
5. Run: `npm run finderr-preview` to test
6. Run: `npm run finderr-launch` to go live!

**Note**: The system will skip TikTok/Twitter posts if tokens aren't configured.

---

## After You Have Tokens

```bash
# Test tokens work
npm run validate

# Preview first 7 days
npm run finderr-preview

# Launch campaign
npm run finderr-launch

# Or use PM2 for 24/7
npm install -g pm2
npm run pm2-finderr
npm run pm2-logs
```

---

## Need Help?

- **Token not working?** Make sure you selected the correct account/page
- **Permissions error?** Double-check all permissions are added
- **Token expired?** Extend using Access Token Debugger (Step 4)

**You're 30 minutes away from full automation!** 🚀
