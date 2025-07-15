# FRONTEND AGENT MODULE 3: COMMUNITY INTEGRATION DIRECTIVE

## OBJECTIVE
Implement comprehensive community integration features for the Mentara platform, transforming the mental health platform into a fully-featured community-driven experience with Reddit-like and Discord-like features, assessment-based community matching, and seamless user onboarding.

## SCOPE

### INCLUDED
- Questionnaire constants migration to mentara-commons package
- Community dashboard UI components
- Reddit-like post creation, voting, and nested comment systems
- Discord-like navigation with channel/room organization
- Moderation interface for community moderators
- Assessment-to-community onboarding flow
- Import updates throughout frontend codebase
- Community recommendation interface
- Join request approval workflow

### EXCLUDED
- Backend API implementation (Backend Agent responsibility)
- Database model creation (Backend Agent responsibility)
- Infrastructure setup (AI/DevOps Agent responsibility)
- Project coordination (Manager Agent responsibility)

## DEPENDENCIES

### PREREQUISITES
- Completed questionnaire constants migration (PHASE 1.1 - COMPLETED)
- mentara-commons package build system functional
- Backend community APIs implemented
- JWT authentication system in place

### BLOCKING DEPENDENCIES
- Assessment-to-community mapping algorithm (Backend Agent)
- CommunityRecommendation and CommunityJoinRequest models (Backend Agent)
- Community API endpoints implementation (Backend Agent)

## DETAILED TASKS

### PHASE 1: Constants Migration & Import Updates (COMPLETED)
**Status**: ✅ COMPLETED
1. Move questionnaire constants from `mentara-client/constants/questionnaire/` to `mentara-commons/constants/questionnaire/`
2. Update all frontend imports to use commons package

### PHASE 2: Core Community Components (HIGH PRIORITY)

#### 2.1 Community Dashboard Components
3. **Create CommunityDashboard component** (`mentara-client/components/community/CommunityDashboard.tsx`)
   - Community overview cards
   - Recommended communities section
   - Recent activity feed
   - Quick join/leave functionality

4. **Create CommunityCard component** (`mentara-client/components/community/CommunityCard.tsx`)
   - Community thumbnail and description
   - Member count and activity stats
   - Join/Leave button with loading states
   - Moderator indicators

5. **Create CommunityRecommendations component** (`mentara-client/components/community/CommunityRecommendations.tsx`)
   - Assessment-based recommendations
   - Manual browse functionality
   - Category filtering
   - Search capabilities

#### 2.2 Reddit-like Post System
6. **Create PostList component** (`mentara-client/components/community/posts/PostList.tsx`)
   - Infinite scrolling implementation
   - Sorting options (hot, new, top)
   - Vote display and interaction
   - Post preview with expand functionality

7. **Create PostItem component** (`mentara-client/components/community/posts/PostItem.tsx`)
   - Post title, content preview, author info
   - Upvote/downvote functionality
   - Comment count and preview
   - Share and report options

8. **Create PostCreation component** (`mentara-client/components/community/posts/PostCreation.tsx`)
   - Rich text editor integration
   - Image/file upload capability
   - Post categories selection
   - Draft save functionality

9. **Create PostDetail component** (`mentara-client/components/community/posts/PostDetail.tsx`)
   - Full post content display
   - Nested comment tree
   - Real-time comment updates
   - Post voting and sharing

#### 2.3 Comment System
10. **Create CommentTree component** (`mentara-client/components/community/comments/CommentTree.tsx`)
    - Nested comment rendering
    - Collapse/expand functionality
    - Threading indicators
    - Load more replies

11. **Create CommentItem component** (`mentara-client/components/community/comments/CommentItem.tsx`)
    - Comment content and metadata
    - Reply functionality
    - Voting system
    - Edit/delete options

12. **Create CommentForm component** (`mentara-client/components/community/comments/CommentForm.tsx`)
    - Reply composition interface
    - Rich text formatting
    - Auto-save drafts
    - Character limit indicators

### PHASE 3: Discord-like Navigation System (MEDIUM PRIORITY)

#### 3.1 Navigation Components
13. **Create CommunityNavigation component** (`mentara-client/components/community/navigation/CommunityNavigation.tsx`)
    - Sidebar with community list
    - Room/channel organization
    - Unread indicators
    - Search functionality

