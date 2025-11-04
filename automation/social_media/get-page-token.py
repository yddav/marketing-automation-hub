#!/usr/bin/env python3
"""
Get Page Access Token from User Access Token
This exchanges the User token for a Page token with posting permissions
"""

import os
import requests
from dotenv import load_dotenv

load_dotenv()

def get_page_access_token():
    """Get the Page Access Token from the User Access Token"""

    user_token = os.getenv('FACEBOOK_PAGE_TOKEN')  # This is actually a user token
    target_page_id = os.getenv('FACEBOOK_PAGE_ID')

    print("=" * 60)
    print("  GET PAGE ACCESS TOKEN")
    print("=" * 60)
    print()

    if not user_token or not target_page_id:
        print("❌ Missing credentials in .env file")
        return None

    print(f"🔑 User Token: {user_token[:20]}...{user_token[-10:]}")
    print(f"📋 Target Page ID: {target_page_id}")
    print()

    # Get all pages managed by this user
    print("🔍 Fetching pages managed by this account...")
    url = f"https://graph.facebook.com/v18.0/me/accounts?access_token={user_token}"

    try:
        response = requests.get(url)
        result = response.json()

        if 'error' in result:
            print(f"❌ Error: {result['error'].get('message', 'Unknown error')}")
            print(f"   Full error: {result}")
            return None

        if 'data' not in result or len(result['data']) == 0:
            print("❌ No pages found. This could mean:")
            print("   1. You're not an admin of any Facebook Pages")
            print("   2. The app doesn't have permission to access your pages")
            print("   3. You need to add 'pages_show_list' permission")
            return None

        pages = result['data']
        print(f"✅ Found {len(pages)} page(s):")
        print()

        for page in pages:
            page_id = page.get('id')
            page_name = page.get('name', 'N/A')
            page_token = page.get('access_token', 'N/A')

            print(f"📄 Page: {page_name}")
            print(f"   ID: {page_id}")
            print(f"   Token: {page_token[:20]}...{page_token[-10:] if len(page_token) > 30 else 'N/A'}")

            if page_id == target_page_id:
                print(f"   ✅ THIS IS YOUR TARGET PAGE!")
                print()
                print("=" * 60)
                print("  PAGE ACCESS TOKEN FOUND")
                print("=" * 60)
                print()
                print("Copy this token to your .env file as FACEBOOK_PAGE_TOKEN:")
                print()
                print(page_token)
                print()
                return page_token

            print()

        print(f"⚠️  Target page ID {target_page_id} not found in your pages.")
        print("   Make sure you're an admin of the page.")

        return None

    except Exception as e:
        print(f"❌ Exception occurred: {str(e)}")
        return None

if __name__ == "__main__":
    get_page_access_token()
