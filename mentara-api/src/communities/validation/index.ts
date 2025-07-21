/**
 * Community Module Validation - Central exports for community validation schemas
 */

// Export all validation schemas
export * from './community.schemas';

// Re-export commonly used schemas for convenience
export {
  CommunityCreateInputDtoSchema,
  CommunityUpdateInputDtoSchema,
  GenerateRecommendationsDtoSchema,
  RecommendationInteractionDtoSchema,
  RecommendationQueryDtoSchema,
} from './community.schemas';