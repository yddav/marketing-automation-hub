# SuperClaude Framework - Mobile/Web Access Guide

**Quick Access**: This guide provides essential SuperClaude framework access for Claude Code on mobile/web platforms.

**Full Framework Location**: `~/.claude/` (desktop only)

---

## 🚀 Quick Start Commands

### Essential Commands
```bash
/analyze [target]              # Multi-dimensional analysis
/implement [feature]           # Feature implementation
/improve [target]              # Code enhancement
/build [target]                # Project builder
/task [operation]              # Project management
/army [type] [task]            # Multi-agent deployment
```

### Key Flags
```bash
--uc                          # Ultra-compressed mode (30-50% token savings)
--think                       # Multi-file analysis (~4K tokens)
--think-hard                  # Deep analysis (~10K tokens)
--ultrathink                  # Maximum depth (~32K tokens)
--seq                         # Enable Sequential MCP
--delegate auto               # Parallel processing
--wave-mode                   # Multi-stage orchestration
```

---

## 📋 Core Principles (Mobile Reference)

**Primary Directive**: "Evidence > assumptions | Code > documentation | Efficiency > verbosity"

### Development Rules
- ✅ **Read before Write/Edit**: Always use Read tool before modifying files
- ✅ **Absolute Paths**: Never use relative paths
- ✅ **Batch Operations**: Parallel tool calls when no dependencies
- ✅ **Validate First**: Check before execution, verify after completion
- ✅ **Framework Compliance**: Follow existing project patterns

### Task Management Protocol
- **Single Focus**: One active task at a time (in_progress state)
- **Real-Time Updates**: Immediate status changes
- **Quality Gates**: Validation before marking complete
- **Evidence-Based**: Measurable outcomes only

---

## 🎯 Persona Quick Reference

### Auto-Activation Keywords
- **architect**: architecture, design, scalability, system-wide
- **frontend**: UI, component, responsive, accessibility
- **backend**: API, database, server, reliability
- **security**: vulnerability, threat, compliance, authentication
- **analyzer**: analyze, investigate, root cause, debug
- **performance**: optimize, bottleneck, speed, efficiency
- **refactorer**: refactor, cleanup, technical debt, quality
- **qa**: test, quality, validation, edge cases
- **devops**: deploy, infrastructure, automation, CI/CD
- **scribe**: document, write, guide, README
- **synthesizer**: learn, pattern, insight, breakthrough
- **orchestrator**: cross-project, ecosystem, production, session recovery

### Manual Activation
```bash
--persona-[name]              # Force specific persona
# Examples:
--persona-architect           # System design focus
--persona-security            # Security hardening
--persona-orchestrator        # Production coordination
```

---

## 🔧 MCP Server Integration

### Available Servers
- **Context7**: Library documentation, framework patterns
- **Sequential**: Complex multi-step analysis (auto with --think)
- **Magic**: UI component generation
- **Playwright**: E2E testing, browser automation
- **Memory**: Persistent project knowledge

### Server Control Flags
```bash
--c7                          # Enable Context7
--seq                         # Enable Sequential
--magic                       # Enable Magic
--play                        # Enable Playwright
--all-mcp                     # Enable all servers
--no-mcp                      # Disable all servers
```

---

## 🌊 Wave Orchestration (Advanced)

**Purpose**: Multi-stage execution for complex operations

**Auto-Activation**: complexity ≥0.7 AND files >20 AND operation_types >2

**Manual Control**:
```bash
--wave-mode auto              # Default auto-detection
--wave-mode force             # Force wave mode
--wave-mode off               # Disable waves
--wave-strategy progressive   # Iterative enhancement
--wave-strategy systematic    # Comprehensive analysis
--wave-strategy enterprise    # Large-scale (100+ files)
```

---

## 📊 Project Context Loading

### Hub Automation Project
```bash
# Project root
cd /media/wolfy/.../Hub_App_Shop_Integ

# Key files
CLAUDE.md                     # Project instructions
DOCUMENTATION_TREE_2025-01-14.md  # Complete doc tree
SESSION_HANDOFF_2025-10-26_*.md   # Latest session context

# Current status
# ✅ 5-platform integration (Instagram, Facebook, Twitter, TikTok, Pinterest)
# ✅ 210+ posts ready (30-day beta recruitment)
# ✅ Visual preview system complete
# 95% launch ready - 60 minutes to 100%
```

### FINDERR Project
```bash
# Project memory
~/.claude/FINDERR_PROJECT_MEMORY.md

# Current status
# ✅ v4.2.0+230 - Cross-platform sync validated
# ✅ Samsung S20 testing complete
# ✅ Web/SMS bidirectional emergency sync
# Production ready for Android launch
```

