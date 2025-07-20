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
    role: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
}, {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
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
export declare const OtpTypeSchema: z.ZodEnum<["registration", "password_reset", "login_verification"]>;
export declare const SendOtpDtoSchema: z.ZodObject<{
    email: z.ZodString;
    type: z.ZodDefault<z.ZodEnum<["registration", "password_reset", "login_verification"]>>;
}, "strip", z.ZodTypeAny, {
    email: string;
    type: "registration" | "password_reset" | "login_verification";
}, {
    email: string;
    type?: "registration" | "password_reset" | "login_verification" | undefined;
}>;
export declare const VerifyOtpDtoSchema: z.ZodObject<{
    email: z.ZodString;
    otpCode: z.ZodString;
    type: z.ZodDefault<z.ZodEnum<["registration", "password_reset", "login_verification"]>>;
}, "strip", z.ZodTypeAny, {
    email: string;
    type: "registration" | "password_reset" | "login_verification";
    otpCode: string;
}, {
    email: string;
    otpCode: string;
    type?: "registration" | "password_reset" | "login_verification" | undefined;
}>;
export declare const ResendOtpDtoSchema: z.ZodObject<{
    email: z.ZodString;
    type: z.ZodDefault<z.ZodEnum<["registration", "password_reset", "login_verification"]>>;
}, "strip", z.ZodTypeAny, {
    email: string;
    type: "registration" | "password_reset" | "login_verification";
}, {
    email: string;
    type?: "registration" | "password_reset" | "login_verification" | undefined;
}>;
export declare const VerifyRegistrationOtpDtoSchema: z.ZodObject<{
    email: z.ZodString;
    otpCode: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    otpCode: string;
}, {
    email: string;
    otpCode: string;
}>;
export declare const ResendRegistrationOtpDtoSchema: z.ZodObject<{
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
}, {
    email: string;
}>;
export declare const EmailResponseSchema: z.ZodObject<{
    status: z.ZodEnum<["success", "error"]>;
    message: z.ZodString;
    emailId: z.ZodOptional<z.ZodString>;
    otp_code: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    message: string;
    status: "success" | "error";
    emailId?: string | undefined;
    otp_code?: string | undefined;
}, {
    message: string;
    status: "success" | "error";
    emailId?: string | undefined;
    otp_code?: string | undefined;
}>;
export declare const EmailStatusResponseSchema: z.ZodObject<{
    status: z.ZodEnum<["success", "error"]>;
    configuration: z.ZodObject<{
        isInitialized: z.ZodBoolean;
        hasServiceId: z.ZodBoolean;
        hasTemplateId: z.ZodBoolean;
        hasPublicKey: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        isInitialized: boolean;
        hasServiceId: boolean;
        hasTemplateId: boolean;
        hasPublicKey: boolean;
    }, {
        isInitialized: boolean;
        hasServiceId: boolean;
        hasTemplateId: boolean;
        hasPublicKey: boolean;
    }>;
    ready: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    status: "success" | "error";
    configuration: {
        isInitialized: boolean;
        hasServiceId: boolean;
        hasTemplateId: boolean;
        hasPublicKey: boolean;
    };
    ready: boolean;
}, {
    status: "success" | "error";
    configuration: {
        isInitialized: boolean;
        hasServiceId: boolean;
        hasTemplateId: boolean;
        hasPublicKey: boolean;
    };
    ready: boolean;
}>;
export declare const OtpEmailDataSchema: z.ZodObject<{
    to_email: z.ZodString;
    to_name: z.ZodString;
    otp_code: z.ZodString;
    expires_in: z.ZodString;
    type: z.ZodEnum<["registration", "password_reset", "login_verification"]>;
}, "strip", z.ZodTypeAny, {
    type: "registration" | "password_reset" | "login_verification";
    otp_code: string;
    to_email: string;
    to_name: string;
    expires_in: string;
}, {
    type: "registration" | "password_reset" | "login_verification";
    otp_code: string;
    to_email: string;
    to_name: string;
    expires_in: string;
}>;
export declare const AutoOtpEmailRequestSchema: z.ZodObject<{
    to_email: z.ZodString;
    to_name: z.ZodString;
    type: z.ZodEnum<["registration", "password_reset", "login_verification"]>;
    expires_in_minutes: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    type: "registration" | "password_reset" | "login_verification";
    to_email: string;
    to_name: string;
    expires_in_minutes: number;
}, {
    type: "registration" | "password_reset" | "login_verification";
    to_email: string;
    to_name: string;
    expires_in_minutes?: number | undefined;
}>;
export declare const RegisterWithOtpDtoSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    role: z.ZodDefault<z.ZodString>;
    otpCode: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
    otpCode: string;
}, {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    otpCode: string;
    role?: string | undefined;
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
export declare const UserRoleSchema: z.ZodString;
export declare const CheckUserExistsDtoSchema: z.ZodObject<{
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
}, {
    email: string;
}>;
export declare const CheckUserExistsResponseSchema: z.ZodObject<{
    exists: z.ZodBoolean;
    role: z.ZodOptional<z.ZodString>;
    isVerified: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    exists: boolean;
    role?: string | undefined;
    isVerified?: boolean | undefined;
}, {
    exists: boolean;
    role?: string | undefined;
    isVerified?: boolean | undefined;
}>;
export declare const AuthUserSchema: z.ZodObject<{
    id: z.ZodString;
    email: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    role: z.ZodString;
    emailVerified: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    id: string;
    emailVerified: boolean;
}, {
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    id: string;
    emailVerified: boolean;
}>;
export declare const TokensSchema: z.ZodObject<{
    accessToken: z.ZodString;
    refreshToken: z.ZodString;
    expiresIn: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    refreshToken: string;
    accessToken: string;
    expiresIn: number;
}, {
    refreshToken: string;
    accessToken: string;
    expiresIn: number;
}>;
export declare const AuthResponseSchema: z.ZodObject<{
    user: z.ZodObject<{
        id: z.ZodString;
        email: z.ZodString;
        firstName: z.ZodString;
        lastName: z.ZodString;
        role: z.ZodString;
        emailVerified: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        id: string;
        emailVerified: boolean;
    }, {
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        id: string;
        emailVerified: boolean;
    }>;
    token: z.ZodString;
    message: z.ZodString;
}, "strip", z.ZodTypeAny, {
    message: string;
    token: string;
    user: {
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        id: string;
        emailVerified: boolean;
    };
}, {
    message: string;
    token: string;
    user: {
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        id: string;
        emailVerified: boolean;
    };
}>;
export declare const ClientAuthResponseSchema: z.ZodObject<{
    user: z.ZodObject<{
        id: z.ZodString;
        email: z.ZodString;
        firstName: z.ZodString;
        lastName: z.ZodString;
        role: z.ZodString;
        emailVerified: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        id: string;
        emailVerified: boolean;
    }, {
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        id: string;
        emailVerified: boolean;
    }>;
    token: z.ZodString;
} & {
    message: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    token: string;
    user: {
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        id: string;
        emailVerified: boolean;
    };
    message?: string | undefined;
}, {
    token: string;
    user: {
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        id: string;
        emailVerified: boolean;
    };
    message?: string | undefined;
}>;
export declare const TherapistAuthResponseSchema: z.ZodObject<{
    user: z.ZodObject<{
        id: z.ZodString;
        email: z.ZodString;
        firstName: z.ZodString;
        lastName: z.ZodString;
        role: z.ZodString;
        emailVerified: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        id: string;
        emailVerified: boolean;
    }, {
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        id: string;
        emailVerified: boolean;
    }>;
    token: z.ZodString;
    message: z.ZodString;
}, "strip", z.ZodTypeAny, {
    message: string;
    token: string;
    user: {
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        id: string;
        emailVerified: boolean;
    };
}, {
    message: string;
    token: string;
    user: {
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        id: string;
        emailVerified: boolean;
    };
}>;
export declare const AdminAuthResponseSchema: z.ZodObject<{
    user: z.ZodObject<{
        id: z.ZodString;
        email: z.ZodString;
        firstName: z.ZodString;
        lastName: z.ZodString;
        role: z.ZodString;
        emailVerified: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        id: string;
        emailVerified: boolean;
    }, {
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        id: string;
        emailVerified: boolean;
    }>;
    token: z.ZodString;
    message: z.ZodString;
}, "strip", z.ZodTypeAny, {
    message: string;
    token: string;
    user: {
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        id: string;
        emailVerified: boolean;
    };
}, {
    message: string;
    token: string;
    user: {
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        id: string;
        emailVerified: boolean;
    };
}>;
export declare const ModeratorAuthResponseSchema: z.ZodObject<{
    user: z.ZodObject<{
        id: z.ZodString;
        email: z.ZodString;
        firstName: z.ZodString;
        lastName: z.ZodString;
        role: z.ZodString;
        emailVerified: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        id: string;
        emailVerified: boolean;
    }, {
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        id: string;
        emailVerified: boolean;
    }>;
    token: z.ZodString;
    message: z.ZodString;
}, "strip", z.ZodTypeAny, {
    message: string;
    token: string;
    user: {
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        id: string;
        emailVerified: boolean;
    };
}, {
    message: string;
    token: string;
    user: {
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        id: string;
        emailVerified: boolean;
    };
}>;
export declare const ClientProfileResponseSchema: z.ZodObject<{
    id: z.ZodString;
    email: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    role: z.ZodLiteral<"client">;
    dateOfBirth: z.ZodOptional<z.ZodString>;
    phoneNumber: z.ZodOptional<z.ZodString>;
    profileComplete: z.ZodBoolean;
    therapistId: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    firstName: string;
    lastName: string;
    role: "client";
    id: string;
    createdAt: string;
    profileComplete: boolean;
    dateOfBirth?: string | undefined;
    phoneNumber?: string | undefined;
    therapistId?: string | undefined;
}, {
    email: string;
    firstName: string;
    lastName: string;
    role: "client";
    id: string;
    createdAt: string;
    profileComplete: boolean;
    dateOfBirth?: string | undefined;
    phoneNumber?: string | undefined;
    therapistId?: string | undefined;
}>;
export declare const OnboardingStatusResponseSchema: z.ZodObject<{
    isFirstSignIn: z.ZodBoolean;
    hasSeenRecommendations: z.ZodBoolean;
    profileCompleted: z.ZodBoolean;
    assessmentCompleted: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    isFirstSignIn: boolean;
    hasSeenRecommendations: boolean;
    profileCompleted: boolean;
    assessmentCompleted: boolean;
}, {
    isFirstSignIn: boolean;
    hasSeenRecommendations: boolean;
    profileCompleted: boolean;
    assessmentCompleted: boolean;
}>;
export declare const SuccessResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    message: z.ZodString;
}, "strip", z.ZodTypeAny, {
    message: string;
    success: boolean;
}, {
    message: string;
    success: boolean;
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
export type OtpType = z.infer<typeof OtpTypeSchema>;
export type SendOtpDto = z.infer<typeof SendOtpDtoSchema>;
export type VerifyOtpDto = z.infer<typeof VerifyOtpDtoSchema>;
export type ResendOtpDto = z.infer<typeof ResendOtpDtoSchema>;
export type VerifyRegistrationOtpDto = z.infer<typeof VerifyRegistrationOtpDtoSchema>;
export type ResendRegistrationOtpDto = z.infer<typeof ResendRegistrationOtpDtoSchema>;
export type EmailResponse = z.infer<typeof EmailResponseSchema>;
export type EmailStatusResponse = z.infer<typeof EmailStatusResponseSchema>;
export type OtpEmailData = z.infer<typeof OtpEmailDataSchema>;
export type AutoOtpEmailRequest = z.infer<typeof AutoOtpEmailRequestSchema>;
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
export type UserRole = z.infer<typeof UserRoleSchema>;
export type CheckUserExistsDto = z.infer<typeof CheckUserExistsDtoSchema>;
export type CheckUserExistsResponse = z.infer<typeof CheckUserExistsResponseSchema>;
export type AuthUser = z.infer<typeof AuthUserSchema>;
export type Tokens = z.infer<typeof TokensSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
export type ClientAuthResponse = z.infer<typeof ClientAuthResponseSchema>;
export type TherapistAuthResponse = z.infer<typeof TherapistAuthResponseSchema>;
export type AdminAuthResponse = z.infer<typeof AdminAuthResponseSchema>;
export type ModeratorAuthResponse = z.infer<typeof ModeratorAuthResponseSchema>;
export type ClientProfileResponse = z.infer<typeof ClientProfileResponseSchema>;
export type OnboardingStatusResponse = z.infer<typeof OnboardingStatusResponseSchema>;
export type SuccessResponse = z.infer<typeof SuccessResponseSchema>;
//# sourceMappingURL=auth.d.ts.map