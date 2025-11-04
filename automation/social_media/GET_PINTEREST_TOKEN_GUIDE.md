# How to Get Pinterest Access Token

## Your App Status
✅ **UNTRAPD Hub Social Automation** - APPROVED (October 24, 2025)
✅ App ID: 1534758
✅ Account: untrapd.hub

## Steps to Generate New Access Token

### Option 1: Pinterest Developers Console (Easiest)

1. **Go to Pinterest Developers**:
   https://developers.pinterest.com/apps/

2. **Select Your App**:
   - Click on "UNTRAPD Hub Social Automation" (App ID: 1534758)

3. **Generate Access Token**:
   - Look for "Generate access token" or "OAuth" section
   - Select the required scopes (already approved):
     - ads:read
     - catalogs:read
     - pins:read
     - boards:read
     - user_accounts:read
   - Click "Generate Token"

4. **Copy Token**:
   - Copy the entire access token
   - Token format: `pina_XXXXXXXXXXXXXXX...`

### Option 2: OAuth 2.0 Flow (More Complex)

If the console doesn't provide direct token generation, you'll need to:

1. Set up OAuth redirect URL in app settings
2. Initiate OAuth flow
3. Authorize the app
4. Exchange code for access token

**Note**: Since your app is already approved with all permissions, Option 1 should work.

## Token Format

Pinterest tokens start with: `pina_`

Example: `pina_AMASM2YXACMZMBAAGBABQDEW6IIBJGQBQBIQCKBBOMGMP4DJDLI4CR...`

## After Getting Token

Update `.env` file:
```bash
PINTEREST_ACCESS_TOKEN=pina_YOUR_NEW_TOKEN_HERE
```

Then run:
```bash
python3 test-pinterest-post.py
```

## Helpful Links

- Pinterest Developers Dashboard: https://developers.pinterest.com/apps/
- Pinterest API Documentation: https://developers.pinterest.com/docs/api/v5/
- OAuth Guide: https://developers.pinterest.com/docs/getting-started/authentication/

