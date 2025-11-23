# Dynamic Seeding System - Design Plan

**Date**: October 14, 2025  
**Goal**: Idempotent, smart seeding that ensures minimum data requirements

---

## 🎯 REQUIREMENTS

### Core Principles:

1. **Idempotent** - Can run multiple times safely (no duplicates)
2. **Smart** - Only adds missing data
3. **Minimum guarantees** - Each entity has minimum relationships
4. **Frontend-ready** - Data structure supports all UI features
5. **Deterministic** - Same users always get same data patterns

---

## 📋 MINIMUM DATA REQUIREMENTS

### **Per Client**:

- ✅ At least **1 community membership**
- ✅ At least **5 posts** across communities
- ✅ At least **10 comments** on others' posts
- ✅ At least **3 hearts/likes** given
- ✅ At least **1 therapist relationship** (if matching exists)
- ✅ At least **3 meetings** (if has therapist)
- ✅ At least **2 completed assessments**
- ✅ At least **1 worksheet assigned** (if has therapist)
- ✅ At least **5 messages** in conversations

### **Per Therapist**:

- ✅ At least **2 client relationships**
- ✅ At least **1 community** (professional or support)
- ✅ At least **2 posts** (advice/support)
- ✅ At least **5 comments** (professional guidance)
- ✅ **Availability schedule** (at least 3 days/week)
- ✅ At least **4 meetings** across clients
- ✅ At least **3 worksheets** created
- ✅ At least **2 session notes** written
- ✅ At least **1 review** received

### **Per Community**:

- ✅ At least **8 members**
- ✅ At least **10 posts**
- ✅ At least **1 moderator**
- ✅ Activity within last 30 days

### **Per Admin/Moderator**:

- ✅ At least **1 community** moderated
- ✅ At least **3 moderation actions**
- ✅ Recent login activity

---

## 🏗️ ARCHITECTURE

### New Structure:

```
prisma/seed/
├── seed.ts (main entry point)
├── config.ts (existing - keep)
├── dynamic/
│   ├── dynamic-seed-orchestrator.ts  [NEW!]
│   ├── validators/
│   │   ├── client-data-validator.ts
│   │   ├── therapist-data-validator.ts
│   │   ├── community-data-validator.ts
│   │   └── user-data-validator.ts
│   ├── enrichers/
│   │   ├── client-data-enricher.ts
│   │   ├── therapist-data-enricher.ts
│   │   ├── community-data-enricher.ts
│   │   └── content-enricher.ts
│   └── minimum-requirements.ts
├── generators/ (existing - keep)
└── fixtures/ (existing - keep)
```

---

## 🔄 DYNAMIC SEEDING FLOW

### Phase 1: **Audit Existing Data**

```typescript
const audit = await auditDatabase(prisma);
// Returns: { users: 25, clients: 20, posts: 45, ... }
```

### Phase 2: **Identify Gaps**

```typescript
const gaps = await identifyDataGaps(prisma);
// Returns: {
//   client1: { needsPosts: 3, needsMeetings: 1 },
//   therapist2: { needsClients: 1, needsSchedule: true },
//   community3: { needsMembers: 2, needsPosts: 5 }
// }
```

### Phase 3: **Fill Gaps**

```typescript
await fillDataGaps(prisma, gaps);
// Creates only missing data
```

### Phase 4: **Verify**

```typescript
const verification = await verifyMinimumRequirements(prisma);
// Returns: { allSatisfied: true, details: {...} }
```

---

## 💻 IMPLEMENTATION EXAMPLE

### Dynamic Orchestrator:

```typescript
export class DynamicSeedOrchestrator {
  async ensureMinimumData(prisma: PrismaClient): Promise<SeedReport> {
    console.log('🔍 Auditing existing data...');
    const audit = await this.auditDatabase(prisma);

    console.log('📊 Identifying data gaps...');
    const gaps = await this.identifyGaps(prisma, audit);

    console.log('✨ Filling data gaps...');
    await this.fillGaps(prisma, gaps);

    console.log('✅ Verifying requirements...');
    const verification = await this.verify(prisma);

    return {
      audit,
      gaps,
      added: verification.added,
      satisfied: verification.allSatisfied,
    };
  }
}
```

### Client Data Enricher:

```typescript
export class ClientDataEnricher {
  private readonly MIN_POSTS = 5;
  private readonly MIN_COMMENTS = 10;
  private readonly MIN_COMMUNITIES = 1;

  async enrichClient(prisma: PrismaClient, clientId: string): Promise<void> {
    // Check existing data
    const existing = await prisma.client.findUnique({
      where: { userId: clientId },
      include: {
        _count: {
          select: {
            posts: true,
            comments: true,
            communityMembers: true,
          },
        },
      },
    });

    // Add missing posts
    const missingPosts = this.MIN_POSTS - (existing._count.posts ?? 0);
    if (missingPosts > 0) {
      await this.createPosts(prisma, clientId, missingPosts);
    }

    // Add missing comments
    const missingComments = this.MIN_COMMENTS - (existing._count.comments ?? 0);
    if (missingComments > 0) {
      await this.createComments(prisma, clientId, missingComments);
    }

    // Add missing community memberships
    const missingMemberships =
      this.MIN_COMMUNITIES - (existing._count.communityMembers ?? 0);
    if (missingMemberships > 0) {
      await this.joinCommunities(prisma, clientId, missingMemberships);
    }
  }
}
```

---

## 🎲 SMART FEATURES

### 1. **Deterministic Random**

```typescript
// Use user ID as seed for consistent data generation
function seededRandom(userId: string, salt: string): number {
  const hash = createHash('md5')
    .update(userId + salt)
    .digest('hex');
  return parseInt(hash.slice(0, 8), 16) / 0xffffffff;
}

// Client 1 always gets same posts/comments
const postTopics = selectRandomTopics(clientId, 'posts', 5);
```

### 2. **Relationship-Aware**

```typescript
// Only create meetings if client-therapist relationship exists
if (await hasTherapist(clientId)) {
  await ensureMinimumMeetings(clientId, 3);
}
```

### 3. **Realistic Timestamps**

```typescript
// Posts spread over last 60 days
// Meetings in past and future
// Comments after post creation
```

### 4. **Progress Tracking**

```typescript
interface SeedProgress {
  phase: string;
  entity: string;
  current: number;
  target: number;
  percentage: number;
}
```

---

## 📊 MINIMUM REQUIREMENTS TABLE

| Entity        | Minimum Relationships                                       |
| ------------- | ----------------------------------------------------------- |
| **Client**    | 1 community, 5 posts, 10 comments, 1 therapist (if matched) |
| **Therapist** | 2 clients, 1 community, 4 meetings, 3 worksheets            |
| **Community** | 8 members, 10 posts                                         |
| **Admin**     | Active (no minimums)                                        |
| **Moderator** | 1 community, 3 actions                                      |
| **Post**      | 2 comments minimum                                          |
| **Meeting**   | Notes if completed                                          |

---

## 🚀 USAGE

### Run anytime:

```bash
npm run db:seed          # Check and fill gaps
npm run db:seed:force    # Reset and full reseed
npm run db:seed:audit    # Just show what's missing
```

### Features:

- ✅ Safe to run multiple times
- ✅ Only adds missing data
- ✅ Deterministic (same results)
- ✅ Frontend testing ready
- ✅ No manual tracking needed

---

## 🎯 NEXT STEPS

1. Create dynamic orchestrator
2. Create validators for each entity type
3. Create enrichers to add missing data
4. Update seed.ts to use new system
5. Test with multiple runs
6. Document seed data patterns

---

**Ready to implement this smart seeding system!** 🌱
