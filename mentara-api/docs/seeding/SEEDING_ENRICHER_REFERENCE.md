# Seeding Enricher Reference

Complete specification for all 18 table enrichers in the Mentara seeding system.

---

## Table of Contents

### Tier 1 - Foundation
1. [MembershipsEnricher](#1-membershipsenricher)
2. [RelationshipsEnricher](#2-relationshipsenricher)
3. [AvailabilityEnricher](#3-availabilityenricher)

### Tier 2 - Content
4. [AssessmentsEnricher](#4-assessmentsenricher)
5. [PostsEnricher](#5-postsenricher)
6. [ModeratorAssignmentsEnricher](#6-moderatorassignmentsenricher)

### Tier 3 - Engagement
7. [CommentsEnricher](#7-commentsenricher)
8. [HeartsEnricher](#8-heartsenricher)

### Tier 4 - Therapy
9. [MeetingsEnricher](#9-meetingsenricher)
10. [WorksheetsEnricher](#10-worksheetsenricher)
11. [MessagesEnricher](#11-messagesenricher)

### Tier 5 - Interactions
12. [ReviewsEnricher](#12-reviewsenricher)
13. [MessageInteractionsEnricher](#13-messageinteractionsenricher)
14. [RoomsEnricher](#14-roomsenricher)
15. [NotificationsEnricher](#15-notificationsenricher)

### Tier 6 - System
16. [ReportsEnricher](#16-reportsenricher)
17. [UserBlocksEnricher](#17-userblocksenricher)
18. [PaymentsEnricher](#18-paymentsenricher)

---

## 1. MembershipsEnricher

**Table**: `CommunityMember`  
**Tier**: 1 (Foundation)  
**Depends On**: User, Community  
**Priority**: 1/18

### Purpose

Ensures users are members of communities and communities have sufficient members for realistic social interaction.

### Minimum Requirements

**Per Client**: ≥1 community membership  
**Per Therapist**: ≥1 community membership  
**Per Community**: ≥8 members

### Implementation Details

**Step 1**: Query all clients with `_count.communityMembers`  
**Step 2**: For each client with < 1 membership, join available communities  
**Step 3**: Repeat for therapists  
**Step 4**: Check each community's member count  
**Step 5**: If community has < 8 members, invite available users

### Idempotency Strategy

- Uses `communityMember.count()` to check existing
- Uses `upsert` with `unique(userId, communityId)` constraint
- Skips if user already has sufficient memberships

### Deterministic Behavior

```typescript
const random = createSeededRandom(userId, 'community-memberships');
// Same user always joins same communities
```

### Example Data

```typescript
{
  userId: "abc-123",
  communityId: "community-1",
  role: "MEMBER",
  joinedAt: "2024-09-15T10:30:00Z"
}
```

### Testing

- [x] Empty database
- [x] Partial memberships
- [x] Fully satisfied
- [x] Run 5x (no duplicates)

### Code Location

`prisma/seed/dynamic/enrichers/memberships-enricher.ts`

---

## 2. RelationshipsEnricher

**Table**: `ClientTherapist`  
**Tier**: 1 (Foundation)  
**Depends On**: Client, Therapist  
**Priority**: 2/18

### Purpose

Establishes client-therapist relationships, ensuring therapists have active clients for therapy session seeding.

### Minimum Requirements

**Per Therapist**: ≥2 client relationships

### Implementation Details

**Step 1**: Query approved therapists with `_count.assignedClients`  
**Step 2**: For therapists with < 2 clients, find available clients  
**Step 3**: Create relationships with `matchedAt`, `status` = 'active'  
**Step 4**: Load-balance to avoid all clients going to one therapist

### Idempotency Strategy

- Checks `clientTherapist.count()` first
- Uses `unique(clientId, therapistId)` constraint
- Skips satisfied therapists

### Deterministic Behavior

Load-balances therapists by existing client count (fairest distribution).

### Example Data

```typescript
{
  clientId: "client-123",
  therapistId: "therapist-456",
  status: "active",
  matchedAt: "2024-08-20T14:00:00Z"
}
```

### Testing

- [x] Empty database
- [x] Some relationships exist
- [x] All therapists satisfied
- [x] Run 5x (no duplicates)

### Code Location

`prisma/seed/dynamic/enrichers/relationships-enricher.ts`

---

## 3. AvailabilityEnricher

**Table**: `TherapistAvailability`  
**Tier**: 1 (Foundation)  
**Depends On**: Therapist  
**Priority**: 3/18

### Purpose

Ensures therapists have weekly schedules, enabling meeting booking functionality.

### Minimum Requirements

**Per Therapist**: ≥3 days/week available

### Implementation Details

**Step 1**: Query therapists with availability day count  
**Step 2**: For therapists with < 3 days, add missing availability slots  
**Step 3**: Create Monday-Friday slots (9 AM - 5 PM typical)  
**Step 4**: Use deterministic random for realistic hours

### Idempotency Strategy

- Uses `groupBy` to count unique days
- Checks existing days before creating
- Skips if therapist has 3+ days

### Deterministic Behavior

```typescript
const random = createSeededRandom(therapistId, 'availability');
// Same therapist always gets same days/times
```

### Example Data

```typescript
{
  therapistId: "therapist-456",
  dayOfWeek: "MONDAY",
  startTime: "09:00",
  endTime: "17:00",
  isAvailable: true
}
```

### Testing

- [x] No availability
- [x] Partial availability
- [x] Full availability
- [x] Run 5x (no duplicates)

### Code Location

`prisma/seed/dynamic/enrichers/availability-enricher.ts`

---

## 4. AssessmentsEnricher

**Table**: `PreAssessment`  
**Tier**: 2 (Content)  
**Depends On**: Client  
**Priority**: 4/18

### Purpose

Ensures clients have completed initial mental health assessments, providing baseline data for therapy.

### Minimum Requirements

**Per Client**: ≥1 completed assessment

### Implementation Details

**Step 1**: Find clients without assessments  
**Step 2**: Create assessment with realistic answers  
**Step 3**: Generate scores (PHQ-9, GAD-7, etc.)  
**Step 4**: Set `hasSeenTherapistRecommendations` = true

### Idempotency Strategy

- Uses `unique(userId)` constraint
- Checks `preAssessment.findUnique()` first
- Skips if client already has assessment

### Deterministic Behavior

```typescript
const random = createSeededRandom(clientId, 'assessment');
// Same client gets same assessment scores
```

### Example Data

```typescript
{
  userId: "client-123",
  depressionScore: 12,
  anxietyScore: 8,
  stressScore: 15,
  hasSeenTherapistRecommendations: true,
  completedAt: "2024-09-01T10:00:00Z"
}
```

### Testing

- [x] No assessments
- [x] Some clients have assessments
- [x] All clients have assessments
- [x] Run 5x (no duplicates)

### Code Location

`prisma/seed/dynamic/enrichers/assessments-enricher.ts`

---

## 5. PostsEnricher

**Table**: `Post`  
**Tier**: 2 (Content)  
**Depends On**: User, CommunityMember  
**Priority**: 5/18

### Purpose

Populates communities with posts, enabling social engagement features (comments, hearts).

### Minimum Requirements

**Per Client**: ≥5 posts  
**Per Therapist**: ≥2 posts  
**Per Community**: ≥10 posts

### Implementation Details

**Step 1**: Check each user's post count  
**Step 2**: Get user's community memberships  
**Step 3**: Create posts in random communities from memberships  
**Step 4**: Use realistic mental health topics  
**Step 5**: Ensure communities have ≥10 posts

### Idempotency Strategy

- Counts existing posts first
- Calculates gap (min - current)
- Creates only missing posts

### Deterministic Behavior

```typescript
const random = createSeededRandom(userId, 'posts');
// Same user posts in same communities with same topics
```

### Example Data

```typescript
{
  userId: "client-123",
  communityId: "community-1",
  title: "Dealing with anxiety",
  content: "I've been struggling with anxiety lately...",
  createdAt: "2024-10-05T14:30:00Z"
}
```

### Testing

- [x] No posts
- [x] Some users/communities satisfied
- [x] All satisfied
- [x] Run 5x (exact gap filled)

### Code Location

`prisma/seed/dynamic/enrichers/posts-enricher.ts`

---

## 6. ModeratorAssignmentsEnricher

**Table**: `ModeratorCommunity`  
**Tier**: 2 (Content)  
**Depends On**: Moderator, Community  
**Priority**: 6/18

### Purpose

Assigns moderators to communities, enabling content moderation testing.

### Minimum Requirements

**Per Moderator**: ≥1 community assignment  
**Per Community**: ≥1 moderator

### Implementation Details

**Step 1**: Check moderators' assigned communities  
**Step 2**: Assign moderators with fewest communities first (load-balance)  
**Step 3**: Ensure each community has at least 1 moderator  
**Step 4**: Record `assignedAt` timestamp

### Idempotency Strategy

- Uses `count()` to check existing assignments
- Uses `unique(moderatorId, communityId)` constraint
- Skips if requirements satisfied

### Deterministic Behavior

Assigns based on current load (fairest distribution).

### Example Data

```typescript
{
  moderatorId: "mod-123",
  communityId: "community-2",
  assignedAt: "2024-09-10T08:00:00Z"
}
```

### Testing

- [x] No assignments
- [x] Partial coverage
- [x] Full coverage
- [x] Run 5x (no duplicates)

### Code Location

`prisma/seed/dynamic/enrichers/moderator-assignments-enricher.ts`

---

## 7. CommentsEnricher

**Table**: `Comment`  
**Tier**: 3 (Engagement)  
**Depends On**: Post, User  
**Priority**: 7/18

### Purpose

Adds comments to posts, creating discussion threads and community engagement.

### Minimum Requirements

**Per Client**: ≥10 comments  
**Per Therapist**: ≥5 comments  
**Per Post**: ≥2 comments

### Implementation Details

**Step 1**: Check user's comment count  
**Step 2**: Find posts in user's communities (not own posts)  
**Step 3**: Create supportive/helpful comments  
**Step 4**: Ensure posts have ≥2 comments  
**Step 5**: Alternate between support and questions

### Idempotency Strategy

- Counts existing comments
- Calculates gap per user and per post
- Creates only missing comments

### Deterministic Behavior

```typescript
const random = createSeededRandom(userId, 'comments');
// Same user comments on same posts
```

### Example Data

```typescript
{
  userId: "client-456",
  postId: "post-789",
  content: "I understand what you're going through. You're not alone!",
  createdAt: "2024-10-06T16:45:00Z"
}
```

### Testing

- [x] No comments
- [x] Partial comments
- [x] All satisfied
- [x] Run 5x (exact gap)

### Code Location

`prisma/seed/dynamic/enrichers/comments-enricher.ts`

---

## 8. HeartsEnricher

**Table**: `Heart`  
**Tier**: 3 (Engagement)  
**Depends On**: Post, Comment  
**Priority**: 8/18

### Purpose

Adds hearts (likes) to posts and comments, showing engagement metrics.

### Minimum Requirements

**Per User**: ≥3 hearts given  
**Per Post**: ≥1 heart  
**Per Comment**: (Optional, some get hearts)

### Implementation Details

**Step 1**: Check user's given hearts count  
**Step 2**: Find posts/comments user hasn't hearted yet  
**Step 3**: Give hearts to random items up to minimum  
**Step 4**: Ensure popular posts have multiple hearts  
**Step 5**: Don't heart own content

### Idempotency Strategy

- Checks existing hearts before creating
- Uses `unique(userId, postId)` or `unique(userId, commentId)`
- Skips if user has given enough hearts

### Deterministic Behavior

```typescript
const random = createSeededRandom(userId, 'hearts');
// Same user hearts same posts/comments
```

### Example Data

```typescript
{
  userId: "client-789",
  postId: "post-123",
  createdAt: "2024-10-07T11:20:00Z"
}
```

### Testing

- [x] No hearts
- [x] Some users/posts satisfied
- [x] All satisfied
- [x] Run 5x (no duplicates)

### Code Location

`prisma/seed/dynamic/enrichers/hearts-enricher.ts`

---

## 9. MeetingsEnricher

**Table**: `Meeting`, `MeetingNotes`  
**Tier**: 4 (Therapy)  
**Depends On**: ClientTherapist, TherapistAvailability  
**Priority**: 9/18

### Purpose

Creates therapy sessions for client-therapist relationships, including past, upcoming, and completed meetings with notes.

### Minimum Requirements

**Per Relationship**: ≥3 meetings  
**Per Completed Meeting**: ≥1 note entry

### Implementation Details

**Step 1**: Find relationships with < 3 meetings  
**Step 2**: Create mix of:
- Past completed (with notes)
- Future scheduled
- In-progress
**Step 3**: Use therapist availability for scheduling  
**Step 4**: Add session notes to completed meetings  
**Step 5**: Calculate realistic durations (50-60 min)

### Idempotency Strategy

- Counts existing meetings per relationship
- Calculates gap
- Creates only missing meetings

### Deterministic Behavior

```typescript
const random = createSeededRandom(relationshipId, 'meetings');
// Same relationship gets same meeting pattern
```

### Example Data

```typescript
// Meeting
{
  clientId: "client-123",
  therapistId: "therapist-456",
  startTime: "2024-10-01T10:00:00Z",
  endTime: "2024-10-01T10:50:00Z",
  status: "COMPLETED",
  meetingType: "video"
}

// Meeting Note
{
  meetingId: "meeting-789",
  notes: "Client showed progress with anxiety management...",
  sessionGoals: ["Reduce panic attacks", "Build coping strategies"],
  createdAt: "2024-10-01T11:00:00Z"
}
```

### Testing

- [x] No meetings
- [x] Some relationships satisfied
- [x] All satisfied
- [x] Run 5x (exact gap)

### Code Location

`prisma/seed/dynamic/enrichers/meetings-enricher.ts`

---

## 10. WorksheetsEnricher

**Table**: `Worksheet`, `WorksheetSubmission`  
**Tier**: 4 (Therapy)  
**Depends On**: Therapist, ClientTherapist  
**Priority**: 10/18

### Purpose

Creates therapeutic worksheets and assigns them to clients, simulating homework assignments.

### Minimum Requirements

**Per Therapist**: ≥3 worksheets created  
**Per Client (with therapist)**: ≥1 worksheet assigned

### Implementation Details

**Step 1**: Ensure therapists have created worksheets  
**Step 2**: Assign worksheets to clients  
**Step 3**: Some submissions completed, some pending  
**Step 4**: Use realistic worksheet types (CBT, mood tracking, etc.)

### Idempotency Strategy

- Checks therapist's worksheet count
- Checks client's assignments
- Creates only missing items

### Deterministic Behavior

```typescript
const random = createSeededRandom(therapistId, 'worksheets');
// Same therapist creates same worksheet types
```

### Example Data

```typescript
// Worksheet
{
  therapistId: "therapist-456",
  title: "Daily Mood Tracker",
  category: "Mood Monitoring",
  estimatedDuration: 10,
  createdAt: "2024-09-15T09:00:00Z"
}

// Worksheet Submission
{
  worksheetId: "worksheet-123",
  clientId: "client-789",
  status: "COMPLETED",
  submittedAt: "2024-10-08T20:30:00Z"
}
```

### Testing

- [x] No worksheets
- [x] Some therapists/clients satisfied
- [x] All satisfied
- [x] Run 5x (no duplicates)

### Code Location

`prisma/seed/dynamic/enrichers/worksheets-enricher.ts`

---

## 11. MessagesEnricher

**Table**: `Conversation`, `ConversationParticipant`, `Message`  
**Tier**: 4 (Therapy)  
**Depends On**: User  
**Priority**: 11/18

### Purpose

Creates private messaging conversations between users with realistic message threads.

### Minimum Requirements

**Per User**: ≥2 conversations  
**Per Conversation**: ≥5 messages

### Implementation Details

**Step 1**: Check user's conversation count  
**Step 2**: Create conversations with other users (therapist-client common)  
**Step 3**: Add participants to conversation  
**Step 4**: Create message threads (alternating senders)  
**Step 5**: Use supportive/therapeutic messaging templates

### Idempotency Strategy

- Counts existing conversations per user
- Checks message count per conversation
- Creates only missing items

### Deterministic Behavior

```typescript
const random = createSeededRandom(userId, 'conversations');
// Same users always message same partners
```

### Example Data

```typescript
// Conversation
{
  id: "conv-123",
  lastMessage: "Looking forward to our next session!",
  createdAt: "2024-10-05T14:00:00Z"
}

// Message
{
  conversationId: "conv-123",
  senderId: "client-123",
  content: "Thank you for the session today!",
  createdAt: "2024-10-05T14:30:00Z"
}
```

### Testing

- [x] No conversations
- [x] Some users satisfied
- [x] All satisfied
- [x] Run 5x (exact gap)

### Code Location

`prisma/seed/dynamic/enrichers/messages-enricher.ts`

---

## 12. ReviewsEnricher

**Table**: `Review`  
**Tier**: 5 (Interactions)  
**Depends On**: Meeting (completed)  
**Priority**: 12/18

### Purpose

Creates therapist reviews based on completed sessions, providing feedback data.

### Minimum Requirements

**Per Therapist**: ≥1 review  
**Review Rate**: ~30% of completed meetings get reviews

### Implementation Details

**Step 1**: Find completed meetings without reviews  
**Step 2**: Create reviews for subset (~30%)  
**Step 3**: Realistic ratings (mostly 4-5 stars)  
**Step 4**: Use positive feedback templates

### Idempotency Strategy

- Checks if meeting already has review
- Skips if therapist has minimum reviews
- Uses `unique(meetingId)` constraint

### Deterministic Behavior

```typescript
const random = createSeededRandom(meetingId, 'review');
// Same meetings get reviewed consistently
```

### Example Data

```typescript
{
  meetingId: "meeting-789",
  clientId: "client-123",
  therapistId: "therapist-456",
  rating: 5,
  comment: "Very helpful session! I feel much better.",
  createdAt: "2024-10-02T12:00:00Z"
}
```

### Testing

- [x] No reviews
- [x] Some therapists satisfied
- [x] All satisfied
- [x] Run 5x (no duplicates)

### Code Location

`prisma/seed/dynamic/enrichers/reviews-enricher.ts`

---

## 13. MessageInteractionsEnricher

**Table**: `MessageReaction`, `MessageReadReceipt`  
**Tier**: 5 (Interactions)  
**Depends On**: Message  
**Priority**: 13/18

### Purpose

Adds emoji reactions and read receipts to messages, enhancing messaging features.

### Minimum Requirements

**Per Message**: 30% chance of reaction, 70% chance of read receipt

### Implementation Details

**Step 1**: Find messages without reactions/receipts  
**Step 2**: Add reactions (random emoji from set)  
**Step 3**: Add read receipts for conversation participants  
**Step 4**: Use realistic timestamps (after message sent)

### Idempotency Strategy

- Checks existing reactions/receipts
- Uses random probability (30% / 70%)
- Skips if already processed

### Deterministic Behavior

```typescript
const random = createSeededRandom(messageId, 'reactions');
// Same messages get same reactions
```

### Example Data

```typescript
// Message Reaction
{
  messageId: "msg-123",
  userId: "client-456",
  emoji: "👍",
  createdAt: "2024-10-05T15:00:00Z"
}

// Read Receipt
{
  messageId: "msg-123",
  userId: "therapist-789",
  readAt: "2024-10-05T15:05:00Z"
}
```

### Testing

- [x] No reactions/receipts
- [x] Some messages satisfied
- [x] All satisfied
- [x] Run 5x (consistent probability)

### Code Location

`prisma/seed/dynamic/enrichers/message-interactions-enricher.ts`

---

## 14. RoomsEnricher

**Table**: `Room`  
**Tier**: 5 (Interactions)  
**Depends On**: Meeting (video type)  
**Priority**: 14/18

### Purpose

Creates video chat rooms for video therapy sessions.

### Minimum Requirements

**Per Video Meeting**: ≥1 room

### Implementation Details

**Step 1**: Find video meetings without rooms  
**Step 2**: Create room with unique ID  
**Step 3**: Set `isActive` = false (will activate during session)  
**Step 4**: Link to meeting

### Idempotency Strategy

- Checks if meeting already has room
- Skips non-video meetings
- Uses `unique(meetingId)` if available

### Deterministic Behavior

Rooms created for all video meetings consistently.

### Example Data

```typescript
{
  id: "room-meeting-789",
  meetingId: "meeting-789",
  isActive: false,
  createdAt: "2024-10-01T09:30:00Z"
}
```

### Testing

- [x] No rooms
- [x] Some video meetings satisfied
- [x] All satisfied
- [x] Run 5x (no duplicates)

### Code Location

`prisma/seed/dynamic/enrichers/rooms-enricher.ts`

---

## 15. NotificationsEnricher

**Table**: `Notification`  
**Tier**: 5 (Interactions)  
**Depends On**: Various (Post, Meeting, Message, etc.)  
**Priority**: 15/18

### Purpose

Creates realistic notifications for users, testing notification features.

### Minimum Requirements

**Per User**: ≥3-5 notifications

### Implementation Details

**Step 1**: Check user's notification count  
**Step 2**: Generate various notification types:
- New comment on post
- Upcoming meeting reminder
- New message received
- Worksheet assigned
**Step 3**: Mix of read/unread  
**Step 4**: Realistic timestamps

### Idempotency Strategy

- Counts existing notifications
- Calculates gap
- Creates only missing notifications

### Deterministic Behavior

```typescript
const random = createSeededRandom(userId, 'notifications');
// Same user gets same notification types
```

### Example Data

```typescript
{
  userId: "client-123",
  type: "NEW_COMMENT",
  title: "New comment on your post",
  message: "Someone replied to your post in Community Support",
  isRead: false,
  createdAt: "2024-10-08T10:00:00Z"
}
```

### Testing

- [x] No notifications
- [x] Some users satisfied
- [x] All satisfied
- [x] Run 5x (exact gap)

### Code Location

`prisma/seed/dynamic/enrichers/notifications-enricher.ts`

---

## 16. ReportsEnricher

**Table**: `Report`  
**Tier**: 6 (System)  
**Depends On**: Post, User  
**Priority**: 16/18

### Purpose

Creates minimal content reports for testing moderation features.

### Minimum Requirements

**System-wide**: ≥3 reports for testing

### Implementation Details

**Step 1**: Check existing report count  
**Step 2**: If < 3, create test reports  
**Step 3**: Use realistic report reasons (spam, harassment, etc.)  
**Step 4**: Some resolved, some pending  
**Step 5**: Link to actual posts/users

### Idempotency Strategy

- Checks total report count
- Only creates if below threshold
- Minimal for testing only

### Deterministic Behavior

Creates consistent test reports every time.

### Example Data

```typescript
{
  reporterId: "client-123",
  reportedUserId: "client-456",
  postId: "post-789",
  reason: "Inappropriate content",
  status: "pending",
  createdAt: "2024-10-07T16:00:00Z"
}
```

### Testing

- [x] No reports
- [x] Minimum satisfied
- [x] Run 5x (stays at minimum)

### Code Location

`prisma/seed/dynamic/enrichers/reports-enricher.ts`

---

## 17. UserBlocksEnricher

**Table**: `UserBlock`  
**Tier**: 6 (System)  
**Depends On**: User  
**Priority**: 17/18

### Purpose

Creates minimal block relationships for testing block feature edge cases.

### Minimum Requirements

**System-wide**: ≥2 block relationships for testing

### Implementation Details

**Step 1**: Check existing blocks  
**Step 2**: If < 2, create test blocks  
**Step 3**: Select random client pairs  
**Step 4**: Minimal for edge case testing only

### Idempotency Strategy

- Checks total block count
- Uses `unique(blockerId, blockedId)` constraint
- Minimal for testing

### Deterministic Behavior

Creates same test blocks consistently.

### Example Data

```typescript
{
  blockerId: "client-123",
  blockedId: "client-456",
  createdAt: "2024-09-20T14:00:00Z"
}
```

### Testing

- [x] No blocks
- [x] Minimum satisfied
- [x] Run 5x (stays at minimum)

### Code Location

`prisma/seed/dynamic/enrichers/user-blocks-enricher.ts`

---

## 18. PaymentsEnricher

**Table**: `Payment`, `PaymentMethod`  
**Tier**: 6 (System)  
**Depends On**: Meeting, BillingService  
**Priority**: 18/18  
**Status**: PLACEHOLDER

### Purpose

**FUTURE**: Will create payment records and payment methods when billing system is ready.

### Minimum Requirements

**Per Completed Meeting**: ≥1 payment (when billing ready)  
**Per User**: ≥1 payment method (when billing ready)

### Implementation Details

**Currently**: Skips enrichment (returns 0 items added)

**Future Implementation**:
1. Find completed meetings without payments
2. Create payment records
3. Link to payment methods
4. Calculate amounts from meeting duration

### Idempotency Strategy

Not yet implemented (placeholder only).

### Deterministic Behavior

Not yet implemented (placeholder only).

### Example Data

```typescript
// When implemented:
{
  meetingId: "meeting-789",
  userId: "client-123",
  amount: 100.00,
  currency: "USD",
  status: "completed",
  createdAt: "2024-10-01T11:00:00Z"
}
```

### Testing

- [x] Currently skips (returns 0)
- [ ] Full implementation pending billing system

### Code Location

`prisma/seed/dynamic/enrichers/payments-enricher.ts`

---

## Summary

**Total Enrichers**: 18  
**Active**: 17  
**Placeholder**: 1 (Payments)  
**Total Tables Covered**: 25+  
**Idempotent**: ✅ All  
**Deterministic**: ✅ All

**Last Updated**: October 14, 2025

