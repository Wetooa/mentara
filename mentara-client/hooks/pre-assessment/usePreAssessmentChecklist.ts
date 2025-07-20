import { usePreAssessmentChecklistStore } from "@/store/pre-assessment";

export interface UsePreAssessmentChecklistReturn {
  // State
  questionnaires: string[];
  
  // Actions
  handleSelectQuestionnaire: (item: string) => void;
  
  // Computed properties
  isQuestionnaireSelected: (item: string) => boolean;
  isSubmitDisabled: boolean;
}

export function usePreAssessmentChecklist(): UsePreAssessmentChecklistReturn {
  const { questionnaires, setQuestionnaires } = usePreAssessmentChecklistStore();

  const handleSelectQuestionnaire = (item: string) => {
    const isSelected = questionnaires.includes(item);
    
    if (isSelected) {
      setQuestionnaires(
        questionnaires.filter((questionnaire) => questionnaire !== item)
      );
    } else {
      setQuestionnaires([...questionnaires, item]);
    }
  };

  const isQuestionnaireSelected = (item: string) => {
    return questionnaires.includes(item);
  };

  const isSubmitDisabled = questionnaires.length === 0;

  return {
    // State
    questionnaires,
    
    // Actions
    handleSelectQuestionnaire,
    
    // Computed properties
    isQuestionnaireSelected,
    isSubmitDisabled,
  };
}