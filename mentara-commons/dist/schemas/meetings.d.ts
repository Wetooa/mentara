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
    status: "scheduled" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show";
    notifyParticipants: boolean;
    reason?: string | undefined;
}, {
    status: "scheduled" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show";
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
    therapistId?: string | undefined;
    clientId?: string | undefined;
    limit?: number | undefined;
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
        quality?: "excellent" | "good" | "fair" | "poor" | undefined;
    }, {
        duration: number;
        startedAt: string;
        endedAt: string;
        participantCount: number;
        issues?: string[] | undefined;
        quality?: "excellent" | "good" | "fair" | "poor" | undefined;
    }>;
    sessionNotes: z.ZodOptional<z.ZodString>;
    clientProgress: z.ZodOptional<z.ZodObject<{
        mood: z.ZodOptional<z.ZodEnum<["excellent", "good", "neutral", "poor", "critical"]>>;
        engagement: z.ZodOptional<z.ZodEnum<["high", "medium", "low"]>>;
        goals: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        outcomes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        mood?: "excellent" | "good" | "poor" | "neutral" | "critical" | undefined;
        engagement?: "high" | "medium" | "low" | undefined;
        goals?: string[] | undefined;
        outcomes?: string[] | undefined;
    }, {
        mood?: "excellent" | "good" | "poor" | "neutral" | "critical" | undefined;
        engagement?: "high" | "medium" | "low" | undefined;
        goals?: string[] | undefined;
        outcomes?: string[] | undefined;
    }>>;
    followUpActions: z.ZodOptional<z.ZodArray<z.ZodObject<{
        action: z.ZodString;
        priority: z.ZodDefault<z.ZodEnum<["high", "medium", "low"]>>;
        dueDate: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        action: string;
        priority: "high" | "medium" | "low";
        dueDate?: string | undefined;
    }, {
        action: string;
        priority?: "high" | "medium" | "low" | undefined;
        dueDate?: string | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    sessionData: {
        duration: number;
        startedAt: string;
        endedAt: string;
        participantCount: number;
        issues?: string[] | undefined;
        quality?: "excellent" | "good" | "fair" | "poor" | undefined;
    };
    sessionNotes?: string | undefined;
    clientProgress?: {
        mood?: "excellent" | "good" | "poor" | "neutral" | "critical" | undefined;
        engagement?: "high" | "medium" | "low" | undefined;
        goals?: string[] | undefined;
        outcomes?: string[] | undefined;
    } | undefined;
    followUpActions?: {
        action: string;
        priority: "high" | "medium" | "low";
        dueDate?: string | undefined;
    }[] | undefined;
}, {
    sessionData: {
        duration: number;
        startedAt: string;
        endedAt: string;
        participantCount: number;
        issues?: string[] | undefined;
        quality?: "excellent" | "good" | "fair" | "poor" | undefined;
    };
    sessionNotes?: string | undefined;
    clientProgress?: {
        mood?: "excellent" | "good" | "poor" | "neutral" | "critical" | undefined;
        engagement?: "high" | "medium" | "low" | undefined;
        goals?: string[] | undefined;
        outcomes?: string[] | undefined;
    } | undefined;
    followUpActions?: {
        action: string;
        priority?: "high" | "medium" | "low" | undefined;
        dueDate?: string | undefined;
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
    reason: "technical_issues" | "emergency" | "safety_concern" | "participant_request";
    description: string;
    notifySupport: boolean;
    followUpRequired: boolean;
    escalateToSupervisor: boolean;
}, {
    reason: "technical_issues" | "emergency" | "safety_concern" | "participant_request";
    description: string;
    notifySupport?: boolean | undefined;
    followUpRequired?: boolean | undefined;
    escalateToSupervisor?: boolean | undefined;
}>;
export type MeetingParamsDto = z.infer<typeof MeetingParamsDtoSchema>;
export type UpdateMeetingStatusDto = z.infer<typeof UpdateMeetingStatusDtoSchema>;
export type GetUpcomingMeetingsQueryDto = z.infer<typeof GetUpcomingMeetingsQueryDtoSchema>;
export type SaveMeetingSessionDto = z.infer<typeof SaveMeetingSessionDtoSchema>;
export type GetMeetingAnalyticsQueryDto = z.infer<typeof GetMeetingAnalyticsQueryDtoSchema>;
export type EmergencyTerminateMeetingDto = z.infer<typeof EmergencyTerminateMeetingDtoSchema>;
export declare const SessionMeetingSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    startTime: z.ZodString;
    endTime: z.ZodString;
    status: z.ZodEnum<["scheduled", "confirmed", "in_progress", "completed", "cancelled", "no_show"]>;
    type: z.ZodEnum<["video", "audio", "chat"]>;
    therapistId: z.ZodString;
    clientId: z.ZodString;
    roomUrl: z.ZodOptional<z.ZodString>;
    roomToken: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    therapist: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        firstName: z.ZodString;
        lastName: z.ZodString;
        profileImage: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        firstName: string;
        lastName: string;
        profileImage?: string | undefined;
    }, {
        id: string;
        firstName: string;
        lastName: string;
        profileImage?: string | undefined;
    }>>;
    client: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        firstName: z.ZodString;
        lastName: z.ZodString;
        profileImage: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        firstName: string;
        lastName: string;
        profileImage?: string | undefined;
    }, {
        id: string;
        firstName: string;
        lastName: string;
        profileImage?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: string;
    updatedAt: string;
    type: "video" | "audio" | "chat";
    status: "scheduled" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show";
    title: string;
    therapistId: string;
    clientId: string;
    startTime: string;
    endTime: string;
    client?: {
        id: string;
        firstName: string;
        lastName: string;
        profileImage?: string | undefined;
    } | undefined;
    therapist?: {
        id: string;
        firstName: string;
        lastName: string;
        profileImage?: string | undefined;
    } | undefined;
    description?: string | undefined;
    notes?: string | undefined;
    roomUrl?: string | undefined;
    roomToken?: string | undefined;
}, {
    id: string;
    createdAt: string;
    updatedAt: string;
    type: "video" | "audio" | "chat";
    status: "scheduled" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show";
    title: string;
    therapistId: string;
    clientId: string;
    startTime: string;
    endTime: string;
    client?: {
        id: string;
        firstName: string;
        lastName: string;
        profileImage?: string | undefined;
    } | undefined;
    therapist?: {
        id: string;
        firstName: string;
        lastName: string;
        profileImage?: string | undefined;
    } | undefined;
    description?: string | undefined;
    notes?: string | undefined;
    roomUrl?: string | undefined;
    roomToken?: string | undefined;
}>;
export declare const MeetingSessionDataSchema: z.ZodObject<{
    meetingId: z.ZodString;
    duration: z.ZodNumber;
    startedAt: z.ZodString;
    endedAt: z.ZodString;
    participantCount: z.ZodNumber;
    quality: z.ZodOptional<z.ZodEnum<["excellent", "good", "fair", "poor"]>>;
    issues: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    sessionNotes: z.ZodOptional<z.ZodString>;
    clientProgress: z.ZodOptional<z.ZodObject<{
        mood: z.ZodOptional<z.ZodEnum<["excellent", "good", "neutral", "poor", "critical"]>>;
        engagement: z.ZodOptional<z.ZodEnum<["high", "medium", "low"]>>;
        goals: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        outcomes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        mood?: "excellent" | "good" | "poor" | "neutral" | "critical" | undefined;
        engagement?: "high" | "medium" | "low" | undefined;
        goals?: string[] | undefined;
        outcomes?: string[] | undefined;
    }, {
        mood?: "excellent" | "good" | "poor" | "neutral" | "critical" | undefined;
        engagement?: "high" | "medium" | "low" | undefined;
        goals?: string[] | undefined;
        outcomes?: string[] | undefined;
    }>>;
    followUpActions: z.ZodOptional<z.ZodArray<z.ZodObject<{
        action: z.ZodString;
        priority: z.ZodEnum<["high", "medium", "low"]>;
        dueDate: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        action: string;
        priority: "high" | "medium" | "low";
        dueDate?: string | undefined;
    }, {
        action: string;
        priority: "high" | "medium" | "low";
        dueDate?: string | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    meetingId: string;
    duration: number;
    startedAt: string;
    endedAt: string;
    participantCount: number;
    issues?: string[] | undefined;
    quality?: "excellent" | "good" | "fair" | "poor" | undefined;
    sessionNotes?: string | undefined;
    clientProgress?: {
        mood?: "excellent" | "good" | "poor" | "neutral" | "critical" | undefined;
        engagement?: "high" | "medium" | "low" | undefined;
        goals?: string[] | undefined;
        outcomes?: string[] | undefined;
    } | undefined;
    followUpActions?: {
        action: string;
        priority: "high" | "medium" | "low";
        dueDate?: string | undefined;
    }[] | undefined;
}, {
    meetingId: string;
    duration: number;
    startedAt: string;
    endedAt: string;
    participantCount: number;
    issues?: string[] | undefined;
    quality?: "excellent" | "good" | "fair" | "poor" | undefined;
    sessionNotes?: string | undefined;
    clientProgress?: {
        mood?: "excellent" | "good" | "poor" | "neutral" | "critical" | undefined;
        engagement?: "high" | "medium" | "low" | undefined;
        goals?: string[] | undefined;
        outcomes?: string[] | undefined;
    } | undefined;
    followUpActions?: {
        action: string;
        priority: "high" | "medium" | "low";
        dueDate?: string | undefined;
    }[] | undefined;
}>;
export declare const MeetingAnalyticsSchema: z.ZodObject<{
    totalMeetings: z.ZodNumber;
    totalDuration: z.ZodNumber;
    averageDuration: z.ZodNumber;
    meetingsByType: z.ZodObject<{
        video: z.ZodNumber;
        audio: z.ZodNumber;
        chat: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        video: number;
        audio: number;
        chat: number;
    }, {
        video: number;
        audio: number;
        chat: number;
    }>;
    completionRate: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    averageDuration: number;
    totalMeetings: number;
    totalDuration: number;
    meetingsByType: {
        video: number;
        audio: number;
        chat: number;
    };
    completionRate: number;
}, {
    averageDuration: number;
    totalMeetings: number;
    totalDuration: number;
    meetingsByType: {
        video: number;
        audio: number;
        chat: number;
    };
    completionRate: number;
}>;
export declare const MeetingRoomResponseSchema: z.ZodObject<{
    roomUrl: z.ZodString;
    roomToken: z.ZodString;
    meetingId: z.ZodString;
    expires: z.ZodString;
}, "strip", z.ZodTypeAny, {
    meetingId: string;
    roomUrl: string;
    roomToken: string;
    expires: string;
}, {
    meetingId: string;
    roomUrl: string;
    roomToken: string;
    expires: string;
}>;
export declare const MeetingStatusUpdateSchema: z.ZodObject<{
    status: z.ZodEnum<["scheduled", "confirmed", "in_progress", "completed", "cancelled", "no_show"]>;
    reason: z.ZodOptional<z.ZodString>;
    notifyParticipants: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    status: "scheduled" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show";
    reason?: string | undefined;
    notifyParticipants?: boolean | undefined;
}, {
    status: "scheduled" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show";
    reason?: string | undefined;
    notifyParticipants?: boolean | undefined;
}>;
export declare const EmergencyTerminationRequestSchema: z.ZodObject<{
    reason: z.ZodEnum<["technical_issues", "emergency", "safety_concern", "participant_request"]>;
    description: z.ZodString;
    notifySupport: z.ZodOptional<z.ZodBoolean>;
    followUpRequired: z.ZodOptional<z.ZodBoolean>;
    escalateToSupervisor: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    reason: "technical_issues" | "emergency" | "safety_concern" | "participant_request";
    description: string;
    notifySupport?: boolean | undefined;
    followUpRequired?: boolean | undefined;
    escalateToSupervisor?: boolean | undefined;
}, {
    reason: "technical_issues" | "emergency" | "safety_concern" | "participant_request";
    description: string;
    notifySupport?: boolean | undefined;
    followUpRequired?: boolean | undefined;
    escalateToSupervisor?: boolean | undefined;
}>;
export declare const CreateVideoRoomDtoSchema: z.ZodObject<{
    meetingId: z.ZodString;
    roomType: z.ZodDefault<z.ZodEnum<["video", "audio", "screen_share"]>>;
    maxParticipants: z.ZodDefault<z.ZodNumber>;
    enableRecording: z.ZodDefault<z.ZodBoolean>;
    enableChat: z.ZodDefault<z.ZodBoolean>;
    recordingSettings: z.ZodOptional<z.ZodObject<{
        autoStart: z.ZodDefault<z.ZodBoolean>;
        layout: z.ZodDefault<z.ZodEnum<["gallery", "speaker", "custom"]>>;
    }, "strip", z.ZodTypeAny, {
        autoStart: boolean;
        layout: "custom" | "gallery" | "speaker";
    }, {
        autoStart?: boolean | undefined;
        layout?: "custom" | "gallery" | "speaker" | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    meetingId: string;
    roomType: "video" | "audio" | "screen_share";
    maxParticipants: number;
    enableRecording: boolean;
    enableChat: boolean;
    recordingSettings?: {
        autoStart: boolean;
        layout: "custom" | "gallery" | "speaker";
    } | undefined;
}, {
    meetingId: string;
    roomType?: "video" | "audio" | "screen_share" | undefined;
    maxParticipants?: number | undefined;
    enableRecording?: boolean | undefined;
    enableChat?: boolean | undefined;
    recordingSettings?: {
        autoStart?: boolean | undefined;
        layout?: "custom" | "gallery" | "speaker" | undefined;
    } | undefined;
}>;
export declare const JoinVideoRoomDtoSchema: z.ZodObject<{
    meetingId: z.ZodString;
    participantName: z.ZodString;
    role: z.ZodEnum<["therapist", "client"]>;
    devicePreferences: z.ZodOptional<z.ZodObject<{
        video: z.ZodDefault<z.ZodBoolean>;
        audio: z.ZodDefault<z.ZodBoolean>;
        screenShare: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        video: boolean;
        audio: boolean;
        screenShare: boolean;
    }, {
        video?: boolean | undefined;
        audio?: boolean | undefined;
        screenShare?: boolean | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    role: "client" | "therapist";
    meetingId: string;
    participantName: string;
    devicePreferences?: {
        video: boolean;
        audio: boolean;
        screenShare: boolean;
    } | undefined;
}, {
    role: "client" | "therapist";
    meetingId: string;
    participantName: string;
    devicePreferences?: {
        video?: boolean | undefined;
        audio?: boolean | undefined;
        screenShare?: boolean | undefined;
    } | undefined;
}>;
export declare const VideoRoomResponseSchema: z.ZodObject<{
    roomId: z.ZodString;
    roomUrl: z.ZodString;
    accessToken: z.ZodString;
    participantToken: z.ZodString;
    roomConfig: z.ZodObject<{
        maxParticipants: z.ZodNumber;
        enableRecording: z.ZodBoolean;
        enableChat: z.ZodBoolean;
        recordingActive: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        maxParticipants: number;
        enableRecording: boolean;
        enableChat: boolean;
        recordingActive: boolean;
    }, {
        maxParticipants: number;
        enableRecording: boolean;
        enableChat: boolean;
        recordingActive: boolean;
    }>;
    expiresAt: z.ZodString;
    participantCount: z.ZodNumber;
    status: z.ZodEnum<["waiting", "active", "ended"]>;
}, "strip", z.ZodTypeAny, {
    status: "waiting" | "active" | "ended";
    participantCount: number;
    roomUrl: string;
    roomId: string;
    accessToken: string;
    participantToken: string;
    roomConfig: {
        maxParticipants: number;
        enableRecording: boolean;
        enableChat: boolean;
        recordingActive: boolean;
    };
    expiresAt: string;
}, {
    status: "waiting" | "active" | "ended";
    participantCount: number;
    roomUrl: string;
    roomId: string;
    accessToken: string;
    participantToken: string;
    roomConfig: {
        maxParticipants: number;
        enableRecording: boolean;
        enableChat: boolean;
        recordingActive: boolean;
    };
    expiresAt: string;
}>;
export declare const EndVideoCallDtoSchema: z.ZodObject<{
    meetingId: z.ZodString;
    endReason: z.ZodDefault<z.ZodEnum<["session_complete", "technical_issues", "participant_left", "emergency"]>>;
    sessionSummary: z.ZodOptional<z.ZodObject<{
        duration: z.ZodNumber;
        participantCount: z.ZodNumber;
        connectionQuality: z.ZodOptional<z.ZodEnum<["excellent", "good", "fair", "poor"]>>;
        technicalIssues: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        duration: number;
        participantCount: number;
        connectionQuality?: "excellent" | "good" | "fair" | "poor" | undefined;
        technicalIssues?: string[] | undefined;
    }, {
        duration: number;
        participantCount: number;
        connectionQuality?: "excellent" | "good" | "fair" | "poor" | undefined;
        technicalIssues?: string[] | undefined;
    }>>;
    nextSteps: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    meetingId: string;
    endReason: "technical_issues" | "emergency" | "session_complete" | "participant_left";
    sessionSummary?: {
        duration: number;
        participantCount: number;
        connectionQuality?: "excellent" | "good" | "fair" | "poor" | undefined;
        technicalIssues?: string[] | undefined;
    } | undefined;
    nextSteps?: string | undefined;
}, {
    meetingId: string;
    endReason?: "technical_issues" | "emergency" | "session_complete" | "participant_left" | undefined;
    sessionSummary?: {
        duration: number;
        participantCount: number;
        connectionQuality?: "excellent" | "good" | "fair" | "poor" | undefined;
        technicalIssues?: string[] | undefined;
    } | undefined;
    nextSteps?: string | undefined;
}>;
export declare const VideoCallStatusSchema: z.ZodObject<{
    meetingId: z.ZodString;
    roomId: z.ZodString;
    status: z.ZodEnum<["waiting", "active", "ended", "error"]>;
    participants: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        role: z.ZodEnum<["therapist", "client"]>;
        joinedAt: z.ZodString;
        connectionStatus: z.ZodEnum<["connected", "connecting", "disconnected"]>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        role: "client" | "therapist";
        name: string;
        joinedAt: string;
        connectionStatus: "connected" | "connecting" | "disconnected";
    }, {
        id: string;
        role: "client" | "therapist";
        name: string;
        joinedAt: string;
        connectionStatus: "connected" | "connecting" | "disconnected";
    }>, "many">;
    startedAt: z.ZodOptional<z.ZodString>;
    endedAt: z.ZodOptional<z.ZodString>;
    duration: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    status: "waiting" | "active" | "ended" | "error";
    meetingId: string;
    roomId: string;
    participants: {
        id: string;
        role: "client" | "therapist";
        name: string;
        joinedAt: string;
        connectionStatus: "connected" | "connecting" | "disconnected";
    }[];
    duration?: number | undefined;
    startedAt?: string | undefined;
    endedAt?: string | undefined;
}, {
    status: "waiting" | "active" | "ended" | "error";
    meetingId: string;
    roomId: string;
    participants: {
        id: string;
        role: "client" | "therapist";
        name: string;
        joinedAt: string;
        connectionStatus: "connected" | "connecting" | "disconnected";
    }[];
    duration?: number | undefined;
    startedAt?: string | undefined;
    endedAt?: string | undefined;
}>;
export type SessionMeeting = z.infer<typeof SessionMeetingSchema>;
export type MeetingSessionData = z.infer<typeof MeetingSessionDataSchema>;
export type MeetingAnalytics = z.infer<typeof MeetingAnalyticsSchema>;
export type MeetingRoomResponse = z.infer<typeof MeetingRoomResponseSchema>;
export type MeetingStatusUpdate = z.infer<typeof MeetingStatusUpdateSchema>;
export type EmergencyTerminationRequest = z.infer<typeof EmergencyTerminationRequestSchema>;
export type CreateVideoRoomDto = z.infer<typeof CreateVideoRoomDtoSchema>;
export type JoinVideoRoomDto = z.infer<typeof JoinVideoRoomDtoSchema>;
export type VideoRoomResponse = z.infer<typeof VideoRoomResponseSchema>;
export type EndVideoCallDto = z.infer<typeof EndVideoCallDtoSchema>;
export type VideoCallStatus = z.infer<typeof VideoCallStatusSchema>;
//# sourceMappingURL=meetings.d.ts.map