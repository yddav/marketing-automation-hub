#!/usr/bin/env python3
"""
UNTRAPD Social Media OAuth Server
=================================
Unified OAuth token management for all social platforms.
Access from phone via ngrok or local network.

Usage:
    python3 oauth-server.py              # Start server on port 5000
    python3 oauth-server.py --port 8080  # Custom port
    python3 oauth-server.py --ngrok      # Start with ngrok tunnel (phone access)

Endpoints:
    /                    - Dashboard with all platform status
    /meta/auth           - Start Meta (Facebook/Instagram) OAuth
    /meta/callback       - Meta OAuth callback
    /pinterest/auth      - Start Pinterest OAuth
    /pinterest/callback  - Pinterest OAuth callback
    /tiktok/auth         - Start TikTok OAuth
    /tiktok/callback     - TikTok OAuth callback
    /status              - JSON status of all tokens
    /refresh-all         - Attempt to refresh all tokens
"""

import os
import sys
import json
import time
import secrets
import webbrowser
import subprocess
from datetime import datetime, timedelta
from pathlib import Path
from urllib.parse import urlencode, parse_qs, urlparse
from http.server import HTTPServer, BaseHTTPRequestHandler
import requests
from dotenv import load_dotenv, set_key

# Load environment
ENV_PATH = Path(__file__).parent / '.env'
load_dotenv(ENV_PATH)

# Server configuration
PORT = 5000
HOST = '0.0.0.0'

# OAuth State storage (in-memory for session)
oauth_states = {}

# =============================================================================
# META (FACEBOOK/INSTAGRAM) CONFIGURATION
# =============================================================================
META_APP_ID = os.getenv('META_APP_ID', '')  # Need to add this
META_APP_SECRET = os.getenv('META_APP_SECRET', '')  # Need to add this
META_REDIRECT_URI = f'http://localhost:{PORT}/meta/callback'
META_SCOPES = [
    'pages_manage_posts',
    'pages_read_engagement',
    'pages_show_list',
    'instagram_basic',
    'instagram_content_publish',
    'business_management'
]

# =============================================================================
# PINTEREST CONFIGURATION
# =============================================================================
PINTEREST_APP_ID = os.getenv('PINTEREST_APP_ID', '1534758')
PINTEREST_APP_SECRET = os.getenv('PINTEREST_APP_SECRET', '')
PINTEREST_REDIRECT_URI = f'http://localhost:{PORT}/pinterest/callback'
PINTEREST_SCOPES = ['boards:read', 'boards:write', 'pins:read', 'pins:write']

# =============================================================================
# TIKTOK CONFIGURATION
# =============================================================================
TIKTOK_CLIENT_KEY = os.getenv('TIKTOK_CLIENT_KEY', 'awzpr6gs8tayotje')
TIKTOK_CLIENT_SECRET = os.getenv('TIKTOK_CLIENT_SECRET', '')
TIKTOK_REDIRECT_URI = f'http://localhost:{PORT}/tiktok/callback'
TIKTOK_SCOPES = ['user.info.basic', 'video.upload', 'video.publish']

