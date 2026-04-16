# System Architecture

## 3. System Architecture

### 3.1 Overview

Mentara implements a production-ready microservices architecture designed for scalability, maintainability, and independent deployment. The system comprises three core services, each with distinct responsibilities and clear service boundaries. This architecture enables independent scaling of services based on demand, particularly important for computationally intensive AI/ML inference workloads.

### 3.2 Microservices Architecture

The platform consists of three independently deployable services:

```mermaid
graph TB
    subgraph Frontend["Frontend Service (Port 10001)"]
        FE[mentara-web<br/>Next.js 15.2.4]
        FE_Tech["React 19<br/>Tailwind CSS 4.x<br/>Zustand State Management<br/>React Query v5<br/>WebRTC<br/>Socket.io Client"]
        FE --> FE_Tech
    end

    subgraph Backend["Backend API Service (Port 10000)"]
        BE[mentara-api<br/>NestJS 11.x]
        BE_Modules["140+ REST API Endpoints<br/>17 Feature Modules<br/>JWT Authentication<br/>Socket.io WebSocket Server<br/>Prisma ORM<br/>Stripe Integration"]
        BE --> BE_Modules
    end

    subgraph ML["AI/ML Service (Port 10002)"]
        ML_Service[ml-patient-evaluator-api<br/>Python Flask]
        ML_Tech["PyTorch Neural Network<br/>Multi-label Classification<br/>201 inputs → 19 outputs<br/>REST API Endpoints<br/>Health & Metrics"]
        ML_Service --> ML_Tech
    end

    subgraph External["External Services"]
        DB[(PostgreSQL<br/>Supabase)]
        Storage[Supabase Storage<br/>+ AWS S3]
        Stripe[Stripe API<br/>Payment Processing]
    end

    FE -->|REST API<br/>JWT Auth| BE
    FE -->|WebSocket<br/>Real-time Messaging| BE
    FE -->|WebRTC<br/>Video Consultations| BE
    BE -->|REST API<br/>POST /predict| ML_Service
    BE -->|Prisma ORM| DB
    BE -->|File Upload/Download| Storage
    BE -->|Payment Processing| Stripe

    style Frontend fill:#e1f5ff
    style Backend fill:#fff4e1
    style ML fill:#ffe1f5
    style External fill:#f0f0f0
```

**Figure 1: Mentara microservices architecture showing three independently deployable services (Frontend, Backend API, AI/ML) integrated through standardized REST APIs.**

### 3.3 Frontend Service (mentara-web)

**Technology Stack**:
- **Framework**: Next.js 15.2.4 with App Router and TypeScript
- **UI Library**: React 19 with Tailwind CSS 4.x
- **Component Library**: shadcn/ui built on Radix UI primitives
- **State Management**: Zustand (client state) + React Query v5 (server state)
- **Real-time**: Socket.io client for messaging, WebRTC for video calls

**Key Responsibilities**:
- User interface for all user types (Client, Therapist, Moderator, Admin)
- Authentication flow with JWT token management
- 201-item mental health questionnaire interface
- Real-time messaging and video consultation interfaces
- Therapist matching and booking interfaces
- Community platform interface

**Assessment Interface Architecture**:
```
app/(protected)/assessment/
├── questionnaire/         # Multi-section questionnaire form
├── progress-tracking/     # Real-time completion progress
├── results-display/       # AI prediction visualization
└── therapist-matching/    # AI-recommended therapists
```

### 3.4 Backend API Service (mentara-api)

**Technology Stack**:
- **Framework**: NestJS 11.x with TypeScript
- **Database**: PostgreSQL via Supabase with Prisma ORM
- **Authentication**: JWT with bcrypt password hashing
- **Real-time**: Socket.io WebSocket server
- **Payment**: Stripe API integration

**Module Architecture** (17 modules, 140+ endpoints):

