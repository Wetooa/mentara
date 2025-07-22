// Pre-assessment DTO schema
export interface CreatePreAssessmentDto {
  answers: number[]; // Flat array of exactly 201 numeric responses
  scores?: Record<string, number>;
  severityLevels?: Record<string, string>;
}

export interface UpdatePreAssessmentDto {
  answers?: number[]; // Flat array of exactly 201 numeric responses
  scores?: Record<string, number>;
  severityLevels?: Record<string, string>;
  aiEstimate?: Record<string, boolean>;
}
