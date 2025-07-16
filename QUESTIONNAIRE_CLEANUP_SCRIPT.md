# Questionnaire Cleanup Script

## Overview
After migrating questionnaires to mentara-commons, the individual questionnaire files in the client are now redundant and can be safely removed since all consumers now import from the centralized commons package.

## Files to Remove

### Questionnaire Directory
The entire directory can be removed:
```bash
rm -rf mentara-client/constants/questionnaire/
```

This includes:
- `adhd.ts`
- `alcohol.ts`
- `binge-eating.ts`
- `burnout.ts`
- `drug-abuse.ts`
- `gad-7-anxiety.ts`
- `insomnia.ts`
- `mood-disorder.ts`
- `obsessional-compulsive.ts`
- `panic-disorder.ts`
- `perceived-stress-scale.ts`
- `phobia.ts`
- `phq-9.ts`
- `ptsd.ts`
- `social-phobia.ts`

### Scoring File (Optional)
You can also remove the local scoring.ts if no other files depend on it:
```bash
rm mentara-client/constants/scoring.ts
```

## Verification Steps

1. **Build Check**: After removal, run the client build to ensure everything still works:
```bash
cd mentara-client && npm run build
```

2. **Test Pre-Assessment**: Verify the pre-assessment flow still works correctly:
   - Visit the pre-assessment page
   - Complete a questionnaire
   - Verify scoring calculations work

3. **Check TypeScript**: Ensure no TypeScript errors:
```bash
cd mentara-client && npm run typecheck
```

## What Will Continue Working

All the main functionality will continue working because:

1. **Main Import File**: `mentara-client/constants/questionnaires.ts` now imports from `mentara-commons`
2. **All Consumers**: Components, stores, and utilities import from `@/constants/questionnaires`
3. **Type Safety**: All TypeScript types are preserved via the commons package

## Rollback Plan

If any issues arise, you can restore the files from git:
```bash
git checkout HEAD -- mentara-client/constants/questionnaire/
git checkout HEAD -- mentara-client/constants/scoring.ts
```

## Current Status

✅ **Safe to Remove**: All questionnaire files in `mentara-client/constants/questionnaire/`
✅ **Safe to Remove**: `mentara-client/constants/scoring.ts` (redundant with commons)
✅ **Keep**: `mentara-client/constants/questionnaires.ts` (already migrated to use commons)

The migration is complete and the old files are no longer needed.