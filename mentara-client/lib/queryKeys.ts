// Centralized query key management for React Query
// This ensures type safety and consistency across all queries

export const queryKeys = {
  // User-related queries
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.users.lists(), { filters }] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
    isFirstSignIn: (userId: string) => [...queryKeys.users.all, 'firstSignIn', userId] as const,
  },

  // Therapist-related queries
  therapists: {
    all: ['therapists'] as const,
    lists: () => [...queryKeys.therapists.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.therapists.lists(), { filters }] as const,
    details: () => [...queryKeys.therapists.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.therapists.details(), id] as const,
    recommendations: (params: Record<string, any>) => 
      [...queryKeys.therapists.all, 'recommendations', params] as const,
    applications: {
      all: () => [...queryKeys.therapists.all, 'applications'] as const,
      lists: () => [...queryKeys.therapists.applications.all(), 'list'] as const,
      list: (filters: Record<string, any>) => [...queryKeys.therapists.applications.lists(), { filters }] as const,
      details: () => [...queryKeys.therapists.applications.all(), 'detail'] as const,
      detail: (id: string) => [...queryKeys.therapists.applications.details(), id] as const,
    },
  },

  // Community-related queries
  communities: {
    all: ['communities'] as const,
    lists: () => [...queryKeys.communities.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.communities.lists(), { filters }] as const,
    details: () => [...queryKeys.communities.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.communities.details(), id] as const,
    byUser: (userId: string) => [...queryKeys.communities.all, 'user', userId] as const,
  },

  // Post-related queries
  posts: {
    all: ['posts'] as const,
    lists: () => [...queryKeys.posts.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.posts.lists(), { filters }] as const,
    details: () => [...queryKeys.posts.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.posts.details(), id] as const,
    byUser: (userId: string) => [...queryKeys.posts.all, 'user', userId] as const,
    byCommunity: (communityId: string) => [...queryKeys.posts.all, 'community', communityId] as const,
  },

  // Comment-related queries
  comments: {
    all: ['comments'] as const,
    lists: () => [...queryKeys.comments.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.comments.lists(), { filters }] as const,
    details: () => [...queryKeys.comments.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.comments.details(), id] as const,
    byPost: (postId: string) => [...queryKeys.comments.all, 'post', postId] as const,
  },

  // Review-related queries
  reviews: {
    all: ['reviews'] as const,
    lists: () => [...queryKeys.reviews.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.reviews.lists(), { filters }] as const,
    details: () => [...queryKeys.reviews.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.reviews.details(), id] as const,
    byTherapist: (therapistId: string, filters?: Record<string, any>) => 
      [...queryKeys.reviews.all, 'therapist', therapistId, { filters }] as const,
    therapistStats: (therapistId: string) => 
      [...queryKeys.reviews.all, 'therapist', therapistId, 'stats'] as const,
    pending: (filters: Record<string, any>) => 
      [...queryKeys.reviews.all, 'pending', { filters }] as const,
  },

  // Booking-related queries
  booking: {
    all: ['booking'] as const,
    meetings: {
      all: () => [...queryKeys.booking.all, 'meetings'] as const,
      lists: () => [...queryKeys.booking.meetings.all(), 'list'] as const,
      list: (filters: Record<string, any>) => [...queryKeys.booking.meetings.lists(), { filters }] as const,
      details: () => [...queryKeys.booking.meetings.all(), 'detail'] as const,
      detail: (id: string) => [...queryKeys.booking.meetings.details(), id] as const,
    },
    slots: (therapistId: string, date: string) => 
      [...queryKeys.booking.all, 'slots', therapistId, date] as const,
    durations: () => [...queryKeys.booking.all, 'durations'] as const,
  },

  // Analytics-related queries
  analytics: {
    all: ['analytics'] as const,
    platform: (params: Record<string, any>) => 
      [...queryKeys.analytics.all, 'platform', params] as const,
    therapist: (params: Record<string, any>) => 
      [...queryKeys.analytics.all, 'therapist', params] as const,
    client: (params: Record<string, any>) => 
      [...queryKeys.analytics.all, 'client', params] as const,
  },

  // Billing-related queries
  billing: {
    all: ['billing'] as const,
    subscriptions: {
      all: () => [...queryKeys.billing.all, 'subscriptions'] as const,
      my: () => [...queryKeys.billing.subscriptions.all(), 'my'] as const,
    },
    plans: {
      all: () => [...queryKeys.billing.all, 'plans'] as const,
      lists: () => [...queryKeys.billing.plans.all(), 'list'] as const,
      list: (filters: Record<string, any>) => [...queryKeys.billing.plans.lists(), { filters }] as const,
    },
    paymentMethods: {
      all: () => [...queryKeys.billing.all, 'paymentMethods'] as const,
      my: () => [...queryKeys.billing.paymentMethods.all(), 'my'] as const,
    },
    invoices: {
      all: () => [...queryKeys.billing.all, 'invoices'] as const,
      lists: () => [...queryKeys.billing.invoices.all(), 'list'] as const,
      list: (filters: Record<string, any>) => [...queryKeys.billing.invoices.lists(), { filters }] as const,
    },
  },

  // Search-related queries
  search: {
    all: ['search'] as const,
    therapists: (query: string, filters: Record<string, any>) => 
      [...queryKeys.search.all, 'therapists', query, { filters }] as const,
    posts: (query: string, communityId?: string) => 
      [...queryKeys.search.all, 'posts', query, { communityId }] as const,
    communities: (query: string) => 
      [...queryKeys.search.all, 'communities', query] as const,
    users: (query: string, role?: string) => 
      [...queryKeys.search.all, 'users', query, { role }] as const,
    global: (query: string, type?: string) => 
      [...queryKeys.search.all, 'global', query, { type }] as const,
  },

  // Client management queries (for therapists)
  clients: {
    all: ['clients'] as const,
    assigned: () => [...queryKeys.clients.all, 'assigned'] as const,
    details: () => [...queryKeys.clients.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.clients.details(), id] as const,
    progress: (id: string) => [...queryKeys.clients.detail(id), 'progress'] as const,
    sessions: (id: string) => [...queryKeys.clients.detail(id), 'sessions'] as const,
  },

  // File-related queries
  files: {
    all: ['files'] as const,
    lists: () => [...queryKeys.files.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.files.lists(), { filters }] as const,
    details: () => [...queryKeys.files.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.files.details(), id] as const,
    my: (filters: Record<string, any>) => [...queryKeys.files.all, 'my', { filters }] as const,
  },

  // Notification-related queries
  notifications: {
    all: ['notifications'] as const,
    lists: () => [...queryKeys.notifications.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.notifications.lists(), { filters }] as const,
    my: (filters: Record<string, any>) => [...queryKeys.notifications.all, 'my', { filters }] as const,
    unreadCount: () => [...queryKeys.notifications.all, 'unreadCount'] as const,
  },

  // Admin-related queries
  admin: {
    all: ['admin'] as const,
    checkAdmin: () => [...queryKeys.admin.all, 'checkAdmin'] as const,
  },
} as const;

// Helper function to invalidate related queries
export const getRelatedQueryKeys = (entity: string, id?: string) => {
  const keys: string[][] = [];
  
  switch (entity) {
    case 'therapist':
      keys.push(queryKeys.therapists.all);
      if (id) {
        keys.push(queryKeys.reviews.byTherapist(id));
        keys.push(queryKeys.reviews.therapistStats(id));
        keys.push(queryKeys.booking.meetings.all);
      }
      break;
      
    case 'review':
      keys.push(queryKeys.reviews.all);
      break;
      
    case 'meeting':
      keys.push(queryKeys.booking.meetings.all);
      keys.push(queryKeys.booking.all);
      break;
      
    case 'post':
      keys.push(queryKeys.posts.all);
      keys.push(queryKeys.comments.all);
      break;
      
    case 'community':
      keys.push(queryKeys.communities.all);
      keys.push(queryKeys.posts.all);
      break;
      
    default:
      break;
  }
  
  return keys;
};