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
    },
  };
}

export type AdminService = ReturnType<typeof createAdminService>;
