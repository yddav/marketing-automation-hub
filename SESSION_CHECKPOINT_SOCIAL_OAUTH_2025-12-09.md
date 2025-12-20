# Session Checkpoint: Social Media OAuth Setup

**Date**: 2025-12-09
**Session Type**: OAuth Token Configuration & Native API Integration
**Branch**: main
**Status**: 4/5 Platforms Ready, TikTok Pending

---

## Session Context

Completed OAuth token refresh setup for UNTRAPD marketing automation. Moved away from external services (Render deployment struggles) to fully in-house solution using ngrok HTTPS tunnel with static domain.

---

## Platform Status Summary

| Platform | Status | Account | Notes |
|----------|--------|---------|-------|
| Twitter/X | VALID | @DavisUntrap | OAuth 1.0a tokens (no expiry) |
| Facebook | VALID | Untrapd Page | Long-lived token (~60 days) |
| Instagram | VALID | @untrapd.hub | Same token as Facebook |
| Pinterest | VALID | @untrapd.hub | Trial access, boards:read/write scopes |
| TikTok | PENDING | @untrapd.hub | PKCE implemented, needs redirect URI registration |

---

## Key Files Modified

### `/automation/social_media/oauth-server.py`
- Added PKCE support for TikTok (lines 42-56)
- Fixed Pinterest status check to use `/v5/boards` endpoint (works with available scopes)
- Updated all redirect URIs to use ngrok static domain
- TikTok OAuth now includes `code_challenge` and `code_challenge_method=S256`

### `/automation/social_media/.env`
Contains all credentials:
```
# META (Facebook/Instagram)
META_APP_ID=738653215879612
META_APP_SECRET=be8297b868a6762ad54d4530545428fd
FACEBOOK_PAGE_ID=830176470182189
INSTAGRAM_BUSINESS_ACCOUNT_ID=17841476173887045

# Twitter
TWITTER_API_KEY=5H0kiG4SqqWnExhiL5Kay4JPY
(OAuth 1.0a - fully configured)

# Pinterest
PINTEREST_APP_ID=1539386
PINTEREST_APP_SECRET=4a2d1f3f170537eb0ee99d1c9f43570ca156c42d
(Token valid, trial access active)

# TikTok - UNTRAPD
TIKTOK_CLIENT_KEY=aw6cacbbfdxyd1ft
TIKTOK_CLIENT_SECRET=Bes7eX9idSpe68aG82SFX8qEEiRj6OYV

# TikTok - FINDERR Sandbox
TIKTOK_SANDBOX_CLIENT_KEY=sbawr2f77qfp6dhi1q
TIKTOK_SANDBOX_CLIENT_SECRET=z6wS4aA07ENyM78XLPvX7o3UNwlbkgu0
```

---

## Infrastructure Setup

### ngrok Static Domain
- **Domain**: `jutta-vibrioid-erinn.ngrok-free.dev`
- **Purpose**: HTTPS callback URLs required by Facebook, Pinterest, TikTok
- **Persists**: Static domain remains same across restarts

### OAuth Server
- **Location**: `/automation/social_media/oauth-server.py`
- **Port**: 5000
- **Dashboard**: http://localhost:5000
- **Public**: https://jutta-vibrioid-erinn.ngrok-free.dev

### Registered Redirect URIs

| Platform | Redirect URI | Status |
|----------|-------------|--------|
| Meta | `https://jutta-vibrioid-erinn.ngrok-free.dev/meta/callback` | Registered |
| Pinterest | `https://jutta-vibrioid-erinn.ngrok-free.dev/pinterest/callback` | Registered |
| TikTok | `https://jutta-vibrioid-erinn.ngrok-free.dev/tiktok/callback` | **NEEDS REGISTRATION** |

---

## TikTok Setup Status

### What's Done
- UNTRAPD Production app: `aw6cacbbfdxyd1ft`
- UNTRAPD Sandbox app: `sbawb2svoeagxwri4p`
- FINDERR Sandbox app: `sbawr2f77qfp6dhi1q`
- PKCE implementation in oauth-server.py (code_challenge working)
- Logo resized to 1024x1024 square

