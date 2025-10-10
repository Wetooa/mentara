import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate profile URL based on user role and ID
 * @param role - User role (client, therapist, moderator, admin)  
 * @param userId - User ID (required for client/therapist, optional for moderator/admin)
 * @returns Profile URL string
 */
export function getProfileUrl(role: string, userId?: string): string {
  switch (role.toLowerCase()) {
    case 'client':
      return userId ? `/client/profile/${userId}` : '/client/profile';
    case 'therapist':
      return userId ? `/therapist/profile/${userId}` : '/therapist/profile';
    case 'moderator':
      return '/moderator/profile';
    case 'admin':
      return '/admin/profile';
    default:
      // Fallback to client profile if role is unknown
      return userId ? `/client/profile/${userId}` : '/client/profile';
  }
}
