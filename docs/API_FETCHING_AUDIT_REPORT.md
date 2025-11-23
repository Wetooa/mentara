# API Fetching Audit Report
**Date:** October 15, 2025  
**Focus:** Dashboard and API Fetching Layer Analysis  
**Severity:** Medium - Performance & Stability Issues

## Executive Summary

This audit identifies **critical issues** causing excessive API calls and intermittent errors in the frontend, particularly on the dashboard pages. The root causes are:

1. **React Strict Mode** causing double renders in development
2. **Multiple concurrent hooks** fetching overlapping data
3. **Missing dependency optimizations** in React Query
4. **AuthContext triggering unnecessary re-renders**
5. **No request deduplication** for simultaneous calls

---

## 1. React Strict Mode - Primary Culprit

### Issue
React Strict Mode is enabled in `next.config.ts`:
```typescript:12:12:next.config.ts
reactStrictMode: true,
```

**Impact:**
- In development, **every component mounts twice**
- All hooks execute **twice**
- API calls happen **2x** for every page load
- This explains why you see "dashboard api fetch" logged multiple times

### Evidence from Code

**File:** `next.config.ts:7`
```typescript
reactStrictMode: true,
```

**File:** `app/(protected)/therapist/(dashboard)/page.tsx:30-32`
```typescript
const { data, isLoading, error, refetch } = useTherapistDashboard();
const { data: recentChats = [], isLoading: isChatsLoading } =
  useRecentCommunications();
```

Each of these hooks fires twice in Strict Mode = **4 API calls minimum**

---

## 2. Multiple Overlapping Data Fetches

### Problem: Therapist Dashboard

**File:** `app/(protected)/therapist/(dashboard)/page.tsx`

The page makes **multiple independent API calls**:

1. Line 30: `useTherapistDashboard()` → `/api/dashboard/therapist`
2. Line 31-32: `useRecentCommunications()` → `/api/messaging/recent`

**Combined with Strict Mode:** 2 hooks × 2 renders = **4 API calls per dashboard visit**

### Problem: Client Dashboard

**File:** `app/(protected)/client/(dashboard)/page.tsx:26-34`

```typescript
const {
  data: dashboardApiData,
  isLoading: isDashboardLoading,
  error: dashboardError,
  refetch: refetchDashboard,
} = useDashboardData();

const { data: communicationsData, isLoading: isCommunicationsLoading } =
  useRecentCommunications();
```

Again: 2 hooks × 2 renders (Strict Mode) = **4 API calls**

### Problem: Auth Context

**File:** `contexts/AuthContext.tsx:127-143`

The AuthContext fetches user role on **every protected route**:

```typescript
const {
  data: authData,
  isLoading,
  error,
  refetch,
} = useQuery({
  queryKey: ["auth", "user-role"],
  queryFn: () => api.auth.getUserRole(),
  enabled: isClient && shouldCheckAuth && hasToken === true,
  retry: (failureCount, error: any) => {
    if (error?.response?.status === 401 || error?.response?.status === 403) {
      return false;
    }
    return failureCount < 3;
  },
});
```

Then **another query for profile** (lines 151-198):

```typescript
const { data: profileData, refetch: refetchProfile } = useQuery({
  queryKey: ["auth", "current-user-profile"],
  queryFn: async () => {
    // Role-specific profile fetch
  },
  enabled: isClient && !!userId && !!userRole && hasToken === true,
  staleTime: 5 * 60 * 1000,
});
```

**Result:** On dashboard load:
- Auth role check (×2 in Strict Mode)
- Profile fetch (×2 in Strict Mode)  
- Dashboard data (×2 in Strict Mode)
- Communications (×2 in Strict Mode)

**Total: 8 API calls** for a single dashboard visit in development!

---

## 3. No Request Deduplication

### Issue
React Query does deduplicate requests **within the same query**, but our code has:

**Multiple hooks calling overlapping endpoints at the same time:**

Example from therapist dashboard:
- `useTherapistDashboard()` might fetch patient data
- Another component might use `usePatientsList()` 
- Both hit similar endpoints with no coordination

