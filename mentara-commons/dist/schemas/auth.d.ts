import { z } from 'zod';
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
export declare const LogoutDtoSchema: z.ZodObject<{
    refreshToken: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    refreshToken?: string | undefined;
}, {
    refreshToken?: string | undefined;
}>;
export declare const RegisterUserDtoSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    role: z.ZodEnum<["client", "therapist"]>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: "client" | "therapist";
}, {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: "client" | "therapist";
}>;
export declare const ChangePasswordDtoSchema: z.ZodEffects<z.ZodObject<{
    currentPassword: z.ZodString;
    newPassword: z.ZodString;
    confirmPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}, {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}>, {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}, {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}>;
export declare const RequestPasswordResetDtoSchema: z.ZodObject<{
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
}, {
    email: string;
}>;
export declare const ResetPasswordDtoSchema: z.ZodEffects<z.ZodObject<{
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
}>, {
    newPassword: string;
    confirmPassword: string;
    token: string;
}, {
    newPassword: string;
    confirmPassword: string;
    token: string;
}>;
export declare const SendVerificationEmailDtoSchema: z.ZodObject<{
    email: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email?: string | undefined;
}, {
    email?: string | undefined;
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
export declare const SendOtpDtoSchema: z.ZodObject<{
    email: z.ZodString;
    type: z.ZodDefault<z.ZodEnum<["email_verification", "password_reset", "login_verification"]>>;
}, "strip", z.ZodTypeAny, {
    email: string;
    type: "email_verification" | "password_reset" | "login_verification";
}, {
    email: string;
    type?: "email_verification" | "password_reset" | "login_verification" | undefined;
}>;
export declare const VerifyOtpDtoSchema: z.ZodObject<{
    email: z.ZodString;
    code: z.ZodString;
    type: z.ZodDefault<z.ZodEnum<["email_verification", "password_reset", "login_verification"]>>;
}, "strip", z.ZodTypeAny, {
    email: string;
    code: string;
    type: "email_verification" | "password_reset" | "login_verification";
}, {
    email: string;
    code: string;
    type?: "email_verification" | "password_reset" | "login_verification" | undefined;
}>;
export declare const ResendOtpDtoSchema: z.ZodObject<{
    email: z.ZodString;
    type: z.ZodDefault<z.ZodEnum<["email_verification", "password_reset", "login_verification"]>>;
}, "strip", z.ZodTypeAny, {
    email: string;
    type: "email_verification" | "password_reset" | "login_verification";
}, {
    email: string;
    type?: "email_verification" | "password_reset" | "login_verification" | undefined;
}>;
export declare const RegisterWithOtpDtoSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    role: z.ZodDefault<z.ZodEnum<["client", "therapist"]>>;
    otpCode: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: "client" | "therapist";
    otpCode: string;
}, {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    otpCode: string;
    role?: "client" | "therapist" | undefined;
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
export declare const RegisterAdminDtoSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    permissions: z.ZodOptional<z.ZodObject<{
        canAccessAdminPanel: z.ZodDefault<z.ZodBoolean>;
        canManageUsers: z.ZodDefault<z.ZodBoolean>;
        canManageTherapists: z.ZodDefault<z.ZodBoolean>;
        canModerateContent: z.ZodDefault<z.ZodBoolean>;
        canCreateWorksheets: z.ZodDefault<z.ZodBoolean>;
        canAssignWorksheets: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        canAccessAdminPanel: boolean;
        canManageUsers: boolean;
        canManageTherapists: boolean;
        canModerateContent: boolean;
        canCreateWorksheets: boolean;
        canAssignWorksheets: boolean;
    }, {
        canAccessAdminPanel?: boolean | undefined;
        canManageUsers?: boolean | undefined;
        canManageTherapists?: boolean | undefined;
        canModerateContent?: boolean | undefined;
        canCreateWorksheets?: boolean | undefined;
        canAssignWorksheets?: boolean | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    permissions?: {
        canAccessAdminPanel: boolean;
        canManageUsers: boolean;
        canManageTherapists: boolean;
        canModerateContent: boolean;
        canCreateWorksheets: boolean;
        canAssignWorksheets: boolean;
    } | undefined;
}, {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    permissions?: {
        canAccessAdminPanel?: boolean | undefined;
        canManageUsers?: boolean | undefined;
        canManageTherapists?: boolean | undefined;
        canModerateContent?: boolean | undefined;
        canCreateWorksheets?: boolean | undefined;
        canAssignWorksheets?: boolean | undefined;
    } | undefined;
}>;
export declare const RegisterModeratorDtoSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    permissions: z.ZodOptional<z.ZodObject<{
        canAccessAdminPanel: z.ZodDefault<z.ZodBoolean>;
        canManageUsers: z.ZodDefault<z.ZodBoolean>;
        canManageTherapists: z.ZodDefault<z.ZodBoolean>;
        canModerateContent: z.ZodDefault<z.ZodBoolean>;
        canCreateWorksheets: z.ZodDefault<z.ZodBoolean>;
        canAssignWorksheets: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        canAccessAdminPanel: boolean;
        canManageUsers: boolean;
        canManageTherapists: boolean;
        canModerateContent: boolean;
        canCreateWorksheets: boolean;
        canAssignWorksheets: boolean;
    }, {
        canAccessAdminPanel?: boolean | undefined;
        canManageUsers?: boolean | undefined;
        canManageTherapists?: boolean | undefined;
        canModerateContent?: boolean | undefined;
        canCreateWorksheets?: boolean | undefined;
        canAssignWorksheets?: boolean | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    permissions?: {
        canAccessAdminPanel: boolean;
        canManageUsers: boolean;
        canManageTherapists: boolean;
        canModerateContent: boolean;
        canCreateWorksheets: boolean;
        canAssignWorksheets: boolean;
    } | undefined;
}, {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    permissions?: {
        canAccessAdminPanel?: boolean | undefined;
        canManageUsers?: boolean | undefined;
        canManageTherapists?: boolean | undefined;
        canModerateContent?: boolean | undefined;
        canCreateWorksheets?: boolean | undefined;
        canAssignWorksheets?: boolean | undefined;
    } | undefined;
}>;
export declare const TerminateSessionDtoSchema: z.ZodObject<{
    sessionId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    sessionId: string;
}, {
    sessionId: string;
}>;
export declare const SessionInfoResponseSchema: z.ZodObject<{
    sessionId: z.ZodString;
    createdAt: z.ZodString;
    lastActivity: z.ZodString;
    device: z.ZodString;
    location: z.ZodString;
    ipAddress: z.ZodString;
    userAgent: z.ZodString;
}, "strip", z.ZodTypeAny, {
    sessionId: string;
    createdAt: string;
    lastActivity: string;
    device: string;
    location: string;
    ipAddress: string;
    userAgent: string;
}, {
    sessionId: string;
    createdAt: string;
    lastActivity: string;
    device: string;
    location: string;
    ipAddress: string;
    userAgent: string;
}>;
export declare const ActiveSessionsResponseSchema: z.ZodObject<{
    sessions: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        device: z.ZodString;
        location: z.ZodString;
        lastActivity: z.ZodString;
        isCurrent: z.ZodBoolean;
        ipAddress: z.ZodString;
        userAgent: z.ZodString;
        createdAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        createdAt: string;
        lastActivity: string;
        device: string;
        location: string;
        ipAddress: string;
        userAgent: string;
        isCurrent: boolean;
    }, {
        id: string;
        createdAt: string;
        lastActivity: string;
        device: string;
        location: string;
        ipAddress: string;
        userAgent: string;
        isCurrent: boolean;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    sessions: {
        id: string;
        createdAt: string;
        lastActivity: string;
        device: string;
        location: string;
        ipAddress: string;
        userAgent: string;
        isCurrent: boolean;
    }[];
}, {
    sessions: {
        id: string;
        createdAt: string;
        lastActivity: string;
        device: string;
        location: string;
        ipAddress: string;
        userAgent: string;
        isCurrent: boolean;
    }[];
}>;
export declare const TerminateSessionResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    message: z.ZodString;
}, "strip", z.ZodTypeAny, {
    message: string;
    success: boolean;
}, {
    message: string;
    success: boolean;
}>;
export declare const TerminateOtherSessionsResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    terminatedCount: z.ZodNumber;
    message: z.ZodString;
}, "strip", z.ZodTypeAny, {
    message: string;
    success: boolean;
    terminatedCount: number;
}, {
    message: string;
    success: boolean;
    terminatedCount: number;
}>;
export declare const UniversalLogoutResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    message: z.ZodString;
}, "strip", z.ZodTypeAny, {
    message: string;
    success: boolean;
}, {
    message: string;
    success: boolean;
}>;
export declare const CheckUserExistsDtoSchema: z.ZodObject<{
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
}, {
    email: string;
}>;
export declare const CheckUserExistsResponseSchema: z.ZodObject<{
    exists: z.ZodBoolean;
    role: z.ZodOptional<z.ZodEnum<["client", "therapist", "moderator", "admin"]>>;
    isVerified: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    exists: boolean;
    role?: "client" | "therapist" | "moderator" | "admin" | undefined;
    isVerified?: boolean | undefined;
}, {
    exists: boolean;
    role?: "client" | "therapist" | "moderator" | "admin" | undefined;
    isVerified?: boolean | undefined;
}>;
export type LoginDto = z.infer<typeof LoginDtoSchema>;
export type RefreshTokenDto = z.infer<typeof RefreshTokenDtoSchema>;
export type LogoutDto = z.infer<typeof LogoutDtoSchema>;
export type RegisterUserDto = z.infer<typeof RegisterUserDtoSchema>;
export type ChangePasswordDto = z.infer<typeof ChangePasswordDtoSchema>;
export type RequestPasswordResetDto = z.infer<typeof RequestPasswordResetDtoSchema>;
export type ResetPasswordDto = z.infer<typeof ResetPasswordDtoSchema>;
export type SendVerificationEmailDto = z.infer<typeof SendVerificationEmailDtoSchema>;
export type ResendVerificationEmailDto = z.infer<typeof ResendVerificationEmailDtoSchema>;
export type VerifyEmailDto = z.infer<typeof VerifyEmailDtoSchema>;
export type SendOtpDto = z.infer<typeof SendOtpDtoSchema>;
export type VerifyOtpDto = z.infer<typeof VerifyOtpDtoSchema>;
export type ResendOtpDto = z.infer<typeof ResendOtpDtoSchema>;
export type RegisterWithOtpDto = z.infer<typeof RegisterWithOtpDtoSchema>;
export type UserIdParam = z.infer<typeof UserIdParamSchema>;
export type RegisterAdminDto = z.infer<typeof RegisterAdminDtoSchema>;
export type RegisterModeratorDto = z.infer<typeof RegisterModeratorDtoSchema>;
export type TerminateSessionDto = z.infer<typeof TerminateSessionDtoSchema>;
export type SessionInfoResponse = z.infer<typeof SessionInfoResponseSchema>;
export type ActiveSessionsResponse = z.infer<typeof ActiveSessionsResponseSchema>;
export type TerminateSessionResponse = z.infer<typeof TerminateSessionResponseSchema>;
export type TerminateOtherSessionsResponse = z.infer<typeof TerminateOtherSessionsResponseSchema>;
export type UniversalLogoutResponse = z.infer<typeof UniversalLogoutResponseSchema>;
export type CheckUserExistsDto = z.infer<typeof CheckUserExistsDtoSchema>;
export type CheckUserExistsResponse = z.infer<typeof CheckUserExistsResponseSchema>;
//# sourceMappingURL=auth.d.ts.map