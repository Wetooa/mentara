// Re-export all API types for easy importing
// NOTE: To avoid naming conflicts, we use qualified re-exports where needed

// API Response wrapper for consistency
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  status: 'success' | 'error';
}

// Error response structure
export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: any;
}

// Frontend-specific auth extensions (core auth types now in commons)
export * from './auth-extensions';

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
  // HeartCommentResponse removed - using HeartToggleResponse from @mentara/commons
  // CreateReplyRequest removed - using CommentCreateInputDto with parentId
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

// Moderator types (from services)
export {
  ModeratorDashboardStats,
  ContentModerationParams,
  UserModerationParams,
  AuditLogParams,
} from '../../../lib/api/services/moderator';

// Filter types (eliminates Record<string, any> usage)
export * from './filters';

// Meeting types
export * from './meetings';

// Video call types
export * from './video-calls';

// Keep existing service types for backward compatibility
export * from '../booking';
export * from '../review';
export * from '../therapist';
export * from '../patient';
export * from '../filters';