# =============================================================================
# TOKEN STATUS CHECKER
# =============================================================================
def check_token_status():
    """Check validity of all tokens"""
    status = {
        'twitter': {'status': 'unknown', 'message': ''},
        'facebook': {'status': 'unknown', 'message': ''},
        'instagram': {'status': 'unknown', 'message': ''},
        'pinterest': {'status': 'unknown', 'message': ''},
        'tiktok': {'status': 'unknown', 'message': ''},
        'last_check': datetime.now().isoformat()
    }

    # Check Twitter
    twitter_token = os.getenv('TWITTER_ACCESS_TOKEN', '')
    if twitter_token:
        try:
            # Twitter uses OAuth 1.0a, tokens don't expire
            status['twitter'] = {'status': 'valid', 'message': 'OAuth 1.0a tokens (no expiry)'}
        except:
            status['twitter'] = {'status': 'error', 'message': 'Could not verify'}
    else:
        status['twitter'] = {'status': 'missing', 'message': 'No token configured'}

    # Check Facebook
    fb_token = os.getenv('FACEBOOK_PAGE_TOKEN', '')
    if fb_token:
        try:
            r = requests.get(f'https://graph.facebook.com/v21.0/me?access_token={fb_token}')
            if r.status_code == 200:
                data = r.json()
                status['facebook'] = {'status': 'valid', 'message': f"Connected as {data.get('name', 'Unknown')}"}
            else:
                error = r.json().get('error', {}).get('message', 'Unknown error')
                status['facebook'] = {'status': 'expired', 'message': error}
        except Exception as e:
            status['facebook'] = {'status': 'error', 'message': str(e)}
    else:
        status['facebook'] = {'status': 'missing', 'message': 'No token configured'}

    # Check Instagram (same token as Facebook)
    ig_token = os.getenv('INSTAGRAM_ACCESS_TOKEN', '')
    ig_account_id = os.getenv('INSTAGRAM_BUSINESS_ACCOUNT_ID', '')
    if ig_token and ig_account_id:
        try:
            r = requests.get(f'https://graph.facebook.com/v21.0/{ig_account_id}?fields=username&access_token={ig_token}')
            if r.status_code == 200:
                data = r.json()
                status['instagram'] = {'status': 'valid', 'message': f"@{data.get('username', 'Unknown')}"}
            else:
                error = r.json().get('error', {}).get('message', 'Unknown error')
                status['instagram'] = {'status': 'expired', 'message': error}
        except Exception as e:
            status['instagram'] = {'status': 'error', 'message': str(e)}
    else:
        status['instagram'] = {'status': 'missing', 'message': 'No token configured'}

    # Check Pinterest
    pinterest_token = os.getenv('PINTEREST_ACCESS_TOKEN', '')
    if pinterest_token:
        try:
            r = requests.get('https://api.pinterest.com/v5/user_account',
                           headers={'Authorization': f'Bearer {pinterest_token}'})
            if r.status_code == 200:
                data = r.json()
                status['pinterest'] = {'status': 'valid', 'message': f"@{data.get('username', 'Unknown')}"}
            else:
                status['pinterest'] = {'status': 'expired', 'message': 'Token expired or invalid'}
        except Exception as e:
            status['pinterest'] = {'status': 'error', 'message': str(e)}
    else:
        status['pinterest'] = {'status': 'missing', 'message': 'No token configured'}

    # Check TikTok
    tiktok_token = os.getenv('TIKTOK_ACCESS_TOKEN', '')
    if tiktok_token:
        try:
            r = requests.get('https://open.tiktokapis.com/v2/user/info/',
                           headers={'Authorization': f'Bearer {tiktok_token}'},
                           params={'fields': 'display_name,username'})
            if r.status_code == 200:
                data = r.json().get('data', {}).get('user', {})
                status['tiktok'] = {'status': 'valid', 'message': f"@{data.get('username', 'Unknown')}"}
            else:
                status['tiktok'] = {'status': 'expired', 'message': 'Token expired or invalid'}
        except Exception as e:
            status['tiktok'] = {'status': 'error', 'message': str(e)}
    else:
        status['tiktok'] = {'status': 'missing', 'message': 'No access token'}

    return status

