import { useQuery } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
import { QuestionnaireDefinition } from "@/types/api/questionnaires";

/**
 * React Query hook for fetching questionnaire definitions
 * GET /pre-assessment/questionnaires
 */
export function useQuestionnaires() {
  const api = useApi();

  return useQuery({
    queryKey: ["questionnaires"],
    queryFn: () => api.preAssessment.getQuestionnaires(),
    staleTime: 5 * 60 * 1000, // 5 minutes - questionnaires don't change often
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * Hook to get a specific questionnaire by ID
 */
export function useQuestionnaire(questionnaireId: string) {
  const { data: questionnaires, ...query } = useQuestionnaires();
  
  const questionnaire = questionnaires?.find(q => q.id === questionnaireId);
  
  return {
    data: questionnaire,
    isLoading: query.isLoading,
    error: query.error,
    isError: query.isError,
  };
}

/**
 * Hook to get questions for a specific questionnaire
 */
export function useQuestionnaireQuestions(questionnaireId: string) {
  const { data: questionnaire, ...query } = useQuestionnaire(questionnaireId);
  
  return {
    data: questionnaire?.questions || [],
    questionnaire,
    isLoading: query.isLoading,
    error: query.error,
    isError: query.isError,
  };
}

export type UseQuestionnairesReturn = ReturnType<typeof useQuestionnaires>;
export type UseQuestionnaireReturn = ReturnType<typeof useQuestionnaire>;
export type UseQuestionnaireQuestionsReturn = ReturnType<typeof useQuestionnaireQuestions>;