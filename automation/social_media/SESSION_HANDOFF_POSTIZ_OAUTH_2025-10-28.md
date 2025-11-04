# Postiz OAuth Setup - Session Handoff (UPDATED)
**Date**: 2025-10-28 (Updated after successful fix)
**Status**: ✅ ENVIRONMENT FIXED - Postiz Fully Functional with Localhost URLs
**Next Session Goal**: Configure ngrok + Test Instagram/Facebook OAuth

---

## 🎉 SESSION UPDATE: PROBLEM SOLVED!

### Root Cause Identified and Fixed
**Problem**: Pages loading but not rendering (blank/black screens)

**Cause**: Environment variable mismatch between ngrok URL and localhost
```bash
# Original configuration had:
FRONTEND_URL=https://jutta-vibrioid-erinn.ngrok-free.dev  # ngrok URL
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000             # localhost
# This mismatch prevented proper frontend-backend communication
```

**Solution**: Changed all URLs to localhost for testing
```bash
FRONTEND_URL=http://localhost:4200
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
BACKEND_INTERNAL_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:4200
MAIN_URL=http://localhost:4200
```

**Result**: ✅ All pages now render correctly!
- `/launches` - Main calendar/scheduling interface ✅
- `/analytics` - Analytics dashboard ✅
- `/integrations` - Integration management ✅
- `/media`, `/settings`, `/plugs` - All working ✅

---

## ✅ COMPLETED WORK (This Session)

### 1. ngrok Static Domain Setup
- **Installed**: ngrok v3.32.0 in `/tmp/ngrok`
- **Auth Token**: `34fo8uedeOM9ZoBF3J7hQnu0iob_6PpUmj2RAMBQXUsb8W7eG` (configured in `~/.config/ngrok/ngrok.yml`)
- **Static Domain**: `jutta-vibrioid-erinn.ngrok-free.dev`
- **Tunnel Status**: Running and accessible
- **Test**: `curl https://jutta-vibrioid-erinn.ngrok-free.dev` returns ngrok warning page (expected)

### 2. Meta OAuth Redirect URIs Updated
- **App**: UNTRAPD Social Automation
- **App ID**: 738653215879612
- **Dashboard**: https://developers.facebook.com/apps/738653215879612/fb-login/settings/
- **Redirect URIs Configured**:
  - `https://jutta-vibrioid-erinn.ngrok-free.dev/integrations/social/instagram`
  - `https://jutta-vibrioid-erinn.ngrok-free.dev/integrations/social/facebook`
- **Status**: Saved in Meta Developer Console

### 3. Postiz Container Configuration
- **Environment File**: `/media/wolfy/.../automation/social_media/postiz-oauth.env`
- **Container Name**: `untrapd-postiz`
- **Network**: `postiz-network`
- **Ports**: 4200 (frontend), 3000 (backend)
- **Image**: `ghcr.io/gitroomhq/postiz-app:latest`
- **Status**: Running

### 4. Key Environment Variables
```bash
INSTAGRAM_APP_ID=738653215879612
INSTAGRAM_APP_SECRET=be8297b868a6762ad54d4530545428fd
FACEBOOK_APP_ID=738653215879612
FACEBOOK_APP_SECRET=be8297b868a6762ad54d4530545428fd
TIKTOK_CLIENT_KEY=awzpr6gs8tayotje
TIKTOK_CLIENT_SECRET=zMeV70hup8dxHGstbS474TiQLIty5lAf

NODE_ENV=production
JWT_SECRET=untrapd-hub-postiz-jwt-secret-key-2025
NEXTAUTH_SECRET=untrapd-hub-nextauth-secret-key-2025
NEXTAUTH_URL=https://jutta-vibrioid-erinn.ngrok-free.dev
DATABASE_URL=postgresql://postiz:postiz_password@untrapd-postiz-db:5432/postiz
REDIS_URL=redis://untrapd-postiz-redis:6379

MAIN_URL=https://jutta-vibrioid-erinn.ngrok-free.dev
FRONTEND_URL=https://jutta-vibrioid-erinn.ngrok-free.dev
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
BACKEND_INTERNAL_URL=http://localhost:3000
STORAGE_PROVIDER=local
```

---

## ✅ ISSUE RESOLVED: Login Working!

### What Fixed It
**Solution**: Environment variable consistency
- Changed all URLs from ngrok to localhost
- Ensured `FRONTEND_URL` and `NEXT_PUBLIC_BACKEND_URL` match
- Restarted container on correct Docker network (`postiz-network`)

