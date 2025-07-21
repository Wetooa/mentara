# Mentara-Commons Migration Inventory

## 🚨 HIGH PRIORITY - Code Files Requiring Immediate Action

### Client-Side Code Imports (Active References)
From previous search, these files contain actual `import` statements from mentara-commons:

1. **mentara-client/hooks/useRealTimeEvents.ts:20**
   - `} from "mentara-commons";`

2. **mentara-client/hooks/dashboard/useClientDashboard.ts:3**
   - `import type { ClientDashboardResponseDto } from "mentara-commons";`

3. **mentara-client/store/auth/therapistAuthStore.ts:4**
   - `import type { Meeting } from "mentara-commons";`

4. **mentara-client/store/auth/moderatorAuthStore.ts:4**
   - `import type { AuditLog } from "mentara-commons";`

5. **mentara-client/store/auth/adminAuthStore.ts:4**
   - `import type { AuditLog } from "mentara-commons";`

6. **mentara-client/components/worksheets/types.ts:1**
   - `import { WorksheetAssignment, WorksheetSubmission } from "mentara-commons";`

7. **mentara-client/lib/api/auth.ts:16**
   - `import { AuthResponse } from "mentara-commons";`

8. **mentara-client/lib/api/services/therapists.ts:8**
   - `} from "mentara-commons";`

9. **mentara-client/lib/api/services/admin.ts:10**
   - `} from "mentara-commons";`

10. **mentara-client/lib/api/services/dashboard.ts:2**
    - `import {} from "mentara-commons";`

11. **mentara-client/constants/questionnaires.ts:1,7**
    - Import questionnaire functionality from mentara-commons

### Server-Side Code References

12. **mentara-api/tsconfig.json:25**
    - Path alias: `"@mentara/commons": ["../mentara-commons/dist/index"]`

13. **mentara-api/prisma/seed/config.ts:217**
    - Comment referencing `@mentara-commons/src/constants/questionnaire/questionnaire-mapping.ts`

### Comments/TODOs (Lower Priority)
- Various TODO comments suggesting types should come from mentara-commons
- Auth service comments about removing unused imports

## 🔧 MEDIUM PRIORITY - Configuration & Setup Files

### Build/Setup Scripts
1. **setup-dev.sh** (lines 18-22)
   - Installation and build commands for mentara-commons

2. **README.md** (lines 45, 56)
   - Installation instructions and troubleshooting referencing mentara-commons

## 📝 LOW PRIORITY - Documentation Files

### Project Documentation (50+ references)
- **project-docs/** directory contains extensive references in:
  - Team coordination documents
  - Agent directive documents  
  - Completion reports
  - Technical guides

These are historical/documentation references that need updating but don't break functionality.

## 📊 SUMMARY

- **Total References**: ~65 
- **Active Code Imports**: 11 files requiring immediate action
- **Configuration Files**: 2 files  
- **Documentation**: 50+ references across project docs
- **Build Scripts**: 2 files

## 🎯 ACTION PLAN PRIORITY

1. **CRITICAL**: Fix the 11 active code imports (will break TypeScript compilation)
2. **HIGH**: Update tsconfig.json path alias and setup scripts
3. **MEDIUM**: Update README.md and core documentation
4. **LOW**: Update historical project documentation files

## 🔄 TYPE MIGRATION TARGETS

Based on existing structure analysis:
- **Client types**: Already organized in `mentara-client/types/` 
- **Server types**: Already organized in `mentara-api/src/types/` and module-specific `types/` folders
- **Strategy**: Replace imports with existing local type definitions where available, create missing types where needed