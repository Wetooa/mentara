/**
 * AI Evaluation Generator Utility
 * Generates realistic randomized AI evaluation data based on pre-assessment scores and severity levels
 * Matches the expected format: { confidence, risk_factors, recommendations, estimated_severity }
 */

export interface AIEvaluationData {
  confidence: number;
  risk_factors: string[];
  recommendations: string[];
  estimated_severity: Record<string, number | string>;
}

// Risk factors pool mapped to questionnaire conditions
const RISK_FACTORS_POOL = {
  'chronic_stress': ['Stress', 'Burnout'],
  'social_isolation': ['Social anxiety', 'Depression'],
  'sleep_disruption': ['Insomnia', 'Anxiety'],
  'substance_dependency': ['Substance or Alcohol Use Issues', 'Drug Issues'],
  'trauma_exposure': ['Post-traumatic stress disorder (PTSD)'],
  'compulsive_behaviors': ['Obsessive compulsive disorder (OCD)', 'Binge eating / Eating disorders'],
  'mood_instability': ['Bipolar disorder (BD)', 'Depression'],
  'attention_difficulties': ['ADD / ADHD'],
  'panic_episodes': ['Panic', 'Anxiety'],
  'eating_dysregulation': ['Binge eating / Eating disorders'],
  'work_overwhelm': ['Burnout', 'Stress'],
  'interpersonal_conflict': ['Social anxiety', 'Depression'],
  'emotional_dysregulation': ['Bipolar disorder (BD)', 'Depression'],
  'avoidance_patterns': ['Phobia', 'Social anxiety'],
  'hypervigilance': ['Post-traumatic stress disorder (PTSD)', 'Anxiety'],
  'perfectionism': ['Obsessive compulsive disorder (OCD)', 'Anxiety'],
  'cognitive_impairment': ['ADD / ADHD', 'Depression'],
  'relationship_difficulties': ['Social anxiety', 'Depression'],
};

// Recommendations pool mapped to conditions and severity
const RECOMMENDATIONS_POOL = {
  'therapy_priority': ['Depression', 'Anxiety', 'Post-traumatic stress disorder (PTSD)'],
  'medication_evaluation': ['Depression', 'Anxiety', 'Bipolar disorder (BD)'],
  'lifestyle_changes': ['Stress', 'Burnout', 'Insomnia'],
  'support_group': ['Substance or Alcohol Use Issues', 'Binge eating / Eating disorders'],
  'crisis_intervention': ['severe', 'extreme'],
  'cognitive_behavioral_therapy': ['Anxiety', 'Depression', 'Obsessive compulsive disorder (OCD)'],
  'mindfulness_training': ['Stress', 'Anxiety', 'Burnout'],
  'sleep_hygiene': ['Insomnia', 'Anxiety'],
  'substance_treatment': ['Substance or Alcohol Use Issues', 'Drug Issues'],
  'trauma_therapy': ['Post-traumistic stress disorder (PTSD)'],
  'psychiatric_consultation': ['Bipolar disorder (BD)', 'severe'],
  'family_therapy': ['Social anxiety', 'relationship_difficulties'],
  'occupational_therapy': ['ADD / ADHD', 'Burnout'],
  'nutritional_counseling': ['Binge eating / Eating disorders'],
  'exposure_therapy': ['Phobia', 'Social anxiety'],
  'stress_management': ['Stress', 'Burnout'],
  'social_skills_training': ['Social anxiety', 'ADD / ADHD'],
};

// Severity to confidence mapping
const SEVERITY_CONFIDENCE_MAP: Record<string, [number, number]> = {
  'minimal': [0.85, 0.95],
  'mild': [0.75, 0.90],
  'moderate': [0.65, 0.85],
  'severe': [0.70, 0.90],
  'extreme': [0.80, 0.95],
  'high': [0.70, 0.85],
  'low': [0.80, 0.95],
  'none': [0.90, 0.98],
  'subclinical': [0.80, 0.90],
  'clinical': [0.75, 0.90],
  'positive': [0.70, 0.85],
  'negative': [0.85, 0.95],
};

