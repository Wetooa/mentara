import { AxiosInstance } from "axios";
import type { ApiDashboardResponse } from "../types/dashboard";

export interface DashboardService {
  getUserDashboard: () => Promise<ApiDashboardResponse>;
}

export const createDashboardService = (
  client: AxiosInstance
): DashboardService => ({
  // Get current user's dashboard data
  getUserDashboard: (): Promise<ApiDashboardResponse> =>
    client.get("/dashboard/user"),
});
