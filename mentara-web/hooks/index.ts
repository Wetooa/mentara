/**
 * Main hooks index - Re-exports all organized hooks
 * 
 * This file maintains backward compatibility while supporting the new
 * organized folder structure for hooks. Uses explicit exports to avoid conflicts.
 */

// Auth hooks - Export all named exports
export * from './auth';

// User hooks - Export all named exports  
export * from './user';

// Therapist hooks - Export all except conflicting ones
export * from './therapist';
// Use the version from useTherapist (more complete)
export { useTherapistProfile } from './therapist/useTherapist';

// Dashboard hooks - Export all named exports
export * from './dashboard';

// Admin hooks - Export all, using admin versions for conflicts
export * from './admin';
// Explicitly export admin version of conflicting hooks (admin takes precedence)
export { useUpdateTherapistApplicationStatus } from './admin/useAdmin';
export { useUpdateModerationReport as useAdminUpdateModerationReport } from './admin/useAdmin';

// Moderator hooks - Export all named exports
export * from './moderator';
// Explicitly export moderator version of conflicting hooks (moderator takes precedence for moderation)
export { useUpdateModerationReport } from './moderator/useModerator';

// Notification hooks - Export all named exports
export * from './notifications';

// Pre-assessment hooks - Export all named exports
export * from './pre-assessment';

// Review hooks - Export all named exports
export * from './reviews';

// Session hooks - Export all named exports
export * from './sessions';

// Worksheet hooks - Export all named exports
export * from './worksheets';

// Booking hooks - Export all named exports
export * from './booking';

// Community hooks - Export all named exports
export * from './community';

// Messaging hooks - Export all named exports
export * from './messaging';

// Billing hooks - Export all named exports
export * from './billing';

// Profile hooks - Export all named exports
export * from './profile';

// Utility hooks - Export all, but resolve useIsMobile conflict
export * from './utils';
// Use the useMediaQuery version of useIsMobile (more flexible)
export { useIsMobile } from './utils/useMediaQuery';