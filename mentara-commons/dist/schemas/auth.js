"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuccessResponseSchema = exports.OnboardingStatusResponseSchema = exports.ClientProfileResponseSchema = exports.ModeratorAuthResponseSchema = exports.AdminAuthResponseSchema = exports.TherapistAuthResponseSchema = exports.ClientAuthResponseSchema = exports.AuthResponseSchema = exports.TokensSchema = exports.AuthUserSchema = exports.CheckUserExistsResponseSchema = exports.CheckUserExistsDtoSchema = exports.UserRoleSchema = exports.UniversalLogoutResponseSchema = exports.TerminateOtherSessionsResponseSchema = exports.TerminateSessionResponseSchema = exports.ActiveSessionsResponseSchema = exports.SessionInfoResponseSchema = exports.TerminateSessionDtoSchema = exports.RegisterModeratorDtoSchema = exports.RegisterAdminDtoSchema = exports.EmailSchema = exports.UserIdSchema = exports.UserIdParamSchema = exports.RegisterWithOtpDtoSchema = exports.AutoOtpEmailRequestSchema = exports.OtpEmailDataSchema = exports.EmailStatusResponseSchema = exports.EmailResponseSchema = exports.ResendRegistrationOtpDtoSchema = exports.VerifyRegistrationOtpDtoSchema = exports.ResendOtpDtoSchema = exports.VerifyOtpDtoSchema = exports.SendOtpDtoSchema = exports.OtpTypeSchema = exports.VerifyEmailDtoSchema = exports.ResendVerificationEmailDtoSchema = exports.SendVerificationEmailDtoSchema = exports.ResetPasswordDtoSchema = exports.RequestPasswordResetDtoSchema = exports.ChangePasswordDtoSchema = exports.RegisterUserDtoSchema = exports.LogoutDtoSchema = exports.RefreshTokenDtoSchema = exports.LoginDtoSchema = void 0;
const zod_1 = require("zod");
// Authentication Core Schemas
exports.LoginDtoSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(1, 'Password is required'),
});
exports.RefreshTokenDtoSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1, 'Refresh token is required'),
});
exports.LogoutDtoSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().optional(),
});
exports.RegisterUserDtoSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(8, 'Password must be at least 8 characters long'),
    firstName: zod_1.z.string().min(1, 'First name is required'),
    lastName: zod_1.z.string().min(1, 'Last name is required'),
    role: zod_1.z.string(),
});
exports.ChangePasswordDtoSchema = zod_1.z.object({
    currentPassword: zod_1.z.string().min(1, 'Current password is required'),
    newPassword: zod_1.z.string().min(8, 'New password must be at least 8 characters long'),
    confirmPassword: zod_1.z.string().min(8, 'Password confirmation is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});
// Password Reset Schemas
exports.RequestPasswordResetDtoSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
});
exports.ResetPasswordDtoSchema = zod_1.z.object({
    token: zod_1.z.string().min(1, 'Reset token is required'),
    newPassword: zod_1.z.string().min(8, 'Password must be at least 8 characters long'),
    confirmPassword: zod_1.z.string().min(8, 'Password confirmation is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});
// Email Verification Schemas
exports.SendVerificationEmailDtoSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format').optional(),
});
exports.ResendVerificationEmailDtoSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
});
exports.VerifyEmailDtoSchema = zod_1.z.object({
    token: zod_1.z.string().min(1, 'Verification token is required'),
});
// OTP Type Enum Schema
exports.OtpTypeSchema = zod_1.z.enum(['registration', 'password_reset', 'login_verification']);
// OTP Verification Schemas (Updated)
exports.SendOtpDtoSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    type: exports.OtpTypeSchema.default('registration'),
});
exports.VerifyOtpDtoSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    otpCode: zod_1.z.string().min(6, 'OTP code must be 6 digits').max(6, 'OTP code must be 6 digits'),
    type: exports.OtpTypeSchema.default('registration'),
});
exports.ResendOtpDtoSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    type: exports.OtpTypeSchema.default('registration'),
});
// Client Registration OTP Verification Schemas
exports.VerifyRegistrationOtpDtoSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    otpCode: zod_1.z.string().min(6, 'OTP code must be 6 digits').max(6, 'OTP code must be 6 digits'),
});
exports.ResendRegistrationOtpDtoSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
});
// Email Service Response Schemas
exports.EmailResponseSchema = zod_1.z.object({
    status: zod_1.z.enum(['success', 'error']),
    message: zod_1.z.string(),
    emailId: zod_1.z.string().optional(),
    otp_code: zod_1.z.string().optional(), // Only in development
});
exports.EmailStatusResponseSchema = zod_1.z.object({
    status: zod_1.z.enum(['success', 'error']),
    configuration: zod_1.z.object({
        isInitialized: zod_1.z.boolean(),
        hasServiceId: zod_1.z.boolean(),
        hasTemplateId: zod_1.z.boolean(),
        hasPublicKey: zod_1.z.boolean(),
    }),
    ready: zod_1.z.boolean(),
});
// OTP Email Data Schema
exports.OtpEmailDataSchema = zod_1.z.object({
    to_email: zod_1.z.string().email('Invalid email format'),
    to_name: zod_1.z.string().min(1, 'Recipient name is required'),
    otp_code: zod_1.z.string().min(6, 'OTP code must be 6 digits').max(6, 'OTP code must be 6 digits'),
    expires_in: zod_1.z.string().min(1, 'Expiry time is required'),
    type: exports.OtpTypeSchema,
});
// Auto OTP Email Request Schema
exports.AutoOtpEmailRequestSchema = zod_1.z.object({
    to_email: zod_1.z.string().email('Invalid email format'),
    to_name: zod_1.z.string().min(1, 'Recipient name is required'),
    type: exports.OtpTypeSchema,
    expires_in_minutes: zod_1.z.number().int().min(1).max(60).default(10),
});
// Registration with OTP Schemas
exports.RegisterWithOtpDtoSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(8, 'Password must be at least 8 characters long'),
    firstName: zod_1.z.string().min(1, 'First name is required'),
    lastName: zod_1.z.string().min(1, 'Last name is required'),
    role: zod_1.z.string().default('client'),
    otpCode: zod_1.z.string().min(6, 'OTP code must be 6 digits').max(6, 'OTP code must be 6 digits'),
});
// User ID and Email Param Schemas
exports.UserIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().min(1, 'User ID is required'),
});
exports.UserIdSchema = zod_1.z.string().min(1, 'User ID is required');
exports.EmailSchema = zod_1.z.string().email('Invalid email format');
// Admin-specific Registration Schemas
exports.RegisterAdminDtoSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(8, 'Password must be at least 8 characters long'),
    firstName: zod_1.z.string().min(1, 'First name is required'),
    lastName: zod_1.z.string().min(1, 'Last name is required'),
    permissions: zod_1.z.object({
        canAccessAdminPanel: zod_1.z.boolean().default(true),
        canManageUsers: zod_1.z.boolean().default(true),
        canManageTherapists: zod_1.z.boolean().default(true),
        canModerateContent: zod_1.z.boolean().default(true),
        canCreateWorksheets: zod_1.z.boolean().default(true),
        canAssignWorksheets: zod_1.z.boolean().default(true),
    }).optional(),
});
exports.RegisterModeratorDtoSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(8, 'Password must be at least 8 characters long'),
    firstName: zod_1.z.string().min(1, 'First name is required'),
    lastName: zod_1.z.string().min(1, 'Last name is required'),
    permissions: zod_1.z.object({
        canAccessAdminPanel: zod_1.z.boolean().default(false),
        canManageUsers: zod_1.z.boolean().default(false),
        canManageTherapists: zod_1.z.boolean().default(false),
        canModerateContent: zod_1.z.boolean().default(true),
        canCreateWorksheets: zod_1.z.boolean().default(false),
        canAssignWorksheets: zod_1.z.boolean().default(false),
    }).optional(),
});
// Session Management Schemas
exports.TerminateSessionDtoSchema = zod_1.z.object({
    sessionId: zod_1.z.string().min(1, 'Session ID is required'),
});
exports.SessionInfoResponseSchema = zod_1.z.object({
    sessionId: zod_1.z.string(),
    createdAt: zod_1.z.string(),
    lastActivity: zod_1.z.string(),
    device: zod_1.z.string(),
    location: zod_1.z.string(),
    ipAddress: zod_1.z.string(),
    userAgent: zod_1.z.string(),
});
exports.ActiveSessionsResponseSchema = zod_1.z.object({
    sessions: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        device: zod_1.z.string(),
        location: zod_1.z.string(),
        lastActivity: zod_1.z.string(),
        isCurrent: zod_1.z.boolean(),
        ipAddress: zod_1.z.string(),
        userAgent: zod_1.z.string(),
        createdAt: zod_1.z.string(),
    })),
});
exports.TerminateSessionResponseSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    message: zod_1.z.string(),
});
exports.TerminateOtherSessionsResponseSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    terminatedCount: zod_1.z.number(),
    message: zod_1.z.string(),
});
exports.UniversalLogoutResponseSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    message: zod_1.z.string(),
});
// User Role Schema - simple string type
exports.UserRoleSchema = zod_1.z.string();
// Check User Existence Schema
exports.CheckUserExistsDtoSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
});
exports.CheckUserExistsResponseSchema = zod_1.z.object({
    exists: zod_1.z.boolean(),
    role: exports.UserRoleSchema.optional(),
    isVerified: zod_1.z.boolean().optional(),
});
// Auth Response Schemas
exports.AuthUserSchema = zod_1.z.object({
    id: zod_1.z.string(),
    email: zod_1.z.string(),
    firstName: zod_1.z.string(),
    lastName: zod_1.z.string(),
    role: exports.UserRoleSchema,
    emailVerified: zod_1.z.boolean(),
});
exports.TokensSchema = zod_1.z.object({
    accessToken: zod_1.z.string(),
    refreshToken: zod_1.z.string(),
    expiresIn: zod_1.z.number(),
});
exports.AuthResponseSchema = zod_1.z.object({
    user: exports.AuthUserSchema,
    token: zod_1.z.string(),
    message: zod_1.z.string(),
});
exports.ClientAuthResponseSchema = exports.AuthResponseSchema.extend({
    message: zod_1.z.string().optional(), // For registration success messages
});
exports.TherapistAuthResponseSchema = exports.AuthResponseSchema;
exports.AdminAuthResponseSchema = exports.AuthResponseSchema;
exports.ModeratorAuthResponseSchema = exports.AuthResponseSchema;
// Profile Response Schemas
exports.ClientProfileResponseSchema = zod_1.z.object({
    id: zod_1.z.string(),
    email: zod_1.z.string(),
    firstName: zod_1.z.string(),
    lastName: zod_1.z.string(),
    role: zod_1.z.literal('client'),
    dateOfBirth: zod_1.z.string().optional(),
    phoneNumber: zod_1.z.string().optional(),
    profileComplete: zod_1.z.boolean(),
    therapistId: zod_1.z.string().optional(),
    createdAt: zod_1.z.string(),
});
exports.OnboardingStatusResponseSchema = zod_1.z.object({
    isFirstSignIn: zod_1.z.boolean(),
    hasSeenRecommendations: zod_1.z.boolean(),
    profileCompleted: zod_1.z.boolean(),
    assessmentCompleted: zod_1.z.boolean(),
});
exports.SuccessResponseSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    message: zod_1.z.string(),
});
//# sourceMappingURL=auth.js.map