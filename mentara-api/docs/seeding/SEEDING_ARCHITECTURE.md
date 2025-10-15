# Seeding System Architecture

Technical architecture and design patterns for the Mentara seeding system.

---

## System Design

### High-Level Architecture

```
┌─────────────────────────────────────────────┐
│          npm run db:seed                    │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│              seed.ts (Entry Point)          │
│  - Parse environment variables              │
│  - Initialize Prisma client                 │
│  - Orchestrate seeding flow                 │
└──────────────────┬──────────────────────────┘
                   │
       ┌───────────┴───────────┐
       │                       │
       ▼                       ▼
┌──────────────┐        ┌──────────────────┐
│  Base Data   │        │    Dynamic       │
│  Generators  │        │  Enrichment      │
│              │        │                  │
│ - Users      │        │ - 18 Enrichers   │
│ - Communities│        │ - Tier-based     │
│ - Initial    │        │ - Idempotent     │
│   Content    │        │                  │
└──────────────┘        └──────────────────┘
                               │
                   ┌───────────┴───────────┐
                   │                       │
                   ▼                       ▼
          ┌────────────────┐      ┌────────────────┐
          │  Enrichers     │      │  Verification  │
          │  (18 total)    │      │                │
          │                │      │ - Check        │
          │ Tier 1 → 6     │      │   requirements │
          │                │      │ - Report       │
          └────────────────┘      └────────────────┘
```

### Component Layers

**Layer 1: Entry Point**

- `seed.ts` - Main orchestrator
- Environment variable parsing
- Database connection management

**Layer 2: Base Generators**

- `generators/users.ts` - Initial user creation
- `generators/communities.ts` - Community setup
- `generators/relationships.ts` - Basic relationships
- `generators/content.ts` - Initial posts/comments
- `generators/therapy.ts` - Basic therapy data

**Layer 3: Dynamic Enrichment**

- `HybridSeedOrchestrator` - Manages enricher execution
- 18 table-specific enrichers
- Tier-based dependency management

**Layer 4: Utilities**

- `SeededRandom` - Deterministic randomness
- `BaseEnricher` - Common enricher functionality
- Configuration management

---

## Design Patterns

### 1. Strategy Pattern (Enrichers)

Each enricher implements the same interface but with different strategies:

```typescript
interface Enricher {
  enrich(): Promise<EnrichmentResult>;
}

class MembershipsEnricher implements Enricher {
  async enrich() {
    // Strategy for community memberships
  }
}

class PostsEnricher implements Enricher {
  async enrich() {
    // Strategy for post creation
  }
}
```

**Benefits**:

- Easy to add new enrichers
- Consistent interface
- Testable in isolation

### 2. Template Method Pattern (BaseEnricher)

Base class defines algorithm structure, subclasses implement details:

```typescript
abstract class BaseEnricher {
  // Template method
  async enrich(): Promise<EnrichmentResult> {
    const entities = await this.getEntities();
    let added = 0;

    for (const entity of entities) {
      added += await this.enrichEntity(entity); // Subclass implements
    }

    return { itemsAdded: added };
  }

  // Subclass must implement
  protected abstract enrichEntity(entity: any): Promise<number>;
}
```

**Benefits**:

- Code reuse
- Enforces consistent structure
- Common utilities in base class

### 3. Builder Pattern (SeededRandom)

Fluent interface for deterministic random number generation:

```typescript
const random = new SeededRandom('entity-123-context')
  .next() // 0.0 - 1.0
  .nextInt(10) // 0 - 9
  .pickRandom(arr); // Random item from array
```

**Benefits**:

- Deterministic across runs
- Same seed → same sequence
- Reproducible bugs

### 4. Orchestrator Pattern

Coordinates multiple enrichers with dependency management:

