# Analytics Module - Comprehensive Analysis & Recommendations

**Date**: October 14, 2025  
**Module**: Analytics (`src/analytics/`)  
**Status**: 🟡 Functional but Limited

---

## 📊 Current State Analysis

### What the Analytics Module Currently Does

The analytics module provides **three types of analytics**:

#### 1. **Platform Analytics** (`GET /api/analytics/platform`)

**Access**: Admin only  
**Purpose**: Overall platform health and metrics

**Current Metrics**:

- Total users, new users
- Total therapists, new therapists
- Total meetings, completed meetings, completion rate
- Total posts, new posts
- Total communities, active communities
- User growth by role (monthly)
- Engagement stats (posts, comments, hearts)
- Session statistics (duration, types, top therapists)

**Good**: Comprehensive overview  
**Missing**: Revenue, trends, comparisons, churn

---

#### 2. **Therapist Analytics** (`GET /api/analytics/therapist`)

**Access**: Therapist (own data) or Admin (any therapist)  
**Purpose**: Therapist performance tracking

**Current Metrics**:

- Total clients assigned
- Active sessions, completed sessions, completion rate
- Average rating from reviews
- Worksheets assigned, completed, completion rate
- Recent client activities (last 10)

**Good**: Covers core KPIs  
**Missing**: Revenue, response times, client retention, session trends

---

#### 3. **Client Analytics** (`GET /api/analytics/client`)

**Access**: Client (own data), Therapist (assigned clients), or Admin  
**Purpose**: Client progress tracking

**Current Metrics**:

- Total sessions, completed sessions, completion rate
- Average session rating given
- Worksheets assigned, completed, completion rate
- Community posts and comments count
- Recent activity history (worksheets)

**Good**: Progress tracking basics  
**Missing**: Mental health progress, assessment trends, engagement patterns

---

## 🔍 Issues Found

### ❌ **Critical Issues**

1. **NO Health Endpoint**

   - Unlike admin module, no `/analytics/health` endpoint
   - No way to check service status

2. **Inconsistent Role Checking**

   ```typescript
   // Line 87: Checking for role 'user' instead of 'client'
   if (role === 'user' && targetClientId !== userId) {
   ```

   **Problem**: Role should be `'client'` not `'user'`

