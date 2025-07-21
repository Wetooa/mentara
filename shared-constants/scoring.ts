import { QuestionnaireScoring } from './types';

/**
 * Basic questionnaire scoring utilities
 * Pure data and functions without any validation dependencies
 */

export const createBasicScoring = (
  scoreMapping: Record<number, number>,
  severityLevels: Record<string, { range: [number, number]; label: string }>
): QuestionnaireScoring => ({
  scoreMapping,
  severityLevels,
  getScore: function (answers: number[]): number {
    return answers.reduce(
      (total, answer) => total + (this.scoreMapping[answer] || 0),
      0
    );
  },
  getSeverity: function (score: number): string {
    for (const level in this.severityLevels) {
      const severityLevel = this.severityLevels[level];
      if (severityLevel && score >= severityLevel.range[0] && score <= severityLevel.range[1]) {
        return severityLevel.label;
      }
    }
    return "Invalid score";
  },
});

// Standard scoring options (0-3 scale commonly used in many questionnaires)
export const STANDARD_SCORE_MAPPING = {
  0: 0, // Not at all
  1: 1, // Several days  
  2: 2, // More than half the days
  3: 3, // Nearly every day
} as const;

// Common severity levels for depression/anxiety questionnaires
export const STANDARD_SEVERITY_LEVELS = {
  minimal: { range: [0, 4], label: "Minimal" },
  mild: { range: [5, 9], label: "Mild" },
  moderate: { range: [10, 14], label: "Moderate" },
  severe: { range: [15, 27], label: "Severe" },
} as const;