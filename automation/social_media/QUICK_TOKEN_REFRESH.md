# ⚡ Quick Token Refresh - 5-Minute Guide

**Current Status**: ❌ Tokens expired October 17, 2025
**Time to Fix**: ~30 minutes

---

## 🚀 Fast Track (Do This Now)

### Step 1: Open Graph API Explorer (2 min)
1. Go to: https://developers.facebook.com/tools/explorer/
2. Log in with your Untrapd Hub admin account
3. Select app: "UNTRAPD Hub Social Media Automation"

### Step 2: Instagram Token (10 min)

**Add Permissions:**
- `instagram_basic`
- `instagram_content_publish`
- `instagram_manage_insights`
- `pages_show_list`

**Generate Token:**
1. Click "Generate Access Token"
2. Approve permissions
3. Copy the token

**Convert to Long-Lived:**
```bash
curl "https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=YOUR_APP_ID&client_secret=YOUR_APP_SECRET&fb_exchange_token=SHORT_TOKEN"
```

### Step 3: Facebook Token (10 min)

**Add Permissions:**
- `pages_manage_posts`
- `pages_read_engagement`
- `pages_show_list`

**Generate Token:**
1. Switch to "Untrapd Hub" page in dropdown
2. Click "Generate Access Token"
3. Approve permissions
4. Copy the token

**Convert to Long-Lived:** (same curl command as above)

### Step 4: Update .env (2 min)

```bash
# Edit: automation/social_media/.env

INSTAGRAM_ACCESS_TOKEN=YOUR_NEW_INSTAGRAM_TOKEN_HERE
FACEBOOK_PAGE_TOKEN=YOUR_NEW_FACEBOOK_TOKEN_HERE
```

### Step 5: Validate (2 min)

```bash
cd automation/social_media
node validate-meta-apis.js
```

**Expected Output:**
```
✅ INSTAGRAM API VALIDATION: PASSED
✅ FACEBOOK API VALIDATION: PASSED
🎯 OVERALL STATUS: ✅ ALL SYSTEMS READY
```

---

## 🎯 After Token Refresh

### Launch Campaign
```bash
# Test first (dry-run)
node finderr-native-launcher.js --dry-run

# Launch Facebook (30 posts)
node finderr-facebook-launch.js

# Launch full campaign (210 posts, 4 platforms)
node finderr-native-launcher.js
```

### Monitor
- Instagram: https://www.instagram.com/untrapd.hub
- Facebook: https://www.facebook.com/750014458192598

### Set Reminder
**Calendar Event**: December 12, 2025
**Action**: Refresh Meta API tokens
**Note**: Tokens expire every 60 days

---

## 📞 Need Help?

**Full Guides:**
- `TOKEN_REGENERATION_GUIDE.md` - Detailed step-by-step
- `FACEBOOK_TOKEN_VISUAL_GUIDE.md` - Visual walkthrough
- `META_API_STATUS_REPORT.md` - Current status summary

**Troubleshooting:**
- Token errors → Regenerate with all permissions
- Permission errors → Check required permissions list
- API errors → Run `node validate-meta-apis.js`

---

## ✅ Quick Checklist

- [ ] Open Graph API Explorer
- [ ] Generate Instagram token (4 permissions)
- [ ] Generate Facebook token (3 permissions)
- [ ] Convert both to long-lived (60 days)
- [ ] Update .env file
- [ ] Run validation script
- [ ] See ✅ ALL SYSTEMS READY
- [ ] Launch campaign
- [ ] Set calendar reminder (Dec 12)

**Time**: ~30 minutes total
**Difficulty**: Easy (follow steps exactly)
**Impact**: Resumes 210-post automation campaign

---

**Generated**: 2025-10-23
**Next Refresh**: 2025-12-12 (after token update)
