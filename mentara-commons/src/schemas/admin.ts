import { z } from 'zod';

// Admin Creation and Update Schemas
export const CreateAdminDtoSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  permissions: z.array(z.string()).optional(),
  adminLevel: z.string().optional()
});

export const UpdateAdminDtoSchema = z.object({
  permissions: z.array(z.string()).optional(),
  adminLevel: z.string().optional()
});

// Admin Response Schema (updated from class-validator interface)
export const AdminResponseDtoSchema = z.object({
  userId: z.string(),
  permissions: z.array(z.string()).optional(),
  adminLevel: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});

// Admin Query Parameters
export const AdminQuerySchema = z.object({
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  adminLevel: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'adminLevel']).optional()
});

// Admin ID Parameter Schema
export const AdminIdParamSchema = z.object({
  id: z.string().uuid('Invalid admin ID format')
});

// Admin Therapist Management Schemas
export const ApproveTherapistDtoSchema = z.object({
  approvalMessage: z.string().min(10, 'Approval message must be at least 10 characters').optional(),
  verifyLicense: z.boolean().default(false),
  grantSpecialPermissions: z.array(z.string()).optional(),
});

export const RejectTherapistDtoSchema = z.object({
  rejectionReason: z.enum([
    'incomplete_documentation',
    'invalid_license',
    'failed_verification',
    'policy_violation',
    'other'
  ]),
  rejectionMessage: z.string().min(20, 'Rejection message must be at least 20 characters'),
  allowReapplication: z.boolean().default(true),
});

export const UpdateTherapistStatusDtoSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'suspended', 'under_review']),
  reason: z.string().min(10, 'Status change reason required').optional(),
});

export const PendingTherapistFiltersDtoSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'suspended']).optional(),
  province: z.string().optional(),
  submittedAfter: z.string().datetime().optional(),
  processedBy: z.string().optional(),
  providerType: z.string().optional(),
  limit: z.number().min(1).max(100).default(50),
});

// Export type inference helpers
export type CreateAdminDto = z.infer<typeof CreateAdminDtoSchema>;
export type UpdateAdminDto = z.infer<typeof UpdateAdminDtoSchema>;
export type AdminResponseDto = z.infer<typeof AdminResponseDtoSchema>;
export type AdminQuery = z.infer<typeof AdminQuerySchema>;
export type AdminIdParam = z.infer<typeof AdminIdParamSchema>;

// Admin Therapist Management Types
export type ApproveTherapistDto = z.infer<typeof ApproveTherapistDtoSchema>;
export type RejectTherapistDto = z.infer<typeof RejectTherapistDtoSchema>;
export type UpdateTherapistStatusDto = z.infer<typeof UpdateTherapistStatusDtoSchema>;
export type PendingTherapistFiltersDto = z.infer<typeof PendingTherapistFiltersDtoSchema>;