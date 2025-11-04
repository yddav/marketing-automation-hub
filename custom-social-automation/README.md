# Custom Social Media Automation Platform

**Status**: 🚧 In Development
**Created**: 2025-10-29
**Purpose**: Custom social media automation with visual previews, image management, and scheduling

---

## Features

✅ **Platform-Specific Visual Previews**
- Instagram feed post mockups
- Facebook post rendering
- Twitter tweet preview
- TikTok post display
- Pinterest pin preview

✅ **Image Upload & Management**
- Drag-and-drop upload interface
- Image-post associations
- Media library

✅ **Automated Scheduling**
- APScheduler-based automation
- Calendar view interface
- Background posting service
- 30-day campaign support

✅ **Cost**: $0 forever (self-hosted)

---

## Quick Start

### Installation

```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt
```

### Configuration

Create `.env` file:
```bash
# Social Media API Credentials
INSTAGRAM_ACCESS_TOKEN=your_token
FACEBOOK_ACCESS_TOKEN=your_token
TWITTER_API_KEY=your_key
TWITTER_API_SECRET=your_secret
TWITTER_ACCESS_TOKEN=your_token
TWITTER_ACCESS_SECRET=your_secret
TIKTOK_CLIENT_KEY=your_key
TIKTOK_CLIENT_SECRET=your_secret
PINTEREST_ACCESS_TOKEN=your_token
PINTEREST_APP_ID=your_app_id

# Application Settings
FLASK_SECRET_KEY=your_secret_key
DATABASE_PATH=database/posts.db
UPLOAD_FOLDER=uploads/
```

### Run Application

```bash
# Start web dashboard
python app.py

# Start background scheduler (separate terminal)
python scheduler.py
```

Access dashboard: http://localhost:5001

---

## Project Structure

```
custom-social-automation/
├── app.py                      # Main Flask application
├── scheduler.py                # Background scheduling service
├── models.py                   # Database models
├── api/
│   ├── instagram.py           # Instagram API
│   ├── facebook.py            # Facebook API
│   ├── twitter.py             # Twitter API
│   ├── tiktok.py              # TikTok API
│   └── pinterest.py           # Pinterest API
├── templates/
│   ├── dashboard.html         # Main dashboard
│   ├── calendar.html          # Calendar view
│   └── preview.html           # Platform previews
├── static/
│   ├── css/platform-previews.css
│   └── js/dashboard.js
├── uploads/                   # User-uploaded images
├── database/
│   └── posts.db              # SQLite database
└── requirements.txt

```

---

## Development Roadmap

### Phase 1: Visual Preview System ✅ (In Progress)
- [x] Project structure
- [ ] Instagram feed mockup
- [ ] Facebook post mockup
- [ ] Twitter tweet mockup
- [ ] TikTok post mockup
- [ ] Pinterest pin mockup
- [ ] Enhanced dashboard

### Phase 2: Scheduling System (Next)
- [ ] APScheduler integration
- [ ] Calendar interface
- [ ] Background service
- [ ] Post queue management

### Phase 3: Image Management
- [ ] Upload interface
- [ ] Image storage
- [ ] Media library
- [ ] Image-post associations

### Phase 4: Polish & Launch
- [ ] Post editor
- [ ] Campaign management
- [ ] Testing
- [ ] Production deployment

---

## Usage

### Create Post
1. Go to dashboard
2. Click "New Post"
3. Enter text and upload image
4. Select platforms
5. Set schedule date/time
6. Preview on each platform
7. Save and schedule

### Monitor Campaign
1. View calendar with all scheduled posts
2. Check post status (pending/posted/failed)
3. Edit or reschedule as needed
4. Track campaign progress

---

## API Integration

### Supported Platforms
- **Instagram**: Meta Graph API
- **Facebook**: Meta Graph API
- **Twitter**: Twitter API v2
- **TikTok**: TikTok for Business API
- **Pinterest**: Pinterest API v5

### Authentication
Each platform requires OAuth credentials. See documentation for setup instructions.

---

## Comparison vs Postiz

| Feature | Custom Solution | Postiz (Render) |
|---------|----------------|-----------------|
| Cost | $0 forever | $14/month |
| Control | Full | Limited |
| Customization | Unlimited | Restricted |
| Setup Time | 40-60 hours | 48 minutes |
| Maintenance | Self | Vendor |

---

## License

MIT License - Free to use and modify

---

**Built for**: FINDERR Beta Campaign (45 posts, 30 days, 5 platforms)
**Timeline**: 3-4 weeks development
**Result**: Production-ready social media automation platform