// Overall severity mapping from individual severities
const OVERALL_SEVERITY_LEVELS = ['low', 'mild', 'moderate', 'high', 'severe'];

/**
 * Generate realistic AI evaluation data based on pre-assessment scores and severity levels
 */
export function generateAIEvaluationData(
  scores: Record<string, number>,
  severityLevels: Record<string, string>
): AIEvaluationData {
  // Calculate overall confidence based on severity distribution
  const confidence = calculateOverallConfidence(severityLevels);
  
  // Generate risk factors based on conditions and severity
  const risk_factors = generateRiskFactors(scores, severityLevels);
  
  // Generate recommendations based on conditions and severity
  const recommendations = generateRecommendations(scores, severityLevels, risk_factors);
  
  // Generate estimated severity values
  const estimated_severity = generateEstimatedSeverity(scores, severityLevels);
  
  return {
    confidence: Math.round(confidence * 1000) / 1000, // Round to 3 decimal places
    risk_factors,
    recommendations,
    estimated_severity
  };
}

/**
 * Calculate overall confidence based on severity levels
 */
function calculateOverallConfidence(severityLevels: Record<string, string>): number {
  const severities = Object.values(severityLevels);
  let totalConfidence = 0;
  let count = 0;
  
  for (const severity of severities) {
    const severityLower = severity.toLowerCase();
    const confidenceRange = SEVERITY_CONFIDENCE_MAP[severityLower] || [0.70, 0.90];
    const randomConfidence = Math.random() * (confidenceRange[1] - confidenceRange[0]) + confidenceRange[0];
    totalConfidence += randomConfidence;
    count++;
  }
  
  return count > 0 ? totalConfidence / count : 0.75;
}

/**
 * Generate risk factors based on questionnaire results
 */
function generateRiskFactors(
  scores: Record<string, number>,
  severityLevels: Record<string, string>
): string[] {
  const riskFactors = new Set<string>();
  
  // Analyze each questionnaire for relevant risk factors
  for (const [questionnaire, severity] of Object.entries(severityLevels)) {
    // Skip minimal/none severities for risk factor generation
    if (['minimal', 'none', 'no', 'negative'].some(skip => 
      severity.toLowerCase().includes(skip))) {
      continue;
    }
    
    // Find matching risk factors for this questionnaire
    for (const [riskFactor, relatedQuestionnaires] of Object.entries(RISK_FACTORS_POOL)) {
      if (relatedQuestionnaires.includes(questionnaire)) {
        riskFactors.add(riskFactor);
      }
    }
  }
  
  // Convert to array and limit to 2-5 risk factors for realistic output
  const riskFactorsArray = Array.from(riskFactors);
  const maxRiskFactors = Math.min(Math.max(2, Math.ceil(riskFactorsArray.length * 0.6)), 5);
  
  // Shuffle and take top risk factors
  return shuffleArray(riskFactorsArray).slice(0, maxRiskFactors);
}

/**
 * Generate recommendations based on conditions and risk factors
 */
function generateRecommendations(
  scores: Record<string, number>,
  severityLevels: Record<string, string>,
  riskFactors: string[]
): string[] {
  const recommendations = new Set<string>();
  
  // Add recommendations based on questionnaire results
  for (const [questionnaire, severity] of Object.entries(severityLevels)) {
    // Skip minimal/none severities
    if (['minimal', 'none', 'no', 'negative'].some(skip => 
      severity.toLowerCase().includes(skip))) {
      continue;
    }
    
    // Find matching recommendations for this questionnaire
    for (const [recommendation, relatedConditions] of Object.entries(RECOMMENDATIONS_POOL)) {
      if (relatedConditions.includes(questionnaire) || 
          relatedConditions.some(condition => severity.toLowerCase().includes(condition))) {
        recommendations.add(recommendation);
      }
    }
  }
  
  // Add high-priority recommendations for severe cases
  const severeSeverities = ['severe', 'extreme', 'clinical'];
  const hasSevereCondition = Object.values(severityLevels).some(severity =>
    severeSeverities.some(severe => severity.toLowerCase().includes(severe))
  );
  
  if (hasSevereCondition) {
    recommendations.add('crisis_intervention');
    recommendations.add('psychiatric_consultation');
  }
  
  // Convert to array and limit to 2-4 recommendations
  const recommendationsArray = Array.from(recommendations);
  const maxRecommendations = Math.min(Math.max(2, Math.ceil(recommendationsArray.length * 0.7)), 4);
  
  return shuffleArray(recommendationsArray).slice(0, maxRecommendations);
}

