# How to Get User Access Token from Meta Graph API Explorer

## Steps:

1. **Go to Meta Graph API Explorer**:
   https://developers.facebook.com/tools/explorer/

2. **Select Your App**:
   - Click dropdown at top that says "Graph API Explorer"
   - Select your app (the one with your Facebook Page)

3. **Select Permissions**:
   Click "Generate Access Token" button, then add these permissions:
   - ✅ `pages_show_list` (REQUIRED to list pages)
   - ✅ `pages_read_engagement` (already selected)
   - ✅ `pages_manage_posts` (already selected)
   - ✅ `instagram_basic` (already selected)
   - ✅ `instagram_content_publish` (already selected)

4. **Generate Token**:
   - Click "Generate Access Token"
   - Authorize the permissions
   - Copy the entire token from the "Access Token" field

5. **Verify Token Type**:
   - Below the Access Token field, you should see "User Token"
   - Token should start with: EAAKfz...

## What to Copy:

Copy the ENTIRE token from the "Access Token" field in Graph API Explorer (not from Facebook settings page).

The token should be very long (200+ characters).

## Important:

The token you provided last time was from Facebook settings, not Graph API Explorer. That's why it returns 0 pages - it's a different type of token.

