"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MentaraApiError } from "@/lib/api/errorHandler";
import {
  createAuthError,
  AuthenticationError,
  TokenExpiredError,
  InvalidCredentialsError,
  AccountNotFoundError,
  AccountLockedError,
  EmailNotVerifiedError,
  OAuthError,
  RateLimitError,
  NetworkConnectionError,
} from "@/lib/api/errors/authErrors";

/**
 * Context information for authentication error handling
 */
export interface AuthErrorContext {
  /** The component where the error occurred */
  component: string;
  /** The action being performed when the error occurred */
  action: string;
  /** Optional user identifier for debugging */
  userId?: string;
  /** Additional metadata for error context */
  metadata?: Record<string, unknown>;
}

/**
 * Result of authentication error handling
 */
export interface AuthErrorResult {
  /** Whether the user should be redirected */
  shouldRedirect: boolean;
  /** URL to redirect to if shouldRedirect is true */
  redirectTo?: string;
  /** Whether the operation should be retried */
  shouldRetry: boolean;
  /** Time to wait before retry in milliseconds */
  retryAfter?: number;
  /** Field-specific error messages for forms */
  fieldErrors?: Record<string, string>;
  /** General error message to display */
  message?: string;
}

/**
 * Authentication error handler hook return type
 */
export interface UseAuthErrorHandlerReturn {
  /** Main error handling function */
  handleAuthError: (error: unknown, context: AuthErrorContext) => AuthErrorResult;
  /** Function to clear authentication state */
  clearAuthState: () => void;
  /** Function to handle automatic retries */
  handleRetry: (
    originalFunction: () => Promise<void>,
    retryAfter?: number,
    maxRetries?: number
  ) => Promise<void>;
}

/**
 * Hook for handling authentication-related errors with comprehensive error categorization,
 * user-friendly messaging, and automatic retry logic.
 * 
 * This hook provides centralized error handling for all authentication operations including
 * login, logout, token refresh, and other auth-related API calls. It categorizes errors,
 * provides appropriate user feedback, and handles redirects and retries automatically.
 * 
 * @example
 * ```tsx
 * function LoginForm() {
 *   const { handleAuthError } = useAuthErrorHandler();
 * 
 *   const handleSubmit = async (data) => {
 *     try {
 *       await login(data);
 *     } catch (error) {
 *       const result = handleAuthError(error, {
 *         component: 'LoginForm',
 *         action: 'login',
 *         userId: data.email
 *       });
 *       
 *       if (result.shouldRedirect) {
 *         router.push(result.redirectTo);
 *       }
 *     }
 *   };
 * }
 * ```
 * 
 * Features:
 * - Comprehensive error categorization (token expired, invalid credentials, etc.)
 * - User-friendly error messages and toast notifications
 * - Automatic token cleanup on authentication failures
 * - Smart retry logic for transient errors
 * - Form field error mapping for validation errors
 * - Centralized redirect handling for expired sessions
 */
