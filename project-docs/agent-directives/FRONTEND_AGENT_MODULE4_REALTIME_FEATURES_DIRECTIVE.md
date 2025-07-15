# FRONTEND AGENT MODULE 4: REAL-TIME PLATFORM FEATURES DIRECTIVE

## OBJECTIVE
Implement the most comprehensive and technically challenging module of the Mentara platform, delivering real-time payment processing, video call capabilities, instant messaging, push notifications, and interactive worksheets to create a fully-featured, modern mental health platform with seamless real-time user experiences.

## SCOPE

### INCLUDED
- Complete billing and payment system with Stripe integration
- Video call interface with Jitsi Meet integration
- Real-time notification system with WebSocket and push notifications
- Enhanced worksheets system with real-time submission and feedback
- Real-time chat system (client-client, therapist-therapist, client-therapist)
- Real-time booking system with live availability updates
- Service worker implementation for offline capabilities
- Progressive Web App (PWA) features
- Cross-feature integration and unified user experience

### EXCLUDED
- Backend API implementation (Backend Agent responsibility)
- Infrastructure setup and video servers (AI/DevOps Agent responsibility)
- Database model creation (Backend Agent responsibility)
- Project coordination (Manager Agent responsibility)

## DEPENDENCIES

### PREREQUISITES
- Existing hooks architecture and React Query setup
- API service layer established
- WebSocket infrastructure operational
- Authentication system stable

### BLOCKING DEPENDENCIES
- Backend billing and payment APIs (Backend Agent)
- Video call infrastructure setup (AI/DevOps Agent)
- Real-time WebSocket enhancements (Backend Agent)
- Push notification infrastructure (AI/DevOps Agent)

## DETAILED TASKS

### PHASE 1: Payment & Billing System (WEEK 1-2)

#### 1.1 Billing API Service Implementation
1. **Create comprehensive billing API service** (`mentara-client/lib/api/services/billing.ts`)
   ```typescript
   interface BillingService {
     // Subscription management
     subscriptions: {
       getCurrent(): Promise<Subscription>;
       create(planId: string): Promise<Subscription>;
       update(subscriptionId: string, updates: SubscriptionUpdate): Promise<Subscription>;
       cancel(subscriptionId: string, reason?: string): Promise<void>;
       reactivate(subscriptionId: string): Promise<Subscription>;
     };
     
     // Payment methods
     paymentMethods: {
       getAll(): Promise<PaymentMethod[]>;
       add(paymentMethodData: CreatePaymentMethod): Promise<PaymentMethod>;
       update(id: string, updates: UpdatePaymentMethod): Promise<PaymentMethod>;
       delete(id: string): Promise<void>;
       setDefault(id: string): Promise<void>;
     };
     
     // Invoices and billing history
     invoices: {
       getAll(params?: InvoiceListParams): Promise<InvoiceListResponse>;
       getById(id: string): Promise<Invoice>;
       download(id: string): Promise<Blob>;
       pay(id: string, paymentMethodId?: string): Promise<Payment>;
     };
     
     // Payment processing
     payments: {
       process(amount: number, paymentMethodId: string, metadata?: any): Promise<Payment>;
       refund(paymentId: string, amount?: number): Promise<Refund>;
       getHistory(params?: PaymentHistoryParams): Promise<PaymentHistoryResponse>;
     };
   }
   ```

#### 1.2 Billing Hooks Implementation
2. **Create comprehensive billing hooks** (`mentara-client/hooks/useBilling.ts`)
   - `useSubscription()` - current subscription management
   - `usePaymentMethods()` - payment method CRUD operations
   - `useInvoices()` - invoice management and history
   - `useBillingSettings()` - billing preferences and notifications

3. **Create specialized billing hooks** (`mentara-client/hooks/billing/`)
   - `useStripeIntegration.ts` - Stripe Elements and payment processing
   - `useSubscriptionUpgrade.ts` - subscription tier upgrades
   - `usePaymentRetry.ts` - failed payment retry logic
   - `useBillingAnalytics.ts` - usage and billing analytics

