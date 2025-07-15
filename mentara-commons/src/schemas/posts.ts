import { z } from 'zod';

// Post Schema
export const PostSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  content: z.string(),
  authorId: z.string().uuid(),
  communityId: z.string().uuid(),
  type: z.enum(['text', 'image', 'video', 'link', 'poll']),
  isEdited: z.boolean(),
  isDeleted: z.boolean(),
  isPinned: z.boolean(),
  viewCount: z.number(),
  likeCount: z.number(),
  commentCount: z.number(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

// Create Post Schema
export const CreatePostDtoSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  content: z.string().min(1, 'Content is required').max(5000, 'Content too long'),
  communityId: z.string().uuid('Invalid community ID format'),
  type: z.enum(['text', 'image', 'video', 'link', 'poll']).default('text'),
  tags: z.array(z.string()).optional(),
  attachments: z.array(z.string().uuid()).optional(),
  pollOptions: z.array(z.string()).optional(),
  linkUrl: z.string().url().optional()
});

// Update Post Schema
export const UpdatePostDtoSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long').optional(),
  content: z.string().min(1, 'Content is required').max(5000, 'Content too long').optional(),
  tags: z.array(z.string()).optional(),
  isPinned: z.boolean().optional()
});

// Post Reaction Schema
export const PostReactionSchema = z.object({
  id: z.string().uuid(),
  postId: z.string().uuid(),
  userId: z.string().uuid(),
  type: z.enum(['like', 'dislike', 'heart', 'laugh', 'angry']),
  createdAt: z.string().datetime()
});

// Create Post Reaction Schema
export const CreatePostReactionDtoSchema = z.object({
  type: z.enum(['like', 'dislike', 'heart', 'laugh', 'angry'])
});

// Post Report Schema
export const ReportPostDtoSchema = z.object({
  reason: z.enum(['spam', 'harassment', 'inappropriate', 'misinformation', 'copyright', 'other']),
  description: z.string().optional()
});

// Post Poll Vote Schema
export const PollVoteDtoSchema = z.object({
  optionIndex: z.number().min(0, 'Option index must be non-negative')
});

// Post Query Parameters
export const PostQuerySchema = z.object({
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  communityId: z.string().uuid().optional(),
  authorId: z.string().uuid().optional(),
  type: z.enum(['text', 'image', 'video', 'link', 'poll']).optional(),
  tags: z.array(z.string()).optional(),
  search: z.string().optional(),
  isPinned: z.boolean().optional(),
  includeDeleted: z.boolean().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'likeCount', 'commentCount', 'viewCount']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
});

// Post Moderation Schema
export const ModeratePostDtoSchema = z.object({
  action: z.enum(['approve', 'reject', 'remove', 'pin', 'unpin']),
  reason: z.string().optional(),
  notifyAuthor: z.boolean().default(true)
});

// Parameter Schemas
export const PostIdParamSchema = z.object({
  id: z.string().uuid('Invalid post ID format')
});

export const PostReactionParamSchema = z.object({
  postId: z.string().uuid('Invalid post ID format'),
  reactionId: z.string().uuid('Invalid reaction ID format')
});

// Export type inference helpers
export type Post = z.infer<typeof PostSchema>;
export type CreatePostDto = z.infer<typeof CreatePostDtoSchema>;
export type UpdatePostDto = z.infer<typeof UpdatePostDtoSchema>;
export type PostReaction = z.infer<typeof PostReactionSchema>;
export type CreatePostReactionDto = z.infer<typeof CreatePostReactionDtoSchema>;
export type ReportPostDto = z.infer<typeof ReportPostDtoSchema>;
export type PollVoteDto = z.infer<typeof PollVoteDtoSchema>;
export type PostQuery = z.infer<typeof PostQuerySchema>;
export type ModeratePostDto = z.infer<typeof ModeratePostDtoSchema>;
export type PostIdParam = z.infer<typeof PostIdParamSchema>;
export type PostReactionParam = z.infer<typeof PostReactionParamSchema>;

// Additional DTOs for PostsController endpoints
export const PostParamsDtoSchema = z.object({
  id: z.string().uuid('Invalid post ID format')
});

export const PostCreateInputDtoSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  content: z.string().min(1, 'Content is required').max(5000, 'Content too long'),
  communityId: z.string().uuid('Invalid community ID format').optional(),
  roomId: z.string().uuid('Invalid room ID format').optional(),
  type: z.enum(['text', 'image', 'video', 'link', 'poll', 'announcement']).default('text'),
  tags: z.array(z.string()).optional(),
  attachments: z.array(z.string().uuid()).optional(),
  isAnonymous: z.boolean().default(false),
  allowComments: z.boolean().default(true),
  scheduledAt: z.string().datetime().optional(),
  pollOptions: z.array(z.string()).optional(), // For poll type posts
  linkUrl: z.string().url().optional() // For link type posts
}).refine(
  (data) => {
    if (data.type === 'poll' && (!data.pollOptions || data.pollOptions.length < 2)) {
      return false;
    }
    if (data.type === 'link' && !data.linkUrl) {
      return false;
    }
    return true;
  },
  {
    message: 'Poll posts must have at least 2 options, link posts must have a URL',
    path: ['type']
  }
);

export const PostUpdateInputDtoSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long').optional(),
  content: z.string().min(1, 'Content is required').max(5000, 'Content too long').optional(),
  tags: z.array(z.string()).optional(),
  isPinned: z.boolean().optional(),
  allowComments: z.boolean().optional(),
  scheduledAt: z.string().datetime().optional()
});

export const PostRoomParamsDtoSchema = z.object({
  roomId: z.string().uuid('Invalid room ID format')
});

// Type exports for new DTOs
export type PostParamsDto = z.infer<typeof PostParamsDtoSchema>;
export type PostCreateInputDto = z.infer<typeof PostCreateInputDtoSchema>;
export type PostUpdateInputDto = z.infer<typeof PostUpdateInputDtoSchema>;
export type PostRoomParamsDto = z.infer<typeof PostRoomParamsDtoSchema>;