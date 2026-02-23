export type PreAssessmentMethod = 'CHECKLIST' | 'CHATBOT' | 'HYBRID';

export interface QuestionnaireScore {
  score: number;
  severity: string;
}

export interface QuestionnaireScores {
  [key: string]: QuestionnaireScore;
}

export interface PreAssessmentDocuments {
  soapAnalysisUrl: string | null;
  conversationHistoryUrl: string | null;
}

export interface PreAssessmentData {
  questionnaireScores: QuestionnaireScores;
  documents?: PreAssessmentDocuments;
}

export interface CreatePreAssessmentDto {
  assessmentId: string | null;
  method: PreAssessmentMethod;
  completedAt: string | Date;
  data: PreAssessmentData;
  pastTherapyExperiences: string | null;
  medicationHistory: string | null;
  accessibilityNeeds: string | null;
}

export interface UpdatePreAssessmentDto {
  assessmentId: string | null;
  method: PreAssessmentMethod;
  completedAt: string | Date;
  data: PreAssessmentData;
  pastTherapyExperiences: string | null;
  medicationHistory: string | null;
  accessibilityNeeds: string | null;
}

export interface AurisChatDto {
  sessionId: string;
  message: string;
}

export interface AurisResponseDto {
  response: string;
  state: {
    is_complete: boolean;
    [key: string]: any;
  };
  results?: {
    assessmentId: string;
    method: PreAssessmentMethod;
    completedAt: string;
    data: PreAssessmentData;
    context: {
      pastTherapyExperiences: string[];
      medicationHistory: string[];
      accessibilityNeeds: string[];
    };
  };
}
