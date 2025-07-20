# Questionnaire Migration from Client to Commons

## Overview
The questionnaire files have been successfully consolidated in the `mentara-commons` package. All individual questionnaire files (adhd.ts, phq-9.ts, etc.) and their supporting functionality are now centralized.

## Migration Status

### ✅ Already Migrated to Commons
- All 15 individual questionnaire files (adhd.ts, alcohol.ts, etc.)
- Enhanced scoring.ts with better error handling
- Community mapping functionality
- Comprehensive type definitions

### ✅ New in Commons
- `questionnaire-mapping.ts` - Centralized questionnaire mapping
- Enhanced error handling in scoring functions
- TypeScript types for better type safety
- Community recommendation thresholds

## Required Changes in Client

### 1. Update Imports in Client Files

The following files need to have their imports updated:

#### Update `mentara-client/constants/questionnaires.ts`
**From:**
```typescript
import ASRS_V1_1 from "./questionnaire/adhd";
import AUDIT from "./questionnaire/alcohol";
// ... other imports
```

**To:**
```typescript
import { 
  LIST_OF_QUESTIONNAIRES,
  QUESTIONNAIRE_MAP,
  type ListOfQuestionnaires
} from 'mentara-commons';
// Remove the existing definitions and export the imported ones
export { LIST_OF_QUESTIONNAIRES, QUESTIONNAIRE_MAP, type ListOfQuestionnaires };
```

### 2. Remove Client Questionnaire Directory

Once imports are updated, you can safely remove:
- `mentara-client/constants/questionnaire/` (entire directory)
- `mentara-client/constants/scoring.ts` (use commons version)

### 3. Update Component Imports

Search for any components importing from the old paths and update them:

**Find files using:**
```bash
grep -r "constants/questionnaire" mentara-client/
grep -r "constants/scoring" mentara-client/
```

**Update from:**
```typescript
import { QuestionnaireProps } from '../constants/scoring';
import PHQ_9 from '../constants/questionnaire/phq-9';
```

**To:**
```typescript
import { QuestionnaireProps, DEPRESSION_PHQ9 } from 'mentara-commons';
```

## Benefits of Migration

1. **Single Source of Truth**: All questionnaires are now centralized
2. **Better Error Handling**: Enhanced scoring functions with null checks
3. **Type Safety**: Improved TypeScript definitions
4. **Reusability**: Backend can now use the same questionnaire definitions
5. **Community Integration**: Questionnaire results can directly map to community recommendations

## Commons Features Available

### Questionnaire Mapping
```typescript
import { 
  QUESTIONNAIRE_MAP,
  getQuestionnaireByName,
  getQuestionnaireById,
  isValidQuestionnaireName 
} from 'mentara-commons';
```

### Community Mapping
```typescript
import { 
  QUESTIONNAIRE_TO_COMMUNITY_MAP,
  COMMUNITY_RECOMMENDATION_THRESHOLDS 
} from 'mentara-commons';
```

### Individual Questionnaires
```typescript
import { 
  DEPRESSION_PHQ9,
  ANXIETY_GAD7,
  ADHD_ASRS,
  // ... all questionnaires available
} from 'mentara-commons';
```

## Testing After Migration

1. Build the commons package: `cd mentara-commons && npm run build`
2. Update client imports as described above
3. Test questionnaire functionality in the client
4. Verify backend can access questionnaire definitions
5. Test community assignment based on questionnaire results

## Rollback Plan

If issues arise, the original files are still in the client directory. Simply revert the import changes and keep using the client versions until issues are resolved.