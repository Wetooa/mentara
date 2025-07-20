// Export all schemas and types from schemas module
// Note: schemas/index.ts is commented out to avoid clunky re-exports
// So we directly export the schemas we need here

// Dashboard schemas (direct export)
export * from "./schemas/dashboard";

// Other schema exports can be added directly as needed
// export * from "./schemas/auth";
// export * from "./schemas/user";
// etc.

// Export all constants
export {
  // Questionnaire constants
  ADHD_ASRS,
  ALCOHOL_AUDIT,
  BINGE_EATING_BES,
  BURNOUT_MBI,
  DRUG_ABUSE_DAST,
  ANXIETY_GAD7,
  INSOMNIA_ISI,
  MOOD_DISORDER_MDQ,
  OCD_OCI_R,
  PANIC_DISORDER_PDSS,
  STRESS_PSS,
  PHOBIA_SPECIFIC,
  DEPRESSION_PHQ9,
  PTSD_PCL5,
  SOCIAL_PHOBIA_SPIN,
  QUESTIONNAIRE_TO_COMMUNITY_MAP,
  COMMUNITY_RECOMMENDATION_THRESHOLDS,
  type QuestionnaireType,
  type CommunityName,
  LIST_OF_QUESTIONNAIRES,
  QUESTIONNAIRE_MAP,
  QUESTIONNAIRE_MAPPING,
  type QuestionnaireMapping,

  // Scoring constants
  type QuestionnaireProps,
  QUESTIONNAIRE_SCORING,
} from "./constants";

// Export validation utilities
export {
  type ValidationResult,
  validateSchema,
  validateWithCustomErrors,
  validateSchemaAsync,
  validatePartial,
  validateArray,
  validateAndTransform,
  formatValidationErrors,
  hasValidationErrors,
  getFirstValidationError,
  createValidationMiddleware,
  validateWithCoercion,
  validateForEnvironment,
} from "./utils/validation";

// Export zod for convenience
export { z } from "zod";
