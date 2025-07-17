/**
 * Auth hooks module
 * 
 * Central authentication hooks following clean architecture principles:
 * - useAuth: Main authentication hook with all auth functionality
 * - useApiAuth: API-specific authentication helpers
 * - useEmailVerification: Email verification workflow management
 */

export { useAuth } from './useAuth';
export { default as useApiAuth } from './useApiAuth';
export { useEmailVerification } from './useEmailVerification';

// Re-export types for convenience
export type { UseAuthReturn } from './useAuth';