```typescript
class HybridSeedOrchestrator {
  async enrichAllTables(prisma: PrismaClient) {
    const enrichers = [
      // Tier 1 (no dependencies)
      { name: 'Memberships', enricher: new MembershipsEnricher(prisma) },

      // Tier 2 (depends on Tier 1)
      { name: 'Posts', enricher: new PostsEnricher(prisma) },

      // ... etc
    ];

    for (const { name, enricher } of enrichers) {
      await enricher.enrich(); // Sequential execution respects dependencies
    }
  }
}
```

**Benefits**:

- Centralized control
- Clear dependency order
- Easy to add/remove enrichers

---

## Dependency Graph

### Visual Representation

```
User (base)
    │
    ├──> Client
    │      ├──> PreAssessment (Tier 2)
    │      └──> ClientTherapist (Tier 1)
    │             └──> Meeting (Tier 4)
    │                    ├──> MeetingNotes (Tier 4)
    │                    ├──> Review (Tier 5)
    │                    └──> Room (Tier 5)
    │
    ├──> Therapist
    │      ├──> TherapistAvailability (Tier 1)
    │      ├──> Worksheet (Tier 4)
    │      └──> ClientTherapist (Tier 1)
    │
    ├──> Moderator
    │      └──> ModeratorCommunity (Tier 2)
    │
    └──> CommunityMember (Tier 1)
            │
            └──> Community
                    ├──> Post (Tier 2)
                    │      ├──> Comment (Tier 3)
                    │      │      └──> Heart (Tier 3)
                    │      └──> Heart (Tier 3)
                    └──> ModeratorCommunity (Tier 2)

Message System (parallel):
    User
      └──> Conversation (Tier 4)
              ├──> ConversationParticipant (Tier 4)
              ├──> Message (Tier 4)
              │      ├──> MessageReaction (Tier 5)
              │      └──> MessageReadReceipt (Tier 5)
              └──> Notification (Tier 5)

System Tables:
    User
      ├──> UserBlock (Tier 6)
      └──> Report (Tier 6)

Meeting
      └──> Payment (Tier 6 - future)
```

### Execution Order

**Tier 1** (Foundation):

1. MembershipsEnricher
2. RelationshipsEnricher
3. AvailabilityEnricher

**Tier 2** (Content): 4. AssessmentsEnricher 5. PostsEnricher 6. ModeratorAssignmentsEnricher

**Tier 3** (Engagement): 7. CommentsEnricher 8. HeartsEnricher

**Tier 4** (Therapy): 9. MeetingsEnricher 10. WorksheetsEnricher 11. MessagesEnricher

**Tier 5** (Interactions): 12. ReviewsEnricher 13. MessageInteractionsEnricher 14. RoomsEnricher 15. NotificationsEnricher

**Tier 6** (System): 16. ReportsEnricher 17. UserBlocksEnricher 18. PaymentsEnricher

---

## Error Handling

### Strategy

Each enricher catches its own errors and reports them:

```typescript
async enrich(): Promise<EnrichmentResult> {
  let added = 0;
  let errors = 0;

  try {
    // Enrichment logic
  } catch (error) {
    errors++;
    console.error(`Error in ${this.tableName}:`, error);
  }

  return {
    table: this.tableName,
    itemsAdded: added,
    errors
  };
}
```

**Principles**:

