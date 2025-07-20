// Pre-assessment DTO schema
export interface CreatePreAssessmentDto {
  questionnaires: string[];
  answers: number[][];
  answerMatrix?: number[][];
  scores?: Record<string, number>;
  severityLevels?: Record<string, string>;
}

export interface UpdatePreAssessmentDto {
  questionnaires?: string[];
  answers?: number[][];
  answerMatrix?: number[][];
  scores?: Record<string, number>;
  severityLevels?: Record<string, string>;
  aiEstimate?: Record<string, boolean>;
}
