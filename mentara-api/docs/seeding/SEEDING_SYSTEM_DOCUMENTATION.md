# Mentara Seeding System Documentation

**Version**: 2.0  
**Date**: October 14, 2025  
**Status**: Production-Ready

---

## 📖 Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Architecture](#architecture)
4. [Configuration](#configuration)
5. [Advanced Usage](#advanced-usage)
6. [Troubleshooting](#troubleshooting)

---

## 🌱 Overview

The Mentara Seeding System is an intelligent, idempotent database seeding solution that ensures your database always has the minimum required data for comprehensive testing.

### Key Features

**✅ Idempotent** - Run multiple times safely, never creates duplicates  
**✅ Smart** - Only adds missing data, never bloats database  
**✅ Deterministic** - Same entity always gets same data  
**✅ Complete** - Covers all 33 database models  
**✅ Fast** - Skips satisfied requirements (1-2s)  
**✅ Tested** - Frontend-ready realistic data

### Why Table-Based?

Previous seeding systems were role-based (client/therapist) which didn't cover all tables. Our new approach:
- One enricher per database table
- Comprehensive coverage (18 enrichers)
- Clear dependencies
- Easy to maintain and extend

---

## 🚀 Quick Start

### Installation

Already included! Just use the database:

```bash
# 1. Reset database and seed
npm run db:reset

# 2. Or just seed existing database
npm run db:seed
```

### Basic Usage

```bash
# Smart seeding (recommended)
npm run db:seed
```

**What it does**:
1. Checks if database is empty
2. Creates base data if needed (users, communities)
3. Runs 18 enrichers to ensure minimums
4. Verifies all requirements met
5. Exits

**Time**:
- First run (empty): ~25-35 seconds
- Subsequent runs (satisfied): ~1-2 seconds

### Common Scenarios

#### Scenario 1: Fresh Project Setup
```bash
npm run db:reset  # Drops DB, migrates, seeds
```
**Result**: Fully populated database ready for testing

#### Scenario 2: After Testing (Some Data Deleted)
```bash
npm run db:seed  # Fills gaps only
```
**Result**: Missing data restored, existing data untouched

#### Scenario 3: Check Current State
```bash
SEED_AUDIT=true npm run db:seed
```
**Result**: Shows what's missing without making changes

---

## 🏗️ Architecture

### System Components

```
prisma/
├── seed.ts                    Main entry point
└── seed/
    ├── config.ts              Base data configuration
    ├── generators/            Base data generators
    │   ├── users.ts           Creates initial users
    │   ├── communities.ts     Creates communities
    │   ├── relationships.ts   Creates initial relationships
    │   ├── content.ts         Creates initial content
    │   └── therapy.ts         Creates initial therapy data
    ├── fixtures/              Test account definitions
    └── dynamic/               Dynamic enrichment system
        ├── hybrid-seed-orchestrator.ts    Main orchestrator
        ├── minimum-requirements.ts        Configuration
        ├── enrichers/         18 table enrichers
        │   ├── base-enricher.ts          Base class
        │   ├── memberships-enricher.ts   (Tier 1)
        │   ├── relationships-enricher.ts (Tier 1)
        │   ├── availability-enricher.ts  (Tier 1)
        │   ├── assessments-enricher.ts   (Tier 2)
        │   ├── posts-enricher.ts         (Tier 2)
        │   ├── moderator-assignments-enricher.ts (Tier 2)
        │   ├── comments-enricher.ts      (Tier 3)
        │   ├── hearts-enricher.ts        (Tier 3)
        │   ├── meetings-enricher.ts      (Tier 4)
        │   ├── worksheets-enricher.ts    (Tier 4)
        │   ├── messages-enricher.ts      (Tier 4)
        │   ├── reviews-enricher.ts       (Tier 5)
        │   ├── message-interactions-enricher.ts (Tier 5)
        │   ├── rooms-enricher.ts         (Tier 5)
        │   ├── notifications-enricher.ts (Tier 5)
        │   ├── reports-enricher.ts       (Tier 6)
        │   ├── user-blocks-enricher.ts   (Tier 6)
        │   └── payments-enricher.ts      (Tier 6 - placeholder)
        └── utils/
            └── deterministic-random.ts    Seeded randomness
```

### Execution Flow

```
START
  ↓
[Audit Database]
  ↓
Is Empty? ──Yes→ [Create Base Data]
  ↓ No              ↓
  └────────────────→┘
  ↓
[Run 18 Enrichers in Tier Order]
  ↓
[Verify All Requirements]
  ↓
[Display Summary]
  ↓
END
```

### Enricher Tiers

**Tier 1 - Foundation** (Can run in parallel):
- Memberships (Users → Communities)
- Relationships (Clients ↔ Therapists)
- Availability (Therapists → Schedules)

**Tier 2 - Content** (Depends on Tier 1):
- Assessments (Clients → Pre-assessments)
- Posts (Users + Memberships → Posts)
- Moderators (Moderators → Communities)

**Tier 3 - Engagement** (Depends on Tier 2):
- Comments (Users + Posts → Comments)
- Hearts (Users + Posts/Comments → Likes)

**Tier 4 - Therapy** (Depends on relationships):
- Meetings (Relationships → Sessions + Notes)
- Worksheets (Therapists → Materials + Assignments)
- Messages (Users → Conversations)

**Tier 5 - Interactions** (Depends on Tier 4):
- Reviews (Completed Meetings → Reviews)
- Reactions (Messages → Emoji reactions)
- Rooms (Video Meetings → Chat rooms)
- Notifications (Various → Alerts)

**Tier 6 - System** (Edge cases):
- Reports (Moderation testing)
- Blocks (Block feature testing)
- Payments (Placeholder for future)

---

## ⚙️ Configuration

### Minimum Requirements

Defined in `prisma/seed/dynamic/minimum-requirements.ts`:

**Per Client**:
```typescript
{
  communityMemberships: 1,    // In at least 1 community
  posts: 5,                   // Active contributor
  comments: 10,               // Engaged participant
  heartsGiven: 3,             // Shows engagement
  conversations: 2,           // Has social connections
  messagesPerConversation: 5, // Active in chats
  assessments: 1,             // Completed intake
  meetingsIfTherapist: 3,     // Regular sessions (if matched)
  worksheetsIfTherapist: 1,   // Has assignments (if matched)
  notifications: 3,           // Receives alerts
}
```

**Per Therapist**:
```typescript
{
  clientRelationships: 2,     // Has active clients
  availabilityDays: 3,        // Available 3 days/week
  posts: 2,                   // Professional contributions
  comments: 5,                // Provides guidance
  meetings: 4,                // Conducted sessions
  worksheetsCreated: 3,       // Has materials
  sessionNotes: 2,            // Documents sessions
  reviews: 1,                 // Has feedback
  notifications: 3,           // Receives alerts
}
```

**Per Community**:
```typescript
{
  members: 8,                 // Active community
  posts: 10,                  // Regular content
  moderators: 1,              // Has moderation
}
```

### Environment Variables

Control seeding behavior via environment variables:

```bash
# Verbose output (shows detailed progress)
SEED_VERBOSE=true npm run db:seed

# Audit only (no database changes)
SEED_AUDIT=true npm run db:seed

# Force base data recreation (rare)
SEED_FORCE=true npm run db:seed
```

---

## 🎓 Advanced Usage

### Understanding Idempotency

The system is safe to run multiple times:

**Run 1** (Empty database):
```bash
$ npm run db:seed
📦 Creating base data... ✅ 837 items created
```

**Run 2** (Database has data):
```bash
$ npm run db:seed
✅ All requirements satisfied! (1.2s)
```

**Run 3** (Someone deleted some posts):
```bash
$ npm run db:seed
✨ Adding 7 missing posts... ✅
```

### Deterministic Data

Same entity always gets same data:

```typescript
// Client ID "abc-123" always gets:
// - Posts in same communities
// - Same comment templates
// - Same conversation partners

// Because we use seeded random:
const random = createSeededRandom("abc-123", "posts");
```

**Benefits**:
- Reproducible bugs
- Consistent testing
- Easier debugging

### Extending the System

To add a new enricher:

1. Create enricher file:
```typescript
// prisma/seed/dynamic/enrichers/your-enricher.ts
import { BaseEnricher } from './base-enricher';

export class YourEnricher extends BaseEnricher {
  constructor(prisma: PrismaClient) {
    super(prisma, 'YourTable');
  }

  async enrich(): Promise<EnrichmentResult> {
    // Your logic here
  }
}
```

2. Add to orchestrator:
```typescript
// hybrid-seed-orchestrator.ts
import { YourEnricher } from './enrichers/your-enricher';

// Add to enrichers array in appropriate tier
{ name: 'YourFeature', enricher: new YourEnricher(prisma) },
```

3. Document it in `SEEDING_ENRICHER_REFERENCE.md`

---

## 🛠️ Troubleshooting

### Common Issues

**Issue**: "Database already seeded"
**Solution**: This is normal! The system detected existing data and skipped base generation.

**Issue**: "Some requirements not satisfied"
**Solution**: Check which enricher failed. It will show in the output.

**Issue**: "Seeding is slow"
**Solution**: First run is slow (~30s). Subsequent runs are fast (~2s).

**Issue**: "Duplicate data"
**Solution**: This shouldn't happen. File a bug if you see duplicates.

### Getting Help

1. Check enricher reference for specific table
2. Review architecture docs
3. Enable verbose mode: `SEED_VERBOSE=true npm run db:seed`
4. Check database manually with Prisma Studio

---

## 📊 Expected Results

### After Fresh Seed

**Users**: 25-30 (mix of clients, therapists, admins, moderators)  
**Communities**: 10-15 (mental health + general)  
**Posts**: 150-200 (varied content)  
**Comments**: 300-400 (engaged discussions)  
**Meetings**: 40-60 (past + future mix)  
**Messages**: 200-300 (realistic conversations)  
**Reviews**: 10-15 (positive feedback)

**Total items**: ~800-900

**Duration**: 25-35 seconds

### After Subsequent Runs

If all requirements satisfied:
- **Items added**: 0
- **Duration**: 1-2 seconds
- **Output**: "✅ All requirements satisfied!"

---

## 🎯 Best Practices

### When to Seed

**✅ DO**: Run after `db:reset`  
**✅ DO**: Run after deleting test data  
**✅ DO**: Run before frontend testing  
**❌ DON'T**: Run in production  
**❌ DON'T**: Run on real user data

### Development Workflow

```bash
# 1. Make schema changes
npx prisma migrate dev

# 2. Reset and seed
npm run db:reset

# 3. Test frontend
npm run start:dev (in web folder)

# 4. If you delete data during testing
npm run db:seed  # Fills gaps!
```

---

## 📚 Related Documentation

- **[Enricher Reference](./SEEDING_ENRICHER_REFERENCE.md)** - Details on all 18 enrichers
- **[Architecture](./SEEDING_ARCHITECTURE.md)** - System design and patterns
- **[Troubleshooting](./SEEDING_TROUBLESHOOTING.md)** - Common issues and solutions

---

**Last Updated**: October 14, 2025  
**Maintainer**: Mentara Development Team