3. **Raw SQL with Potential Injection**
   ```typescript
   // Lines 112-122: Using template string in raw SQL
   const monthlyGrowth = await this.prisma.$queryRaw`
     SELECT ...
     ${whereDate.createdAt ? 'WHERE "createdAt" >= $1 AND "createdAt" <= $2' : ''}
   ```
   **Problem**: Conditional SQL is fragile, parameters not properly bound

### ⚠️ **Performance Issues**

1. **Too Many Queries in getPlatformAnalytics()**

   - Lines 34-64: 10 separate count queries
   - Then calls 3 more methods (getUserGrowthStats, getEngagementStats, getSessionStats)
   - Each method has 5-10 more queries
   - **Total**: ~30+ database queries for one endpoint!

2. **No Caching**

   - Analytics data changes infrequently
   - Should be cached for 5-15 minutes
   - Currently recalculates everything on every request

3. **Inefficient Date Filtering**
   - Repeated pattern of building `whereDate` objects
   - Should be extracted into helper function

### 🐛 **Code Quality Issues**

1. **Repetitive Code**

   - Date filter building repeated 4 times (lines 16-21, 99-104, 137-142, 219-224)
   - Review aggregate repeated in 2 methods with same logic

2. **Missing Pagination**

   - Platform analytics returns everything
   - Could be large datasets
   - No limits on topCommunities, therapistPerformance

3. **Unused `includeDetails` Parameter**
   - All DTOs have `includeDetails?: boolean`
   - Never used in service code
   - Either implement or remove

---

## 📁 Database Schema Review

### Available Data for Analytics (Not Currently Used)

#### **Payment Data** 💰

```prisma
model Payment {
  amount, currency, status
  clientId, therapistId, meetingId
  processedAt, failedAt, failureReason
}
```

**Missing Analytics**:

- 💰 Revenue tracking (total, by therapist, by period)
- 💰 Payment success/failure rates
- 💰 Average session costs
- 💰 Revenue trends over time
- 💰 Top revenue-generating therapists
- 💰 Payment method usage statistics

#### **Messaging Data** 💬

```prisma
model Conversation, Message, MessageReadReceipt, MessageReaction
```

**Missing Analytics**:

- 💬 Message volume (total, by user, by conversation type)
- 💬 Response time analytics
- 💬 Most active conversations
- 💬 Read rate statistics
- 💬 Popular reactions/emojis
- 💬 Messaging engagement by time of day

#### **Meeting Details** 📅

```prisma
model Meeting {
  status: SCHEDULED | WAITING | CONFIRMED | IN_PROGRESS | COMPLETED | CANCELLED | NO_SHOW
  duration, meetingType
}
model MeetingNotes
```

**Missing Analytics**:

- 📅 No-show rates (by therapist, by client, overall)
- 📅 Cancellation patterns and reasons
- 📅 Meeting type distribution
- 📅 Average session duration by therapist/client
- 📅 Notes completion rate (% of sessions with notes)
- 📅 Peak booking times and days

#### **Pre-Assessment Data** 🧠

```prisma
model PreAssessment {
  scores, severityLevels, aiEstimate
  isProcessed, processedAt
}
```

**Missing Analytics**:

- 🧠 Average severity levels across platform
- 🧠 Most common mental health concerns
- 🧠 Assessment completion rate
- 🧠 Severity distribution (mild, moderate, severe)
- 🧠 Correlation between assessment and outcomes

#### **Review Data** ⭐

```prisma
model Review {
  rating, isAnonymous, isVerified
  clientId, therapistId, meetingId
}
```

**Missing Analytics**:

- ⭐ Rating distribution (1-5 stars)
- ⭐ Verified vs unverified review ratio
- ⭐ Anonymous review percentage
- ⭐ Review velocity (reviews per therapist over time)
- ⭐ Client satisfaction trends

#### **Notification Data** 🔔

```prisma
model Notification {
  type, priority, isRead, readAt
}
```

**Missing Analytics**:

- 🔔 Notification delivery stats
- 🔔 Read rates by type
- 🔔 Most effective notification types
- 🔔 User notification preferences

#### **Community Engagement** 👥

```prisma
model Post, Comment, PostHeart, CommentHeart
model Membership, Community
```

**Current**: Basic counts  
**Missing**:

- 👥 Engagement rate by community
- 👥 Most active members
- 👥 Community growth trends
- 👥 Post/comment velocity
- 👥 Heart/like distribution

#### **User Activity Tracking** 📈

```prisma
model User {
  lastLoginAt, failedLoginCount, lockoutUntil
  createdAt, updatedAt
}
```

**Missing Analytics**:

- 📈 Daily/Monthly active users (DAU/MAU)
- 📈 User retention cohorts
- 📈 Login frequency patterns
- 📈 Account age distribution
- 📈 Failed login attempts (security metric)

---

## 🚀 Recommended Additions

### **Priority 1: Essential Missing Analytics**

#### 1. **Revenue Analytics** 💰

```typescript
async getRevenueAnalytics(startDate?, endDate?) {
  // Total revenue, revenue by therapist
  // Payment success/failure rates
  // Average transaction value
  // Revenue trends (daily, weekly, monthly)
  // Top revenue therapists
}
```

**Why**: Critical for business intelligence  
**Database**: Uses `Payment` model  
**Complexity**: Medium  
**Value**: ⭐⭐⭐⭐⭐

#### 2. **User Retention & Churn** 📊

```typescript
async getRetentionAnalytics(startDate?, endDate?) {
  // Retention rate by cohort
  // Churn rate calculation
  // DAU/MAU ratio
  // User lifecycle stages
}
```

**Why**: Understand user stickiness  
**Database**: Uses `User.lastLoginAt`, `createdAt`  
**Complexity**: Medium  
**Value**: ⭐⭐⭐⭐⭐

#### 3. **Meeting Quality Metrics** 📅

```typescript
async getMeetingQualityAnalytics(startDate?, endDate?) {
  // No-show rates by therapist/client
  // Cancellation reasons and patterns
  // Average lead time for bookings
  // Peak booking times
  // Notes completion rate
}
```

**Why**: Improve session quality  
**Database**: Uses `Meeting` model  
**Complexity**: Low  
**Value**: ⭐⭐⭐⭐

#### 4. **Mental Health Trends** 🧠

```typescript
async getMentalHealthTrends(startDate?, endDate?) {
  // Most common concerns
  // Severity distribution
  // Assessment completion rate
  // Progress tracking (if re-assessments exist)
}
```

**Why**: Clinical insights for platform  
**Database**: Uses `PreAssessment` model  
**Complexity**: Medium  
**Value**: ⭐⭐⭐⭐

### **Priority 2: Enhanced Analytics**

#### 5. **Messaging Analytics** 💬

```typescript
async getMessagingAnalytics(startDate?, endDate?) {
  // Message volume trends
  // Response time averages
  // Most active users
  // Message types distribution
  // Read rates
}
```

**Value**: ⭐⭐⭐

#### 6. **Community Health Metrics** 👥

```typescript
async getCommunityHealthAnalytics(communityId?, startDate?, endDate?) {
  // Engagement rate per community
  // Growth/decline trends
  // Top contributors
  // Content quality metrics
}
```

**Value**: ⭐⭐⭐

#### 7. **Therapist Performance Comparison** 🏆

```typescript
async getTherapistBenchmarking(therapistId?, startDate?, endDate?) {
  // Compare to platform averages
  // Percentile rankings
  // Strengths and improvement areas
}
```

**Value**: ⭐⭐⭐

---

## 🏗️ Recommended Structure Reorganization

### Current Structure (Flat)

```
analytics/
├── analytics.controller.ts       (103 lines)
├── analytics.service.ts          (542 lines - TOO BIG!)
├── analytics.module.ts
├── types/
└── validation/
```

### Recommended Structure (Nested by Domain)

```
analytics/
├── analytics.module.ts
├── analytics-health.controller.ts  [NEW]
│
├── platform/                       [NEW]
│   ├── platform-analytics.controller.ts
│   └── platform-analytics.service.ts
│
├── therapist/                      [NEW]
│   ├── therapist-analytics.controller.ts
│   └── therapist-analytics.service.ts
│
├── client/                         [NEW]
│   ├── client-analytics.controller.ts
│   └── client-analytics.service.ts
│
├── revenue/                        [NEW - HIGH PRIORITY]
│   ├── revenue-analytics.controller.ts
│   └── revenue-analytics.service.ts
│
├── retention/                      [NEW - HIGH PRIORITY]
│   ├── retention-analytics.controller.ts
│   └── retention-analytics.service.ts
│
├── community/                      [NEW]
│   ├── community-analytics.controller.ts
│   └── community-analytics.service.ts
│
├── messaging/                      [NEW]
│   ├── messaging-analytics.controller.ts
│   └── messaging-analytics.service.ts
│
├── shared/
│   ├── analytics-cache.service.ts  [NEW - PERFORMANCE]
│   └── date-filter.helpers.ts      [NEW - DRY]
│
├── types/
│   ├── analytics.dto.ts
│   ├── revenue.dto.ts              [NEW]
│   ├── retention.dto.ts            [NEW]
│   └── index.ts
│
└── validation/
    └── analytics.schemas.ts
