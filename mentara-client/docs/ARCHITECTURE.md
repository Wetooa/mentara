# 🏗️ Mentara Client Architecture Documentation

> **Last Updated**: January 2025  
> **Version**: 2.0  
> **Status**: Production Ready

## 📋 Table of Contents

1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Architecture Patterns](#architecture-patterns)
5. [State Management](#state-management)
6. [API Integration](#api-integration)
7. [Routing & Navigation](#routing--navigation)
8. [Error Handling](#error-handling)
9. [Performance Strategy](#performance-strategy)
10. [Security Implementation](#security-implementation)
11. [Development Workflow](#development-workflow)
12. [Decision Records](#decision-records)

---

## 🎯 Overview

The **Mentara Client** is a modern, enterprise-grade React application built for the Mentara mental health platform. It serves as the primary interface for clients, therapists, moderators, and administrators.

### Key Characteristics

- **🚀 Modern Stack**: Next.js 15.2.4 with App Router
- **🎨 Design System**: Tailwind CSS 4.x + shadcn/ui components
- **📊 State Management**: Zustand + React Query v5
- **🔒 Security**: JWT authentication with role-based access control
- **♿ Accessibility**: WCAG 2.1 AA compliant
- **📱 Responsive**: Mobile-first responsive design

---

## 🛠️ Technology Stack

### Core Framework
- **Next.js 15.2.4** - React meta-framework with App Router
- **React 18+** - UI library with concurrent features
- **TypeScript 5.x** - Type-safe development

### Styling & UI
- **Tailwind CSS 4.x** - Utility-first CSS framework
- **shadcn/ui** - High-quality accessible component library
- **Radix UI** - Unstyled, accessible UI primitives
- **Framer Motion** - Animation library

### State & Data Management
- **Zustand** - Lightweight state management
- **React Query v5** - Server state management and caching
- **React Hook Form** - Performant form handling
- **Zod** - Schema validation and type inference

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Static type checking
- **Husky** - Git hooks for quality assurance

---

## 📁 Project Structure

```
mentara-client/
├── app/                          # Next.js App Router
│   ├── (protected)/             # Authenticated routes
│   │   ├── admin/               # Admin dashboard
│   │   ├── therapist/           # Therapist interface
│   │   ├── user/                # Client dashboard
│   │   └── moderator/           # Content moderation
│   ├── (public)/               # Public routes
│   │   ├── (auth)/             # Authentication pages
│   │   ├── (static)/           # Landing pages
│   │   └── (therapist)/        # Therapist application
│   ├── api/                    # API routes
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   ├── loading.tsx             # Global loading UI
│   └── error.tsx               # Global error boundary
├── components/                  # Reusable UI components
│   ├── ui/                     # shadcn/ui base components
│   ├── auth/                   # Authentication components
│   ├── dashboard/              # Dashboard components
│   └── [feature]/              # Feature-specific components
├── hooks/                      # Custom React hooks
│   ├── auth/                   # Authentication hooks
│   ├── api/                    # API interaction hooks
│   └── [feature]/              # Feature-specific hooks
├── lib/                        # Utility libraries
│   ├── api/                    # API client and services
│   ├── utils.ts                # General utilities
│   └── queryKeys.ts            # React Query key management
├── store/                      # Zustand state stores
│   ├── auth/                   # Authentication stores
│   └── [feature]/              # Feature-specific stores
├── types/                      # TypeScript type definitions
├── middleware.ts               # Next.js middleware
└── docs/                       # Architecture documentation
```

---

## 🏛️ Architecture Patterns

### 1. **Feature-Based Architecture**

Components, hooks, and stores are organized by feature rather than by type, promoting:
- **Cohesion**: Related code stays together
- **Maintainability**: Easy to find and modify feature code
- **Scalability**: Independent feature development

### 2. **Separation of Concerns**

```typescript
// Clear separation between:
components/     // Presentation layer
hooks/         // Business logic layer  
lib/api/       // Data access layer
store/         // State management layer
```

### 3. **Composition Over Inheritance**

```typescript
// Example: Composable authentication wrapper
function withAuth<T>(Component: React.ComponentType<T>, roles?: UserRole[]) {
  return function AuthenticatedComponent(props: T) {
    const { user, isAuthenticated } = useAuth();
    
    if (!isAuthenticated) return <SignIn />;
    if (roles && !roles.includes(user.role)) return <Unauthorized />;
    
    return <Component {...props} />;
  };
}
```

---

## 📊 State Management

### Zustand Stores

**Authentication State**
```typescript
// store/auth/clientAuthStore.ts
interface ClientAuthState {
  user: ClientUser | null;
  isAuthenticated: boolean;
  // ... auth methods
}
```

**Form State**
```typescript
// store/therapistform.ts
interface TherapistFormState {
  currentStep: number;
  formData: TherapistApplicationData;
  // ... form methods
}
```

### React Query Integration

**API State Management**
```typescript
// hooks/useTherapists.ts
export function useTherapists(filters: TherapistFilters) {
  return useQuery({
    queryKey: queryKeys.therapists.filtered(filters),
    queryFn: () => api.therapists.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

### State Architecture Principles

1. **Server State vs Client State**: React Query for server data, Zustand for UI state
2. **Optimistic Updates**: Immediate UI feedback with rollback capability
3. **Cache Management**: Intelligent invalidation and background refetching
4. **Persistence**: Critical state persisted to localStorage

---

## 🌐 API Integration

### Service Layer Architecture

```typescript
// lib/api/services/therapists.ts
export const therapistsService = {
  getAll: (filters: TherapistFilters) => 
    apiClient.get('/therapists', { params: filters }),
    
  getById: (id: string) => 
    apiClient.get(`/therapists/${id}`),
    
  create: (data: CreateTherapistRequest) => 
    apiClient.post('/therapists', data),
};
```

### HTTP Client Configuration

```typescript
// lib/api/client.ts
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
});

// Request interceptor for authentication
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => handleApiError(error)
);
```

### Error Handling Strategy

```typescript
// lib/api/errorHandler.ts
export class MentaraApiError extends Error {
  constructor(
    public statusCode: number,
    public details: Record<string, any>,
    message: string
  ) {
    super(message);
  }
}

export function handleApiError(error: AxiosError): never {
  if (error.response?.status === 401) {
    // Handle authentication errors
    redirectToLogin();
  }
  
  throw new MentaraApiError(
    error.response?.status || 500,
    error.response?.data || {},
    error.message
  );
}
```

---

## 🗺️ Routing & Navigation

### App Router Structure

```typescript
// Route organization with role-based access
app/
├── (protected)/          # Requires authentication
│   ├── admin/           # Admin role only
│   ├── therapist/       # Therapist role only
│   ├── user/            # Client role only
│   └── moderator/       # Moderator role only
└── (public)/            # Public access
    ├── (auth)/          # Authentication flows
    ├── (static)/        # Marketing pages
    └── (therapist)/     # Therapist application
```

### Middleware-Based Route Protection

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('access_token')?.value;
  
  // Protect authenticated routes
  if (pathname.startsWith('/(protected)')) {
    if (!token || !isValidToken(token)) {
      return redirectToSignIn();
    }
    
    // Role-based access control
    const userRole = getUserRole(token);
    if (!hasRouteAccess(pathname, userRole)) {
      return redirectToUnauthorized();
    }
  }
  
  return NextResponse.next();
}
```

---

## 🚨 Error Handling

### Hierarchical Error Boundaries

```typescript
// Error boundary hierarchy
app/
├── error.tsx                 # Global error boundary
├── (protected)/
│   ├── error.tsx            # Protected routes error boundary
│   ├── admin/error.tsx      # Admin-specific error handling
│   ├── therapist/error.tsx  # Therapist-specific error handling
│   └── user/error.tsx       # User-specific error handling
└── (public)/
    ├── error.tsx            # Public routes error boundary
    └── (auth)/error.tsx     # Auth-specific error handling
```

### Error Types and Handling

```typescript
// Error classification and handling
interface ErrorHandlingStrategy {
  NetworkError: () => void;      // Retry with exponential backoff
  AuthenticationError: () => void; // Redirect to login
  AuthorizationError: () => void;  // Show access denied
  ValidationError: () => void;     // Show field-level errors
  ServerError: () => void;         // Show generic error message
}
```

---

## ⚡ Performance Strategy

### Code Splitting

```typescript
// Dynamic imports for large components
const AdminDashboard = dynamic(() => import('@/components/admin/Dashboard'), {
  loading: () => <AdminLoading />,
  ssr: false,
});
```

### Optimization Techniques

1. **Bundle Optimization**: Dynamic imports for route-level code splitting
2. **Image Optimization**: Next.js Image component with automatic optimization
3. **Caching Strategy**: React Query with intelligent cache invalidation
4. **Lazy Loading**: Components and routes loaded on demand
5. **Memoization**: React.memo and useMemo for expensive computations

---

## 🔒 Security Implementation

### Authentication Flow

```typescript
// JWT token-based authentication
const authFlow = {
  login: async (credentials) => {
    const { accessToken, refreshToken } = await api.auth.login(credentials);
    storeTokens(accessToken, refreshToken);
    redirectToDashboard();
  },
  
  refreshToken: async () => {
    const newToken = await api.auth.refresh();
    updateAccessToken(newToken);
  },
  
  logout: () => {
    clearTokens();
    redirectToHomepage();
  }
};
```

### Security Best Practices

1. **XSS Prevention**: Content Security Policy (CSP) headers
2. **CSRF Protection**: SameSite cookies and CSRF tokens
3. **Data Validation**: Zod schemas for all user inputs
4. **Secure Storage**: HttpOnly cookies for refresh tokens
5. **Role Validation**: Server-side and client-side role checks

---

## 🔄 Development Workflow

### Git Workflow

```bash
# Feature development
git checkout -b feature/user-dashboard-improvements
git commit -m "feat: add real-time notifications to user dashboard"
git push origin feature/user-dashboard-improvements

# Pull request to dev branch
# Code review and automated testing
# Merge to dev, then deploy to staging
# After QA approval, merge to main for production
```

### Code Quality Gates

1. **Pre-commit**: Husky runs ESLint, Prettier, and TypeScript checks
2. **CI/CD**: Automated testing and build verification
3. **Code Review**: Required peer review for all changes
4. **Testing**: Unit tests, integration tests, and E2E tests

---

## 📝 Decision Records

### ADR-001: Choose Next.js App Router over Pages Router

**Date**: 2024-12-01  
**Status**: Accepted

**Context**: Need to choose between Next.js App Router and Pages Router for the new application architecture.

**Decision**: Adopt App Router for its improved developer experience and future-ready architecture.

**Consequences**:
- ✅ Better file-based routing with layouts
- ✅ Improved performance with React Server Components
- ✅ Built-in loading and error handling
- ❌ Learning curve for team members

### ADR-002: Zustand + React Query for State Management

**Date**: 2024-12-01  
**Status**: Accepted

**Context**: Need a scalable state management solution that handles both client and server state effectively.

**Decision**: Use Zustand for client state and React Query for server state management.

**Consequences**:
- ✅ Reduced bundle size compared to Redux
- ✅ Excellent TypeScript support
- ✅ Built-in caching and synchronization
- ✅ Simple API and learning curve

### ADR-003: shadcn/ui for Component Library

**Date**: 2024-12-01  
**Status**: Accepted

**Context**: Need a component library that provides consistency while maintaining customization flexibility.

**Decision**: Adopt shadcn/ui with Tailwind CSS for the design system.

**Consequences**:
- ✅ Copy-paste components with full control
- ✅ Excellent accessibility out of the box
- ✅ Consistent design system
- ✅ Easy customization and theming

### ADR-004: Comprehensive Error Boundaries

**Date**: 2025-01-19  
**Status**: Accepted

**Context**: Need robust error handling across all application routes and user flows.

**Decision**: Implement hierarchical error boundaries at global, section, and feature levels.

**Consequences**:
- ✅ Graceful error recovery
- ✅ Role-specific error messaging
- ✅ Improved user experience
- ✅ Better error monitoring and debugging

---

## 🚀 Future Considerations

### Planned Improvements

1. **Performance Monitoring**: Implement real-time performance metrics
2. **A/B Testing**: Framework for feature experimentation
3. **Offline Support**: Progressive Web App capabilities
4. **Micro-frontends**: Potential modularization strategy
5. **Advanced Caching**: Edge caching and CDN optimization

### Technology Upgrades

- **React 19**: Concurrent features and improved Suspense
- **Next.js 16**: Enhanced App Router capabilities
- **Tailwind CSS 5**: Advanced utility features
- **TypeScript 6**: Improved type inference and performance

---

## 📞 Support & Maintenance

### Team Contacts

- **Frontend Lead**: Technical architecture decisions
- **DevOps Team**: Deployment and infrastructure
- **QA Team**: Testing strategy and automation
- **Security Team**: Security reviews and compliance

### Documentation Updates

This document should be updated whenever:
- Major architectural decisions are made
- New patterns are introduced
- Technology stack changes occur
- Performance optimizations are implemented

---

*This documentation serves as the single source of truth for the Mentara Client architecture. For technical questions or suggestions, please reach out to the frontend team.*