### Login Status
- ✅ Login page renders correctly
- ✅ Form submission works
- ✅ Authentication successful
- ✅ Redirects to `/analytics` page (default landing)
- ✅ All navigation working

### Test Credentials
- **Email**: `admin@untrapd.hub`
- **Password**: `UntrapdHub2025Strong`
- **Provider**: LOCAL (automatically handled by form)

---

## 📋 NEXT STEPS FOR FRESH SESSION

### Objective: Instagram/Facebook OAuth Integration

**Goal**: Connect Instagram and Facebook accounts to Postiz for social media automation

### Prerequisites
- ✅ Postiz container running (currently on localhost URLs)
- ✅ Login working with `admin@untrapd.hub` / `UntrapdHub2025Strong`
- ✅ ngrok account and static domain configured
- ✅ Instagram/Facebook app credentials ready
- ✅ Puppeteer MCP installed and working

### Phase 1: Switch to ngrok URLs (CRITICAL FOR OAUTH)

**Why ngrok is Required**:
- Instagram/Facebook OAuth requires HTTPS
- OAuth redirect URIs must be publicly accessible
- Localhost URLs won't work for social media integrations

**Step 1: Start ngrok Tunnel**
```bash
# ngrok is already installed in /tmp/ngrok
# Static domain: jutta-vibrioid-erinn.ngrok-free.dev

# Start tunnel
/tmp/ngrok http 4200 --domain=jutta-vibrioid-erinn.ngrok-free.dev

# Verify running
curl https://jutta-vibrioid-erinn.ngrok-free.dev
```

**Step 2: Update Postiz Environment Variables**
```bash
# Stop current container
docker stop untrapd-postiz && docker rm untrapd-postiz

# Restart with ngrok URLs
docker run -d --name untrapd-postiz \
  --network postiz-network \
  -p 3000:3000 -p 4200:4200 -p 5000:5000 \
  -e FRONTEND_URL=https://jutta-vibrioid-erinn.ngrok-free.dev \
  -e NEXT_PUBLIC_BACKEND_URL=https://jutta-vibrioid-erinn.ngrok-free.dev \
  -e BACKEND_INTERNAL_URL=http://localhost:3000 \
  -e NEXTAUTH_URL=https://jutta-vibrioid-erinn.ngrok-free.dev \
  -e MAIN_URL=https://jutta-vibrioid-erinn.ngrok-free.dev \
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

# Wait for startup
sleep 30 && docker logs untrapd-postiz --tail 20
```

**Step 3: Update Meta OAuth Redirect URIs** (if not already done)
1. Go to: https://developers.facebook.com/apps/738653215879612/fb-login/settings/
2. Add redirect URIs:
   - `https://jutta-vibrioid-erinn.ngrok-free.dev/integrations/social/instagram`
   - `https://jutta-vibrioid-erinn.ngrok-free.dev/integrations/social/facebook`
3. Save changes

### Phase 2: Test Instagram OAuth Integration

**Steps**:
1. Open Puppeteer browser: `https://jutta-vibrioid-erinn.ngrok-free.dev`
2. Log in with: `admin@untrapd.hub` / `UntrapdHub2025Strong`
3. Navigate to Integrations or Launches page
4. Click "Add Channel" → Select Instagram
5. Complete OAuth flow
6. Verify connection successful

### Phase 3: Test Facebook OAuth Integration

**Steps** (same as Instagram):
1. In Postiz, click "Add Channel" → Select Facebook
2. Complete OAuth flow
3. Verify connection successful

### Phase 4: Verify Posting Capability

**Test**:
1. Create a test post in Launches calendar
2. Select connected Instagram/Facebook channels
3. Schedule post
4. Verify post appears in queue

### Verification Checklist
- [x] Puppeteer MCP installed and working
- [x] Postiz container functional on localhost
- [x] Login working (`admin@untrapd.hub` / `UntrapdHub2025Strong`)
- [x] All main pages rendering (launches, analytics, integrations, etc.)
- [ ] ngrok tunnel started with static domain
- [ ] Postiz container restarted with ngrok URLs
- [ ] Login works via ngrok URL
- [ ] Instagram OAuth connection successful
- [ ] Facebook OAuth connection successful
- [ ] TikTok OAuth connection works (optional)
- [ ] Test post created and scheduled

---

## 🔧 TROUBLESHOOTING COMMANDS

