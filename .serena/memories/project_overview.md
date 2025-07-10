# Mentara Project Overview

## Project Purpose
Mentara is a comprehensive mental health platform that connects patients with therapists. The platform includes:
- Therapy sessions and scheduling
- Community support features
- Mental health worksheets and assignments
- AI-driven patient mental health evaluation
- Real-time messaging between patients and therapists
- Administrative and moderator tools

## Architecture
**Type**: Monorepo with three main components:
- `mentara-client/` - Next.js 15.2.4 frontend with TypeScript
- `mentara-api/` - NestJS 11.x backend with Prisma ORM
- `ai-patient-evaluation/` - Python Flask service with PyTorch ML models

## Key Features
- **Authentication**: Clerk-based authentication with role-based access control
- **Database**: PostgreSQL with Prisma ORM using multi-file schema approach
- **Real-time Features**: Socket.io WebSocket integration for messaging
- **AI Integration**: PyTorch neural network for mental health assessments
- **File Storage**: Supabase Storage and AWS S3 integration
- **Testing**: Jest for unit testing, Playwright for E2E testing

## User Roles
- `client` - Patients using the platform
- `therapist` - Mental health professionals
- `moderator` - Content moderation
- `admin` - System administrators