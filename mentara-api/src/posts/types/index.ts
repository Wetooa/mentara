/**
 * Posts Module Types - Central exports for post types and DTOs
 */

// Export all post DTOs
export * from './post.dto';

// Re-export commonly used types for convenience
export type {
  PostCreateInputDto,
  PostUpdateInputDto,
  PostResponseDto,
  PostQueryDto,
  PostInteractionDto,
} from './post.dto';