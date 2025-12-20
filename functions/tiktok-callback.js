/**
 * TikTok OAuth Callback Handler
 *
 * This Netlify function handles TikTok OAuth callbacks and exchanges
 * the authorization code for access tokens.
 *
 * Endpoint: https://hub.untrapd.com/.netlify/functions/tiktok-callback
 *
 * For TikTok Developer Console, use redirect URI:
 * https://hub.untrapd.com/.netlify/functions/tiktok-callback
 */

const https = require('https');

// TikTok API configuration
const TIKTOK_CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY || '';
const TIKTOK_CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET || '';

exports.handler = async (event, context) => {
  const { code, state, error, error_description } = event.queryStringParameters || {};

  // Handle errors from TikTok
  if (error) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html' },
      body: generateErrorPage(error, error_description)
    };
  }

  // Check for authorization code
  if (!code) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html' },
      body: generateErrorPage('missing_code', 'No authorization code received from TikTok')
    };
  }

  // If we have client credentials, exchange code for token
  if (TIKTOK_CLIENT_KEY && TIKTOK_CLIENT_SECRET) {
    try {
      const tokenData = await exchangeCodeForToken(code);
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'text/html' },
        body: generateSuccessPage(tokenData)
      };
    } catch (err) {
      // If token exchange fails, still show the code for manual use
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'text/html' },
        body: generateCodePage(code, state, err.message)
      };
    }
  }

  // No client credentials configured - show code for manual exchange
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/html' },
    body: generateCodePage(code, state)
  };
};

/**
 * Exchange authorization code for access token
 */
