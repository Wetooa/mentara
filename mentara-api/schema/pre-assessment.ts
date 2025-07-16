// Pre-assessment DTO schema
export interface CreatePreAssessmentDto {
  questionnaires: string[];
  answers: number[][];
  answerMatrix?: number[][];
  scores?: Record<string, number>;
  severityLevels?: Record<string, string>;
}

export interface UpdatePreAssessmentDto {
  answers?: number[][];
  answerMatrix?: number[][];
  scores?: Record<string, number>;
  severityLevels?: Record<string, string>;
  completed?: boolean;
}