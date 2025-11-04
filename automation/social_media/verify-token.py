#!/usr/bin/env python3
"""
Verify Meta Access Token - Check permissions and page access
"""

import os
import requests
from dotenv import load_dotenv

load_dotenv()

def verify_token():
    """Verify the Facebook Page token and its permissions"""

    page_token = os.getenv('FACEBOOK_PAGE_TOKEN')
    page_id = os.getenv('FACEBOOK_PAGE_ID')

    print("=" * 60)
    print("  META ACCESS TOKEN VERIFICATION")
    print("=" * 60)
    print()

    if not page_token:
        print("❌ FACEBOOK_PAGE_TOKEN not found in .env")
        return False

    print(f"📋 Page ID: {page_id}")
    print(f"🔑 Token: {page_token[:20]}...{page_token[-10:]}")
    print()

    # Check token info
    print("🔍 Checking token information...")
    debug_url = f"https://graph.facebook.com/v18.0/debug_token?input_token={page_token}&access_token={page_token}"

    try:
        response = requests.get(debug_url)
        debug_info = response.json()

        if 'data' in debug_info:
            data = debug_info['data']
            print(f"✅ Token is valid: {data.get('is_valid', False)}")
            print(f"   App ID: {data.get('app_id', 'N/A')}")
            print(f"   Type: {data.get('type', 'N/A')}")
            print(f"   Expires at: {data.get('expires_at', 'Never')}")

            if 'scopes' in data:
                print(f"   Permissions: {', '.join(data['scopes'])}")

            print()
        else:
            print(f"❌ Token debug failed: {debug_info}")
            print()

    except Exception as e:
        print(f"❌ Error checking token: {str(e)}")
        print()

    # Try to get page info
    print("🔍 Checking page access...")
    page_url = f"https://graph.facebook.com/v18.0/{page_id}?fields=id,name,access_token&access_token={page_token}"

    try:
        response = requests.get(page_url)
        page_info = response.json()

        if 'error' not in page_info:
            print(f"✅ Page access verified")
            print(f"   Page Name: {page_info.get('name', 'N/A')}")
            print(f"   Page ID: {page_info.get('id', 'N/A')}")
            print()
        else:
            print(f"❌ Page access failed: {page_info['error'].get('message', 'Unknown error')}")
            print()

    except Exception as e:
        print(f"❌ Error checking page: {str(e)}")
        print()

    # Try to get accounts (pages) associated with token
    print("🔍 Checking associated pages...")
    accounts_url = f"https://graph.facebook.com/v18.0/me/accounts?access_token={page_token}"

    try:
        response = requests.get(accounts_url)
        accounts_info = response.json()

        if 'data' in accounts_info:
            pages = accounts_info['data']
            print(f"✅ Found {len(pages)} page(s):")
            for page in pages:
                print(f"   - {page.get('name', 'N/A')} (ID: {page.get('id', 'N/A')})")
                if page.get('id') == page_id:
                    print(f"     ✅ This is our target page!")
                    if 'access_token' in page:
                        print(f"     🔑 Page has its own access token")
            print()
        else:
            print(f"❌ No pages found or error: {accounts_info}")
            print()

    except Exception as e:
        print(f"❌ Error checking accounts: {str(e)}")
        print()

    print("=" * 60)
    print("  VERIFICATION COMPLETE")
    print("=" * 60)

if __name__ == "__main__":
    verify_token()
