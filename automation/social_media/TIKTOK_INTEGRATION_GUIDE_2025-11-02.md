# TikTok Studio Integration Guide

**Created**: 2025-11-02
**Purpose**: Integrate TikTok Studio (untrapd.hub) with UNTRAPD Hub campaign automation
**Status**: 📋 ON HOLD - Ready for future implementation (per user request)

---

## 🎯 Current Status

### TikTok Studio Account
- **Username**: untrapd.hub
- **Platform**: TikTok Studio (https://www.tiktok.com/tiktokstudio)
- **Current Metrics**:
  - 0 likes, 0 followers, 0 following
  - Dashboard with Video views, Profile views, Likes, Comments, Shares tracking
  - Upload functionality active
- **Access**: ✅ CONFIRMED (Screenshot: 2025-11-02 18:28:37)

### Integration Opportunity
Your TikTok Studio account is ready for content automation integration with the existing campaign infrastructure used for Facebook, Instagram, Twitter, and Pinterest.

---

## 🔑 TikTok Content Posting API Overview

### Official API Capabilities

**TikTok Content Posting API** enables developers to:
- Post video content directly to TikTok from applications
- Upload drafts programmatically
- Schedule content across multiple accounts
- Automate repetitive posting tasks
- Manage business/agency multi-account workflows

### API Features (2025)
1. **Video Publishing**: Upload MP4/MOV videos with metadata (title, description, hashtags)
2. **Photo Posting**: New feature supporting photo carousels
3. **Direct Post**: Publish immediately or save as private draft
4. **Chunked Transfer**: Support for large video files with resume capability
5. **Pull from URL**: Alternative to local file upload for verified domains

---

## 📋 Integration Requirements

### Developer Setup

**Step 1: TikTok for Developers Registration**
- Create developer account at https://developers.tiktok.com/
- Register new app for "UNTRAPD Hub Automation"
- Enable "Content Posting API" product
- Activate "Direct Post" configuration

**Step 2: OAuth 2.0 Authentication**
- Required Scope: `video.publish` (mandatory for posting)
- Authentication Method: Bearer token via Login Kit
- Authorization Flow: User must authorize app for video.publish scope
- Access Token: Required for all API calls

**Step 3: App Approval Process**
- **Critical**: Unaudited apps restricted to **private posts only**
- **Production Requirement**: Complete TikTok audit for public visibility
- **Compliance**: Content policy review and app security audit
- **Timeline**: Approval process can take 7-14 days

### Technical Requirements

**Authentication**:
```
Authorization: Bearer act.example12345Example12345Example
```

**Required Scopes**:
- `video.publish` - Post videos to TikTok
- `user.info.basic` - Get user profile information (optional for analytics)

**API Endpoints**:
```
POST /v2/post/publish/creator_info/query/     # Get creator info
POST /v2/post/publish/video/init/             # Initialize upload
POST /v2/post/publish/status/fetch/           # Check status
POST /v2/post/publish/content/init/           # Photo posting
```

---

## 🎬 Video Upload Workflow

### Method 1: FILE_UPLOAD (Recommended for Automation)

**Step-by-Step Process**:

1. **Query Creator Info**
```bash
POST /v2/post/publish/creator_info/query/
Headers:
  Authorization: Bearer {access_token}
  Content-Type: application/json
Body:
  {
    "creator_info": {
      "comment_disabled": false,
      "duet_disabled": false,
      "stitch_disabled": false,
      "max_video_post_duration_sec": 900
    }
  }
```

2. **Initialize Video Upload**
```bash
POST /v2/post/publish/video/init/
Headers:
  Authorization: Bearer {access_token}
  Content-Type: application/json
Body:
  {
    "post_info": {
      "title": "FINDERR - Phone Security Revolution",
      "description": "Protect your device with 99.7% recovery rate 📱🔒 #FINDERR #PhoneSecurity",
      "privacy_level": "PUBLIC_TO_EVERYONE",
      "disable_duet": false,
      "disable_comment": false,
      "disable_stitch": false,
      "video_cover_timestamp_ms": 1000
    },
    "source_info": {
      "source": "FILE_UPLOAD",
      "video_size": 45678901,
      "chunk_size": 10000000,
      "total_chunk_count": 5
    }
  }
Response:
  {
    "publish_id": "pub_id_12345",
    "upload_url": "https://upload.tiktok.com/video/..."
  }
```

3. **Upload Video Chunks**
```bash
PUT {upload_url}
Headers:
  Content-Range: bytes 0-9999999/45678901
  Content-Type: video/mp4
Body: <binary video data chunk 1>

PUT {upload_url}
Headers:
  Content-Range: bytes 10000000-19999999/45678901
  Content-Type: video/mp4
Body: <binary video data chunk 2>

# Continue until all chunks uploaded
```

4. **Check Upload Status**
```bash
POST /v2/post/publish/status/fetch/
Headers:
  Authorization: Bearer {access_token}
  Content-Type: application/json
Body:
  {
    "publish_id": "pub_id_12345"
  }
Response:
  {
    "status": "PROCESSING_UPLOAD" | "PUBLISH_COMPLETE" | "FAILED",
    "fail_reason": "optional error message"
  }
```

### Method 2: PULL_FROM_URL (Alternative)

**Requirements**:
- Videos must be hosted on verified domain/URL prefix
- TikTok fetches video from your server
- Useful for videos already hosted on Netlify/CDN

**Initialization**:
```json
{
  "source_info": {
    "source": "PULL_FROM_URL",
    "video_url": "https://hub.untrapd.com/campaign-videos/finderr-launch.mp4"
  }
}
```

---

## 🔗 Integration with Existing Campaign Automation

### Current Automation Architecture

**Existing Platforms**:
```
automation/social_media/
├── finderr-postiz-integration.js    # Facebook, Instagram, Twitter
├── untrapd-hub-launcher.js          # Campaign orchestration
├── campaign_posts.json              # Multi-platform content
└── preview/                         # Visual previews
```

**Campaign Structure**:
- **Duration**: 30 days automated posting
- **Platforms**: Facebook (30 posts), Instagram (60 posts), Twitter (90 posts)
- **Frequency**: FB 1/day, IG 2/day, TW 3/day
- **Content**: FINDERR v4.2.0+234 beta recruitment

### TikTok Integration Strategy

**Recommended Approach**:
1. **Content Adaptation**: Repurpose Instagram content for TikTok (vertical video format)
2. **Posting Frequency**: 1 video/day (30 videos for 30-day campaign)
3. **Content Types**:
   - App demo videos (emergency activation, wallpaper restoration)
   - Feature highlights (99.7% recovery rate, SMS triggers)
   - User testimonials (beta tester experiences)
   - Behind-the-scenes (development process)

**New Files Required**:
```
automation/social_media/
├── tiktok-content-poster.js         # TikTok API integration
├── tiktok_campaign_posts.json       # TikTok-specific content
└── video_assets/                    # MP4 files for TikTok
    ├── finderr-demo-emergency.mp4   (15-30s)
    ├── finderr-demo-restoration.mp4 (15-30s)
    ├── finderr-beta-promo.mp4       (30-60s)
    └── finderr-testimonial-*.mp4    (15-30s each)
```

---

## 🚀 Implementation Roadmap

### Phase 1: Developer Account Setup (Day 1-2)

**Tasks**:
1. Register at https://developers.tiktok.com/
2. Create app: "UNTRAPD Hub Automation"
3. Enable Content Posting API product
4. Configure OAuth redirect URI: `https://hub.untrapd.com/oauth/tiktok/callback`
5. Obtain Client Key and Client Secret

**Deliverables**:
- Developer credentials stored in `.env`
- App registered and pending approval

### Phase 2: OAuth Implementation (Day 3-4)

**Tasks**:
1. Build OAuth flow similar to Pinterest integration
2. Implement Login Kit authorization
3. Store access tokens securely
4. Test authorization with untrapd.hub account

**Code Template**:
```javascript
// tiktok-oauth-handler.js
const express = require('express');
const router = express.Router();

router.get('/oauth/tiktok/authorize', (req, res) => {
  const authUrl = `https://www.tiktok.com/v2/auth/authorize/` +
    `?client_key=${process.env.TIKTOK_CLIENT_KEY}` +
    `&scope=video.publish` +
    `&response_type=code` +
    `&redirect_uri=${process.env.TIKTOK_REDIRECT_URI}`;

  res.redirect(authUrl);
});