export function useAuthErrorHandler(): UseAuthErrorHandlerReturn {
  const router = useRouter();

  const handleAuthError = useCallback((
    error: unknown, 
    context: AuthErrorContext
  ): AuthErrorResult => {
    // Default result
    const result: AuthErrorResult = {
      shouldRedirect: false,
      shouldRetry: false,
    };

    // Transform error to auth-specific error type
    const authError = createAuthError(error, {
      operation: context.action,
      userEmail: context.userId,
    });

    // Log error with context for monitoring (development only)
    if (process.env.NODE_ENV === 'development') {
      console.error(`Auth Error [${context.component}:${context.action}]:`, {
        error: authError,
        originalError: error,
        context,
        timestamp: new Date().toISOString(),
        userAgent: typeof window !== "undefined" ? window.navigator.userAgent : undefined,
      });
    }

    // Handle specific auth error types
    if (authError instanceof TokenExpiredError) {
      result.message = authError.getUserFriendlyMessage();
      result.shouldRedirect = true;
      result.redirectTo = getCentralizedSignInUrl(context);
      toast.error(result.message);
      
      // Clear stored tokens
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      }
    } else if (authError instanceof InvalidCredentialsError) {
      result.message = authError.getUserFriendlyMessage();
      result.fieldErrors = {
        email: "Please check your email address",
        password: "Please check your password"
      };
      toast.error(result.message);
    } else if (authError instanceof AccountNotFoundError) {
      result.message = authError.getUserFriendlyMessage();
      result.fieldErrors = {
        email: "No account found with this email address"
      };
      toast.error(result.message);
    } else if (authError instanceof AccountLockedError) {
      result.message = authError.getUserFriendlyMessage();
      toast.error(result.message);
    } else if (authError instanceof EmailNotVerifiedError) {
      result.message = authError.getUserFriendlyMessage();
      toast.error(result.message);
    } else if (authError instanceof OAuthError) {
      result.message = authError.getUserFriendlyMessage();
      toast.error(result.message);
    } else if (authError instanceof RateLimitError) {
      result.message = authError.getUserFriendlyMessage();
      result.shouldRetry = true;
      result.retryAfter = authError.retryAfter * 1000; // Convert to milliseconds
      toast.error(result.message);
    } else if (authError instanceof NetworkConnectionError) {
      result.message = authError.getUserFriendlyMessage();
      result.shouldRetry = true;
      result.retryAfter = 5000; // 5 seconds for network errors
      toast.error(result.message);
    } else if (error instanceof MentaraApiError) {
      // Handle specific HTTP status codes
      switch (error.status) {
        case 400:
          result.message = "Invalid request. Please check your input and try again.";
          toast.error(result.message);
          break;

        case 401:
          result.message = "Session expired. Please sign in again.";
          result.shouldRedirect = true;
          result.redirectTo = getCentralizedSignInUrl(context);
          toast.error(result.message);
          
          // Clear stored tokens
          if (typeof window !== "undefined") {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
          }
          break;

        case 403:
          result.message = "Access denied. You don't have permission to perform this action.";
          toast.error(result.message);
          break;

        case 404:
          result.message = "The requested resource was not found.";
          toast.error(result.message);
          break;

        case 409:
          result.message = "Conflict detected. This email may already be registered.";
          toast.error(result.message);
          break;

        case 422:
          // Validation errors
          if (error.isValidationError()) {
            const fieldErrors = error.getFieldErrors();
            result.fieldErrors = fieldErrors;
            
            // Show first field error as toast
            const firstError = Object.values(fieldErrors)[0];
            if (firstError) {
              toast.error(firstError);
            }
          } else {
            result.message = "Validation failed. Please check your input.";
            toast.error(result.message);
          }
          break;

        case 429:
          result.message = "Too many attempts. Please wait before trying again.";
          result.shouldRetry = true;
          result.retryAfter = 60000; // 1 minute
          toast.error(result.message);
          break;

        case 500:
          result.message = "Internal server error. Our team has been notified.";
          result.shouldRetry = true;
          result.retryAfter = 5000; // 5 seconds
          toast.error(result.message);
          break;

        case 502:
        case 503:
        case 504:
          result.message = "Service temporarily unavailable. Please try again.";
          result.shouldRetry = true;
          result.retryAfter = 10000; // 10 seconds
          toast.error(result.message);
          break;

        default:
          result.message = `An error occurred (${error.status}). Please try again.`;
          toast.error(result.message);
      }
    } else if (error instanceof Error) {
      // Handle network errors
      if (error.name === "NetworkError" || error.message.includes("fetch")) {
        result.message = "Network error. Please check your connection and try again.";
        result.shouldRetry = true;
        result.retryAfter = 5000;
        toast.error(result.message);
      } else {
        // Generic error handling
        result.message = error.message || "An unexpected error occurred.";
        toast.error(result.message);
      }
    } else {
      // Unknown error type
      result.message = "An unexpected error occurred. Please try again.";
      toast.error(result.message);
    }

    return result;
  }, [router]);

  /**
   * Get the centralized sign-in URL for redirects
   * 
   * Since authentication has been centralized to a single sign-in route,
   * all authentication redirects now go to the same location regardless of role.
   * The system will automatically redirect users to their appropriate dashboard
   * after successful authentication based on their role.
   * 
   * @param _context - Auth error context (unused but kept for API compatibility)
   * @returns The centralized sign-in URL
   */
  const getCentralizedSignInUrl = (_context: AuthErrorContext): string => {
    return "/auth/sign-in";
  };

  /**
   * Clear all authentication state from browser storage
   * 
   * This function removes all authentication-related data from localStorage
   * and should be called when the user logs out or when authentication fails.
   * 
   * @example
   * ```tsx
   * const { clearAuthState } = useAuthErrorHandler();
   * 
   * const handleLogout = () => {
   *   clearAuthState();
   *   router.push('/auth/sign-in');
   * };
   * ```
   */
  const clearAuthState = useCallback((): void => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      
      // Note: Zustand store clearing should be handled by the AuthContext
      // when logout() is called, this function focuses on browser storage cleanup
    }
  }, []);

  /**
   * Handle automatic retry logic for failed operations
   * 
   * This function automatically retries a failed operation with exponential backoff
   * and provides user feedback about retry attempts. It's particularly useful for
   * handling transient network errors or temporary server issues.
   * 
   * @param originalFunction - The async function to retry
   * @param retryAfter - Time to wait before retry in milliseconds (default: 5000)
   * @param maxRetries - Maximum number of retry attempts (default: 3)
   * @returns Promise that resolves when the operation succeeds or rejects after max retries
   * 
   * @example
   * ```tsx
   * const { handleRetry } = useAuthErrorHandler();
   * 
   * const retryLogin = async () => {
   *   try {
   *     await handleRetry(
   *       () => api.auth.login(credentials),
   *       5000, // 5 second delay
   *       3     // max 3 retries
   *     );
   *   } catch (error) {
   *     console.error('Login failed after retries:', error);
   *   }
   * };
   * ```
   */
  const handleRetry = useCallback((
    originalFunction: () => Promise<void>,
    retryAfter: number = 5000,
    maxRetries: number = 3
  ): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      let retryCount = 0;
      
      const attemptRetry = () => {
        if (retryCount >= maxRetries) {
          reject(new Error(`Max retries (${maxRetries}) exceeded`));
          return;
        }
        
        retryCount++;
        toast.info(`Retrying... (${retryCount}/${maxRetries})`);
        
        setTimeout(async () => {
          try {
            await originalFunction();
            resolve();
          } catch (error) {
            const result = handleAuthError(error, {
              component: "RetryHandler",
              action: "retry",
              metadata: { retryCount, maxRetries }
            });
            
            if (result.shouldRetry && retryCount < maxRetries) {
              attemptRetry();
            } else {
              reject(error);
            }
          }
        }, retryAfter);
      };
      
      attemptRetry();
    });
  }, [handleAuthError]);

  return {
    handleAuthError,
    clearAuthState,
    handleRetry,
  };
}