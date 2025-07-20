import { z } from 'zod';
// Import CommentHeartSchema from comments.ts to avoid duplication
import { CommentHeartSchema } from './comments';

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

// Reddit Features Schemas
export const VoteContentDtoSchema = z.object({
  contentId: z.string().min(1, 'Content ID is required'),
  contentType: z.enum(['POST', 'COMMENT']),
  voteType: z.enum(['UPVOTE', 'DOWNVOTE'])
});

export const GiveAwardDtoSchema = z.object({
  contentId: z.string().min(1, 'Content ID is required'),
  contentType: z.enum(['POST', 'COMMENT']),
  awardType: z.enum(['SILVER', 'GOLD', 'PLATINUM', 'HELPFUL', 'WHOLESOME', 'ROCKET_LIKE']),
  message: z.string().max(500, 'Message too long').optional(),
  isAnonymous: z.boolean().default(false)
});

export const CreateNestedCommentDtoSchema = z.object({
  postId: z.string().min(1, 'Post ID is required'),
  parentId: z.string().optional(),
  content: z.string().min(1, 'Content is required').max(10000, 'Content too long')
});

export const ReportContentDtoSchema = z.object({
  contentId: z.string().min(1, 'Content ID is required'),
  contentType: z.enum(['POST', 'COMMENT']),
  reason: z.enum(['SPAM', 'HARASSMENT', 'HATE_SPEECH', 'VIOLENCE', 'SEXUAL_CONTENT', 'MISINFORMATION', 'COPYRIGHT', 'SELF_HARM', 'OTHER']),
  description: z.string().max(1000, 'Description too long').optional()
});

// Type exports for new DTOs
export type PostParamsDto = z.infer<typeof PostParamsDtoSchema>;
export type PostCreateInputDto = z.infer<typeof PostCreateInputDtoSchema>;
export type PostUpdateInputDto = z.infer<typeof PostUpdateInputDtoSchema>;
export type PostRoomParamsDto = z.infer<typeof PostRoomParamsDtoSchema>;

// Reddit Features Type exports
export type VoteContentDto = z.infer<typeof VoteContentDtoSchema>;
export type GiveAwardDto = z.infer<typeof GiveAwardDtoSchema>;
export type CreateNestedCommentDto = z.infer<typeof CreateNestedCommentDtoSchema>;
export type ReportContentDto = z.infer<typeof ReportContentDtoSchema>;

// Additional DTOs for posts service query operations
export const PostListParamsDtoSchema = z.object({
  roomId: z.string().uuid().optional(),
  authorId: z.string().uuid().optional(),
  tags: z.array(z.string()).optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
  sortBy: z.enum(['newest', 'oldest', 'popular']).default('newest'),
  isAnonymous: z.boolean().optional()
});

export const PostByUserParamsDtoSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
  roomId: z.string().uuid().optional(),
  tags: z.array(z.string()).optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
  sortBy: z.enum(['newest', 'oldest', 'popular']).default('newest'),
  isAnonymous: z.boolean().optional()
});

export const PostByRoomParamsDtoSchema = z.object({
  roomId: z.string().uuid('Invalid room ID format'),
  authorId: z.string().uuid().optional(),
  tags: z.array(z.string()).optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
  sortBy: z.enum(['newest', 'oldest', 'popular']).default('newest'),
  isAnonymous: z.boolean().optional()
});

// Type exports for new DTOs
export type PostListParamsDto = z.infer<typeof PostListParamsDtoSchema>;
export type PostByUserParamsDto = z.infer<typeof PostByUserParamsDtoSchema>;
export type PostByRoomParamsDto = z.infer<typeof PostByRoomParamsDtoSchema>;

// UI-specific data structures moved from frontend services
export const PostHeartSchema = z.object({
  id: z.string().uuid(),
  postId: z.string().uuid(),
  userId: z.string().uuid(),
  user: z.object({
    id: z.string().uuid(),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    avatarUrl: z.string().url()
  }),
  createdAt: z.string().datetime()
});

export const PostCommentSchema: z.ZodType<any> = z.object({
  id: z.string().uuid(),
  content: z.string().min(1),
  postId: z.string().uuid(),
  authorId: z.string().uuid(),
  author: z.object({
    id: z.string().uuid(),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    avatarUrl: z.string().url()
  }),
  parentId: z.string().uuid().optional(),
  replies: z.array(z.lazy((): z.ZodType<any> => PostCommentSchema)).optional(),
  hearts: z.array(CommentHeartSchema),
  heartCount: z.number().min(0),
  isHearted: z.boolean().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const PostWithDetailsSchema = PostSchema.extend({
  author: z.object({
    id: z.string().uuid(),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    avatarUrl: z.string().url()
  }),
  room: z.object({
    id: z.string().uuid(),
    name: z.string().min(1),
    slug: z.string().min(1)
  }),
  hearts: z.array(PostHeartSchema),
  heartCount: z.number().min(0),
  isHearted: z.boolean().optional(),
  comments: z.array(PostCommentSchema),
  commentCount: z.number().min(0)
});

export const PostListResponseSchema = z.object({
  posts: z.array(PostWithDetailsSchema),
  total: z.number().min(0),
  hasMore: z.boolean()
});

export const HeartPostResponseSchema = z.object({
  isHearted: z.boolean(),
  heartCount: z.number().min(0)
});

export const CheckHeartedResponseSchema = z.object({
  isHearted: z.boolean()
});

// Export type inference helpers for new schemas
export type PostHeart = z.infer<typeof PostHeartSchema>;
// CommentHeart type is exported from comments.ts to avoid duplication
export type PostComment = z.infer<typeof PostCommentSchema>;
export type PostWithDetails = z.infer<typeof PostWithDetailsSchema>;
export type PostListResponse = z.infer<typeof PostListResponseSchema>;
export type HeartPostResponse = z.infer<typeof HeartPostResponseSchema>;
export type CheckHeartedResponse = z.infer<typeof CheckHeartedResponseSchema>;