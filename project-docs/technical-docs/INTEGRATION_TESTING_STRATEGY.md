# 🔗 Integration Testing Strategy - Mentara Platform

**Objective**: Ensure seamless communication and data flow between Frontend (Next.js), Backend (NestJS), and AI Service (Flask) with comprehensive integration testing across all service boundaries.

## 🧠 ENHANCED MCP-POWERED INTEGRATION TESTING

### Advanced Testing Methodologies

#### 🎯 ULTRATHINK Integration Analysis
**Before implementing any integration test:**
```
Use mcp__sequential-thinking__sequentialthinking to:
- Analyze complex integration scenarios step-by-step
- Plan comprehensive test coverage strategies
- Design fault-tolerant testing approaches
- Identify edge cases and failure modes
```

#### 📚 Context7 Testing Framework Research  
**For latest testing patterns:**
```
- mcp__context7__resolve-library-id for "playwright"
- mcp__context7__resolve-library-id for "jest"
- mcp__context7__resolve-library-id for "supertest"
- mcp__context7__get-library-docs for integration testing best practices
```

#### 🔍 Brave-Search Integration Best Practices
**Research cutting-edge testing strategies:**
```
Use mcp__brave-search__sequentialthinking to research:
- "Cross-service integration testing patterns 2024"
- "API contract testing methodologies"
- "Real-time application testing strategies"
- "Database integration testing best practices"
```

#### 🔬 Enhanced Serena Test Analysis
**For comprehensive test planning:**
```
Use mcp__serena__get_symbols_overview for service boundary analysis
Use mcp__serena__find_referencing_symbols for dependency mapping
Use mcp__serena__think_about_collected_information after test design
Use mcp__serena__think_about_whether_you_are_done for coverage validation
```

---

## 🎯 Integration Testing Scope

### Service Integration Points
```
┌─────────────────┐    HTTP/API    ┌─────────────────┐    HTTP/ML     ┌─────────────────┐
│   Frontend      │◄──────────────►│    Backend      │◄──────────────►│   AI Service    │
│   (Next.js)     │   Axios calls  │   (NestJS)      │  Evaluation    │    (Flask)      │
│                 │                │                 │    Requests    │                 │
└─────────────────┘                └─────────────────┘                └─────────────────┘
         │                                   │                                   │
         │                                   │                                   │
         ▼                                   ▼                                   ▼
┌─────────────────┐                ┌─────────────────┐                ┌─────────────────┐
│ Authentication  │                │   PostgreSQL    │                │  PyTorch Model  │
│    (Clerk)      │                │   Database      │                │    (Neural Net) │
└─────────────────┘                └─────────────────┘                └─────────────────┘
```

### Critical Integration Paths
1. **Authentication Flow**: Clerk → Backend → Frontend
2. **API Communication**: Frontend Services → Backend Controllers
3. **Database Operations**: Backend → PostgreSQL → Data Consistency
4. **AI Evaluation**: Backend → Flask → Model Inference → Response
5. **Real-time Features**: WebSocket → Frontend ↔ Backend
6. **File Operations**: Frontend → Backend → Storage (Supabase/S3)

---

## 🧪 Integration Test Categories

### 1. API Contract Testing
**Purpose**: Ensure frontend services match backend API contracts

#### Test Structure
```typescript
// tests/integration/api-contracts/
├── auth.contract.test.ts          # Authentication endpoints
├── users.contract.test.ts         # User management endpoints
├── therapists.contract.test.ts    # Therapist endpoints
├── booking.contract.test.ts       # Booking system endpoints
├── messaging.contract.test.ts     # Real-time messaging
├── reviews.contract.test.ts       # Review system endpoints
├── dashboard.contract.test.ts     # Dashboard data aggregation
└── admin.contract.test.ts         # Admin functionality
```

