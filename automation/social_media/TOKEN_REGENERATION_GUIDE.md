# 🔑 Token Regeneration Guide - Meta APIs

**Status**: ❌ Tokens expired October 17, 2025
**Action Required**: Generate new long-lived tokens

---

## 🚨 Current Issue

Both Instagram and Facebook tokens have expired:
- **Expired**: October 17, 2025
- **Current Date**: October 23, 2025
- **Accounts Affected**:
  - Instagram Business: 76216363129 (@untrapd.hub)
  - Facebook Page: 750014458192598 (Untrapd Hub)

---

## 🎯 Quick Token Generation (Recommended Method)

### Step 1: Access Meta Graph API Explorer

1. **Go to**: [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. **Log in** with the account that has admin access to "Untrapd Hub" page

### Step 2: Generate Instagram Access Token

**Configuration:**
1. **Meta App**: Select "UNTRAPD Hub Social Media Automation" (or your app name)
2. **User or Page**: Select your user account
3. **Permissions**: Click "Add a Permission" and add:
   - ✅ `instagram_basic`
   - ✅ `instagram_content_publish`
   - ✅ `instagram_manage_insights`
   - ✅ `pages_show_list`
4. **Generate Access Token**: Click the button
5. **Copy Token**: Save it to notepad

### Step 3: Convert to Long-Lived Token (60 days)

**Method A: Using Graph API Explorer**
```bash
GET /oauth/access_token?
    grant_type=fb_exchange_token&
    client_id={app-id}&
    client_secret={app-secret}&
    fb_exchange_token={short-lived-token}
```

**Method B: Using curl command**
```bash
curl -i -X GET "https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=YOUR_APP_ID&client_secret=YOUR_APP_SECRET&fb_exchange_token=SHORT_LIVED_TOKEN"
```

The response will contain your **long-lived token** (valid for 60 days).

### Step 4: Generate Facebook Page Access Token

**Configuration:**
1. **Meta App**: Select "UNTRAPD Hub Social Media Automation"
2. **User or Page**: Select "Untrapd Hub" page (ID: 750014458192598)
3. **Permissions**: Click "Add a Permission" and add:
   - ✅ `pages_manage_posts`
   - ✅ `pages_read_engagement`
   - ✅ `pages_show_list`
   - ✅ `publish_to_groups` (optional)
4. **Generate Access Token**: Click the button
5. **Copy Token**: Save it to notepad

### Step 5: Update .env File

Replace the expired tokens in your `.env` file:

```bash
# Update these lines:
INSTAGRAM_ACCESS_TOKEN=YOUR_NEW_LONG_LIVED_INSTAGRAM_TOKEN
FACEBOOK_PAGE_TOKEN=YOUR_NEW_LONG_LIVED_FACEBOOK_TOKEN
```

### Step 6: Validate New Tokens

Run the validation script:
```bash
node validate-meta-apis.js
```

You should see:
```
✅ INSTAGRAM API VALIDATION: PASSED
✅ FACEBOOK API VALIDATION: PASSED
🎯 OVERALL STATUS: ✅ ALL SYSTEMS READY
```

---

## 🔐 Alternative Method: Meta Business Suite

### Using Meta Business Suite (Simpler, but shorter-lived tokens)

1. **Go to**: [Meta Business Suite](https://business.facebook.com)
2. **Navigate to**: Settings → Business Settings → Accounts → Instagram Accounts
3. **Select**: @untrapd.hub
4. **Generate Token**: Follow the prompts
5. **Repeat for Facebook**: Settings → Pages → Untrapd Hub

**Note**: This method generates shorter-lived tokens (hours to days). Graph API Explorer method is recommended for 60-day tokens.

---

## 📋 Required Permissions Checklist

### Instagram Business API
- [ ] `instagram_basic` - Basic profile access
- [ ] `instagram_content_publish` - Post content
- [ ] `instagram_manage_insights` - View analytics
- [ ] `pages_show_list` - List connected pages

### Facebook Page API
- [ ] `pages_manage_posts` - Create and manage posts
- [ ] `pages_read_engagement` - View post insights
- [ ] `pages_show_list` - List managed pages
- [ ] `publish_to_groups` - (Optional) Post to groups

---

## 🛠️ Finding Your App Credentials

If you need your App ID and App Secret:

1. **Go to**: [Meta Developers](https://developers.facebook.com/apps)
2. **Select**: Your app ("UNTRAPD Hub Social Media Automation")
3. **Navigate to**: Settings → Basic
4. **Copy**:
   - **App ID**: `{your-app-id}`
   - **App Secret**: Click "Show" and copy

---

## 🔄 Token Lifecycle Management

### Short-Lived Tokens
- **Duration**: 1-2 hours
- **Generated**: When you first authenticate in Graph API Explorer

### Long-Lived Tokens
- **Duration**: 60 days
- **Generated**: By exchanging short-lived token with `/oauth/access_token` endpoint

### Token Refresh Strategy
- **Set reminder**: Refresh tokens every 50 days (before expiration)
- **Automate**: Consider implementing automatic token refresh in your scripts
- **Monitor**: Watch for API errors indicating token expiration

---

## 🚨 Troubleshooting

### "Invalid OAuth Access Token"
- Token has expired → Generate new token
- Token was invalidated → Regenerate with correct permissions

### "Application Does Not Have Permission"
- Missing required permissions → Add them in Graph API Explorer
- App not approved for advanced features → Submit for App Review

### "Error Validating Access Token"
- Token expired → Follow this guide to generate new token
- Wrong token type → Ensure you're using long-lived token

### "Session Has Expired"
- This is the current error → **Generate new tokens now**

---

## ✅ Post-Regeneration Checklist

After generating new tokens:

- [ ] Updated `INSTAGRAM_ACCESS_TOKEN` in .env
- [ ] Updated `FACEBOOK_PAGE_TOKEN` in .env
- [ ] Ran `node validate-meta-apis.js` successfully
- [ ] Both APIs show ✅ READY status
- [ ] Set calendar reminder for 50 days (token refresh)
- [ ] Documented token expiration date: _______________

---

## 📞 Need Help?

**Meta Support**:
- [Graph API Documentation](https://developers.facebook.com/docs/graph-api)
- [Token Generation Guide](https://developers.facebook.com/docs/facebook-login/guides/access-tokens)
- [Common Errors](https://developers.facebook.com/docs/graph-api/common-errors)

**Project Documentation**:
- `META_API_INTEGRATION.md` - Complete integration guide
- `FACEBOOK_TOKEN_VISUAL_GUIDE.md` - Visual walkthrough
- `validate-meta-apis.js` - Token validation script

---

## 🎯 Next Steps After Token Refresh

Once tokens are validated:

1. **Test posting**: `node finderr-native-launcher.js --test`
2. **Launch campaign**: `node finderr-native-launcher.js`
3. **Monitor**: Check Instagram/Facebook for scheduled posts
4. **Set reminder**: Refresh tokens in 50 days (before next expiration)

---

**Generated**: 2025-10-23
**Tokens Expired**: 2025-10-17
**Next Refresh Due**: 2025-12-12 (after regeneration + 50 days)
