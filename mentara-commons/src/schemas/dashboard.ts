import { z } from "zod";

// =============================================================================
// DASHBOARD SCHEMAS - Based on actual service return types
// =============================================================================

// Client Dashboard Response
export const ClientDashboardResponseDtoSchema = z.object({
  client: z.object({
    id: z.string(),
    userId: z.string(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    user: z.object({
      id: z.string(),
      email: z.string(),
      firstName: z.string().nullable(),
      lastName: z.string().nullable(),
      role: z.string(),
      createdAt: z.string().datetime(),
      updatedAt: z.string().datetime(),
    }),
    assignedTherapists: z.array(
      z.object({
        id: z.string(),
        clientId: z.string(),
        therapistId: z.string(),
        status: z.string(),
        createdAt: z.string().datetime(),
        therapist: z.object({
          id: z.string(),
          userId: z.string(),
          specialties: z.array(z.string()),
          user: z.object({
            id: z.string(),
            email: z.string(),
            firstName: z.string().nullable(),
            lastName: z.string().nullable(),
          }),
        }),
      })
    ),
    meetings: z.array(
      z.object({
        id: z.string(),
        clientId: z.string(),
        therapistId: z.string(),
        startTime: z.string().datetime(),
        endTime: z.string().datetime(),
        status: z.string(),
        therapist: z.object({
          id: z.string(),
          userId: z.string(),
          user: z.object({
            firstName: z.string().nullable(),
            lastName: z.string().nullable(),
          }),
        }),
      })
    ),
    worksheets: z.array(
      z.object({
        id: z.string(),
        clientId: z.string(),
        therapistId: z.string(),
        title: z.string(),
        status: z.string(),
        dueDate: z.string().datetime().nullable(),
        therapist: z.object({
          user: z.object({
            firstName: z.string().nullable(),
            lastName: z.string().nullable(),
          }),
        }),
      })
    ),
    preAssessment: z.any().nullable(), // PreAssessment type is complex
  }),
  stats: z.object({
    completedMeetings: z.number(),
    completedWorksheets: z.number(),
    upcomingMeetings: z.number(),
    pendingWorksheets: z.number(),
  }),
  upcomingMeetings: z.array(z.any()), // Same as client.meetings
  pendingWorksheets: z.array(z.any()), // Same as client.worksheets
  assignedTherapists: z.array(z.any()), // Mapped from client.assignedTherapists
  recentActivity: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      content: z.string(),
      createdAt: z.string().datetime(),
      userId: z.string(),
      room: z
        .object({
          id: z.string(),
          roomGroup: z
            .object({
              community: z.object({
                id: z.string(),
                name: z.string(),
              }),
            })
            .nullable(),
        })
        .nullable(),
      _count: z.object({
        hearts: z.number(),
        comments: z.number(),
      }),
    })
  ),
  hasPreAssessment: z.boolean(),
});

// Therapist Dashboard Response
export const TherapistDashboardResponseDtoSchema = z.object({
  therapist: z.object({
    id: z.string(),
    userId: z.string(),
    specialties: z.array(z.string()),
    user: z.object({
      id: z.string(),
      email: z.string(),
      firstName: z.string().nullable(),
      lastName: z.string().nullable(),
    }),
    assignedClients: z.array(
      z.object({
        client: z.object({
          id: z.string(),
          userId: z.string(),
          user: z.object({
            firstName: z.string().nullable(),
            lastName: z.string().nullable(),
          }),
        }),
      })
    ),
    meetings: z.array(
      z.object({
        id: z.string(),
        clientId: z.string(),
        therapistId: z.string(),
        startTime: z.string().datetime(),
        status: z.string(),
        client: z.object({
          user: z.object({
            firstName: z.string().nullable(),
            lastName: z.string().nullable(),
          }),
        }),
      })
    ),
    worksheets: z.array(
      z.object({
        id: z.string(),
        clientId: z.string(),
        therapistId: z.string(),
        title: z.string(),
        status: z.string(),
        dueDate: z.string().datetime().nullable(),
        client: z.object({
          user: z.object({
            firstName: z.string().nullable(),
            lastName: z.string().nullable(),
          }),
        }),
      })
    ),
  }),
  stats: z.object({
    totalClients: z.number(),
    completedMeetings: z.number(),
    upcomingMeetings: z.number(),
    pendingWorksheets: z.number(),
  }),
  upcomingMeetings: z.array(z.any()), // Same as therapist.meetings
  assignedClients: z.array(z.any()), // Mapped from therapist.assignedClients
  pendingWorksheets: z.array(z.any()), // Same as therapist.worksheets
  recentSessions: z.array(
    z.object({
      id: z.string(),
      clientId: z.string(),
      therapistId: z.string(),
      startTime: z.string().datetime(),
      status: z.string(),
      client: z.object({
        user: z.object({
          firstName: z.string().nullable(),
          lastName: z.string().nullable(),
        }),
      }),
      meetingNotes: z.array(
        z.object({
          id: z.string(),
          content: z.string(),
          createdAt: z.string().datetime(),
        })
      ),
    })
  ),
});

