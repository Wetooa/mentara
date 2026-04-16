import { AxiosInstance } from "axios";
import { MentaraApiError } from "../errorHandler";
import type {
  PendingTherapistFiltersDto,
  ApproveTherapistDto,
  RejectTherapistDto,
  UpdateTherapistStatusDto,
  TherapistListResponse,
  TherapistApplicationDetailsResponse,
  TherapistActionResponse,
  TherapistApplicationMetricsResponse,
} from "@/types/api/admin";

/**
 * Admin API Service
 *
 * Comprehensive service layer for admin-related operations, specifically
 * focused on therapist application management. This service provides a
 * complete interface to the NestJS backend AdminTherapistController.
 *
 * Key Features:
 * - Therapist application CRUD operations
 * - Advanced filtering and pagination support
 * - Status management (approve, reject, suspend)
 * - Detailed application metrics and reporting
 * - Comprehensive error handling with typed responses
 * - Complete endpoint synchronization with backend
 *
 * Usage:
 * ```typescript
 * const api = useApi();
 * const applications = await api.admin.getPendingTherapistApplications({
 *   status: 'pending',
 *   limit: 50
 * });
 * ```
 *
 * @version 2.0.0
 * @lastUpdated 2025-01-22 - Full endpoint and type synchronization
 * @maintainer Frontend Architecture Team
 */
