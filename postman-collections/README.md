# Mentara API - Postman Collections

Comprehensive Postman collections for testing the Mentara mental health platform APIs. These collections provide complete coverage of all endpoints with authentication, validation, and error handling examples.

## 📁 Collection Overview

| Collection | Endpoints | Description |
|------------|-----------|-------------|
| **01-Authentication** | 12 | User authentication, registration, JWT token management |
| **02-User-Management** | 15 | User profiles, account management, admin user operations |
| **03-AI-Patient-Evaluation** | 18 | Mental health assessments, AI predictions, performance testing |
| **04-Booking-System** | 22 | Therapy session booking, availability management, scheduling |
| **05-Messaging-System** | 28 | Real-time messaging, conversations, reactions, blocking |
| **06-Therapist-Management** | 20 | Therapist applications, recommendations, profile management |
| **07-Admin-Dashboard** | 25 | Platform analytics, user oversight, system management |

**Total: 140+ API endpoints across 7 collections**

---

## 🚀 Quick Setup

### 1. Import Collections

1. Open Postman
2. Click **Import** button
3. Select **File** tab
4. Choose all `.json` files from this directory
5. Click **Import**

### 2. Setup Environment

Create a new environment with these variables:

```json
{
  "baseUrl": "http://localhost:3001/api",
  "aiBaseUrl": "http://localhost:5000",
  "accessToken": "",
  "refreshToken": "",
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "userRole": "client",
  "aiApiKey": "",
  "therapistId": "987fcdeb-51a2-43d1-9c4f-123456789012",
  "clientId": "456e7890-a1b2-34c5-6d7e-890123456789",
  "targetUserId": "abc12345-6789-def0-1234-567890abcdef",
  "conversationId": "conv-1234-5678-9abc-def0",
  "meetingId": "meet-1234-5678-9abc-def0",
  "applicationId": "app-1234-5678-9abc-def0"
}
```

**Important**: User ID variables must be valid UUIDs (UUID v4 format) to pass new Zod validation requirements.

### 3. Configure Test Accounts

Set up test user credentials:

```json
{
  "testEmail": "test@example.com",
  "testPassword": "SecurePass123!",
  "adminEmail": "admin@mentara.com",
  "adminPassword": "AdminPass123!",
  "therapistEmail": "therapist@example.com",
  "therapistPassword": "TherapistPass123!"
}
```

**Note**: All passwords must be at least 8 characters long to pass Zod validation requirements.

---

## 🔐 Authentication Flow

### Step 1: Login
```bash
POST {{baseUrl}}/auth/login
{
  "email": "{{testEmail}}",
  "password": "{{testPassword}}"
}
```

### Step 2: Auto-Token Setup
Tokens are automatically saved to environment variables:
- `accessToken` - Used for Bearer authentication
- `refreshToken` - Used for token refresh
- `userId` - Current user ID
- `userRole` - User role (client, therapist, moderator, admin)

### Step 3: Token Refresh
```bash
POST {{baseUrl}}/auth/refresh
{
  "refreshToken": "{{refreshToken}}"
}
```

---

## 🧪 Testing Workflows

### Complete User Journey Test

1. **Authentication Flow**
   ```
   01-Authentication → Login → Get Current User → Logout
   ```

2. **Client Journey**
   ```
   01-Authentication → Register Client
   03-AI-Patient-Evaluation → Create Pre-Assessment
   06-Therapist-Management → Get Recommendations
   04-Booking-System → Create Meeting
   05-Messaging-System → Create Conversation
   ```

3. **Therapist Journey**
   ```
   01-Authentication → Register Therapist
   06-Therapist-Management → Submit Application
   04-Booking-System → Create Availability
   05-Messaging-System → Respond to Messages
   ```

4. **Admin Journey**
   ```
   01-Authentication → Admin Login
   07-Admin-Dashboard → Review Applications
   06-Therapist-Management → Approve Application
   07-Admin-Dashboard → View Analytics
   ```

### AI Service Testing

1. **Health Check**
   ```
   03-AI-Patient-Evaluation → Service Health → Health Check
   ```

