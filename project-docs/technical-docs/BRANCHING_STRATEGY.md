# 🌳 Mentara Git Branching Strategy & Workflow

**Objective**: Establish clean, organized Git workflow for 4-agent AI development team with proper branch management, testing gates, and integration procedures.

## 🧠 ENHANCED MCP-POWERED DEVELOPMENT WORKFLOW

### Intelligent Development Decision Making

#### 🎯 ULTRATHINK Branch Planning
**Before creating any feature branch:**
```
Use mcp__sequential-thinking__sequentialthinking to:
- Analyze feature complexity and scope
- Plan implementation strategy and dependencies
- Design testing approach and validation criteria
- Identify potential integration challenges
```

#### 📚 Context7 Technology Research  
**For implementation decisions:**
```
Before implementing new features:
- mcp__context7__resolve-library-id for relevant frameworks
- mcp__context7__get-library-docs for latest implementation patterns
- Research best practices for the specific technology stack
```

#### 🔍 Brave-Search Development Best Practices
**For informed development decisions:**
```
Use mcp__brave-search__sequentialthinking to research:
- "Git workflow best practices for teams 2024"
- "[Technology] implementation patterns and best practices"
- "Code review strategies and quality gates"
- "Branch management for complex features"
```

#### 🔬 Enhanced Serena Pre-Development Analysis
**Before code changes:**
```
Use mcp__serena__get_symbols_overview for understanding existing architecture
Use mcp__serena__find_symbol for analyzing specific components to modify
Use mcp__serena__think_about_task_adherence before making changes
Use mcp__serena__think_about_whether_you_are_done for feature completion
Use mcp__serena__summarize_changes for clear commit messages and PR descriptions
```

---

## 🏗️ Branch Structure

### Main Branches
```
master              # Production-ready code (protected)
├── dev             # Main development branch (protected)
├── staging         # Pre-production testing (protected)
└── hotfix/*        # Critical production fixes
```

### Feature Branch Patterns
```
dev
├── frontend/feature/authentication-overhaul
├── frontend/fix/api-integration-errors
├── backend/feature/complete-testing-suite
├── backend/fix/dto-validation-errors
├── ai/feature/model-optimization
├── ai/fix/error-handling-improvements
├── devops/feature/ci-cd-pipeline
├── devops/fix/docker-configuration
├── integration/feature/cross-service-testing
└── docs/update/api-documentation
```

---

## 🎯 Branch Naming Conventions

### By Agent Role
| Agent | Prefix | Examples |
|-------|--------|----------|
| **Frontend Agent** | `frontend/` | `frontend/feature/component-testing`<br>`frontend/fix/auth-redirect-bug` |
| **Backend Agent** | `backend/` | `backend/feature/controller-testing`<br>`backend/fix/dto-validation` |
| **AI/DevOps Agent** | `ai/` or `devops/` | `ai/feature/model-improvements`<br>`devops/feature/monitoring-setup` |
| **Manager Agent** | `integration/` or `arch/` | `integration/feature/service-testing`<br>`arch/refactor/database-optimization` |

### By Task Type
| Type | Pattern | Description |
|------|---------|-------------|
| **Feature** | `{agent}/feature/{description}` | New functionality or major improvements |
| **Fix** | `{agent}/fix/{description}` | Bug fixes and corrections |
| **Test** | `{agent}/test/{description}` | Testing infrastructure and test additions |
| **Refactor** | `{agent}/refactor/{description}` | Code restructuring without functionality changes |
| **Docs** | `docs/{description}` | Documentation updates |
| **Config** | `config/{description}` | Configuration and setup changes |

### Branch Naming Rules
- Use lowercase with hyphens (kebab-case)
- Be descriptive but concise (max 50 characters)
- Include ticket/issue number if applicable: `frontend/feature/AUTH-123-oauth-integration`
- Avoid abbreviations unless commonly understood

---

## 🔄 Workflow Process

### 1. Starting New Work
```bash
# 1. Ensure you're on latest dev
git checkout dev
git pull origin dev

# 2. Create new feature branch
git checkout -b frontend/feature/api-integration-testing

# 3. Start working and commit regularly
git add .
git commit -m "feat(api): add service integration tests

- Add comprehensive testing for user service
- Mock axios responses for consistent testing
- Validate error handling scenarios"
```

### 2. Commit Message Standards
```
<type>(<scope>): <subject>

<body>

<footer>
```

#### Commit Types
- `feat`: New feature
- `fix`: Bug fix
- `test`: Adding/updating tests
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `chore`: Maintenance tasks

#### Examples
```bash
git commit -m "feat(auth): implement role-based route protection

- Add middleware for checking user roles
- Implement redirect logic for unauthorized access
- Add comprehensive tests for all role scenarios

Closes #123"

git commit -m "fix(api): resolve booking service endpoint mismatch

- Update booking service to match backend API changes
- Fix date format handling in booking requests
- Add proper error handling for failed bookings"

git commit -m "test(backend): add comprehensive controller testing

- Implement unit tests for all auth controllers
- Add integration tests for booking workflow
- Achieve 95% test coverage on critical paths"
```

### 3. Integration & Testing Process

#### Before Creating Pull Request
```bash
# 1. Ensure all tests pass locally
npm run test           # Frontend tests
npm run test:e2e       # Backend API tests (in mentara-api/)
python -m pytest      # AI service tests (in ai-patient-evaluation/)

# 2. Run linting and formatting
npm run lint           # Fix any linting errors
npm run format         # Apply code formatting

# 3. Rebase on latest dev (keep history clean)
git checkout dev
git pull origin dev
git checkout your-feature-branch
git rebase dev

# 4. Push and create PR
git push origin frontend/feature/api-integration-testing
```

