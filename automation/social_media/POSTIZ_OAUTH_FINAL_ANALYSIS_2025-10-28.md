# Postiz OAuth Configuration - Final Analysis

**Date**: 2025-10-28
**Issue**: "URL Blocked" error when attempting Instagram/Facebook OAuth
**Root Cause Identified**: OAuth redirect URL mismatch

---

## Problem Summary

When attempting to connect Instagram or Facebook accounts via Postiz, the OAuth flow fails with:
```
URL Blocked: This redirect failed because the redirect URI is not whitelisted
in the app's Client OAuth Settings.
```

## Root Cause Analysis

### How Postiz OAuth Works

1. **OAuth Callback URL Pattern**: `/integrations/social/{provider}`
2. **URL Construction**: Postiz uses `FRONTEND_URL` to build the callback URL
3. **Meta Requirement**: Callback URLs must be HTTPS for Instagram/Facebook OAuth
4. **Current Configuration Problem**:
   - `FRONTEND_URL=http://localhost:4200` (HTTP, not HTTPS)
   - Meta rejects localhost HTTP URLs
   - OAuth callbacks fail with "URL Blocked"

### Tested Solutions

#### ❌ **Attempt 1**: Add `REDIRECT_URI` environment variable
- **Config**: `REDIRECT_URI=https://jutta-vibrioid-erinn.ngrok-free.dev`
- **Result**: Postiz doesn't use this variable - it constructs URLs from `FRONTEND_URL`
- **Outcome**: Failed, URL still blocked

#### ❌ **Attempt 2**: Set `NEXT_PUBLIC_BACKEND_URL` to ngrok
- **Config**: `NEXT_PUBLIC_BACKEND_URL=https://jutta-vibrioid-erinn.ngrok-free.dev`
- **Result**: Frontend couldn't communicate with backend properly
- **Outcome**: Failed, page load issues

#### ❌ **Attempt 3**: Set all URLs to ngrok (full ngrok mode)
- **Config**: All URLs (`FRONTEND_URL`, `NEXT_PUBLIC_BACKEND_URL`, etc.) pointing to ngrok
- **Result**: Login page loads but authentication hangs with infinite spinner
- **Outcome**: Failed, authentication broken

---

## The Fundamental Problem

**Postiz + ngrok + OAuth = Complex Configuration Challenge**

1. **For normal operation**: Postiz needs `FRONTEND_URL=http://localhost:4200`
2. **For Meta OAuth**: Postiz needs `FRONTEND_URL=https://{ngrok-domain}`
3. **The conflict**: Can't have both simultaneously

### Why ngrok Doesn't Work Well

1. **Latency**: ngrok adds network latency to every request
2. **Session Issues**: Different domains (localhost vs ngrok) cause session/cookie problems
3. **CORS**: Cross-origin issues between frontend and backend
4. **Authentication**: NextAuth struggles with domain mismatches

---

## Recommended Solutions

### ✅ **Solution 1: Use Postiz Cloud/Hosted Instance** (EASIEST)

**Pros**:
- Native HTTPS support
- No ngrok complexity
- Official OAuth configuration
- Reliable and tested

**Cons**:
- Requires cloud hosting or Postiz.com subscription
- Not self-hosted

