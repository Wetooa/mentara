# Codebase Structure

## Root Directory Structure
```
mentara/
├── mentara-client/          # Next.js frontend application
├── mentara-api/            # NestJS backend API
├── ai-patient-evaluation/  # Python Flask AI service
├── CLAUDE.md              # Development guidance documentation
├── architecture.md        # System architecture documentation
├── memory.md              # Project memory/notes
├── test-accounts.md       # Test account information
└── create-test-application.js  # Test setup script
```

## Frontend Structure (mentara-client/)
```
mentara-client/
├── app/                   # Next.js App Router directory
│   ├── (protected)/       # Authenticated routes group
│   │   ├── admin/         # Admin dashboard and management
│   │   ├── therapist/     # Therapist interface and tools
│   │   └── user/          # User dashboard and features
│   ├── (public)/          # Public routes group
│   │   ├── (auth)/        # Authentication pages
│   │   ├── (static)/      # Landing and marketing pages
│   │   └── (therapist)/   # Therapist application/signup
│   ├── api/              # API routes and server actions
│   ├── layout.tsx        # Root layout component
│   └── globals.css       # Global styles
├── components/           # Reusable React components
│   ├── ui/              # shadcn/ui base components
│   ├── dashboard/       # Dashboard-specific components
│   ├── therapist/       # Therapist-specific components
│   ├── messages/        # Messaging interface components
│   ├── worksheets/      # Worksheet-related components
│   └── forms/           # Form components
├── lib/                 # Utility libraries and configurations
│   ├── api/            # API client and service layer
│   ├── utils.ts        # General utility functions
│   ├── queryKeys.ts    # React Query key management
│   └── validations.ts  # Zod validation schemas
├── hooks/              # Custom React hooks
├── store/              # Zustand state management
├── data/               # Mock data and constants
├── types/              # TypeScript type definitions
├── styles/             # Additional styling files
└── public/             # Static assets
```

## Backend Structure (mentara-api/)
```
mentara-api/
├── src/
│   ├── main.ts                    # Application entry point
│   ├── app.module.ts             # Root application module
│   ├── app.controller.ts         # Root application controller
│   ├── app.service.ts            # Root application service
│   ├── auth/                     # Authentication module
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── dto/                  # Data Transfer Objects
│   ├── users/                    # User management module
│   ├── therapist/                # Therapist-specific functionality
│   ├── client/                   # Client-specific functionality
│   ├── admin/                    # Admin functionality
│   ├── moderator/                # Content moderation
│   ├── communities/              # Community features
│   ├── posts/                    # Content management
│   ├── comments/                 # Comment management
│   ├── worksheets/               # Therapy worksheets
│   ├── booking/                  # Session scheduling
│   ├── messaging/                # Real-time messaging
│   │   ├── messaging.gateway.ts  # WebSocket gateway
│   │   ├── messaging.service.ts
│   │   └── services/             # Supporting services
│   ├── files/                    # File upload management
│   ├── sessions/                 # Therapy session tracking
│   ├── notifications/            # User notifications
│   ├── reviews/                  # Therapist reviews
│   ├── pre-assessment/           # Mental health assessments
│   ├── billing/                  # Payment processing
│   ├── dashboard/                # Dashboard data aggregation
│   ├── search/                   # Search functionality
│   ├── analytics/                # Usage analytics
│   ├── audit-logs/               # System audit logging
│   ├── guards/                   # Authentication guards
│   │   ├── clerk-auth.guard.ts
│   │   └── admin-auth.guard.ts
│   ├── decorators/               # Custom decorators
│   ├── common/                   # Shared utilities
│   │   ├── events/               # Event system
│   │   ├── interceptors/         # HTTP interceptors
│   │   ├── filters/              # Exception filters
│   │   ├── types/                # Common type definitions
│   │   └── services/             # Shared services
│   ├── providers/                # Custom providers
│   ├── services/                 # Global services
│   ├── test-utils/               # Testing utilities
│   │   ├── integration-tests/
│   │   └── e2e-tests/
│   ├── types/                    # Global type definitions
│   ├── utils/                    # Utility functions
│   └── config/                   # Configuration files
├── prisma/                       # Database schema and migrations
│   ├── models/                   # Multi-file schema organization
│   │   ├── user.prisma
│   │   ├── therapist.prisma
│   │   ├── client-therapist.prisma
│   │   └── [other model files]
│   ├── migrations/               # Database migration files
│   ├── schema.prisma            # Main schema file
│   └── seed.ts                  # Database seeding script
├── scripts/                      # Utility scripts
├── test/                        # Test files
└── dist/                        # Compiled output
```

## AI Service Structure (ai-patient-evaluation/)
```
ai-patient-evaluation/
├── api.py                # Flask application entry point
├── requirements.txt      # Python dependencies
├── models/              # PyTorch model definitions
├── data/                # Training data and preprocessing
├── utils/               # Utility functions for ML processing
└── tests/               # Python test files
```

## Key Configuration Files

### Frontend Configuration
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `next.config.js` - Next.js configuration
- `eslint.config.mjs` - ESLint configuration
- `.prettierrc` - Prettier formatting rules
- `jest.config.js` - Jest testing configuration
- `playwright.config.ts` - E2E testing configuration

### Backend Configuration
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `nest-cli.json` - NestJS CLI configuration
- `eslint.config.mjs` - ESLint configuration
- `.prettierrc` - Prettier formatting rules
- `jest.config.js` - Jest testing configuration

### Database Configuration
- `prisma/schema.prisma` - Main Prisma schema
- `prisma/models/*.prisma` - Individual model definitions

## Route Organization Patterns

### Frontend Routes (App Router)
- **Grouped Routes**: Using parentheses for logical grouping
- **(protected)**: All authenticated routes
- **(public)**: All public-facing routes
- **Dynamic Routes**: `[id]` for dynamic parameters
- **Catch-all Routes**: `[[...slug]]` for flexible routing

### Backend API Structure
- **Feature Modules**: Each domain has its own module
- **RESTful Endpoints**: Standard HTTP methods
- **Authentication Guards**: Applied at controller/route level
- **DTO Validation**: Request/response data validation
- **Role-based Access**: Different endpoints for different user roles