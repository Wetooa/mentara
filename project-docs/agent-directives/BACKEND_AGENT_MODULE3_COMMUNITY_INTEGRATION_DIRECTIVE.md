# BACKEND AGENT MODULE 3: COMMUNITY INTEGRATION DIRECTIVE

## OBJECTIVE
Implement comprehensive backend infrastructure for community integration features, including database model enhancements, assessment-to-community matching algorithms, moderation systems, JWT authentication migration, and robust API endpoints to support a fully-featured community-driven mental health platform.

## SCOPE

### INCLUDED
- Seed.ts modular refactoring (1183 lines → organized structure)
- CommunityRecommendation and CommunityJoinRequest Prisma models
- Assessment-to-community mapping algorithm implementation
- Moderator approval system API endpoints
- JWT authentication migration from Clerk dependencies
- WebSocket authentication system updates
- Enhanced Reddit-like features with nested comments and search
- Community analytics and reporting systems
- Real-time community event broadcasting

### EXCLUDED
- Frontend UI implementation (Frontend Agent responsibility)
- Infrastructure and deployment concerns (AI/DevOps Agent responsibility)
- Project coordination and timeline management (Manager Agent responsibility)
- Client-side authentication flows (Frontend Agent responsibility)

## DEPENDENCIES

### PREREQUISITES
- Existing Prisma schema models (communities, posts, comments)
- NestJS module structure in place
- Current WebSocket infrastructure operational
- JWT authentication strategy configured

### BLOCKING DEPENDENCIES
- mentara-commons package constants migration completion (Frontend Agent)
- Infrastructure readiness for new features (AI/DevOps Agent)

## DETAILED TASKS

### PHASE 1: Authentication & Infrastructure Migration (HIGH PRIORITY)

#### 1.1 JWT Authentication Migration
1. **Remove Clerk dependencies from CommunitiesController** (`mentara-api/src/communities/communities.controller.ts`)
   - Replace @CurrentUserId() decorator with JWT-based user extraction
   - Update all community endpoints to use JWT authentication
   - Remove Clerk client initialization and middleware

2. **Remove Clerk dependencies from PostsController** (`mentara-api/src/posts/posts.controller.ts`)
   - Migrate post creation, editing, and deletion to JWT
   - Update user authorization checks
   - Remove Clerk-specific user validation

3. **Update @CurrentUserId() decorator** (`mentara-api/src/decorators/current-user-id.decorator.ts`)
   - Modify to extract user ID from JWT token
   - Maintain backward compatibility during transition
   - Add comprehensive error handling

4. **Update WebSocket authentication** (`mentara-api/src/messaging/services/websocket-auth.service.ts`)
   - Replace Clerk token validation with JWT
   - Update connection authentication flow
   - Implement token refresh mechanism

#### 1.2 Seed Data Modularization (COMPLETED)
**Status**: ✅ COMPLETED - Refactored into modular structure

### PHASE 2: Database Schema Enhancements (HIGH PRIORITY)

#### 2.1 Community Recommendation System
5. **Create CommunityRecommendation model** (`mentara-api/prisma/models/community-recommendations.prisma`)
   ```prisma
   model CommunityRecommendation {
     id                    String   @id @default(uuid())
     userId                String
     communityId           String
     compatibilityScore    Float    // 0.0 to 1.0 compatibility score
     reasoning             String   @db.Text
     assessmentScores      Json     // Raw assessment scores used
     isAccepted           Boolean?  // null=pending, true=joined, false=rejected
     createdAt            DateTime @default(now())
     updatedAt            DateTime @updatedAt
     
     user                 User     @relation("UserCommunityRecommendations", fields: [userId], references: [id], onDelete: Cascade)
     community            Community @relation("CommunityRecommendations", fields: [communityId], references: [id], onDelete: Cascade)
     
     @@unique([userId, communityId])
     @@index([userId, compatibilityScore])
     @@index([communityId, createdAt])
   }
   ```

6. **Create CommunityJoinRequest model** (`mentara-api/prisma/models/community-join-requests.prisma`)
   ```prisma
   model CommunityJoinRequest {
     id                   String              @id @default(uuid())
     userId               String
     communityId          String
     status               JoinRequestStatus   @default(PENDING)
     message              String?             @db.Text
     moderatorId          String?
     moderatorNote        String?             @db.Text
     assessmentProfile    Json?               // User's relevant assessment scores
     createdAt           DateTime            @default(now())
     updatedAt           DateTime            @updatedAt
     processedAt         DateTime?
     
     user                User                @relation("UserJoinRequests", fields: [userId], references: [id], onDelete: Cascade)
     community           Community           @relation("CommunityJoinRequests", fields: [communityId], references: [id], onDelete: Cascade)
     moderator           User?               @relation("ModeratedJoinRequests", fields: [moderatorId], references: [id], onDelete: SetNull)
     
     @@unique([userId, communityId])
     @@index([communityId, status])
     @@index([moderatorId, status])
   }
   
   enum JoinRequestStatus {
     PENDING
     APPROVED
     REJECTED
     CANCELLED
   }
   ```

