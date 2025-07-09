import { AxiosInstance } from 'axios';
import { createUserService } from './users';
import { createTherapistService } from './therapists';
import { createReviewsService } from './reviews';
import { createBookingService } from './booking';
import { createCommunityService } from './communities';
import { createClientService } from './client';

// Additional services for completeness
import { AxiosInstance as Client } from 'axios';

// Admin service
export const createAdminService = (client: Client) => ({
  checkAdmin: (): Promise<{ isAdmin: boolean }> =>
    client.post('/auth/admin'),

  // Admin user management
  users: {
    getList: (params: { role?: string; status?: string; limit?: number; offset?: number } = {}): Promise<any> => {
      const searchParams = new URLSearchParams();
      if (params.role) searchParams.append('role', params.role);
      if (params.status) searchParams.append('status', params.status);
      if (params.limit) searchParams.append('limit', params.limit.toString());
      if (params.offset) searchParams.append('offset', params.offset.toString());

      const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
      return client.get(`/admin/users${queryString}`);
    },

    getById: (userId: string): Promise<any> =>
      client.get(`/admin/users/${userId}`),

    create: (userData: any): Promise<any> =>
      client.post('/admin/users', userData),

    update: (userId: string, userData: any): Promise<any> =>
      client.put(`/admin/users/${userId}`, userData),

    delete: (userId: string): Promise<void> =>
      client.delete(`/admin/users/${userId}`),

    updateRole: (userId: string, role: string): Promise<any> =>
      client.patch(`/admin/users/${userId}/role`, { role }),

    suspend: (userId: string, reason?: string): Promise<any> =>
      client.patch(`/admin/users/${userId}/suspend`, { reason }),

    unsuspend: (userId: string): Promise<any> =>
      client.patch(`/admin/users/${userId}/unsuspend`),
  },

  // Analytics and reports
  analytics: {
    getSystemStats: (): Promise<any> =>
      client.get('/admin/analytics/system-stats'),

    getUserGrowth: (params: { startDate?: string; endDate?: string } = {}): Promise<any> => {
      const searchParams = new URLSearchParams();
      if (params.startDate) searchParams.append('startDate', params.startDate);
      if (params.endDate) searchParams.append('endDate', params.endDate);

      const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
      return client.get(`/admin/analytics/user-growth${queryString}`);
    },

    getEngagement: (params: { startDate?: string; endDate?: string } = {}): Promise<any> => {
      const searchParams = new URLSearchParams();
      if (params.startDate) searchParams.append('startDate', params.startDate);
      if (params.endDate) searchParams.append('endDate', params.endDate);

      const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
      return client.get(`/admin/analytics/engagement${queryString}`);
    },
  },

  // Content moderation
  moderation: {
    getReports: (params: { type?: string; status?: string; limit?: number; offset?: number } = {}): Promise<any> => {
      const searchParams = new URLSearchParams();
      if (params.type) searchParams.append('type', params.type);
      if (params.status) searchParams.append('status', params.status);
      if (params.limit) searchParams.append('limit', params.limit.toString());
      if (params.offset) searchParams.append('offset', params.offset.toString());

      const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
      return client.get(`/admin/moderation/reports${queryString}`);
    },

    updateReport: (reportId: string, action: string, notes?: string): Promise<any> =>
      client.patch(`/admin/moderation/reports/${reportId}`, { action, notes }),

    getFlaggedContent: (params: { type?: string; limit?: number; offset?: number } = {}): Promise<any> => {
      const searchParams = new URLSearchParams();
      if (params.type) searchParams.append('type', params.type);
      if (params.limit) searchParams.append('limit', params.limit.toString());
      if (params.offset) searchParams.append('offset', params.offset.toString());

      const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
      return client.get(`/admin/moderation/flagged-content${queryString}`);
    },
  },

  // System configuration
  config: {
    get: (): Promise<any> =>
      client.get('/admin/config'),

    update: (config: any): Promise<any> =>
      client.put('/admin/config', config),

    getFeatureFlags: (): Promise<any> =>
      client.get('/admin/config/feature-flags'),

    updateFeatureFlag: (flagName: string, enabled: boolean): Promise<any> =>
      client.patch(`/admin/config/feature-flags/${flagName}`, { enabled }),
  },
});