router.get('/oauth/tiktok/callback', async (req, res) => {
  const { code } = req.query;

  // Exchange code for access token
  const tokenResponse = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_key: process.env.TIKTOK_CLIENT_KEY,
      client_secret: process.env.TIKTOK_CLIENT_SECRET,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: process.env.TIKTOK_REDIRECT_URI
    })
  });

  const tokens = await tokenResponse.json();
  // Store tokens.access_token securely

  res.send('TikTok authorization successful!');
});

module.exports = router;
```

### Phase 3: Video Content Creation (Day 5-7)

**Tasks**:
1. Create 30 TikTok-optimized videos (15-60s each)
2. Vertical format (9:16 aspect ratio, 1080x1920px)
3. MP4 encoding with H.264 codec
4. Captions and text overlays for sound-off viewing
5. Hook in first 3 seconds (critical for retention)

**Content Categories**:
- **5 Demo Videos**: App features in action
- **10 Educational**: Security tips and phone safety
- **10 Promotional**: Beta program benefits
- **5 Testimonials**: User success stories

**Video Hosting**:
- Upload to Netlify: `https://hub.untrapd.com/tiktok-videos/*.mp4`
- Alternative: Use PULL_FROM_URL method
- File size: <287MB per video (TikTok limit)

### Phase 4: Automation Script Development (Day 8-10)

