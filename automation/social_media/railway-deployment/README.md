# Postiz Railway Deployment

Production deployment of Postiz social media management platform for FINDERR beta campaign.

## Quick Start

### 1. Deploy to Railway

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new)

**Steps**:
1. Click "Deploy on Railway" button
2. Sign in with GitHub
3. Select `untrapd-postiz-deployment` repository
4. Grant Railway access to your private repo
5. Railway will auto-detect and deploy

### 2. Add Environment Variables

In Railway dashboard, add these environment variables:

```bash
# Security Secrets
JWT_SECRET=untrapd-hub-postiz-jwt-secret-key-2025
NEXTAUTH_SECRET=untrapd-hub-nextauth-secret-key-2025
POSTGRES_PASSWORD=postiz_secure_password_2025

# Instagram OAuth
INSTAGRAM_APP_ID=738653215879612
INSTAGRAM_APP_SECRET=be8297b868a6762ad54d4530545428fd

# Facebook OAuth
FACEBOOK_APP_ID=738653215879612
FACEBOOK_APP_SECRET=be8297b868a6762ad54d4530545428fd

# TikTok OAuth
TIKTOK_CLIENT_KEY=awzpr6gs8tayotje
TIKTOK_CLIENT_SECRET=zMeV70hup8dxHGstbS474TiQLIty5lAf
```

**Railway Auto-Provides** (don't add these):
- `RAILWAY_PUBLIC_DOMAIN` - Your HTTPS URL
- `DATABASE_URL` - PostgreSQL connection
- `REDIS_URL` - Redis connection

### 3. Get Your HTTPS URL

Railway will provide a URL like:
```
https://untrapd-postiz-production.up.railway.app
```

### 4. Update Meta OAuth Settings

Go to: https://developers.facebook.com/apps/738653215879612/fb-login/settings/

**Update Valid OAuth Redirect URIs**:
```
https://YOUR-RAILWAY-URL.up.railway.app/integrations/social/instagram
https://YOUR-RAILWAY-URL.up.railway.app/integrations/social/facebook
```

Replace `YOUR-RAILWAY-URL` with your actual Railway domain.

### 5. Connect Social Accounts

1. Access your Postiz: `https://YOUR-RAILWAY-URL.up.railway.app`
2. Login: `admin@untrapd.hub` / `UntrapdHub2025Strong`
3. Click "Add Channel"
4. Connect:
   - ✅ Instagram: @untrapd.hub
   - ✅ Facebook: un trapd page
   - ✅ Twitter: @DavisUntrap
   - ✅ TikTok: @untrapd.hub

### 6. Launch Beta Campaign

```bash
# Update your local script to use Railway URL
sed -i 's|http://localhost:3000|https://YOUR-RAILWAY-URL.up.railway.app|g' ../postiz-working-client.js

# Verify connections
node ../postiz-working-client.js

# Schedule 45-post campaign
node ../finderr-postiz-integration.js schedule
```

---

## Architecture

```
Railway Platform
├── Postiz App (Docker)
│   ├── Port 3000: Backend API
│   ├── Port 4200: Frontend UI
│   └── Port 5000: Webhooks
├── PostgreSQL 15 (Managed)
└── Redis 7 (Managed)
```

## Environment Variables

| Variable | Source | Description |
|----------|--------|-------------|
| `RAILWAY_PUBLIC_DOMAIN` | Auto | Your HTTPS domain |
| `DATABASE_URL` | Auto | PostgreSQL connection |
| `REDIS_URL` | Auto | Redis connection |
| `JWT_SECRET` | Manual | JWT signing key |
| `NEXTAUTH_SECRET` | Manual | NextAuth secret |
| `POSTGRES_PASSWORD` | Manual | Database password |
| `INSTAGRAM_APP_ID` | Manual | Instagram OAuth app ID |
| `INSTAGRAM_APP_SECRET` | Manual | Instagram OAuth secret |
| `FACEBOOK_APP_ID` | Manual | Facebook OAuth app ID |
| `FACEBOOK_APP_SECRET` | Manual | Facebook OAuth secret |
| `TIKTOK_CLIENT_KEY` | Manual | TikTok OAuth key |
| `TIKTOK_CLIENT_SECRET` | Manual | TikTok OAuth secret |

## Deployment Status

- **Platform**: Railway.app
- **Region**: Auto-selected (US/EU)
- **HTTPS**: Automatic (Let's Encrypt)
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **Cost**: Free tier (5GB egress/month)

## Troubleshooting

### "URL Blocked" Error
- ✅ Verify Meta OAuth redirect URIs match Railway domain exactly
- ✅ Include `/integrations/social/{provider}` path
- ✅ Use HTTPS (Railway provides this automatically)
- ✅ Wait 2-3 minutes after updating Meta settings

### Login Issues
- ✅ Check Railway logs for errors
- ✅ Verify `NEXTAUTH_SECRET` is set
- ✅ Clear browser cookies
- ✅ Try incognito/private browsing

### Database Connection Failed
- ✅ Railway auto-provisions PostgreSQL
- ✅ Check `DATABASE_URL` is present in environment
- ✅ Restart service if needed

## Migration from Localhost

### Export Data (Optional)
```bash
# Backup localhost database
docker exec untrapd-postiz-db pg_dump -U postiz postiz > postiz_backup.sql

# Import to Railway (after deployment)
railway run psql $DATABASE_URL < postiz_backup.sql
```

### Start Fresh (Recommended)
1. Deploy to Railway
2. Create new admin account
3. Connect social accounts
4. No data migration needed

---

## Support

- **Railway Docs**: https://docs.railway.app
- **Postiz Docs**: https://docs.postiz.com
- **Meta OAuth**: https://developers.facebook.com/docs/facebook-login

## Project Info

- **Repository**: github.com/YOUR-USERNAME/untrapd-postiz-deployment-
- **Purpose**: FINDERR beta campaign social media automation
- **Campaign**: 45 posts, 30 days, 4 platforms
- **Target**: 100 beta testers

---

**Status**: ✅ Ready for Railway deployment
**Next**: Push to GitHub → Deploy on Railway → Connect OAuth
