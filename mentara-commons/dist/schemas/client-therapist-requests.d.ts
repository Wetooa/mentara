import { z } from 'zod';
export declare const ClientRequestStatusSchema: z.ZodEnum<["PENDING", "ACCEPTED", "DECLINED", "EXPIRED", "CANCELLED", "WITHDRAWN"]>;
export declare const RequestPrioritySchema: z.ZodEnum<["LOW", "NORMAL", "HIGH", "URGENT"]>;
export declare const SendTherapistRequestDtoSchema: z.ZodObject<{
    message: z.ZodOptional<z.ZodString>;
    priority: z.ZodDefault<z.ZodEnum<["LOW", "NORMAL", "HIGH", "URGENT"]>>;
    recommendationRank: z.ZodOptional<z.ZodNumber>;
    matchScore: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
    message?: string | undefined;
    matchScore?: number | undefined;
    recommendationRank?: number | undefined;
}, {
    message?: string | undefined;
    matchScore?: number | undefined;
    priority?: "LOW" | "NORMAL" | "HIGH" | "URGENT" | undefined;
    recommendationRank?: number | undefined;
}>;
export declare const SendMultipleTherapistRequestsDtoSchema: z.ZodObject<{
    therapistIds: z.ZodArray<z.ZodString, "many">;
    message: z.ZodOptional<z.ZodString>;
    priority: z.ZodDefault<z.ZodEnum<["LOW", "NORMAL", "HIGH", "URGENT"]>>;
}, "strip", z.ZodTypeAny, {
    priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
    therapistIds: string[];
    message?: string | undefined;
}, {
    therapistIds: string[];
    message?: string | undefined;
    priority?: "LOW" | "NORMAL" | "HIGH" | "URGENT" | undefined;
}>;
export declare const ClientRequestFiltersDtoSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["PENDING", "ACCEPTED", "DECLINED", "EXPIRED", "CANCELLED", "WITHDRAWN"]>>;
    priority: z.ZodOptional<z.ZodEnum<["LOW", "NORMAL", "HIGH", "URGENT"]>>;
    therapistId: z.ZodOptional<z.ZodString>;
    requestedAfter: z.ZodOptional<z.ZodString>;
    requestedBefore: z.ZodOptional<z.ZodString>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    sortBy: z.ZodDefault<z.ZodEnum<["requestedAt", "respondedAt", "priority", "status"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
    sortBy: "status" | "priority" | "requestedAt" | "respondedAt";
    sortOrder: "asc" | "desc";
    status?: "PENDING" | "ACCEPTED" | "DECLINED" | "EXPIRED" | "CANCELLED" | "WITHDRAWN" | undefined;
    therapistId?: string | undefined;
    priority?: "LOW" | "NORMAL" | "HIGH" | "URGENT" | undefined;
    requestedAfter?: string | undefined;
    requestedBefore?: string | undefined;
}, {
    status?: "PENDING" | "ACCEPTED" | "DECLINED" | "EXPIRED" | "CANCELLED" | "WITHDRAWN" | undefined;
    limit?: number | undefined;
    page?: number | undefined;
    sortBy?: "status" | "priority" | "requestedAt" | "respondedAt" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    therapistId?: string | undefined;
    priority?: "LOW" | "NORMAL" | "HIGH" | "URGENT" | undefined;
    requestedAfter?: string | undefined;
    requestedBefore?: string | undefined;
}>;
export declare const CancelClientRequestDtoSchema: z.ZodObject<{
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    reason?: string | undefined;
}, {
    reason?: string | undefined;
}>;
export declare const TherapistRequestResponseDtoSchema: z.ZodObject<{
    response: z.ZodString;
    schedulingMessage: z.ZodOptional<z.ZodString>;
    acceptNewClients: z.ZodDefault<z.ZodBoolean>;
    preferredContactMethod: z.ZodDefault<z.ZodEnum<["platform", "email", "phone"]>>;
}, "strip", z.ZodTypeAny, {
    response: string;
    acceptNewClients: boolean;
    preferredContactMethod: "email" | "phone" | "platform";
    schedulingMessage?: string | undefined;
}, {
    response: string;
    schedulingMessage?: string | undefined;
    acceptNewClients?: boolean | undefined;
    preferredContactMethod?: "email" | "phone" | "platform" | undefined;
}>;
export declare const TherapistRequestFiltersDtoSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["PENDING", "ACCEPTED", "DECLINED", "EXPIRED", "CANCELLED", "WITHDRAWN"]>>;
    priority: z.ZodOptional<z.ZodEnum<["LOW", "NORMAL", "HIGH", "URGENT"]>>;
    clientId: z.ZodOptional<z.ZodString>;
    requestedAfter: z.ZodOptional<z.ZodString>;
    requestedBefore: z.ZodOptional<z.ZodString>;
    respondedAfter: z.ZodOptional<z.ZodString>;
    respondedBefore: z.ZodOptional<z.ZodString>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    sortBy: z.ZodDefault<z.ZodEnum<["requestedAt", "respondedAt", "priority", "status"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
    includeExpired: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
    sortBy: "status" | "priority" | "requestedAt" | "respondedAt";
    sortOrder: "asc" | "desc";
    includeExpired: boolean;
    status?: "PENDING" | "ACCEPTED" | "DECLINED" | "EXPIRED" | "CANCELLED" | "WITHDRAWN" | undefined;
    clientId?: string | undefined;
    priority?: "LOW" | "NORMAL" | "HIGH" | "URGENT" | undefined;
    requestedAfter?: string | undefined;
    requestedBefore?: string | undefined;
    respondedAfter?: string | undefined;
    respondedBefore?: string | undefined;
}, {
    status?: "PENDING" | "ACCEPTED" | "DECLINED" | "EXPIRED" | "CANCELLED" | "WITHDRAWN" | undefined;
    limit?: number | undefined;
    page?: number | undefined;
    sortBy?: "status" | "priority" | "requestedAt" | "respondedAt" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    clientId?: string | undefined;
    priority?: "LOW" | "NORMAL" | "HIGH" | "URGENT" | undefined;
    requestedAfter?: string | undefined;
    requestedBefore?: string | undefined;
    respondedAfter?: string | undefined;
    respondedBefore?: string | undefined;
    includeExpired?: boolean | undefined;
}>;
export declare const BulkTherapistActionDtoSchema: z.ZodObject<{
    requestIds: z.ZodArray<z.ZodString, "many">;
    action: z.ZodEnum<["accept", "decline", "mark_reviewed"]>;
    response: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    action: "accept" | "decline" | "mark_reviewed";
    requestIds: string[];
    response?: string | undefined;
}, {
    action: "accept" | "decline" | "mark_reviewed";
    requestIds: string[];
    response?: string | undefined;
}>;
export declare const ClientRequestResponseSchema: z.ZodObject<{
    id: z.ZodString;
    clientId: z.ZodString;
    therapistId: z.ZodString;
    status: z.ZodEnum<["PENDING", "ACCEPTED", "DECLINED", "EXPIRED", "CANCELLED", "WITHDRAWN"]>;
    priority: z.ZodEnum<["LOW", "NORMAL", "HIGH", "URGENT"]>;
    requestedAt: z.ZodDate;
    respondedAt: z.ZodNullable<z.ZodDate>;
    expiresAt: z.ZodNullable<z.ZodDate>;
    clientMessage: z.ZodNullable<z.ZodString>;
    therapistResponse: z.ZodNullable<z.ZodString>;
    recommendationRank: z.ZodNullable<z.ZodNumber>;
    matchScore: z.ZodNullable<z.ZodNumber>;
    therapist: z.ZodOptional<z.ZodObject<{
        userId: z.ZodString;
        user: z.ZodObject<{
            firstName: z.ZodString;
            lastName: z.ZodString;
            avatarUrl: z.ZodNullable<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
        }, {
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
        }>;
        specializations: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        averageRating: z.ZodNullable<z.ZodNumber>;
        hourlyRate: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        user: {
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
        };
        hourlyRate: number;
        userId: string;
        averageRating: number | null;
        specializations?: string[] | undefined;
    }, {
        user: {
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
        };
        hourlyRate: number;
        userId: string;
        averageRating: number | null;
        specializations?: string[] | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    status: "PENDING" | "ACCEPTED" | "DECLINED" | "EXPIRED" | "CANCELLED" | "WITHDRAWN";
    matchScore: number | null;
    therapistId: string;
    clientId: string;
    priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
    recommendationRank: number | null;
    requestedAt: Date;
    respondedAt: Date | null;
    expiresAt: Date | null;
    clientMessage: string | null;
    therapistResponse: string | null;
    therapist?: {
        user: {
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
        };
        hourlyRate: number;
        userId: string;
        averageRating: number | null;
        specializations?: string[] | undefined;
    } | undefined;
}, {
    id: string;
    status: "PENDING" | "ACCEPTED" | "DECLINED" | "EXPIRED" | "CANCELLED" | "WITHDRAWN";
    matchScore: number | null;
    therapistId: string;
    clientId: string;
    priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
    recommendationRank: number | null;
    requestedAt: Date;
    respondedAt: Date | null;
    expiresAt: Date | null;
    clientMessage: string | null;
    therapistResponse: string | null;
    therapist?: {
        user: {
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
        };
        hourlyRate: number;
        userId: string;
        averageRating: number | null;
        specializations?: string[] | undefined;
    } | undefined;
}>;
export declare const TherapistRequestResponseSchema: z.ZodObject<{
    id: z.ZodString;
    clientId: z.ZodString;
    therapistId: z.ZodString;
    status: z.ZodEnum<["PENDING", "ACCEPTED", "DECLINED", "EXPIRED", "CANCELLED", "WITHDRAWN"]>;
    priority: z.ZodEnum<["LOW", "NORMAL", "HIGH", "URGENT"]>;
    requestedAt: z.ZodDate;
    respondedAt: z.ZodNullable<z.ZodDate>;
    expiresAt: z.ZodNullable<z.ZodDate>;
    clientMessage: z.ZodNullable<z.ZodString>;
    therapistResponse: z.ZodNullable<z.ZodString>;
    recommendationRank: z.ZodNullable<z.ZodNumber>;
    matchScore: z.ZodNullable<z.ZodNumber>;
    client: z.ZodOptional<z.ZodObject<{
        userId: z.ZodString;
        user: z.ZodObject<{
            firstName: z.ZodString;
            lastName: z.ZodString;
            avatarUrl: z.ZodNullable<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
        }, {
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
        }>;
        hasSeenTherapistRecommendations: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        user: {
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
        };
        hasSeenTherapistRecommendations: boolean;
        userId: string;
    }, {
        user: {
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
        };
        hasSeenTherapistRecommendations: boolean;
        userId: string;
    }>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    status: "PENDING" | "ACCEPTED" | "DECLINED" | "EXPIRED" | "CANCELLED" | "WITHDRAWN";
    matchScore: number | null;
    therapistId: string;
    clientId: string;
    priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
    recommendationRank: number | null;
    requestedAt: Date;
    respondedAt: Date | null;
    expiresAt: Date | null;
    clientMessage: string | null;
    therapistResponse: string | null;
    client?: {
        user: {
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
        };
        hasSeenTherapistRecommendations: boolean;
        userId: string;
    } | undefined;
}, {
    id: string;
    status: "PENDING" | "ACCEPTED" | "DECLINED" | "EXPIRED" | "CANCELLED" | "WITHDRAWN";
    matchScore: number | null;
    therapistId: string;
    clientId: string;
    priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
    recommendationRank: number | null;
    requestedAt: Date;
    respondedAt: Date | null;
    expiresAt: Date | null;
    clientMessage: string | null;
    therapistResponse: string | null;
    client?: {
        user: {
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
        };
        hasSeenTherapistRecommendations: boolean;
        userId: string;
    } | undefined;
}>;
export declare const RequestStatisticsSchema: z.ZodObject<{
    totalSent: z.ZodNumber;
    totalReceived: z.ZodNumber;
    pending: z.ZodNumber;
    accepted: z.ZodNumber;
    declined: z.ZodNumber;
    expired: z.ZodNumber;
    cancelled: z.ZodNumber;
    acceptanceRate: z.ZodNumber;
    averageResponseTime: z.ZodNumber;
    lastRequestAt: z.ZodNullable<z.ZodDate>;
    lastResponseAt: z.ZodNullable<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    cancelled: number;
    pending: number;
    averageResponseTime: number;
    totalSent: number;
    totalReceived: number;
    accepted: number;
    declined: number;
    expired: number;
    acceptanceRate: number;
    lastRequestAt: Date | null;
    lastResponseAt: Date | null;
}, {
    cancelled: number;
    pending: number;
    averageResponseTime: number;
    totalSent: number;
    totalReceived: number;
    accepted: number;
    declined: number;
    expired: number;
    acceptanceRate: number;
    lastRequestAt: Date | null;
    lastResponseAt: Date | null;
}>;
export type SendTherapistRequestDto = z.infer<typeof SendTherapistRequestDtoSchema>;
export type SendMultipleTherapistRequestsDto = z.infer<typeof SendMultipleTherapistRequestsDtoSchema>;
export type ClientRequestFiltersDto = z.infer<typeof ClientRequestFiltersDtoSchema>;
export type CancelClientRequestDto = z.infer<typeof CancelClientRequestDtoSchema>;
export type TherapistRequestResponseDto = z.infer<typeof TherapistRequestResponseDtoSchema>;
export type TherapistRequestFiltersDto = z.infer<typeof TherapistRequestFiltersDtoSchema>;
export type BulkTherapistActionDto = z.infer<typeof BulkTherapistActionDtoSchema>;
export type ClientRequestResponse = z.infer<typeof ClientRequestResponseSchema>;
export type TherapistRequestResponse = z.infer<typeof TherapistRequestResponseSchema>;
export type RequestStatistics = z.infer<typeof RequestStatisticsSchema>;
export type ClientRequestStatus = z.infer<typeof ClientRequestStatusSchema>;
export type RequestPriority = z.infer<typeof RequestPrioritySchema>;
//# sourceMappingURL=client-therapist-requests.d.ts.map