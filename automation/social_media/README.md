# FINDERR Beta Campaign - Social Media Automation

**Campaign**: FINDERR v4.2.0+243 Beta Recruitment
**Status**: Ready for launch (3 platforms) - ON HOLD pending FINDERR fix
**Last Updated**: 2025-10-31

---

## 🎯 Campaign Overview

30-day automated social media campaign for FINDERR Beta recruitment across 4 platforms:

| Platform | Posts | Frequency | Status |
|----------|-------|-----------|--------|
| Facebook | 30 | 1/day | ✅ READY |
| Instagram | 60 | 2/day | ✅ READY |
| Twitter | 90 | 3/day | ✅ READY |
| Pinterest | 30 | 1/day | ⚠️ Manual (read-only API) |

**Total**: 210 posts over 30 days (180 automated + 30 manual)

---

## 📁 Directory Structure

```
automation/social_media/
├── .env                           # API credentials (production)
├── README.md                      # This file
│
├── SESSION_CHECKPOINT_2025-10-31_SOCIAL_MEDIA_SETUP.md  # Complete session history
├── PLATFORM_STATUS_2025-10-31.md                        # Platform details
├── RESUME_QUICK_START_2025-10-31.md                     # Quick resume guide
│
├── test-facebook-post.py          # Facebook posting test (✅ SUCCESS)
├── test-instagram-post.py         # Instagram account verification (✅ VERIFIED)
├── test-twitter-post.py           # Twitter post + delete test (✅ SUCCESS)
├── test-pinterest-post.py         # Pinterest access test (⚠️ READ-ONLY)
│
├── verify-token.py                # Token type and permissions check
├── list-all-pages.py              # List Facebook Pages
├── get-and-update-page-token.py   # Extract Page Access Token
├── check-instagram-account.py     # Verify Instagram connection
├── deep-check-instagram.py        # Comprehensive Instagram diagnostics
├── refresh-page-token.py          # Refresh Page token with Instagram
│
├── create-facebook-assets.py      # Generate Facebook Page assets
├── create-brain-cover.py          # Brain-themed cover generation
├── create-final-brain-cover.py    # Final brain cover with effects
│
├── facebook_profile_picture.png   # 500x500px profile picture
├── facebook_cover_brain_final.png # 1640x624px brain-themed cover
│
├── GET_USER_TOKEN_GUIDE.md        # Meta Graph API token guide
└── GET_PINTEREST_TOKEN_GUIDE.md   # Pinterest token generation guide
```

---

## 🚀 Quick Start

### Resume From Previous Session

```bash
# 1. Read quick start guide
cat RESUME_QUICK_START_2025-10-31.md

# 2. Verify platforms still working
python3 test-facebook-post.py
python3 test-instagram-post.py
python3 test-twitter-post.py

# 3. Check credentials
cat .env | grep -E "(FACEBOOK|INSTAGRAM|TWITTER)_"
```

### First Time Setup

**Prerequisites**:
- Python 3.x
- pip install python-dotenv requests Pillow requests-oauthlib

**Configuration**:
1. Copy `.env.example` to `.env` (if starting fresh)
2. Configure API credentials for each platform
3. Run test scripts to verify access

---

## 📊 Platform Status

### ✅ Facebook - Untrapd Page

- **Account**: Untrapd (ID: 830176470182189)
- **API Access**: Full posting capability
- **Test Result**: ✅ Post ID: 830176470182189_122098344423099319
- **Assets**: Profile picture + brain-themed cover created

**Credentials**:
```bash
FACEBOOK_PAGE_TOKEN=EAAKfzRq...  # Page Access Token
FACEBOOK_PAGE_ID=830176470182189
```

### ✅ Instagram - @untrapd.hub

- **Account**: @untrapd.hub (ID: 17841476173887045)
- **API Access**: Full (requires hosted images)
- **Test Result**: ✅ Account verified
- **Connection**: Linked to "Untrapd" Facebook Page

**Credentials**:
```bash
INSTAGRAM_ACCESS_TOKEN=EAAKfzRq...  # Shared with Facebook
INSTAGRAM_BUSINESS_ACCOUNT_ID=17841476173887045
```

### ✅ Twitter - @DavisUntrap

- **Account**: @DavisUntrap (Display: UNTRAPD Hub)
- **Followers**: 15
- **API Access**: Full posting + deletion
- **Test Result**: ✅ Tweet ID: 1984329357855199501 (posted and deleted)

**Credentials**:
```bash
TWITTER_API_KEY=5H0kiG4...
TWITTER_API_SECRET=bhTRdR...
TWITTER_ACCESS_TOKEN=1731669998...
TWITTER_ACCESS_TOKEN_SECRET=M21SOT...
```

### ⚠️ Pinterest - untrapd.hub

- **Account**: untrapd.hub (App ID: 1534758)
- **API Access**: Read-only (Production Limited)
- **Test Result**: ❌ "Your application consumer type is not supported"
- **Status**: Approved but needs full production access

