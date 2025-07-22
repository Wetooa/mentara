/**
 * Central export file for all application types
 */

// Export all global types
export * from './global';

// Export all database-related types  
export * from './database';

// Export all enums
export * from './enums';

// Therapist recommendation request (keeping here as it's specific to therapist module)
export interface TherapistRecommendationRequest {
  userId: string;
  limit?: number;
  includeInactive?: boolean;
  province?: string;
  maxHourlyRate?: number;
}
