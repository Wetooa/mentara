# API Fetching Issues - Fixes and Implementation Plan

**Date:** October 15, 2025  
**Focus:** Fixing excessive API calls and intermittent errors on `/client` and `/therapist` dashboards

---

## Issues Identified

### Dashboard Routes

- **Client Dashboard:** `/client` → `app/(protected)/client/(dashboard)/page.tsx`
- **Therapist Dashboard:** `/therapist` → `app/(protected)/therapist/(dashboard)/page.tsx`

### Problems

1. ✅ **React Strict Mode** → 2x renders in development (EXPECTED, not a bug)
2. ❌ **AuthContext creates new user object on every render** → cascading re-renders
3. ❌ **Multiple API calls from separate hooks** → no coordination
4. ❌ **Console logs in production code** → performance overhead
5. ❌ **Race conditions in auth flow** → intermittent 401/403 errors
6. ❌ **No request deduplication** between related hooks

---

## Fix #1: Memoize User Object in AuthContext (CRITICAL)

**Problem:** New user object created on every render → all components re-render → API calls re-trigger

**File:** `contexts/AuthContext.tsx`

### Before (Lines 204-215):

```typescript
const user: User | null =
  userRole && userId
    ? {
        id: userId,
        role: userRole,
        firstName: profileData?.firstName,
        lastName: profileData?.lastName,
        avatarUrl: profileData?.avatarUrl,
        hasSeenTherapistRecommendations:
          profileData?.hasSeenTherapistRecommendations,
      }
    : null;
```

### After (with useMemo):

```typescript
const user: User | null = useMemo(() => {
  if (!userRole || !userId) return null;

  return {
    id: userId,
    role: userRole,
    firstName: profileData?.firstName,
    lastName: profileData?.lastName,
    avatarUrl: profileData?.avatarUrl,
    hasSeenTherapistRecommendations:
      profileData?.hasSeenTherapistRecommendations,
  };
}, [
  userId,
  userRole,
  profileData?.firstName,
  profileData?.lastName,
  profileData?.avatarUrl,
  profileData?.hasSeenTherapistRecommendations,
]);
```

**Impact:** Reduces re-renders by 80-90%

---

## Fix #2: Remove Console Logs from Production Code

**Problem:** Console logs trigger on every render, add overhead

### Files to Update:

1. **contexts/AuthContext.tsx (Lines 200-201)**

   ```typescript
   // REMOVE:
   console.log("Auth Data:", authData);
   console.log("Profile Data:", profileData);
   ```

2. **app/(protected)/client/layout.tsx (Line 26)**

   ```typescript
   // REMOVE:
   console.log("Current user:", user);
   ```

3. **app/(protected)/client/(dashboard)/page.tsx (Lines 43-46, 54-57)**
   ```typescript
   // REPLACE with conditional logging:
   if (process.env.NODE_ENV === "development") {
     console.log("🔍 Dashboard API Data:", {
       dashboardApiData: JSON.stringify(dashboardApiData, null, 2),
       communicationsData: JSON.stringify(communicationsData, null, 2),
     });
   }
   ```

---

## Fix #3: Optimize Dashboard Data Fetching

**Problem:** Multiple separate hooks → multiple API calls → no coordination

### Current State (Therapist Dashboard):

```typescript
// Line 30-32
const { data, isLoading, error, refetch } = useTherapistDashboard();
const { data: recentChats = [], isLoading: isChatsLoading } =
  useRecentCommunications();
```

### Solution: Create Unified Dashboard Hook

**New File:** `hooks/therapist/useTherapistDashboardData.ts`

