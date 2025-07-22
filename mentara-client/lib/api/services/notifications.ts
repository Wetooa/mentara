import { AxiosInstance } from "axios";

/**
 * Notification API service for managing user notifications
 */
export function createNotificationService(axios: AxiosInstance) {
  return {
    /**
     * Get user's notifications
     */
    async getMy(params?: {
      limit?: number;
      offset?: number;
      isRead?: boolean;
      type?: string;
      priority?: string;
    }) {
      const { data } = await axios.get("/notifications", { params });
      return data;
    },

    /**
     * Get unread notification count
     */
    async getUnreadCount() {
      const { data } = await axios.get("/notifications/unread-count");
      return data;
    },

    /**
     * Get specific notification by ID
     */
    async getById(notificationId: string) {
      const { data } = await axios.get(`/notifications/${notificationId}`);
      return data;
    },

    /**
     * Mark notification as read
     */
    async markAsRead(notificationId: string) {
      const { data } = await axios.patch(`/notifications/${notificationId}/read`);
      return data;
    },

    /**
     * Mark all notifications as read
     */
    async markAllAsRead() {
      const { data } = await axios.patch("/notifications/mark-all-read");
      return data;
    },

    /**
     * Delete notification
     */
    async delete(notificationId: string) {
      const { data } = await axios.delete(`/notifications/${notificationId}`);
      return data;
    },

    /**
     * Get notification settings
     */
    async getSettings() {
      const { data } = await axios.get("/notifications/settings");
      return data;
    },

    /**
     * Update notification settings
     */
    async updateSettings(settings: {
      emailAppointmentReminders?: boolean;
      emailNewMessages?: boolean;
      emailWorksheetUpdates?: boolean;
      emailSystemUpdates?: boolean;
      emailMarketing?: boolean;
      pushAppointmentReminders?: boolean;
      pushNewMessages?: boolean;
      pushWorksheetUpdates?: boolean;
      pushSystemUpdates?: boolean;
      inAppMessages?: boolean;
      inAppUpdates?: boolean;
      quietHoursEnabled?: boolean;
      quietHoursStart?: string;
      quietHoursEnd?: string;
      quietHoursTimezone?: string;
    }) {
      const { data } = await axios.put("/notifications/settings", settings);
      return data;
    },
  };
}

export type NotificationService = ReturnType<typeof createNotificationService>;