```mermaid
graph LR
    subgraph BackendModules["Backend API Modules (NestJS 11.x)"]
        Auth[auth<br/>JWT Auth]
        Users[users<br/>Profiles]
        Therapist[therapist<br/>Matching]
        Client[client]
        Communities[communities<br/>30+ Communities]
        Messaging[messaging<br/>WebSocket]
        Booking[booking<br/>Scheduling]
        PreAssessment[pre-assessment<br/>Questionnaire]
        Reviews[reviews<br/>Ratings]
        Files[files<br/>Upload/Download]
        Billing[billing<br/>Stripe]
        Admin[admin<br/>Dashboard]
        Sessions[sessions<br/>Tracking]
        Worksheets[worksheets<br/>Assignments]
        Notifications[notifications]
        Analytics[analytics]
        AuditLogs[audit-logs]
    end

    Auth --> Users
    Auth --> Therapist
    Auth --> Client
    PreAssessment --> Therapist
    Booking --> Sessions
    Messaging --> Notifications
    Billing --> Sessions
    Admin --> Analytics
    Admin --> AuditLogs

    style Auth fill:#ffcccc
    style PreAssessment fill:#ccffcc
    style Messaging fill:#ccccff
    style Billing fill:#ffffcc
```

**Directory Structure**:

```
mentara-api/src/
├── auth/              # JWT authentication, login, registration
├── users/             # User profile management
├── therapist/         # Therapist profiles, verification, matching
├── client/            # Client-specific functionality
├── communities/        # 30+ mental health communities
├── messaging/         # Real-time messaging (WebSocket)
├── booking/           # Session scheduling
├── pre-assessment/    # Mental health questionnaire integration
├── reviews/           # Therapist rating system
├── files/             # File upload and management
├── billing/           # Stripe payment processing
├── admin/             # Administrative dashboard
├── sessions/          # Therapy session tracking
├── worksheets/        # Therapy assignment management
├── notifications/     # User notification system
├── analytics/         # Usage analytics
└── audit-logs/        # System audit trail
```

**Pre-Assessment Module Integration**:
The pre-assessment module serves as the integration point between the frontend questionnaire and the AI/ML service:

```typescript
src/pre-assessment/
├── pre-assessment.controller.ts    # Assessment endpoints
├── ai-service-client.service.ts    # ML service HTTP client
├── assessment-results.service.ts    # Results processing
└── therapist-matching.service.ts    # AI-powered matching
```

### 3.5 AI/ML Service Architecture (ml-patient-evaluator-api)

**Technology Stack**:
- **Framework**: Python Flask with REST API design
- **Machine Learning**: PyTorch neural network
- **Model Architecture**: Multi-label classification (201 inputs → 19 outputs)
- **Containerization**: Docker with Python 3.11

**Service Structure**:
```
ml-patient-evaluator-api/
├── api.py                      # Flask app entry point
├── src/
│   ├── app.py                  # Flask factory and security headers
│   ├── routes/
│   │   ├── predict.py         # Prediction endpoint
│   │   ├── health.py          # Health check endpoint
│   │   └── metrics.py         # Performance metrics
│   ├── services/
│   │   ├── inference_service.py  # Model loading and inference
│   │   └── state.py            # Service state management
│   ├── models/
│   │   └── multilabel_nn.py   # PyTorch model definition
│   └── security/
│       └── security.py        # Security headers
└── models/
    └── mental_model_config2.pt  # Trained model weights
```

**API Endpoints**:
- `POST /predict`: Accepts 201-item questionnaire array, returns 19 condition predictions
- `GET /health`: Service health status and model availability
- `GET /metrics`: Performance metrics (request count, latency, success rate)
- `POST /metrics/reset`: Reset metrics counters

### 3.6 Data Flow Architecture

**Assessment Flow**:

```mermaid
sequenceDiagram
    participant User
    participant Frontend as Frontend Service<br/>(Port 10001)
    participant Backend as Backend API<br/>(Port 10000)
    participant ML as AI/ML Service<br/>(Port 10002)
    participant DB as PostgreSQL<br/>(Supabase)

    User->>Frontend: Completes 201-item questionnaire
    Frontend->>Backend: POST /api/pre-assessment/submit<br/>(JWT Auth)
    Backend->>Backend: Validate & normalize data
    Backend->>ML: POST /predict<br/>{inputs: [201 float values]}
    ML->>ML: Load PyTorch model<br/>(if not cached)
    ML->>ML: Neural network inference<br/>(201 → 512 → 256 → 19)
    ML->>ML: Apply sigmoid & threshold (0.5)
    ML-->>Backend: Return 19 condition predictions
    Backend->>DB: Store assessment results
    Backend->>Backend: Generate clinical insights
    Backend->>Backend: Trigger therapist matching
    Backend-->>Frontend: Assessment results + recommendations
    Frontend->>User: Display predictions, therapist matches,<br/>community assignments
```

