import { usePreAssessmentChecklistStore } from "@/store/pre-assessment";
import { RAPPORT_QUESTIONS } from "@/constants/questionnaire/rapport-mapping";

export interface UsePreAssessmentChecklistReturn {
  // State
  rapportStep: number;
  currentRapportQuestion: typeof RAPPORT_QUESTIONS[0];
  currentRapportChoice: number;

  // Actions
  handleSelectRapportChoice: (choiceIndex: number) => void;

  // Computed properties
  isSubmitDisabled: boolean;
}

export function usePreAssessmentChecklist(): UsePreAssessmentChecklistReturn {
  const { rapportStep, rapportAnswers, setRapportAnswer } = usePreAssessmentChecklistStore();

  const currentRapportQuestion = RAPPORT_QUESTIONS[rapportStep];
  const currentRapportChoice = rapportAnswers[rapportStep];

  const handleSelectRapportChoice = (choiceIndex: number) => {
    setRapportAnswer(rapportStep, choiceIndex);
  };

  const isSubmitDisabled = currentRapportChoice === -1;

  return {
    // State
    rapportStep,
    currentRapportQuestion,
    currentRapportChoice,

    // Actions
    handleSelectRapportChoice,

    // Computed properties
    isSubmitDisabled,
  };
}