#### Example Contract Test
```typescript
// tests/integration/api-contracts/auth.contract.test.ts
describe('Authentication API Contract', () => {
  let frontend: NextApp;
  let backend: NestApp;
  
  beforeAll(async () => {
    backend = await createTestingModule({
      imports: [AppModule],
    }).compile().createNestApplication();
    await backend.init();
    
    frontend = await createNextApp({
      env: { API_BASE_URL: backend.getHttpServer().getUrl() }
    });
  });

  describe('User Registration Flow', () => {
    it('should complete end-to-end user registration', async () => {
      // Frontend service call
      const registerData = {
        email: 'test@example.com',
        role: 'client',
        profile: { firstName: 'Test', lastName: 'User' }
      };
      
      // Call frontend service method
      const result = await frontend.authService.register(registerData);
      
      // Verify backend received correct data
      expect(result.status).toBe(201);
      expect(result.data.user.email).toBe(registerData.email);
      
      // Verify database state
      const userInDb = await backend.prismaService.user.findUnique({
        where: { email: registerData.email }
      });
      expect(userInDb).toBeDefined();
      expect(userInDb.role).toBe('client');
    });

    it('should handle registration errors consistently', async () => {
      const invalidData = { email: 'invalid-email' };
      
      await expect(frontend.authService.register(invalidData))
        .rejects.toThrow('Invalid email format');
      
      // Verify no partial data created in database
      const userCount = await backend.prismaService.user.count();
      expect(userCount).toBe(0);
    });
  });

  describe('Authentication State Management', () => {
    it('should maintain auth state across page refreshes', async () => {
      // Login user
      const loginResult = await frontend.authService.login({
        email: 'existing@example.com',
        password: 'validPassword'
      });
      
      // Simulate page refresh
      await frontend.reloadApp();
      
      // Verify auth state persisted
      const currentUser = await frontend.authService.getCurrentUser();
      expect(currentUser).toBeDefined();
      expect(currentUser.email).toBe('existing@example.com');
    });
  });
});
```

### 2. Cross-Service Data Flow Testing
**Purpose**: Verify data consistency across service boundaries

#### Test Structure
```typescript
// tests/integration/data-flow/
├── user-journey.test.ts           # Complete user workflows
├── therapist-workflow.test.ts     # Therapist application → approval
├── booking-lifecycle.test.ts      # Booking creation → completion
├── assessment-pipeline.test.ts    # Assessment → AI → recommendations
├── messaging-realtime.test.ts     # Real-time message delivery
└── admin-operations.test.ts       # Admin actions across services
```

#### Example Data Flow Test
```typescript
// tests/integration/data-flow/assessment-pipeline.test.ts
describe('Mental Health Assessment Pipeline', () => {
  let testUser: User;
  let assessmentData: PreAssessmentData;
  
  beforeEach(async () => {
    testUser = await createTestUser({ role: 'client' });
    assessmentData = generateMockAssessmentData(); // 201 responses
  });

  it('should complete full assessment pipeline: Frontend → Backend → AI → Database', async () => {
    // Step 1: Frontend submits assessment
    const submissionResult = await frontend.assessmentService.submitAssessment({
      userId: testUser.id,
      responses: assessmentData.responses
    });
    
    expect(submissionResult.status).toBe('submitted');
    
    // Step 2: Verify backend stored assessment
    const storedAssessment = await backend.prismaService.preAssessment.findFirst({
      where: { userId: testUser.id }
    });
    
    expect(storedAssessment.responses).toHaveLength(201);
    expect(storedAssessment.status).toBe('processing');
    
    // Step 3: Backend sends to AI service
    const aiResponse = await backend.aiServiceClient.evaluate({
      inputs: assessmentData.responses
    });
    
    expect(aiResponse).toHaveProperty('Has_Depression');
    expect(aiResponse).toHaveProperty('Has_Anxiety');
    
    // Step 4: Verify results stored in database
    const updatedAssessment = await backend.prismaService.preAssessment.findFirst({
      where: { userId: testUser.id },
      include: { results: true }
    });
    
    expect(updatedAssessment.status).toBe('completed');
    expect(updatedAssessment.results).toBeDefined();
    
    // Step 5: Frontend can retrieve results
    const frontendResults = await frontend.assessmentService.getResults(testUser.id);
    
    expect(frontendResults.conditions).toEqual(aiResponse);
    expect(frontendResults.recommendations).toBeDefined();
  });

  it('should handle AI service failures gracefully', async () => {
    // Mock AI service failure
    jest.spyOn(backend.aiServiceClient, 'evaluate').mockRejectedValue(
      new Error('AI service unavailable')
    );
    
    const submissionResult = await frontend.assessmentService.submitAssessment({
      userId: testUser.id,
      responses: assessmentData.responses
    });
    
    // Verify graceful failure handling
    expect(submissionResult.status).toBe('failed');
    
    const assessment = await backend.prismaService.preAssessment.findFirst({
      where: { userId: testUser.id }
    });
    
    expect(assessment.status).toBe('error');
    expect(assessment.errorMessage).toContain('AI service unavailable');
  });
});
```

### 3. Real-time Integration Testing
**Purpose**: Test WebSocket connections and real-time features

