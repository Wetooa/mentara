# Dynamic Seeding - Refactor Plan

**Date**: October 14, 2025  
**Goal**: Table-based enrichers integrated with legacy seeding  
**Approach**: Hybrid system (legacy seed → dynamic enrichment)

---

## 🎯 REQUIREMENTS (Updated)

### 1. **Combine with Legacy**

Run existing seed generators first, then enrich:

```
Flow:
1. Run legacy generators (creates base data)
2. Run dynamic enrichers (fills gaps table-by-table)
3. Verify all minimums met
```

### 2. **Table-Based Enrichers**

One enricher per database table:

```
enrichers/
├── posts-enricher.ts          ← ALL posts (client + therapist)
├── comments-enricher.ts        ← ALL comments
├── meetings-enricher.ts        ← ALL meetings
├── memberships-enricher.ts     ← ALL community memberships
├── relationships-enricher.ts   ← Client-therapist relationships
├── worksheets-enricher.ts      ← ALL worksheets
├── messages-enricher.ts        ← ALL messages
├── availability-enricher.ts    ← Therapist availability
├── assessments-enricher.ts     ← Pre-assessments
├── reviews-enricher.ts         ← Therapist reviews
├── hearts-enricher.ts          ← Post/comment likes
└── notifications-enricher.ts   ← User notifications
```

### 3. **Every Table Covered**

Need enrichers for ALL tables that need dynamic data

---

## 📊 DATABASE TABLES (Need Enrichers)

### **User & Profile Tables**:

- ✅ User (handled by legacy)
- ✅ Client (handled by legacy)
- ✅ Therapist (handled by legacy)
- ✅ Admin (handled by legacy)
- ✅ Moderator (handled by legacy)

### **Community Tables**:

- 🆕 Community (legacy creates, enricher adds members)
- 🆕 CommunityMember (enricher ensures minimums)
- 🆕 Post (enricher ensures per-user minimums)
- 🆕 Comment (enricher ensures per-user minimums)
- 🆕 Heart (enricher ensures engagement)

### **Therapy Tables**:

- 🆕 ClientTherapist (enricher ensures relationships)
- 🆕 Meeting (enricher ensures per-relationship minimums)
- 🆕 MeetingNotes (enricher ensures completed meetings have notes)
- 🆕 TherapistAvailability (enricher ensures schedule)
- 🆕 Worksheet (enricher ensures therapist has materials)
- 🆕 WorksheetAssignment (enricher ensures clients get worksheets)

### **Communication Tables**:

- 🆕 Conversation (enricher ensures per-user minimums)
- 🆕 ConversationParticipant (enricher with conversations)
- 🆕 Message (enricher ensures conversation activity)

### **Assessment Tables**:

- 🆕 PreAssessment (enricher ensures clients complete)
- 🆕 PreAssessmentAnswer (enricher with assessment)

### **Review & Engagement Tables**:

- 🆕 Review (enricher ensures therapists get reviews)
- 🆕 Notification (enricher ensures users get notifications)

### **Payment Tables** (Skip for now - billing not ready):

- ⏭️ Payment
- ⏭️ Invoice

### **Other Tables**:

- 🆕 AuditLog (enricher ensures admin activity)

**Total Enrichers Needed**: ~15

---

## 🏗️ NEW ARCHITECTURE

### **Folder Structure**:

