# Quick Start Guide - Social Media Automation

**Created**: 2025-10-28
**Purpose**: Fastest path to FINDERR beta campaign launch

---

## 🚀 5-Minute Quick Start

### Step 1: Install (1 minute)

```bash
cd automation/social_media
pip install -r requirements.txt
```

### Step 2: Generate Templates (30 seconds)

```bash
python social-media-poster.py
```

This creates:
- `config.json` - API credentials template
- `campaign_posts.json` - Posts template

### Step 3: Get API Credentials (15 minutes)

**Meta (Instagram + Facebook)**:
1. Visit: https://developers.facebook.com/apps/738653215879612/dashboard
2. Graph API Explorer → Generate Access Token
3. Permissions: `pages_manage_posts`, `instagram_basic`, `instagram_content_publish`
4. Copy: Access Token, Instagram Account ID, Facebook Page ID

**Twitter**:
1. Visit: https://developer.twitter.com/en/portal/dashboard
2. Create project → Create app
3. Generate: API Key, API Secret, Access Token, Access Token Secret

**TikTok** (optional):
- Manual posting via TikTok Creative Center recommended
- API requires video content only

### Step 4: Configure (2 minutes)

Edit `config.json`:
```json
{
  "meta": {
    "access_token": "YOUR_META_ACCESS_TOKEN",
    "instagram_account_id": "YOUR_INSTAGRAM_ID",
    "facebook_page_id": "YOUR_FACEBOOK_PAGE_ID"
  },
  "twitter": {
    "api_key": "YOUR_TWITTER_API_KEY",
    "api_secret": "YOUR_TWITTER_API_SECRET",
    "access_token": "YOUR_TWITTER_ACCESS_TOKEN",
    "access_token_secret": "YOUR_TWITTER_ACCESS_TOKEN_SECRET"
  }
}
```

### Step 5: Add Campaign Posts (30 minutes)

Edit `campaign_posts.json` with your 45 posts.

### Step 6: Preview & Launch

```bash
# Preview entire campaign
python social-media-poster.py preview-all

# Preview today's posts
python social-media-poster.py preview-today

# Post after approval
python social-media-poster.py post
```

---

## 🔍 Preview System

### Before You Post - ALWAYS Preview

**Why preview?**
- ✅ See exactly what will be posted
- ✅ Verify media files exist
- ✅ Check Twitter 280-character limit
- ✅ Confirm hashtags are correct
- ✅ Review platforms for each post

### Preview Commands

**1. Preview Today's Posts** (recommended before daily posting):
```bash
python social-media-poster.py preview-today
```

Shows:
- Full post content with character count
- Target platforms (Instagram, Facebook, Twitter, TikTok)
- Media files with validation (✅ exists / ❌ missing)
- Hashtag analysis
- Schedule information
- Twitter character warnings

**2. Preview Entire Campaign** (before launch):
```bash
python social-media-poster.py preview-all
```

Shows:
- Campaign overview (duration, total posts, platforms)
- Platform breakdown (posts per platform)
- Daily breakdown (first 10 days)
- Warnings:
  - Posts exceeding Twitter 280 characters
  - Missing media files
  - Days without scheduled posts

**3. Simple Schedule View**:
```bash
python social-media-poster.py schedule
```

Shows:
- Next 10 scheduled posts
- Dates, platforms, status

---

## 📅 Daily Workflow

### Recommended Process

**Every morning** (or whenever you want to post):

```bash
cd automation/social_media

# Step 1: Preview today's content
python social-media-poster.py preview-today

# Step 2: Review the output
# - Check content looks good
# - Verify platforms are correct
# - Confirm media files exist
# - No Twitter character limit violations

# Step 3: Post after approval
python social-media-poster.py post
```

### What Happens During Preview

**Preview-Today Output Example**:
```
🔍 PREVIEW: 2 post(s) scheduled for 2025-01-15

====================================================================================================
📋 POST #1
====================================================================================================

📝 Content (145 characters):
----------------------------------------------------------------------------------------------------
🔐 Lost your phone? FINDERR can help! Our revolutionary app displays your emergency contact info
on your locked screen. Join our beta test today! #PhoneSecurity #FINDERR
----------------------------------------------------------------------------------------------------

🌐 Platforms (4):
  • 📸 Instagram
  • 👥 Facebook
  • 🐦 Twitter
  • 🎵 TikTok

🖼️  Media (1 files):
  ✅ 1. images/finderr-hero.jpg

🏷️  Hashtags (2):
  #PhoneSecurity, #FINDERR

📅 Scheduled: Day 0 (2025-01-15, Monday)

====================================================================================================
📊 SUMMARY
====================================================================================================
Total Posts: 2
Platforms: facebook, instagram, tiktok, twitter
Average Characters: 132
Total Media Files: 2
====================================================================================================
```

**Preview-All Output Includes**:
- 📊 Campaign duration and total posts
- 🌐 Platform breakdown (e.g., "Instagram: 40 posts (88.9%)")
- 📅 Daily breakdown showing posts per day
- ⚠️ Warnings for issues found

---

## 🎯 Use Cases

### Before Campaign Launch