#### Test Structure
```typescript
// tests/integration/realtime/
├── messaging.realtime.test.ts     # Chat message delivery
├── meeting.realtime.test.ts       # Video meeting coordination
├── notifications.realtime.test.ts # Live notifications
└── typing-indicators.test.ts      # Typing status updates
```

#### Example Real-time Test
```typescript
// tests/integration/realtime/messaging.realtime.test.ts
describe('Real-time Messaging Integration', () => {
  let therapistClient: SocketIOClient;
  let patientClient: SocketIOClient;
  let conversation: Conversation;

  beforeEach(async () => {
    const therapist = await createTestUser({ role: 'therapist' });
    const patient = await createTestUser({ role: 'client' });
    
    conversation = await backend.messagingService.createConversation({
      participants: [therapist.id, patient.id]
    });
    
    therapistClient = io(backend.getUrl(), {
      auth: { token: therapist.token }
    });
    
    patientClient = io(backend.getUrl(), {
      auth: { token: patient.token }
    });
    
    await Promise.all([
      waitForConnection(therapistClient),
      waitForConnection(patientClient)
    ]);
  });

  it('should deliver messages in real-time between participants', async () => {
    const messageData = {
      conversationId: conversation.id,
      content: 'Hello, how are you feeling today?',
      type: 'text'
    };
    
    // Set up message listener for patient
    const messageReceived = new Promise((resolve) => {
      patientClient.on('message:received', resolve);
    });
    
    // Therapist sends message
    therapistClient.emit('message:send', messageData);
    
    // Verify message received by patient
    const receivedMessage = await messageReceived;
    expect(receivedMessage.content).toBe(messageData.content);
    expect(receivedMessage.senderId).toBe(therapist.id);
    
    // Verify message persisted in database
    const storedMessage = await backend.prismaService.message.findFirst({
      where: { conversationId: conversation.id }
    });
    
    expect(storedMessage.content).toBe(messageData.content);
    expect(storedMessage.deliveredAt).toBeDefined();
  });

  it('should handle typing indicators across participants', async () => {
    // Set up typing listener
    const typingStarted = new Promise((resolve) => {
      patientClient.on('typing:started', resolve);
    });
    
    const typingStopped = new Promise((resolve) => {
      patientClient.on('typing:stopped', resolve);
    });
    
    // Therapist starts typing
    therapistClient.emit('typing:start', { conversationId: conversation.id });
    
    const startEvent = await typingStarted;
    expect(startEvent.userId).toBe(therapist.id);
    
    // Therapist stops typing
    therapistClient.emit('typing:stop', { conversationId: conversation.id });
    
    const stopEvent = await typingStopped;
    expect(stopEvent.userId).toBe(therapist.id);
  });
});
```

### 4. Database Integration Testing
**Purpose**: Verify data consistency and transaction integrity

#### Test Structure
```typescript
// tests/integration/database/
├── transaction-integrity.test.ts  # ACID compliance testing
├── cascade-operations.test.ts     # Related data consistency
├── concurrent-access.test.ts      # Multi-user scenarios
├── migration-testing.test.ts      # Schema evolution testing
└── performance.test.ts           # Query performance testing
```

### 5. Authentication Integration Testing
**Purpose**: Test auth flows across all services

#### Test Structure
```typescript
// tests/integration/auth/
├── clerk-integration.test.ts      # Clerk service integration
├── role-based-access.test.ts      # Permission enforcement
├── token-refresh.test.ts          # Token lifecycle management
├── sso-workflow.test.ts           # Single sign-on flows
└── session-management.test.ts     # Session persistence
```

---

## 🛠️ Integration Test Infrastructure

### Test Environment Setup
```typescript
// tests/setup/integration-setup.ts
export class IntegrationTestSetup {
  private backend: NestApplication;
  private frontend: NextApp;
  private aiService: FlaskApp;
  private database: TestDatabase;

  async setupAll(): Promise<void> {
    // 1. Setup test database
    this.database = await TestDatabase.create();
    await this.database.migrate();
    
    // 2. Start backend service
    this.backend = await createNestApp({
      database: this.database.getUrl(),
      aiService: 'http://localhost:5001'
    });
    
    // 3. Start AI service
    this.aiService = await createFlaskApp({
      port: 5001,
      modelPath: './test-model.pt'
    });
    
    // 4. Setup frontend with test backend
    this.frontend = await createNextApp({
      apiUrl: this.backend.getUrl(),
      authProvider: 'test'
    });
  }

  async teardownAll(): Promise<void> {
    await Promise.all([
      this.frontend?.close(),
      this.backend?.close(),
      this.aiService?.close(),
      this.database?.cleanup()
    ]);
  }

  // Helper methods for test data
  async createTestScenario(scenario: string): Promise<TestData> {
    switch (scenario) {
      case 'therapist-patient-match':
        return await this.createTherapistPatientScenario();
      case 'assessment-workflow':
        return await this.createAssessmentScenario();
      case 'booking-workflow':
        return await this.createBookingScenario();
      default:
        throw new Error(`Unknown scenario: ${scenario}`);
    }
  }
}
```

