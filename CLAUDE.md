# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an **App Marketing Automation Hub** implementing a multi-agent parallel development workflow. The project builds automation infrastructure for app marketing campaigns, integrating content generation, API connections, and website systems through a 3-phase development approach.

## Multi-Agent Development Architecture

### Agent Specialization System
The project uses a **3-agent parallel development pattern** with specialized roles:

- **Agent A (Content Infrastructure)**: Content templates, brand consistency, marketing automation
- **Agent B (API Integration)**: External service connections, authentication, data pipelines  
- **Agent C (Website/Frontend)**: User interfaces, dynamic content systems, analytics dashboards

### Phase-Based Development Workflow

#### Phase 1: Foundation (COMPLETED)
- Content template infrastructure with JSON schema system
- Brand consistency framework across platforms
- Parallel agent workspace setup

#### Phase 2: Automation Integration (NEXT)
- Social media automation (Agent A)
- Email marketing automation (Agent B) 
- Analytics and performance tracking (Agent C)

#### Phase 3: Launch & Optimization
- Campaign execution systems
- User onboarding automation
- Revenue optimization features

## Core Architecture Components

### Content Template System
The project centers around a **unified content metadata schema** (`content_templates/content-schema.json`) that standardizes all marketing content across platforms:

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

### Platform Integration Points
- **App Stores**: iOS/Android description variations for A/B testing
- **Social Media**: Instagram, Twitter, Facebook, LinkedIn templates
- **Email Marketing**: Welcome, launch, and retention sequences
- **Website/Blog**: Dynamic content population system
- **Press/Media**: Launch announcements and milestone communications

### Brand Consistency Framework
Centralized brand system in `content_templates/brand_system/`:
- Voice guidelines with personality framework
- 4-pillar strategic messaging system
- Platform-specific tone adaptations
- Hashtag strategy across all channels
- Visual content guidelines for design consistency

## Development Commands

### Git Workflow for Multi-Agent Development
```bash
# Check current phase and agent assignments
git branch -a | grep phase

# Agent-specific branch workflow (Phase 1 example)
git checkout phase1/agent-a-content  # Content infrastructure
git checkout phase1/agent-b-api      # API integrations  
git checkout phase1/agent-c-website  # Website development

# Integration workflow
git checkout integration/phase1
git merge phase1/agent-a-content
git merge phase1/agent-b-api
git merge phase1/agent-c-website
```

### Content Validation
```bash
# Validate JSON schema compliance
jsonschema -i content_templates/*/. content_templates/content-schema.json

# Check content template integrity
find content_templates/ -name "*.json" -exec node -c {} \;
```

### MCP Server Requirements
The project requires these MCP servers for optimal functionality:
```bash
npm install -g @modelcontextprotocol/server-sequential-thinking
npm install -g ref-tools-mcp  
npm install -g @hisma/server-puppeteer
```

## Key File Structures

### Content Templates Hierarchy
```
content_templates/
├── content-schema.json              # Master metadata schema
├── app_store/                       # App store descriptions (5 A/B variations)
├── social_media/                    # Platform-specific templates
│   ├── instagram-templates.json    # 7 content variations
│   ├── twitter-templates.json      # 8 content variations
│   ├── facebook-templates.json     # 7 content variations
│   └── linkedin-templates.json     # 7 content variations
├── email_marketing/                 # Automated email sequences
│   ├── welcome-sequence.json       # 5-email onboarding
│   ├── launch-sequence.json        # 5-email campaign
│   └── retention-sequence.json     # 6-email retention
├── blog_posts/                      # Website content templates
├── press_releases/                  # Media announcement templates
└── brand_system/                    # Brand consistency framework
    ├── brand-voice-guidelines.json  # Voice and personality
    ├── messaging-pillars.json       # Strategic messaging
    ├── hashtag-strategy.json        # Multi-platform hashtags
    ├── visual-content-descriptions.json  # Design guidelines
    └── platform-tone-variations.json     # Platform adaptations
```

### Agent Coordination Files
- `AGENT_COORDINATION.md`: Multi-agent workflow specifications
- `app_marketing_automation_plan.md`: Master development plan
- `.github/workflows/agent-coordination.yml`: CI/CD for parallel development

