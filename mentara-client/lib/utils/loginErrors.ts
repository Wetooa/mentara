import { AxiosError } from "axios";

export interface LoginErrorResult {
  message: string;
  isRecoverable: boolean;
  actionHint?: string;
}

/**
 * Maps backend login errors to user-friendly messages
 * Handles different error scenarios with appropriate user guidance
 */
export function mapLoginError(error: unknown): LoginErrorResult {
  // Handle network errors
  if (error instanceof Error && error.message.includes('Network Error')) {
    return {
      message: "Connection problem. Please check your internet connection and try again.",
      isRecoverable: true,
      actionHint: "Check your internet connection"
    };
  }

  // Handle axios errors
  if (error instanceof Error && 'response' in error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    
    if (axiosError.response?.status === 401) {
      const backendMessage = axiosError.response.data?.message || '';
      
      // Map specific backend error messages to user-friendly ones
      if (backendMessage.includes('Invalid credentials')) {
        return {
          message: "Incorrect email or password. Please try again.",
          isRecoverable: true,
          actionHint: "Double-check your email and password"
        };
      }
      
      if (backendMessage.includes('temporarily locked')) {
        return {
          message: "Your account is temporarily locked due to too many failed attempts. Please try again in a few minutes.",
          isRecoverable: true,
          actionHint: "Wait a few minutes before trying again"
        };
      }
      
      if (backendMessage.includes('verify your email')) {
        return {
          message: "Please verify your email address before signing in. Check your inbox for a verification link.",
          isRecoverable: true,
          actionHint: "Check your email for verification link"
        };
      }
      
      if (backendMessage.includes('deactivated')) {
        return {
          message: "Your account has been deactivated. Please contact support for assistance.",
          isRecoverable: false,
          actionHint: "Contact support"
        };
      }
      
      if (backendMessage.includes('complete account setup')) {
        return {
          message: "Please complete your account setup or reset your password to continue.",
          isRecoverable: true,
          actionHint: "Try resetting your password"
        };
      }
      
      // Generic 401 fallback
      return {
        message: "Unable to sign in. Please check your credentials and try again.",
        isRecoverable: true,
        actionHint: "Verify your email and password"
      };
    }
    
    if (axiosError.response?.status === 429) {
      return {
        message: "Too many login attempts. Please wait a moment before trying again.",
        isRecoverable: true,
        actionHint: "Wait a few minutes"
      };
    }
    
    if (axiosError.response?.status === 422) {
      return {
        message: "Please check that your email and password are entered correctly.",
        isRecoverable: true,
        actionHint: "Verify your input format"
      };
    }
    
    if (axiosError.response?.status >= 500) {
      return {
        message: "Our servers are experiencing issues. Please try again in a moment.",
        isRecoverable: true,
        actionHint: "Try again in a few minutes"
      };
    }
  }
  
  // Handle generic errors
  if (error instanceof Error) {
    // Don't expose technical error messages to users
    return {
      message: "Something went wrong while signing in. Please try again.",
      isRecoverable: true,
      actionHint: "Try again or contact support if the problem persists"
    };
  }
  
  // Fallback for unknown errors
  return {
    message: "An unexpected error occurred. Please try again.",
    isRecoverable: true,
    actionHint: "Try again or refresh the page"
  };
}

/**
 * Get a simplified error message for toast notifications
 */
export function getSimpleErrorMessage(error: unknown): string {
  const mapped = mapLoginError(error);
  return mapped.message;
}

/**
 * Check if an error is a login-related authentication error
 */
export function isLoginError(error: unknown): boolean {
  if (error instanceof Error && 'response' in error) {
    const axiosError = error as AxiosError;
    return axiosError.response?.status === 401;
  }
  return false;
}