# Quick Start Guide - Resume Social Media Automation

**Last Session**: 2025-10-31
**Status**: ON HOLD (pending FINDERR fix)
**Readiness**: 75% complete (3 of 4 platforms ready)

---

## 🚀 Quick Resume (30 seconds)

### What Was Accomplished

✅ **Facebook**: Fully tested and working (Untrapd page created)
✅ **Instagram**: Verified and ready (@untrapd.hub linked to page)
✅ **Twitter**: Fully tested and working (@DavisUntrap)
⚠️ **Pinterest**: Read-only access (needs production approval)

### Why We Stopped

**FINDERR app has a critical issue** that needs to be fixed before launching the social media campaign.

### What's Next

1. **Fix FINDERR critical issue** (user to identify)
2. **Generate campaign images** for Instagram
3. **Launch 3-platform automation** (Facebook + Instagram + Twitter)

---

## 📋 Resume Checklist

### Before Starting Next Session

```bash
# 1. Navigate to project directory
cd "/media/wolfy/D260DD2060DD0BDB/Datas/2025 Projects/AppBuildFlutterVscodiumClaude/Hub_App_Shop_Integ/automation/social_media"

# 2. Verify all platforms still working
python3 test-facebook-post.py    # Should succeed
python3 test-instagram-post.py   # Should verify account
python3 test-twitter-post.py     # Should post + delete
python3 test-pinterest-post.py   # Expected to fail (read-only)

# 3. Check credentials intact
cat .env | grep -E "(FACEBOOK|INSTAGRAM|TWITTER)_"
```

### Key Files to Reference

📄 **SESSION_CHECKPOINT_2025-10-31_SOCIAL_MEDIA_SETUP.md**
- Complete session history and technical details
- All troubleshooting steps documented
- Resume instructions with verification commands

📄 **PLATFORM_STATUS_2025-10-31.md**
- Current status of all 4 platforms
- API configuration details
- Campaign plans for each platform
- Maintenance and monitoring guidance

📄 **.env**
- Production credentials (all working platforms)
- Facebook Page Access Token
- Instagram Business Account ID (auto-updated to 17841476173887045)
- Twitter OAuth credentials
- Pinterest Limited Access Token

---

## 🎯 Current Platform Status

| Platform | Account | Status | Test Result |
|----------|---------|--------|-------------|
| Facebook | Untrapd (830176470182189) | ✅ READY | Post ID: 830176470182189_122098344423099319 |
| Instagram | @untrapd.hub (17841476173887045) | ✅ READY | Account verified |
| Twitter | @DavisUntrap | ✅ READY | Tweet ID: 1984329357855199501 (deleted) |
| Pinterest | untrapd.hub (1534758) | ⚠️ LIMITED | Read-only (production access needed) |

---

## 🔄 Next Session Flow

### Step 1: Identify FINDERR Critical Issue
- User will describe the critical issue
- Analyze and diagnose the problem
- Create fix plan

### Step 2: Fix FINDERR Issue
- Implement the fix
- Test on Samsung S20 (Android 13)
- Verify fix resolves the issue

### Step 3: Resume Social Media Automation
- **Generate Campaign Images**:
  - 60 Instagram images (2/day for 30 days)
  - Optional: Facebook and Twitter graphics

- **Set Up Image Hosting**:
  - Upload images to CDN (Netlify/Vercel/Imgur)
  - Get public HTTPS URLs for Instagram API

- **Create Campaign Automation Script**:
  - Facebook: Text-based posts with optional images
  - Instagram: Image + caption workflow (create media container → publish)
  - Twitter: Text + optional images

- **Test Full Workflow**:
  - Post test content to all 3 platforms
  - Verify formatting and scheduling

- **Launch Campaign**:
  - 30-day automated posting
  - Real-time monitoring
  - Performance analytics

---

## 📊 Campaign Overview

**Total Posts**: 180 posts over 30 days (3 platforms)
- Facebook: 30 posts (1/day)
- Instagram: 60 posts (2/day)
- Twitter: 90 posts (3/day)

**Content Theme**: FINDERR v4.2.0+243 Beta Recruitment
**Target**: 100 beta testers
**Incentive**: 50% lifetime discount ($3.50/month)

---

## 🔧 Troubleshooting

### If Tokens Expired

**Facebook/Instagram**:
```bash
# Generate new User Access Token from Meta Graph API Explorer
# Use get-and-update-page-token.py to extract Page token
python3 get-and-update-page-token.py
```

**Twitter**:
- Tokens are long-lived (should not expire)
- If expired, regenerate from Twitter Developer Console

**Pinterest**:
- Current token is read-only (by design until production approved)
- Wait for production access approval before posting

### If Tests Fail

**Check .env file**:
```bash
cat .env | grep -E "(FACEBOOK_PAGE|INSTAGRAM|TWITTER)_"
```

**Verify credentials**:
```bash
python3 verify-token.py  # Check token type and permissions
python3 list-all-pages.py  # List accessible Facebook Pages
python3 check-instagram-account.py  # Verify Instagram link
```

---

## 💡 Pro Tips

### Facebook
- Page Access Token (not User token) required for posting
- Token extracted from `/me/accounts` endpoint using User token
- Script: `get-and-update-page-token.py`

### Instagram
- Requires publicly hosted images (no local uploads)
- Shared Page Access Token with Facebook
- Two-step process: Create media container → Publish
- Script auto-updated Instagram Business Account ID

### Twitter
- OAuth 1.0a authentication required
- `requests-oauthlib` library dependency
- Can post and delete tweets programmatically

### Pinterest
- App approved but limited to read-only access
- Need to request full production access
- Manual posting required until approved

---

## 📝 Key Learnings

1. **Meta API Token Types**:
   - User Access Token: For `/me` endpoints (listing pages)
   - Page Access Token: For actual posting (extracted from User token)
   - Instagram shares Page Access Token

2. **Instagram Business Account**:
   - Must be linked to Facebook Page for API access
   - Connection appears automatically in Page Access Token
   - Account ID can change when relinking to new page

3. **Pinterest API Limitations**:
   - "Production Limited" mode = read-only access
   - Need full production approval for posting
   - Error: "Your application consumer type is not supported"

4. **Test Scripts**:
   - Essential for verifying API access before campaign launch
   - Auto-delete feature for Twitter prevents spam
   - Diagnostic scripts save hours of manual troubleshooting

---

## ✅ Session Complete

**Checkpoint Created**: ✅
**Platform Status Documented**: ✅
**CLAUDE.md Updated**: ✅
**Ready for Resume**: ✅

**Next Session**: Fix FINDERR critical issue → Resume campaign launch

---

**Questions?** Reference the full checkpoint:
`SESSION_CHECKPOINT_2025-10-31_SOCIAL_MEDIA_SETUP.md`

