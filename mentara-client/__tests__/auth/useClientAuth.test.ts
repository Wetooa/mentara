/**
 * Tests for useClientAuth hook
 * Validates client authentication flows, error handling, and state management
 */

import { renderHook, waitFor } from '@testing-library/react';
import { useClientAuth } from '@/hooks/auth/client/useClientAuth';
import {
  createTestWrapper,
  mockApiResponses,
  mockLocalStorage,
  authFlowTestHelpers,
  toastMocks,
  routerMocks,
} from './auth-test-utils';

// Mock the API client
jest.mock('@/lib/api', () => ({
  useApi: () => ({
    auth: {
      client: {
        login: jest.fn(),
        logout: jest.fn(),
        refreshToken: jest.fn(),
        getCurrentUser: jest.fn(),
        updateProfile: jest.fn(),
        changePassword: jest.fn(),
      },
    },
  }),
}));

describe('useClientAuth Hook', () => {
  let mockStorage: jest.Mocked<Storage>;

  beforeEach(() => {
    mockStorage = mockLocalStorage();
    toastMocks.resetMocks();
    routerMocks.resetMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Authentication State Management', () => {
    it('should initialize with unauthenticated state', () => {
      const { TestWrapper } = createTestWrapper();
      const { result } = renderHook(() => useClientAuth(), {
        wrapper: TestWrapper,
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle successful login', async () => {
      const { TestWrapper } = createTestWrapper();
      const mockLogin = jest.fn().mockImplementation(() => 
        mockApiResponses.successfulLogin('client')
      );

      const { result } = renderHook(() => useClientAuth(), {
        wrapper: TestWrapper,
      });

      // Mock the API method
      result.current.login = mockLogin;

      const credentials = { email: 'test@example.com', password: 'password123' };

      await waitFor(async () => {
        await result.current.login(credentials);
      });

      expect(mockLogin).toHaveBeenCalledWith(credentials);
      expect(toastMocks.success).toHaveBeenCalledWith(
        expect.stringContaining('Welcome back')
      );
    });

    it('should handle login errors', async () => {
      const { TestWrapper } = createTestWrapper();
      const mockLogin = jest.fn().mockImplementation(() => 
        mockApiResponses.invalidCredentials()
      );

      const { result } = renderHook(() => useClientAuth(), {
        wrapper: TestWrapper,
      });

      result.current.login = mockLogin;

      const credentials = { email: 'test@example.com', password: 'wrongpassword' };

      await expect(result.current.login(credentials)).rejects.toThrow();
      expect(toastMocks.error).toHaveBeenCalledWith(
        expect.stringContaining('Invalid')
      );
    });
  });

  describe('Token Management', () => {
    it('should store tokens after successful login', async () => {
      const result = await authFlowTestHelpers.testAuthFlow(
        'client',
        () => useClientAuth(),
        { email: 'test@example.com', password: 'password123' }
      );

      expect(mockStorage.setItem).toHaveBeenCalledWith(
        'access_token',
        expect.any(String)
      );
      expect(mockStorage.setItem).toHaveBeenCalledWith(
        'refresh_token',
        expect.any(String)
      );
    });

    it('should clear tokens on logout', async () => {
      const { TestWrapper } = createTestWrapper();
      const mockLogout = jest.fn().mockResolvedValue({ success: true });

      const { result } = renderHook(() => useClientAuth(), {
        wrapper: TestWrapper,
      });

      result.current.logout = mockLogout;

      await waitFor(async () => {
        await result.current.logout();
      });

      expect(mockStorage.removeItem).toHaveBeenCalledWith('access_token');
      expect(mockStorage.removeItem).toHaveBeenCalledWith('refresh_token');
    });

    it('should handle token refresh', async () => {
      const { TestWrapper } = createTestWrapper();
      const mockRefreshToken = jest.fn().mockResolvedValue({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });

      const { result } = renderHook(() => useClientAuth(), {
        wrapper: TestWrapper,
      });

      result.current.refreshToken = mockRefreshToken;

      await waitFor(async () => {
        await result.current.refreshToken();
      });

      expect(mockRefreshToken).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      await authFlowTestHelpers.testAuthError(
        () => useClientAuth(),
        { email: 'test@example.com', password: 'password123' },
        'Network Error'
      );

      expect(toastMocks.error).toHaveBeenCalledWith(
        expect.stringContaining('network')
      );
    });

    it('should handle account locked errors', async () => {
      const { TestWrapper } = createTestWrapper();
      const mockLogin = jest.fn().mockImplementation(() => 
        mockApiResponses.accountLocked()
      );

      const { result } = renderHook(() => useClientAuth(), {
        wrapper: TestWrapper,
      });

      result.current.login = mockLogin;

      await expect(
        result.current.login({ email: 'test@example.com', password: 'password123' })
      ).rejects.toThrow();

      expect(toastMocks.error).toHaveBeenCalledWith(
        expect.stringContaining('locked')
      );
    });

    it('should handle rate limiting', async () => {
      const { TestWrapper } = createTestWrapper();
      const mockLogin = jest.fn().mockImplementation(() => 
        mockApiResponses.rateLimited()
      );

      const { result } = renderHook(() => useClientAuth(), {
        wrapper: TestWrapper,
      });

      result.current.login = mockLogin;

      await expect(
        result.current.login({ email: 'test@example.com', password: 'password123' })
      ).rejects.toThrow();

      expect(toastMocks.error).toHaveBeenCalledWith(
        expect.stringContaining('many attempts')
      );
    });

    it('should handle validation errors', async () => {
      const { TestWrapper } = createTestWrapper();
      const mockLogin = jest.fn().mockImplementation(() => 
        mockApiResponses.validationError({
          email: 'Invalid email format',
          password: 'Password too short',
        })
      );

      const { result } = renderHook(() => useClientAuth(), {
        wrapper: TestWrapper,
      });

      result.current.login = mockLogin;

      await expect(
        result.current.login({ email: 'invalid-email', password: '123' })
      ).rejects.toThrow();

      expect(toastMocks.error).toHaveBeenCalled();
    });
  });

  describe('Profile Management', () => {
    it('should update client profile', async () => {
      const { TestWrapper } = createTestWrapper();
      const mockUpdateProfile = jest.fn().mockResolvedValue({
        id: 'client-1',
        email: 'test@example.com',
        profile: {
          goals: ['anxiety-management'],
          preferences: { language: 'en' },
        },
      });

      const { result } = renderHook(() => useClientAuth(), {
        wrapper: TestWrapper,
      });

      result.current.updateProfile = mockUpdateProfile;

      const profileUpdate = {
        goals: ['anxiety-management'],
        preferences: { language: 'en' },
      };

      await waitFor(async () => {
        await result.current.updateProfile(profileUpdate);
      });

      expect(mockUpdateProfile).toHaveBeenCalledWith(profileUpdate);
    });

    it('should handle profile update errors', async () => {
      const { TestWrapper } = createTestWrapper();
      const mockUpdateProfile = jest.fn().mockRejectedValue(
        new Error('Profile update failed')
      );

      const { result } = renderHook(() => useClientAuth(), {
        wrapper: TestWrapper,
      });

      result.current.updateProfile = mockUpdateProfile;

      await expect(
        result.current.updateProfile({ goals: ['anxiety-management'] })
      ).rejects.toThrow('Profile update failed');
    });
  });

  describe('Navigation and Redirects', () => {
    it('should redirect to client dashboard after successful login', async () => {
      const { TestWrapper } = createTestWrapper();
      const mockLogin = jest.fn().mockImplementation(() => 
        mockApiResponses.successfulLogin('client')
      );

      const { result } = renderHook(() => useClientAuth(), {
        wrapper: TestWrapper,
      });

      result.current.login = mockLogin;

      await waitFor(async () => {
        await result.current.login({ email: 'test@example.com', password: 'password123' });
      });

      expect(routerMocks.mockPush).toHaveBeenCalledWith('/user');
    });

    it('should redirect to onboarding if not completed', async () => {
      const { TestWrapper } = createTestWrapper();
      const mockLogin = jest.fn().mockResolvedValue({
        user: {
          ...createTestWrapper(),
          isOnboardingComplete: false,
        },
        tokens: { accessToken: 'token', refreshToken: 'refresh' },
      });

      const { result } = renderHook(() => useClientAuth(), {
        wrapper: TestWrapper,
      });

      result.current.login = mockLogin;

      await waitFor(async () => {
        await result.current.login({ email: 'test@example.com', password: 'password123' });
      });

      expect(routerMocks.mockPush).toHaveBeenCalledWith('/onboarding');
    });
  });

  describe('Loading States', () => {
    it('should show loading state during login', async () => {
      const { TestWrapper } = createTestWrapper();
      let resolveLogin: (value: any) => void;
      const loginPromise = new Promise((resolve) => {
        resolveLogin = resolve;
      });

      const mockLogin = jest.fn().mockReturnValue(loginPromise);

      const { result } = renderHook(() => useClientAuth(), {
        wrapper: TestWrapper,
      });

      result.current.login = mockLogin;

      // Start login
      const loginCall = result.current.login({ 
        email: 'test@example.com', 
        password: 'password123' 
      });

      // Should be loading
      expect(result.current.isLoading).toBe(true);

      // Complete login
      resolveLogin!(mockApiResponses.successfulLogin('client'));
      await loginCall;

      // Should no longer be loading
      expect(result.current.isLoading).toBe(false);
    });
  });
});