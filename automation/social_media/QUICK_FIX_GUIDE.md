# 🚀 Quick Campaign Launch Fix Guide

**Status**: Campaign BLOCKED by missing API permissions
**Diagnosis Complete**: Automated permission checker created
**Time to Fix**: 10-15 minutes

---

## ✅ What We've Built

1. **Permission Diagnostic Tool** (`check-permissions.js`)
   - Checks current token permissions via API
   - Identifies exactly what's missing
   - Validates Instagram Business Account connection

2. **Automated Token Regeneration Helper** (`regenerate-token.js`)
   - Opens Graph API Explorer automatically
   - Lists all required permissions
   - Step-by-step guidance

3. **Token Updater** (`update-env-token.js`)
   - Validates new token before saving
   - Updates .env automatically
   - Confirms all required permissions present

---

## 🔍 Current Problem (Diagnosed via API)

**Your current token only has 2 permissions:**
- ✅ `pages_show_list`
- ✅ `public_profile`

**But needs 5 additional permissions:**
- ❌ `pages_read_engagement`
- ❌ `pages_manage_posts`
- ❌ `pages_read_user_content`
- ❌ `instagram_basic`
- ❌ `instagram_content_publish`

**Result**: Cannot access Facebook Page or Instagram Business Account

---

## 🔧 Complete Fix Process (3 Steps)

### Step 1: Check Current Status
```bash
node check-permissions.js
```
This shows exactly which permissions are missing.

### Step 2: Regenerate Token with Permissions
```bash
node regenerate-token.js
```
This will:
- Open Firefox with Graph API Explorer
- Display step-by-step instructions
- Guide you through adding all 6 required permissions

**Manual Steps in Graph API Explorer:**
1. Select app: "UNTRAPD Social Automation"
2. Click "Add a Permission"
3. Add these 6 permissions:
   - `pages_show_list`
   - `pages_read_engagement`
   - `pages_manage_posts`
   - `pages_read_user_content`
   - `instagram_basic`
   - `instagram_content_publish`
4. Click "Generate Access Token"
5. Copy the token (starts with EAAK...)

**CRITICAL - Extend Token:**
1. Go to: https://developers.facebook.com/tools/debug/accesstoken/
2. Paste your new token
3. Click "Extend Access Token"
4. Copy the EXTENDED token (60-day expiration)

### Step 3: Update .env File
```bash
node update-env-token.js <your-extended-token>
```
This will:
- Validate the token via API
- Check for all required permissions
- Update both INSTAGRAM_ACCESS_TOKEN and FACEBOOK_PAGE_TOKEN
- Confirm successful update

### Step 4: Verify Fix
```bash
node check-permissions.js
```
Should now show:
```
✅ All required permissions are granted!
   Campaign should be ready to launch.
```

---

## 🎯 After Permissions Fixed

### Test Single Day
```bash
node finderr-native-launcher.js day 1
```
This tests:
- 2 Instagram posts
- 1 Facebook post
- 3 Twitter posts (if Twitter permissions also fixed)

### Launch Full Campaign
```bash
node finderr-native-launcher.js launch
```
This launches:
- 180-210 posts over 30 days
- Instagram: 60 posts (2/day)
- Facebook: 30 posts (1/day)
- Twitter: 90 tweets (3/day)
- TikTok: Skipped (API approval pending)

---

## 🐦 Twitter Fix (Separate Issue)

**Problem**: App configured with Read-only permissions, needs Read+Write

**Cannot be fixed via API** - requires manual developer portal access:

1. Go to: https://developer.twitter.com/en/portal/dashboard
2. Select your app: "1979161952715722752DavisUntrap"
3. Go to: Settings → User authentication settings
4. Change permissions from "Read-only" to "Read and write"
5. **CRITICAL**: Regenerate access tokens in "Keys and tokens" tab
6. Update .env with new tokens:
   ```bash
   TWITTER_ACCESS_TOKEN=<new_token>
   TWITTER_ACCESS_TOKEN_SECRET=<new_secret>
   ```

**Note**: Old tokens won't work after permission change - MUST regenerate!

---

## 📊 Campaign Status Overview

| Platform | Status | Posts/Day | API Status |
|----------|--------|-----------|------------|
| Instagram | ⚠️ Missing Permissions | 2 | Ready after token fix |
| Facebook | ⚠️ Missing Permissions | 1 | Ready after token fix |
| Twitter | ⚠️ Wrong Permissions | 3 | Code fixed, app needs update |
| TikTok | ⏭️ Skipped | 1 | API approval pending (7-30 days) |
| Pinterest | 🔧 Not Started | 1 | Need developer app setup |

**Total When Fixed**: 180 posts over 30 days (6/day average)
**After TikTok Approved**: 210 posts over 30 days (7/day average)

---

## 🚨 Common Issues

### "Token expired" error
Run `update-env-token.js` with a new extended token

### "Cannot access Instagram Business Account"
Make sure you:
1. Selected correct app in Graph API Explorer
2. Added `instagram_basic` permission
3. Instagram account is a Business Account (not Personal)
4. Instagram Business Account is connected to your Facebook Page

### "No Facebook Pages accessible"
Make sure you:
1. Added `pages_show_list` permission
2. Are logged into Facebook as the Page admin
3. Selected "User" token type (not App token)

### Twitter posts still failing after token fix
1. Verify app has "Read and write" permissions
2. Regenerate access tokens in developer portal
3. Confirm new tokens are in .env file
4. Test with: `node finderr-native-launcher.js day 1`

---

## ✅ Success Checklist

Before launching campaign:
- [ ] Run `node check-permissions.js` → Shows all permissions granted
- [ ] Instagram Business Account ID matches: 76216363129
- [ ] Facebook Page ID matches: 750014458192598
- [ ] Token expiration is 60 days out (not 1 hour)
- [ ] Test Day 1 succeeds: `node finderr-native-launcher.js day 1`
- [ ] At least 1 post published successfully on each platform

After successful test:
- [ ] Launch full campaign: `node finderr-native-launcher.js launch`
- [ ] Monitor first batch of posts (first 10 minutes)
- [ ] Check `finderr-campaign-tracking.json` for publish confirmations

---

## 📁 Files Created

**Diagnostic Tools:**
- `check-permissions.js` - API-based permission checker
- `regenerate-token.js` - Automated token regeneration helper
- `update-env-token.js` - Token validator and .env updater

**Documentation:**
- `API_PERMISSIONS_FIX_GUIDE.md` - Comprehensive manual guide
- `QUICK_FIX_GUIDE.md` - This file (streamlined process)

**Campaign System:**
- `finderr-native-launcher.js` - Main campaign launcher (Twitter OAuth fixed)
- `.env` - API credentials (needs token update)
- `finderr-campaign-tracking.json` - Created on first launch

---

**Last Updated**: 2025-10-17
**Next Action**: Run `node regenerate-token.js` to start fix process
