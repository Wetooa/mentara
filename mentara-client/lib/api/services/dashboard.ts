import { AxiosInstance } from "axios";
import {} from "mentara-commons";

/**
 * Dashboard API service with role-specific methods
 * All dashboard endpoints are coupled together since they share a single route
 */
export function createDashboardService(axios: AxiosInstance) {
  return {
    // Client Dashboard Methods
    async getClientDashboard(): Promise<ClientDashboardResponseDto> {
      const { data } = await axios.get("/dashboard/client");
      return data;
    },

    async getClientSessions() {
      const { data } = await axios.get("/dashboard/client/sessions");
      return data;
    },

    async getClientProgress() {
      const { data } = await axios.get("/dashboard/client/progress");
      return data;
    },

    async getClientWellness() {
      const { data } = await axios.get("/dashboard/client/wellness");
      return data;
    },

    // Therapist Dashboard Methods
    async getTherapistDashboard(): Promise<TherapistDashboardResponseDto> {
      const { data } = await axios.get("/dashboard/therapist");
      return data;
    },

    async getTherapistPatients() {
      const { data } = await axios.get("/dashboard/therapist/patients");
      return data;
    },

    async getTherapistSchedule() {
      const { data } = await axios.get("/dashboard/therapist/schedule");
      return data;
    },

    async getTherapistMetrics() {
      const { data } = await axios.get("/dashboard/therapist/metrics");
      return data;
    },

    async getTherapistEarnings() {
      const { data } = await axios.get("/dashboard/therapist/earnings");
      return data;
    },

    // Admin Dashboard Methods
    async getAdminDashboard(): Promise<AdminDashboardResponseDto> {
      const { data } = await axios.get("/dashboard/admin");
      return data;
    },

    async getPlatformAnalytics() {
      const { data } = await axios.get("/dashboard/admin/analytics");
      return data;
    },

    async getUserManagement() {
      const { data } = await axios.get("/dashboard/admin/users");
      return data;
    },

    async getSystemHealth() {
      const { data } = await axios.get("/dashboard/admin/health");
      return data;
    },

    async getFinancialOverview() {
      const { data } = await axios.get("/dashboard/admin/financial");
      return data;
    },

    // Moderator Dashboard Methods
    async getModeratorDashboard(): Promise<ModeratorDashboardResponseDto> {
      const { data } = await axios.get("/dashboard/moderator");
      return data;
    },

    async getModerationQueue() {
      const { data } = await axios.get("/dashboard/moderator/queue");
      return data;
    },

    async getCommunityStats() {
      const { data } = await axios.get("/dashboard/moderator/communities");
      return data;
    },

    async getReportedContent() {
      const { data } = await axios.get("/dashboard/moderator/reports");
      return data;
    },

    async getModerationActivity() {
      const { data } = await axios.get("/dashboard/moderator/activity");
      return data;
    },

    // Legacy Methods (for backwards compatibility)
    async getUserDashboard() {
      // Uses legacy /dashboard/user route for backwards compatibility
      const { data } = await axios.get("/dashboard/user");
      return data;
    },
  };
}

export type DashboardService = ReturnType<typeof createDashboardService>;