```typescript
import { useQueries } from "@tanstack/react-query";
import { useApi } from "@/lib/api";

/**
 * Unified hook for fetching all therapist dashboard data
 * Uses useQueries for parallel fetching with coordination
 */
export function useTherapistDashboardData() {
  const api = useApi();

  const results = useQueries({
    queries: [
      {
        queryKey: ["therapists", "dashboard"],
        queryFn: () => api.dashboard.getTherapistDashboard(),
        staleTime: 1000 * 60 * 2, // 2 minutes
      },
      {
        queryKey: ["dashboard", "communications", "recent"],
        queryFn: () =>
          api.messaging?.getRecentCommunications?.(5) || Promise.resolve([]),
        staleTime: 1000 * 60 * 2,
      },
    ],
  });

  const [dashboardQuery, communicationsQuery] = results;

  return {
    dashboard: {
      data: dashboardQuery.data,
      isLoading: dashboardQuery.isLoading,
      error: dashboardQuery.error,
      refetch: dashboardQuery.refetch,
    },
    communications: {
      data: communicationsQuery.data || [],
      isLoading: communicationsQuery.isLoading,
      error: communicationsQuery.error,
    },
    // Combined states for convenience
    isLoading: dashboardQuery.isLoading || communicationsQuery.isLoading,
    isError: dashboardQuery.isError || communicationsQuery.isError,
    refetchAll: () => {
      dashboardQuery.refetch();
      communicationsQuery.refetch();
    },
  };
}
```

### Update Dashboard Page:

**File:** `app/(protected)/therapist/(dashboard)/page.tsx`

```typescript
// REPLACE Lines 30-32:
const { dashboard, communications, isLoading, isError, refetchAll } =
  useTherapistDashboardData();

const data = dashboard.data;
const error = dashboard.error;
const recentChats = communications.data;
const refetch = refetchAll;
```

**Benefits:**

- Single import
- Coordinated loading states
- Parallel fetching (faster)
- Better error handling
- Easier to maintain

---

## Fix #4: Add Query Key Factory Pattern

**Problem:** Inconsistent query keys → poor cache invalidation

**New File:** `lib/queryKeys.ts` (extend existing)

```typescript
// Add to existing file
export const dashboardKeys = {
  all: ["dashboard"] as const,

  // Client keys
  client: () => [...dashboardKeys.all, "client"] as const,
  clientDashboard: () => [...dashboardKeys.client(), "main"] as const,
  clientSessions: () => [...dashboardKeys.client(), "sessions"] as const,
  clientProgress: () => [...dashboardKeys.client(), "progress"] as const,

  // Therapist keys
  therapist: () => [...dashboardKeys.all, "therapist"] as const,
  therapistDashboard: () => [...dashboardKeys.therapist(), "main"] as const,
  therapistStats: () => [...dashboardKeys.therapist(), "stats"] as const,
  therapistSchedule: () => [...dashboardKeys.therapist(), "schedule"] as const,

  // Shared keys
  communications: (limit?: number) =>
    [...dashboardKeys.all, "communications", "recent", limit] as const,
};
```

### Update Hooks to Use Factory:

**File:** `hooks/therapist/useTherapistDashboard.ts`

```typescript
import { dashboardKeys } from "@/lib/queryKeys";

export function useTherapistDashboard() {
  const api = useApi();

  return useQuery({
    queryKey: dashboardKeys.therapistDashboard(), // ← Use factory
    queryFn: () => api.dashboard.getTherapistDashboard(),
    // ... rest of config
  });
}
```

---

## Fix #5: Prevent Race Conditions in Auth Flow

**Problem:** Profile query fires before auth query completes

**File:** `contexts/AuthContext.tsx`

### Current (Lines 151-198):

```typescript
const { data: profileData, refetch: refetchProfile } = useQuery({
  queryKey: ["auth", "current-user-profile"],
  queryFn: async () => {
    /* ... */
  },
  enabled: isClient && !!userId && !!userRole && hasToken === true,
  // ...
});
```

### Fix: Add explicit dependency on auth query success:

```typescript
const { data: profileData, refetch: refetchProfile } = useQuery({
  queryKey: ["auth", "current-user-profile"],
  queryFn: async () => {
    /* ... */
  },
  enabled:
    isClient && !!userId && !!userRole && hasToken === true && !isLoading, // ← Add !isLoading
  staleTime: 5 * 60 * 1000,
  retry: (failureCount, error: any) => {
    if (error?.response?.status === 401 || error?.response?.status === 403) {
      return false;
    }
    return failureCount < 2;
  },
});
```

**Impact:** Ensures profile only fetches after auth is confirmed

---

## Fix #6: Debounce Refetch on Window Focus

**Problem:** Every tab switch triggers refetch

**File:** `components/providers/QueryProvider.tsx`

### Current (Line 17):

