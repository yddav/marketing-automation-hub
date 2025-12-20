#!/usr/bin/env python3
"""
UNTRAPD Social Media - Quick Credential Setup
=============================================
Interactive script to set up all missing credentials.
Run this once to configure everything, then use oauth-server.py for token refresh.

Usage:
    python3 setup-credentials.py
"""

import os
import sys
import webbrowser
from pathlib import Path
from dotenv import load_dotenv, set_key

ENV_PATH = Path(__file__).parent / '.env'
load_dotenv(ENV_PATH)

def print_header():
    print('''
╔══════════════════════════════════════════════════════════════╗
║       UNTRAPD Social Media - Credential Setup                ║
╠══════════════════════════════════════════════════════════════╣
║  This script helps you configure all missing API credentials ║
╚══════════════════════════════════════════════════════════════╝
''')

def print_status():
    """Print current credential status"""
    print("\n📊 Current Status:")
    print("─" * 50)

    checks = [
        ('META_APP_ID', 'Meta App ID'),
        ('META_APP_SECRET', 'Meta App Secret'),
        ('FACEBOOK_PAGE_TOKEN', 'Facebook Page Token'),
        ('FACEBOOK_PAGE_ID', 'Facebook Page ID'),
        ('INSTAGRAM_ACCESS_TOKEN', 'Instagram Token'),
        ('INSTAGRAM_BUSINESS_ACCOUNT_ID', 'Instagram Account ID'),
        ('TWITTER_API_KEY', 'Twitter API Key'),
        ('TWITTER_ACCESS_TOKEN', 'Twitter Access Token'),
        ('PINTEREST_APP_ID', 'Pinterest App ID'),
        ('PINTEREST_APP_SECRET', 'Pinterest App Secret'),
        ('PINTEREST_ACCESS_TOKEN', 'Pinterest Token'),
        ('TIKTOK_CLIENT_KEY', 'TikTok Client Key'),
        ('TIKTOK_CLIENT_SECRET', 'TikTok Client Secret'),
        ('TIKTOK_ACCESS_TOKEN', 'TikTok Access Token'),
    ]

    for key, name in checks:
        value = os.getenv(key, '')
        if value:
            status = '✅'
            display = value[:20] + '...' if len(value) > 20 else value
        else:
            status = '❌'
            display = 'NOT SET'
        print(f"  {status} {name}: {display}")

    print("─" * 50)

def setup_meta():
    """Set up Meta (Facebook/Instagram) credentials"""
    print("\n" + "=" * 50)
    print("📘 META (Facebook/Instagram) Setup")
    print("=" * 50)

    meta_app_id = os.getenv('META_APP_ID', '')
    meta_app_secret = os.getenv('META_APP_SECRET', '')

    if meta_app_id and meta_app_secret:
        print("✅ Meta App credentials already configured!")
        return

    print("""
To get your Meta App credentials:

1. Go to: https://developers.facebook.com/apps/
2. Click on your app (or create one for UNTRAPD)
3. Go to Settings > Basic
4. Copy the App ID and App Secret

""")

    open_browser = input("Open Meta Developer Console? [Y/n]: ").strip().lower()
    if open_browser != 'n':
        webbrowser.open('https://developers.facebook.com/apps/')

    print("\nEnter your credentials (or press Enter to skip):")

    if not meta_app_id:
        meta_app_id = input("Meta App ID: ").strip()
        if meta_app_id:
            set_key(str(ENV_PATH), 'META_APP_ID', meta_app_id)
            print(f"  ✅ Saved META_APP_ID")

    if not meta_app_secret:
        meta_app_secret = input("Meta App Secret: ").strip()
        if meta_app_secret:
            set_key(str(ENV_PATH), 'META_APP_SECRET', meta_app_secret)
            print(f"  ✅ Saved META_APP_SECRET")

