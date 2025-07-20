# Technology Stack Details

## Frontend (mentara-client/)
### Core Framework
- **Next.js**: 15.2.4 with App Router
- **React**: 19.0.0
- **TypeScript**: v5

### UI and Styling
- **Tailwind CSS**: 4.x (utility-first CSS framework)
- **shadcn/ui**: Component system built on Radix UI
- **Radix UI**: Headless UI primitives for accessibility
- **Framer Motion**: Animation library (v12.6.3)
- **Lucide React**: Icon library

### State Management
- **Zustand**: Client-side state management (v5.0.3)
- **React Query**: Server state management (v5.81.2)
- **React Query DevTools**: Development tools for debugging queries

### Forms and Validation
- **React Hook Form**: Form handling (v7.56.1)
- **Zod**: Schema validation (v3.24.3)
- **@hookform/resolvers**: Zod integration with React Hook Form

### HTTP and API
- **Axios**: HTTP client with interceptors (v1.10.0)
- **Custom API Client**: Centralized API service layer

### Authentication and Authorization
- **Clerk**: Authentication service (@clerk/nextjs v6.12.12)
- **JWT Token**: Automatic token handling via interceptors

### File Storage and Upload
- **Supabase**: General file uploads (@supabase/supabase-js v2.49.4)
- **AWS S3**: Large file storage (@aws-sdk/client-s3 v3.802.0)

### Testing
- **Jest**: Unit testing (v30.0.3)
- **React Testing Library**: Component testing
- **Playwright**: E2E testing (@playwright/test v1.53.2)
- **Testing Library**: DOM testing utilities

### Development Tools
- **ESLint**: Code linting (v9 with Next.js config)
- **Prettier**: Code formatting (v3.5.3)
- **TypeScript**: Type checking (v5)

## Backend (mentara-api/)
### Core Framework
- **NestJS**: 11.x (Node.js framework)
- **TypeScript**: v5.7.3
- **Node.js**: Runtime environment

### Database and ORM
- **PostgreSQL**: Primary database
- **Prisma**: ORM and database toolkit (v6.7.0)
- **Multi-file Schema**: Organized in `prisma/models/`

### Authentication and Authorization
- **Clerk Backend**: Server-side authentication (@clerk/backend)
- **Passport**: Authentication middleware
- **Custom Guards**: ClerkAuthGuard, AdminAuthGuard

### Real-time Communication
- **Socket.io**: WebSocket implementation (v4.8.1)
- **@nestjs/websockets**: NestJS WebSocket integration
- **Event-driven Architecture**: Custom event bus implementation

### File Handling
- **Multer**: Multipart form data handling (v1.4.5-lts.2)
- **File Upload Service**: Centralized file management

### API and HTTP
- **RESTful API**: Standard REST endpoints
- **Class Validator**: DTO validation (v0.14.2)
- **Class Transformer**: Data transformation (v0.5.1)

### Testing
- **Jest**: Unit testing framework (v29.7.0)
- **Supertest**: HTTP testing (v7.0.0)
- **@nestjs/testing**: NestJS testing utilities
- **Test Containers**: Database testing (@testcontainers/postgresql)

### Development Tools
- **ESLint**: TypeScript linting (v9.18.0)
- **Prettier**: Code formatting (v3.4.2)
- **ts-node**: TypeScript execution (v10.9.2)
- **SWC**: Fast TypeScript compilation (@swc/core)

### Security and Monitoring
- **Helmet**: Security headers (v8.1.0)
- **Throttler**: Rate limiting (@nestjs/throttler)
- **Audit Logging**: Custom audit logging service

## AI Service (ai-patient-evaluation/)
### Core Framework
- **Flask**: Python web framework (v3.1.1)
- **Python**: Runtime environment

### Machine Learning
- **PyTorch**: Neural network library (v2.7.1)
- **NumPy**: Numerical computing (v2.2.6)
- **Custom Neural Network**: MultiLabelNN for mental health assessment

### CUDA Support
- **NVIDIA CUDA**: GPU acceleration support (multiple CUDA packages)
- **GPU Optimization**: For neural network inference

### Data Processing
- **Mental Health Assessment**: 201-item questionnaire processing
- **13 Assessment Scales**: Multiple psychological evaluation metrics
- **Severity Level Generation**: AI-driven mental health insights

## Database Schema (PostgreSQL + Prisma)
### Multi-file Organization
- **user.prisma**: User accounts and profiles
- **therapist.prisma**: Therapist profiles and applications
- **client-therapist.prisma**: Client-therapist relationships
- **community.prisma**: Support communities and groups
- **content.prisma**: Community posts and comments
- **worksheet.prisma**: Therapy assignments and submissions
- **pre-assessment.prisma**: Mental health assessments
- **booking.prisma**: Session scheduling system
- **messaging.prisma**: Real-time messaging system
- **files.prisma**: File upload management
- **sessions.prisma**: Therapy session tracking
- **notifications.prisma**: User notifications
- **billing.prisma**: Payment and billing
- **review.prisma**: Therapist reviews and ratings
- **assessments.prisma**: Mental health assessments
- **audit-logs.prisma**: System audit trails

## Development Environment
### Runtime and Package Management
- **Bun**: JavaScript runtime and package manager (v1.2.11)
- **npm**: Fallback package manager

### Version Control
- **Git**: Source control
- **Branch Strategy**: `dev` (development) and `master` (production)

### Environment Configuration
- **Environment Variables**: Centralized configuration
- **Multiple Services**: Frontend (3000), Backend (NestJS), AI (Flask)
- **Development Workflow**: Hot reload for all services