2. **Prediction Testing**
   ```
   03-AI-Patient-Evaluation → Mental Health Predictions → Predict - Sample Assessment
   ```

3. **Performance Testing**
   ```
   03-AI-Patient-Evaluation → Performance Testing → Load Test - Multiple Predictions
   ```

---

## 🎯 Collection Details

### 01-Authentication.postman_collection.json
**Focus**: User authentication and session management

**Key Features**:
- JWT token-based authentication
- Automatic token storage and refresh
- Role-based access control
- Session management

**Test Scenarios**:
- Login/logout workflows
- Token refresh automation
- User registration validation
- Admin user management

### 02-User-Management.postman_collection.json
**Focus**: User profile and account operations

**Key Features**:
- Profile CRUD operations
- Advanced user search and filtering
- Account status management
- Admin user oversight

**Test Scenarios**:
- Profile update validation
- Admin user deactivation
- User search functionality
- Role-based access control

### 03-AI-Patient-Evaluation.postman_collection.json
**Focus**: AI-powered mental health assessments

**Key Features**:
- 201-item questionnaire processing
- 19 mental health condition predictions
- Performance and load testing
- Security validation

**Test Scenarios**:
- Sample mental health assessments
- Error handling for invalid inputs
- Performance under load
- API key authentication

### 04-Booking-System.postman_collection.json
**Focus**: Therapy session scheduling and management

**Key Features**:
- Meeting CRUD operations
- Therapist availability management
- Recurring appointment scheduling
- Conflict detection and validation

**Test Scenarios**:
- Complete booking workflow
- Availability management
- Recurring meeting setup
- Time conflict validation

### 05-Messaging-System.postman_collection.json
**Focus**: Secure real-time communication

**Key Features**:
- End-to-end encrypted messaging
- Conversation management
- Message reactions and status
- User blocking and privacy

**Test Scenarios**:
- Complete messaging workflow
- File attachment handling
- Message search functionality
- Blocking and privacy controls

### 06-Therapist-Management.postman_collection.json
**Focus**: Therapist onboarding and matching

**Key Features**:
- Multi-document application submission
- AI-powered therapist recommendations
- Admin application review
- Profile and availability management

**Test Scenarios**:
- Complete application process
- Recommendation algorithm testing
- Admin approval workflow
- Profile management

### 07-Admin-Dashboard.postman_collection.json
**Focus**: Platform administration and analytics

**Key Features**:
- Comprehensive analytics and reporting
- User and content moderation
- System health monitoring
- Compliance and audit logging

**Test Scenarios**:
- Dashboard analytics retrieval
- Content moderation workflow
- System health monitoring
- Compliance reporting

---

## 🔒 Security Testing

### Authentication Security
- **Invalid credentials testing**: All collections test invalid login attempts
- **Token expiration handling**: Automatic refresh token logic
- **Role-based access control**: Admin-only endpoint protection
- **API key validation**: AI service authentication testing

### Input Validation
- **Zod Schema Validation**: All request bodies validated with Zod schemas
- **UUID Parameter Validation**: User IDs must be valid UUID v4 format
- **Password Strength**: Minimum 8 characters for new passwords
- **Email Format**: Strict email validation using Zod email schema
- **SQL injection protection**: Parameterized query testing
- **XSS prevention**: Input sanitization validation
- **File upload security**: File type and size validation
- **Rate limiting**: Load testing with concurrent requests

### HIPAA Compliance Testing
- **Data encryption**: Encrypted message testing
- **Audit logging**: Comprehensive audit trail verification
- **Access controls**: Role-based data access testing
- **Data retention**: Compliance with retention policies

---

## 📊 Performance Testing

### Load Testing Scenarios
1. **High-Volume User Registration**
   ```
   01-Authentication → Register Client (100 concurrent users)
   ```

2. **AI Service Load Testing**
   ```
   03-AI-Patient-Evaluation → Load Test - Multiple Predictions (50 requests/second)
   ```

3. **Messaging System Stress Test**
   ```
   05-Messaging-System → Send Message (1000 messages/minute)
   ```