```

**Benefits**:

- ✅ Each domain has its own folder
- ✅ Services stay under 300 lines each
- ✅ Easy to add new analytics types
- ✅ Clear separation of concerns
- ✅ Shared utilities for common patterns

---

## 🔧 Immediate Cleanup Actions

### 1. **Fix Role Check Bug** 🐛

**File**: `analytics.controller.ts` Line 87

**Current (WRONG)**:

```typescript
if (role === 'user' && targetClientId !== userId) {
```

**Fixed**:

```typescript
if (role === 'client' && targetClientId !== userId) {
```

### 2. **Add Health Endpoint** 🏥

```typescript
@Public()
@Get('health')
async checkHealth() {
  return {
    success: true,
    service: 'analytics',
    status: 'active'
  };
}
```

### 3. **Extract Date Filter Helper** 🛠️

**Create**: `shared/date-filter.helpers.ts`

**Before** (Repeated 4 times):

```typescript
const dateFilter = {};
if (startDate) dateFilter['gte'] = startDate;
if (endDate) dateFilter['lte'] = endDate;
const whereDate =
  Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};
```

**After** (DRY):

```typescript
import { buildDateFilter } from './shared/date-filter.helpers';

const whereDate = buildDateFilter(startDate, endDate, 'createdAt');
```

### 4. **Optimize Queries** ⚡

**Current**: 30+ queries per platform analytics request  
**Recommended**: Reduce to ~10 queries with better aggregation

**Strategy**:

```typescript
// Instead of multiple counts, use groupBy
const statusCounts = await prisma.meeting.groupBy({
  by: ['status'],
  _count: { _all: true },
  _avg: { duration: true },
});
```

### 5. **Add Caching** 🚀

```typescript
// Cache analytics for 5 minutes
@CacheKey('platform-analytics')
@CacheTTL(300) // 5 minutes
async getPlatformAnalytics(...) {
  // ...
}
```

**Impact**: 5-10x faster for repeated requests

---

## 📈 Missing Analytics by Database Table

### From `Payment` Model

- ❌ Total revenue
- ❌ Revenue by therapist
- ❌ Revenue trends
- ❌ Payment success rate
- ❌ Failed payment analysis
- ❌ Average transaction value
- ❌ Payment method distribution

### From `Meeting` Model (Enhanced)

- ❌ No-show rate tracking
- ❌ Cancellation patterns
- ❌ Meeting type popularity
- ❌ Peak booking times
- ❌ Average duration by type
- ❌ Session notes completion rate

### From `Message` Model

- ❌ Message volume trends
- ❌ Response time analysis
- ❌ Read receipt statistics
- ❌ Reaction analytics
- ❌ Most active hours
- ❌ Conversation length metrics

### From `PreAssessment` Model

- ❌ Severity level distribution
- ❌ Most common concerns
- ❌ Assessment completion rate
- ❌ Processing time metrics
- ❌ AI estimate accuracy

### From `Review` Model (Enhanced)

- ❌ Rating distribution (1-5 stars)
- ❌ Verified review percentage
- ❌ Anonymous review rate
- ❌ Review trends over time
- ❌ Review velocity

### From `Notification` Model

- ❌ Notification delivery stats
- ❌ Read rates by type
- ❌ Notification effectiveness
- ❌ Priority distribution

### From `User` Model (Enhanced)

- ❌ Daily Active Users (DAU)
- ❌ Monthly Active Users (MAU)
- ❌ User retention cohorts
- ❌ Churn rate calculation
- ❌ Failed login patterns (security)
- ❌ Account suspension stats

---

## 🎯 Recommended Implementation Plan

### **Phase 1: Critical Fixes (1-2 days)**

1. ✅ Fix role check bug (`'user'` → `'client'`)
2. ✅ Add health endpoint
3. ✅ Extract date filter helper
4. ✅ Fix raw SQL injection risk
5. ✅ Add basic caching

### **Phase 2: Performance (3-5 days)**

6. ✅ Optimize query count (30+ → ~10)
7. ✅ Add caching layer (Redis)
8. ✅ Implement pagination for large datasets
9. ✅ Add database indexes if missing

### **Phase 3: Essential Analytics (1 week)**

10. ✅ Revenue analytics service
11. ✅ Retention/churn analytics
12. ✅ Meeting quality metrics
13. ✅ Mental health trends

### **Phase 4: Advanced Analytics (2 weeks)**

14. ✅ Messaging analytics
15. ✅ Community health metrics
16. ✅ Therapist benchmarking
17. ✅ Predictive analytics

### **Phase 5: Restructuring (1 week)**

18. ✅ Split into nested folders by domain
19. ✅ Separate services (keep under 300 lines each)
20. ✅ Add comprehensive tests

---

## 🔥 Quick Wins to Implement NOW

### 1. Health Endpoint (5 minutes)

```typescript
@Public()
@Get('health')
async checkHealth() {
  return {
    success: true,
    service: 'analytics',
    endpoints: ['platform', 'therapist', 'client'],
    status: 'active',
  };
}
```

### 2. Fix Role Bug (2 minutes)

Change `'user'` to `'client'` in line 87

### 3. Add Revenue Basics (30 minutes)

```typescript
@Get('revenue')
async getRevenueAnalytics(@CurrentUserRole() role: string) {
  if (role !== 'admin') throw new ForbiddenException();

  const [totalRevenue, successfulPayments, failedPayments] = await Promise.all([
    prisma.payment.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { amount: true },
    }),
    prisma.payment.count({ where: { status: 'COMPLETED' } }),
    prisma.payment.count({ where: { status: 'FAILED' } }),
  ]);

  return {
    totalRevenue: totalRevenue._sum.amount || 0,
    successfulPayments,
    failedPayments,
    successRate: successfulPayments / (successfulPayments + failedPayments) * 100,
  };
}
```

### 4. Add DAU/MAU (20 minutes)

```typescript
@Get('user-activity')
async getUserActivity(@CurrentUserRole() role: string) {
  if (role !== 'admin') throw new ForbiddenException();

  const now = new Date();
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [dau, mau, totalUsers] = await Promise.all([
    prisma.user.count({ where: { lastLoginAt: { gte: dayAgo } } }),
    prisma.user.count({ where: { lastLoginAt: { gte: monthAgo } } }),
    prisma.user.count(),
  ]);

  return {
    dau,
    mau,
    totalUsers,
    dauMauRatio: (dau / mau) * 100,
    mauPercentage: (mau / totalUsers) * 100,
  };
}
```

---

## 🎨 Code Quality Improvements

### Extract Common Patterns

#### Helper: Date Filter Builder

```typescript
// shared/date-filter.helpers.ts
export function buildDateFilter(
  startDate?: Date,
  endDate?: Date,
  field: string = 'createdAt',
) {
  const dateFilter = {};
  if (startDate) dateFilter['gte'] = startDate;
  if (endDate) dateFilter['lte'] = endDate;
  return Object.keys(dateFilter).length > 0 ? { [field]: dateFilter } : {};
}
```

#### Helper: Query Optimization

```typescript
// shared/analytics-cache.service.ts
@Injectable()
export class AnalyticsCacheService {
  private cache = new Map<string, { data: any; expires: number }>();

