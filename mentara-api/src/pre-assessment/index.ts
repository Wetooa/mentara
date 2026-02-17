// Pre-assessment module exports
export { PreAssessmentService } from './pre-assessment.service';
export { ClinicalInsightsService } from './analysis/clinical-insights.service';
export { TherapeuticRecommendationsService } from './analysis/therapeutic-recommendations.service';

// Type exports for clinical analysis
export {
  type ClinicalInsight,
  type ClinicalProfile,
  type RiskFactor,
  type TreatmentRecommendation,
} from './analysis/clinical-insights.service';

export {
  type TherapistMatchCriteria,
  type InterventionRecommendation,
  type PersonalizedTreatmentPlan,
  type TreatmentPhase,
  type SelfCareRecommendation,
  type MonitoringPlan,
  type ContingencyPlan,
  type SuccessMetric,
} from './analysis/therapeutic-recommendations.service';

// Utility types
export type { QuestionnaireScore, QuestionnaireScores } from './pre-assessment.utils';