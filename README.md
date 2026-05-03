# Mentara - AI-Powered Mental Health Platform

![Mentara Logo](https://img.shields.io/badge/Mentara-Mental%20Health%20Platform-blue)
![Development Status](https://img.shields.io/badge/Status-Production%20Ready-green)
![Architecture](https://img.shields.io/badge/Architecture-Microservices-purple)

## 🎯 Project Overview

Mentara is a comprehensive mental health platform that connects patients with therapists, featuring therapy sessions, community support, interactive worksheets, mental health assessments, and AI-driven patient evaluation. Built with modern technologies and a microservices architecture designed for scalability, maintainability, and independent deployment.

**Key Features:**

- 🔐 JWT-based authentication with role-based access control
- 💬 Real-time messaging with WebSocket integration
- 📹 WebRTC video consultations
- 🧠 AI-powered mental health assessments using PyTorch
- 🛡️ AI content moderation for community safety
- 📊 Comprehensive analytics and reporting
- 🏥 HIPAA-compliant data handling

## 🛠️ Tech Stack

### Frontend (mentara-web)
- **Framework**: Next.js 16.0.10
- **UI Library**: React 19.2.3
- **Language**: TypeScript 5.8.3
- **Styling**: Tailwind CSS 4.x
- **State Management**: Zustand 5.0.3, React Query 5.81.2
- **Forms**: React Hook Form 7.60.0, Zod 4.0.5
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Real-time**: Socket.io Client 4.8.1
- **Video**: Simple Peer 9.11.1 (WebRTC)

### Backend (`apps/api` — mentara-api)
- **Monorepo tooling**: Nx 22.x
- **Framework**: NestJS 11.0.1
- **Language**: TypeScript
- **Database ORM**: Prisma 6.19.0
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: JWT (Passport.js 0.7.0)
- **Real-time**: Socket.io 4.8.1
- **File Upload**: Multer 1.4.5
- **Validation**: class-validator 0.14.2, Zod 4.1.13
- **Billing**: in-app module (legacy Stripe integration removed from the codebase; add `STRIPE_*` env vars only if you reintroduce processing)

### AI / pre-assessment
- The API integrates **Ollama**, **SambaNova**, or **Gemini** via environment variables (see [`.env.example`](.env.example)). There is **no** Flask microservice in this repository; a separate ML repo can be added later and called via `AI_SERVICE_URL` if you proxy features through the backend.

### Infrastructure
- **Database**: Supabase PostgreSQL
- **File Storage**: Supabase Storage
- **Optional**: Redis, Docker (not required for local dev)
- **Containerization**: Docker (optional; compose files may live per-app)

## 🚀 Quick Start (Development)

### Prerequisites

- Node.js 18+ and npm (or pnpm/bun)
- Python 3.11+ (optional; only for scripts under `questionnaires/`)
- Docker and Docker Compose (optional)
- PostgreSQL client tools (for database exports)
- Supabase account (for database)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd mentara
```

2. **Install dependencies (once, at the repo root)**

```bash
cd mentara
npm install
```

`postinstall` runs `prisma generate` for `apps/api/prisma`. If `libs/api-client` types are missing, run `npm run generate:api` (Orval) so `mentara-web` and `api-client` builds can resolve generated modules.

3. **Configure environment variables**

```bash
cp .env.example .env
# Edit .env: DATABASE_URL, JWT_SECRET, OAuth, Supabase, and Next public URLs (see comments in .env.example)

# Optional: override only the web app
# cp .env.example apps/web/.env.local
```

4. **Setup database**

```bash
npm run db:generate
npm run db:migrate
npm run db:seed   # optional test data
```

5. **Start development servers**

```bash
# Terminal 1: Nest API (default http://localhost:10000, /api prefix)
npm run api

# Terminal 2: Next.js app (http://localhost:10001)
npm run web

# Terminal 3 (optional): marketing landing (SvelteKit)
npm run landing
```

Set `PORT=10000` for the API and `NEXT_PUBLIC_API_URL=http://localhost:10000/api` for the web app unless you change ports.

### Service Endpoints

- **Web app**: http://localhost:10001
- **API (REST + Swagger)**: http://localhost:10000/api and http://localhost:10000/api/docs
- **Pre-assessment / LLM**: configure `OLLAMA_BASE_URL` or cloud keys; optional external service URL in `AI_SERVICE_URL`

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

## 📦 Deployment

### Frontend Deployment (mentara-web)

#### Production Build

```bash
cd mentara   # repository root
npm run build:web
npx nx start mentara-web
```

#### Environment Variables

Create `.env.production` or set environment variables:

```bash
NEXT_PUBLIC_API_URL=https://api.mentara.com
NEXT_PUBLIC_WS_URL=wss://api.mentara.com
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

#### Docker Deployment

Use the `apps/web` Dockerfile if present, from the repository root, and pass the same `NEXT_PUBLIC_*` variables as in local dev.

#### Platform-Specific Deployment

- **Vercel**: Connect GitHub repository, configure environment variables, deploy
- **Netlify**: Connect repository, set build command `npm run build`, publish directory `out`
- **Docker**: Use provided Dockerfile and docker-compose.yml

### Backend Deployment (mentara-api)

#### Production Build

```bash
cd mentara
npm run build:api
npx nx start mentara-api
```

#### Environment Variables

Ensure `.env` at the repo root (or your host’s secret store) matches [`apps/api/src/config/env-validation.ts`](apps/api/src/config/env-validation.ts). Example keys:

```bash
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
JWT_SECRET=your-jwt-secret-at-least-32-chars
JWT_EXPIRES_IN=7d
PORT=10000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-origin
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_API_KEY=your-key
# Plus Google/Microsoft OAuth secrets — see .env.example
```

#### Docker Deployment

Build from `apps/api` if a Dockerfile exists there, publish port `10000`, and pass the same environment variables as locally.

#### Database Migrations

```bash
cd mentara
npm run db:migrate
```

#### Platform-Specific Deployment

- **Railway**: Connect repository, set environment variables, auto-deploy
- **Render**: Connect repository, set build/start commands, configure environment
- **AWS/GCP**: Use Docker containers with ECS/Cloud Run
- **Self-hosted**: Use Docker Compose or PM2 for process management

### Optional external AI service

If you deploy a separate HTTP service (e.g. Flask or FastAPI), point the backend at it with `AI_SERVICE_URL` and ensure `FRONTEND_URL` / CORS allow your browser origin. This repository does not ship that service.

## 🏗️ Architecture

### Repository layout (Nx monorepo)

```
mentara/
├── apps/
│   ├── api/           # NestJS API (mentara-api)
│   ├── web/           # Next.js app (mentara-web)
│   └── landing/       # SvelteKit marketing site (optional)
├── libs/
│   └── api-client/    # Generated / shared API client (Orval)
├── apps/api/prisma/   # Prisma schema & migrations
├── .env.example       # Documented environment variables
└── package.json       # Root scripts: npm run api | web | landing
```

### Database & Infrastructure

- **Database**: Supabase PostgreSQL (Database as a Service)
- **File Storage**: Supabase Storage for file uploads and asset management
- **Authentication**: JWT-based local authentication system
- **Real-time**: WebSocket integration for messaging and live features

## 📊 Database Export

For software engineering project requirements, the database can be exported locally.

### Export Database

```bash
./scripts/export-database.sh
```

This script exports the Supabase database as:
- **SQL dump**: Complete database schema and data
- **CSV files**: One file per table for data analysis

Exports are stored in `database/exports/` with timestamps.

**Requirements:**
- PostgreSQL client tools (`pg_dump`, `psql`)
- `DATABASE_URL` configured in the root `.env`

See [database/README.md](database/README.md) for detailed instructions.

## 🔧 Development Commands

Run from the **repository root** (`mentara/`):

```bash
npm run api          # NestJS watch mode (mentara-api)
npm run web          # Next.js dev server on port 10001
npm run landing      # SvelteKit landing app (optional)
npm run build        # Build API + web
npm run test         # Nx tests across projects
npm run lint         # ESLint via Nx
npm run db:migrate   # Prisma migrate (schema in apps/api/prisma)
npm run db:seed      # Seed database
```

## 📚 Documentation

- **[Software Requirements Specification](docs/SOFTWARE_REQUIREMENTS_SPECIFICATION.md)** - Complete system requirements
- **[Software Design Description](docs/SOFTWARE_DESIGN_DESCRIPTION.md)** - System architecture and design
- **[Software Project Management Plan](docs/SOFTWARE_PROJECT_MANAGEMENT_PLAN.md)** - Project planning and management
- **[Software Test Document](docs/SOFTWARE_TEST_DOCUMENT.md)** - Testing strategy and procedures
- **[Research Paper](docs/research-paper/)** - Academic research documentation

### Service-Specific Documentation

- API and web share this README; Prisma schema lives under `apps/api/prisma/`.

## 🔒 Security & Privacy

- HIPAA compliance considerations for health data
- End-to-end encryption for sensitive communications
- JWT-based authentication with secure token rotation
- Role-based access control (Client, Therapist, Moderator, Admin)
- Regular security audits and vulnerability assessments
- Privacy-by-design architecture principles

## 📞 Support & Contact

**Project Team:**
- Tristan James Tolentino
- Adrian T. Sajulga
- Julia Laine Segundo

**Contact Email**: derpykidyt@gmail.com

---

_This README is maintained and updated regularly to reflect current project status and deployment procedures._
