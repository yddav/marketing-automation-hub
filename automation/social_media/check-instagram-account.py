#!/usr/bin/env python3
"""
Check Instagram Business Account linked to Facebook Page
"""

import os
import requests
from dotenv import load_dotenv

load_dotenv()

def check_instagram_account():
    """Check Instagram accounts linked to Facebook Page"""

    page_token = os.getenv('FACEBOOK_PAGE_TOKEN')
    page_id = os.getenv('FACEBOOK_PAGE_ID')

    print("=" * 60)
    print("  CHECK INSTAGRAM BUSINESS ACCOUNT")
    print("=" * 60)
    print()

    if not page_token or not page_id:
        print("❌ Missing Facebook Page credentials")
        return

    print(f"📋 Facebook Page ID: {page_id}")
    print()

    # Check if page has linked Instagram account
    print("🔍 Checking for linked Instagram account...")
    url = f"https://graph.facebook.com/v18.0/{page_id}?fields=instagram_business_account&access_token={page_token}"

    try:
        response = requests.get(url)
        result = response.json()

        if 'instagram_business_account' in result:
            ig_account = result['instagram_business_account']
            ig_id = ig_account.get('id')

            print(f"✅ Instagram Business Account found!")
            print(f"   ID: {ig_id}")
            print()

            # Get more details about the Instagram account
            print("🔍 Getting Instagram account details...")
            ig_url = f"https://graph.facebook.com/v18.0/{ig_id}?fields=id,username,name,profile_picture_url&access_token={page_token}"

            ig_response = requests.get(ig_url)
            ig_result = ig_response.json()

            if 'error' not in ig_result:
                print(f"✅ Instagram account details:")
                print(f"   Username: @{ig_result.get('username', 'N/A')}")
                print(f"   Name: {ig_result.get('name', 'N/A')}")
                print(f"   ID: {ig_result.get('id', 'N/A')}")
                print()

                # Update .env file with correct ID
                env_path = ".env"
                with open(env_path, 'r') as f:
                    content = f.read()

                old_id = os.getenv('INSTAGRAM_BUSINESS_ACCOUNT_ID')
                if old_id != ig_id:
                    new_content = content.replace(f"INSTAGRAM_BUSINESS_ACCOUNT_ID={old_id}", f"INSTAGRAM_BUSINESS_ACCOUNT_ID={ig_id}")
                    with open(env_path, 'w') as f:
                        f.write(new_content)
                    print(f"✅ Updated .env with correct Instagram ID: {ig_id}")
                else:
                    print(f"✅ Instagram ID in .env is already correct")

            else:
                print(f"❌ Error getting Instagram details: {ig_result.get('error', {}).get('message', 'Unknown')}")

        else:
            print("❌ No Instagram Business Account linked to this Facebook Page")
            print()
            print("🔧 To fix this:")
            print("   1. Go to your Facebook Page settings")
            print("   2. Link your Instagram Business account")
            print("   3. Or create an Instagram Business account at instagram.com")
            print()

    except Exception as e:
        print(f"❌ Exception: {str(e)}")

    print("=" * 60)

if __name__ == "__main__":
    check_instagram_account()
