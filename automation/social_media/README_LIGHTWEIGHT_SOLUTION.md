# Lightweight Social Media Automation Solution

**Created**: 2025-01-14
**Purpose**: FINDERR Beta Campaign automation without heavy Postiz deployment
**Memory Usage**: <100MB
**Execution**: Once per day, manual trigger

---

## ✅ Solution Overview

This lightweight Python script replaces the failed Postiz deployment attempts (Railway/Render) with direct API integration to social media platforms.

**Why This Solution**:
- ✅ **Zero hosting costs** - runs on your laptop
- ✅ **Minimal resources** - <100MB RAM vs Postiz 1GB+
- ✅ **Simple operation** - run once per day when you want to post
- ✅ **Direct APIs** - no middleware, no PM2, no Docker complexity
- ✅ **Campaign ready** - handles all 45 posts, 4 platforms, 30 days

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd automation/social_media
pip install -r requirements.txt
```

**Dependencies**:
- `requests` - HTTP library for API calls
- `tweepy` - Twitter API wrapper
- `python-dotenv` - Environment variable management

### 2. First Run (Creates Templates)

```bash
python social-media-poster.py
```

This creates two template files:
- `config.json` - API credentials configuration
- `campaign_posts.json` - Your 45 campaign posts

### 3. Configure API Credentials

Edit `config.json` with your actual credentials:

```json
{
  "meta": {
    "app_id": "738653215879612",
    "app_secret": "be8297b868a6762ad54d4530545428fd",
    "access_token": "GET_THIS_FROM_META_DEVELOPER_CONSOLE",
    "instagram_account_id": "GET_THIS_FROM_INSTAGRAM_BUSINESS_ACCOUNT",
    "facebook_page_id": "GET_THIS_FROM_FACEBOOK_PAGE"
  },
  "twitter": {
    "api_key": "GET_FROM_TWITTER_DEVELOPER_PORTAL",
    "api_secret": "GET_FROM_TWITTER_DEVELOPER_PORTAL",
    "access_token": "GET_FROM_TWITTER_DEVELOPER_PORTAL",
    "access_token_secret": "GET_FROM_TWITTER_DEVELOPER_PORTAL"
  },
  "tiktok": {
    "client_key": "awzpr6gs8tayotje",
    "client_secret": "zMeV70hup8dxHGstbS474TiQLIty5lAf",
    "access_token": "GET_FROM_TIKTOK_DEVELOPER_PORTAL"
  }
}
```

### 4. Add Your Campaign Posts

Edit `campaign_posts.json` with your 45 posts:

```json
[
  {
    "id": 1,
    "content": "🔐 Lost your phone? FINDERR can help!",
    "platforms": ["instagram", "facebook", "twitter", "tiktok"],
    "media": ["images/post1.jpg"],
    "schedule_days": 0
  },
  {
    "id": 2,
    "content": "💡 Beta testers wanted!",
    "platforms": ["instagram", "facebook", "twitter"],
    "media": ["images/post2.jpg"],
    "schedule_days": 1
  }
]
```

### 5. Preview Your Campaign

**Preview today's posts** (see exactly what will be posted):
```bash
python social-media-poster.py preview-today
```

**Preview entire campaign** (full statistics and warnings):
```bash
python social-media-poster.py preview-all
```

**View simple schedule**:
```bash
python social-media-poster.py schedule
```

### 6. Post Today's Content

```bash
python social-media-poster.py post
```

---

## 📋 Getting API Credentials

### Meta (Instagram + Facebook)

1. **Meta Developer Console**: https://developers.facebook.com/apps/738653215879612

2. **Get Access Token**:
   - Go to Tools → Graph API Explorer
   - Select your app
   - Add permissions: `pages_manage_posts`, `instagram_basic`, `instagram_content_publish`
   - Generate Access Token
   - **Important**: Use "Long-Lived Token" (60 days) instead of short-lived

3. **Get Instagram Business Account ID**:
   ```bash
   curl "https://graph.facebook.com/v21.0/me/accounts?access_token=YOUR_ACCESS_TOKEN"
   # Find your page's instagram_business_account.id
   ```

4. **Get Facebook Page ID**:
   - Go to your Facebook Page
   - Click "About" → Page Transparency → Page ID

### Twitter

1. **Twitter Developer Portal**: https://developer.twitter.com/en/portal/dashboard

2. **Create Project & App**:
   - Create new project
   - Create app within project
   - Set up OAuth 1.0a User Authentication

3. **Generate Keys**:
   - API Key and Secret (Consumer Keys)
   - Access Token and Secret (User Authentication Tokens)
   - Ensure app has "Read and Write" permissions

### TikTok

1. **TikTok Developers**: https://developers.tiktok.com/

2. **Create App**:
   - Register developer account
   - Create new app
   - Get Client Key (already have: `awzpr6gs8tayotje`)
   - Get Client Secret (already have: `zMeV70hup8dxHGstbS474TiQLIty5lAf`)

3. **Get Access Token**:
   - Go through OAuth flow
   - Request `video.upload` scope
   - Save long-lived access token

**Note**: TikTok requires video content. For text/image posts, use TikTok Creative Center manually.

---

## 🔍 Campaign Preview System

### Preview Modes

**1. Preview Today's Posts** - See exactly what will be posted before publishing:

```bash
python social-media-poster.py preview-today
```

**Output includes**:
- 📝 Full post content with character count
- 🌐 Target platforms for each post
- 🖼️ Media files (with validation checks)
- 🏷️ Hashtag analysis
- 📅 Scheduled date and day of week
- ⚠️ Twitter character limit warnings
- 📊 Summary statistics

**2. Preview Entire Campaign** - Comprehensive overview of all 45 posts:

```bash
python social-media-poster.py preview-all
```

**Output includes**:
- 📊 Campaign overview (duration, total posts, platforms)
- 🌐 Platform breakdown (post count per platform)
- 📅 Daily breakdown (first 10 days)
- ⚠️ Warnings:
  - Twitter posts exceeding 280 characters
  - Missing media files
  - Days without scheduled posts

**Example Preview Output**:

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

---

## 📅 Campaign Workflow

### Recommended Workflow (Review Before Publishing)

**Step 1: Preview today's content** (review before posting):
```bash
cd automation/social_media
python social-media-poster.py preview-today
```

**Step 2: Review the preview output**:
- ✅ Check content is correct
- ✅ Verify platforms are correct
- ✅ Confirm media files exist
- ✅ Check no Twitter character limit violations
- ✅ Verify hashtags are appropriate

**Step 3: Post after approval**:
```bash
python social-media-poster.py post
```

### Daily Routine (30 Days)

**Every morning** (or whenever you want to post today's content):

```bash
cd automation/social_media

