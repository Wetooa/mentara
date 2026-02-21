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
- **Framework**: Next.js 16.0.10
- **UI Library**: React 19.2.3
- **Language**: TypeScript 5.8.3
- **Styling**: Tailwind CSS 4.x with shadcn/ui components
- **State Management**: Zustand 5.0.3 (client state) + React Query 5.81.2 (server state)
- **Authentication**: JWT-based local authentication with role-based access
- **Real-time Communication**: Socket.io Client 4.8.1 (WebSockets) + Simple Peer 9.11.1 (WebRTC)
- **File Storage**: Supabase Storage integration (@supabase/supabase-js 2.49.4)
- **Payment Processing**: Stripe API integration
- **HTTP Client**: Axios 1.10.0 with interceptors for auth and error handling
- **Forms & Validation**: React Hook Form 7.60.0 with Zod 4.0.5 schemas
- **UI Components**: Radix UI primitives with shadcn/ui design system
- **Testing**: Jest 30.0.3 (unit) + Playwright 1.53.2 (e2e)

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

The application will be available at `http://localhost:10001` (or `http://localhost:3000` depending on configuration)

## 🧪 Test Credentials

All test accounts use the password: **`password123`**

### Client Accounts
- **Email**: `client1@mentaratest.dev` | **Password**: `password123`
- **Email**: `client2@mentaratest.dev` | **Password**: `password123`
- **Email**: `client3@mentaratest.dev` | **Password**: `password123`

### Therapist Accounts
- **Email**: `therapist1@mentaratest.dev` | **Password**: `password123`
- **Email**: `therapist2@mentaratest.dev` | **Password**: `password123`
- **Email**: `therapist3@mentaratest.dev` | **Password**: `password123`

### Admin Accounts
- **Email**: `admin1@mentaratest.dev` | **Password**: `password123`
- **Email**: `admin2@mentaratest.dev` | **Password**: `password123`
- **Email**: `admin3@mentaratest.dev` | **Password**: `password123`

### Moderator Accounts
- **Email**: `moderator1@mentaratest.dev` | **Password**: `password123`
- **Email**: `moderator2@mentaratest.dev` | **Password**: `password123`
- **Email**: `moderator3@mentaratest.dev` | **Password**: `password123`

**Note**: These are development/test accounts only. Do not use in production.

## 🚀 Deployment

### Production Build

```bash
npm run build        # Build for production
npm run start        # Start production server
```

### Environment Variables

Create `.env.production` or set environment variables:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://api.mentara.com
NEXT_PUBLIC_WS_URL=wss://api.mentara.com

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Application
NEXT_PUBLIC_APP_URL=https://mentara.com
NODE_ENV=production
```

### Docker Deployment

```bash
# Build image
docker build -t mentara-web .

# Run container
docker run -p 10001:3000 --env-file .env.production mentara-web
```

Or using Docker Compose:

```bash
docker-compose up -d
```

### Platform-Specific Deployment

#### Vercel (Recommended for Next.js)
1. Connect GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Set build command: `npm run build`
4. Set output directory: `.next`
5. Deploy automatically on push to main branch

#### Netlify
1. Connect repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `out` (if using static export)
4. Configure environment variables
5. Enable continuous deployment

#### Self-Hosted
```bash
# Build the application
npm run build

# Start with PM2
npm install -g pm2
pm2 start npm --name "mentara-web" -- start
pm2 save
pm2 startup
```

### Static Export (Optional)

For static site generation:

```bash
# Update next.config.ts to enable static export
npm run build
# Output will be in 'out' directory
```

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