### Current State

**File:** `hooks/therapist/useTherapistDashboard.ts:15-21`

```typescript
export function useTherapistDashboard() {
  const api = useApi();

  return useQuery({
    queryKey: ['therapists', 'dashboard'],
    queryFn: () => api.dashboard.getTherapistDashboard(),
    staleTime: 1000 * 60 * 2, // 2 minutes
```

**File:** `hooks/therapist/useTherapistDashboard.ts:126-134`

```typescript
export function useTherapistStats() {
  const api = useApi();

  return useQuery({
    queryKey: ['therapists', 'dashboard', 'stats'],
    queryFn: () => api.dashboard.getTherapistMetrics(),
    staleTime: 1000 * 60 * 5,
  });
}
```

These have **different query keys** so React Query treats them as separate requests, even though `getTherapistDashboard()` might return data that includes the stats.

---

## 4. Excessive Re-renders from Context

### Problem: AuthContext Triggering Cascading Re-renders

**File:** `contexts/AuthContext.tsx:200-201`

```typescript
console.log("Auth Data:", authData);
console.log("Profile Data:", profileData);
```

These console logs fire on **every render**, and since they're in the context, **every component** re-renders when auth state changes.

**File:** `contexts/AuthContext.tsx:204-215`

Every time `authData` or `profileData` changes, a **new user object** is created:

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

This creates a **new object reference** on every render → triggers re-render in all consuming components → triggers API re-fetches if query keys depend on user data.

---

## 5. Missing Memoization

### Dashboard Data Transformation

**File:** `app/(protected)/client/(dashboard)/page.tsx:37-64`

```typescript
const dashboardData = useMemo(() => {
  if (!dashboardApiData) {
    return null;
  }

  console.log("🔍 Dashboard API Data:", {
    dashboardApiData: JSON.stringify(dashboardApiData, null, 2),
    communicationsData: JSON.stringify(communicationsData, null, 2),
  });

  try {
    const transformedData = transformDashboardData(
      dashboardApiData,
      Array.isArray(communicationsData) ? communicationsData : []
    );

    console.log(
      "✅ Dashboard data transformed successfully:",
      transformedData
    );
    return transformedData;
  } catch (error) {
    console.error("❌ Error transforming dashboard data:", error);
    console.error("❌ Error stack:", error.stack);
    throw error;
  }
}, [dashboardApiData, communicationsData]);
```

**Good:** This uses `useMemo`  
**Bad:** The dependencies `dashboardApiData` and `communicationsData` might be new object references on every render from React Query

---

## 6. Layout Re-mounting Components

### Client Layout Issue

**File:** `app/(protected)/client/layout.tsx:26`

```typescript
console.log("Current user:", user);
```

This runs on **every render** of the layout, and since layout wraps dashboard, this contributes to re-render cascades.

---

## 7. Query Configuration Analysis

### Good Configuration

**File:** `components/providers/QueryProvider.tsx:14-17`

```typescript
queries: {
  staleTime: queryConfig.staleTime,
  gcTime: queryConfig.gcTime,
  refetchOnWindowFocus: queryConfig.refetchOnWindowFocus,
  refetchOnReconnect: queryConfig.refetchOnReconnect,
```

**File:** `hooks/therapist/useTherapistDashboard.ts:21`
```typescript
staleTime: 1000 * 60 * 2, // 2 minutes - good
```

### Potential Issue

**File:** `hooks/therapist/useTherapistDashboard.ts:146`

```typescript
refetchInterval: 1000 * 60 * 5, // Auto-refresh every 5 minutes
```

This means **automatic background polling** every 5 minutes for appointments, adding to API call volume.

---

## 8. Intermittent Errors - Root Cause Analysis

### Why Sometimes It Works, Sometimes It Breaks

Based on the code analysis:

1. **Race Conditions:**
   - Auth context fetches user role
   - Profile fetch depends on user role
   - Dashboard fetch depends on auth being complete
   - If timing is off → 401/403 errors

