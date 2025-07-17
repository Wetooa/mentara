import { z } from 'zod';

// Authentication Core Schemas
export const LoginDtoSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const RefreshTokenDtoSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const LogoutDtoSchema = z.object({
  refreshToken: z.string().optional(),
});

export const RegisterUserDtoSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.enum(['client', 'therapist']),
});

export const ChangePasswordDtoSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters long'),
  confirmPassword: z.string().min(8, 'Password confirmation is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Password Reset Schemas
export const RequestPasswordResetDtoSchema = z.object({
  email: z.string().email('Invalid email format'),
});

export const ResetPasswordDtoSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters long'),
  confirmPassword: z.string().min(8, 'Password confirmation is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Email Verification Schemas
export const SendVerificationEmailDtoSchema = z.object({
  email: z.string().email('Invalid email format').optional(),
});

export const ResendVerificationEmailDtoSchema = z.object({
  email: z.string().email('Invalid email format'),
});

export const VerifyEmailDtoSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
});

// OTP Verification Schemas (New)
export const SendOtpDtoSchema = z.object({
  email: z.string().email('Invalid email format'),
  type: z.enum(['email_verification', 'password_reset', 'login_verification']).default('email_verification'),
});

export const VerifyOtpDtoSchema = z.object({
  email: z.string().email('Invalid email format'),
  code: z.string().min(6, 'OTP code must be 6 digits').max(6, 'OTP code must be 6 digits'),
  type: z.enum(['email_verification', 'password_reset', 'login_verification']).default('email_verification'),
});

export const ResendOtpDtoSchema = z.object({
  email: z.string().email('Invalid email format'),
  type: z.enum(['email_verification', 'password_reset', 'login_verification']).default('email_verification'),
});

// Registration with OTP Schemas
export const RegisterWithOtpDtoSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.enum(['client', 'therapist']).default('client'),
  otpCode: z.string().min(6, 'OTP code must be 6 digits').max(6, 'OTP code must be 6 digits'),
});

// User ID and Email Param Schemas
export const UserIdParamSchema = z.object({
  id: z.string().min(1, 'User ID is required'),
});

export const UserIdSchema = z.string().min(1, 'User ID is required');
export const EmailSchema = z.string().email('Invalid email format');

// Admin-specific Registration Schemas
export const RegisterAdminDtoSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  permissions: z.object({
    canAccessAdminPanel: z.boolean().default(true),
    canManageUsers: z.boolean().default(true),
    canManageTherapists: z.boolean().default(true),
    canModerateContent: z.boolean().default(true),
    canCreateWorksheets: z.boolean().default(true),
    canAssignWorksheets: z.boolean().default(true),
  }).optional(),
});

export const RegisterModeratorDtoSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  permissions: z.object({
    canAccessAdminPanel: z.boolean().default(false),
    canManageUsers: z.boolean().default(false),
    canManageTherapists: z.boolean().default(false),
    canModerateContent: z.boolean().default(true),
    canCreateWorksheets: z.boolean().default(false),
    canAssignWorksheets: z.boolean().default(false),
  }).optional(),
});

// Type exports
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