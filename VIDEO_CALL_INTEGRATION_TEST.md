# Video Call Integration End-to-End Testing Guide

## Overview
This document provides comprehensive testing steps for the newly implemented video call integration system across the full stack.

## Test Environment Setup

### Prerequisites
1. **Backend Service Running**: Ensure mentara-api is running on the configured port
2. **Frontend Service Running**: Ensure mentara-client is running and can connect to API
3. **Database Access**: Ensure database contains test users and meetings
4. **Authentication**: Have test accounts for both client and therapist roles

### Test Data Requirements
- Test meeting with status 'SCHEDULED' or 'CONFIRMED'
- Test users with roles: 'client' and 'therapist'
- Valid JWT tokens for authentication

## Backend API Testing

### 1. Video Room Creation Endpoint
**Endpoint**: `POST /meetings/{meetingId}/video-room`

**Test Cases**:
```bash
# Valid video room creation
curl -X POST \
  http://localhost:3000/meetings/{meetingId}/video-room \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "meetingId": "{meetingId}",
    "roomType": "video",
    "maxParticipants": 2,
    "enableRecording": false,
    "enableChat": true
  }'

# Expected Response: 201 Created
{
  "roomId": "room_{meetingId}_{timestamp}",
  "roomUrl": "https://video.mentara.app/room/{roomId}",
  "accessToken": "{base64Token}",
  "participantToken": "{base64Token}",
  "roomConfig": {
    "maxParticipants": 2,
    "enableRecording": false,
    "enableChat": true,
    "recordingActive": false
  },
  "expiresAt": "{ISO timestamp}",
  "participantCount": 1,
  "status": "waiting"
}
```

### 2. Join Video Room Endpoint
**Endpoint**: `POST /meetings/{meetingId}/join-video`

**Test Cases**:
```bash
# Join as therapist
curl -X POST \
  http://localhost:3000/meetings/{meetingId}/join-video \
  -H "Authorization: Bearer {therapistToken}" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "therapist",
    "enableVideo": true,
    "enableAudio": true
  }'

# Join as client
curl -X POST \
  http://localhost:3000/meetings/{meetingId}/join-video \
  -H "Authorization: Bearer {clientToken}" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "client",
    "enableVideo": true,
    "enableAudio": true
  }'
```

### 3. Video Call Status Endpoint
**Endpoint**: `GET /meetings/{meetingId}/video-status`

**Test Cases**:
```bash
# Get video call status
curl -X GET \
  http://localhost:3000/meetings/{meetingId}/video-status \
  -H "Authorization: Bearer {token}"

# Expected Response:
{
  "meetingId": "{meetingId}",
  "roomId": "room_{meetingId}",
  "status": "active",
  "participants": [
    {
      "id": "{clientId}",
      "name": "Client",
      "role": "client",
      "joinedAt": "{ISO timestamp}",
      "connectionStatus": "connected"
    },
    {
      "id": "{therapistId}",
      "name": "Therapist", 
      "role": "therapist",
      "joinedAt": "{ISO timestamp}",
      "connectionStatus": "connected"
    }
  ],
  "startedAt": "{ISO timestamp}",
  "duration": 1800
}
```

### 4. End Video Call Endpoint
**Endpoint**: `DELETE /meetings/{meetingId}/video-room`

**Test Cases**:
```bash
# End video call with session summary
curl -X DELETE \
  http://localhost:3000/meetings/{meetingId}/video-room \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "endReason": "session_completed",
    "sessionSummary": {
      "duration": 1800,
      "connectionQuality": "good",
      "technicalIssues": []
    },
    "nextSteps": ["Schedule follow-up", "Complete homework"]
  }'

# Expected Response: 204 No Content
```

## Frontend Integration Testing

### 1. Service Layer Testing
**File**: `mentara-client/lib/api/services/meetings.ts`

```typescript
// Test video call service methods
import { useApi } from '@/lib/api';

const testVideoCallService = async () => {
  const api = useApi();
  const meetingId = 'test-meeting-id';

  try {
    // Test 1: Create video room
    const roomResponse = await api.meetings.createVideoRoom(meetingId, {
      meetingId,
      roomType: 'video',
      maxParticipants: 2,
      enableRecording: false,
      enableChat: true,
    });
    console.log('✅ Video room created:', roomResponse);

    // Test 2: Join video room
    const joinResponse = await api.meetings.joinAsClient(meetingId);
    console.log('✅ Joined video room:', joinResponse);

    // Test 3: Get video status
    const statusResponse = await api.meetings.getVideoCallStatus(meetingId);
    console.log('✅ Video call status:', statusResponse);

    // Test 4: End video call
    await api.meetings.endCallWithSummary(meetingId, 1800, ['Follow up']);
    console.log('✅ Video call ended successfully');

  } catch (error) {
    console.error('❌ Video call service test failed:', error);
  }
};
```

### 2. Component Integration Testing

Create a test component to verify the integration:

