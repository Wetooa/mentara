'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

// Types
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'client' | 'therapist' | 'moderator' | 'admin';
  isEmailVerified?: boolean;
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'client' | 'therapist';
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<boolean>;
  clearAuth: () => void;
  signInWithOAuth: (provider: 'oauth_google' | 'oauth_microsoft') => Promise<void>;
  handleOAuthCallback: (token: string) => Promise<void>;
  isLoaded: boolean;
}

// Secure token storage utilities (exported for use in API client)
export class SecureTokenStorage {
  private static USER_KEY = 'mentara_user';
  private static ACCESS_TOKEN_MEMORY_KEY = 'mentara_access_token_memory';
  
  // In-memory storage for access tokens (more secure)
  private static memoryStorage: { [key: string]: string } = {};

  // Store access token in memory only (cleared on page refresh)
  static setAccessToken(accessToken: string) {
    this.memoryStorage[this.ACCESS_TOKEN_MEMORY_KEY] = accessToken;
  }

  static getAccessToken(): string | null {
    return this.memoryStorage[this.ACCESS_TOKEN_MEMORY_KEY] || null;
  }

  // Refresh tokens are handled via HttpOnly cookies by the backend
  // We don't store them in localStorage for security
  static setRefreshTokenCookie(refreshToken: string) {
    // This will be set by the backend as an HttpOnly cookie
    // We just make a request to set it
    document.cookie = `mentara_refresh_token=${refreshToken}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=604800`; // 7 days
  }

  static clearRefreshTokenCookie() {
    document.cookie = 'mentara_refresh_token=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0';
  }

  // User data can be stored in localStorage as it's not sensitive like tokens
  static setUser(user: User) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
  }

  static getUser(): User | null {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem(this.USER_KEY);
      if (userData) {
        try {
          return JSON.parse(userData);
        } catch (error) {
          console.error('Error parsing user data:', error);
          return null;
        }
      }
    }
    return null;
  }

  static clearAll() {
    // Clear memory storage
    this.memoryStorage = {};
    
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.USER_KEY);
    }
    
    // Clear refresh token cookie
    this.clearRefreshTokenCookie();
  }

  // Fallback: if memory storage is empty, try localStorage (for backward compatibility)
  static getAccessTokenFallback(): string | null {
    const memoryToken = this.getAccessToken();
    if (memoryToken) return memoryToken;
    
    // Fallback to localStorage if available (less secure but maintains session)
    if (typeof window !== 'undefined') {
      return localStorage.getItem('mentara_access_token');
    }
    return null;
  }
}

// JWT utility functions
const decodeJWT = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

const isTokenExpired = (token: string): boolean => {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) return true;
  
  const currentTime = Date.now() / 1000;
  return decoded.exp < currentTime;
};

// Auth API calls
const authAPI = {
  async login(credentials: LoginCredentials) {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    return response.json();
  },

  async register(credentials: RegisterCredentials) {
    const endpoint = credentials.role === 'client' 
      ? '/api/auth/register/client' 
      : '/api/auth/register/therapist';

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    return response.json();
  },

  async refreshToken() {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include HttpOnly cookies
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    return response.json();
  },

  async logout() {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include HttpOnly cookies
      });
    } catch (error) {
      console.error('Logout API call failed:', error);
      // Continue with local logout even if API call fails
    }
  },

  async getCurrentUser(accessToken: string) {
    const response = await fetch('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get current user');
    }

    return response.json();
  },
};

