/**
 * Comments Module Types - Central exports for comment types and DTOs
 */

// Export all comment DTOs
export * from './comment.dto';

// Re-export commonly used types for convenience
export type {
  CommentCreateInputDto,
  CommentUpdateInputDto,
  CommentResponseDto,
  CommentQueryDto,
  CommentInteractionDto,
} from './comment.dto';