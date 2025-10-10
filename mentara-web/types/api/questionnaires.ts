// Questionnaire constants and types

export interface QuestionnaireScale {
  name: string;
  description: string;
  items: number[];
  reversedItems?: number[];
  scoring: {
    min: number;
    max: number;
    interpretation: {
      ranges: Array<{
        min: number;
        max: number;
        label: string;
        description: string;
      }>;
    };
  };
}

export interface QuestionnaireDefinition {
  id: string;
  name: string;
  description: string;
  totalItems: number;
  estimatedTime: number; // in minutes
  scales: Record<string, QuestionnaireScale>;
  questions: Array<{
    id: number;
    text: string;
    type: 'likert' | 'binary' | 'multiple-choice';
    options: Array<{
      value: number;
      label: string;
    }>;
    scale: string;
    reversed?: boolean;
  }>;
  metadata: {
    version: string;
    author: string;
    year: number;
    validation: string;
    reliability: number;
    references: string[];
  };
}

