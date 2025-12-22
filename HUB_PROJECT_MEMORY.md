# Hub App Shop Integration Project Memory

**Generated**: 2025-12-22
**Last Updated**: 2025-12-22
**Purpose**: Persistent marketing hub context for Claude Code SuperClaude framework
**Scope**: Marketing automation and content system for UNTRAPD ecosystem

---

## 📋 Project Overview

**Entity**: Hub_App_Shop_Integ
**Type**: Marketing Automation Hub
**Status**: Active - Supporting FINDERR Beta Launch
**Location**: `/home/wolfy/Projects/2025/Hub_App_Shop_Integ/`

### Core Purpose
App Marketing Automation Hub implementing multi-agent parallel development workflow for:
- Landing pages and marketing content
- Content generation and templates
- API connections and integrations
- Website systems and analytics

### Ecosystem Role
Part of UNTRAPD ecosystem - provides marketing infrastructure for:
- **FINDERR**: Phone recovery app marketing
- **Future Apps**: Scalable template system for additional products
- **Community**: Brand consistency across all touchpoints

---

## 🏗️ Architecture

### Multi-Agent Development Pattern

| Agent | Specialization | Focus Areas |
|-------|---------------|-------------|
| **Agent A** | Content Infrastructure | Templates, brand consistency, marketing automation |
| **Agent B** | API Integration | External services, authentication, data pipelines |
| **Agent C** | Website/Frontend | User interfaces, dynamic content, analytics |

### Development Phases

| Phase | Status | Focus |
|-------|--------|-------|
| Phase 1: Foundation | ✅ Complete | Content templates, brand framework, agent setup |
| Phase 2: Automation | 🔄 Active | Social media, email marketing, analytics |
| Phase 3: Launch & Optimization | ⏳ Pending | Campaigns, onboarding, revenue optimization |

---

## 📁 Core Components

### Content Template System
Central schema at `content_templates/content-schema.json`:

```json
{
  "id": "unique-identifier",
  "type": "content-type",
  "platform": ["target-platforms"],
  "content": {
    "template": "{{placeholder}} content",
    "variations": ["a-b-test-options"]
  },
  "automation": {
    "triggers": ["behavior-based-automation"],
    "scheduling": "timing-rules"
  }
}
```

### Brand Consistency Framework
Located at `content_templates/brand_system/`:
- Voice guidelines with personality framework
- 4-pillar strategic messaging system
- Platform-specific tone adaptations
- Hashtag strategy across all channels
- Visual content guidelines

### Platform Integration Points
- **App Stores**: iOS/Android description variations
- **Social Media**: Instagram, Twitter, Facebook, LinkedIn
- **Email Marketing**: Welcome, launch, retention sequences
- **Website/Blog**: Dynamic content population
- **Press/Media**: Launch announcements

---

## 🌐 Website Structure

### Live URLs
- **Main Hub**: https://hub.untrapd.com
- **FINDERR Page**: https://hub.untrapd.com/apps/finderr
- **Apps Directory**: https://hub.untrapd.com/apps/

### Key Pages
| Page | Path | Purpose |
|------|------|---------|
| Homepage | `/` | UNTRAPD brand introduction |
| FINDERR | `/apps/finderr/` | App landing page |
| Apps Index | `/apps/` | Product directory |
| About | `/about/` | Brand story |

### Multi-Language Support
- **English (EN)**: `Homepage/` (primary)
- **French (FR)**: `Homepage/fr/` (synchronized)

⚠️ **CRITICAL**: Always update BOTH language versions when changing content

---

## 🔗 Integration with UNTRAPD Ecosystem

### Inbound (From Other Projects)
| Source | Trigger | Action |
|--------|---------|--------|
| FINDERR | Version release | Update landing page version |
| FINDERR | Feature launch | Create marketing content |
| Automation | Campaign execution | Coordinate messaging |

### Outbound (To Other Projects)
| Target | Trigger | Action |
|--------|---------|--------|
| Automation | Content ready | Queue social posts |
| FINDERR | Landing update | Sync app store content |
| UNTRAPD Org | Major update | Coordinate announcements |

---

## 🛠️ Development Commands

### Git Workflow
```bash
# Check current phase and agent assignments
git branch -a | grep phase

# Agent-specific branches
git checkout phase1/agent-a-content  # Content infrastructure
git checkout phase1/agent-b-api      # API integrations
git checkout phase1/agent-c-website  # Frontend/website
```

### Local Preview
```bash
cd Homepage && python3 -m http.server 8080
# Preview at http://localhost:8080
```

### Deployment
- **Hosting**: Netlify (auto-deploy from main branch)
- **Domain**: hub.untrapd.com
- **SSL**: Auto-managed by Netlify

---

## 📊 Analytics Integration

### Tracking Setup
- Google Analytics 4 configured
- Event tracking for:
  - Page views
  - CTA clicks
  - Download buttons
  - Language switches

### Key Metrics
| Metric | Target | Purpose |
|--------|--------|---------|
| Page Views | Track | Content performance |
| CTA Clicks | Track | Conversion funnel |
| Bounce Rate | <50% | Content quality |
| Time on Page | >30s | Engagement |

---

## 🎨 Brand Guidelines

### Visual Identity
- **Primary Color**: UNTRAPD brand colors
- **Typography**: System fonts for performance
- **Aesthetic**: Steampunk-inspired (FINDERR specific)

### Voice & Tone
- Authentic and vulnerable
- Community-focused
- Anti-corporate, pro-freedom
- Building in public mentality

### Content Principles
1. **Authenticity over perfection**
2. **Community over competition**
3. **Value before promotion**
4. **Real stories, real struggles**

---

## 🚀 Current Priorities

### Active Tasks
- [ ] FINDERR v4.3.0+271 landing page sync
- [ ] Beta launch marketing preparation
- [ ] Email sequence setup (when SendGrid ready)

### Pending
- [ ] Phase 2 automation integration
- [ ] Analytics dashboard completion
- [ ] A/B testing infrastructure

---

## 🤖 SuperClaude Integration

### Relevant Personas
- **`--persona-frontend`**: Website development
- **`--persona-scribe`**: Content creation
- **`--persona-orchestrator`**: Cross-project coordination

### MCP Servers
- **Magic**: UI component generation
- **Context7**: Web patterns and best practices
- **Playwright**: E2E testing

### Wave-Enabled Commands
- `/build` - Website builds
- `/implement` - Feature implementation
- `/design` - Design system work

---

## 📝 Key Documentation

### Project Files
- `CLAUDE.md` - Project instructions
- `Homepage/` - Website source files
- `content_templates/` - Marketing templates

### Related Memories
- `~/.claude/FINDERR_PROJECT_MEMORY.md` - App context
- `UNTRAPD_PROJECT_MEMORY.md` - Ecosystem overview
- `AUTOMATION_PROJECT_MEMORY.md` - Social media

---

**Last Updated**: 2025-12-22
**Next Review**: After FINDERR beta launch