**Text Flow**:

```
1. User completes 201-item questionnaire (Frontend)
   ↓
2. Frontend sends responses to Backend API
   POST /api/pre-assessment/submit
   ↓
3. Backend validates and normalizes data
   ↓
4. Backend calls AI/ML Service
   POST http://ml-service:10002/predict
   Body: { "inputs": [201 float values] }
   ↓
5. AI/ML Service performs inference
   - Load model (if not cached)
   - Run forward pass through neural network
   - Apply sigmoid activation and threshold (0.5)
   - Return 19 boolean predictions
   ↓
6. Backend processes results
   - Store assessment results in database
   - Generate clinical insights
   - Trigger therapist matching algorithm
   ↓
7. Frontend displays results
   - Condition predictions with confidence scores
   - Therapist recommendations
   - Community assignments
```

**Therapist Matching Integration**:

The AI assessment results inform a sophisticated therapist matching algorithm:

```typescript
// Simplified matching flow
1. Extract predicted conditions from AI assessment
2. Build user condition profile
3. Calculate compatibility scores for each therapist:
   - Condition match score (specialization alignment)
   - Approach compatibility (therapy method fit)
   - Experience and success score
   - Review and rating score
   - Logistics score (availability, location)
4. Rank therapists by weighted total score
5. Return top recommendations with explanations
```

### 3.7 Neural Network Architecture

**Model Architecture**:
```
Input Layer:     201 neurons (questionnaire responses)
    ↓
Hidden Layer 1:  512 neurons + ReLU activation + Dropout (0.4)
    ↓
Hidden Layer 2:  256 neurons + ReLU activation + Dropout (0.4)
    ↓
Output Layer:    19 neurons + Sigmoid activation
    ↓
Threshold:       0.5 (binary classification per condition)
```

**Architecture Details**:
- **Input Size**: 201 features (one per questionnaire item)
- **Hidden Layers**: 2 fully connected layers (512 → 256 neurons)
- **Activation Functions**: ReLU for hidden layers, Sigmoid for output
- **Regularization**: Dropout (0.4) after each hidden layer
- **Output Size**: 19 binary predictions (one per mental health condition)
- **Loss Function**: Binary Cross-Entropy (multi-label classification)

**Model Parameters**:
- Total parameters: ~150,000 trainable parameters
- Model size: ~600 KB (compressed PyTorch state dict)
- Inference mode: CPU-optimized (GPU support available)

### 3.8 Scalability and Deployment

**Containerization Strategy**:
Each service has its own Docker container and docker-compose configuration:

```yaml
# Service-specific deployment
mentara-api/docker-compose.yml      # Backend API
mentara-web/docker-compose.yml      # Frontend
ml-patient-evaluator-api/docker-compose.yml  # AI/ML Service
```

**Scaling Considerations**:
- **Frontend**: Stateless, horizontally scalable via load balancer
- **Backend API**: Stateless API layer, scales horizontally with shared database
- **AI/ML Service**: Can scale independently based on inference demand
- **Database**: PostgreSQL via Supabase with connection pooling

**Performance Characteristics**:
- **API Response Time**: <200ms (p95) for standard endpoints
- **AI Inference Time**: <1000ms average, <2000ms maximum
- **Concurrent Requests**: Supports multiple simultaneous predictions
- **Model Loading**: Lazy loading on first request, cached in memory

### 3.9 Integration Patterns

**REST API Communication**:
- Backend → AI/ML Service: Synchronous HTTP POST requests
- Frontend → Backend: RESTful API calls with JWT authentication
- Error handling: Graceful degradation if AI service unavailable

**Real-time Communication**:
- WebSocket connections for messaging and notifications
- WebRTC peer-to-peer connections for video consultations
- Socket.io namespaces for different communication types

**Data Persistence**:
- Assessment results stored in PostgreSQL database
- Model predictions cached to reduce redundant inference
- Audit logging for compliance and debugging

---

## Notes for Authors

- Add detailed sequence diagrams for data flow
- Include network topology diagrams
- Expand on error handling and retry logic
- Add deployment architecture diagrams
- Include performance benchmarks and scaling metrics
- Document API contracts and data schemas
