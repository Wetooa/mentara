/**
 * Shared Constants Package
 * 
 * A data-only package containing questionnaire constants and mappings
 * shared between mentara-client and mentara-api.
 * 
 * This package contains NO validation logic, NO Zod schemas, and NO runtime dependencies.
 * It's purely data and types for maintaining DRY principles without coupling.
 */

// Export all types
export * from './types';

// Export scoring utilities
export * from './scoring';

// Export constants and mappings
export * from './constants';

// Re-export commonly used items for convenience
export type {
  QuestionnaireProps,
  QuestionnaireType,
  CommunityName,
  QuestionnaireToCommunitMap,
  CommunityThresholds
} from './types';

export {
  QUESTIONNAIRE_TO_COMMUNITY_MAP,
  COMMUNITY_RECOMMENDATION_THRESHOLDS,
  LIST_OF_QUESTIONNAIRES,
  QUESTIONNAIRE_ID_TO_NAME_MAP,
  getQuestionnaireByName,
  getAllQuestionnaireNames,
  getQuestionnaireById,
  isValidQuestionnaireName
} from './constants';

export {
  createBasicScoring,
  STANDARD_SCORE_MAPPING,
  STANDARD_SEVERITY_LEVELS
} from './scoring';