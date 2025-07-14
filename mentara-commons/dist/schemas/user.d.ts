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
    userId: z.ZodString;
    email: z.ZodString;
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
    userId: string;
    middleName?: string | undefined;
    birthDate?: string | undefined;
    address?: string | undefined;
    avatarUrl?: string | undefined;
    hasSeenTherapistRecommendations?: boolean | undefined;
}, {
    email: string;
    firstName: string;
    lastName: string;
    userId: string;
    middleName?: string | undefined;
    birthDate?: string | undefined;
    address?: string | undefined;
    avatarUrl?: string | undefined;
    hasSeenTherapistRecommendations?: boolean | undefined;
}>;
export declare const UpdateClientDtoSchema: z.ZodObject<Omit<{
    userId: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    firstName: z.ZodOptional<z.ZodString>;
    middleName: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    lastName: z.ZodOptional<z.ZodString>;
    birthDate: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    address: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    avatarUrl: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    hasSeenTherapistRecommendations: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
}, "userId">, "strip", z.ZodTypeAny, {
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
export declare const RegisterTherapistDtoSchema: z.ZodObject<{
    userId: z.ZodString;
    email: z.ZodString;
    firstName: z.ZodString;
    middleName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodString;
    title: z.ZodString;
    hourlyRate: z.ZodOptional<z.ZodNumber>;
    experienceYears: z.ZodOptional<z.ZodNumber>;
    province: z.ZodOptional<z.ZodString>;
    specialties: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    bio: z.ZodOptional<z.ZodString>;
    profileImage: z.ZodOptional<z.ZodString>;
    licenseNumber: z.ZodOptional<z.ZodString>;
    licenseType: z.ZodOptional<z.ZodString>;
    isVerified: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    email: string;
    firstName: string;
    lastName: string;
    userId: string;
    title: string;
    isVerified: boolean;
    middleName?: string | undefined;
    hourlyRate?: number | undefined;
    experienceYears?: number | undefined;
    province?: string | undefined;
    specialties?: string[] | undefined;
    bio?: string | undefined;
    profileImage?: string | undefined;
    licenseNumber?: string | undefined;
    licenseType?: string | undefined;
}, {
    email: string;
    firstName: string;
    lastName: string;
    userId: string;
    title: string;
    middleName?: string | undefined;
    hourlyRate?: number | undefined;
    experienceYears?: number | undefined;
    province?: string | undefined;
    specialties?: string[] | undefined;
    bio?: string | undefined;
    profileImage?: string | undefined;
    licenseNumber?: string | undefined;
    licenseType?: string | undefined;
    isVerified?: boolean | undefined;
}>;
export declare const UpdateTherapistDtoSchema: z.ZodObject<Omit<{
    userId: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    firstName: z.ZodOptional<z.ZodString>;
    middleName: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    lastName: z.ZodOptional<z.ZodString>;
    title: z.ZodOptional<z.ZodString>;
    hourlyRate: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    experienceYears: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    province: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    specialties: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    bio: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    profileImage: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    licenseNumber: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    licenseType: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    isVerified: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
}, "userId">, "strip", z.ZodTypeAny, {
    email?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    middleName?: string | undefined;
    title?: string | undefined;
    hourlyRate?: number | undefined;
    experienceYears?: number | undefined;
    province?: string | undefined;
    specialties?: string[] | undefined;
    bio?: string | undefined;
    profileImage?: string | undefined;
    licenseNumber?: string | undefined;
    licenseType?: string | undefined;
    isVerified?: boolean | undefined;
}, {
    email?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    middleName?: string | undefined;
    title?: string | undefined;
    hourlyRate?: number | undefined;
    experienceYears?: number | undefined;
    province?: string | undefined;
    specialties?: string[] | undefined;
    bio?: string | undefined;
    profileImage?: string | undefined;
    licenseNumber?: string | undefined;
    licenseType?: string | undefined;
    isVerified?: boolean | undefined;
}>;
export declare const DeactivateUserDtoSchema: z.ZodObject<{
    reason: z.ZodString;
    notifyUser: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    reason: string;
    notifyUser: boolean;
}, {
    reason: string;
    notifyUser?: boolean | undefined;
}>;
export declare const UserDeactivationResponseDtoSchema: z.ZodObject<{
    id: z.ZodString;
    isActive: z.ZodBoolean;
    deactivatedAt: z.ZodNullable<z.ZodString>;
    deactivationReason: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    isActive: boolean;
    deactivatedAt: string | null;
    deactivationReason: string | null;
}, {
    id: string;
    isActive: boolean;
    deactivatedAt: string | null;
    deactivationReason: string | null;
}>;
export type UserRole = z.infer<typeof UserRoleSchema>;
export type User = z.infer<typeof UserSchema>;
export type CreateUserRequest = z.infer<typeof CreateUserRequestSchema>;
export type UpdateUserRequest = z.infer<typeof UpdateUserRequestSchema>;
export type FirstSignInResponse = z.infer<typeof FirstSignInResponseSchema>;
export type RolePermissions = z.infer<typeof RolePermissionsSchema>;
export type RegisterClientDto = z.infer<typeof RegisterClientDtoSchema>;
export type UpdateClientDto = z.infer<typeof UpdateClientDtoSchema>;
export type RegisterTherapistDto = z.infer<typeof RegisterTherapistDtoSchema>;
export type UpdateTherapistDto = z.infer<typeof UpdateTherapistDtoSchema>;
export type DeactivateUserDto = z.infer<typeof DeactivateUserDtoSchema>;
export type UserDeactivationResponseDto = z.infer<typeof UserDeactivationResponseDtoSchema>;
export declare const UserIdSchema: z.ZodString;
export declare const EmailSchema: z.ZodString;
//# sourceMappingURL=user.d.ts.map