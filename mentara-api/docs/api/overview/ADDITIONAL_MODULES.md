# Additional API Modules Overview

This document provides comprehensive overview and essential documentation for the remaining API modules in the Mentara platform.

## 📁 Files API

**Base URL**: `/files`

### Key Features
- **File Upload**: Secure file upload with validation
- **Storage Integration**: Supabase Storage and AWS S3 support
- **File Management**: CRUD operations for uploaded files
- **Access Control**: Role-based file access permissions
- **Metadata Tracking**: File size, type, and ownership information

### Core Endpoints

#### Upload File
```http
POST /files/upload
Content-Type: multipart/form-data

# Form data:
# file: [binary file data]
# description: "Optional file description"
# category: "document" | "image" | "audio" | "video"
```

#### Get File
```http
GET /files/:id
Authorization: Bearer <token>
```

#### Delete File
```http
DELETE /files/:id
Authorization: Bearer <token>
```

#### Get User Files
```http
GET /files/user/:userId
Authorization: Bearer <token>
```

### File Categories
- **Documents**: PDFs, Word docs, therapy worksheets
- **Images**: Profile pictures, cover images, artwork
- **Audio**: Voice recordings, meditation guides
- **Video**: Session recordings, educational content

---

## ⭐ Reviews API

**Base URL**: `/reviews`

### Key Features
- **Therapist Reviews**: Clients can review their therapists
- **Rating System**: 5-star rating with detailed feedback
- **Review Moderation**: Admin approval system
- **Anonymous Reviews**: Optional anonymous feedback
- **Aggregate Ratings**: Calculated average ratings

### Core Endpoints

#### Create Review
```http
POST /reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "therapistId": "therapist_456",
  "rating": 5,
  "comment": "Excellent therapist, very helpful and understanding",
  "isAnonymous": false,
  "categories": {
    "communication": 5,
    "professionalism": 5,
    "effectiveness": 4
  }
}
```

#### Get Therapist Reviews
```http
GET /reviews/therapist/:therapistId
Authorization: Bearer <token>
```

#### Get Review by ID
```http
GET /reviews/:id
Authorization: Bearer <token>
```

#### Update Review
```http
PUT /reviews/:id
Authorization: Bearer <token>
```

### Review Categories
- **Communication**: How well the therapist communicates
- **Professionalism**: Professional behavior and ethics
- **Effectiveness**: Treatment effectiveness and outcomes
- **Empathy**: Understanding and emotional support
- **Availability**: Scheduling and responsiveness

---

## 💳 Billing API

**Base URL**: `/billing`

### Key Features
- **Payment Processing**: Secure payment handling
- **Subscription Management**: Recurring payment plans
- **Invoice Generation**: Automated billing and receipts
- **Discount System**: Promo codes and discounts
- **Payment History**: Complete transaction records

### Core Endpoints

#### Create Payment
```http
POST /billing/payments
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 150.00,
  "currency": "USD",
  "paymentMethodId": "pm_123456",
  "description": "Therapy session payment",
  "sessionId": "session_789"
}
```

#### Get Payment History
```http
GET /billing/payments/history
Authorization: Bearer <token>
Query Parameters:
- page: number (default: 1)
- limit: number (default: 20)
- startDate: ISO date string
- endDate: ISO date string
```

#### Create Subscription
```http
POST /billing/subscriptions
Authorization: Bearer <token>
Content-Type: application/json

{
  "planId": "plan_monthly_premium",
  "paymentMethodId": "pm_123456"
}
```

#### Apply Discount
```http
POST /billing/apply-discount
Authorization: Bearer <token>
Content-Type: application/json

{
  "discountCode": "SUMMER2024",
  "paymentId": "payment_123"
}
```

### Payment Plans
- **Pay-per-Session**: Individual session payments
- **Monthly Subscription**: Unlimited sessions per month
- **Package Deals**: Bulk session purchases
- **Insurance Billing**: Insurance claim processing

---

## 🛡️ Admin API

**Base URL**: `/admin`

### Key Features
- **Platform Analytics**: Usage statistics and metrics
- **User Management**: Admin-level user operations
- **Content Moderation**: Review and moderate user content
- **System Health**: Platform monitoring and diagnostics
- **Financial Reports**: Revenue and transaction analytics

### Core Endpoints

#### Get Platform Stats
```http
GET /admin/stats
Authorization: Bearer <admin_token>

Response:
{
  "totalUsers": 15420,
  "activeUsers": 14850,
  "totalSessions": 48392,
  "totalRevenue": 2458900.50,
  "newUsersThisMonth": 340,
  "averageSessionRating": 4.7
}
```

