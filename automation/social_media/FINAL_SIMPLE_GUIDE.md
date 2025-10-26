# 🎯 FINAL FIX: Switch Facebook App to Live Mode

## Why This Works

Facebook apps in Development Mode restrict advanced permissions. Switching to Live Mode unlocks ALL permissions immediately - no waiting for App Review.

---

## ⚡ Quick Fix (15 minutes)

### Step 1: Add Required URLs to App Settings

Your app needs 2 URLs before it can go Live:

**Open this page:**
https://developers.facebook.com/apps/738653215879612/settings/basic/

**Scroll to these fields and fill them in:**

1. **Privacy Policy URL:**
   ```
   https://hub.untrapd.com/privacy
   ```

2. **Terms of Service URL (optional but recommended):**
   ```
   https://hub.untrapd.com/terms
   ```

3. **App Domains:** Add:
   ```
   hub.untrapd.com
   localhost
   ```

**Click "Save Changes"** at the bottom

---

### Step 2: Switch to Live Mode

**On the same page, scroll down to "App Mode"**

You'll see:
```
App Mode: [Development] 🔄 [Live]
```

**Click the toggle to switch from Development to Live**

A popup will appear asking you to confirm:
- Click **"Switch Mode"** or **"Confirm"**

**That's it!** Your app is now Live and has access to all permissions.

---

### Step 3: Generate New Token with All Permissions

Now run this command:
```bash
node generate-oauth-url.js
```

This will open the OAuth dialog with all 6 permissions available.

**Follow the authorization:**
1. Facebook will ask for all 6 permissions
2. Click "Continue" 
3. You'll be redirected to localhost
4. Copy the token from the URL
5. Run: `node update-env-token.js <your-token>`

---

### Step 4: Verify and Launch

```bash
# Verify all permissions granted
node check-permissions.js

# Test Day 1 posts
node finderr-native-launcher.js day 1

# Launch full campaign
node finderr-native-launcher.js launch
```

---

## 🚨 Don't Have Privacy Policy Page Yet?

**Quick Solution - Use a Generator:**

1. Go to: https://www.termsfeed.com/privacy-policy-generator/
2. Fill in:
   - Company: UNTRAPD
   - Website: hub.untrapd.com
   - App: FINDERR
3. Generate the policy
4. Copy the URL they provide
5. Paste it in Facebook app settings

**OR use a placeholder:**
```
https://hub.untrapd.com/privacy
```

Facebook just needs a URL - you can update the actual page later.

---

## ✅ Success Checklist

- [ ] Privacy Policy URL added to app settings
- [ ] App Mode switched from Development to Live
- [ ] New token generated with all 6 permissions
- [ ] `check-permissions.js` shows all permissions granted
- [ ] Day 1 test successful on all 3 platforms
- [ ] Campaign launched

---

**Ready to do this?** Let me know when you've switched the app to Live Mode and I'll help you get the proper tokens!