```
prisma/
├── seed.ts (UPDATED - now runs hybrid flow)
├── seed-dynamic.ts (standalone dynamic)
└── seed/
    ├── config.ts (existing)
    ├── generators/ (existing - legacy)
    ├── fixtures/ (existing)
    ├── dynamic/
    │   ├── minimum-requirements.ts (UPDATED)
    │   ├── dynamic-seed-orchestrator.ts (UPDATED)
    │   ├── hybrid-seed-orchestrator.ts [NEW!]
    │   ├── enrichers/ (REFACTORED)
    │   │   ├── posts-enricher.ts [NEW!]
    │   │   ├── comments-enricher.ts [NEW!]
    │   │   ├── meetings-enricher.ts [NEW!]
    │   │   ├── memberships-enricher.ts [NEW!]
    │   │   ├── relationships-enricher.ts [NEW!]
    │   │   ├── worksheets-enricher.ts [NEW!]
    │   │   ├── messages-enricher.ts [NEW!]
    │   │   ├── availability-enricher.ts [NEW!]
    │   │   ├── assessments-enricher.ts [NEW!]
    │   │   ├── reviews-enricher.ts [NEW!]
    │   │   ├── hearts-enricher.ts [NEW!]
    │   │   └── notifications-enricher.ts [NEW!]
    │   ├── validators/ (table-specific)
    │   └── utils/
    │       ├── deterministic-random.ts (existing)
    │       └── enricher-helpers.ts [NEW!]
    └── legacy/ (existing)
```

---

## 🔄 HYBRID FLOW

### **Updated seed.ts**:

```typescript
async function main() {
  console.log('🌱 Mentara Hybrid Database Seeding');

  // PHASE 1: Legacy Generators (base data)
  console.log('\n📦 Phase 1: Creating base data...');
  await generateUsers(prisma, config.users);
  await generateCommunities(prisma, config.communities);
  await generateRelationships(prisma, config.relationships);
  await generateContent(prisma, config.content);
  await generateTherapyData(prisma, config.therapy);

  // PHASE 2: Dynamic Enrichment (fill gaps)
  console.log('\n✨ Phase 2: Enriching data to meet minimums...');
  const orchestrator = new HybridSeedOrchestrator(requirements);
  await orchestrator.enrichAllTables(prisma);

  // PHASE 3: Verification
  console.log('\n✅ Phase 3: Verifying all requirements...');
  await orchestrator.verifyAllRequirements(prisma);
}
```

---

## 📋 TABLE-BASED ENRICHERS

### **Structure for Each Enricher**:

```typescript
// Example: posts-enricher.ts
export class PostsEnricher {
  constructor(private prisma: PrismaClient) {}

  /**
   * Ensure user has minimum posts
   */
  async ensureMinimumPosts(userId: string, minPosts: number): Promise<number> {
    // 1. Check current count
    const current = await this.prisma.post.count({
      where: { userId },
    });

    // 2. Calculate missing
    const missing = minPosts - current;
    if (missing <= 0) return 0;

    // 3. Get user's communities
    const memberships = await this.getMemberships(userId);

    // 4. Create missing posts
    for (let i = 0; i < missing; i++) {
      await this.createPost(userId, memberships);
    }

    return missing;
  }

  /**
   * Ensure post has minimum comments
   */
  async ensurePostHasComments(
    postId: string,
    minComments: number,
  ): Promise<number> {
    // Similar pattern...
  }
}
```

---

## 🔢 ENRICHER PRIORITY ORDER

Must run in dependency order:

1. **Tier 1** (No dependencies):

   - memberships-enricher (users → communities)
   - relationships-enricher (clients → therapists)
   - availability-enricher (therapists → schedule)

2. **Tier 2** (Depends on Tier 1):

   - posts-enricher (users + memberships → posts)
   - assessments-enricher (clients → assessments)

3. **Tier 3** (Depends on Tier 2):

   - comments-enricher (users + posts → comments)
   - hearts-enricher (users + posts/comments → hearts)

4. **Tier 4** (Depends on relationships):

   - meetings-enricher (relationships + availability → meetings)
   - worksheets-enricher (therapists → worksheets)
   - messages-enricher (users → conversations)

5. **Tier 5** (Depends on Tier 4):
   - reviews-enricher (meetings → reviews)
   - notifications-enricher (various → notifications)

---

## 📝 MINIMUM REQUIREMENTS (Table-Based)

