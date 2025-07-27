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

## Current Status

**Phase 1: COMPLETED** ✅
- Content template infrastructure established
- Brand consistency framework implemented  
- JSON schema system operational
- A/B testing infrastructure ready

**Next Priority: Phase 2 Agent Coordination**
- Social media automation (Agent A continuation)
- API integration implementation (Agent B)
- Website hub development (Agent C)

The foundation is established for scaling marketing automation across all platforms with consistent branding and measurable performance optimization.