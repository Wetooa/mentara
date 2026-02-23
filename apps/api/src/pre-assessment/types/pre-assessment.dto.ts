export interface CreatePreAssessmentDto {
  answers: number[]; // Flat array of exactly 201 numeric responses
  scores?: Record<string, number>;
  severityLevels?: Record<string, string>;
  assessmentMethod?: 'CHECKLIST' | 'CHATBOT' | 'HYBRID';
  pastTherapyExperiences?: string[];
  medicationHistory?: string[];
  accessibilityNeeds?: string[];
  soapAnalysisUrl?: string;
  conversationHistoryUrl?: string;
}

export interface UpdatePreAssessmentDto {
  answers?: number[]; // Flat array of exactly 201 numeric responses
  scores?: Record<string, number>;
  severityLevels?: Record<string, string>;
  assessmentMethod?: 'CHECKLIST' | 'CHATBOT' | 'HYBRID';
  pastTherapyExperiences?: string[];
  medicationHistory?: string[];
  accessibilityNeeds?: string[];
  soapAnalysisUrl?: string;
  conversationHistoryUrl?: string;
}
