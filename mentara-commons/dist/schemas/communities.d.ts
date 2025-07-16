import { z } from 'zod';
export declare const CommunitySchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodString;
    isPrivate: z.ZodBoolean;
    memberCount: z.ZodNumber;
    createdBy: z.ZodString;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: string;
    updatedAt: string;
    description: string;
    name: string;
    memberCount: number;
    createdBy: string;
    isPrivate: boolean;
}, {
    id: string;
    createdAt: string;
    updatedAt: string;
    description: string;
    name: string;
    memberCount: number;
    createdBy: string;
    isPrivate: boolean;
}>;
export declare const CreateCommunityDtoSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodString;
    isPrivate: z.ZodDefault<z.ZodBoolean>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    description: string;
    name: string;
    isPrivate: boolean;
    tags?: string[] | undefined;
}, {
    description: string;
    name: string;
    isPrivate?: boolean | undefined;
    tags?: string[] | undefined;
}>;
export declare const UpdateCommunityDtoSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    isPrivate: z.ZodOptional<z.ZodBoolean>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    description?: string | undefined;
    name?: string | undefined;
    isPrivate?: boolean | undefined;
    tags?: string[] | undefined;
}, {
    description?: string | undefined;
    name?: string | undefined;
    isPrivate?: boolean | undefined;
    tags?: string[] | undefined;
}>;
export declare const CommunityMemberSchema: z.ZodObject<{
    userId: z.ZodString;
    communityId: z.ZodString;
    role: z.ZodEnum<["member", "moderator", "admin"]>;
    joinedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    role: "moderator" | "admin" | "member";
    userId: string;
    joinedAt: string;
    communityId: string;
}, {
    role: "moderator" | "admin" | "member";
    userId: string;
    joinedAt: string;
    communityId: string;
}>;
export declare const JoinCommunityDtoSchema: z.ZodObject<{
    inviteCode: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    inviteCode?: string | undefined;
}, {
    inviteCode?: string | undefined;
}>;
export declare const UpdateMemberRoleDtoSchema: z.ZodObject<{
    role: z.ZodEnum<["member", "moderator", "admin"]>;
}, "strip", z.ZodTypeAny, {
    role: "moderator" | "admin" | "member";
}, {
    role: "moderator" | "admin" | "member";
}>;
export declare const CommunityQuerySchema: z.ZodObject<{
    page: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
    search: z.ZodOptional<z.ZodString>;
    isPrivate: z.ZodOptional<z.ZodBoolean>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    sortBy: z.ZodOptional<z.ZodEnum<["name", "memberCount", "createdAt"]>>;
    sortOrder: z.ZodOptional<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    page?: number | undefined;
    limit?: number | undefined;
    sortBy?: "createdAt" | "name" | "memberCount" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    isPrivate?: boolean | undefined;
    tags?: string[] | undefined;
    search?: string | undefined;
}, {
    page?: number | undefined;
    limit?: number | undefined;
    sortBy?: "createdAt" | "name" | "memberCount" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    isPrivate?: boolean | undefined;
    tags?: string[] | undefined;
    search?: string | undefined;
}>;
export declare const MemberQuerySchema: z.ZodObject<{
    page: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
    role: z.ZodOptional<z.ZodEnum<["member", "moderator", "admin"]>>;
    sortBy: z.ZodOptional<z.ZodEnum<["joinedAt", "role"]>>;
}, "strip", z.ZodTypeAny, {
    role?: "moderator" | "admin" | "member" | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    sortBy?: "role" | "joinedAt" | undefined;
}, {
    role?: "moderator" | "admin" | "member" | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    sortBy?: "role" | "joinedAt" | undefined;
}>;
export declare const CommunityIdParamSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const CommunityMemberParamSchema: z.ZodObject<{
    communityId: z.ZodString;
    userId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    userId: string;
    communityId: string;
}, {
    userId: string;
    communityId: string;
}>;
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
export declare const CommunitySlugParamsDtoSchema: z.ZodObject<{
    slug: z.ZodString;
}, "strip", z.ZodTypeAny, {
    slug: string;
}, {
    slug: string;
}>;
export declare const CommunityParamsDtoSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const GetCommunityMembersQueryDtoSchema: z.ZodObject<{
    page: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
    role: z.ZodOptional<z.ZodEnum<["member", "moderator", "admin"]>>;
    search: z.ZodOptional<z.ZodString>;
    sortBy: z.ZodOptional<z.ZodEnum<["joinedAt", "role", "name"]>>;
    sortOrder: z.ZodOptional<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    role?: "moderator" | "admin" | "member" | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    sortBy?: "role" | "name" | "joinedAt" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    search?: string | undefined;
}, {
    role?: "moderator" | "admin" | "member" | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    sortBy?: "role" | "name" | "joinedAt" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    search?: string | undefined;
}>;
export declare const CommunityCreateInputDtoSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodString;
    slug: z.ZodString;
    isPrivate: z.ZodDefault<z.ZodBoolean>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    category: z.ZodOptional<z.ZodString>;
    rules: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    maxMembers: z.ZodOptional<z.ZodNumber>;
    requireApproval: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    description: string;
    name: string;
    isPrivate: boolean;
    slug: string;
    requireApproval: boolean;
    category?: string | undefined;
    tags?: string[] | undefined;
    rules?: string[] | undefined;
    maxMembers?: number | undefined;
}, {
    description: string;
    name: string;
    slug: string;
    category?: string | undefined;
    isPrivate?: boolean | undefined;
    tags?: string[] | undefined;
    rules?: string[] | undefined;
    maxMembers?: number | undefined;
    requireApproval?: boolean | undefined;
}>;
export declare const CommunityUpdateInputDtoSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    isPrivate: z.ZodOptional<z.ZodBoolean>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    category: z.ZodOptional<z.ZodString>;
    rules: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    maxMembers: z.ZodOptional<z.ZodNumber>;
    requireApproval: z.ZodOptional<z.ZodBoolean>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    description?: string | undefined;
    name?: string | undefined;
    isActive?: boolean | undefined;
    category?: string | undefined;
    isPrivate?: boolean | undefined;
    tags?: string[] | undefined;
    rules?: string[] | undefined;
    maxMembers?: number | undefined;
    requireApproval?: boolean | undefined;
}, {
    description?: string | undefined;
    name?: string | undefined;
    isActive?: boolean | undefined;
    category?: string | undefined;
    isPrivate?: boolean | undefined;
    tags?: string[] | undefined;
    rules?: string[] | undefined;
    maxMembers?: number | undefined;
    requireApproval?: boolean | undefined;
}>;
export declare const CreateRoomGroupDtoSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    order: z.ZodOptional<z.ZodNumber>;
    isCollapsed: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name: string;
    isCollapsed: boolean;
    description?: string | undefined;
    order?: number | undefined;
}, {
    name: string;
    description?: string | undefined;
    order?: number | undefined;
    isCollapsed?: boolean | undefined;
}>;
export declare const RoomGroupParamsDtoSchema: z.ZodObject<{
    roomGroupId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    roomGroupId: string;
}, {
    roomGroupId: string;
}>;
export declare const CreateRoomDtoSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    type: z.ZodDefault<z.ZodEnum<["text", "voice", "video"]>>;
    isPrivate: z.ZodDefault<z.ZodBoolean>;
    order: z.ZodOptional<z.ZodNumber>;
    allowedRoles: z.ZodOptional<z.ZodArray<z.ZodEnum<["member", "moderator", "admin"]>, "many">>;
}, "strip", z.ZodTypeAny, {
    type: "video" | "text" | "voice";
    name: string;
    isPrivate: boolean;
    description?: string | undefined;
    order?: number | undefined;
    allowedRoles?: ("moderator" | "admin" | "member")[] | undefined;
}, {
    name: string;
    type?: "video" | "text" | "voice" | undefined;
    description?: string | undefined;
    isPrivate?: boolean | undefined;
    order?: number | undefined;
    allowedRoles?: ("moderator" | "admin" | "member")[] | undefined;
}>;
export declare const UserParamsDtoSchema: z.ZodObject<{
    userId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    userId: string;
}, {
    userId: string;
}>;
export declare const BulkAssignCommunitiesDtoSchema: z.ZodObject<{
    userIds: z.ZodArray<z.ZodString, "many">;
    communityIds: z.ZodArray<z.ZodString, "many">;
    role: z.ZodDefault<z.ZodEnum<["member", "moderator", "admin"]>>;
    notifyUsers: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    role: "moderator" | "admin" | "member";
    userIds: string[];
    communityIds: string[];
    notifyUsers: boolean;
}, {
    userIds: string[];
    communityIds: string[];
    role?: "moderator" | "admin" | "member" | undefined;
    notifyUsers?: boolean | undefined;
}>;
export declare const RoomParamsDtoSchema: z.ZodObject<{
    roomId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    roomId: string;
}, {
    roomId: string;
}>;
export declare const CreateJoinRequestDtoSchema: z.ZodObject<{
    communityId: z.ZodString;
    message: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    communityId: string;
    message?: string | undefined;
}, {
    communityId: string;
    message?: string | undefined;
}>;
export declare const ProcessJoinRequestDtoSchema: z.ZodObject<{
    action: z.ZodEnum<["approve", "reject"]>;
    moderatorNote: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    action: "approve" | "reject";
    moderatorNote?: string | undefined;
}, {
    action: "approve" | "reject";
    moderatorNote?: string | undefined;
}>;
export declare const JoinRequestFiltersDtoSchema: z.ZodObject<{
    communityId: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["PENDING", "APPROVED", "REJECTED", "CANCELLED"]>>;
    moderatorId: z.ZodOptional<z.ZodString>;
    dateFrom: z.ZodOptional<z.ZodString>;
    dateTo: z.ZodOptional<z.ZodString>;
    page: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    limit: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    status?: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    communityId?: string | undefined;
    moderatorId?: string | undefined;
}, {
    status?: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    communityId?: string | undefined;
    moderatorId?: string | undefined;
}>;
export declare const StatsFiltersDtoSchema: z.ZodObject<{
    communityId: z.ZodOptional<z.ZodString>;
    moderatorId: z.ZodOptional<z.ZodString>;
    dateFrom: z.ZodOptional<z.ZodString>;
    dateTo: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    communityId?: string | undefined;
    moderatorId?: string | undefined;
}, {
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    communityId?: string | undefined;
    moderatorId?: string | undefined;
}>;
export declare const StatsFiltersPartialDtoSchema: z.ZodObject<Pick<{
    communityId: z.ZodOptional<z.ZodString>;
    moderatorId: z.ZodOptional<z.ZodString>;
    dateFrom: z.ZodOptional<z.ZodString>;
    dateTo: z.ZodOptional<z.ZodString>;
}, "dateFrom" | "dateTo">, "strip", z.ZodTypeAny, {
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
}, {
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
}>;
export declare const JoinRequestFiltersPartialDtoSchema: z.ZodObject<Pick<{
    communityId: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["PENDING", "APPROVED", "REJECTED", "CANCELLED"]>>;
    moderatorId: z.ZodOptional<z.ZodString>;
    dateFrom: z.ZodOptional<z.ZodString>;
    dateTo: z.ZodOptional<z.ZodString>;
    page: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    limit: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
}, "status" | "page" | "limit">, "strip", z.ZodTypeAny, {
    status?: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" | undefined;
    page?: number | undefined;
    limit?: number | undefined;
}, {
    status?: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" | undefined;
    page?: number | undefined;
    limit?: number | undefined;
}>;
export declare const GenerateRecommendationsDtoSchema: z.ZodObject<{
    force: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    force?: boolean | undefined;
}, {
    force?: boolean | undefined;
}>;
export declare const RecommendationInteractionDtoSchema: z.ZodObject<{
    action: z.ZodEnum<["accept", "reject"]>;
}, "strip", z.ZodTypeAny, {
    action: "accept" | "reject";
}, {
    action: "accept" | "reject";
}>;
export declare const RecommendationQueryDtoSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["pending", "accepted", "rejected"]>>;
    sortBy: z.ZodOptional<z.ZodEnum<["compatibility", "created", "updated"]>>;
    sortOrder: z.ZodOptional<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    status?: "rejected" | "pending" | "accepted" | undefined;
    sortBy?: "compatibility" | "created" | "updated" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
}, {
    status?: "rejected" | "pending" | "accepted" | undefined;
    sortBy?: "compatibility" | "created" | "updated" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
}>;
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
export type CreateJoinRequestDto = z.infer<typeof CreateJoinRequestDtoSchema>;
export type ProcessJoinRequestDto = z.infer<typeof ProcessJoinRequestDtoSchema>;
export type JoinRequestFiltersDto = z.infer<typeof JoinRequestFiltersDtoSchema>;
export type StatsFiltersDto = z.infer<typeof StatsFiltersDtoSchema>;
export type StatsFiltersPartialDto = z.infer<typeof StatsFiltersPartialDtoSchema>;
export type JoinRequestFiltersPartialDto = z.infer<typeof JoinRequestFiltersPartialDtoSchema>;
export type GenerateRecommendationsDto = z.infer<typeof GenerateRecommendationsDtoSchema>;
export type RecommendationInteractionDto = z.infer<typeof RecommendationInteractionDtoSchema>;
export type RecommendationQueryDto = z.infer<typeof RecommendationQueryDtoSchema>;
//# sourceMappingURL=communities.d.ts.map