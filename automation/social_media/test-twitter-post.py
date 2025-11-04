#!/usr/bin/env python3
"""
Twitter/X API Test - Quick validation with auto-delete
Uses credentials from .env file
"""

import os
import requests
from requests_oauthlib import OAuth1
from dotenv import load_dotenv
import time

# Load environment variables
load_dotenv()

def test_twitter_post():
    """Test posting to Twitter/X with immediate deletion"""

    # Get credentials from .env
    api_key = os.getenv('TWITTER_API_KEY')
    api_secret = os.getenv('TWITTER_API_SECRET')
    access_token = os.getenv('TWITTER_ACCESS_TOKEN')
    access_token_secret = os.getenv('TWITTER_ACCESS_TOKEN_SECRET')

    if not all([api_key, api_secret, access_token, access_token_secret]):
        print("❌ Missing Twitter credentials in .env file")
        print("   TWITTER_API_KEY:", "✅ Found" if api_key else "❌ Missing")
        print("   TWITTER_API_SECRET:", "✅ Found" if api_secret else "❌ Missing")
        print("   TWITTER_ACCESS_TOKEN:", "✅ Found" if access_token else "❌ Missing")
        print("   TWITTER_ACCESS_TOKEN_SECRET:", "✅ Found" if access_token_secret else "❌ Missing")
        return False

    print("📋 Twitter/X Account Posting Test")
    print(f"   API Key: {api_key[:10]}...")
    print(f"   Access Token: {access_token[:15]}...")
    print()

    # OAuth 1.0a authentication
    auth = OAuth1(api_key, api_secret, access_token, access_token_secret)

    # Test 1: Verify credentials
    print("📋 Test 1: Verifying Twitter credentials...")
    verify_url = "https://api.twitter.com/1.1/account/verify_credentials.json"

    try:
        response = requests.get(verify_url, auth=auth)
        result = response.json()

        if response.status_code == 200:
            print(f"✅ Credentials verified!")
            print(f"   Username: @{result.get('screen_name', 'N/A')}")
            print(f"   Display Name: {result.get('name', 'N/A')}")
            print(f"   Followers: {result.get('followers_count', 0)}")
            print()
        else:
            print(f"❌ Credential verification failed:")
            print(f"   Status: {response.status_code}")
            print(f"   Error: {result.get('errors', [{}])[0].get('message', 'Unknown error')}")
            print()
            return False

    except Exception as e:
        print(f"❌ Exception occurred: {str(e)}")
        return False

    # Test 2: Post a test tweet (will be deleted immediately)
    print("📋 Test 2: Posting test tweet (will auto-delete)...")
    post_url = "https://api.twitter.com/2/tweets"

    test_tweet = {
        "text": "🧪 TEST POST - FINDERR Beta Campaign Automation Test\n\nThis tweet will be deleted in 5 seconds.\n\n#TestPost #FINDERR #Automation"
    }

    headers = {
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(post_url, auth=auth, headers=headers, json=test_tweet)
        result = response.json()

        if response.status_code == 201 and 'data' in result:
            tweet_id = result['data']['id']
            print(f"✅ Test tweet posted successfully!")
            print(f"   Tweet ID: {tweet_id}")
            print(f"   Text: {test_tweet['text'][:50]}...")
            print()

            # Wait 5 seconds before deleting
            print("⏳ Waiting 5 seconds before deletion...")
            time.sleep(5)

            # Delete the tweet
            print("🗑️  Deleting test tweet...")
            delete_url = f"https://api.twitter.com/2/tweets/{tweet_id}"

            delete_response = requests.delete(delete_url, auth=auth)

            if delete_response.status_code == 200:
                print(f"✅ Test tweet deleted successfully!")
                print()
            else:
                print(f"⚠️  Could not delete tweet (ID: {tweet_id})")
                print(f"   Please delete manually from Twitter")
                print()

            return True
        else:
            print(f"❌ Tweet posting failed:")
            print(f"   Status: {response.status_code}")
            print(f"   Error: {result}")
            print()
            return False

    except Exception as e:
        print(f"❌ Exception occurred: {str(e)}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("  TWITTER/X API TEST - FINDERR Beta Campaign")
    print("=" * 60)
    print()

    success = test_twitter_post()

    print()
    print("=" * 60)
    if success:
        print("  ✅ Twitter posting verified!")
    else:
        print("  ❌ Twitter needs troubleshooting")
    print("=" * 60)
