import { z } from 'zod';
export declare const SessionSchema: z.ZodObject<{
    id: z.ZodString;
    clientId: z.ZodString;
    therapistId: z.ZodString;
    scheduledAt: z.ZodString;
    duration: z.ZodNumber;
    status: z.ZodEnum<["scheduled", "in_progress", "completed", "cancelled", "no_show"]>;
    type: z.ZodEnum<["video", "audio", "phone", "in_person"]>;
    notes: z.ZodOptional<z.ZodString>;
    sessionNotes: z.ZodOptional<z.ZodString>;
    recordingUrl: z.ZodOptional<z.ZodString>;
    meetingUrl: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    startedAt: z.ZodOptional<z.ZodString>;
    endedAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: string;
    updatedAt: string;
    type: "phone" | "video" | "audio" | "in_person";
    status: "cancelled" | "scheduled" | "completed" | "in_progress" | "no_show";
    duration: number;
    therapistId: string;
    clientId: string;
    scheduledAt: string;
    notes?: string | undefined;
    meetingUrl?: string | undefined;
    startedAt?: string | undefined;
    sessionNotes?: string | undefined;
    recordingUrl?: string | undefined;
    endedAt?: string | undefined;
}, {
    id: string;
    createdAt: string;
    updatedAt: string;
    type: "phone" | "video" | "audio" | "in_person";
    status: "cancelled" | "scheduled" | "completed" | "in_progress" | "no_show";
    duration: number;
    therapistId: string;
    clientId: string;
    scheduledAt: string;
    notes?: string | undefined;
    meetingUrl?: string | undefined;
    startedAt?: string | undefined;
    sessionNotes?: string | undefined;
    recordingUrl?: string | undefined;
    endedAt?: string | undefined;
}>;
export declare const CreateSessionDtoSchema: z.ZodObject<{
    clientId: z.ZodString;
    therapistId: z.ZodString;
    scheduledAt: z.ZodString;
    duration: z.ZodNumber;
    type: z.ZodDefault<z.ZodEnum<["video", "audio", "phone", "in_person"]>>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "phone" | "video" | "audio" | "in_person";
    duration: number;
    therapistId: string;
    clientId: string;
    scheduledAt: string;
    notes?: string | undefined;
}, {
    duration: number;
    therapistId: string;
    clientId: string;
    scheduledAt: string;
    type?: "phone" | "video" | "audio" | "in_person" | undefined;
    notes?: string | undefined;
}>;
export declare const UpdateSessionDtoSchema: z.ZodObject<{
    scheduledAt: z.ZodOptional<z.ZodString>;
    duration: z.ZodOptional<z.ZodNumber>;
    type: z.ZodOptional<z.ZodEnum<["video", "audio", "phone", "in_person"]>>;
    notes: z.ZodOptional<z.ZodString>;
    sessionNotes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type?: "phone" | "video" | "audio" | "in_person" | undefined;
    duration?: number | undefined;
    notes?: string | undefined;
    scheduledAt?: string | undefined;
    sessionNotes?: string | undefined;
}, {
    type?: "phone" | "video" | "audio" | "in_person" | undefined;
    duration?: number | undefined;
    notes?: string | undefined;
    scheduledAt?: string | undefined;
    sessionNotes?: string | undefined;
}>;
export declare const UpdateSessionStatusDtoSchema: z.ZodObject<{
    status: z.ZodEnum<["scheduled", "in_progress", "completed", "cancelled", "no_show"]>;
    reason: z.ZodOptional<z.ZodString>;
    notifyParticipants: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    status: "cancelled" | "scheduled" | "completed" | "in_progress" | "no_show";
    notifyParticipants: boolean;
    reason?: string | undefined;
}, {
    status: "cancelled" | "scheduled" | "completed" | "in_progress" | "no_show";
    reason?: string | undefined;
    notifyParticipants?: boolean | undefined;
}>;
export declare const JoinSessionDtoSchema: z.ZodObject<{
    sessionId: z.ZodString;
    userType: z.ZodEnum<["client", "therapist"]>;
}, "strip", z.ZodTypeAny, {
    sessionId: string;
    userType: "client" | "therapist";
}, {
    sessionId: string;
    userType: "client" | "therapist";
}>;
export declare const SessionRecordingSchema: z.ZodObject<{
    id: z.ZodString;
    sessionId: z.ZodString;
    recordingUrl: z.ZodString;
    duration: z.ZodNumber;
    size: z.ZodNumber;
    isEncrypted: z.ZodBoolean;
    createdAt: z.ZodString;
    expiresAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: string;
    duration: number;
    size: number;
    sessionId: string;
    recordingUrl: string;
    isEncrypted: boolean;
    expiresAt?: string | undefined;
}, {
    id: string;
    createdAt: string;
    duration: number;
    size: number;
    sessionId: string;
    recordingUrl: string;
    isEncrypted: boolean;
    expiresAt?: string | undefined;
}>;
export declare const SessionFeedbackDtoSchema: z.ZodObject<{
    rating: z.ZodNumber;
    feedback: z.ZodOptional<z.ZodString>;
    wouldRecommend: z.ZodOptional<z.ZodBoolean>;
    technicalIssues: z.ZodOptional<z.ZodBoolean>;
    improvementSuggestions: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    rating: number;
    feedback?: string | undefined;
    wouldRecommend?: boolean | undefined;
    technicalIssues?: boolean | undefined;
    improvementSuggestions?: string | undefined;
}, {
    rating: number;
    feedback?: string | undefined;
    wouldRecommend?: boolean | undefined;
    technicalIssues?: boolean | undefined;
    improvementSuggestions?: string | undefined;
}>;
export declare const SessionQuerySchema: z.ZodObject<{
    page: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
    clientId: z.ZodOptional<z.ZodString>;
    therapistId: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["scheduled", "in_progress", "completed", "cancelled", "no_show"]>>;
    type: z.ZodOptional<z.ZodEnum<["video", "audio", "phone", "in_person"]>>;
    dateFrom: z.ZodOptional<z.ZodString>;
    dateTo: z.ZodOptional<z.ZodString>;
    sortBy: z.ZodOptional<z.ZodEnum<["scheduledAt", "createdAt", "duration", "status"]>>;
    sortOrder: z.ZodOptional<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    type?: "phone" | "video" | "audio" | "in_person" | undefined;
    status?: "cancelled" | "scheduled" | "completed" | "in_progress" | "no_show" | undefined;
    limit?: number | undefined;
    page?: number | undefined;
    sortBy?: "createdAt" | "status" | "duration" | "scheduledAt" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    therapistId?: string | undefined;
    clientId?: string | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
}, {
    type?: "phone" | "video" | "audio" | "in_person" | undefined;
    status?: "cancelled" | "scheduled" | "completed" | "in_progress" | "no_show" | undefined;
    limit?: number | undefined;
    page?: number | undefined;
    sortBy?: "createdAt" | "status" | "duration" | "scheduledAt" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    therapistId?: string | undefined;
    clientId?: string | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
}>;
export declare const RescheduleSessionDtoSchema: z.ZodObject<{
    newScheduledAt: z.ZodString;
    reason: z.ZodOptional<z.ZodString>;
    notifyParticipants: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    notifyParticipants: boolean;
    newScheduledAt: string;
    reason?: string | undefined;
}, {
    newScheduledAt: string;
    reason?: string | undefined;
    notifyParticipants?: boolean | undefined;
}>;
export declare const SessionAvailabilitySchema: z.ZodObject<{
    therapistId: z.ZodString;
    date: z.ZodString;
    availableSlots: z.ZodArray<z.ZodObject<{
        startTime: z.ZodString;
        endTime: z.ZodString;
        duration: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        duration: number;
        startTime: string;
        endTime: string;
    }, {
        duration: number;
        startTime: string;
        endTime: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    date: string;
    therapistId: string;
    availableSlots: {
        duration: number;
        startTime: string;
        endTime: string;
    }[];
}, {
    date: string;
    therapistId: string;
    availableSlots: {
        duration: number;
        startTime: string;
        endTime: string;
    }[];
}>;
export declare const SessionIdParamSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const SessionRecordingIdParamSchema: z.ZodObject<{
    sessionId: z.ZodString;
    recordingId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    sessionId: string;
    recordingId: string;
}, {
    sessionId: string;
    recordingId: string;
}>;
export type Session = z.infer<typeof SessionSchema>;
export type CreateSessionDto = z.infer<typeof CreateSessionDtoSchema>;
export type UpdateSessionDto = z.infer<typeof UpdateSessionDtoSchema>;
export type UpdateSessionStatusDto = z.infer<typeof UpdateSessionStatusDtoSchema>;
export type JoinSessionDto = z.infer<typeof JoinSessionDtoSchema>;
export type SessionRecording = z.infer<typeof SessionRecordingSchema>;
export type SessionFeedbackDto = z.infer<typeof SessionFeedbackDtoSchema>;
export type SessionQuery = z.infer<typeof SessionQuerySchema>;
export type RescheduleSessionDto = z.infer<typeof RescheduleSessionDtoSchema>;
export type SessionAvailability = z.infer<typeof SessionAvailabilitySchema>;
export type SessionIdParam = z.infer<typeof SessionIdParamSchema>;
export type SessionRecordingIdParam = z.infer<typeof SessionRecordingIdParamSchema>;
export declare const CreateSessionLogDtoSchema: z.ZodObject<{
    clientId: z.ZodString;
    therapistId: z.ZodString;
    sessionType: z.ZodDefault<z.ZodEnum<["individual", "group", "emergency"]>>;
    startTime: z.ZodString;
    plannedDuration: z.ZodNumber;
    notes: z.ZodOptional<z.ZodString>;
    mood: z.ZodOptional<z.ZodEnum<["excellent", "good", "neutral", "poor", "critical"]>>;
    goals: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    startTime: string;
    therapistId: string;
    clientId: string;
    sessionType: "individual" | "group" | "emergency";
    plannedDuration: number;
    notes?: string | undefined;
    mood?: "critical" | "excellent" | "good" | "neutral" | "poor" | undefined;
    goals?: string[] | undefined;
}, {
    startTime: string;
    therapistId: string;
    clientId: string;
    plannedDuration: number;
    notes?: string | undefined;
    sessionType?: "individual" | "group" | "emergency" | undefined;
    mood?: "critical" | "excellent" | "good" | "neutral" | "poor" | undefined;
    goals?: string[] | undefined;
}>;
export declare const FindSessionsQueryDtoSchema: z.ZodObject<{
    page: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
    clientId: z.ZodOptional<z.ZodString>;
    therapistId: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["scheduled", "in_progress", "completed", "cancelled"]>>;
    dateFrom: z.ZodOptional<z.ZodString>;
    dateTo: z.ZodOptional<z.ZodString>;
    sessionType: z.ZodOptional<z.ZodEnum<["individual", "group", "emergency"]>>;
    sortBy: z.ZodOptional<z.ZodEnum<["startTime", "createdAt", "duration"]>>;
    sortOrder: z.ZodOptional<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    status?: "cancelled" | "scheduled" | "completed" | "in_progress" | undefined;
    limit?: number | undefined;
    page?: number | undefined;
    sortBy?: "createdAt" | "duration" | "startTime" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    therapistId?: string | undefined;
    clientId?: string | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    sessionType?: "individual" | "group" | "emergency" | undefined;
}, {
    status?: "cancelled" | "scheduled" | "completed" | "in_progress" | undefined;
    limit?: number | undefined;
    page?: number | undefined;
    sortBy?: "createdAt" | "duration" | "startTime" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    therapistId?: string | undefined;
    clientId?: string | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    sessionType?: "individual" | "group" | "emergency" | undefined;
}>;
export declare const SessionParamsDtoSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const UpdateSessionLogDtoSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["scheduled", "in_progress", "completed", "cancelled"]>>;
    notes: z.ZodOptional<z.ZodString>;
    mood: z.ZodOptional<z.ZodEnum<["excellent", "good", "neutral", "poor", "critical"]>>;
    actualDuration: z.ZodOptional<z.ZodNumber>;
    endTime: z.ZodOptional<z.ZodString>;
    goals: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    outcomes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    status?: "cancelled" | "scheduled" | "completed" | "in_progress" | undefined;
    notes?: string | undefined;
    endTime?: string | undefined;
    mood?: "critical" | "excellent" | "good" | "neutral" | "poor" | undefined;
    goals?: string[] | undefined;
    actualDuration?: number | undefined;
    outcomes?: string[] | undefined;
}, {
    status?: "cancelled" | "scheduled" | "completed" | "in_progress" | undefined;
    notes?: string | undefined;
    endTime?: string | undefined;
    mood?: "critical" | "excellent" | "good" | "neutral" | "poor" | undefined;
    goals?: string[] | undefined;
    actualDuration?: number | undefined;
    outcomes?: string[] | undefined;
}>;
export declare const EndSessionDtoSchema: z.ZodObject<{
    endTime: z.ZodString;
    actualDuration: z.ZodNumber;
    sessionSummary: z.ZodOptional<z.ZodString>;
    clientProgress: z.ZodOptional<z.ZodEnum<["significant", "moderate", "minimal", "none"]>>;
    nextSessionRecommendation: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    endTime: string;
    actualDuration: number;
    sessionSummary?: string | undefined;
    clientProgress?: "significant" | "moderate" | "minimal" | "none" | undefined;
    nextSessionRecommendation?: string | undefined;
}, {
    endTime: string;
    actualDuration: number;
    sessionSummary?: string | undefined;
    clientProgress?: "significant" | "moderate" | "minimal" | "none" | undefined;
    nextSessionRecommendation?: string | undefined;
}>;
export declare const AddSessionActivityDtoSchema: z.ZodObject<{
    activityType: z.ZodEnum<["discussion", "exercise", "assignment", "assessment", "break"]>;
    description: z.ZodString;
    duration: z.ZodNumber;
    notes: z.ZodOptional<z.ZodString>;
    effectiveness: z.ZodOptional<z.ZodEnum<["very_effective", "effective", "somewhat_effective", "not_effective"]>>;
}, "strip", z.ZodTypeAny, {
    duration: number;
    description: string;
    activityType: "discussion" | "exercise" | "assignment" | "assessment" | "break";
    notes?: string | undefined;
    effectiveness?: "very_effective" | "effective" | "somewhat_effective" | "not_effective" | undefined;
}, {
    duration: number;
    description: string;
    activityType: "discussion" | "exercise" | "assignment" | "assessment" | "break";
    notes?: string | undefined;
    effectiveness?: "very_effective" | "effective" | "somewhat_effective" | "not_effective" | undefined;
}>;
export declare const LogUserActivityDtoSchema: z.ZodObject<{
    userId: z.ZodString;
    activityType: z.ZodEnum<["login", "logout", "page_view", "interaction", "session_join", "session_leave"]>;
    details: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    timestamp: z.ZodOptional<z.ZodString>;
    sessionId: z.ZodOptional<z.ZodString>;
    ipAddress: z.ZodOptional<z.ZodString>;
    userAgent: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    userId: string;
    activityType: "login" | "logout" | "page_view" | "interaction" | "session_join" | "session_leave";
    details?: Record<string, any> | undefined;
    ipAddress?: string | undefined;
    userAgent?: string | undefined;
    timestamp?: string | undefined;
    sessionId?: string | undefined;
}, {
    userId: string;
    activityType: "login" | "logout" | "page_view" | "interaction" | "session_join" | "session_leave";
    details?: Record<string, any> | undefined;
    ipAddress?: string | undefined;
    userAgent?: string | undefined;
    timestamp?: string | undefined;
    sessionId?: string | undefined;
}>;
export declare const GetUserActivitiesQueryDtoSchema: z.ZodObject<{
    userId: z.ZodOptional<z.ZodString>;
    activityType: z.ZodOptional<z.ZodEnum<["login", "logout", "page_view", "interaction", "session_join", "session_leave"]>>;
    dateFrom: z.ZodOptional<z.ZodString>;
    dateTo: z.ZodOptional<z.ZodString>;
    page: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
    sortBy: z.ZodOptional<z.ZodEnum<["timestamp", "activityType"]>>;
    sortOrder: z.ZodOptional<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    userId?: string | undefined;
    limit?: number | undefined;
    page?: number | undefined;
    sortBy?: "timestamp" | "activityType" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    activityType?: "login" | "logout" | "page_view" | "interaction" | "session_join" | "session_leave" | undefined;
}, {
    userId?: string | undefined;
    limit?: number | undefined;
    page?: number | undefined;
    sortBy?: "timestamp" | "activityType" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    activityType?: "login" | "logout" | "page_view" | "interaction" | "session_join" | "session_leave" | undefined;
}>;
export declare const CreateTherapyProgressDtoSchema: z.ZodObject<{
    clientId: z.ZodString;
    therapistId: z.ZodString;
    sessionId: z.ZodOptional<z.ZodString>;
    progressType: z.ZodEnum<["goal_achievement", "symptom_improvement", "skill_development", "behavior_change"]>;
    description: z.ZodString;
    progressLevel: z.ZodNumber;
    notes: z.ZodOptional<z.ZodString>;
    nextSteps: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    therapistId: string;
    description: string;
    clientId: string;
    progressType: "goal_achievement" | "symptom_improvement" | "skill_development" | "behavior_change";
    progressLevel: number;
    notes?: string | undefined;
    sessionId?: string | undefined;
    nextSteps?: string[] | undefined;
}, {
    therapistId: string;
    description: string;
    clientId: string;
    progressType: "goal_achievement" | "symptom_improvement" | "skill_development" | "behavior_change";
    progressLevel: number;
    notes?: string | undefined;
    sessionId?: string | undefined;
    nextSteps?: string[] | undefined;
}>;
export declare const GetTherapyProgressQueryDtoSchema: z.ZodObject<{
    clientId: z.ZodOptional<z.ZodString>;
    therapistId: z.ZodOptional<z.ZodString>;
    progressType: z.ZodOptional<z.ZodEnum<["goal_achievement", "symptom_improvement", "skill_development", "behavior_change"]>>;
    dateFrom: z.ZodOptional<z.ZodString>;
    dateTo: z.ZodOptional<z.ZodString>;
    page: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit?: number | undefined;
    page?: number | undefined;
    therapistId?: string | undefined;
    clientId?: string | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    progressType?: "goal_achievement" | "symptom_improvement" | "skill_development" | "behavior_change" | undefined;
}, {
    limit?: number | undefined;
    page?: number | undefined;
    therapistId?: string | undefined;
    clientId?: string | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    progressType?: "goal_achievement" | "symptom_improvement" | "skill_development" | "behavior_change" | undefined;
}>;
export declare const GetSessionStatisticsQueryDtoSchema: z.ZodObject<{
    therapistId: z.ZodOptional<z.ZodString>;
    clientId: z.ZodOptional<z.ZodString>;
    timeframe: z.ZodDefault<z.ZodEnum<["week", "month", "quarter", "year"]>>;
    dateFrom: z.ZodOptional<z.ZodString>;
    dateTo: z.ZodOptional<z.ZodString>;
    includeProgress: z.ZodDefault<z.ZodBoolean>;
    includeActivities: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    timeframe: "month" | "week" | "quarter" | "year";
    includeProgress: boolean;
    includeActivities: boolean;
    therapistId?: string | undefined;
    clientId?: string | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
}, {
    therapistId?: string | undefined;
    clientId?: string | undefined;
    timeframe?: "month" | "week" | "quarter" | "year" | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    includeProgress?: boolean | undefined;
    includeActivities?: boolean | undefined;
}>;
export type CreateSessionLogDto = z.infer<typeof CreateSessionLogDtoSchema>;
export type FindSessionsQueryDto = z.infer<typeof FindSessionsQueryDtoSchema>;
export type SessionParamsDto = z.infer<typeof SessionParamsDtoSchema>;
export type UpdateSessionLogDto = z.infer<typeof UpdateSessionLogDtoSchema>;
export type EndSessionDto = z.infer<typeof EndSessionDtoSchema>;
export type AddSessionActivityDto = z.infer<typeof AddSessionActivityDtoSchema>;
export type LogUserActivityDto = z.infer<typeof LogUserActivityDtoSchema>;
export type GetUserActivitiesQueryDto = z.infer<typeof GetUserActivitiesQueryDtoSchema>;
export type CreateTherapyProgressDto = z.infer<typeof CreateTherapyProgressDtoSchema>;
export type GetTherapyProgressQueryDto = z.infer<typeof GetTherapyProgressQueryDtoSchema>;
export type GetSessionStatisticsQueryDto = z.infer<typeof GetSessionStatisticsQueryDtoSchema>;
//# sourceMappingURL=sessions.d.ts.map