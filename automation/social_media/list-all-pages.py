#!/usr/bin/env python3
"""
List all Facebook Pages accessible with current token
"""

import os
import requests
from dotenv import load_dotenv

load_dotenv()

def list_all_pages():
    """List all pages accessible with the current token"""

    token = os.getenv('FACEBOOK_PAGE_TOKEN')

    print("=" * 60)
    print("  LIST ALL FACEBOOK PAGES")
    print("=" * 60)
    print()

    if not token:
        print("❌ FACEBOOK_PAGE_TOKEN not found in .env")
        return

    print(f"🔑 Using token: {token[:20]}...{token[-10:]}")
    print()

    # Method 1: Try /me/accounts (pages you manage)
    print("📋 Method 1: Checking /me/accounts (pages you manage)...")
    url1 = f"https://graph.facebook.com/v18.0/me/accounts?access_token={token}"

    try:
        response = requests.get(url1)
        result = response.json()

        if 'error' in result:
            print(f"❌ Error: {result['error'].get('message', 'Unknown')}")
            print(f"   Code: {result['error'].get('code', 'N/A')}")
        elif 'data' in result:
            pages = result['data']
            if len(pages) == 0:
                print("⚠️  No pages found via /me/accounts")
                print("   This means you don't manage any Facebook Pages,")
                print("   or the app doesn't have permission to see them.")
            else:
                print(f"✅ Found {len(pages)} page(s):")
                for page in pages:
                    print(f"\n   📄 {page.get('name', 'N/A')}")
                    print(f"      ID: {page.get('id', 'N/A')}")
                    print(f"      Category: {page.get('category', 'N/A')}")
                    print(f"      Access Token: {'Yes' if 'access_token' in page else 'No'}")
                    if 'access_token' in page:
                        page_token = page['access_token']
                        print(f"      Token: {page_token[:20]}...{page_token[-10:]}")
        else:
            print(f"⚠️  Unexpected response: {result}")

        print()

    except Exception as e:
        print(f"❌ Exception: {str(e)}")
        print()

    # Method 2: Try /me (get user info)
    print("📋 Method 2: Checking /me (your account info)...")
    url2 = f"https://graph.facebook.com/v18.0/me?fields=id,name,email&access_token={token}"

    try:
        response = requests.get(url2)
        result = response.json()

        if 'error' in result:
            print(f"❌ Error: {result['error'].get('message', 'Unknown')}")
        else:
            print(f"✅ Account info:")
            print(f"   Name: {result.get('name', 'N/A')}")
            print(f"   ID: {result.get('id', 'N/A')}")
            print(f"   Email: {result.get('email', 'N/A')}")

        print()

    except Exception as e:
        print(f"❌ Exception: {str(e)}")
        print()

    # Method 3: Check the specific page ID
    print("📋 Method 3: Checking specific page ID 750014458192598...")
    page_id = "750014458192598"
    url3 = f"https://graph.facebook.com/v18.0/{page_id}?fields=id,name,category,link&access_token={token}"

    try:
        response = requests.get(url3)
        result = response.json()

        if 'error' in result:
            error = result['error']
            print(f"❌ Error: {error.get('message', 'Unknown')}")
            print(f"   Code: {error.get('code', 'N/A')}")

            if error.get('code') in [803, 100, 190]:
                print()
                print("⚠️  This page ID is INVALID or DOESN'T EXIST")
                print("   Possible reasons:")
                print("   1. The page was deleted")
                print("   2. The page ID is incorrect")
                print("   3. The page never existed")
        else:
            print(f"✅ Page found:")
            print(f"   Name: {result.get('name', 'N/A')}")
            print(f"   ID: {result.get('id', 'N/A')}")
            print(f"   Category: {result.get('category', 'N/A')}")
            print(f"   Link: {result.get('link', 'N/A')}")

        print()

    except Exception as e:
        print(f"❌ Exception: {str(e)}")
        print()

    print("=" * 60)
    print("  RECOMMENDATION")
    print("=" * 60)
    print()
    print("Based on the results above:")
    print("1. If NO pages found → Create a new Facebook Page")
    print("2. If pages found but not 750014458192598 → Update .env with correct Page ID")
    print("3. If specific page found but no access → Make yourself admin of that page")
    print()

if __name__ == "__main__":
    list_all_pages()
