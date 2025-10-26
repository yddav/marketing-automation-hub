# 📌 Pinterest API Setup Guide

Complete guide to get Pinterest API credentials for automated posting to **untrapd.hub** account.

**Account URL**: https://fr.pinterest.com/untrapdhub/
**Business ID**: 871517034080882613

---

## 🎯 What You Need

- ✅ Pinterest Business Account: **untrapd.hub** (you have this)
- 🔧 Pinterest Developer App (need to create)
- 🔧 API App ID
- 🔧 API App Secret
- 🔧 Access Token

---

## 📋 Step-by-Step Setup

### Step 1: Access Pinterest Developers Portal

1. **Open Firefox** (you're already logged into Pinterest)
2. **Navigate to**: https://developers.pinterest.com/
3. **Click**: "Sign In" (top right)
4. **Log in** with your untrapd.hub Pinterest account

---

### Step 2: Create a Developer App

1. Once logged in, go to: https://developers.pinterest.com/apps/
2. Click **"Create App"** button
3. **Fill out app details**:

```
App Name: FINDERR Social Automation
App Description: Automated social media posting system for FINDERR phone security app marketing campaign. Posts daily updates about app features, security tips, and user education content.

Redirect URIs: https://hub.untrapd.com/pinterest/callback
```

4. **Select Permissions** (scopes):
   - ✅ `boards:read` - Read board information
   - ✅ `pins:read` - Read pin information
   - ✅ `pins:write` - Create pins
   - ✅ `user_accounts:read` - Read user account info

5. **Agree to Terms** and click **"Create"**

---

### Step 3: Get Your App Credentials

After creating the app, you'll see:

1. **App ID** (also called "Client ID")
   - Copy this value
   - Example format: `1234567890123456789`

2. **App Secret** (also called "Client Secret")
   - Click "Show" to reveal it
   - Copy this value
   - Example format: `abcdef1234567890abcdef1234567890`

**Save both values** - you'll need them in a moment!

---

### Step 4: Generate Access Token

Pinterest has two methods to get an access token:

#### Method A: OAuth Flow (Recommended for Production)

1. **Build Authorization URL**:
```
https://www.pinterest.com/oauth/?client_id=YOUR_APP_ID&redirect_uri=https://hub.untrapd.com/pinterest/callback&response_type=code&scope=boards:read,pins:read,pins:write,user_accounts:read
```

2. **Replace** `YOUR_APP_ID` with your actual App ID

3. **Open this URL** in your browser

4. **Authorize** the app for your untrapd.hub account

5. You'll be redirected to:
```
https://hub.untrapd.com/pinterest/callback?code=AUTHORIZATION_CODE_HERE
```

6. **Copy the authorization code** from the URL

7. **Exchange code for access token** using this curl command:
```bash
curl -X POST https://api.pinterest.com/v5/oauth/token \
  -d "grant_type=authorization_code" \
  -d "code=YOUR_AUTHORIZATION_CODE" \
  -d "redirect_uri=https://hub.untrapd.com/pinterest/callback" \
  -u "YOUR_APP_ID:YOUR_APP_SECRET"
```

8. Response will contain:
```json
{
  "access_token": "pina_XXXXXXXXXXXXXXXXXXXXX",
  "token_type": "bearer",
  "expires_in": 31536000,
  "refresh_token": "REFRESH_TOKEN_HERE",
  "scope": "boards:read,pins:read,pins:write,user_accounts:read"
}
```

9. **Copy the `access_token`** value

#### Method B: Test Access Token (Quick Setup)

For development/testing, Pinterest may provide a **test access token** in your app dashboard:

1. Go to your app page: https://developers.pinterest.com/apps/
2. Click on your app name
3. Look for **"Generate Test Token"** or **"Access Token"** section
4. Click **"Generate"** or **"Show"**
5. Copy the token (starts with `pina_`)

**Note**: Test tokens may expire after 24 hours. Use Method A for long-term automation.

---

### Step 5: Add Tokens to .env File

Once you have all three values, add them to your `.env` file:

```bash
# Pinterest API Configuration
PINTEREST_APP_ID=your_app_id_here
PINTEREST_APP_SECRET=your_app_secret_here
PINTEREST_ACCESS_TOKEN=pina_your_access_token_here
```

---

## 🧪 Test Pinterest Connection

Run this test command to verify your Pinterest API setup:

```bash
node test-pinterest-connection.js
```

This will:
- ✅ Verify API credentials
- ✅ Check account access
- ✅ List your boards
- ✅ Test pin creation capability

---

## 📌 Pinterest Account Requirements

### Before Automating:

1. **Verify Business Account**: Ensure untrapd.hub is a Pinterest Business account
2. **Create Boards**: Set up boards for your content
   - "FINDERR Features"
   - "Phone Security Tips"
   - "App Updates"
   - "User Testimonials"

3. **Board IDs**: You'll need board IDs for posting
   - Get them via API: `GET /v5/boards`
   - Or from board URLs: `pinterest.com/untrapdhub/board-name/`

---

## 🔐 Security Best Practices

1. **Never commit tokens** to git repositories
2. **Use environment variables** (.env file)
3. **Rotate tokens** every 90 days
4. **Monitor API usage** via Pinterest Developer Dashboard
5. **Set up refresh token flow** for long-term automation

---

## 📊 Pinterest API Limits

| Metric | Limit |
|--------|-------|
| Pins per day | 100 |
| Pins per hour | 15 |
| API calls per hour | 1,000 |
| API calls per day | 10,000 |

Our campaign plan: **1 pin per day** (well within limits)

---

## 🚨 Troubleshooting

### Error: "Invalid App ID"
- Double-check you copied the entire App ID
- Ensure no extra spaces or line breaks

### Error: "Invalid Redirect URI"
- Must exactly match URI in app settings
- Check for http vs https
- Verify trailing slashes match

### Error: "Scope Not Granted"
- Return to app settings
- Ensure all required scopes are selected
- Regenerate access token with correct scopes

### Error: "Token Expired"
- Test tokens expire in 24 hours
- Use OAuth flow for long-lived tokens
- Implement refresh token mechanism

---

## 🎨 Pinterest Content Best Practices

### Pin Specifications:
- **Image Size**: 1000x1500px (2:3 ratio recommended)
- **File Format**: PNG, JPG (under 20MB)
- **Title**: 100 characters max
- **Description**: 500 characters (use keywords!)
- **Link**: Direct to hub.untrapd.com/apps/finderr

### Pin Content Strategy:
1. **Educational Pins**: Phone security tips with infographics
2. **Feature Showcases**: App screenshots with benefit text
3. **User Testimonials**: Success stories and reviews
4. **How-To Guides**: Step-by-step tutorials
5. **Statistics**: Data-driven security facts

---

## 📋 Pinterest Setup Checklist

- [ ] Access Pinterest Developers Portal
- [ ] Create developer app
- [ ] Copy App ID
- [ ] Copy App Secret
- [ ] Generate Access Token (Method A or B)
- [ ] Add all tokens to .env file
- [ ] Create content boards
- [ ] Get board IDs
- [ ] Test connection with test script
- [ ] Verify posting permissions
- [ ] Ready to launch! 🚀

---

## 🔗 Useful Links

- **Pinterest Developers**: https://developers.pinterest.com/
- **API Documentation**: https://developers.pinterest.com/docs/api/v5/
- **My Apps Dashboard**: https://developers.pinterest.com/apps/
- **Pinterest Business**: https://business.pinterest.com/
- **Your Account**: https://fr.pinterest.com/untrapdhub/

---

## 📞 Need Help?

If you encounter issues:
1. Check Pinterest Developer status page
2. Review API documentation
3. Verify all credentials are correct
4. Test with curl commands first
5. Check error messages in Pinterest Developer Console

---

## 🎯 Next Steps After Setup

Once Pinterest is configured:

1. **Update Campaign Calendar**: Add 30 Pinterest pins to `finderr_v178_launch_calendar.json`
2. **Create Pin Images**: Design 30 unique pin graphics (1000x1500px)
3. **Launch Extended Campaign**: 240 posts across 5 platforms (Instagram, Facebook, Twitter, Pinterest, TikTok)

---

**Last Updated**: 2025-10-17
**Status**: Configuration Required
**Priority**: Medium (can launch with 3 platforms first, add Pinterest later)
