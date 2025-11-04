#!/usr/bin/env python3
"""
Get the actual Page Access Token and update .env file
"""

import os
import requests
from dotenv import load_dotenv

load_dotenv()

def get_page_token_and_update():
    """Get the page-specific token and update .env"""

    user_token = os.getenv('FACEBOOK_PAGE_TOKEN')
    target_page_id = os.getenv('FACEBOOK_PAGE_ID')

    print("=" * 60)
    print("  GET PAGE-SPECIFIC ACCESS TOKEN")
    print("=" * 60)
    print()

    # Get pages
    url = f"https://graph.facebook.com/v18.0/me/accounts?access_token={user_token}"

    try:
        response = requests.get(url)
        result = response.json()

        if 'data' in result and len(result['data']) > 0:
            for page in result['data']:
                if page.get('id') == target_page_id:
                    page_token = page.get('access_token')
                    page_name = page.get('name')

                    print(f"✅ Found page: {page_name}")
                    print(f"   ID: {target_page_id}")
                    print(f"   Token: {page_token[:20]}...{page_token[-10:]}")
                    print()

                    # Update .env file
                    env_path = ".env"
                    with open(env_path, 'r') as f:
                        content = f.read()

                    # Replace the token
                    old_token = user_token
                    new_content = content.replace(f"FACEBOOK_PAGE_TOKEN={old_token}", f"FACEBOOK_PAGE_TOKEN={page_token}")

                    with open(env_path, 'w') as f:
                        f.write(new_content)

                    print(f"✅ Updated .env file with page-specific token")
                    print()
                    return page_token

        print("❌ No matching page found")
        return None

    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return None

if __name__ == "__main__":
    get_page_token_and_update()
