#!/usr/bin/env python3
"""
Phase 2 Testing Script
Custom Social Media Automation Platform
"""

import sys
import os
from datetime import datetime, timedelta

# Add current directory to path
sys.path.insert(0, os.path.dirname(__file__))

from models import db
from platform_apis import post_to_platforms

def test_database():
    """Test database operations"""
    print("=" * 50)
    print("Testing Database Operations")
    print("=" * 50)

    # Create test post
    print("\n1. Creating test post...")
    post_id = db.create_post(
        text="Test post for Phase 2 validation #TestPost",
        platforms=['twitter', 'facebook'],
        scheduled_date=(datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d'),
        scheduled_time='14:00',
        status='scheduled'
    )
    print(f"✅ Created post with ID: {post_id}")

    # Get post
    print("\n2. Retrieving post...")
    post = db.get_post(post_id)
    if post:
        print(f"✅ Retrieved post: {post['text'][:50]}...")
    else:
        print("❌ Failed to retrieve post")
        return False

    # Update post
    print("\n3. Updating post...")
    db.update_post(post_id, text="Updated test post #TestPost")
    updated_post = db.get_post(post_id)
    if updated_post and "Updated" in updated_post['text']:
        print("✅ Post updated successfully")
    else:
        print("❌ Failed to update post")

    # Get all posts
    print("\n4. Getting all posts...")
    all_posts = db.get_all_posts()
    print(f"✅ Found {len(all_posts)} posts in database")

    # Get scheduled posts
    print("\n5. Getting scheduled posts...")
    scheduled_posts = db.get_scheduled_posts()
    print(f"✅ Found {len(scheduled_posts)} scheduled posts")

    # Get stats
    print("\n6. Getting statistics...")
    stats = db.get_stats()
    print(f"✅ Stats: {stats}")

    # Cleanup
    print("\n7. Cleaning up test post...")
    db.delete_post(post_id)
    print("✅ Test post deleted")

    return True

def test_platform_apis():
    """Test platform API functions"""
    print("\n" + "=" * 50)
    print("Testing Platform APIs (Placeholder Mode)")
    print("=" * 50)

    test_text = "Test post from Custom Social Automation Platform #Test"
    test_image = "https://example.com/test.jpg"

    platforms = ['twitter', 'facebook', 'instagram', 'tiktok', 'pinterest']

    print(f"\n📝 Test content: {test_text}")
    print(f"📷 Test image: {test_image}")
    print(f"🎯 Target platforms: {', '.join(platforms)}")

    print("\nPosting to platforms...")
    results = post_to_platforms(test_text, test_image, platforms)

    print("\nResults:")
    for platform, result in results.items():
        if result['success']:
            print(f"✅ {platform.capitalize()}: SUCCESS - {result.get('post_id', 'N/A')}")
        else:
            print(f"❌ {platform.capitalize()}: FAILED - {result.get('error', 'Unknown error')}")

    all_success = all(r['success'] for r in results.values())
    return all_success

def test_scheduler_import():
    """Test scheduler module import"""
    print("\n" + "=" * 50)
    print("Testing Scheduler Module")
    print("=" * 50)

    try:
        from scheduler import scheduler
        print("✅ Scheduler module imported successfully")
        print(f"✅ Scheduler running: {scheduler.scheduler.running}")
        return True
    except Exception as e:
        print(f"❌ Failed to import scheduler: {str(e)}")
        return False

def test_flask_app():
    """Test Flask app configuration"""
    print("\n" + "=" * 50)
    print("Testing Flask Application")
    print("=" * 50)

    try:
        from app import app
        print("✅ Flask app imported successfully")
        print(f"✅ Secret key configured: {'Yes' if app.config['SECRET_KEY'] else 'No'}")
        print(f"✅ Upload folder: {app.config['UPLOAD_FOLDER']}")

        # Test routes
        routes = [rule.rule for rule in app.url_map.iter_rules() if rule.endpoint != 'static']
        print(f"✅ Found {len(routes)} routes:")
        for route in sorted(routes)[:10]:
            print(f"   - {route}")
        if len(routes) > 10:
            print(f"   ... and {len(routes) - 10} more")

        return True
    except Exception as e:
        print(f"❌ Failed to test Flask app: {str(e)}")
        return False

def main():
    """Run all tests"""
    print("\n🚀 PHASE 2 TESTING - Custom Social Automation Platform")
    print("=" * 50)

    results = {
        'Database Operations': test_database(),
        'Platform APIs': test_platform_apis(),
        'Scheduler Module': test_scheduler_import(),
        'Flask Application': test_flask_app()
    }

    print("\n" + "=" * 50)
    print("TEST SUMMARY")
    print("=" * 50)

    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name}: {status}")

    all_passed = all(results.values())

    print("\n" + "=" * 50)
    if all_passed:
        print("✅ ALL TESTS PASSED!")
        print("\n🎉 Phase 2 is ready for user testing!")
        print("\nNext steps:")
        print("1. Run: python app.py")
        print("2. Visit: http://localhost:5001/calendar")
        print("3. Test drag-drop scheduling")
        print("4. Import FINDERR campaign data")
        print("5. Provide feedback for refinement")
    else:
        print("❌ SOME TESTS FAILED")
        print("\nPlease review the errors above.")

    print("=" * 50)

    return 0 if all_passed else 1

if __name__ == '__main__':
    sys.exit(main())
