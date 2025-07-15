import { z } from 'zod';
export declare const MeetingParamsDtoSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const UpdateMeetingStatusDtoSchema: z.ZodObject<{
    status: z.ZodEnum<["scheduled", "confirmed", "in_progress", "completed", "cancelled", "no_show"]>;
    reason: z.ZodOptional<z.ZodString>;
    notifyParticipants: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    status: "cancelled" | "scheduled" | "confirmed" | "completed" | "in_progress" | "no_show";
    notifyParticipants: boolean;
    reason?: string | undefined;
}, {
    status: "cancelled" | "scheduled" | "confirmed" | "completed" | "in_progress" | "no_show";
    reason?: string | undefined;
    notifyParticipants?: boolean | undefined;
}>;
export declare const GetUpcomingMeetingsQueryDtoSchema: z.ZodObject<{
    userId: z.ZodOptional<z.ZodString>;
    therapistId: z.ZodOptional<z.ZodString>;
    clientId: z.ZodOptional<z.ZodString>;
    days: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    includeDetails: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    days: number;
    includeDetails: boolean;
    userId?: string | undefined;
    therapistId?: string | undefined;
    clientId?: string | undefined;
}, {
    userId?: string | undefined;
    limit?: number | undefined;
    therapistId?: string | undefined;
    clientId?: string | undefined;
    days?: number | undefined;
    includeDetails?: boolean | undefined;
}>;
export declare const SaveMeetingSessionDtoSchema: z.ZodObject<{
    sessionData: z.ZodObject<{
        duration: z.ZodNumber;
        startedAt: z.ZodString;
        endedAt: z.ZodString;
        participantCount: z.ZodNumber;
        quality: z.ZodOptional<z.ZodEnum<["excellent", "good", "fair", "poor"]>>;
        issues: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        duration: number;
        startedAt: string;
        endedAt: string;
        participantCount: number;
        issues?: string[] | undefined;
        quality?: "excellent" | "good" | "poor" | "fair" | undefined;
    }, {
        duration: number;
        startedAt: string;
        endedAt: string;
        participantCount: number;
        issues?: string[] | undefined;
        quality?: "excellent" | "good" | "poor" | "fair" | undefined;
    }>;
    sessionNotes: z.ZodOptional<z.ZodString>;
    clientProgress: z.ZodOptional<z.ZodObject<{
        mood: z.ZodOptional<z.ZodEnum<["excellent", "good", "neutral", "poor", "critical"]>>;
        engagement: z.ZodOptional<z.ZodEnum<["high", "medium", "low"]>>;
        goals: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        outcomes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        engagement?: "low" | "medium" | "high" | undefined;
        mood?: "critical" | "excellent" | "good" | "neutral" | "poor" | undefined;
        goals?: string[] | undefined;
        outcomes?: string[] | undefined;
    }, {
        engagement?: "low" | "medium" | "high" | undefined;
        mood?: "critical" | "excellent" | "good" | "neutral" | "poor" | undefined;
        goals?: string[] | undefined;
        outcomes?: string[] | undefined;
    }>>;
    followUpActions: z.ZodOptional<z.ZodArray<z.ZodObject<{
        action: z.ZodString;
        priority: z.ZodDefault<z.ZodEnum<["high", "medium", "low"]>>;
        dueDate: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        action: string;
        priority: "low" | "medium" | "high";
        dueDate?: string | undefined;
    }, {
        action: string;
        dueDate?: string | undefined;
        priority?: "low" | "medium" | "high" | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    sessionData: {
        duration: number;
        startedAt: string;
        endedAt: string;
        participantCount: number;
        issues?: string[] | undefined;
        quality?: "excellent" | "good" | "poor" | "fair" | undefined;
    };
    sessionNotes?: string | undefined;
    clientProgress?: {
        engagement?: "low" | "medium" | "high" | undefined;
        mood?: "critical" | "excellent" | "good" | "neutral" | "poor" | undefined;
        goals?: string[] | undefined;
        outcomes?: string[] | undefined;
    } | undefined;
    followUpActions?: {
        action: string;
        priority: "low" | "medium" | "high";
        dueDate?: string | undefined;
    }[] | undefined;
}, {
    sessionData: {
        duration: number;
        startedAt: string;
        endedAt: string;
        participantCount: number;
        issues?: string[] | undefined;
        quality?: "excellent" | "good" | "poor" | "fair" | undefined;
    };
    sessionNotes?: string | undefined;
    clientProgress?: {
        engagement?: "low" | "medium" | "high" | undefined;
        mood?: "critical" | "excellent" | "good" | "neutral" | "poor" | undefined;
        goals?: string[] | undefined;
        outcomes?: string[] | undefined;
    } | undefined;
    followUpActions?: {
        action: string;
        dueDate?: string | undefined;
        priority?: "low" | "medium" | "high" | undefined;
    }[] | undefined;
}>;
export declare const GetMeetingAnalyticsQueryDtoSchema: z.ZodObject<{
    therapistId: z.ZodOptional<z.ZodString>;
    timeframe: z.ZodDefault<z.ZodEnum<["week", "month", "quarter", "year"]>>;
    dateFrom: z.ZodOptional<z.ZodString>;
    dateTo: z.ZodOptional<z.ZodString>;
    includeComparisons: z.ZodDefault<z.ZodBoolean>;
    metrics: z.ZodOptional<z.ZodArray<z.ZodEnum<["completion_rate", "cancellation_rate", "average_duration", "client_satisfaction"]>, "many">>;
}, "strip", z.ZodTypeAny, {
    timeframe: "month" | "week" | "quarter" | "year";
    includeComparisons: boolean;
    therapistId?: string | undefined;
    metrics?: ("completion_rate" | "cancellation_rate" | "average_duration" | "client_satisfaction")[] | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
}, {
    therapistId?: string | undefined;
    timeframe?: "month" | "week" | "quarter" | "year" | undefined;
    metrics?: ("completion_rate" | "cancellation_rate" | "average_duration" | "client_satisfaction")[] | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    includeComparisons?: boolean | undefined;
}>;
export declare const EmergencyTerminateMeetingDtoSchema: z.ZodObject<{
    reason: z.ZodEnum<["technical_issues", "emergency", "safety_concern", "participant_request"]>;
    description: z.ZodString;
    notifySupport: z.ZodDefault<z.ZodBoolean>;
    followUpRequired: z.ZodDefault<z.ZodBoolean>;
    escalateToSupervisor: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    reason: "emergency" | "technical_issues" | "safety_concern" | "participant_request";
    description: string;
    followUpRequired: boolean;
    notifySupport: boolean;
    escalateToSupervisor: boolean;
}, {
    reason: "emergency" | "technical_issues" | "safety_concern" | "participant_request";
    description: string;
    followUpRequired?: boolean | undefined;
    notifySupport?: boolean | undefined;
    escalateToSupervisor?: boolean | undefined;
}>;
export type MeetingParamsDto = z.infer<typeof MeetingParamsDtoSchema>;
export type UpdateMeetingStatusDto = z.infer<typeof UpdateMeetingStatusDtoSchema>;
export type GetUpcomingMeetingsQueryDto = z.infer<typeof GetUpcomingMeetingsQueryDtoSchema>;
export type SaveMeetingSessionDto = z.infer<typeof SaveMeetingSessionDtoSchema>;
export type GetMeetingAnalyticsQueryDto = z.infer<typeof GetMeetingAnalyticsQueryDtoSchema>;
export type EmergencyTerminateMeetingDto = z.infer<typeof EmergencyTerminateMeetingDtoSchema>;
//# sourceMappingURL=meetings.d.ts.map