```typescript
export const TABLE_MINIMUM_REQUIREMENTS = {
  // Per-user minimums
  perClient: {
    communityMemberships: 1,
    posts: 5,
    comments: 10,
    hearts: 3,
    conversations: 2,
    messagesPerConversation: 5,
    completedAssessments: 2,
  },

  perTherapist: {
    clientRelationships: 2,
    communityMemberships: 1,
    posts: 2,
    comments: 5,
    availabilityDays: 3,
    meetings: 4,
    worksheets: 3,
    sessionNotes: 2,
    reviewsReceived: 1,
  },

  // Per-entity minimums
  perCommunity: {
    members: 8,
    posts: 10,
    moderators: 1,
  },

  perPost: {
    comments: 2,
    hearts: 1,
  },

  perMeeting: {
    notesIfCompleted: true,
  },

  perClientTherapistRelationship: {
    meetings: 3,
    worksheets: 1,
  },
};
```

---

## 🔨 IMPLEMENTATION PLAN

### **Phase 1: Refactor Structure** (~30 min)

1. ✅ Delete old client-data-enricher.ts
2. ✅ Delete old therapist-data-enricher.ts
3. ✅ Create all 12+ table-based enrichers (skeletons)
4. ✅ Update minimum-requirements.ts (table-based)
5. ✅ Create hybrid-seed-orchestrator.ts

### **Phase 2: Implement Enrichers** (~3 hours)

Priority order:

1. memberships-enricher.ts
2. relationships-enricher.ts
3. availability-enricher.ts
4. posts-enricher.ts
5. comments-enricher.ts
6. meetings-enricher.ts
7. worksheets-enricher.ts
8. messages-enricher.ts
9. assessments-enricher.ts
10. reviews-enricher.ts
11. hearts-enricher.ts
12. notifications-enricher.ts

### **Phase 3: Integration** (~30 min)

1. ✅ Update seed.ts to run hybrid flow
2. ✅ Update dynamic-seed-orchestrator.ts
3. ✅ Add npm scripts
4. ✅ Test full flow

### **Phase 4: Testing** (~30 min)

1. Run `npm run db:reset`
2. Run `npm run db:seed` (hybrid)
3. Verify all minimums
4. Run again (verify idempotent)

**Total Estimated Time**: ~4.5 hours

---

## 🎯 EXPECTED FLOW

### **Command**: `npm run db:seed`

```bash
🌱 Mentara Hybrid Database Seeding
====================================

📦 PHASE 1: Base Data Generation (Legacy)
  👥 Creating users... ✅ 25 users
  🏘️  Creating communities... ✅ 10 communities
  🤝 Creating relationships... ✅ 15 relationships
  💬 Creating content... ✅ 40 posts, 80 comments
  🩺 Creating therapy data... ✅ 20 meetings, 15 worksheets

✨ PHASE 2: Dynamic Enrichment (Table-by-Table)
  📊 Auditing database...
     - 25 users, 40 posts, 80 comments

  🔍 Identifying gaps...
     - Client 1: needs 3 posts, 5 comments
     - Therapist 2: needs 1 client, 2 meetings

  ✨ Enriching tables...
     [1/12] Memberships... ✅ +5
     [2/12] Relationships... ✅ +3
     [3/12] Availability... ✅ +6
     [4/12] Posts... ✅ +15
     [5/12] Comments... ✅ +25
     [6/12] Meetings... ✅ +10
     [7/12] Worksheets... ✅ +8
     [8/12] Messages... ✅ +50
     [9/12] Assessments... ✅ +5
     [10/12] Reviews... ✅ +3
     [11/12] Hearts... ✅ +20
     [12/12] Notifications... ✅ +12

✅ PHASE 3: Verification
  ✅ All 25 clients meet minimums
  ✅ All 5 therapists meet minimums
  ✅ All 10 communities meet minimums

🎉 Seeding complete! Duration: 12.3s
```

---

## 📁 ENRICHER FILES (12+)

### **Tier 1 - Relationships** (No dependencies):

```typescript
1. memberships-enricher.ts
   - ensureUserInCommunities(userId, minCount)
   - ensureCommunityHasMembers(communityId, minCount)

2. relationships-enricher.ts
   - ensureClientHasTherapist(clientId)
   - ensureTherapistHasClients(therapistId, minCount)

3. availability-enricher.ts
   - ensureTherapistAvailability(therapistId, minDays)
```