#### Get User Analytics
```http
GET /admin/analytics/users
Authorization: Bearer <admin_token>
Query Parameters:
- period: "day" | "week" | "month" | "year"
- startDate: ISO date string
- endDate: ISO date string
```

#### Moderate Content
```http
POST /admin/moderate/posts/:postId
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "action": "approve" | "reject" | "flag",
  "reason": "Content violates community guidelines"
}
```

#### System Health Check
```http
GET /admin/health
Authorization: Bearer <admin_token>
```

### Admin Dashboard Metrics
- **User Growth**: Registration and retention rates
- **Session Analytics**: Booking patterns and completion rates
- **Revenue Tracking**: Payment processing and subscription metrics
- **Content Metrics**: Posts, comments, and engagement rates
- **Platform Health**: API response times and error rates

---

## 📊 Analytics API

**Base URL**: `/analytics`

### Key Features
- **User Behavior Tracking**: Platform usage patterns
- **Session Analytics**: Therapy session insights
- **Community Engagement**: Social feature metrics
- **Performance Metrics**: Platform performance data
- **Custom Reports**: Configurable analytics queries

### Core Endpoints

#### Get User Activity
```http
GET /analytics/user-activity/:userId
Authorization: Bearer <token>
Query Parameters:
- period: "day" | "week" | "month"
- metrics: "sessions,messages,posts"
```

#### Get Platform Metrics
```http
GET /analytics/platform
Authorization: Bearer <admin_token>
Query Parameters:
- metric: "users" | "sessions" | "revenue" | "engagement"
- period: "day" | "week" | "month" | "year"
```

#### Track Event
```http
POST /analytics/events
Authorization: Bearer <token>
Content-Type: application/json

{
  "eventType": "session_completed",
  "userId": "user_123",
  "metadata": {
    "sessionId": "session_456",
    "duration": 60,
    "rating": 5
  }
}
```

---

## 📧 Notifications API

**Base URL**: `/notifications`

### Key Features
- **Real-time Notifications**: Instant notification delivery
- **Multi-channel Support**: Email, SMS, and in-app notifications
- **Notification Preferences**: User-configurable settings
- **Notification History**: Complete notification records
- **Template System**: Customizable notification templates

### Core Endpoints

#### Get User Notifications
```http
GET /notifications
Authorization: Bearer <token>
Query Parameters:
- unread: boolean
- type: "appointment" | "message" | "community" | "system"
- limit: number (default: 20)
```

#### Mark as Read
```http
PUT /notifications/:id/read
Authorization: Bearer <token>
```

#### Update Preferences
```http
PUT /notifications/preferences
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": {
    "appointments": true,
    "messages": true,
    "communityUpdates": false
  },
  "sms": {
    "appointments": true,
    "emergencyAlerts": true
  },
  "inApp": {
    "all": true
  }
}
```

### Notification Types
- **Appointment Reminders**: Session booking confirmations and reminders
- **Message Notifications**: New messages and conversation updates
- **Community Updates**: New posts and community activity
- **System Alerts**: Platform updates and maintenance notices
- **Emergency Notifications**: Crisis support and safety alerts

---

## 📋 Worksheets API

**Base URL**: `/worksheets`

### Key Features
- **Therapy Assignments**: Structured therapeutic exercises
- **Progress Tracking**: Completion status and progress metrics
- **Template Library**: Pre-built worksheet templates
- **Custom Worksheets**: Therapist-created assignments
- **Submission System**: Client worksheet submissions

### Core Endpoints

#### Get Worksheets
```http
GET /worksheets
Authorization: Bearer <token>
Query Parameters:
- assigned: boolean
- completed: boolean
- category: "anxiety" | "depression" | "trauma" | "general"
```

#### Submit Worksheet
```http
POST /worksheets/:id/submit
Authorization: Bearer <token>
Content-Type: application/json

{
  "responses": [
    {
      "questionId": "q1",
      "answer": "I feel more confident about managing my anxiety"
    },
    {
      "questionId": "q2",
      "answer": "7",
      "type": "scale"
    }
  ],
  "notes": "This exercise was very helpful"
}
```

#### Assign Worksheet
```http
POST /worksheets/assign
Authorization: Bearer <therapist_token>
Content-Type: application/json

{
  "worksheetId": "worksheet_123",
  "clientId": "client_456",
  "dueDate": "2024-01-20T00:00:00.000Z",
  "instructions": "Complete this before our next session"
}
```

