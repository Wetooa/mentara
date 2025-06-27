# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mentara is a comprehensive mental health platform that connects patients with therapists. The platform includes therapy sessions, community support, worksheets, mental health assessments, and AI-driven patient evaluation.

**Architecture**: Monorepo with three main components:
- `mentara-client/` - Next.js 15.2.4 frontend with TypeScript
- `mentara-api/` - NestJS 11.x backend with Prisma ORM
- `ai-patient-evaluation/` - Python Flask service with PyTorch ML models

## Development Commands

### Client Development (mentara-client/)
```bash
npm run dev      # Start Next.js development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Lint with Next.js ESLint
```

### API Development (mentara-api/)
```bash
npm run start:dev    # Start NestJS in watch mode
npm run start:debug  # Start with debugging enabled
npm run build        # Build NestJS application
npm run start:prod   # Start production server
npm run format       # Format code with Prettier
npm run lint         # Lint and fix TypeScript files

# Testing
npm run test         # Run unit tests with Jest
npm run test:watch   # Run tests in watch mode
npm run test:e2e     # Run end-to-end tests
npm run test:cov     # Run tests with coverage
npm run test:debug   # Run tests with debugger

# Database Operations
npm run db:migrate   # Run Prisma migrations
npm run db:generate  # Generate Prisma client
npm run db:seed      # Seed database with initial data
npm run db:reset     # Reset database and reseed

# Utility Scripts
npm run assign-therapist        # Assign therapist to users
npm run assign-random-therapists # Assign random therapists
```

### AI Service Development (ai-patient-evaluation/)
```bash
# Setup
pip install -r requirements.txt  # Install Python dependencies

# Development
python api.py                     # Start Flask development server

# The AI service processes mental health questionnaire responses
# using PyTorch neural networks for patient evaluation
```

## Architecture & Technology Stack

### Frontend (mentara-client/)
- **Framework**: Next.js 15.2.4 with App Router
- **Styling**: Tailwind CSS 4.x with shadcn/ui components
- **State Management**: Zustand (client state) + React Query (server state)  
- **Authentication**: Clerk with role-based access control
- **Forms**: React Hook Form with Zod validation
- **UI Components**: Radix UI primitives with shadcn/ui

### Backend (mentara-api/)
- **Framework**: NestJS 11.x with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Clerk backend integration
- **Real-time Communication**: Socket.io WebSocket integration
- **File Upload**: Multer for file handling
- **Architecture**: Modular NestJS structure with feature-based modules

### AI Service (ai-patient-evaluation/)
- **Framework**: Flask with Python
- **ML Library**: PyTorch for neural network models
- **Purpose**: Mental health assessment processing
- **Input**: 201-item questionnaire responses across 13 assessment scales
- **Output**: Processed mental health evaluation results

### Database Schema Structure
Prisma uses a multi-file schema approach in `prisma/models/`:
- `user.prisma` - User accounts and profiles
- `therapist.prisma` - Therapist profiles and applications
- `client-therapist.prisma` - Client-therapist relationships
- `community.prisma` - Support communities and groups
- `content.prisma` - Community posts and comments
- `worksheet.prisma` - Therapy assignments and submissions
- `pre-assessment.prisma` - Mental health assessments
- `assessments.prisma` - Assessment results and scoring
- `booking.prisma` - Session scheduling system
- `sessions.prisma` - Therapy session records
- `messaging.prisma` - Real-time messaging system
- `notifications.prisma` - User notification system
- `files.prisma` - File upload and storage metadata
- `review.prisma` - Therapist and service reviews
- `billing.prisma` - Payment and billing information
- `audit-logs.prisma` - System audit and logging
- `constraints.prisma` - Database constraints and validations

## Key Architectural Patterns

### Route Organization (Next.js)
```
app/
├── (protected)/     # Authenticated routes
│   ├── admin/       # Admin dashboard
│   ├── therapist/   # Therapist interface
│   └── user/        # User dashboard and features
├── (public)/        # Public routes
│   ├── (auth)/      # Sign-in/sign-up
│   ├── (static)/    # Landing pages
│   └── (therapist)/ # Therapist application
└── api/            # API routes
```