# =============================================================================
# HTML TEMPLATES
# =============================================================================
def get_dashboard_html():
    status = check_token_status()

    def status_badge(s):
        colors = {
            'valid': '#22c55e',
            'expired': '#ef4444',
            'missing': '#f59e0b',
            'error': '#ef4444',
            'unknown': '#6b7280'
        }
        return f'<span style="background:{colors.get(s, "#6b7280")};color:white;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:bold;">{s.upper()}</span>'

    html = f'''<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>UNTRAPD Social OAuth Dashboard</title>
    <style>
        * {{ box-sizing: border-box; margin: 0; padding: 0; }}
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            min-height: 100vh;
            color: #fff;
            padding: 20px;
        }}
        .container {{ max-width: 600px; margin: 0 auto; }}
        h1 {{
            text-align: center;
            margin-bottom: 30px;
            font-size: 24px;
            background: linear-gradient(90deg, #667eea, #764ba2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }}
        .platform {{
            background: rgba(255,255,255,0.1);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 10px;
        }}
        .platform-name {{ font-weight: bold; font-size: 18px; }}
        .platform-msg {{ color: #a0aec0; font-size: 14px; margin-top: 5px; }}
        .btn {{
            display: inline-block;
            padding: 10px 20px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: bold;
            font-size: 14px;
            transition: transform 0.2s, opacity 0.2s;
        }}
        .btn:hover {{ transform: scale(1.05); opacity: 0.9; }}
        .btn-auth {{ background: linear-gradient(90deg, #667eea, #764ba2); color: white; }}
        .btn-valid {{ background: #22c55e; color: white; pointer-events: none; }}
        .refresh-all {{
            display: block;
            text-align: center;
            padding: 15px 30px;
            background: linear-gradient(90deg, #f59e0b, #ef4444);
            color: white;
            border-radius: 12px;
            text-decoration: none;
            font-weight: bold;
            margin-top: 20px;
        }}
        .info {{
            text-align: center;
            margin-top: 30px;
            padding: 20px;
            background: rgba(255,255,255,0.05);
            border-radius: 12px;
            font-size: 14px;
            color: #a0aec0;
        }}
        .last-check {{
            text-align: center;
            margin-top: 15px;
            font-size: 12px;
            color: #6b7280;
        }}
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 UNTRAPD Social OAuth</h1>

        <div class="platform">
            <div>
                <div class="platform-name">🐦 Twitter</div>
                <div class="platform-msg">{status['twitter']['message']}</div>
            </div>
            {status_badge(status['twitter']['status'])}
        </div>

        <div class="platform">
            <div>
                <div class="platform-name">📘 Facebook</div>
                <div class="platform-msg">{status['facebook']['message']}</div>
            </div>
            <div style="display:flex;gap:10px;align-items:center;">
                {status_badge(status['facebook']['status'])}
                {'<a href="/meta/auth" class="btn btn-auth">Authorize</a>' if status['facebook']['status'] != 'valid' else ''}
            </div>
        </div>

        <div class="platform">
            <div>
                <div class="platform-name">📸 Instagram</div>
                <div class="platform-msg">{status['instagram']['message']}</div>
            </div>
            <div style="display:flex;gap:10px;align-items:center;">
                {status_badge(status['instagram']['status'])}
                {'<a href="/meta/auth" class="btn btn-auth">Authorize</a>' if status['instagram']['status'] != 'valid' else ''}
            </div>
        </div>

        <div class="platform">
            <div>
                <div class="platform-name">📌 Pinterest</div>
                <div class="platform-msg">{status['pinterest']['message']}</div>
            </div>
            <div style="display:flex;gap:10px;align-items:center;">
                {status_badge(status['pinterest']['status'])}
                {'<a href="/pinterest/auth" class="btn btn-auth">Authorize</a>' if status['pinterest']['status'] != 'valid' else ''}
            </div>
        </div>

        <div class="platform">
            <div>
                <div class="platform-name">🎵 TikTok</div>
                <div class="platform-msg">{status['tiktok']['message']}</div>
            </div>
            <div style="display:flex;gap:10px;align-items:center;">
                {status_badge(status['tiktok']['status'])}
                {'<a href="/tiktok/auth" class="btn btn-auth">Authorize</a>' if status['tiktok']['status'] != 'valid' else ''}
            </div>
        </div>

        <a href="/test-all" class="refresh-all">🧪 Test All Platforms</a>

        <div class="info">
            <strong>📱 Phone Access:</strong><br>
            Run with <code>--ngrok</code> flag or access via local IP<br>
            <code>python3 oauth-server.py --ngrok</code>
        </div>

        <div class="last-check">Last checked: {status['last_check']}</div>
    </div>

    <script>
        // Auto-refresh every 30 seconds
        setTimeout(() => location.reload(), 30000);
    </script>
</body>
</html>'''
    return html

