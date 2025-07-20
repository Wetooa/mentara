# Authentication & Authorization API

The Authentication & Authorization module handles user registration, authentication, and role-based access control for the Mentara platform.

## 🏗️ Architecture

The authentication system is built on:
- **Clerk**: External authentication provider for JWT tokens
- **Role-based Access Control**: Four user roles (client, therapist, moderator, admin)
- **Database Integration**: User data stored in PostgreSQL via Prisma
- **Event-Driven**: Publishes registration events for downstream processing

## 🔐 User Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| **client** | Patients seeking therapy | Can book sessions, join communities, access assessments |
| **therapist** | Licensed mental health professionals | Can manage availability, conduct sessions, review client data |
| **moderator** | Community moderators | Can moderate posts, manage communities |
| **admin** | System administrators | Full system access, user management, analytics |

## 📡 API Endpoints

### Base URL
```
/auth
```

### Authentication Required
Most endpoints require Clerk JWT token in the Authorization header:
```
Authorization: Bearer <clerk_jwt_token>
```

---

## 🚀 Client Registration

### Register Client
Register a new client (patient) account.

**Endpoint**: `POST /auth/register/client`

**Rate Limit**: 5 requests per 5 minutes

**Headers**:
```
Authorization: Bearer <clerk_jwt_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "user": {
    "email": "john.doe@example.com",
    "firstName": "John",
    "middleName": "Michael",
    "lastName": "Doe",
    "birthDate": "1990-01-01",
    "address": "123 Main St, City, State 12345",
    "avatarUrl": "https://example.com/avatar.jpg",
    "role": "client",
    "bio": "Looking for support with anxiety and depression",
    "coverImageUrl": "https://example.com/cover.jpg",
    "isActive": true
  }
}
```

**Response**: `201 Created`
```json
{
  "userId": "user_123",
  "user": {
    "id": "user_123",
    "email": "john.doe@example.com",
    "firstName": "John",
    "middleName": "Michael",
    "lastName": "Doe",
    "birthDate": "1990-01-01T00:00:00.000Z",
    "address": "123 Main St, City, State 12345",
    "avatarUrl": "https://example.com/avatar.jpg",
    "role": "client",
    "bio": "Looking for support with anxiety and depression",
    "coverImageUrl": "https://example.com/cover.jpg",
    "isActive": true,
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  },
  "hasSeenTherapistRecommendations": false,
  "createdAt": "2024-01-01T12:00:00.000Z",
  "updatedAt": "2024-01-01T12:00:00.000Z"
}
```

**Error Responses**:
- `409 Conflict`: User already exists
- `400 Bad Request`: Invalid request data
- `500 Internal Server Error`: Registration failed

---

## 👩‍⚕️ Therapist Registration

### Register Therapist
Register a new therapist account with professional credentials.

**Endpoint**: `POST /auth/register/therapist`

**Rate Limit**: 3 requests per 10 minutes

**Headers**:
```
Authorization: Bearer <clerk_jwt_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "user": {
    "email": "jane.smith@example.com",
    "firstName": "Jane",
    "middleName": "Elizabeth",
    "lastName": "Smith",
    "birthDate": "1985-05-15",
    "address": "456 Professional Dr, City, State 67890",
    "avatarUrl": "https://example.com/therapist-avatar.jpg",
    "role": "therapist",
    "bio": "Licensed clinical psychologist with 10 years experience",
    "coverImageUrl": "https://example.com/therapist-cover.jpg",
    "isActive": true
  },
  "mobile": "+1234567890",
  "province": "California",
  "providerType": "Clinical Psychologist",
  "professionalLicenseType": "Licensed Clinical Psychologist",
  "isPRCLicensed": "yes",
  "prcLicenseNumber": "PSY12345",
  "expirationDateOfLicense": "2025-12-31T00:00:00.000Z",
  "practiceStartDate": "2014-01-01T00:00:00.000Z",
  "areasOfExpertise": ["Anxiety", "Depression", "Trauma"],
  "assessmentTools": ["PHQ-9", "GAD-7", "PCL-5"],
  "therapeuticApproachesUsedList": ["CBT", "DBT", "EMDR"],
  "languagesOffered": ["English", "Spanish"],
  "providedOnlineTherapyBefore": true,
  "comfortableUsingVideoConferencing": true,
  "preferredSessionLength": [45, 60],
  "privateConfidentialSpace": "yes",
  "compliesWithDataPrivacyAct": true,
  "professionalLiabilityInsurance": "yes",
  "complaintsOrDisciplinaryActions": "none",
  "willingToAbideByPlatformGuidelines": true,
  "expertise": ["Anxiety Disorders", "Depression", "PTSD"],
  "approaches": ["Cognitive Behavioral Therapy", "Dialectical Behavior Therapy"],
  "languages": ["English", "Spanish"],
  "illnessSpecializations": ["Anxiety", "Depression", "PTSD", "Trauma"],
  "acceptTypes": ["Individual", "Couples", "Family"],
  "treatmentSuccessRates": {
    "anxiety": 85,
    "depression": 78,
    "ptsd": 82
  },
  "sessionLength": "60 minutes",
  "hourlyRate": 150.00
}
```

