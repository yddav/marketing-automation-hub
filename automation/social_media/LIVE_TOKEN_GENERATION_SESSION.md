# 🔴 LIVE Token Generation Session - October 23, 2025

**Status**: 🟢 IN PROGRESS
**Your App**: "UNTRAPD Social Automation" (App ID: 738653215879612)

---

## 📍 STEP 1: Access Graph API Explorer

**Action**: Open this URL in your browser:
```
https://developers.facebook.com/tools/explorer/
```

**You should see:**
- Blue header with "Meta for Developers"
- "Graph API Explorer" title on the left
- Main panel with query builder

**If you're NOT logged in:**
1. Click "Log In" in top right
2. Use the account that manages @untrapd.hub Instagram
3. You should have admin access to "Untrapd Hub" Facebook page

✅ **Checkpoint**: Confirm you can see "Graph API Explorer" interface

---

## 📍 STEP 2A: Select Your Meta App

**Look for the dropdown at the top that says "Meta App"**

**Current setting might show:**
- "Graph API Explorer" (default)
- OR your app name if already selected

**Action:**
1. Click the "Meta App" dropdown
2. Scroll through the list
3. Find and select: **"UNTRAPD Social Automation"**
4. Verify App ID shows: **738653215879612**

**If you don't see "UNTRAPD Social Automation":**
- You may need to create a new app
- OR get added as a developer to existing app
- Check at: https://developers.facebook.com/apps

✅ **Checkpoint**: App dropdown shows "UNTRAPD Social Automation (738653215879612)"

---

## 📍 STEP 2B: Verify User Token Type

