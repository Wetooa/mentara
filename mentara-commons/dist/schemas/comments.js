"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentUpdateInputDtoSchema = exports.CommentCreateInputDtoSchema = exports.CommentPostParamsDtoSchema = exports.CommentParamsDtoSchema = exports.CommentReactionParamSchema = exports.CommentIdParamSchema = exports.CommentQuerySchema = exports.ReportCommentDtoSchema = exports.CreateReactionDtoSchema = exports.CommentReactionSchema = exports.UpdateCommentDtoSchema = exports.CreateCommentDtoSchema = exports.CommentSchema = void 0;
const zod_1 = require("zod");
// Comment Schema
exports.CommentSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    content: zod_1.z.string(),
    authorId: zod_1.z.string().uuid(),
    postId: zod_1.z.string().uuid(),
    parentCommentId: zod_1.z.string().uuid().optional(),
    isEdited: zod_1.z.boolean(),
    isDeleted: zod_1.z.boolean(),
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime()
});
// Create Comment Schema
exports.CreateCommentDtoSchema = zod_1.z.object({
    content: zod_1.z.string().min(1, 'Comment content is required').max(1000, 'Comment too long'),
    postId: zod_1.z.string().uuid('Invalid post ID format'),
    parentCommentId: zod_1.z.string().uuid('Invalid parent comment ID format').optional()
});
// Update Comment Schema
exports.UpdateCommentDtoSchema = zod_1.z.object({
    content: zod_1.z.string().min(1, 'Comment content is required').max(1000, 'Comment too long')
});
// Comment Reaction Schema
exports.CommentReactionSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    commentId: zod_1.z.string().uuid(),
    userId: zod_1.z.string().uuid(),
    type: zod_1.z.enum(['like', 'dislike', 'heart', 'laugh']),
    createdAt: zod_1.z.string().datetime()
});
// Create Reaction Schema
exports.CreateReactionDtoSchema = zod_1.z.object({
    type: zod_1.z.enum(['like', 'dislike', 'heart', 'laugh'])
});
// Comment Report Schema
exports.ReportCommentDtoSchema = zod_1.z.object({
    reason: zod_1.z.enum(['spam', 'harassment', 'inappropriate', 'misinformation', 'other']),
    description: zod_1.z.string().optional()
});
// Comment Query Parameters
exports.CommentQuerySchema = zod_1.z.object({
    page: zod_1.z.number().min(1).optional(),
    limit: zod_1.z.number().min(1).max(100).optional(),
    postId: zod_1.z.string().uuid().optional(),
    authorId: zod_1.z.string().uuid().optional(),
    parentCommentId: zod_1.z.string().uuid().optional(),
    includeDeleted: zod_1.z.boolean().optional(),
    sortBy: zod_1.z.enum(['createdAt', 'updatedAt', 'likes']).optional(),
    sortOrder: zod_1.z.enum(['asc', 'desc']).optional()
});
// Parameter Schemas
exports.CommentIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('Invalid comment ID format')
});
exports.CommentReactionParamSchema = zod_1.z.object({
    commentId: zod_1.z.string().uuid('Invalid comment ID format'),
    reactionId: zod_1.z.string().uuid('Invalid reaction ID format')
});
// Additional DTOs for CommentsController endpoints
exports.CommentParamsDtoSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('Invalid comment ID format')
});
exports.CommentPostParamsDtoSchema = zod_1.z.object({
    postId: zod_1.z.string().uuid('Invalid post ID format')
});
exports.CommentCreateInputDtoSchema = zod_1.z.object({
    content: zod_1.z.string().min(1, 'Comment content is required').max(1000, 'Comment too long'),
    postId: zod_1.z.string().uuid('Invalid post ID format'),
    parentCommentId: zod_1.z.string().uuid('Invalid parent comment ID format').optional(),
    isAnonymous: zod_1.z.boolean().default(false),
    attachments: zod_1.z.array(zod_1.z.string().uuid()).optional()
});
exports.CommentUpdateInputDtoSchema = zod_1.z.object({
    content: zod_1.z.string().min(1, 'Comment content is required').max(1000, 'Comment too long')
});
//# sourceMappingURL=comments.js.map