#### 1.3 Payment UI Components
4. **Create Stripe payment components** (`mentara-client/components/billing/`)
   - `PaymentMethodForm.tsx` - Stripe Elements integration for adding payment methods
   - `SubscriptionUpgrade.tsx` - subscription tier selection and upgrade flow
   - `BillingDashboard.tsx` - comprehensive billing overview
   - `InvoiceViewer.tsx` - invoice display and download functionality
   - `PaymentHistory.tsx` - payment history with search and filtering

5. **Create billing management components**
   - `BillingSettings.tsx` - billing preferences and notifications
   - `UsageMetrics.tsx` - subscription usage tracking and limits
   - `BillingAlert.tsx` - payment failure and expiration notifications

### PHASE 2: Video Call System (WEEK 3-4)

#### 2.1 Video Call Infrastructure
6. **Create video call API service** (`mentara-client/lib/api/services/video-calls.ts`)
   ```typescript
   interface VideoCallService {
     // Meeting room management
     rooms: {
       create(meetingId: string): Promise<VideoRoom>;
       join(roomId: string): Promise<JoinRoomResponse>;
       leave(roomId: string): Promise<void>;
       end(roomId: string): Promise<void>;
     };
     
     // Participant management
     participants: {
       getList(roomId: string): Promise<Participant[]>;
       mute(roomId: string, participantId: string): Promise<void>;
       kick(roomId: string, participantId: string): Promise<void>;
     };
     
     // Recording management
     recording: {
       start(roomId: string): Promise<Recording>;
       stop(roomId: string): Promise<Recording>;
       getRecordings(meetingId: string): Promise<Recording[]>;
     };
   }
   ```

#### 2.2 Video Call Hooks
7. **Create video call hooks** (`mentara-client/hooks/video/`)
   - `useVideoRoom.ts` - room creation, joining, and management
   - `useVideoControls.ts` - camera, microphone, and screen sharing controls
   - `useParticipants.ts` - participant list and management
   - `useRecording.ts` - session recording functionality
   - `useVideoQuality.ts` - connection quality monitoring and optimization

#### 2.3 Video Call Components
8. **Create comprehensive video interface** (`mentara-client/components/video/`)
   - `VideoMeetingRoom.tsx` - main video conference interface
   - `VideoControls.tsx` - camera, mic, screen share, recording controls
   - `ParticipantGrid.tsx` - dynamic participant video layout
   - `ParticipantsList.tsx` - participant management sidebar
   - `ChatInVideo.tsx` - in-meeting chat functionality

9. **Create video call management components**
   - `VideoSettings.tsx` - camera/microphone device selection
   - `ConnectionQuality.tsx` - network quality indicator
   - `RecordingIndicator.tsx` - recording status and controls
   - `ScreenShareControls.tsx` - screen sharing management

### PHASE 3: Real-time Notifications (WEEK 2-3)

#### 3.1 Enhanced Notification System
10. **Enhance existing notification hooks** (`mentara-client/hooks/useNotifications.ts`)
    - Add real-time WebSocket notification updates
    - Implement notification categories and priorities
    - Add notification action handling (accept/reject, view, etc.)
    - Implement notification preferences and filtering

11. **Create push notification system** (`mentara-client/hooks/usePushNotifications.ts`)
    ```typescript
    interface PushNotificationHook {
      // Service worker management
      registerServiceWorker(): Promise<void>;
      requestPermission(): Promise<NotificationPermission>;
      
      // Push subscription management
      subscribeToPush(): Promise<PushSubscription>;
      unsubscribeFromPush(): Promise<void>;
      
      // Notification handling
      showNotification(notification: NotificationData): Promise<void>;
      handleNotificationClick(event: NotificationEvent): void;
    }
    ```

