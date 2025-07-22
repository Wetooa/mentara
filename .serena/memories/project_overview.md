# Mentara Project Overview

## Purpose
Mentara is a comprehensive mental health platform that connects patients with therapists. The platform features:
- Therapy sessions with WebRTC video consultations
- Community support and moderation
- Interactive worksheets and assignments
- Mental health assessments 
- AI-driven patient evaluation using PyTorch neural networks
- JWT-based authentication with role-based access control
- Real-time messaging with WebSocket integration

## Architecture
**Monorepo with microservices structure** - three main independent components:

### 1. Frontend (`mentara-client/`)
- **Framework**: Next.js 15.2.4 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4.x with shadcn/ui components
- **State Management**: Zustand + React Query v5
- **Authentication**: JWT-based local auth (migrated from Clerk)
- **Testing**: Jest + React Testing Library + Playwright E2E

### 2. Backend (`mentara-api/`)
- **Framework**: NestJS 11.x
- **Language**: TypeScript 5
- **Database**: PostgreSQL with Prisma ORM (multi-file schema)
- **Authentication**: JWT with Passport strategies (Google, Microsoft OAuth)
- **Real-time**: Socket.io WebSocket integration
- **File Handling**: Multer for uploads
- **Testing**: Jest with TestContainers for integration tests

### 3. AI Service (`ai-patient-evaluation/`)
- **Framework**: Flask
- **Language**: Python 3.9+
- **ML Library**: PyTorch for neural network models
- **Purpose**: Process 201-item mental health questionnaire responses
- **Output**: Mental health evaluation results across 13 assessment scales

## Key Architectural Patterns
- **Island Architecture**: Each service maintains independent types with no shared dependencies
- **ESLint Protection**: Rules prevent accidental cross-service imports
- **Role-based Access**: Four user roles (client, therapist, moderator, admin)
- **Microservices**: Each service can be deployed and scaled independently
- **Docker Support**: Individual Docker Compose setups per service

## Database Structure
Prisma multi-file schema in `mentara-api/prisma/models/`:
- User management (user.prisma, therapist.prisma)
- Relationships (client-therapist.prisma)
- Community features (community.prisma, content.prisma)
- Therapy tools (worksheet.prisma, sessions.prisma)
- Assessments (pre-assessment.prisma, assessments.prisma)
- Real-time features (messaging.prisma, booking.prisma)
- System features (files.prisma, notifications.prisma, audit-logs.prisma)

## Infrastructure
- **Database**: Supabase PostgreSQL (Database as a Service)
- **Caching**: Redis for session management
- **File Storage**: Supabase Storage + AWS S3
- **Authentication**: Custom JWT implementation
- **Real-time**: WebSocket for messaging
- **Video**: WebRTC with TURN server infrastructure