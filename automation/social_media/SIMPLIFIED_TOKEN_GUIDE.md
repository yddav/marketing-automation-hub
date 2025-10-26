# 🚀 SIMPLIFIED Token Collection - Skip App Creation!

**Good news**: You don't need to create a Facebook app to get tokens! The Graph API Explorer has a built-in test app.

## Step 1: Get Instagram & Facebook Tokens (10 minutes)

### Navigate to Graph API Explorer
1. **Open**: https://developers.facebook.com/tools/explorer/
2. You'll see the Graph API Explorer interface

### Get Instagram Business Account Token

1. **Select Meta App Dropdown**:
   - Look for dropdown that says "Graph API Explorer" or shows an app name
   - It should already have a default test app selected
   - **Keep the default app** - no need to create your own!

2. **Select User or Page**:
   - Click the "User or Page" dropdown
   - Select **"Instagram Business Account"**
   - Look for `@untrapd.hub` or Account ID `76216363129`

3. **Add Permissions**:
   - Click **"Add a permission"** or "Permissions" section
   - Search and select these permissions:
     - ✅ `instagram_basic`
     - ✅ `instagram_content_publish`
     - ✅ `instagram_manage_insights`

4. **Generate Access Token**:
   - Click **"Generate Access Token"** button
   - A popup will ask you to authorize - click **"Continue"** and **"OK"**
   - **Copy the entire token** from the "Access Token" field
   - It starts with `EAAG...` and is very long
   - Save it temporarily - this is your `INSTAGRAM_ACCESS_TOKEN`

### Get Facebook Page Token

1. **Change User or Page**:
   - In the same Graph API Explorer page
   - Click "User or Page" dropdown again
   - Select **"Page"**
   - Look for `untrapd hub` or Page ID `750014458192598`

2. **Add Permissions**:
   - Click "Add a permission"
   - Search and select:
     - ✅ `pages_show_list`
     - ✅ `pages_manage_posts`
     - ✅ `pages_read_engagement`

3. **Generate Token**:
   - Click **"Generate Access Token"**
   - Authorize the permissions
   - **Copy the token** from "Access Token" field
   - Save it - this is your `FACEBOOK_PAGE_TOKEN`

---

## Step 2: Enter Tokens (2 methods)

### Method A: Use the Interactive Wizard (Recommended)

The wizard is already running in your terminal! Just go back to it and paste the tokens:

1. **Instagram Token**: Paste when prompted "📸 Instagram Access Token:"
2. **Facebook Token**: Paste when prompted "📘 Facebook Page Token:"
3. **TikTok/Twitter**: Press Enter to skip for now (we'll add later)
4. The wizard will create the `.env` file automatically

### Method B: Create .env File Manually

If the wizard closed, create the file manually:

```bash
cd /media/wolfy/D260DD2060DD0BDB/Datas/2025\ Projects/AppBuildFlutterVscodiumClaude/Hub_App_Shop_Integ/automation/social_media

# Create .env file
cat > .env << 'EOF'
# INSTAGRAM
INSTAGRAM_ACCESS_TOKEN=EAAG...paste_your_instagram_token_here
INSTAGRAM_BUSINESS_ACCOUNT_ID=76216363129

# FACEBOOK
FACEBOOK_PAGE_TOKEN=EAAG...paste_your_facebook_token_here
FACEBOOK_PAGE_ID=750014458192598

# TIKTOK (can skip for now)
TIKTOK_CLIENT_KEY=
TIKTOK_CLIENT_SECRET=
TIKTOK_ACCESS_TOKEN=
TIKTOK_REFRESH_TOKEN=

# TWITTER (can skip for now)
TWITTER_API_KEY=
TWITTER_API_SECRET=
TWITTER_BEARER_TOKEN=

# FINDERR
FINDERR_MILESTONE_API=https://hub.untrapd.com/.netlify/functions/finderr-milestones

# SYSTEM
NODE_ENV=production
DEMO_MODE=false
EOF
```

Then edit the file and replace the token placeholders with your actual tokens.

---

## Step 3: Test & Launch

```bash
# Validate tokens work
npm run validate

# Preview first 7 days
npm run finderr-preview

# Launch full 30-day campaign!
npm run finderr-launch
```

---

## Token Lifespan & Renewal

**Important**: Tokens from Graph API Explorer expire in **1 hour** by default.

### Option 1: Extend to 60 Days (Recommended)
1. Visit: https://developers.facebook.com/tools/debug/accesstoken/
2. Paste your token
3. Click **"Extend Access Token"**
4. Copy the new extended token
5. Replace in your `.env` file

### Option 2: Quick Re-generate When Expired
Just repeat Step 1 above (takes 2 minutes) and update `.env`

---

## Why This Works Without Creating an App

- Graph API Explorer provides a **test app automatically**
- This test app has all the permissions we need
- Perfect for development and testing
- No app review process needed
- Tokens work immediately

---

## What About TikTok & Twitter?

**Start with Instagram + Facebook only!**

The system will automatically skip TikTok and Twitter if those tokens aren't configured. You can add them later:

- **TikTok**: Requires Developer Account (10 min) - https://developers.tiktok.com/
- **Twitter**: Requires Developer Account (5 min) - https://developer.twitter.com/

For now, **60 posts (Instagram) + 30 posts (Facebook) = 90 posts over 30 days** is a solid start!

---

## Ready to Go!

Once you have Instagram + Facebook tokens:

```bash
npm run finderr-launch
```

**Your automated campaign launches in 5 minutes!** 🚀
