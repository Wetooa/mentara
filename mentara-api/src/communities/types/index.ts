/**
 * Community Module Types - Central exports for community types and DTOs
 */

// Export all community DTOs
export * from './community.dto';

// Re-export commonly used types for convenience
export type {
  CommunityCreateInputDto,
  CommunityUpdateInputDto,
  GenerateRecommendationsDto,
  RecommendationInteractionDto,
  RecommendationQueryDto,
  CommunityResponse,
  CommunityStatsResponse,
  CommunityRecommendationResponse,
  CommunityRecommendationsResult,
} from './community.dto';