/**
 * Authentication constants for token storage
 * Centralized to prevent key mismatches between login flow and API client
 */
export const TOKEN_STORAGE_KEY = 'token';

/**
 * Utility function to safely check if authentication token is available
 * Safe for server-side rendering as it checks for browser environment first
 */
export const hasAuthToken = (): boolean => {
  if (typeof window === 'undefined') {
    return false; // No token available during SSR
  }
  
  try {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    return !!token && token.trim().length > 0;
  } catch (error) {
    // Handle localStorage access errors gracefully
    console.warn('Failed to access localStorage for token check:', error);
    return false;
  }
};

/**
 * Utility function to safely get authentication token
 * Returns null if not available or during SSR
 */
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') {
    return null; // No token available during SSR
  }
  
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch (error) {
    // Handle localStorage access errors gracefully
    console.warn('Failed to access localStorage for token retrieval:', error);
    return null;
  }
};