#### 2.2 Community Analytics Enhancement
7. **Enhance Community model** (`mentara-api/prisma/models/community.prisma`)
   - Add analytics fields (weekly_active_users, post_frequency, engagement_rate)
   - Add community settings (is_private, requires_approval, assessment_matching)
   - Add moderator management fields

### PHASE 3: Assessment-to-Community Mapping Algorithm (CRITICAL)

#### 3.1 Core Mapping Algorithm
8. **Create CommunityMatchingService** (`mentara-api/src/communities/services/community-matching.service.ts`)
   ```typescript
   interface AssessmentCommunityMapping {
     // PHQ-9 (Depression) mapping
     phq9: {
       score: number;
       communities: string[]; // community slugs
       weight: number;
     };
     // GAD-7 (Anxiety) mapping
     gad7: {
       score: number;
       communities: string[];
       weight: number;
     };
     // Additional assessments...
   }
   ```

9. **Implement compatibility scoring algorithm**
   - Calculate user-community compatibility based on assessment scores
   - Weight different assessment types appropriately
   - Consider community demographics and success patterns
   - Generate reasoning text for recommendations

10. **Create assessment change detection**
    - Monitor user assessment updates
    - Trigger community recommendation refresh
    - Notify users of new community matches

#### 3.2 Recommendation Engine
11. **Create CommunityRecommendationService** (`mentara-api/src/communities/services/community-recommendation.service.ts`)
    - Generate personalized community recommendations
    - Implement recommendation caching and refresh logic
    - Track recommendation acceptance/rejection rates
    - A/B testing framework for recommendation algorithms

### PHASE 4: Moderation System Implementation (HIGH PRIORITY)

#### 4.1 Join Request Management
12. **Create JoinRequestService** (`mentara-api/src/communities/services/join-request.service.ts`)
    - Handle join request creation and validation
    - Automatic approval logic for public communities
    - Queue management for moderator review
    - Notification system for request status changes

13. **Create ModerationController** (`mentara-api/src/communities/controllers/moderation.controller.ts`)
    - GET /communities/:id/join-requests (list pending requests)
    - POST /communities/:id/join-requests/:requestId/approve
    - POST /communities/:id/join-requests/:requestId/reject
    - GET /moderation/queue (global moderation queue)

#### 4.2 Content Moderation Enhancement
14. **Enhance existing moderation endpoints**
    - Bulk moderation actions
    - Moderation history tracking
    - Automated flagging system
    - Appeal process implementation

### PHASE 5: Enhanced Community Features (MEDIUM PRIORITY)

#### 5.1 Reddit-like Feature Enhancements
15. **Enhance PostsController** (`mentara-api/src/posts/posts.controller.ts`)
    - Add post categories and tagging
    - Implement advanced sorting (hot, top, controversial)
    - Add post scheduling functionality
    - Cross-posting between communities

16. **Create PostVotingService** (`mentara-api/src/posts/services/post-voting.service.ts`)
    - Upvote/downvote functionality with weighted scoring
    - Vote fraud detection
    - Vote history tracking
    - Karma system implementation

17. **Enhance nested comment system**
    - Comment threading improvements
    - Comment sorting options
    - Comment collapse/expand functionality
    - Comment search within posts

#### 5.2 Community Search & Discovery
18. **Create CommunitySearchService** (`mentara-api/src/communities/services/community-search.service.ts`)
    - Full-text search across communities
    - Filter by categories, member count, activity
    - Search suggestions and autocomplete
    - Search analytics and optimization

### PHASE 6: Real-time Event Broadcasting (MEDIUM PRIORITY)

#### 6.1 WebSocket Event System
19. **Enhance MessagingGateway** (`mentara-api/src/messaging/messaging.gateway.ts`)
    - Add community-specific event rooms
    - Real-time post and comment notifications
    - Live member count updates
    - Typing indicators for posts/comments

20. **Create CommunityEventService** (`mentara-api/src/communities/services/community-event.service.ts`)
    - Event broadcasting for community activities
    - User activity tracking
    - Real-time analytics updates
    - Push notification integration

### PHASE 7: API Endpoint Implementation (HIGH PRIORITY)

#### 7.1 Community Management APIs
21. **Community recommendation endpoints**
    - GET /communities/recommendations (get user recommendations)
    - POST /communities/recommendations/:id/accept
    - POST /communities/recommendations/:id/reject
    - GET /communities/recommendations/refresh

22. **Join request endpoints**
    - POST /communities/:id/join-request
    - GET /communities/:id/join-requests (moderators only)
    - PUT /communities/:id/join-requests/:requestId

#### 7.2 Enhanced Community APIs
23. **Advanced community features**
    - GET /communities/search?q=term&filters={}
    - GET /communities/:id/analytics (moderators only)
    - POST /communities/:id/bulk-actions
    - GET /communities/trending

### PHASE 8: Performance & Analytics (MEDIUM PRIORITY)

#### 8.1 Query Optimization
24. **Database query optimization**
    - Add strategic database indexes
    - Implement query result caching
    - Optimize N+1 query problems
    - Database connection pooling improvements

