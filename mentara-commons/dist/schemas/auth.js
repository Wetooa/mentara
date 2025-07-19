"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckUserExistsResponseSchema = exports.CheckUserExistsDtoSchema = exports.UniversalLogoutResponseSchema = exports.TerminateOtherSessionsResponseSchema = exports.TerminateSessionResponseSchema = exports.ActiveSessionsResponseSchema = exports.SessionInfoResponseSchema = exports.TerminateSessionDtoSchema = exports.RegisterModeratorDtoSchema = exports.RegisterAdminDtoSchema = exports.EmailSchema = exports.UserIdSchema = exports.UserIdParamSchema = exports.RegisterWithOtpDtoSchema = exports.ResendOtpDtoSchema = exports.VerifyOtpDtoSchema = exports.SendOtpDtoSchema = exports.VerifyEmailDtoSchema = exports.ResendVerificationEmailDtoSchema = exports.SendVerificationEmailDtoSchema = exports.ResetPasswordDtoSchema = exports.RequestPasswordResetDtoSchema = exports.ChangePasswordDtoSchema = exports.RegisterUserDtoSchema = exports.LogoutDtoSchema = exports.RefreshTokenDtoSchema = exports.LoginDtoSchema = void 0;
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
    role: zod_1.z.enum(['client', 'therapist']),
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
// OTP Verification Schemas (New)
exports.SendOtpDtoSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    type: zod_1.z.enum(['email_verification', 'password_reset', 'login_verification']).default('email_verification'),
});
exports.VerifyOtpDtoSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    code: zod_1.z.string().min(6, 'OTP code must be 6 digits').max(6, 'OTP code must be 6 digits'),
    type: zod_1.z.enum(['email_verification', 'password_reset', 'login_verification']).default('email_verification'),
});
exports.ResendOtpDtoSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    type: zod_1.z.enum(['email_verification', 'password_reset', 'login_verification']).default('email_verification'),
});
// Registration with OTP Schemas
exports.RegisterWithOtpDtoSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(8, 'Password must be at least 8 characters long'),
    firstName: zod_1.z.string().min(1, 'First name is required'),
    lastName: zod_1.z.string().min(1, 'Last name is required'),
    role: zod_1.z.enum(['client', 'therapist']).default('client'),
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
// Check User Existence Schema
exports.CheckUserExistsDtoSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
});
exports.CheckUserExistsResponseSchema = zod_1.z.object({
    exists: zod_1.z.boolean(),
    role: zod_1.z.enum(['client', 'therapist', 'moderator', 'admin']).optional(),
    isVerified: zod_1.z.boolean().optional(),
});
//# sourceMappingURL=auth.js.map