### Authentication & Authorization
- Clerk handles authentication with JWT tokens
- Middleware (`middleware.ts`) enforces role-based routing
- Three user roles: `user`, `therapist`, `admin`
- Protected routes redirect unauthorized users to appropriate dashboards

### Component Architecture
- Fixed layout with static sidebar and header
- Scrollable content areas only
- shadcn/ui components for consistent design system
- Feature-based component organization in `components/`

### Backend Module Structure
NestJS modules organized by feature:
- `auth/` - Authentication and authorization
- `users/` - User management
- `client/` - Client-specific functionality
- `therapist/` - Therapist profiles and applications
- `communities/` - Community features
- `posts/` - Content management
- `comments/` - Comment system for posts
- `worksheets/` - Therapy assignments
- `booking/` - Session scheduling
- `sessions/` - Therapy session management
- `messaging/` - Real-time messaging with WebSocket gateway
- `notifications/` - User notification system
- `files/` - File upload and storage
- `reviews/` - Therapist and service reviews
- `pre-assessment/` - Mental health assessment processing
- `billing/` - Payment and billing management
- `analytics/` - Usage analytics and reporting
- `search/` - Search functionality across platform
- `moderator/` - Content moderation tools
- `admin/` - Administrative dashboard
- `dashboard/` - User dashboard data
- `audit-logs/` - System audit logging

## Development Workflow

### Branch Strategy
- **`dev`** - Main development branch
- **`master`** - Production branch (stable releases)

### Branch Naming Conventions
- Frontend: `frontend/feature/{description}`, `frontend/fix/{description}`
- Backend: `backend/feature/{description}`, `backend/fix/{description}`
- Documentation: `docs/{description}`

### Database Development
1. Modify schema files in `prisma/models/`
2. Run `npm run db:migrate` to create migration
3. Run `npm run db:generate` to update Prisma client
4. Update seed data in `prisma/seed.ts` if needed

## Special Considerations

### File Storage
- Supabase Storage for general file uploads
- AWS S3 for larger files (using @aws-sdk/client-s3)
- Multer middleware for handling multipart form data
- File metadata stored in `files.prisma` database model
- Upload endpoints in `files/` module with proper validation

### AI Integration
- Separate Flask service (`ai-patient-evaluation/`) handles mental health assessments
- PyTorch neural network processes 201-item questionnaire responses
- Supports 13 assessment scales: PHQ, ASRS, AUDIT, BES, DAST10, GAD7, ISI, MBI, MDQ, OCI_R, PCL5, PDSS, PSS
- Results integrated back into main application through API endpoints
- Pre-trained model (`mental_model_config2.pt`) for patient evaluation

### Mock Data Structure
Comprehensive mock data in `data/` directory:
- `mockTherapistListingData.ts` - Therapist profiles and meetings
- `mockUserDashboardData.ts` - User dashboard data
- `mockPatientsData.ts` - Patient data for therapist views
- All use TypeScript interfaces for type safety

## Important Development Guidelines

### Code Quality
- Run linting and type checking before commits:
  - Client: `npm run lint` (in mentara-client/)
  - API: `npm run lint` (in mentara-api/)
- Always generate Prisma client after schema changes: `npm run db:generate`
- Use existing mock data patterns when adding new features

### Testing Strategy  
- API unit tests: `npm run test` (in mentara-api/)
- API e2e tests: `npm run test:e2e` (in mentara-api/)
- Coverage reports: `npm run test:cov` (in mentara-api/)
- Debug tests: `npm run test:debug` (in mentara-api/)

### Environment Setup
- Ensure all three services can run simultaneously:
  - Frontend: `npm run dev` (port 3000)
  - Backend: `npm run start:dev` (NestJS default port)
  - AI Service: `python api.py` (Flask default port)

### Working Directory Context
- Always specify which directory commands should run in
- Use relative paths consistently within each service
- The current branch strategy uses `dev` for development, `master` for production