## Content System Integration

### Template Variables System
All content uses `{{placeholder}}` variables for dynamic population:
- `{{app_name}}`: Application name
- `{{user_name}}`: Personalization target
- `{{feature_highlight}}`: Dynamic feature descriptions
- `{{call_to_action}}`: Platform-specific CTAs
- `{{launch_date}}`: Campaign timing variables

### A/B Testing Framework
Every content template includes multiple variations for optimization:
- Systematic A/B test group assignments
- Performance tracking integration points
- Success metrics and conversion goals
- Automated winner selection criteria

### Automation Trigger System
Content templates include behavior-based triggers:
- `app_download`: User acquisition events
- `user_signup`: Registration completion
- `feature_used`: Engagement milestones
- `time_based`: Scheduled campaigns
- `purchase_complete`: Conversion events

## Agent Assignment Guidelines

### When Working as Agent A (Content Infrastructure)
Focus on content templates, brand consistency, and marketing automation frameworks. Primary files: `content_templates/`, brand system files.

### When Working as Agent B (API Integration)
Focus on external service connections, authentication systems, and data pipeline integration. Prepare for Phase 2 email marketing and social media API connections.

### When Working as Agent C (Website/Frontend)
Focus on user-facing systems, dynamic content display, and analytics dashboards. Prepare for integrating content templates into website systems.

## Integration Dependencies

### Phase Completion Requirements
- **Phase 1**: Content infrastructure, brand framework, API authentication setup
- **Phase 2**: Social media automation, email marketing integration, analytics tracking
- **Phase 3**: Campaign execution, user onboarding, revenue optimization

### Cross-Agent Communication
- Content templates (Agent A) → API population (Agent B) → Website display (Agent C)
- Brand guidelines (Agent A) → Design implementation (Agent C)
- Performance metrics (Agent B) → Analytics dashboard (Agent C)

## Quality Standards

### Content Validation
- JSON schema compliance for all templates
- Brand voice consistency across platforms
- A/B testing variation completeness
- Placeholder variable documentation

### Integration Testing
- Template population with real data
- Cross-platform consistency verification
- Automation trigger functionality
- Performance tracking validation

## Smart Documentation System

### Intelligent Navigation Framework
This project now includes a **comprehensive documentation tree system** with intelligent navigation and cross-project coordination:

**🗂️ Core Documentation Components**:
- [**Master Documentation Tree**](DOCUMENTATION_TREE_2025-01-14.md) - Complete 10-category hierarchy
- [**Navigation Hub**](docs/navigation/README_2025-01-14.md) - Role-based quick access
- [**Current Focus Guide**](docs/quick-access/CURRENT_FOCUS_2025-01-14.md) - Implementation priorities
- [**Product Manager Dashboard**](docs/by-role/PRODUCT_MANAGER_2025-01-14.md) - Strategic overview

### Documentation Features
- **Systematic Organization**: 10 major categories with cross-project navigation
- **Role-Based Access**: Customized entry points for Product Manager, Developer, Marketing, Operations
- **Intelligent Search**: Executable search tool (`docs/search-tools/find-docs.sh`) with pattern matching
- **Cross-Reference Mapping**: Complete dependency tracking between Hub and FINDERR projects
- **Timestamp Naming**: Systematic YYYY-MM-DD format for version control
- **Session Continuity**: Clear handoff protocols preventing context loss

### Quick Access Commands
```bash
# Navigate using documentation system
./docs/search-tools/find-docs.sh [category] [term]

# Examples
./docs/search-tools/find-docs.sh finderr revenue
./docs/search-tools/find-docs.sh automation
./docs/search-tools/find-docs.sh current

# Validate system health
ls -la *2025-01-14*
```

## Current Status

**Phase 1: COMPLETED** ✅
- Content template infrastructure established
- Brand consistency framework implemented  
- JSON schema system operational
- A/B testing infrastructure ready

**Phase 2: COMPLETED** ✅  
- Social media automation production ready
- Email marketing integration operational
- Analytics and performance tracking active
- Hub automation engine deployed

