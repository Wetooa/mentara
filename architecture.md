# Mentara Project Architecture

## Project Overview

Mentara is a comprehensive mental health platform designed to connect patients with therapists. The platform facilitates therapy sessions, community support, worksheets, and mental health assessments. The application is built using a modern tech stack with a microservices architecture.

## System Architecture

The project follows a client-server architecture with a clear separation between the frontend and backend:

```
mentara/
├── mentara-client/ (Next.js Frontend)
├── mentara-api/ (NestJS Backend)
└── ai-patient-evaluation/ (Python ML Service)
```

## Technology Stack

### Frontend (mentara-client/)

- **Framework**: Next.js 15.2.4
- **Language**: TypeScript
- **UI Components**:
  - Tailwind CSS 4.x
  - Radix UI (various components)
  - shadcn/ui (component system)
- **State Management**:
  - Zustand (client-side state)
  - React Query (server state)
- **Authentication**: Clerk
- **Form Handling**: React Hook Form with Zod validation
- **File Storage**: Supabase Storage / AWS S3
- **Animations**: Framer Motion
- **Routing**: Next.js App Router
- **Date Formatting**: date-fns

### Backend (mentara-api/)

- **Framework**: NestJS 11.x
- **Language**: TypeScript
- **Database ORM**: Prisma 6.7.0
- **Database**: PostgreSQL
- **Authentication**: Clerk (via @clerk/backend)
- **API Architecture**: RESTful
- **File Handling**: Multer

### AI Service (ai-patient-evaluation/)

- **Framework**: Flask
- **Language**: Python
- **ML Libraries**: PyTorch
- **Model**: Custom Neural Network (MultiLabelNN)

## Database Schema

The database is implemented using PostgreSQL with Prisma as the ORM. Key models include:

- **User**: Stores user information with Clerk integration
- **Therapist**: Professional therapist profiles and credentials
- **TherapistApplication**: Therapist onboarding and verification
- **Community**: Support groups and communities
- **Post/Comment**: Community content
- **Worksheet**: Therapy worksheets and assignments
- **FileUpload**: File management for various uploads
- **Meeting**: Session scheduling and management for therapist-patient interactions

## Authentication Flow

Authentication is implemented using Clerk:

1. Users sign up/sign in via Clerk's authentication service
2. Clerk provides a JWT token that is validated on the server
3. The server uses Clerk's backend SDK to verify user claims
4. User roles (Admin, Therapist, Patient) are managed through the application's models
5. Protected routes in Next.js are secured using Clerk middleware

## API Structure

The NestJS backend is organized into feature modules:

- **Auth**: Authentication and authorization logic
- **Users**: User management
- **Therapists**: Therapist profile and application handling
- **Communities**: Communities and social features
- **Posts/Comments**: Content management
- **Worksheets**: Therapy worksheets and assignments
- **File Management**: Upload and storage handling
- **Meetings**: Therapist-patient session scheduling and management

## File Storage

File storage is handled through:

1. **Supabase Storage**: Used for general file uploads
2. **AWS S3**: Used for larger files or specific requirements
3. Files are referenced in the database with metadata stored in appropriate models

## AI Integration

The mental health assessment service is implemented as a separate Flask application:

1. Accepts questionnaire responses as input
2. Processes using a trained neural network model
3. Returns assessment results for potential conditions
4. Integrates with the main application for patient evaluation

## Deployment Architecture

The application is designed to be deployed across multiple services:

- **Frontend**: Vercel (Next.js hosting)
- **Backend API**: Could be deployed to a cloud platform (AWS, GCP, or Azure)
- **Database**: Managed PostgreSQL service
- **AI Service**: Can be deployed as a separate microservice

## Development Workflow

The project uses modern development practices:

- TypeScript for type safety
- ESLint and Prettier for code formatting
- Bun as the JavaScript runtime
- Prisma for database migrations and type-safe queries
- Environment variables for configuration

## Key Implementation Details

### Frontend Routes Organization

```
app/
├── (protected)/ - Authenticated routes
│   ├── therapist/ - Therapist dashboard
│   ├── admin/ - Admin dashboard
│   └── user/ - User-specific routes
│       ├── therapist/ - User therapist listing and management
│       ├── (dashboard)/ - User dashboard with session and progress tracking
│       └── ... - Other user areas
├── (public)/ - Public routes
│   ├── (therapist)/ - Therapist signup/application
│   └── ... - Public pages
└── api/ - API routes for server actions
```