14. **Create CommunityChannels component** (`mentara-client/components/community/navigation/CommunityChannels.tsx`)
    - Channel list for each community
    - Different channel types (general, support, resources)
    - Join/leave channel functionality
    - Notification settings per channel

15. **Create RoomSearch component** (`mentara-client/components/community/navigation/RoomSearch.tsx`)
    - Global community search
    - Filter by categories
    - Recent communities
    - Recommended joins

### PHASE 4: Moderation Interface (MEDIUM PRIORITY)

#### 4.1 Moderator Components
16. **Create ModerationDashboard component** (`mentara-client/components/moderation/ModerationDashboard.tsx`)
    - Pending content queue
    - Reported posts/comments
    - Community statistics
    - Quick action buttons

17. **Create ContentQueue component** (`mentara-client/components/moderation/ContentQueue.tsx`)
    - List of content needing review
    - Bulk actions (approve/reject)
    - Filter and search capabilities
    - Priority indicators

18. **Create JoinRequestQueue component** (`mentara-client/components/moderation/JoinRequestQueue.tsx`)
    - User join requests list
    - User profile preview
    - Assessment compatibility scores
    - Approve/reject actions

### PHASE 5: Assessment Integration & Onboarding (HIGH PRIORITY)

#### 5.1 Onboarding Flow
19. **Create AssessmentOnboarding component** (`mentara-client/components/onboarding/AssessmentOnboarding.tsx`)
    - Post-assessment community recommendations
    - Community preview with compatibility scores
    - Guided community selection
    - Skip option with manual browse

20. **Create CommunityCompatibility component** (`mentara-client/components/community/CommunityCompatibility.tsx`)
    - Visual compatibility score display
    - Reasoning explanation
    - Success stories from similar users
    - Privacy reassurance

### PHASE 6: Hooks & State Management (HIGH PRIORITY)

#### 6.1 Community Hooks
21. **Enhance useCommunities hook** (`mentara-client/hooks/useCommunities.ts`)
    - Add join request functionality
    - Community search and filtering
    - Recommendation fetching
    - Real-time member count updates

22. **Create useCommunityPosts hook** (`mentara-client/hooks/community/useCommunityPosts.ts`)
    - Post CRUD operations
    - Voting functionality
    - Post filtering and sorting
    - Real-time post updates

23. **Create useCommunityComments hook** (`mentara-client/hooks/community/useCommunityComments.ts`)
    - Comment CRUD operations
    - Nested comment handling
    - Real-time comment updates
    - Comment voting

24. **Create useModeration hook** (`mentara-client/hooks/useModeration.ts`)
    - Content moderation actions
    - Join request management
    - Bulk operations
    - Moderation analytics

#### 6.2 API Service Updates
25. **Enhance communities API service** (`mentara-client/lib/api/services/communities.ts`)
    - Add join request endpoints
    - Community search functionality
    - Recommendation endpoints
    - Assessment integration

26. **Create posts API service** (`mentara-client/lib/api/services/posts.ts`)
    - Post CRUD operations
    - Voting endpoints
    - Search and filtering
    - Category management

### PHASE 7: Pages & Routing (MEDIUM PRIORITY)

#### 7.1 Community Pages
27. **Create Community page** (`mentara-client/app/(protected)/user/communities/page.tsx`)
    - Community dashboard layout
    - Sidebar navigation
    - Main content area
    - Mobile-responsive design

28. **Create CommunityDetail page** (`mentara-client/app/(protected)/user/communities/[id]/page.tsx`)
    - Individual community view
    - Post list and creation
    - Community information sidebar
    - Member list

29. **Create PostDetail page** (`mentara-client/app/(protected)/user/communities/[id]/posts/[postId]/page.tsx`)
    - Full post content
    - Comment tree
    - Related posts
    - Community context

## SUCCESS CRITERIA

### FUNCTIONAL REQUIREMENTS
- [ ] All questionnaire imports updated to use mentara-commons package
- [ ] Users can browse and search communities
- [ ] Users can create, edit, and delete posts with rich content
- [ ] Nested comment system works with real-time updates
- [ ] Voting system functions for posts and comments
- [ ] Moderators can review and approve/reject content and join requests
- [ ] Assessment-based community recommendations work accurately
- [ ] Post-assessment onboarding guides users to relevant communities

