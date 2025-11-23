# Group Therapy Sessions - Implementation Plan

**Date**: October 14, 2025  
**Status**: 📋 **PLANNING**  
**Complexity**: High  
**Estimated Time**: 8-12 hours

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Database Schema](#database-schema)
3. [API Endpoints](#api-endpoints)
4. [Business Logic](#business-logic)
5. [Integration Points](#integration-points)
6. [Implementation Phases](#implementation-phases)
7. [Testing Strategy](#testing-strategy)

---

## 🎯 Overview

### Feature Summary

**Group Therapy Sessions** allow moderators to create community-based therapy sessions with multiple therapists and community members as participants.

### Key Features

1. ✅ **Moderator-Led Creation** - Moderators spearhead sessions
2. ✅ **Therapist Invitations** - Therapists must accept to participate
3. ✅ **Community Member Participation** - Members can join approved sessions
4. ✅ **Availability Checking** - Prevent schedule conflicts
5. ✅ **Virtual & In-Person** - Support both session types
6. ✅ **Notification Integration** - Alerts for invitations and updates
7. ✅ **Schedule View** - Unified calendar for all sessions

### User Stories

**As a Moderator**:
- I can create a group therapy session proposal
- I can invite specific therapists from my community
- I can set session details (time, type, location/link)
- I can see invitation status

**As a Therapist**:
- I receive invitation notifications
- I can view pending invitations in a dedicated page
- I can accept or decline invitations
- I can see my schedule with all sessions (1-on-1 + group)
- System checks my availability before allowing acceptance

**As a Client/Community Member**:
- I can see available group sessions in my communities
- I can join approved sessions
- I can see my schedule with all booked sessions
- System checks my availability before allowing joining

---

## 🗄️ Database Schema

### New Tables

#### 1. GroupTherapySession

**Purpose**: Core session information

```prisma
model GroupTherapySession {
  id                String   @id @default(cuid())
  
  // Basic Info
  title             String
  description       String?
  communityId       String
  community         Community @relation(fields: [communityId], references: [id], onDelete: Cascade)
  
  // Creator/Spearhead
  createdById       String
  createdBy         User @relation("GroupSessionCreator", fields: [createdById], references: [id])
  
  // Session Details
  sessionType       SessionType  // VIRTUAL | IN_PERSON
  scheduledAt       DateTime
  duration          Int          // Duration in minutes
  maxParticipants   Int          // Max number of participants
  
  // Location/Link (based on type)
  virtualLink       String?      // For virtual sessions
  location          String?      // For in-person sessions
  locationAddress   String?      // Full address for in-person
  
  // Status
  status            GroupSessionStatus // PENDING_APPROVAL | APPROVED | CANCELLED | COMPLETED
  
  // Relationships
  therapistInvitations GroupSessionTherapistInvitation[]
  participants         GroupSessionParticipant[]
  
  // Metadata
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@index([communityId])
  @@index([createdById])
  @@index([status])
  @@index([scheduledAt])
}

enum SessionType {
  VIRTUAL
  IN_PERSON
}

enum GroupSessionStatus {
  PENDING_APPROVAL    // Waiting for therapists to accept
  APPROVED            // All therapists accepted, members can join
  CANCELLED           // Session cancelled
  COMPLETED           // Session finished
}
```

#### 2. GroupSessionTherapistInvitation

**Purpose**: Track therapist invitations and their responses

```prisma
model GroupSessionTherapistInvitation {
  id                String   @id @default(cuid())
  
  // Session
  sessionId         String
  session           GroupTherapySession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  
  // Therapist
  therapistId       String
  therapist         Therapist @relation(fields: [therapistId], references: [userId])
  
  // Invitation Status
  status            InvitationStatus
  invitedAt         DateTime @default(now())
  respondedAt       DateTime?
  
  // Response Message (optional)
  message           String?  // Therapist can leave a message when declining
  
  // Metadata
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@unique([sessionId, therapistId])
  @@index([therapistId, status])
}

enum InvitationStatus {
  PENDING
  ACCEPTED
  DECLINED
}
```

#### 3. GroupSessionParticipant

**Purpose**: Track community members who joined the session

```prisma
model GroupSessionParticipant {
  id                String   @id @default(cuid())
  
  // Session
  sessionId         String
  session           GroupTherapySession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  
  // Participant
  userId            String
  user              User @relation(fields: [userId], references: [id])
  
  // Participation
  joinedAt          DateTime @default(now())
  attendanceStatus  AttendanceStatus @default(REGISTERED)
  
  // Metadata
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@unique([sessionId, userId])
  @@index([userId])
}

enum AttendanceStatus {
  REGISTERED       // Joined but session not started
  ATTENDED         // Marked as attended
  NO_SHOW          // Registered but didn't attend
  CANCELLED        // User cancelled their registration
}
```

---

## 🛣️ API Endpoints

### Moderator Endpoints

**Base Path**: `/api/group-sessions`

#### Create Group Session Proposal
```typescript
POST /api/group-sessions
Body: {
  title: string;
  description?: string;
  communityId: string;
  sessionType: 'VIRTUAL' | 'IN_PERSON';
  scheduledAt: DateTime;
  duration: number; // minutes
  maxParticipants: number;
  virtualLink?: string;  // if VIRTUAL
  location?: string;     // if IN_PERSON
  locationAddress?: string;
  therapistIds: string[]; // Therapists to invite
}
Response: {
  session: GroupTherapySession;
  invitationsSent: number;
}
```

#### Get Sessions (Moderator View)
```typescript
GET /api/group-sessions/moderator
Query: {
  communityId?: string;
  status?: GroupSessionStatus;
}
Response: {
  sessions: GroupTherapySession[];
}
```

#### Cancel Session
```typescript
DELETE /api/group-sessions/:sessionId
Response: {
  message: string;
}
```

---

### Therapist Endpoints

**Base Path**: `/api/group-sessions/therapist`

#### Get Pending Invitations
```typescript
GET /api/group-sessions/therapist/invitations
Query: {
  status?: 'PENDING' | 'ACCEPTED' | 'DECLINED';
}
Response: {
  invitations: Array<{
    id: string;
    session: GroupTherapySession;
    status: InvitationStatus;
    invitedAt: DateTime;
  }>;
}
```

#### Respond to Invitation
```typescript
POST /api/group-sessions/therapist/invitations/:invitationId/respond
Body: {
  action: 'ACCEPT' | 'DECLINE';
  message?: string; // Optional message when declining
}
Response: {
  invitation: GroupSessionTherapistInvitation;
  sessionStatus?: GroupSessionStatus; // If all accepted, returns APPROVED
}
```

#### Get Therapist's Group Sessions
```typescript
GET /api/group-sessions/therapist/sessions
Query: {
  upcoming?: boolean;
  status?: GroupSessionStatus;
}
Response: {
  sessions: GroupTherapySession[];
}
```

---

### Client/Member Endpoints

**Base Path**: `/api/group-sessions`

#### Get Available Sessions (for community)
```typescript
GET /api/group-sessions/community/:communityId
Query: {
  upcoming?: boolean;
  status?: GroupSessionStatus;
}
Response: {
  sessions: GroupTherapySession[];
}
```

#### Join Session
```typescript
POST /api/group-sessions/:sessionId/join
Response: {
  participant: GroupSessionParticipant;
  message: string;
}
```

#### Leave Session
```typescript
DELETE /api/group-sessions/:sessionId/leave
Response: {
  message: string;
}
```

#### Get User's Joined Sessions
```typescript
GET /api/group-sessions/my-sessions
Response: {
  sessions: GroupTherapySession[];
}
```

---

### Schedule Endpoints (NEW)

**Base Path**: `/api/schedule`

#### Get User Schedule
```typescript
GET /api/schedule
Query: {
  startDate?: DateTime;
  endDate?: DateTime;
  includeCompleted?: boolean;
}
Response: {
  events: Array<{
    id: string;
    type: 'ONE_ON_ONE' | 'GROUP_SESSION';
    title: string;
    scheduledAt: DateTime;
    duration: number;
    status: string;
    details: Meeting | GroupTherapySession;
  }>;
}
```

---

## 🧠 Business Logic

### 1. Session Creation Workflow

```typescript
async createGroupSession(moderatorId: string, data: CreateSessionDto) {
  // 1. Verify moderator has permission for this community
  await this.verifyModeratorAccess(moderatorId, data.communityId);
  
  // 2. Verify all invited therapists are in the community
  await this.verifyTherapistsInCommunity(data.therapistIds, data.communityId);
  
  // 3. Create session with PENDING_APPROVAL status
  const session = await this.prisma.groupTherapySession.create({
    data: {
      ...sessionData,
      status: 'PENDING_APPROVAL',
    }
  });
  
  // 4. Create invitations for all therapists
  await this.createTherapistInvitations(session.id, data.therapistIds);
  
  // 5. Send notifications to all invited therapists
  await this.sendInvitationNotifications(session, data.therapistIds);
  
  return session;
}
```

### 2. Therapist Response Workflow

```typescript
async respondToInvitation(therapistId: string, invitationId: string, action: 'ACCEPT' | 'DECLINE', message?: string) {
  // 1. Get invitation and session
  const invitation = await this.getInvitation(invitationId);
  
  // 2. Verify therapist owns this invitation
  if (invitation.therapistId !== therapistId) {
    throw new UnauthorizedException();
  }
  
  if (action === 'ACCEPT') {
    // 3. Check therapist availability
    const hasConflict = await this.checkAvailability(
      therapistId, 
      invitation.session.scheduledAt,
      invitation.session.duration
    );
    
    if (hasConflict) {
      throw new ConflictException('You have a scheduling conflict');
    }
    
    // 4. Update invitation status
    await this.updateInvitation(invitationId, 'ACCEPTED');
    
    // 5. Check if all therapists have accepted
    const allAccepted = await this.checkAllInvitationsAccepted(invitation.sessionId);
    
    if (allAccepted) {
      // 6. Update session status to APPROVED
      await this.updateSessionStatus(invitation.sessionId, 'APPROVED');
      
      // 7. Notify community members that session is open for joining
      await this.notifyCommunityMembersSessionOpen(invitation.session);
    }
  } else {
    // Handle DECLINE
    await this.updateInvitation(invitationId, 'DECLINED', message);
    
    // Notify moderator that therapist declined
    await this.notifyModeratorOfDecline(invitation.session, therapistId, message);
  }
}
```

### 3. Member Join Workflow

```typescript
async joinGroupSession(userId: string, sessionId: string) {
  // 1. Get session
  const session = await this.getSession(sessionId);
  
  // 2. Verify session is APPROVED
  if (session.status !== 'APPROVED') {
    throw new BadRequestException('Session is not open for joining');
  }
  
  // 3. Verify user is member of the community
  await this.verifyCommunityMembership(userId, session.communityId);
  
  // 4. Check if session is full
  const participantCount = await this.getParticipantCount(sessionId);
  if (participantCount >= session.maxParticipants) {
    throw new ConflictException('Session is full');
  }
  
  // 5. Check user availability
  const hasConflict = await this.checkAvailability(
    userId,
    session.scheduledAt,
    session.duration
  );
  
  if (hasConflict) {
    throw new ConflictException('You have a scheduling conflict');
  }
  
  // 6. Add user as participant
  const participant = await this.addParticipant(userId, sessionId);
  
  // 7. Send confirmation notification
  await this.sendJoinConfirmationNotification(userId, session);
  
  return participant;
}
```

### 4. Availability Checking Logic

```typescript
async checkAvailability(userId: string, scheduledAt: DateTime, duration: number): Promise<boolean> {
  const endTime = addMinutes(scheduledAt, duration);
  
  // Check for conflicts with:
  // 1. One-on-one therapy sessions (as client or therapist)
  const meetingConflicts = await this.prisma.meeting.findMany({
    where: {
      OR: [
        { clientId: userId },
        { therapistId: userId }
      ],
      status: { in: ['SCHEDULED', 'CONFIRMED'] },
      startTime: { lt: endTime },
      endTime: { gt: scheduledAt }
    }
  });
  
  // 2. Other group therapy sessions
  const groupSessionConflicts = await this.prisma.groupSessionParticipant.findMany({
    where: {
      userId,
      session: {
        status: { in: ['APPROVED'] },
        scheduledAt: { lt: endTime },
        // Calculate end time based on scheduledAt + duration
      }
    }
  });
  
  return meetingConflicts.length > 0 || groupSessionConflicts.length > 0;
}
```

---

## 🔗 Integration Points

### 1. Notification System

**New Notification Types**:
```typescript
enum NotificationType {
  // ... existing types
  GROUP_SESSION_INVITATION = 'GROUP_SESSION_INVITATION',
  GROUP_SESSION_INVITATION_ACCEPTED = 'GROUP_SESSION_INVITATION_ACCEPTED',
  GROUP_SESSION_INVITATION_DECLINED = 'GROUP_SESSION_INVITATION_DECLINED',
  GROUP_SESSION_APPROVED = 'GROUP_SESSION_APPROVED',
  GROUP_SESSION_CANCELLED = 'GROUP_SESSION_CANCELLED',
  GROUP_SESSION_REMINDER = 'GROUP_SESSION_REMINDER',
  GROUP_SESSION_MEMBER_JOINED = 'GROUP_SESSION_MEMBER_JOINED',
}
```

### 2. Existing Models to Update

**Community Model** - Add relation:
```prisma
model Community {
  // ... existing fields
  groupSessions     GroupTherapySession[]
}
```

**User Model** - Add relations:
```prisma
model User {
  // ... existing fields
  createdGroupSessions    GroupTherapySession[] @relation("GroupSessionCreator")
  groupSessionParticipations GroupSessionParticipant[]
}
```

**Therapist Model** - Add relation:
```prisma
model Therapist {
  // ... existing fields
  groupSessionInvitations GroupSessionTherapistInvitation[]
}
```

### 3. Schedule Service (NEW)

Create a unified schedule service that aggregates:
- One-on-one therapy sessions (from `Meeting` table)
- Group therapy sessions (from `GroupTherapySession` table)

```typescript
@Injectable()
export class ScheduleService {
  async getUserSchedule(userId: string, startDate: Date, endDate: Date) {
    // Get one-on-one sessions
    const meetings = await this.getMeetingsForUser(userId, startDate, endDate);
    
    // Get group sessions
    const groupSessions = await this.getGroupSessionsForUser(userId, startDate, endDate);
    
    // Merge and sort by date
    return this.mergeAndSortEvents(meetings, groupSessions);
  }
}
```

---

## 📅 Implementation Phases

### **Phase 1: Database & Models** (~2 hours)

1. Create Prisma schema for new tables
   - `GroupTherapySession`
   - `GroupSessionTherapistInvitation`
   - `GroupSessionParticipant`

2. Add enums
   - `SessionType`
   - `GroupSessionStatus`
   - `InvitationStatus`
   - `AttendanceStatus`

3. Update existing models (Community, User, Therapist)

4. Generate Prisma client and run migration
   ```bash
   npx prisma migrate dev --name add-group-therapy-sessions
   ```

5. Add seed data for testing

---

### **Phase 2: Core Services** (~3 hours)

1. **GroupSessionService** - Main business logic
   ```typescript
   - createSession()
   - getSession()
   - updateSession()
   - cancelSession()
   - getSessionsByCommunity()
   ```

2. **GroupSessionInvitationService** - Invitation management
   ```typescript
   - createInvitations()
   - respondToInvitation()
   - getInvitationsForTherapist()
   - checkAllInvitationsAccepted()
   ```

3. **GroupSessionParticipantService** - Participant management
   ```typescript
   - joinSession()
   - leaveSession()
   - getParticipants()
   - checkParticipantLimit()
   ```

4. **AvailabilityCheckService** - Schedule conflict detection
   ```typescript
   - checkAvailability()
   - getConflictingEvents()
   ```

5. **ScheduleService** (NEW) - Unified schedule view
   ```typescript
   - getUserSchedule()
   - getUpcomingEvents()
   - getEventDetails()
   ```

---

### **Phase 3: Controllers & Routes** (~2 hours)

1. **GroupSessionController** - Main endpoints
   ```typescript
   POST   /group-sessions                    # Create (Moderator)
   GET    /group-sessions/community/:id      # List by community
   GET    /group-sessions/:id                # Get details
   DELETE /group-sessions/:id                # Cancel (Moderator)
   POST   /group-sessions/:id/join           # Join (Member)
   DELETE /group-sessions/:id/leave          # Leave (Member)
   ```

2. **GroupSessionTherapistController** - Therapist-specific
   ```typescript
   GET  /group-sessions/therapist/invitations           # List invitations
   POST /group-sessions/therapist/invitations/:id/respond # Accept/Decline
   GET  /group-sessions/therapist/sessions              # My sessions
   ```

3. **ScheduleController** (NEW) - Unified schedule
   ```typescript
   GET /schedule                # Get user's full schedule
   GET /schedule/conflicts      # Check for conflicts
   ```

---

### **Phase 4: Notification Integration** (~1 hour)

1. Update `NotificationType` enum
2. Create notification templates for group sessions
3. Integrate with existing notification service
4. Add email notifications (optional)

---

### **Phase 5: Guards & Permissions** (~1 hour)

1. **ModeratorGuard** - Verify moderator access to community
2. **CommunityMemberGuard** - Verify user is community member
3. **SessionOwnershipGuard** - Verify session ownership
4. **TherapistInvitationGuard** - Verify invitation ownership

---

### **Phase 6: Validation & DTOs** (~1 hour)

1. Create DTOs:
   ```typescript
   - CreateGroupSessionDto
   - UpdateGroupSessionDto
   - RespondToInvitationDto
   - JoinSessionDto
   - GetScheduleDto
   ```

2. Add validation rules:
   - Session must be in future
   - Duration must be reasonable (15-180 minutes)
   - Max participants limit (2-50)
   - Therapist IDs must be valid and in community

---

### **Phase 7: Testing** (~2 hours)

1. Unit tests for services
2. Integration tests for API endpoints
3. Test scenarios:
   - ✅ Create session with valid data
   - ✅ Therapist accepts invitation
   - ✅ Therapist declines invitation
   - ✅ All therapists accept → session approved
   - ✅ Member joins approved session
   - ✅ Availability conflict detection
   - ✅ Session capacity limit
   - ✅ Unauthorized access attempts

---

### **Phase 8: Seeding & Documentation** (~1 hour)

1. Add group sessions to dynamic seeding system
   - Create `GroupSessionsEnricher`
   - Add to orchestrator (Tier 5 or 6)

2. Update API documentation
3. Create Postman collection for group sessions
4. Update `README.md` with new feature

---

## 🧪 Testing Strategy

### Test Cases

#### 1. Session Creation Tests
```typescript
describe('GroupSessionService - Create', () => {
  it('should create session with PENDING_APPROVAL status');
  it('should send invitations to all therapists');
  it('should send notifications to therapists');
  it('should fail if moderator not authorized');
  it('should fail if therapist not in community');
  it('should fail if scheduled in the past');
});
```

#### 2. Invitation Response Tests
```typescript
describe('GroupSessionInvitationService', () => {
  it('should accept invitation if no conflicts');
  it('should reject acceptance if scheduling conflict');
  it('should update session to APPROVED when all accept');
  it('should notify moderator when therapist declines');
  it('should fail if responding to wrong invitation');
});
```

#### 3. Member Join Tests
```typescript
describe('GroupSessionParticipantService', () => {
  it('should allow member to join APPROVED session');
  it('should reject join if session PENDING_APPROVAL');
  it('should reject join if session full');
  it('should reject join if scheduling conflict');
  it('should reject join if not community member');
});
```

#### 4. Availability Check Tests
```typescript
describe('AvailabilityCheckService', () => {
  it('should detect conflict with one-on-one meeting');
  it('should detect conflict with other group session');
  it('should allow if no conflicts');
  it('should handle edge cases (same start/end time)');
});
```

#### 5. Schedule View Tests
```typescript
describe('ScheduleService', () => {
  it('should return both meeting types');
  it('should sort events chronologically');
  it('should filter by date range');
  it('should include completed events if requested');
});
```

---

## 📋 Checklist

### Database
- [ ] Create `GroupTherapySession` model
- [ ] Create `GroupSessionTherapistInvitation` model
- [ ] Create `GroupSessionParticipant` model
- [ ] Add enums (SessionType, GroupSessionStatus, etc.)
- [ ] Update existing models (Community, User, Therapist)
- [ ] Run migration
- [ ] Test schema in Prisma Studio

### Services
- [ ] Implement GroupSessionService
- [ ] Implement GroupSessionInvitationService
- [ ] Implement GroupSessionParticipantService
- [ ] Implement AvailabilityCheckService
- [ ] Implement ScheduleService
- [ ] Add error handling
- [ ] Add logging

### Controllers
- [ ] Implement GroupSessionController
- [ ] Implement GroupSessionTherapistController
- [ ] Implement ScheduleController
- [ ] Add guards and permissions
- [ ] Add validation

### Integration
- [ ] Update Notification types
- [ ] Send invitation notifications
- [ ] Send approval notifications
- [ ] Send reminder notifications
- [ ] Update AppModule imports

### Testing
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Manual API testing with Postman
- [ ] Test with frontend (later)

### Seeding
- [ ] Create GroupSessionsEnricher
- [ ] Add to hybrid orchestrator
- [ ] Test seeding with `npm run db:seed`

### Documentation
- [ ] API documentation
- [ ] Postman collection
- [ ] Update README
- [ ] Code comments

---

## 🚀 Estimated Timeline

| Phase | Task | Duration |
|-------|------|----------|
| 1 | Database & Models | 2h |
| 2 | Core Services | 3h |
| 3 | Controllers & Routes | 2h |
| 4 | Notification Integration | 1h |
| 5 | Guards & Permissions | 1h |
| 6 | Validation & DTOs | 1h |
| 7 | Testing | 2h |
| 8 | Seeding & Documentation | 1h |
| **Total** | | **13h** |

---

## 🎯 Success Criteria

✅ **Functionality**:
- Moderators can create group sessions
- Therapists receive and respond to invitations
- Session becomes APPROVED when all therapists accept
- Members can join approved sessions
- Availability checking prevents conflicts
- Schedule view shows all events

✅ **Quality**:
- All services have error handling
- All endpoints have proper guards
- All DTOs have validation
- Test coverage > 80%
- API documented in Postman

✅ **Integration**:
- Notifications work correctly
- Seeding creates sample group sessions
- No breaking changes to existing features

---

## 🔮 Future Enhancements (V2)

1. **Recurring Sessions** - Weekly/monthly group sessions
2. **Session Materials** - Upload resources for participants
3. **Session Recording** - Record virtual sessions
4. **Waitlist** - Join waitlist when session full
5. **Rating/Feedback** - Rate session after completion
6. **Session Chat** - In-session messaging
7. **Session Notes** - Therapists can add notes post-session
8. **Calendar Integration** - Export to Google Calendar, Outlook

---

**Ready for implementation when you give the go-ahead!** 🚀

