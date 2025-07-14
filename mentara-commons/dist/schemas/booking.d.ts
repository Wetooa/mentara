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
    isActive: boolean;
    duration: number;
    name: string;
    sortOrder: number;
}, {
    id: string;
    isActive: boolean;
    duration: number;
    name: string;
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
        isActive: boolean;
        duration: number;
        name: string;
        sortOrder: number;
    }, {
        id: string;
        isActive: boolean;
        duration: number;
        name: string;
        sortOrder: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    startTime: string;
    availableDurations: {
        id: string;
        isActive: boolean;
        duration: number;
        name: string;
        sortOrder: number;
    }[];
}, {
    startTime: string;
    availableDurations: {
        id: string;
        isActive: boolean;
        duration: number;
        name: string;
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
        email: string | null;
        firstName: string | null;
        lastName: string | null;
    }, {
        email: string | null;
        firstName: string | null;
        lastName: string | null;
    }>;
}, "strip", z.ZodTypeAny, {
    user: {
        email: string | null;
        firstName: string | null;
        lastName: string | null;
    };
    id: string;
}, {
    user: {
        email: string | null;
        firstName: string | null;
        lastName: string | null;
    };
    id: string;
}>;
export declare const MeetingTherapistSchema: z.ZodObject<{
    id: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    email: z.ZodString;
    title: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    title?: string | undefined;
}, {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
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
            email: string | null;
            firstName: string | null;
            lastName: string | null;
        }, {
            email: string | null;
            firstName: string | null;
            lastName: string | null;
        }>;
    }, "strip", z.ZodTypeAny, {
        user: {
            email: string | null;
            firstName: string | null;
            lastName: string | null;
        };
        id: string;
    }, {
        user: {
            email: string | null;
            firstName: string | null;
            lastName: string | null;
        };
        id: string;
    }>>;
    therapist: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        firstName: z.ZodString;
        lastName: z.ZodString;
        email: z.ZodString;
        title: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        title?: string | undefined;
    }, {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
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
        isActive: boolean;
        duration: number;
        name: string;
        sortOrder: number;
    }, {
        id: string;
        isActive: boolean;
        duration: number;
        name: string;
        sortOrder: number;
    }>>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: string;
    updatedAt: string;
    status: "cancelled" | "scheduled" | "confirmed" | "completed" | "in_progress" | "no_show";
    duration: number;
    startTime: string;
    therapistId: string;
    clientId: string;
    client?: {
        user: {
            email: string | null;
            firstName: string | null;
            lastName: string | null;
        };
        id: string;
    } | undefined;
    therapist?: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        title?: string | undefined;
    } | undefined;
    title?: string | undefined;
    notes?: string | undefined;
    description?: string | undefined;
    meetingType?: "phone" | "in-person" | "video" | "audio" | "chat" | undefined;
    meetingUrl?: string | undefined;
    durationConfig?: {
        id: string;
        isActive: boolean;
        duration: number;
        name: string;
        sortOrder: number;
    } | undefined;
}, {
    id: string;
    createdAt: string;
    updatedAt: string;
    status: "cancelled" | "scheduled" | "confirmed" | "completed" | "in_progress" | "no_show";
    duration: number;
    startTime: string;
    therapistId: string;
    clientId: string;
    client?: {
        user: {
            email: string | null;
            firstName: string | null;
            lastName: string | null;
        };
        id: string;
    } | undefined;
    therapist?: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        title?: string | undefined;
    } | undefined;
    title?: string | undefined;
    notes?: string | undefined;
    description?: string | undefined;
    meetingType?: "phone" | "in-person" | "video" | "audio" | "chat" | undefined;
    meetingUrl?: string | undefined;
    durationConfig?: {
        id: string;
        isActive: boolean;
        duration: number;
        name: string;
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
    startTime: string;
    therapistId: string;
    meetingType: "phone" | "in-person" | "video" | "audio" | "chat";
    title?: string | undefined;
    description?: string | undefined;
}, {
    duration: number;
    startTime: string;
    therapistId: string;
    title?: string | undefined;
    description?: string | undefined;
    meetingType?: "phone" | "in-person" | "video" | "audio" | "chat" | undefined;
}>;
export declare const UpdateMeetingRequestSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["scheduled", "confirmed", "in_progress", "completed", "cancelled", "no_show"]>>;
    notes: z.ZodOptional<z.ZodString>;
    meetingUrl: z.ZodOptional<z.ZodString>;
    startTime: z.ZodOptional<z.ZodString>;
    duration: z.ZodOptional<z.ZodNumber>;
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    meetingType: z.ZodOptional<z.ZodEnum<["video", "audio", "phone", "chat", "in-person"]>>;
}, "strip", z.ZodTypeAny, {
    status?: "cancelled" | "scheduled" | "confirmed" | "completed" | "in_progress" | "no_show" | undefined;
    title?: string | undefined;
    duration?: number | undefined;
    notes?: string | undefined;
    startTime?: string | undefined;
    description?: string | undefined;
    meetingType?: "phone" | "in-person" | "video" | "audio" | "chat" | undefined;
    meetingUrl?: string | undefined;
}, {
    status?: "cancelled" | "scheduled" | "confirmed" | "completed" | "in_progress" | "no_show" | undefined;
    title?: string | undefined;
    duration?: number | undefined;
    notes?: string | undefined;
    startTime?: string | undefined;
    description?: string | undefined;
    meetingType?: "phone" | "in-person" | "video" | "audio" | "chat" | undefined;
    meetingUrl?: string | undefined;
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
            isActive: boolean;
            duration: number;
            name: string;
            sortOrder: number;
        }, {
            id: string;
            isActive: boolean;
            duration: number;
            name: string;
            sortOrder: number;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        startTime: string;
        availableDurations: {
            id: string;
            isActive: boolean;
            duration: number;
            name: string;
            sortOrder: number;
        }[];
    }, {
        startTime: string;
        availableDurations: {
            id: string;
            isActive: boolean;
            duration: number;
            name: string;
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
        isActive: boolean;
        duration: number;
        name: string;
        sortOrder: number;
    }, {
        id: string;
        isActive: boolean;
        duration: number;
        name: string;
        sortOrder: number;
    }>;
    meetingType: z.ZodEnum<["video", "audio", "phone", "chat", "in-person"]>;
    title: z.ZodString;
    description: z.ZodString;
}, "strip", z.ZodTypeAny, {
    title: string;
    date: string;
    duration: {
        id: string;
        isActive: boolean;
        duration: number;
        name: string;
        sortOrder: number;
    };
    description: string;
    meetingType: "phone" | "in-person" | "video" | "audio" | "chat";
    timeSlot: {
        startTime: string;
        availableDurations: {
            id: string;
            isActive: boolean;
            duration: number;
            name: string;
            sortOrder: number;
        }[];
    };
}, {
    title: string;
    date: string;
    duration: {
        id: string;
        isActive: boolean;
        duration: number;
        name: string;
        sortOrder: number;
    };
    description: string;
    meetingType: "phone" | "in-person" | "video" | "audio" | "chat";
    timeSlot: {
        startTime: string;
        availableDurations: {
            id: string;
            isActive: boolean;
            duration: number;
            name: string;
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
    status?: "cancelled" | "scheduled" | "confirmed" | "completed" | "in_progress" | "no_show" | undefined;
    limit?: number | undefined;
    page?: number | undefined;
    sortBy?: "createdAt" | "status" | "startTime" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    therapistId?: string | undefined;
    clientId?: string | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
}, {
    status?: "cancelled" | "scheduled" | "confirmed" | "completed" | "in_progress" | "no_show" | undefined;
    limit?: number | undefined;
    page?: number | undefined;
    sortBy?: "createdAt" | "status" | "startTime" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    therapistId?: string | undefined;
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
                email: string | null;
                firstName: string | null;
                lastName: string | null;
            }, {
                email: string | null;
                firstName: string | null;
                lastName: string | null;
            }>;
        }, "strip", z.ZodTypeAny, {
            user: {
                email: string | null;
                firstName: string | null;
                lastName: string | null;
            };
            id: string;
        }, {
            user: {
                email: string | null;
                firstName: string | null;
                lastName: string | null;
            };
            id: string;
        }>>;
        therapist: z.ZodOptional<z.ZodObject<{
            id: z.ZodString;
            firstName: z.ZodString;
            lastName: z.ZodString;
            email: z.ZodString;
            title: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            title?: string | undefined;
        }, {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
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
            isActive: boolean;
            duration: number;
            name: string;
            sortOrder: number;
        }, {
            id: string;
            isActive: boolean;
            duration: number;
            name: string;
            sortOrder: number;
        }>>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        createdAt: string;
        updatedAt: string;
        status: "cancelled" | "scheduled" | "confirmed" | "completed" | "in_progress" | "no_show";
        duration: number;
        startTime: string;
        therapistId: string;
        clientId: string;
        client?: {
            user: {
                email: string | null;
                firstName: string | null;
                lastName: string | null;
            };
            id: string;
        } | undefined;
        therapist?: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            title?: string | undefined;
        } | undefined;
        title?: string | undefined;
        notes?: string | undefined;
        description?: string | undefined;
        meetingType?: "phone" | "in-person" | "video" | "audio" | "chat" | undefined;
        meetingUrl?: string | undefined;
        durationConfig?: {
            id: string;
            isActive: boolean;
            duration: number;
            name: string;
            sortOrder: number;
        } | undefined;
    }, {
        id: string;
        createdAt: string;
        updatedAt: string;
        status: "cancelled" | "scheduled" | "confirmed" | "completed" | "in_progress" | "no_show";
        duration: number;
        startTime: string;
        therapistId: string;
        clientId: string;
        client?: {
            user: {
                email: string | null;
                firstName: string | null;
                lastName: string | null;
            };
            id: string;
        } | undefined;
        therapist?: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            title?: string | undefined;
        } | undefined;
        title?: string | undefined;
        notes?: string | undefined;
        description?: string | undefined;
        meetingType?: "phone" | "in-person" | "video" | "audio" | "chat" | undefined;
        meetingUrl?: string | undefined;
        durationConfig?: {
            id: string;
            isActive: boolean;
            duration: number;
            name: string;
            sortOrder: number;
        } | undefined;
    }>, "many">;
    totalCount: z.ZodNumber;
    page: z.ZodNumber;
    pageSize: z.ZodNumber;
    totalPages: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    totalCount: number;
    page: number;
    pageSize: number;
    meetings: {
        id: string;
        createdAt: string;
        updatedAt: string;
        status: "cancelled" | "scheduled" | "confirmed" | "completed" | "in_progress" | "no_show";
        duration: number;
        startTime: string;
        therapistId: string;
        clientId: string;
        client?: {
            user: {
                email: string | null;
                firstName: string | null;
                lastName: string | null;
            };
            id: string;
        } | undefined;
        therapist?: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            title?: string | undefined;
        } | undefined;
        title?: string | undefined;
        notes?: string | undefined;
        description?: string | undefined;
        meetingType?: "phone" | "in-person" | "video" | "audio" | "chat" | undefined;
        meetingUrl?: string | undefined;
        durationConfig?: {
            id: string;
            isActive: boolean;
            duration: number;
            name: string;
            sortOrder: number;
        } | undefined;
    }[];
    totalPages: number;
}, {
    totalCount: number;
    page: number;
    pageSize: number;
    meetings: {
        id: string;
        createdAt: string;
        updatedAt: string;
        status: "cancelled" | "scheduled" | "confirmed" | "completed" | "in_progress" | "no_show";
        duration: number;
        startTime: string;
        therapistId: string;
        clientId: string;
        client?: {
            user: {
                email: string | null;
                firstName: string | null;
                lastName: string | null;
            };
            id: string;
        } | undefined;
        therapist?: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            title?: string | undefined;
        } | undefined;
        title?: string | undefined;
        notes?: string | undefined;
        description?: string | undefined;
        meetingType?: "phone" | "in-person" | "video" | "audio" | "chat" | undefined;
        meetingUrl?: string | undefined;
        durationConfig?: {
            id: string;
            isActive: boolean;
            duration: number;
            name: string;
            sortOrder: number;
        } | undefined;
    }[];
    totalPages: number;
}>;
export declare const DurationSchema: z.ZodObject<{
    id: z.ZodString;
    duration: z.ZodNumber;
    name: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    duration: number;
    name: string;
}, {
    id: string;
    duration: number;
    name: string;
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
        status: "cancelled" | "scheduled" | "confirmed" | "completed" | "in_progress" | "no_show";
        duration: number;
        startTime: string;
        title?: string | undefined;
    }, {
        id: string;
        status: "cancelled" | "scheduled" | "confirmed" | "completed" | "in_progress" | "no_show";
        duration: number;
        startTime: string;
        title?: string | undefined;
    }>, "many">;
    message: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    hasConflict: boolean;
    conflictingMeetings: {
        id: string;
        status: "cancelled" | "scheduled" | "confirmed" | "completed" | "in_progress" | "no_show";
        duration: number;
        startTime: string;
        title?: string | undefined;
    }[];
    message?: string | undefined;
}, {
    hasConflict: boolean;
    conflictingMeetings: {
        id: string;
        status: "cancelled" | "scheduled" | "confirmed" | "completed" | "in_progress" | "no_show";
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
    isAvailable: boolean;
    startTime: string;
    endTime: string;
    reason?: string | undefined;
}, {
    isAvailable: boolean;
    startTime: string;
    endTime: string;
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
        hour: number;
        count: number;
    }, {
        hour: number;
        count: number;
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
    totalBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    noShowBookings: number;
    averageDuration: number;
    mostPopularTimeSlots: {
        hour: number;
        count: number;
    }[];
    bookingsByDay: {
        date: string;
        count: number;
    }[];
}, {
    totalBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    noShowBookings: number;
    averageDuration: number;
    mostPopularTimeSlots: {
        hour: number;
        count: number;
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
//# sourceMappingURL=booking.d.ts.map