**Below the Meta App dropdown, you should see:**
- "User Access Token" or "User Token"
- OR "Page Access Token" (we'll switch this for Facebook step)

**Action:**
- Make sure it says **"User Access Token"** for Instagram step

✅ **Checkpoint**: Token type is set to "User Access Token"

---

## 📍 STEP 3: Add Instagram Permissions (CRITICAL!)

**Look for "Permissions" section** (usually on left sidebar or below app selector)

**You need to add 4 permissions for Instagram:**

### Permission 1: `instagram_basic`
1. Click "Add a Permission" button
2. Type: `instagram_basic`
3. Find it in the list and CHECK the box
4. This allows basic Instagram account access

### Permission 2: `instagram_content_publish`
1. Click "Add a Permission" again
2. Type: `instagram_content_publish`
3. Check the box
4. This allows posting content to Instagram

### Permission 3: `instagram_manage_insights`
1. Click "Add a Permission"
2. Type: `instagram_manage_insights`
3. Check the box
4. This allows reading Instagram analytics

### Permission 4: `pages_show_list`
1. Click "Add a Permission"
2. Type: `pages_show_list`
3. Check the box
4. This allows listing connected Facebook pages

**Your Permissions list should show:**
```
✅ instagram_basic
✅ instagram_content_publish
✅ instagram_manage_insights
✅ pages_show_list
```

✅ **Checkpoint**: All 4 Instagram permissions are checked

---

## 📍 STEP 4: Generate Instagram Access Token

**Action:**
1. Click the **"Generate Access Token"** button (usually blue button near top)
2. A popup will appear asking you to confirm permissions
3. **Title should say**: "UNTRAPD Social Automation is requesting permission"
4. **Review the permissions** - should match the 4 we added
5. Click **"Continue"** or **"Allow"**
6. Facebook may ask you to login again (for security)
7. Approve any additional prompts

**After approval:**
- The "Access Token" field will populate with a long string
- It looks like: `EAAKfzRqLcbw...` (very long)
- This is your **SHORT-LIVED** Instagram token (expires in 1-2 hours)

**Action:**
1. Click the token to select it all
2. Copy it (Ctrl+C or Cmd+C)
3. Paste it into a text editor (Notepad/TextEdit)
4. Label it: "Instagram Short-Lived Token"

✅ **Checkpoint**: Instagram short-lived token copied to notepad

---

## 📍 STEP 5: Convert Instagram Token to Long-Lived (60 days)

**We need to exchange the short-lived token for a long-lived one.**

**You need:**
- Your App ID: `738653215879612`
- Your App Secret: (found in app settings)
- The short-lived token you just copied

### 5A: Get Your App Secret

**Action:**
1. Open new tab: https://developers.facebook.com/apps/738653215879612/settings/basic/
2. Look for "App Secret" field
3. Click **"Show"** button
4. Copy the App Secret
5. Save it to notepad (label: "App Secret")

**Security Note**: Never share your App Secret publicly!

### 5B: Exchange Token via API

**Option 1: Use Browser** (Easiest)

Open this URL in a new tab (replace the placeholders):
```
https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=738653215879612&client_secret=YOUR_APP_SECRET_HERE&fb_exchange_token=YOUR_SHORT_LIVED_TOKEN_HERE
```

Replace:
- `YOUR_APP_SECRET_HERE` → Your App Secret from step 5A
- `YOUR_SHORT_LIVED_TOKEN_HERE` → The short-lived Instagram token from step 4

**The response will be JSON:**
```json
{
  "access_token": "EAAKfzRqLcbwBP... (long token)",
  "token_type": "bearer",
  "expires_in": 5183999
}
```

**Option 2: Use Terminal/Command Prompt**

Copy this command and replace the placeholders:
```bash
curl "https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=738653215879612&client_secret=YOUR_APP_SECRET&fb_exchange_token=YOUR_SHORT_TOKEN"
```

**Action:**
1. Copy the `access_token` value from the response
2. Paste it into notepad
3. Label it: "Instagram Long-Lived Token (60 days)"

✅ **Checkpoint**: Instagram long-lived token saved to notepad

---

## 📍 STEP 6: Generate Facebook Page Token

**Now we need a separate token for Facebook Page posting.**

**Go back to Graph API Explorer tab**

**Action:**
1. Look for the **User/Page selector** dropdown
2. It might say "User Token" or show your user name
3. Click it and switch to: **"Untrapd Hub"** (Page ID: 750014458192598)
4. You should now see "Page Access Token" instead of "User Access Token"

### Clear Previous Permissions (Important!)

**Action:**
1. In the Permissions section, **uncheck all Instagram permissions**
2. We need different permissions for Facebook Page

### Add Facebook Page Permissions

**You need 3 permissions for Facebook:**

### Permission 1: `pages_manage_posts`
1. Click "Add a Permission"
2. Type: `pages_manage_posts`
3. Check the box
4. This allows creating and managing Facebook posts

### Permission 2: `pages_read_engagement`
1. Click "Add a Permission"
2. Type: `pages_read_engagement`
3. Check the box
4. This allows reading Facebook post analytics

### Permission 3: `pages_show_list`
1. Should already be there from before
2. If not, add it again
3. Check the box

**Your Permissions list should now show:**
```
✅ pages_manage_posts
✅ pages_read_engagement
✅ pages_show_list
```

✅ **Checkpoint**: All 3 Facebook permissions are checked, Instagram permissions removed

---

## 📍 STEP 7: Generate Facebook Page Access Token

**Action:**
1. Click **"Generate Access Token"** button again
2. Popup appears: "UNTRAPD Social Automation is requesting permission"
3. Review the 3 Facebook permissions
4. Click **"Continue"** or **"Allow"**

**After approval:**
- The "Access Token" field updates with a new long string
- This token is different from the Instagram one
- Page tokens are often already long-lived!

**Action:**
1. Copy the entire token
2. Paste it into notepad
3. Label it: "Facebook Page Token"

✅ **Checkpoint**: Facebook Page token copied to notepad

---

## 📍 STEP 8: Verify Token Expiration

**Facebook Page tokens are sometimes already long-lived (60+ days).**

**To check expiration:**
1. In Graph API Explorer, look for "Access Token Debugger" link
2. OR go to: https://developers.facebook.com/tools/debug/accesstoken/
3. Paste your Facebook Page token
4. Click "Debug"
5. Look for "Expires" field

**If it says:**
- ✅ "Never" or "Expires in 5183999 seconds" → Long-lived! Use it as-is
- ⚠️ "Expires in 7200 seconds" → Short-lived, need to exchange (use same method as Instagram step 5)

✅ **Checkpoint**: Facebook token expiration verified

---

## 📍 STEP 9: Summary - Tokens You Should Have

**At this point, you should have in your notepad:**

1. ✅ **Instagram Long-Lived Token**
   - Starts with: `EAAKfzRqLcbw...`
   - Length: ~200+ characters
   - Expires in: 60 days
   - Label: "Instagram Long-Lived Token"

2. ✅ **Facebook Page Token**
   - Starts with: `EAAKfzRqLcbw...`
   - Length: ~200+ characters
   - Expires in: 60+ days (or never)
   - Label: "Facebook Page Token"

3. ✅ **App Secret** (for reference)
   - Needed for future token exchanges
   - Label: "App Secret"

**Ready for next step?** Tell me when you have both tokens!

---

## 📍 NEXT STEPS (After You Have Tokens)

Once you have both tokens:
1. We'll update your `.env` file
2. Run validation script to confirm they work
3. Launch your 210-post campaign!

---

**Session Status**: ⏸️ Waiting for token generation
**Time So Far**: ~10-15 minutes
**Remaining**: ~5 minutes (update .env + validate)

---

## 🆘 Troubleshooting

### "I don't see my app in the dropdown"
- Go to: https://developers.facebook.com/apps
- Check if you're added as a developer
- App might be under different account

### "Permission not found"
- Make sure you selected correct token type (User vs Page)
- Some permissions only show for specific token types

### "Generate Token button is grayed out"
- Make sure you added at least one permission
- Verify app is selected (not default "Graph API Explorer")

### "Token exchange returns error"
- Double-check App ID (738653215879612)
- Verify App Secret is correct (no extra spaces)
- Make sure short-lived token is fresh (< 1 hour old)

---

**Ready?** Let me know when you've generated both tokens and I'll help update your `.env` file!
