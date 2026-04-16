import { AxiosInstance } from "axios";
import { MentaraApiError } from "../errorHandler";

export interface AuditLogParams {
  action?: string;
  resource?: string;
  success?: boolean;
  userId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface AuditLog {
  id: string;
  action: string;
  resource: string;
  resourceId?: string;
  userId: string;
  userEmail?: string;
  userRole?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  success: boolean;
}

export interface AuditLogListResponse {
  logs: AuditLog[];
  total: number;
  page?: number;
  limit?: number;
}

export function createAuditLogsService(axios: AxiosInstance) {
  const handleApiError = (error: any): never => {
    throw MentaraApiError.fromAxiosError(error);
  };

  return {
    /**
     * Get audit logs list with filtering
     * Endpoint: GET /audit-logs
     */
    async getList(params?: AuditLogParams): Promise<AuditLogListResponse> {
      try {
        const { data } = await axios.get("/audit-logs", { params });
        return data;
      } catch (error) {
        handleApiError(error);
      }
    },
  };
}

export type AuditLogsService = ReturnType<typeof createAuditLogsService>;

