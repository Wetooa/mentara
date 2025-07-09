# Mentara API

A comprehensive mental health platform backend built with NestJS, providing therapy services, community support, and AI-driven patient evaluation.

## 🏗️ Project Overview

Mentara is a full-stack mental health platform connecting patients with therapists through:
- **Therapy Sessions** - Scheduled sessions with licensed therapists
- **Community Support** - Illness-specific support groups and discussions
- **Mental Health Assessments** - AI-powered patient evaluations
- **Worksheets & Resources** - Therapy assignments and educational materials
- **Real-time Messaging** - Secure communication between patients and therapists

## 🚀 Architecture

### Technology Stack
- **Framework**: NestJS 11.x with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Clerk backend integration
- **Real-time**: Socket.io WebSocket integration
- **File Storage**: Supabase Storage + AWS S3
- **Testing**: Jest with comprehensive test coverage

### Core Components
```
mentara-api/
├── src/
│   ├── auth/              # Authentication & authorization
│   ├── messaging/         # Real-time messaging with WebSocket
│   ├── booking/           # Session scheduling system
│   ├── communities/       # Support communities
│   ├── therapist/         # Therapist management & recommendations
│   ├── users/             # User management
│   ├── client/            # Client-specific functionality
│   ├── pre-assessment/    # Mental health assessments
│   ├── reviews/           # Therapist reviews & ratings
│   ├── files/             # File upload management
│   ├── billing/           # Payment processing
│   ├── admin/             # Admin dashboard
│   └── ...
└── docs/                  # Comprehensive API documentation
```

## 📊 Database Schema

Prisma uses a multi-file schema approach in `prisma/models/`:
- `user.prisma` - User accounts and profiles
- `therapist.prisma` - Therapist profiles and applications
- `client-therapist.prisma` - Client-therapist relationships
- `community.prisma` - Support communities and groups
- `content.prisma` - Posts and comments
- `worksheet.prisma` - Therapy assignments
- `pre-assessment.prisma` - Mental health assessments
- `booking.prisma` - Session scheduling
- `messaging.prisma` - Real-time messaging
- `files.prisma` - File management
- `sessions.prisma` - Therapy sessions
- `notifications.prisma` - User notifications
- `billing.prisma` - Payment and billing
- `review.prisma` - Therapist reviews
- `assessments.prisma` - AI assessments
- `audit-logs.prisma` - System audit trails

## 🔧 Development Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or bun

### Installation

1. **Clone and install dependencies**:
```bash
git clone <repository-url>
cd mentara-api
npm install
```

2. **Environment setup**:
```bash
cp .env.example .env
# Configure database and API keys
```

3. **Database setup**:
```bash
npm run db:migrate    # Run migrations
npm run db:generate   # Generate Prisma client
npm run db:seed       # Seed with initial data
```

4. **Start development server**:
```bash
npm run start:dev     # Start with hot reload
```

## 🧪 Testing

### Unit Tests
```bash
npm run test          # Run all unit tests
npm run test:watch    # Run tests in watch mode
npm run test:cov      # Run with coverage report
npm run test:debug    # Run with debugger
```

### End-to-End Tests
```bash
npm run test:e2e      # Run e2e tests
```

### Database Testing
```bash
npm run db:reset      # Reset database and reseed
```

## 🔐 Authentication

Uses Clerk for authentication with role-based access control:
- **Client** - Patients seeking therapy
- **Therapist** - Licensed mental health professionals
- **Moderator** - Community moderators
- **Admin** - System administrators

## 📡 API Documentation

### Core Modules

| Module | Description | Documentation |
|--------|-------------|---------------|
| **Auth** | User authentication & registration | [📖 docs/api/auth/](docs/api/auth/) |
| **Messaging** | Real-time messaging with WebSocket | [📖 docs/api/messaging/](docs/api/messaging/) |
| **Booking** | Session scheduling & availability | [📖 docs/api/booking/](docs/api/booking/) |
| **Communities** | Support groups & discussions | [📖 docs/api/communities/](docs/api/communities/) |
| **Therapist** | Therapist management & recommendations | [📖 docs/api/therapist/](docs/api/therapist/) |
| **Users** | User profiles & management | [📖 docs/api/users/](docs/api/users/) |
| **Client** | Client-specific functionality | [📖 docs/api/client/](docs/api/client/) |
| **Pre-Assessment** | Mental health assessments | [📖 docs/api/pre-assessment/](docs/api/pre-assessment/) |
| **Reviews** | Therapist reviews & ratings | [📖 docs/api/reviews/](docs/api/reviews/) |
| **Files** | File upload & management | [📖 docs/api/files/](docs/api/files/) |
| **Billing** | Payment processing | [📖 docs/api/billing/](docs/api/billing/) |
| **Admin** | Admin dashboard | [📖 docs/api/admin/](docs/api/admin/) |
| **Sessions** | Therapy session tracking | [📖 docs/api/sessions/](docs/api/sessions/) |
| **Worksheets** | Therapy assignments | [📖 docs/api/worksheets/](docs/api/worksheets/) |
| **Notifications** | User notifications | [📖 docs/api/notifications/](docs/api/notifications/) |
| **Analytics** | Usage analytics | [📖 docs/api/analytics/](docs/api/analytics/) |
| **Audit Logs** | System audit trails | [📖 docs/api/audit-logs/](docs/api/audit-logs/) |