**Response**: `201 Created`
```json
{
  "userId": "therapist_456",
  "user": {
    "id": "therapist_456",
    "email": "jane.smith@example.com",
    "firstName": "Jane",
    "middleName": "Elizabeth",
    "lastName": "Smith",
    "birthDate": "1985-05-15T00:00:00.000Z",
    "address": "456 Professional Dr, City, State 67890",
    "avatarUrl": "https://example.com/therapist-avatar.jpg",
    "role": "therapist",
    "bio": "Licensed clinical psychologist with 10 years experience",
    "coverImageUrl": "https://example.com/therapist-cover.jpg",
    "isActive": true,
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  },
  "status": "pending",
  "submissionDate": "2024-01-01T12:00:00.000Z",
  "processingDate": "2024-01-01T12:00:00.000Z",
  "mobile": "+1234567890",
  "province": "California",
  "providerType": "Clinical Psychologist",
  "professionalLicenseType": "Licensed Clinical Psychologist",
  "isPRCLicensed": "yes",
  "prcLicenseNumber": "PSY12345",
  "expirationDateOfLicense": "2025-12-31T00:00:00.000Z",
  "practiceStartDate": "2014-01-01T00:00:00.000Z",
  "areasOfExpertise": ["Anxiety", "Depression", "Trauma"],
  "assessmentTools": ["PHQ-9", "GAD-7", "PCL-5"],
  "therapeuticApproachesUsedList": ["CBT", "DBT", "EMDR"],
  "languagesOffered": ["English", "Spanish"],
  "providedOnlineTherapyBefore": true,
  "comfortableUsingVideoConferencing": true,
  "preferredSessionLength": [45, 60],
  "privateConfidentialSpace": "yes",
  "compliesWithDataPrivacyAct": true,
  "professionalLiabilityInsurance": "yes",
  "complaintsOrDisciplinaryActions": "none",
  "willingToAbideByPlatformGuidelines": true,
  "expertise": ["Anxiety Disorders", "Depression", "PTSD"],
  "approaches": ["Cognitive Behavioral Therapy", "Dialectical Behavior Therapy"],
  "languages": ["English", "Spanish"],
  "illnessSpecializations": ["Anxiety", "Depression", "PTSD", "Trauma"],
  "acceptTypes": ["Individual", "Couples", "Family"],
  "treatmentSuccessRates": {
    "anxiety": 85,
    "depression": 78,
    "ptsd": 82
  },
  "sessionLength": "60 minutes",
  "hourlyRate": 150.00,
  "createdAt": "2024-01-01T12:00:00.000Z",
  "updatedAt": "2024-01-01T12:00:00.000Z",
  "processedByAdminId": null
}
```

**Error Responses**:
- `409 Conflict`: User already exists
- `400 Bad Request`: Invalid request data
- `500 Internal Server Error`: Registration failed

---

## 👤 User Management

### Get Current User
Get details of the currently authenticated user.

**Endpoint**: `GET /auth/me`

**Headers**:
```
Authorization: Bearer <clerk_jwt_token>
```

**Response**: `200 OK`
```json
{
  "id": "user_123",
  "emailAddresses": [
    {
      "id": "email_123",
      "emailAddress": "john.doe@example.com",
      "verification": {
        "status": "verified"
      }
    }
  ],
  "firstName": "John",
  "lastName": "Doe",
  "publicMetadata": {
    "role": "client"
  },
  "privateMetadata": {},
  "createdAt": 1640995200000,
  "updatedAt": 1640995200000
}
```

### Get All Users
Get list of all users (admin only).

**Endpoint**: `GET /auth/users`

**Headers**:
```
Authorization: Bearer <clerk_jwt_token>
```

**Response**: `200 OK`
```json
{
  "data": [
    {
      "id": "user_123",
      "emailAddresses": [...],
      "firstName": "John",
      "lastName": "Doe",
      "publicMetadata": {
        "role": "client"
      },
      "createdAt": 1640995200000,
      "updatedAt": 1640995200000
    }
  ],
  "totalCount": 1
}
```

---

## 🔑 Authorization

### Check Admin Status
Check if the current user has admin privileges.

**Endpoint**: `POST /auth/is-admin`

**Headers**:
```
Authorization: Bearer <clerk_jwt_token>
```

**Response**: `200 OK`
```json
true
```

---

## 🚪 Session Management

### Force Logout
Revoke all sessions for the current user.

**Endpoint**: `POST /auth/force-logout`

**Rate Limit**: 20 requests per 5 minutes

**Headers**:
```
Authorization: Bearer <clerk_jwt_token>
```

**Response**: `200 OK`
```json
{
  "success": true,
  "message": "User sessions revoked successfully"
}
```

**Error Responses**:
- `500 Internal Server Error`: Force logout failed

---

## 📊 Data Models

### UserCreateDto
```typescript
{
  email: string;              // Valid email address
  firstName: string;          // First name
  middleName: string;         // Middle name
  lastName: string;           // Last name
  birthDate: string;          // Birth date (ISO string)
  address: string;            // Full address
  avatarUrl: string;          // Avatar image URL
  role: 'client' | 'therapist' | 'moderator' | 'admin';
  bio: string;                // User biography
  coverImageUrl: string;      // Cover image URL
  isActive?: boolean;         // Account status (default: true)
}
```

