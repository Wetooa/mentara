# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mentara is a comprehensive mental health platform that connects patients with therapists. The platform includes therapy sessions, community support, worksheets, mental health assessments, and AI-driven patient evaluation.

**Architecture**: Monorepo with three main components:

- `mentara-client/` - Next.js 15.2.4 frontend with TypeScript (isolated island)
- `mentara-api/` - NestJS 11.x backend with Prisma ORM (isolated island)
- `ai-patient-evaluation/` - Python Flask service with PyTorch ML models

**Note**: Each component maintains its own types and constants with no shared dependencies.

## Development Commands

### Root Workspace Commands

```bash
# Automated setup (recommended for first-time setup)
chmod +x setup-dev.sh && ./setup-dev.sh  # Complete environment setup

# Workspace-based commands (from project root)
npm run dev:client    # Start Next.js development server
npm run dev:api       # Start NestJS development server
npm run build         # Build all workspaces
npm run build:client  # Build only frontend
npm run build:api     # Build only backend
npm run lint          # Lint all workspaces
npm run test          # Test all workspaces
npm run clean         # Clean all build artifacts

# Makefile orchestration commands
make help            # Show all available commands
make dev             # Start all services in development mode
make dev-local       # Start without Docker (faster)
make start           # Start with Docker Compose
make stop            # Stop all services
make status          # Check service health
make test            # Run tests for all services
make setup-dev       # Complete development setup
make ports           # Check port availability

# Both services are now independent - no shared libraries required
```

### Client Development (mentara-client/)