### PERFORMANCE REQUIREMENTS
- [ ] Community dashboard loads in < 2 seconds
- [ ] Post list pagination works smoothly
- [ ] Real-time updates have < 500ms latency
- [ ] Search results return in < 1 second
- [ ] Mobile interface is fully responsive

### USER EXPERIENCE REQUIREMENTS
- [ ] Intuitive navigation between communities and posts
- [ ] Clear visual hierarchy for nested comments
- [ ] Accessible design with proper ARIA labels
- [ ] Consistent design with existing platform components

## TESTING REQUIREMENTS

### UNIT TESTING
- Component rendering tests for all new components
- Hook functionality tests with mock data
- API service tests with mock responses
- Utility function tests for formatting and validation

### INTEGRATION TESTING
- Post creation and commenting workflow
- Voting system integration
- Moderation workflow testing
- Community join/leave process
- Assessment-to-community recommendation flow

### E2E TESTING
- Complete community onboarding journey
- Post creation, commenting, and moderation workflow
- Cross-browser compatibility testing
- Mobile responsiveness validation

## TIMELINE & PRIORITIES

### CRITICAL PATH (Week 1-2)
- Complete remaining import updates
- Core community dashboard components
- Basic post and comment functionality

### HIGH PRIORITY (Week 2-3)
- Assessment integration and onboarding
- Moderation interface
- Real-time updates implementation

### MEDIUM PRIORITY (Week 3-4)
- Enhanced navigation features
- Advanced search and filtering
- Mobile optimization

### LOW PRIORITY (Week 4+)
- Advanced moderation tools
- Community analytics
- Performance optimizations

## COORDINATION POINTS

### WITH BACKEND AGENT
- **Week 1**: Confirm API endpoint specifications
- **Week 2**: Test community and post API integration
- **Week 3**: Validate moderation endpoints
- **Week 4**: End-to-end integration testing

### WITH AI/DEVOPS AGENT
- **Week 1**: Confirm mentara-commons package build process
- **Week 2**: Validate CDN setup for community assets
- **Week 3**: Performance monitoring setup

### WITH MANAGER AGENT
- **Weekly**: Progress updates and blocker resolution
- **Week 2**: Mid-module checkpoint review
- **Week 4**: Module completion assessment

## RISK MITIGATION

### HIGH RISK: Real-time Updates Complexity
**Risk**: Real-time comment and post updates may cause performance issues
**Mitigation**: Implement efficient WebSocket event handling with debouncing and smart re-rendering

### MEDIUM RISK: Assessment Integration Delays
**Risk**: Assessment-to-community mapping algorithm delays could block onboarding
**Mitigation**: Create mock recommendations for testing; implement progressive enhancement

### MEDIUM RISK: Mobile Responsiveness
**Risk**: Complex nested comment UI may not work well on mobile
**Mitigation**: Mobile-first design approach; simplified mobile comment interface

## QUALITY GATES

### CODE REVIEW REQUIREMENTS
- All components must pass TypeScript compilation
- ESLint and Prettier compliance
- Accessibility audit using react-axe
- Performance profiling for heavy components

### INTEGRATION REQUIREMENTS
- API integration tests passing
- Real-time feature testing with WebSocket
- Cross-browser compatibility verified
- Mobile responsiveness validated

### SECURITY VALIDATION
- User input sanitization verified
- Authentication state properly managed
- Moderation permissions enforced
- Content reporting system functional

## COMPLETION CHECKLIST
- [ ] All questionnaire constants migrated to mentara-commons
- [ ] Import updates completed throughout frontend
- [ ] Community dashboard fully functional
- [ ] Post creation and commenting system operational
- [ ] Moderation interface implemented
- [ ] Assessment-based onboarding working
- [ ] Real-time updates functioning
- [ ] Mobile responsiveness achieved
- [ ] Testing suite completed
- [ ] Documentation updated
- [ ] Code review and security audit passed

---
**Document Version**: 1.0  
**Last Updated**: 2025-01-15  
**Next Review**: Weekly during Module 3 implementation  
**Owner**: Frontend Agent