/**
 * Test utilities for authentication flows
 * Provides common testing helpers for auth components, hooks, and services
 */

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { toast } from 'sonner';

// Mock the sonner toast to avoid console warnings in tests
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

// Mock Next.js router
const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockBack = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: mockBack,
    pathname: '/',
    query: {},
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));

// Test data generators
export const createTestUser = (role: 'client' | 'therapist' | 'admin' | 'moderator') => {
  const baseUser = {
    id: `test-${role}-${Date.now()}`,
    email: `test-${role}@mentara.com`,
    firstName: 'Test',
    lastName: 'User',
    role,
    isEmailVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  switch (role) {
    case 'client':
      return {
        ...baseUser,
        role: 'client' as const,
        isOnboardingComplete: false,
        profile: {
          goals: ['anxiety-management', 'stress-reduction'],
          preferences: {
            language: 'en',
            timezone: 'UTC',
            communicationPreferences: {
              email: true,
              sms: false,
              push: true,
            },
          },
        },
      };

    case 'therapist':
      return {
        ...baseUser,
        role: 'therapist' as const,
        approvalStatus: 'approved' as const,
        isApproved: true,
        profile: {
          bio: 'Experienced therapist specializing in anxiety and depression',
          specializations: ['anxiety', 'depression', 'trauma'],
          credentials: ['PhD Psychology', 'Licensed Clinical Psychologist'],
          experience: 10,
          languages: ['en', 'es'],
          availability: {
            monday: { isAvailable: true, slots: [] },
            tuesday: { isAvailable: true, slots: [] },
          },
          isAcceptingNewClients: true,
          license: {
            licenseNumber: 'TEST-12345',
            licenseType: 'Clinical Psychology',
            issuingAuthority: 'State Board',
            issueDate: '2020-01-01',
            expiryDate: '2025-01-01',
            isVerified: true,
          },
        },
      };

    case 'admin':
      return {
        ...baseUser,
        role: 'admin' as const,
        profile: {
          permissions: ['user-management', 'system-config', 'audit-logs'],
          isSuperAdmin: true,
          securityClearance: 'maximum' as const,
        },
        permissions: ['user-management', 'system-config', 'audit-logs'],
        isSuperAdmin: true,
      };

    case 'moderator':
      return {
        ...baseUser,
        role: 'moderator' as const,
        profile: {
          permissions: ['content-moderation', 'community-management'],
          assignedCommunities: ['anxiety-support', 'depression-help'],
          moderationLevel: 'senior' as const,
          performanceMetrics: {
            resolvedReports: 150,
            averageResolutionTime: '2 hours',
            userSatisfactionScore: 4.8,
          },
        },
        permissions: ['content-moderation', 'community-management'],
        assignedCommunities: ['anxiety-support', 'depression-help'],
        moderationLevel: 'senior' as const,
      };

    default:
      return baseUser;
  }
};

export const createTestTokens = () => ({
  accessToken: 'test-access-token-' + Date.now(),
  refreshToken: 'test-refresh-token-' + Date.now(),
});

export const createTestAuthResponse = (role: 'client' | 'therapist' | 'admin' | 'moderator') => ({
  user: createTestUser(role),
  tokens: createTestTokens(),
  isFirstLogin: false,
});

// Test wrapper for React Query
export const createTestWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

  const TestWrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  return { TestWrapper, queryClient };
};

// Mock API responses
export const mockApiResponses = {
  successfulLogin: (role: 'client' | 'therapist' | 'admin' | 'moderator') => 
    Promise.resolve({ data: createTestAuthResponse(role) }),
  
  invalidCredentials: () => 
    Promise.reject({
      response: {
        status: 401,
        data: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
      },
    }),

  networkError: () => 
    Promise.reject(new Error('Network Error')),

  tokenExpired: () =>
    Promise.reject({
      response: {
        status: 401,
        data: {
          code: 'TOKEN_EXPIRED',
          message: 'Token has expired',
        },
      },
    }),

  accountLocked: () =>
    Promise.reject({
      response: {
        status: 423,
        data: {
          code: 'ACCOUNT_LOCKED',
          message: 'Account is temporarily locked',
        },
      },
    }),

  rateLimited: () =>
    Promise.reject({
      response: {
        status: 429,
        data: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many attempts',
        },
      },
    }),

  validationError: (fieldErrors: Record<string, string>) =>
    Promise.reject({
      response: {
        status: 422,
        data: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          errors: fieldErrors,
        },
      },
    }),
};