// Admin Dashboard Response
export const AdminDashboardResponseDtoSchema = z.object({
  stats: z.object({
    totalUsers: z.number(),
    totalClients: z.number(),
    totalTherapists: z.number(),
    pendingTherapists: z.number(),
    totalMeetings: z.number(),
    completedMeetings: z.number(),
    totalCommunities: z.number(),
    totalPosts: z.number(),
  }),
  recentUsers: z.array(
    z.object({
      id: z.string(),
      email: z.string(),
      firstName: z.string().nullable(),
      lastName: z.string().nullable(),
      role: z.string(),
      createdAt: z.string().datetime(),
      client: z.any().nullable(),
      therapist: z.any().nullable(),
    })
  ),
  pendingApplications: z.array(
    z.object({
      id: z.string(),
      userId: z.string(),
      status: z.string(),
      createdAt: z.string().datetime(),
      specialties: z.array(z.string()),
      user: z.object({
        firstName: z.string().nullable(),
        lastName: z.string().nullable(),
        email: z.string(),
      }),
    })
  ),
});

// Moderator Dashboard Response
export const ModeratorDashboardResponseDtoSchema = z.object({
  moderator: z.object({
    id: z.string(),
    firstName: z.string().nullable(),
    lastName: z.string().nullable(),
    email: z.string(),
    role: z.string(),
  }),
  stats: z.object({
    pendingReports: z.number(),
    pendingContent: z.number(),
    resolvedToday: z.number(),
    flaggedUsers: z.number(),
    systemAlerts: z.number(),
  }),
  communityStats: z.object({
    totalCommunities: z.number(),
  }),
  flaggedContent: z.object({
    posts: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        content: z.string(),
        createdAt: z.string().datetime(),
        updatedAt: z.string().datetime(),
        user: z.object({
          firstName: z.string().nullable(),
          lastName: z.string().nullable(),
          email: z.string(),
        }),
        room: z
          .object({
            roomGroup: z
              .object({
                community: z.object({
                  id: z.string(),
                  name: z.string(),
                }),
              })
              .nullable(),
          })
          .nullable(),
        _count: z.object({
          hearts: z.number(),
          comments: z.number(),
        }),
      })
    ),
    comments: z.array(
      z.object({
        id: z.string(),
        content: z.string(),
        createdAt: z.string().datetime(),
        updatedAt: z.string().datetime(),
        user: z.object({
          firstName: z.string().nullable(),
          lastName: z.string().nullable(),
          email: z.string(),
        }),
        post: z.object({
          title: z.string(),
          id: z.string(),
        }),
      })
    ),
  }),
  recentActivity: z.object({
    moderationActions: z.array(z.any()), // Placeholder - currently empty array
  }),
});

// Type exports
export type ClientDashboardResponseDto = z.infer<
  typeof ClientDashboardResponseDtoSchema
>;
export type TherapistDashboardResponseDto = z.infer<
  typeof TherapistDashboardResponseDtoSchema
>;
export type AdminDashboardResponseDto = z.infer<
  typeof AdminDashboardResponseDtoSchema
>;
export type ModeratorDashboardResponseDto = z.infer<
  typeof ModeratorDashboardResponseDtoSchema
>;
