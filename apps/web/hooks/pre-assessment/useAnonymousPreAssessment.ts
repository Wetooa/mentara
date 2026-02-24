import { 
  usePreAssessmentControllerCreateAnonymousPreAssessment,
  PreAssessmentResponseDto 
} from "api-client";
import { usePreAssessmentChecklistStore } from "@/store/pre-assessment";
import { calculateDetailedResults } from "@/lib/assessment-scoring";

/**
 * Hook to create an anonymous pre-assessment
 * Uses the generated Orval API client
 */
export function useAnonymousPreAssessment() {
  const { questionnaires, flatAnswers, setSessionId, rapportAnswers } = usePreAssessmentChecklistStore();
  const createAnonymousMutation = usePreAssessmentControllerCreateAnonymousPreAssessment();

  const createAnonymous = async () => {
    // 1. Calculate accurate scores and severity using centralized utility
    const seed = rapportAnswers.join(",");
    const detailedResults = calculateDetailedResults(questionnaires, flatAnswers, seed);
    
    // 2. Format for backend DTO
    const questionnaireScores: Record<string, { score: number; severity: string }> = {};
    detailedResults.forEach(result => {
      questionnaireScores[result.name] = {
        score: result.score,
        severity: result.severity,
      };
    });

    try {
      // 3. Generate a tracking ID
      const assessmentId = crypto.randomUUID();

      // 4. Call the generated API client
      const response = await createAnonymousMutation.mutateAsync({
        data: {
          assessmentId,
          method: 'CHECKLIST',
          completedAt: new Date().toISOString(),
          data: {
            questionnaireScores,
          },
          pastTherapyExperiences: null,
          medicationHistory: null,
          accessibilityNeeds: null,
        }
      });

      console.log("Anonymous pre-assessment created successfully:", response);

      // 5. Update store with returned ID
      const result = response as PreAssessmentResponseDto;
      setSessionId(result.id || assessmentId);

      return result;
    } catch (error) {
      console.error("Failed to create anonymous pre-assessment:", error);
      throw error;
    }
  };

  return {
    ...createAnonymousMutation,
    createAnonymous,
  };
} // Evaluated