### **Tier 2 - Content** (Depends on memberships):

```typescript
4. posts-enricher.ts
   - ensureUserHasPosts(userId, minPosts)
   - ensureCommunityHasPosts(communityId, minPosts)

5. assessments-enricher.ts
   - ensureClientHasAssessments(clientId, minCount)
```

### **Tier 3 - Engagement** (Depends on content):

```typescript
6. comments-enricher.ts
   - ensureUserHasComments(userId, minComments)
   - ensurePostHasComments(postId, minComments)

7. hearts-enricher.ts
   - ensureUserGivesHearts(userId, minHearts)
   - ensurePostHasHearts(postId, minHearts)
```

### **Tier 4 - Therapy** (Depends on relationships):

```typescript
8. meetings-enricher.ts
   - ensureRelationshipHasMeetings(relationshipId, minMeetings)
   - ensureMeetingHasNotes(meetingId)

9. worksheets-enricher.ts
   - ensureTherapistHasWorksheets(therapistId, minWorksheets)
   - ensureClientHasAssignments(clientId, minAssignments)

10. messages-enricher.ts
    - ensureUserHasConversations(userId, minConversations)
    - ensureConversationHasMessages(conversationId, minMessages)
```

### **Tier 5 - Follow-up** (Depends on therapy):

```typescript
11. reviews-enricher.ts
    - ensureTherapistHasReviews(therapistId, minReviews)
    - ensureCompletedMeetingsGetReviews(rate)

12. notifications-enricher.ts
    - ensureUserHasNotifications(userId, minNotifications)
```

---

## 🔄 ENRICHER INTERFACE (Standard)

Every enricher follows this pattern:

```typescript
export interface TableEnricher {
  // Core enrichment method
  enrich(prisma: PrismaClient): Promise<EnrichmentResult>;

  // Validation
  validate(prisma: PrismaClient): Promise<ValidationResult>;

  // Statistics
  getStats(prisma: PrismaClient): Promise<TableStats>;
}

export class PostsEnricher implements TableEnricher {
  async enrich(prisma: PrismaClient): Promise<EnrichmentResult> {
    // Main enrichment logic
  }

  async ensureUserHasPosts(userId: string, minPosts: number): Promise<number> {
    // Specific enrichment method
  }

  async ensureCommunityHasPosts(
    communityId: string,
    minPosts: number,
  ): Promise<number> {
    // Specific enrichment method
  }
}
```

---

## 💻 HYBRID ORCHESTRATOR

```typescript
export class HybridSeedOrchestrator {
  /**
   * Run full hybrid seeding (legacy + dynamic)
   */
  async runHybridSeed(
    prisma: PrismaClient,
    mode: 'light' | 'medium' | 'heavy',
  ): Promise<HybridSeedReport> {
    // Phase 1: Legacy generators
    console.log('📦 Phase 1: Base data generation...');
    const legacyResult = await this.runLegacyGenerators(prisma, mode);

    // Phase 2: Dynamic enrichment
    console.log('✨ Phase 2: Dynamic enrichment...');
    const enrichmentResult = await this.runTableEnrichment(prisma, mode);

    // Phase 3: Verification
    console.log('✅ Phase 3: Verification...');
    const verification = await this.verifyAllRequirements(prisma);

    return {
      legacy: legacyResult,
      enrichment: enrichmentResult,
      verification,
      satisfied: verification.allSatisfied,
    };
  }

  /**
   * Run table-by-table enrichment
   */
  async runTableEnrichment(
    prisma: PrismaClient,
    mode: string,
  ): Promise<EnrichmentReport> {
    const enrichers = [
      new MembershipsEnricher(prisma),
      new RelationshipsEnricher(prisma),
      new AvailabilityEnricher(prisma),
      new PostsEnricher(prisma),
      new CommentsEnricher(prisma),
      new MeetingsEnricher(prisma),
      new WorksheetsEnricher(prisma),
      new MessagesEnricher(prisma),
      new AssessmentsEnricher(prisma),
      new ReviewsEnricher(prisma),
      new HeartsEnricher(prisma),
      new NotificationsEnricher(prisma),
    ];

    const results = [];
    for (let i = 0; i < enrichers.length; i++) {
      const enricher = enrichers[i];
      console.log(
        `  [${i + 1}/${enrichers.length}] ${enricher.constructor.name}...`,
      );
      const result = await enricher.enrich(prisma);
      results.push(result);
    }

    return { enrichers: results };
  }
}
```