```bash
# Full campaign review
python social-media-poster.py preview-all
```

**Use this to**:
- Verify all 45 posts are correct
- Check platform distribution
- Identify missing media files
- Find Twitter character limit violations
- Ensure even daily distribution

### Daily Posting Routine

```bash
# Preview today
python social-media-poster.py preview-today

# If satisfied, post
python social-media-poster.py post
```

**Use this to**:
- Review content before publishing
- Verify media files are ready
- Confirm platforms are correct
- Avoid embarrassing mistakes

### Making Changes

```bash
# After editing campaign_posts.json
python social-media-poster.py preview-all

# Verify changes are correct
python social-media-poster.py preview-today
```

**Use this to**:
- Verify edits before next post
- Check schedule changes
- Confirm new content looks good

---

## ⚠️ What Preview Catches

### Content Issues
- ✅ Twitter posts >280 characters
- ✅ Missing hashtags
- ✅ Empty content
- ✅ Character count per platform

### Media Issues
- ✅ Missing image files
- ✅ Invalid file paths
- ✅ Media not uploaded

### Schedule Issues
- ✅ Days without posts
- ✅ Too many posts per day
- ✅ Uneven distribution

### Platform Issues
- ✅ Empty platform lists
- ✅ Unsupported platforms
- ✅ Platform-specific requirements

---

## 🔧 Advanced Preview Features

### Hashtag Analysis
Automatically extracts and displays all hashtags:
```
🏷️  Hashtags (3):
  #PhoneSecurity, #FINDERR, #BetaTesting
```

### Character Count Warnings
Highlights Twitter character limit violations:
```
⚠️  WARNING: Content is 305 characters (Twitter limit: 280)
```

### Media Validation
Checks if media files exist:
```
🖼️  Media (2 files):
  ✅ 1. images/post1.jpg
  ❌ 2. images/post2.jpg  (missing!)
```

### Platform Distribution
Shows post count per platform:
```
📸 Instagram: 40 posts (88.9%)
👥 Facebook: 38 posts (84.4%)
🐦 Twitter: 35 posts (77.8%)
🎵 TikTok: 20 posts (44.4%)
```

---

## 📊 Campaign Statistics

### Preview-All Provides

**Campaign Overview**:
- Duration: 2025-01-15 to 2025-02-13 (30 days)
- Total Posts: 45
- Posts per Day (avg): 1.5
- Platforms: 4
- Average Characters: 142
- Total Hashtags: 135
- Total Media Files: 45

**Platform Breakdown**:
- Instagram: 40 posts (88.9%)
- Facebook: 38 posts (84.4%)
- Twitter: 35 posts (77.8%)
- TikTok: 20 posts (44.4%)

**Daily Breakdown**:
- Day 0 (2025-01-15): 2 posts
- Day 1 (2025-01-16): 2 posts
- Day 2 (2025-01-17): 1 post
- ... (continues for 30 days)

**Warnings** (if any):
- ⚠️ 3 posts exceed Twitter's 280 character limit
- ⚠️ 2 posts reference missing media files
- ⚠️ 5 days have no scheduled posts

---

## ✅ Checklist: Before First Post

### Campaign Setup
- [ ] Install dependencies (`pip install -r requirements.txt`)
- [ ] Get Meta access token
- [ ] Get Instagram Business Account ID
- [ ] Get Facebook Page ID
- [ ] Get Twitter API credentials
- [ ] Fill `config.json` with credentials
- [ ] Add all 45 posts to `campaign_posts.json`

### Preview & Validation
- [ ] Run `preview-all` to see full campaign
- [ ] Check campaign duration is 30 days
- [ ] Verify 45 posts total
- [ ] Confirm platform distribution
- [ ] Fix any warnings (Twitter limits, missing media)
- [ ] Run `preview-today` for first post
- [ ] Verify first post looks correct

### Launch
- [ ] Post first content: `python social-media-poster.py post`
- [ ] Verify posts appear on each platform
- [ ] Check engagement metrics

---

## 🎯 Tips for Success

### Preview Best Practices

1. **Always preview before posting**
   - Avoid embarrassing mistakes
   - Verify content is correct
   - Check media files are ready

2. **Use preview-all before launch**
   - Catch issues early
   - Verify entire campaign
   - Fix problems before day 1

3. **Review warnings carefully**
   - Twitter character limits are strict
   - Missing media will fail posts
   - Empty days might be intentional or mistakes

4. **Check media files exist**
   - ✅ means file found
   - ❌ means file missing - post will fail

5. **Verify platform distribution**
   - TikTok might have fewer posts (video only)
   - Twitter might have shorter posts
   - Instagram/Facebook usually have most posts

---

## 🚀 You're Ready!

**Next Step**: Run your first preview

```bash
cd automation/social_media
python social-media-poster.py preview-all
```

**Then**: Add your API credentials and launch campaign!

---

**Documentation**: See `README_LIGHTWEIGHT_SOLUTION.md` for complete details
**Script**: `social-media-poster.py`
**Config**: `config.json` (API credentials)
**Posts**: `campaign_posts.json` (45 campaign posts)
