// Export hooks explicitly to avoid conflicts
export * from './useModeratorAuditLogs';

// Export from useContentModeration (base versions)
export {
  useModerateContent as useContentModerationModerateContent,
  useModerateUser as useContentModerationModerateUser,
} from './useContentModeration';

// Export from useModeratorDashboard (preferred version)
export { useModeratorDashboard } from './useModeratorDashboard';

// Export from useModeratorUserManagement (preferred version for useModerateUser)
export {
  useModerateUser,
  useModeratorFlaggedUsers,
  useModeratorUserHistory,
} from './useModeratorUserManagement';

// Export from useModeratorContentQueue (preferred version for useModerateContent)
export {
  useModerateContent,
  useModeratorContentQueue,
} from './useModeratorContentQueue';

// Export from useModerator (includes useUpdateModerationReport)
export * from './useModerator';