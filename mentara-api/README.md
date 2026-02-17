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
- **Framework**: NestJS 11.0.1
- **Language**: TypeScript 5.7.3
- **Database ORM**: Prisma 6.19.0
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: JWT (Passport.js 0.7.0, @nestjs/jwt 11.0.0)
- **Real-time**: Socket.io 4.8.1
- **File Storage**: Supabase Storage, Multer 1.4.5
- **Caching**: Redis 5.10.0
- **Validation**: class-validator 0.14.2, Zod 4.1.13
- **Payment**: Stripe 18.3.0
- **Testing**: Jest 29.7.0

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
└── docs/                  # Test accounts (see docs/TEST_ACCOUNTS.md)
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
- Docker and Docker Compose (for containerized development)
- Supabase account (for database)
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

   **Restore schema without migrations** (e.g. tables were dropped):
```bash
npm run db:push       # Push current schema to DB
npm run db:generate   # Regenerate Prisma client
npm run db:seed       # Seed (use --force to reseed over existing data)
```

   **Additive seeding** (add more data without wiping tables):
```bash
npm run db:seed:add   # Ensures test accounts/communities, tops up users/communities, runs enrichers
# Or: npm run db:seed -- --add --mode=light
```
   Use this when you want to add new users, posts, relationships, etc. on top of existing data. Never truncates.

   **Basic test accounts after seeding** (password for all: `password123`):
   - Client: `client1@mentaratest.dev`
   - Therapist: `therapist1@mentaratest.dev`
   - See [docs/TEST_ACCOUNTS.md](docs/TEST_ACCOUNTS.md) for full list.

4. **Start development server**:
```bash
npm run start:dev     # Start with hot reload
```

## 🚀 Deployment

### Production Build

```bash
npm run build         # Build for production
npm run start:prod    # Start production server
```

### Environment Variables

Ensure `.env` contains all required variables:

```bash
# Database
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

# Authentication
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret-here
JWT_REFRESH_EXPIRES_IN=30d

# Redis
REDIS_URL=redis://localhost:6379

# Server
PORT=10000
NODE_ENV=production

# Supabase Storage
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-key
SUPABASE_BUCKET=your-bucket-name

# Email (optional)
EMAIL_SERVICE_API_KEY=your-email-service-key

# Stripe (optional)
STRIPE_SECRET_KEY=your-stripe-secret-key
```

### Database Migrations

**Important**: Run migrations before starting the production server:

```bash
npm run db:migrate    # Run migrations
npm run db:generate   # Generate Prisma client
```

### Docker Deployment

```bash
# Build image
docker build -t mentara-api .

# Run container
docker run -p 10000:10000 --env-file .env mentara-api
```

Or using Docker Compose:

```bash
docker-compose up -d
```

### Platform-Specific Deployment

#### Railway
1. Connect GitHub repository
2. Set environment variables in Railway dashboard
3. Set build command: `npm install && npm run build`
4. Set start command: `npm run start:prod`
5. Deploy automatically on push

#### Render
1. Connect repository
2. Set build command: `npm install && npm run build`
3. Set start command: `npm run start:prod`
4. Configure environment variables
5. Enable auto-deploy

#### AWS/GCP
- Use Docker containers with ECS/Cloud Run
- Configure environment variables in platform settings
- Set up health checks on `/health` endpoint
- Configure load balancer for multiple instances

#### Self-Hosted (PM2)
```bash
npm install -g pm2
npm run build
pm2 start dist/src/main.js --name mentara-api
pm2 save
pm2 startup
```

### Health Check

The API provides a health check endpoint:
- **GET** `/health` - Returns API status

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

Uses JWT-based local authentication with role-based access control:
- **Client** - Patients seeking therapy
- **Therapist** - Licensed mental health professionals
- **Moderator** - Community moderators
- **Admin** - System administrators

### Authentication Features
- **JWT Tokens**: Secure token-based authentication with refresh token rotation
- **Password Security**: bcrypt hashing with configurable rounds
- **Email Verification**: Account activation via email verification
- **Password Reset**: Secure password reset with time-limited tokens
- **Session Management**: Multiple device support with individual session control
- **Security Monitoring**: Failed login attempt tracking and account lockout protection

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

## 📡 API Modules

| Module | Description |
|--------|-------------|
| **Auth** | User authentication & registration |
| **Messaging** | Real-time messaging with WebSocket |
| **Booking** | Session scheduling & availability |
| **Communities** | Support groups & discussions |
| **Therapist** | Therapist management & recommendations |
| **Users** | User profiles & management |
| **Client** | Client-specific functionality |
| **Pre-Assessment** | Mental health assessments |
| **Reviews** | Therapist reviews & ratings |
| **Files** | File upload & management |
| **Billing** | Payment processing |
| **Admin** | Admin dashboard |
| **Sessions** | Therapy session tracking |
| **Worksheets** | Therapy assignments |
| **Notifications** | User notifications |
| **Analytics** | Usage analytics |
| **Audit Logs** | System audit trails |
| **Moderation** | AI-powered content moderation |

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

### Using Make (Recommended)
```bash
# Development
make dev                 # Start with hot reload
make dev-debug          # Start with debugging
make build              # Build for production
make start              # Start production server

# Docker Compose
make compose-up         # Start services with docker-compose
make compose-up-d       # Start services in background
make compose-down       # Stop and remove containers
make compose-logs       # View container logs

# Code Quality
make format             # Format with Prettier
make lint               # Lint and fix TypeScript
make test               # Run all tests

# Database
make db-migrate         # Run Prisma migrations
make db-generate        # Generate Prisma client
make db-seed            # Seed database
make db-reset           # Reset and reseed database
```

### Using npm directly
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
├── docs/                        # Test accounts (TEST_ACCOUNTS.md)
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

- **Test Accounts**: [docs/TEST_ACCOUNTS.md](docs/TEST_ACCOUNTS.md)
- **Issues**: [GitHub Issues](https://github.com/your-org/mentara-api/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/mentara-api/discussions)

---

Built with ❤️ by the Mentara team