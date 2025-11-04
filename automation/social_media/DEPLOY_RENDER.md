# Deploy FINDERR Campaign Preview to Render.com

**Platform**: Render.com (Free Tier)
**Access**: Password-protected (HTTP Basic Auth)
**HTTPS**: Automatic SSL certificate

---

## 🚀 Quick Deploy

### Step 1: Push to GitHub
```bash
cd "/media/wolfy/D260DD2060DD0BDB/Datas/2025 Projects/AppBuildFlutterVscodiumClaude/Hub_App_Shop_Integ"

# Add deployment files
git add automation/social_media/app.py
git add automation/social_media/Procfile
git add automation/social_media/.env.example
git add automation/social_media/render.yaml
git add automation/social_media/requirements.txt

# Commit
git commit -m "Add Render.com deployment configuration for campaign preview"

# Push to GitHub
git push origin main
```

### Step 2: Deploy on Render.com

1. **Sign up at https://render.com** (free, use GitHub OAuth)

2. **Create New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select: `Hub_App_Shop_Integ`
   - Click "Connect"

3. **Configure Service**:
   - **Name**: `finderr-campaign-preview`
   - **Region**: Frankfurt (or closest to you)
   - **Branch**: `main`
   - **Root Directory**: `automation/social_media`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
   - **Instance Type**: `Free`

4. **Set Environment Variables**:
   Click "Advanced" → "Environment Variables":
   
   | Key | Value |
   |-----|-------|
   | `PREVIEW_USERNAME` | `your-chosen-username` |
   | `PREVIEW_PASSWORD` | `your-secure-password` |

   **Important**: Choose strong credentials!

5. **Deploy**:
   - Click "Create Web Service"
   - Wait 2-5 minutes for deployment
   - Watch logs for any errors

---

## 🔐 Access Your Preview

Once deployed, Render provides a URL like:
**https://finderr-campaign-preview.onrender.com**

1. Visit the URL
2. Enter your USERNAME and PASSWORD
3. View your campaign preview with mockups!

---

## ✅ Features

✅ **HTTPS by default** - Automatic SSL  
✅ **Password protection** - HTTP Basic Auth  
✅ **Free hosting** - 750 hours/month  
✅ **Auto-deploy** - Push to GitHub → Auto-update  
✅ **30-day campaign** - 210+ posts visualized  
✅ **Real mockups** - Emergency Alert, Dashboard, Nebula Splash  

---

## ⚠️ Free Tier Limitations

- **Sleep after 15 min** of inactivity
- **First request** after sleep: 30-60s wake time
- **750 hours/month** free usage
- **No custom domain** on free tier

**Solution**: For personal/private use, free tier is perfect!

---

## 🔧 Troubleshooting

### Build Fails
- Check Render logs for specific error
- Verify `requirements.txt` is correct
- Ensure Python 3 runtime selected

### Can't Login
- Double-check environment variables
- Username/password are case-sensitive
- Try incognito/private browser window

### App Slow to Load
- Free tier apps sleep after 15 min
- First request takes 30-60s (normal)
- Subsequent requests are instant

---

## 🔄 Updating Content

When you update campaign posts or mockups:

```bash
# Make changes to files
git add .
git commit -m "Update campaign content"
git push origin main

# Render auto-deploys (if enabled)
# Or click "Manual Deploy" in Render dashboard
```

---

## 💰 Upgrade Options

**Free Tier** (Current):
- Perfect for private/personal use
- Apps sleep after 15 min inactivity

**Starter Plan** ($7/month):
- Always-on (no sleep)
- Faster performance
- Custom domain support

---

## 📊 Files Created

✅ `app.py` - Production Flask server with auth  
✅ `Procfile` - Tells Render how to start app  
✅ `.env.example` - Credentials template  
✅ `render.yaml` - Render configuration  
✅ `requirements.txt` - Python dependencies  
✅ `DEPLOY_RENDER.md` - This guide  

---

## 🎯 What's Deployed

**Campaign Preview Dashboard**:
- 210+ posts over 30 days
- Multi-platform: Instagram, Facebook, Twitter, TikTok, Pinterest
- Real app mockups integrated
- v4.2.0+243 FINDERR Beta Campaign

**Preview Files**:
- `preview/campaign-preview-final.html` - Main dashboard
- `preview/screenshot_1.png` - Emergency Alert
- `preview/screenshot_2.png` - Premium Dashboard
- `preview/screenshot_3.png` - Nebula Splash
- `preview/screenshot_4.png` - Nebula Splash variant

---

## 🔗 Resources

- **Render Docs**: https://render.com/docs/web-services
- **Render Dashboard**: https://dashboard.render.com
- **This Repository**: Hub_App_Shop_Integ/automation/social_media/

---

**Status**: Ready for deployment ✅
**Estimated Deploy Time**: 5-10 minutes
**Cost**: $0 (free tier)
