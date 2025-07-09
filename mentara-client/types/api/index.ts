// Re-export all API types for easy importing
// NOTE: To avoid naming conflicts, we use qualified re-exports where needed

// Core auth and user types
export * from './auth';
export * from './users';

// Client-specific types  
export * from './client';

// Communication types
export * from './messaging';

// Content types (avoiding conflicts by being selective)
export {
  // Posts-specific types
  PostCreateInputDto,
  PostUpdateInputDto,
  PostListParams,
  PostListResponse,
  HeartPostResponse,
  CheckHeartedResponse,
} from './posts';

export {
  // Comments-specific types
  CommentCreateInputDto,
  CommentUpdateInputDto,
  CommentListParams,
  CommentListResponse,
  HeartCommentResponse,
  CreateReplyRequest as CommentReplyRequest,
} from './comments';

// Community types (these are the primary ones we use)
export * from './communities';

// Therapist and application types
export * from './therapists';
export * from './therapist-application';

// Service-specific types
export * from './worksheets';
export * from './files';
export * from './admin';
export * from './search';
export * from './notifications';
export * from './pre-assessment';
export * from './sessions';
export * from './analytics';
export * from './audit-logs';

// Keep existing service types for backward compatibility
export * from '../booking';
export * from '../review';
export * from '../therapist';
export * from '../patient';
export * from '../filters';