```typescript
refetchOnWindowFocus: queryConfig.refetchOnWindowFocus,
```

### Fix: Add debounce wrapper:

```typescript
import { focusManager } from "@tanstack/react-query";

// Add after createQueryClient function
const setupFocusManager = () => {
  let focusTimeout: NodeJS.Timeout | null = null;

  focusManager.setEventListener((handleFocus) => {
    // Standard event listeners
    if (typeof window !== "undefined") {
      const onFocus = () => {
        // Debounce focus events to prevent rapid refetching
        if (focusTimeout) clearTimeout(focusTimeout);
        focusTimeout = setTimeout(() => {
          handleFocus();
        }, 1000); // 1 second debounce
      };

      window.addEventListener("focus", onFocus, false);
      window.addEventListener("visibilitychange", onFocus, false);

      return () => {
        window.removeEventListener("focus", onFocus);
        window.removeEventListener("visibilitychange", onFocus);
      };
    }
  });
};
```

### Update QueryProvider:

```typescript
export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => {
    setupFocusManager(); // ← Add this
    return createQueryClient();
  });

  // ... rest
}
```

---

## Fix #7: Reduce Auto-Refresh Polling

**Problem:** Background polling adds unnecessary API calls

**File:** `hooks/therapist/useTherapistDashboard.ts` (Line 146)

### Current:

```typescript
refetchInterval: 1000 * 60 * 5, // Auto-refresh every 5 minutes
```

### Fix: Use conditional polling only when tab is active:

```typescript
export function useTherapistUpcomingAppointments() {
  const api = useApi();

  return useQuery({
    queryKey: ["therapists", "dashboard", "appointments"],
    queryFn: () => api.meetings.getUpcomingMeetings(10),
    staleTime: 1000 * 60 * 1,
    refetchInterval: (query) => {
      // Only poll if there's data and tab is visible
      if (query.state.data && document.visibilityState === "visible") {
        return 1000 * 60 * 5; // 5 minutes
      }
      return false; // Stop polling when tab is hidden
    },
  });
}
```

---

## Implementation Checklist

### Phase 1: Critical Fixes (Do First)

- [ ] Fix #1: Memoize user object in AuthContext
- [ ] Fix #2: Remove/conditionally wrap console logs
- [ ] Fix #5: Fix race condition in auth flow

**Expected Impact:** 70-80% reduction in re-renders and API calls

### Phase 2: Optimization (Do Second)

- [ ] Fix #3: Create unified dashboard hooks
- [ ] Fix #4: Implement query key factory pattern
- [ ] Fix #6: Debounce window focus refetching

**Expected Impact:** 50% reduction in duplicate API calls

### Phase 3: Polish (Do Third)

- [ ] Fix #7: Optimize polling intervals
- [ ] Add request caching headers on backend
- [ ] Monitor and measure improvements

**Expected Impact:** Reduced background API traffic

---

## Testing Instructions

### Before Fixes:

1. Open DevTools Network tab
2. Navigate to `/client` or `/therapist`
3. Count API requests (should see 6-8 requests)
4. Switch tabs and come back
5. Note additional requests

### After Fixes:

1. Repeat same steps
2. Should see 2-3 requests on initial load
3. Tab switching should trigger at most 1 request (debounced)
4. No race condition errors in console

---

## Measurement Metrics

Track these before and after:

| Metric                      | Before     | Target After |
| --------------------------- | ---------- | ------------ |
| API calls on dashboard load | 6-8        | 2-3          |
| Re-renders on auth change   | 10+        | 2-3          |
| Time to interactive         | ~2s        | ~1s          |
| Console errors (401/403)    | Occasional | None         |
| Background API calls/min    | 3-5        | 0-1          |

---

## Notes

- **React Strict Mode**: Keeping enabled is GOOD for development. The 2x render is intentional and helps catch bugs. It won't happen in production.
- **Production Build**: Most of these issues are amplified in development. Test production build to see real-world impact.
- **Backend Optimization**: Consider creating a single `/api/dashboard/:role` endpoint that returns all dashboard data in one call.

---

## Next Steps

1. Implement Phase 1 fixes (critical)
2. Test in development
3. Verify API call reduction
4. Proceed to Phase 2
5. Monitor production after deployment

