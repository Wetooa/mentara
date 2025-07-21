import { AxiosInstance } from "axios";

/**
 * Admin API service for platform management and therapist applications
 */
export function createAdminService(axios: AxiosInstance) {
  return {
    /**
     * Get therapist applications with filters
     */
    async getTherapistApplications(params?: {
      status?: "pending" | "approved" | "rejected" | "suspended";
      page?: number;
      limit?: number;
      province?: string;
      submittedAfter?: string;
      processedBy?: string;
      providerType?: string;
    }): Promise<{
      applications: Array<{
        id: string;
        userId: string;
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        status: string;
        submittedAt: string;
        processedAt?: string;
        processedBy?: string;
        rejectionReason?: string;
        approvalMessage?: string;
        profileData?: Record<string, unknown>;
        credentials?: Record<string, unknown>;
        uploadedFiles?: Array<{
          id: string;
          fileName: string;
          fileUrl: string;
          uploadedAt: string;
        }>;
      }>;
      totalCount: number;
      page: number;
      totalPages: number;
    }> {
      const { data } = await axios.get("/auth/therapist/applications", {
        params,
      });
      return data;
    },

    /**
     * Get therapist statistics from admin dashboard
     */
    async getTherapistStatistics(): Promise<{
      totalApplications: number;
      pendingApplications: number;
      approvedTherapists: number;
      rejectedApplications: number;
      activeTherapists: number;
      suspendedTherapists: number;
      averageProcessingTime: number;
      monthlyApplications: Array<{
        month: string;
        count: number;
      }>;
      applicationsByStatus: Array<{
        status: string;
        count: number;
      }>;
    }> {
      const { data } = await axios.get("/dashboard/admin/analytics");
      return data;
    },

    /**
     * Approve therapist application
     */
    async approveTherapist(
      therapistId: string,
      approvalData: {
        approvalMessage?: string;
        notifyTherapist?: boolean;
        sendWelcomeEmail?: boolean;
      }
    ): Promise<{
      success: boolean;
      message: string;
      credentials?: {
        email: string;
        password: string;
      };
    }> {
      const { data } = await axios.put(
        `/auth/therapist/applications/${therapistId}/status`,
        {
          status: "approved",
          ...approvalData,
        }
      );
      return data;
    },

    /**
     * Reject therapist application
     */
    async rejectTherapist(
      therapistId: string,
      rejectionData: {
        rejectionReason: string;
        customMessage?: string;
        notifyTherapist?: boolean;
        allowReapplication?: boolean;
      }
    ): Promise<{
      success: boolean;
      message: string;
    }> {
      const { data } = await axios.put(
        `/auth/therapist/applications/${therapistId}/status`,
        {
          status: "rejected",
          ...rejectionData,
        }
      );
      return data;
    },

    /**
     * Suspend therapist account
     */
    async suspendTherapist(
      therapistId: string,
      suspensionData: {
        suspensionReason: string;
        customMessage?: string;
        notifyTherapist?: boolean;
        suspensionDuration?: number; // in days
      }
    ): Promise<{
      success: boolean;
      message: string;
    }> {
      const { data } = await axios.put(
        `/auth/therapist/applications/${therapistId}/status`,
        {
          status: "suspended",
          ...suspensionData,
        }
      );
      return data;
    },

    /**
     * Nested object for therapist applications management
     */
    therapistApplications: {
      /**
       * Get single therapist application by ID
       */
      async getById(applicationId: string): Promise<{
        id: string;
        userId: string;
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        status: string;
        submittedAt: string;
        processedAt?: string;
        processedBy?: string;
        rejectionReason?: string;
        approvalMessage?: string;
        profileData?: Record<string, unknown>;
        credentials?: Record<string, unknown>;
        uploadedFiles?: Array<{
          id: string;
          fileName: string;
          fileUrl: string;
          uploadedAt: string;
        }>;
        user?: {
          id: string;
          email: string;
          firstName: string;
          lastName: string;
          role: string;
          emailVerified: boolean;
        };
      }> {
        const { data } = await axios.get(
          `/auth/therapist/applications/${applicationId}`
        );
        return data;
      },

      /**
       * Get application files
       */
      async getFiles(applicationId: string): Promise<
        Array<{
          id: string;
          fileName: string;
          fileUrl: string;
          uploadedAt: string;
        }>
      > {
        const { data } = await axios.get(
          `/auth/therapist/applications/${applicationId}/files`
        );
        return data;
      },
    },

    /**
     * Get platform analytics for admin dashboard
     */
    async getPlatformAnalytics(): Promise<{
      userGrowth: Array<{ month: string; users: number }>;
      sessionMetrics: {
        totalSessions: number;
        completedSessions: number;
        averageDuration: number;
      };
      revenueMetrics: {
        totalRevenue: number;
        monthlyRevenue: Array<{ month: string; revenue: number }>;
      };
      therapistMetrics: {
        totalTherapists: number;
        activeTherapists: number;
        averageRating: number;
      };
    }> {
      const { data } = await axios.get("/dashboard/admin/analytics");
      return data;
    },

    /**
     * Get user management data
     */
    async getUserManagement(): Promise<{
      totalUsers: number;
      activeUsers: number;
      newUsersThisMonth: number;
      usersByRole: Array<{
        role: string;
        count: number;
      }>;
      recentUsers: Array<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        createdAt: string;
      }>;
    }> {
      const { data } = await axios.get("/dashboard/admin/users");
      return data;
    },

    /**
     * Get system health status
     */
    async getSystemHealth(): Promise<{
      status: "healthy" | "degraded" | "down";
      services: Array<{
        name: string;
        status: "up" | "down" | "degraded";
        responseTime: number;
        lastCheck: string;
      }>;
      metrics: {
        uptime: number;
        totalRequests: number;
        errorRate: number;
      };
    }> {
      const { data } = await axios.get("/dashboard/admin/health");
      return data;
    },

    /**
     * Get financial overview
     */
    async getFinancialOverview(): Promise<{
      totalRevenue: number;
      monthlyRevenue: number;
      pendingPayments: number;
      refunds: number;
      subscriptions: {
        active: number;
        cancelled: number;
        revenue: number;
      };
      transactions: Array<{
        id: string;
        amount: number;
        type: string;
        status: string;
        createdAt: string;
      }>;
    }> {
      const { data } = await axios.get("/dashboard/admin/financial");
      return data;
    },
  };
}

export type AdminService = ReturnType<typeof createAdminService>;