### Test Data Management
```typescript
// tests/fixtures/test-data-factory.ts
export class IntegrationTestDataFactory {
  static async createCompleteUserWorkflow(): Promise<TestWorkflow> {
    return {
      user: await this.createUser({ role: 'client' }),
      therapist: await this.createTherapist({ verified: true }),
      assessment: await this.createAssessment({ completed: true }),
      booking: await this.createBooking({ status: 'confirmed' }),
      conversation: await this.createConversation({ active: true })
    };
  }

  static async createAssessmentData(): Promise<AssessmentTestData> {
    return {
      responses: Array(201).fill(0).map((_, i) => {
        // Generate realistic assessment responses
        return Math.floor(Math.random() * 4); // 0-3 scale
      }),
      expectedConditions: {
        'Has_Depression': true,
        'Has_Anxiety': false,
        // ... other conditions
      }
    };
  }
}
```

---

## 🔄 Continuous Integration Testing

### CI Pipeline Integration Tests
```yaml
# .github/workflows/integration-tests.yml
name: Integration Tests

on:
  pull_request:
    branches: [dev, master]
  push:
    branches: [dev]

jobs:
  integration-tests:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: test
          POSTGRES_DB: mentara_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.9'
          
      - name: Install dependencies
        run: |
          cd mentara-client && npm ci
          cd mentara-api && npm ci
          cd ai-patient-evaluation && pip install -r requirements.txt
          
      - name: Run Integration Tests
        run: |
          npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:test@localhost:5432/mentara_test
          AI_SERVICE_URL: http://localhost:5001
          CLERK_SECRET_KEY: ${{ secrets.CLERK_SECRET_KEY_TEST }}
```

### Test Execution Strategy
```bash
# Run integration tests in order
npm run test:integration:contracts    # API contract validation
npm run test:integration:dataflow     # Cross-service data flow
npm run test:integration:realtime     # WebSocket functionality
npm run test:integration:auth         # Authentication flows
npm run test:integration:performance  # Performance benchmarks
```

---

## 📊 Integration Test Monitoring

### Test Metrics & Reporting
```typescript
// tests/monitoring/integration-metrics.ts
export class IntegrationTestMetrics {
  static async generateReport(): Promise<IntegrationReport> {
    return {
      testSuites: {
        apiContracts: await this.getApiContractResults(),
        dataFlow: await this.getDataFlowResults(),
        realtime: await this.getRealtimeResults(),
        performance: await this.getPerformanceResults()
      },
      coverage: {
        endpointsCovered: await this.getEndpointCoverage(),
        userFlowsCovered: await this.getUserFlowCoverage(),
        errorScenariosCovered: await this.getErrorScenarioCoverage()
      },
      performance: {
        averageResponseTime: await this.getAverageResponseTime(),
        slowestEndpoints: await this.getSlowestEndpoints(),
        errorRates: await this.getErrorRates()
      }
    };
  }
}
```

### Success Criteria
| Test Category | Success Threshold |
|---------------|-------------------|
| **API Contracts** | 100% endpoint compatibility |
| **Data Flow** | 100% critical user journeys pass |
| **Real-time** | < 100ms message delivery latency |
| **Authentication** | 100% role-based access enforcement |
| **Performance** | < 500ms average API response time |
| **Error Handling** | 100% graceful error recovery |

---

## 🎯 Integration Testing Checklist

### Pre-Integration Requirements
- [ ] All unit tests passing (Frontend, Backend, AI)
- [ ] Individual service health checks passing
- [ ] Test data seeds available
- [ ] Mock services configured

### Integration Test Execution
- [ ] API contract tests complete
- [ ] Cross-service data flow verified
- [ ] Real-time features functional
- [ ] Authentication flows validated
- [ ] Database integrity confirmed
- [ ] Performance benchmarks met

### Post-Integration Validation
- [ ] End-to-end user workflows tested
- [ ] Error handling scenarios validated
- [ ] Security permissions enforced
- [ ] Performance metrics within targets
- [ ] Documentation updated

---

**🎯 OBJECTIVE**: Guarantee that all services work together seamlessly with zero integration issues, complete data consistency, and robust error handling across the entire Mentara platform.**