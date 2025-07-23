import { zonedTimeToUtc, utcToZonedTime, format } from 'date-fns-tz';
import { format as formatDate } from 'date-fns';

// Asia/Manila timezone
export const MANILA_TIMEZONE = 'Asia/Manila';

/**
 * Convert a date to Asia/Manila timezone
 */
export function toManilaTime(date: Date | string): Date {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return utcToZonedTime(dateObj, MANILA_TIMEZONE);
}

/**
 * Convert a Manila time date to UTC
 */
export function fromManilaTime(date: Date | string): Date {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return zonedTimeToUtc(dateObj, MANILA_TIMEZONE);
}

/**
 * Format a date in Asia/Manila timezone
 */
export function formatManilaTime(date: Date | string, formatString: string = 'yyyy-MM-dd HH:mm:ss'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, formatString, { timeZone: MANILA_TIMEZONE });
}

/**
 * Get current time in Asia/Manila timezone
 */
export function getCurrentManilaTime(): Date {
  return toManilaTime(new Date());
}

/**
 * Check if a date is in the past (Manila time)
 */
export function isPastInManila(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = getCurrentManilaTime();
  const targetDate = toManilaTime(dateObj);
  return targetDate < now;
}

/**
 * Check if booking can be made (respects minimum advance time in Manila timezone)
 */
export function canBookInAdvance(date: Date | string, minAdvanceHours: number = 0.5): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = getCurrentManilaTime();
  const targetDate = toManilaTime(dateObj);
  const minAdvanceTime = new Date(now.getTime() + (minAdvanceHours * 60 * 60 * 1000));
  
  return targetDate >= minAdvanceTime;
}

/**
 * Format time for display in Manila timezone
 */
export function formatManilaTimeForDisplay(date: Date | string): string {
  return formatManilaTime(date, 'MMM d, yyyy h:mm a');
}

/**
 * Format date for API calls (ISO string but considering Manila timezone)
 */
export function formatForApi(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return fromManilaTime(dateObj).toISOString();
}

/**
 * Get timezone offset for Manila (in minutes)
 */
export function getManilaTimezoneOffset(): number {
  const now = new Date();
  const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
  const manilaTime = new Date(utcTime + (8 * 60 * 60 * 1000)); // UTC+8
  return -480; // Manila is UTC+8, so offset is -480 minutes
}

/**
 * Convert user's local time input to Manila time for consistent handling
 */
export function normalizeToManilaTime(date: Date | string): Date {
  // If user is in Manila timezone, this will be the same
  // If user is in different timezone, convert their input to Manila time
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Assume user input is intended for Manila timezone
  return zonedTimeToUtc(dateObj, MANILA_TIMEZONE);
}

/**
 * Timezone utilities object for easier importing
 */
export const TimezoneUtils = {
  toManila: toManilaTime,
  fromManila: fromManilaTime,
  format: formatManilaTime,
  formatForDisplay: formatManilaTimeForDisplay,
  formatForApi: formatForApi,
  getCurrent: getCurrentManilaTime,
  isPast: isPastInManila,
  canBook: canBookInAdvance,
  normalize: normalizeToManilaTime,
  getOffset: getManilaTimezoneOffset,
  TIMEZONE: MANILA_TIMEZONE,
};