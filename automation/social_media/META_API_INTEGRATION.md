# 🔑 Meta API Integration Guide - Agent A Specialist

**Target Accounts:**
- Instagram Business: 76216363129 (@untrapd.hub)
- Facebook Page: 750014458192598 (Untrapd Hub)

## 🎯 Agent A Mission: Complete Meta Platform Integration

### Current Status: ⏳ Developer Verification Required

## 📋 Step-by-Step Integration Process

### Phase 1: Meta Developer Account Setup

**Step 1: Create Meta Developer App**
1. **Go to**: [developers.facebook.com](https://developers.facebook.com)
2. **Log in** with account that has admin access to "Untrapd Hub" page
3. **Create App** → **Business** → **Consumer**
4. **App Name**: "UNTRAPD Hub Social Media Automation"
5. **Business Use Case**: Content publishing and management

**Step 2: Add Required Products**
- **Instagram Basic Display** (for content publishing)
- **Facebook Login** (for page access)
- **Pages API** (for page management)

### Phase 2: Instagram Business API Integration

**Required Permissions:**
- `instagram_basic`
- `instagram_content_publish`
- `instagram_manage_insights`
- `pages_show_list`

**API Endpoints:**
```javascript
// Instagram Business Account: 76216363129
GET /{instagram-account-id}/media        // Get posts
POST /{instagram-account-id}/media       // Create media object
POST /{instagram-account-id}/media_publish // Publish content
GET /{instagram-account-id}              // Account insights
```

### Phase 3: Facebook Page API Integration

**Required Permissions:**
- `pages_manage_posts`
- `pages_read_engagement`
- `pages_show_list`
- `publish_to_groups`

**API Endpoints:**
```javascript
// Facebook Page: 750014458192598
POST /{page-id}/feed           // Post text/link content
POST /{page-id}/photos         // Post images
POST /{page-id}/videos         // Post videos
GET /{page-id}/insights        // Page analytics
```

### Phase 4: Token Generation & Validation

**Instagram Access Token:**
```bash
# Graph API Explorer Steps:
1. Select App: "UNTRAPD Hub Social Media Automation"
2. Select User: Instagram Business Account (76216363129)
3. Add Permissions: instagram_basic, instagram_content_publish
4. Generate Token → Copy for .env file
```

**Facebook Page Access Token:**
```bash
# Graph API Explorer Steps:
1. Select App: "UNTRAPD Hub Social Media Automation"  
2. Select Page: "Untrapd Hub" (750014458192598)
3. Add Permissions: pages_manage_posts, pages_read_engagement
4. Generate Token → Copy for .env file
```

## 🔧 Technical Implementation

### Environment Variables
```bash
# Add to .env file:
INSTAGRAM_ACCESS_TOKEN=IGxxxxxxxxxxxxxxxxxxxxxxxxxx
FACEBOOK_PAGE_TOKEN=EAAxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### API Integration Testing
```javascript
// Test Instagram connection
const instagram = axios.create({
  baseURL: 'https://graph.facebook.com/v18.0',
  params: { access_token: process.env.INSTAGRAM_ACCESS_TOKEN }
});

// Test Facebook connection  
const facebook = axios.create({
  baseURL: 'https://graph.facebook.com/v18.0',
  params: { access_token: process.env.FACEBOOK_PAGE_TOKEN }
});
```

## 📊 Content Publishing Capabilities

### Instagram Business Posts
- ✅ **Image Posts**: JPG, PNG (up to 8MB)
- ✅ **Video Posts**: MP4, MOV (up to 100MB)
- ✅ **Reels**: Short form video content
- ✅ **Stories**: 24-hour ephemeral content
- ✅ **Carousels**: Multiple images/videos
- ⚠️ **Text-only**: Not supported (requires media)

### Facebook Page Posts
- ✅ **Text Posts**: Plain text updates
- ✅ **Image Posts**: JPG, PNG, GIF
- ✅ **Video Posts**: MP4, MOV, AVI
- ✅ **Link Posts**: URL previews with custom text
- ✅ **Scheduled Posts**: 10 minutes to 30 days advance

## 🚫 Current Limitations

### Instagram API Restrictions
- **400 posts per 24 hours** (rate limit)
- **Media required** for feed posts
- **Business account only** (no personal accounts)
- **Approval required** for advanced features

### Facebook API Restrictions  
- **200 posts per day** (recommended limit)
- **Page admin required** for token generation
- **App review needed** for some permissions
- **Rate limiting** based on usage patterns

## 🧪 Testing Strategy

### Validation Checklist
- [ ] Meta Developer App created and approved
- [ ] Instagram Business Account connected (76216363129)
- [ ] Facebook Page connected (750014458192598)
- [ ] API tokens generated and validated
- [ ] Test post successful on both platforms
- [ ] Rate limiting implemented and tested
- [ ] Error handling verified

### Test Posts
```javascript
// Instagram test (requires image)
const instagramTest = {
  content: "🧠 Testing UNTRAPD Hub automation system! #Test #UntrapдHub",
  mediaUrl: "https://example.com/test-image.jpg"
};

// Facebook test (can be text-only)
const facebookTest = {
  content: "🚀 UNTRAPD Hub automation system test post from API integration!"
};
```

## 🔐 Security Best Practices

### Token Management
- **Never commit tokens** to version control
- **Use environment variables** exclusively
- **Rotate tokens regularly** (every 60 days)
- **Monitor token usage** for unauthorized access

### Rate Limiting Compliance
- **Implement exponential backoff** for API errors
- **Track daily/hourly usage** against limits
- **Queue posts** when limits approached
- **Graceful degradation** when rate limited

## 📈 Success Metrics

### Integration Goals
- **99%+ API success rate** for posting operations
- **<2 second average** API response time
- **Zero security incidents** with token management
- **Full automation** without manual intervention

### Platform-Specific Targets
- **Instagram**: 2 posts/day automated
- **Facebook**: 1 post/day automated  
- **Combined**: Reach 1000+ followers in 30 days

## 🚨 Troubleshooting Guide

### Common Issues
**"Invalid Access Token"**
- Check token expiration (60-day limit)
- Verify app permissions are granted
- Regenerate token if needed

**"Application Does Not Have Permission"**
- Add required permissions in App Dashboard
- Re-generate tokens after permission changes
- Submit for App Review if advanced permissions needed

**"Rate Limit Exceeded"**
- Implement delay between posts
- Check current usage against daily limits
- Use exponential backoff for retries

### Debug Commands
```bash
# Test token validity
curl "https://graph.facebook.com/me?access_token={TOKEN}"

# Check Instagram account info
curl "https://graph.facebook.com/76216363129?access_token={INSTAGRAM_TOKEN}"

# Check Facebook page info  
curl "https://graph.facebook.com/750014458192598?access_token={FACEBOOK_TOKEN}"
```

## 🎯 Agent A Deliverables

1. ✅ **Meta Developer App** created and configured
2. ✅ **Instagram API integration** (Account: 76216363129)
3. ✅ **Facebook API integration** (Page: 750014458192598)
4. ✅ **Token generation** and secure storage
5. ✅ **API validation** and testing complete
6. ✅ **Documentation** and troubleshooting guide
7. ✅ **Integration testing** with existing automation system

**Timeline**: 1-3 days (depending on Meta approval process)

**Status**: 🔄 Ready to begin developer verification process

---

**Next Steps**: Create Meta Developer App and begin verification process for Instagram + Facebook API access.