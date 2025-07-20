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
    type: "video" | "audio" | "phone" | "in_person";
    status: "scheduled" | "in_progress" | "completed" | "cancelled" | "no_show";
    id: string;
    createdAt: string;
    therapistId: string;
    updatedAt: string;
    clientId: string;
    duration: number;
    scheduledAt: string;
    meetingUrl?: string | undefined;
    notes?: string | undefined;
    startedAt?: string | undefined;
    endedAt?: string | undefined;
    sessionNotes?: string | undefined;
    recordingUrl?: string | undefined;
}, {
    type: "video" | "audio" | "phone" | "in_person";
    status: "scheduled" | "in_progress" | "completed" | "cancelled" | "no_show";
    id: string;
    createdAt: string;
    therapistId: string;
    updatedAt: string;
    clientId: string;
    duration: number;
    scheduledAt: string;
    meetingUrl?: string | undefined;
    notes?: string | undefined;
    startedAt?: string | undefined;
    endedAt?: string | undefined;
    sessionNotes?: string | undefined;
    recordingUrl?: string | undefined;
}>;
export declare const CreateSessionDtoSchema: z.ZodObject<{
    clientId: z.ZodString;
    therapistId: z.ZodString;
    scheduledAt: z.ZodString;
    duration: z.ZodNumber;
    type: z.ZodDefault<z.ZodEnum<["video", "audio", "phone", "in_person"]>>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "video" | "audio" | "phone" | "in_person";
    therapistId: string;
    clientId: string;
    duration: number;
    scheduledAt: string;
    notes?: string | undefined;
}, {
    therapistId: string;
    clientId: string;
    duration: number;
    scheduledAt: string;
    type?: "video" | "audio" | "phone" | "in_person" | undefined;
    notes?: string | undefined;
}>;
export declare const UpdateSessionDtoSchema: z.ZodObject<{
    scheduledAt: z.ZodOptional<z.ZodString>;
    duration: z.ZodOptional<z.ZodNumber>;
    type: z.ZodOptional<z.ZodEnum<["video", "audio", "phone", "in_person"]>>;
    notes: z.ZodOptional<z.ZodString>;
    sessionNotes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type?: "video" | "audio" | "phone" | "in_person" | undefined;
    duration?: number | undefined;
    notes?: string | undefined;
    sessionNotes?: string | undefined;
    scheduledAt?: string | undefined;
}, {
    type?: "video" | "audio" | "phone" | "in_person" | undefined;
    duration?: number | undefined;
    notes?: string | undefined;
    sessionNotes?: string | undefined;
    scheduledAt?: string | undefined;
}>;
export declare const UpdateSessionStatusDtoSchema: z.ZodObject<{
    status: z.ZodEnum<["scheduled", "in_progress", "completed", "cancelled", "no_show"]>;
    reason: z.ZodOptional<z.ZodString>;
    notifyParticipants: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    status: "scheduled" | "in_progress" | "completed" | "cancelled" | "no_show";
    notifyParticipants: boolean;
    reason?: string | undefined;
}, {
    status: "scheduled" | "in_progress" | "completed" | "cancelled" | "no_show";
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
    sessionId: string;
    createdAt: string;
    duration: number;
    size: number;
    recordingUrl: string;
    isEncrypted: boolean;
    expiresAt?: string | undefined;
}, {
    id: string;
    sessionId: string;
    createdAt: string;
    duration: number;
    size: number;
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
    technicalIssues?: boolean | undefined;
    feedback?: string | undefined;
    wouldRecommend?: boolean | undefined;
    improvementSuggestions?: string | undefined;
}, {
    rating: number;
    technicalIssues?: boolean | undefined;
    feedback?: string | undefined;
    wouldRecommend?: boolean | undefined;
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
    type?: "video" | "audio" | "phone" | "in_person" | undefined;
    status?: "scheduled" | "in_progress" | "completed" | "cancelled" | "no_show" | undefined;
    therapistId?: string | undefined;
    clientId?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    sortBy?: "status" | "createdAt" | "duration" | "scheduledAt" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
}, {
    type?: "video" | "audio" | "phone" | "in_person" | undefined;
    status?: "scheduled" | "in_progress" | "completed" | "cancelled" | "no_show" | undefined;
    therapistId?: string | undefined;
    clientId?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    sortBy?: "status" | "createdAt" | "duration" | "scheduledAt" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
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
    therapistId: z.ZodOptional<z.ZodString>;
    sessionType: z.ZodDefault<z.ZodEnum<["INITIAL_CONSULTATION", "REGULAR_THERAPY", "CRISIS_INTERVENTION", "GROUP_THERAPY", "FAMILY_THERAPY", "FOLLOW_UP", "ASSESSMENT", "SELF_GUIDED"]>>;
    meetingId: z.ZodOptional<z.ZodString>;
    platform: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    clientId: string;
    sessionType: "INITIAL_CONSULTATION" | "REGULAR_THERAPY" | "CRISIS_INTERVENTION" | "GROUP_THERAPY" | "FAMILY_THERAPY" | "FOLLOW_UP" | "ASSESSMENT" | "SELF_GUIDED";
    therapistId?: string | undefined;
    meetingId?: string | undefined;
    platform?: string | undefined;
}, {
    clientId: string;
    therapistId?: string | undefined;
    meetingId?: string | undefined;
    sessionType?: "INITIAL_CONSULTATION" | "REGULAR_THERAPY" | "CRISIS_INTERVENTION" | "GROUP_THERAPY" | "FAMILY_THERAPY" | "FOLLOW_UP" | "ASSESSMENT" | "SELF_GUIDED" | undefined;
    platform?: string | undefined;
}>;
export declare const FindSessionsQueryDtoSchema: z.ZodObject<{
    clientId: z.ZodOptional<z.ZodString>;
    therapistId: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "NO_SHOW", "TECHNICAL_ISSUE", "RESCHEDULED"]>>;
    sessionType: z.ZodOptional<z.ZodEnum<["INITIAL_CONSULTATION", "REGULAR_THERAPY", "CRISIS_INTERVENTION", "GROUP_THERAPY", "FAMILY_THERAPY", "FOLLOW_UP", "ASSESSMENT", "SELF_GUIDED"]>>;
}, "strip", z.ZodTypeAny, {
    status?: "COMPLETED" | "CANCELLED" | "SCHEDULED" | "IN_PROGRESS" | "NO_SHOW" | "TECHNICAL_ISSUE" | "RESCHEDULED" | undefined;
    therapistId?: string | undefined;
    clientId?: string | undefined;
    sessionType?: "INITIAL_CONSULTATION" | "REGULAR_THERAPY" | "CRISIS_INTERVENTION" | "GROUP_THERAPY" | "FAMILY_THERAPY" | "FOLLOW_UP" | "ASSESSMENT" | "SELF_GUIDED" | undefined;
}, {
    status?: "COMPLETED" | "CANCELLED" | "SCHEDULED" | "IN_PROGRESS" | "NO_SHOW" | "TECHNICAL_ISSUE" | "RESCHEDULED" | undefined;
    therapistId?: string | undefined;
    clientId?: string | undefined;
    sessionType?: "INITIAL_CONSULTATION" | "REGULAR_THERAPY" | "CRISIS_INTERVENTION" | "GROUP_THERAPY" | "FAMILY_THERAPY" | "FOLLOW_UP" | "ASSESSMENT" | "SELF_GUIDED" | undefined;
}>;
export declare const SessionParamsDtoSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const UpdateSessionLogDtoSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "NO_SHOW", "TECHNICAL_ISSUE", "RESCHEDULED"]>>;
    notes: z.ZodOptional<z.ZodString>;
    quality: z.ZodOptional<z.ZodNumber>;
    connectionIssues: z.ZodOptional<z.ZodBoolean>;
    recordingUrl: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status?: "COMPLETED" | "CANCELLED" | "SCHEDULED" | "IN_PROGRESS" | "NO_SHOW" | "TECHNICAL_ISSUE" | "RESCHEDULED" | undefined;
    notes?: string | undefined;
    quality?: number | undefined;
    recordingUrl?: string | undefined;
    connectionIssues?: boolean | undefined;
}, {
    status?: "COMPLETED" | "CANCELLED" | "SCHEDULED" | "IN_PROGRESS" | "NO_SHOW" | "TECHNICAL_ISSUE" | "RESCHEDULED" | undefined;
    notes?: string | undefined;
    quality?: number | undefined;
    recordingUrl?: string | undefined;
    connectionIssues?: boolean | undefined;
}>;
export declare const EndSessionDtoSchema: z.ZodObject<{
    notes: z.ZodOptional<z.ZodString>;
    quality: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    notes?: string | undefined;
    quality?: number | undefined;
}, {
    notes?: string | undefined;
    quality?: number | undefined;
}>;
export declare const AddSessionActivityDtoSchema: z.ZodObject<{
    activityType: z.ZodEnum<["SESSION_START", "SESSION_END", "SCREEN_SHARE", "FILE_SHARE", "WHITEBOARD_USE", "CHAT_MESSAGE", "GOAL_SETTING", "PROGRESS_REVIEW", "HOMEWORK_ASSIGNMENT", "ASSESSMENT_COMPLETION", "MOOD_CHECK_IN", "CONNECTION_ISSUE", "AUDIO_PROBLEM", "VIDEO_PROBLEM", "RECONNECTION", "RECORDING_START", "RECORDING_STOP"]>;
    description: z.ZodOptional<z.ZodString>;
    duration: z.ZodOptional<z.ZodNumber>;
    metadata: z.ZodOptional<z.ZodAny>;
}, "strip", z.ZodTypeAny, {
    activityType: "SESSION_START" | "SESSION_END" | "SCREEN_SHARE" | "FILE_SHARE" | "WHITEBOARD_USE" | "CHAT_MESSAGE" | "GOAL_SETTING" | "PROGRESS_REVIEW" | "HOMEWORK_ASSIGNMENT" | "ASSESSMENT_COMPLETION" | "MOOD_CHECK_IN" | "CONNECTION_ISSUE" | "AUDIO_PROBLEM" | "VIDEO_PROBLEM" | "RECONNECTION" | "RECORDING_START" | "RECORDING_STOP";
    description?: string | undefined;
    duration?: number | undefined;
    metadata?: any;
}, {
    activityType: "SESSION_START" | "SESSION_END" | "SCREEN_SHARE" | "FILE_SHARE" | "WHITEBOARD_USE" | "CHAT_MESSAGE" | "GOAL_SETTING" | "PROGRESS_REVIEW" | "HOMEWORK_ASSIGNMENT" | "ASSESSMENT_COMPLETION" | "MOOD_CHECK_IN" | "CONNECTION_ISSUE" | "AUDIO_PROBLEM" | "VIDEO_PROBLEM" | "RECONNECTION" | "RECORDING_START" | "RECORDING_STOP";
    description?: string | undefined;
    duration?: number | undefined;
    metadata?: any;
}>;
export declare const LogUserActivityDtoSchema: z.ZodObject<{
    action: z.ZodEnum<["PAGE_VIEW", "PAGE_EXIT", "CLICK", "SCROLL", "SEARCH", "POST_CREATE", "POST_VIEW", "POST_LIKE", "COMMENT_CREATE", "COMMENT_LIKE", "THERAPIST_SEARCH", "THERAPIST_PROFILE_VIEW", "APPOINTMENT_BOOK", "APPOINTMENT_CANCEL", "MESSAGE_SEND", "WORKSHEET_COMPLETE", "PROFILE_UPDATE", "SETTINGS_CHANGE", "PASSWORD_CHANGE", "LOGOUT"]>;
    page: z.ZodOptional<z.ZodString>;
    component: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodAny>;
    sessionId: z.ZodOptional<z.ZodString>;
    deviceInfo: z.ZodOptional<z.ZodAny>;
}, "strip", z.ZodTypeAny, {
    action: "MESSAGE_SEND" | "PROFILE_UPDATE" | "PAGE_VIEW" | "PAGE_EXIT" | "CLICK" | "SCROLL" | "SEARCH" | "POST_CREATE" | "POST_VIEW" | "POST_LIKE" | "COMMENT_CREATE" | "COMMENT_LIKE" | "THERAPIST_SEARCH" | "THERAPIST_PROFILE_VIEW" | "APPOINTMENT_BOOK" | "APPOINTMENT_CANCEL" | "WORKSHEET_COMPLETE" | "SETTINGS_CHANGE" | "PASSWORD_CHANGE" | "LOGOUT";
    sessionId?: string | undefined;
    page?: string | undefined;
    component?: string | undefined;
    metadata?: any;
    deviceInfo?: any;
}, {
    action: "MESSAGE_SEND" | "PROFILE_UPDATE" | "PAGE_VIEW" | "PAGE_EXIT" | "CLICK" | "SCROLL" | "SEARCH" | "POST_CREATE" | "POST_VIEW" | "POST_LIKE" | "COMMENT_CREATE" | "COMMENT_LIKE" | "THERAPIST_SEARCH" | "THERAPIST_PROFILE_VIEW" | "APPOINTMENT_BOOK" | "APPOINTMENT_CANCEL" | "WORKSHEET_COMPLETE" | "SETTINGS_CHANGE" | "PASSWORD_CHANGE" | "LOGOUT";
    sessionId?: string | undefined;
    page?: string | undefined;
    component?: string | undefined;
    metadata?: any;
    deviceInfo?: any;
}>;
export declare const GetUserActivitiesQueryDtoSchema: z.ZodObject<{
    action: z.ZodOptional<z.ZodEnum<["PAGE_VIEW", "PAGE_EXIT", "CLICK", "SCROLL", "SEARCH", "POST_CREATE", "POST_VIEW", "POST_LIKE", "COMMENT_CREATE", "COMMENT_LIKE", "THERAPIST_SEARCH", "THERAPIST_PROFILE_VIEW", "APPOINTMENT_BOOK", "APPOINTMENT_CANCEL", "MESSAGE_SEND", "WORKSHEET_COMPLETE", "PROFILE_UPDATE", "SETTINGS_CHANGE", "PASSWORD_CHANGE", "LOGOUT"]>>;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    startDate?: string | undefined;
    endDate?: string | undefined;
    action?: "MESSAGE_SEND" | "PROFILE_UPDATE" | "PAGE_VIEW" | "PAGE_EXIT" | "CLICK" | "SCROLL" | "SEARCH" | "POST_CREATE" | "POST_VIEW" | "POST_LIKE" | "COMMENT_CREATE" | "COMMENT_LIKE" | "THERAPIST_SEARCH" | "THERAPIST_PROFILE_VIEW" | "APPOINTMENT_BOOK" | "APPOINTMENT_CANCEL" | "WORKSHEET_COMPLETE" | "SETTINGS_CHANGE" | "PASSWORD_CHANGE" | "LOGOUT" | undefined;
}, {
    startDate?: string | undefined;
    endDate?: string | undefined;
    action?: "MESSAGE_SEND" | "PROFILE_UPDATE" | "PAGE_VIEW" | "PAGE_EXIT" | "CLICK" | "SCROLL" | "SEARCH" | "POST_CREATE" | "POST_VIEW" | "POST_LIKE" | "COMMENT_CREATE" | "COMMENT_LIKE" | "THERAPIST_SEARCH" | "THERAPIST_PROFILE_VIEW" | "APPOINTMENT_BOOK" | "APPOINTMENT_CANCEL" | "WORKSHEET_COMPLETE" | "SETTINGS_CHANGE" | "PASSWORD_CHANGE" | "LOGOUT" | undefined;
}>;
export declare const CreateTherapyProgressDtoSchema: z.ZodObject<{
    clientId: z.ZodString;
    therapistId: z.ZodString;
    progressScore: z.ZodNumber;
    improvementAreas: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    concernAreas: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    goalsSet: z.ZodOptional<z.ZodAny>;
    goalsAchieved: z.ZodOptional<z.ZodAny>;
    nextMilestones: z.ZodOptional<z.ZodAny>;
    moodScore: z.ZodOptional<z.ZodNumber>;
    anxietyScore: z.ZodOptional<z.ZodNumber>;
    depressionScore: z.ZodOptional<z.ZodNumber>;
    functionalScore: z.ZodOptional<z.ZodNumber>;
    therapistNotes: z.ZodOptional<z.ZodString>;
    clientFeedback: z.ZodOptional<z.ZodString>;
    recommendations: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    therapistId: string;
    clientId: string;
    progressScore: number;
    improvementAreas?: string[] | undefined;
    concernAreas?: string[] | undefined;
    goalsSet?: any;
    goalsAchieved?: any;
    nextMilestones?: any;
    moodScore?: number | undefined;
    anxietyScore?: number | undefined;
    depressionScore?: number | undefined;
    functionalScore?: number | undefined;
    therapistNotes?: string | undefined;
    clientFeedback?: string | undefined;
    recommendations?: string[] | undefined;
}, {
    therapistId: string;
    clientId: string;
    progressScore: number;
    improvementAreas?: string[] | undefined;
    concernAreas?: string[] | undefined;
    goalsSet?: any;
    goalsAchieved?: any;
    nextMilestones?: any;
    moodScore?: number | undefined;
    anxietyScore?: number | undefined;
    depressionScore?: number | undefined;
    functionalScore?: number | undefined;
    therapistNotes?: string | undefined;
    clientFeedback?: string | undefined;
    recommendations?: string[] | undefined;
}>;
export declare const GetTherapyProgressQueryDtoSchema: z.ZodObject<{
    clientId: z.ZodOptional<z.ZodString>;
    therapistId: z.ZodOptional<z.ZodString>;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    therapistId?: string | undefined;
    clientId?: string | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
}, {
    therapistId?: string | undefined;
    clientId?: string | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
}>;
export declare const GetSessionStatisticsQueryDtoSchema: z.ZodObject<{
    clientId: z.ZodOptional<z.ZodString>;
    therapistId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    therapistId?: string | undefined;
    clientId?: string | undefined;
}, {
    therapistId?: string | undefined;
    clientId?: string | undefined;
}>;
export declare const SessionCreateDtoSchema: z.ZodObject<{
    clientId: z.ZodString;
    therapistId: z.ZodString;
    scheduledAt: z.ZodString;
    duration: z.ZodNumber;
    sessionType: z.ZodDefault<z.ZodEnum<["video", "audio", "phone", "in_person"]>>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    therapistId: string;
    clientId: string;
    duration: number;
    sessionType: "video" | "audio" | "phone" | "in_person";
    scheduledAt: string;
    notes?: string | undefined;
}, {
    therapistId: string;
    clientId: string;
    duration: number;
    scheduledAt: string;
    notes?: string | undefined;
    sessionType?: "video" | "audio" | "phone" | "in_person" | undefined;
}>;
export declare const SessionUpdateDtoSchema: z.ZodObject<{
    scheduledAt: z.ZodOptional<z.ZodString>;
    duration: z.ZodOptional<z.ZodNumber>;
    sessionType: z.ZodOptional<z.ZodEnum<["video", "audio", "phone", "in_person"]>>;
    notes: z.ZodOptional<z.ZodString>;
    sessionNotes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    duration?: number | undefined;
    notes?: string | undefined;
    sessionNotes?: string | undefined;
    sessionType?: "video" | "audio" | "phone" | "in_person" | undefined;
    scheduledAt?: string | undefined;
}, {
    duration?: number | undefined;
    notes?: string | undefined;
    sessionNotes?: string | undefined;
    sessionType?: "video" | "audio" | "phone" | "in_person" | undefined;
    scheduledAt?: string | undefined;
}>;
export declare const SessionListParamsSchema: z.ZodObject<{
    clientId: z.ZodOptional<z.ZodString>;
    therapistId: z.ZodOptional<z.ZodString>;
    sessionType: z.ZodOptional<z.ZodEnum<["video", "audio", "phone", "in_person"]>>;
    status: z.ZodOptional<z.ZodEnum<["scheduled", "in_progress", "completed", "cancelled", "no_show"]>>;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
    sortBy: z.ZodDefault<z.ZodEnum<["scheduledAt", "createdAt", "duration", "status"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    sortBy: "status" | "createdAt" | "duration" | "scheduledAt";
    sortOrder: "asc" | "desc";
    offset: number;
    status?: "scheduled" | "in_progress" | "completed" | "cancelled" | "no_show" | undefined;
    therapistId?: string | undefined;
    clientId?: string | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    sessionType?: "video" | "audio" | "phone" | "in_person" | undefined;
}, {
    status?: "scheduled" | "in_progress" | "completed" | "cancelled" | "no_show" | undefined;
    therapistId?: string | undefined;
    clientId?: string | undefined;
    limit?: number | undefined;
    sortBy?: "status" | "createdAt" | "duration" | "scheduledAt" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    offset?: number | undefined;
    sessionType?: "video" | "audio" | "phone" | "in_person" | undefined;
}>;
export declare const SessionListResponseSchema: z.ZodObject<{
    sessions: z.ZodArray<z.ZodObject<{
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
        type: "video" | "audio" | "phone" | "in_person";
        status: "scheduled" | "in_progress" | "completed" | "cancelled" | "no_show";
        id: string;
        createdAt: string;
        therapistId: string;
        updatedAt: string;
        clientId: string;
        duration: number;
        scheduledAt: string;
        meetingUrl?: string | undefined;
        notes?: string | undefined;
        startedAt?: string | undefined;
        endedAt?: string | undefined;
        sessionNotes?: string | undefined;
        recordingUrl?: string | undefined;
    }, {
        type: "video" | "audio" | "phone" | "in_person";
        status: "scheduled" | "in_progress" | "completed" | "cancelled" | "no_show";
        id: string;
        createdAt: string;
        therapistId: string;
        updatedAt: string;
        clientId: string;
        duration: number;
        scheduledAt: string;
        meetingUrl?: string | undefined;
        notes?: string | undefined;
        startedAt?: string | undefined;
        endedAt?: string | undefined;
        sessionNotes?: string | undefined;
        recordingUrl?: string | undefined;
    }>, "many">;
    total: z.ZodNumber;
    page: z.ZodNumber;
    limit: z.ZodNumber;
    hasMore: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    sessions: {
        type: "video" | "audio" | "phone" | "in_person";
        status: "scheduled" | "in_progress" | "completed" | "cancelled" | "no_show";
        id: string;
        createdAt: string;
        therapistId: string;
        updatedAt: string;
        clientId: string;
        duration: number;
        scheduledAt: string;
        meetingUrl?: string | undefined;
        notes?: string | undefined;
        startedAt?: string | undefined;
        endedAt?: string | undefined;
        sessionNotes?: string | undefined;
        recordingUrl?: string | undefined;
    }[];
    page: number;
    limit: number;
    hasMore: boolean;
    total: number;
}, {
    sessions: {
        type: "video" | "audio" | "phone" | "in_person";
        status: "scheduled" | "in_progress" | "completed" | "cancelled" | "no_show";
        id: string;
        createdAt: string;
        therapistId: string;
        updatedAt: string;
        clientId: string;
        duration: number;
        scheduledAt: string;
        meetingUrl?: string | undefined;
        notes?: string | undefined;
        startedAt?: string | undefined;
        endedAt?: string | undefined;
        sessionNotes?: string | undefined;
        recordingUrl?: string | undefined;
    }[];
    page: number;
    limit: number;
    hasMore: boolean;
    total: number;
}>;
export declare const SessionStatsSchema: z.ZodObject<{
    totalSessions: z.ZodNumber;
    completedSessions: z.ZodNumber;
    cancelledSessions: z.ZodNumber;
    noShowSessions: z.ZodNumber;
    averageDuration: z.ZodNumber;
    totalDuration: z.ZodNumber;
    completionRate: z.ZodNumber;
    noShowRate: z.ZodNumber;
    cancellationRate: z.ZodNumber;
    sessionsByType: z.ZodRecord<z.ZodString, z.ZodNumber>;
    sessionsByStatus: z.ZodRecord<z.ZodString, z.ZodNumber>;
    monthlyStats: z.ZodArray<z.ZodObject<{
        month: z.ZodString;
        totalSessions: z.ZodNumber;
        completedSessions: z.ZodNumber;
        averageDuration: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        month: string;
        averageDuration: number;
        totalSessions: number;
        completedSessions: number;
    }, {
        month: string;
        averageDuration: number;
        totalSessions: number;
        completedSessions: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    averageDuration: number;
    totalDuration: number;
    completionRate: number;
    totalSessions: number;
    completedSessions: number;
    cancelledSessions: number;
    sessionsByType: Record<string, number>;
    sessionsByStatus: Record<string, number>;
    noShowSessions: number;
    noShowRate: number;
    cancellationRate: number;
    monthlyStats: {
        month: string;
        averageDuration: number;
        totalSessions: number;
        completedSessions: number;
    }[];
}, {
    averageDuration: number;
    totalDuration: number;
    completionRate: number;
    totalSessions: number;
    completedSessions: number;
    cancelledSessions: number;
    sessionsByType: Record<string, number>;
    sessionsByStatus: Record<string, number>;
    noShowSessions: number;
    noShowRate: number;
    cancellationRate: number;
    monthlyStats: {
        month: string;
        averageDuration: number;
        totalSessions: number;
        completedSessions: number;
    }[];
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
export type SessionCreateDto = z.infer<typeof SessionCreateDtoSchema>;
export type SessionUpdateDto = z.infer<typeof SessionUpdateDtoSchema>;
export type SessionListParams = z.infer<typeof SessionListParamsSchema>;
export type SessionListResponse = z.infer<typeof SessionListResponseSchema>;
export type SessionStats = z.infer<typeof SessionStatsSchema>;
//# sourceMappingURL=sessions.d.ts.map