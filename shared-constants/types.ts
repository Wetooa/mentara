/**
 * Shared types for questionnaire constants
 * Pure TypeScript types without any runtime dependencies
 */

export interface QuestionnaireQuestion {
  prefix: string;
  question: string;
  options: string[];
}

export interface SeverityLevel {
  range: [number, number];
  label: string;
}

export interface QuestionnaireScoring {
  scoreMapping: Record<number, number>;
  severityLevels: Record<string, SeverityLevel>;
  getScore: (answers: number[]) => number;
  getSeverity: (score: number) => string;
}

export interface QuestionnaireProps {
  title: string;
  description: string;
  questions: QuestionnaireQuestion[];
  scoring: QuestionnaireScoring;
  disclaimer: string;
}

// Community mapping types
export type QuestionnaireType = 
  | 'adhd'
  | 'alcohol'
  | 'binge-eating'
  | 'burnout'
  | 'drug-abuse'
  | 'anxiety'
  | 'insomnia'
  | 'mood-disorder'
  | 'obsessional-compulsive'
  | 'panic-disorder'
  | 'stress'
  | 'phobia'
  | 'depression'
  | 'ptsd'
  | 'social-phobia';

export type CommunityName = string;

export interface QuestionnaireToCommunitMap extends Record<QuestionnaireType, CommunityName> {}

export interface CommunityThresholds {
  LOW: number;
  MODERATE: number;
  HIGH: number;
}