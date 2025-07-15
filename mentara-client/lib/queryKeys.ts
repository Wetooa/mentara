// Centralized query key management for React Query
// This ensures type safety and consistency across all queries

import type {
  UserListFilters,
  TherapistListFilters,
  TherapistRecommendationParams,
  TherapistApplicationFilters,
  CommunityListFilters,
  PostListFilters,
  CommentListFilters,
  ReviewListFilters,
  FileListFilters,
  NotificationListFilters,
  AnalyticsQueryParams,
  TherapistSearchFilters,
  SessionListFilters,
  ConversationListFilters,
  MessageListFilters,
  PreAssessmentFilters,
  AuditLogFilters,
  AdminUserFilters,
} from "@/types/api/filters";

export const queryKeys = {
  // Auth-related queries
  auth: {
    all: ["auth"] as const,
    currentUser: () => [...queryKeys.auth.all, "currentUser"] as const,
    isFirstSignIn: () => [...queryKeys.auth.all, "isFirstSignIn"] as const,
    checkAdmin: () => [...queryKeys.auth.all, "checkAdmin"] as const,
  },

  // User-related queries
  users: {
    all: ["users"] as const,
    lists: () => [...queryKeys.users.all, "list"] as const,
    list: (filters: UserListFilters) =>
      [...queryKeys.users.lists(), { filters }] as const,
    details: () => [...queryKeys.users.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
    isFirstSignIn: (userId: string) =>
      [...queryKeys.users.all, "firstSignIn", userId] as const,
    favorites: (userId: string) =>
      [...queryKeys.users.all, "favorites", userId] as const,
  },

  // Therapist-related queries
  therapists: {
    all: ["therapists"] as const,
    lists: () => [...queryKeys.therapists.all, "list"] as const,
    list: (filters: TherapistListFilters) =>
      [...queryKeys.therapists.lists(), { filters }] as const,
    details: () => [...queryKeys.therapists.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.therapists.details(), id] as const,
    recommendations: (params: TherapistRecommendationParams) =>
      [...queryKeys.therapists.all, "recommendations", params] as const,
    applications: {
      all: () => [...queryKeys.therapists.all, "applications"] as const,
      lists: () =>
        [...queryKeys.therapists.applications.all(), "list"] as const,
      list: (filters: TherapistApplicationFilters) =>
        [...queryKeys.therapists.applications.lists(), { filters }] as const,
      details: () =>
        [...queryKeys.therapists.applications.all(), "detail"] as const,
      detail: (id: string) =>
        [...queryKeys.therapists.applications.details(), id] as const,
    },
  },

  // Community-related queries
  communities: {
    all: ["communities"] as const,
    lists: () => [...queryKeys.communities.all, "list"] as const,
    list: (filters: CommunityListFilters) =>
      [...queryKeys.communities.lists(), { filters }] as const,
    details: () => [...queryKeys.communities.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.communities.details(), id] as const,
    byUser: (userId: string) =>
      [...queryKeys.communities.all, "user", userId] as const,
    withStructure: () =>
      [...queryKeys.communities.all, "withStructure"] as const,
    withStructureById: (id: string) =>
      [...queryKeys.communities.withStructure(), id] as const,

    // Membership-related queries
    memberships: {
      all: () => [...queryKeys.communities.all, "memberships"] as const,
      my: () => [...queryKeys.communities.memberships.all(), "my"] as const,
      byUser: (userId: string) =>
        [...queryKeys.communities.memberships.all(), "user", userId] as const,
    },

    // Members-related queries
    members: {
      all: () => [...queryKeys.communities.all, "members"] as const,
      byCommunity: (communityId: string, limit?: number, offset?: number) =>
        [
          ...queryKeys.communities.members.all(),
          "community",
          communityId,
          { limit, offset },
        ] as const,
    },

    // Room groups and rooms
    roomGroups: {
      all: () => [...queryKeys.communities.all, "roomGroups"] as const,
      byCommunity: (communityId: string) =>
        [
          ...queryKeys.communities.roomGroups.all(),
          "community",
          communityId,
        ] as const,
    },

    rooms: {
      all: () => [...queryKeys.communities.all, "rooms"] as const,
      byGroup: (roomGroupId: string) =>
        [...queryKeys.communities.rooms.all(), "group", roomGroupId] as const,
      byRoom: (roomId: string) =>
        [...queryKeys.communities.rooms.all(), "room", roomId] as const,
    },

    // Posts by room/community
    roomPosts: (roomId: string, limit?: number, offset?: number) =>
      [
        ...queryKeys.communities.all,
        "roomPosts",
        roomId,
        { limit, offset },
      ] as const,

    // Community stats
    stats: () => [...queryKeys.communities.all, "stats"] as const,

    // Assignment and recommendations
    assignment: {
      all: () => [...queryKeys.communities.all, "assignment"] as const,
      my: () => [...queryKeys.communities.assignment.all(), "my"] as const,
      recommendations: () =>
        [...queryKeys.communities.assignment.all(), "recommendations"] as const,
      bulk: () => [...queryKeys.communities.assignment.all(), "bulk"] as const,
    },

    // For backward compatibility - mapping old methods to new ones
    userMemberships: () => queryKeys.communities.memberships.my(),
  },

  // Post-related queries
  posts: {
    all: ["posts"] as const,
    lists: () => [...queryKeys.posts.all, "list"] as const,
    list: (filters: PostListFilters) =>
      [...queryKeys.posts.lists(), { filters }] as const,
    details: () => [...queryKeys.posts.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.posts.details(), id] as const,
    byUser: (userId: string) =>
      [...queryKeys.posts.all, "user", userId] as const,
    byCommunity: (communityId: string) =>
      [...queryKeys.posts.all, "community", communityId] as const,
  },

  // Comment-related queries
  comments: {
    all: ["comments"] as const,
    lists: () => [...queryKeys.comments.all, "list"] as const,
    list: (filters: CommentListFilters) =>
      [...queryKeys.comments.lists(), { filters }] as const,
    details: () => [...queryKeys.comments.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.comments.details(), id] as const,
    byPost: (postId: string) =>
      [...queryKeys.comments.all, "post", postId] as const,
  },

  // Review-related queries
  reviews: {
    all: ["reviews"] as const,
    lists: () => [...queryKeys.reviews.all, "list"] as const,
    list: (filters: ReviewListFilters) =>
      [...queryKeys.reviews.lists(), { filters }] as const,
    details: () => [...queryKeys.reviews.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.reviews.details(), id] as const,
    byTherapist: (therapistId: string, filters?: ReviewListFilters) =>
      [
        ...queryKeys.reviews.all,
        "therapist",
        therapistId,
        { filters },
      ] as const,
    therapistStats: (therapistId: string) =>
      [...queryKeys.reviews.all, "therapist", therapistId, "stats"] as const,
    pending: (filters: ReviewListFilters) =>
      [...queryKeys.reviews.all, "pending", { filters }] as const,
  },

  // Booking-related queries
  booking: {
    all: ["booking"] as const,
    meetings: {
      all: () => [...queryKeys.booking.all, "meetings"] as const,
      lists: () => [...queryKeys.booking.meetings.all(), "list"] as const,
      list: (filters: UserListFilters) =>
        [...queryKeys.booking.meetings.lists(), { filters }] as const,
      details: () => [...queryKeys.booking.meetings.all(), "detail"] as const,
      detail: (id: string) =>
        [...queryKeys.booking.meetings.details(), id] as const,
    },
    slots: (therapistId: string, date: string) =>
      [...queryKeys.booking.all, "slots", therapistId, date] as const,
    durations: () => [...queryKeys.booking.all, "durations"] as const,
  },

  // Analytics-related queries
  analytics: {
    all: ["analytics"] as const,
    platform: (params: AnalyticsQueryParams) =>
      [...queryKeys.analytics.all, "platform", params] as const,
    therapist: (params: AnalyticsQueryParams) =>
      [...queryKeys.analytics.all, "therapist", params] as const,
    client: (params: AnalyticsQueryParams) =>
      [...queryKeys.analytics.all, "client", params] as const,
  },

  // Billing-related queries
  billing: {
    all: ["billing"] as const,
    subscriptions: {
      all: () => [...queryKeys.billing.all, "subscriptions"] as const,
      my: () => [...queryKeys.billing.subscriptions.all(), "my"] as const,
    },
    plans: {
      all: () => [...queryKeys.billing.all, "plans"] as const,
      lists: () => [...queryKeys.billing.plans.all(), "list"] as const,
      list: (filters: UserListFilters) =>
        [...queryKeys.billing.plans.lists(), { filters }] as const,
    },
    paymentMethods: {
      all: () => [...queryKeys.billing.all, "paymentMethods"] as const,
      my: () => [...queryKeys.billing.paymentMethods.all(), "my"] as const,
    },
    invoices: {
      all: () => [...queryKeys.billing.all, "invoices"] as const,
      lists: () => [...queryKeys.billing.invoices.all(), "list"] as const,
      list: (filters: UserListFilters) =>
        [...queryKeys.billing.invoices.lists(), { filters }] as const,
    },
  },

  // Search-related queries
  search: {
    all: ["search"] as const,
    therapists: (query: string, filters: TherapistSearchFilters) =>
      [...queryKeys.search.all, "therapists", query, { filters }] as const,
    posts: (query: string, communityId?: string) =>
      [...queryKeys.search.all, "posts", query, { communityId }] as const,
    communities: (query: string) =>
      [...queryKeys.search.all, "communities", query] as const,
    users: (query: string, role?: string) =>
      [...queryKeys.search.all, "users", query, { role }] as const,
    global: (query: string, type?: string) =>
      [...queryKeys.search.all, "global", query, { type }] as const,
  },

  // Client management queries (for therapists)
  clients: {
    all: ["clients"] as const,
    assigned: () => [...queryKeys.clients.all, "assigned"] as const,
    details: () => [...queryKeys.clients.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.clients.details(), id] as const,
    progress: (id: string) =>
      [...queryKeys.clients.detail(id), "progress"] as const,
    sessions: (id: string) =>
      [...queryKeys.clients.detail(id), "sessions"] as const,
  },

  // Client queries (for individual clients)
  client: {
    all: ["client"] as const,
    profile: () => [...queryKeys.client.all, "profile"] as const,
    progress: () => [...queryKeys.client.all, "progress"] as const,
    assignedTherapist: () =>
      [...queryKeys.client.all, "assignedTherapist"] as const,
    assignedTherapists: () =>
      [...queryKeys.client.all, "assignedTherapists"] as const,
    onboarding: () => [...queryKeys.client.all, "onboarding"] as const,
    preferences: () => [...queryKeys.client.all, "preferences"] as const,
    goals: () => [...queryKeys.client.all, "goals"] as const,
  },

  // File-related queries
  files: {
    all: ["files"] as const,
    lists: () => [...queryKeys.files.all, "list"] as const,
    list: (filters: UserListFilters) =>
      [...queryKeys.files.lists(), { filters }] as const,
    details: () => [...queryKeys.files.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.files.details(), id] as const,
    my: (filters: FileListFilters) =>
      [...queryKeys.files.all, "my", { filters }] as const,
  },

  // Notification-related queries
  notifications: {
    all: ["notifications"] as const,
    lists: () => [...queryKeys.notifications.all, "list"] as const,
    list: (filters: UserListFilters) =>
      [...queryKeys.notifications.lists(), { filters }] as const,
    my: (filters: NotificationListFilters) =>
      [...queryKeys.notifications.all, "my", { filters }] as const,
    unreadCount: () => [...queryKeys.notifications.all, "unreadCount"] as const,
  },

  // Worksheets-related queries
  worksheets: {
    all: ["worksheets"] as const,
    my: () => [...queryKeys.worksheets.all, "my"] as const,
    assigned: () => [...queryKeys.worksheets.all, "assigned"] as const,
    detail: (id: string) =>
      [...queryKeys.worksheets.all, "detail", id] as const,
  },

  // Admin-related queries
  admin: {
    all: ["admin"] as const,
    checkAdmin: () => [...queryKeys.admin.all, "checkAdmin"] as const,
    dashboard: () => [...queryKeys.admin.all, "dashboard"] as const,
    users: {
      all: () => [...queryKeys.admin.all, "users"] as const,
      lists: () => [...queryKeys.admin.users.all(), "list"] as const,
      list: (filters: AdminUserFilters) =>
        [...queryKeys.admin.users.lists(), { filters }] as const,
      details: () => [...queryKeys.admin.users.all(), "detail"] as const,
      detail: (id: string) => [...queryKeys.admin.users.details(), id] as const,
    },
    therapistApplications: {
      all: () => [...queryKeys.admin.all, "therapistApplications"] as const,
      lists: () => [...queryKeys.admin.therapistApplications.all(), "list"] as const,
      list: (params?: { status?: string; limit?: number; offset?: number }) =>
        [...queryKeys.admin.therapistApplications.lists(), { params }] as const,
      details: () => [...queryKeys.admin.therapistApplications.all(), "detail"] as const,
      detail: (id: string) => [...queryKeys.admin.therapistApplications.details(), id] as const,
    },
    analytics: {
      all: () => [...queryKeys.admin.all, "analytics"] as const,
      systemStats: () => [...queryKeys.admin.analytics.all(), "systemStats"] as const,
      userGrowth: (params?: { startDate?: string; endDate?: string; granularity?: string }) =>
        [...queryKeys.admin.analytics.all(), "userGrowth", { params }] as const,
      engagement: (params?: { startDate?: string; endDate?: string; granularity?: string }) =>
        [...queryKeys.admin.analytics.all(), "engagement", { params }] as const,
      platformOverview: () => [...queryKeys.admin.analytics.all(), "platformOverview"] as const,
      matchingPerformance: (startDate?: string, endDate?: string) =>
        [...queryKeys.admin.analytics.all(), "matchingPerformance", { startDate, endDate }] as const,
    },
    moderation: {
      all: () => [...queryKeys.admin.all, "moderation"] as const,
      reports: (params?: { type?: string; status?: string; assignedTo?: string; limit?: number; offset?: number }) =>
        [...queryKeys.admin.moderation.all(), "reports", { params }] as const,
      flaggedContent: (params?: { type?: string; page?: number; limit?: number }) =>
        [...queryKeys.admin.moderation.all(), "flaggedContent", { params }] as const,
    },
    config: {
      all: () => [...queryKeys.admin.all, "config"] as const,
      system: () => [...queryKeys.admin.config.all(), "system"] as const,
      featureFlags: () => [...queryKeys.admin.config.all(), "featureFlags"] as const,
    },
    profile: () => [...queryKeys.admin.all, "profile"] as const,
  },

  // Moderator-related queries
  moderator: {
    all: ["moderator"] as const,
    dashboard: () => [...queryKeys.moderator.all, "dashboard"] as const,
    content: {
      all: () => [...queryKeys.moderator.all, "content"] as const,
      queue: (params?: { type?: string; status?: string; priority?: string; limit?: number; offset?: number; sortBy?: string; sortOrder?: string }) =>
        [...queryKeys.moderator.content.all(), "queue", { params }] as const,
      reports: (params?: { type?: string; status?: string; limit?: number; offset?: number }) =>
        [...queryKeys.moderator.content.all(), "reports", { params }] as const,
    },
    users: {
      all: () => [...queryKeys.moderator.all, "users"] as const,
      flagged: (params?: { status?: string; role?: string; limit?: number; offset?: number; search?: string }) =>
        [...queryKeys.moderator.users.all(), "flagged", { params }] as const,
      history: (userId: string) => [...queryKeys.moderator.users.all(), "history", userId] as const,
    },
    auditLogs: {
      all: () => [...queryKeys.moderator.all, "auditLogs"] as const,
      search: (params?: { userId?: string; action?: string; entityType?: string; startDate?: string; endDate?: string; limit?: number; offset?: number }) =>
        [...queryKeys.moderator.auditLogs.all(), "search", { params }] as const,
      stats: () => [...queryKeys.moderator.auditLogs.all(), "stats"] as const,
    },
    systemEvents: {
      all: () => [...queryKeys.moderator.all, "systemEvents"] as const,
      list: (params?: { eventType?: string; severity?: string; component?: string; isResolved?: boolean; limit?: number; offset?: number }) =>
        [...queryKeys.moderator.systemEvents.all(), "list", { params }] as const,
    },
    profile: () => [...queryKeys.moderator.all, "profile"] as const,
    activity: () => [...queryKeys.moderator.all, "activity"] as const,
  },

  // Content moderation-related queries
  contentModeration: {
    all: ["contentModeration"] as const,
    flaggedContent: (filters?: { type?: string; status?: string; priority?: string; reportReason?: string; authorId?: string; communityId?: string; dateFrom?: string; dateTo?: string; limit?: number; offset?: number; sortBy?: string; sortOrder?: string }) =>
      [...queryKeys.contentModeration.all, "flaggedContent", { filters }] as const,
    reports: (filters?: { status?: string; type?: string; priority?: string; limit?: number; offset?: number }) =>
      [...queryKeys.contentModeration.all, "reports", { filters }] as const,
    userViolations: (userId: string) =>
      [...queryKeys.contentModeration.all, "userViolations", userId] as const,
    stats: (dateFrom?: string, dateTo?: string) =>
      [...queryKeys.contentModeration.all, "stats", { dateFrom, dateTo }] as const,
    history: (filters?: { moderatorId?: string; limit?: number; offset?: number }) =>
      [...queryKeys.contentModeration.all, "history", { filters }] as const,
    autoRules: () => [...queryKeys.contentModeration.all, "autoRules"] as const,
    preview: (contentType: string, contentId: string) =>
      [...queryKeys.contentModeration.all, "preview", contentType, contentId] as const,
  },

  // Dashboard-related queries
  dashboard: {
    all: ["dashboard"] as const,
    user: () => [...queryKeys.dashboard.all, "user"] as const,
    therapist: () => [...queryKeys.dashboard.all, "therapist"] as const,
    admin: () => [...queryKeys.dashboard.all, "admin"] as const,
  },

  // Dashboard-related queries
  dashboard: {
    all: ['dashboard'] as const,
    user: () => [...queryKeys.dashboard.all, 'user'] as const,
    therapist: () => [...queryKeys.dashboard.all, 'therapist'] as const,
    admin: () => [...queryKeys.dashboard.all, 'admin'] as const,
  },
} as const;

// Helper function to invalidate related queries
export const getRelatedQueryKeys = (entity: string, id?: string) => {
  const keys: string[][] = [];

  switch (entity) {
    case "therapist":
      keys.push(queryKeys.therapists.all);
      if (id) {
        keys.push(queryKeys.reviews.byTherapist(id));
        keys.push(queryKeys.reviews.therapistStats(id));
        keys.push(queryKeys.booking.meetings.all);
      }
      break;

    case "review":
      keys.push(queryKeys.reviews.all);
      break;

    case "meeting":
      keys.push(queryKeys.booking.meetings.all);
      keys.push(queryKeys.booking.all);
      break;

    case "post":
      keys.push(queryKeys.posts.all);
      keys.push(queryKeys.comments.all);
      break;

    case "community":
      keys.push(queryKeys.communities.all);
      keys.push(queryKeys.posts.all);
      break;

    case "session":
      keys.push(queryKeys.sessions.all);
      break;

    case "message":
      keys.push(queryKeys.messaging.conversations.all());
      keys.push(queryKeys.messaging.messages.all());
      break;

    case "conversation":
      keys.push(queryKeys.messaging.conversations.all());
      keys.push(queryKeys.messaging.messages.all());
      break;

    case "assessment":
      keys.push(queryKeys.preAssessment.all);
      break;

    case "auditLog":
      keys.push(queryKeys.auditLogs.all);
      keys.push(queryKeys.moderator.auditLogs.all());
      break;

    case "admin":
      keys.push(queryKeys.admin.all);
      if (id) {
        keys.push(queryKeys.admin.users.detail(id));
      }
      break;

    case "moderator":
      keys.push(queryKeys.moderator.all);
      keys.push(queryKeys.contentModeration.all);
      break;

    case "moderation":
      keys.push(queryKeys.admin.moderation.all());
      keys.push(queryKeys.moderator.content.all());
      keys.push(queryKeys.contentModeration.all);
      break;

    case "user":
      keys.push(queryKeys.users.all);
      if (id) {
        keys.push(queryKeys.admin.users.detail(id));
        keys.push(queryKeys.moderator.users.history(id));
        keys.push(queryKeys.contentModeration.userViolations(id));
      }
      break;

    default:
      break;
  }

  return keys;
};
