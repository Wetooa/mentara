"use client";

import { useState, useCallback } from "react";

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

export interface LoadingState {
  isLoading: boolean;
  operation?: AuthOperation;
  message?: string;
  progress?: number;
}

export function useAuthLoadingStates() {
  const [loadingStates, setLoadingStates] = useState<Record<string, LoadingState>>({});
  
  const setLoading = useCallback((
    operation: AuthOperation, 
    isLoading: boolean, 
    message?: string,
    progress?: number
  ) => {
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

  const clearLoading = useCallback((operation: AuthOperation) => {
    setLoadingStates(prev => {
      const { [operation]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  const clearAllLoading = useCallback(() => {
    setLoadingStates({});
  }, []);

  const isAnyLoading = Object.values(loadingStates).some(state => state.isLoading);
  
  const isLoading = useCallback((operation: AuthOperation) => {
    return loadingStates[operation]?.isLoading || false;
  }, [loadingStates]);

  const getLoadingMessage = useCallback((operation: AuthOperation) => {
    return loadingStates[operation]?.message;
  }, [loadingStates]);

  const getLoadingProgress = useCallback((operation: AuthOperation) => {
    return loadingStates[operation]?.progress;
  }, [loadingStates]);

  const getCurrentOperation = useCallback(() => {
    const activeOperation = Object.values(loadingStates).find(state => state.isLoading);
    return activeOperation?.operation;
  }, [loadingStates]);

  // Predefined loading messages for common operations
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

  // Convenience method to set loading with default message
  const setLoadingWithDefaults = useCallback((
    operation: AuthOperation, 
    isLoading: boolean,
    customMessage?: string,
    progress?: number
  ) => {
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