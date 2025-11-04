#!/usr/bin/env python3
"""
Check if Facebook Page exists and is publicly accessible
"""

import os
import requests
from dotenv import load_dotenv

load_dotenv()

def check_page_exists():
    """Check if the Facebook Page exists"""

    page_id = os.getenv('FACEBOOK_PAGE_ID')
    user_token = os.getenv('FACEBOOK_PAGE_TOKEN')

    print("=" * 60)
    print("  FACEBOOK PAGE EXISTENCE CHECK")
    print("=" * 60)
    print()

    if not page_id:
        print("❌ FACEBOOK_PAGE_ID not found in .env")
        return False

    print(f"📋 Checking Page ID: {page_id}")
    print()

    # Try to get public page info (no token required for public pages)
    print("🔍 Checking public page info (no authentication)...")
    public_url = f"https://graph.facebook.com/v18.0/{page_id}?fields=id,name,category,link,verification_status"

    try:
        response = requests.get(public_url)
        result = response.json()

        if 'error' in result:
            error = result['error']
            print(f"❌ Error: {error.get('message', 'Unknown error')}")
            print(f"   Type: {error.get('type', 'N/A')}")
            print(f"   Code: {error.get('code', 'N/A')}")

            if error.get('code') == 803:
                print()
                print("⚠️  This page ID doesn't exist or has been deleted.")
                print("   You may need to create a new Facebook Page.")
            elif error.get('code') == 100:
                print()
                print("⚠️  Invalid Page ID format or page not found.")

            print()
            return False
        else:
            print(f"✅ Page exists!")
            print(f"   Name: {result.get('name', 'N/A')}")
            print(f"   ID: {result.get('id', 'N/A')}")
            print(f"   Category: {result.get('category', 'N/A')}")
            print(f"   Link: {result.get('link', 'N/A')}")
            print(f"   Verified: {result.get('verification_status', 'N/A')}")
            print()

            # Now try with authentication to check if we have access
            if user_token:
                print("🔍 Checking authenticated access...")
                auth_url = f"https://graph.facebook.com/v18.0/{page_id}?fields=id,name,access_token&access_token={user_token}"

                try:
                    auth_response = requests.get(auth_url)
                    auth_result = auth_response.json()

                    if 'error' in auth_result:
                        print(f"❌ No admin access to this page")
                        print(f"   Error: {auth_result['error'].get('message', 'Unknown')}")
                        print()
                        print("⚠️  You are NOT an admin of this page!")
                        print("   You need to either:")
                        print("   1. Become an admin of this page")
                        print("   2. Create a new Facebook Page and use its ID")
                    else:
                        print(f"✅ You have access to this page!")
                        if 'access_token' in auth_result:
                            print(f"   Page Token available: Yes")
                        else:
                            print(f"   Page Token available: No")
                    print()

                except Exception as e:
                    print(f"❌ Error checking authenticated access: {str(e)}")
                    print()

            return True

    except Exception as e:
        print(f"❌ Exception occurred: {str(e)}")
        print()
        return False

    print("=" * 60)

if __name__ == "__main__":
    check_page_exists()
