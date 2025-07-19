# Mentara - AI-Powered Mental Health Platform

![Mentara Logo](https://img.shields.io/badge/Mentara-Mental%20Health%20Platform-blue)
![Development Status](https://img.shields.io/badge/Status-Active%20Development-green)
![Architecture](https://img.shields.io/badge/Architecture-Microservices-purple)

## 🎯 Project Overview

Mentara is a comprehensive mental health platform that connects patients with therapists, featuring therapy sessions, community support, interactive worksheets, mental health assessments, and AI-driven patient evaluation. Built with modern technologies and a microservices architecture designed for scalability, maintainability, and independent deployment.

**Key Features:**
- 🔐 JWT-based authentication with role-based access control
- 💬 Real-time messaging with WebSocket integration  
- 📹 WebRTC video consultations
- 🧠 AI-powered mental health assessments using PyTorch
- 🛡️ AI content moderation for community safety
- 📊 Comprehensive analytics and reporting
- 🏥 HIPAA-compliant data handling

## 🏗️ Architecture

### Microservices Structure
```
mentara/
├── mentara-api/             # NestJS 11.x Backend (TypeScript)
│   ├── docker-compose.yml   # Service-specific Docker setup
│   ├── Dockerfile          # Container build configuration
│   ├── Makefile           # Service automation commands
│   └── README.md          # Backend service documentation
├── mentara-client/          # Next.js 15.2.4 Frontend (TypeScript)
│   ├── docker-compose.yml   # Service-specific Docker setup
│   ├── Dockerfile          # Container build configuration
│   ├── Makefile           # Service automation commands
│   └── README.md          # Frontend service documentation
├── ai-patient-evaluation/   # Flask ML Service (Python/PyTorch)
│   ├── docker-compose.yml   # Service-specific Docker setup
│   ├── Dockerfile          # Container build configuration
│   ├── Makefile           # Service automation commands
│   └── README.md          # AI evaluation service documentation
├── ai-content-moderation/   # Flask AI Moderation (Ollama/mxbai-embed-large)
│   ├── docker-compose.yml   # Service-specific Docker setup
│   ├── Dockerfile          # Container build configuration
│   ├── Makefile           # Service automation commands
│   └── README.md          # AI moderation service documentation
├── Makefile                # Root orchestration commands
├── run.sh                  # Service coordination script
└── README.md              # Project overview and setup guide
```

### Independent Service Deployment
Each service operates independently with:
- **Individual Docker environments** - Service-specific containers and dependencies
- **Isolated configuration** - Service-level environment variables and settings  
- **Independent scaling** - Services can be scaled individually based on demand
- **Service-specific automation** - Each service has its own Makefile for common tasks
- **Dedicated documentation** - Complete setup and usage guides per service

### Database & Infrastructure
- **Database**: Supabase PostgreSQL (Database as a Service)
- **Caching**: Redis for session management and performance optimization
- **File Storage**: Supabase Storage for file uploads and asset management
- **Authentication**: JWT-based local authentication system
- **Real-time**: WebSocket integration for messaging and live features

## 🤖 AI Development Team Structure

This project is being developed by a coordinated team of 4 AI agents, each with specialized responsibilities and clear areas of ownership.

### 👑 Manager Agent (Lead Coordinator & Research Specialist)
**Primary Responsibilities:**
- Overall project coordination and sprint planning
- Task delegation and workload distribution
- Architecture decisions and technical direction
- Code review oversight and quality assurance
- Integration testing and deployment coordination
- Cross-team communication and conflict resolution
- Progress tracking and milestone management
- Documentation maintenance and updates

**🔬 Enhanced Research & Testing Leadership:**
- **Research Coordinator**: Lead research initiatives using MCP tools (Context7, Brave-search, Sequential-thinking)
- **Testing Strategy Architect**: Design and coordinate comprehensive testing approaches across all agents
- **Cross-Agent Testing Support**: Provide testing consultation and implementation assistance
- **Knowledge Synthesis**: Aggregate research findings and best practices for team-wide application
- **Quality Gate Enforcement**: Ensure all testing standards and coverage requirements are met

**Domains:**
- Project management and planning
- System architecture decisions
- DevOps and deployment strategies
- Quality assurance and testing oversight
- Team coordination and communication
- **Research leadership and coordination**
- **Cross-functional testing strategy and support**

---

### 🎨 Frontend Agent (UI/UX Specialist)
**Primary Responsibilities:**
- Next.js 15.2.4 application development
- React component architecture and design systems
- State management with Zustand and React Query
- UI/UX implementation with Tailwind CSS and shadcn/ui
- Authentication flow with JWT-based local authentication
- Responsive design and accessibility
- Performance optimization for client-side rendering

**Domains:**
- `mentara-client/` directory ownership
- All React components and pages
- Client-side routing and navigation
- Form handling and validation
- Frontend testing and optimization
- User experience and interface design

**Key Technologies:**
- Next.js 15.2.4, TypeScript, Tailwind CSS
- React Query v5, Zustand, React Hook Form
- JWT Authentication, shadcn/ui, Framer Motion

---

### ⚙️ Backend Agent (API Specialist)
**Primary Responsibilities:**
- NestJS API development and architecture
- Database schema design with Prisma ORM
- Authentication and authorization systems
- RESTful API endpoints and business logic
- Real-time features with Socket.io
- Database migrations and data management
- Security implementations and best practices

**Domains:**
- `mentara-api/` directory ownership
- All NestJS modules and controllers
- Prisma schema and database operations
- API security and authentication
- Server-side business logic
- Database optimization and queries

**Key Technologies:**
- NestJS 11.x, TypeScript, Prisma ORM
- PostgreSQL, Socket.io, JWT Authentication
- JWT Authentication, Multer File Handling

---

### 🧠 AI/DevOps Agent (ML & Infrastructure Specialist)
**Primary Responsibilities:**
- Python Flask ML service development
- PyTorch model optimization and training
- Mental health assessment algorithms
- CI/CD pipeline setup and maintenance
- Testing automation and quality assurance
- Performance monitoring and optimization
- Infrastructure management and scaling

**🔧 Backend Support Protocol:**
When primary AI/ML tasks are complete, provide overflow support to Backend Agent:
- API testing infrastructure and automation
- Database performance optimization and monitoring
- Security testing implementation and validation
- Load testing setup and execution
- Backend deployment pipeline enhancement
- Performance bottleneck analysis and resolution

**Domains:**
- `ai-patient-evaluation/` directory ownership
- Machine learning model development
- DevOps and deployment pipelines
- Automated testing frameworks
- Performance monitoring tools
- Infrastructure as code
- **Backend Agent overflow support and assistance**

**Key Technologies:**
- Flask, Python, PyTorch, NumPy
- Docker, CI/CD, Testing Frameworks
- Performance Monitoring, Infrastructure Tools

## 🤝 Collaboration Protocols

### Daily Workflow
1. **Morning Sync**: Manager Agent reviews overnight progress and assigns daily tasks
2. **Focused Development**: Each agent works on their domain-specific tasks
3. **Integration Points**: Agents coordinate when working on cross-domain features
4. **Evening Review**: Manager Agent reviews completed work and plans next day

### Communication Guidelines
- **Direct Coordination**: Agents communicate directly when working on interconnected features
- **Manager Escalation**: Complex architectural decisions or conflicts go through Manager Agent
- **Research Coordination**: Manager Agent leads research initiatives and shares findings with all agents
- **Testing Consultation**: All agents can request testing strategy support from Manager Agent
- **Documentation**: All significant changes must be documented in relevant files
- **Code Reviews**: Cross-agent code reviews for critical system integrations

### Enhanced Handoff Procedures
- **Frontend ↔ Backend**: API contracts and data models must be agreed upon
- **Backend ↔ AI Service**: ML model integration points require coordination
- **All ↔ DevOps**: Deployment and testing procedures must be validated
- **Manager → All Agents**: Research findings and testing strategies shared
- **AI/DevOps → Backend**: Overflow support when primary tasks complete

### Research & Testing Coordination Matrix
```
Manager Agent (Research Lead)
├── Research Coordination → All Agents
├── Testing Strategy → All Agents  
├── Quality Gates → All Agents
└── Knowledge Synthesis → Team-wide

AI/DevOps Agent (Overflow Support)
├── Primary: ML & Infrastructure
└── Secondary: Backend Agent Support
    ├── API Testing Infrastructure
    ├── Database Performance
    ├── Security Testing
    └── Load Testing
```

## 📋 Current Sprint Objectives

### ✅ **COMPLETED: Clerk to Local Auth Migration**
- [x] **Backend Agent**: Implemented JWT authentication system, migrated 30+ controllers, updated WebSocket auth
- [x] **Frontend Agent**: Replaced ClerkProvider with JWT auth, updated all auth hooks, migrated middleware
- [x] **AI/DevOps Agent**: Created comprehensive testing infrastructure, security validation, rollback procedures
- [x] **Manager**: Coordinated WebSocket integration, ensured security standards, updated documentation

### 🛡️ **NEW: AI-Powered Content Moderation System**
- [ ] **AI/DevOps Agent**: Build ai-content-moderation service, integrate Ollama mxbai-embed-large, fine-tune on toxic datasets
- [ ] **Backend Agent**: Integrate moderation API with posts/comments, create moderator review queue
- [ ] **Frontend Agent**: Build moderator dashboard, user appeals system, content status indicators
- [ ] **Manager**: Define moderation policies, coordinate testing, ensure mental health platform safety

### 🎯 **Ongoing Platform Features**
- [x] Real-time messaging system (WebSocket implementation complete)
- [x] Video session capabilities (WebRTC integration operational)
- [ ] Enhanced community safety with AI moderation
- [ ] Secure local authentication system
- [ ] Comprehensive testing and monitoring

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/bun
- Python 3.9+ with pip
- Docker and Docker Compose (recommended)
- Make utility
- Supabase account (database as a service)

### Quick Start (Recommended)
```bash
# First-time setup - installs dependencies and configures environment
./run.sh setup

# Start all services in development mode
./run.sh start
# or with Make: make dev

# Check service health
./run.sh status
# or with Make: make status
```

### Manual Setup (Alternative)
```bash
# Setup each service individually
make setup-dev

# Start services manually
make dev-local        # Start without Docker
# or
make start            # Start with Docker Compose

# Individual service management
./run.sh api          # Start only backend API
./run.sh client       # Start only frontend
./run.sh ai-eval      # Start only AI evaluation
./run.sh ai-mod       # Start only AI moderation
```

### Service Endpoints
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001  
- **AI Patient Evaluation**: http://localhost:5000
- **AI Content Moderation**: http://localhost:5001

## 📚 Documentation

- **[PROJECT_DOCS_INDEX.md](./PROJECT_DOCS_INDEX.md)** - 📚 Complete navigation guide to all organized documentation
- **[TEAM_MANAGEMENT_ROLES.md](./TEAM_MANAGEMENT_ROLES.md)** - 4-agent team structure, roles, and coordination framework
- **[CLAUDE.md](./CLAUDE.md)** - Comprehensive development guidelines and conventions

### 📁 Organized Documentation
All project documentation has been organized into [`project-docs/`](./project-docs/) with logical categorization:
- **Team Coordination** - Active management and progress tracking
- **Agent Directives** - Specific tasks and instructions for each agent
- **Technical Docs** - Architecture, deployment, and integration guides  
- **Reports & Analysis** - Audits, assessments, and technical analysis
- **Policies** - Security, moderation, and operational guidelines
- **Development** - Progress tracking and testing resources
- **Archive** - Historical documents and completed phases

## 🔧 Development Commands

### Global Service Management
```bash
# Service orchestration with run.sh
./run.sh setup       # Complete environment setup
./run.sh start       # Start all services  
./run.sh stop        # Stop all services
./run.sh restart     # Restart all services
./run.sh status      # Check service health
./run.sh logs        # View all service logs
./run.sh test        # Run tests for all services

# Individual services
./run.sh api         # Start only backend API
./run.sh client      # Start only frontend
./run.sh ai-eval     # Start only AI evaluation
./run.sh ai-mod      # Start only AI moderation
```

### Global Service Management with Make
```bash
# Development workflow
make help            # Show all available commands
make dev             # Start all services in development mode
make dev-local       # Start without Docker (faster)
make start           # Start with Docker Compose
make stop            # Stop all services
make status          # Check service health
make logs            # View logs from all services

# Quality assurance
make test            # Run tests for all services
make lint            # Run linting for all services
make format          # Format code for all services

# Environment setup
make setup-dev       # Complete development setup
make install         # Install dependencies for all services
```

### Individual Service Commands
Each service has its own Makefile with service-specific commands:

```bash
# Backend (mentara-api/)
cd mentara-api
make dev             # Start development server
make test            # Run tests
make db-migrate      # Database migrations
make db-seed         # Seed database

# Frontend (mentara-client/)  
cd mentara-client
make dev             # Start development server
make build           # Production build
make lint            # ESLint checking

# AI Services (ai-patient-evaluation/, ai-content-moderation/)
cd ai-patient-evaluation  # or ai-content-moderation
make dev             # Start Flask server
make test            # Run service tests
make setup           # Setup models and dependencies
```

## 🎯 Success Metrics

### Code Quality
- All TypeScript strict mode compliance
- 90%+ test coverage on critical paths
- Zero security vulnerabilities
- Performance benchmarks met

### Team Efficiency  
- Daily standup completion rate
- Cross-agent collaboration frequency
- Issue resolution time
- Documentation completeness

### Product Delivery
- Feature completion against timeline
- User acceptance criteria met
- Performance requirements satisfied
- Security standards compliance

## 🔒 Security & Privacy

- HIPAA compliance considerations for health data
- End-to-end encryption for sensitive communications
- Regular security audits and vulnerability assessments
- Privacy-by-design architecture principles

## 📞 Support & Contact

**Team Lead**: Manager Agent
**Technical Issues**: Escalate through Manager Agent
**Architecture Questions**: Consult CLAUDE.md and architecture.md

---

*This README is maintained by the Manager Agent and updated regularly to reflect current project status and team structure.*