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

export interface AuthErrorContext {
  component: string;
  action: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

export interface AuthErrorResult {
  shouldRedirect: boolean;
  redirectTo?: string;
  shouldRetry: boolean;
  retryAfter?: number;
  fieldErrors?: Record<string, string>;
  message?: string;
}

export function useAuthErrorHandler() {
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

    // Log error with context for monitoring
    console.error(`Auth Error [${context.component}:${context.action}]:`, {
      error: authError,
      originalError: error,
      context,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== "undefined" ? window.navigator.userAgent : undefined,
    });

    // Handle specific auth error types
    if (authError instanceof TokenExpiredError) {
      result.message = authError.getUserFriendlyMessage();
      result.shouldRedirect = true;
      result.redirectTo = getRoleSpecificSignInUrl(context);
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
          result.redirectTo = getRoleSpecificSignInUrl(context);
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

  const getRoleSpecificSignInUrl = (context: AuthErrorContext): string => {
    // Try to determine role from component name or context
    const component = context.component.toLowerCase();
    
    if (component.includes("client")) return "/client/sign-in";
    if (component.includes("therapist")) return "/therapist/sign-in";
    if (component.includes("admin")) return "/admin/sign-in";
    if (component.includes("moderator")) return "/moderator/sign-in";
    
    // Default fallback
    return "/client/sign-in";
  };

  const clearAuthState = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      
      // Clear Zustand stores
      // Note: This would need to be implemented based on the store structure
    }
  }, []);

  const handleRetry = useCallback((
    originalFunction: () => Promise<void>,
    retryAfter: number = 5000,
    maxRetries: number = 3
  ) => {
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