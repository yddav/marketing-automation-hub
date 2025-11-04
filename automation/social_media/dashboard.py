#!/usr/bin/env python3
"""
FINDERR Beta Campaign - Web Dashboard Preview
Beautiful visual preview of your entire campaign before posting
"""

from flask import Flask, render_template, jsonify
import json
import os
from datetime import datetime, timedelta
from typing import Dict, List

app = Flask(__name__)


class CampaignDashboard:
    """Web dashboard for campaign preview"""

    def __init__(self, config_file: str = "config.json", posts_file: str = None):
        """Initialize dashboard"""
        self.config = self.load_config(config_file)

        if posts_file is None:
            posts_file = self.config.get('campaign', {}).get('posts_file', 'campaign_posts.json')

        self.posts_file = posts_file
        self.posts_data = self.load_posts()
        self.scheduled_posts = self.schedule_posts()

    def load_config(self, config_file: str) -> Dict:
        """Load configuration"""
        if not os.path.exists(config_file):
            return {
                'campaign': {
                    'posts_file': 'campaign_posts.json',
                    'schedule_start_date': '2025-01-15',
                    'posts_per_day': 2,
                    'platforms': ['instagram', 'facebook', 'twitter', 'tiktok']
                }
            }

        with open(config_file, 'r') as f:
            return json.load(f)

    def load_posts(self) -> List[Dict]:
        """Load campaign posts"""
        if not os.path.exists(self.posts_file):
            # Return sample posts for demo
            return [
                {
                    "id": 1,
                    "content": "🔐 Lost your phone? FINDERR can help! Our revolutionary app displays your emergency contact info on your locked screen. Join our beta test today! #PhoneSecurity #FINDERR",
                    "platforms": ["instagram", "facebook", "twitter", "tiktok"],
                    "media": ["images/post1.jpg"],
                    "schedule_days": 0
                },
                {
                    "id": 2,
                    "content": "💡 Beta testers wanted! Get 50% lifetime discount on FINDERR Premium. Help us test the world's first system lockscreen modification app. #BetaTesting #Android",
                    "platforms": ["instagram", "facebook", "twitter"],
                    "media": ["images/post2.jpg"],
                    "schedule_days": 1
                }
            ]

        with open(self.posts_file, 'r') as f:
            return json.load(f)

    def schedule_posts(self) -> List[Dict]:
        """Generate schedule for all posts"""
        start_date_str = self.config.get('campaign', {}).get('schedule_start_date', '2025-01-15')
        start_date = datetime.strptime(start_date_str, '%Y-%m-%d')

        scheduled = []
        for post in self.posts_data:
            schedule_days = post.get('schedule_days', 0)
            post_date = start_date + timedelta(days=schedule_days)

            scheduled.append({
                'post': post,
                'scheduled_for': post_date,
                'status': 'pending'
            })

        return scheduled

    def get_campaign_stats(self) -> Dict:
        """Get campaign statistics"""
        total_posts = len(self.posts_data)

        if total_posts == 0:
            return {
                'total_posts': 0,
                'duration_days': 0,
                'posts_per_day': 0,
                'total_hashtags': 0,
                'total_media': 0,
                'avg_chars': 0,
                'platforms': []
            }

        start_date_str = self.config.get('campaign', {}).get('schedule_start_date', '2025-01-15')
        start_date = datetime.strptime(start_date_str, '%Y-%m-%d')

        max_days = max([p.get('schedule_days', 0) for p in self.posts_data])
        end_date = start_date + timedelta(days=max_days)
        duration_days = max_days + 1

        all_platforms = set()
        total_chars = 0
        total_hashtags = 0
        total_media = 0

        for post in self.posts_data:
            platforms = post.get('platforms', [])
            all_platforms.update(platforms)
            total_chars += len(post['content'])
            total_hashtags += len([w for w in post['content'].split() if w.startswith('#')])
            total_media += len(post.get('media', []))

        return {
            'total_posts': total_posts,
            'start_date': start_date.strftime('%Y-%m-%d'),
            'end_date': end_date.strftime('%Y-%m-%d'),
            'duration_days': duration_days,
            'posts_per_day': round(total_posts / duration_days, 1),
            'total_hashtags': total_hashtags,
            'total_media': total_media,
            'avg_chars': total_chars // total_posts if total_posts > 0 else 0,
            'platforms': sorted(list(all_platforms))
        }

    def get_platform_stats(self) -> Dict:
        """Get platform breakdown"""
        platform_counts = {}
        total_posts = len(self.posts_data)

        for post in self.posts_data:
            platforms = post.get('platforms', [])
            for platform in platforms:
                platform_counts[platform] = platform_counts.get(platform, 0) + 1

        platform_stats = {}
        for platform, count in platform_counts.items():
            percentage = (count / total_posts * 100) if total_posts > 0 else 0
            platform_stats[platform] = {
                'count': count,
                'percentage': round(percentage, 1)
            }

        return platform_stats

    def get_calendar_data(self) -> Dict:
        """Get calendar view data"""
        days_with_posts = {}

        for sp in self.scheduled_posts:
            date_str = sp['scheduled_for'].strftime('%Y-%m-%d')
            if date_str not in days_with_posts:
                days_with_posts[date_str] = []

            days_with_posts[date_str].append({
                'id': sp['post']['id'],
                'content': sp['post']['content'][:60] + '...',
                'platforms': sp['post'].get('platforms', [])
            })

        return days_with_posts

    def get_warnings(self) -> List[Dict]:
        """Get campaign warnings"""
        warnings = []

        # Check Twitter character limits
        twitter_long = [
            p for p in self.posts_data
            if 'twitter' in p.get('platforms', []) and len(p['content']) > 280
        ]
        if twitter_long:
            warnings.append({
                'type': 'warning',
                'icon': '⚠️',
                'message': f"{len(twitter_long)} posts exceed Twitter's 280 character limit",
                'posts': [p['id'] for p in twitter_long]
            })

        # Check missing media
        missing_media = [
            p for p in self.posts_data
            if p.get('media') and len(p['media']) > 0
            and not os.path.exists(p['media'][0])
            and p['media'][0] not in ["path/to/image1.jpg", "path/to/image2.jpg"]
        ]
        if missing_media:
            warnings.append({
                'type': 'error',
                'icon': '❌',
                'message': f"{len(missing_media)} posts reference missing media files",
                'posts': [p['id'] for p in missing_media]
            })

        # Check days without posts
        if self.posts_data:
            max_days = max([p.get('schedule_days', 0) for p in self.posts_data])
            days_with_posts = set([p.get('schedule_days', 0) for p in self.posts_data])
            days_without = [d for d in range(max_days + 1) if d not in days_with_posts]

            if len(days_without) > 5:
                warnings.append({
                    'type': 'info',
                    'icon': 'ℹ️',
                    'message': f"{len(days_without)} days have no scheduled posts",
                    'posts': []
                })

        return warnings