**Phase 3: CURRENT - FINDERR Integration** 🔄
- **Android Revenue Strategy**: Complete ($6.99/month subscription model)
- **Production Integration Roadmap**: Ready for implementation
- **Hub Automation Connection**: Next session priority
- **Landing Page Updates**: Android-only messaging needed

**Next Priority: FINDERR Android Integration Implementation**
- Hub automation integration with FINDERR milestones (30 minutes)
- Landing page Android-only messaging (30 minutes)
- Email sequence updates for Android focus (30 minutes)

### FINDERR Integration Status
This project now integrates with the **FINDERR phone security app** (Flutter-based) through:
- Cross-project documentation coordination
- Shared automation infrastructure
- Revenue strategy alignment (Android-first approach)
- Milestone-driven marketing automation

The foundation is established for complete ecosystem integration between Hub automation and FINDERR app with measurable performance optimization and systematic documentation management.

---

## UNTRAPD Ecosystem Architecture 2026

**This project is part of the UNTRAPD ecosystem** - a centralized umbrella for all related projects.

### Ecosystem Structure

```
                    ┌─────────────────────────────────┐
                    │     UNTRAPD Organization        │
                    │   (GitHub: UNTRAPD/hub-website) │
                    │                                 │
                    │   Central Management Layer      │
                    │   - Public-facing umbrella      │
                    │   - Cross-project coordination  │
                    │   - 2026 Launch orchestration   │
                    └───────────────┬─────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        │                           │                           │
        ▼                           ▼                           ▼
┌───────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   FINDERR     │         │  Hub_App_Shop   │  ← YOU  │   Automation    │
│   (Flutter)   │         │    _Integ       │   ARE   │  Social Media   │
│               │         │                 │   HERE  │                 │
│ Phone Recovery│         │ Landing Pages   │         │ Python Scripts  │
│ Android App   │         │ Marketing Hub   │         │ Native APIs     │
│ v4.3.0+267    │         │ Content System  │         │ FB/IG/TW/Pin    │
└───────────────┘         └─────────────────┘         └─────────────────┘
        │                           │                           │
        └───────────────────────────┴───────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼                               ▼
            ┌───────────────┐             ┌─────────────────┐
            │   Campaign    │             │    Preview      │
            │  Automation   │             │    Generator    │
            └───────────────┘             └─────────────────┘
```

### Project Roles in Ecosystem

| Project | Role | Git Repository |
|---------|------|----------------|
| **UNTRAPD** | Central umbrella, public face, coordination | `UNTRAPD/hub-website` (org) |
| **Hub_App_Shop_Integ** | Marketing hub, landing pages, content | This project |
| **FINDERR** | Android phone recovery app | `Finderr_Clean/` |
| **Automation** | Social media Python scripts (native APIs) | `automation/social_media/` |
| **Campaign** | Marketing campaign automation | Integrated in Hub |
| **Preview** | Visual asset generator | Integrated in Hub |

### Cross-Project Integration Points

**Hub → FINDERR**:
- Marketing content templates for FINDERR launches
- Landing pages (hub.untrapd.com/apps/finderr)
- Email sequences for user onboarding
- Campaign automation triggers

**Hub → Automation**:
- Social media scheduling via Python native APIs
- Facebook Graph API, Instagram API, Twitter OAuth 1.0a
- No external dependencies (in-house solution)

**Hub → UNTRAPD Org**:
- Public website at hub.untrapd.com
- Centralized branding and messaging
- Cross-project documentation coordination

### Git Repository Strategy

**Central (UNTRAPD Org)**:
```bash
git clone git@github.com:UNTRAPD/hub-website.git
```

**Local Development**:
- Each project maintained independently
- Integration via shared documentation
- Handoff files for cross-session continuity

### Key Documentation Files

- `SESSION_HANDOFF_UNTRAPD_CENTRALIZATION_2025-12-04.md` - Master handoff
- `DOCUMENTATION_TREE_2025-01-14.md` - Complete doc hierarchy
- `docs/navigation/README_2025-01-14.md` - Role-based navigation