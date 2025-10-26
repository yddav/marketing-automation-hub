# 📘 Facebook/Instagram Token - Visual Step-by-Step Guide

## 🎯 Goal
Generate a new access token with ALL required permissions for Instagram and Facebook posting.

---

## 📍 Step 1: Verify You're in Graph API Explorer

**URL should be**: `https://developers.facebook.com/tools/explorer/`

**You should see**:
- Left panel with "Graph API Explorer" title
- Center panel with query builder
- Right panel with response/results

---

## 📍 Step 2: Select Your App

**Top of the page, look for:**
```
Meta App: [Dropdown] ▼
```

**Click the dropdown and select:**
```
UNTRAPD Social Automation
(App ID: 738653215879612)
```

**After selecting, verify**:
- App name shows in dropdown
- Below it should show "User Access Token" or "User Token"

---

## 📍 Step 3: Add Permissions (CRITICAL!)

**Find the "Permissions" section** (usually on the left or below the app selector)

**Click**: "Add a Permission" button or link

**Search and add these 6 permissions** (one by one):

### Permission 1: pages_show_list
1. Type `pages_show_list` in search box
2. Check the checkbox next to it
3. Click "Add" or just check it

### Permission 2: pages_read_engagement
1. Type `pages_read_engagement`
2. Check the checkbox
3. Note: Might show as "Pages → Read Engagement"

### Permission 3: pages_manage_posts
1. Type `pages_manage_posts`
2. Check the checkbox
3. Note: Might show as "Pages → Manage Posts"

### Permission 4: pages_read_user_content
1. Type `pages_read_user_content`
2. Check the checkbox

### Permission 5: instagram_basic
1. Type `instagram_basic`
2. Check the checkbox
3. Note: Might show as "Instagram → Basic Display"

### Permission 6: instagram_content_publish
1. Type `instagram_content_publish`
2. Check the checkbox
3. Note: Might show as "Instagram → Content Publishing"

**Verify all 6 are checked** before proceeding!

---

## 📍 Step 4: Generate Access Token

**Find the blue button** (usually at top or near permissions):
```
[Generate Access Token]
```

**Click it**

**A popup will appear asking to authorize**:
- Title: "UNTRAPD Social Automation is requesting permission"
- Lists all 6 permissions you selected
- Shows your Facebook Pages

**Click**: "Continue as [Your Name]" or "I Understand" or "Authorize"

**Select which Page to connect** (if prompted):
- Select: "untrapd hub" (ID: 750014458192598)
- Click "Next" or "Done"

---

## 📍 Step 5: Copy the Token

**After authorization, you'll see**:
```
Access Token: EAAKfzRqLcbw... [very long string]
```

**Click the "Copy" icon** or manually select all and copy

**Save it temporarily** - you'll need it for Step 6!

**Token format**: Starts with `EAAK` and is 200+ characters long

---

## 📍 Step 6: Extend Token to 60 Days (CRITICAL!)

**Open a new tab** and go to:
```
https://developers.facebook.com/tools/debug/accesstoken/
```

**You should see**: "Access Token Debugger" page

**Steps**:
1. **Paste your token** in the "Access Token" field
2. **Click "Debug"** button
3. **Review the token info**:
   - Valid: Should show ✓ (checkmark)
   - Expires: Shows expiration time (probably 1-2 hours from now)
   - Scopes: Should list all 6 permissions

4. **Click "Extend Access Token"** button at the bottom
5. **A new token appears** above the button
6. **Copy the NEW extended token**

**Verify the extended token**:
- Paste the new token in debugger again
- Expires should now show: "in about 2 months" or "60 days"

---

## 📍 Step 7: Update .env File

**In your terminal, run**:
```bash
node update-env-token.js <paste-your-extended-token-here>
```

**Example**:
```bash
node update-env-token.js EAAKfzRqLcbwBOZAL4uF9ZBq2nVN8n...
```

**You should see**:
```
✅ Token is valid!
   App ID: 738653215879612
   Expires: [date 60 days from now]

✅ All required permissions present!

✅ Updated .env file with new token
```

---

## 📍 Step 8: Verify Permissions

**Run the permission checker**:
```bash
node check-permissions.js
```

**Expected output**:
```
✅ Granted Permissions:
   ✓ pages_show_list
   ✓ pages_read_engagement
   ✓ pages_manage_posts
   ✓ pages_read_user_content
   ✓ instagram_basic
   ✓ instagram_content_publish

📊 PERMISSION DIAGNOSIS SUMMARY
✅ All required permissions are granted!
   Campaign should be ready to launch.
```

---

## 📍 Step 9: Test Day 1

**Run a test of Day 1 posts**:
```bash
node finderr-native-launcher.js day 1
```

**Expected results**:
- ✅ Instagram posts succeed (2 posts)
- ✅ Facebook posts succeed (1 post)
- ✅ Twitter posts succeed (3 tweets)
- ⏭️ TikTok skipped (API approval pending)

---

## 📍 Step 10: Launch Full Campaign! 🚀

**If Day 1 test succeeds, launch the campaign**:
```bash
node finderr-native-launcher.js launch
```

**This will**:
- Post 180-210 content pieces over 30 days
- Instagram: 60 posts (2/day)
- Facebook: 30 posts (1/day)
- Twitter: 90 tweets (3/day)
- Track progress in `finderr-campaign-tracking.json`

---

## 🚨 Common Issues

### Issue 1: "Permission not found"
**Solution**: Type the exact permission name (copy-paste from this guide)

### Issue 2: "No pages accessible"
**Solution**:
- Make sure you're logged into Facebook as the Page admin
- Ensure Page exists: https://facebook.com/750014458192598

### Issue 3: "Instagram Business Account not connected"
**Solution**:
- Your Instagram must be a Business Account (not Personal)
- Instagram must be connected to your Facebook Page
- Verify at: https://business.facebook.com/latest/settings/instagram_accounts

### Issue 4: Token expires in 1 hour (not extended)
**Solution**:
- Go back to Step 6
- Use the Access Token Debugger
- Click "Extend Access Token"
- Copy the NEW extended token
- Run update-env-token.js again with the extended token

### Issue 5: Some permissions missing after regeneration
**Solution**:
- Make sure you checked ALL 6 permissions in Step 3
- Regenerate the token again (Steps 4-7)
- Don't skip the "Extend Access Token" step

---

## ✅ Success Checklist

Before launching:
- [ ] Token generated with all 6 permissions
- [ ] Token extended to 60 days
- [ ] .env file updated with extended token
- [ ] Permission checker shows all permissions granted
- [ ] Instagram Business Account ID verified: 76216363129
- [ ] Facebook Page ID verified: 750014458192598
- [ ] Day 1 test shows successful posts on all platforms

**When all checked**, you're ready to launch! 🚀

---

**Need help?** Check the full diagnostic output from `node check-permissions.js`