def setup_pinterest():
    """Set up Pinterest credentials"""
    print("\n" + "=" * 50)
    print("📌 PINTEREST Setup")
    print("=" * 50)

    pinterest_secret = os.getenv('PINTEREST_APP_SECRET', '')

    if pinterest_secret:
        print("✅ Pinterest App Secret already configured!")
        return

    pinterest_app_id = os.getenv('PINTEREST_APP_ID', '1534758')

    print(f"""
To get your Pinterest App Secret:

1. Go to: https://developers.pinterest.com/apps/
2. Click on your app: {pinterest_app_id}
3. Go to App Settings
4. Copy the App Secret

""")

    open_browser = input("Open Pinterest Developer Console? [Y/n]: ").strip().lower()
    if open_browser != 'n':
        webbrowser.open('https://developers.pinterest.com/apps/')

    print("\nEnter your credentials (or press Enter to skip):")

    pinterest_secret = input("Pinterest App Secret: ").strip()
    if pinterest_secret:
        set_key(str(ENV_PATH), 'PINTEREST_APP_SECRET', pinterest_secret)
        print(f"  ✅ Saved PINTEREST_APP_SECRET")

def setup_tiktok():
    """Set up TikTok credentials"""
    print("\n" + "=" * 50)
    print("🎵 TIKTOK Setup")
    print("=" * 50)

    tiktok_secret = os.getenv('TIKTOK_CLIENT_SECRET', '')

    if tiktok_secret:
        print("✅ TikTok Client Secret already configured!")
    else:
        print("⚠️  TikTok Client Secret missing (but may already be set)")

    tiktok_client_key = os.getenv('TIKTOK_CLIENT_KEY', 'awzpr6gs8tayotje')

    print(f"""
TikTok OAuth Setup:

1. Go to: https://developers.tiktok.com/apps/
2. Find your app: {tiktok_client_key}
3. Add OAuth Redirect URI: http://localhost:5000/tiktok/callback
4. For production: Use ngrok for HTTPS callback

Note: TikTok requires HTTPS for OAuth callbacks.
Use 'python3 oauth-server.py --ngrok' for secure callback.

""")

    open_browser = input("Open TikTok Developer Console? [Y/n]: ").strip().lower()
    if open_browser != 'n':
        webbrowser.open('https://developers.tiktok.com/apps/')

def quick_token_refresh():
    """Provide direct links for quick token refresh"""
    print("\n" + "=" * 50)
    print("🔄 QUICK TOKEN REFRESH")
    print("=" * 50)

    page_id = os.getenv('FACEBOOK_PAGE_ID', '830176470182189')
    meta_app_id = os.getenv('META_APP_ID', '')

    print("""
For quick token refresh without OAuth server:

📘 META (Facebook/Instagram):
""")

    if meta_app_id:
        graph_url = f"https://developers.facebook.com/tools/explorer/?method=GET&path=me%3Ffields%3Did%2Cname&version=v21.0&app={meta_app_id}"
        print(f"   Graph Explorer: {graph_url}")
    else:
        print("   Graph Explorer: https://developers.facebook.com/tools/explorer/")

    print(f"""
   1. Select your App
   2. Select "Get Page Access Token"
   3. Select page: {page_id}
   4. Add permissions: pages_manage_posts, instagram_content_publish
   5. Generate Access Token
   6. Copy and update .env

📌 PINTEREST:
   https://developers.pinterest.com/tools/access-token/
   1. Select your app
   2. Generate new token with: boards:write, pins:write

🎵 TIKTOK:
   Requires OAuth flow - run: python3 oauth-server.py --ngrok
""")

def main():
    print_header()
    print_status()

    print("\nWhat would you like to do?")
    print("  1. Set up Meta (Facebook/Instagram) credentials")
    print("  2. Set up Pinterest credentials")
    print("  3. Set up TikTok credentials")
    print("  4. Quick token refresh links")
    print("  5. Start OAuth server (for automated refresh)")
    print("  6. Show status and exit")
    print("  a. Set up ALL missing credentials")

    choice = input("\nChoice [1-6/a]: ").strip().lower()

    if choice == '1':
        setup_meta()
    elif choice == '2':
        setup_pinterest()
    elif choice == '3':
        setup_tiktok()
    elif choice == '4':
        quick_token_refresh()
    elif choice == '5':
        print("\nStarting OAuth server...")
        os.system('python3 oauth-server.py')
    elif choice == '6':
        print("\nGoodbye!")
    elif choice == 'a':
        setup_meta()
        setup_pinterest()
        setup_tiktok()
        print("\n✅ All credentials configured!")
        print("Now run: python3 oauth-server.py")
    else:
        print("Invalid choice")
        return

    # Reload and show final status
    load_dotenv(ENV_PATH, override=True)
    print_status()

if __name__ == '__main__':
    main()