### Blocking Issues
1. **Domain verification required** - TikTok won't save app config without verifying:
   - `untrapd.com`
   - `hub.untrapd.com`
   - `https://hub.untrapd.com/`

2. **Production app stuck in Draft** - Cannot save without domain verification

3. **App review required** - Even after domain verification, app needs TikTok review

### What's Needed (Future Session)
1. Add DNS TXT record for TikTok domain verification
2. Click "Continue to verify" in TikTok Developer Console
3. Complete app review submission
4. Wait for TikTok approval (days/weeks)

### PKCE Implementation Added
```python
def generate_code_verifier(length=128):
    return secrets.token_urlsafe(length)[:length]

def generate_code_challenge(verifier):
    digest = hashlib.sha256(verifier.encode('ascii')).digest()
    challenge = base64.urlsafe_b64encode(digest).decode('ascii').rstrip('=')
    return challenge
```

---

## Quick Start Commands (Nomad)

```bash
# Navigate to project
cd "/media/wolfy/D260DD2060DD0BDB/Datas/2025 Projects/AppBuildFlutterVscodiumClaude/UNTRAPD-hub-website/automation/social_media"

# Start ngrok with static domain
ngrok http --url=jutta-vibrioid-erinn.ngrok-free.dev 5000 &

# Start OAuth server
python3 oauth-server.py &

# Access dashboard
# Local: http://localhost:5000
# Public: https://jutta-vibrioid-erinn.ngrok-free.dev
```

---

## Issues Resolved This Session

### 1. Facebook "URL Blocked" Error
- **Cause**: Facebook requires HTTPS callback
- **Solution**: ngrok tunnel with static domain
- **Status**: FIXED

### 2. Pinterest "Application has not registered redirect URI" (400)
- **Cause**: Wrong App ID (1534758 vs 1539386)
- **Solution**: Updated PINTEREST_APP_ID in .env to 1539386
- **Status**: FIXED

### 3. Pinterest Showing "EXPIRED" Despite Working Token
- **Cause**: Dashboard checked `/v5/user_account` (needs user_accounts:read scope)
- **Solution**: Changed to `/v5/boards` endpoint (works with boards:read scope)
- **Status**: FIXED

### 4. TikTok "code_challenge" Error
- **Cause**: TikTok requires PKCE (Proof Key for Code Exchange)
- **Solution**: Implemented PKCE with S256 challenge method
- **Status**: IMPLEMENTED, awaiting redirect URI registration

---

## Assets Created

### Logo Files (for TikTok)
- `~/Downloads/UntrapD_logo_1024x1024_square.png` (531KB)
- `~/Downloads/UntrapD_logo_1024x1024_white.png` (532KB)

---

## Next Actions on Nomad

1. **Pull latest changes**
   ```bash
   git pull origin main
   ```

2. **Register TikTok Redirect URI**
   - URL: `https://jutta-vibrioid-erinn.ngrok-free.dev/tiktok/callback`
   - Add in TikTok Developer Console → UNTRAPD app → Configuration

3. **Start servers and test**
   ```bash
   cd automation/social_media
   ngrok http --url=jutta-vibrioid-erinn.ngrok-free.dev 5000 &
   python3 oauth-server.py
   ```

4. **Test TikTok OAuth**
   - Visit http://localhost:5000
   - Click "Authorize" for TikTok
   - Should work with PKCE now

---

## Session Learning

**Key Insight**: "Big journey fighting with Render when everything could be in-house"

The native API approach with local OAuth server + ngrok tunnel is:
- Simpler to debug
- No external service dependencies
- Zero cost (ngrok free tier)
- Full control over implementation

---

## Git Status Before Commit

```
Modified files:
- automation/social_media/oauth-server.py (PKCE + fixes)
- CLAUDE.md (minor updates)

New files:
- automation/social_media/launch.py
- automation/social_media/setup-credentials.py
- SESSION_CHECKPOINT_SOCIAL_OAUTH_2025-12-09.md
```

---

**Last Updated**: 2025-12-09 03:15 UTC
**Resume Priority**: TikTok redirect URI registration → OAuth test
