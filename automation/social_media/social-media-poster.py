#!/usr/bin/env python3
"""
FINDERR Beta Campaign Social Media Automation
Lightweight script for posting to Instagram, Facebook, Twitter, TikTok
Memory usage: <100MB | Runs once per day for campaign scheduling
"""

import json
import os
import sys
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import requests


class SocialMediaPoster:
    """Direct API integration for social media posting"""

    def __init__(self, config_file: str = "config.json"):
        """Initialize with configuration file"""
        self.config = self.load_config(config_file)
        self.posts_data = []
        self.scheduled_posts = []

    def load_config(self, config_file: str) -> Dict:
        """Load API credentials and configuration"""
        if not os.path.exists(config_file):
            print(f"❌ Config file not found: {config_file}")
            print("📝 Creating template config.json...")
            self.create_config_template(config_file)
            sys.exit(1)

        with open(config_file, 'r') as f:
            return json.load(f)

    def create_config_template(self, config_file: str):
        """Create template configuration file"""
        template = {
            "meta": {
                "app_id": "738653215879612",
                "app_secret": "be8297b868a6762ad54d4530545428fd",
                "access_token": "YOUR_META_ACCESS_TOKEN_HERE",
                "instagram_account_id": "YOUR_INSTAGRAM_BUSINESS_ACCOUNT_ID",
                "facebook_page_id": "YOUR_FACEBOOK_PAGE_ID"
            },
            "twitter": {
                "api_key": "YOUR_TWITTER_API_KEY",
                "api_secret": "YOUR_TWITTER_API_SECRET",
                "access_token": "YOUR_TWITTER_ACCESS_TOKEN",
                "access_token_secret": "YOUR_TWITTER_ACCESS_TOKEN_SECRET"
            },
            "tiktok": {
                "client_key": "awzpr6gs8tayotje",
                "client_secret": "zMeV70hup8dxHGstbS474TiQLIty5lAf",
                "access_token": "YOUR_TIKTOK_ACCESS_TOKEN"
            },
            "campaign": {
                "posts_file": "campaign_posts.json",
                "schedule_start_date": "2025-01-15",
                "posts_per_day": 2,
                "platforms": ["instagram", "facebook", "twitter", "tiktok"]
            }
        }

        with open(config_file, 'w') as f:
            json.dump(template, f, indent=2)

        print(f"✅ Created template: {config_file}")
        print("📝 Please fill in your API credentials before running again")

    def load_campaign_posts(self):
        """Load campaign posts from JSON file"""
        posts_file = self.config.get('campaign', {}).get('posts_file', 'campaign_posts.json')

        if not os.path.exists(posts_file):
            print(f"❌ Posts file not found: {posts_file}")
            print("📝 Creating template posts file...")
            self.create_posts_template(posts_file)
            sys.exit(1)

        with open(posts_file, 'r') as f:
            self.posts_data = json.load(f)

        print(f"✅ Loaded {len(self.posts_data)} campaign posts")

    def create_posts_template(self, posts_file: str):
        """Create template posts file"""
        template = [
            {
                "id": 1,
                "content": "🔐 Lost your phone? FINDERR can help! Our revolutionary app displays your emergency contact info on your locked screen. Join our beta test today! #PhoneSecurity #FINDERR",
                "platforms": ["instagram", "facebook", "twitter", "tiktok"],
                "media": ["path/to/image1.jpg"],
                "schedule_days": 0
            },
            {
                "id": 2,
                "content": "💡 Beta testers wanted! Get 50% lifetime discount on FINDERR Premium. Help us test the world's first system lockscreen modification app. Link in bio! #BetaTesting #Android",
                "platforms": ["instagram", "facebook", "twitter"],
                "media": ["path/to/image2.jpg"],
                "schedule_days": 1
            }
        ]

        with open(posts_file, 'w') as f:
            json.dump(template, f, indent=2)

        print(f"✅ Created template: {posts_file}")
        print("📝 Add your 45 campaign posts to this file")

    def schedule_posts(self):
        """Generate schedule for all posts"""
        start_date_str = self.config.get('campaign', {}).get('schedule_start_date', '2025-01-15')
        start_date = datetime.strptime(start_date_str, '%Y-%m-%d')

        for post in self.posts_data:
            schedule_days = post.get('schedule_days', 0)
            post_date = start_date + timedelta(days=schedule_days)

            self.scheduled_posts.append({
                'post': post,
                'scheduled_for': post_date,
                'status': 'pending'
            })

        print(f"✅ Scheduled {len(self.scheduled_posts)} posts")

    def post_to_instagram(self, post: Dict) -> bool:
        """Post to Instagram using Meta Graph API"""
        try:
            access_token = self.config['meta']['access_token']
            account_id = self.config['meta']['instagram_account_id']

            # Step 1: Create media container
            url = f"https://graph.facebook.com/v21.0/{account_id}/media"
            params = {
                'access_token': access_token,
                'caption': post['content']
            }

            # Add media if available
            if post.get('media') and len(post['media']) > 0:
                params['image_url'] = post['media'][0]

            response = requests.post(url, params=params)

            if response.status_code != 200:
                print(f"❌ Instagram media creation failed: {response.text}")
                return False

            container_id = response.json().get('id')

            # Step 2: Publish media
            publish_url = f"https://graph.facebook.com/v21.0/{account_id}/media_publish"
            publish_params = {
                'access_token': access_token,
                'creation_id': container_id
            }

            publish_response = requests.post(publish_url, params=publish_params)

            if publish_response.status_code == 200:
                print(f"✅ Posted to Instagram: {post['id']}")
                return True
            else:
                print(f"❌ Instagram publish failed: {publish_response.text}")
                return False

        except Exception as e:
            print(f"❌ Instagram error: {str(e)}")
            return False

    def post_to_facebook(self, post: Dict) -> bool:
        """Post to Facebook Page using Meta Graph API"""
        try:
            access_token = self.config['meta']['access_token']
            page_id = self.config['meta']['facebook_page_id']

            url = f"https://graph.facebook.com/v21.0/{page_id}/feed"
            params = {
                'access_token': access_token,
                'message': post['content']
            }

            # Add media if available
            if post.get('media') and len(post['media']) > 0:
                params['url'] = post['media'][0]

            response = requests.post(url, params=params)

            if response.status_code == 200:
                print(f"✅ Posted to Facebook: {post['id']}")
                return True
            else:
                print(f"❌ Facebook post failed: {response.text}")
                return False

        except Exception as e:
            print(f"❌ Facebook error: {str(e)}")
            return False

    def post_to_twitter(self, post: Dict) -> bool:
        """Post to Twitter using Twitter API v2"""
        try:
            # Note: Requires tweepy or requests-oauthlib for OAuth 1.0a
            print(f"⚠️  Twitter posting requires OAuth 1.0a library (tweepy)")
            print(f"📝 Install: pip install tweepy")

            try:
                import tweepy

                auth = tweepy.OAuthHandler(
                    self.config['twitter']['api_key'],
                    self.config['twitter']['api_secret']
                )
                auth.set_access_token(
                    self.config['twitter']['access_token'],
                    self.config['twitter']['access_token_secret']
                )

                api = tweepy.API(auth)

                # Post tweet
                if post.get('media') and len(post['media']) > 0:
                    media = api.media_upload(post['media'][0])
                    api.update_status(status=post['content'], media_ids=[media.media_id])
                else:
                    api.update_status(status=post['content'])

                print(f"✅ Posted to Twitter: {post['id']}")
                return True

            except ImportError:
                print(f"⏭️  Skipping Twitter (tweepy not installed)")
                return False

        except Exception as e:
            print(f"❌ Twitter error: {str(e)}")
            return False

    def post_to_tiktok(self, post: Dict) -> bool:
        """Post to TikTok using TikTok API"""
        try:
            access_token = self.config['tiktok']['access_token']

            # TikTok requires video upload - placeholder for now
            print(f"⚠️  TikTok posting requires video content")
            print(f"📝 Use TikTok Creative Center for manual scheduling")

            # Future: Implement TikTok video upload API
            # https://developers.tiktok.com/doc/content-posting-api-get-started

            return False

        except Exception as e:
            print(f"❌ TikTok error: {str(e)}")
            return False

    def post_today(self):
        """Post all content scheduled for today"""
        today = datetime.now().date()

        posts_for_today = [
            sp for sp in self.scheduled_posts
            if sp['scheduled_for'].date() == today and sp['status'] == 'pending'
        ]

        if not posts_for_today:
            print(f"📅 No posts scheduled for {today}")
            return

        print(f"\n📤 Posting {len(posts_for_today)} items scheduled for {today}:")

        for scheduled_post in posts_for_today:
            post = scheduled_post['post']
            platforms = post.get('platforms', [])

            print(f"\n📝 Post {post['id']}: {post['content'][:50]}...")

            results = {}

            if 'instagram' in platforms:
                results['instagram'] = self.post_to_instagram(post)

            if 'facebook' in platforms:
                results['facebook'] = self.post_to_facebook(post)

            if 'twitter' in platforms:
                results['twitter'] = self.post_to_twitter(post)

            if 'tiktok' in platforms:
                results['tiktok'] = self.post_to_tiktok(post)

            # Update status
            if any(results.values()):
                scheduled_post['status'] = 'posted'
                print(f"✅ Post {post['id']} completed")
            else:
                print(f"⚠️  Post {post['id']} had issues")

    def show_schedule(self):
        """Display upcoming schedule"""
        print("\n📅 Campaign Schedule:")
        print("=" * 80)

        for scheduled_post in self.scheduled_posts[:10]:  # Show next 10
            post = scheduled_post['post']
            date = scheduled_post['scheduled_for'].strftime('%Y-%m-%d')
            status = scheduled_post['status']
            platforms = ', '.join(post.get('platforms', []))

            print(f"{date} | Post {post['id']} | {platforms} | {status}")
            print(f"  └─ {post['content'][:60]}...")

        if len(self.scheduled_posts) > 10:
            print(f"\n... and {len(self.scheduled_posts) - 10} more posts")

    def preview_post(self, post: Dict):
        """Preview a single post with detailed formatting"""
        print("\n" + "=" * 100)
        print(f"📋 POST #{post['id']}")
        print("=" * 100)

        # Content
        print(f"\n📝 Content ({len(post['content'])} characters):")
        print("-" * 100)
        print(post['content'])
        print("-" * 100)

        # Platforms
        platforms = post.get('platforms', [])
        print(f"\n🌐 Platforms ({len(platforms)}):")
        platform_emojis = {
            'instagram': '📸 Instagram',
            'facebook': '👥 Facebook',
            'twitter': '🐦 Twitter',
            'tiktok': '🎵 TikTok'
        }
        for platform in platforms:
            status = platform_emojis.get(platform, f"❓ {platform}")
            print(f"  • {status}")

        # Character count warnings
        if 'twitter' in platforms and len(post['content']) > 280:
            print(f"\n⚠️  WARNING: Content is {len(post['content'])} characters (Twitter limit: 280)")

        # Media
        media = post.get('media', [])
        if media:
            print(f"\n🖼️  Media ({len(media)} files):")
            for i, media_file in enumerate(media, 1):
                exists = os.path.exists(media_file) if media_file != "path/to/image1.jpg" else False
                status_icon = "✅" if exists else "❌"
                print(f"  {status_icon} {i}. {media_file}")
        else:
            print("\n🖼️  Media: None")

        # Hashtags analysis
        hashtags = [word for word in post['content'].split() if word.startswith('#')]
        if hashtags:
            print(f"\n🏷️  Hashtags ({len(hashtags)}):")
            print(f"  {', '.join(hashtags)}")

        # Schedule
        schedule_days = post.get('schedule_days', 0)
        start_date_str = self.config.get('campaign', {}).get('schedule_start_date', '2025-01-15')
        start_date = datetime.strptime(start_date_str, '%Y-%m-%d')
        post_date = start_date + timedelta(days=schedule_days)
        print(f"\n📅 Scheduled: Day {schedule_days} ({post_date.strftime('%Y-%m-%d, %A')})")

        print("\n" + "=" * 100)

    def preview_today(self):
        """Preview all posts scheduled for today"""
        today = datetime.now().date()

        posts_for_today = [
            sp for sp in self.scheduled_posts
            if sp['scheduled_for'].date() == today
        ]

        if not posts_for_today:
            print(f"\n📅 No posts scheduled for {today}")
            return

        print(f"\n🔍 PREVIEW: {len(posts_for_today)} post(s) scheduled for {today}")

        for scheduled_post in posts_for_today:
            self.preview_post(scheduled_post['post'])

        # Summary
        print("\n" + "=" * 100)
        print("📊 SUMMARY")
        print("=" * 100)

        total_posts = len(posts_for_today)
        all_platforms = set()
        total_chars = 0
        media_count = 0

        for sp in posts_for_today:
            post = sp['post']
            all_platforms.update(post.get('platforms', []))
            total_chars += len(post['content'])
            media_count += len(post.get('media', []))

        print(f"Total Posts: {total_posts}")
        print(f"Platforms: {', '.join(sorted(all_platforms))}")
        print(f"Average Characters: {total_chars // total_posts if total_posts > 0 else 0}")
        print(f"Total Media Files: {media_count}")
        print("=" * 100)

    def preview_all(self):
        """Preview entire campaign"""
        print("\n🔍 FULL CAMPAIGN PREVIEW")
        print("=" * 100)

        # Campaign stats
        total_posts = len(self.posts_data)
        start_date_str = self.config.get('campaign', {}).get('schedule_start_date', '2025-01-15')
        start_date = datetime.strptime(start_date_str, '%Y-%m-%d')

        # Calculate end date
        max_days = max([p.get('schedule_days', 0) for p in self.posts_data])
        end_date = start_date + timedelta(days=max_days)
        duration_days = max_days + 1

        # Gather statistics
        all_platforms = set()
        total_chars = 0
        total_hashtags = 0
        total_media = 0
        platform_counts = {}

        for post in self.posts_data:
            platforms = post.get('platforms', [])
            all_platforms.update(platforms)
            total_chars += len(post['content'])
            total_hashtags += len([w for w in post['content'].split() if w.startswith('#')])
            total_media += len(post.get('media', []))

            for platform in platforms:
                platform_counts[platform] = platform_counts.get(platform, 0) + 1

        # Campaign overview
        print("\n📊 CAMPAIGN OVERVIEW")
        print("-" * 100)
        print(f"Campaign Duration: {start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')} ({duration_days} days)")
        print(f"Total Posts: {total_posts}")
        print(f"Posts per Day (avg): {total_posts / duration_days:.1f}")
        print(f"Platforms: {', '.join(sorted(all_platforms))}")
        print(f"Average Characters: {total_chars // total_posts if total_posts > 0 else 0}")
        print(f"Total Hashtags: {total_hashtags}")
        print(f"Total Media Files: {total_media}")

        # Platform breakdown
        print("\n🌐 PLATFORM BREAKDOWN")
        print("-" * 100)
        platform_emojis = {
            'instagram': '📸',
            'facebook': '👥',
            'twitter': '🐦',
            'tiktok': '🎵'
        }
        for platform in sorted(all_platforms):
            count = platform_counts.get(platform, 0)
            emoji = platform_emojis.get(platform, '❓')
            percentage = (count / total_posts * 100) if total_posts > 0 else 0
            print(f"{emoji} {platform.capitalize()}: {count} posts ({percentage:.1f}%)")

        # Daily breakdown
        print("\n📅 DAILY BREAKDOWN")
        print("-" * 100)

        days_with_posts = {}
        for post in self.posts_data:
            day = post.get('schedule_days', 0)
            if day not in days_with_posts:
                days_with_posts[day] = []
            days_with_posts[day].append(post)

        for day in sorted(days_with_posts.keys())[:10]:  # Show first 10 days
            post_date = start_date + timedelta(days=day)
            posts = days_with_posts[day]
            print(f"\nDay {day} ({post_date.strftime('%Y-%m-%d, %A')}) - {len(posts)} post(s):")
            for post in posts:
                platforms = ', '.join(post.get('platforms', []))
                print(f"  • Post #{post['id']}: {post['content'][:60]}... [{platforms}]")

        if len(days_with_posts) > 10:
            print(f"\n... and {len(days_with_posts) - 10} more days")

        # Warnings
        warnings = []

        # Check for Twitter length violations
        twitter_long = [p for p in self.posts_data if 'twitter' in p.get('platforms', []) and len(p['content']) > 280]
        if twitter_long:
            warnings.append(f"⚠️  {len(twitter_long)} posts exceed Twitter's 280 character limit")

        # Check for missing media
        missing_media = [p for p in self.posts_data if p.get('media') and not os.path.exists(p['media'][0]) and p['media'][0] != "path/to/image1.jpg"]
        if missing_media:
            warnings.append(f"⚠️  {len(missing_media)} posts reference missing media files")

        # Check for days without posts
        days_without_posts = [d for d in range(duration_days) if d not in days_with_posts]
        if days_without_posts:
            warnings.append(f"⚠️  {len(days_without_posts)} days have no scheduled posts")

        if warnings:
            print("\n⚠️  WARNINGS")
            print("-" * 100)
            for warning in warnings:
                print(warning)

        print("\n" + "=" * 100)
        print(f"\n✅ Campaign preview complete. Ready to launch? Run: python social-media-poster.py post")
        print("=" * 100)

    def run(self, mode: str = 'post'):
        """Main execution"""
        print("\n🚀 FINDERR Beta Campaign Automation")
        print("=" * 80)

        # Load data
        self.load_campaign_posts()
        self.schedule_posts()

        if mode == 'schedule':
            self.show_schedule()
        elif mode == 'post':
            self.post_today()
        elif mode == 'preview-today':
            self.preview_today()
        elif mode == 'preview-all':
            self.preview_all()
        else:
            print(f"❌ Unknown mode: {mode}")
            print("📝 Usage: python social-media-poster.py [post|schedule|preview-today|preview-all]")


def main():
    """Entry point"""
    mode = sys.argv[1] if len(sys.argv) > 1 else 'post'

    poster = SocialMediaPoster()
    poster.run(mode)


if __name__ == '__main__':
    main()
