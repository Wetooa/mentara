# Postman Collections Reorganization Mapping

## Current State Analysis

### Existing Collections Structure
```
Current Collections (with duplicates/overlaps):
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

### Target Structure (1-to-1 Module Mapping)
```
Target Collections:
├── Auth.postman_collection.json
├── Users.postman_collection.json
├── Pre-Assessment.postman_collection.json
├── Booking.postman_collection.json
├── Messaging.postman_collection.json
├── Therapist.postman_collection.json
├── Admin.postman_collection.json
├── Analytics.postman_collection.json
├── Audit-Logs.postman_collection.json
├── Billing.postman_collection.json
├── Client.postman_collection.json
├── Comments.postman_collection.json
├── Communities.postman_collection.json
├── Dashboard.postman_collection.json
├── Meetings.postman_collection.json
├── Moderator.postman_collection.json
├── Notifications.postman_collection.json
├── Onboarding.postman_collection.json
├── Posts.postman_collection.json
├── Reviews.postman_collection.json
├── Search.postman_collection.json
├── Sessions.postman_collection.json
└── Worksheets.postman_collection.json
```

## Consolidation Mapping

### 1. Auth.postman_collection.json
**Consolidate From:**
- `01-Authentication.postman_collection.json` (primary source)
- `Auth-Core.postman_collection.json`
- `Auth-OAuth.postman_collection.json`
- `Auth-Registration.postman_collection.json`

**Endpoints to Include:**
- `POST /auth/login` - User authentication
- `POST /auth/refresh` - Token refresh
- `POST /auth/logout` - Session termination
- `POST /auth/force-logout` - Admin force logout
- `POST /auth/register/client` - Client registration
- `POST /auth/register/therapist` - Therapist registration
- `GET /auth/me` - Current user info
- `GET /auth/google` - Google OAuth
- `GET /auth/microsoft` - Microsoft OAuth
- `GET /auth/verify-email` - Email verification
- `POST /auth/resend-verification` - Resend verification
- `POST /auth/forgot-password` - Password reset request
- `POST /auth/reset-password` - Password reset

**Folder Structure:**
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

### 2. Users.postman_collection.json
**Consolidate From:**
- `02-User-Management.postman_collection.json` (primary source)
- `User-Management.postman_collection.json`
- `User-Profiles.postman_collection.json`

**Endpoints to Include:**
- `GET /users` - Get all active users
- `GET /users/all-including-inactive` - Get all users including inactive
- `GET /users/{id}` - Get user by ID
- `PUT /users/{id}` - Update user profile
- `DELETE /users/{id}` - Deactivate user account
- `POST /users/{id}/deactivate` - Admin deactivate user
- `POST /users/{id}/reactivate` - Admin reactivate user
- `GET /users/search` - Search users
- `GET /users/profile` - Get user profile
- `PUT /users/profile` - Update user profile

**Folder Structure:**
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

### 3. Admin.postman_collection.json
**Consolidate From:**
- `07-Admin-Dashboard.postman_collection.json` (primary source)
- `Admin-System.postman_collection.json`
- `Admin-Users.postman_collection.json`
- `Admin-Therapists.postman_collection.json`
- `Admin-Analytics.postman_collection.json`
- `Admin-Moderation.postman_collection.json`

**Endpoints to Include:**
- `GET /admin/dashboard` - Admin dashboard data
- `GET /admin/users` - Get all users (admin view)
- `GET /admin/therapists` - Get all therapists
- `GET /admin/applications` - Get therapist applications
- `PATCH /admin/applications/{id}/status` - Update application status
- `GET /admin/analytics` - Platform analytics
- `GET /admin/system-health` - System health check
- `GET /admin/audit-logs` - Audit logs
- `POST /admin/moderation/flag-content` - Flag content
- `GET /admin/flagged-content` - Get flagged content

**Folder Structure:**
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

### 4. Therapist.postman_collection.json
**Consolidate From:**
- `06-Therapist-Management.postman_collection.json` (primary source)
- `Therapist-Applications.postman_collection.json`
- `Therapist-Profiles.postman_collection.json`
- `Therapist-Recommendations.postman_collection.json`
- `Therapist-Requests.postman_collection.json`

**Endpoints to Include:**
- `POST /therapist/apply-with-documents` - Submit application with documents
- `GET /therapist/applications` - Get applications
- `GET /therapist/applications/{id}` - Get application details
- `POST /therapist/applications/{id}/documents` - Upload documents
- `GET /therapist/recommendations` - Get therapist recommendations
- `GET /therapist/profile` - Get therapist profile
- `PUT /therapist/profile` - Update therapist profile
- `GET /therapist/requests` - Get client requests
- `POST /therapist/requests/{id}/accept` - Accept client request
- `POST /therapist/requests/{id}/decline` - Decline client request

**Folder Structure:**
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

### 5. Booking.postman_collection.json
**Rename From:**
- `04-Booking-System.postman_collection.json` (direct rename)

**Endpoints to Include:**
- `POST /booking/meetings` - Create meeting
- `GET /booking/meetings` - Get meetings with filters
- `GET /booking/meetings/{id}` - Get meeting details
- `PUT /booking/meetings/{id}` - Update meeting
- `DELETE /booking/meetings/{id}/cancel` - Cancel meeting
- `POST /booking/availability` - Create availability
- `GET /booking/availability` - Get availability
- `PUT /booking/availability/{id}` - Update availability
- `DELETE /booking/availability/{id}` - Delete availability
- `GET /booking/slots` - Get available time slots
- `GET /booking/durations` - Get session durations

**Folder Structure:**
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

### 6. Messaging.postman_collection.json
**Rename From:**
- `05-Messaging-System.postman_collection.json` (direct rename)

**Endpoints to Include:**
- `POST /messaging/conversations` - Create conversation
- `GET /messaging/conversations` - Get conversations
- `GET /messaging/conversations/{id}` - Get conversation details
- `POST /messaging/conversations/{id}/messages` - Send message
- `GET /messaging/conversations/{id}/messages` - Get messages
- `PUT /messaging/messages/{id}` - Update message
- `DELETE /messaging/messages/{id}` - Delete message
- `POST /messaging/messages/{id}/read` - Mark as read
- `POST /messaging/messages/{id}/reactions` - Add reaction
- `DELETE /messaging/messages/{id}/reactions/{emoji}` - Remove reaction
- `GET /messaging/messages/{id}/read-status` - Get read status
- `POST /messaging/block` - Block user
- `DELETE /messaging/block/{id}` - Unblock user
- `GET /messaging/blocked-users` - Get blocked users
- `GET /messaging/search` - Search messages
- `POST /messaging/typing` - Send typing indicator
- `POST /messaging/presence` - Update presence
- `GET /messaging/online-users` - Get online users

**Folder Structure:**
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

### 7. Pre-Assessment.postman_collection.json
**Rename From:**
- `03-AI-Patient-Evaluation.postman_collection.json` (direct rename)

**Endpoints to Include:**
- `POST /pre-assessment` - Create pre-assessment
- `GET /pre-assessment` - Get user's pre-assessment
- `GET /pre-assessment/ai-service/health` - AI service health check
- `POST /pre-assessment/predict` - AI prediction
- `GET /pre-assessment/metrics` - Performance metrics
- `POST /pre-assessment/metrics/reset` - Reset metrics

**Folder Structure:**
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

## New Collections to Create

### 8. Analytics.postman_collection.json
**Backend Module:** `mentara-api/src/analytics/`
**Endpoints to Research:**
- `GET /analytics/dashboard` - Dashboard analytics
- `GET /analytics/users` - User analytics
- `GET /analytics/sessions` - Session analytics
- `GET /analytics/reports` - Custom reports

### 9. Audit-Logs.postman_collection.json
**Backend Module:** `mentara-api/src/audit-logs/`
**Endpoints to Research:**
- `GET /audit-logs` - Get audit logs
- `POST /audit-logs/system-events` - Create system event
- `GET /audit-logs/system-events` - Get system events
- `PATCH /audit-logs/system-events/{id}/resolve` - Resolve event
- `POST /audit-logs/data-changes` - Log data changes
- `GET /audit-logs/data-changes` - Get data changes
- `GET /audit-logs/statistics` - Get audit statistics

### 10. Billing.postman_collection.json
**Backend Module:** `mentara-api/src/billing/`
**Endpoints to Research:**
- `GET /billing/subscriptions` - Get subscriptions
- `POST /billing/subscriptions` - Create subscription
- `GET /billing/invoices` - Get invoices
- `POST /billing/payment-methods` - Add payment method
- `GET /billing/payment-methods` - Get payment methods

### 11. Client.postman_collection.json
**Backend Module:** `mentara-api/src/client/`
**Endpoints to Research:**
- `GET /client/dashboard` - Client dashboard
- `GET /client/therapists` - Get assigned therapists
- `POST /client/requests` - Create therapist request
- `GET /client/requests` - Get client requests

### 12. Comments.postman_collection.json
**Backend Module:** `mentara-api/src/comments/`
**Endpoints to Research:**
- `GET /comments` - Get comments
- `POST /comments` - Create comment
- `PUT /comments/{id}` - Update comment
- `DELETE /comments/{id}` - Delete comment

### 13. Communities.postman_collection.json
**Backend Module:** `mentara-api/src/communities/`
**Endpoints to Research:**
- `GET /communities` - Get communities
- `POST /communities` - Create community
- `GET /communities/{id}` - Get community details
- `POST /communities/{id}/join` - Join community
- `DELETE /communities/{id}/leave` - Leave community

### 14. Dashboard.postman_collection.json
**Backend Module:** `mentara-api/src/dashboard/`
**Endpoints to Research:**
- `GET /dashboard/user` - User dashboard
- `GET /dashboard/therapist` - Therapist dashboard
- `GET /dashboard/admin` - Admin dashboard

### 15. Meetings.postman_collection.json
**Backend Module:** `mentara-api/src/meetings/`
**Endpoints to Research:**
- `GET /meetings` - Get meetings
- `POST /meetings` - Create meeting
- `GET /meetings/{id}` - Get meeting details
- `PUT /meetings/{id}` - Update meeting

### 16. Moderator.postman_collection.json
**Backend Module:** `mentara-api/src/moderator/`
**Endpoints to Research:**
- `GET /moderator/content` - Get content for moderation
- `POST /moderator/content/{id}/approve` - Approve content
- `POST /moderator/content/{id}/reject` - Reject content

### 17. Notifications.postman_collection.json
**Backend Module:** `mentara-api/src/notifications/`
**Endpoints to Research:**
- `GET /notifications` - Get notifications
- `POST /notifications` - Create notification
- `PUT /notifications/{id}/read` - Mark as read
- `GET /notifications/settings` - Get notification settings

### 18. Onboarding.postman_collection.json
**Backend Module:** `mentara-api/src/onboarding/`
**Endpoints to Research:**
- `GET /onboarding/steps` - Get onboarding steps
- `POST /onboarding/complete` - Complete onboarding
- `GET /onboarding/status` - Get onboarding status

### 19. Posts.postman_collection.json
**Backend Module:** `mentara-api/src/posts/`
**Endpoints to Research:**
- `GET /posts` - Get posts
- `POST /posts` - Create post
- `GET /posts/{id}` - Get post details
- `PUT /posts/{id}` - Update post
- `DELETE /posts/{id}` - Delete post

### 20. Reviews.postman_collection.json
**Backend Module:** `mentara-api/src/reviews/`
**Endpoints to Research:**
- `GET /reviews` - Get reviews
- `POST /reviews` - Create review
- `GET /reviews/{id}` - Get review details
- `PUT /reviews/{id}` - Update review

### 21. Search.postman_collection.json
**Backend Module:** `mentara-api/src/search/`
**Endpoints to Research:**
- `GET /search/users` - Search users
- `GET /search/therapists` - Search therapists
- `GET /search/content` - Search content
- `GET /search/global` - Global search

### 22. Sessions.postman_collection.json
**Backend Module:** `mentara-api/src/sessions/`
**Endpoints to Research:**
- `GET /sessions` - Get sessions
- `POST /sessions` - Create session
- `GET /sessions/{id}` - Get session details
- `PUT /sessions/{id}` - Update session
- `POST /sessions/{id}/notes` - Add session notes

### 23. Worksheets.postman_collection.json
**Backend Module:** `mentara-api/src/worksheets/`
**Endpoints to Research:**
- `GET /worksheets` - Get worksheets
- `POST /worksheets` - Create worksheet
- `GET /worksheets/{id}` - Get worksheet details
- `POST /worksheets/{id}/submit` - Submit worksheet
- `GET /worksheets/{id}/submissions` - Get submissions

## Migration Strategy

### Phase 1: Consolidate Existing Collections (High Priority)
1. **Auth.postman_collection.json** - Consolidate 4 auth collections
2. **Users.postman_collection.json** - Consolidate 3 user collections
3. **Admin.postman_collection.json** - Consolidate 6 admin collections
4. **Therapist.postman_collection.json** - Consolidate 5 therapist collections
5. **Booking.postman_collection.json** - Rename existing collection
6. **Messaging.postman_collection.json** - Rename existing collection
7. **Pre-Assessment.postman_collection.json** - Rename existing collection

### Phase 2: Create New Collections (Medium Priority)
8. **Analytics.postman_collection.json** - New collection
9. **Audit-Logs.postman_collection.json** - New collection
10. **Billing.postman_collection.json** - New collection
11. **Client.postman_collection.json** - New collection
12. **Comments.postman_collection.json** - New collection
13. **Communities.postman_collection.json** - New collection
14. **Dashboard.postman_collection.json** - New collection
15. **Meetings.postman_collection.json** - New collection
16. **Moderator.postman_collection.json** - New collection

### Phase 3: Complete Coverage (Low Priority)
17. **Notifications.postman_collection.json** - New collection
18. **Onboarding.postman_collection.json** - New collection
19. **Posts.postman_collection.json** - New collection
20. **Reviews.postman_collection.json** - New collection
21. **Search.postman_collection.json** - New collection
22. **Sessions.postman_collection.json** - New collection
23. **Worksheets.postman_collection.json** - New collection

## Files to Remove After Migration

### Backup Files
- `*.backup`
- `*.backup2`
- `README.md.backup`
- `README.md.backup2`

### Consolidated Collections
- `01-Authentication.postman_collection.json`
- `02-User-Management.postman_collection.json`
- `03-AI-Patient-Evaluation.postman_collection.json`
- `04-Booking-System.postman_collection.json`
- `05-Messaging-System.postman_collection.json`
- `06-Therapist-Management.postman_collection.json`
- `07-Admin-Dashboard.postman_collection.json`
- `Admin-Analytics.postman_collection.json`
- `Admin-Moderation.postman_collection.json`
- `Admin-System.postman_collection.json`
- `Admin-Therapists.postman_collection.json`
- `Admin-Users.postman_collection.json`
- `Auth-Core.postman_collection.json`
- `Auth-OAuth.postman_collection.json`
- `Auth-Registration.postman_collection.json`
- `Therapist-Applications.postman_collection.json`
- `Therapist-Profiles.postman_collection.json`
- `Therapist-Recommendations.postman_collection.json`
- `Therapist-Requests.postman_collection.json`
- `User-Management.postman_collection.json`
- `User-Profiles.postman_collection.json`

## Standard Collection Template

Each new collection should follow this template structure:

```json
{
  "info": {
    "name": "Mentara - [Module Name]",
    "description": "[Module description and purpose]",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
    "_exporter_id": "mentara-[module-name]"
  },
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{accessToken}}",
        "type": "string"
      }
    ]
  },
  "event": [
    {
      "listen": "prerequest",
      "script": {
        "type": "text/javascript",
        "exec": [
          "// Standard pre-request script"
        ]
      }
    },
    {
      "listen": "test",
      "script": {
        "type": "text/javascript",
        "exec": [
          "// Standard test script"
        ]
      }
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "{{baseUrl}}",
      "type": "string"
    }
  ],
  "item": [
    // Collection items organized in folders
  ]
}
```

This mapping document will serve as the blueprint for the complete reorganization of the Postman collections to achieve the desired 1-to-1 module mapping.