**Tasks**:
1. Build `tiktok-content-poster.js` based on API workflow
2. Integrate with existing campaign automation
3. Implement error handling and retry logic
4. Add status tracking and analytics

**Script Architecture**:
```javascript
// tiktok-content-poster.js
const fs = require('fs');
const fetch = require('node-fetch');

class TikTokContentPoster {
  constructor(accessToken) {
    this.accessToken = accessToken;
    this.baseUrl = 'https://open.tiktokapis.com';
  }

  async postVideo(videoPath, metadata) {
    // Step 1: Get creator info
    const creatorInfo = await this.getCreatorInfo();

    // Step 2: Initialize upload
    const videoSize = fs.statSync(videoPath).size;
    const initResponse = await this.initializeUpload({
      title: metadata.title,
      description: metadata.description,
      videoSize: videoSize
    });

    // Step 3: Upload video in chunks
    await this.uploadVideoChunks(videoPath, initResponse.upload_url, videoSize);

    // Step 4: Check upload status
    const status = await this.checkUploadStatus(initResponse.publish_id);

    return status;
  }

  async getCreatorInfo() {
    const response = await fetch(`${this.baseUrl}/v2/post/publish/creator_info/query/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  }

  async initializeUpload(options) {
    const response = await fetch(`${this.baseUrl}/v2/post/publish/video/init/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        post_info: {
          title: options.title,
          description: options.description,
          privacy_level: 'PUBLIC_TO_EVERYONE'
        },
        source_info: {
          source: 'FILE_UPLOAD',
          video_size: options.videoSize,
          chunk_size: 10000000, // 10MB chunks
          total_chunk_count: Math.ceil(options.videoSize / 10000000)
        }
      })
    });
    return response.json();
  }

  async uploadVideoChunks(videoPath, uploadUrl, totalSize) {
    const chunkSize = 10000000; // 10MB
    const stream = fs.createReadStream(videoPath, { highWaterMark: chunkSize });
    let offset = 0;

    for await (const chunk of stream) {
      const endByte = Math.min(offset + chunk.length, totalSize);

      await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Range': `bytes ${offset}-${endByte-1}/${totalSize}`,
          'Content-Type': 'video/mp4'
        },
        body: chunk
      });

      offset = endByte;
    }
  }

  async checkUploadStatus(publishId) {
    const response = await fetch(`${this.baseUrl}/v2/post/publish/status/fetch/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ publish_id: publishId })
    });
    return response.json();
  }
}

