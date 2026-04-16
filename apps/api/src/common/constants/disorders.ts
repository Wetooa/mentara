/**
 * Canonical Disorder Constants
 * 
 * This file serves as the single source of truth for all disorder-related functionality
 * in the backend. It mirrors the questionnaire definitions from the frontend to ensure
 * perfect alignment between assessment, AI predictions, community recommendations, and
 * database seeding.
 * 
 * Source: mentara-client/constants/questionnaire/questionnaire-mapping.ts
 */

/**
 * Canonical list of questionnaire IDs that define what disorders this application handles.
 * This list is the authoritative source for all disorder-related functionality.
 */
export const CANONICAL_QUESTIONNAIRE_IDS = [
  'stress',
  'anxiety', 
  'depression',
  'drug-abuse',
  'insomnia',
  'panic-disorder',
  'mood-disorder', // Bipolar
  'obsessional-compulsive', // OCD
  'ptsd',
  'social-phobia', // Social anxiety
  'phobia',
  'burnout',
  'binge-eating', // Eating disorders
  'adhd',
  'alcohol'
] as const;

export type CanonicalQuestionnaireId = typeof CANONICAL_QUESTIONNAIRE_IDS[number];

/**
 * Display names for each questionnaire/disorder.
 * These should match the frontend questionnaire mapping exactly.
 */
export const QUESTIONNAIRE_DISPLAY_NAMES: Record<CanonicalQuestionnaireId, string> = {
  'stress': 'Stress',
  'anxiety': 'Anxiety',
  'depression': 'Depression',
  'drug-abuse': 'Drug Abuse',
  'insomnia': 'Insomnia',
  'panic-disorder': 'Panic',
  'mood-disorder': 'Bipolar disorder (BD)',
  'obsessional-compulsive': 'Obsessive compulsive disorder (OCD)',
  'ptsd': 'Post-traumatic stress disorder (PTSD)',
  'social-phobia': 'Social anxiety',
  'phobia': 'Phobia',
  'burnout': 'Burnout',
  'binge-eating': 'Binge eating / Eating disorders',
  'adhd': 'ADD / ADHD',
  'alcohol': 'Substance or Alcohol Use Issues'
};

/**
 * Helper function to validate if a questionnaire ID is canonical
 */
export function isCanonicalQuestionnaireId(id: string): id is CanonicalQuestionnaireId {
  return CANONICAL_QUESTIONNAIRE_IDS.includes(id as CanonicalQuestionnaireId);
}

/**
 * Helper function to get display name for a questionnaire ID
 */
export function getQuestionnaireDisplayName(id: CanonicalQuestionnaireId): string {
  return QUESTIONNAIRE_DISPLAY_NAMES[id];
}

/**
 * Get all canonical questionnaire IDs
 */
export function getAllCanonicalQuestionnaireIds(): readonly CanonicalQuestionnaireId[] {
  return CANONICAL_QUESTIONNAIRE_IDS;
}