# Project Overview

Mentara is a comprehensive mental health platform connecting patients with therapists. 

## Architecture
Monorepo with three main components:
- `mentara-client/` - Next.js 15.2.4 frontend with TypeScript
- `mentara-api/` - NestJS 11.x backend with Prisma ORM  
- `ai-patient-evaluation/` - Python Flask service with PyTorch ML models

## Key Technologies
- Frontend: Next.js 15.2.4, TypeScript, Tailwind CSS, shadcn/ui, Zustand, React Query v5
- Backend: NestJS 11.x, Prisma ORM, PostgreSQL, Socket.io
- Auth: Clerk with role-based access control
- AI: Flask, PyTorch for mental health assessments