import { z } from 'zod';

// Community Schema
export const CommunitySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  isPrivate: z.boolean(),
  memberCount: z.number(),
  createdBy: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

// Create Community Schema
export const CreateCommunityDtoSchema = z.object({
  name: z.string().min(1, 'Community name is required').max(100, 'Name too long'),
  description: z.string().min(1, 'Description is required').max(500, 'Description too long'),
  isPrivate: z.boolean().default(false),
  tags: z.array(z.string()).optional()
});

// Update Community Schema
export const UpdateCommunityDtoSchema = z.object({
  name: z.string().min(1, 'Community name is required').max(100, 'Name too long').optional(),
  description: z.string().min(1, 'Description is required').max(500, 'Description too long').optional(),
  isPrivate: z.boolean().optional(),
  tags: z.array(z.string()).optional()
});

// Community Member Schema
export const CommunityMemberSchema = z.object({
  userId: z.string().uuid(),
  communityId: z.string().uuid(),
  role: z.enum(['member', 'moderator', 'admin']),
  joinedAt: z.string().datetime()
});

// Join Community Schema
export const JoinCommunityDtoSchema = z.object({
  inviteCode: z.string().optional()
});

// Update Member Role Schema
export const UpdateMemberRoleDtoSchema = z.object({
  role: z.enum(['member', 'moderator', 'admin'])
});

