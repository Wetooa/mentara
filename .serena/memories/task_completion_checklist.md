# Task Completion Checklist

## Required Steps When Completing Any Task

### 1. Code Quality Checks
```bash
# Frontend linting and type checking
cd mentara-client && npm run lint

# Backend linting and type checking  
cd mentara-api && npm run lint

# Format code if needed
npm run format  # (in respective service directory)
```

### 2. Build Dependencies
```bash
# ALWAYS build mentara-commons first if modified
npm run build:commons

# Generate Prisma client after schema changes
cd mentara-api && npm run db:generate
```

### 3. Testing Requirements
```bash
# Frontend tests
cd mentara-client && npm run test

# Backend tests
cd mentara-api && npm run test

# E2E tests (when applicable)
npm run test:e2e
```

### 4. Database Operations (if schema changed)
```bash
cd mentara-api
npm run db:migrate    # Create and apply migration
npm run db:generate   # Update Prisma client
npm run db:seed       # Reseed if needed
```

### 5. Service Health Verification
```bash
# Check all services are running
make status

# Or manually check endpoints:
curl http://localhost:3001/health  # Backend
curl http://localhost:3000/api/health  # Frontend  
curl http://localhost:5000/health  # AI Evaluation
```

### 6. Common Error Resolution
- **Build errors**: Ensure mentara-commons is built first
- **Cannot find module 'nest'**: Run `npm install` in mentara-api
- **Cannot find module 'mentara-commons'**: Build commons first
- **Prisma errors**: Run `npm run db:generate` after schema changes
- **Port conflicts**: Check `make ports` for availability

### 7. Pre-Commit Verification
- All linting passes
- All tests pass
- Build succeeds
- No TypeScript errors
- Services start successfully

## Development Workflow Best Practices
1. **Always start with building mentara-commons**
2. **Run linting and tests before committing**
3. **Update Prisma client after schema changes**
4. **Use TypeScript strict mode - fix all type errors**
5. **Follow existing code patterns and conventions**
6. **Test authentication flows after auth changes**
7. **Verify WebSocket connections after real-time changes**