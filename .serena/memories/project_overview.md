# Mentara Platform Overview

## Purpose
Mentara is a comprehensive mental health platform that connects patients with therapists, featuring therapy sessions, community support, worksheets, mental health assessments, and AI-driven patient evaluation.

## Architecture
- **Type**: Monorepo with 4 main components
- **Frontend**: Next.js 15.2.4 with TypeScript (mentara-client)
- **Backend**: NestJS 11.x with Prisma ORM (mentara-api)  
- **AI Service**: Python Flask with PyTorch ML models (ai-patient-evaluation)
- **Shared Library**: TypeScript types and Zod validation (mentara-commons)

## Technology Stack
- **Frontend**: Next.js 15.2.4, Tailwind CSS 4.x, shadcn/ui, Zustand, React Query v5, Axios
- **Backend**: NestJS 11.x, PostgreSQL, Prisma ORM, JWT authentication, Socket.io
- **AI**: Python Flask, PyTorch
- **Shared**: TypeScript, Zod validation

## Authentication
- JWT-based authentication with role-based access control
- Current roles: client, therapist, moderator, admin
- OAuth integration with Google and Microsoft
- Currently has separate login routes for each role (needs centralization)