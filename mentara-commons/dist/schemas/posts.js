"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostRoomParamsDtoSchema = exports.PostUpdateInputDtoSchema = exports.PostCreateInputDtoSchema = exports.PostParamsDtoSchema = exports.PostReactionParamSchema = exports.PostIdParamSchema = exports.ModeratePostDtoSchema = exports.PostQuerySchema = exports.PollVoteDtoSchema = exports.ReportPostDtoSchema = exports.CreatePostReactionDtoSchema = exports.PostReactionSchema = exports.UpdatePostDtoSchema = exports.CreatePostDtoSchema = exports.PostSchema = void 0;
const zod_1 = require("zod");
// Post Schema
exports.PostSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    title: zod_1.z.string(),
    content: zod_1.z.string(),
    authorId: zod_1.z.string().uuid(),
    communityId: zod_1.z.string().uuid(),
    type: zod_1.z.enum(['text', 'image', 'video', 'link', 'poll']),
    isEdited: zod_1.z.boolean(),
    isDeleted: zod_1.z.boolean(),
    isPinned: zod_1.z.boolean(),
    viewCount: zod_1.z.number(),
    likeCount: zod_1.z.number(),
    commentCount: zod_1.z.number(),
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime()
});
// Create Post Schema
exports.CreatePostDtoSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is required').max(200, 'Title too long'),
    content: zod_1.z.string().min(1, 'Content is required').max(5000, 'Content too long'),
    communityId: zod_1.z.string().uuid('Invalid community ID format'),
    type: zod_1.z.enum(['text', 'image', 'video', 'link', 'poll']).default('text'),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    attachments: zod_1.z.array(zod_1.z.string().uuid()).optional(),
    pollOptions: zod_1.z.array(zod_1.z.string()).optional(),
    linkUrl: zod_1.z.string().url().optional()
});
// Update Post Schema
exports.UpdatePostDtoSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is required').max(200, 'Title too long').optional(),
    content: zod_1.z.string().min(1, 'Content is required').max(5000, 'Content too long').optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    isPinned: zod_1.z.boolean().optional()
});
// Post Reaction Schema
exports.PostReactionSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    postId: zod_1.z.string().uuid(),
    userId: zod_1.z.string().uuid(),
    type: zod_1.z.enum(['like', 'dislike', 'heart', 'laugh', 'angry']),
    createdAt: zod_1.z.string().datetime()
});
// Create Post Reaction Schema
exports.CreatePostReactionDtoSchema = zod_1.z.object({
    type: zod_1.z.enum(['like', 'dislike', 'heart', 'laugh', 'angry'])
});
// Post Report Schema
exports.ReportPostDtoSchema = zod_1.z.object({
    reason: zod_1.z.enum(['spam', 'harassment', 'inappropriate', 'misinformation', 'copyright', 'other']),
    description: zod_1.z.string().optional()
});
// Post Poll Vote Schema
exports.PollVoteDtoSchema = zod_1.z.object({
    optionIndex: zod_1.z.number().min(0, 'Option index must be non-negative')
});
// Post Query Parameters
exports.PostQuerySchema = zod_1.z.object({
    page: zod_1.z.number().min(1).optional(),
    limit: zod_1.z.number().min(1).max(100).optional(),
    communityId: zod_1.z.string().uuid().optional(),
    authorId: zod_1.z.string().uuid().optional(),
    type: zod_1.z.enum(['text', 'image', 'video', 'link', 'poll']).optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    search: zod_1.z.string().optional(),
    isPinned: zod_1.z.boolean().optional(),
    includeDeleted: zod_1.z.boolean().optional(),
    sortBy: zod_1.z.enum(['createdAt', 'updatedAt', 'likeCount', 'commentCount', 'viewCount']).optional(),
    sortOrder: zod_1.z.enum(['asc', 'desc']).optional()
});
// Post Moderation Schema
exports.ModeratePostDtoSchema = zod_1.z.object({
    action: zod_1.z.enum(['approve', 'reject', 'remove', 'pin', 'unpin']),
    reason: zod_1.z.string().optional(),
    notifyAuthor: zod_1.z.boolean().default(true)
});
// Parameter Schemas
exports.PostIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('Invalid post ID format')
});
exports.PostReactionParamSchema = zod_1.z.object({
    postId: zod_1.z.string().uuid('Invalid post ID format'),
    reactionId: zod_1.z.string().uuid('Invalid reaction ID format')
});
// Additional DTOs for PostsController endpoints
exports.PostParamsDtoSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('Invalid post ID format')
});
exports.PostCreateInputDtoSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is required').max(200, 'Title too long'),
    content: zod_1.z.string().min(1, 'Content is required').max(5000, 'Content too long'),
    communityId: zod_1.z.string().uuid('Invalid community ID format').optional(),
    roomId: zod_1.z.string().uuid('Invalid room ID format').optional(),
    type: zod_1.z.enum(['text', 'image', 'video', 'link', 'poll', 'announcement']).default('text'),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    attachments: zod_1.z.array(zod_1.z.string().uuid()).optional(),
    isAnonymous: zod_1.z.boolean().default(false),
    allowComments: zod_1.z.boolean().default(true),
    scheduledAt: zod_1.z.string().datetime().optional(),
    pollOptions: zod_1.z.array(zod_1.z.string()).optional(), // For poll type posts
    linkUrl: zod_1.z.string().url().optional() // For link type posts
}).refine((data) => {
    if (data.type === 'poll' && (!data.pollOptions || data.pollOptions.length < 2)) {
        return false;
    }
    if (data.type === 'link' && !data.linkUrl) {
        return false;
    }
    return true;
}, {
    message: 'Poll posts must have at least 2 options, link posts must have a URL',
    path: ['type']
});
exports.PostUpdateInputDtoSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is required').max(200, 'Title too long').optional(),
    content: zod_1.z.string().min(1, 'Content is required').max(5000, 'Content too long').optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    isPinned: zod_1.z.boolean().optional(),
    allowComments: zod_1.z.boolean().optional(),
    scheduledAt: zod_1.z.string().datetime().optional()
});
exports.PostRoomParamsDtoSchema = zod_1.z.object({
    roomId: zod_1.z.string().uuid('Invalid room ID format')
});
//# sourceMappingURL=posts.js.map