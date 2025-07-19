# ADR-004: Comprehensive Route-Level Error Boundaries

**Date**: 2025-01-19  
**Status**: ✅ Accepted  
**Decision Maker**: Frontend Architecture Team  

## 📋 Context

The Mentara client application needed robust error handling to provide graceful degradation when JavaScript errors occur. Without proper error boundaries, a single component error could crash the entire application, leading to poor user experience and lost user progress.

## 🎯 Problem Statement

1. **Global Crashes**: Component errors were causing full application crashes
2. **Poor UX**: Users lost their progress when errors occurred
3. **Unclear Recovery**: No clear path for users to recover from errors
4. **Role Context Loss**: Generic error messages didn't account for user roles
5. **Developer Experience**: Difficult to debug errors in production

## ✅ Decision

Implement a **hierarchical error boundary system** with role-specific error handling at multiple application levels:

### Error Boundary Hierarchy

```
app/
├── error.tsx                 # Global error boundary
├── loading.tsx               # Global loading state
├── (protected)/
│   ├── error.tsx            # Protected routes error boundary
│   ├── loading.tsx          # Protected routes loading state
│   ├── admin/
│   │   ├── error.tsx        # Admin-specific error handling
│   │   └── loading.tsx      # Admin loading states
│   ├── therapist/
│   │   ├── error.tsx        # Therapist-specific error handling
│   │   └── loading.tsx      # Therapist loading states
│   └── user/
│       ├── error.tsx        # User-specific error handling
│       └── loading.tsx      # User loading states
└── (public)/
    ├── error.tsx            # Public routes error boundary
    ├── loading.tsx          # Public loading states
    └── (auth)/
        ├── error.tsx        # Auth-specific error handling
        └── loading.tsx      # Auth loading states
```

## 🏗️ Implementation Details

### 1. Global Error Boundary (`app/error.tsx`)
- **Purpose**: Catch any unhandled errors across the entire application
- **Features**: 
  - Full-page error UI with HTML/body fallback
  - Development error details with stack traces
  - Recovery options (retry, go home)
  - Error logging to monitoring services

### 2. Protected Routes Error Boundary (`app/(protected)/error.tsx`)
- **Purpose**: Handle errors in authenticated areas
- **Features**:
  - Authentication-aware error messages
  - Logout option for potential auth-related errors
  - Session recovery suggestions

### 3. Role-Specific Error Boundaries
- **Admin Error Boundary**: Emphasizes data security and admin context
- **Therapist Error Boundary**: Reassures about patient data safety
- **User Error Boundary**: Focuses on progress preservation

### 4. Public Routes Error Boundary
- **Purpose**: Handle errors in marketing and auth pages
- **Features**: Simple recovery with homepage redirect

## 🎨 User Experience Design

### Error Messages by Context

```typescript
// Admin errors emphasize security
"Admin Panel Error - Sensitive data is secure"

// Therapist errors emphasize patient safety  
"Therapist Panel Error - Patient data is safe"

// User errors emphasize progress preservation
"Dashboard Error - Your progress is safe"

// Auth errors provide clear recovery
"Authentication Error - Please try signing in again"
```

### Recovery Actions

1. **Primary Action**: "Try Again" - Retry the failed operation
2. **Secondary Action**: Context-specific navigation (dashboard, home, logout)
3. **Development Info**: Error details in development mode only

## 🔧 Technical Implementation

### Error Boundary Component Pattern

```typescript
'use client';

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  // Error logging
  React.useEffect(() => {
    console.error('Error boundary triggered:', error);
  }, [error]);

  // Context-specific UI and recovery options
  return (
    <ErrorUI 
      error={error} 
      reset={reset}
      context="specific-area"
    />
  );
}
```

### Loading States Pattern

```typescript
export default function LoadingState() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <RoleIcon className="h-6 w-6 text-primary" />
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading context...</p>
      </div>
    </div>
  );
}
```

## ✅ Benefits

### 1. **Improved User Experience**
- **Graceful Degradation**: Errors don't crash the entire app
- **Context Awareness**: Error messages tailored to user role and location
- **Clear Recovery**: Users know exactly how to recover
- **Progress Preservation**: Work is not lost due to errors

### 2. **Better Developer Experience**
- **Debugging**: Error boundaries catch and log errors with context
- **Development Mode**: Detailed error information in development
- **Monitoring**: Integration points for error tracking services
- **Maintainability**: Centralized error handling patterns

### 3. **Production Reliability**
- **Fault Isolation**: Errors contained to specific app sections
- **Automatic Recovery**: Users can retry failed operations
- **Monitoring Integration**: Errors automatically logged with context
- **User Retention**: Reduced abandonment due to crashes

## ⚠️ Considerations

### 1. **Error Boundary Limitations**
- Only catch errors during rendering, lifecycle methods, and constructors
- Don't catch errors in event handlers (use try-catch)
- Don't catch errors in async code (use error states)
- Server-side errors need separate handling

### 2. **Maintenance Requirements**
- Error boundaries need testing across different error scenarios
- Error messages should be reviewed for user-friendliness
- Recovery flows need validation across user roles
- Error logging integration requires monitoring setup

### 3. **Performance Impact**
- Minimal: Error boundaries only activate during errors
- Loading states add small bundle size for better UX
- Error UI components loaded only when needed

## 🔄 Future Improvements

### 1. **Enhanced Error Reporting**
```typescript
// Automatic error reporting with user context
const reportError = (error: Error, context: ErrorContext) => {
  analytics.captureException(error, {
    user: getCurrentUser(),
    route: getCurrentRoute(),
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
    ...context
  });
};
```

### 2. **Smart Recovery Suggestions**
```typescript
// Context-aware recovery suggestions
const getRecoveryActions = (error: Error, userRole: UserRole) => {
  if (error.message.includes('network')) {
    return ['Check internet connection', 'Retry request'];
  }
  
  if (userRole === 'therapist' && error.message.includes('patient')) {
    return ['Refresh patient data', 'Contact support'];
  }
  
  return ['Try again', 'Go to dashboard'];
};
```

### 3. **Error Prevention**
```typescript
// Proactive error detection
const useErrorPrevention = () => {
  useEffect(() => {
    // Check for common error conditions
    if (isOffline()) showOfflineWarning();
    if (isLowMemory()) suggestRefresh();
    if (hasStaleData()) refreshData();
  }, []);
};
```

## 📊 Success Metrics

### Error Recovery Rate
- **Target**: >90% of users successfully recover from errors
- **Measurement**: Error boundary reset clicks vs error occurrences

### User Experience
- **Target**: <2% user abandonment due to errors
- **Measurement**: Session continuation after error boundary activation

### Developer Productivity
- **Target**: 50% faster error debugging
- **Measurement**: Time from error report to resolution

## 🔗 Related Decisions

- **ADR-001**: Next.js App Router choice enables file-based error boundaries
- **ADR-003**: shadcn/ui provides consistent error UI components
- **Future ADR**: Error monitoring service integration

## 📝 Change Log

- **2025-01-19**: Initial implementation of hierarchical error boundaries
- **Future**: Enhanced error reporting and smart recovery features

---

**Implementation Status**: ✅ Complete  
**Next Review**: Q2 2025  
**Owner**: Frontend Architecture Team