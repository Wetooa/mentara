/**
 * LocalStorage Configuration
 * 
 * Centralized configuration for all localStorage keys used in the application.
 * This ensures consistency and makes it easy to manage storage keys.
 * 
 * Directive: All localStorage keys must be defined in this file.
 */

export const STORAGE_KEYS = {
  // Sidebar state
  SIDEBAR: {
    CLIENT: 'client-sidebar-expanded',
    THERAPIST: 'therapist-sidebar-expanded',
    ADMIN: 'admin-sidebar-expanded',
    MODERATOR: 'moderator-sidebar-expanded',
  },
  
  // Auth tokens (if needed for direct access)
  AUTH: {
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
  },
  
  // Therapist form
  THERAPIST_FORM: 'therapist-form-state',
  
  // Filters
  FILTERS: 'therapist-filters',
  
  // Messaging
  MESSAGING: {
    SELECTED_CONVERSATION: 'messaging-selected-conversation',
    POPUP_WIDTH: 'messages-popup-width',
  },
  
  // Add other storage keys here as needed
} as const;

/**
 * Helper function to get sidebar storage key for a role
 */
export function getSidebarStorageKey(role: 'client' | 'therapist' | 'admin' | 'moderator'): string {
  return STORAGE_KEYS.SIDEBAR[role.toUpperCase() as keyof typeof STORAGE_KEYS.SIDEBAR];
}

/**
 * Helper function to safely get item from localStorage
 */
export function getStorageItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  
  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      return defaultValue;
    }
    return JSON.parse(item) as T;
  } catch (error) {
    console.warn(`Failed to parse localStorage item "${key}":`, error);
    return defaultValue;
  }
}

/**
 * Helper function to safely set item in localStorage
 */
export function setStorageItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Failed to save to localStorage "${key}":`, error);
  }
}

