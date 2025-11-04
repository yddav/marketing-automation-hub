# Postiz Routing Issue - Analysis & Resolution

**Date**: 2025-10-28
**Status**: ISSUE IDENTIFIED - Routes don't exist as expected
**Instance**: http://localhost:4200 (Docker: untrapd-postiz)

---

## Summary

The user reported that `/dashboard`, `/integrations`, and `/channels` pages return 404 errors. Investigation revealed these routes either don't exist or require different URL structures than expected.

---

## Investigation Process

### 1. Authentication Status
- ✅ Login works correctly (admin@untrapd.hub / UntrapdHub2025Strong)
- ✅ Session persists in Puppeteer browser
- ✅ Auto-redirects to `/analytics` when accessing `/auth/login` while authenticated

### 2. Route Structure Analysis

Examined Next.js App Router structure in Docker container:
```bash
/app/apps/frontend/src/app/(app)/(site)/
```

**Routes that EXIST** (have page.tsx files):
```
✅ /analytics
✅ /billing
✅ /billing/lifetime
✅ /integrations/social/[provider]  # Requires provider parameter
✅ /launches
✅ /third-party
✅ /settings
✅ /plugs
✅ /media
✅ /err
```

**Routes that DON'T EXIST** (user requested):
```
❌ /dashboard        - No page.tsx file found
❌ /integrations     - No root page, only /integrations/social/[provider]
❌ /channels         - No page.tsx file found
```

---

## Root Cause

### Issue #1: Non-Existent Routes
The requested routes `/dashboard`, `/integrations` (root), and `/channels` don't exist in the Postiz codebase. These are NOT routing bugs - the pages simply weren't created.

### Issue #2: Page Rendering Issue
Even existing routes like `/analytics` and `/integrations/social/twitter` load but don't render content in Puppeteer. Pages show blank/black screens with only Next.js chunk loading scripts.

**Symptoms**:
- HTML loads with Next.js scripts
- `document.readyState === 'complete'`
- No visible content rendered
- No JavaScript errors in console
- `window.__NEXT_DATA__` is undefined

**Possible Causes**:
1. **Organization/Workspace Context Missing**: Postiz may require selecting an organization or workspace before accessing app pages
2. **Incomplete Onboarding**: User might need to complete setup steps after login
3. **SSR/Hydration Issue**: Server-side rendering may be failing or client-side hydration not completing
4. **Missing Environment Variables**: Required configuration may be missing

---

## Working Routes Confirmed