**Implementation**: Deploy Postiz to a server with HTTPS (e.g., Railway, Heroku, VPS with Let's Encrypt)

---

### ✅ **Solution 2: Use redirectmeto.com Proxy** (DOCUMENTED IN POSTIZ DOCS)

From official Postiz documentation:

> For localhost environments where the provider doesn't accept http URIs, you can use:
> `https://redirectmeto.com/http://localhost:4200/integrations/social/[provider]`

**Steps**:

1. **Keep Postiz Configuration Simple**:
```bash
FRONTEND_URL=http://localhost:4200
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
# All other URLs as localhost
```

2. **Configure Meta OAuth Redirect URIs** with redirectmeto.com proxy:
```
https://redirectmeto.com/http://localhost:4200/integrations/social/instagram
https://redirectmeto.com/http://localhost:4200/integrations/social/facebook
```

3. **How it works**:
   - Meta redirects to: `https://redirectmeto.com/http://localhost:4200/...`
   - redirectmeto.com proxy forwards to: `http://localhost:4200/...`
   - Postiz receives the OAuth callback locally
   - No ngrok complexity required

**Pros**:
- Simple configuration
- No ngrok needed
- Documented Postiz solution
- Works with localhost

**Cons**:
- Relies on third-party proxy service (redirectmeto.com)
- Potential privacy concern (OAuth tokens pass through proxy)

---

### ✅ **Solution 3: Local HTTPS with Self-Signed Certificate** (ADVANCED)

**Setup**:
1. Generate self-signed SSL certificate
2. Configure reverse proxy (nginx/caddy) with SSL
3. Set `FRONTEND_URL=https://localhost:4200`
4. Add certificate to system trust store

**Pros**:
- True HTTPS locally
- No external dependencies
- Full control

**Cons**:
- Complex setup
- Certificate trust warnings
- Not portable across machines

---

## Current Status

### What's Working ✅
- Postiz container running successfully
- Database and Redis operational
- Login works at `http://localhost:4200`
- OAuth credentials configured (Instagram, Facebook, TikTok)
- ngrok tunnel active at `https://jutta-vibrioid-erinn.ngrok-free.dev`

### What's NOT Working ❌
- Instagram OAuth: "URL Blocked" error
- Facebook OAuth: "URL Blocked" error
- ngrok-based OAuth configuration attempts all failed

### Meta Developer Console ✅
- **OAuth Redirect URIs Configured**:
  ```
  https://jutta-vibrioid-erinn.ngrok-free.dev/integrations/social/instagram
  https://jutta-vibrioid-erinn.ngrok-free.dev/integrations/social/facebook
  ```
- **Problem**: Postiz isn't constructing callbacks using these URLs

---

## Immediate Next Steps

### Option A: Try redirectmeto.com Proxy (RECOMMENDED - 10 minutes)

1. **Update Meta OAuth Redirect URIs** to:
```
https://redirectmeto.com/http://localhost:4200/integrations/social/instagram
https://redirectmeto.com/http://localhost:4200/integrations/social/facebook
```

2. **Reconfigure Postiz** to simple localhost:
```bash
docker run -d --name untrapd-postiz \
  --network postiz-network \
  -p 3000:3000 -p 4200:4200 -p 5000:5000 \
  -e FRONTEND_URL=http://localhost:4200 \
  -e NEXT_PUBLIC_BACKEND_URL=http://localhost:3000 \
  -e BACKEND_INTERNAL_URL=http://localhost:3000 \
  -e NEXTAUTH_URL=http://localhost:4200 \
  -e MAIN_URL=http://localhost:4200 \
  -e DATABASE_URL=postgresql://postiz:postiz_password@untrapd-postiz-db:5432/postiz \
  -e REDIS_URL=redis://untrapd-postiz-redis:6379 \
  -e JWT_SECRET=untrapd-hub-postiz-jwt-secret-key-2025 \
  -e NEXTAUTH_SECRET=untrapd-hub-nextauth-secret-key-2025 \
  -e NODE_ENV=production \
  -e STORAGE_PROVIDER=local \
  -e INSTAGRAM_APP_ID=738653215879612 \
  -e INSTAGRAM_APP_SECRET=be8297b868a6762ad54d4530545428fd \
  -e FACEBOOK_APP_ID=738653215879612 \
  -e FACEBOOK_APP_SECRET=be8297b868a6762ad54d4530545428fd \
  -e TIKTOK_CLIENT_KEY=awzpr6gs8tayotje \
  -e TIKTOK_CLIENT_SECRET=zMeV70hup8dxHGstbS474TiQLIty5lAf \
  ghcr.io/gitroomhq/postiz-app:latest
```

3. **Test OAuth Connection**: Try connecting Instagram/Facebook

4. **Expected Result**: OAuth should work through redirectmeto.com proxy

---

### Option B: Deploy Postiz with HTTPS (30-60 minutes)

Deploy to a cloud service with native HTTPS:
- **Railway**: One-click deploy
- **Heroku**: Easy HTTPS support
- **VPS + Caddy**: Automatic HTTPS with Let's Encrypt

---

## Technical Details for Future Reference

### Postiz OAuth Callback Flow

1. User clicks "Connect Instagram" in Postiz
2. Postiz generates OAuth URL: `https://api.instagram.com/oauth/authorize?redirect_uri={CALLBACK_URL}`
3. **Callback URL = `{FRONTEND_URL}/integrations/social/instagram`**
4. User authorizes on Instagram
5. Instagram redirects to callback URL with authorization code
6. Postiz exchanges code for access token
7. Account connected

### Why `FRONTEND_URL` Matters

The `FRONTEND_URL` environment variable is critical because:
- Postiz constructs OAuth callback URLs from it
- Must match what's registered in Meta Developer Console
- Must be HTTPS for Instagram/Facebook (Meta requirement)
- Must be accessible by user's browser (not internal Docker URL)

### ngrok Limitations for This Use Case

- ✅ Good for: Exposing local services for testing webhooks
- ❌ Not ideal for: Complete application hosting with authentication
- Issues: Latency, session management, CORS, domain mismatches

---

## Conclusion

The "URL Blocked" error is not a Postiz bug - it's a fundamental OAuth/HTTPS requirement that localhost development doesn't naturally satisfy. The recommended path forward is:

1. **Quickest**: Use `redirectmeto.com` proxy (Postiz-documented solution)
2. **Production**: Deploy Postiz with proper HTTPS hosting
3. **Advanced**: Local HTTPS setup with self-signed certificates

For launching the FINDERR beta campaign, **Option 1 (redirectmeto.com)** is the fastest path to success.

---

**Files Referenced**:
- `automation/social_media/postiz-oauth.env` - OAuth credentials
- `automation/social_media/POSTIZ_OAUTH_COMPLETE_SOLUTION.md` - Previous session notes
- Postiz Docs: https://docs.postiz.com/providers/

**Next Session**: Implement redirectmeto.com proxy solution and test OAuth connections.