### Quick Start Guides
- [🚀 Frontend Integration](docs/guides/frontend-integration.md)
- [🔧 Development Workflow](docs/guides/development-workflow.md)
- [🧪 Testing Guide](docs/guides/testing.md)
- [🔐 Authentication Setup](docs/guides/authentication.md)

## 🌟 Key Features

### 💬 Real-time Messaging
- WebSocket support for instant communication
- Message reactions and read receipts
- File attachments and media sharing
- User blocking and moderation

### 📅 Session Booking
- Therapist availability management
- Automated scheduling with conflict detection
- Session reminders and notifications
- Flexible duration options

### 🤝 Community Support
- 30+ pre-configured mental health communities
- Illness-specific support groups
- Anonymous posting options
- Moderation tools and safety features

### 🧠 AI-Powered Assessments
- 201-item mental health questionnaire
- 13 assessment scales for comprehensive evaluation
- Integration with Python ML service
- Automated therapist recommendations

### 📊 Analytics & Reporting
- User engagement metrics
- Therapist performance tracking
- Community activity insights
- Billing and revenue reports

## 🛠️ Development Commands

```bash
# Development
npm run start:dev        # Start with hot reload
npm run start:debug      # Start with debugging
npm run build            # Build for production
npm run start:prod       # Start production server

# Code Quality
npm run format           # Format with Prettier
npm run lint             # Lint and fix TypeScript

# Database
npm run db:migrate       # Run Prisma migrations
npm run db:generate      # Generate Prisma client
npm run db:seed          # Seed database
npm run db:reset         # Reset and reseed database

# Testing
npm run test             # Unit tests
npm run test:watch       # Watch mode
npm run test:e2e         # End-to-end tests
npm run test:cov         # Coverage report
npm run test:debug       # Debug mode

# Utilities
npm run assign-therapist           # Assign therapist to users
npm run assign-random-therapists   # Assign random therapists
```

## 📁 Project Structure

```
mentara-api/
├── src/
│   ├── auth/                    # Authentication module
│   ├── messaging/               # Real-time messaging
│   ├── booking/                 # Session scheduling
│   ├── communities/             # Support communities
│   ├── therapist/               # Therapist management
│   ├── users/                   # User management
│   ├── client/                  # Client functionality
│   ├── pre-assessment/          # Mental health assessments
│   ├── reviews/                 # Review system
│   ├── files/                   # File management
│   ├── billing/                 # Payment processing
│   ├── admin/                   # Admin dashboard
│   ├── common/                  # Shared utilities
│   │   ├── events/              # Event bus system
│   │   ├── filters/             # Exception filters
│   │   ├── interceptors/        # Response interceptors
│   │   └── services/            # Common services
│   ├── guards/                  # Authentication guards
│   ├── decorators/              # Custom decorators
│   └── test-utils/              # Testing utilities
├── prisma/
│   ├── models/                  # Database models
│   ├── migrations/              # Database migrations
│   ├── schema.prisma            # Main schema file
│   └── seed.ts                  # Database seeding
├── docs/                        # API documentation
│   ├── api/                     # Module-specific docs
│   ├── guides/                  # Development guides
│   ├── examples/                # Code examples
│   └── architecture/            # Architecture docs
├── scripts/                     # Utility scripts
└── schema/                      # TypeScript schemas
```

## 🔒 Security Features

- **Role-based Access Control** - Granular permissions system
- **Rate Limiting** - API endpoint protection
- **Input Validation** - Comprehensive data validation
- **Audit Logging** - Complete system audit trail
- **File Upload Security** - Secure file handling with validation
- **Session Management** - Secure session handling

## 📈 Performance & Scalability

- **Database Optimization** - Efficient queries with Prisma
- **Caching Strategy** - Redis integration for performance
- **Event-Driven Architecture** - Scalable event bus system
- **Load Balancing Ready** - Stateless design for horizontal scaling
- **Monitoring Integration** - OpenTelemetry support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Run tests: `npm run test`
4. Commit changes: `git commit -m 'Add new feature'`
5. Push to branch: `git push origin feature/new-feature`
6. Submit a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/your-org/mentara-api/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/mentara-api/discussions)

---

Built with ❤️ by the Mentara team