```bash
npm run dev         # Start Next.js development server
npm run build       # Build for production
npm run start       # Start production server
npm run lint        # Lint with Next.js ESLint
npm run test:e2e    # Run Playwright E2E tests
npm run test:e2e:ui # Run E2E tests with UI mode
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

### Type Organization

**Client Types**: Located in `mentara-client/types/` for frontend-specific types
**Server Types**: Located in `mentara-api/src/types/` for backend-specific types

Each service maintains its own type definitions with no cross-dependencies.

## Architecture & Technology Stack

### Frontend (mentara-client/)

- **Framework**: Next.js 15.2.4 with App Router
- **Styling**: Tailwind CSS 4.x with shadcn/ui components
- **State Management**: Zustand (client state) + React Query v5 (server state)
- **HTTP Client**: Axios with interceptors for auth and error handling
- **Authentication**: JWT-based local authentication with role-based access control
- **Forms**: React Hook Form with Zod validation
- **UI Components**: Radix UI primitives with shadcn/ui
- **Error Handling**: React Error Boundary with MentaraApiError
- **Testing**: Jest with React Testing Library + Playwright for E2E

### Backend (mentara-api/)

- **Framework**: NestJS 11.x with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with Passport strategies (Google, Microsoft OAuth)
- **Real-time Communication**: Socket.io WebSocket integration
- **File Upload**: Multer for file handling
- **Architecture**: Modular NestJS structure with feature-based modules

### AI Service (ai-patient-evaluation/)

- **Framework**: Flask with Python
- **ML Library**: PyTorch for neural network models
- **Purpose**: Mental health assessment processing
- **Input**: 201-item questionnaire responses across 13 assessment scales
- **Output**: Processed mental health evaluation results

### Type Architecture (Island Pattern)

- **Client Types**: `mentara-client/types/` - Frontend-specific interfaces and types
- **Server Types**: `mentara-api/src/types/` - Backend DTOs and global types
- **Module Types**: Feature-specific types in respective module directories
- **No Shared Dependencies**: Each service maintains complete type independence
- **ESLint Protection**: Rules prevent accidental cross-service imports

### Database Schema Structure

Prisma uses a multi-file schema approach in `prisma/models/`:

- `user.prisma` - User accounts and profiles
- `therapist.prisma` - Therapist profiles and applications
- `client-therapist.prisma` - Client-therapist relationships
- `community.prisma` - Support communities and groups
- `content.prisma` - Community posts and comments
- `worksheet.prisma` - Therapy assignments and submissions
- `pre-assessment.prisma` - Mental health assessments
- `booking.prisma` - Session scheduling system
- `messaging.prisma` - Real-time messaging system
- `files.prisma` - File upload management
- `sessions.prisma` - Therapy session tracking
- `notifications.prisma` - User notifications
- `billing.prisma` - Payment and billing
- `review.prisma` - Therapist reviews and ratings
- `assessments.prisma` - Mental health assessments
- `audit-logs.prisma` - System audit trails

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

- Custom JWT-based authentication with AuthContext and Passport strategies
- HttpOnly refresh token cookies for enhanced security
- Middleware (`middleware.ts`) enforces role-based routing
- Four user roles: `client`, `therapist`, `moderator`, `admin`
- Protected routes redirect unauthorized users to appropriate dashboards
- Role-based access control implemented in both frontend and backend
- OAuth integration with Google and Microsoft (native Passport implementation)

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
- `comments/` - Comment management
- `worksheets/` - Therapy assignments
- `booking/` - Session scheduling
- `messaging/` - Real-time messaging with WebSocket
- `files/` - File upload and management
- `sessions/` - Therapy session tracking
- `notifications/` - User notifications
- `reviews/` - Therapist reviews and ratings
- `pre-assessment/` - Mental health assessments
- `admin/` - Admin dashboard functionality
- `moderator/` - Content moderation
- `client/` - Client-specific functionality
- `billing/` - Payment processing
- `dashboard/` - Dashboard data aggregation
- `search/` - Search functionality
- `analytics/` - Usage analytics
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

### Type Development Workflow

1. **Client Types**: Add/modify types in `mentara-client/types/`
2. **Server Types**: Add/modify types in `mentara-api/src/types/` or module-specific `types/` directories
3. **No Build Step**: Types are used directly by TypeScript compiler
4. **ESLint Enforcement**: Automatic prevention of cross-service type imports

## Special Considerations

### File Storage

- Supabase Storage for general file uploads
- AWS S3 for larger files (using @aws-sdk/client-s3)
- Multer middleware for handling multipart form data
- File metadata stored in `files.prisma` database model
- Upload endpoints in `files/` module with proper validation

### AI Integration

- Separate Flask service handles mental health assessments
- PyTorch neural network processes questionnaire responses
- Results integrated back into main application
- AI service dependencies: Flask, PyTorch, NumPy

### Mock Data Structure

Comprehensive mock data in `data/` directory:

- `mockTherapistListingData.ts` - Therapist profiles and meetings
- `mockUserDashboardData.ts` - User dashboard data
- `mockPatientsData.ts` - Patient data for therapist views
- All use TypeScript interfaces for type safety

### WebRTC Infrastructure

- TURN server configuration in `/turn-server/` for video calling support
- Coturn server with Docker deployment on ports 3478, 5349
- Media relay ports 49152-49252 for NAT traversal
- Redis integration for TURN server state management
- Supports secure video therapy sessions with therapists

## Important Development Guidelines

### Code Quality

- Run linting and type checking before commits:
  - Client: `npm run lint` (in mentara-client/)
  - API: `npm run lint` (in mentara-api/)
- Always generate Prisma client after schema changes: `npm run db:generate`
- Each service builds independently - no shared library dependencies
- Use existing mock data patterns when adding new features
- ESLint rules prevent accidental shared imports between services

### React Query + Axios Development Guidelines

#### API Client Usage

- **Always use `useApi()` hook** in React components for API calls
- **Use service methods** instead of direct axios calls: `api.reviews.create()` not `axios.post()`
- **Use proper query keys** from `lib/queryKeys.ts` for consistency

#### Query Patterns

- **Centralized query keys**: Always use `queryKeys.entity.method()` pattern
- **Enable conditions**: Use `enabled: !!dependency` for conditional queries
- **Proper dependencies**: Include all dynamic values in query keys
- **Smart invalidation**: Use `getRelatedQueryKeys()` for mutations

#### Mutation Best Practices

- **Optimistic updates**: Implement for better UX where appropriate
- **Error rollback**: Always handle rollback in `onError`
- **Toast feedback**: Provide user feedback for mutations
- **Cache invalidation**: Invalidate related queries in `onSuccess`

#### Error Handling

- **Use error boundaries**: Wrap components with `QueryErrorBoundary`
- **Handle specific errors**: Check for `MentaraApiError` instances
- **Meaningful messages**: Provide context-specific error messages
- **Graceful degradation**: Show fallback UI for failed queries

#### Testing

- **Mock axios**: Use `jest.mock('axios')` for API client tests
- **Mock services**: Test individual service functions
- **Query testing**: Use React Query testing utilities
- **Error scenarios**: Test error handling and retry logic

### Testing Strategy

- API unit tests: `npm run test` (in mentara-api/)
- API e2e tests: `npm run test:e2e` (in mentara-api/)
- Coverage reports: `npm run test:cov` (in mentara-api/)
- Debug tests: `npm run test:debug` (in mentara-api/)

### Environment Setup

- Ensure all services can run simultaneously:
  - Frontend: `npm run dev` (port 3000)
  - Backend: `npm run start:dev` (port 3001)
  - AI Patient Evaluation: `python api.py` (port 5000)
  - AI Content Moderation: Flask service (port 5001)

### Port Configuration

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **AI Patient Evaluation**: http://localhost:5000
- **AI Content Moderation**: http://localhost:5001
- **Redis**: port 6379
- **Ollama**: port 11434

### Quick Troubleshooting

- Check port availability: `make ports`
- Health check all services: `make status` or `make health`
- Common setup issues:
  - `Cannot find module 'nest'` → Run `npm install` in mentara-api
  - Type errors → Check service-specific types in `types/` directories
  - Environment validation errors → Configure `.env` file with required variables
  - Build errors → Each service builds independently, no shared dependencies needed

### Working Directory Context

- Always specify which directory commands should run in
- Use relative paths consistently within each service
- The current branch strategy uses `dev` for development, `master` for production

## React Query + Axios Integration Patterns

### API Client Architecture

The frontend uses a modern axios-based HTTP client with React Query v5 for server state management:

```typescript
// Use the main API client hook
import { useApi } from "@/lib/api";