**Issue**: App in "Production Limited" mode - only has pins:read, boards:read, user_accounts:read
**Solution**: Request full production access from Pinterest (needs pins:write)

---

## 🔧 Test Scripts

### test-facebook-post.py
Tests Facebook Page posting capability with text-based post.

```bash
python3 test-facebook-post.py
# Expected: ✅ Post created with ID
```

### test-instagram-post.py
Verifies Instagram Business Account access (posting requires hosted images).

```bash
python3 test-instagram-post.py
# Expected: ✅ Account @untrapd.hub verified
```

### test-twitter-post.py
Posts test tweet and auto-deletes after 5 seconds.

```bash
python3 test-twitter-post.py
# Expected: ✅ Tweet posted and deleted successfully
```

### test-pinterest-post.py
Tests Pinterest API access (currently read-only).

```bash
python3 test-pinterest-post.py
# Expected: ❌ 401 Authentication failed (production access needed)
```

---

## 🛠️ Diagnostic Scripts

### verify-token.py
Checks token type (User vs Page) and permissions.

### list-all-pages.py
Lists all Facebook Pages accessible with current token.

### get-and-update-page-token.py
Extracts Page Access Token from User token and updates `.env`.

### check-instagram-account.py
Verifies Instagram Business Account link to Facebook Page and auto-updates `.env`.

### deep-check-instagram.py
Comprehensive Instagram connection diagnostics using multiple API methods.

### refresh-page-token.py
Refreshes Page Access Token with new User token.

---

## 📝 Campaign Content

**Content Templates**: `../../content_templates/social_media/`
**Campaign Posts**: `finderr-prelaunch-templates.js` (33 posts)
**Preview Dashboard**: `dashboard.html` + `dashboard.py`

**Content Breakdown**:
- Instagram: High-quality visuals + captions + hashtags
- Facebook: Text-based posts with ecosystem messaging
- Twitter: Short-form threads + engagement hooks
- Pinterest: Infographics + app screenshots (manual)

---

## 🚨 Troubleshooting

### Facebook 403 Error
**Issue**: "requires both pages_read_engagement and pages_manage_posts permission with page token"

**Solution**: Use Page Access Token (not User token)
```bash
python3 get-and-update-page-token.py
```

### Instagram Token Expired
**Issue**: "Session has expired on Friday, 31-Oct-25 11:00:00 PDT"

**Solution**: Use fresh Page Access Token
```bash
# Page token includes Instagram automatically
python3 check-instagram-account.py
```

### Instagram Account Not Found
**Issue**: "Object with ID '76216363129' does not exist"

**Solution**: Instagram account linked to different page
```bash
# Auto-updates to correct ID
python3 check-instagram-account.py
```

### Pinterest 401 Error
**Issue**: "Your application consumer type is not supported"

**Solution**: Request full production access from Pinterest
- See: `GET_PINTEREST_TOKEN_GUIDE.md`

---

## 📚 Documentation

**Complete Session History**:
- `SESSION_CHECKPOINT_2025-10-31_SOCIAL_MEDIA_SETUP.md` - Full technical details

**Platform Details**:
- `PLATFORM_STATUS_2025-10-31.md` - API configuration and campaign plans

**Quick Resume**:
- `RESUME_QUICK_START_2025-10-31.md` - 30-second session resumption guide

**Token Guides**:
- `GET_USER_TOKEN_GUIDE.md` - Meta Graph API token generation
- `GET_PINTEREST_TOKEN_GUIDE.md` - Pinterest access token guide

---

## 🎯 Next Steps

### Immediate (After FINDERR Fix)

1. **Generate Campaign Images**:
   - 60 Instagram visuals (2/day × 30 days)
   - Optional: Facebook and Twitter graphics

2. **Set Up Image Hosting**:
   - Upload to CDN (Netlify/Vercel/Imgur)
   - Get public HTTPS URLs for Instagram API

3. **Create Campaign Automation**:
   - Multi-platform posting script
   - Scheduling system
   - Error handling and retries

4. **Launch Campaign**:
   - Test full workflow
   - Deploy 30-day automation
   - Monitor performance

### Long-Term

1. **Pinterest Production Access**:
   - Submit access request
   - Add Pinterest automation once approved

2. **TikTok Integration** (if API approved):
   - Configure credentials
   - Test and add to campaign

3. **Analytics Dashboard**:
   - Cross-platform metrics
   - A/B testing results
   - Performance optimization

---

## 📞 Support

**Session Checkpoint**: Contains complete troubleshooting history
**Platform Status**: Detailed API configuration for each platform
**Test Scripts**: Verify API access before campaign launch

**Meta Graph API**: https://developers.facebook.com/tools/explorer/
**Pinterest Developers**: https://developers.pinterest.com/apps/
**Twitter Developer Console**: https://developer.twitter.com/

---

**Status**: ✅ Ready for campaign launch (3 platforms)
**Blocking**: FINDERR critical issue (to be identified)
**Resume**: `RESUME_QUICK_START_2025-10-31.md`

