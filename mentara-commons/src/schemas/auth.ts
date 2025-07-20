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
  role: z.string(),
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

// OTP Type Enum Schema
export const OtpTypeSchema = z.enum(['registration', 'password_reset', 'login_verification']);

// OTP Verification Schemas (Updated)
export const SendOtpDtoSchema = z.object({
  email: z.string().email('Invalid email format'),
  type: OtpTypeSchema.default('registration'),
});

export const VerifyOtpDtoSchema = z.object({
  email: z.string().email('Invalid email format'),
  otpCode: z.string().min(6, 'OTP code must be 6 digits').max(6, 'OTP code must be 6 digits'),
  type: OtpTypeSchema.default('registration'),
});

export const ResendOtpDtoSchema = z.object({
  email: z.string().email('Invalid email format'),
  type: OtpTypeSchema.default('registration'),
});

// Client Registration OTP Verification Schemas
export const VerifyRegistrationOtpDtoSchema = z.object({
  email: z.string().email('Invalid email format'),
  otpCode: z.string().min(6, 'OTP code must be 6 digits').max(6, 'OTP code must be 6 digits'),
});

export const ResendRegistrationOtpDtoSchema = z.object({
  email: z.string().email('Invalid email format'),
});

// Email Service Response Schemas
export const EmailResponseSchema = z.object({
  status: z.enum(['success', 'error']),
  message: z.string(),
  emailId: z.string().optional(),
  otp_code: z.string().optional(), // Only in development
});

export const EmailStatusResponseSchema = z.object({
  status: z.enum(['success', 'error']),
  configuration: z.object({
    isInitialized: z.boolean(),
    hasServiceId: z.boolean(),
    hasTemplateId: z.boolean(),
    hasPublicKey: z.boolean(),
  }),
  ready: z.boolean(),
});

// OTP Email Data Schema
export const OtpEmailDataSchema = z.object({
  to_email: z.string().email('Invalid email format'),
  to_name: z.string().min(1, 'Recipient name is required'),
  otp_code: z.string().min(6, 'OTP code must be 6 digits').max(6, 'OTP code must be 6 digits'),
  expires_in: z.string().min(1, 'Expiry time is required'),
  type: OtpTypeSchema,
});

// Auto OTP Email Request Schema
export const AutoOtpEmailRequestSchema = z.object({
  to_email: z.string().email('Invalid email format'),
  to_name: z.string().min(1, 'Recipient name is required'),
  type: OtpTypeSchema,
  expires_in_minutes: z.number().int().min(1).max(60).default(10),
});

// Registration with OTP Schemas
export const RegisterWithOtpDtoSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.string().default('client'),
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

// Session Management Schemas
export const TerminateSessionDtoSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
});

export const SessionInfoResponseSchema = z.object({
  sessionId: z.string(),
  createdAt: z.string(),
  lastActivity: z.string(),
  device: z.string(),
  location: z.string(),
  ipAddress: z.string(),
  userAgent: z.string(),
});

export const ActiveSessionsResponseSchema = z.object({
  sessions: z.array(z.object({
    id: z.string(),
    device: z.string(),
    location: z.string(),
    lastActivity: z.string(),
    isCurrent: z.boolean(),
    ipAddress: z.string(),
    userAgent: z.string(),
    createdAt: z.string(),
  })),
});

export const TerminateSessionResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export const TerminateOtherSessionsResponseSchema = z.object({
  success: z.boolean(),
  terminatedCount: z.number(),
  message: z.string(),
});

export const UniversalLogoutResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

// User Role Schema - simple string type
export const UserRoleSchema = z.string();

// Check User Existence Schema
export const CheckUserExistsDtoSchema = z.object({
  email: z.string().email('Invalid email format'),
});

export const CheckUserExistsResponseSchema = z.object({
  exists: z.boolean(),
  role: UserRoleSchema.optional(),
  isVerified: z.boolean().optional(),
});

// Auth Response Schemas
export const AuthUserSchema = z.object({
  id: z.string(),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  role: UserRoleSchema,
  emailVerified: z.boolean(),
});

export const TokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number(),
});

export const AuthResponseSchema = z.object({
  user: AuthUserSchema,
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number(),
});

export const ClientAuthResponseSchema = AuthResponseSchema.extend({
  message: z.string().optional(), // For registration success messages
});

export const TherapistAuthResponseSchema = AuthResponseSchema;
export const AdminAuthResponseSchema = AuthResponseSchema;
export const ModeratorAuthResponseSchema = AuthResponseSchema;

// Profile Response Schemas
export const ClientProfileResponseSchema = z.object({
  id: z.string(),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  role: z.literal('client'),
  dateOfBirth: z.string().optional(),
  phoneNumber: z.string().optional(),
  profileComplete: z.boolean(),
  therapistId: z.string().optional(),
  createdAt: z.string(),
});

export const OnboardingStatusResponseSchema = z.object({
  isFirstSignIn: z.boolean(),
  hasSeenRecommendations: z.boolean(),
  profileCompleted: z.boolean(),
  assessmentCompleted: z.boolean(),
});

export const SuccessResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
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