#### 3.2 Notification Components
12. **Create notification UI components** (`mentara-client/components/notifications/`)
    - `NotificationCenter.tsx` - centralized notification management
    - `NotificationItem.tsx` - individual notification display with actions
    - `NotificationSettings.tsx` - notification preferences management
    - `PushPermissionPrompt.tsx` - push notification permission request

13. **Create real-time notification features**
    - `LiveNotificationBadge.tsx` - real-time unread count indicator
    - `NotificationToast.tsx` - temporary notification overlays
    - `NotificationHistory.tsx` - historical notification management

### PHASE 4: Enhanced Worksheets System (WEEK 2-3)

#### 4.1 Worksheets Enhancement
14. **Enhance existing worksheet hooks** (`mentara-client/hooks/useWorksheets.ts`)
    - Add real-time worksheet assignment notifications
    - Implement auto-save functionality for worksheet responses
    - Add collaborative worksheet features
    - Implement worksheet progress tracking

15. **Create advanced worksheet hooks** (`mentara-client/hooks/worksheets/`)
    - `useWorksheetProgress.ts` - progress tracking and analytics
    - `useWorksheetAutoSave.ts` - automatic draft saving
    - `useWorksheetCollaboration.ts` - real-time collaborative editing
    - `useWorksheetTemplates.ts` - worksheet template management

#### 4.2 Enhanced Worksheet Components
16. **Create advanced worksheet components** (`mentara-client/components/worksheets/`)
    - `WorksheetEditor.tsx` - rich text editor for worksheet responses
    - `WorksheetProgress.tsx` - visual progress indicator
    - `WorksheetFeedback.tsx` - therapist feedback display and interaction
    - `WorksheetTemplates.tsx` - template selection and customization

17. **Create worksheet management features**
    - `WorksheetCalendar.tsx` - due date management and scheduling
    - `WorksheetAnalytics.tsx` - progress analytics and insights
    - `WorksheetSharing.tsx` - secure worksheet sharing with therapists

### PHASE 5: Real-time Chat System (WEEK 3-4)

#### 5.1 Enhanced Messaging System
18. **Enhance existing messaging hooks** (`mentara-client/hooks/messaging/`)
    - Add typing indicators to `useWebSocket.ts`
    - Implement message reactions and emoji support
    - Add file and image sharing capabilities
    - Implement message search and history

19. **Create specialized chat hooks** (`mentara-client/hooks/messaging/`)
    - `useMessageReactions.ts` - message reactions and emoji support
    - `useFileSharing.ts` - file upload and sharing in messages
    - `useMessageSearch.ts` - message search and filtering
    - `useConversationSettings.ts` - conversation preferences and settings

#### 5.2 Advanced Chat Components
20. **Create comprehensive chat interface** (`mentara-client/components/chat/`)
    - `ChatInterface.tsx` - unified chat interface for all user types
    - `MessageComposer.tsx` - rich message composition with file upload
    - `MessageReactions.tsx` - emoji reactions and response system
    - `TypingIndicator.tsx` - real-time typing status display

21. **Create chat management features**
    - `ChatSearch.tsx` - message search across conversations
    - `ConversationSettings.tsx` - chat preferences and privacy settings
    - `ChatModeration.tsx` - message moderation for therapists

### PHASE 6: Real-time Booking System (WEEK 2-3)

#### 6.1 Enhanced Booking System
22. **Enhance existing booking hooks** (`mentara-client/hooks/useBooking.ts`)
    - Add real-time availability updates via WebSocket
    - Implement booking conflict detection
    - Add calendar integration capabilities
    - Implement booking reminder system

23. **Create advanced booking hooks** (`mentara-client/hooks/booking/`)
    - `useRealtimeAvailability.ts` - live availability updates
    - `useBookingCalendar.ts` - calendar view and management
    - `useBookingConflicts.ts` - conflict detection and resolution
    - `useBookingReminders.ts` - reminder management and notifications

