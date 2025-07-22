// Query keys for React Query - restructured to avoid temporal dead zone errors
const createQueryKeys = () => {
  // Base query keys - these don't reference other keys
  const base = {
    auditLogs: {
      all: ['auditLogs'] as const,
    },
    therapist: {
      all: ['therapist'] as const,
      worksheets: ['therapist', 'worksheets'] as const,
      matchedClients: ['therapist', 'matched-clients'] as const,
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
  };

  // Computed query keys - these can safely reference base keys
  return {
    auditLogs: {
      ...base.auditLogs,
      list: (params?: any) => [...base.auditLogs.all, 'list', params] as const,
    },
    therapist: {
      ...base.therapist,
    },
    reviews: {
      ...base.reviews,
      byTherapist: (therapistId: string) => [...base.reviews.all, 'therapist', therapistId] as const,
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
      conversation: (id: string) => [...base.messaging.all, 'conversation', id] as const,
      messages: (conversationId: string) => [...base.messaging.all, 'messages', conversationId] as const,
      search: (query: string, conversationId?: string) => 
        [...base.messaging.all, 'search', query, conversationId] as const,
      blockedUsers: [...base.messaging.all, 'blocked'] as const,
    },
  };
};

export const queryKeys = createQueryKeys();