**File:** `contexts/AuthContext.tsx:151-198`

The profile query depends on `userId` and `userRole` from the auth query. If there's a timing issue, the profile query might fire before `userId` is set.

2. **Stale Cache Issues:**
   - React Query cache might have stale data
   - User navigates away and back quickly
   - Stale data shows first, then fresh data loads
   - If fresh data fetch fails → error state

3. **Token Expiration:**
   - Token expires mid-session
   - API calls fail with 401
   - Axios interceptor redirects to login

**File:** `lib/api/client.ts:56-69`

```typescript
if (error.response?.status === 401) {
  if (typeof window !== "undefined") {
    const currentToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    const currentPath = window.location.pathname;

    if (currentToken && !currentPath.includes("/auth/sign-in")) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      window.location.href = "/auth/sign-in";
    }
  }
}
```

If a request fails with 401, it **immediately redirects**, potentially mid-render.

---

## Root Cause Summary

| Issue | Impact | Severity |
|-------|--------|----------|
| React Strict Mode double renders | 2x API calls in dev | **HIGH** |
| Multiple simultaneous hooks | 4-8 API calls per page | **HIGH** |
| No request batching | Unnecessary duplicate requests | MEDIUM |
| Auth context re-renders | Cascading re-renders | MEDIUM |
| Layout component re-renders | Additional re-renders | LOW |
| Race conditions in auth flow | Intermittent 401/403 errors | **HIGH** |
| No memoization in context | New object refs trigger re-renders | MEDIUM |
| Auto-refresh intervals | Background API calls | LOW |

---

## Recommendations

### Immediate Fixes (High Priority)

1. **Disable Strict Mode in Development** (if excessive logging is the main concern)
   - Or accept that it will log 2x in dev (this is expected behavior)

2. **Add Request Deduplication**
   - Use React Query's built-in deduplication properly
   - Ensure query keys are consistent

3. **Fix Race Conditions**
   - Use `queryClient.isFetching()` to prevent overlapping calls
   - Add proper loading states that block dependent queries

4. **Memoize User Object in AuthContext**
   ```typescript
   const user = useMemo(() => 
     userRole && userId ? { id: userId, role: userRole, ... } : null,
     [userId, userRole, profileData]
   );
   ```

5. **Remove Console Logs in Production Code**
   - They trigger unnecessary re-executions
   - Use conditional logging only in development

### Medium Priority

6. **Batch Dashboard Data Fetches**
   - Create a single `useDashboard()` hook that fetches all data
   - Split data on the frontend, not via multiple API calls

7. **Add Suspense Boundaries**
   - Prevent partial renders during data loading

8. **Optimize Query Keys**
   - Ensure related data shares query key prefixes for better invalidation

### Long-term Improvements

9. **Implement SWR Strategy**
   - Use stale-while-revalidate pattern
   - Show cached data immediately, update in background

10. **Add Request Cancellation**
    - Cancel in-flight requests when user navigates away

11. **Backend API Optimization**
    - Create batch endpoints that return all dashboard data in one call
    - Reduce round-trip latency

---

## Testing Plan

1. **Monitor API call volume:**
   - Check browser DevTools Network tab
   - Count requests on dashboard load
   - Compare before/after fixes

2. **Test race conditions:**
   - Slow down network in DevTools (3G)
   - Navigate quickly between pages
   - Check for 401/403 errors

3. **Measure performance:**
   - Use React DevTools Profiler
   - Check component render counts
   - Identify slow renders

---

## Conclusion

The main issues are:

1. **React Strict Mode** causing 2x renders (expected in dev, acceptable)
2. **Multiple concurrent API calls** from separate hooks (needs optimization)
3. **Race conditions** in auth flow (needs fixing)
4. **Object reference issues** in context causing re-renders (needs memoization)

**Priority:** Fix race conditions and add memoization first, then optimize data fetching strategy.

---

**Next Steps:**
1. Review this audit with the team
2. Implement high-priority fixes
3. Test in development environment
4. Monitor production metrics after deployment


