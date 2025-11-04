# 🚀 Postiz Deployment on Railway.app (15 Minutes)

**Date**: 2025-10-31  
**Status**: ✅ SOLUTION - Railway has 8GB RAM (vs Render's 512MB)  
**Problem**: Postiz needs 1GB+ RAM, Render free tier only has 512MB  
**Solution**: Railway.app free tier includes 8GB RAM + PostgreSQL + Redis

---

## ⚡ STEP-BY-STEP DEPLOYMENT

### Step 1: Create Railway Account (2 minutes)

1. Go to: **https://railway.app**
2. Click **"Start a New Project"** or **"Login with GitHub"**
3. Authorize with GitHub (recommended)
4. You get **$5 free credit** (enough for 1-2 months)

---

### Step 2: Deploy Postiz (3 minutes)

1. **Click "New Project"**
2. Select **"Deploy from Docker Image"**
3. **Docker Image**: 
   ```
   ghcr.io/gitroomhq/postiz-app:latest
   ```
4. Click **"Deploy"**

---

### Step 3: Add PostgreSQL (2 minutes)

1. In your project, click **"New"** → **"Database"** → **"Add PostgreSQL"**
2. Railway automatically creates it
3. Click on the PostgreSQL service
4. Click **"Connect"** tab
5. **Copy the "Private URL"** (starts with `postgresql://`)
6. Save it for Step 5

---

### Step 4: Add Redis (2 minutes)

1. Click **"New"** → **"Database"** → **"Add Redis"**
2. Railway automatically creates it
3. Click on the Redis service
4. Click **"Connect"** tab
5. **Copy the "Private URL"** (starts with `redis://`)
6. Save it for Step 5

**ALTERNATIVE**: Use your existing Upstash Redis URL instead!

---

### Step 5: Configure Environment Variables (5 minutes)

1. Click on your **Postiz service** (the Docker deployment)
2. Go to **"Variables"** tab
3. Click **"+ New Variable"**

**Add these variables:**

```bash
# Your Railway domain (Railway provides this automatically)
FRONTEND_URL=${{RAILWAY_PUBLIC_DOMAIN}}
NEXT_PUBLIC_BACKEND_URL=${{RAILWAY_PUBLIC_DOMAIN}}
NEXTAUTH_URL=${{RAILWAY_PUBLIC_DOMAIN}}
MAIN_URL=${{RAILWAY_PUBLIC_DOMAIN}}

# Internal backend
BACKEND_INTERNAL_URL=http://localhost:3000

# Database (paste your PostgreSQL Private URL from Step 3)
DATABASE_URL=postgresql://postgres:xxxxx@xxxxx.railway.internal:5432/railway

# Redis (paste your Redis Private URL from Step 4 OR your Upstash URL)
REDIS_URL=redis://default:xxxxx@xxxxx.railway.internal:6379

# Upload directory
UPLOAD_DIRECTORY=/tmp/uploads

# OAuth Credentials (Meta)
META_APP_ID=738653215879612
META_APP_SECRET=be8297b868a6762ad54d4530545428fd

# OAuth Credentials (TikTok)
TIKTOK_CLIENT_KEY=awzpr6gs8tayotje
TIKTOK_CLIENT_SECRET=zMeV70hup8dxHGstbS474TiQLIty5lAf

# Security Secrets
JWT_SECRET=untrapd-hub-postiz-jwt-secret-key-2025
NEXTAUTH_SECRET=untrapd-hub-nextauth-secret-key-2025

# Environment
NODE_ENV=production
IS_GENERAL=true

# Ports
PORT=4200
BACKEND_PORT=3000
FRONTEND_PORT=4200
```

4. Click **"Deploy"** (top right)

---

### Step 6: Generate Public Domain (1 minute)

1. Click on your **Postiz service**
2. Go to **"Settings"** tab
3. Scroll to **"Networking"**
4. Click **"Generate Domain"**
5. Railway creates: `https://your-project.up.railway.app`

---

### Step 7: Wait for Deployment (3-5 minutes)

1. Go to **"Deployments"** tab
2. Watch the logs
3. Wait for: `Listening on port 4200` or `Server started`
4. Status will show **"Active"** when ready

---

## ✅ TEST YOUR DEPLOYMENT

Once deployed, visit:
```
https://your-project.up.railway.app
```

You should see the Postiz login page! 🎉

---

## 🔧 TROUBLESHOOTING

### If you see errors:

1. **Check Variables tab** - Make sure all 16 variables are set
2. **Check DATABASE_URL** - Must be the PostgreSQL Private URL
3. **Check REDIS_URL** - Must be Redis Private URL or Upstash URL
4. **View Logs** - Click "Deployments" → Latest deployment → "View Logs"

### If it's slow to load:

- First startup takes 3-5 minutes (database migration)
- Railway free tier can sleep after inactivity
- First request after sleep takes ~30 seconds

---

## 💰 COST

- **$5 free credit** on signup
- **~$2-3/month** after credit runs out (still cheaper than Render paid)
- Can pause services when not using to save credit

---

## 🎯 NEXT STEPS

Once Postiz is running:

1. Login to Postiz dashboard
2. Connect Instagram/Facebook (OAuth will work with HTTPS!)
3. Connect TikTok, Twitter
4. Start scheduling posts! 🚀

---

**Questions? Issues?** Check the logs in Railway dashboard!
