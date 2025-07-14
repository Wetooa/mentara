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
  email: z.string().email('Invalid email format').optional()
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

// User Registration DTOs (Backend specific)
export const RegisterClientDtoSchema = z.object({
  userId: z.string().min(1, 'User ID is required'), // Clerk user ID
  email: z.string().email('Invalid email format'),
  firstName: z.string().min(1, 'First name is required'),
  middleName: z.string().optional(),
  lastName: z.string().min(1, 'Last name is required'),
  birthDate: z.string().datetime().optional(),
  address: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  hasSeenTherapistRecommendations: z.boolean().optional()
});

export const UpdateClientDtoSchema = RegisterClientDtoSchema.partial().omit({
  userId: true
});

// Therapist Registration Schema
export const RegisterTherapistDtoSchema = z.object({
  userId: z.string().min(1, 'User ID is required'), // Clerk user ID
  email: z.string().email('Invalid email format'),
  firstName: z.string().min(1, 'First name is required'),
  middleName: z.string().optional(),
  lastName: z.string().min(1, 'Last name is required'),
  title: z.string().min(1, 'Professional title is required'),
  hourlyRate: z.number().min(0, 'Hourly rate must be positive').optional(),
  experienceYears: z.number().min(0, 'Experience years must be positive').optional(),
  province: z.string().min(1, 'Province is required').optional(),
  specialties: z.array(z.string()).optional(),
  bio: z.string().optional(),
  profileImage: z.string().url().optional(),
  licenseNumber: z.string().optional(),
  licenseType: z.string().optional(),
  isVerified: z.boolean().default(false)
});

export const UpdateTherapistDtoSchema = RegisterTherapistDtoSchema.partial().omit({
  userId: true
});

// User Deactivation Schemas
export const DeactivateUserDtoSchema = z.object({
  reason: z.string().min(1, 'Deactivation reason is required'),
  notifyUser: z.boolean().default(true)
});

export const UserDeactivationResponseDtoSchema = z.object({
  id: z.string(),
  isActive: z.boolean(),
  deactivatedAt: z.string().datetime().nullable(),
  deactivationReason: z.string().nullable()
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
export type RegisterTherapistDto = z.infer<typeof RegisterTherapistDtoSchema>;
export type UpdateTherapistDto = z.infer<typeof UpdateTherapistDtoSchema>;
export type DeactivateUserDto = z.infer<typeof DeactivateUserDtoSchema>;
export type UserDeactivationResponseDto = z.infer<typeof UserDeactivationResponseDtoSchema>;

// Utility schemas for specific use cases
export const UserIdSchema = z.string().min(1, 'User ID is required');
export const EmailSchema = z.string().email('Invalid email format');