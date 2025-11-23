# Performance Optimization Guide

## Overview

This document outlines the performance optimizations implemented in the Mentara API to ensure fast response times and efficient resource usage.

## Implemented Optimizations

### 1. Database Query Optimization

#### N+1 Query Elimination
- **Problem**: Multiple queries executed for related data
- **Solution**: 
  - Used Prisma `_count` for aggregations
  - Replaced `include` with selective `select` statements
  - Implemented batch queries for related data

**Example:**
```typescript
// Before (N+1 problem)
const therapists = await prisma.therapist.findMany({
  include: { reviews: true }
});
// Would execute 1 query + N queries for reviews

// After (optimized)
const therapists = await prisma.therapist.findMany({
  select: {
    userId: true,
    _count: { select: { reviews: true } }
  }
});
const ratings = await prisma.review.groupBy({
  by: ['therapistId'],
  _avg: { rating: true }
});
// Executes only 2 queries total
```

#### Database Indexing
Added indexes on frequently queried fields:
- `User`: `email`, `role`, `emailVerified`, `isActive`
- `Therapist`: `status`, `licenseVerified`, `province`, `hourlyRate`
- `Conversation`: `createdAt`, `lastMessageAt`, `isActive`
- `Post`: `title`, `content` (for search)
- `Comment`: `content` (for search)
- `Community`: `description`, `imageUrl`
- `Review`: `isVerified`
- `PreAssessment`: `isProcessed`, `processedAt`
- `Meeting`: `meetingType`

### 2. Caching Strategy

#### Cache Module
- **Location**: `src/cache/cache.module.ts`
- **Implementation**: Uses NestJS Cache Manager with in-memory cache (Redis-ready)
- **TTL**: 5 minutes default
- **Max Items**: 1000

#### Cached Endpoints
- **Therapist List**: `/therapists/list` - Cached with query parameters as key
- **Therapist Details**: `/therapists/:id` - Cached by therapist ID
- **Search Results**: Search queries are cached (to be implemented)

**Cache Key Format:**
```
therapist-list:limit:20|offset:0|search:anxiety|specialties:["depression"]
therapist:therapist-id-123
```

#### Cache Invalidation
- Manual invalidation on data updates
- TTL-based expiration (5 minutes)
- Pattern-based invalidation (when Redis is configured)

### 3. Performance Monitoring

#### Performance Monitor Service
- **Location**: `src/monitoring/performance-monitor.service.ts`
- **Features**:
  - Request duration tracking
  - Memory usage monitoring
  - API response time logging

#### Performance Interceptor
- **Location**: `src/common/interceptors/performance.interceptor.ts`
- **Functionality**:
  - Logs request duration
  - Tracks memory usage
  - Records slow requests (>1 second)

### 4. Response Time Targets

| Endpoint Type | Target Response Time |
|--------------|---------------------|
| Therapist List | < 500ms |
| Therapist Details | < 300ms |
| Search | < 600ms |
| Cached Requests | < 100ms |

### 5. Database Connection Optimization

- Connection pooling via Prisma
- Query timeout configuration
- Prepared statements for repeated queries

## Performance Benchmarks

### Test Suite
- **Location**: `src/performance/performance-benchmark.spec.ts`
- **Coverage**:
  - Response time tests
  - Cache effectiveness tests
  - Concurrent request handling
  - Pagination performance

### Running Benchmarks
```bash
npm run test -- performance-benchmark.spec.ts
```

## Monitoring and Alerts

### Key Metrics to Monitor
1. **API Response Times**: Average, P95, P99
2. **Database Query Times**: Slow query log
3. **Cache Hit Rate**: Should be > 70% for read-heavy endpoints
4. **Memory Usage**: Watch for memory leaks
5. **Concurrent Connections**: WebSocket and HTTP

### Performance Alerts
- Response time > 1 second
- Cache hit rate < 50%
- Memory usage > 80%
- Database query time > 500ms

## Future Optimizations

### Planned Improvements
1. **Redis Integration**: Replace in-memory cache with Redis for distributed caching
2. **CDN Integration**: Static asset caching
3. **Database Read Replicas**: For read-heavy workloads
4. **Query Result Pagination**: Cursor-based pagination for large datasets
5. **Background Job Processing**: Move heavy operations to background workers

### Redis Configuration
When Redis is configured via `REDIS_URL`:
- Cache will automatically use Redis store
- Distributed caching across multiple instances
- Persistent cache across restarts
- Pattern-based cache invalidation

## Best Practices

1. **Always use selective queries**: Use `select` instead of `include` when possible
2. **Cache read-heavy endpoints**: Therapist lists, search results, community data
3. **Monitor slow queries**: Use Prisma query logging in development
4. **Index frequently queried fields**: Review query patterns and add indexes
5. **Use aggregation queries**: Avoid fetching all data to calculate aggregates
6. **Implement pagination**: Limit result sets to reasonable sizes
7. **Monitor cache hit rates**: Ensure caching is effective

## Troubleshooting

### Slow Response Times
1. Check database query logs
2. Verify indexes are being used
3. Check cache hit rates
4. Review N+1 query patterns
5. Monitor database connection pool

### High Memory Usage
1. Review cache size limits
2. Check for memory leaks in services
3. Monitor WebSocket connections
4. Review large data structures

### Cache Not Working
1. Verify cache module is imported
2. Check cache key generation
3. Verify TTL settings
4. Check for cache invalidation issues

