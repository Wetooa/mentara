# Codebase Structure

## Root Level Organization
```
mentara/
├── mentara-client/          # Next.js 15.2.4 Frontend
├── mentara-api/             # NestJS 11.x Backend  
├── ai-patient-evaluation/   # Python Flask AI Service
├── mentara-commons/         # Shared TypeScript Library
├── turn-server/             # WebRTC TURN Server
├── project-docs/            # Documentation
├── scripts/                 # Utility scripts
├── Makefile                 # Service orchestration
├── package.json             # Workspace configuration
├── setup-dev.sh             # Development setup script
└── CLAUDE.md                # Development guidelines
```

## Frontend Structure (mentara-client/)
```
mentara-client/
├── app/                     # Next.js App Router
│   ├── (protected)/         # Authenticated routes
│   ├── (public)/            # Public routes
│   └── api/                 # API routes
├── components/              # React components
│   ├── ui/                  # shadcn/ui components
│   ├── auth/                # Authentication components
│   └── dashboard/           # Dashboard components
├── contexts/                # React contexts
├── hooks/                   # Custom React hooks
├── lib/                     # Utilities and API client
│   ├── api/                 # HTTP client and services
│   └── queryKeys.ts         # React Query keys
├── store/                   # Zustand store definitions
├── types/                   # TypeScript type definitions
└── middleware.ts            # Next.js middleware
```

## Backend Structure (mentara-api/)
```
mentara-api/
├── src/                     # Source code
│   ├── auth/                # Authentication module
│   ├── users/               # User management
│   ├── therapist/           # Therapist functionality
│   ├── communities/         # Community features
│   ├── messaging/           # Real-time messaging
│   ├── files/               # File upload handling
│   ├── pre-assessment/      # Mental health assessments
│   └── admin/               # Admin functionality
├── prisma/                  # Database schema and migrations
│   ├── models/              # Multi-file schema
│   └── seed/                # Database seeding
├── test/                    # Test files
└── scripts/                 # Utility scripts
```

## Database Schema Organization (prisma/models/)
```
prisma/models/
├── user.prisma             # User accounts and profiles
├── therapist.prisma        # Therapist profiles
├── client-therapist.prisma # Client-therapist relationships
├── community.prisma        # Support communities
├── content.prisma          # Posts and comments
├── worksheet.prisma        # Therapy assignments
├── pre-assessment.prisma   # Mental health assessments
├── booking.prisma          # Session scheduling
├── messaging.prisma        # Real-time messaging
├── files.prisma            # File upload management
├── sessions.prisma         # Therapy session tracking
├── notifications.prisma    # User notifications
├── billing.prisma          # Payment and billing
├── review.prisma           # Therapist reviews
└── audit-logs.prisma       # System audit trails
```

## Shared Commons Structure (mentara-commons/)
```
mentara-commons/
├── src/
│   ├── types/               # TypeScript interfaces
│   ├── schemas/             # Zod validation schemas
│   └── index.ts             # Main exports
└── dist/                    # Compiled output
```

## Key Integration Points
- **Authentication**: JWT flow between client and API
- **Real-time**: Socket.io for messaging and notifications
- **File Storage**: Integration with Supabase Storage and AWS S3
- **AI Services**: REST API integration for mental health assessments
- **Database**: Prisma ORM with PostgreSQL
- **State Management**: React Query for server state, Zustand for client state