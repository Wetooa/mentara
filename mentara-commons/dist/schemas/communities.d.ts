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
    name: string;
    description: string;
    isPrivate: boolean;
    memberCount: number;
    createdBy: string;
}, {
    id: string;
    createdAt: string;
    updatedAt: string;
    name: string;
    description: string;
    isPrivate: boolean;
    memberCount: number;
    createdBy: string;
}>;
export declare const CreateCommunityDtoSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodString;
    isPrivate: z.ZodDefault<z.ZodBoolean>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    name: string;
    description: string;
    isPrivate: boolean;
    tags?: string[] | undefined;
}, {
    name: string;
    description: string;
    isPrivate?: boolean | undefined;
    tags?: string[] | undefined;
}>;
export declare const UpdateCommunityDtoSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    isPrivate: z.ZodOptional<z.ZodBoolean>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    description?: string | undefined;
    isPrivate?: boolean | undefined;
    tags?: string[] | undefined;
}, {
    name?: string | undefined;
    description?: string | undefined;
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
    limit?: number | undefined;
    page?: number | undefined;
    sortBy?: "createdAt" | "name" | "memberCount" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    isPrivate?: boolean | undefined;
    tags?: string[] | undefined;
    search?: string | undefined;
}, {
    limit?: number | undefined;
    page?: number | undefined;
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
    limit?: number | undefined;
    page?: number | undefined;
    sortBy?: "role" | "joinedAt" | undefined;
}, {
    role?: "moderator" | "admin" | "member" | undefined;
    limit?: number | undefined;
    page?: number | undefined;
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
    limit?: number | undefined;
    page?: number | undefined;
    sortBy?: "role" | "name" | "joinedAt" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    search?: string | undefined;
}, {
    role?: "moderator" | "admin" | "member" | undefined;
    limit?: number | undefined;
    page?: number | undefined;
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
    name: string;
    description: string;
    isPrivate: boolean;
    slug: string;
    requireApproval: boolean;
    tags?: string[] | undefined;
    category?: string | undefined;
    rules?: string[] | undefined;
    maxMembers?: number | undefined;
}, {
    name: string;
    description: string;
    slug: string;
    isPrivate?: boolean | undefined;
    tags?: string[] | undefined;
    category?: string | undefined;
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
    isActive?: boolean | undefined;
    name?: string | undefined;
    description?: string | undefined;
    isPrivate?: boolean | undefined;
    tags?: string[] | undefined;
    category?: string | undefined;
    rules?: string[] | undefined;
    maxMembers?: number | undefined;
    requireApproval?: boolean | undefined;
}, {
    isActive?: boolean | undefined;
    name?: string | undefined;
    description?: string | undefined;
    isPrivate?: boolean | undefined;
    tags?: string[] | undefined;
    category?: string | undefined;
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
//# sourceMappingURL=communities.d.ts.map