/**
 * Generate estimated severity values based on scores and severity levels
 */
function generateEstimatedSeverity(
  scores: Record<string, number>,
  severityLevels: Record<string, string>
): Record<string, number | string> {
  const estimatedSeverity: Record<string, number | string> = {};
  
  // Convert key questionnaires to normalized severity scores (0-1)
  const keyQuestionnaires = ['Stress', 'Anxiety', 'Depression'];
  
  for (const questionnaire of keyQuestionnaires) {
    if (scores[questionnaire] !== undefined && severityLevels[questionnaire]) {
      const normalizedScore = convertSeverityToNormalizedScore(
        severityLevels[questionnaire], 
        questionnaire
      );
      estimatedSeverity[questionnaire.toLowerCase()] = 
        Math.round(normalizedScore * 100) / 100; // Round to 2 decimal places
    }
  }
  
  // Calculate overall severity level
  const overallSeverity = calculateOverallSeverityLevel(severityLevels);
  estimatedSeverity.overall = overallSeverity;
  
  return estimatedSeverity;
}

/**
 * Convert severity level to normalized score (0-1)
 */
function convertSeverityToNormalizedScore(severity: string, questionnaire: string): number {
  const severityLower = severity.toLowerCase();
  
  // General severity mapping
  if (severityLower.includes('none') || severityLower.includes('minimal')) return Math.random() * 0.2 + 0.0;
  if (severityLower.includes('mild')) return Math.random() * 0.2 + 0.2;
  if (severityLower.includes('moderate')) return Math.random() * 0.2 + 0.4;
  if (severityLower.includes('severe')) return Math.random() * 0.2 + 0.6;
  if (severityLower.includes('extreme')) return Math.random() * 0.2 + 0.8;
  if (severityLower.includes('high')) return Math.random() * 0.3 + 0.6;
  if (severityLower.includes('low')) return Math.random() * 0.3 + 0.1;
  if (severityLower.includes('positive')) return Math.random() * 0.3 + 0.6;
  if (severityLower.includes('negative')) return Math.random() * 0.2 + 0.0;
  
  // Default random value for unknown severities
  return Math.random() * 0.6 + 0.2;
}

/**
 * Calculate overall severity level based on individual severities
 */
function calculateOverallSeverityLevel(severityLevels: Record<string, string>): string {
  const severities = Object.values(severityLevels);
  let severityPoints = 0;
  
  for (const severity of severities) {
    const severityLower = severity.toLowerCase();
    if (severityLower.includes('extreme') || severityLower.includes('very severe')) severityPoints += 5;
    else if (severityLower.includes('severe')) severityPoints += 4;
    else if (severityLower.includes('moderate')) severityPoints += 3;
    else if (severityLower.includes('mild')) severityPoints += 2;
    else if (severityLower.includes('high') || severityLower.includes('positive')) severityPoints += 3;
    else if (severityLower.includes('clinical')) severityPoints += 4;
    else severityPoints += 1;
  }
  
  const averageSeverity = severityPoints / severities.length;
  
  if (averageSeverity >= 4.5) return 'severe';
  if (averageSeverity >= 3.5) return 'high';
  if (averageSeverity >= 2.5) return 'moderate';
  if (averageSeverity >= 1.5) return 'mild';
  return 'low';
}

/**
 * Utility function to shuffle an array
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Helper function to validate AI evaluation data structure
 */
export function validateAIEvaluationData(data: any): data is AIEvaluationData {
  return (
    typeof data === 'object' &&
    typeof data.confidence === 'number' &&
    Array.isArray(data.risk_factors) &&
    Array.isArray(data.recommendations) &&
    typeof data.estimated_severity === 'object' &&
    data.confidence >= 0 && data.confidence <= 1
  );
}