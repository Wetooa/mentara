// Schema exports - Basic modules without conflicts
export * from './user';
export * from './review';
export * from './messaging';
export * from './analytics';
export * from './audit-logs';
export * from './billing';
export * from './client-therapist-requests';
export * from './communities';
export * from './files';
export * from './notifications';
export * from './onboarding';
export * from './sessions';
export * from './worksheets';
export * from './pre-assessment';
export * from './push-notifications';
export * from './client';

// Export schemas that have name conflicts
export * from './comments';
export * from './posts';
export * from './booking';
export * from './meetings';
export * from './admin';
export * from './moderator';
export * from './therapist';
export * from './search';

// Re-export zod for convenience
export { z } from 'zod';