// Search service
export const createSearchService = (client: Client) => ({
  therapists: (query: string, filters: Record<string, any> = {}): Promise<any> => {
    const searchParams = new URLSearchParams();
    searchParams.append('q', query);
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });

    return client.get(`/search/therapists?${searchParams.toString()}`);
  },

  posts: (query: string, communityId?: string): Promise<any> => {
    const searchParams = new URLSearchParams();
    searchParams.append('q', query);
    if (communityId) searchParams.append('community', communityId);

    return client.get(`/search/posts?${searchParams.toString()}`);
  },

  communities: (query: string): Promise<any> => {
    const searchParams = new URLSearchParams();
    searchParams.append('q', query);

    return client.get(`/search/communities?${searchParams.toString()}`);
  },

  users: (query: string, role?: string): Promise<any> => {
    const searchParams = new URLSearchParams();
    searchParams.append('q', query);
    if (role) searchParams.append('role', role);

    return client.get(`/search/users?${searchParams.toString()}`);
  },

  global: (query: string, type?: string): Promise<any> => {
    const searchParams = new URLSearchParams();
    searchParams.append('q', query);
    if (type) searchParams.append('type', type);

    return client.get(`/search/global?${searchParams.toString()}`);
  },
});

// Files service
export const createFilesService = (client: Client) => ({
  upload: (file: File, metadata?: any): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }

    return client.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  getById: (fileId: string): Promise<any> =>
    client.get(`/files/${fileId}`),

  // Secure file download with authentication
  download: (fileId: string): Promise<Blob> =>
    client.get(`/files/${fileId}/download`, {
      responseType: 'blob',
    }),

  // Get secure file URL with temporary token
  getSecureUrl: (fileId: string, expirationMinutes: number = 60): Promise<{ url: string; expiresAt: string }> =>
    client.post(`/files/${fileId}/secure-url`, { expirationMinutes }),

  // Admin-only file access
  adminGetFile: (fileId: string): Promise<any> =>
    client.get(`/admin/files/${fileId}`),

  adminDownloadFile: (fileId: string): Promise<Blob> =>
    client.get(`/admin/files/${fileId}/download`, {
      responseType: 'blob',
    }),

  // Bulk file operations for admin
  adminGetFilesByApplication: (applicationId: string): Promise<any[]> =>
    client.get(`/admin/files/application/${applicationId}`),

  delete: (fileId: string): Promise<void> =>
    client.delete(`/files/${fileId}`),

  getMy: (params: { type?: string; limit?: number; offset?: number } = {}): Promise<any> => {
    const searchParams = new URLSearchParams();
    
    if (params.type) searchParams.append('type', params.type);
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.offset) searchParams.append('offset', params.offset.toString());

    const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return client.get(`/files${queryString}`);
  },

  // Therapist application document access
  getApplicationDocuments: (applicationId: string): Promise<any[]> =>
    client.get(`/files/application/${applicationId}/documents`),
});

// Notifications service
export const createNotificationsService = (client: Client) => ({
  getMy: (params: { limit?: number; offset?: number; isRead?: boolean } = {}): Promise<any> => {
    const searchParams = new URLSearchParams();
    
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.offset) searchParams.append('offset', params.offset.toString());
    if (params.isRead !== undefined) searchParams.append('isRead', params.isRead.toString());

    const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return client.get(`/notifications${queryString}`);
  },

  markAsRead: (notificationId: string): Promise<void> =>
    client.patch(`/notifications/${notificationId}/read`),

  markAllAsRead: (): Promise<void> =>
    client.patch('/notifications/read-all'),

  delete: (notificationId: string): Promise<void> =>
    client.delete(`/notifications/${notificationId}`),

  getUnreadCount: (): Promise<{ count: number }> =>
    client.get('/notifications/unread-count'),
});

// Client management service (for therapists) - legacy
export const createClientManagementService = (client: Client) => ({
  getAssigned: (): Promise<any[]> =>
    client.get('/client/assigned'),

  getById: (clientId: string): Promise<any> =>
    client.get(`/client/${clientId}`),

  updateNotes: (clientId: string, notes: string): Promise<any> =>
    client.patch(`/client/${clientId}/notes`, { notes }),

  getProgress: (clientId: string): Promise<any> =>
    client.get(`/client/${clientId}/progress`),

  getSessions: (clientId: string): Promise<any[]> =>
    client.get(`/client/${clientId}/sessions`),
});

// Main service factory that creates all services
export const createApiServices = (client: AxiosInstance) => ({
  users: createUserService(client),
  therapists: createTherapistService(client),
  reviews: createReviewsService(client),
  booking: createBookingService(client),
  communities: createCommunityService(client),
  admin: createAdminService(client),
  search: createSearchService(client),
  files: createFilesService(client),
  notifications: createNotificationsService(client),
  client: createClientService(client),
  clientManagement: createClientManagementService(client),
});

export type ApiServices = ReturnType<typeof createApiServices>;

// Export individual service types
export type { UserService } from './users';
export type { TherapistService } from './therapists';
export type { ReviewsService } from './reviews';
export type { BookingService } from './booking';
export type { CommunityService } from './communities';
export type { ClientService } from './client';

// Export all types
export * from './users';
export * from './therapists';
export * from './reviews';
export * from './booking';
export * from './communities';
export * from './client';