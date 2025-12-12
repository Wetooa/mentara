# Database Optimization Guide

## Index Analysis

### Existing Indexes (Well Optimized)
The following models already have comprehensive indexes:

#### User Model
- ✅ `email` (unique)
- ✅ `role`
- ✅ `isActive`
- ✅ `role, isActive` (composite)
- ✅ `role, isActive, createdAt` (composite)
- ✅ `email, isActive` (composite)
- ✅ `createdAt`
- ✅ `emailVerified`
- ✅ `lastLoginAt`

#### Meeting Model
- ✅ `clientId`
- ✅ `therapistId`
- ✅ `startTime`
- ✅ `endTime`
- ✅ `status`
- ✅ `therapistId, startTime, status` (composite)
- ✅ `therapistId, status, startTime` (composite)
- ✅ `clientId, status, startTime` (composite)
- ✅ `therapistId, startTime, endTime` (composite)
- ✅ `clientId, startTime, endTime` (composite)

#### Payment Model
- ✅ `clientId`
- ✅ `therapistId`
- ✅ `status`
- ✅ `meetingId`
- ✅ `status, createdAt` (composite)
- ✅ `therapistId, status, createdAt` (composite)
- ✅ `createdAt`

#### Therapist Model
- ✅ `userId` (unique)
- ✅ `status`
- ✅ `timezone`
- ✅ `status, createdAt` (composite)
- ✅ `status, hourlyRate` (composite)
- ✅ `province`
- ✅ `yearsOfExperience`
- ✅ `hourlyRate`
- ✅ `createdAt`
- ✅ `province, status` (composite)

#### Content Model (Posts/Comments)
- ✅ `userId`
- ✅ `roomId`
- ✅ `roomId, createdAt` (composite)
- ✅ `userId, createdAt` (composite)
- ✅ `createdAt`
- ✅ `title`
- ✅ `roomId, userId, createdAt` (composite)
- ✅ `postId` (comments)
- ✅ `parentId` (comments)
- ✅ `postId, parentId` (composite)
- ✅ `postId, createdAt` (composite)

### Recommended Additional Indexes

#### For Common Query Patterns

```prisma
// ClientTherapist - for relationship lookups
model ClientTherapist {
  // Add if not exists:
  @@index([therapistId, clientId]) // For bidirectional lookups
  @@index([clientId, createdAt]) // For client's therapist history
  @@index([therapistId, createdAt]) // For therapist's client list
}

// Notification - for user notifications
model Notification {
  // Add if not exists:
  @@index([userId, isRead, createdAt]) // For unread notifications query
  @@index([userId, type, createdAt]) // For filtered notifications
}

// Message - for conversation queries
model Message {
  // Add if not exists:
  @@index([conversationId, createdAt]) // For message history
  @@index([senderId, createdAt]) // For sent messages
}

// Review - for therapist reviews
model Review {
  // Add if not exists:
  @@index([therapistId, createdAt]) // For therapist review history
  @@index([clientId, createdAt]) // For client review history
  @@index([therapistId, rating]) // For rating-based queries
}
```

## Query Optimization Best Practices

### 1. Use Select Instead of Include When Possible
```typescript
// ❌ Bad - loads entire related objects
const user = await prisma.user.findUnique({
  where: { id },
  include: { client: { include: { user: true } } }
});

// ✅ Good - only loads needed fields
const user = await prisma.user.findUnique({
  where: { id },
  select: {
    id: true,
    email: true,
    client: {
      select: {
        userId: true,
        city: true,
      }
    }
  }
});
```

### 2. Use Composite Indexes for Common Filter Combinations
```typescript
// Query pattern: WHERE therapistId = ? AND status = ? AND startTime > ?
// Index: @@index([therapistId, status, startTime])
```

### 3. Batch Related Queries
```typescript
// ❌ Bad - N+1 queries
for (const meeting of meetings) {
  const client = await prisma.client.findUnique({ where: { userId: meeting.clientId } });
}

// ✅ Good - single query
const clientIds = meetings.map(m => m.clientId);
const clients = await prisma.client.findMany({
  where: { userId: { in: clientIds } }
});
```

### 4. Use Pagination for Large Result Sets
```typescript
// Always use pagination for list endpoints
const { page, limit, skip } = pagination;
const [data, total] = await Promise.all([
  prisma.model.findMany({ skip, take: limit }),
  prisma.model.count()
]);
```

## Caching Strategy

### 1. Cache Frequently Accessed Data
- User profiles (5 min TTL)
- Therapist listings (10 min TTL)
- Community metadata (15 min TTL)
- Static configuration (1 hour TTL)

### 2. Cache Keys Pattern
```
user:{userId}:profile
therapist:{therapistId}:details
community:{communityId}:metadata
```

### 3. Invalidation Strategy
- Invalidate on update operations
- Use cache tags for related data
- Set appropriate TTLs based on update frequency

## Monitoring

### Query Performance Metrics
- Track slow queries (>100ms)
- Monitor N+1 query patterns
- Track index usage
- Monitor connection pool usage

### Recommended Tools
- Prisma Query Logging (development)
- PostgreSQL EXPLAIN ANALYZE
- Database connection monitoring
- Query performance dashboards


