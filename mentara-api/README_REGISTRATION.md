# User Registration System

This document explains the new user registration system that works with Clerk authentication.

## Overview

The system uses direct API endpoints for user registration. After a user successfully authenticates with Clerk, the frontend calls the appropriate registration endpoint to create the user in our database. **All registration endpoints require authentication** - the `clerkId` is automatically obtained from the authenticated user.

## API Endpoints

### User Registration

- **POST** `/auth/register/user` - Register a basic user (patient) - **Requires Auth**
- **POST** `/auth/register/therapist` - Register a therapist with application - **Requires Auth**

## Registration Flow

### 1. User Registration Flow

1. User signs up with Clerk (frontend)
2. Clerk creates the user account and sets authentication cookies
3. Frontend calls `/auth/register/user` with user data (clerkId obtained from auth)
4. Backend creates user record in database
5. User is redirected to their dashboard

### 2. Therapist Registration Flow

1. User signs up with Clerk (frontend)
2. Clerk creates the user account and sets authentication cookies
3. Frontend calls `/auth/register/therapist` with therapist data (clerkId obtained from auth)
4. Backend creates user record + therapist application
5. User is redirected to therapist dashboard (pending approval)

## Request Examples

### Register User

```typescript
// Frontend call (user must be authenticated with Clerk)
const response = await fetch('/api/auth/register/user', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // Important: include Clerk cookies
  body: JSON.stringify({
    email: 'user@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'user',
    middleName: 'M',
    birthDate: '1990-01-01',
    address: '123 Main St',
    // Note: clerkId is NOT included - it's obtained from auth
  }),
});

const result = await response.json();
// { success: true, user: { id: '...', clerkId: '...', ... } }
```

### Register Therapist

```typescript
// Frontend call (user must be authenticated with Clerk)
const response = await fetch('/api/auth/register/therapist', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // Important: include Clerk cookies
  body: JSON.stringify({
    email: 'therapist@example.com',
    firstName: 'Dr. Jane',
    lastName: 'Smith',
    role: 'therapist',
    mobile: '+1234567890',
    province: 'Metro Manila',
    providerType: 'Psychologist',
    professionalLicenseType: 'PRC',
    isPRCLicensed: 'Yes',
    prcLicenseNumber: '12345',
    isLicenseActive: 'Yes',
    yearsOfExperience: '5',
    areasOfExpertise: ['Anxiety', 'Depression'],
    assessmentTools: ['PHQ-9', 'GAD-7'],
    therapeuticApproachesUsedList: ['CBT', 'DBT'],
    languagesOffered: ['English', 'Tagalog'],
    providedOnlineTherapyBefore: 'Yes',
    comfortableUsingVideoConferencing: 'Yes',
    weeklyAvailability: '20 hours',
    preferredSessionLength: '50 minutes',
    accepts: ['Insurance', 'Self-pay'],
    privateConfidentialSpace: 'Yes',
    compliesWithDataPrivacyAct: 'Yes',
    professionalLiabilityInsurance: 'Yes',
    complaintsOrDisciplinaryActions: 'No',
    willingToAbideByPlatformGuidelines: 'Yes',
    // Note: clerkId is NOT included - it's obtained from auth
  }),
});

const result = await response.json();
// { success: true, user: {...}, therapistApplication: {...} }
```

## Authentication Requirements

### ClerkAuthGuard

All registration endpoints are protected by `ClerkAuthGuard` which:

- Verifies the Clerk session token from cookies
- Extracts the `clerkId` from the authenticated session
- Makes the `clerkId` available via `@CurrentUserId()` decorator

### Frontend Requirements

- User must be authenticated with Clerk before calling registration endpoints
- Include `credentials: 'include'` in fetch requests to send Clerk cookies
- The `clerkId` is automatically obtained from the authenticated session

## Response Format

### Success Response

```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "clerkId": "user_2abc123...",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user"
  },
  "therapistApplication": {
    "id": "uuid",
    "status": "pending"
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "User already exists",
  "statusCode": 409
}
```

## Role System

The system supports the following roles:

- `user` - Basic users (patients)
- `therapist` - Licensed therapists
- `moderator` - Community moderators
- `admin` - System administrators

## Security Features

- **Authentication Required**: All registration endpoints require valid Clerk authentication
- **Automatic clerkId**: `clerkId` is obtained from authenticated session, not from request body
- **Role Validation**: Invalid roles are automatically set to 'user'
- **Duplicate Prevention**: Users cannot be registered twice with the same Clerk ID
- **Data Validation**: All required fields are validated
- **Error Handling**: Comprehensive error handling with appropriate HTTP status codes

## Frontend Integration

### Example Frontend Implementation

```typescript
// After successful Clerk sign-up and authentication
const handleUserRegistration = async (userData: any) => {
  try {
    // User must be authenticated with Clerk first
    const response = await fetch('/api/auth/register/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Include Clerk cookies
      body: JSON.stringify({
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: 'user',
        // ... other fields
        // clerkId is automatically obtained from auth
      }),
    });

    if (response.ok) {
      // Redirect to dashboard
      router.push('/user/dashboard');
    } else {
      // Handle error
      const error = await response.json();
      console.error('Registration failed:', error);
    }
  } catch (error) {
    console.error('Registration error:', error);
  }
};
```

## Testing

Run the test script to verify the registration system:

```bash
bun run scripts/test-registration.ts
```

## Migration from Webhooks

This new system replaces the webhook-based approach:

- ✅ More reliable (no webhook delivery issues)
- ✅ Better error handling
- ✅ Immediate feedback to users
- ✅ Easier to debug and test
- ✅ No need for webhook secrets or complex setup
- ✅ **Secure**: clerkId obtained from authenticated session

## Next Steps

1. Update frontend to call registration endpoints after Clerk sign-up and authentication
2. Test the complete registration flow
3. Add role-based route protection
4. Implement user profile updates
