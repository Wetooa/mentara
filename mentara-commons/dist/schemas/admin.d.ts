import { z } from 'zod';
export declare const CreateAdminDtoSchema: z.ZodObject<{
    userId: z.ZodString;
    permissions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    adminLevel: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    userId: string;
    adminLevel?: string | undefined;
    permissions?: string[] | undefined;
}, {
    userId: string;
    adminLevel?: string | undefined;
    permissions?: string[] | undefined;
}>;
export declare const UpdateAdminDtoSchema: z.ZodObject<{
    permissions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    adminLevel: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    adminLevel?: string | undefined;
    permissions?: string[] | undefined;
}, {
    adminLevel?: string | undefined;
    permissions?: string[] | undefined;
}>;
export declare const AdminResponseDtoSchema: z.ZodObject<{
    userId: z.ZodString;
    permissions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    adminLevel: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    adminLevel?: string | undefined;
    permissions?: string[] | undefined;
}, {
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    adminLevel?: string | undefined;
    permissions?: string[] | undefined;
}>;
export declare const AdminQuerySchema: z.ZodObject<{
    page: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
    adminLevel: z.ZodOptional<z.ZodString>;
    sortBy: z.ZodOptional<z.ZodEnum<["createdAt", "updatedAt", "adminLevel"]>>;
}, "strip", z.ZodTypeAny, {
    adminLevel?: string | undefined;
    limit?: number | undefined;
    page?: number | undefined;
    sortBy?: "createdAt" | "updatedAt" | "adminLevel" | undefined;
}, {
    adminLevel?: string | undefined;
    limit?: number | undefined;
    page?: number | undefined;
    sortBy?: "createdAt" | "updatedAt" | "adminLevel" | undefined;
}>;
export declare const AdminUserQuerySchema: z.ZodObject<{
    role: z.ZodOptional<z.ZodEnum<["client", "therapist", "moderator", "admin"]>>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    search: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["active", "inactive", "suspended"]>>;
    sortBy: z.ZodDefault<z.ZodEnum<["createdAt", "firstName", "lastName", "email", "role"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
    sortBy: "email" | "firstName" | "lastName" | "role" | "createdAt";
    sortOrder: "asc" | "desc";
    role?: "client" | "therapist" | "moderator" | "admin" | undefined;
    status?: "active" | "inactive" | "suspended" | undefined;
    search?: string | undefined;
}, {
    role?: "client" | "therapist" | "moderator" | "admin" | undefined;
    status?: "active" | "inactive" | "suspended" | undefined;
    limit?: number | undefined;
    page?: number | undefined;
    sortBy?: "email" | "firstName" | "lastName" | "role" | "createdAt" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    search?: string | undefined;
}>;
export declare const AdminIdParamSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const ApproveTherapistDtoSchema: z.ZodObject<{
    approvalMessage: z.ZodOptional<z.ZodString>;
    verifyLicense: z.ZodDefault<z.ZodBoolean>;
    grantSpecialPermissions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    verifyLicense: boolean;
    approvalMessage?: string | undefined;
    grantSpecialPermissions?: string[] | undefined;
}, {
    approvalMessage?: string | undefined;
    verifyLicense?: boolean | undefined;
    grantSpecialPermissions?: string[] | undefined;
}>;
export declare const RejectTherapistDtoSchema: z.ZodObject<{
    rejectionReason: z.ZodEnum<["incomplete_documentation", "invalid_license", "failed_verification", "policy_violation", "other"]>;
    rejectionMessage: z.ZodString;
    allowReapplication: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    rejectionReason: "other" | "incomplete_documentation" | "invalid_license" | "failed_verification" | "policy_violation";
    rejectionMessage: string;
    allowReapplication: boolean;
}, {
    rejectionReason: "other" | "incomplete_documentation" | "invalid_license" | "failed_verification" | "policy_violation";
    rejectionMessage: string;
    allowReapplication?: boolean | undefined;
}>;
export declare const UpdateTherapistStatusDtoSchema: z.ZodObject<{
    status: z.ZodEnum<["pending", "approved", "rejected", "suspended", "under_review"]>;
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "pending" | "under_review" | "approved" | "rejected" | "suspended";
    reason?: string | undefined;
}, {
    status: "pending" | "under_review" | "approved" | "rejected" | "suspended";
    reason?: string | undefined;
}>;
export declare const PendingTherapistFiltersDtoSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["pending", "approved", "rejected", "suspended"]>>;
    province: z.ZodOptional<z.ZodString>;
    submittedAfter: z.ZodOptional<z.ZodString>;
    processedBy: z.ZodOptional<z.ZodString>;
    providerType: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    status?: "pending" | "approved" | "rejected" | "suspended" | undefined;
    province?: string | undefined;
    providerType?: string | undefined;
    submittedAfter?: string | undefined;
    processedBy?: string | undefined;
}, {
    status?: "pending" | "approved" | "rejected" | "suspended" | undefined;
    province?: string | undefined;
    providerType?: string | undefined;
    limit?: number | undefined;
    submittedAfter?: string | undefined;
    processedBy?: string | undefined;
}>;
export type CreateAdminDto = z.infer<typeof CreateAdminDtoSchema>;
export type UpdateAdminDto = z.infer<typeof UpdateAdminDtoSchema>;
export type AdminResponseDto = z.infer<typeof AdminResponseDtoSchema>;
export type AdminQuery = z.infer<typeof AdminQuerySchema>;
export type AdminUserQuery = z.infer<typeof AdminUserQuerySchema>;
export type AdminIdParam = z.infer<typeof AdminIdParamSchema>;
export declare const AdminAnalyticsQuerySchema: z.ZodObject<{
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    startDate?: string | undefined;
    endDate?: string | undefined;
}, {
    startDate?: string | undefined;
    endDate?: string | undefined;
}>;
export type ApproveTherapistDto = z.infer<typeof ApproveTherapistDtoSchema>;
export type RejectTherapistDto = z.infer<typeof RejectTherapistDtoSchema>;
export type UpdateTherapistStatusDto = z.infer<typeof UpdateTherapistStatusDtoSchema>;
export type PendingTherapistFiltersDto = z.infer<typeof PendingTherapistFiltersDtoSchema>;
export type AdminAnalyticsQuery = z.infer<typeof AdminAnalyticsQuerySchema>;
//# sourceMappingURL=admin.d.ts.map