def get_success_html(platform, message):
    return f'''<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Success - {platform}</title>
    <style>
        body {{
            font-family: -apple-system, sans-serif;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
        }}
        .card {{
            background: rgba(255,255,255,0.1);
            padding: 40px;
            border-radius: 20px;
            text-align: center;
            max-width: 400px;
        }}
        .icon {{ font-size: 60px; margin-bottom: 20px; }}
        h1 {{ margin-bottom: 15px; color: #22c55e; }}
        p {{ color: #a0aec0; margin-bottom: 20px; }}
        a {{
            display: inline-block;
            padding: 12px 30px;
            background: linear-gradient(90deg, #667eea, #764ba2);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
        }}
    </style>
</head>
<body>
    <div class="card">
        <div class="icon">✅</div>
        <h1>{platform} Connected!</h1>
        <p>{message}</p>
        <a href="/">Back to Dashboard</a>
    </div>
</body>
</html>'''

def get_error_html(platform, error):
    return f'''<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Error - {platform}</title>
    <style>
        body {{
            font-family: -apple-system, sans-serif;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
        }}
        .card {{
            background: rgba(255,255,255,0.1);
            padding: 40px;
            border-radius: 20px;
            text-align: center;
            max-width: 500px;
        }}
        .icon {{ font-size: 60px; margin-bottom: 20px; }}
        h1 {{ margin-bottom: 15px; color: #ef4444; }}
        .error {{
            background: rgba(239,68,68,0.2);
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-family: monospace;
            font-size: 12px;
            text-align: left;
            word-break: break-all;
        }}
        a {{
            display: inline-block;
            padding: 12px 30px;
            background: linear-gradient(90deg, #667eea, #764ba2);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
        }}
    </style>
</head>
<body>
    <div class="card">
        <div class="icon">❌</div>
        <h1>{platform} Error</h1>
        <div class="error">{error}</div>
        <a href="/">Back to Dashboard</a>
    </div>
</body>
</html>'''

