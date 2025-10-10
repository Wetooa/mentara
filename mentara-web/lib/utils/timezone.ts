/**
 * Simplified UTC-only timezone utilities (replacing Asia/Manila logic)
 */

/**
 * Get current time in UTC
 */
export function getCurrentUTCTime(): Date {
  return new Date();
}

/**
 * Format a date in UTC (simple format)
 */
export function formatUTCDate(date: Date | string, format: string = 'yyyy-MM-dd'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (format === 'yyyy-MM-dd') {
    // For date-only formats, use local date without timezone conversion
    // to prevent date shifting when user selects a local date
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  // For time-only format like "h:mm a"
  if (format === 'h:mm a') {
    return dateObj.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }
  
  // For display format like "MMM d, yyyy h:mm a", use user's local time
  if (format === 'MMM d, yyyy h:mm a') {
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }
  
  return dateObj.toISOString();
}

/**
 * Check if a date is in the past (UTC time)
 */
export function isPastUTC(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  return dateObj < now;
}

/**
 * Check if booking can be made (respects minimum advance time in UTC)
 */
export function canBookInAdvanceUTC(date: Date | string, minAdvanceHours: number = 0.5): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const minAdvanceTime = new Date(now.getTime() + (minAdvanceHours * 60 * 60 * 1000));
  
  return dateObj >= minAdvanceTime;
}

/**
 * Format time for display (using user's local timezone for display)
 */
export function formatForDisplay(date: Date | string): string {
  return formatUTCDate(date, 'MMM d, yyyy h:mm a');
}

/**
 * Format date for API calls (ISO string UTC)
 */
export function formatForApi(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toISOString();
}

/**
 * Simplified timezone utilities object (UTC-only)
 */
export const TimezoneUtils = {
  format: formatUTCDate,
  formatForDisplay: formatForDisplay,
  formatForApi: formatForApi,
  getCurrent: getCurrentUTCTime,
  isPast: isPastUTC,
  canBook: canBookInAdvanceUTC,
};