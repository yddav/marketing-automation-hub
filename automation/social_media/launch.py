#!/usr/bin/env python3
"""
UNTRAPD Social Media Automation - Master Launcher
==================================================
Single entry point for all social media automation operations.
Designed for phone-friendly operation via SSH or local network.

Usage:
    python3 launch.py                    # Interactive menu
    python3 launch.py status             # Quick status check
    python3 launch.py refresh            # Start OAuth refresh server
    python3 launch.py post <platform>    # Post to specific platform
    python3 launch.py campaign           # Launch full campaign
    python3 launch.py test               # Test all platforms
"""

import os
import sys
import json
import subprocess
from pathlib import Path
from datetime import datetime
from dotenv import load_dotenv

# Setup
SCRIPT_DIR = Path(__file__).parent
ENV_PATH = SCRIPT_DIR / '.env'
load_dotenv(ENV_PATH)

# Colors for terminal
class C:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    BOLD = '\033[1m'
    END = '\033[0m'

def status_icon(status):
    """Return emoji for status"""
    icons = {
        'valid': '✅',
        'expired': '❌',
        'missing': '⚠️',
        'error': '💥',
        'unknown': '❓'
    }
    return icons.get(status, '❓')

def check_platform_status():
    """Quick status check for all platforms"""
    import requests

    results = {}

    # Twitter - OAuth 1.0a (doesn't expire)
    twitter_token = os.getenv('TWITTER_ACCESS_TOKEN', '')
    if twitter_token:
        results['twitter'] = {'status': 'valid', 'note': 'OAuth 1.0a (no expiry)'}
    else:
        results['twitter'] = {'status': 'missing', 'note': 'No token'}

    # Facebook
    fb_token = os.getenv('FACEBOOK_PAGE_TOKEN', '')
    if fb_token:
        try:
            r = requests.get(f'https://graph.facebook.com/v21.0/me?access_token={fb_token}', timeout=5)
            if r.status_code == 200:
                results['facebook'] = {'status': 'valid', 'note': r.json().get('name', 'Connected')}
            else:
                results['facebook'] = {'status': 'expired', 'note': 'Token expired'}
        except:
            results['facebook'] = {'status': 'error', 'note': 'Connection error'}
    else:
        results['facebook'] = {'status': 'missing', 'note': 'No token'}

    # Instagram (same token as Facebook)
    ig_token = os.getenv('INSTAGRAM_ACCESS_TOKEN', '')
    ig_id = os.getenv('INSTAGRAM_BUSINESS_ACCOUNT_ID', '')
    if ig_token and ig_id:
        try:
            r = requests.get(f'https://graph.facebook.com/v21.0/{ig_id}?fields=username&access_token={ig_token}', timeout=5)
            if r.status_code == 200:
                results['instagram'] = {'status': 'valid', 'note': f"@{r.json().get('username', 'Connected')}"}
            else:
                results['instagram'] = {'status': 'expired', 'note': 'Token expired'}
        except:
            results['instagram'] = {'status': 'error', 'note': 'Connection error'}
    else:
        results['instagram'] = {'status': 'missing', 'note': 'No token'}

    # Pinterest
    pin_token = os.getenv('PINTEREST_ACCESS_TOKEN', '')
    if pin_token:
        try:
            r = requests.get('https://api.pinterest.com/v5/user_account',
                           headers={'Authorization': f'Bearer {pin_token}'}, timeout=5)
            if r.status_code == 200:
                results['pinterest'] = {'status': 'valid', 'note': r.json().get('username', 'Connected')}
            else:
                results['pinterest'] = {'status': 'expired', 'note': 'Token expired'}
        except:
            results['pinterest'] = {'status': 'error', 'note': 'Connection error'}
    else:
        results['pinterest'] = {'status': 'missing', 'note': 'No token'}

    # TikTok
    tiktok_token = os.getenv('TIKTOK_ACCESS_TOKEN', '')
    if tiktok_token:
        results['tiktok'] = {'status': 'valid', 'note': 'Token configured'}  # Can't verify without API call
    else:
        results['tiktok'] = {'status': 'missing', 'note': 'No access token'}

    return results

def print_status():
    """Print formatted status"""
    print(f"\n{C.BOLD}📊 UNTRAPD Social Media Status{C.END}")
    print("─" * 45)

    results = check_platform_status()

    platforms = [
        ('🐦', 'Twitter', 'twitter'),
        ('📘', 'Facebook', 'facebook'),
        ('📸', 'Instagram', 'instagram'),
        ('📌', 'Pinterest', 'pinterest'),
        ('🎵', 'TikTok', 'tiktok'),
    ]

    valid_count = 0
    for emoji, name, key in platforms:
        data = results.get(key, {})
        status = data.get('status', 'unknown')
        note = data.get('note', '')
        icon = status_icon(status)

        if status == 'valid':
            valid_count += 1
            color = C.GREEN
        elif status == 'expired':
            color = C.RED
        elif status == 'missing':
            color = C.YELLOW
        else:
            color = C.END

        print(f"  {emoji} {name:12} {icon} {color}{note}{C.END}")

    print("─" * 45)
    print(f"  Ready: {valid_count}/5 platforms")

    if valid_count < 5:
        print(f"\n  {C.YELLOW}Run 'python3 launch.py refresh' to fix tokens{C.END}")

    return results

def run_oauth_server(ngrok=False):
    """Start the OAuth refresh server"""
    cmd = ['python3', str(SCRIPT_DIR / 'oauth-server.py')]
    if ngrok:
        cmd.append('--ngrok')

    print(f"\n🚀 Starting OAuth server...")
    print(f"   Dashboard: http://localhost:5000")
    print(f"   Press Ctrl+C to stop\n")

    subprocess.run(cmd)

