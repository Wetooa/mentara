"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomParamsDtoSchema = exports.BulkAssignCommunitiesDtoSchema = exports.UserParamsDtoSchema = exports.CreateRoomDtoSchema = exports.RoomGroupParamsDtoSchema = exports.CreateRoomGroupDtoSchema = exports.CommunityUpdateInputDtoSchema = exports.CommunityCreateInputDtoSchema = exports.GetCommunityMembersQueryDtoSchema = exports.CommunityParamsDtoSchema = exports.CommunitySlugParamsDtoSchema = exports.CommunityMemberParamSchema = exports.CommunityIdParamSchema = exports.MemberQuerySchema = exports.CommunityQuerySchema = exports.UpdateMemberRoleDtoSchema = exports.JoinCommunityDtoSchema = exports.CommunityMemberSchema = exports.UpdateCommunityDtoSchema = exports.CreateCommunityDtoSchema = exports.CommunitySchema = void 0;
const zod_1 = require("zod");
// Community Schema
exports.CommunitySchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    name: zod_1.z.string(),
    description: zod_1.z.string(),
    isPrivate: zod_1.z.boolean(),
    memberCount: zod_1.z.number(),
    createdBy: zod_1.z.string().uuid(),
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime()
});
// Create Community Schema
exports.CreateCommunityDtoSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Community name is required').max(100, 'Name too long'),
    description: zod_1.z.string().min(1, 'Description is required').max(500, 'Description too long'),
    isPrivate: zod_1.z.boolean().default(false),
    tags: zod_1.z.array(zod_1.z.string()).optional()
});
// Update Community Schema
exports.UpdateCommunityDtoSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Community name is required').max(100, 'Name too long').optional(),
    description: zod_1.z.string().min(1, 'Description is required').max(500, 'Description too long').optional(),
    isPrivate: zod_1.z.boolean().optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional()
});
// Community Member Schema
exports.CommunityMemberSchema = zod_1.z.object({
    userId: zod_1.z.string().uuid(),
    communityId: zod_1.z.string().uuid(),
    role: zod_1.z.enum(['member', 'moderator', 'admin']),
    joinedAt: zod_1.z.string().datetime()
});
// Join Community Schema
exports.JoinCommunityDtoSchema = zod_1.z.object({
    inviteCode: zod_1.z.string().optional()
});
// Update Member Role Schema
exports.UpdateMemberRoleDtoSchema = zod_1.z.object({
    role: zod_1.z.enum(['member', 'moderator', 'admin'])
});
// Community Query Parameters
exports.CommunityQuerySchema = zod_1.z.object({
    page: zod_1.z.number().min(1).optional(),
    limit: zod_1.z.number().min(1).max(100).optional(),
    search: zod_1.z.string().optional(),
    isPrivate: zod_1.z.boolean().optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    sortBy: zod_1.z.enum(['name', 'memberCount', 'createdAt']).optional(),
    sortOrder: zod_1.z.enum(['asc', 'desc']).optional()
});
// Member Query Parameters  
exports.MemberQuerySchema = zod_1.z.object({
    page: zod_1.z.number().min(1).optional(),
    limit: zod_1.z.number().min(1).max(100).optional(),
    role: zod_1.z.enum(['member', 'moderator', 'admin']).optional(),
    sortBy: zod_1.z.enum(['joinedAt', 'role']).optional()
});
// Parameter Schemas
exports.CommunityIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('Invalid community ID format')
});
exports.CommunityMemberParamSchema = zod_1.z.object({
    communityId: zod_1.z.string().uuid('Invalid community ID format'),
    userId: zod_1.z.string().uuid('Invalid user ID format')
});
// Additional DTOs for CommunitiesController endpoints
exports.CommunitySlugParamsDtoSchema = zod_1.z.object({
    slug: zod_1.z.string().min(1, 'Community slug is required')
});
exports.CommunityParamsDtoSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('Invalid community ID format')
});
exports.GetCommunityMembersQueryDtoSchema = zod_1.z.object({
    page: zod_1.z.number().min(1).optional(),
    limit: zod_1.z.number().min(1).max(100).optional(),
    role: zod_1.z.enum(['member', 'moderator', 'admin']).optional(),
    search: zod_1.z.string().optional(),
    sortBy: zod_1.z.enum(['joinedAt', 'role', 'name']).optional(),
    sortOrder: zod_1.z.enum(['asc', 'desc']).optional()
});
exports.CommunityCreateInputDtoSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Community name is required').max(100, 'Name too long'),
    description: zod_1.z.string().min(1, 'Description is required').max(500, 'Description too long'),
    slug: zod_1.z.string().min(1, 'Slug is required').max(50, 'Slug too long').regex(/^[a-z0-9-]+$/, 'Invalid slug format'),
    isPrivate: zod_1.z.boolean().default(false),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    category: zod_1.z.string().optional(),
    rules: zod_1.z.array(zod_1.z.string()).optional(),
    maxMembers: zod_1.z.number().min(1).optional(),
    requireApproval: zod_1.z.boolean().default(false)
});
exports.CommunityUpdateInputDtoSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Community name is required').max(100, 'Name too long').optional(),
    description: zod_1.z.string().min(1, 'Description is required').max(500, 'Description too long').optional(),
    isPrivate: zod_1.z.boolean().optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    category: zod_1.z.string().optional(),
    rules: zod_1.z.array(zod_1.z.string()).optional(),
    maxMembers: zod_1.z.number().min(1).optional(),
    requireApproval: zod_1.z.boolean().optional(),
    isActive: zod_1.z.boolean().optional()
});
exports.CreateRoomGroupDtoSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Room group name is required').max(100, 'Name too long'),
    description: zod_1.z.string().max(500, 'Description too long').optional(),
    order: zod_1.z.number().min(0).optional(),
    isCollapsed: zod_1.z.boolean().default(false)
});
exports.RoomGroupParamsDtoSchema = zod_1.z.object({
    roomGroupId: zod_1.z.string().uuid('Invalid room group ID format')
});
exports.CreateRoomDtoSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Room name is required').max(100, 'Name too long'),
    description: zod_1.z.string().max(500, 'Description too long').optional(),
    type: zod_1.z.enum(['text', 'voice', 'video']).default('text'),
    isPrivate: zod_1.z.boolean().default(false),
    order: zod_1.z.number().min(0).optional(),
    allowedRoles: zod_1.z.array(zod_1.z.enum(['member', 'moderator', 'admin'])).optional()
});
exports.UserParamsDtoSchema = zod_1.z.object({
    userId: zod_1.z.string().uuid('Invalid user ID format')
});
exports.BulkAssignCommunitiesDtoSchema = zod_1.z.object({
    userIds: zod_1.z.array(zod_1.z.string().uuid()).min(1, 'At least one user ID is required'),
    communityIds: zod_1.z.array(zod_1.z.string().uuid()).min(1, 'At least one community ID is required'),
    role: zod_1.z.enum(['member', 'moderator', 'admin']).default('member'),
    notifyUsers: zod_1.z.boolean().default(true)
});
exports.RoomParamsDtoSchema = zod_1.z.object({
    roomId: zod_1.z.string().uuid('Invalid room ID format')
});
//# sourceMappingURL=communities.js.map