export * from './useAdmin';
export { useAdminUsers } from './useAdminUsers';

// Therapist Application Management Hooks
export {
  // Query hooks
  usePendingTherapistApplications,
  useAllTherapistApplications,
  useTherapistApplicationDetails,
  useTherapistApplicationMetrics,
  
  // Mutation hooks
  useApproveTherapist,
  useRejectTherapist,
  useUpdateTherapistStatus,
  
  // Bulk operation hooks
  useBulkApproveTherapists,
  useBulkRejectTherapists,
  
  // Query keys for advanced cache management
  adminTherapistQueryKeys,
} from './useAdminTherapistApplications';

// Admin Reports Management Hooks
export {
  // Query hooks
  useAdminReports,
  useAdminReportDetails,
  useAdminReportsOverview,
  
  // Mutation hooks
  useUpdateReportStatus,
  useReportAction,
  
  // Specific action hooks
  useBanUser,
  useRestrictUser,
  useDeleteContent,
  useDismissReport,
  
  // Combined hooks
  useReportActions,
  
  // Query keys for cache management
  adminReportsQueryKeys,
} from './useAdminReports';