async function exchangeCodeForToken(code) {
  return new Promise((resolve, reject) => {
    const postData = new URLSearchParams({
      client_key: TIKTOK_CLIENT_KEY,
      client_secret: TIKTOK_CLIENT_SECRET,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: 'https://hub.untrapd.com/.netlify/functions/tiktok-callback'
    }).toString();

    const options = {
      hostname: 'open.tiktokapis.com',
      port: 443,
      path: '/v2/oauth/token/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.access_token) {
            resolve(parsed);
          } else {
            reject(new Error(parsed.error_description || parsed.error || 'Token exchange failed'));
          }
        } catch (e) {
          reject(new Error('Failed to parse TikTok response'));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

/**
 * Generate success page with token information
 */
function generateSuccessPage(tokenData) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TikTok OAuth Success - FINDERR</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      padding: 20px;
    }
    .card {
      background: rgba(255,255,255,0.1);
      padding: 40px;
      border-radius: 20px;
      text-align: center;
      max-width: 600px;
      width: 100%;
    }
    .icon { font-size: 60px; margin-bottom: 20px; }
    h1 { margin-bottom: 15px; color: #22c55e; }
    .token-box {
      background: rgba(0,0,0,0.3);
      padding: 15px;
      border-radius: 8px;
      margin: 15px 0;
      text-align: left;
      word-break: break-all;
      font-family: monospace;
      font-size: 12px;
    }
    .label { color: #a0aec0; font-size: 12px; margin-bottom: 5px; }
    .value { color: #22c55e; }
    .warning {
      background: rgba(245, 158, 11, 0.2);
      border: 1px solid #f59e0b;
      padding: 15px;
      border-radius: 8px;
      margin-top: 20px;
      font-size: 14px;
    }
    .instructions {
      margin-top: 20px;
      padding: 15px;
      background: rgba(255,255,255,0.05);
      border-radius: 8px;
      text-align: left;
      font-size: 14px;
    }
    .instructions ol { padding-left: 20px; }
    .instructions li { margin: 8px 0; }
    code {
      background: rgba(0,0,0,0.3);
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">✅</div>
    <h1>TikTok Connected!</h1>
    <p>Successfully authorized FINDERR with TikTok</p>

    <div class="token-box">
      <div class="label">Access Token:</div>
      <div class="value">${tokenData.access_token}</div>
    </div>

    ${tokenData.refresh_token ? `
    <div class="token-box">
      <div class="label">Refresh Token:</div>
      <div class="value">${tokenData.refresh_token}</div>
    </div>
    ` : ''}

    ${tokenData.open_id ? `
    <div class="token-box">
      <div class="label">Open ID:</div>
      <div class="value">${tokenData.open_id}</div>
    </div>
    ` : ''}

    <div class="token-box">
      <div class="label">Expires In:</div>
      <div class="value">${tokenData.expires_in || 'N/A'} seconds</div>
    </div>

    <div class="warning">
      ⚠️ <strong>Important:</strong> Copy these tokens and save them to your .env file immediately. This page will not be shown again.
    </div>

    <div class="instructions">
      <strong>Add to your .env file:</strong>
      <ol>
        <li>Open <code>automation/social_media/.env</code></li>
        <li>Add/update these values:
          <br><code>TIKTOK_ACCESS_TOKEN=${tokenData.access_token}</code>
          ${tokenData.refresh_token ? `<br><code>TIKTOK_REFRESH_TOKEN=${tokenData.refresh_token}</code>` : ''}
          ${tokenData.open_id ? `<br><code>TIKTOK_OPEN_ID=${tokenData.open_id}</code>` : ''}
        </li>
        <li>Restart your OAuth server</li>
      </ol>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Generate page showing authorization code for manual exchange
 */
function generateCodePage(code, state, exchangeError = null) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TikTok Authorization Code - FINDERR</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      padding: 20px;
    }
    .card {
      background: rgba(255,255,255,0.1);
      padding: 40px;
      border-radius: 20px;
      text-align: center;
      max-width: 600px;
      width: 100%;
    }
    .icon { font-size: 60px; margin-bottom: 20px; }
    h1 { margin-bottom: 15px; color: #f59e0b; }
    .code-box {
      background: rgba(0,0,0,0.3);
      padding: 15px;
      border-radius: 8px;
      margin: 15px 0;
      word-break: break-all;
      font-family: monospace;
      font-size: 14px;
      color: #22c55e;
      cursor: pointer;
      border: 2px dashed #22c55e;
    }
    .code-box:hover { background: rgba(34, 197, 94, 0.1); }
    .label { color: #a0aec0; font-size: 14px; margin-bottom: 10px; }
    .instructions {
      margin-top: 20px;
      padding: 15px;
      background: rgba(255,255,255,0.05);
      border-radius: 8px;
      text-align: left;
      font-size: 14px;
    }
    .instructions ol { padding-left: 20px; }
    .instructions li { margin: 8px 0; }
    .error {
      background: rgba(239, 68, 68, 0.2);
      border: 1px solid #ef4444;
      padding: 10px;
      border-radius: 8px;
      margin-bottom: 15px;
      font-size: 12px;
    }
    .copy-btn {
      background: #22c55e;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: bold;
      margin-top: 10px;
    }
    .copy-btn:hover { background: #16a34a; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">🔑</div>
    <h1>Authorization Code Received</h1>

    ${exchangeError ? `<div class="error">Token exchange failed: ${exchangeError}<br>Use the code below manually.</div>` : ''}

    <div class="label">Click to copy the authorization code:</div>
    <div class="code-box" onclick="copyCode()" id="code">${code}</div>
    <button class="copy-btn" onclick="copyCode()">📋 Copy Code</button>

    ${state ? `<div style="margin-top:15px;font-size:12px;color:#6b7280;">State: ${state}</div>` : ''}

    <div class="instructions">
      <strong>Next Steps:</strong>
      <ol>
        <li>Copy the authorization code above</li>
        <li>Use it with your local OAuth server to exchange for tokens</li>
        <li>Or manually call the TikTok token endpoint</li>
      </ol>
      <p style="margin-top:15px;color:#a0aec0;font-size:12px;">
        Note: This code expires in a few minutes. Use it quickly!
      </p>
    </div>
  </div>

  <script>
    function copyCode() {
      const code = document.getElementById('code').innerText;
      navigator.clipboard.writeText(code).then(() => {
        alert('Code copied to clipboard!');
      }).catch(() => {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = code;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert('Code copied to clipboard!');
      });
    }
  </script>
</body>
</html>`;
}

/**
 * Generate error page
 */
function generateErrorPage(error, description) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TikTok OAuth Error - FINDERR</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      padding: 20px;
    }
    .card {
      background: rgba(255,255,255,0.1);
      padding: 40px;
      border-radius: 20px;
      text-align: center;
      max-width: 500px;
    }
    .icon { font-size: 60px; margin-bottom: 20px; }
    h1 { margin-bottom: 15px; color: #ef4444; }
    .error {
      background: rgba(239,68,68,0.2);
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
      font-family: monospace;
      font-size: 12px;
      text-align: left;
    }
    a {
      display: inline-block;
      padding: 12px 30px;
      background: linear-gradient(90deg, #667eea, #764ba2);
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">❌</div>
    <h1>TikTok OAuth Error</h1>
    <div class="error">
      <strong>Error:</strong> ${error}<br>
      ${description ? `<strong>Description:</strong> ${description}` : ''}
    </div>
    <a href="https://hub.untrapd.com">Back to Hub</a>
  </div>
</body>
</html>`;
}
