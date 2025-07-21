"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModeratorDashboardResponseDtoSchema = exports.AdminDashboardResponseDtoSchema = exports.TherapistDashboardResponseDtoSchema = exports.ClientDashboardResponseDtoSchema = void 0;
const zod_1 = require("zod");
// =============================================================================
// DASHBOARD SCHEMAS - Based on actual service return types
// =============================================================================
// Client Dashboard Response
exports.ClientDashboardResponseDtoSchema = zod_1.z.object({
    client: zod_1.z.object({
        id: zod_1.z.string(),
        userId: zod_1.z.string(),
        createdAt: zod_1.z.string().datetime(),
        updatedAt: zod_1.z.string().datetime(),
        user: zod_1.z.object({
            id: zod_1.z.string(),
            email: zod_1.z.string(),
            firstName: zod_1.z.string().nullable(),
            lastName: zod_1.z.string().nullable(),
            role: zod_1.z.string(),
            createdAt: zod_1.z.string().datetime(),
            updatedAt: zod_1.z.string().datetime(),
        }),
        assignedTherapists: zod_1.z.array(zod_1.z.object({
            id: zod_1.z.string(),
            clientId: zod_1.z.string(),
            therapistId: zod_1.z.string(),
            status: zod_1.z.string(),
            createdAt: zod_1.z.string().datetime(),
            therapist: zod_1.z.object({
                id: zod_1.z.string(),
                userId: zod_1.z.string(),
                specialties: zod_1.z.array(zod_1.z.string()),
                user: zod_1.z.object({
                    id: zod_1.z.string(),
                    email: zod_1.z.string(),
                    firstName: zod_1.z.string().nullable(),
                    lastName: zod_1.z.string().nullable(),
                }),
            }),
        })),
        meetings: zod_1.z.array(zod_1.z.object({
            id: zod_1.z.string(),
            clientId: zod_1.z.string(),
            therapistId: zod_1.z.string(),
            startTime: zod_1.z.string().datetime(),
            endTime: zod_1.z.string().datetime(),
            status: zod_1.z.string(),
            therapist: zod_1.z.object({
                id: zod_1.z.string(),
                userId: zod_1.z.string(),
                user: zod_1.z.object({
                    firstName: zod_1.z.string().nullable(),
                    lastName: zod_1.z.string().nullable(),
                }),
            }),
        })),
        worksheets: zod_1.z.array(zod_1.z.object({
            id: zod_1.z.string(),
            clientId: zod_1.z.string(),
            therapistId: zod_1.z.string(),
            title: zod_1.z.string(),
            status: zod_1.z.string(),
            dueDate: zod_1.z.string().datetime().nullable(),
            therapist: zod_1.z.object({
                user: zod_1.z.object({
                    firstName: zod_1.z.string().nullable(),
                    lastName: zod_1.z.string().nullable(),
                }),
            }),
        })),
        preAssessment: zod_1.z.any().nullable(), // PreAssessment type is complex
    }),
    stats: zod_1.z.object({
        completedMeetings: zod_1.z.number(),
        completedWorksheets: zod_1.z.number(),
        upcomingMeetings: zod_1.z.number(),
        pendingWorksheets: zod_1.z.number(),
    }),
    upcomingMeetings: zod_1.z.array(zod_1.z.any()), // Same as client.meetings
    pendingWorksheets: zod_1.z.array(zod_1.z.any()), // Same as client.worksheets
    assignedTherapists: zod_1.z.array(zod_1.z.any()), // Mapped from client.assignedTherapists
    recentActivity: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        title: zod_1.z.string(),
        content: zod_1.z.string(),
        createdAt: zod_1.z.string().datetime(),
        userId: zod_1.z.string(),
        room: zod_1.z
            .object({
            id: zod_1.z.string(),
            roomGroup: zod_1.z
                .object({
                community: zod_1.z.object({
                    id: zod_1.z.string(),
                    name: zod_1.z.string(),
                }),
            })
                .nullable(),
        })
            .nullable(),
        _count: zod_1.z.object({
            hearts: zod_1.z.number(),
            comments: zod_1.z.number(),
        }),
    })),
    hasPreAssessment: zod_1.z.boolean(),
});
// Therapist Dashboard Response
exports.TherapistDashboardResponseDtoSchema = zod_1.z.object({
    therapist: zod_1.z.object({
        id: zod_1.z.string(),
        userId: zod_1.z.string(),
        specialties: zod_1.z.array(zod_1.z.string()),
        user: zod_1.z.object({
            id: zod_1.z.string(),
            email: zod_1.z.string(),
            firstName: zod_1.z.string().nullable(),
            lastName: zod_1.z.string().nullable(),
        }),
        assignedClients: zod_1.z.array(zod_1.z.object({
            client: zod_1.z.object({
                id: zod_1.z.string(),
                userId: zod_1.z.string(),
                user: zod_1.z.object({
                    firstName: zod_1.z.string().nullable(),
                    lastName: zod_1.z.string().nullable(),
                }),
            }),
        })),
        meetings: zod_1.z.array(zod_1.z.object({
            id: zod_1.z.string(),
            clientId: zod_1.z.string(),
            therapistId: zod_1.z.string(),
            startTime: zod_1.z.string().datetime(),
            status: zod_1.z.string(),
            client: zod_1.z.object({
                user: zod_1.z.object({
                    firstName: zod_1.z.string().nullable(),
                    lastName: zod_1.z.string().nullable(),
                }),
            }),
        })),
        worksheets: zod_1.z.array(zod_1.z.object({
            id: zod_1.z.string(),
            clientId: zod_1.z.string(),
            therapistId: zod_1.z.string(),
            title: zod_1.z.string(),
            status: zod_1.z.string(),
            dueDate: zod_1.z.string().datetime().nullable(),
            client: zod_1.z.object({
                user: zod_1.z.object({
                    firstName: zod_1.z.string().nullable(),
                    lastName: zod_1.z.string().nullable(),
                }),
            }),
        })),
    }),
    stats: zod_1.z.object({
        totalClients: zod_1.z.number(),
        completedMeetings: zod_1.z.number(),
        upcomingMeetings: zod_1.z.number(),
        pendingWorksheets: zod_1.z.number(),
    }),
    upcomingMeetings: zod_1.z.array(zod_1.z.any()), // Same as therapist.meetings
    assignedClients: zod_1.z.array(zod_1.z.any()), // Mapped from therapist.assignedClients
    pendingWorksheets: zod_1.z.array(zod_1.z.any()), // Same as therapist.worksheets
    recentSessions: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        clientId: zod_1.z.string(),
        therapistId: zod_1.z.string(),
        startTime: zod_1.z.string().datetime(),
        status: zod_1.z.string(),
        client: zod_1.z.object({
            user: zod_1.z.object({
                firstName: zod_1.z.string().nullable(),
                lastName: zod_1.z.string().nullable(),
            }),
        }),
        meetingNotes: zod_1.z.array(zod_1.z.object({
            id: zod_1.z.string(),
            content: zod_1.z.string(),
            createdAt: zod_1.z.string().datetime(),
        })),
    })),
});
// Admin Dashboard Response
exports.AdminDashboardResponseDtoSchema = zod_1.z.object({
    stats: zod_1.z.object({
        totalUsers: zod_1.z.number(),
        totalClients: zod_1.z.number(),
        totalTherapists: zod_1.z.number(),
        pendingTherapists: zod_1.z.number(),
        totalMeetings: zod_1.z.number(),
        completedMeetings: zod_1.z.number(),
        totalCommunities: zod_1.z.number(),
        totalPosts: zod_1.z.number(),
    }),
    recentUsers: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        email: zod_1.z.string(),
        firstName: zod_1.z.string().nullable(),
        lastName: zod_1.z.string().nullable(),
        role: zod_1.z.string(),
        createdAt: zod_1.z.string().datetime(),
        client: zod_1.z.any().nullable(),
        therapist: zod_1.z.any().nullable(),
    })),
    pendingApplications: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        userId: zod_1.z.string(),
        status: zod_1.z.string(),
        createdAt: zod_1.z.string().datetime(),
        specialties: zod_1.z.array(zod_1.z.string()),
        user: zod_1.z.object({
            firstName: zod_1.z.string().nullable(),
            lastName: zod_1.z.string().nullable(),
            email: zod_1.z.string(),
        }),
    })),
});
// Moderator Dashboard Response
exports.ModeratorDashboardResponseDtoSchema = zod_1.z.object({
    moderator: zod_1.z.object({
        id: zod_1.z.string(),
        firstName: zod_1.z.string().nullable(),
        lastName: zod_1.z.string().nullable(),
        email: zod_1.z.string(),
        role: zod_1.z.string(),
    }),
    stats: zod_1.z.object({
        pendingReports: zod_1.z.number(),
        pendingContent: zod_1.z.number(),
        resolvedToday: zod_1.z.number(),
        flaggedUsers: zod_1.z.number(),
        systemAlerts: zod_1.z.number(),
    }),
    communityStats: zod_1.z.object({
        totalCommunities: zod_1.z.number(),
    }),
    flaggedContent: zod_1.z.object({
        posts: zod_1.z.array(zod_1.z.object({
            id: zod_1.z.string(),
            title: zod_1.z.string(),
            content: zod_1.z.string(),
            createdAt: zod_1.z.string().datetime(),
            updatedAt: zod_1.z.string().datetime(),
            user: zod_1.z.object({
                firstName: zod_1.z.string().nullable(),
                lastName: zod_1.z.string().nullable(),
                email: zod_1.z.string(),
            }),
            room: zod_1.z
                .object({
                roomGroup: zod_1.z
                    .object({
                    community: zod_1.z.object({
                        id: zod_1.z.string(),
                        name: zod_1.z.string(),
                    }),
                })
                    .nullable(),
            })
                .nullable(),
            _count: zod_1.z.object({
                hearts: zod_1.z.number(),
                comments: zod_1.z.number(),
            }),
        })),
        comments: zod_1.z.array(zod_1.z.object({
            id: zod_1.z.string(),
            content: zod_1.z.string(),
            createdAt: zod_1.z.string().datetime(),
            updatedAt: zod_1.z.string().datetime(),
            user: zod_1.z.object({
                firstName: zod_1.z.string().nullable(),
                lastName: zod_1.z.string().nullable(),
                email: zod_1.z.string(),
            }),
            post: zod_1.z.object({
                title: zod_1.z.string(),
                id: zod_1.z.string(),
            }),
        })),
    }),
    recentActivity: zod_1.z.object({
        moderationActions: zod_1.z.array(zod_1.z.any()), // Placeholder - currently empty array
    }),
});
//# sourceMappingURL=dashboard.js.map