# Initialize dashboard
dashboard = CampaignDashboard()


@app.route('/')
def index():
    """Main dashboard page"""
    return render_template('dashboard.html')


@app.route('/api/stats')
def api_stats():
    """Get campaign statistics"""
    return jsonify({
        'campaign': dashboard.get_campaign_stats(),
        'platforms': dashboard.get_platform_stats(),
        'warnings': dashboard.get_warnings()
    })


@app.route('/api/posts')
def api_posts():
    """Get all scheduled posts"""
    posts = []
    for sp in dashboard.scheduled_posts:
        post = sp['post']
        posts.append({
            'id': post['id'],
            'content': post['content'],
            'platforms': post.get('platforms', []),
            'media': post.get('media', []),
            'scheduled_for': sp['scheduled_for'].strftime('%Y-%m-%d'),
            'scheduled_day': sp['scheduled_for'].strftime('%A'),
            'status': sp['status'],
            'char_count': len(post['content']),
            'hashtags': [w for w in post['content'].split() if w.startswith('#')],
            'has_media': len(post.get('media', [])) > 0,
            'media_exists': all([os.path.exists(m) for m in post.get('media', [])]) if post.get('media') else None
        })

    return jsonify({'posts': posts})


@app.route('/api/calendar')
def api_calendar():
    """Get calendar view data"""
    return jsonify({'calendar': dashboard.get_calendar_data()})


@app.route('/api/post/<int:post_id>')
def api_post_detail(post_id):
    """Get detailed post information"""
    for sp in dashboard.scheduled_posts:
        if sp['post']['id'] == post_id:
            post = sp['post']
            return jsonify({
                'id': post['id'],
                'content': post['content'],
                'platforms': post.get('platforms', []),
                'media': post.get('media', []),
                'scheduled_for': sp['scheduled_for'].strftime('%Y-%m-%d %A'),
                'char_count': len(post['content']),
                'hashtags': [w for w in post['content'].split() if w.startswith('#')],
                'has_twitter_warning': 'twitter' in post.get('platforms', []) and len(post['content']) > 280,
                'media_status': [
                    {
                        'file': m,
                        'exists': os.path.exists(m) if m not in ["path/to/image1.jpg", "path/to/image2.jpg"] else False
                    }
                    for m in post.get('media', [])
                ]
            })

    return jsonify({'error': 'Post not found'}), 404


def main():
    """Start the dashboard server"""
    print("\n🎨 FINDERR Campaign Dashboard")
    print("=" * 80)
    print("\n🚀 Starting web server...")
    print("\n📊 Dashboard URL: http://localhost:5001")
    print("\n💡 Press Ctrl+C to stop the server")
    print("\n" + "=" * 80 + "\n")

    app.run(debug=True, host='0.0.0.0', port=5001)


if __name__ == '__main__':
    main()
