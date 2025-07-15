import { z } from 'zod';

// Comment Schema
export const CommentSchema = z.object({
  id: z.string().uuid(),
  content: z.string(),
  authorId: z.string().uuid(),
  postId: z.string().uuid(),
  parentCommentId: z.string().uuid().optional(),
  isEdited: z.boolean(),
  isDeleted: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

// Create Comment Schema
export const CreateCommentDtoSchema = z.object({
  content: z.string().min(1, 'Comment content is required').max(1000, 'Comment too long'),
  postId: z.string().uuid('Invalid post ID format'),
  parentCommentId: z.string().uuid('Invalid parent comment ID format').optional()
});

// Update Comment Schema
export const UpdateCommentDtoSchema = z.object({
  content: z.string().min(1, 'Comment content is required').max(1000, 'Comment too long')
});

// Comment Reaction Schema
export const CommentReactionSchema = z.object({
  id: z.string().uuid(),
  commentId: z.string().uuid(),
  userId: z.string().uuid(),
  type: z.enum(['like', 'dislike', 'heart', 'laugh']),
  createdAt: z.string().datetime()
});

// Create Reaction Schema
export const CreateReactionDtoSchema = z.object({
  type: z.enum(['like', 'dislike', 'heart', 'laugh'])
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
  authorId: z.string().uuid().optional(),
  parentCommentId: z.string().uuid().optional(),
  includeDeleted: z.boolean().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'likes']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
});

// Parameter Schemas
export const CommentIdParamSchema = z.object({
  id: z.string().uuid('Invalid comment ID format')
});

export const CommentReactionParamSchema = z.object({
  commentId: z.string().uuid('Invalid comment ID format'),
  reactionId: z.string().uuid('Invalid reaction ID format')
});

// Export type inference helpers
export type Comment = z.infer<typeof CommentSchema>;
export type CreateCommentDto = z.infer<typeof CreateCommentDtoSchema>;
export type UpdateCommentDto = z.infer<typeof UpdateCommentDtoSchema>;
export type CommentReaction = z.infer<typeof CommentReactionSchema>;
export type CreateReactionDto = z.infer<typeof CreateReactionDtoSchema>;
export type ReportCommentDto = z.infer<typeof ReportCommentDtoSchema>;
export type CommentQuery = z.infer<typeof CommentQuerySchema>;
export type CommentIdParam = z.infer<typeof CommentIdParamSchema>;
export type CommentReactionParam = z.infer<typeof CommentReactionParamSchema>;

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
  parentCommentId: z.string().uuid('Invalid parent comment ID format').optional(),
  isAnonymous: z.boolean().default(false),
  attachments: z.array(z.string().uuid()).optional()
});

export const CommentUpdateInputDtoSchema = z.object({
  content: z.string().min(1, 'Comment content is required').max(1000, 'Comment too long')
});

// Type exports for new DTOs
export type CommentParamsDto = z.infer<typeof CommentParamsDtoSchema>;
export type CommentPostParamsDto = z.infer<typeof CommentPostParamsDtoSchema>;
export type CommentCreateInputDto = z.infer<typeof CommentCreateInputDtoSchema>;
export type CommentUpdateInputDto = z.infer<typeof CommentUpdateInputDtoSchema>;