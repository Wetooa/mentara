/**
 * Main hooks index - Re-exports all organized hooks
 * 
 * This file maintains backward compatibility while supporting the new
 * organized folder structure for hooks. Uses export * patterns to ensure
 * all named exports are available.
 */

// Auth hooks - Export all named exports
export * from './auth';

// User hooks - Export all named exports  
export * from './user';

// Therapist hooks - Export all named exports
export * from './therapist';

// Dashboard hooks - Export all named exports
export * from './dashboard';

// Admin hooks - Export all named exports
export * from './admin';

// Moderator hooks - Export all named exports
export * from './moderator';

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

// Utility hooks - Export all named exports
export * from './utils';