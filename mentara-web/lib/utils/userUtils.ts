/**
 * User utility functions for common user data operations
 */

import { PublicProfileResponse } from '@/lib/api/services/profile';

/**
 * Generate a display name from user data
 * @param user - User object containing name fields
 * @returns Formatted display name or fallback
 */
export function getUserDisplayName(user: PublicProfileResponse['user']): string {
  return [user.firstName, user.middleName, user.lastName]
    .filter(Boolean)
    .join(' ') || 'Anonymous User';
}

/**
 * Generate user initials for avatar fallback
 * @param user - User object containing name fields
 * @returns User initials (max 2 characters)
 */
export function getUserInitials(user: PublicProfileResponse['user']): string {
  return [user.firstName, user.lastName]
    .filter(Boolean)
    .map(name => name.charAt(0).toUpperCase())
    .join('');
}