// Test helpers for localStorage
export const mockLocalStorage = () => {
  const store: Record<string, string> = {};

  const localStorageMock = {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
  };

  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });

  return localStorageMock;
};

// Auth flow test helpers
export const authFlowTestHelpers = {
  /**
   * Test a complete authentication flow
   */
  async testAuthFlow(
    role: 'client' | 'therapist' | 'admin' | 'moderator',
    hookFunction: () => any,
    credentials: { email: string; password: string }
  ) {
    const { TestWrapper } = createTestWrapper();
    
    const { result } = renderHook(() => hookFunction(), {
      wrapper: TestWrapper,
    });

    // Initial state should be unauthenticated
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();

    // Attempt login
    await waitFor(async () => {
      await result.current.login(credentials);
    });

    // Should be authenticated after successful login
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toBeTruthy();
    expect(result.current.user?.role).toBe(role);

    return result;
  },

  /**
   * Test error handling for authentication
   */
  async testAuthError(
    hookFunction: () => any,
    credentials: { email: string; password: string },
    expectedError: string
  ) {
    const { TestWrapper } = createTestWrapper();
    
    const { result } = renderHook(() => hookFunction(), {
      wrapper: TestWrapper,
    });

    try {
      await result.current.login(credentials);
      throw new Error('Expected login to fail');
    } catch (error) {
      expect(error).toBeTruthy();
      expect(result.current.isAuthenticated).toBe(false);
    }
  },

  /**
   * Test token management
   */
  testTokenManagement() {
    const mockStorage = mockLocalStorage();
    
    // Test token storage
    const tokens = createTestTokens();
    localStorage.setItem('access_token', tokens.accessToken);
    localStorage.setItem('refresh_token', tokens.refreshToken);

    expect(mockStorage.setItem).toHaveBeenCalledWith('access_token', tokens.accessToken);
    expect(mockStorage.setItem).toHaveBeenCalledWith('refresh_token', tokens.refreshToken);

    // Test token retrieval
    expect(localStorage.getItem('access_token')).toBe(tokens.accessToken);
    expect(localStorage.getItem('refresh_token')).toBe(tokens.refreshToken);

    // Test token removal
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');

    expect(mockStorage.removeItem).toHaveBeenCalledWith('access_token');
    expect(mockStorage.removeItem).toHaveBeenCalledWith('refresh_token');
  },
};

// Role-based access test helpers
export const rbacTestHelpers = {
  /**
   * Test route access for different roles
   */
  testRouteAccess(userRole: string, routePath: string, expectedAccess: boolean) {
    // This would be used with testing framework to verify route protection
    return {
      userRole,
      routePath,
      expectedAccess,
      description: `${userRole} should ${expectedAccess ? 'have' : 'not have'} access to ${routePath}`,
    };
  },

  /**
   * Generate RBAC test matrix
   */
  generateRBACTestMatrix() {
    const roles = ['client', 'therapist', 'admin', 'moderator'];
    const routes = [
      { path: '/user', allowedRoles: ['client'] },
      { path: '/therapist', allowedRoles: ['therapist'] },
      { path: '/admin', allowedRoles: ['admin'] },
      { path: '/moderator', allowedRoles: ['moderator'] },
    ];

    const testCases = [];

    for (const role of roles) {
      for (const route of routes) {
        const shouldHaveAccess = route.allowedRoles.includes(role);
        testCases.push(this.testRouteAccess(role, route.path, shouldHaveAccess));
      }
    }

    return testCases;
  },
};

// Export router mocks for use in other tests
export const routerMocks = {
  mockPush,
  mockReplace,
  mockBack,
  resetMocks: () => {
    mockPush.mockClear();
    mockReplace.mockClear();
    mockBack.mockClear();
  },
};

// Export toast mocks
export const toastMocks = {
  success: toast.success as jest.Mock,
  error: toast.error as jest.Mock,
  info: toast.info as jest.Mock,
  resetMocks: () => {
    (toast.success as jest.Mock).mockClear();
    (toast.error as jest.Mock).mockClear();
    (toast.info as jest.Mock).mockClear();
  },
};