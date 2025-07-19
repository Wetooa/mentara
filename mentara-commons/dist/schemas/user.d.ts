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
    email: string;
    role: "client" | "therapist" | "moderator" | "admin" | "user";
    id: string;
    createdAt: string;
    updatedAt: string;
    firstName?: string | undefined;
    lastName?: string | undefined;
}, {
    email: string;
    role: "client" | "therapist" | "moderator" | "admin" | "user";
    id: string;
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
    role?: "client" | "therapist" | "moderator" | "admin" | "user" | undefined;
}, {
    email: string;
    firstName?: string | undefined;
    lastName?: string | undefined;
    role?: "client" | "therapist" | "moderator" | "admin" | "user" | undefined;
}>;
export declare const UpdateUserRequestSchema: z.ZodObject<{
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    bio: z.ZodOptional<z.ZodString>;
    avatarUrl: z.ZodOptional<z.ZodString>;
    coverImageUrl: z.ZodOptional<z.ZodString>;
    phoneNumber: z.ZodOptional<z.ZodString>;
    timezone: z.ZodOptional<z.ZodString>;
    language: z.ZodOptional<z.ZodString>;
    theme: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    bio?: string | undefined;
    avatarUrl?: string | undefined;
    coverImageUrl?: string | undefined;
    phoneNumber?: string | undefined;
    timezone?: string | undefined;
    language?: string | undefined;
    theme?: string | undefined;
}, {
    email?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    bio?: string | undefined;
    avatarUrl?: string | undefined;
    coverImageUrl?: string | undefined;
    phoneNumber?: string | undefined;
    timezone?: string | undefined;
    language?: string | undefined;
    theme?: string | undefined;
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
    password: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string | undefined;
    middleName?: string | undefined;
    birthDate?: string | undefined;
    address?: string | undefined;
    hasSeenTherapistRecommendations?: boolean | undefined;
}, {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string | undefined;
    middleName?: string | undefined;
    birthDate?: string | undefined;
    address?: string | undefined;
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
    avatarUrl?: string | undefined;
    middleName?: string | undefined;
    birthDate?: string | undefined;
    address?: string | undefined;
    hasSeenTherapistRecommendations?: boolean | undefined;
}, {
    email?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    avatarUrl?: string | undefined;
    middleName?: string | undefined;
    birthDate?: string | undefined;
    address?: string | undefined;
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
export declare const RegisterAdminDtoSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    adminLevel: z.ZodOptional<z.ZodString>;
    permissions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    permissions?: string[] | undefined;
    adminLevel?: string | undefined;
}, {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    permissions?: string[] | undefined;
    adminLevel?: string | undefined;
}>;
export declare const RegisterModeratorDtoSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    permissions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    assignedCommunities: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    permissions?: string[] | undefined;
    assignedCommunities?: string[] | undefined;
}, {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    permissions?: string[] | undefined;
    assignedCommunities?: string[] | undefined;
}>;
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
export declare const RegisterUserDtoSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    role: z.ZodOptional<z.ZodEnum<["client", "user", "therapist", "moderator", "admin"]>>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: "client" | "therapist" | "moderator" | "admin" | "user" | undefined;
}, {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: "client" | "therapist" | "moderator" | "admin" | "user" | undefined;
}>;
export declare const LogoutDtoSchema: z.ZodObject<{
    refreshToken: z.ZodString;
}, "strip", z.ZodTypeAny, {
    refreshToken: string;
}, {
    refreshToken: string;
}>;
export declare const UserIdParamSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const RequestPasswordResetDtoSchema: z.ZodObject<{
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
}, {
    email: string;
}>;
export declare const ResetPasswordDtoSchema: z.ZodObject<{
    token: z.ZodString;
    newPassword: z.ZodString;
    confirmPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    newPassword: string;
    confirmPassword: string;
    token: string;
}, {
    newPassword: string;
    confirmPassword: string;
    token: string;
}>;
export declare const SendVerificationEmailDtoSchema: z.ZodObject<{
    userId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    userId: string;
}, {
    userId: string;
}>;
export declare const ResendVerificationEmailDtoSchema: z.ZodObject<{
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
}, {
    email: string;
}>;
export declare const VerifyEmailDtoSchema: z.ZodObject<{
    token: z.ZodString;
}, "strip", z.ZodTypeAny, {
    token: string;
}, {
    token: string;
}>;
export declare const UserIdSchema: z.ZodString;
export declare const EmailSchema: z.ZodString;
export type RegisterAdminDto = z.infer<typeof RegisterAdminDtoSchema>;
export type RegisterModeratorDto = z.infer<typeof RegisterModeratorDtoSchema>;
export type RegisterUserDto = z.infer<typeof RegisterUserDtoSchema>;
export type LogoutDto = z.infer<typeof LogoutDtoSchema>;
export type LoginDto = z.infer<typeof LoginDtoSchema>;
export type RefreshTokenDto = z.infer<typeof RefreshTokenDtoSchema>;
export type ChangePasswordDto = z.infer<typeof ChangePasswordDtoSchema>;
export type UserIdParam = z.infer<typeof UserIdParamSchema>;
export type RequestPasswordResetDto = z.infer<typeof RequestPasswordResetDtoSchema>;
export type ResetPasswordDto = z.infer<typeof ResetPasswordDtoSchema>;
export type SendVerificationEmailDto = z.infer<typeof SendVerificationEmailDtoSchema>;
export type ResendVerificationEmailDto = z.infer<typeof ResendVerificationEmailDtoSchema>;
export type VerifyEmailDto = z.infer<typeof VerifyEmailDtoSchema>;
//# sourceMappingURL=user.d.ts.map