"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailSchema = exports.UserIdSchema = exports.UserDeactivationResponseDtoSchema = exports.DeactivateUserDtoSchema = exports.UpdateTherapistDtoSchema = exports.RegisterTherapistDtoSchema = exports.UpdateClientDtoSchema = exports.RegisterClientDtoSchema = exports.RolePermissionsSchema = exports.FirstSignInResponseSchema = exports.UpdateUserRequestSchema = exports.CreateUserRequestSchema = exports.UserSchema = exports.UserRoleSchema = void 0;
const zod_1 = require("zod");
// User Role Enum Schema
exports.UserRoleSchema = zod_1.z.enum([
    'client', // Regular user/patient (frontend standard)
    'user', // Regular user/patient (backend standard)  
    'therapist', // Licensed therapist
    'moderator', // Content moderator
    'admin' // System administrator
]);
// Core User Schema
exports.UserSchema = zod_1.z.object({
    id: zod_1.z.string().min(1, 'User ID is required'),
    email: zod_1.z.string().email('Invalid email format'),
    firstName: zod_1.z.string().optional(),
    lastName: zod_1.z.string().optional(),
    role: exports.UserRoleSchema,
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime()
});
// Create User Request Schema
exports.CreateUserRequestSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    firstName: zod_1.z.string().min(1, 'First name is required').optional(),
    lastName: zod_1.z.string().min(1, 'Last name is required').optional(),
    role: exports.UserRoleSchema.optional()
});
// Update User Request Schema
exports.UpdateUserRequestSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(1, 'First name cannot be empty').optional(),
    lastName: zod_1.z.string().min(1, 'Last name cannot be empty').optional(),
    email: zod_1.z.string().email('Invalid email format').optional()
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
// User Registration DTOs (Backend specific)
exports.RegisterClientDtoSchema = zod_1.z.object({
    userId: zod_1.z.string().min(1, 'User ID is required'), // Clerk user ID
    email: zod_1.z.string().email('Invalid email format'),
    firstName: zod_1.z.string().min(1, 'First name is required'),
    middleName: zod_1.z.string().optional(),
    lastName: zod_1.z.string().min(1, 'Last name is required'),
    birthDate: zod_1.z.string().datetime().optional(),
    address: zod_1.z.string().optional(),
    avatarUrl: zod_1.z.string().url().optional(),
    hasSeenTherapistRecommendations: zod_1.z.boolean().optional()
});
exports.UpdateClientDtoSchema = exports.RegisterClientDtoSchema.partial().omit({
    userId: true
});
// Therapist Registration Schema
exports.RegisterTherapistDtoSchema = zod_1.z.object({
    userId: zod_1.z.string().min(1, 'User ID is required'), // Clerk user ID
    email: zod_1.z.string().email('Invalid email format'),
    firstName: zod_1.z.string().min(1, 'First name is required'),
    middleName: zod_1.z.string().optional(),
    lastName: zod_1.z.string().min(1, 'Last name is required'),
    title: zod_1.z.string().min(1, 'Professional title is required'),
    hourlyRate: zod_1.z.number().min(0, 'Hourly rate must be positive').optional(),
    experienceYears: zod_1.z.number().min(0, 'Experience years must be positive').optional(),
    province: zod_1.z.string().min(1, 'Province is required').optional(),
    specialties: zod_1.z.array(zod_1.z.string()).optional(),
    bio: zod_1.z.string().optional(),
    profileImage: zod_1.z.string().url().optional(),
    licenseNumber: zod_1.z.string().optional(),
    licenseType: zod_1.z.string().optional(),
    isVerified: zod_1.z.boolean().default(false)
});
exports.UpdateTherapistDtoSchema = exports.RegisterTherapistDtoSchema.partial().omit({
    userId: true
});
// User Deactivation Schemas
exports.DeactivateUserDtoSchema = zod_1.z.object({
    reason: zod_1.z.string().min(1, 'Deactivation reason is required'),
    notifyUser: zod_1.z.boolean().default(true)
});
exports.UserDeactivationResponseDtoSchema = zod_1.z.object({
    id: zod_1.z.string(),
    isActive: zod_1.z.boolean(),
    deactivatedAt: zod_1.z.string().datetime().nullable(),
    deactivationReason: zod_1.z.string().nullable()
});
// Utility schemas for specific use cases
exports.UserIdSchema = zod_1.z.string().min(1, 'User ID is required');
exports.EmailSchema = zod_1.z.string().email('Invalid email format');
//# sourceMappingURL=user.js.map