const api = useApi(); // Automatically includes authentication
const data = await api.therapists.getRecommendations({ limit: 10 });
```

### Service Layer Structure

```
lib/api/
├── client.ts              # Core axios instance with interceptors
├── api-client.ts          # Main entry point with useApi hook
├── errorHandler.ts        # Centralized error handling
├── services/              # Domain-specific service modules
│   ├── users.ts
│   ├── therapists.ts
│   ├── reviews.ts
│   └── ...
└── index.ts              # Backward-compatible exports
```

### Query Patterns

Use centralized query keys and enhanced patterns:

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

// Query with proper key management
export function useTherapistReviews(therapistId: string) {
  const api = useApi();

  return useQuery({
    queryKey: queryKeys.reviews.byTherapist(therapistId),
    queryFn: () => api.reviews.getTherapistReviews(therapistId),
    enabled: !!therapistId,
  });
}

// Mutation with optimistic updates
export function useCreateReview() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.reviews.create(data),
    onMutate: async (newReview) => {
      // Optimistic update logic
      await queryClient.cancelQueries({ queryKey: queryKeys.reviews.all });
      // ... optimistic update implementation
    },
    onError: (err, variables, context) => {
      // Rollback optimistic update
    },
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.all });
    },
  });
}
```

### Error Handling Patterns

- **MentaraApiError**: Custom error class with status codes and details
- **Error Boundaries**: React Query error boundaries with fallback UI
- **Interceptors**: Automatic error transformation and auth handling
- **Toast Notifications**: User-friendly error messages

### Authentication Integration

- Automatic JWT token injection via axios interceptors
- HttpOnly refresh token cookies for enhanced security
- Server-side and client-side token handling with AuthContext
- 401 error handling with automatic redirect to login
- Google and Microsoft OAuth integration via Passport strategies

### Query Configuration

Enhanced QueryClient with smart defaults:

- **Retry Logic**: Don't retry on auth errors, smart retry on server errors
- **Cache Management**: 5-minute stale time, 10-minute garbage collection
- **Dev Tools**: React Query DevTools in development
- **Error Boundaries**: Global error handling for queries

# important-instruction-reminders

Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (\*.md) or README files. Only create documentation files if explicitly requested by the User.
