# Postiz Quick Login Guide

**Fast authentication bypass for broken login form**

## Option 1: Automated Script (Recommended)

```bash
cd automation/social_media
./postiz-cookie-auth.sh
```

Follow the on-screen instructions to copy the cookie into your browser.

## Option 2: One-Command Solution

```bash
# Get auth token
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@untrapd.hub","password":"UntrapdHub2025Strong","provider":"LOCAL"}' \
  | grep -oP 'Set-Cookie: auth=\K[^;]+')

# Display browser console command
echo "Paste this in browser console at http://localhost:4200:"
echo ""
echo "document.cookie='auth=$TOKEN;path=/;expires='+(new Date(Date.now()+31536000000)).toUTCString();location.reload()"
```

## Option 3: Pre-Generated Script

```bash
# View ready-to-use browser script
cat /tmp/postiz_browser_auth.js
```

Then:
1. Open http://localhost:4200 in Firefox/Chrome
2. Open Console (F12)
3. Paste the script
4. Press Enter

## Verification

After login, you should be redirected to `/analytics` instead of the login page.

## Credentials

- Email: admin@untrapd.hub
- Password: UntrapdHub2025Strong
- Provider: LOCAL

## Troubleshooting

**Black screen after login?**
- This is normal in headless browsers
- Use a regular Firefox or Chrome browser
- The authentication is working, it's just a UI rendering issue

**Cookie not persisting?**
- Make sure you're on localhost:4200 (not localhost:3000)
- Check that JavaScript is enabled
- Clear all cookies and try again

---

**For full documentation**: See POSTIZ_COOKIE_AUTH_SOLUTION.md