# =============================================================================
# REQUEST HANDLER
# =============================================================================
class OAuthHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {args[0]}")

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        query = parse_qs(parsed.query)

        # Dashboard
        if path == '/':
            self.send_response(200)
            self.send_header('Content-Type', 'text/html')
            self.end_headers()
            self.wfile.write(get_dashboard_html().encode())

        # Status JSON
        elif path == '/status':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(check_token_status(), indent=2).encode())

        # =================================================================
        # META (FACEBOOK/INSTAGRAM) OAUTH
        # =================================================================
        elif path == '/meta/auth':
            if not META_APP_ID or not META_APP_SECRET:
                self.send_response(200)
                self.send_header('Content-Type', 'text/html')
                self.end_headers()
                self.wfile.write(get_error_html('Meta',
                    'META_APP_ID and META_APP_SECRET not configured in .env<br><br>'
                    'Add these from your Meta Developer App:<br>'
                    'https://developers.facebook.com/apps/').encode())
                return

            state = secrets.token_urlsafe(32)
            oauth_states[state] = {'platform': 'meta', 'timestamp': time.time()}

            auth_url = 'https://www.facebook.com/v21.0/dialog/oauth?' + urlencode({
                'client_id': META_APP_ID,
                'redirect_uri': META_REDIRECT_URI,
                'state': state,
                'scope': ','.join(META_SCOPES),
                'response_type': 'code'
            })

            self.send_response(302)
            self.send_header('Location', auth_url)
            self.end_headers()

        elif path == '/meta/callback':
            code = query.get('code', [None])[0]
            state = query.get('state', [None])[0]
            error = query.get('error', [None])[0]

            if error:
                self.send_response(200)
                self.send_header('Content-Type', 'text/html')
                self.end_headers()
                self.wfile.write(get_error_html('Meta', error).encode())
                return

            if not code or state not in oauth_states:
                self.send_response(200)
                self.send_header('Content-Type', 'text/html')
                self.end_headers()
                self.wfile.write(get_error_html('Meta', 'Invalid state or missing code').encode())
                return

            del oauth_states[state]

            # Exchange code for token
            try:
                r = requests.get('https://graph.facebook.com/v21.0/oauth/access_token', params={
                    'client_id': META_APP_ID,
                    'redirect_uri': META_REDIRECT_URI,
                    'client_secret': META_APP_SECRET,
                    'code': code
                })
                data = r.json()

                if 'access_token' not in data:
                    raise Exception(data.get('error', {}).get('message', 'Unknown error'))

                user_token = data['access_token']

                # Get long-lived token
                r = requests.get('https://graph.facebook.com/v21.0/oauth/access_token', params={
                    'grant_type': 'fb_exchange_token',
                    'client_id': META_APP_ID,
                    'client_secret': META_APP_SECRET,
                    'fb_exchange_token': user_token
                })
                long_lived = r.json()

                if 'access_token' in long_lived:
                    user_token = long_lived['access_token']

                # Get page access token
                page_id = os.getenv('FACEBOOK_PAGE_ID', '')
                if page_id:
                    r = requests.get(f'https://graph.facebook.com/v21.0/{page_id}', params={
                        'fields': 'access_token',
                        'access_token': user_token
                    })
                    page_data = r.json()

                    if 'access_token' in page_data:
                        page_token = page_data['access_token']

                        # Save to .env
                        set_key(str(ENV_PATH), 'FACEBOOK_PAGE_TOKEN', page_token)
                        set_key(str(ENV_PATH), 'INSTAGRAM_ACCESS_TOKEN', page_token)

                        # Reload env
                        load_dotenv(ENV_PATH, override=True)

                        self.send_response(200)
                        self.send_header('Content-Type', 'text/html')
                        self.end_headers()
                        self.wfile.write(get_success_html('Meta (Facebook + Instagram)',
                            'Tokens saved to .env file!<br>Valid for ~60 days.').encode())
                        return

                raise Exception('Could not get page access token')

            except Exception as e:
                self.send_response(200)
                self.send_header('Content-Type', 'text/html')
                self.end_headers()
                self.wfile.write(get_error_html('Meta', str(e)).encode())

        # =================================================================
        # PINTEREST OAUTH
        # =================================================================
        elif path == '/pinterest/auth':
            if not PINTEREST_APP_SECRET:
                self.send_response(200)
                self.send_header('Content-Type', 'text/html')
                self.end_headers()
                self.wfile.write(get_error_html('Pinterest',
                    'PINTEREST_APP_SECRET not configured in .env<br><br>'
                    'Get it from your Pinterest Developer App:<br>'
                    'https://developers.pinterest.com/apps/').encode())
                return

            state = secrets.token_urlsafe(32)
            oauth_states[state] = {'platform': 'pinterest', 'timestamp': time.time()}

            auth_url = 'https://www.pinterest.com/oauth/?' + urlencode({
                'client_id': PINTEREST_APP_ID,
                'redirect_uri': PINTEREST_REDIRECT_URI,
                'response_type': 'code',
                'scope': ','.join(PINTEREST_SCOPES),
                'state': state
            })

            self.send_response(302)
            self.send_header('Location', auth_url)
            self.end_headers()

        elif path == '/pinterest/callback':
            code = query.get('code', [None])[0]
            state = query.get('state', [None])[0]

            if not code or state not in oauth_states:
                self.send_response(200)
                self.send_header('Content-Type', 'text/html')
                self.end_headers()
                self.wfile.write(get_error_html('Pinterest', 'Invalid state or missing code').encode())
                return

            del oauth_states[state]

            try:
                import base64
                auth_header = base64.b64encode(f'{PINTEREST_APP_ID}:{PINTEREST_APP_SECRET}'.encode()).decode()

                r = requests.post('https://api.pinterest.com/v5/oauth/token',
                    headers={
                        'Authorization': f'Basic {auth_header}',
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    data={
                        'grant_type': 'authorization_code',
                        'code': code,
                        'redirect_uri': PINTEREST_REDIRECT_URI
                    })

                data = r.json()

                if 'access_token' not in data:
                    raise Exception(data.get('message', 'Unknown error'))

                # Save tokens
                set_key(str(ENV_PATH), 'PINTEREST_ACCESS_TOKEN', data['access_token'])
                if 'refresh_token' in data:
                    set_key(str(ENV_PATH), 'PINTEREST_REFRESH_TOKEN', data['refresh_token'])

                load_dotenv(ENV_PATH, override=True)

                self.send_response(200)
                self.send_header('Content-Type', 'text/html')
                self.end_headers()
                self.wfile.write(get_success_html('Pinterest',
                    'Token saved to .env file!').encode())

            except Exception as e:
                self.send_response(200)
                self.send_header('Content-Type', 'text/html')
                self.end_headers()
                self.wfile.write(get_error_html('Pinterest', str(e)).encode())

        # =================================================================
        # TIKTOK OAUTH
        # =================================================================
        elif path == '/tiktok/auth':
            if not TIKTOK_CLIENT_SECRET:
                self.send_response(200)
                self.send_header('Content-Type', 'text/html')
                self.end_headers()
                self.wfile.write(get_error_html('TikTok',
                    'TikTok OAuth requires HTTPS callback.<br><br>'
                    'Options:<br>'
                    '1. Run with --ngrok flag for HTTPS tunnel<br>'
                    '2. Use TikTok Developer Portal directly').encode())
                return

            state = secrets.token_urlsafe(32)
            oauth_states[state] = {'platform': 'tiktok', 'timestamp': time.time()}

            # TikTok requires HTTPS - this will only work with ngrok
            auth_url = 'https://www.tiktok.com/v2/auth/authorize/?' + urlencode({
                'client_key': TIKTOK_CLIENT_KEY,
                'redirect_uri': TIKTOK_REDIRECT_URI,
                'response_type': 'code',
                'scope': ','.join(TIKTOK_SCOPES),
                'state': state
            })

            self.send_response(302)
            self.send_header('Location', auth_url)
            self.end_headers()

        elif path == '/tiktok/callback':
            code = query.get('code', [None])[0]
            state = query.get('state', [None])[0]

            if not code or state not in oauth_states:
                self.send_response(200)
                self.send_header('Content-Type', 'text/html')
                self.end_headers()
                self.wfile.write(get_error_html('TikTok', 'Invalid state or missing code').encode())
                return

            del oauth_states[state]

            try:
                r = requests.post('https://open.tiktokapis.com/v2/oauth/token/',
                    headers={'Content-Type': 'application/x-www-form-urlencoded'},
                    data={
                        'client_key': TIKTOK_CLIENT_KEY,
                        'client_secret': TIKTOK_CLIENT_SECRET,
                        'code': code,
                        'grant_type': 'authorization_code',
                        'redirect_uri': TIKTOK_REDIRECT_URI
                    })

                data = r.json()

                if 'access_token' not in data:
                    raise Exception(data.get('error_description', data.get('message', 'Unknown error')))

                set_key(str(ENV_PATH), 'TIKTOK_ACCESS_TOKEN', data['access_token'])
                if 'refresh_token' in data:
                    set_key(str(ENV_PATH), 'TIKTOK_REFRESH_TOKEN', data['refresh_token'])

                load_dotenv(ENV_PATH, override=True)

                self.send_response(200)
                self.send_header('Content-Type', 'text/html')
                self.end_headers()
                self.wfile.write(get_success_html('TikTok',
                    'Token saved to .env file!').encode())

            except Exception as e:
                self.send_response(200)
                self.send_header('Content-Type', 'text/html')
                self.end_headers()
                self.wfile.write(get_error_html('TikTok', str(e)).encode())

        # =================================================================
        # TEST ALL PLATFORMS
        # =================================================================
        elif path == '/test-all':
            results = []

            # Test each platform
            platforms = [
                ('test-twitter-post.py', 'Twitter'),
                ('test-facebook-post.py', 'Facebook'),
                ('test-instagram-post.py', 'Instagram'),
                ('test-pinterest-post.py', 'Pinterest'),
            ]

            script_dir = Path(__file__).parent

            for script, name in platforms:
                script_path = script_dir / script
                if script_path.exists():
                    try:
                        result = subprocess.run(
                            ['python3', str(script_path)],
                            capture_output=True,
                            text=True,
                            timeout=30,
                            cwd=str(script_dir)
                        )
                        if result.returncode == 0:
                            results.append(f'✅ {name}: Working')
                        else:
                            results.append(f'❌ {name}: Failed')
                    except subprocess.TimeoutExpired:
                        results.append(f'⏱️ {name}: Timeout')
                    except Exception as e:
                        results.append(f'❌ {name}: {str(e)[:50]}')
                else:
                    results.append(f'⚠️ {name}: No test script')

            html = f'''<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Results</title>
    <style>
        body {{
            font-family: -apple-system, sans-serif;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            min-height: 100vh;
            color: #fff;
            padding: 20px;
        }}
        .container {{ max-width: 500px; margin: 0 auto; }}
        h1 {{ text-align: center; margin-bottom: 30px; }}
        .result {{
            background: rgba(255,255,255,0.1);
            padding: 15px 20px;
            border-radius: 8px;
            margin-bottom: 10px;
            font-size: 16px;
        }}
        a {{
            display: block;
            text-align: center;
            margin-top: 30px;
            padding: 15px;
            background: linear-gradient(90deg, #667eea, #764ba2);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
        }}
    </style>
</head>
<body>
    <div class="container">
        <h1>🧪 Test Results</h1>
        {''.join(f'<div class="result">{r}</div>' for r in results)}
        <a href="/">Back to Dashboard</a>
    </div>
</body>
</html>'''

            self.send_response(200)
            self.send_header('Content-Type', 'text/html')
            self.end_headers()
            self.wfile.write(html.encode())

        else:
            self.send_response(404)
            self.send_header('Content-Type', 'text/plain')
            self.end_headers()
            self.wfile.write(b'Not Found')

# =============================================================================
# MAIN
# =============================================================================
def main():
    global PORT

    use_ngrok = '--ngrok' in sys.argv

    # Parse port
    for i, arg in enumerate(sys.argv):
        if arg == '--port' and i + 1 < len(sys.argv):
            PORT = int(sys.argv[i + 1])

    print(f'''
╔══════════════════════════════════════════════════════════════╗
║         UNTRAPD Social Media OAuth Server                   ║
╠══════════════════════════════════════════════════════════════╣
║  Dashboard: http://localhost:{PORT}                           ║
║  Status:    http://localhost:{PORT}/status                    ║
╚══════════════════════════════════════════════════════════════╝
''')

    # Check for missing secrets
    missing = []
    if not os.getenv('META_APP_SECRET'):
        missing.append('META_APP_ID, META_APP_SECRET')
    if not os.getenv('PINTEREST_APP_SECRET'):
        missing.append('PINTEREST_APP_SECRET')

    if missing:
        print(f"⚠️  Missing in .env: {', '.join(missing)}")
        print("   Add these from your developer app dashboards.\n")

    # Start ngrok if requested
    if use_ngrok:
        try:
            print("🌐 Starting ngrok tunnel...")
            ngrok_process = subprocess.Popen(
                ['ngrok', 'http', str(PORT)],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
            time.sleep(2)

            # Get ngrok URL
            try:
                r = requests.get('http://localhost:4040/api/tunnels')
                tunnels = r.json().get('tunnels', [])
                for tunnel in tunnels:
                    if tunnel.get('proto') == 'https':
                        print(f"📱 Phone Access: {tunnel['public_url']}")
                        break
            except:
                print("⚠️  Could not get ngrok URL. Check http://localhost:4040")
        except FileNotFoundError:
            print("⚠️  ngrok not found. Install with: sudo snap install ngrok")

    # Get local IP for phone access
    try:
        import socket
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
        print(f"📱 Local Network: http://{local_ip}:{PORT}")
    except:
        pass

    print("\nPress Ctrl+C to stop.\n")

    # Open browser
    webbrowser.open(f'http://localhost:{PORT}')

    # Start server
    server = HTTPServer((HOST, PORT), OAuthHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n👋 Server stopped.")
        server.shutdown()

if __name__ == '__main__':
    main()
