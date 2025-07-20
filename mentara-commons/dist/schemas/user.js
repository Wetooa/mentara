"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuccessMessageResponseSchema = exports.AuthResponseSchema = exports.UserProfileResponseSchema = exports.UserResponseSchema = exports.PaginatedResponseSchema = exports.PaginationMetaSchema = exports.ApiResponseSchema = exports.EmailSchema = exports.UserIdSchema = exports.VerifyEmailDtoSchema = exports.ResendVerificationEmailDtoSchema = exports.SendVerificationEmailDtoSchema = exports.ResetPasswordDtoSchema = exports.RequestPasswordResetDtoSchema = exports.UserIdParamSchema = exports.LogoutDtoSchema = exports.RegisterUserDtoSchema = exports.ChangePasswordDtoSchema = exports.RefreshTokenDtoSchema = exports.LoginDtoSchema = exports.RegisterModeratorDtoSchema = exports.RegisterAdminDtoSchema = exports.UserDeactivationResponseDtoSchema = exports.DeactivateUserDtoSchema = exports.UpdateClientDtoSchema = exports.RegisterClientDtoSchema = exports.RolePermissionsSchema = exports.FirstSignInResponseSchema = exports.UpdateUserRequestSchema = exports.CreateUserRequestSchema = exports.UserSchema = exports.UserRoleSchema = void 0;
const zod_1 = require("zod");
// User Role Enum Schema
exports.UserRoleSchema = zod_1.z.enum([
    'client', // Regular user/patient
    'therapist', // Licensed therapist
    'moderator', // Content moderator
    'admin' // System administrator
]);
// Core User Schema
exports.UserSchema = zod_1.z.object({
    id: zod_1.z.string().min(1, 'User ID is required'),
    email: zod_1.z.string().email('Invalid email format'),
    firstName: zod_1.z.string().optional(),
    middleName: zod_1.z.string().optional(),
    lastName: zod_1.z.string().optional(),
    birthDate: zod_1.z.string().datetime().optional(),
    address: zod_1.z.string().optional(),
    role: exports.UserRoleSchema,
    bio: zod_1.z.string().optional(),
    avatarUrl: zod_1.z.string().url().optional(),
    coverImageUrl: zod_1.z.string().url().optional(),
    phoneNumber: zod_1.z.string().optional(),
    timezone: zod_1.z.string().optional(),
    language: zod_1.z.string().optional(),
    theme: zod_1.z.string().optional(),
    isActive: zod_1.z.boolean().optional(),
    isVerified: zod_1.z.boolean().optional(),
    emailVerified: zod_1.z.boolean().optional(),
    lastLoginAt: zod_1.z.string().datetime().optional(),
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime()
});
// Create User Request Schema
exports.CreateUserRequestSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    firstName: zod_1.z.string().min(1, 'First name is required').optional(),
    middleName: zod_1.z.string().optional(),
    lastName: zod_1.z.string().min(1, 'Last name is required').optional(),
    birthDate: zod_1.z.string().datetime().optional(),
    address: zod_1.z.string().optional(),
    role: exports.UserRoleSchema.optional()
});
// Update User Request Schema
exports.UpdateUserRequestSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(1, 'First name cannot be empty').optional(),
    middleName: zod_1.z.string().optional(),
    lastName: zod_1.z.string().min(1, 'Last name cannot be empty').optional(),
    email: zod_1.z.string().email('Invalid email format').optional(),
    birthDate: zod_1.z.string().datetime().optional(),
    address: zod_1.z.string().optional(),
    bio: zod_1.z.string().max(500, 'Bio must not exceed 500 characters').optional(),
    avatarUrl: zod_1.z.string().url('Invalid avatar URL').optional(),
    coverImageUrl: zod_1.z.string().url('Invalid cover image URL').optional(),
    phoneNumber: zod_1.z.string().optional(),
    timezone: zod_1.z.string().optional(),
    language: zod_1.z.string().optional(),
    theme: zod_1.z.string().optional()
});
// First Sign In Response Schema
exports.FirstSignInResponseSchema = zod_1.z.object({
    isFirstSignIn: zod_1.z.boolean()
});
// Role Permissions Schema
exports.RolePermissionsSchema = zod_1.z.object({
    canAccessAdminPanel: zod_1.z.boolean(),
    canManageUsers: zod_1.z.boolean(),
    canManageTherapists: zod_1.z.boolean(),
    canModerateContent: zod_1.z.boolean(),
    canCreateWorksheets: zod_1.z.boolean(),
    canAssignWorksheets: zod_1.z.boolean()
});
// User Registration DTOs (JWT Authentication)
exports.RegisterClientDtoSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(8, 'Password must be at least 8 characters long'),
    firstName: zod_1.z.string().min(1, 'First name is required'),
    middleName: zod_1.z.string().optional(),
    lastName: zod_1.z.string().min(1, 'Last name is required'),
    birthDate: zod_1.z.string().datetime().optional(),
    address: zod_1.z.string().optional(),
    bio: zod_1.z.string().max(500, 'Bio must not exceed 500 characters').optional(),
    avatarUrl: zod_1.z.string().url().optional(),
    coverImageUrl: zod_1.z.string().url().optional(),
    phoneNumber: zod_1.z.string().optional(),
    timezone: zod_1.z.string().optional(),
    language: zod_1.z.string().optional(),
    theme: zod_1.z.string().optional(),
    hasSeenTherapistRecommendations: zod_1.z.boolean().optional(),
    preassessmentAnswers: zod_1.z.array(zod_1.z.any()).optional()
});
exports.UpdateClientDtoSchema = exports.RegisterClientDtoSchema.partial().omit({
    password: true
});
// Note: Therapist registration schemas are now in therapist.ts to avoid conflicts
// User Deactivation Schemas (updated from class-validator DTO)
exports.DeactivateUserDtoSchema = zod_1.z.object({
    reason: zod_1.z.string().max(500, 'Reason must not exceed 500 characters').optional()
});
exports.UserDeactivationResponseDtoSchema = zod_1.z.object({
    message: zod_1.z.string(),
    deactivatedAt: zod_1.z.string().datetime(),
    reason: zod_1.z.string().optional(),
    deactivatedBy: zod_1.z.string().optional()
});
// Admin Registration Schema
exports.RegisterAdminDtoSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(8, 'Password must be at least 8 characters long'),
    firstName: zod_1.z.string().min(1, 'First name is required'),
    lastName: zod_1.z.string().min(1, 'Last name is required'),
    adminLevel: zod_1.z.string().optional(),
    permissions: zod_1.z.array(zod_1.z.string()).optional()
});
// Moderator Registration Schema
exports.RegisterModeratorDtoSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(8, 'Password must be at least 8 characters long'),
    firstName: zod_1.z.string().min(1, 'First name is required'),
    lastName: zod_1.z.string().min(1, 'Last name is required'),
    permissions: zod_1.z.array(zod_1.z.string()).optional(),
    assignedCommunities: zod_1.z.array(zod_1.z.string()).optional()
});
// Authentication Schemas for Phase 3A
exports.LoginDtoSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(1, 'Password is required')
});
exports.RefreshTokenDtoSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1, 'Refresh token is required')
});
exports.ChangePasswordDtoSchema = zod_1.z.object({
    currentPassword: zod_1.z.string().min(1, 'Current password is required'),
    newPassword: zod_1.z.string().min(8, 'New password must be at least 8 characters long')
});
// General User Registration Schema (supports both client and therapist roles)
exports.RegisterUserDtoSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(8, 'Password must be at least 8 characters long'),
    firstName: zod_1.z.string().min(1, 'First name is required'),
    lastName: zod_1.z.string().min(1, 'Last name is required'),
    role: exports.UserRoleSchema.optional()
});
// Logout Request Schema
exports.LogoutDtoSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1, 'Refresh token is required')
});
// User ID Parameter Schema
exports.UserIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('Invalid user ID format')
});
// Password Reset Schemas
exports.RequestPasswordResetDtoSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format')
});
exports.ResetPasswordDtoSchema = zod_1.z.object({
    token: zod_1.z.string().min(1, 'Reset token is required'),
    newPassword: zod_1.z.string().min(8, 'New password must be at least 8 characters long'),
    confirmPassword: zod_1.z.string().min(8, 'Confirm password must be at least 8 characters long')
});
// Email Verification Schemas
exports.SendVerificationEmailDtoSchema = zod_1.z.object({
    userId: zod_1.z.string().uuid('Invalid user ID format')
});
exports.ResendVerificationEmailDtoSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format')
});
exports.VerifyEmailDtoSchema = zod_1.z.object({
    token: zod_1.z.string().min(1, 'Verification token is required')
});
// Utility schemas for specific use cases
exports.UserIdSchema = zod_1.z.string().min(1, 'User ID is required');
exports.EmailSchema = zod_1.z.string().email('Invalid email format');
// ===== RESPONSE DTO SCHEMAS =====
// Standard API Response Wrapper
const ApiResponseSchema = (dataSchema) => zod_1.z.object({
    success: zod_1.z.boolean(),
    data: dataSchema.optional(),
    message: zod_1.z.string().optional(),
    errors: zod_1.z.array(zod_1.z.object({
        field: zod_1.z.string().optional(),
        code: zod_1.z.string(),
        message: zod_1.z.string()
    })).optional()
});
exports.ApiResponseSchema = ApiResponseSchema;
// Pagination Meta Schema
exports.PaginationMetaSchema = zod_1.z.object({
    page: zod_1.z.number().int().positive(),
    limit: zod_1.z.number().int().positive(),
    total: zod_1.z.number().int().nonnegative(),
    totalPages: zod_1.z.number().int().nonnegative(),
    hasNextPage: zod_1.z.boolean(),
    hasPreviousPage: zod_1.z.boolean()
});
// Paginated Response Schema
const PaginatedResponseSchema = (dataSchema) => zod_1.z.object({
    success: zod_1.z.boolean(),
    data: zod_1.z.array(dataSchema),
    pagination: exports.PaginationMetaSchema,
    message: zod_1.z.string().optional(),
    errors: zod_1.z.array(zod_1.z.object({
        field: zod_1.z.string().optional(),
        code: zod_1.z.string(),
        message: zod_1.z.string()
    })).optional()
});
exports.PaginatedResponseSchema = PaginatedResponseSchema;
// User Response Schema (for public API responses)
exports.UserResponseSchema = zod_1.z.object({
    id: zod_1.z.string().min(1, 'User ID is required'),
    email: zod_1.z.string().email('Invalid email format'),
    firstName: zod_1.z.string().optional(),
    middleName: zod_1.z.string().optional(),
    lastName: zod_1.z.string().optional(),
    birthDate: zod_1.z.string().datetime().optional(),
    address: zod_1.z.string().optional(),
    role: exports.UserRoleSchema,
    bio: zod_1.z.string().optional(),
    avatarUrl: zod_1.z.string().url().optional(),
    coverImageUrl: zod_1.z.string().url().optional(),
    phoneNumber: zod_1.z.string().optional(),
    timezone: zod_1.z.string().optional(),
    language: zod_1.z.string().optional(),
    theme: zod_1.z.string().optional(),
    isActive: zod_1.z.boolean().optional(),
    isVerified: zod_1.z.boolean().optional(),
    emailVerified: zod_1.z.boolean().optional(),
    lastLoginAt: zod_1.z.string().datetime().optional(),
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime()
});
// User Profile Response Schema (more detailed for profile endpoints)
exports.UserProfileResponseSchema = exports.UserResponseSchema.extend({
    fullName: zod_1.z.string().optional()
});
// Authentication Response Schema
exports.AuthResponseSchema = zod_1.z.object({
    user: exports.UserResponseSchema,
    token: zod_1.z.string(),
    message: zod_1.z.string()
});
// Success Message Response Schema
exports.SuccessMessageResponseSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    message: zod_1.z.string()
});
//# sourceMappingURL=user.js.map