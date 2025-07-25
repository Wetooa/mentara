import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
import { toast } from "sonner";

// Query Keys
export const adminReportsQueryKeys = {
  all: ['admin', 'reports'] as const,
  lists: () => [...adminReportsQueryKeys.all, 'list'] as const,
  list: (filters: any) => [...adminReportsQueryKeys.lists(), filters] as const,
  details: () => [...adminReportsQueryKeys.all, 'detail'] as const,  
  detail: (id: string) => [...adminReportsQueryKeys.details(), id] as const,
  overview: () => [...adminReportsQueryKeys.all, 'overview'] as const,
};

// Interfaces
interface ReportFilters {
  type?: 'post' | 'comment' | 'user';
  status?: 'pending' | 'reviewed' | 'dismissed';
  page?: number;
  limit?: number;
  search?: string;
}

interface ReportActionParams {
  reportId: string;
  action: 'ban_user' | 'restrict_user' | 'delete_content' | 'dismiss';
  reason?: string;
}

interface ReportStatusUpdateParams {
  reportId: string;
  status: 'reviewed' | 'dismissed';
  reason?: string;
}

// Custom Hooks
export function useAdminReports(filters: ReportFilters = {}) {
  const api = useApi();

  return useQuery({
    queryKey: adminReportsQueryKeys.list(filters),
    queryFn: () => api.admin.reports.getList(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useAdminReportDetails(reportId: string | null) {
  const api = useApi();

  return useQuery({
    queryKey: adminReportsQueryKeys.detail(reportId || ''),
    queryFn: () => api.admin.reports.getById(reportId!),
    enabled: !!reportId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useAdminReportsOverview() {
  const api = useApi();

  return useQuery({
    queryKey: adminReportsQueryKeys.overview(),
    queryFn: () => api.admin.reports.getOverview(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUpdateReportStatus() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reportId, status, reason }: ReportStatusUpdateParams) =>
      api.admin.reports.updateStatus(reportId, status, reason),
    onSuccess: (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: adminReportsQueryKeys.all });
      
      toast.success(
        variables.status === 'reviewed' 
          ? 'Report marked as reviewed' 
          : 'Report dismissed successfully'
      );
    },
    onError: (error: any) => {
      toast.error(
        `Failed to update report status: ${error.message || 'Unknown error'}`
      );
    },
  });
}

export function useReportAction() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reportId, action, reason }: ReportActionParams) =>
      api.admin.reports.takeAction(reportId, action, reason),
    onSuccess: (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: adminReportsQueryKeys.all });
      
      // Show success message based on action
      const actionMessages = {
        ban_user: 'User has been banned successfully',
        restrict_user: 'User has been restricted successfully',  
        delete_content: 'Content has been deleted successfully',
        dismiss: 'Report has been dismissed successfully',
      };
      
      toast.success(actionMessages[variables.action] || 'Action completed successfully');
    },
    onError: (error: any) => {
      toast.error(
        `Failed to take action: ${error.message || 'Unknown error'}`
      );
    },
  });
}

// Specific action hooks for easier usage
export function useBanUser() {
  const reportAction = useReportAction();
  
  return {
    ...reportAction,
    banUser: (reportId: string, reason?: string) =>
      reportAction.mutate({ reportId, action: 'ban_user', reason }),
  };
}

export function useRestrictUser() {
  const reportAction = useReportAction();
  
  return {
    ...reportAction,
    restrictUser: (reportId: string, reason?: string) =>
      reportAction.mutate({ reportId, action: 'restrict_user', reason }),
  };
}

export function useDeleteContent() {
  const reportAction = useReportAction();
  
  return {
    ...reportAction,
    deleteContent: (reportId: string, reason?: string) =>
      reportAction.mutate({ reportId, action: 'delete_content', reason }),
  };
}

export function useDismissReport() {
  const reportAction = useReportAction();
  
  return {
    ...reportAction,
    dismissReport: (reportId: string, reason?: string) =>
      reportAction.mutate({ reportId, action: 'dismiss', reason }),
  };
}

// Combined hook for all report actions
export function useReportActions() {
  const banUser = useBanUser();
  const restrictUser = useRestrictUser();
  const deleteContent = useDeleteContent();
  const dismissReport = useDismissReport();

  return {
    banUser: banUser.banUser,
    restrictUser: restrictUser.restrictUser,
    deleteContent: deleteContent.deleteContent,
    dismissReport: dismissReport.dismissReport,
    isLoading: banUser.isPending || restrictUser.isPending || deleteContent.isPending || dismissReport.isPending,
    error: banUser.error || restrictUser.error || deleteContent.error || dismissReport.error,
  };
}