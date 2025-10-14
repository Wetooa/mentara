# Seeding System Troubleshooting Guide

Common issues, error messages, and solutions for the Mentara seeding system.

---

## Common Issues

### Issue 1: "Database already seeded" Message

**Symptom**:
```
🌱 Found existing data (837 items)
✅ All requirements satisfied!
```

**Is this an error?**: **No!** This is normal behavior.

**Explanation**: The system detected existing data that meets all minimum requirements, so it skipped seeding.

**When to worry**: Never. This means your database is properly seeded.

**If you want to reseed anyway**:
```bash
npm run db:reset  # Drops and recreates database
```

---

### Issue 2: Slow Seeding Performance

**Symptom**:
```
npm run db:seed
# Takes 2+ minutes
```

**Expected Times**:
- First run (empty): 25-35 seconds ✅
- Subsequent runs: 1-2 seconds ✅
- More than 60 seconds: ⚠️ Problem

**Common Causes**:

**A. Database Connection Issues**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check connection
psql $DATABASE_URL -c "SELECT 1;"
```

**B. Low Memory**
```bash
# Check available memory
free -h

# If low, increase Node memory
node --max-old-space-size=2048 node_modules/.bin/ts-node prisma/seed.ts
```

**C. Large Existing Dataset**
```bash
# Check database size
psql $DATABASE_URL -c "SELECT COUNT(*) FROM \"User\";"

# If huge, reset:
npm run db:reset
```

---

### Issue 3: TypeScript Compilation Errors

**Symptom**:
```
TSError: ⨯ Unable to compile TypeScript:
src/...enricher.ts(10,5): error TS2322
```

**Solution 1**: Rebuild
```bash
npm run build
npm run db:seed
```

**Solution 2**: Clear cache
```bash
rm -rf node_modules/.cache
npm run db:seed
```

**Solution 3**: Check imports
```typescript
// ❌ Wrong
import { PrismaClient } from 'prisma';

// ✅ Correct
import { PrismaClient } from '@prisma/client';
```

---

### Issue 4: Prisma Client Not Generated

**Symptom**:
```
Error: @prisma/client did not initialize yet
```

**Solution**:
```bash
npx prisma generate
npm run db:seed
```

**Prevention**: Add to `package.json`:
```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

---

### Issue 5: Migration Pending

**Symptom**:
```
Error: Prisma schema and database are out of sync
```

**Solution**:
```bash
npx prisma migrate dev
npm run db:seed
```

**Or reset**:
```bash
npm run db:reset  # Automatically migrates
```

---

### Issue 6: Duplicate Key Errors

**Symptom**:
```
Error: Unique constraint failed on the fields: (`userId`,`communityId`)
```

**This shouldn't happen!** The system is idempotent.

**If it does**:

**Step 1**: Check for multiple seed processes
```bash
ps aux | grep "seed.ts"
# Kill duplicates
```

**Step 2**: Verify unique constraints in schema
```prisma
model CommunityMember {
  @@unique([userId, communityId])  // Must exist
}
```

**Step 3**: Report as bug if persistent

---

### Issue 7: Out of Memory

**Symptom**:
```
FATAL ERROR: Ineffective mark-compacts near heap limit
```

**Solution**:
```bash
# Increase Node memory
node --max-old-space-size=2048 node_modules/.bin/ts-node prisma/seed.ts
```

**Or update `package.json`**:
```json
{
  "scripts": {
    "db:seed": "node --max-old-space-size=2048 node_modules/.bin/ts-node prisma/seed.ts"
  }
}
```

---

### Issue 8: Connection Pool Exhausted

**Symptom**:
```
Error: Can't reach database server
Too many connections
```

**Solution 1**: Check connection limit
```bash
psql $DATABASE_URL -c "SHOW max_connections;"
```

**Solution 2**: Close other connections
```bash
# Find active connections
psql $DATABASE_URL -c "SELECT pid, usename FROM pg_stat_activity;"

# Kill specific connection
psql $DATABASE_URL -c "SELECT pg_terminate_backend(PID);"
```

**Solution 3**: Increase pool size in `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // Add this:
  connectionLimit = 10
}
```

---

## Error Messages

### "Cannot find module '@prisma/client'"

**Cause**: Prisma client not installed or generated

**Solution**:
```bash
npm install @prisma/client
npx prisma generate
```

---

### "Invalid \`prisma.user.create()\` invocation"

**Cause**: Data doesn't match schema

**Example**:
```
Required field 'email' is missing
```

**Solution**: Check enricher data matches schema:
```typescript
// Verify all required fields present
await prisma.user.create({
  data: {
    email: "user@example.com",     // Required
    firstName: "John",              // Required
    lastName: "Doe",                // Required
    role: "client",                 // Required
    // ... other required fields
  }
});
```

---

### "Relation does not exist"

**Cause**: Foreign key constraint violation

**Example**:
```
Foreign key constraint failed on field: `userId`
```

**Solution**: Ensure parent records exist first:
```typescript
// ❌ Bad: Create child before parent
await prisma.post.create({ data: { userId: "unknown-id" }});

// ✅ Good: Ensure user exists
const user = await prisma.user.findUnique({ where: { id: userId }});
if (user) {
  await prisma.post.create({ data: { userId: user.id }});
}
```