---

## 🔍 Session Recovery (Mobile Emergency)

### Visual Recovery Workflow
If session hung/stuck and you have a screenshot:

1. **Provide screenshot** to Claude Code
2. **Claude reads screenshot** to identify context
3. **Claude uses project script**: `/home/wolfy/.local/bin/hub-sessions` or `finderr-sessions`
4. **Match context** to session description
5. **Resume**: `claude resume <session-id>`

### Session Scripts Available
```bash
/home/wolfy/.local/bin/hub-sessions        # Hub project sessions
/home/wolfy/.local/bin/finderr-sessions    # FINDERR sessions
```

---

## 💡 Mobile-Optimized Workflows

### Quick Analysis
```bash
/analyze [file/module] --uc --think
```

### Fast Implementation
```bash
/implement [feature] --uc --persona-[domain]
```

### Emergency Fix
```bash
/troubleshoot [symptom] --think-hard --persona-analyzer
```

### Documentation Update
```bash
/document [target] --persona-scribe=en
```

### Quality Improvement
```bash
/improve [target] --loop --iterations 3
```

---

## 🚨 Mobile Emergency Commands

### Git Lock File Issue
```bash
rm -f .git/index.lock
```

### Check Repository Status
```bash
git status -uno              # Fast status (skip untracked)
git log --oneline -5         # Recent commits
git branch -vv               # Branch tracking info
```

### Quick Commit Pattern
```bash
git add [specific-files]     # Stage only what's needed
git commit -m "[concise-message]"
git push origin [branch-name]
```

---

## 📱 Mobile Best Practices

### Token Efficiency
- Use `--uc` flag for 30-50% token savings
- Request specific files rather than broad searches
- Use `--answer-only` for direct responses

### Parallel Operations
- Batch independent tool calls in single message
- Use `--delegate auto` for large operations
- Enable `--wave-mode` for complex multi-step work

### Context Preservation
- Reference session handoff documents
- Load project memory files explicitly
- Use timestamp-based file naming (YYYY-MM-DD)

---

## 🔗 Essential File Paths

### Framework Core (Desktop)
```bash
~/.claude/CLAUDE.md                    # Entry point
~/.claude/COMMANDS.md                  # Command reference
~/.claude/FLAGS.md                     # Flag system
~/.claude/PERSONAS.md                  # Persona specs
~/.claude/ORCHESTRATOR.md              # Routing system
~/.claude/FINDERR_PROJECT_MEMORY.md    # Project knowledge
```

### Hub Project (Current)
```bash
CLAUDE.md                              # Project guide
DOCUMENTATION_TREE_2025-01-14.md       # Doc hierarchy
SESSION_HANDOFF_2025-10-26_*.md        # Latest context
automation/social_media/               # Automation engine
```

---

## 🎯 Common Mobile Scenarios

### Scenario 1: Quick Code Review
```bash
/analyze [file] --uc --focus quality --persona-analyzer
```

### Scenario 2: Emergency Bug Fix
```bash
/troubleshoot "[symptom]" --think-hard --persona-analyzer --validate
```

### Scenario 3: Feature Implementation
```bash
/implement "[feature]" --persona-[domain] --seq --validate
```

### Scenario 4: Documentation Update
```bash
/document [target] --persona-scribe=en --uc
```

### Scenario 5: Performance Issue
```bash
/analyze [component] --focus performance --persona-performance --think
```

---

## ✅ Mobile Access Checklist

Before starting work on mobile/web:

- [ ] Load relevant project memory file
- [ ] Check latest SESSION_HANDOFF document
- [ ] Enable `--uc` for token efficiency
- [ ] Use specific file paths (not broad searches)
- [ ] Set appropriate persona for domain
- [ ] Enable MCP servers as needed
- [ ] Use parallel tool calls when possible

---

## 🆘 Mobile Support Resources

### If Framework Not Loading
1. Reference this document directly
2. Load project CLAUDE.md for context
3. Check SESSION_HANDOFF files for latest status
4. Use explicit persona/flag activation

### If Session Recovery Needed
1. Take screenshot of current state
2. Provide to Claude Code
3. Use project-specific session script
4. Resume with matched session ID

### If Token Limit Approaching
1. Enable `--uc` immediately
2. Request specific files only
3. Use `--answer-only` for direct responses
4. Consider `--delegate auto` for large ops

---

**Last Updated**: 2025-10-26
**Framework Version**: SuperClaude v2.0 (Orchestrator Persona Integration)
**Mobile Optimization**: ✅ COMPLETE

**Quick GitHub Access**: Upload to Gist for universal URL access