### Database Connections

Prisma is used in both the frontend and backend:

- **Backend**: For full database access and API operations
- **Frontend**: For direct database access in server components or API routes

### State Management

- **Zustand**: Used for form state, user preferences, and UI state
- **React Query**: Used for server state and data fetching

### Layout Architecture

The application uses a fixed layout architecture for the main interface:

- **Fixed Sidebar**: The left navigation sidebar remains statically positioned on the left side of the screen
- **Fixed Header**: The top navigation bar remains statically positioned at the top of the screen
- **Scrollable Content**: Only the main content area scrolls, allowing for a consistent navigation experience
- **CSS Implementation**: Uses fixed positioning with z-index control and appropriate spacing to maintain hierarchy
- **Responsive Adjustments**: Layout adjusts for different screen sizes while maintaining fixed navigation elements

### User Dashboard Interface

The User Dashboard interface follows a component-based architecture:

```
components/
├── dashboard/
│   ├── DashboardHeader.tsx - User greeting and profile actions
│   ├── StatsOverview.tsx - Key metrics overview
│   ├── UpcomingSessions.tsx - Upcoming therapy sessions
│   ├── WorksheetStatus.tsx - Assigned worksheets status
│   ├── ProgressTracking.tsx - Treatment progress and mood tracking
│   └── NotificationsCenter.tsx - User notifications
```

### User - Therapist Interface

The User - Therapist interface follows a component-based architecture:

```
components/
├── therapist/
│   └── listing/
│       ├── TherapistListing.tsx - Main container for therapist cards
│       ├── TherapistCard.tsx - Individual therapist display card
│       ├── MeetingsSection.tsx - Display of scheduled therapy sessions
│       └── RecommendedSection.tsx - Recommended therapists section
```

### User - Worksheets Interface

The User - Worksheets interface follows a component-based architecture:

```
components/
├── worksheets/
│   ├── WorksheetsSidebar.tsx - Filter controls for worksheets
│   ├── WorksheetsList.tsx - List of worksheets grouped by date
│   ├── TaskCard.tsx - Individual worksheet card component
│   └── types.ts - TypeScript interfaces for worksheet data
```

### User - Messages Interface

The User - Messages interface follows a component-based architecture:

```
components/
├── messages/
│   ├── MessageLayout.tsx - Main container for the messaging interface
│   ├── MessageSidebar.tsx - Contact list sidebar with search functionality
│   ├── MessageChatArea.tsx - Main chat display and input area
│   ├── MessageContactItem.tsx - Individual contact item in the sidebar
│   ├── MessageBubble.tsx - Individual message display component
│   ├── ChatHeader.tsx - Header for the chat area showing contact info
│   └── types.ts - TypeScript interfaces for message data
```

The messaging interface uses full viewport height styling with proper content overflow handling to ensure the chat interface extends to the bottom of the screen. It includes features for sending messages, attaching files, and using emoji reactions.

### Mock Data Structure

The project uses TypeScript interfaces for type safety with structured mock data:

```
data/
├── mockTherapistListingData.ts - Contains therapist listing data structures:
│   ├── TherapistData - Properties of therapist profiles
│   ├── RecommendedTherapistData - Recommended therapist info
│   └── MeetingData - Therapy session scheduling info
│
├── mockUserDashboardData.ts - Contains user dashboard data structures:
│   ├── UserDashboardData - Main user dashboard interface
│   ├── Progress data - Treatment progress and mood tracking
│   ├── Worksheet data - Assigned worksheets and completion status
│   └── Notification data - User notification types and messages
│
└── mockPatientsData.ts - Contains patient data for therapist views
```

## Security Considerations

- Authentication via Clerk provides robust security
- Environment variables are used for sensitive information
- Database access is controlled through Prisma models
- API endpoints are protected with guards in NestJS

## Future Scalability

The architecture is designed to scale:

- Separate services can be scaled independently
- Database can be migrated to more powerful solutions as needed
- The modular design allows for extending functionality
- Component-based UI structure enables consistent expansion
