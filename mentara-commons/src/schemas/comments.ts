import { z } from 'zod';

// Comment Schema - Updated for unified Comment/Reply system
export const CommentSchema = z.object({
  id: z.string().uuid(),
  content: z.string(),
  userId: z.string().uuid(), // Changed from authorId to match Prisma schema
  postId: z.string().uuid(),
  parentId: z.string().uuid().optional(), // Changed from parentCommentId to match Prisma schema
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  // File attachments (inline arrays like in Prisma schema)
  attachmentUrls: z.array(z.string()).optional(),
  attachmentNames: z.array(z.string()).optional(),
  attachmentSizes: z.array(z.number()).optional()
});

// Create Comment Schema - Updated for unified Comment/Reply system
export const CreateCommentDtoSchema = z.object({
  content: z.string().min(1, 'Comment content is required').max(1000, 'Comment too long'),
  postId: z.string().uuid('Invalid post ID format'),
  parentId: z.string().uuid('Invalid parent ID format').optional() // Changed from parentCommentId
});

// Update Comment Schema
export const UpdateCommentDtoSchema = z.object({
  content: z.string().min(1, 'Comment content is required').max(1000, 'Comment too long')
});

// Comment Heart Schema - Simplified to only hearts (matches CommentHeart model)
export const CommentHeartSchema = z.object({
  id: z.string().uuid(),
  commentId: z.string().uuid(),
  userId: z.string().uuid(),
  createdAt: z.string().datetime()
});

// Heart Toggle Response Schema
export const HeartToggleResponseSchema = z.object({
  hearted: z.boolean()
});

// Comment Report Schema
export const ReportCommentDtoSchema = z.object({
  reason: z.enum(['spam', 'harassment', 'inappropriate', 'misinformation', 'other']),
  description: z.string().optional()
});

// Comment Query Parameters
export const CommentQuerySchema = z.object({
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  postId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(), // Changed from authorId to match Prisma schema
  parentId: z.string().uuid().optional(), // Changed from parentCommentId to match Prisma schema
  includeDeleted: z.boolean().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'hearts']).optional(), // Changed 'likes' to 'hearts' to match our system
  sortOrder: z.enum(['asc', 'desc']).optional()
});

// Parameter Schemas
export const CommentIdParamSchema = z.object({
  id: z.string().uuid('Invalid comment ID format')
});

// CommentReactionParam removed - no longer needed with simplified hearts system

// Export type inference helpers
export type Comment = z.infer<typeof CommentSchema>;
export type CreateCommentDto = z.infer<typeof CreateCommentDtoSchema>;
export type UpdateCommentDto = z.infer<typeof UpdateCommentDtoSchema>;
export type CommentHeart = z.infer<typeof CommentHeartSchema>;
export type HeartToggleResponse = z.infer<typeof HeartToggleResponseSchema>;
export type ReportCommentDto = z.infer<typeof ReportCommentDtoSchema>;
export type CommentQuery = z.infer<typeof CommentQuerySchema>;
export type CommentIdParam = z.infer<typeof CommentIdParamSchema>;

// Additional DTOs for CommentsController endpoints
export const CommentParamsDtoSchema = z.object({
  id: z.string().uuid('Invalid comment ID format')
});

export const CommentPostParamsDtoSchema = z.object({
  postId: z.string().uuid('Invalid post ID format')
});

export const CommentCreateInputDtoSchema = z.object({
  content: z.string().min(1, 'Comment content is required').max(1000, 'Comment too long'),
  postId: z.string().uuid('Invalid post ID format'),
  parentId: z.string().uuid('Invalid parent ID format').optional() // Changed from parentCommentId to match Prisma schema
});

export const CommentUpdateInputDtoSchema = z.object({
  content: z.string().min(1, 'Comment content is required').max(1000, 'Comment too long')
});

// Type exports for new DTOs
export type CommentParamsDto = z.infer<typeof CommentParamsDtoSchema>;
export type CommentPostParamsDto = z.infer<typeof CommentPostParamsDtoSchema>;
export type CommentCreateInputDto = z.infer<typeof CommentCreateInputDtoSchema>;
export type CommentUpdateInputDto = z.infer<typeof CommentUpdateInputDtoSchema>;