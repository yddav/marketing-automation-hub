# Railway CLI Deployment Guide

This method bypasses GitHub build issues by using Railway CLI directly.

## Install Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Or using curl (if npm doesn't work)
curl -fsSL https://railway.app/install.sh | sh
```

## Login to Railway

```bash
railway login
```

This opens your browser for authentication.

## Create New Project

```bash
# Initialize new Railway project
railway init

# When prompted:
# Project name: untrapd-postiz
# Environment: production
```

## Add PostgreSQL

```bash
railway add --plugin postgresql
```

## Add Redis

```bash
railway add --plugin redis
```

## Deploy Postiz

```bash
# Set environment variables
railway variables set FRONTEND_URL='${{RAILWAY_STATIC_URL}}'
railway variables set NEXT_PUBLIC_BACKEND_URL='${{RAILWAY_STATIC_URL}}'
railway variables set BACKEND_INTERNAL_URL='http://localhost:3000'
railway variables set NEXTAUTH_URL='${{RAILWAY_STATIC_URL}}'
railway variables set MAIN_URL='${{RAILWAY_STATIC_URL}}'
railway variables set NODE_ENV='production'
railway variables set STORAGE_PROVIDER='local'
railway variables set JWT_SECRET='untrapd-hub-postiz-jwt-secret-key-2025'
railway variables set NEXTAUTH_SECRET='untrapd-hub-nextauth-secret-key-2025'
railway variables set INSTAGRAM_APP_ID='738653215879612'
railway variables set INSTAGRAM_APP_SECRET='be8297b868a6762ad54d4530545428fd'
railway variables set FACEBOOK_APP_ID='738653215879612'
railway variables set FACEBOOK_APP_SECRET='be8297b868a6762ad54d4530545428fd'
railway variables set TIKTOK_CLIENT_KEY='awzpr6gs8tayotje'
railway variables set TIKTOK_CLIENT_SECRET='zMeV70hup8dxHGstbS474TiQLIty5lAf'

# Deploy Docker image
railway up --image ghcr.io/gitroomhq/postiz-app:latest
```

## Get Your URL

```bash
railway domain
```

This will show your HTTPS URL.

---

## If CLI Doesn't Work: Manual Dashboard Method

Go to: https://railway.app/new/template/postiz

OR:

1. Create new empty project
2. Click "+ New" → "Docker Image"
3. Image: `ghcr.io/gitroomhq/postiz-app:latest`
4. Add PostgreSQL: "+ New" → "Database" → "PostgreSQL"
5. Add Redis: "+ New" → "Database" → "Redis"
6. Configure variables (see above)
7. Generate domain in Settings

---

**Status**: Railway CLI method bypasses GitHub build entirely
