import { MatchingWeights } from '../services/advanced-matching.service';

/**
 * Comprehensive matching weights configuration
 * Total should equal 1.0 (100%)
 */
export interface ComprehensiveMatchingWeights extends MatchingWeights {
  engagementCompatibility: number; // 10%
  performanceMatch: number; // 10%
  preferenceMatch: number; // 7%
}

/**
 * Default comprehensive matching weights
 * Based on the plan: 8-factor matching system
 */
export const DEFAULT_COMPREHENSIVE_WEIGHTS: ComprehensiveMatchingWeights = {
  conditionMatch: 0.25, // 25% - Primary condition matching
  approachCompatibility: 0.15, // 15% - Therapeutic approach compatibility
  experienceAndSuccess: 0.15, // 15% - Experience and success rates
  reviewsAndRatings: 0.10, // 10% - Reviews and ratings
  availabilityAndLogistics: 0.08, // 8% - Availability and logistics
  engagementCompatibility: 0.10, // 10% - Client engagement compatibility
  performanceMatch: 0.10, // 10% - Therapist performance match
  preferenceMatch: 0.07, // 7% - Explicit client preferences
};

/**
 * High-urgency client weights
 * Prioritizes experience and performance for critical cases
 */
export const HIGH_URGENCY_WEIGHTS: ComprehensiveMatchingWeights = {
  conditionMatch: 0.30, // Increased for critical conditions
  approachCompatibility: 0.15,
  experienceAndSuccess: 0.20, // Increased for experienced therapists
  reviewsAndRatings: 0.10,
  availabilityAndLogistics: 0.05, // Reduced - urgency over logistics
  engagementCompatibility: 0.08, // Reduced
  performanceMatch: 0.10,
  preferenceMatch: 0.02, // Reduced - preferences less important in crisis
};

/**
 * Low-engagement client weights
 * Prioritizes retention and engagement compatibility
 */
export const LOW_ENGAGEMENT_WEIGHTS: ComprehensiveMatchingWeights = {
  conditionMatch: 0.20, // Reduced
  approachCompatibility: 0.12, // Reduced
  experienceAndSuccess: 0.12, // Reduced
  reviewsAndRatings: 0.08, // Reduced
  availabilityAndLogistics: 0.08,
  engagementCompatibility: 0.20, // Increased - critical for low engagement
  performanceMatch: 0.15, // Increased - retention-focused
  preferenceMatch: 0.05, // Reduced
};

/**
 * New client weights (no history)
 * Relies more on stated credentials and preferences
 */
export const NEW_CLIENT_WEIGHTS: ComprehensiveMatchingWeights = {
  conditionMatch: 0.25,
  approachCompatibility: 0.18, // Increased - preferences more important
  experienceAndSuccess: 0.15,
  reviewsAndRatings: 0.12, // Increased - reviews more important for new clients
  availabilityAndLogistics: 0.10, // Increased - logistics more important
  engagementCompatibility: 0.05, // Reduced - no engagement data
  performanceMatch: 0.10,
  preferenceMatch: 0.05, // Reduced - may not have preferences yet
};

/**
 * Get appropriate weights based on client profile
 */
export function getMatchingWeights(
  urgencyLevel?: 'low' | 'medium' | 'high' | 'critical',
  engagementLevel?: 'low' | 'medium' | 'high',
  isNewClient?: boolean,
): ComprehensiveMatchingWeights {
  // High urgency takes priority
  if (urgencyLevel === 'critical' || urgencyLevel === 'high') {
    return HIGH_URGENCY_WEIGHTS;
  }

  // Low engagement takes priority
  if (engagementLevel === 'low') {
    return LOW_ENGAGEMENT_WEIGHTS;
  }

  // New client
  if (isNewClient) {
    return NEW_CLIENT_WEIGHTS;
  }

  // Default weights
  return DEFAULT_COMPREHENSIVE_WEIGHTS;
}

/**
 * Validate that weights sum to 1.0
 */
export function validateWeights(weights: ComprehensiveMatchingWeights): boolean {
  const sum =
    weights.conditionMatch +
    weights.approachCompatibility +
    weights.experienceAndSuccess +
    weights.reviewsAndRatings +
    weights.availabilityAndLogistics +
    weights.engagementCompatibility +
    weights.performanceMatch +
    weights.preferenceMatch;

  return Math.abs(sum - 1.0) < 0.01; // Allow small floating point errors
}

