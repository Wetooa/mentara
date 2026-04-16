// Questionnaire scoring system and base interfaces

export interface QuestionnaireOption {
  text: string;
  value: number;
}

export interface QuestionnaireQuestion {
  prefix?: string;
  question: string;
  options: string[];
}

export interface QuestionnaireScoring {
  getScoreFromAnswers: (answers: number[]) => number;
  getInterpretationFromScore: (score: number) => string;
  getInterpretationFromAnswers?: (answers: number[]) => string;
  subscales?: Record<string, number[]>; // Item indices for subscales
}

export interface QuestionnaireProps {
  title: string;
  description: string;
  questions: QuestionnaireQuestion[];
  scoring: QuestionnaireScoring & {
    scoreMapping?: Record<number, number>;
    severityLevels?: Record<string, { range: number[]; label: string }>;
  };
  disclaimer: string;
}

// Base scoring functions that can be extended by specific questionnaires
export const QUESTIONNAIRE_SCORING = {
  // Default scoring implementation - can be overridden by specific questionnaires
  getScoreFromAnswers: (answers: number[]): number => {
    return answers.reduce((sum, answer) => sum + answer, 0);
  },

  getInterpretationFromScore: (score: number): string => {
    // Default interpretation - should be overridden by specific questionnaires
    return `Score: ${score}`;
  },
};