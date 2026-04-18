export type AurisStateDto = {
  assessment_phase: string;
  completion_reason: string;
  total_questions_asked: number;
  message_count: number;
  is_complete: boolean;
  requires_crisis_protocol: boolean;
  extracted_data: Record<string, unknown>;
  identified_questionnaires: Record<string, string>;
  candidate_scales: string[];
};

export type AurisResultDto = {
  assessmentId: string;
  method: 'CHATBOT';
  completedAt: string;
  data: {
    questionnaireScores: Record<string, { score: number; severity: string }>;
  };
  context: {
    pastTherapyExperiences: string[];
    medicationHistory: string[];
    accessibilityNeeds: string[];
  };
};

export const usePreAssessmentControllerChat = jest.fn();
export const usePreAssessmentControllerEndSession = jest.fn();
export const usePreAssessmentControllerCreateSession = jest.fn();
