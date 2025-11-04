"""
Custom Social Media Automation Platform
Main Flask Application - Phase 2: Calendar & Scheduling
Created: 2025-10-29
"""

from flask import Flask, render_template, request, jsonify, send_from_directory
from datetime import datetime, timedelta
import json
import os
from models import db

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('FLASK_SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Create uploads directory
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Load enhanced campaign data with visual content metadata
def load_campaign_data():
    """Load enhanced campaign posts with visual design specifications"""
    campaign_file = os.path.join(os.path.dirname(__file__), 'campaign_posts_visual.json')
    if os.path.exists(campaign_file):
        with open(campaign_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []

# Sample post data for preview demonstration (from enhanced campaign)
CAMPAIGN_POSTS = load_campaign_data()
SAMPLE_POST = CAMPAIGN_POSTS[0] if CAMPAIGN_POSTS else {
    'id': 1,
    'content': '🔐 Lost your phone? FINDERR can help! Our revolutionary app displays your emergency contact info on your locked screen. Join our beta test today! #PhoneSecurity #FINDERR #Android #BetaTester',
    'image_url': 'https://picsum.photos/600/600?random=1',
    'platforms': ['instagram', 'facebook', 'twitter', 'tiktok', 'pinterest'],
    'scheduled_date': '2025-01-15',
    'scheduled_time': '09:00',
    'status': 'draft',
    'visual_content': {
        'template_type': 'comparison',
        'hook_text': '🔐 Lost your phone? FINDERR can help!',
        'design_specs': {
            'background': {
                'type': 'dark',
                'gradient': 'gradient-dark'
            },
            'typography': {
                'font_family': 'Inter',
                'hook': {
                    'size': '48px',
                    'weight': 900,
                    'line_height': '1.2'
                }
            },
            'colors': {
                'text_primary': '#FFFFFF',
                'accent': '#667eea',
                'contrast_ratio': '21:1'
            }
        }
    }
}

@app.route('/')
def index():
    """Main dashboard"""
    return render_template('index.html')

@app.route('/preview')
def preview():
    """Platform preview page"""
    # Load sample or real post data
    post = SAMPLE_POST

    return render_template('preview.html', post=post)

@app.route('/visual-templates')
def visual_templates():
    """Visual content templates showcase"""
    return render_template('visual-content-cards.html')

@app.route('/api/preview-post', methods=['POST'])
def preview_post_api():
    """
    API endpoint to preview a post across all platforms
    Accepts: { text, image_url, platforms[] }
    Returns: Preview data for each platform
    """
    data = request.get_json()

    post_text = data.get('text', '')
    image_url = data.get('image_url')
    platforms = data.get('platforms', ['instagram', 'facebook', 'twitter', 'tiktok', 'pinterest'])

    # Process text for each platform
    preview_data = {}

    for platform in platforms:
        preview_data[platform] = {
            'text': post_text,
            'image_url': image_url,
            'char_count': len(post_text),
            'warnings': []
        }

        # Platform-specific processing
        if platform == 'twitter' and len(post_text) > 280:
            preview_data[platform]['warnings'].append(
                f'Text is {len(post_text) - 280} characters over Twitter limit'
            )

        if platform == 'instagram' and len(post_text) > 2200:
            preview_data[platform]['warnings'].append(
                'Text exceeds Instagram caption limit (2200 characters)'
            )

        if platform in ['tiktok', 'pinterest'] and not image_url:
            preview_data[platform]['warnings'].append(
                f'{platform.capitalize()} requires visual content'
            )

    return jsonify(preview_data)

@app.route('/upload-image', methods=['POST'])
def upload_image():
    """Handle single or multiple image uploads for posts"""
    if 'file' not in request.files and 'files' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    uploaded_files = []

    # Handle multiple files
    files = request.files.getlist('files') if 'files' in request.files else [request.files['file']]

    for file in files:
        if file.filename == '':
            continue

        # Save file
        filename = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{file.filename}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        uploaded_files.append({
            'filename': filename,
            'url': f'/uploads/{filename}'
        })

    if not uploaded_files:
        return jsonify({'error': 'No valid files uploaded'}), 400

    # Return single object for single file, array for multiple
    if len(uploaded_files) == 1:
        return jsonify({
            'success': True,
            **uploaded_files[0]
        })
    else:
        return jsonify({
            'success': True,
            'files': uploaded_files,
            'count': len(uploaded_files)
        })

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    """Serve uploaded files"""
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# ============================================
# PHASE 2: Calendar & Scheduling Routes
# ============================================

@app.route('/calendar')
def calendar():
    """Calendar view with drag-drop scheduling"""
    return render_template('calendar.html')

@app.route('/posts')
def posts_list():
    """Post management interface"""
    posts = db.get_all_posts()
    return render_template('posts.html', posts=posts)

# ============================================
# API Routes for Posts Management
# ============================================

@app.route('/api/posts', methods=['GET'])
def get_posts():
    """Get all posts"""
    posts = db.get_all_posts()
    return jsonify(posts)

@app.route('/api/posts', methods=['POST'])
def create_post():
    """Create a new post"""
    data = request.get_json()

    try:
        post_id = db.create_post(
            text=data['text'],
            platforms=data['platforms'],
            scheduled_date=data['scheduled_date'],
            scheduled_time=data['scheduled_time'],
            image_url=data.get('image_url'),
            status=data.get('status', 'draft')
        )

        return jsonify({
            'success': True,
            'post_id': post_id,
            'message': 'Post created successfully'
        }), 201

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@app.route('/api/posts/<int:post_id>', methods=['GET'])
def get_post(post_id):
    """Get a specific post"""
    post = db.get_post(post_id)

    if post:
        return jsonify(post)
    else:
        return jsonify({'error': 'Post not found'}), 404

@app.route('/api/posts/<int:post_id>', methods=['PUT'])
def update_post(post_id):
    """Update an existing post"""
    data = request.get_json()

    try:
        db.update_post(
            post_id=post_id,
            text=data.get('text'),
            platforms=data.get('platforms'),
            scheduled_date=data.get('scheduled_date'),
            scheduled_time=data.get('scheduled_time'),
            image_url=data.get('image_url'),
            status=data.get('status')
        )

        return jsonify({
            'success': True,
            'message': 'Post updated successfully'
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@app.route('/api/posts/<int:post_id>', methods=['DELETE'])
def delete_post(post_id):
    """Delete a post"""
    try:
        db.delete_post(post_id)
        return jsonify({
            'success': True,
            'message': 'Post deleted successfully'
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@app.route('/api/posts/scheduled', methods=['GET'])
def get_scheduled_posts():
    """Get posts scheduled for posting"""
    posts = db.get_scheduled_posts()
    return jsonify(posts)

@app.route('/api/posts/due', methods=['GET'])
def get_posts_due():
    """Get posts due for posting now"""
    posts = db.get_posts_due_now()
    return jsonify(posts)

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get campaign statistics"""
    stats = db.get_stats()
    return jsonify(stats)

@app.route('/api/import/finderr-campaign', methods=['GET'])
def import_finderr_campaign():
    """Import real FINDERR campaign data"""
    try:
        # Load campaign data from automation folder
        campaign_path = '../automation/social_media/campaign_posts.json'

        if not os.path.exists(campaign_path):
            return jsonify({
                'error': 'Campaign file not found',
                'path': campaign_path
            }), 404

        with open(campaign_path, 'r', encoding='utf-8') as f:
            campaign_data = json.load(f)

        # Transform to our format
        posts = []
        today = datetime.now()

        for post in campaign_data:
            # Calculate schedule date based on schedule_days
            scheduled_date = (today + timedelta(days=post.get('schedule_days', 0))).strftime('%Y-%m-%d')

            # Distribute posts throughout the day (9am, 1pm, 5pm, 9pm)
            time_slots = ['09:00', '13:00', '17:00', '21:00']
            scheduled_time = time_slots[post['id'] % len(time_slots)]

            posts.append({
                'text': post['content'],
                'platforms': post['platforms'],
                'scheduled_date': scheduled_date,
                'scheduled_time': scheduled_time,
                'image_url': f"/static/finderr-images/{post['media'][0]}" if post.get('media') else None,
                'status': 'draft'
            })

        return jsonify({
            'campaign_name': 'FINDERR Beta Recruitment Campaign',
            'posts': posts,
            'total_posts': len(posts),
            'date_range': {
                'start': posts[0]['scheduled_date'],
                'end': posts[-1]['scheduled_date']
            },
            'platforms': list(set([p for post in campaign_data for p in post['platforms']]))
        })

    except Exception as e:
        return jsonify({
            'error': str(e)
        }), 500

if __name__ == '__main__':
    print("🚀 Custom Social Media Automation Platform")
    print("=" * 50)
    print("📊 Dashboard: http://localhost:5001")
    print("🎨 Preview: http://localhost:5001/preview")
    print("📅 Calendar: http://localhost:5001/calendar")
    print("📝 Posts: http://localhost:5001/posts")
    print("=" * 50)
    app.run(debug=True, port=5001)
