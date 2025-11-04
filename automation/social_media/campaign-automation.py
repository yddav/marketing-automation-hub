#!/usr/bin/env python3
"""
FINDERR Beta Campaign - Multi-Platform Social Media Automation

Automated posting to Facebook, Instagram, and Twitter
Campaign: 30 days, 180 posts total
- Facebook: 30 posts (1/day)
- Instagram: 60 posts (2/day)
- Twitter: 90 posts (3/day)

Author: UNTRAPD Team
Created: 2025-10-31
Status: Ready for campaign launch
"""

import os
import json
import time
import requests
from datetime import datetime, timedelta
from dotenv import load_dotenv
from requests_oauthlib import OAuth1

# Load environment variables
load_dotenv()

class SocialMediaCampaign:
    """Multi-platform social media campaign automation"""

    def __init__(self):
        """Initialize campaign with API credentials"""
        # Facebook credentials
        self.facebook_page_token = os.getenv('FACEBOOK_PAGE_TOKEN')
        self.facebook_page_id = os.getenv('FACEBOOK_PAGE_ID')

        # Instagram credentials
        self.instagram_access_token = os.getenv('INSTAGRAM_ACCESS_TOKEN')
        self.instagram_account_id = os.getenv('INSTAGRAM_BUSINESS_ACCOUNT_ID')

        # Twitter credentials
        self.twitter_auth = OAuth1(
            os.getenv('TWITTER_API_KEY'),
            os.getenv('TWITTER_API_SECRET'),
            os.getenv('TWITTER_ACCESS_TOKEN'),
            os.getenv('TWITTER_ACCESS_TOKEN_SECRET')
        )

        # API endpoints
        self.facebook_api_version = 'v18.0'
        self.twitter_api_version = '2'

        # Campaign data
        self.campaign_data = self.load_campaign_data()

        # Posting state (track what's been posted)
        self.state_file = 'campaign_state.json'
        self.state = self.load_state()

    def load_campaign_data(self):
        """Load campaign posts from metadata file"""
        try:
            with open('campaign_posts.json', 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            print("❌ campaign_posts.json not found")
            print("📝 Create this file with your campaign content")
            return {"facebook": [], "instagram": [], "twitter": []}

    def load_state(self):
        """Load posting state from file"""
        if os.path.exists(self.state_file):
            with open(self.state_file, 'r') as f:
                return json.load(f)
        return {
            "last_run": None,
            "facebook_posted": [],
            "instagram_posted": [],
            "twitter_posted": [],
            "errors": []
        }

    def save_state(self):
        """Save posting state to file"""
        self.state['last_run'] = datetime.now().isoformat()
        with open(self.state_file, 'w') as f:
            json.dump(self.state, f, indent=2)

    # ========== FACEBOOK POSTING ==========

    def post_to_facebook(self, post_data):
        """
        Post to Facebook Page

        Args:
            post_data (dict): {
                "message": "Post text content",
                "link": "Optional URL to share",
                "image_url": "Optional image URL"
            }

        Returns:
            dict: Response with post ID or error
        """
        url = f"https://graph.facebook.com/{self.facebook_api_version}/{self.facebook_page_id}/feed"

        payload = {
            "message": post_data['message'],
            "access_token": self.facebook_page_token
        }

        # Add optional link
        if 'link' in post_data and post_data['link']:
            payload['link'] = post_data['link']

        # Add optional image (use photos endpoint instead)
        if 'image_url' in post_data and post_data['image_url']:
            url = f"https://graph.facebook.com/{self.facebook_api_version}/{self.facebook_page_id}/photos"
            payload['url'] = post_data['image_url']
            payload['caption'] = post_data['message']
            del payload['message']

        try:
            response = requests.post(url, data=payload)
            response.raise_for_status()

            result = response.json()
            post_id = result.get('id') or result.get('post_id')

            print(f"✅ Facebook: Posted successfully (ID: {post_id})")
            return {"success": True, "post_id": post_id, "platform": "facebook"}

        except requests.exceptions.RequestException as e:
            error_msg = f"Facebook API error: {str(e)}"
            if response.text:
                error_msg += f" - {response.text}"
            print(f"❌ Facebook: {error_msg}")
            return {"success": False, "error": error_msg, "platform": "facebook"}

    # ========== INSTAGRAM POSTING ==========

    def post_to_instagram(self, post_data):
        """
        Post to Instagram (two-step process)

        Args:
            post_data (dict): {
                "image_url": "Public HTTPS image URL (required)",
                "caption": "Post caption with hashtags"
            }

        Returns:
            dict: Response with post ID or error
        """
        if 'image_url' not in post_data:
            return {"success": False, "error": "image_url is required", "platform": "instagram"}

        # Step 1: Create media container
        create_url = f"https://graph.facebook.com/{self.facebook_api_version}/{self.instagram_account_id}/media"
        create_payload = {
            "image_url": post_data['image_url'],
            "caption": post_data.get('caption', ''),
            "access_token": self.instagram_access_token
        }

        try:
            # Create container
            create_response = requests.post(create_url, data=create_payload)
            create_response.raise_for_status()
            media_id = create_response.json()['id']

            print(f"🔄 Instagram: Media container created (ID: {media_id})")

            # Wait for media to be processed (Instagram requirement)
            time.sleep(5)

            # Step 2: Publish media container
            publish_url = f"https://graph.facebook.com/{self.facebook_api_version}/{self.instagram_account_id}/media_publish"
            publish_payload = {
                "creation_id": media_id,
                "access_token": self.instagram_access_token
            }

            publish_response = requests.post(publish_url, data=publish_payload)
            publish_response.raise_for_status()
            post_id = publish_response.json()['id']

            print(f"✅ Instagram: Posted successfully (ID: {post_id})")
            return {"success": True, "post_id": post_id, "platform": "instagram"}

        except requests.exceptions.RequestException as e:
            error_msg = f"Instagram API error: {str(e)}"
            if 'create_response' in locals() and create_response.text:
                error_msg += f" - Create: {create_response.text}"
            if 'publish_response' in locals() and publish_response.text:
                error_msg += f" - Publish: {publish_response.text}"
            print(f"❌ Instagram: {error_msg}")
            return {"success": False, "error": error_msg, "platform": "instagram"}

    # ========== TWITTER POSTING ==========

    def post_to_twitter(self, post_data):
        """
        Post to Twitter (X)

        Args:
            post_data (dict): {
                "text": "Tweet text (max 280 chars)",
                "image_url": "Optional image URL (must download and upload)"
            }

        Returns:
            dict: Response with tweet ID or error
        """
        url = "https://api.twitter.com/2/tweets"

        payload = {
            "text": post_data['text']
        }

        # Twitter requires media upload via separate endpoint
        # For now, text-only posting
        # TODO: Implement media upload for images

        try:
            response = requests.post(url, json=payload, auth=self.twitter_auth)
            response.raise_for_status()

            result = response.json()
            tweet_id = result['data']['id']

            print(f"✅ Twitter: Posted successfully (ID: {tweet_id})")
            return {"success": True, "post_id": tweet_id, "platform": "twitter"}

        except requests.exceptions.RequestException as e:
            error_msg = f"Twitter API error: {str(e)}"
            if response.text:
                error_msg += f" - {response.text}"
            print(f"❌ Twitter: {error_msg}")
            return {"success": False, "error": error_msg, "platform": "twitter"}

    # ========== CAMPAIGN EXECUTION ==========

    def get_scheduled_posts(self, platform):
        """Get posts scheduled for today"""
        today = datetime.now().date()
        scheduled = []

        for post in self.campaign_data.get(platform, []):
            if 'schedule' not in post:
                continue

            post_date = datetime.fromisoformat(post['schedule']).date()
            post_id = post.get('id', post.get('filename', ''))

            # Check if post is scheduled for today and not already posted
            if post_date == today and post_id not in self.state[f'{platform}_posted']:
                scheduled.append(post)

        return scheduled

    def run_daily_campaign(self):
        """Execute today's scheduled posts"""
        print(f"\n🚀 Running FINDERR Beta Campaign - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

        results = {
            "facebook": [],
            "instagram": [],
            "twitter": []
        }

        # Post to Facebook
        facebook_posts = self.get_scheduled_posts('facebook')
        print(f"📘 Facebook: {len(facebook_posts)} posts scheduled for today")
        for post in facebook_posts:
            result = self.post_to_facebook(post)
            results['facebook'].append(result)
            if result['success']:
                self.state['facebook_posted'].append(post.get('id', post.get('filename')))
            else:
                self.state['errors'].append({
                    "timestamp": datetime.now().isoformat(),
                    "platform": "facebook",
                    "post_id": post.get('id'),
                    "error": result['error']
                })
            time.sleep(2)  # Rate limiting

        # Post to Instagram
        instagram_posts = self.get_scheduled_posts('instagram')
        print(f"\n📸 Instagram: {len(instagram_posts)} posts scheduled for today")
        for post in instagram_posts:
            result = self.post_to_instagram(post)
            results['instagram'].append(result)
            if result['success']:
                self.state['instagram_posted'].append(post.get('id', post.get('filename')))
            else:
                self.state['errors'].append({
                    "timestamp": datetime.now().isoformat(),
                    "platform": "instagram",
                    "post_id": post.get('id'),
                    "error": result['error']
                })
            time.sleep(10)  # Instagram requires longer wait between posts

        # Post to Twitter
        twitter_posts = self.get_scheduled_posts('twitter')
        print(f"\n🐦 Twitter: {len(twitter_posts)} posts scheduled for today")
        for post in twitter_posts:
            result = self.post_to_twitter(post)
            results['twitter'].append(result)
            if result['success']:
                self.state['twitter_posted'].append(post.get('id', post.get('text'[:20])))
            else:
                self.state['errors'].append({
                    "timestamp": datetime.now().isoformat(),
                    "platform": "twitter",
                    "post_id": post.get('id'),
                    "error": result['error']
                })
            time.sleep(2)  # Rate limiting

        # Save state
        self.save_state()

        # Summary
        print(f"\n{'='*60}")
        print("📊 Campaign Summary")
        print(f"{'='*60}")
        print(f"Facebook: {sum(1 for r in results['facebook'] if r['success'])}/{len(results['facebook'])} successful")
        print(f"Instagram: {sum(1 for r in results['instagram'] if r['success'])}/{len(results['instagram'])} successful")
        print(f"Twitter: {sum(1 for r in results['twitter'] if r['success'])}/{len(results['twitter'])} successful")

        total_attempted = len(results['facebook']) + len(results['instagram']) + len(results['twitter'])
        total_successful = sum(1 for platform in results.values() for r in platform if r['success'])
        print(f"\nTotal: {total_successful}/{total_attempted} posts successful")

        if len(self.state['errors']) > 0:
            print(f"\n⚠️  {len(self.state['errors'])} errors logged (see campaign_state.json)")

        print(f"{'='*60}\n")

        return results

    def test_all_platforms(self):
        """Test posting to all platforms"""
        print("🧪 Testing all platforms...\n")

        # Test Facebook
        print("Testing Facebook...")
        fb_result = self.post_to_facebook({
            "message": "🧪 Test post from FINDERR campaign automation.\n\nThis is a test of the automated posting system. If you see this, the Facebook integration is working! 🚀"
        })

        # Test Instagram (requires hosted image)
        print("\nTesting Instagram...")
        ig_result = self.post_to_instagram({
            "image_url": "https://via.placeholder.com/1080x1080/1a1a2e/33FF57?text=FINDERR+Test",
            "caption": "🧪 Test post from FINDERR campaign automation.\n\nThis is a test of the automated posting system.\n\n#FINDERR #BetaTesting"
        })

        # Test Twitter
        print("\nTesting Twitter...")
        tw_result = self.post_to_twitter({
            "text": "🧪 Test tweet from FINDERR campaign automation. If you see this, the Twitter integration is working! 🚀"
        })

        # Summary
        print(f"\n{'='*60}")
        print("🧪 Test Summary")
        print(f"{'='*60}")
        print(f"Facebook: {'✅ PASS' if fb_result['success'] else '❌ FAIL'}")
        print(f"Instagram: {'✅ PASS' if ig_result['success'] else '❌ FAIL'}")
        print(f"Twitter: {'✅ PASS' if tw_result['success'] else '❌ FAIL'}")
        print(f"{'='*60}\n")

        return {
            "facebook": fb_result,
            "instagram": ig_result,
            "twitter": tw_result
        }


def main():
    """Main execution"""
    import sys

    campaign = SocialMediaCampaign()

    if len(sys.argv) > 1:
        command = sys.argv[1]

        if command == "test":
            # Test mode
            campaign.test_all_platforms()
        elif command == "run":
            # Run today's campaign
            campaign.run_daily_campaign()
        elif command == "status":
            # Show campaign status
            print(f"\n📊 Campaign Status\n{'='*60}")
            print(f"Facebook posts: {len(campaign.state['facebook_posted'])}")
            print(f"Instagram posts: {len(campaign.state['instagram_posted'])}")
            print(f"Twitter posts: {len(campaign.state['twitter_posted'])}")
            print(f"Total errors: {len(campaign.state['errors'])}")
            if campaign.state['last_run']:
                print(f"Last run: {campaign.state['last_run']}")
            print(f"{'='*60}\n")
        else:
            print(f"❌ Unknown command: {command}")
            print("\nUsage:")
            print("  python campaign-automation.py test     # Test all platforms")
            print("  python campaign-automation.py run      # Run today's posts")
            print("  python campaign-automation.py status   # Show campaign status")
    else:
        print("FINDERR Beta Campaign Automation")
        print("="*60)
        print("\nUsage:")
        print("  python campaign-automation.py test     # Test all platforms")
        print("  python campaign-automation.py run      # Run today's posts")
        print("  python campaign-automation.py status   # Show campaign status")
        print("\nSchedule with cron:")
        print('  0 10,18 * * * cd /path/to/automation && python campaign-automation.py run')
        print("  (Runs at 10:00 AM and 6:00 PM daily)")


if __name__ == "__main__":
    main()
