import { useQuery } from '@tanstack/react-query';
import { useApi } from '@/lib/api';
import { MentaraApiError } from '@/lib/api/errorHandler';
import type { AuditLog, AuditLogParams } from '@/types/api';

/**
 * Hook for searching audit logs
 */
export function useModeratorAuditLogs(params: AuditLogParams = {}) {
  const api = useApi();
  
  return useQuery({
    queryKey: ['moderator', 'auditLogs', 'search', params],
    queryFn: () => api.moderator.auditLogs.search(params),
    staleTime: 1000 * 60 * 5, // 5 minutes (audit logs are relatively stable)
    retry: (failureCount, error: MentaraApiError) => {
      if (error?.status === 403 || error?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

/**
 * Hook for fetching audit logs statistics
 */
export function useModeratorAuditLogsStats() {
  const api = useApi();
  
  return useQuery({
    queryKey: ['moderator', 'auditLogs', 'stats'],
    queryFn: () => api.moderator.auditLogs.getStats(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}