#### Pull Request Template
```markdown
## 🎯 Purpose
Brief description of what this PR accomplishes

## 🏗️ Changes Made
- [ ] Frontend changes (components, services, tests)
- [ ] Backend changes (controllers, services, tests)  
- [ ] AI/ML changes (model, API, optimization)
- [ ] Infrastructure changes (CI/CD, Docker, monitoring)
- [ ] Documentation updates

## 🧪 Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed
- [ ] Performance impact assessed

## 🔗 Dependencies
- Depends on: #[issue-number]
- Blocks: #[issue-number]
- Related PRs: #[pr-number]

## 📋 Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Tests pass locally
- [ ] Documentation updated
- [ ] No breaking changes (or documented)

## 🎭 Agent Role
**Agent**: [Frontend/Backend/AI-DevOps/Manager]
**Phase**: [1-6] **Hour**: [X of total estimated]

## 📊 Impact Assessment
**Performance**: No impact / Improved / Needs attention
**Security**: No changes / Enhanced / Needs review
**Breaking Changes**: None / Minor / Major (documented)
```

---

## 🚦 Branch Protection & Rules

### Protected Branches
| Branch | Protection Rules |
|--------|------------------|
| **master** | • Require PR reviews (2 approvals)<br>• Require status checks<br>• No direct pushes<br>• Require up-to-date branches |
| **dev** | • Require PR reviews (1 approval)<br>• Require status checks<br>• No direct pushes<br>• Auto-delete head branches |
| **staging** | • Require status checks<br>• Auto-merge from dev on success |

### Status Checks Required
- [ ] Frontend tests pass (`npm run test`)
- [ ] Backend tests pass (`npm run test:e2e`)
- [ ] AI service tests pass (`pytest`)
- [ ] Linting passes (all projects)
- [ ] Build succeeds (all projects)
- [ ] Security scan passes
- [ ] Performance regression check

---

## 🤝 Agent Collaboration Workflow

### Cross-Agent Dependencies
When work depends on another agent's changes:

#### Option 1: Sequential Development
```bash
# Backend Agent completes API changes first
backend/feature/api-endpoint-updates

# Frontend Agent branches from that feature
git checkout backend/feature/api-endpoint-updates
git checkout -b frontend/feature/integrate-new-api

# Merge backend changes first, then frontend
```

#### Option 2: Draft PRs with Early Integration
```bash
# Create draft PRs for early collaboration
gh pr create --draft --title "WIP: API endpoint updates"

# Other agents can review and plan integration
# Mark as ready when complete
gh pr ready
```

### Integration Branch Strategy
For major cross-service features:
```bash
# Manager creates integration branch
git checkout -b integration/feature/complete-booking-workflow

# Each agent contributes via feature branches
frontend/feature/booking-ui → integration/feature/complete-booking-workflow
backend/feature/booking-api → integration/feature/complete-booking-workflow
ai/feature/booking-analytics → integration/feature/complete-booking-workflow

# Final integration testing on integration branch
# Merge to dev when all agents complete and integrate successfully
```

---

## 🔄 Release Workflow

### Development Cycle
```
feature branches → dev → staging → master
```

### Sprint Release Process
1. **Development Phase** (Hours 1-40)
   - All agents work on feature branches
   - Regular integration to dev branch
   - Continuous testing and validation

2. **Integration Phase** (Hours 41-48)
   - All features merged to staging
   - Full integration testing
   - Performance and security validation

3. **Release Phase** (Hours 49-56)
   - Staging → master merge
   - Production deployment
   - Post-deployment verification

### Hotfix Process
```bash
# For critical production fixes
git checkout master
git pull origin master
git checkout -b hotfix/critical-auth-bug

# Fix, test, and create PR directly to master
# After merge, also merge to dev
git checkout dev
git merge master
```

---

## 📋 Git Commands Cheat Sheet

### Daily Workflow
```bash
# Start new work
git checkout dev && git pull origin dev
git checkout -b frontend/feature/new-feature

# Regular commits
git add . && git commit -m "feat(scope): description"

# Push work
git push origin frontend/feature/new-feature

# Update branch with latest dev
git fetch origin dev
git rebase origin/dev

# Clean up after merge
git checkout dev && git pull origin dev
git branch -d frontend/feature/new-feature
```

### Emergency Commands
```bash
# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# Stash current work
git stash push -m "WIP: working on feature X"
git stash pop

# Cherry-pick specific commit
git cherry-pick <commit-hash>

# Interactive rebase to clean up history
git rebase -i HEAD~3
```

---

## 🎯 Success Metrics

### Branch Management KPIs
- **Average PR size**: < 500 lines changed
- **PR review time**: < 4 hours
- **Build success rate**: > 95%
- **Merge conflicts**: < 5% of PRs
- **Branch lifetime**: < 48 hours

### Quality Gates
- **Test Coverage**: > 90% (Frontend), > 95% (Backend)
- **Performance**: No regression > 10%
- **Security**: Zero high/critical vulnerabilities
- **Documentation**: All public APIs documented

---

**🎯 OBJECTIVE**: Eliminate messy Git history and establish professional development workflow that enables rapid, high-quality collaborative development across all 4 AI agents.**