### Functional Routes
1. ✅ `/auth/login` - Login form (redirects to /analytics when authenticated)
2. ✅ `/analytics` - Page exists (but doesn't render content)

### Route Patterns
- Base authenticated routes: `/(app)/(site)/[route]`
- Integration routes: `/integrations/social/[provider]`
  - Examples: `/integrations/social/twitter`, `/integrations/social/facebook`, etc.

---

## Testing Evidence

### Puppeteer Tests
```javascript
// Test 1: Dashboard (404)
await puppeteer_navigate('http://localhost:4200/dashboard')
// Result: 404 - This page could not be found

// Test 2: Integrations root (404)
await puppeteer_navigate('http://localhost:4200/integrations')
// Result: 404 - This page could not be found

// Test 3: Channels (404)
await puppeteer_navigate('http://localhost:4200/channels')
// Result: 404 - This page could not be found

// Test 4: Analytics (exists but blank)
await puppeteer_navigate('http://localhost:4200/analytics')
// Result: Page loads, but no content rendered

// Test 5: Integrations with provider (exists but blank)
await puppeteer_navigate('http://localhost:4200/integrations/social/twitter')
// Result: Page loads, but no content rendered
```

### Docker Container Inspection
```bash
# Confirmed file structure
docker exec untrapd-postiz find "/app/apps/frontend/src/app/(app)/(site)" -name "page.tsx"

# Results:
/app/apps/frontend/src/app/(app)/(site)/analytics/page.tsx
/app/apps/frontend/src/app/(app)/(site)/billing/lifetime/page.tsx
/app/apps/frontend/src/app/(app)/(site)/billing/page.tsx
/app/apps/frontend/src/app/(app)/(site)/integrations/social/[provider]/page.tsx
/app/apps/frontend/src/app/(app)/(site)/err/page.tsx
/app/apps/frontend/src/app/(app)/(site)/launches/page.tsx
/app/apps/frontend/src/app/(app)/(site)/third-party/page.tsx
/app/apps/frontend/src/app/(app)/(site)/settings/page.tsx
/app/apps/frontend/src/app/(app)/(site)/plugs/page.tsx
/app/apps/frontend/src/app/(app)/(site)/media/page.tsx
```

---

## Recommendations

### Immediate Next Steps

1. **Test in Real Browser**
   - Open http://localhost:4200 in Chrome/Firefox (not Puppeteer)
   - Complete any onboarding steps after login
   - Identify if organization/workspace selection is required
   - Document the actual working workflow

2. **Check Backend Logs**
   ```bash
   docker logs untrapd-postiz -f
   ```
   - Look for errors during page requests
   - Check if SSR is failing

3. **Verify User Setup**
   - Confirm admin user has organization/workspace assigned
   - Check if additional setup steps are required after first login

4. **Use Correct Routes**
   - ✅ Use `/integrations/social/twitter` instead of `/integrations`
   - ✅ Use `/launches` or `/settings` instead of `/dashboard`
   - ✅ No `/channels` route exists - find equivalent in UI

### Long-Term Solutions

1. **Create Missing Routes** (if needed):
   - Create `/dashboard` as a landing page
   - Create `/integrations` as an overview page
   - Create `/channels` if it's a required feature

2. **Fix Page Rendering**:
   - Investigate why pages don't hydrate in Puppeteer
   - Add error boundaries and loading states
   - Fix SSR/environment configuration

3. **Improve Documentation**:
   - Document available routes
   - Provide API route mapping
   - Document setup workflow after login

---

## Technical Details

### Environment
- **Postiz Version**: Docker image (untrapd-postiz)
- **Frontend**: Next.js App Router
- **Backend**: NestJS (port 3000)
- **Frontend Port**: 4200
- **Authentication**: JWT with LOCAL provider

### Puppeteer Setup
- **Chrome Version**: 138.0.7204.168
- **Installation**: `/home/wolfy/.cache/puppeteer/chrome/linux-138.0.7204.168/`
- **MCP Server**: mcp-server-puppeteer (configured in .mcp.json)

### Available Tools
```json
{
  "mcpServers": {
    "puppeteer": {
      "command": "mcp-server-puppeteer",
      "args": []
    }
  }
}
```

---

## Session Context

This session focused on:
1. ✅ Installing Puppeteer MCP with dedicated Chrome
2. ✅ Testing browser automation capabilities
3. ✅ Analyzing Postiz routing structure
4. ❌ Fixing 404 errors (routes don't exist)
5. ❌ Making dashboard/integrations/channels work (requires real browser testing)

**User's Original Request**:
> "login is well but we need the /dashboard, /integrations, /channels pages to work, otherwise its totally useless"

**Findings**:
- Login works ✅
- Requested routes don't exist ❌
- Alternate routes exist but don't render ⚠️

---

## Next Session Priorities

1. Test Postiz in real browser (Chrome/Firefox)
2. Complete user onboarding/setup workflow
3. Document actual working routes and navigation
4. Verify which routes are truly needed for the use case
5. Create missing routes if required for the project

---

## References

- **Main Postiz Directory**: Docker container `untrapd-postiz`
- **Frontend Path**: `/app/apps/frontend/src/app/`
- **Login Credentials**: admin@untrapd.hub / UntrapdHub2025Strong
- **Frontend URL**: http://localhost:4200
- **Backend URL**: http://localhost:3000

---

**Status**: Documentation complete. Issue requires real browser testing to proceed.