- Fail gracefully (don't crash entire seeding)
- Log errors but continue
- Report error count in results
- Don't rollback (partially seeded data is okay)

### Error Recovery

If enrichment fails:

1. Error logged with context
2. Partial data may exist
3. Next run will retry missing data
4. Idempotency ensures no duplicates

---

## Performance Optimization

### Strategies

**1. Batch Operations**

```typescript
// ❌ Bad: N queries
for (const item of items) {
  await prisma.post.create({ data: item });
}

// ✅ Good: 1 query
await prisma.post.createMany({ data: items });
```

**2. Early Exit**

```typescript
// Check before processing
const count = await prisma.post.count({ where: { userId } });
if (count >= minPosts) {
  return 0; // Skip entire enricher!
}
```

**3. Selective Queries**

```typescript
// Only query what you need
const users = await prisma.user.findMany({
  select: {
    id: true,
    role: true,
  },
  where: {
    role: 'client',
  },
});
```

**4. Smart Counting**

```typescript
// Use _count in queries
const clients = await prisma.client.findMany({
  include: {
    _count: {
      select: { posts: true },
    },
  },
});
// Access: client._count.posts
```

### Benchmarks

| Operation              | Time   | Items        |
| ---------------------- | ------ | ------------ |
| First run (empty DB)   | 25-35s | ~800 items   |
| Second run (satisfied) | 1-2s   | 0 items      |
| Partial data (gaps)    | 5-10s  | 50-150 items |

---

## Testing Strategy

### Test Scenarios

**1. Empty Database**

```bash
npm run db:reset
npm run db:seed
# Verify: All tables populated
```

**2. Idempotency**

```bash
npm run db:seed  # Run 1
npm run db:seed  # Run 2
npm run db:seed  # Run 3
# Verify: Same data, no duplicates
```

**3. Partial Data**

```bash
npm run db:seed  # Initial seed
# Manually delete some posts
npm run db:seed  # Reseed
# Verify: Only missing posts added
```

**4. Audit Mode**

```bash
SEED_AUDIT=true npm run db:seed
# Verify: No database changes, shows gaps
```

**5. Individual Enrichers**

```typescript
// In test file
const enricher = new PostsEnricher(prisma);
const result = await enricher.enrich();
expect(result.itemsAdded).toBeGreaterThan(0);
```

---

## Extending the System

### Adding a New Enricher

**Step 1**: Create enricher file

```typescript
// prisma/seed/dynamic/enrichers/my-enricher.ts
export class MyEnricher extends BaseEnricher {
  constructor(prisma: PrismaClient) {
    super(prisma, 'MyTable');
  }

  async enrich(): Promise<EnrichmentResult> {
    // Implementation
  }
}
```

**Step 2**: Add to orchestrator

```typescript
// hybrid-seed-orchestrator.ts
import { MyEnricher } from './enrichers/my-enricher';

// In enrichers array:
{ name: 'MyFeature', enricher: new MyEnricher(prisma) },
```

**Step 3**: Document it

- Add entry to `SEEDING_ENRICHER_REFERENCE.md`
- Update tier diagram
- Update dependency graph

**Step 4**: Test it

```bash
npm run db:reset
npm run db:seed
# Verify your enricher runs
```

---

## Configuration Management

### Minimum Requirements

Defined in `minimum-requirements.ts`:

```typescript
export const MINIMUM_REQUIREMENTS = {
  perClient: {
    posts: 5,
    comments: 10,
    // ...
  },
  perTherapist: {
    clients: 2,
    availabilityDays: 3,
    // ...
  },
  // ...
};
```

**To modify**:

1. Edit `minimum-requirements.ts`
2. Enrichers automatically use new values
3. No code changes needed in enrichers

### Environment Variables

- `SEED_VERBOSE`: Enable detailed logging
- `SEED_AUDIT`: Audit mode (no changes)
- `SEED_FORCE`: Force base data recreation

---

## Database Transactions

### Current Approach

**No transactions for enrichment** (by design):

**Why**:

- Enrichment can take 30+ seconds
- Long transactions can lock tables
- Partial seeding is acceptable
- Idempotency handles retries

**Exception**:

- Base data generation uses transactions
- Individual enrichers may use transactions for complex operations

---

## Future Enhancements

### Planned

1. **Parallel Tier Execution**

   - Run Tier 1 enrichers in parallel
   - Faster first-run seeding

2. **Progress Indicators**

   - Real-time progress bar
   - Estimated time remaining

3. **Configurable Requirements**

   - Override minimums via environment variables
   - Per-environment configuration

4. **Smart Audit Reports**

   - Generate detailed gap analysis
   - Export to JSON/CSV

5. **Payments Enricher**
   - Complete when billing system ready
   - Payment method seeding
   - Invoice generation

---

**Last Updated**: October 14, 2025  
**Version**: 2.0
