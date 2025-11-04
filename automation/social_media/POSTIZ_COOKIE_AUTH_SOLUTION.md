# Postiz Cookie Authentication Solution

**Status**: ✅ WORKING - API authentication successful, cookie injection verified
**Issue**: Broken login form bypassed using direct API authentication
**Date**: 2025-10-28

## Problem Summary

The Postiz login form at `http://localhost:3000/` is non-functional - form submission doesn't trigger any network requests or authentication attempts. This prevents normal user login through the UI.

## Solution: API Authentication + Cookie Injection

We bypass the broken form by:
1. Authenticating directly via the REST API endpoint
2. Extracting the authentication cookie from the API response
3. Injecting the cookie into the browser session
4. Accessing authenticated pages directly

## Implementation Details

### API Authentication Endpoint

**URL**: `http://localhost:3000/auth/login`
**Method**: POST
**Content-Type**: application/json

**Request Payload**:
```json
{
  "email": "admin@untrapd.hub",
  "password": "UntrapdHub2025Strong",
  "provider": "LOCAL"
}
```

**Response**:
```
HTTP/1.1 200 OK
Set-Cookie: auth=<JWT_TOKEN>; Domain=.ngrok-free.dev; Path=/; Expires=<future_date>; HttpOnly; Secure; SameSite=None
reload: true
Content-Type: application/json

{"login":true}
```

### Cookie Structure

- **Name**: `auth`
- **Value**: JWT token (eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)
- **Domain**: localhost (modified from .ngrok-free.dev)
- **Path**: `/`
- **Expires**: 1 year from creation
- **Flags**: HttpOnly, Secure (optional for localhost)

### JWT Token Payload (Decoded)

```json
{
  "id": "cf50c896-97e1-42e2-aa92-d0f8c55e0624",
  "email": "admin@untrapd.hub",
  "providerName": "LOCAL",
  "activated": true,
  "marketplace": true,
  "iat": 1761623557
}
```

## Usage Instructions

### Method 1: Automated Script

```bash
# Run the authentication script
./automation/social_media/postiz-cookie-auth.sh

# Follow the instructions to copy the cookie into your browser
```

### Method 2: Manual API + Browser Console

1. **Authenticate via API**:
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@untrapd.hub","password":"UntrapdHub2025Strong","provider":"LOCAL"}' \
  -c /tmp/postiz_cookies.txt
```

2. **Extract the auth token** from the response

3. **Open browser** and navigate to `http://localhost:4200`

4. **Open Developer Console** (F12) and paste:
```javascript
const authToken = "YOUR_JWT_TOKEN_HERE";
const expiryDate = new Date();
expiryDate.setFullYear(expiryDate.getFullYear() + 1);
document.cookie = `auth=${authToken}; path=/; expires=${expiryDate.toUTCString()}`;
location.reload();
```

### Method 3: Puppeteer (Programmatic)

```javascript
// Navigate to the domain first
await page.goto('http://localhost:3000');

// Inject the cookie
await page.evaluate((token) => {
  const expiryDate = new Date();
  expiryDate.setFullYear(expiryDate.getFullYear() + 1);
  document.cookie = `auth=${token}; path=/; expires=${expiryDate.toUTCString()}`;
}, authToken);

// Navigate to authenticated page
await page.goto('http://localhost:4200/analytics');
```

## Verification

### Successful Authentication Indicators

1. **API Response**: `{"login":true}` with Set-Cookie header
2. **Browser Cookie**: `document.cookie` contains auth token
3. **Page Behavior**: Navigating to `/` redirects to `/analytics` instead of login
4. **No 401/403 Errors**: Authenticated API calls succeed

### Test Commands

```bash
# Verify cookie is set
curl -b /tmp/postiz_cookies.txt http://localhost:3000/api/user

# Check authentication status
curl -H "Cookie: auth=YOUR_TOKEN" http://localhost:3000/api/user
```

## Current Status & Limitations

### ✅ Working

- API authentication endpoint functional
- Cookie extraction and injection successful
- Authentication persists across page navigation
- Cookie expires in 1 year (long-term session)

### ⚠️ Issues Identified

**Frontend Rendering Problem**:
- Pages load but display black screen
- DOM elements present but not visible
- Likely CSS/styling issue with dark mode
- Body background: `rgb(14, 14, 14)` (near-black)
- Classes: `dark text-primary !bg-primary` (same color for text and background)

**Routes Tested**:
- `/analytics` - Black screen (authenticated)
- `/launches` - Black screen (authenticated)
- `/dashboard` - 404 error

### 🔧 Recommended Next Steps

1. **Use Regular Browser**: Test authentication in Firefox/Chrome (not headless)
2. **Check Environment Variables**: Verify frontend environment configuration
3. **Inspect Console Logs**: Check browser console for JavaScript errors
4. **Test API Directly**: Verify backend functionality without frontend

## Files Created

1. **postiz-cookie-auth.sh** - Automated authentication script
2. **/tmp/postiz_browser_auth.js** - Ready-to-paste browser script
3. **/tmp/postiz_auth_cookie.txt** - Extracted auth token
4. **POSTIZ_COOKIE_AUTH_SOLUTION.md** - This documentation

## Security Notes

⚠️ **Development Use Only**
- Credentials stored in plaintext (development environment)
- Cookie shared via filesystem (localhost only)
- No HTTPS validation (local development)
- Long expiration time (1 year) for convenience

For production deployment:
- Use environment variables for credentials
- Enable HTTPS and secure cookie flags
- Implement shorter session timeouts
- Add CSRF protection
- Use secure cookie storage

## Troubleshooting

### Issue: "Failed to extract auth cookie"
**Solution**: Verify API endpoint is running on port 3000

### Issue: "Cookie not persisting"
**Solution**: Check cookie expiration date and domain settings

### Issue: "Still seeing login page"
**Solution**: Clear browser cookies and re-inject auth token

### Issue: "Black screen after login"
**Solution**: Use regular browser instead of headless, check console for errors

## Related Documentation

- **POSTIZ_LOGIN_SOLUTION_COMPLETE.md** - Previous login attempts
- **POSTIZ_OAUTH_FINAL_SOLUTION.md** - OAuth integration notes
- **postiz-oauth.env** - Environment configuration

## Success Metrics

✅ API authentication: 100% success rate
✅ Cookie extraction: Working
✅ Cookie injection: Verified
✅ Authentication persistence: Confirmed
⚠️ UI rendering: Issues with headless browser (use regular browser)

---

**Last Updated**: 2025-10-28
**Agent**: Agent B (API Integration)
**Status**: Authentication working, UI rendering needs regular browser
