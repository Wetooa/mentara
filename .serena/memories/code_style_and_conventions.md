# Code Style and Conventions

## TypeScript Configuration
- **Target**: ES2017
- **Strict mode**: Enabled
- **Path aliases**: Uses `@/*` for root-relative imports
- **Module resolution**: Bundler for frontend, commonjs for backend

## Frontend Code Style (mentara-client/)
### Prettier Configuration
- **Semicolons**: Required (true)
- **Tab Width**: 2 spaces
- **Quotes**: Double quotes
- **Trailing Commas**: ES5 style
- **Print Width**: 80 characters
- **Bracket Spacing**: Enabled
- **Arrow Parens**: Always

### ESLint Configuration
- **Base**: Next.js core web vitals + TypeScript rules
- **Framework**: Next.js specific rules enabled

### Component Architecture
- **UI Components**: Uses shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS 4.x with utility-first approach
- **Component Organization**: Feature-based organization in `components/`
- **Layout**: Fixed sidebar and header with scrollable content areas only

### Frontend Patterns
- **State Management**: Zustand for client state, React Query v5 for server state
- **API Client**: Axios with interceptors, always use `useApi()` hook
- **Forms**: React Hook Form with Zod validation
- **Error Handling**: React Error Boundary with MentaraApiError
- **Route Organization**: App Router with grouped routes using parentheses

## Backend Code Style (mentara-api/)
### Prettier Configuration
- **Quotes**: Single quotes
- **Trailing Commas**: All (required everywhere)

### ESLint Configuration
- **Base**: TypeScript ESLint recommended + type-checked rules
- **Prettier Integration**: eslint-plugin-prettier/recommended
- **Custom Rules**: Relaxed unsafe TypeScript rules for flexibility
- **Test Files**: Special rules for *.spec.ts and *.test.ts files

### NestJS Architecture Patterns
- **Module Organization**: Feature-based modules (auth, users, therapist, etc.)
- **Controllers**: RESTful API endpoints with proper decorators
- **Services**: Business logic implementation
- **Guards**: Authentication and authorization (ClerkAuthGuard, AdminAuthGuard)
- **Decorators**: Custom decorators for user extraction (@CurrentUserId, @CurrentUserRole)
- **DTOs**: Class-based DTOs with validation using class-validator

### Database Patterns
- **Schema Organization**: Multi-file Prisma schema in `prisma/models/`
- **Migrations**: Use `npm run db:migrate` for schema changes
- **Type Generation**: Always run `npm run db:generate` after schema changes

## AI Service Code Style (ai-patient-evaluation/)
- **Framework**: Flask with Python
- **Dependencies**: Listed in requirements.txt
- **ML Library**: PyTorch for neural network models
- **Purpose**: Mental health assessment processing (201-item questionnaire → evaluation)

## Naming Conventions
### Files and Directories
- **Components**: PascalCase (e.g., `UserDashboard.tsx`)
- **Pages**: kebab-case for files, PascalCase for components
- **API Routes**: kebab-case (e.g., `therapist-application.controller.ts`)
- **Types/Interfaces**: PascalCase with descriptive suffixes

### Code Naming
- **Variables**: camelCase
- **Functions**: camelCase with descriptive verbs
- **Constants**: UPPER_SNAKE_CASE
- **Interfaces**: PascalCase, often with descriptive suffixes
- **Classes**: PascalCase

## Import/Export Patterns
- **Path Aliases**: Use `@/` for relative imports in frontend
- **Default Exports**: For React components and main modules
- **Named Exports**: For utilities, types, and multiple exports
- **Import Order**: External libraries first, then internal modules

## Comment Style
- Use JSDoc for function documentation when needed
- Inline comments for complex logic explanation
- TODO comments for future improvements