# Mentara Client

The frontend service for Mentara, a comprehensive mental health platform that connects patients with therapists through modern web technologies.

## 🏗️ Project Overview

Mentara Client is a production-ready Next.js application providing:
- **Therapy Sessions** - WebRTC video consultations with licensed therapists
- **Community Support** - Illness-specific support groups with AI moderation
- **Mental Health Assessments** - AI-powered patient evaluations
- **Real-time Messaging** - Secure communication platform
- **Interactive Worksheets** - Therapy assignments and progress tracking

## 🚀 Architecture

### Technology Stack
- **Framework**: Next.js 15.2.4 with App Router and TypeScript
- **Styling**: Tailwind CSS 4.x with shadcn/ui components
- **State Management**: Zustand (client state) + React Query v5 (server state)
- **Authentication**: JWT-based local authentication with role-based access
- **Real-time Communication**: Socket.io WebSockets + WebRTC for video
- **File Storage**: Supabase Storage integration
- **Payment Processing**: Stripe API integration
- **HTTP Client**: Axios with interceptors for auth and error handling
- **Forms & Validation**: React Hook Form with Zod schemas
- **UI Components**: Radix UI primitives with shadcn/ui design system
- **Testing**: Jest (unit) + Playwright (e2e)

## 🔧 Development Setup

### Prerequisites
- Node.js 18+
- Docker and Docker Compose (for containerized development)
- npm or bun

### Installation

1. **Clone and install dependencies**:
```bash
git clone <repository-url>
cd mentara-client
npm install
```

2. **Environment setup**:
```bash
cp .env.example .env.local
# Configure API endpoints, authentication keys, and Supabase credentials
```

3. **Start development server**:
```bash
npm run dev     # Start with hot reload
```

The application will be available at `http://localhost:3000`

## 🧪 Testing

### Unit Tests
```bash
npm run test          # Run all unit tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run with coverage report
```

### End-to-End Tests
```bash
npm run test:e2e      # Run Playwright e2e tests
npm run test:e2e:ui   # Run e2e tests with UI
```

## 🛠️ Development Commands

### Using Make (Recommended)
```bash
# Development
make dev                 # Start with hot reload
make dev-turbo          # Start with Turbopack
make build              # Build for production
make start              # Start production server

# Docker Compose
make compose-up         # Start services with docker-compose
make compose-up-d       # Start services in background
make compose-down       # Stop and remove containers
make compose-logs       # View container logs

# Code Quality
make lint               # Run ESLint checks
make format             # Format with Prettier
make type-check         # Run TypeScript checks
make test               # Run all tests

# Environment
make setup-env          # Setup environment variables
make setup-dev          # Complete development setup
```

### Using npm directly
```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server

# Testing
npm run test             # Run unit tests
npm run test:watch       # Run tests in watch mode
npm run test:e2e         # Run end-to-end tests

# Code Quality
npm run lint             # Run ESLint checks
npm run type-check       # Run TypeScript checks
npm run format           # Format code with Prettier
```

## 🌟 Key Features

### 🔐 **Authentication & Security**
- JWT-based local authentication with refresh token rotation
- Role-based access control (Client, Therapist, Moderator, Admin)
- Email verification and secure password reset
- Session management across multiple devices

### 🏥 **Telehealth Platform**
- **Video Consultations**: WebRTC-powered video calls with therapists
- **Real-time Messaging**: Secure chat system with read receipts and reactions
- **Session Scheduling**: Smart booking system with therapist availability
- **Worksheet Assignments**: Interactive therapy assignments and progress tracking

### 🤖 **AI-Powered Features**
- **Patient Evaluation**: 201-item mental health assessment with PyTorch ML
- **Therapist Recommendations**: AI-driven matching based on comprehensive criteria
- **Content Moderation**: Toxic language detection for community safety
- **Crisis Detection**: Automated identification of mental health emergencies

### 👥 **Community Support**
- **30+ Support Communities**: Illness-specific and general mental health groups
- **Safe Interactions**: AI-moderated discussions with human oversight
- **Anonymous Posting**: Optional anonymity for sensitive discussions
- **Peer Support**: Heart reactions, comments, and community engagement

### 📊 **Progress Tracking**
- **Therapy Progress**: Visual tracking of therapeutic goals and milestones
- **Mental Health Metrics**: Ongoing assessment and progress visualization
- **Session History**: Complete record of appointments and interactions
- **Worksheet Completion**: Track therapy assignments and insights

### 🛡️ **Safety & Moderation**
- **AI Content Filtering**: Real-time toxic content detection with <100ms response
- **Human Moderation**: Professional moderators for complex cases
- **Crisis Intervention**: Immediate support for users in crisis
- **Appeals System**: Fair process for content moderation decisions

## How to Contribute

We welcome contributions! Follow these steps to contribute:

### Branching Strategy

- **`dev`** – The main development branch where all feature branches merge before going to production.
- **`master`** – The production branch with stable releases.

### Branch Naming Convention

#### Frontend Branches

| Type     | Naming Convention                       | Example                                 |
| -------- | --------------------------------------- | --------------------------------------- |
| Feature  | `frontend/feature/{short-description}`  | `frontend/feature/therapist-matching`   |
| Bug Fix  | `frontend/fix/{short-description}`      | `frontend/fix/login-bug`                |
| Hotfix   | `frontend/hotfix/{short-description}`   | `frontend/hotfix/ui-crash`              |
| Refactor | `frontend/refactor/{short-description}` | `frontend/refactor/component-structure` |

#### Backend Branches

| Type     | Naming Convention                      | Example                            |
| -------- | -------------------------------------- | ---------------------------------- |
| Feature  | `backend/feature/{short-description}`  | `backend/feature/graphql-endpoint` |
| Bug Fix  | `backend/fix/{short-description}`      | `backend/fix/authentication-error` |
| Hotfix   | `backend/hotfix/{short-description}`   | `backend/hotfix/payment-issue`     |
| Refactor | `backend/refactor/{short-description}` | `backend/refactor/db-schema`       |

#### Documentation Branches

| Type        | Naming Convention          | Example                   |
| ----------- | -------------------------- | ------------------------- |
| Docs Update | `docs/{short-description}` | `docs/contribution-guide` |

### Contribution Steps

1. Fork the repository.
2. Create a new branch following the naming conventions.
3. Make your changes and commit with clear messages:

   ```sh
   git commit -m "frontend: add therapist matching UI"
   ```

4. Push your branch:

   ```sh
   git push origin frontend/feature/therapist-matching
   ```

5. Open a Pull Request (PR) to merge into the `dev` branch.
6. After review and testing, changes will be merged into `master` for production release.

## License

Mentara is licensed under the MIT License.

## Contact

For questions and collaboration, reach out to the team:

- **Tristan James Tolentino**
- **Adrian T. Sajulga**
- **Julia Laine Segundo**

📧 Contact Email: <derpykidyt@gmail.com>
