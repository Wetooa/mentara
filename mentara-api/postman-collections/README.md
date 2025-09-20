# Mentara API - Postman Collections

Comprehensive Postman collections for testing the Mentara mental health platform APIs. These collections are organized by backend module for intuitive navigation and provide complete coverage of all endpoints with authentication, validation, and error handling.

## 📁 Collection Overview

The collections are organized using a **1-to-1 module mapping** with the backend architecture for maximum clarity and maintainability.

| Collection | Module | Endpoints | Description |
|------------|--------|-----------|-------------|
| **Admin** | `admin/` | 15+ | Platform administration, user management, therapist oversight, analytics, content moderation |
| **Auth** | `auth/` | 12+ | JWT authentication, OAuth integration, user registration, session management |
| **Booking** | `booking/` | 22+ | Therapy session booking, availability management, scheduling, conflict detection |
| **Messaging** | `messaging/` | 28+ | Real-time messaging, conversations, reactions, file sharing, user blocking |
| **Pre-Assessment** | `pre-assessment/` | 18+ | Mental health assessments, AI predictions, evaluation processing |
| **Therapist** | `therapist/` | 20+ | Application processing, profile management, client requests, recommendations |
| **Users** | `users/` | 15+ | User profiles, account management, search functionality, admin operations |

**Total: 130+ API endpoints across 7 core collections**

---

## 🏗️ New Organization Structure

### ✅ **Before vs After**

**Before (Fragmented):**
```
├── 01-Authentication.postman_collection.json
├── 02-User-Management.postman_collection.json
├── 03-AI-Patient-Evaluation.postman_collection.json
├── 04-Booking-System.postman_collection.json
├── 05-Messaging-System.postman_collection.json
├── 06-Therapist-Management.postman_collection.json
├── 07-Admin-Dashboard.postman_collection.json
├── Admin-Analytics.postman_collection.json
├── Admin-Moderation.postman_collection.json
├── Admin-System.postman_collection.json
├── Admin-Therapists.postman_collection.json
├── Admin-Users.postman_collection.json
├── Auth-Core.postman_collection.json
├── Auth-OAuth.postman_collection.json
├── Auth-Registration.postman_collection.json
├── Therapist-Applications.postman_collection.json
├── Therapist-Profiles.postman_collection.json
├── Therapist-Recommendations.postman_collection.json
├── Therapist-Requests.postman_collection.json
├── User-Management.postman_collection.json
└── User-Profiles.postman_collection.json
```

**After (Organized):**
```
├── Admin.postman_collection.json
├── Auth.postman_collection.json
├── Booking.postman_collection.json
├── Messaging.postman_collection.json
├── Pre-Assessment.postman_collection.json
├── Therapist.postman_collection.json
├── Users.postman_collection.json
├── README.md
└── environment.json
```

### 🎯 **Benefits of New Structure**

1. **Clear Module Mapping**: Each collection corresponds to exactly one backend module
2. **Reduced Complexity**: 7 collections instead of 21+ fragmented files
3. **Improved Navigation**: Logical organization by functional area
4. **Better Maintainability**: Single source of truth for each module
5. **Easier Onboarding**: Developers can quickly find relevant endpoints
6. **Scalability**: New modules can be easily added following the same pattern

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
  "applicationId": "app-1234-5678-9abc-def0",
  "oauthCallbackUrl": "http://localhost:3000/auth/callback"
}
```

**Important**: User ID variables must be valid UUIDs (UUID v4 format) for Zod validation.

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

---

## 🔐 Authentication Flow

### JWT Token-Based Authentication

Most collections use **Bearer Token Authentication** with automatic token management:

```bash
# 1. Login (saves tokens automatically)
POST {{baseUrl}}/auth/login
{
  "email": "{{testEmail}}",
  "password": "{{testPassword}}"
}

# 2. All subsequent requests use saved token
GET {{baseUrl}}/users/profile
Authorization: Bearer {{accessToken}}

# 3. Automatic token refresh when expired
POST {{baseUrl}}/auth/refresh
{
  "refreshToken": "{{refreshToken}}"
}
```

### AI Service Authentication

The **Pre-Assessment** collection uses **API Key Authentication** for AI service endpoints:

```bash
# AI Service endpoints
POST {{aiBaseUrl}}/predict
X-API-Key: {{aiApiKey}}
```

---

## 📚 Collection Details

### 🔐 Auth.postman_collection.json
**Module**: `auth/`  
**Focus**: JWT authentication, OAuth integration, user registration, session management

**Folder Structure**:
```
Auth/
├── Public Authentication/
│   ├── Login
│   ├── Refresh Token
│   └── Logout
├── Registration/
│   ├── Register Client
│   ├── Register Therapist
│   └── Email Verification
├── OAuth Integration/
│   ├── Google OAuth
│   └── Microsoft OAuth
├── Password Management/
│   ├── Forgot Password
│   └── Reset Password
└── Session Management/
    ├── Current User
    └── Force Logout
