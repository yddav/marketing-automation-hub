#!/usr/bin/env python3
"""
Facebook API Test - Quick validation of posting capability
Uses credentials from .env file
"""

import os
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_facebook_post():
    """Test posting to Facebook Page"""

    # Get credentials from .env
    page_token = os.getenv('FACEBOOK_PAGE_TOKEN')
    page_id = os.getenv('FACEBOOK_PAGE_ID')

    if not page_token or not page_id:
        print("❌ Missing credentials in .env file")
        print("   FACEBOOK_PAGE_TOKEN:", "✅ Found" if page_token else "❌ Missing")
        print("   FACEBOOK_PAGE_ID:", "✅ Found" if page_id else "❌ Missing")
        return False

    print("📋 Facebook Page Posting Test")
    print(f"   Page ID: {page_id}")
    print(f"   Token: {page_token[:20]}...{page_token[-10:]}")
    print()

    # Test post content
    test_content = """🧪 TEST POST - FINDERR Beta Campaign

This is a test post from our automated posting system.

🚀 FINDERR v4.2.0+243 Beta Testing
📱 Professional Android phone security
🔐 Emergency wallpaper display system

If you see this, our posting automation is working!

#FINDERR #TestPost #UNTRAPD"""

    # Facebook Graph API endpoint
    url = f"https://graph.facebook.com/v18.0/{page_id}/feed"

    # Post data
    payload = {
        'message': test_content,
        'access_token': page_token
    }

    print("📤 Sending test post to Facebook...")
    print()

    try:
        response = requests.post(url, data=payload)
        result = response.json()

        if response.status_code == 200 and 'id' in result:
            post_id = result['id']
            print("✅ SUCCESS! Post created:")
            print(f"   Post ID: {post_id}")
            print(f"   URL: https://facebook.com/{post_id}")
            print()
            print("🎯 Next steps:")
            print("   1. Check the post on your Facebook Page")
            print("   2. Delete it if it's just a test")
            print("   3. Ready to schedule real campaign posts!")
            return True
        else:
            print("❌ FAILED:")
            print(f"   Status: {response.status_code}")
            print(f"   Error: {result.get('error', {}).get('message', 'Unknown error')}")
            print(f"   Full response: {result}")
            return False

    except Exception as e:
        print(f"❌ Exception occurred: {str(e)}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("  FACEBOOK API TEST - FINDERR Beta Campaign")
    print("=" * 60)
    print()

    success = test_facebook_post()

    print()
    print("=" * 60)
    if success:
        print("  ✅ Facebook posting is WORKING!")
    else:
        print("  ❌ Facebook posting needs troubleshooting")
    print("=" * 60)
