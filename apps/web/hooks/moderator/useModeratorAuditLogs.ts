import { useQuery } from '@tanstack/react-query';
import { useApi } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { STALE_TIME, GC_TIME } from '@/lib/constants/react-query';
import { MentaraApiError } from '@/lib/api/errorHandler';
import type { AuditLog, AuditLogParams } from '@/types/api';

/**
 * Hook for searching audit logs
 */
export function useModeratorAuditLogs(params: AuditLogParams = {}) {
  const api = useApi();
  
  return useQuery({
    queryKey: queryKeys.moderator.auditLogs(params),
    queryFn: () => api.moderator.auditLogs.search(params),
    staleTime: STALE_TIME.MEDIUM, // 5 minutes
    gcTime: GC_TIME.MEDIUM, // 10 minutes
    refetchOnWindowFocus: false,
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
    queryKey: [...queryKeys.moderator.auditLogs(), 'stats'],
    queryFn: () => api.moderator.auditLogs.getStats(),
    staleTime: STALE_TIME.MEDIUM, // 5 minutes
    gcTime: GC_TIME.MEDIUM, // 10 minutes
    refetchOnWindowFocus: false,
  });
}