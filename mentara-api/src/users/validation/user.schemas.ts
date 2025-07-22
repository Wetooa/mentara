/**
 * User Module Validation Schemas - Zod schemas for user operations
 * Separated from types for clean architecture
 */

import { z } from 'zod';

// Path parameter validation
export const UserIdParamSchema = z.object({
  id: z.string().uuid('Invalid user ID format'),
});

// User deactivation validation
export const DeactivateUserDtoSchema = z.object({
  reason: z
    .string()
    .min(1, 'Deactivation reason is required')
    .max(500, 'Reason must be less than 500 characters'),
});

// User update validation (comprehensive schema for profile updates)
export const UpdateUserRequestSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name cannot be empty')
    .max(50, 'First name must be less than 50 characters')
    .optional(),
  middleName: z
    .string()
    .max(50, 'Middle name must be less than 50 characters')
    .optional(),
  lastName: z
    .string()
    .min(1, 'Last name cannot be empty')
    .max(50, 'Last name must be less than 50 characters')
    .optional(),
  email: z
    .string()
    .email('Invalid email format')
    .optional(),
  phoneNumber: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
    .optional(),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Birth date must be in YYYY-MM-DD format')
    .optional(),
  address: z
    .string()
    .max(200, 'Address must be less than 200 characters')
    .optional(),
  bio: z
    .string()
    .max(1000, 'Bio must be less than 1000 characters')
    .optional(),
  avatarUrl: z
    .string()
    .url('Invalid avatar URL')
    .optional(),
  coverImageUrl: z
    .string()
    .url('Invalid cover image URL')
    .optional(),
  timezone: z
    .string()
    .max(50, 'Timezone must be less than 50 characters')
    .optional(),
  language: z
    .string()
    .max(10, 'Language must be less than 10 characters')
    .optional(),
  theme: z
    .enum(['light', 'dark', 'system'])
    .optional(),
  isActive: z
    .boolean()
    .optional(),
  role: z
    .enum(['client', 'therapist', 'moderator', 'admin'])
    .optional(),
}).strict();