### Container Management
```bash
# Restart container
docker restart untrapd-postiz

# View logs
docker logs untrapd-postiz --follow

# Access container shell
docker exec -it untrapd-postiz sh

# Check running processes
docker exec untrapd-postiz pm2 status
```

### Database Queries
```bash
# Connect to database
docker exec -it untrapd-postiz-db psql -U postiz -d postiz

# Check users
SELECT id, email, name FROM "User";

# Check integrations
SELECT * FROM "Integration";
```

### Network Testing
```bash
# Test backend
curl http://localhost:3000/auth/can-register

# Test frontend
curl http://localhost:4200

# Test ngrok tunnel
curl https://jutta-vibrioid-erinn.ngrok-free.dev
```

### ngrok Management
```bash
# Check ngrok status
/tmp/ngrok status

# View ngrok config
cat ~/.config/ngrok/ngrok.yml

# Restart ngrok (if needed)
# Stop: pgrep ngrok | xargs kill
# Start: /tmp/ngrok http 4200 --domain=jutta-vibrioid-erinn.ngrok-free.dev
```

---

## 📁 KEY FILE LOCATIONS

### Configuration Files
- **OAuth Environment**: `/media/wolfy/.../automation/social_media/postiz-oauth.env`
- **ngrok Config**: `~/.config/ngrok/ngrok.yml`
- **ngrok Binary**: `/tmp/ngrok`

### Docker Resources
- **Container**: `untrapd-postiz`
- **Database**: `untrapd-postiz-db`
- **Redis**: `untrapd-postiz-redis`
- **Network**: `postiz-network`

### Meta Developer Resources
- **App Dashboard**: https://developers.facebook.com/apps/738653215879612/
- **OAuth Settings**: https://developers.facebook.com/apps/738653215879612/fb-login/settings/

---

## 💡 KNOWN ISSUES & NOTES

### Meta OAuth Redirect URIs
**IMPORTANT**: User mentioned redirect URIs may be malformed. Need to verify:
1. Navigate to Meta OAuth settings
2. Check the format of both Instagram and Facebook redirect URIs
3. User mentioned adding one with correct format - verify which one
4. Ensure format matches: `https://domain.ngrok-free.dev/integrations/social/{platform}`

### Login Flow Complexity
The Postiz login appears to use NextAuth with a complex provider system:
- Email/password requires `provider` field
- GitHub OAuth is available as alternative
- May require initial registration/setup flow
- Check if first-time setup wizard is needed

### Port Mapping
- Frontend (4200) and Backend (3000) both mapped to host
- `NEXT_PUBLIC_BACKEND_URL` set to `http://localhost:3000` for browser access
- `BACKEND_INTERNAL_URL` set to `http://localhost:3000` for server-side calls

---

## 🎯 SUCCESS CRITERIA

### Session Accomplishments (This Session)
1. ✅ Puppeteer MCP installed with dedicated Chrome
2. ✅ Identified root cause (environment variable mismatch)
3. ✅ Fixed Postiz configuration (switched to localhost URLs)
4. ✅ Verified all pages rendering correctly
5. ✅ Login working successfully
6. ✅ Documented complete handoff for ngrok OAuth setup

### OAuth Setup Complete When (Next Session):
1. ✅ ngrok tunnel running with static domain (already configured)
2. ✅ Meta OAuth redirect URIs configured (already done)
3. ✅ Postiz container running with OAuth credentials (ready)
4. ⏳ Restart Postiz with ngrok URLs
5. ⏳ Login via ngrok URL works
6. ⏳ Instagram OAuth connection successful
7. ⏳ Facebook OAuth connection successful
8. ⏳ Test post creation and scheduling works

### Current Status: 3/8 Complete (37.5%) - Ready for ngrok switch

---

## 📞 CONTACT & RESOURCES

- **User**: Working on UNTRAPD Hub automation with FINDERR integration
- **Goal**: Set up social media automation for beta recruitment campaign
- **Timeline**: Launch ready, need OAuth working for 45-post campaign
- **Support**: Can use SuperClaude Army for parallel troubleshooting

---

**Next Session First Actions**:
1. Start ngrok tunnel: `/tmp/ngrok http 4200 --domain=jutta-vibrioid-erinn.ngrok-free.dev`
2. Update Postiz container with ngrok URLs (see Phase 1 commands above)
3. Test login via ngrok URL
4. Connect Instagram channel via OAuth
5. Connect Facebook channel via OAuth
6. Create and schedule test post

**Estimated Time**: 20-30 minutes for complete OAuth setup and testing
