/**
 * React Query cache time constants (in milliseconds)
 * Centralized to ensure consistency across hooks and prevent magic numbers
 */

// Stale time constants (how long data is considered fresh)
export const STALE_TIME = {
  /** Very short-lived data (30 seconds) - real-time data, in-progress sessions */
  VERY_SHORT: 1000 * 30,
  /** Short-lived data (2 minutes) - dashboard data, communications */
  SHORT: 1000 * 60 * 2,
  /** Moderately short-lived data (5 minutes) - worksheets, sessions, communities */
  MEDIUM: 1000 * 60 * 5,
  /** Longer-lived data (10 minutes) - community lists, therapist data */
  LONG: 1000 * 60 * 10,
  /** Very long-lived data (15 minutes) - wellness metrics, progress data */
  VERY_LONG: 1000 * 60 * 15,
  /** Static or rarely changing data (30 minutes) - stats, settings */
  STATIC: 1000 * 60 * 30,
} as const;

// Garbage collection time constants (how long unused data stays in cache)
export const GC_TIME = {
  /** Short cache retention (5 minutes) */
  SHORT: 1000 * 60 * 5,
  /** Medium cache retention (10 minutes) - default */
  MEDIUM: 1000 * 60 * 10,
  /** Long cache retention (15 minutes) */
  LONG: 1000 * 60 * 15,
  /** Very long cache retention (30 minutes) */
  VERY_LONG: 1000 * 60 * 30,
  /** Extended cache retention (1 hour) - rarely used data */
  EXTENDED: 1000 * 60 * 60,
} as const;

// Refetch interval constants (for auto-refreshing queries)
export const REFETCH_INTERVAL = {
  /** Frequent auto-refresh (1 minute) - real-time data */
  FREQUENT: 1000 * 60 * 1,
  /** Moderate auto-refresh (5 minutes) - appointments, notifications */
  MODERATE: 1000 * 60 * 5,
  /** Occasional auto-refresh (15 minutes) - less critical data */
  OCCASIONAL: 1000 * 60 * 15,
  /** Notifications polling (10 seconds) - notification updates */
  NOTIFICATIONS: 10000,
} as const;

// Retry configuration
export const RETRY_CONFIG = {
  /** Default retry count */
  DEFAULT_COUNT: 3,
  /** Quick retry count for fast-failing requests */
  QUICK_COUNT: 1,
  /** No retries for certain error types */
  NONE: 0,
} as const;