#### 6.2 Advanced Booking Components
24. **Create enhanced booking interface** (`mentara-client/components/booking/`)
    - `RealtimeCalendar.tsx` - live calendar with availability updates
    - `BookingConflictResolver.tsx` - conflict detection and resolution UI
    - `BookingReminders.tsx` - reminder management interface
    - `AvailabilityIndicator.tsx` - real-time availability status

### PHASE 7: Progressive Web App Features (WEEK 4)

#### 7.1 Service Worker Implementation
25. **Create service worker** (`mentara-client/public/sw.js`)
    - Implement caching strategies for offline functionality
    - Handle push notifications in background
    - Implement background sync for critical operations
    - Add offline page and functionality

26. **Create PWA management hooks** (`mentara-client/hooks/usePWA.ts`)
    - Service worker registration and management
    - Offline status detection and handling
    - App update notifications and management
    - Install prompt management

#### 7.2 Offline Functionality
27. **Create offline components** (`mentara-client/components/offline/`)
    - `OfflineIndicator.tsx` - network status indicator
    - `OfflineFallback.tsx` - offline functionality page
    - `SyncIndicator.tsx` - background sync status
    - `UpdatePrompt.tsx` - app update notification

### PHASE 8: Cross-Feature Integration (WEEK 4)

#### 8.1 Unified User Experience
28. **Create integrated workflows**
    - Payment-to-booking integration (automatic session payments)
    - Worksheet-to-chat integration (discuss worksheets in chat)
    - Video-to-payment integration (session billing)
    - Notification orchestration across all features

29. **Create unified dashboard components** (`mentara-client/components/dashboard/`)
    - `UnifiedDashboard.tsx` - comprehensive platform overview
    - `ActivityFeed.tsx` - real-time activity across all features
    - `QuickActions.tsx` - fast access to common actions
    - `PlatformAnalytics.tsx` - user engagement and usage analytics

#### 8.2 Advanced Integration Features
30. **Create cross-feature components**
    - `IntegratedNotifications.tsx` - unified notification system
    - `CrossFeatureSearch.tsx` - search across all platform features
    - `UnifiedSettings.tsx` - centralized settings management
    - `PlatformOnboarding.tsx` - comprehensive platform introduction

## SUCCESS CRITERIA

### FUNCTIONAL REQUIREMENTS
- [ ] Payment processing works seamlessly with Stripe integration
- [ ] Video calls function with high quality and reliability
- [ ] Real-time notifications delivered instantly (<500ms latency)
- [ ] Worksheets auto-save and provide real-time feedback
- [ ] Chat system supports all user types with real-time features
- [ ] Booking system shows live availability and prevents conflicts
- [ ] PWA features work offline and provide native app experience

### PERFORMANCE REQUIREMENTS
- [ ] Payment forms load in <2 seconds
- [ ] Video calls establish connection in <30 seconds
- [ ] Real-time features have <500ms latency
- [ ] Worksheet auto-save operates in <1 second
- [ ] Chat messages send and receive in <200ms
- [ ] Booking calendar updates in real-time
- [ ] PWA loads offline content in <1 second

### USER EXPERIENCE REQUIREMENTS
- [ ] Seamless integration between all platform features
- [ ] Intuitive navigation across complex feature set
- [ ] Mobile-responsive design for all features
- [ ] Accessible design with proper ARIA labels
- [ ] Consistent design language across all components

### SECURITY REQUIREMENTS
- [ ] Payment data handled securely with PCI compliance
- [ ] Video calls encrypted and access-controlled
- [ ] Real-time communications secured with proper authentication
- [ ] User data privacy maintained across all features

## TESTING REQUIREMENTS

### UNIT TESTING
- Component rendering tests for all new components
- Hook functionality tests with comprehensive mock data
- Payment integration tests with Stripe test mode
- WebSocket event handling tests
- Service worker functionality tests

### INTEGRATION TESTING
- End-to-end payment processing workflow
- Video call session lifecycle testing
- Real-time notification delivery testing
- Cross-feature integration validation
- PWA functionality testing

