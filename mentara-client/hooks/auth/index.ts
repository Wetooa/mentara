/**
 * Auth hooks module
 * 
 * Central authentication hooks following clean architecture principles:
 * - useAuth: Main authentication hook with all auth functionality
 * - useApiAuth: API-specific authentication helpers
 */

export { useAuth } from './useAuth';
export { default as useApiAuth } from './useApiAuth';

// Re-export types for convenience
export type { UseAuthReturn } from './useAuth';