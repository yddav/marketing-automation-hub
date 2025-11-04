# 🚀 FASTEST RENDER DEPLOYMENT - From Your Dashboard

**You're already in Render dashboard - perfect!**

## OPTION A: Direct Docker Image (FASTEST - 5 minutes)

1. **In Render Dashboard** → Click **"New +"** → **"Web Service"**

2. **Select**: "Deploy an existing image from a registry"

3. **Fill in**:
   - **Image URL**: `ghcr.io/gitroomhq/postiz-app:latest`
   - **Name**: `untrapd-postiz`
   - **Region**: Oregon (US West)
   - **Instance Type**: Free
   - **Port**: `4200`

4. Click **"Advanced"** → **"Add Environment Variable"**

   Copy-paste these (all at once):
   ```
   INSTAGRAM_APP_ID=738653215879612
   INSTAGRAM_APP_SECRET=be8297b868a6762ad54d4530545428fd
   FACEBOOK_APP_ID=738653215879612
   FACEBOOK_APP_SECRET=be8297b868a6762ad54d4530545428fd
   TIKTOK_CLIENT_KEY=awzpr6gs8tayotje
   TIKTOK_CLIENT_SECRET=zMeV70hup8dxHGstbS474TiQLIty5lAf
   JWT_SECRET=untrapd-hub-postiz-jwt-secret-key-2025
   NEXTAUTH_SECRET=untrapd-hub-nextauth-secret-key-2025
   NODE_ENV=production
   STORAGE_PROVIDER=local
   BACKEND_INTERNAL_URL=http://localhost:3000
   ```

5. **Scroll down** → Click **"Create Web Service"**

6. **While deploying** (takes 2-3 min), do this:
   - Click **"New +"** → **"PostgreSQL"**
   - Name: `untrapd-postiz-db`
   - Region: Oregon
   - Plan: Free
   - Click **"Create Database"**

7. **Add Redis**:
   - Click **"New +"** → **"Redis"**
   - Name: `untrapd-postiz-redis`
   - Region: Oregon
   - Plan: Free
   - Click **"Create Redis"**

8. **Link databases** (after all 3 are created):
   - Go to your `untrapd-postiz` web service
   - **Environment** tab
   - Add these variables:
     - `DATABASE_URL` = (copy from PostgreSQL service → Internal Connection String)
     - `REDIS_URL` = (copy from Redis service → Internal Connection String)
     - `FRONTEND_URL` = (copy your Render URL - looks like `https://untrapd-postiz.onrender.com`)
     - `NEXT_PUBLIC_BACKEND_URL` = (same as FRONTEND_URL)
     - `NEXTAUTH_URL` = (same as FRONTEND_URL)
     - `MAIN_URL` = (same as FRONTEND_URL)

9. **Save** → Service will auto-redeploy

10. **Done!** Your Postiz is live at your Render URL

---

## WHAT TO DO AFTER DEPLOYMENT

Once you see "Live" status:

1. **Get your Render URL** (looks like `https://untrapd-postiz-xyz.onrender.com`)

2. **Update Meta OAuth**:
   - Go to: https://developers.facebook.com/apps/738653215879612/fb-login/settings/
   - Replace redirect URIs with:
     ```
     https://YOUR-RENDER-URL.onrender.com/integrations/social/instagram
     https://YOUR-RENDER-URL.onrender.com/integrations/social/facebook
     ```
   - Save and wait 3 minutes

3. **Test OAuth**:
   - Open your Postiz: `https://YOUR-RENDER-URL.onrender.com`
   - Create account: `admin@untrapd.hub` / `UntrapdHub2025Strong`
   - Click "Add Channel" → Instagram
   - **OAuth will work!** No more "URL Blocked"! ✅

---

**Total Time**: 15-20 minutes
**Result**: Working OAuth for all 4 platforms!

Tell me when you're deploying and I'll watch for any issues! 🚀
