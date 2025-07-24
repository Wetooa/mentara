/**
 * Meeting status constants for booking system
 * These constants ensure consistency between availability checking and conflict detection
 */

/**
 * Meeting statuses that should be considered "active" and block availability slots
 * Used by both availability checking and conflict detection to ensure consistency
 */
export const ACTIVE_MEETING_STATUSES = [
  'SCHEDULED',
  'WAITING',
  'CONFIRMED', 
  'IN_PROGRESS'
] as const;

/**
 * Mutable version for use in Prisma queries
 */
export const ACTIVE_MEETING_STATUSES_ARRAY = [...ACTIVE_MEETING_STATUSES];

/**
 * All possible meeting statuses
 */
export const ALL_MEETING_STATUSES = [
  'SCHEDULED',
  'WAITING',
  'CONFIRMED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW'
] as const;

/**
 * Meeting statuses that represent completed/finished meetings
 */
export const COMPLETED_MEETING_STATUSES = [
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW'
] as const;