25. **API performance monitoring**
    - Request timing analytics
    - Slow query identification
    - Memory usage optimization
    - Rate limiting implementation

#### 8.2 Community Analytics
26. **Create CommunityAnalyticsService** (`mentara-api/src/communities/services/community-analytics.service.ts`)
    - Member engagement metrics
    - Post and comment activity tracking
    - Community growth analytics
    - Moderation effectiveness metrics

## SUCCESS CRITERIA

### FUNCTIONAL REQUIREMENTS
- [ ] JWT authentication fully replaces Clerk integration
- [ ] Community recommendation algorithm generates accurate matches (>80% satisfaction)
- [ ] Join request system handles approval workflow efficiently
- [ ] Real-time events broadcast correctly to community members
- [ ] Enhanced post voting and comment threading work seamlessly
- [ ] Search functionality returns relevant results quickly
- [ ] Moderation tools provide comprehensive community management

### PERFORMANCE REQUIREMENTS
- [ ] API response times < 200ms for standard operations
- [ ] Recommendation generation < 500ms
- [ ] Database queries optimized (< 100ms average)
- [ ] WebSocket events delivered < 100ms latency
- [ ] Search results returned < 300ms

### SECURITY REQUIREMENTS
- [ ] JWT authentication properly validates all requests
- [ ] User permissions correctly enforced
- [ ] Moderation actions properly logged and auditable
- [ ] Assessment data privacy maintained
- [ ] Rate limiting prevents abuse

## TESTING REQUIREMENTS

### UNIT TESTING
- Service layer methods with mock dependencies
- Algorithm correctness for community matching
- Database model validation and constraints
- Authentication and authorization logic
- WebSocket event handling

### INTEGRATION TESTING
- End-to-end community recommendation flow
- Join request approval workflow
- Real-time event broadcasting
- Search functionality across communities
- Moderation action workflows

### PERFORMANCE TESTING
- Load testing for community operations
- Database query performance under load
- WebSocket connection scaling
- Search performance with large datasets

## TIMELINE & PRIORITIES

### CRITICAL PATH (Week 1)
- Complete JWT authentication migration
- Implement core recommendation models and algorithms

### HIGH PRIORITY (Week 1-2)
- Join request system implementation
- Enhanced community APIs
- Real-time event broadcasting

### MEDIUM PRIORITY (Week 2-3)
- Advanced search and filtering
- Community analytics
- Performance optimizations

### LOW PRIORITY (Week 3-4)
- Advanced moderation features
- A/B testing framework
- Advanced analytics dashboards

## COORDINATION POINTS

### WITH FRONTEND AGENT
- **Week 1**: API contract finalization for recommendations
- **Week 1**: Join request UI/API integration testing
- **Week 2**: Real-time event integration validation
- **Week 3**: Search and moderation UI testing

### WITH AI/DEVOPS AGENT
- **Week 1**: Database migration deployment
- **Week 2**: Performance monitoring setup
- **Week 3**: Scaling configuration for real-time features

### WITH MANAGER AGENT
- **Daily**: Progress updates and blocker resolution
- **Week 1**: Authentication migration checkpoint
- **Week 2**: Mid-module progress review
- **Week 3**: Performance and security review

## RISK MITIGATION

### HIGH RISK: JWT Migration Complexity
**Risk**: Authentication migration may break existing functionality
**Mitigation**: Implement gradual rollout with feature flags; maintain Clerk fallback temporarily

### HIGH RISK: Recommendation Algorithm Accuracy
**Risk**: Poor recommendations may reduce user engagement
**Mitigation**: Implement A/B testing framework; collect user feedback; iterative improvement

### MEDIUM RISK: Real-time Performance
**Risk**: WebSocket scaling issues with increased community activity
**Mitigation**: Implement connection pooling; optimize event broadcasting; monitor performance

### MEDIUM RISK: Database Performance
**Risk**: Complex queries may slow down as data grows
**Mitigation**: Comprehensive indexing strategy; query optimization; caching implementation

## QUALITY GATES

### CODE REVIEW REQUIREMENTS
- TypeScript compilation without errors
- NestJS best practices adherence
- Comprehensive error handling
- Security validation for authentication changes

### TESTING REQUIREMENTS
- >90% test coverage for new services
- Integration tests passing for all endpoints
- Performance benchmarks met
- Security audit completed for JWT implementation

### DOCUMENTATION REQUIREMENTS
- API documentation updated
- Database schema changes documented
- Algorithm documentation for recommendations
- Deployment guide updated

## COMPLETION CHECKLIST
- [ ] JWT authentication migration completed and tested
- [ ] CommunityRecommendation and CommunityJoinRequest models implemented
- [ ] Assessment-to-community mapping algorithm functional
- [ ] Join request approval system operational
- [ ] Enhanced community features implemented
- [ ] Real-time event broadcasting working
- [ ] Search functionality optimized
- [ ] Performance requirements met
- [ ] Security validation passed
- [ ] Documentation completed
- [ ] Integration testing successful

---
**Document Version**: 1.0  
**Last Updated**: 2025-01-15  
**Next Review**: Weekly during Module 3 implementation  
**Owner**: Backend Agent