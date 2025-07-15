import { z } from 'zod';
export declare const UserRoleSchema: z.ZodEnum<["client", "user", "therapist", "moderator", "admin"]>;
export declare const UserSchema: z.ZodObject<{
    id: z.ZodString;
    email: z.ZodString;
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    role: z.ZodEnum<["client", "user", "therapist", "moderator", "admin"]>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    email: string;
    role: "client" | "user" | "therapist" | "moderator" | "admin";
    createdAt: string;
    updatedAt: string;
    firstName?: string | undefined;
    lastName?: string | undefined;
}, {
    id: string;
    email: string;
    role: "client" | "user" | "therapist" | "moderator" | "admin";
    createdAt: string;
    updatedAt: string;
    firstName?: string | undefined;
    lastName?: string | undefined;
}>;
export declare const CreateUserRequestSchema: z.ZodObject<{
    email: z.ZodString;
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodEnum<["client", "user", "therapist", "moderator", "admin"]>>;
}, "strip", z.ZodTypeAny, {
    email: string;
    firstName?: string | undefined;
    lastName?: string | undefined;
    role?: "client" | "user" | "therapist" | "moderator" | "admin" | undefined;
}, {
    email: string;
    firstName?: string | undefined;
    lastName?: string | undefined;
    role?: "client" | "user" | "therapist" | "moderator" | "admin" | undefined;
}>;
export declare const UpdateUserRequestSchema: z.ZodObject<{
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
}, {
    email?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
}>;
export declare const FirstSignInResponseSchema: z.ZodObject<{
    isFirstSignIn: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    isFirstSignIn: boolean;
}, {
    isFirstSignIn: boolean;
}>;
export declare const RolePermissionsSchema: z.ZodObject<{
    canAccessAdminPanel: z.ZodBoolean;
    canManageUsers: z.ZodBoolean;
    canManageTherapists: z.ZodBoolean;
    canModerateContent: z.ZodBoolean;
    canCreateWorksheets: z.ZodBoolean;
    canAssignWorksheets: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    canAccessAdminPanel: boolean;
    canManageUsers: boolean;
    canManageTherapists: boolean;
    canModerateContent: boolean;
    canCreateWorksheets: boolean;
    canAssignWorksheets: boolean;
}, {
    canAccessAdminPanel: boolean;
    canManageUsers: boolean;
    canManageTherapists: boolean;
    canModerateContent: boolean;
    canCreateWorksheets: boolean;
    canAssignWorksheets: boolean;
}>;
export declare const RegisterClientDtoSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    firstName: z.ZodString;
    middleName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodString;
    birthDate: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    avatarUrl: z.ZodOptional<z.ZodString>;
    hasSeenTherapistRecommendations: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    middleName?: string | undefined;
    birthDate?: string | undefined;
    address?: string | undefined;
    avatarUrl?: string | undefined;
    hasSeenTherapistRecommendations?: boolean | undefined;
}, {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    middleName?: string | undefined;
    birthDate?: string | undefined;
    address?: string | undefined;
    avatarUrl?: string | undefined;
    hasSeenTherapistRecommendations?: boolean | undefined;
}>;
export declare const UpdateClientDtoSchema: z.ZodObject<Omit<{
    email: z.ZodOptional<z.ZodString>;
    password: z.ZodOptional<z.ZodString>;
    firstName: z.ZodOptional<z.ZodString>;
    middleName: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    lastName: z.ZodOptional<z.ZodString>;
    birthDate: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    address: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    avatarUrl: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    hasSeenTherapistRecommendations: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
}, "password">, "strip", z.ZodTypeAny, {
    email?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    middleName?: string | undefined;
    birthDate?: string | undefined;
    address?: string | undefined;
    avatarUrl?: string | undefined;
    hasSeenTherapistRecommendations?: boolean | undefined;
}, {
    email?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    middleName?: string | undefined;
    birthDate?: string | undefined;
    address?: string | undefined;
    avatarUrl?: string | undefined;
    hasSeenTherapistRecommendations?: boolean | undefined;
}>;
export declare const DeactivateUserDtoSchema: z.ZodObject<{
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    reason?: string | undefined;
}, {
    reason?: string | undefined;
}>;
export declare const UserDeactivationResponseDtoSchema: z.ZodObject<{
    message: z.ZodString;
    deactivatedAt: z.ZodString;
    reason: z.ZodOptional<z.ZodString>;
    deactivatedBy: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    message: string;
    deactivatedAt: string;
    reason?: string | undefined;
    deactivatedBy?: string | undefined;
}, {
    message: string;
    deactivatedAt: string;
    reason?: string | undefined;
    deactivatedBy?: string | undefined;
}>;
export type UserRole = z.infer<typeof UserRoleSchema>;
export type User = z.infer<typeof UserSchema>;
export type CreateUserRequest = z.infer<typeof CreateUserRequestSchema>;
export type UpdateUserRequest = z.infer<typeof UpdateUserRequestSchema>;
export type FirstSignInResponse = z.infer<typeof FirstSignInResponseSchema>;
export type RolePermissions = z.infer<typeof RolePermissionsSchema>;
export type RegisterClientDto = z.infer<typeof RegisterClientDtoSchema>;
export type UpdateClientDto = z.infer<typeof UpdateClientDtoSchema>;
export type DeactivateUserDto = z.infer<typeof DeactivateUserDtoSchema>;
export type UserDeactivationResponseDto = z.infer<typeof UserDeactivationResponseDtoSchema>;
export declare const LoginDtoSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const RefreshTokenDtoSchema: z.ZodObject<{
    refreshToken: z.ZodString;
}, "strip", z.ZodTypeAny, {
    refreshToken: string;
}, {
    refreshToken: string;
}>;
export declare const ChangePasswordDtoSchema: z.ZodObject<{
    currentPassword: z.ZodString;
    newPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    currentPassword: string;
    newPassword: string;
}, {
    currentPassword: string;
    newPassword: string;
}>;
export declare const UserIdParamSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const UserIdSchema: z.ZodString;
export declare const EmailSchema: z.ZodString;
export type LoginDto = z.infer<typeof LoginDtoSchema>;
export type RefreshTokenDto = z.infer<typeof RefreshTokenDtoSchema>;
export type ChangePasswordDto = z.infer<typeof ChangePasswordDtoSchema>;
export type UserIdParam = z.infer<typeof UserIdParamSchema>;
//# sourceMappingURL=user.d.ts.map