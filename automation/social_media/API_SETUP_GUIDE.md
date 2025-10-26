# 🔑 API Setup Guide - UNTRAPD Hub Social Media Automation

Complete guide to setting up API tokens for Instagram, Facebook, TikTok, and Twitter integrations.

## 📋 **Quick Setup Checklist**

```bash
# 1. Copy environment template
cp .env.template .env

# 2. Get API tokens (follow guides below)
# 3. Add tokens to .env file  
# 4. Test connections
node untrapd-hub-launcher.js --demo --once

# 5. Launch production
node untrapd-hub-launcher.js --once
```

---

## 🟦 **Facebook & Instagram Setup (Meta Business)**

### **Step 1: Create Facebook App**
1. Go to [developers.facebook.com](https://developers.facebook.com)
2. **Create App** → **Business** → **Consumer**
3. **App Name**: "Untrapd Hub Social Media"
4. **Contact Email**: your-email@domain.com

### **Step 2: Add Instagram Basic Display**
1. In your app → **Add Product** → **Instagram Basic Display**
2. **Create New App** button
3. **Basic Display** product added

### **Step 3: Add Facebook Login**  
1. **Add Product** → **Facebook Login**
2. **Settings** → **Valid OAuth Redirect URIs**: `https://localhost/`

### **Step 4: Configure Instagram Business Account**
1. **Instagram Basic Display** → **Basic Display** 
2. **Create New App** (if not done)
3. **Add Instagram Testers** → Add your @untrapd.hub account
4. **Generate Access Token**

### **Step 5: Get Page Access Token**
1. Go to [Graph API Explorer](https://developers.facebook.com/tools/explorer)
2. **Application**: Select your app
3. **User or Page**: Select your "Untrapd Hub" page (ID: 750014458192598)
4. **Permissions**: `pages_show_list`, `pages_read_engagement`, `publish_to_groups`
5. **Generate Access Token** → Copy token

### **Step 6: Get Instagram Access Token**
1. **Graph API Explorer** → **Application**: Your app
2. **User or Page**: Select Instagram account (@untrapd.hub, ID: 76216363129)  
3. **Permissions**: `instagram_basic`, `instagram_content_publish`
4. **Generate Access Token** → Copy token

### **Environment Variables**
```bash
# Add to .env file
FACEBOOK_PAGE_TOKEN=EAAxxxxxxxxxxxxxx
INSTAGRAM_ACCESS_TOKEN=IGQxxxxxxxxxxxxx
```

---

## 🟪 **TikTok Business API Setup**

⚠️ **IMPORTANT**: For complete TikTok setup instructions, see **`TIKTOK_API_INTEGRATION.md`**

### **Quick Setup Summary**
1. **Create TikTok Developer Account** at [developers.tiktok.com](https://developers.tiktok.com)
2. **Log in** with your @untrapd.hub TikTok account
3. **Create Business Application** with content posting permissions
4. **Get API credentials** and configure environment variables

### **Environment Variables**
```bash
# Add to .env file - see TIKTOK_API_INTEGRATION.md for details
TIKTOK_CLIENT_KEY=your_client_key
TIKTOK_CLIENT_SECRET=your_client_secret
TIKTOK_ACCESS_TOKEN=your_access_token  
TIKTOK_REFRESH_TOKEN=your_refresh_token
TIKTOK_OPEN_ID=your_business_account_open_id
```

### **Testing**
```bash
# Test TikTok integration
npm run test-tiktok

# Check TikTok account status
npm run tiktok-status
```

📖 **Full Setup Guide**: `TIKTOK_API_INTEGRATION.md` - Complete step-by-step instructions

---

## 🐦 **Twitter API Setup (Optional)**

### **Step 1: Create Twitter Developer Account**
1. Go to [developer.twitter.com](https://developer.twitter.com)
2. **Apply for Developer Account** → **Hobbyist** → **Making a Bot**
3. **Use Case**: "Social media automation for business"

### **Step 2: Create Application**
1. **Developer Portal** → **Create Project** 
2. **Project Name**: "Untrapd Hub Bot"
3. **Use Case**: "Making a Bot"
4. **App Environment**: "Production"

### **Step 3: Get API Keys**
1. **App Settings** → **Keys and Tokens**
2. **Generate** Bearer Token
3. **Generate** API Key & Secret (if needed)
4. Copy **Bearer Token**

### **Environment Variables**
```bash
# Add to .env file  
TWITTER_BEARER_TOKEN=AAAAAAAAAAAAAAAAxxxxxxxxxx
```

---

## 🧪 **Testing Your Setup**

### **Test 1: Token Validation**
```bash
# Test API connections without posting
node -e "
const handler = require('./api-handler.js');
const api = new handler();
api.validateApiTokens().then(console.log);
"
```

### **Test 2: Demo Mode**
```bash
# Run full demo without real API calls
node untrapd-hub-launcher.js --demo --once
```

### **Test 3: Single Production Post**
```bash
# Post once to verify real API connections
node untrapd-hub-launcher.js --once
```

### **Test 4: Get Analytics**
```bash
# Test insights fetching
node -e "
const handler = require('./api-handler.js');
const api = new handler();
api.getAllInsights().then(console.log);
"
```

---

## 📊 **Verification Checklist**

### ✅ **Facebook/Instagram**
- [ ] App created and approved
- [ ] Instagram account connected as Business
- [ ] Page Access Token generated (`FACEBOOK_PAGE_TOKEN`)
- [ ] Instagram Access Token generated (`INSTAGRAM_ACCESS_TOKEN`)
- [ ] Test post successful

### ✅ **TikTok**  
- [ ] Developer account approved
- [ ] Marketing API access granted
- [ ] Access token generated (`TIKTOK_ACCESS_TOKEN`)
- [ ] Video upload permissions confirmed

### ✅ **Twitter**
- [ ] Developer account approved  
- [ ] Project and app created
- [ ] Bearer token generated (`TWITTER_BEARER_TOKEN`)
- [ ] Tweet posting successful

---

## 🔧 **Troubleshooting**

### **Common Issues**

**"Invalid Access Token"**
- Check token expiration (Facebook tokens expire)
- Verify account permissions and roles
- Regenerate tokens if needed

**"Permission Denied"**  
- Check app review status for advanced permissions
- Verify business account setup (Instagram)
- Ensure page admin role (Facebook)

**"Rate Limit Exceeded"**
- Reduce posting frequency
- Check platform-specific limits
- Implement retry logic with delays

**"Media Upload Failed"**
- Verify image/video format and size limits
- Check file URL accessibility
- Test with different media types

### **Debug Commands**
```bash
# Enable verbose logging
DEBUG=* node untrapd-hub-launcher.js --demo --once

# Test specific platform
node -e "
const handler = require('./api-handler.js');
const api = new handler();
api.postToFacebook('Test post from API').then(console.log);
"

# Check account information
node -e "
const handler = require('./api-handler.js');
const api = new handler();
api.getFacebookInsights().then(console.log);
"
```

---

## 🚀 **Production Deployment**

### **Environment Setup**
```bash
# Production .env file
INSTAGRAM_ACCESS_TOKEN=your_actual_token
FACEBOOK_PAGE_TOKEN=your_actual_token  
TIKTOK_ACCESS_TOKEN=your_actual_token
TWITTER_BEARER_TOKEN=your_actual_token

# Optional: Hub integration
HUB_API_KEY=your_hub_api_key
HUB_WEBHOOK_SECRET=your_webhook_secret
```

### **Launch Commands**
```bash
# Single test run
node untrapd-hub-launcher.js --once

# Continuous automation (production)
node untrapd-hub-launcher.js

# Background process (Linux/Mac)
nohup node untrapd-hub-launcher.js > automation.log 2>&1 &

# Using PM2 (recommended)
npm install -g pm2
pm2 start untrapd-hub-launcher.js --name "untrapd-social"
pm2 logs untrapd-social
```

### **Monitoring**
```bash
# Check automation status
pm2 status

# View real-time logs
pm2 logs untrapd-social --lines 100

# Restart if needed
pm2 restart untrapd-social

# Daily reports location
ls ./reports/daily-report-*.json
```

---

## 📱 **Account Configuration Summary**

```yaml
Instagram:
  username: "@untrapd.hub"
  account_id: "76216363129"
  type: "Business Account"
  
Facebook:
  page_name: "Untrapd Hub"  
  page_id: "750014458192598"
  type: "Business Page"
  
TikTok:
  username: "@untrapd.hub"
  type: "Business Account"
  
Twitter:
  username: "@untrapd.hub" (when ready)
  type: "Business Account"
```

**Status**: 🎯 **Ready for full production launch!**

All API integrations configured and tested. Social media automation system ready for deployment.

---

**Need help?** Check the [Integration Guide](./UNTRAPD_HUB_INTEGRATION_GUIDE.md) for step-by-step setup instructions.