def run_tests():
    """Run all platform tests"""
    print(f"\n{C.BOLD}🧪 Testing All Platforms{C.END}")
    print("─" * 45)

    tests = [
        ('test-twitter-post.py', 'Twitter'),
        ('test-facebook-post.py', 'Facebook'),
        ('test-instagram-post.py', 'Instagram'),
        ('test-pinterest-post.py', 'Pinterest'),
    ]

    for script, name in tests:
        script_path = SCRIPT_DIR / script
        if script_path.exists():
            print(f"\n{'='*20} {name} {'='*20}")
            result = subprocess.run(
                ['python3', str(script_path)],
                cwd=str(SCRIPT_DIR),
                capture_output=False
            )

def post_to_platform(platform, message=None, image=None):
    """Post to a specific platform"""
    scripts = {
        'twitter': 'test-twitter-post.py',
        'facebook': 'test-facebook-post.py',
        'instagram': 'test-instagram-post.py',
        'pinterest': 'test-pinterest-post.py',
    }

    script = scripts.get(platform.lower())
    if not script:
        print(f"❌ Unknown platform: {platform}")
        print(f"   Available: {', '.join(scripts.keys())}")
        return

    script_path = SCRIPT_DIR / script
    if not script_path.exists():
        print(f"❌ Script not found: {script}")
        return

    print(f"\n📤 Posting to {platform}...")
    subprocess.run(['python3', str(script_path)], cwd=str(SCRIPT_DIR))

def launch_campaign():
    """Launch full campaign"""
    print(f"\n{C.BOLD}🚀 Campaign Launcher{C.END}")
    print("─" * 45)

    # Check status first
    results = check_platform_status()
    valid_platforms = [k for k, v in results.items() if v.get('status') == 'valid']

    if not valid_platforms:
        print(f"\n{C.RED}❌ No platforms ready! Run 'python3 launch.py refresh' first{C.END}")
        return

    print(f"\n✅ Ready platforms: {', '.join(valid_platforms)}")

    confirm = input(f"\nLaunch campaign to {len(valid_platforms)} platforms? [y/N]: ").strip().lower()
    if confirm != 'y':
        print("Cancelled.")
        return

    # Run campaign automation
    campaign_script = SCRIPT_DIR / 'campaign-automation.py'
    if campaign_script.exists():
        subprocess.run(['python3', str(campaign_script)], cwd=str(SCRIPT_DIR))
    else:
        print(f"Campaign script not found: {campaign_script}")

def interactive_menu():
    """Show interactive menu"""
    while True:
        print(f"\n{C.BOLD}╔══════════════════════════════════════════╗{C.END}")
        print(f"{C.BOLD}║    UNTRAPD Social Media Automation       ║{C.END}")
        print(f"{C.BOLD}╠══════════════════════════════════════════╣{C.END}")
        print(f"{C.BOLD}║{C.END}  1. 📊 Check Status                      {C.BOLD}║{C.END}")
        print(f"{C.BOLD}║{C.END}  2. 🔄 Refresh Tokens (OAuth Server)     {C.BOLD}║{C.END}")
        print(f"{C.BOLD}║{C.END}  3. 🧪 Test All Platforms                {C.BOLD}║{C.END}")
        print(f"{C.BOLD}║{C.END}  4. 📤 Post to Platform                  {C.BOLD}║{C.END}")
        print(f"{C.BOLD}║{C.END}  5. 🚀 Launch Campaign                   {C.BOLD}║{C.END}")
        print(f"{C.BOLD}║{C.END}  6. ⚙️  Setup Credentials                {C.BOLD}║{C.END}")
        print(f"{C.BOLD}║{C.END}  0. 👋 Exit                              {C.BOLD}║{C.END}")
        print(f"{C.BOLD}╚══════════════════════════════════════════╝{C.END}")

        choice = input("\nChoice [0-6]: ").strip()

        if choice == '1':
            print_status()
        elif choice == '2':
            ngrok = input("Use ngrok for phone access? [y/N]: ").strip().lower() == 'y'
            run_oauth_server(ngrok)
        elif choice == '3':
            run_tests()
        elif choice == '4':
            platform = input("Platform (twitter/facebook/instagram/pinterest): ").strip()
            post_to_platform(platform)
        elif choice == '5':
            launch_campaign()
        elif choice == '6':
            subprocess.run(['python3', str(SCRIPT_DIR / 'setup-credentials.py')], cwd=str(SCRIPT_DIR))
        elif choice == '0':
            print("\n👋 Goodbye!")
            break
        else:
            print("Invalid choice. Try again.")

def main():
    args = sys.argv[1:] if len(sys.argv) > 1 else []

    if not args:
        interactive_menu()
    elif args[0] == 'status':
        print_status()
    elif args[0] == 'refresh':
        ngrok = '--ngrok' in args
        run_oauth_server(ngrok)
    elif args[0] == 'test':
        run_tests()
    elif args[0] == 'post':
        if len(args) > 1:
            post_to_platform(args[1])
        else:
            print("Usage: python3 launch.py post <platform>")
    elif args[0] == 'campaign':
        launch_campaign()
    elif args[0] == 'setup':
        subprocess.run(['python3', str(SCRIPT_DIR / 'setup-credentials.py')], cwd=str(SCRIPT_DIR))
    else:
        print(f"""
Usage: python3 launch.py [command]

Commands:
  status      - Check all platform status
  refresh     - Start OAuth token refresh server
  test        - Test all platforms
  post <p>    - Post to specific platform
  campaign    - Launch full campaign
  setup       - Setup missing credentials

No command = Interactive menu
""")

if __name__ == '__main__':
    main()
