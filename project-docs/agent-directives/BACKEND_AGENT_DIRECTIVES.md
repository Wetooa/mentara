# 🎯 BACKEND AGENT - URGENT DIRECTIVES

**From**: Manager Agent  
**To**: Backend Agent  
**Priority**: HIGH  
**Date**: 2025-01-14  

## 📋 CURRENT STATUS ASSESSMENT

✅ **EXCELLENT PROGRESS**:
- JWT AuthService implementation completed
- JwtAuthGuard properly implemented 
- RefreshToken model ready in database

🔄 **IMMEDIATE PRIORITY**: Controller Migration - 17 controllers still using ClerkAuthGuard

---

## 🚨 **URGENT TASK: CONTROLLER MIGRATION**

### **CONTROLLERS REQUIRING IMMEDIATE MIGRATION**

**Phase 1 - Core Controllers (Complete TODAY)**:
1. `dashboard/dashboard.controller.ts` - User dashboards (CRITICAL)
2. `auth/auth.controller.ts` - Authentication endpoints (CRITICAL) 
3. `users/users.controller.ts` - User management (CRITICAL)

**Phase 2 - Community Controllers (Complete by EOD)**:
4. `communities/communities.controller.ts` - Community management
5. `posts/posts.controller.ts` - Post creation/management  
6. `comments/comments.controller.ts` - Comment functionality

**Phase 3 - Communication Controllers (Complete Tomorrow)**:
7. `messaging/messaging.controller.ts` - Real-time messaging
8. `meetings/meetings.controller.ts` - Video call management
9. `notifications/notifications.controller.ts` - User notifications

### **MIGRATION PATTERN**

**FROM**:
```typescript
import { ClerkAuthGuard } from '../guards/clerk-auth.guard';
@UseGuards(ClerkAuthGuard)
```

**TO**:
```typescript
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
@UseGuards(JwtAuthGuard)
```

**VERIFY**: Ensure all decorators still work:
- `@CurrentUserId()` should return user.userId
- `@CurrentUserRole()` should return user.role

---

## 🔧 **WEBSOCKET AUTHENTICATION - CRITICAL**

### **IMMEDIATE ACTION REQUIRED**

**File**: `mentara-api/src/messaging/services/websocket-auth.service.ts`

**Current Issue**: Still using `@clerk/backend`
```typescript
import { verifyToken } from '@clerk/backend';
```

**Required Change**: Update to use JWT validation
```typescript
import { JwtService } from '@nestjs/jwt';

// Replace Clerk token verification with JWT validation
async authenticateSocket(client: Socket): Promise<any> {
  const token = this.extractTokenFromSocket(client);
  try {
    const payload = this.jwtService.verify(token);
    // Validate user exists in database
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub, deactivatedAt: null }
    });
    return user;
  } catch (error) {
    throw new WsException('Invalid authentication token');
  }
}
```

---

## 📊 **PROGRESS TRACKING**

### **TODAY'S TARGETS**
- [ ] Complete 3 core controller migrations
- [ ] Update WebSocket authentication 
- [ ] Test JWT functionality on migrated controllers

### **SUCCESS METRICS**
- Controllers migrated: Target 6/17 by end of day
- WebSocket auth: 100% functional with JWT
- Zero authentication errors in development

---

## 🧪 **TESTING REQUIREMENTS**

### **AFTER EACH CONTROLLER MIGRATION**
1. **Test Authentication**: Verify JWT tokens work
2. **Test Authorization**: Verify role-based access
3. **Test Decorators**: Verify @CurrentUserId() and @CurrentUserRole()
4. **Test Error Handling**: Verify proper error responses

### **INTEGRATION TESTING**
- Real-time messaging with JWT authentication
- Video calls with JWT authentication  
- Community features with JWT authentication

---

## 🚨 **CRITICAL INTEGRATION POINTS**

### **WebSocket Authentication Priority**
- **Impact**: Affects messaging, video calls, real-time notifications
- **Deadline**: Must be completed before Frontend Agent begins
- **Testing**: Ensure Socket.io connections work with JWT tokens

### **Database Schema Updates**
- **User Model**: Verify passwordHash, emailVerified fields exist
- **Email Verification**: Implement email verification service
- **Password Reset**: Implement secure password reset flow

---

## 🤝 **COORDINATION WITH OTHER AGENTS**

### **Frontend Agent Dependencies**
- Frontend Agent waiting for JWT authentication stability
- Must complete core controllers before frontend begins migration
- WebSocket auth critical for real-time features

### **AI/DevOps Agent Coordination**
- Testing infrastructure depends on stable authentication
- Security validation requires complete JWT implementation
- Performance testing blocked until auth migration complete

---

## 📞 **IMMEDIATE SUPPORT AVAILABLE**

### **Manager Agent Assistance**
- Architecture guidance for complex integrations
- Quality gate validation and testing support
- Risk mitigation for critical authentication changes

### **Escalation Protocol**
- Any blocking issues should be flagged immediately
- WebSocket authentication complications need immediate attention
- Performance impacts from JWT changes require assessment

---

## 🎯 **SUCCESS CRITERIA**

### **Phase 1 Complete (Today)**
- [ ] 3 core controllers migrated and tested
- [ ] WebSocket authentication functional with JWT
- [ ] Zero breaking changes to existing functionality

### **Phase 2 Complete (Tomorrow)**
- [ ] 6+ additional controllers migrated
- [ ] All real-time features working with JWT
- [ ] Ready for Frontend Agent to begin migration

### **Quality Gates**
- [ ] All migrated controllers pass authentication tests
- [ ] WebSocket connections stable with JWT tokens
- [ ] Performance impact < 10ms per request

---

**NEXT CHECK-IN**: 4 hours - Progress update on core controller migration

**Manager Agent Standing By**: Ready to assist with integration challenges and quality validation.

---

*This directive is part of the coordinated Clerk to Local Auth migration. Success depends on systematic execution and thorough testing.*