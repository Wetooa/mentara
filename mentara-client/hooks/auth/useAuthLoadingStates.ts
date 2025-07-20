"use client";

import { useState, useCallback } from "react";

/**
 * Authentication operation types for tracking loading states
 */
export type AuthOperation = 
  | "login" 
  | "logout" 
  | "register" 
  | "refresh" 
  | "changePassword" 
  | "resetPassword" 
  | "verifyEmail" 
  | "updateProfile" 
  | "oauth";

/**
 * Loading state information for an authentication operation
 */
export interface LoadingState {
  /** Whether the operation is currently loading */
  isLoading: boolean;
  /** The type of operation being performed */
  operation?: AuthOperation;
  /** Optional message to display during loading */
  message?: string;
  /** Optional progress percentage (0-100) */
  progress?: number;
}

/**
 * Return type for the useAuthLoadingStates hook
 */
export interface UseAuthLoadingStatesReturn {
  /** All current loading states keyed by operation */
  loadingStates: Record<string, LoadingState>;
  /** Whether any operation is currently loading */
  isAnyLoading: boolean;
  /** Check if a specific operation is loading */
  isLoading: (operation: AuthOperation) => boolean;
  /** Get loading message for a specific operation */
  getLoadingMessage: (operation: AuthOperation) => string | undefined;
  /** Get loading progress for a specific operation */
  getLoadingProgress: (operation: AuthOperation) => number | undefined;
  /** Get the currently active operation */
  getCurrentOperation: () => AuthOperation | undefined;
  /** Set loading state for an operation */
  setLoading: (operation: AuthOperation, isLoading: boolean, message?: string, progress?: number) => void;
  /** Set loading state with default message */
  setLoadingWithDefaults: (operation: AuthOperation, isLoading: boolean, customMessage?: string, progress?: number) => void;
  /** Clear loading state for a specific operation */
  clearLoading: (operation: AuthOperation) => void;
  /** Clear all loading states */
  clearAllLoading: () => void;
  /** Get default loading message for an operation */
  getDefaultMessage: (operation: AuthOperation) => string;
}

/**
 * Hook for managing loading states across different authentication operations
 * 
 * This hook provides centralized management of loading states for authentication
 * operations, including login, logout, registration, password changes, and more.
 * It supports progress tracking, custom messages, and provides convenient utilities
 * for managing complex authentication flows.
 * 
 * @example
 * ```tsx
 * function LoginForm() {
 *   const { 
 *     isLoading, 
 *     setLoadingWithDefaults, 
 *     clearLoading 
 *   } = useAuthLoadingStates();
 * 
 *   const handleLogin = async (credentials) => {
 *     setLoadingWithDefaults('login', true);
 *     try {
 *       await login(credentials);
 *     } finally {
 *       clearLoading('login');
 *     }
 *   };
 * 
 *   return (
 *     <form onSubmit={handleLogin}>
 *       <button disabled={isLoading('login')}>
 *         {isLoading('login') ? 'Signing in...' : 'Sign In'}
 *       </button>
 *     </form>
 *   );
 * }
 * ```
 * 
 * Features:
 * - Track multiple concurrent authentication operations
 * - Progress tracking with percentage support
 * - Custom and default loading messages
 * - Convenient state management utilities
 * - TypeScript support with proper typing
 */
export function useAuthLoadingStates(): UseAuthLoadingStatesReturn {
  const [loadingStates, setLoadingStates] = useState<Record<string, LoadingState>>({});
  
  /**
   * Set loading state for a specific authentication operation
   */
  const setLoading = useCallback((
    operation: AuthOperation, 
    isLoading: boolean, 
    message?: string,
    progress?: number
  ): void => {
    setLoadingStates(prev => ({
      ...prev,
      [operation]: {
        isLoading,
        operation,
        message,
        progress,
      }
    }));
  }, []);

  /**
   * Clear loading state for a specific authentication operation
   */
  const clearLoading = useCallback((operation: AuthOperation): void => {
    setLoadingStates(prev => {
      const { [operation]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  /**
   * Clear all loading states
   */
  const clearAllLoading = useCallback((): void => {
    setLoadingStates({});
  }, []);

  /** Whether any operation is currently loading */
  const isAnyLoading = Object.values(loadingStates).some(state => state.isLoading);
  
  /**
   * Check if a specific authentication operation is currently loading
   */
  const isLoading = useCallback((operation: AuthOperation): boolean => {
    return loadingStates[operation]?.isLoading || false;
  }, [loadingStates]);

  /**
   * Get the loading message for a specific authentication operation
   */
  const getLoadingMessage = useCallback((operation: AuthOperation): string | undefined => {
    return loadingStates[operation]?.message;
  }, [loadingStates]);

  /**
   * Get the loading progress (0-100) for a specific authentication operation
   */
  const getLoadingProgress = useCallback((operation: AuthOperation): number | undefined => {
    return loadingStates[operation]?.progress;
  }, [loadingStates]);

  /**
   * Get the currently active (loading) authentication operation
   */
  const getCurrentOperation = useCallback((): AuthOperation | undefined => {
    const activeOperation = Object.values(loadingStates).find(state => state.isLoading);
    return activeOperation?.operation;
  }, [loadingStates]);

  /**
   * Get the default loading message for an authentication operation
   */
  const getDefaultMessage = useCallback((operation: AuthOperation): string => {
    switch (operation) {
      case "login":
        return "Signing you in...";
      case "logout":
        return "Signing you out...";
      case "register":
        return "Creating your account...";
      case "refresh":
        return "Refreshing session...";
      case "changePassword":
        return "Updating password...";
      case "resetPassword":
        return "Sending reset instructions...";
      case "verifyEmail":
        return "Verifying email address...";
      case "updateProfile":
        return "Updating profile...";
      case "oauth":
        return "Connecting with OAuth provider...";
      default:
        return "Processing...";
    }
  }, []);

  /**
   * Set loading state with default message for an authentication operation
   * 
   * This is a convenience method that automatically provides appropriate
   * default messages for common authentication operations.
   */
  const setLoadingWithDefaults = useCallback((
    operation: AuthOperation, 
    isLoading: boolean,
    customMessage?: string,
    progress?: number
  ): void => {
    const message = customMessage || getDefaultMessage(operation);
    setLoading(operation, isLoading, message, progress);
  }, [setLoading, getDefaultMessage]);

  return {
    // State getters
    loadingStates,
    isAnyLoading,
    isLoading,
    getLoadingMessage,
    getLoadingProgress,
    getCurrentOperation,
    
    // State setters
    setLoading,
    setLoadingWithDefaults,
    clearLoading,
    clearAllLoading,
    
    // Utilities
    getDefaultMessage,
  };
}