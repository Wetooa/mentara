import { useQuery } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
import { QuestionnaireDefinition, LIST_OF_QUESTIONNAIRES } from "@/types/api/questionnaires";

/**
 * React Query hook for fetching questionnaire definitions
 * Falls back to static data if API is unavailable
 * GET /pre-assessment/questionnaires
 */
export function useQuestionnaires() {
  const api = useApi();

  return useQuery({
    queryKey: ["questionnaires"],
    queryFn: async () => {
      try {
        // Try to fetch from API first
        return await api.preAssessment.getQuestionnaires();
      } catch (error) {
        // Fall back to static data if API is unavailable
        console.warn("Failed to fetch questionnaires from API, using static data:", error);
        return LIST_OF_QUESTIONNAIRES;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - questionnaires don't change often
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1, // Reduced retry count since we have fallback
    retryDelay: 1000,
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