module.exports = TikTokContentPoster;
```

### Phase 5: Testing & Audit (Day 11-14)

**Tasks**:
1. Test uploads with private posts (no audit required)
2. Submit app for TikTok production audit
3. Prepare compliance documentation
4. Wait for audit approval (7-14 days)

**Audit Requirements**:
- Privacy policy URL
- Terms of service URL
- App description and use case
- Content moderation plan
- Security measures documentation

### Phase 6: Production Launch (Day 15-30)

**Tasks**:
1. Deploy automation to production after audit approval
2. Schedule 30-day TikTok campaign (1 video/day)
3. Monitor analytics and engagement
4. Adjust content strategy based on performance

---

## 📊 Content Strategy for TikTok

### FINDERR Beta Campaign - TikTok Edition

**Campaign Goal**: Recruit 100 beta testers for FINDERR v4.2.0+234

**Content Pillars**:
1. **Problem-Solution** (40%): Lost phone scenarios → FINDERR solution
2. **Feature Demos** (30%): Emergency activation, wallpaper restoration, SMS triggers
3. **Social Proof** (20%): User testimonials, 99.7% recovery rate stats
4. **Behind-the-Scenes** (10%): Development story, team culture

**Hashtag Strategy**:
- Primary: #FINDERR #PhoneSecurity #LostPhone
- Secondary: #TechTok #MobileSecurity #AppDevelopment
- Trending: Monitor TikTok trends and incorporate relevant tags

**Call-to-Action**:
- Link in bio: https://hub.untrapd.com/apps/finderr/beta
- Comment "BETA" for early access instructions
- Duet/Stitch encouragement for user-generated content

### Video Format Optimization

**Technical Specs**:
- **Resolution**: 1080x1920 (9:16 vertical)
- **Duration**: 15-60 seconds (sweet spot: 21-34s)
- **FPS**: 30fps minimum, 60fps preferred
- **Codec**: H.264, AAC audio
- **File Size**: <100MB for faster processing

**Creative Best Practices**:
- Hook in first 3 seconds (question, bold statement, visual intrigue)
- Captions for sound-off viewing (80% watch without audio)
- Text overlays for key information
- Trending audio integration (check TikTok Creative Center)
- Native TikTok editing style (jump cuts, transitions)

---

## ⚠️ Important Considerations

### Audit Requirements
- **Private Posts Only**: Unaudited apps restricted to private visibility
- **Audit Timeline**: 7-14 days approval process
- **Compliance**: Must meet TikTok content and security policies
- **Workaround**: Test with private posts during development

### Rate Limits (Estimated)
- **Posting Frequency**: Likely 1-3 posts per day for new accounts
- **API Calls**: Rate limits apply to all endpoints
- **Best Practice**: Space out posts, avoid bursts

### Content Moderation
- **Automated Review**: TikTok AI screens all uploads
- **Copyright**: Ensure music/audio rights for all content
- **Community Guidelines**: Adhere to TikTok policies strictly

### Analytics Integration
- **TikTok Analytics**: Available in Creator Studio dashboard
- **Custom Tracking**: Consider UTM parameters in bio link
- **Performance Metrics**: Track video views, engagement rate, follower growth

---

## 🛠️ Quick Start Checklist

**Week 1: Setup**
- [ ] Register TikTok developer account
- [ ] Create "UNTRAPD Hub Automation" app
- [ ] Enable Content Posting API
- [ ] Implement OAuth flow
- [ ] Test authorization with untrapd.hub account

**Week 2: Content Creation**
- [ ] Script 30 TikTok videos (15-60s each)
- [ ] Record and edit videos (vertical format)
- [ ] Export MP4 files (1080x1920, H.264)
- [ ] Upload to Netlify hosting
- [ ] Create content calendar JSON

**Week 3: Automation Development**
- [ ] Build `tiktok-content-poster.js`
- [ ] Integrate with campaign automation
- [ ] Test private uploads (no audit needed)
- [ ] Implement error handling and logging
- [ ] Create analytics dashboard integration

**Week 4: Audit & Launch**
- [ ] Submit app for TikTok production audit
- [ ] Prepare compliance documentation
- [ ] Test full automation workflow with private posts
- [ ] Upon audit approval: Deploy to production
- [ ] Launch 30-day TikTok campaign

---

## 📚 Additional Resources

**Official Documentation**:
- TikTok for Developers: https://developers.tiktok.com/
- Content Posting API Guide: https://developers.tiktok.com/doc/content-posting-api-get-started
- Login Kit Documentation: https://developers.tiktok.com/doc/login-kit-web
- API Reference: https://developers.tiktok.com/doc/

**Community Resources**:
- TikTok Creative Center: https://ads.tiktok.com/business/creativecenter
- TikTok Trends: Monitor trending sounds, hashtags, and formats
- Developer Community: GitHub repos, Stack Overflow discussions

**Testing Tools**:
- Postman Collection: Import TikTok API endpoints for testing
- Video Encoding: FFmpeg for format conversion and optimization
- Analytics: TikTok Creator Studio for performance insights

---

## ✅ Success Metrics

**Short-Term (30-Day Campaign)**:
- 30 videos posted (1/day)
- 10K+ video views total
- 500+ profile visits
- 100+ bio link clicks
- 50+ beta signups via TikTok

**Long-Term (3-6 Months)**:
- 1K+ followers on untrapd.hub account
- Average engagement rate >5%
- Viral video (100K+ views) for brand awareness
- TikTok as top 3 traffic source to hub.untrapd.com

---

## 🎯 Next Steps

**Immediate Actions**:
1. **Register Developer Account**: https://developers.tiktok.com/apps/register
2. **Review Content Strategy**: Finalize 30-video content calendar
3. **Budget Video Production**: Equipment, editing software, or freelancer
4. **Coordinate with Existing Campaign**: Align TikTok launch with Instagram/Facebook/Twitter

**Timeline**:
- Week 1-2: Developer setup + OAuth implementation
- Week 2-3: Video content creation (30 videos)
- Week 3-4: Automation development + testing
- Week 4-5: Audit submission + approval wait
- Week 6+: Production launch (after audit approval)

---

**Created**: 2025-11-02
**Author**: SuperClaude Framework
**Status**: 📋 IMPLEMENTATION READY - Pending developer account registration

**Integration Opportunity**: Add TikTok as 5th platform to existing multi-platform campaign automation, targeting 1.59 billion users worldwide with vertical video content optimized for FINDERR beta recruitment.