# Preview first (recommended)
python social-media-poster.py preview-today

# Review output, then post
python social-media-poster.py post
```

**What happens during posting**:
1. Script loads your 45 posts
2. Checks which posts are scheduled for today
3. Posts to Instagram, Facebook, Twitter (TikTok manual)
4. Shows success/failure for each platform
5. Marks posts as completed

### Schedule Management

**View upcoming posts**:
```bash
python social-media-poster.py schedule
```

**Preview entire campaign** (before launch):
```bash
python social-media-poster.py preview-all
```

**Modify schedule**:
- Edit `campaign_posts.json`
- Change `schedule_days` values
- Run `preview-all` to verify changes
- Next `post` run will use new schedule

---

## 🔧 Configuration Details

### config.json Structure

```json
{
  "meta": {
    "app_id": "YOUR_META_APP_ID",
    "app_secret": "YOUR_META_APP_SECRET",
    "access_token": "YOUR_LONG_LIVED_ACCESS_TOKEN",
    "instagram_account_id": "INSTAGRAM_BUSINESS_ACCOUNT_ID",
    "facebook_page_id": "FACEBOOK_PAGE_ID"
  },
  "twitter": {
    "api_key": "TWITTER_API_KEY",
    "api_secret": "TWITTER_API_SECRET",
    "access_token": "TWITTER_ACCESS_TOKEN",
    "access_token_secret": "TWITTER_ACCESS_TOKEN_SECRET"
  },
  "tiktok": {
    "client_key": "TIKTOK_CLIENT_KEY",
    "client_secret": "TIKTOK_CLIENT_SECRET",
    "access_token": "TIKTOK_ACCESS_TOKEN"
  },
  "campaign": {
    "posts_file": "campaign_posts.json",
    "schedule_start_date": "2025-01-15",
    "posts_per_day": 2,
    "platforms": ["instagram", "facebook", "twitter", "tiktok"]
  }
}
```

### campaign_posts.json Structure

```json
[
  {
    "id": 1,
    "content": "Post text with emojis and hashtags",
    "platforms": ["instagram", "facebook", "twitter", "tiktok"],
    "media": ["path/to/image.jpg"],
    "schedule_days": 0
  }
]
```

**Fields**:
- `id` - Unique post identifier
- `content` - Post text (280 chars for Twitter)
- `platforms` - Which platforms to post to
- `media` - Image/video files (optional)
- `schedule_days` - Days from campaign start (0 = first day, 1 = second day, etc.)

---

## 🎯 Platform-Specific Notes

### Instagram
- **Requirements**: Business account, connected to Facebook Page
- **Content**: Text + image/video
- **API**: Meta Graph API v21.0
- **Rate Limits**: 25 posts per day
- **Image Size**: Max 8MB, ratio 4:5 to 1.91:1

### Facebook
- **Requirements**: Facebook Page with manage permissions
- **Content**: Text + image/video/link
- **API**: Meta Graph API v21.0
- **Rate Limits**: 200 API calls per hour
- **Best Practice**: Use native sharing for better reach

### Twitter
- **Requirements**: Developer account, elevated access for v2
- **Content**: Text (280 chars) + image/video
- **API**: Twitter API v2 or v1.1
- **Rate Limits**: 300 tweets per 3 hours
- **Media**: Max 4 images or 1 video per tweet

### TikTok
- **Requirements**: TikTok for Business account
- **Content**: Video only (no text-only posts)
- **API**: Content Posting API
- **Limitation**: Requires video upload, not suitable for lightweight script
- **Recommendation**: Use TikTok Creative Center manually

---

## 🐛 Troubleshooting

### "Access token expired"

**Meta/Facebook/Instagram**:
```bash
# Get long-lived token (60 days)
curl "https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=738653215879612&client_secret=be8297b868a6762ad54d4530545428fd&fb_exchange_token=SHORT_LIVED_TOKEN"
```

**Twitter**:
- Regenerate access token in Developer Portal
- Ensure app has "Read and Write" permissions

### "Instagram publish failed"

**Common issues**:
1. Account not converted to Business/Creator
2. Not connected to Facebook Page
3. Image aspect ratio invalid
4. Posting too frequently (max 25/day)

**Fix**:
- Convert to Business account in Instagram app
- Link to Facebook Page
- Use 1:1 (square) or 4:5 (portrait) images
- Space posts 1 hour apart

### "Twitter authentication error"

**OAuth 1.0a issues**:
- Check all 4 credentials are correct
- Regenerate tokens if needed
- Ensure app permissions include "Read and Write"

### "Script fails silently"

**Debug mode**:
```python
# Add at top of social-media-poster.py
import logging
logging.basicConfig(level=logging.DEBUG)
```

---

## 📊 Expected Performance

### Resource Usage
- **Memory**: ~50-80MB during execution
- **CPU**: Minimal (API calls only)
- **Network**: ~1-5MB per post (with images)
- **Execution Time**: 5-30 seconds per post

### Campaign Metrics
- **Total Posts**: 45 posts
- **Duration**: 30 days
- **Platforms**: 4 (Instagram, Facebook, Twitter, TikTok)
- **Posts Per Day**: ~1-2 posts
- **Target Reach**: 100 beta testers

---

## 🔄 Future Enhancements

### After Campaign Launch

1. **Robust Self-Hosted Solution**:
   - VPS hosting ($3-5/month)
   - Automated daily execution (cron)
   - Database for analytics tracking
   - Web dashboard for management

2. **Advanced Features**:
   - Analytics integration
   - A/B testing automation
   - Response monitoring
   - Performance tracking

3. **Platform Expansion**:
   - LinkedIn automation
   - Pinterest integration
   - Reddit posting

---

## 📞 Support

### Quick Reference

**Script Location**: `automation/social_media/social-media-poster.py`
**Config Files**: `config.json`, `campaign_posts.json`
**Dependencies**: `requirements.txt`

**Common Commands**:
```bash
# Install dependencies
pip install -r requirements.txt