// Create Auth Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Component
export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Initialize auth state from storage
  useEffect(() => {
    const initializeAuth = async () => {
      const accessToken = SecureTokenStorage.getAccessTokenFallback();
      const user = SecureTokenStorage.getUser();

      if (accessToken && user) {
        // Check if access token is valid
        if (!isTokenExpired(accessToken)) {
          setAuthState({
            user,
            accessToken,
            refreshToken: null, // Refresh tokens are handled via HttpOnly cookies
            isAuthenticated: true,
            isLoading: false,
          });
          return;
        }

        // Try to refresh the token
        try {
          const tokenData = await authAPI.refreshToken();
          SecureTokenStorage.setAccessToken(tokenData.accessToken);
          
          // Get updated user data
          const userData = await authAPI.getCurrentUser(tokenData.accessToken);
          SecureTokenStorage.setUser(userData);

          setAuthState({
            user: userData,
            accessToken: tokenData.accessToken,
            refreshToken: tokenData.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          console.error('Token refresh failed:', error);
          SecureTokenStorage.clearAll();
          setAuthState({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } else {
        setAuthState({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      const response = await authAPI.login(credentials);
      const { accessToken, refreshToken, user } = response;

      SecureTokenStorage.setAccessToken(accessToken);
      SecureTokenStorage.setUser(user);

      setAuthState({
        user,
        accessToken,
        refreshToken,
        isAuthenticated: true,
        isLoading: false,
      });

      // Redirect based on user role
      const dashboardPath = user.role === 'client' ? '/user' : `/${user.role}`;
      router.push(dashboardPath);
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      const response = await authAPI.register(credentials);
      const { accessToken, refreshToken, user } = response;

      SecureTokenStorage.setAccessToken(accessToken);
      SecureTokenStorage.setUser(user);

      setAuthState({
        user,
        accessToken,
        refreshToken,
        isAuthenticated: true,
        isLoading: false,
      });

      // Redirect to appropriate dashboard
      const dashboardPath = user.role === 'client' ? '/user' : `/${user.role}`;
      router.push(dashboardPath);
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const refreshAccessToken = async (): Promise<boolean> => {
    try {
      // Call refresh endpoint which uses HttpOnly cookie for refresh token
      const tokenData = await authAPI.refreshToken();
      SecureTokenStorage.setAccessToken(tokenData.accessToken);

      setAuthState(prev => ({
        ...prev,
        accessToken: tokenData.accessToken,
        // refreshToken remains null as it's handled via HttpOnly cookies
      }));

      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      clearAuth();
      return false;
    }
  };

  const logout = async () => {
    // Call logout API to invalidate HttpOnly refresh token cookie
    await authAPI.logout();

    clearAuth();
    router.push('/client/sign-in');
  };  const signInWithOAuth = async (provider: 'oauth_google' | 'oauth_microsoft') => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      // Get the API URL from environment
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      
      // Determine the OAuth endpoint based on provider
      const oauthEndpoint = provider === 'oauth_google' ? '/auth/google' : '/auth/microsoft';
      
      // Store the current intended role (default to client)
      // This could be enhanced to support role selection in the future
      const role = 'client';
      
      // Redirect to OAuth provider with state parameter for role
      const oauthUrl = `${apiUrl}${oauthEndpoint}?state=${role}`;
      window.location.href = oauthUrl;
      
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      console.error('OAuth initiation failed:', error);
      throw error;
    }
  };

  const handleOAuthCallback = async (token: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      // Decode the token to get user information
      const decoded = decodeJWT(token);
      if (!decoded) {
        throw new Error('Invalid token received from OAuth callback');
      }
      
      // Store the access token
      SecureTokenStorage.setAccessToken(token);
      
      // Get user data from the token or fetch from API
      const userData = await authAPI.getCurrentUser(token);
      SecureTokenStorage.setUser(userData);
      
      setAuthState({
        user: userData,
        accessToken: token,
        refreshToken: null, // Refresh tokens are handled via HttpOnly cookies
        isAuthenticated: true,
        isLoading: false,
      });
      
      // OAuth callback is handled by individual pages, so we don't redirect here
      
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      console.error('OAuth callback handling failed:', error);
      throw error;
    }
  };

  const clearAuth = () => {
    SecureTokenStorage.clearAll();
    setAuthState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  const contextValue: AuthContextType = {
    ...authState,
    login,
    register,
    logout,
    refreshAccessToken,
    clearAuth,
    signInWithOAuth,
    handleOAuthCallback,
    isLoaded: !authState.isLoading,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Utility hook for getting user data
export function useUser() {
  const { user, isAuthenticated, isLoading } = useAuth();
  return { user, isAuthenticated, isLoading };
}

// Utility hook for role-based access
export function useRole() {
  const { user, isAuthenticated } = useAuth();
  
  const hasRole = (role: User['role']) => {
    return isAuthenticated && user?.role === role;
  };

  const hasAnyRole = (roles: User['role'][]) => {
    return isAuthenticated && user?.role && roles.includes(user.role);
  };

  return {
    role: user?.role,
    isClient: hasRole('client'),
    isTherapist: hasRole('therapist'),
    isModerator: hasRole('moderator'),
    isAdmin: hasRole('admin'),
    hasRole,
    hasAnyRole,
  };
}