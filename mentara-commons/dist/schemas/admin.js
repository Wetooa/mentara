"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PendingTherapistFiltersDtoSchema = exports.UpdateTherapistStatusDtoSchema = exports.RejectTherapistDtoSchema = exports.ApproveTherapistDtoSchema = exports.AdminIdParamSchema = exports.AdminQuerySchema = exports.AdminResponseDtoSchema = exports.UpdateAdminDtoSchema = exports.CreateAdminDtoSchema = void 0;
const zod_1 = require("zod");
// Admin Creation and Update Schemas
exports.CreateAdminDtoSchema = zod_1.z.object({
    userId: zod_1.z.string().min(1, 'User ID is required'),
    permissions: zod_1.z.array(zod_1.z.string()).optional(),
    adminLevel: zod_1.z.string().optional()
});
exports.UpdateAdminDtoSchema = zod_1.z.object({
    permissions: zod_1.z.array(zod_1.z.string()).optional(),
    adminLevel: zod_1.z.string().optional()
});
// Admin Response Schema (updated from class-validator interface)
exports.AdminResponseDtoSchema = zod_1.z.object({
    userId: zod_1.z.string(),
    permissions: zod_1.z.array(zod_1.z.string()).optional(),
    adminLevel: zod_1.z.string().optional(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date()
});
// Admin Query Parameters
exports.AdminQuerySchema = zod_1.z.object({
    page: zod_1.z.number().min(1).optional(),
    limit: zod_1.z.number().min(1).max(100).optional(),
    adminLevel: zod_1.z.string().optional(),
    sortBy: zod_1.z.enum(['createdAt', 'updatedAt', 'adminLevel']).optional()
});
// Admin ID Parameter Schema
exports.AdminIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('Invalid admin ID format')
});
// Admin Therapist Management Schemas
exports.ApproveTherapistDtoSchema = zod_1.z.object({
    approvalMessage: zod_1.z.string().min(10, 'Approval message must be at least 10 characters').optional(),
    verifyLicense: zod_1.z.boolean().default(false),
    grantSpecialPermissions: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.RejectTherapistDtoSchema = zod_1.z.object({
    rejectionReason: zod_1.z.enum([
        'incomplete_documentation',
        'invalid_license',
        'failed_verification',
        'policy_violation',
        'other'
    ]),
    rejectionMessage: zod_1.z.string().min(20, 'Rejection message must be at least 20 characters'),
    allowReapplication: zod_1.z.boolean().default(true),
});
exports.UpdateTherapistStatusDtoSchema = zod_1.z.object({
    status: zod_1.z.enum(['pending', 'approved', 'rejected', 'suspended', 'under_review']),
    reason: zod_1.z.string().min(10, 'Status change reason required').optional(),
});
exports.PendingTherapistFiltersDtoSchema = zod_1.z.object({
    status: zod_1.z.enum(['pending', 'approved', 'rejected', 'suspended']).optional(),
    province: zod_1.z.string().optional(),
    submittedAfter: zod_1.z.string().datetime().optional(),
    processedBy: zod_1.z.string().optional(),
    providerType: zod_1.z.string().optional(),
    limit: zod_1.z.number().min(1).max(100).default(50),
});
//# sourceMappingURL=admin.js.map