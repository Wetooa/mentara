# Mentara

Mentara is a mental health application designed to provide therapist matching, user engagement, therapy session completion, scheduling efficiency, moderation, system uptime, security, and mental health tracking. It integrates AI-driven features and a robust backend to deliver a seamless user experience.

## Technologies Used

- **Frontend:** Next.js 15.2.4, TypeScript, Tailwind CSS 4.x, shadcn/ui components
- **State Management:** Zustand (client state) + React Query v5 (server state)
- **Backend:** NestJS 11.x with TypeScript, Prisma ORM, PostgreSQL
- **AI Services:** 
  - **Patient Evaluation**: Python Flask + PyTorch neural networks
  - **Content Moderation**: Python Flask + Ollama mxbai-embed-large embeddings
- **Database & Storage:** PostgreSQL with Prisma ORM, Supabase Storage, AWS S3
- **Real-time:** Socket.io WebSockets for messaging and video calls
- **Video & Audio:** WebRTC (P2P video) with dedicated TURN server
- **Authentication:** JWT-based local authentication (migrated from Clerk)
- **Payment:** Stripe API integration
- **HTTP Client:** Axios with interceptors for auth and error handling
- **Forms:** React Hook Form with Zod validation
- **UI Components:** Radix UI primitives with shadcn/ui design system

## Getting Started

### Prerequisites

Ensure you have the following installed:

- Node.js (v18+) and npm/bun
- PostgreSQL 14+ (for database)
- Python 3.9+ (for AI services)
- Ollama (for content moderation AI)

### Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/your-org/mentara.git
   cd mentara/mentara-client
   ```

2. Install dependencies:

   ```sh
   npm install
   ```

3. Set up environment variables:
   ```sh
   cp .env.example .env.local
   # Configure API endpoints, authentication, and other environment variables
   ```

4. Start the development server:

   ```sh
   npm run dev
   ```

   The application will be available at `http://localhost:3000`

### Development Commands

```bash
# Development
npm run dev      # Start Next.js development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint checks
npm run type-check # Run TypeScript checks

# Testing
npm run test     # Run Jest unit tests
npm run test:watch # Run tests in watch mode
npm run test:e2e # Run Playwright end-to-end tests

# Code Quality
npm run format   # Format code with Prettier
npm run lint:fix # Fix ESLint issues automatically
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