  get(key: string) {
    const cached = this.cache.get(key);
    if (cached && cached.expires > Date.now()) {
      return cached.data;
    }
    return null;
  }

  set(key: string, data: any, ttlSeconds: number = 300) {
    this.cache.set(key, {
      data,
      expires: Date.now() + ttlSeconds * 1000,
    });
  }
}
```

---

## 📊 Comparison with Admin Analytics

**Admin Module has**: `AdminAnalyticsService` (separate from core `AnalyticsService`)

**Duplication Found**:

- Both have `getPlatformOverview()` / `getPlatformAnalytics()`
- Both calculate user growth
- Both track engagement

**Recommendation**:

- Merge into single Analytics module
- Use role guards to control access
- Avoid duplication between admin and analytics

---

## 🎯 Proposed Route Structure (After Cleanup)

```
/api/analytics/
  GET  /health                       # Health check (public)
  GET  /platform                     # Platform overview (admin)
  GET  /platform/revenue             # Revenue metrics (admin)
  GET  /platform/retention           # Retention/churn (admin)
  GET  /platform/activity            # DAU/MAU (admin)
  GET  /therapist                    # Therapist stats (therapist/admin)
  GET  /therapist/:id/performance    # Individual performance (therapist/admin)
  GET  /therapist/:id/benchmarking   # Compare to peers (therapist/admin)
  GET  /client                       # Client progress (client/therapist/admin)
  GET  /client/:id/journey           # Client journey (client/therapist/admin)
  GET  /meetings                     # Meeting quality metrics (admin)
  GET  /messaging                    # Messaging analytics (admin)
  GET  /communities                  # Community health (admin/moderator)
  GET  /communities/:id              # Specific community (admin/moderator)
  GET  /mental-health                # Mental health trends (admin)
  GET  /reviews                      # Review analytics (admin)
  GET  /notifications                # Notification effectiveness (admin)
```

---

## 📋 Summary of Findings

### ✅ What's Working

- Basic platform, therapist, and client analytics
- Role-based access control (mostly)
- Date range filtering
- Good error handling
- Proper logging

### ❌ What's Broken

- Role check bug (`'user'` should be `'client'`)
- Raw SQL injection risk
- No health endpoint
- Missing pagination

### ⚠️ What Needs Improvement

- 542-line service file (too big)
- 30+ queries per request (slow)
- No caching (inefficient)
- Repetitive code (DRY violations)
- Limited analytics coverage (~30% of potential)

### 🚀 Quick Wins Available

- Add health endpoint (5 min)
- Fix role bug (2 min)
- Add revenue basics (30 min)
- Add DAU/MAU (20 min)
- Extract helpers (1 hour)

---

## 💡 Next Steps

**Immediate** (Today):

1. Fix role check bug
2. Add health endpoint
3. Extract date filter helper
4. Fix raw SQL

**Short-term** (This Week): 5. Add revenue analytics 6. Add DAU/MAU tracking 7. Optimize query count 8. Add caching

**Medium-term** (This Month): 9. Restructure into nested folders 10. Add meeting quality metrics 11. Add mental health trends 12. Split large service file

**Would you like me to start implementing these fixes now?**
