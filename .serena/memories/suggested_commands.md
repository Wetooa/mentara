# Suggested Commands for Mentara Development

## Frontend Development (mentara-client/)
```bash
cd mentara-client/
npm run dev      # Start Next.js development server (port 3000)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Lint with Next.js ESLint
npm run test     # Run Jest unit tests
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Run tests with coverage
npm run test:e2e       # Run Playwright E2E tests
```

## Backend Development (mentara-api/)
```bash
cd mentara-api/
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
npm run test-accounts           # Create test accounts
npm run seed-test-data          # Seed test data
```

## AI Service Development (ai-patient-evaluation/)
```bash
cd ai-patient-evaluation/
pip install -r requirements.txt  # Install Python dependencies
python api.py                    # Start Flask development server
```

## Git Commands (Linux)
```bash
git status        # Check repository status
git add .         # Stage all changes
git commit -m "message"  # Commit changes
git push          # Push to remote
git pull          # Pull from remote
git branch        # List branches
git checkout dev  # Switch to dev branch
```

## System Utilities (Linux)
```bash
ls -la           # List files with details
find . -name "*.ts"  # Find TypeScript files
grep -r "pattern" .  # Search for pattern in files
cd /path/to/dir  # Change directory
pwd              # Print working directory
```