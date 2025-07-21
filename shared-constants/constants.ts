import { QuestionnaireToCommunitMap, CommunityThresholds, QuestionnaireType } from './types';

/**
 * Shared constants for questionnaire-to-community mapping
 * Pure data without any validation or runtime dependencies
 */

// Community mapping based on questionnaire results
export const QUESTIONNAIRE_TO_COMMUNITY_MAP: QuestionnaireToCommunitMap = {
  'adhd': 'ADHD Support',
  'alcohol': 'Substance Use Recovery',
  'binge-eating': 'Eating Disorder Recovery',
  'burnout': 'Burnout & Stress Management',
  'drug-abuse': 'Substance Use Recovery',
  'anxiety': 'Anxiety Support',
  'insomnia': 'Sleep Disorders',
  'mood-disorder': 'Mood Disorders',
  'obsessional-compulsive': 'OCD Support',
  'panic-disorder': 'Panic & Anxiety',
  'stress': 'Stress Management',
  'phobia': 'Phobia Support',
  'depression': 'Depression Support',
  'ptsd': 'PTSD & Trauma Recovery',
  'social-phobia': 'Social Anxiety Support'
};

// Severity level thresholds for community recommendations
export const COMMUNITY_RECOMMENDATION_THRESHOLDS: CommunityThresholds = {
  LOW: 0.3,
  MODERATE: 0.6,
  HIGH: 0.8
};

// List of all available questionnaire types
export const LIST_OF_QUESTIONNAIRES: QuestionnaireType[] = [
  'adhd',
  'alcohol',
  'binge-eating',
  'burnout',
  'drug-abuse',
  'anxiety',
  'insomnia',
  'mood-disorder',
  'obsessional-compulsive',
  'panic-disorder',
  'stress',
  'phobia',
  'depression',
  'ptsd',
  'social-phobia'
];

// Questionnaire ID to display name mapping
export const QUESTIONNAIRE_ID_TO_NAME_MAP: Record<QuestionnaireType, string> = {
  'adhd': 'ADHD Self-Report Scale (ASRS)',
  'alcohol': 'Alcohol Use Disorders Identification Test (AUDIT)',
  'binge-eating': 'Binge Eating Scale (BES)',
  'burnout': 'Maslach Burnout Inventory (MBI)',
  'drug-abuse': 'Drug Abuse Screening Test (DAST)',
  'anxiety': 'Generalized Anxiety Disorder 7-Item (GAD-7)',
  'insomnia': 'Insomnia Severity Index (ISI)',
  'mood-disorder': 'Mood Disorder Questionnaire (MDQ)',
  'obsessional-compulsive': 'Obsessive-Compulsive Inventory Revised (OCI-R)',
  'panic-disorder': 'Panic Disorder Severity Scale (PDSS)',
  'stress': 'Perceived Stress Scale (PSS)',
  'phobia': 'Specific Phobia Questionnaire',
  'depression': 'Patient Health Questionnaire-9 (PHQ-9)',
  'ptsd': 'PTSD Checklist for DSM-5 (PCL-5)',
  'social-phobia': 'Social Phobia Inventory (SPIN)'
};

// Utility functions
export const getQuestionnaireByName = (name: QuestionnaireType): string | undefined => {
  return QUESTIONNAIRE_ID_TO_NAME_MAP[name];
};

export const getAllQuestionnaireNames = (): QuestionnaireType[] => {
  return LIST_OF_QUESTIONNAIRES;
};

export const getQuestionnaireById = (id: QuestionnaireType): string | undefined => {
  return QUESTIONNAIRE_ID_TO_NAME_MAP[id];
};

export const isValidQuestionnaireName = (name: string): name is QuestionnaireType => {
  return LIST_OF_QUESTIONNAIRES.includes(name as QuestionnaireType);
};