// Community Query Parameters
export const CommunityQuerySchema = z.object({
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  search: z.string().optional(),
  isPrivate: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  sortBy: z.enum(['name', 'memberCount', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
});

// Member Query Parameters  
export const MemberQuerySchema = z.object({
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  role: z.enum(['member', 'moderator', 'admin']).optional(),
  sortBy: z.enum(['joinedAt', 'role']).optional()
});

// Parameter Schemas
export const CommunityIdParamSchema = z.object({
  id: z.string().uuid('Invalid community ID format')
});

export const CommunityMemberParamSchema = z.object({
  communityId: z.string().uuid('Invalid community ID format'),
  userId: z.string().uuid('Invalid user ID format')
});

// Export type inference helpers
export type Community = z.infer<typeof CommunitySchema>;
export type CreateCommunityDto = z.infer<typeof CreateCommunityDtoSchema>;
export type UpdateCommunityDto = z.infer<typeof UpdateCommunityDtoSchema>;
export type CommunityMember = z.infer<typeof CommunityMemberSchema>;
export type JoinCommunityDto = z.infer<typeof JoinCommunityDtoSchema>;
export type UpdateMemberRoleDto = z.infer<typeof UpdateMemberRoleDtoSchema>;
export type CommunityQuery = z.infer<typeof CommunityQuerySchema>;
export type MemberQuery = z.infer<typeof MemberQuerySchema>;
export type CommunityIdParam = z.infer<typeof CommunityIdParamSchema>;
export type CommunityMemberParam = z.infer<typeof CommunityMemberParamSchema>;

// Additional DTOs for CommunitiesController endpoints
export const CommunitySlugParamsDtoSchema = z.object({
  slug: z.string().min(1, 'Community slug is required')
});

export const CommunityParamsDtoSchema = z.object({
  id: z.string().uuid('Invalid community ID format')
});

export const GetCommunityMembersQueryDtoSchema = z.object({
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  role: z.enum(['member', 'moderator', 'admin']).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['joinedAt', 'role', 'name']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
});

export const CommunityCreateInputDtoSchema = z.object({
  name: z.string().min(1, 'Community name is required').max(100, 'Name too long'),
  description: z.string().min(1, 'Description is required').max(500, 'Description too long'),
  slug: z.string().min(1, 'Slug is required').max(50, 'Slug too long').regex(/^[a-z0-9-]+$/, 'Invalid slug format'),
  isPrivate: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
  category: z.string().optional(),
  rules: z.array(z.string()).optional(),
  maxMembers: z.number().min(1).optional(),
  requireApproval: z.boolean().default(false)
});

export const CommunityUpdateInputDtoSchema = z.object({
  name: z.string().min(1, 'Community name is required').max(100, 'Name too long').optional(),
  description: z.string().min(1, 'Description is required').max(500, 'Description too long').optional(),
  isPrivate: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().optional(),
  rules: z.array(z.string()).optional(),
  maxMembers: z.number().min(1).optional(),
  requireApproval: z.boolean().optional(),
  isActive: z.boolean().optional()
});

export const CreateRoomGroupDtoSchema = z.object({
  name: z.string().min(1, 'Room group name is required').max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  order: z.number().min(0).optional(),
  isCollapsed: z.boolean().default(false)
});

export const RoomGroupParamsDtoSchema = z.object({
  roomGroupId: z.string().uuid('Invalid room group ID format')
});

export const CreateRoomDtoSchema = z.object({
  name: z.string().min(1, 'Room name is required').max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  type: z.enum(['text', 'voice', 'video']).default('text'),
  isPrivate: z.boolean().default(false),
  order: z.number().min(0).optional(),
  allowedRoles: z.array(z.enum(['member', 'moderator', 'admin'])).optional()
});

export const UserParamsDtoSchema = z.object({
  userId: z.string().uuid('Invalid user ID format')
});

export const BulkAssignCommunitiesDtoSchema = z.object({
  userIds: z.array(z.string().uuid()).min(1, 'At least one user ID is required'),
  communityIds: z.array(z.string().uuid()).min(1, 'At least one community ID is required'),
  role: z.enum(['member', 'moderator', 'admin']).default('member'),
  notifyUsers: z.boolean().default(true)
});

export const RoomParamsDtoSchema = z.object({
  roomId: z.string().uuid('Invalid room ID format')
});

// Community Moderation Schemas
export const CreateJoinRequestDtoSchema = z.object({
  communityId: z.string().uuid('Invalid community ID format'),
  message: z.string().optional()
});

export const ProcessJoinRequestDtoSchema = z.object({
  action: z.enum(['approve', 'reject']),
  moderatorNote: z.string().optional()
});

export const JoinRequestFiltersDtoSchema = z.object({
  communityId: z.string().uuid('Invalid community ID format').optional(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']).optional(),
  moderatorId: z.string().uuid('Invalid moderator ID format').optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  page: z.number().int().min(1).default(1).optional(),
  limit: z.number().int().min(1).max(100).default(20).optional()
});

export const StatsFiltersDtoSchema = z.object({
  communityId: z.string().uuid('Invalid community ID format').optional(),
  moderatorId: z.string().uuid('Invalid moderator ID format').optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional()
});

// Partial schemas for specific endpoints
export const StatsFiltersPartialDtoSchema = StatsFiltersDtoSchema.pick({
  dateFrom: true,
  dateTo: true
});

export const JoinRequestFiltersPartialDtoSchema = JoinRequestFiltersDtoSchema.pick({
  status: true,
  page: true,
  limit: true
});

// Community Recommendation Schemas
export const GenerateRecommendationsDtoSchema = z.object({
  force: z.boolean().optional()
});

export const RecommendationInteractionDtoSchema = z.object({
  action: z.enum(['accept', 'reject'])
});

export const RecommendationQueryDtoSchema = z.object({
  status: z.enum(['pending', 'accepted', 'rejected']).optional(),
  sortBy: z.enum(['compatibility', 'created', 'updated']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
});

// Type exports for new DTOs
export type CommunitySlugParamsDto = z.infer<typeof CommunitySlugParamsDtoSchema>;
export type CommunityParamsDto = z.infer<typeof CommunityParamsDtoSchema>;
export type GetCommunityMembersQueryDto = z.infer<typeof GetCommunityMembersQueryDtoSchema>;
export type CommunityCreateInputDto = z.infer<typeof CommunityCreateInputDtoSchema>;
export type CommunityUpdateInputDto = z.infer<typeof CommunityUpdateInputDtoSchema>;
export type CreateRoomGroupDto = z.infer<typeof CreateRoomGroupDtoSchema>;
export type RoomGroupParamsDto = z.infer<typeof RoomGroupParamsDtoSchema>;
export type CreateRoomDto = z.infer<typeof CreateRoomDtoSchema>;
export type UserParamsDto = z.infer<typeof UserParamsDtoSchema>;
export type BulkAssignCommunitiesDto = z.infer<typeof BulkAssignCommunitiesDtoSchema>;
export type RoomParamsDto = z.infer<typeof RoomParamsDtoSchema>;

// Community Moderation Type exports
export type CreateJoinRequestDto = z.infer<typeof CreateJoinRequestDtoSchema>;
export type ProcessJoinRequestDto = z.infer<typeof ProcessJoinRequestDtoSchema>;
export type JoinRequestFiltersDto = z.infer<typeof JoinRequestFiltersDtoSchema>;
export type StatsFiltersDto = z.infer<typeof StatsFiltersDtoSchema>;
export type StatsFiltersPartialDto = z.infer<typeof StatsFiltersPartialDtoSchema>;
export type JoinRequestFiltersPartialDto = z.infer<typeof JoinRequestFiltersPartialDtoSchema>;

// Community Recommendation Type exports
export type GenerateRecommendationsDto = z.infer<typeof GenerateRecommendationsDtoSchema>;
export type RecommendationInteractionDto = z.infer<typeof RecommendationInteractionDtoSchema>;
export type RecommendationQueryDto = z.infer<typeof RecommendationQueryDtoSchema>;