### PERFORMANCE TESTING
- Video call quality under various network conditions
- Real-time feature latency testing
- Payment processing load testing
- Offline functionality validation
- Mobile performance optimization

### SECURITY TESTING
- Payment security validation
- Video call access control testing
- Real-time communication security
- Data privacy compliance validation

## TIMELINE & PRIORITIES

### CRITICAL PATH (Week 1-2)
- Payment system implementation with Stripe integration
- Real-time notification foundation
- Enhanced worksheet system

### HIGH PRIORITY (Week 2-3)
- Video call system implementation
- Real-time chat enhancements
- Real-time booking system

### MEDIUM PRIORITY (Week 3-4)
- PWA features implementation
- Cross-feature integration
- Advanced UI/UX polish

### LOW PRIORITY (Week 4+)
- Advanced analytics and reporting
- Performance optimizations
- Additional PWA features

## COORDINATION POINTS

### WITH BACKEND AGENT
- **Week 1**: Payment API integration and testing
- **Week 2**: Real-time WebSocket event coordination
- **Week 3**: Video call API integration
- **Week 4**: Cross-feature API validation

### WITH AI/DEVOPS AGENT
- **Week 1**: Stripe infrastructure and security setup
- **Week 2**: Push notification infrastructure
- **Week 3**: Video call server configuration
- **Week 4**: PWA deployment and CDN setup

### WITH MANAGER AGENT
- **Weekly**: Progress updates and integration coordination
- **Week 2**: Mid-module checkpoint and risk assessment
- **Week 4**: Module completion and quality validation

## RISK MITIGATION

### HIGH RISK: Video Call Integration Complexity
**Risk**: Video call implementation may be more complex than anticipated
**Mitigation**: Use proven Jitsi Meet solution; implement in phases; have audio-only fallback

### HIGH RISK: Real-time Performance
**Risk**: Multiple real-time features may impact overall performance
**Mitigation**: Implement efficient WebSocket handling; optimize re-rendering; load testing

### HIGH RISK: Payment Security
**Risk**: Payment integration must meet strict security requirements
**Mitigation**: Use Stripe-hosted forms; follow PCI DSS guidelines; security audit

### MEDIUM RISK: Cross-Feature Complexity
**Risk**: Integration between features may introduce bugs
**Mitigation**: Comprehensive integration testing; modular architecture; gradual rollout

## QUALITY GATES

### PHASE 1 GATE (Payment System)
- [ ] Stripe integration functional and secure
- [ ] Payment workflows tested end-to-end
- [ ] Security audit passed for payment features
- [ ] Performance benchmarks met

### PHASE 2 GATE (Video Calls)
- [ ] Video call connection success rate >95%
- [ ] Audio/video quality meets standards
- [ ] Recording functionality working
- [ ] Security and access control validated

### PHASE 3 GATE (Real-time Features)
- [ ] Real-time notifications <500ms latency
- [ ] Chat system fully functional
- [ ] Booking system conflict-free
- [ ] WebSocket performance optimized

### FINAL GATE (Module Completion)
- [ ] All features integrated and tested
- [ ] PWA functionality operational
- [ ] Security audit completed and passed
- [ ] Performance requirements met
- [ ] User acceptance testing passed

## COMPLETION CHECKLIST
- [ ] Payment and billing system fully functional
- [ ] Video call system operational and reliable
- [ ] Real-time notifications working across all features
- [ ] Enhanced worksheet system with real-time features
- [ ] Chat system supporting all user types
- [ ] Real-time booking system with live updates
- [ ] PWA features implemented and tested
- [ ] Cross-feature integration complete
- [ ] Security audit passed
- [ ] Performance benchmarks met
- [ ] Mobile responsiveness validated
- [ ] Documentation updated
- [ ] User testing completed successfully

---
**Document Version**: 1.0  
**Last Updated**: 2025-01-15  
**Next Review**: Weekly during Module 4 implementation  
**Owner**: Frontend Agent