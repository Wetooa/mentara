# Mentara-Commons Type Migration Mapping

## Migration Strategy

Based on analysis of existing type structures, both servers already have comprehensive type systems in place. Most types referenced from mentara-commons have existing equivalents.

---

## 🎯 CLIENT-SIDE MIGRATIONS

### 1. **mentara-client/hooks/useRealTimeEvents.ts:20**
**Current Import**: `} from "mentara-commons";`  
**Status**: Need to examine the actual import to determine types  
**Target**: Use existing types from `types/api/messaging.ts`, `types/api/sessions.ts`, or `types/domain.ts`

### 2. **mentara-client/hooks/dashboard/useClientDashboard.ts:3**
**Current Import**: `import type { ClientDashboardResponseDto } from "mentara-commons";`  
**Target**: ✅ **EXISTS** - Use `types/domain.ts` → Types already exist but using different name pattern  
**Migration**: Change to local dashboard types or create specific ClientDashboardResponseDto

### 3. **mentara-client/store/auth/therapistAuthStore.ts:4**
**Current Import**: `import type { Meeting } from "mentara-commons";`  
**Target**: ✅ **EXISTS** - Use `types/api/meetings.ts` → `Meeting` interface  
**Migration**: `import type { Meeting } from '@/types/api/meetings';`

### 4. **mentara-client/store/auth/moderatorAuthStore.ts:4**
**Current Import**: `import type { AuditLog } from "mentara-commons";`  
**Target**: ✅ **EXISTS** - Use `types/api/audit-logs.ts` → `AuditLog` interface  
**Migration**: `import type { AuditLog } from '@/types/api/audit-logs';`

### 5. **mentara-client/store/auth/adminAuthStore.ts:4**
**Current Import**: `import type { AuditLog } from "mentara-commons";`  
**Target**: ✅ **EXISTS** - Use `types/api/audit-logs.ts` → `AuditLog` interface  
**Migration**: `import type { AuditLog } from '@/types/api/audit-logs';`

### 6. **mentara-client/components/worksheets/types.ts:1**
**Current Import**: `import { WorksheetAssignment, WorksheetSubmission } from "mentara-commons";`  
**Target**: ✅ **EXISTS** - Use `types/api/worksheets.ts` → `WorksheetSubmission` interface  
**Note**: `WorksheetAssignment` may need to be created or might exist under different name  
**Migration**: `import type { WorksheetSubmission, Worksheet } from '@/types/api/worksheets';`

### 7. **mentara-client/lib/api/auth.ts:16**
**Current Import**: `import { AuthResponse } from "mentara-commons";`  
**Target**: ✅ **EXISTS** - Use `types/api/auth-extensions.ts` → `AuthResponse` interface  
**Migration**: `import type { AuthResponse } from '@/types/api/auth-extensions';`

### 8. **mentara-client/lib/api/services/therapists.ts:8**
**Current Import**: `} from "mentara-commons";`  
**Status**: Need to examine specific types being imported  
**Target**: Use existing types from `types/therapist.ts`, `types/api/search.ts`

### 9. **mentara-client/lib/api/services/admin.ts:10**
**Current Import**: `} from "mentara-commons";`  
**Target**: Use existing types from `types/auth.ts` (AdminAuthResponse, AdminUser, etc.)

### 10. **mentara-client/lib/api/services/dashboard.ts:2**
**Current Import**: `import {} from "mentara-commons";`  
**Status**: Empty import - likely can be removed entirely  
**Migration**: **DELETE** this import line

### 11. **mentara-client/constants/questionnaires.ts:1,7**
**Current Import**: Questionnaire functionality from mentara-commons  
**Target**: Create local constants in `constants/` directory  
**Strategy**: Extract questionnaire constants and copy to local file

---

## 🛠️ SERVER-SIDE MIGRATIONS

### 12. **mentara-api/tsconfig.json:25**
**Current**: Path alias `"@mentara/commons": ["../mentara-commons/dist/index"]`  
**Migration**: **DELETE** this entire path alias entry

### 13. **mentara-api/prisma/seed/config.ts:217**
**Current**: Comment referencing mentara-commons questionnaire mapping  
**Migration**: **UPDATE** comment to reference local constants or remove

---

## 📋 TYPE MAPPING REFERENCE

### Core Types Available

| **Mentara-Commons Type** | **Client Replacement** | **Server Replacement** |
|-------------------------|------------------------|------------------------|
| `Meeting` | `types/api/meetings.ts` → `Meeting` | `src/meetings/types/meeting.dto.ts` |
| `AuditLog` | `types/api/audit-logs.ts` → `AuditLog` | `src/admin/types/admin.dto.ts` |
| `AuthResponse` | `types/api/auth-extensions.ts` → `AuthResponse` | `src/auth/types/auth.response.ts` → `AuthResponse` |
| `WorksheetSubmission` | `types/api/worksheets.ts` → `WorksheetSubmission` | `src/worksheets/types/worksheet.dto.ts` |
| `User` | `types/api/users.ts` → `User` | `src/users/types/users.type.ts` |
| `ClientDashboardResponseDto` | Create in `types/domain.ts` | N/A (client-only type) |

### Enums Available

| **Enum** | **Client Location** | **Server Location** |
|----------|-------------------|-------------------|
| `UserRole` | `types/domain.ts` | `src/types/enums.ts` |
| `MeetingStatus` | `types/domain.ts` | `src/types/enums.ts` |
| `WorksheetStatus` | `types/domain.ts` | `src/types/enums.ts` |
| `ApplicationStatus` | `types/domain.ts` | `src/types/enums.ts` |

---

## 🔍 INVESTIGATION NEEDED

These imports require examination of actual code to determine specific types:

1. **useRealTimeEvents.ts** - Need to see what specific types are imported
2. **services/therapists.ts** - Need to check the multiline import
3. **services/admin.ts** - Need to check the multiline import  
4. **questionnaires.ts** - Need to extract the questionnaire constants

---

## ✅ MIGRATION EXECUTION ORDER

### Phase 1: Simple Direct Replacements (5 files)
- moderatorAuthStore.ts → AuditLog
- adminAuthStore.ts → AuditLog  
- therapistAuthStore.ts → Meeting
- lib/api/auth.ts → AuthResponse
- components/worksheets/types.ts → WorksheetSubmission

### Phase 2: Investigation Required (4 files)
- useRealTimeEvents.ts
- services/therapists.ts
- services/admin.ts
- constants/questionnaires.ts

### Phase 3: Configuration Cleanup (2 files)
- tsconfig.json path alias removal
- dashboard.ts empty import removal

### Phase 4: Create Missing Types (if needed)
- WorksheetAssignment (if not found)
- ClientDashboardResponseDto variations

---

## 🎯 SUCCESS CRITERIA

1. ✅ Zero TypeScript compilation errors
2. ✅ All imports resolve to local types
3. ✅ No runtime type mismatches
4. ✅ Both servers start successfully
5. ✅ Type safety maintained throughout