4. **Booking System Concurrent Access**
   ```
   04-Booking-System → Create Meeting (Multiple users booking same time)
   ```

### Performance Metrics
- **Response Time**: < 2000ms for most endpoints
- **Throughput**: > 50 requests/second
- **Error Rate**: < 1% under normal load
- **Memory Usage**: Stable under sustained load

---

## 🐛 Error Handling

### Common Error Scenarios
Each collection includes comprehensive error testing:

- **400 Bad Request**: Zod validation failures (see Error Response Format above)
- **401 Unauthorized**: Missing or invalid authentication
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Non-existent resources
- **409 Conflict**: Resource conflicts (booking conflicts, etc.)
- **422 Unprocessable Entity**: Business logic validation failures
- **429 Too Many Requests**: Rate limiting
- **500 Internal Server Error**: Server-side error handling

### Error Response Format

#### Zod Validation Errors (400 Bad Request)
```json
{
  "issues": [
    {
      "path": ["email"],
      "message": "Invalid email format"
    },
    {
      "path": ["password"],
      "message": "Password is required"
    }
  ]
}
```

#### Parameter Validation Errors (400 Bad Request)
```json
{
  "issues": [
    {
      "path": ["id"],
      "message": "Invalid user ID format"
    }
  ]
}
```

#### General Error Format (Non-validation errors)
```json
{
  "error": "Error type",
  "message": "Human-readable error message",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "path": "/api/endpoint",
  "statusCode": 404
}
```

---

## ⚡ Zod Validation Guide

### Overview
As of January 2025, all Mentara API endpoints use **Zod validation** instead of class-validator. This provides:
- Stricter type validation
- Better error messages with path information
- UUID format validation for user IDs
- Enhanced password requirements

### Common Validation Requirements

#### Password Validation
- **Login**: `password: z.string().min(1)` - Password cannot be empty
- **Registration**: `password: z.string().min(8)` - Must be at least 8 characters
- **Change Password**: `newPassword: z.string().min(8)` - Must be at least 8 characters

#### User ID Validation
- **Parameter Routes**: `id: z.string().uuid()` - Must be valid UUID v4 format
- **Examples**: `123e4567-e89b-12d3-a456-426614174000`
- **Invalid**: `"user123"`, `"invalid-id"`, `""`

#### Email Validation
- **Format**: `email: z.string().email()` - Stricter email validation
- **Valid**: `"user@example.com"`
- **Invalid**: `"invalid-email"`, `"user@"`, `""`

### Testing Validation Errors

All collections now include validation error tests:

```javascript
// Test for Zod validation errors (400 responses)
pm.test('Zod validation error format (if 400)', function () {
    if (pm.response.code === 400) {
        const responseJson = pm.response.json();
        pm.expect(responseJson).to.have.property('issues');
        pm.expect(responseJson.issues).to.be.an('array');
        if (responseJson.issues.length > 0) {
            pm.expect(responseJson.issues[0]).to.have.property('path');
            pm.expect(responseJson.issues[0]).to.have.property('message');
        }
    }
});
```

### Migration from Class-Validator

If updating existing tests:

**Before (Class-Validator)**:
```javascript
expect(response.body.message).to.contain('email must be an email');
```

**After (Zod)**:
```javascript
const emailError = response.body.issues.find(issue => 
    issue.path && issue.path.includes('email'));
expect(emailError.message).to.equal('Invalid email format');
```

---

## 📝 Usage Examples

### Running a Complete Test Suite

1. **Setup Environment**:
   - Import all collections
   - Configure environment variables
   - Set up test user accounts

2. **Authentication Test**:
   ```bash
   # Run the authentication collection
   newman run 01-Authentication.postman_collection.json \
     --environment mentara-environment.json \
     --reporters cli,json
   ```

3. **Full Integration Test**:
   ```bash
   # Run all collections in sequence
   for collection in *.postman_collection.json; do
     newman run "$collection" --environment mentara-environment.json
   done
   ```

### Automated Testing Integration