---

## 🧠 Pre-Assessment API

**Base URL**: `/pre-assessment`

### Key Features
- **Mental Health Screening**: Comprehensive 201-item questionnaire
- **AI-Powered Analysis**: Machine learning evaluation
- **Risk Assessment**: Suicide risk and crisis detection
- **Therapist Matching**: AI-driven therapist recommendations
- **Progress Tracking**: Assessment history and improvements

### Core Endpoints

#### Start Assessment
```http
POST /pre-assessment/start
Authorization: Bearer <token>
```

#### Submit Responses
```http
POST /pre-assessment/:id/responses
Authorization: Bearer <token>
Content-Type: application/json

{
  "responses": [
    {
      "questionId": "q1_anxiety_1",
      "value": 3,
      "scale": "severity"
    },
    {
      "questionId": "q2_depression_1", 
      "value": 2,
      "scale": "frequency"
    }
  ]
}
```

#### Get Results
```http
GET /pre-assessment/:id/results
Authorization: Bearer <token>
```

#### Get Therapist Recommendations
```http
GET /pre-assessment/:id/recommendations
Authorization: Bearer <token>
```

### Assessment Scales
- **Anxiety Disorders**: GAD-7 and specialized anxiety scales
- **Depression**: PHQ-9 and depression severity measures
- **PTSD**: PCL-5 and trauma assessment tools
- **Bipolar**: Mood disorder screening instruments
- **OCD**: Obsessive-compulsive disorder assessment
- **ADHD**: Attention and hyperactivity measures
- **Substance Use**: Addiction and dependency screening
- **Eating Disorders**: Body image and eating behavior assessment
- **Sleep Disorders**: Sleep quality and insomnia measures
- **Social Anxiety**: Social interaction anxiety scales
- **Panic Disorder**: Panic attack frequency and severity
- **Burnout**: Professional and personal burnout measures
- **Stress**: General stress and coping assessment

---

## 🔐 Security & Compliance Features

### Data Protection
- **HIPAA Compliance**: Medical data encryption and access controls
- **Role-Based Access**: Granular permission system
- **Audit Logging**: Complete activity tracking
- **Data Retention**: Configurable retention policies
- **Encryption**: End-to-end data encryption

### Authentication & Authorization
- **Multi-Factor Authentication**: Enhanced security options
- **Session Management**: Secure session handling
- **API Rate Limiting**: Abuse prevention
- **Token Validation**: JWT token security
- **Permission Checking**: Dynamic permission validation

---

## 🚀 Integration Patterns

### Event-Driven Architecture
All modules publish events for:
- **User Actions**: Profile updates, session bookings
- **System Events**: File uploads, payment processing
- **Analytics**: User behavior tracking
- **Notifications**: Real-time updates
- **Audit Trails**: Compliance and security logging

### Common Response Patterns
```typescript
// Success Response
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation completed successfully"
}

// Error Response
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": { /* error details */ }
  }
}

// Paginated Response
{
  "success": true,
  "data": [/* items */],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### Common Query Parameters
- **page**: Pagination page number (default: 1)
- **limit**: Items per page (default: 20, max: 100)
- **sort**: Sort field and direction ("field:asc" or "field:desc")
- **filter**: Filter criteria (varies by endpoint)
- **include**: Related data to include
- **fields**: Specific fields to return

---

## 📊 Monitoring & Health Checks

### System Health Endpoints
```http
GET /health
GET /health/database
GET /health/storage
GET /health/notifications
```

### Performance Metrics
- **Response Times**: API endpoint performance
- **Error Rates**: Success/failure ratios
- **Database Performance**: Query execution times
- **Storage Usage**: File storage metrics
- **User Activity**: Active user counts

---

## 🧪 Testing Guidelines

### Test Categories
- **Unit Tests**: Individual module testing
- **Integration Tests**: Cross-module functionality
- **End-to-End Tests**: Complete user workflows
- **Performance Tests**: Load and stress testing
- **Security Tests**: Vulnerability assessments

### Test Data Management
- **Mock Data**: Realistic test datasets
- **Test Users**: Pre-configured test accounts
- **Seeded Data**: Consistent test environments
- **Data Cleanup**: Automated test data removal

---

This comprehensive overview covers all major API modules in the Mentara platform. Each module provides essential functionality for the mental health therapy platform, from user management and session booking to file handling and analytics. The modular architecture ensures scalability, maintainability, and clear separation of concerns across the entire system.