---

### "Timeout waiting for connection"

**Cause**: Database not running or unreachable

**Solution**:
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Start if stopped
sudo systemctl start postgresql

# Check DATABASE_URL
echo $DATABASE_URL
# Should be: postgresql://user:pass@localhost:5432/dbname
```

---

## Debugging Tips

### Enable Verbose Mode

```bash
SEED_VERBOSE=true npm run db:seed
```

**Output**:
```
🌱 Mentara Database Seeding
📊 Audit: 25 users, 10 communities
✨ Running enrichment...
  [1/18] Memberships... checking 25 users
  [1/18] Memberships... ✅ Added 5 memberships
  [2/18] Relationships... checking 10 therapists
  ...
```

### Audit Mode (No Changes)

```bash
SEED_AUDIT=true npm run db:seed
```

**Shows what would be added without making changes**:
```
📊 Audit Report:
  Clients:
    ✅ Client 1: satisfied
    ⚠️  Client 2: needs 3 posts, 5 comments
  Therapists:
    ✅ All satisfied
```

### Check Database Manually

```bash
# Open Prisma Studio
npx prisma studio

# Or use psql
psql $DATABASE_URL

# Check counts
SELECT 'Users' as table, COUNT(*) FROM "User"
UNION ALL
SELECT 'Posts', COUNT(*) FROM "Post"
UNION ALL
SELECT 'Comments', COUNT(*) FROM "Comment";
```

### Isolate Enricher

Test individual enricher:

```typescript
// test-enricher.ts
import { PrismaClient } from '@prisma/client';
import { PostsEnricher } from './prisma/seed/dynamic/enrichers/posts-enricher';

const prisma = new PrismaClient();

async function test() {
  const enricher = new PostsEnricher(prisma);
  const result = await enricher.enrich();
  console.log('Result:', result);
}

test();
```

```bash
ts-node test-enricher.ts
```

---

## Data Validation

### Verify Minimum Requirements

After seeding, check if requirements met:

```sql
-- Clients with < 5 posts
SELECT u.id, u.email, COUNT(p.id) as post_count
FROM "User" u
LEFT JOIN "Post" p ON p."userId" = u.id
WHERE u.role = 'client'
GROUP BY u.id
HAVING COUNT(p.id) < 5;

-- Should return 0 rows!
```

```sql
-- Therapists with < 2 clients
SELECT t."userId", COUNT(ct."clientId") as client_count
FROM "Therapist" t
LEFT JOIN "ClientTherapist" ct ON ct."therapistId" = t."userId"
WHERE t.status = 'APPROVED'
GROUP BY t."userId"
HAVING COUNT(ct."clientId") < 2;

-- Should return 0 rows!
```

---

## Performance Profiling

### Measure Enricher Time

Add timing to enrichers:

```typescript
async enrich(): Promise<EnrichmentResult> {
  const start = Date.now();
  
  // ... enrichment logic
  
  const duration = Date.now() - start;
  console.log(`${this.tableName}: ${duration}ms`);
  
  return result;
}
```

### Identify Slow Queries

Enable Prisma query logging:

```typescript
// prisma/client.ts
const prisma = new PrismaClient({
  log: [
    { level: 'query', emit: 'event' },
  ],
});

prisma.$on('query', (e) => {
  if (e.duration > 1000) {  // > 1 second
    console.log(`Slow query: ${e.query} (${e.duration}ms)`);
  }
});
```

---

## Getting Help

### Information to Include

When reporting issues, include:

1. **Error message** (full stack trace)
2. **Environment**:
   - Node version: `node --version`
   - Prisma version: `npx prisma --version`
   - OS: `uname -a`
3. **Database state**:
   - User count
   - Post count
   - etc.
4. **Steps to reproduce**
5. **Expected vs actual behavior**

### Where to Report

1. Check this troubleshooting guide first
2. Review [Architecture docs](./SEEDING_ARCHITECTURE.md)
3. Review [Enricher Reference](./SEEDING_ENRICHER_REFERENCE.md)
4. Check GitHub Issues
5. Contact development team

---

## FAQ

**Q: Can I run seeding in production?**  
A: **No!** Seeding is for development/testing only. Never run on production data.

**Q: How do I customize minimum requirements?**  
A: Edit `prisma/seed/dynamic/minimum-requirements.ts`

**Q: Can I disable specific enrichers?**  
A: Yes, comment out in `hybrid-seed-orchestrator.ts`:
```typescript
// { name: 'Reports', enricher: new ReportsEnricher(prisma) },
```

**Q: Why is first run slow?**  
A: Creates ~800 items with relationships. This is expected (25-35s).

**Q: Can enrichers run in parallel?**  
A: Not currently. Tiers run sequentially to respect dependencies. Future enhancement planned.

**Q: What if I delete all data?**  
A: Run `npm run db:seed`. It will detect empty database and recreate everything.

**Q: How do I speed up seeding?**  
A: 
- Use `SEED_AUDIT=true` to check without seeding
- Subsequent runs are fast (1-2s)
- First run will always take 25-35s

---

**Last Updated**: October 14, 2025  
**Need more help?** Check the [main documentation](./SEEDING_SYSTEM_DOCUMENTATION.md)

