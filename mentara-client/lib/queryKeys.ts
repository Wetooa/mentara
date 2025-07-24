// Query keys for React Query - restructured to avoid temporal dead zone errors
const createQueryKeys = () => {
  // Base query keys - these don't reference other keys
  const base = {
    auditLogs: {
      all: ['auditLogs'] as const,
    },
    therapists: {
      all: ['therapists'] as const,
      applications: ['therapists', 'applications'] as const,
      availability: ['therapists', 'availability'] as const,
      patients: ['therapists', 'patients'] as const,
    },
    therapist: {
      all: ['therapist'] as const,
      worksheets: ['therapist', 'worksheets'] as const,
      matchedClients: ['therapist', 'matched-clients'] as const,
    },
    sessions: {
      all: ['sessions'] as const,
    },
    booking: {
      all: ['booking'] as const,
    },
    users: {
      all: ['users'] as const,
    },
    profile: {
      all: ['profile'] as const,
    },
    dashboard: {
      all: ['dashboard'] as const,
    },
    admin: {
      all: ['admin'] as const,
    },
    moderator: {
      all: ['moderator'] as const,
    },
    billing: {
      all: ['billing'] as const,
    },
    notifications: {
      all: ['notifications'] as const,
    },
    preAssessment: {
      all: ['preAssessment'] as const,
    },
    favorites: {
      all: ['favorites'] as const,
    },
    reporting: {
      all: ['reporting'] as const,
    },
    reviews: {
      all: ['reviews'] as const,
    },
    communities: {
      all: ['communities'] as const,
    },
    messaging: {
      all: ['messaging'] as const,
      conversations: ['messaging', 'conversations'] as const,
    },
    worksheets: {
      all: ['worksheets'] as const,
    },
    client: {
      all: ['client'] as const,
    },
  };

  // Computed query keys - these can safely reference base keys
  return {
    auditLogs: {
      ...base.auditLogs,
      list: (params?: any) => [...base.auditLogs.all, 'list', params] as const,
    },
    therapists: {
      ...base.therapists,
      recommendations: (params?: any) => [...base.therapists.all, 'recommendations', params] as const,
      list: (params?: any) => [...base.therapists.all, 'list', params] as const,
      byId: (id: string) => [...base.therapists.all, 'byId', id] as const,
      applications: {
        list: (params?: any) => [...base.therapists.applications, 'list', params] as const,
        byId: (id: string) => [...base.therapists.applications, 'detail', id] as const,
        my: () => [...base.therapists.applications, 'detail', 'me'] as const,
      },
      availability: {
        byId: (id: string) => [...base.therapists.availability, 'byId', id] as const,
        slots: (therapistId: string, params?: any) => [...base.therapists.availability, 'slots', therapistId, params] as const,
      },
      patients: {
        list: (params?: any) => [...base.therapists.patients, 'list', params] as const,
        matched: () => [...base.therapists.patients, 'matched'] as const,
      },
    },
    therapist: {
      ...base.therapist,
      dashboard: () => [...base.therapist.all, 'dashboard'] as const,
    },
    sessions: {
      ...base.sessions,
      list: (params?: any) => [...base.sessions.all, 'list', params] as const,
      upcoming: (limit?: number) => [...base.sessions.all, 'upcoming', limit] as const,
      byId: (id: string) => [...base.sessions.all, 'byId', id] as const,
      stats: (params?: any) => [...base.sessions.all, 'stats', params] as const,
    },
    booking: {
      ...base.booking,
      slots: (therapistId: string, params?: any) => [...base.booking.all, 'slots', therapistId, params] as const,
      appointments: (params?: any) => [...base.booking.all, 'appointments', params] as const,
    },
    users: {
      ...base.users,
      current: () => [...base.users.all, 'current'] as const,
      byId: (id: string) => [...base.users.all, 'byId', id] as const,
      list: (params?: any) => [...base.users.all, 'list', params] as const,
      search: (query: string) => [...base.users.all, 'search', query] as const,
    },
    profile: {
      ...base.profile,
      current: () => [...base.profile.all, 'current'] as const,
      byId: (id: string) => [...base.profile.all, 'byId', id] as const,
    },
    dashboard: {
      ...base.dashboard,
      client: () => [...base.dashboard.all, 'client'] as const,
      therapist: () => [...base.dashboard.all, 'therapist'] as const,
      admin: () => [...base.dashboard.all, 'admin'] as const,
      moderator: () => [...base.dashboard.all, 'moderator'] as const,
    },
    admin: {
      ...base.admin,
      users: (params?: any) => [...base.admin.all, 'users', params] as const,
      stats: () => [...base.admin.all, 'stats'] as const,
    },
    moderator: {
      ...base.moderator,
      contentQueue: (params?: any) => [...base.moderator.all, 'contentQueue', params] as const,
      auditLogs: (params?: any) => [...base.moderator.all, 'auditLogs', params] as const,
      users: (params?: any) => [...base.moderator.all, 'users', params] as const,
    },
    billing: {
      ...base.billing,
      subscription: () => [...base.billing.all, 'subscription'] as const,
      invoices: (params?: any) => [...base.billing.all, 'invoices', params] as const,
    },
    notifications: {
      ...base.notifications,
      list: (params?: any) => [...base.notifications.all, 'list', params] as const,
      unread: () => [...base.notifications.all, 'unread'] as const,
    },
    preAssessment: {
      ...base.preAssessment,
      questionnaires: () => [...base.preAssessment.all, 'questionnaires'] as const,
      responses: (params?: any) => [...base.preAssessment.all, 'responses', params] as const,
    },
    favorites: {
      ...base.favorites,
      list: () => [...base.favorites.all, 'list'] as const,
      therapists: () => [...base.favorites.all, 'therapists'] as const,
    },
    reporting: {
      ...base.reporting,
      content: (params?: any) => [...base.reporting.all, 'content', params] as const,
    },
    reviews: {
      ...base.reviews,
      byTherapist: (therapistId: string) => [...base.reviews.all, 'therapist', therapistId] as const,
      list: (params?: any) => [...base.reviews.all, 'list', params] as const,
    },
    communities: {
      ...base.communities,
      withStructure: (communityId?: string) => 
        communityId 
          ? [...base.communities.all, 'withStructure', communityId] as const
          : [...base.communities.all, 'withStructure'] as const,
      roomPosts: (roomId: string) => [...base.communities.all, 'roomPosts', roomId] as const,
      stats: [...base.communities.all, 'stats'] as const,
      userMemberships: [...base.communities.all, 'userMemberships'] as const,
      members: (communityId: string, limit?: number, offset?: number) => 
        [...base.communities.all, 'members', 'byCommunity', communityId, limit, offset] as const,
      joined: [...base.communities.all, 'joined'] as const,
      recommended: [...base.communities.all, 'recommended'] as const,
      activity: [...base.communities.all, 'activity'] as const,
    },
    messaging: {
      ...base.messaging,
      contacts: () => [...base.messaging.all, 'contacts'] as const,
      conversation: (id: string) => [...base.messaging.all, 'conversation', id] as const,
      messages: (conversationId: string) => [...base.messaging.all, 'messages', conversationId] as const,
      search: (query: string, conversationId?: string) => 
        [...base.messaging.all, 'search', query, conversationId] as const,
      blockedUsers: [...base.messaging.all, 'blocked'] as const,
      startConversation: (targetUserId: string) => [...base.messaging.all, 'startConversation', targetUserId] as const,
    },
    worksheets: {
      ...base.worksheets,
      byId: (id: string) => [...base.worksheets.all, 'byId', id] as const,
      list: (params?: any) => [...base.worksheets.all, 'list', params] as const,
      stats: (params?: any) => [...base.worksheets.all, 'stats', params] as const,
    },
    client: {
      ...base.client,
      assignedTherapists: [...base.client.all, 'assigned-therapists'] as const,
      profile: [...base.client.all, 'profile'] as const,
      recommendations: [...base.client.all, 'recommendations'] as const,
    },
  };
};

export const queryKeys = createQueryKeys();