#### GitHub Actions Example
```yaml
name: API Integration Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install Newman
        run: npm install -g newman
      - name: Run Postman Collections
        run: |
          newman run postman-collections/01-Authentication.postman_collection.json \
            --environment postman-collections/environment.json \
            --reporters cli,junit --reporter-junit-export results.xml
```

#### CI/CD Pipeline Integration
```bash
# Pre-deployment testing
newman run postman-collections/*.json \
  --environment staging-environment.json \
  --bail \
  --reporters cli,json \
  --reporter-json-export test-results.json
```

---

## 🔧 Advanced Configuration

### Custom Scripts

#### Pre-request Script (Global)
```javascript
// Set dynamic timestamps
pm.environment.set("timestamp", new Date().toISOString());

// Generate random data
pm.environment.set("randomEmail", `test${Math.random().toString(36).substr(2, 9)}@example.com`);

// Auto-refresh expired tokens
if (pm.environment.get("accessToken")) {
    const token = pm.environment.get("accessToken");
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp * 1000 < Date.now()) {
            // Token expired, trigger refresh
            console.log("Token expired, refreshing...");
        }
    } catch (e) {
        console.log("Invalid token format");
    }
}
```

#### Test Script (Global)
```javascript
// Global response validation
pm.test("Response time is acceptable", function () {
    pm.expect(pm.response.responseTime).to.be.below(5000);
});

pm.test("No server errors", function () {
    pm.expect(pm.response.code).to.be.below(500);
});

// Automatic error logging
if (pm.response.code >= 400) {
    console.error(`API Error ${pm.response.code}: ${pm.response.json().message || 'Unknown error'}`);
}
```

### Environment Switching
```javascript
// Dynamic environment switching
const environment = pm.environment.get("environment") || "development";
const baseUrls = {
    "development": "http://localhost:3001/api",
    "staging": "https://staging-api.mentara.com/api",
    "production": "https://api.mentara.com/api"
};
pm.environment.set("baseUrl", baseUrls[environment]);
```

---

## 🚨 Troubleshooting

### Common Issues

#### Authentication Failures
```bash
# Issue: 401 Unauthorized
# Solution: Check token expiration and refresh
POST {{baseUrl}}/auth/refresh
```

#### CORS Errors
```bash
# Issue: CORS policy errors in browser
# Solution: Use Postman desktop app or configure CORS headers
```

#### AI Service Connection
```bash
# Issue: AI service unavailable
# Solution: Check service health endpoint
GET {{aiBaseUrl}}/health
```

#### Rate Limiting
```bash
# Issue: 429 Too Many Requests
# Solution: Add delays between requests or check rate limits
```

### Debug Mode
Enable detailed logging in Postman:
1. Go to Settings → General
2. Turn on "SSL certificate verification"
3. Turn on "Request validation"
4. Check "Automatically follow redirects"

### Logging and Monitoring
```javascript
// Enhanced logging script
console.log(`🚀 ${pm.info.requestName} - ${pm.request.method} ${pm.request.url}`);
console.log(`📊 Response: ${pm.response.code} - ${pm.response.responseTime}ms`);

if (pm.response.code >= 400) {
    console.error(`❌ Error Response:`, pm.response.json());
} else {
    console.log(`✅ Success:`, pm.response.json());
}
```

---

## 📚 Additional Resources

### Documentation Links
- [Mentara API Documentation](./docs/api/)
- [Authentication Guide](./docs/authentication.md)
- [Testing Best Practices](./docs/testing-guide.md)
- [Security Guidelines](./SECURITY_AUDIT_REPORT.md)

### Development Tools
- **Newman**: Command-line Postman runner
- **Postman Monitors**: Automated collection running
- **Postman Mock Servers**: API mocking for testing
- **Documentation Generator**: Auto-generate API docs

### Support
- **GitHub Issues**: [Report bugs or request features](https://github.com/mentara/api/issues)
- **Team Slack**: #api-testing channel
- **Documentation**: [Full API reference](./docs/)

---

**Last Updated**: 2025-07-14  
**Version**: 1.0.0  
**Maintainer**: AI/DevOps Agent

*These collections are continuously updated to match the latest API changes and testing requirements.*