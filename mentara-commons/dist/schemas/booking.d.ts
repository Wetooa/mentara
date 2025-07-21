import { z } from 'zod';
export declare const MeetingStatusSchema: z.ZodEnum<["scheduled", "confirmed", "in_progress", "completed", "cancelled", "no_show"]>;
export declare const MeetingTypeSchema: z.ZodEnum<["video", "audio", "phone", "chat", "in-person"]>;
export declare const MeetingDurationSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    duration: z.ZodNumber;
    isActive: z.ZodBoolean;
    sortOrder: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    duration: number;
    isActive: boolean;
    sortOrder: number;
}, {
    id: string;
    name: string;
    duration: number;
    isActive: boolean;
    sortOrder: number;
}>;
export declare const AvailableSlotSchema: z.ZodObject<{
    startTime: z.ZodString;
    availableDurations: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        duration: z.ZodNumber;
        isActive: z.ZodBoolean;
        sortOrder: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        duration: number;
        isActive: boolean;
        sortOrder: number;
    }, {
        id: string;
        name: string;
        duration: number;
        isActive: boolean;
        sortOrder: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    startTime: string;
    availableDurations: {
        id: string;
        name: string;
        duration: number;
        isActive: boolean;
        sortOrder: number;
    }[];
}, {
    startTime: string;
    availableDurations: {
        id: string;
        name: string;
        duration: number;
        isActive: boolean;
        sortOrder: number;
    }[];
}>;
export declare const MeetingClientSchema: z.ZodObject<{
    id: z.ZodString;
    user: z.ZodObject<{
        firstName: z.ZodNullable<z.ZodString>;
        lastName: z.ZodNullable<z.ZodString>;
        email: z.ZodNullable<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        firstName: string | null;
        lastName: string | null;
        email: string | null;
    }, {
        firstName: string | null;
        lastName: string | null;
        email: string | null;
    }>;
}, "strip", z.ZodTypeAny, {
    id: string;
    user: {
        firstName: string | null;
        lastName: string | null;
        email: string | null;
    };
}, {
    id: string;
    user: {
        firstName: string | null;
        lastName: string | null;
        email: string | null;
    };
}>;
export declare const MeetingTherapistSchema: z.ZodObject<{
    id: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    email: z.ZodString;
    title: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    title?: string | undefined;
}, {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    title?: string | undefined;
}>;
export declare const MeetingSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    startTime: z.ZodString;
    duration: z.ZodNumber;
    status: z.ZodEnum<["scheduled", "confirmed", "in_progress", "completed", "cancelled", "no_show"]>;
    meetingType: z.ZodOptional<z.ZodEnum<["video", "audio", "phone", "chat", "in-person"]>>;
    meetingUrl: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    clientId: z.ZodString;
    therapistId: z.ZodString;
    client: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        user: z.ZodObject<{
            firstName: z.ZodNullable<z.ZodString>;
            lastName: z.ZodNullable<z.ZodString>;
            email: z.ZodNullable<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            firstName: string | null;
            lastName: string | null;
            email: string | null;
        }, {
            firstName: string | null;
            lastName: string | null;
            email: string | null;
        }>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        user: {
            firstName: string | null;
            lastName: string | null;
            email: string | null;
        };
    }, {
        id: string;
        user: {
            firstName: string | null;
            lastName: string | null;
            email: string | null;
        };
    }>>;
    therapist: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        firstName: z.ZodString;
        lastName: z.ZodString;
        email: z.ZodString;
        title: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        title?: string | undefined;
    }, {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        title?: string | undefined;
    }>>;
    durationConfig: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        duration: z.ZodNumber;
        isActive: z.ZodBoolean;
        sortOrder: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        duration: number;
        isActive: boolean;
        sortOrder: number;
    }, {
        id: string;
        name: string;
        duration: number;
        isActive: boolean;
        sortOrder: number;
    }>>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    status: "completed" | "cancelled" | "in_progress" | "scheduled" | "no_show" | "confirmed";
    createdAt: string;
    duration: number;
    therapistId: string;
    updatedAt: string;
    startTime: string;
    clientId: string;
    title?: string | undefined;
    meetingUrl?: string | undefined;
    client?: {
        id: string;
        user: {
            firstName: string | null;
            lastName: string | null;
            email: string | null;
        };
    } | undefined;
    therapist?: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        title?: string | undefined;
    } | undefined;
    description?: string | undefined;
    notes?: string | undefined;
    meetingType?: "audio" | "video" | "phone" | "in-person" | "chat" | undefined;
    durationConfig?: {
        id: string;
        name: string;
        duration: number;
        isActive: boolean;
        sortOrder: number;
    } | undefined;
}, {
    id: string;
    status: "completed" | "cancelled" | "in_progress" | "scheduled" | "no_show" | "confirmed";
    createdAt: string;
    duration: number;
    therapistId: string;
    updatedAt: string;
    startTime: string;
    clientId: string;
    title?: string | undefined;
    meetingUrl?: string | undefined;
    client?: {
        id: string;
        user: {
            firstName: string | null;
            lastName: string | null;
            email: string | null;
        };
    } | undefined;
    therapist?: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        title?: string | undefined;
    } | undefined;
    description?: string | undefined;
    notes?: string | undefined;
    meetingType?: "audio" | "video" | "phone" | "in-person" | "chat" | undefined;
    durationConfig?: {
        id: string;
        name: string;
        duration: number;
        isActive: boolean;
        sortOrder: number;
    } | undefined;
}>;
export declare const CreateMeetingRequestSchema: z.ZodObject<{
    therapistId: z.ZodString;
    startTime: z.ZodString;
    duration: z.ZodNumber;
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    meetingType: z.ZodDefault<z.ZodOptional<z.ZodEnum<["video", "audio", "phone", "chat", "in-person"]>>>;
}, "strip", z.ZodTypeAny, {
    duration: number;
    therapistId: string;
    startTime: string;
    meetingType: "audio" | "video" | "phone" | "in-person" | "chat";
    title?: string | undefined;
    description?: string | undefined;
}, {
    duration: number;
    therapistId: string;
    startTime: string;
    title?: string | undefined;
    description?: string | undefined;
    meetingType?: "audio" | "video" | "phone" | "in-person" | "chat" | undefined;
}>;
export declare const UpdateMeetingRequestSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["scheduled", "confirmed", "in_progress", "completed", "cancelled", "no_show"]>>;
    meetingUrl: z.ZodOptional<z.ZodString>;
    startTime: z.ZodOptional<z.ZodString>;
    duration: z.ZodOptional<z.ZodNumber>;
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    meetingType: z.ZodOptional<z.ZodEnum<["video", "audio", "phone", "chat", "in-person"]>>;
}, "strip", z.ZodTypeAny, {
    status?: "completed" | "cancelled" | "in_progress" | "scheduled" | "no_show" | "confirmed" | undefined;
    title?: string | undefined;
    meetingUrl?: string | undefined;
    duration?: number | undefined;
    startTime?: string | undefined;
    description?: string | undefined;
    meetingType?: "audio" | "video" | "phone" | "in-person" | "chat" | undefined;
}, {
    status?: "completed" | "cancelled" | "in_progress" | "scheduled" | "no_show" | "confirmed" | undefined;
    title?: string | undefined;
    meetingUrl?: string | undefined;
    duration?: number | undefined;
    startTime?: string | undefined;
    description?: string | undefined;
    meetingType?: "audio" | "video" | "phone" | "in-person" | "chat" | undefined;
}>;
export declare const BookingFormDataSchema: z.ZodObject<{
    date: z.ZodString;
    timeSlot: z.ZodObject<{
        startTime: z.ZodString;
        availableDurations: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            duration: z.ZodNumber;
            isActive: z.ZodBoolean;
            sortOrder: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            id: string;
            name: string;
            duration: number;
            isActive: boolean;
            sortOrder: number;
        }, {
            id: string;
            name: string;
            duration: number;
            isActive: boolean;
            sortOrder: number;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        startTime: string;
        availableDurations: {
            id: string;
            name: string;
            duration: number;
            isActive: boolean;
            sortOrder: number;
        }[];
    }, {
        startTime: string;
        availableDurations: {
            id: string;
            name: string;
            duration: number;
            isActive: boolean;
            sortOrder: number;
        }[];
    }>;
    duration: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        duration: z.ZodNumber;
        isActive: z.ZodBoolean;
        sortOrder: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        duration: number;
        isActive: boolean;
        sortOrder: number;
    }, {
        id: string;
        name: string;
        duration: number;
        isActive: boolean;
        sortOrder: number;
    }>;
    meetingType: z.ZodEnum<["video", "audio", "phone", "chat", "in-person"]>;
    title: z.ZodString;
    description: z.ZodString;
}, "strip", z.ZodTypeAny, {
    date: string;
    title: string;
    duration: {
        id: string;
        name: string;
        duration: number;
        isActive: boolean;
        sortOrder: number;
    };
    description: string;
    meetingType: "audio" | "video" | "phone" | "in-person" | "chat";
    timeSlot: {
        startTime: string;
        availableDurations: {
            id: string;
            name: string;
            duration: number;
            isActive: boolean;
            sortOrder: number;
        }[];
    };
}, {
    date: string;
    title: string;
    duration: {
        id: string;
        name: string;
        duration: number;
        isActive: boolean;
        sortOrder: number;
    };
    description: string;
    meetingType: "audio" | "video" | "phone" | "in-person" | "chat";
    timeSlot: {
        startTime: string;
        availableDurations: {
            id: string;
            name: string;
            duration: number;
            isActive: boolean;
            sortOrder: number;
        }[];
    };
}>;
export declare const MeetingListParamsSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["scheduled", "confirmed", "in_progress", "completed", "cancelled", "no_show"]>>;
    therapistId: z.ZodOptional<z.ZodString>;
    clientId: z.ZodOptional<z.ZodString>;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
    page: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
    sortBy: z.ZodOptional<z.ZodEnum<["startTime", "status", "createdAt"]>>;
    sortOrder: z.ZodOptional<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    status?: "completed" | "cancelled" | "in_progress" | "scheduled" | "no_show" | "confirmed" | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    therapistId?: string | undefined;
    sortBy?: "status" | "createdAt" | "startTime" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    clientId?: string | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
}, {
    status?: "completed" | "cancelled" | "in_progress" | "scheduled" | "no_show" | "confirmed" | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    therapistId?: string | undefined;
    sortBy?: "status" | "createdAt" | "startTime" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    clientId?: string | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
}>;
export declare const MeetingListResponseSchema: z.ZodObject<{
    meetings: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        title: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        startTime: z.ZodString;
        duration: z.ZodNumber;
        status: z.ZodEnum<["scheduled", "confirmed", "in_progress", "completed", "cancelled", "no_show"]>;
        meetingType: z.ZodOptional<z.ZodEnum<["video", "audio", "phone", "chat", "in-person"]>>;
        meetingUrl: z.ZodOptional<z.ZodString>;
        notes: z.ZodOptional<z.ZodString>;
        clientId: z.ZodString;
        therapistId: z.ZodString;
        client: z.ZodOptional<z.ZodObject<{
            id: z.ZodString;
            user: z.ZodObject<{
                firstName: z.ZodNullable<z.ZodString>;
                lastName: z.ZodNullable<z.ZodString>;
                email: z.ZodNullable<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                firstName: string | null;
                lastName: string | null;
                email: string | null;
            }, {
                firstName: string | null;
                lastName: string | null;
                email: string | null;
            }>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            user: {
                firstName: string | null;
                lastName: string | null;
                email: string | null;
            };
        }, {
            id: string;
            user: {
                firstName: string | null;
                lastName: string | null;
                email: string | null;
            };
        }>>;
        therapist: z.ZodOptional<z.ZodObject<{
            id: z.ZodString;
            firstName: z.ZodString;
            lastName: z.ZodString;
            email: z.ZodString;
            title: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            firstName: string;
            lastName: string;
            email: string;
            title?: string | undefined;
        }, {
            id: string;
            firstName: string;
            lastName: string;
            email: string;
            title?: string | undefined;
        }>>;
        durationConfig: z.ZodOptional<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            duration: z.ZodNumber;
            isActive: z.ZodBoolean;
            sortOrder: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            id: string;
            name: string;
            duration: number;
            isActive: boolean;
            sortOrder: number;
        }, {
            id: string;
            name: string;
            duration: number;
            isActive: boolean;
            sortOrder: number;
        }>>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        status: "completed" | "cancelled" | "in_progress" | "scheduled" | "no_show" | "confirmed";
        createdAt: string;
        duration: number;
        therapistId: string;
        updatedAt: string;
        startTime: string;
        clientId: string;
        title?: string | undefined;
        meetingUrl?: string | undefined;
        client?: {
            id: string;
            user: {
                firstName: string | null;
                lastName: string | null;
                email: string | null;
            };
        } | undefined;
        therapist?: {
            id: string;
            firstName: string;
            lastName: string;
            email: string;
            title?: string | undefined;
        } | undefined;
        description?: string | undefined;
        notes?: string | undefined;
        meetingType?: "audio" | "video" | "phone" | "in-person" | "chat" | undefined;
        durationConfig?: {
            id: string;
            name: string;
            duration: number;
            isActive: boolean;
            sortOrder: number;
        } | undefined;
    }, {
        id: string;
        status: "completed" | "cancelled" | "in_progress" | "scheduled" | "no_show" | "confirmed";
        createdAt: string;
        duration: number;
        therapistId: string;
        updatedAt: string;
        startTime: string;
        clientId: string;
        title?: string | undefined;
        meetingUrl?: string | undefined;
        client?: {
            id: string;
            user: {
                firstName: string | null;
                lastName: string | null;
                email: string | null;
            };
        } | undefined;
        therapist?: {
            id: string;
            firstName: string;
            lastName: string;
            email: string;
            title?: string | undefined;
        } | undefined;
        description?: string | undefined;
        notes?: string | undefined;
        meetingType?: "audio" | "video" | "phone" | "in-person" | "chat" | undefined;
        durationConfig?: {
            id: string;
            name: string;
            duration: number;
            isActive: boolean;
            sortOrder: number;
        } | undefined;
    }>, "many">;
    totalCount: z.ZodNumber;
    page: z.ZodNumber;
    pageSize: z.ZodNumber;
    totalPages: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    page: number;
    totalCount: number;
    pageSize: number;
    totalPages: number;
    meetings: {
        id: string;
        status: "completed" | "cancelled" | "in_progress" | "scheduled" | "no_show" | "confirmed";
        createdAt: string;
        duration: number;
        therapistId: string;
        updatedAt: string;
        startTime: string;
        clientId: string;
        title?: string | undefined;
        meetingUrl?: string | undefined;
        client?: {
            id: string;
            user: {
                firstName: string | null;
                lastName: string | null;
                email: string | null;
            };
        } | undefined;
        therapist?: {
            id: string;
            firstName: string;
            lastName: string;
            email: string;
            title?: string | undefined;
        } | undefined;
        description?: string | undefined;
        notes?: string | undefined;
        meetingType?: "audio" | "video" | "phone" | "in-person" | "chat" | undefined;
        durationConfig?: {
            id: string;
            name: string;
            duration: number;
            isActive: boolean;
            sortOrder: number;
        } | undefined;
    }[];
}, {
    page: number;
    totalCount: number;
    pageSize: number;
    totalPages: number;
    meetings: {
        id: string;
        status: "completed" | "cancelled" | "in_progress" | "scheduled" | "no_show" | "confirmed";
        createdAt: string;
        duration: number;
        therapistId: string;
        updatedAt: string;
        startTime: string;
        clientId: string;
        title?: string | undefined;
        meetingUrl?: string | undefined;
        client?: {
            id: string;
            user: {
                firstName: string | null;
                lastName: string | null;
                email: string | null;
            };
        } | undefined;
        therapist?: {
            id: string;
            firstName: string;
            lastName: string;
            email: string;
            title?: string | undefined;
        } | undefined;
        description?: string | undefined;
        notes?: string | undefined;
        meetingType?: "audio" | "video" | "phone" | "in-person" | "chat" | undefined;
        durationConfig?: {
            id: string;
            name: string;
            duration: number;
            isActive: boolean;
            sortOrder: number;
        } | undefined;
    }[];
}>;
export declare const DurationSchema: z.ZodObject<{
    id: z.ZodString;
    duration: z.ZodNumber;
    name: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    duration: number;
}, {
    id: string;
    name: string;
    duration: number;
}>;
export declare const TimeRangeSchema: z.ZodObject<{
    start: z.ZodString;
    end: z.ZodString;
}, "strip", z.ZodTypeAny, {
    start: string;
    end: string;
}, {
    start: string;
    end: string;
}>;
export declare const ConflictResultSchema: z.ZodObject<{
    hasConflict: z.ZodBoolean;
    conflictingMeetings: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        title: z.ZodOptional<z.ZodString>;
        startTime: z.ZodString;
        duration: z.ZodNumber;
        status: z.ZodEnum<["scheduled", "confirmed", "in_progress", "completed", "cancelled", "no_show"]>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        status: "completed" | "cancelled" | "in_progress" | "scheduled" | "no_show" | "confirmed";
        duration: number;
        startTime: string;
        title?: string | undefined;
    }, {
        id: string;
        status: "completed" | "cancelled" | "in_progress" | "scheduled" | "no_show" | "confirmed";
        duration: number;
        startTime: string;
        title?: string | undefined;
    }>, "many">;
    message: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    hasConflict: boolean;
    conflictingMeetings: {
        id: string;
        status: "completed" | "cancelled" | "in_progress" | "scheduled" | "no_show" | "confirmed";
        duration: number;
        startTime: string;
        title?: string | undefined;
    }[];
    message?: string | undefined;
}, {
    hasConflict: boolean;
    conflictingMeetings: {
        id: string;
        status: "completed" | "cancelled" | "in_progress" | "scheduled" | "no_show" | "confirmed";
        duration: number;
        startTime: string;
        title?: string | undefined;
    }[];
    message?: string | undefined;
}>;
export declare const SlotGenerationConfigSchema: z.ZodObject<{
    therapistId: z.ZodString;
    startDate: z.ZodString;
    endDate: z.ZodString;
    workingHours: z.ZodObject<{
        start: z.ZodString;
        end: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        start: string;
        end: string;
    }, {
        start: string;
        end: string;
    }>;
    slotDuration: z.ZodNumber;
    breakDuration: z.ZodDefault<z.ZodNumber>;
    excludeWeekends: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    therapistId: string;
    startDate: string;
    endDate: string;
    workingHours: {
        start: string;
        end: string;
    };
    slotDuration: number;
    breakDuration: number;
    excludeWeekends: boolean;
}, {
    therapistId: string;
    startDate: string;
    endDate: string;
    workingHours: {
        start: string;
        end: string;
    };
    slotDuration: number;
    breakDuration?: number | undefined;
    excludeWeekends?: boolean | undefined;
}>;
export declare const TimeSlotSchema: z.ZodObject<{
    startTime: z.ZodString;
    endTime: z.ZodString;
    isAvailable: z.ZodBoolean;
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    startTime: string;
    endTime: string;
    isAvailable: boolean;
    reason?: string | undefined;
}, {
    startTime: string;
    endTime: string;
    isAvailable: boolean;
    reason?: string | undefined;
}>;
export declare const ValidationConfigSchema: z.ZodObject<{
    minimumNoticeHours: z.ZodDefault<z.ZodNumber>;
    maximumAdvanceBookingDays: z.ZodDefault<z.ZodNumber>;
    allowSameDayBooking: z.ZodDefault<z.ZodBoolean>;
    allowWeekendBooking: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    minimumNoticeHours: number;
    maximumAdvanceBookingDays: number;
    allowSameDayBooking: boolean;
    allowWeekendBooking: boolean;
}, {
    minimumNoticeHours?: number | undefined;
    maximumAdvanceBookingDays?: number | undefined;
    allowSameDayBooking?: boolean | undefined;
    allowWeekendBooking?: boolean | undefined;
}>;
export declare const BookingStatsSchema: z.ZodObject<{
    totalBookings: z.ZodNumber;
    completedBookings: z.ZodNumber;
    cancelledBookings: z.ZodNumber;
    noShowBookings: z.ZodNumber;
    averageDuration: z.ZodNumber;
    mostPopularTimeSlots: z.ZodArray<z.ZodObject<{
        hour: z.ZodNumber;
        count: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        count: number;
        hour: number;
    }, {
        count: number;
        hour: number;
    }>, "many">;
    bookingsByDay: z.ZodArray<z.ZodObject<{
        date: z.ZodString;
        count: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        date: string;
        count: number;
    }, {
        date: string;
        count: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    averageDuration: number;
    totalBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    noShowBookings: number;
    mostPopularTimeSlots: {
        count: number;
        hour: number;
    }[];
    bookingsByDay: {
        date: string;
        count: number;
    }[];
}, {
    averageDuration: number;
    totalBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    noShowBookings: number;
    mostPopularTimeSlots: {
        count: number;
        hour: number;
    }[];
    bookingsByDay: {
        date: string;
        count: number;
    }[];
}>;
export type MeetingStatus = z.infer<typeof MeetingStatusSchema>;
export type MeetingType = z.infer<typeof MeetingTypeSchema>;
export type MeetingDuration = z.infer<typeof MeetingDurationSchema>;
export type AvailableSlot = z.infer<typeof AvailableSlotSchema>;
export type Meeting = z.infer<typeof MeetingSchema>;
export type MeetingClient = z.infer<typeof MeetingClientSchema>;
export type MeetingTherapist = z.infer<typeof MeetingTherapistSchema>;
export type CreateMeetingRequest = z.infer<typeof CreateMeetingRequestSchema>;
export type UpdateMeetingRequest = z.infer<typeof UpdateMeetingRequestSchema>;
export type BookingFormData = z.infer<typeof BookingFormDataSchema>;
export type MeetingListParams = z.infer<typeof MeetingListParamsSchema>;
export type MeetingListResponse = z.infer<typeof MeetingListResponseSchema>;
export type Duration = z.infer<typeof DurationSchema>;
export type TimeRange = z.infer<typeof TimeRangeSchema>;
export type ConflictResult = z.infer<typeof ConflictResultSchema>;
export type SlotGenerationConfig = z.infer<typeof SlotGenerationConfigSchema>;
export type TimeSlot = z.infer<typeof TimeSlotSchema>;
export type ValidationConfig = z.infer<typeof ValidationConfigSchema>;
export type BookingStats = z.infer<typeof BookingStatsSchema>;
export declare const MeetingCreateDtoSchema: z.ZodObject<{
    therapistId: z.ZodString;
    startTime: z.ZodString;
    duration: z.ZodNumber;
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    meetingType: z.ZodDefault<z.ZodOptional<z.ZodEnum<["video", "audio", "phone", "chat", "in-person"]>>>;
}, "strip", z.ZodTypeAny, {
    duration: number;
    therapistId: string;
    startTime: string;
    meetingType: "audio" | "video" | "phone" | "in-person" | "chat";
    title?: string | undefined;
    description?: string | undefined;
}, {
    duration: number;
    therapistId: string;
    startTime: string;
    title?: string | undefined;
    description?: string | undefined;
    meetingType?: "audio" | "video" | "phone" | "in-person" | "chat" | undefined;
}>;
export declare const MeetingUpdateDtoSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["scheduled", "confirmed", "in_progress", "completed", "cancelled", "no_show"]>>;
    meetingUrl: z.ZodOptional<z.ZodString>;
    startTime: z.ZodOptional<z.ZodString>;
    duration: z.ZodOptional<z.ZodNumber>;
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    meetingType: z.ZodOptional<z.ZodEnum<["video", "audio", "phone", "chat", "in-person"]>>;
}, "strip", z.ZodTypeAny, {
    status?: "completed" | "cancelled" | "in_progress" | "scheduled" | "no_show" | "confirmed" | undefined;
    title?: string | undefined;
    meetingUrl?: string | undefined;
    duration?: number | undefined;
    startTime?: string | undefined;
    description?: string | undefined;
    meetingType?: "audio" | "video" | "phone" | "in-person" | "chat" | undefined;
}, {
    status?: "completed" | "cancelled" | "in_progress" | "scheduled" | "no_show" | "confirmed" | undefined;
    title?: string | undefined;
    meetingUrl?: string | undefined;
    duration?: number | undefined;
    startTime?: string | undefined;
    description?: string | undefined;
    meetingType?: "audio" | "video" | "phone" | "in-person" | "chat" | undefined;
}>;
export declare const BookingMeetingParamsDtoSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const TherapistAvailabilityCreateDtoSchema: z.ZodObject<{
    therapistId: z.ZodString;
    dayOfWeek: z.ZodNumber;
    startTime: z.ZodString;
    endTime: z.ZodString;
    isAvailable: z.ZodDefault<z.ZodBoolean>;
    timezone: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    therapistId: string;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
    dayOfWeek: number;
    notes?: string | undefined;
    timezone?: string | undefined;
}, {
    therapistId: string;
    startTime: string;
    endTime: string;
    dayOfWeek: number;
    notes?: string | undefined;
    timezone?: string | undefined;
    isAvailable?: boolean | undefined;
}>;
export declare const TherapistAvailabilityUpdateDtoSchema: z.ZodObject<{
    dayOfWeek: z.ZodOptional<z.ZodNumber>;
    startTime: z.ZodOptional<z.ZodString>;
    endTime: z.ZodOptional<z.ZodString>;
    isAvailable: z.ZodOptional<z.ZodBoolean>;
    timezone: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    startTime?: string | undefined;
    endTime?: string | undefined;
    notes?: string | undefined;
    timezone?: string | undefined;
    isAvailable?: boolean | undefined;
    dayOfWeek?: number | undefined;
}, {
    startTime?: string | undefined;
    endTime?: string | undefined;
    notes?: string | undefined;
    timezone?: string | undefined;
    isAvailable?: boolean | undefined;
    dayOfWeek?: number | undefined;
}>;
export declare const AvailabilityParamsDtoSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const GetAvailableSlotsQueryDtoSchema: z.ZodObject<{
    therapistId: z.ZodString;
    date: z.ZodString;
    duration: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    date: string;
    therapistId: string;
    duration?: number | undefined;
}, {
    date: string;
    therapistId: string;
    duration?: number | undefined;
}>;
export type MeetingCreateDto = z.infer<typeof MeetingCreateDtoSchema>;
export type MeetingUpdateDto = z.infer<typeof MeetingUpdateDtoSchema>;
export type BookingMeetingParamsDto = z.infer<typeof BookingMeetingParamsDtoSchema>;
export type TherapistAvailabilityCreateDto = z.infer<typeof TherapistAvailabilityCreateDtoSchema>;
export type TherapistAvailabilityUpdateDto = z.infer<typeof TherapistAvailabilityUpdateDtoSchema>;
export type AvailabilityParamsDto = z.infer<typeof AvailabilityParamsDtoSchema>;
export type GetAvailableSlotsQueryDto = z.infer<typeof GetAvailableSlotsQueryDtoSchema>;
//# sourceMappingURL=booking.d.ts.map