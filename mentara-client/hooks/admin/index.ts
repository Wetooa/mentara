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