```

**Key Features**:
- JWT token-based authentication
- Automatic token storage and refresh
- Role-based access control
- OAuth integration (Google, Microsoft)
- Password reset functionality
- Email verification system

### 👥 Users.postman_collection.json
**Module**: `users/`  
**Focus**: User profile management, account operations, search functionality

**Folder Structure**:
```
Users/
├── User Management/
│   ├── Get All Users
│   ├── Get User by ID
│   └── Search Users
├── Profile Management/
│   ├── Get Profile
│   ├── Update Profile
│   └── Delete Profile
└── Account Administration/
    ├── Deactivate Account
    └── Reactivate Account
```

**Key Features**:
- Profile CRUD operations
- Advanced user search and filtering
- Account status management
- Role-based profile access
- File upload handling

### 👩‍⚕️ Therapist.postman_collection.json
**Module**: `therapist/`  
**Focus**: Application processing, profile management, client requests, recommendations

**Folder Structure**:
```
Therapist/
├── Application Process/
│   ├── Submit Application
│   ├── Upload Documents
│   └── Application Status
├── Profile Management/
│   ├── Get Profile
│   ├── Update Profile
│   └── Availability Settings
├── Recommendations/
│   ├── Get Recommendations
│   └── Recommendation Filters
└── Client Requests/
    ├── Get Requests
    ├── Accept Request
    └── Decline Request
```

**Key Features**:
- Multi-document application submission
- AI-powered therapist recommendations
- Profile and availability management
- Client request processing
- Analytics and dashboard data

### 🛡️ Admin.postman_collection.json
**Module**: `admin/`  
**Focus**: Platform administration, user oversight, therapist management, analytics

**Folder Structure**:
```
Admin/
├── Dashboard/
│   ├── Dashboard Data
│   └── System Health
├── User Administration/
│   ├── Get All Users
│   ├── User Details
│   └── User Actions
├── Therapist Administration/
│   ├── Get All Therapists
│   ├── Application Review
│   └── Application Actions
├── Analytics & Reports/
│   ├── Platform Analytics
│   └── Usage Reports
└── Content Moderation/
    ├── Flagged Content
    └── Moderation Actions
```

**Key Features**:
- Comprehensive platform analytics
- User and therapist management
- Application review workflow
- Content moderation system
- System health monitoring
- Compliance reporting

### 📅 Booking.postman_collection.json
**Module**: `booking/`  
**Focus**: Therapy session scheduling, availability management, conflict detection

**Folder Structure**:
```
Booking/
├── Meeting Management/
│   ├── Create Meeting
│   ├── Get Meetings
│   ├── Update Meeting
│   └── Cancel Meeting
├── Availability Management/
│   ├── Create Availability
│   ├── Get Availability
│   ├── Update Availability
│   └── Delete Availability
└── Scheduling/
    ├── Get Available Slots
    └── Session Durations
```

**Key Features**:
- Meeting CRUD operations
- Therapist availability management
- Recurring appointment scheduling
- Conflict detection and validation
- Time slot management

### 💬 Messaging.postman_collection.json
**Module**: `messaging/`  
**Focus**: Real-time communication, file sharing, user privacy

**Folder Structure**:
```
Messaging/
├── Conversation Management/
│   ├── Create Conversation
│   ├── Get Conversations
│   └── Conversation Details
├── Message Operations/
│   ├── Send Message
│   ├── Get Messages
│   ├── Update Message
│   ├── Delete Message
│   └── Mark as Read
├── Message Reactions/
│   ├── Add Reaction
│   ├── Remove Reaction
│   └── Get Read Status
├── User Blocking/
│   ├── Block User
│   ├── Unblock User
│   └── Get Blocked Users
├── Search & Discovery/
│   ├── Search Messages
│   └── Get Online Users
└── Real-time Features/
    ├── Typing Indicator
    └── Presence Update
```

**Key Features**:
- End-to-end encrypted messaging
- File attachment handling
- Message reactions and read receipts
- User blocking and privacy controls
- Real-time presence and typing indicators
- Message search functionality

### 🧠 Pre-Assessment.postman_collection.json
**Module**: `pre-assessment/`  
**Focus**: Mental health assessments, AI predictions, evaluation processing

**Folder Structure**:
```
Pre-Assessment/
├── Assessment Management/
│   ├── Create Assessment
│   ├── Get Assessment
│   └── Update Assessment
├── AI Service Integration/
│   ├── Health Check
│   ├── Prediction Request
│   └── Performance Metrics
└── Service Monitoring/
    ├── Get Metrics
    └── Reset Metrics
