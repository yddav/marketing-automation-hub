# 🔄 Automated Hub Engine - Git Workflow

**Professional git workflow for enterprise product development**

## 🌟 Branch Strategy

### **Main Development Branches**

#### `automated-hub-engine/main`
- **Purpose**: Main development branch
- **Status**: Active development
- **Merges From**: Feature branches, hotfixes
- **Protected**: Yes (requires PR review)
- **Auto-Deploy**: No

#### `automated-hub-engine/staging` 
- **Purpose**: Staging environment testing
- **Status**: Pre-production testing
- **Merges From**: `automated-hub-engine/main`
- **Protected**: Yes 
- **Auto-Deploy**: To staging.hub.untrapd.com

#### `automated-hub-engine/production`
- **Purpose**: Production releases
- **Status**: Live production code
- **Merges From**: `automated-hub-engine/staging` (tested)
- **Protected**: Yes (requires approval)
- **Auto-Deploy**: To hub.untrapd.com

### **Feature Development Branches**

#### `feature/ahe-[feature-name]`
- **Purpose**: New feature development
- **Naming**: `feature/ahe-analytics-dashboard`
- **Base**: `automated-hub-engine/main`
- **Merge To**: `automated-hub-engine/main` (via PR)

#### `hotfix/ahe-[issue-name]`
- **Purpose**: Critical production fixes
- **Naming**: `hotfix/ahe-form-validation`
- **Base**: `automated-hub-engine/production`
- **Merge To**: Both `main` and `production`

#### `release/ahe-v[version]`
- **Purpose**: Release preparation
- **Naming**: `release/ahe-v1.1.0`
- **Base**: `automated-hub-engine/main`
- **Merge To**: `automated-hub-engine/staging` → `production`

## 🚀 Development Workflow

### **1. Feature Development**
```bash
# Start new feature
git checkout automated-hub-engine/main
git pull origin automated-hub-engine/main
git checkout -b feature/ahe-new-feature

# Development work...
git add .
git commit -m "feat: add new analytics dashboard"

# Push and create PR
git push origin feature/ahe-new-feature
# Create PR to automated-hub-engine/main
```

### **2. Staging Deployment**
```bash
# Merge tested features to staging
git checkout automated-hub-engine/staging
git pull origin automated-hub-engine/staging
git merge automated-hub-engine/main

# Deploy to staging
./deploy-staging.sh

# Test staging environment
# http://localhost:8080/apps/automated-hub-engine/
```

### **3. Production Release**
```bash
# After staging validation
git checkout automated-hub-engine/production
git pull origin automated-hub-engine/production
git merge automated-hub-engine/staging

# Tag release
git tag -a v1.1.0 -m "Release v1.1.0: New analytics dashboard"

# Deploy to production
./deploy.sh

# Push tags
git push origin automated-hub-engine/production --tags
```

### **4. Hotfix Process**
```bash
# Critical production issue
git checkout automated-hub-engine/production
git checkout -b hotfix/ahe-critical-fix

# Fix and test
git add .
git commit -m "fix: resolve contact form validation issue"

# Merge to production
git checkout automated-hub-engine/production
git merge hotfix/ahe-critical-fix

# Also merge to main
git checkout automated-hub-engine/main
git merge hotfix/ahe-critical-fix

# Deploy immediately
./deploy.sh
```

## 📝 Commit Message Standards

### **Format**
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### **Types**
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting)
- **refactor**: Code refactoring
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **build**: Build system changes
- **ci**: CI/CD changes
- **chore**: Other changes

### **Scopes**
- **landing**: Landing page changes
- **core**: Core engine changes
- **deploy**: Deployment scripts
- **api**: API changes
- **analytics**: Analytics and tracking
- **ui**: User interface changes

### **Examples**
```bash
feat(landing): add enterprise pricing calculator
fix(core): resolve onboarding flow timeout issue
docs(deploy): update staging deployment guide
perf(analytics): optimize event tracking performance
```

## 🔒 Branch Protection Rules

### **Protected Branches**
- `automated-hub-engine/main`
- `automated-hub-engine/staging` 
- `automated-hub-engine/production`

### **Protection Settings**
- **Require PR reviews**: 1 reviewer minimum
- **Require status checks**: All CI tests pass
- **Require up-to-date branches**: Must be current with target
- **Restrict pushes**: Only via approved PRs
- **Require signed commits**: For production security

## 🚀 Release Management

### **Version Numbering**
- **Format**: `v{MAJOR}.{MINOR}.{PATCH}`
- **Major**: Breaking changes, architecture updates
- **Minor**: New features, significant improvements
- **Patch**: Bug fixes, small improvements

### **Release Process**
1. **Development**: Features in `automated-hub-engine/main`
2. **Staging**: Test in `automated-hub-engine/staging`
3. **Release Branch**: Create `release/ahe-v1.1.0`
4. **QA Testing**: Final validation on staging
5. **Production**: Merge to `automated-hub-engine/production`
6. **Tag**: Create semantic version tag
7. **Deploy**: Production deployment
8. **Announce**: Update changelog and notify stakeholders

### **Changelog Maintenance**
```markdown
# Changelog

## [v1.1.0] - 2025-07-30
### Added
- Enterprise analytics dashboard
- Advanced form validation
- Performance monitoring

### Fixed
- Contact form submission timeout
- Mobile responsive issues

### Changed
- Updated branding integration
```

## 🔧 Development Setup

### **Clone Repository**
```bash
git clone <repository-url>
cd automated-hub-engine
git checkout automated-hub-engine/main
```

### **Setup Development Environment**
```bash
# Install dependencies (if any)
npm install

# Setup staging environment
./deploy-staging.sh

# Start development
# Edit files in landing-page/
# Test at http://localhost:8080/apps/automated-hub-engine/
```

### **Pre-commit Hooks**
```bash
# Install pre-commit hooks
git config core.hooksPath .githooks

# Hooks include:
# - Lint checking
# - Format validation
# - Security scanning
# - Test execution
```

## 📊 Integration with Hub Portfolio

### **Main Repository Integration**
- **Submodule**: Add as git submodule to main hub repository
- **Deployment**: Coordinate with main hub deployment pipeline
- **Analytics**: Shared analytics configuration
- **Branding**: Consistent with main hub branding

### **Cross-Repository Workflow**
```bash
# In main hub repository
git submodule add <ahe-repo-url> apps/automated-hub-engine
git submodule update --init --recursive

# Update AHE in main hub
cd apps/automated-hub-engine
git pull origin automated-hub-engine/production
cd ../..
git add apps/automated-hub-engine
git commit -m "chore: update Automated Hub Engine to v1.1.0"
```

---

**🎯 Current Status**: All branches ready for enterprise development workflow
**🚀 Next Steps**: Begin feature development and staging validation