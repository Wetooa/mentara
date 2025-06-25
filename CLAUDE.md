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

# Testing
npm run test         # Run unit tests with Jest
npm run test:watch   # Run tests in watch mode
npm run test:e2e     # Run end-to-end tests
npm run test:cov     # Run tests with coverage

# Database Operations
npm run db:migrate   # Run Prisma migrations
npm run db:generate  # Generate Prisma client
npm run db:seed      # Seed database with initial data
npm run db:reset     # Reset database and reseed

# Utility Scripts
npm run assign-therapist        # Assign therapist to users
npm run assign-random-therapists # Assign random therapists
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
- **Architecture**: Modular NestJS structure with feature-based modules

### Database Schema Structure
Prisma uses a multi-file schema approach in `prisma/models/`:
- `user.prisma` - User accounts and profiles
- `therapist.prisma` - Therapist profiles and applications
- `community.prisma` - Support communities and groups
- `post.prisma` - Community posts and comments
- `worksheet.prisma` - Therapy assignments and submissions
- `preassessment.prisma` - Mental health assessments
- `booking.prisma` - Session scheduling system

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
- `therapist/` - Therapist profiles and applications
- `communities/` - Community features
- `posts/` - Content management
- `worksheets/` - Therapy assignments
- `booking/` - Session scheduling

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
- AWS S3 for larger files
- File metadata stored in database models

### AI Integration
- Separate Flask service handles mental health assessments
- Neural network processes questionnaire responses
- Results integrated back into main application

### Mock Data Structure
Comprehensive mock data in `data/` directory:
- `mockTherapistListingData.ts` - Therapist profiles and meetings
- `mockUserDashboardData.ts` - User dashboard data
- `mockPatientsData.ts` - Patient data for therapist views
- All use TypeScript interfaces for type safety