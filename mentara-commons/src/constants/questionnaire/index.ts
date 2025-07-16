// Mental Health Questionnaire Constants
// Centralized source of truth for all mental health assessment questionnaires

export { default as ADHD_ASRS } from './adhd';
export { default as ALCOHOL_AUDIT } from './alcohol';
export { default as BINGE_EATING_BES } from './binge-eating';
export { default as BURNOUT_MBI } from './burnout';
export { default as DRUG_ABUSE_DAST } from './drug-abuse';
export { default as ANXIETY_GAD7 } from './gad-7-anxiety';
export { default as INSOMNIA_ISI } from './insomnia';
export { default as MOOD_DISORDER_MDQ } from './mood-disorder';
export { default as OCD_OCI_R } from './obsessional-compulsive';
export { default as PANIC_DISORDER_PDSS } from './panic-disorder';
export { default as STRESS_PSS } from './perceived-stress-scale';
export { default as PHOBIA_SPECIFIC } from './phobia';
export { default as DEPRESSION_PHQ9 } from './phq-9';
export { default as PTSD_PCL5 } from './ptsd';
export { default as SOCIAL_PHOBIA_SPIN } from './social-phobia';

// Questionnaire mapping and utilities
export * from './questionnaire-mapping';

// Community mapping based on questionnaire results
export const QUESTIONNAIRE_TO_COMMUNITY_MAP = {
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
} as const;

// Severity level thresholds for community recommendations
export const COMMUNITY_RECOMMENDATION_THRESHOLDS = {
  LOW: 0.3,
  MODERATE: 0.6,
  HIGH: 0.8
} as const;

export type QuestionnaireType = keyof typeof QUESTIONNAIRE_TO_COMMUNITY_MAP;
export type CommunityName = typeof QUESTIONNAIRE_TO_COMMUNITY_MAP[QuestionnaireType];