### ClientCreateDto
```typescript
{
  user: UserCreateDto;        // User information
}
```

### TherapistCreateDto
```typescript
{
  user: UserCreateDto;        // User information
  
  // Contact Information
  mobile: string;             // Phone number
  province: string;           // Province/State
  
  // Professional Credentials
  providerType: string;       // Type of provider
  professionalLicenseType: string;
  isPRCLicensed: string;      // "yes" or "no"
  prcLicenseNumber: string;   // License number
  expirationDateOfLicense: Date;
  practiceStartDate: Date;
  
  // Expertise and Approaches
  areasOfExpertise: string[];
  assessmentTools: string[];
  therapeuticApproachesUsedList: string[];
  languagesOffered: string[];
  
  // Technical Capabilities
  providedOnlineTherapyBefore: boolean;
  comfortableUsingVideoConferencing: boolean;
  preferredSessionLength: number[];
  
  // Compliance and Insurance
  privateConfidentialSpace?: string;
  compliesWithDataPrivacyAct?: boolean;
  professionalLiabilityInsurance?: string;
  complaintsOrDisciplinaryActions?: string;
  willingToAbideByPlatformGuidelines: boolean;
  
  // Platform-specific Data
  expertise: string[];
  approaches: string[];
  languages: string[];
  illnessSpecializations: string[];
  acceptTypes: string[];
  treatmentSuccessRates: Record<string, number>;
  sessionLength: string;
  hourlyRate: number;
}
```

---

## 🔄 Events

The authentication service publishes events for downstream processing:

### UserRegisteredEvent
Published when a new user registers (client or therapist).

**Event Data**:
```typescript
{
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'client' | 'therapist';
  registrationMethod: string;
}
```

**Downstream Effects**:
- Email welcome sequence
- Initial recommendations
- Analytics tracking
- Audit logging

---

## 🛡️ Security Features

### Rate Limiting
- **Client Registration**: 5 requests per 5 minutes
- **Therapist Registration**: 3 requests per 10 minutes
- **Force Logout**: 20 requests per 5 minutes

### Role-Based Access
- Authentication required for all endpoints
- Admin-only endpoints protected with role checks
- Clerk JWT token validation

### Data Validation
- Comprehensive input validation using class-validator
- Email format validation
- Required field validation
- Type checking for all fields

---

## 🧪 Testing

### Unit Tests
```bash
npm run test auth.service.spec.ts
npm run test auth.controller.spec.ts
```

### Integration Tests
```bash
npm run test:e2e -- --grep "Auth"
```

### Test Data Factory
```typescript
// Create test client
const clientData = TestDataFactory.createClientData();

// Create test therapist
const therapistData = TestDataFactory.createTherapistData();
```

---

## 🔧 Configuration

### Environment Variables
```env
CLERK_SECRET_KEY=sk_test_...
CLERK_PUBLISHABLE_KEY=pk_test_...
```

### Clerk Configuration
```typescript
const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});
```

---

## 📈 Monitoring

### Key Metrics
- Registration success rate
- Authentication failures
- Session duration
- Role distribution

### Error Tracking
- Registration failures
- Authentication errors
- Session revocation errors

---

## 🚀 Frontend Integration

### React Hook Example
```typescript
import { useAuth } from '@clerk/nextjs';

export function useAuthService() {
  const { getToken } = useAuth();
  
  const registerClient = async (userData: ClientCreateDto) => {
    const token = await getToken();
    const response = await fetch('/api/auth/register/client', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    return response.json();
  };
  
  return { registerClient };
}
```

### Next.js API Route Example
```typescript
// pages/api/auth/register/client.ts
import { getAuth } from '@clerk/nextjs/server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = getAuth(req);
  
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const response = await fetch(`${process.env.API_URL}/auth/register/client`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${await getToken(req)}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req.body),
  });
  
  const data = await response.json();
  res.status(response.status).json(data);
}
```

---

## 📚 Related Documentation

- [User Management API](../users/README.md)
- [Therapist Management API](../therapist/README.md)
- [Client Management API](../client/README.md)
- [Admin API](../admin/README.md)
- [Authentication Setup Guide](../../guides/authentication.md)

---

## 🆘 Troubleshooting

### Common Issues

#### Registration Fails with 409 Conflict
**Cause**: User already exists in database
**Solution**: Check if user was previously registered

#### JWT Token Invalid
**Cause**: Expired or malformed token
**Solution**: Refresh token from Clerk

#### Therapist Registration Validation Errors
**Cause**: Missing required professional fields
**Solution**: Ensure all required therapist fields are provided

### Debug Commands
```bash
# Check user exists in database
npx prisma studio

# View Clerk user data
curl -H "Authorization: Bearer sk_test_..." \
  https://api.clerk.com/v1/users/{userId}

# Test authentication endpoint
curl -H "Authorization: Bearer <token>" \
  http://localhost:5000/api/auth/me
```