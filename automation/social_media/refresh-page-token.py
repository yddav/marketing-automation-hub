#!/usr/bin/env python3
"""
Refresh Page Access Token using new User Access Token
"""

import os
import requests
from dotenv import load_dotenv

load_dotenv()

def refresh_page_token():
    """Get fresh Page Access Token from new User token"""

    # NEW USER TOKEN from user
    user_token = "EAAKfzRqLcbwBPz8Yv3i6SdW9YA2II0Rdb6VhxEZB5gaJz0JYDmSeDFOZCclYR0PK9wgMvt4fh2ASOZCmIWN1rna6hRgtsQ29Bah95vuM16mJJHvvADtuuh9I4GQMupKAC8IHMtiOUHkqMS0SIaSySX3ZAE0cfCR0tFT9pzz9nRteZAePg1h3ELWbvmuhZA4AesY6GOsulUnmLImdnbTUfNiuRqVeFroyPSBFpZAc1kVhYo1ZCai5RGKrmKxxQQnca1JrhZARFZBbPTZBtSrXxzpACPHeWWMY"
    target_page_id = os.getenv('FACEBOOK_PAGE_ID')

    print("=" * 60)
    print("  REFRESH PAGE ACCESS TOKEN")
    print("=" * 60)
    print()

    # Get all pages
    url = f"https://graph.facebook.com/v18.0/me/accounts?access_token={user_token}"

    try:
        response = requests.get(url)
        result = response.json()

        if 'data' in result and len(result['data']) > 0:
            print(f"✅ Found {len(result['data'])} page(s)")
            print()

            for page in result['data']:
                page_id = page.get('id')
                page_name = page.get('name')
                page_token = page.get('access_token')

                print(f"📄 {page_name}")
                print(f"   ID: {page_id}")
                print(f"   Token: {page_token[:20]}...{page_token[-10:]}")

                if page_id == target_page_id:
                    print(f"   🎯 THIS IS OUR TARGET PAGE")
                    print()

                    # Check for Instagram connection
                    print(f"🔍 Checking Instagram connection for page {page_id}...")
                    ig_url = f"https://graph.facebook.com/v18.0/{page_id}?fields=instagram_business_account&access_token={page_token}"

                    ig_response = requests.get(ig_url)
                    ig_result = ig_response.json()

                    if 'instagram_business_account' in ig_result:
                        ig_account = ig_result['instagram_business_account']
                        ig_id = ig_account.get('id')

                        print(f"✅ Instagram Business Account found!")
                        print(f"   ID: {ig_id}")
                        print()

                        # Get Instagram account details
                        ig_details_url = f"https://graph.facebook.com/v18.0/{ig_id}?fields=id,username,name&access_token={page_token}"
                        ig_details_response = requests.get(ig_details_url)
                        ig_details = ig_details_response.json()

                        if 'username' in ig_details:
                            print(f"   Username: @{ig_details.get('username')}")
                            print(f"   Name: {ig_details.get('name')}")
                            print()

                        # Update .env file
                        env_path = ".env"
                        with open(env_path, 'r') as f:
                            content = f.read()

                        # Update tokens
                        old_fb_token = os.getenv('FACEBOOK_PAGE_TOKEN')
                        old_ig_token = os.getenv('INSTAGRAM_ACCESS_TOKEN')
                        old_ig_id = os.getenv('INSTAGRAM_BUSINESS_ACCOUNT_ID')

                        new_content = content.replace(f"FACEBOOK_PAGE_TOKEN={old_fb_token}",
                                                     f"FACEBOOK_PAGE_TOKEN={page_token}")
                        new_content = new_content.replace(f"INSTAGRAM_ACCESS_TOKEN={old_ig_token}",
                                                         f"INSTAGRAM_ACCESS_TOKEN={page_token}")
                        new_content = new_content.replace(f"INSTAGRAM_BUSINESS_ACCOUNT_ID={old_ig_id}",
                                                         f"INSTAGRAM_BUSINESS_ACCOUNT_ID={ig_id}")

                        with open(env_path, 'w') as f:
                            f.write(new_content)

                        print(f"✅ Updated .env file:")
                        print(f"   FACEBOOK_PAGE_TOKEN: Updated")
                        print(f"   INSTAGRAM_ACCESS_TOKEN: Updated")
                        print(f"   INSTAGRAM_BUSINESS_ACCOUNT_ID: {ig_id}")
                        print()

                        return True
                    else:
                        print(f"❌ No Instagram Business Account linked to this page")
                        print(f"   Response: {ig_result}")
                        print()
                        return False
                print()

            print("❌ Target page ID not found in list")
            return False
        else:
            print(f"❌ No pages found")
            print(f"   Response: {result}")
            return False

    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

    print("=" * 60)

if __name__ == "__main__":
    success = refresh_page_token()

    if success:
        print()
        print("🎯 NEXT STEP: Test Instagram posting with test-instagram-post.py")
    else:
        print()
        print("⚠️  Instagram linking may still be pending - wait a few minutes and try again")

