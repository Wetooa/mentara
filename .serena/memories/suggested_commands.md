# Essential Development Commands

## Root Workspace Commands (from project root)
```bash
# Quick setup for new developers
chmod +x setup-dev.sh && ./setup-dev.sh  # Complete automated setup

# Development workflow
npm run dev:client    # Start Next.js development server (port 3000)
npm run dev:api       # Start NestJS development server (port 3001)
npm run build         # Build all workspaces
npm run lint          # Lint all workspaces
npm run test          # Test all workspaces
npm run clean         # Clean all build artifacts

# Service orchestration with Makefile
make help            # Show all available commands
make dev             # Start all services in development mode
make dev-local       # Start without Docker (faster)
make start           # Start with Docker Compose
make stop            # Stop all services
make status          # Check service health
make test            # Run tests for all services
make ports           # Check port availability
make setup-dev       # Complete development setup

# Commons library (must build first!)
npm run build:commons # Build mentara-commons shared library (REQUIRED FIRST)
```

## Frontend Commands (mentara-client/)
```bash
npm run dev         # Start Next.js development server
npm run build       # Build for production
npm run start       # Start production server
npm run lint        # Lint with Next.js ESLint
npm run test        # Run Jest unit tests
npm run test:e2e    # Run Playwright E2E tests
npm run test:e2e:ui # Run E2E tests with UI mode
```

## Backend Commands (mentara-api/)
```bash
npm run start:dev    # Start NestJS in watch mode
npm run start:debug  # Start with debugging enabled
npm run build        # Build NestJS application
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
```

## AI Service Commands (ai-patient-evaluation/)
```bash
pip install -r requirements.txt  # Install Python dependencies
python api.py                     # Start Flask development server (port 5000)
pytest                           # Run tests
```

## Service Health Endpoints
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/health
- AI Patient Evaluation: http://localhost:5000/health
- AI Content Moderation: http://localhost:5001/health