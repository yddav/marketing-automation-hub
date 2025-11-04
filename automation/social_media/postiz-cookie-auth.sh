#!/bin/bash

# Postiz Cookie Authentication Script
# This script bypasses the broken login form by using API authentication
# and injecting the auth cookie into the browser

set -e

echo "=== Postiz API Authentication & Cookie Injection ==="
echo ""

# Configuration
API_URL="http://localhost:3000/auth/login"
FRONTEND_URL="http://localhost:4200"
EMAIL="admin@untrapd.hub"
PASSWORD="UntrapdHub2025Strong"
PROVIDER="LOCAL"

# Step 1: API Login
echo "Step 1: Authenticating via API..."
LOGIN_RESPONSE=$(curl -s -v -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"provider\":\"$PROVIDER\"}" \
  2>&1)

# Extract auth cookie
AUTH_COOKIE=$(echo "$LOGIN_RESPONSE" | grep -oP 'Set-Cookie: auth=\K[^;]+' | head -1)

if [ -z "$AUTH_COOKIE" ]; then
  echo "ERROR: Failed to extract auth cookie from API response"
  echo "API Response:"
  echo "$LOGIN_RESPONSE"
  exit 1
fi

echo "✓ API authentication successful"
echo "✓ Auth token extracted (${#AUTH_COOKIE} characters)"
echo ""

# Step 2: Save cookie for browser injection
COOKIE_FILE="/tmp/postiz_auth_cookie.txt"
echo "$AUTH_COOKIE" > "$COOKIE_FILE"

echo "Step 2: Cookie saved to: $COOKIE_FILE"
echo ""

# Step 3: Instructions for manual browser use
echo "=== SUCCESS: Authentication Complete ==="
echo ""
echo "Your auth cookie has been generated. To use it in a browser:"
echo ""
echo "1. Open Firefox/Chrome Developer Tools (F12)"
echo "2. Go to the Console tab"
echo "3. Navigate to: $FRONTEND_URL"
echo "4. Paste this command in the console:"
echo ""
echo "------- COPY THIS -------"
cat << 'EOF'
// Set Postiz auth cookie
const authToken = "AUTH_TOKEN_PLACEHOLDER";
const expiryDate = new Date();
expiryDate.setFullYear(expiryDate.getFullYear() + 1);
document.cookie = `auth=${authToken}; path=/; expires=${expiryDate.toUTCString()}`;
console.log("Cookie set! Reloading page...");
location.reload();
EOF
echo "------- END COPY -------"
echo ""
echo "5. Replace AUTH_TOKEN_PLACEHOLDER with your actual token:"
echo ""
echo "   Token: $AUTH_COOKIE"
echo ""
echo "6. Press Enter to execute"
echo "7. Page will reload with authentication active"
echo ""

# Step 4: Create a ready-to-use browser script
BROWSER_SCRIPT="/tmp/postiz_browser_auth.js"
cat > "$BROWSER_SCRIPT" << EOF
// Postiz Browser Authentication Script
// Copy and paste this entire script into your browser console

const authToken = "$AUTH_COOKIE";
const expiryDate = new Date();
expiryDate.setFullYear(expiryDate.getFullYear() + 1);

document.cookie = \`auth=\${authToken}; path=/; expires=\${expiryDate.toUTCString()}\`;

console.log("✓ Postiz auth cookie set successfully!");
console.log("✓ Cookie expires:", expiryDate.toLocaleString());
console.log("✓ Reloading page to apply authentication...");

setTimeout(() => {
  location.reload();
}, 1000);
EOF

echo "Ready-to-use browser script saved to: $BROWSER_SCRIPT"
echo ""
echo "To use the browser script:"
echo "1. Navigate to $FRONTEND_URL in your browser"
echo "2. Open Developer Console (F12)"
echo "3. Run: cat $BROWSER_SCRIPT"
echo "4. Copy the output and paste into browser console"
echo ""

# Step 5: Verification
echo "=== Verification ==="
echo "Auth cookie is valid for: 1 year"
echo "Frontend URL: $FRONTEND_URL"
echo "Available routes: /analytics, /launches, /settings"
echo ""
echo "NOTE: The Postiz UI appears to have rendering issues in headless browsers."
echo "For best results, use the cookie in a regular Firefox or Chrome browser."
echo ""

exit 0