---

## 📊 TABLE MINIMUM REQUIREMENTS (Updated)

```typescript
export const TABLE_REQUIREMENTS = {
  // User-specific minimums (checked per user)
  userMinimums: {
    client: {
      table: 'Client',
      checks: [
        { table: 'CommunityMember', field: 'userId', min: 1 },
        { table: 'Post', field: 'userId', min: 5 },
        { table: 'Comment', field: 'userId', min: 10 },
        { table: 'Heart', field: 'userId', min: 3 },
        { table: 'Conversation', field: 'participants.userId', min: 2 },
        { table: 'PreAssessment', field: 'userId', min: 2 },
      ],
    },
    therapist: {
      table: 'Therapist',
      checks: [
        { table: 'ClientTherapist', field: 'therapistId', min: 2 },
        { table: 'CommunityMember', field: 'userId', min: 1 },
        { table: 'Post', field: 'userId', min: 2 },
        { table: 'TherapistAvailability', field: 'therapistId', min: 3 },
        { table: 'Meeting', field: 'therapistId', min: 4 },
        { table: 'Worksheet', field: 'therapistId', min: 3 },
      ],
    },
  },

  // Entity-specific minimums (checked per entity)
  entityMinimums: {
    community: [
      { table: 'CommunityMember', field: 'communityId', min: 8 },
      { table: 'Post', field: 'communityId', min: 10 },
    ],
    post: [
      { table: 'Comment', field: 'postId', min: 2 },
      { table: 'Heart', field: 'postId', min: 1 },
    ],
    relationship: [
      { table: 'Meeting', field: 'both', min: 3 },
      { table: 'WorksheetAssignment', field: 'clientId', min: 1 },
    ],
  },
};
```

---

## ⏱️ IMPLEMENTATION TIMELINE

### **Session 1** (~2 hours):

- Refactor structure
- Create 4 core enrichers (memberships, relationships, posts, comments)
- Test basic flow

### **Session 2** (~2 hours):

- Create 4 therapy enrichers (meetings, worksheets, availability, assessments)
- Create 2 engagement enrichers (hearts, reviews)
- Test therapy flow

### **Session 3** (~1 hour):

- Create 2 communication enrichers (messages, notifications)
- Full integration testing
- Documentation

**Total**: ~5 hours for complete table-based system

---

## 🎯 IMMEDIATE NEXT STEPS

### **Step 1**: Refactor existing enrichers (30 min)

- Delete client-data-enricher.ts
- Delete therapist-data-enricher.ts
- Create table-based skeleton files

### **Step 2**: Implement core 4 enrichers (1 hour)

- memberships-enricher.ts
- relationships-enricher.ts
- posts-enricher.ts
- comments-enricher.ts

### **Step 3**: Create hybrid orchestrator (30 min)

- hybrid-seed-orchestrator.ts
- Update seed.ts to use it

### **Step 4**: Test (30 min)

- Run full seed
- Verify idempotent
- Check all minimums

---

## 💭 RECOMMENDATION

**Approach this in phases**:

1. **Today**: Build core 4 enrichers + hybrid orchestrator (2 hours)
2. **Next**: Add remaining 8 enrichers (2 hours)
3. **Final**: Polish & test (1 hour)

**OR**

**Do it all now** (~4.5 hours total) - I can do this!

**What would you prefer?** 🤔