```typescript
// Test component for video call integration
const VideoCallTestComponent = () => {
  const api = useApi();
  const [meetingId, setMeetingId] = useState('');
  const [status, setStatus] = useState('');

  const testCreateRoom = async () => {
    try {
      setStatus('Creating video room...');
      const response = await api.meetings.createBasicVideoRoom(meetingId);
      setStatus(`Room created: ${response.roomUrl}`);
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
  };

  const testJoinRoom = async () => {
    try {
      setStatus('Joining video room...');
      const response = await api.meetings.joinAsClient(meetingId);
      setStatus(`Joined room: ${response.roomId}`);
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
  };

  return (
    <div>
      <input 
        value={meetingId}
        onChange={(e) => setMeetingId(e.target.value)}
        placeholder="Meeting ID"
      />
      <button onClick={testCreateRoom}>Create Room</button>
      <button onClick={testJoinRoom}>Join Room</button>
      <div>Status: {status}</div>
    </div>
  );
};
```

## Authentication Testing

### 1. Password Reset Flow
**Frontend Flow**:
```typescript
// Test password reset functionality
const testPasswordReset = async () => {
  const api = useApi();
  
  try {
    // Step 1: Request password reset
    await api.auth.requestPasswordReset({ email: 'test@example.com' });
    console.log('✅ Password reset email sent');

    // Step 2: Validate reset token (use token from email)
    const tokenValidation = await api.auth.validateResetToken('test-token');
    console.log('✅ Token validation:', tokenValidation);

    // Step 3: Reset password
    const resetResult = await api.auth.resetPassword({
      token: 'test-token',
      newPassword: 'NewPassword123!',
      confirmPassword: 'NewPassword123!'
    });
    console.log('✅ Password reset:', resetResult);

  } catch (error) {
    console.error('❌ Password reset test failed:', error);
  }
};
```

### 2. Email Verification Flow
```typescript
// Test email verification functionality
const testEmailVerification = async () => {
  const api = useApi();
  
  try {
    // Step 1: Send verification email
    await api.auth.sendVerificationEmail();
    console.log('✅ Verification email sent');

    // Step 2: Verify email (use token from email)
    const verifyResult = await api.auth.verifyEmail({ token: 'verification-token' });
    console.log('✅ Email verified:', verifyResult);

  } catch (error) {
    console.error('❌ Email verification test failed:', error);
  }
};
```

## Database Verification

### 1. Meeting Status Updates
```sql
-- Verify meeting status changes during video call
SELECT id, status, created_at, updated_at 
FROM meetings 
WHERE id = 'test-meeting-id';

-- Check session logs
SELECT * FROM session_logs 
WHERE meeting_id = 'test-meeting-id'
ORDER BY created_at DESC;
```

### 2. User Verification Status
```sql
-- Check email verification status
SELECT id, email, email_verified, email_verify_token, email_verify_token_exp
FROM users 
WHERE email = 'test@example.com';

-- Check password reset tokens
SELECT id, email, reset_token, reset_token_expiry
FROM users 
WHERE email = 'test@example.com';
```

## Integration Test Checklist

### ✅ Backend Functionality
- [ ] Video room creation endpoint responds correctly
- [ ] Join video room endpoint works for both roles
- [ ] Video call status endpoint returns proper data
- [ ] End video call endpoint processes successfully
- [ ] Meeting status updates correctly in database
- [ ] Session logs are created properly
- [ ] Password reset flow works end-to-end
- [ ] Email verification flow works end-to-end

### ✅ Frontend Integration
- [ ] Meetings service includes all video call methods
- [ ] Service methods call correct backend endpoints
- [ ] Helper methods work as expected
- [ ] Error handling works properly
- [ ] TypeScript types are correctly imported
- [ ] Authentication service methods work

### ✅ Full Stack Flow
- [ ] Create meeting → Create video room → Join room → End call
- [ ] User registration → Email verification → Login
- [ ] Password reset request → Email → Reset → Login
- [ ] All API responses match expected schemas
- [ ] Database state changes correctly

## Performance Testing

### 1. Load Testing Video Calls
```bash
# Test concurrent video room creation
for i in {1..10}; do
  curl -X POST \
    http://localhost:3000/meetings/test-meeting-$i/video-room \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"meetingId":"test-meeting-'$i'","roomType":"video","maxParticipants":2,"enableRecording":false,"enableChat":true}' &
done
wait
```

### 2. Authentication Load Testing
```bash
# Test concurrent password reset requests
for i in {1..10}; do
  curl -X POST \
    http://localhost:3000/auth/request-password-reset \
    -H "Content-Type: application/json" \
    -d '{"email":"test'$i'@example.com"}' &
done
wait
```

## Troubleshooting

### Common Issues
1. **JWT Token Expiry**: Ensure test tokens are valid
2. **Meeting Status**: Meeting must be SCHEDULED or CONFIRMED
3. **Database Connections**: Verify database is accessible
4. **Environment Variables**: Check JWT_SECRET and other configs
5. **CORS Issues**: Ensure frontend can access backend endpoints

### Debug Commands
```bash
# Check backend logs
tail -f mentara-api/logs/application.log

# Check database connections
psql -h localhost -U username -d mentara_db -c "SELECT 1;"

# Test basic API connectivity
curl -X GET http://localhost:3000/health
```

## Success Criteria

The video call integration is considered successful when:

1. ✅ All backend endpoints respond correctly with valid data
2. ✅ Frontend service methods integrate seamlessly with backend
3. ✅ Database state changes reflect video call lifecycle
4. ✅ Authentication features work without errors
5. ✅ Error handling provides meaningful feedback
6. ✅ Type safety is maintained throughout the stack
7. ✅ Performance is acceptable under normal load

This comprehensive testing ensures the video call integration is production-ready and provides a solid foundation for real-time therapy sessions.