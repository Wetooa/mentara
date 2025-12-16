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

### Backend (mentara-api)
- **Framework**: NestJS 11.0.1
- **Language**: TypeScript 5.7.3
- **Database ORM**: Prisma 6.19.0
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: JWT (Passport.js 0.7.0)
- **Real-time**: Socket.io 4.8.1
- **File Upload**: Multer 1.4.5
- **Validation**: class-validator 0.14.2, Zod 4.1.13
- **Caching**: Redis 5.10.0
- **Payment**: Stripe 18.3.0

### AI Service (ml-patient-evaluator-api)
- **Framework**: Flask 3.1.1
- **Language**: Python 3.11+
- **ML Framework**: PyTorch 2.7.1
- **Scientific Computing**: NumPy 2.2.6
- **Testing**: pytest 8.0.0

### Infrastructure
- **Database**: Supabase PostgreSQL
- **File Storage**: Supabase Storage
- **Caching**: Redis
- **Containerization**: Docker & Docker Compose

## 🚀 Quick Start (Development)

### Prerequisites

- Node.js 18+ and npm/bun
- Python 3.11+ with pip
- Docker and Docker Compose (optional)
- PostgreSQL client tools (for database exports)
- Supabase account (for database)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd mentara
```

2. **Install dependencies**

```bash
# Backend API
cd mentara-api
npm install

# Frontend
cd ../mentara-web
npm install

# AI Service
cd ../ml-patient-evaluator-api
pip install -r requirements.txt
```

3. **Configure environment variables**

```bash
# Backend - Copy and configure .env
cd mentara-api
cp .env.example .env
# Edit .env with your Supabase credentials

# Frontend - Copy and configure .env.local
cd ../mentara-web
cp .env.example .env.local
# Edit .env.local with API endpoints
```

4. **Setup database**

```bash
cd mentara-api
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run migrations
npm run db:seed      # Seed with test data
```

5. **Start development servers**

```bash
# Terminal 1: Backend API (port 10000)
cd mentara-api
npm run start:dev

# Terminal 2: Frontend (port 10001)
cd mentara-web
npm run dev

# Terminal 3: AI Service (port 10002)
cd ml-patient-evaluator-api
python api.py
```

### Service Endpoints

- **Web Frontend**: http://localhost:10001
- **Backend API**: http://localhost:10000
- **AI Patient Evaluation**: http://localhost:10002

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
cd mentara-web
npm run build
npm run start
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

```bash
cd mentara-web
docker build -t mentara-web .
docker run -p 10001:3000 --env-file .env.production mentara-web
```

#### Platform-Specific Deployment

- **Vercel**: Connect GitHub repository, configure environment variables, deploy
- **Netlify**: Connect repository, set build command `npm run build`, publish directory `out`
- **Docker**: Use provided Dockerfile and docker-compose.yml

### Backend Deployment (mentara-api)

#### Production Build

```bash
cd mentara-api
npm run build
npm run start:prod
```

#### Environment Variables

Ensure `.env` contains:

```bash
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d
REDIS_URL=redis://localhost:6379
PORT=10000
NODE_ENV=production
```

#### Docker Deployment

```bash
cd mentara-api
docker build -t mentara-api .
docker run -p 10000:10000 --env-file .env mentara-api
```

#### Database Migrations

```bash
cd mentara-api
npm run db:migrate  # Run migrations before starting server
```

#### Platform-Specific Deployment

- **Railway**: Connect repository, set environment variables, auto-deploy
- **Render**: Connect repository, set build/start commands, configure environment
- **AWS/GCP**: Use Docker containers with ECS/Cloud Run
- **Self-hosted**: Use Docker Compose or PM2 for process management

### AI Service Deployment (ml-patient-evaluator-api)

#### Production Run

```bash
cd ml-patient-evaluator-api
pip install -r requirements.txt
gunicorn -w 4 -b 0.0.0.0:10002 api:app
```

#### Docker Deployment

```bash
cd ml-patient-evaluator-api
docker build -t ml-patient-evaluator-api .
docker run -p 10002:10002 ml-patient-evaluator-api
```

#### Environment Variables

```bash
FLASK_ENV=production
PORT=10002
MODEL_PATH=models/mental_model_config2.pt
```

## 🏗️ Architecture

### Microservices Structure

```
mentara/
├── mentara-api/             # NestJS 11.x Backend (TypeScript)
│   ├── docker-compose.yml   # Service-specific Docker setup
│   ├── Dockerfile          # Container build configuration
│   └── README.md          # Backend service documentation
├── mentara-web/             # Next.js 16.0.10 Web Frontend (TypeScript)
│   ├── docker-compose.yml   # Service-specific Docker setup
│   ├── Dockerfile          # Container build configuration
│   └── README.md          # Frontend service documentation
├── ml-patient-evaluator-api/ # Flask ML Service (Python/PyTorch)
│   ├── docker-compose.yml   # Service-specific Docker setup
│   ├── Dockerfile          # Container build configuration
│   └── README.md          # AI evaluation service documentation
└── README.md              # Project overview and setup guide
```

### Database & Infrastructure

- **Database**: Supabase PostgreSQL (Database as a Service)
- **Caching**: Redis for session management and performance optimization
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
- `DATABASE_URL` configured in `mentara-api/.env`

See [database/README.md](database/README.md) for detailed instructions.

## 🔧 Development Commands

### Backend (mentara-api)

```bash
cd mentara-api
npm run start:dev    # Start development server
npm run build       # Build for production
npm run start:prod  # Start production server
npm run test        # Run tests
npm run db:migrate  # Run database migrations
npm run db:seed     # Seed database with test data
```

### Frontend (mentara-web)

```bash
cd mentara-web
npm run dev         # Start development server
npm run build       # Production build
npm run start       # Start production server
npm run lint        # Run ESLint
npm run test        # Run tests
```

### AI Service (ml-patient-evaluator-api)

```bash
cd ml-patient-evaluator-api
python api.py       # Start Flask server
pytest             # Run tests
```

## 📚 Documentation

- **[Software Requirements Specification](docs/SOFTWARE_REQUIREMENTS_SPECIFICATION.md)** - Complete system requirements
- **[Software Design Description](docs/SOFTWARE_DESIGN_DESCRIPTION.md)** - System architecture and design
- **[Software Project Management Plan](docs/SOFTWARE_PROJECT_MANAGEMENT_PLAN.md)** - Project planning and management
- **[Software Test Document](docs/SOFTWARE_TEST_DOCUMENT.md)** - Testing strategy and procedures
- **[Supabase Deployment Guide](docs/SUPABASE_DEPLOYMENT_GUIDE.md)** - Database deployment instructions
- **[WebRTC Deployment](docs/WEBRTC_DEPLOYMENT.md)** - Video call setup guide
- **[Research Paper](docs/research-paper/)** - Academic research documentation

### Service-Specific Documentation

- [Backend API Documentation](mentara-api/README.md)
- [Frontend Documentation](mentara-web/README.md)
- [AI Service Documentation](ml-patient-evaluator-api/README.md)

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
