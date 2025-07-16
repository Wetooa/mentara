import { z } from 'zod';

// User Role Enum Schema
export const UserRoleSchema = z.enum([
  'client',     // Regular user/patient (frontend standard)
  'user',       // Regular user/patient (backend standard)  
  'therapist',  // Licensed therapist
  'moderator',  // Content moderator
  'admin'       // System administrator
]);

// Core User Schema
export const UserSchema = z.object({
  id: z.string().min(1, 'User ID is required'),
  email: z.string().email('Invalid email format'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: UserRoleSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

// Create User Request Schema
export const CreateUserRequestSchema = z.object({
  email: z.string().email('Invalid email format'),
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  role: UserRoleSchema.optional()
});

// Update User Request Schema
export const UpdateUserRequestSchema = z.object({
  firstName: z.string().min(1, 'First name cannot be empty').optional(),
  lastName: z.string().min(1, 'Last name cannot be empty').optional(),
  email: z.string().email('Invalid email format').optional(),
  bio: z.string().max(500, 'Bio must not exceed 500 characters').optional(),
  avatarUrl: z.string().url('Invalid avatar URL').optional(),
  coverImageUrl: z.string().url('Invalid cover image URL').optional(),
  phoneNumber: z.string().optional(),
  timezone: z.string().optional(),
  language: z.string().optional(),
  theme: z.string().optional()
});

// First Sign In Response Schema
export const FirstSignInResponseSchema = z.object({
  isFirstSignIn: z.boolean()
});

// Role Permissions Schema
export const RolePermissionsSchema = z.object({
  canAccessAdminPanel: z.boolean(),
  canManageUsers: z.boolean(),
  canManageTherapists: z.boolean(),
  canModerateContent: z.boolean(),
  canCreateWorksheets: z.boolean(),
  canAssignWorksheets: z.boolean()
});

// User Registration DTOs (JWT Authentication)
export const RegisterClientDtoSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  firstName: z.string().min(1, 'First name is required'),
  middleName: z.string().optional(),
  lastName: z.string().min(1, 'Last name is required'),
  birthDate: z.string().datetime().optional(),
  address: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  hasSeenTherapistRecommendations: z.boolean().optional()
});

export const UpdateClientDtoSchema = RegisterClientDtoSchema.partial().omit({
  password: true
});

// Note: Therapist registration schemas are now in therapist.ts to avoid conflicts

// User Deactivation Schemas (updated from class-validator DTO)
export const DeactivateUserDtoSchema = z.object({
  reason: z.string().max(500, 'Reason must not exceed 500 characters').optional()
});

export const UserDeactivationResponseDtoSchema = z.object({
  message: z.string(),
  deactivatedAt: z.string().datetime(),
  reason: z.string().optional(),
  deactivatedBy: z.string().optional()
});

// Export type inference helpers
export type UserRole = z.infer<typeof UserRoleSchema>;
export type User = z.infer<typeof UserSchema>;
export type CreateUserRequest = z.infer<typeof CreateUserRequestSchema>;
export type UpdateUserRequest = z.infer<typeof UpdateUserRequestSchema>;
export type FirstSignInResponse = z.infer<typeof FirstSignInResponseSchema>;
export type RolePermissions = z.infer<typeof RolePermissionsSchema>;
export type RegisterClientDto = z.infer<typeof RegisterClientDtoSchema>;
export type UpdateClientDto = z.infer<typeof UpdateClientDtoSchema>;
// Note: RegisterTherapistDto and UpdateTherapistDto types are exported from therapist.ts
export type DeactivateUserDto = z.infer<typeof DeactivateUserDtoSchema>;
export type UserDeactivationResponseDto = z.infer<typeof UserDeactivationResponseDtoSchema>;

// Admin Registration Schema
export const RegisterAdminDtoSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  adminLevel: z.string().optional(),
  permissions: z.array(z.string()).optional()
});

// Moderator Registration Schema
export const RegisterModeratorDtoSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  permissions: z.array(z.string()).optional(),
  assignedCommunities: z.array(z.string()).optional()
});

// Authentication Schemas for Phase 3A
export const LoginDtoSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

export const RefreshTokenDtoSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
});

export const ChangePasswordDtoSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters long')
});

// General User Registration Schema (supports both client and therapist roles)
export const RegisterUserDtoSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: UserRoleSchema.optional()
});

// Logout Request Schema
export const LogoutDtoSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
});

// User ID Parameter Schema
export const UserIdParamSchema = z.object({
  id: z.string().uuid('Invalid user ID format')
});

// Password Reset Schemas
export const RequestPasswordResetDtoSchema = z.object({
  email: z.string().email('Invalid email format')
});

export const ResetPasswordDtoSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters long'),
  confirmPassword: z.string().min(8, 'Confirm password must be at least 8 characters long')
});

// Email Verification Schemas
export const SendVerificationEmailDtoSchema = z.object({
  userId: z.string().uuid('Invalid user ID format')
});

export const ResendVerificationEmailDtoSchema = z.object({
  email: z.string().email('Invalid email format')
});

export const VerifyEmailDtoSchema = z.object({
  token: z.string().min(1, 'Verification token is required')
});

// Utility schemas for specific use cases
export const UserIdSchema = z.string().min(1, 'User ID is required');
export const EmailSchema = z.string().email('Invalid email format');

// New authentication type exports
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