# Preview today's posts (RECOMMENDED BEFORE POSTING)
python social-media-poster.py preview-today

# Preview entire campaign (full statistics)
python social-media-poster.py preview-all

# View simple schedule
python social-media-poster.py schedule

# Post today's content (after preview approval)
python social-media-poster.py post
```

### Error Codes

- ❌ Config file missing → Run script to generate template
- ❌ Posts file missing → Run script to generate template
- ❌ API authentication failed → Check credentials in config.json
- ❌ Platform post failed → Check platform-specific requirements

---

## ✅ Campaign Launch Checklist

### Before First Post

- [ ] Install Python dependencies (`pip install -r requirements.txt`)
- [ ] Get Meta access token (long-lived, 60 days)
- [ ] Get Instagram Business Account ID
- [ ] Get Facebook Page ID
- [ ] Get Twitter API credentials (all 4 tokens)
- [ ] Get TikTok access token (optional, manual posting alternative)
- [ ] Fill `config.json` with all credentials
- [ ] Add all 45 posts to `campaign_posts.json`
- [ ] Test with `python social-media-poster.py schedule`
- [ ] Verify first post with `python social-media-poster.py post`

### Daily Routine

- [ ] Connect laptop to internet
- [ ] Navigate to `automation/social_media/`
- [ ] Run `python social-media-poster.py post`
- [ ] Verify posts on each platform
- [ ] Optional: Check engagement metrics

### Weekly Maintenance

- [ ] Review posting success rates
- [ ] Check API rate limits usage
- [ ] Monitor beta tester signups
- [ ] Adjust content if needed

---

**Status**: ✅ Ready for campaign launch
**Next Step**: Get API credentials and configure config.json