export function createAdminService(axios: AxiosInstance) {
  /**
   * Internal helper to handle API errors consistently
   */
  const handleApiError = (error: any): never => {
    throw MentaraApiError.fromAxiosError(error);
  };

  return {
    /**
     * Check admin permissions
     * Endpoint: GET /admin/check
     * @throws MentaraApiError on request failure
     */
    async checkAdmin() {
      try {
        const { data } = await axios.get("/admin/check");
        return data;
      } catch (error) {
        handleApiError(error);
      }
    },

    /**
     * Get pending therapist applications with filters
     * Endpoint: GET /admin/therapists/pending
     * @throws MentaraApiError on request failure
     */
    async getPendingTherapistApplications(
      params?: PendingTherapistFiltersDto
    ): Promise<TherapistListResponse> {
      try {
        const { data } = await axios.get("/admin/therapists/pending", {
          params,
        });
        return data;
      } catch (error) {
        handleApiError(error);
      }
    },

    /**
     * Get all therapist applications (not just pending)
     * Endpoint: GET /admin/therapists/applications
     * @throws MentaraApiError on request failure
     */
    async getAllTherapistApplications(
      params?: PendingTherapistFiltersDto
    ): Promise<TherapistListResponse> {
      try {
        const { data } = await axios.get("/admin/therapists/applications", {
          params,
        });
        return data;
      } catch (error) {
        handleApiError(error);
      }
    },

    /**
     * Get therapist application metrics
     * Endpoint: GET /admin/therapists/metrics
     * @throws MentaraApiError on request failure
     */
    async getTherapistApplicationMetrics(
      startDate?: string,
      endDate?: string
    ): Promise<TherapistApplicationMetricsResponse> {
      try {
        const { data } = await axios.get("/admin/therapists/metrics", {
          params: { startDate, endDate },
        });
        return data;
      } catch (error) {
        handleApiError(error);
      }
    },

    /**
     * Approve therapist application
     * Endpoint: POST /admin/therapists/:id/approve
     * @throws MentaraApiError on request failure (401, 403, 404, etc.)
     */
    async approveTherapist(
      therapistId: string,
      approvalData: ApproveTherapistDto
    ): Promise<TherapistActionResponse> {
      try {
        const { data } = await axios.post(
          `/admin/therapists/${therapistId}/approve`,
          approvalData
        );
        return data;
      } catch (error) {
        handleApiError(error);
      }
    },

    /**
     * Reject therapist application
     * Endpoint: POST /admin/therapists/:id/reject
     * @throws MentaraApiError on request failure (401, 403, 404, validation errors)
     */
    async rejectTherapist(
      therapistId: string,
      rejectionData: RejectTherapistDto
    ): Promise<TherapistActionResponse> {
      try {
        const { data } = await axios.post(
          `/admin/therapists/${therapistId}/reject`,
          rejectionData
        );
        return data;
      } catch (error) {
        handleApiError(error);
      }
    },

    /**
     * Update therapist status (including suspension)
     * Endpoint: PUT /admin/therapists/:id/status
     * @throws MentaraApiError on request failure (400 for invalid transitions, 403, 404)
     */
    async updateTherapistStatus(
      therapistId: string,
      statusData: UpdateTherapistStatusDto
    ): Promise<TherapistActionResponse> {
      try {
        const { data } = await axios.put(
          `/admin/therapists/${therapistId}/status`,
          statusData
        );
        return data;
      } catch (error) {
        handleApiError(error);
      }
    },

    /**
     * Get single therapist application details by ID
     * Endpoint: GET /admin/therapists/:id/details
     * @throws MentaraApiError on request failure (401, 403, 404)
     */
    async getTherapistApplicationDetails(
      applicationId: string
    ): Promise<TherapistApplicationDetailsResponse> {
      try {
        const { data } = await axios.get(
          `/admin/therapists/${applicationId}/details`
        );
        return data;
      } catch (error) {
        handleApiError(error);
      }
    },

    // User Management Methods
    users: {
      /**
       * Get all users with filtering and pagination
       * Endpoint: GET /admin/users
       * @throws MentaraApiError on request failure
       */
      async getList(params?: {
        role?: string;
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
      }) {
        try {
          const { data } = await axios.get("/admin/users", { params });
          return data;
        } catch (error) {
          handleApiError(error);
        }
      },

      /**
       * Get specific user by ID
       * Endpoint: GET /admin/users/:id
       * @throws MentaraApiError on request failure
       */
      async getById(userId: string) {
        try {
          const { data } = await axios.get(`/admin/users/${userId}`);
          return data;
        } catch (error) {
          handleApiError(error);
        }
      },

      /**
       * Suspend user
       * Endpoint: PUT /admin/users/:id/suspend
       * @throws MentaraApiError on request failure
       */
      async suspend(userId: string, suspensionData: { reason: string; duration?: number }) {
        try {
          const { data } = await axios.put(`/admin/users/${userId}/suspend`, suspensionData);
          return data;
        } catch (error) {
          handleApiError(error);
        }
      },

      /**
       * Unsuspend user
       * Endpoint: PUT /admin/users/:id/unsuspend
       * @throws MentaraApiError on request failure
       */
      async unsuspend(userId: string) {
        try {
          const { data } = await axios.put(`/admin/users/${userId}/unsuspend`);
          return data;
        } catch (error) {
          handleApiError(error);
        }
      },

      /**
       * Delete user
       * Endpoint: DELETE /admin/users/:id
       * @throws MentaraApiError on request failure
       */
      async delete(userId: string) {
        try {
          const { data } = await axios.delete(`/admin/users/${userId}`);
          return data;
        } catch (error) {
          handleApiError(error);
        }
      },

      /**
       * Send verification email to user
       * Endpoint: POST /admin/users/:id/send-verification
       * @throws MentaraApiError on request failure
       */
      async sendVerificationEmail(userId: string) {
        try {
          const { data } = await axios.post(`/admin/users/${userId}/send-verification`);
          return data;
        } catch (error) {
          handleApiError(error);
        }
      },

      /**
       * Update user role
       * Endpoint: PUT /admin/users/:id/role
       * @throws MentaraApiError on request failure
       */
      async updateRole(userId: string, roleData: { role: string }) {
        try {
          const { data } = await axios.put(`/admin/users/${userId}/role`, roleData);
          return data;
        } catch (error) {
          handleApiError(error);
        }
      },

      /**
       * Create new user
       * Endpoint: POST /admin/users
       * @throws MentaraApiError on request failure
       */
      async create(userData: any) {
        try {
          const { data } = await axios.post('/admin/users', userData);
          return data;
        } catch (error) {
          handleApiError(error);
        }
      },

      /**
       * Update user
       * Endpoint: PUT /admin/users/:id
       * @throws MentaraApiError on request failure
       */
      async update(userId: string, userData: any) {
        try {
          const { data } = await axios.put(`/admin/users/${userId}`, userData);
          return data;
        } catch (error) {
          handleApiError(error);
        }
      },
    },

    // Analytics Methods
    analytics: {
      /**
       * Get system statistics
       * Endpoint: GET /admin/analytics/system-stats
       * @throws MentaraApiError on request failure
       */
      async getSystemStats() {
        try {
          const { data } = await axios.get("/admin/analytics/system-stats");
          return data;
        } catch (error) {
          handleApiError(error);
        }
      },

      /**
       * Get user growth analytics
       * Endpoint: GET /admin/analytics/user-growth
       * @throws MentaraApiError on request failure
       */
      async getUserGrowth(params?: { startDate?: string; endDate?: string }) {
        try {
          const { data } = await axios.get("/admin/analytics/user-growth", { params });
          return data;
        } catch (error) {
          handleApiError(error);
        }
      },

      /**
       * Get engagement analytics
       * Endpoint: GET /admin/analytics/engagement
       * @throws MentaraApiError on request failure
       */
      async getEngagement(params?: { startDate?: string; endDate?: string }) {
        try {
          const { data } = await axios.get("/admin/analytics/engagement", { params });
          return data;
        } catch (error) {
          handleApiError(error);
        }
      },

      /**
       * Get platform overview analytics
       * Endpoint: GET /admin/analytics/platform-overview
       * @throws MentaraApiError on request failure
       */
      async getPlatformOverview() {
        try {
          const { data } = await axios.get("/admin/analytics/platform-overview");
          return data;
        } catch (error) {
          handleApiError(error);
        }
      },

      /**
       * Get user statistics
       * Endpoint: GET /admin/analytics/user-stats
       * @throws MentaraApiError on request failure
       */
      async getUserStats() {
        try {
          const { data } = await axios.get("/admin/analytics/user-stats");
          return data;
        } catch (error) {
          handleApiError(error);
        }
      },
    },

    // Therapist Applications Methods
    therapistApplications: {
      /**
       * Get therapist applications list
       * Endpoint: GET /admin/therapist-applications
       * @throws MentaraApiError on request failure
       */
      async getList(params?: any) {
        try {
          const { data } = await axios.get("/admin/therapist-applications", { params });
          return data;
        } catch (error) {
          handleApiError(error);
        }
      },

      /**
       * Get therapist application by ID
       * Endpoint: GET /admin/therapist-applications/:id
       * @throws MentaraApiError on request failure
       */
      async getById(applicationId: string) {
        try {
          const { data } = await axios.get(`/admin/therapist-applications/${applicationId}`);
          return data;
        } catch (error) {
          handleApiError(error);
        }
      },

      /**
       * Update therapist application status
       * Endpoint: PUT /admin/therapist-applications/:id/status
       * @throws MentaraApiError on request failure
       */
      async updateStatus(applicationId: string, statusData: any) {
        try {
          const { data } = await axios.put(`/admin/therapist-applications/${applicationId}/status`, statusData);
          return data;
        } catch (error) {
          handleApiError(error);
        }
      },
    },

    // Reports Methods
    reports: {
      /**
       * Get all reports with filtering
       * Endpoint: GET /admin/reports
       * @throws MentaraApiError on request failure
       */
      async getList(params?: {
        type?: 'post' | 'comment' | 'user';
        status?: 'pending' | 'reviewed' | 'dismissed';
        page?: number;
        limit?: number;
        search?: string;
      }) {
        try {
          const { data } = await axios.get("/admin/reports", { params });
          return data;
        } catch (error) {
          handleApiError(error);
        }
      },

      /**
       * Get specific report by ID
       * Endpoint: GET /admin/reports/:id
       * @throws MentaraApiError on request failure
       */
      async getById(reportId: string) {
        try {
          const { data } = await axios.get(`/admin/reports/${reportId}`);
          return data;
        } catch (error) {
          handleApiError(error);
        }
      },

      /**
       * Update report status
       * Endpoint: PUT /admin/reports/:id/status
       * @throws MentaraApiError on request failure
       */
      async updateStatus(reportId: string, status: 'reviewed' | 'dismissed', reason?: string) {
        try {
          const { data } = await axios.put(`/admin/reports/${reportId}/status`, {
            status,
            reason,
          });
          return data;
        } catch (error) {
          handleApiError(error);
        }
      },

      /**
       * Take action on a report (ban user, restrict user, delete content, dismiss)
       * Endpoint: POST /admin/reports/:id/action
       * @throws MentaraApiError on request failure
       */
      async takeAction(
        reportId: string,
        action: 'ban_user' | 'restrict_user' | 'delete_content' | 'dismiss',
        reason?: string
      ) {
        try {
          const { data } = await axios.post(`/admin/reports/${reportId}/action`, {
            action,
            reason,
          });
          return data;
        } catch (error) {
          handleApiError(error);
        }
      },

      /**
       * Ban user from a report
       * Endpoint: POST /admin/reports/:id/action
       * @throws MentaraApiError on request failure
       */
      async banUser(reportId: string, reason?: string) {
        return this.takeAction(reportId, 'ban_user', reason);
      },

      /**
       * Restrict user from a report
       * Endpoint: POST /admin/reports/:id/action
       * @throws MentaraApiError on request failure
       */
      async restrictUser(reportId: string, reason?: string) {
        return this.takeAction(reportId, 'restrict_user', reason);
      },

      /**
       * Delete content from a report
       * Endpoint: POST /admin/reports/:id/action
       * @throws MentaraApiError on request failure
       */
      async deleteContent(reportId: string, reason?: string) {
        return this.takeAction(reportId, 'delete_content', reason);
      },

      /**
       * Dismiss report
       * Endpoint: POST /admin/reports/:id/action
       * @throws MentaraApiError on request failure
       */
      async dismissReport(reportId: string, reason?: string) {
        return this.takeAction(reportId, 'dismiss', reason);
      },

      /**
       * Get reports overview statistics
       * Endpoint: GET /admin/reports/stats/overview
       * @throws MentaraApiError on request failure
       */
      async getOverview() {
        try {
          const { data } = await axios.get("/admin/reports/stats/overview");
          return data;
        } catch (error) {
          handleApiError(error);
        }
      },
    },

    // Legacy Moderation Methods (kept for backward compatibility)
    moderation: {
      /**
       * Get moderation reports (deprecated - use reports.getList instead)
       * @deprecated Use reports.getList instead
       */
      async getReports(params?: any) {
        try {
          const { data } = await axios.get("/admin/moderation/reports", { params });
          return data;
        } catch (error) {
          handleApiError(error);
        }
      },

      /**
       * Update moderation report (deprecated - use reports.updateStatus instead)
       * @deprecated Use reports.updateStatus instead
       */
      async updateReport(reportId: string, reportData: any) {
        try {
          const { data } = await axios.put(`/admin/moderation/reports/${reportId}`, reportData);
          return data;
        } catch (error) {
          handleApiError(error);
        }
      },

      /**
       * Get flagged content
       * Endpoint: GET /admin/moderation/flagged-content
       * @throws MentaraApiError on request failure
       */
      async getFlaggedContent(params?: any) {
        try {
          const { data } = await axios.get("/admin/moderation/flagged-content", { params });
          return data;
        } catch (error) {
          handleApiError(error);
        }
      },

      /**
       * Moderate content
       * Endpoint: POST /admin/moderation/moderate
       * @throws MentaraApiError on request failure
       */
      async moderateContent(contentType: string, contentId: string, action: string, reason?: string) {
        try {
          const { data } = await axios.post("/admin/moderation/moderate", {
            contentType,
            contentId,
            action,
            reason,
          });
          return data;
        } catch (error) {
          handleApiError(error);
        }
      },
    },

    // Configuration Methods
    config: {
      /**
       * Get system configuration
       * Endpoint: GET /admin/config
       * @throws MentaraApiError on request failure
       */
      async get() {
        try {
          const { data } = await axios.get("/admin/config");
          return data;
        } catch (error) {
          handleApiError(error);
        }
      },

      /**
       * Update system configuration
       * Endpoint: PUT /admin/config
       * @throws MentaraApiError on request failure
       */
      async update(configData: any) {
        try {
          const { data } = await axios.put("/admin/config", configData);
          return data;
        } catch (error) {
          handleApiError(error);
        }
      },

      /**
       * Get feature flags
       * Endpoint: GET /admin/config/feature-flags
       * @throws MentaraApiError on request failure
       */
      async getFeatureFlags() {
        try {
          const { data } = await axios.get("/admin/config/feature-flags");
          return data;
        } catch (error) {
          handleApiError(error);
        }
      },

      /**
       * Update feature flag
       * Endpoint: PUT /admin/config/feature-flags/:flagName
       * @throws MentaraApiError on request failure
       */
      async updateFeatureFlag(flagName: string, flagData: any) {
        try {
          const { data } = await axios.put(`/admin/config/feature-flags/${flagName}`, flagData);
          return data;
        } catch (error) {
          handleApiError(error);
        }
      },
    },

    // Profile Methods
    profile: {
      /**
       * Get admin profile
       * Endpoint: GET /admin/profile
       * @throws MentaraApiError on request failure
       */
      async get() {
        try {
          const { data } = await axios.get("/admin/profile");
          return data;
        } catch (error) {
          handleApiError(error);
        }
      },

      /**
       * Update admin profile
       * Endpoint: PUT /admin/profile
       * @throws MentaraApiError on request failure
       */
      async update(profileData: any) {
        try {
          const { data } = await axios.put("/admin/profile", profileData);
          return data;
        } catch (error) {
          handleApiError(error);
        }
      },
    },
  };
}

export type AdminService = ReturnType<typeof createAdminService>;
