// Utility functions to convert between sessionLength (string) and sessionDuration (number)

/**
 * Converts a session length string to duration in minutes
 * @param sessionLength - String like "60 minutes", "45 min", "1 hour"
 * @returns Number of minutes
 */
export function sessionLengthToMinutes(sessionLength: string): number {
  if (!sessionLength) return 60; // Default to 60 minutes

  // Extract number from string
  const numMatch = sessionLength.match(/\d+/);
  if (!numMatch) return 60;

  const num = parseInt(numMatch[0], 10);

  // Check if it's in hours
  if (sessionLength.toLowerCase().includes('hour')) {
    return num * 60;
  }

  // Assume it's in minutes
  return num;
}

/**
 * Converts duration in minutes to session length string
 * @param sessionDuration - Number of minutes
 * @returns Formatted string like "60 minutes"
 */
export function minutesToSessionLength(sessionDuration: number): string {
  if (sessionDuration >= 60 && sessionDuration % 60 === 0) {
    const hours = sessionDuration / 60;
    return hours === 1 ? '1 hour' : `${hours} hours`;
  }
  
  return `${sessionDuration} minutes`;
}

/**
 * Normalizes session duration to ensure it's a valid number
 * @param duration - Could be string or number
 * @returns Normalized number of minutes
 */
export function normalizeSessionDuration(duration: string | number | undefined): number {
  if (typeof duration === 'number') {
    return duration;
  }
  
  if (typeof duration === 'string') {
    return sessionLengthToMinutes(duration);
  }
  
  return 60; // Default fallback
}