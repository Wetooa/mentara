// Simple query keys for React Query
export const queryKeys = {
  auditLogs: {
    all: ['auditLogs'] as const,
    list: (params?: any) => [...queryKeys.auditLogs.all, 'list', params] as const,
  },
  therapist: {
    all: ['therapist'] as const,
    worksheets: ['therapist', 'worksheets'] as const,
    matchedClients: ['therapist', 'matched-clients'] as const,
  },
  reviews: {
    all: ['reviews'] as const,
    byTherapist: (therapistId: string) => [...queryKeys.reviews.all, 'therapist', therapistId] as const,
  },
  communities: {
    all: ['communities'] as const,
    withStructure: (communityId?: string) => 
      communityId 
        ? [...queryKeys.communities.all, 'withStructure', communityId] as const
        : [...queryKeys.communities.all, 'withStructure'] as const,
    roomPosts: (roomId: string) => [...queryKeys.communities.all, 'roomPosts', roomId] as const,
    stats: [...queryKeys.communities.all, 'stats'] as const,
    userMemberships: [...queryKeys.communities.all, 'userMemberships'] as const,
    members: (communityId: string, limit?: number, offset?: number) => 
      [...queryKeys.communities.all, 'members', 'byCommunity', communityId, limit, offset] as const,
    joined: [...queryKeys.communities.all, 'joined'] as const,
    recommended: [...queryKeys.communities.all, 'recommended'] as const,
    activity: [...queryKeys.communities.all, 'activity'] as const,
  },
  messaging: {
    all: ['messaging'] as const,
    conversations: ['messaging', 'conversations'] as const,
    conversation: (id: string) => [...queryKeys.messaging.all, 'conversation', id] as const,
    messages: (conversationId: string) => [...queryKeys.messaging.all, 'messages', conversationId] as const,
    search: (query: string, conversationId?: string) => 
      [...queryKeys.messaging.all, 'search', query, conversationId] as const,
    blockedUsers: [...queryKeys.messaging.all, 'blocked'] as const,
    // Add key for starting conversations
    startConversation: (targetUserId: string) => [...queryKeys.messaging.all, 'startConversation', targetUserId] as const,
  },
} as const;