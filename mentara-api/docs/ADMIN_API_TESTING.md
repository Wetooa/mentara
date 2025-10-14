# Admin API Testing Guide

## Quick Start

### Test Health Endpoint (Public)

```bash
curl http://localhost:3001/api/admin/health | jq '.'
```

### Run Full Test Suite

```bash
# Without authentication (only tests public endpoints)
./test-admin-api.sh

# With authentication (tests all endpoints)
./test-admin-api.sh YOUR_JWT_TOKEN
```

## Getting a Test Token

### 1. Login as Admin

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "your_password"
  }' | jq -r '.token'
```

### 2. Use the token

```bash
TOKEN="your_jwt_token_here"
./test-admin-api.sh $TOKEN
```

## Manual Testing Examples

### Analytics Endpoints

#### Get System Statistics

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/admin/analytics/system-stats | jq '.'
```

#### Get User Growth

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/admin/analytics/user-growth | jq '.'
```

#### Get Platform Overview

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/admin/analytics/platform-overview | jq '.'
```

### User Management

#### List All Users (Paginated)

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3001/api/admin/users?page=1&limit=10" | jq '.'
```

#### Filter Users by Role

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3001/api/admin/users?role=client&page=1&limit=5" | jq '.'
```

#### Search Users

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3001/api/admin/users?search=john&page=1" | jq '.'
```

#### Get Specific User

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/admin/users/USER_ID | jq '.'
```

#### Suspend User

```bash
curl -X PUT \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Violation of terms",
    "duration": 7
  }' \
  http://localhost:3001/api/admin/users/USER_ID/suspend | jq '.'
```

#### Unsuspend User

```bash
curl -X PUT \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/admin/users/USER_ID/unsuspend | jq '.'
```

### Therapist Management

#### Get Pending Applications

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/admin/therapists/pending | jq '.'
```

#### Get All Applications

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3001/api/admin/therapists/applications?status=APPROVED&limit=20" | jq '.'
```

#### Get Application Details

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/admin/therapists/THERAPIST_ID/details | jq '.'
```

#### Approve Therapist

```bash
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "verifyLicense": true,
    "approvalMessage": "Welcome to Mentara! Your credentials have been verified."
  }' \
  http://localhost:3001/api/admin/therapists/THERAPIST_ID/approve | jq '.'
```

#### Reject Therapist

```bash
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rejectionReason": "INCOMPLETE_DOCUMENTATION",
    "rejectionMessage": "Please provide valid license documentation.",
    "allowReapplication": true
  }' \
  http://localhost:3001/api/admin/therapists/THERAPIST_ID/reject | jq '.'
```

#### Update Therapist Status

```bash
curl -X PUT \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "SUSPENDED",
    "reason": "Under investigation"
  }' \
  http://localhost:3001/api/admin/therapists/THERAPIST_ID/status | jq '.'
```

#### Get Application Metrics

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3001/api/admin/therapists/metrics?startDate=2024-01-01&endDate=2024-12-31" | jq '.'
```

### Admin Account Management

#### List All Admin Accounts

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/admin/accounts | jq '.'
```

#### Get Specific Admin

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/admin/accounts/ADMIN_ID | jq '.'
```

#### Delete Admin Account

```bash
curl -X DELETE \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/admin/accounts/ADMIN_ID | jq '.'
```

### Reports Management

#### List Reports

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3001/api/admin/reports?type=post&status=pending&page=1&limit=10" | jq '.'
```

#### Get Report Details

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/admin/reports/REPORT_ID | jq '.'
```

#### Update Report Status

```bash
curl -X PUT \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "reviewed",
    "reason": "Appropriate action taken"
  }' \
  http://localhost:3001/api/admin/reports/REPORT_ID/status | jq '.'
```

#### Take Action on Report

```bash
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "delete_content",
    "reason": "Violates community guidelines"
  }' \
  http://localhost:3001/api/admin/reports/REPORT_ID/action | jq '.'
```

#### Get Reports Overview

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/admin/reports/stats/overview | jq '.'
```

### Content Moderation

#### Moderate Content

```bash
curl -X PUT \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "remove",
    "reason": "Inappropriate content"
  }' \
  http://localhost:3001/api/admin/moderation/post/POST_ID/moderate | jq '.'
```

## Common Query Parameters

### Pagination

- `page` - Page number (default: 1)
- `limit` - Items per page (default: varies by endpoint)

### Filtering

- `role` - Filter by user role (client, therapist, admin, moderator)
- `status` - Filter by status (PENDING, APPROVED, REJECTED, etc.)
- `type` - Filter by type (post, comment, user)
- `search` - Search by name, email, etc.

### Date Ranges

- `startDate` - Start date (ISO 8601 format)
- `endDate` - End date (ISO 8601 format)

## Response Format

All endpoints return standardized responses:

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "code": "ERROR_CODE",
      "message": "Detailed error message"
    }
  ],
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/endpoint",
  "statusCode": 400
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized (no/invalid token)
- `403` - Forbidden (not admin)
- `404` - Not Found
- `500` - Server Error

## Tips

1. **Always check health first**: `curl http://localhost:3001/api/admin/health`
2. **Use jq for formatting**: Add `| jq '.'` to any curl command
3. **Save your token**: `export TOKEN="your_token_here"`
4. **Use the test script**: `./test-admin-api.sh $TOKEN` for comprehensive testing
5. **Check status codes**: Add `-w "\nStatus: %{http_code}\n"` to curl
