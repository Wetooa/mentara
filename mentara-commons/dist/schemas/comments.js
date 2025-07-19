"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentUpdateInputDtoSchema = exports.CommentCreateInputDtoSchema = exports.CommentPostParamsDtoSchema = exports.CommentParamsDtoSchema = exports.CommentIdParamSchema = exports.CommentQuerySchema = exports.ReportCommentDtoSchema = exports.HeartToggleResponseSchema = exports.CommentHeartSchema = exports.UpdateCommentDtoSchema = exports.CreateCommentDtoSchema = exports.CommentSchema = void 0;
const zod_1 = require("zod");
// Comment Schema - Updated for unified Comment/Reply system
exports.CommentSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    content: zod_1.z.string(),
    userId: zod_1.z.string().uuid(), // Changed from authorId to match Prisma schema
    postId: zod_1.z.string().uuid(),
    parentId: zod_1.z.string().uuid().optional(), // Changed from parentCommentId to match Prisma schema
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime(),
    // File attachments (inline arrays like in Prisma schema)
    attachmentUrls: zod_1.z.array(zod_1.z.string()).optional(),
    attachmentNames: zod_1.z.array(zod_1.z.string()).optional(),
    attachmentSizes: zod_1.z.array(zod_1.z.number()).optional()
});
// Create Comment Schema - Updated for unified Comment/Reply system
exports.CreateCommentDtoSchema = zod_1.z.object({
    content: zod_1.z.string().min(1, 'Comment content is required').max(1000, 'Comment too long'),
    postId: zod_1.z.string().uuid('Invalid post ID format'),
    parentId: zod_1.z.string().uuid('Invalid parent ID format').optional() // Changed from parentCommentId
});
// Update Comment Schema
exports.UpdateCommentDtoSchema = zod_1.z.object({
    content: zod_1.z.string().min(1, 'Comment content is required').max(1000, 'Comment too long')
});
// Comment Heart Schema - Simplified to only hearts (matches CommentHeart model)
exports.CommentHeartSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    commentId: zod_1.z.string().uuid(),
    userId: zod_1.z.string().uuid(),
    createdAt: zod_1.z.string().datetime()
});
// Heart Toggle Response Schema
exports.HeartToggleResponseSchema = zod_1.z.object({
    hearted: zod_1.z.boolean()
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
    userId: zod_1.z.string().uuid().optional(), // Changed from authorId to match Prisma schema
    parentId: zod_1.z.string().uuid().optional(), // Changed from parentCommentId to match Prisma schema
    includeDeleted: zod_1.z.boolean().optional(),
    sortBy: zod_1.z.enum(['createdAt', 'updatedAt', 'hearts']).optional(), // Changed 'likes' to 'hearts' to match our system
    sortOrder: zod_1.z.enum(['asc', 'desc']).optional()
});
// Parameter Schemas
exports.CommentIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('Invalid comment ID format')
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
    parentId: zod_1.z.string().uuid('Invalid parent ID format').optional() // Changed from parentCommentId to match Prisma schema
});
exports.CommentUpdateInputDtoSchema = zod_1.z.object({
    content: zod_1.z.string().min(1, 'Comment content is required').max(1000, 'Comment too long')
});
//# sourceMappingURL=comments.js.map