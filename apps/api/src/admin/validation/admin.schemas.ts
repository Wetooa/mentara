import { z } from 'zod';
import { UserRole } from '../../types/enums';

export const AdminUpdateUserDtoSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  role: z.nativeEnum(UserRole).optional(),
  isActive: z.boolean().optional(),
  bio: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  phoneNumber: z.string().optional(),
  dateOfBirth: z.coerce.date().optional(),
  gender: z.string().optional(),
  location: z.string().optional(),
});

export const AdminUserQuerySchema = z.object({
  search: z.string().optional(),
  role: z.nativeEnum(UserRole).optional(),
  isActive: z.coerce.boolean().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export const AdminUpdateTherapistDtoSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED']).optional(),
  areasOfExpertise: z.array(z.string()).optional(),
  hourlyRate: z.number().positive().optional(),
  yearsOfExperience: z.number().int().min(0).optional(),
  licenseNumber: z.string().optional(),
  licenseType: z.string().optional(),
  education: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  province: z.string().optional(),
  city: z.string().optional(),
  timezone: z.string().optional(),
  profileSummary: z.string().optional(),
});

export const AdminTherapistQuerySchema = z.object({
  search: z.string().optional(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED']).optional(),
  specialties: z.array(z.string()).optional(),
  location: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export const CreateAdminAccountDtoSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.enum(['admin', 'moderator']),
});

export const CreateAdminDtoSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.enum(['admin', 'moderator']),
});

export const UpdateAdminDtoSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  role: z.enum(['admin', 'moderator']).optional(),
  isActive: z.boolean().optional(),
});

export const AdminAccountQuerySchema = z.object({
  search: z.string().optional(),
  role: z.enum(['admin', 'moderator']).optional(),
  isActive: z.coerce.boolean().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

// Additional admin therapist validation schemas
export const ApproveTherapistDtoSchema = z.object({
  reason: z.string().optional(),
  welcomeMessage: z.string().optional(),
});

export const RejectTherapistDtoSchema = z.object({
  reason: z.string().min(1, 'Reason is required'),
  rejectionMessage: z.string().optional(),
});

export const UpdateTherapistStatusDtoSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED']),
  reason: z.string().optional(),
  notes: z.string().optional(),
});

export const TherapistFiltersDtoSchema = z.object({
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED']).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});