```

**Key Features**:
- 201-item questionnaire processing
- 19 mental health condition predictions
- AI service health monitoring
- Performance and load testing
- Comprehensive error handling

---

## 🧪 Testing Workflows

### Complete User Journey Testing

#### 1. **Client Journey**
```
Auth → Register Client
↓
Pre-Assessment → Create Assessment
↓
Therapist → Get Recommendations
↓
Booking → Create Meeting
↓
Messaging → Start Conversation
```

#### 2. **Therapist Journey**
```
Auth → Register Therapist
↓
Therapist → Submit Application
↓
Booking → Set Availability
↓
Messaging → Respond to Messages
↓
Users → Update Profile
```

#### 3. **Admin Journey**
```
Auth → Admin Login
↓
Admin → Review Applications
↓
Therapist → Approve Application
↓
Admin → View Analytics
↓
Users → Manage Users
```

### Cross-Module Testing

The reorganized structure makes it easy to test workflows that span multiple modules:

```bash
# Complete booking workflow
1. Auth → Login as Client
2. Users → Get Profile
3. Therapist → Get Recommendations
4. Booking → Create Meeting
5. Messaging → Start Conversation
```

---

## 🔒 Security & Validation

### Authentication Security
- **JWT Token Management**: Automatic token storage and refresh
- **Role-Based Access Control**: Proper role validation for all endpoints
- **OAuth Integration**: Secure Google and Microsoft authentication
- **API Key Validation**: Secure AI service authentication

### Input Validation
- **Zod Schema Validation**: All request bodies validated with Zod schemas
- **UUID Parameter Validation**: User IDs must be valid UUID v4 format
- **Password Strength**: Minimum 8 characters for new passwords
- **Email Format**: Strict email validation using Zod email schema

### Error Handling
Each collection includes comprehensive error testing:
- **400 Bad Request**: Zod validation failures
- **401 Unauthorized**: Missing or invalid authentication
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Non-existent resources
- **409 Conflict**: Resource conflicts
- **422 Unprocessable Entity**: Business logic validation failures
- **429 Too Many Requests**: Rate limiting
- **500 Internal Server Error**: Server-side error handling

---

## 📊 Performance Testing

### Load Testing Scenarios

Each collection includes performance testing capabilities:

1. **High-Volume Authentication**
   ```
   Auth → Login (100 concurrent users)
   ```

2. **AI Service Load Testing**
   ```
   Pre-Assessment → Predict (50 requests/second)
   ```

3. **Messaging System Stress Test**
   ```
   Messaging → Send Message (1000 messages/minute)
   ```

4. **Booking System Concurrent Access**
   ```
   Booking → Create Meeting (Multiple users, same time slot)
   ```

### Performance Metrics
- **Response Time**: < 2000ms for API endpoints, < 10000ms for AI service
- **Throughput**: > 50 requests/second
- **Error Rate**: < 1% under normal load
- **Memory Usage**: Stable under sustained load

---

## 🛠️ Advanced Configuration

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

### Automated Testing Integration

#### Newman CLI Usage
```bash
# Run all collections
newman run Admin.postman_collection.json --environment environment.json
newman run Auth.postman_collection.json --environment environment.json
newman run Booking.postman_collection.json --environment environment.json
newman run Messaging.postman_collection.json --environment environment.json
newman run Pre-Assessment.postman_collection.json --environment environment.json
newman run Therapist.postman_collection.json --environment environment.json
newman run Users.postman_collection.json --environment environment.json
```

#### CI/CD Pipeline Integration
```yaml
name: API Testing
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
          for collection in postman-collections/*.postman_collection.json; do
            newman run "$collection" --environment postman-collections/environment.json
          done
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

#### Missing Environment Variables
```bash
# Issue: Environment variables not set
# Solution: Verify all required variables are configured
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
# Solution: Add delays between requests
```

### Debug Mode
Enable detailed logging in Postman:
1. Go to Settings → General
2. Turn on "SSL certificate verification"
3. Turn on "Request validation"
4. Check "Automatically follow redirects"

---

## 📞 Support & Resources

### Documentation
- [Backend API Documentation](../mentara-api/docs/)
- [Authentication Guide](../mentara-api/docs/api/auth/)
- [Testing Best Practices](../project-docs/technical-docs/INTEGRATION_TESTING_STRATEGY.md)

### Development Tools
- **Newman**: Command-line Postman runner
- **Postman Monitors**: Automated collection running
- **Postman Mock Servers**: API mocking for testing

### Contributing
When adding new endpoints or modules:
1. Follow the 1-to-1 module mapping principle
2. Use the standardized collection template
3. Include comprehensive test coverage
4. Update this documentation

---

## 🎉 Migration Benefits

### Before Reorganization
- ❌ 21+ fragmented collections
- ❌ Inconsistent naming conventions
- ❌ Scattered admin functionality
- ❌ Duplicate auth endpoints
- ❌ Hard to maintain and navigate

### After Reorganization
- ✅ 7 organized collections
- ✅ Consistent naming conventions
- ✅ 1-to-1 module mapping
- ✅ Comprehensive coverage
- ✅ Easy to maintain and extend

**Result**: A clean, organized, and maintainable Postman testing suite that directly maps to the backend architecture and provides comprehensive API coverage.

---

**Last Updated**: 2025-07-17  
**Version**: 2.0.0  
**Maintainer**: Development Team

*These collections are continuously maintained to match the latest API changes and backend architecture.*