# API Integration and Performance Notes

This document summarizes the migration from mock data to real API integration using React Query and outlines performance optimizations implemented.

## Migration Summary

### Completed Integrations

#### ✅ Therapist Management
- **Hook**: `useTherapistRecommendations` - Replaced `mockRecommendedTherapists`
- **Components**: `RecommendedSection.tsx` - Now uses real API data with loading/error states
- **Features**: Search, filtering, infinite scroll support, prefetching

#### ✅ Therapist Dashboard
- **Hook**: `useTherapistDashboard` - Replaced `useTherapistData`
- **Components**: Therapist dashboard components now use real API
- **Features**: Dashboard stats, upcoming appointments, meeting management

#### ✅ Patient Management
- **Hook**: `usePatientsList`, `usePatientData` - Replaced mock patient data
- **Components**: Patient management components use React Query
- **Features**: Session notes, worksheet assignments, progress tracking

#### ✅ Therapist Applications (Admin)
- **Hook**: `useTherapistApplications` - Admin application management
- **Components**: Admin application table and details views
- **Features**: Status updates, filtering, bulk operations with optimistic updates

#### ✅ Meeting Management
- **Hook**: `useTherapistMeetings` - Replaced mock meeting data
- **Components**: `MeetingsSection.tsx` now uses real API
- **Features**: Meeting status updates, real-time refresh

### Remaining Mock Data
- **User Dashboard**: `mockUserDashboardData.ts` - Used by 9+ dashboard components
- **Messages**: `mockMessagesData.ts` - Used by 4+ message components

## Performance Optimizations

### React Query Configuration

#### Cache Management
- **Stale Time**: Configured based on data volatility
  - Therapist profiles: 10 minutes (stable data)
  - Dashboard data: 2 minutes (moderate changes)
  - Meetings: 1-2 minutes (frequent updates)
  - Patient data: 5-10 minutes (clinical data)

#### Smart Query Invalidation
- Mutations invalidate related queries automatically
- Optimistic updates for better UX
- Background refetching for critical data

### Prefetching Strategy

#### Hover States
```typescript
const prefetchTherapist = usePrefetchTherapistProfile();
// Prefetch on hover for instant navigation
onMouseEnter={() => prefetchTherapist(therapist.id)}
```

#### Route Prefetching
- Patient data prefetched when therapist navigates to patient list
- Meeting details prefetched for upcoming meetings

### API Client Optimizations

#### Request Deduplication
- React Query automatically deduplicates identical requests
- Reduces server load and improves performance

#### Error Handling
- Smart retry logic: Don't retry auth errors (401/403)
- Graceful degradation with proper error boundaries
- User-friendly error messages with actionable feedback

### Component Optimizations

#### Loading States
- Skeleton loaders for better perceived performance
- Progressive data loading (stats first, then details)
- Proper loading indicators with meaningful messages

#### Error States
- Comprehensive error handling with retry options
- Fallback UI components maintain application flow
- Clear error messages guide user actions

## Testing Strategy

### Playwright Integration Tests
- **Coverage**: Therapist dashboard, patient management, admin applications
- **Authentication**: Uses real test accounts from `test-accounts.md`
- **API Testing**: Verifies real API interactions
- **User Flows**: End-to-end scenarios matching production usage

### Test Accounts
- 15+ test accounts across all user roles
- Specific credentials for different scenarios
- Supports comprehensive integration testing

## Migration Benefits

### Developer Experience
- **Type Safety**: Full TypeScript interfaces for all API responses
- **DevTools**: React Query DevTools for debugging
- **Consistency**: Standardized error handling and loading states
- **Maintainability**: Centralized API logic, easier to modify

### User Experience
- **Performance**: Faster loading with intelligent caching
- **Reliability**: Proper error handling and retry logic
- **Feedback**: Real-time updates with optimistic mutations
- **Offline Support**: React Query handles network failures gracefully

### Production Readiness
- **Real Data**: All therapist-related features use production APIs
- **Scalability**: Efficient caching reduces server load
- **Monitoring**: Comprehensive error tracking and logging
- **Testing**: Full integration test coverage

## Next Steps

### Recommended Migrations
1. **User Dashboard**: Migrate dashboard components from mock data
2. **Messages System**: Implement real-time messaging API integration
3. **Search Optimization**: Add debounced search with server-side filtering
4. **Offline Support**: Implement service worker for cached data access

### Performance Monitoring
- Add React Query performance metrics
- Monitor cache hit rates and invalidation patterns
- Track API response times and error rates
- Implement performance budgets for key user flows

## Architecture Patterns

### Hook Patterns
```typescript
// ✅ Good: Specific, focused hooks
useTherapistRecommendations(params)
usePatientData(patientId)

// ❌ Avoid: Generic, unfocused hooks
useGenericData(type, id)
```

### Query Key Patterns
```typescript
// ✅ Good: Hierarchical, predictable keys
queryKeys.therapists.recommendations(params)
queryKeys.clients.detail(id).concat(['sessions'])

// ❌ Avoid: Flat, unpredictable keys
['therapist-recs', params]
```

### Error Handling Patterns
```typescript
// ✅ Good: Specific error handling
const { data, isLoading, error } = useQuery({
  retry: (failureCount, error) => {
    if (error?.status === 401) return false;
    return failureCount < 3;
  }
});

// ❌ Avoid: Generic error handling
const { data } = useQuery({ retry: 3 });
```

This integration provides a solid foundation for scalable, maintainable API interactions while delivering excellent user experience through optimized performance patterns.