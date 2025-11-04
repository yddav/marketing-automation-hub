#!/usr/bin/env python3
"""
Deep check for Instagram connection - try multiple methods
"""

import os
import requests
from dotenv import load_dotenv

load_dotenv()

def deep_check_instagram():
    """Try multiple methods to find Instagram connection"""

    page_token = os.getenv('FACEBOOK_PAGE_TOKEN')
    page_id = os.getenv('FACEBOOK_PAGE_ID')
    ig_id = os.getenv('INSTAGRAM_BUSINESS_ACCOUNT_ID')

    print("=" * 60)
    print("  DEEP INSTAGRAM CONNECTION CHECK")
    print("=" * 60)
    print()

    # Method 1: Check via page
    print("🔍 Method 1: Checking via Facebook Page...")
    url1 = f"https://graph.facebook.com/v18.0/{page_id}?fields=instagram_business_account,connected_instagram_account&access_token={page_token}"

    try:
        response = requests.get(url1)
        result = response.json()
        print(f"Response: {result}")
        print()
    except Exception as e:
        print(f"Error: {str(e)}")
        print()

    # Method 2: Try direct Instagram ID access with page token
    print(f"🔍 Method 2: Trying Instagram ID {ig_id} with page token...")
    url2 = f"https://graph.facebook.com/v18.0/{ig_id}?fields=id,username,name&access_token={page_token}"

    try:
        response = requests.get(url2)
        result = response.json()
        print(f"Response: {result}")
        print()

        if 'username' in result:
            print(f"✅ Found Instagram account via direct access!")
            print(f"   Username: @{result.get('username')}")
            print(f"   This means the token has access, but connection might not be via Page")
            print()
    except Exception as e:
        print(f"Error: {str(e)}")
        print()

    # Method 3: Check me/accounts for all pages and their Instagram links
    print("🔍 Method 3: Checking all pages for Instagram connections...")
    url3 = f"https://graph.facebook.com/v18.0/me/accounts?fields=id,name,instagram_business_account&access_token={page_token}"

    try:
        response = requests.get(url3)
        result = response.json()

        if 'data' in result:
            for page in result['data']:
                print(f"\nPage: {page.get('name')} (ID: {page.get('id')})")
                if 'instagram_business_account' in page:
                    ig = page['instagram_business_account']
                    print(f"  ✅ Has Instagram: {ig.get('id')}")
                else:
                    print(f"  ❌ No Instagram linked")
        print()
    except Exception as e:
        print(f"Error: {str(e)}")
        print()

    # Method 4: Check token permissions
    print("🔍 Method 4: Checking token permissions...")
    url4 = f"https://graph.facebook.com/v18.0/debug_token?input_token={page_token}&access_token={page_token}"

    try:
        response = requests.get(url4)
        result = response.json()

        if 'data' in result:
            perms = result['data'].get('scopes', [])
            print(f"Token permissions: {', '.join(perms)}")

            required = ['instagram_basic', 'instagram_content_publish', 'pages_read_engagement']
            missing = [p for p in required if p not in perms]

            if missing:
                print(f"⚠️  Missing permissions: {', '.join(missing)}")
            else:
                print(f"✅ All Instagram permissions present")
        print()
    except Exception as e:
        print(f"Error: {str(e)}")
        print()

    print("=" * 60)

if __name__ == "__main__":
    deep_check_instagram()
