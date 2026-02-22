import { useAnimationControls, AnimationControls } from "framer-motion";
import { fade, slide, start, reset } from "@/lib/animations";
import { usePreAssessmentChecklistStore } from "@/store/pre-assessment";
import { ListOfQuestionnaires } from "@/constants/questionnaire/questionnaire-mapping";

export interface UsePreAssessmentReturn {
  // State from store
  step: number;
  questionnaires: ListOfQuestionnaires[];
  
  // Animation controls
  animationControls: AnimationControls;
  
  // Actions
  handlePrevButtonOnClick: () => void;
  handleNextButtonOnClick: () => void;
  
  // Computed properties
  isPrevDisabled: boolean;
}

export function usePreAssessment(): UsePreAssessmentReturn {
  const animationControls = useAnimationControls();
  const { step, nextStep, prevStep, questionnaires } = usePreAssessmentChecklistStore();

  const handlePrevButtonOnClick = () => {
    animationControls.start({ ...fade.out, ...slide.right }).then(() => {
      prevStep();
      animationControls.start({ ...start.left }).then(() => {
        animationControls.start({ ...fade.in, ...reset });
      });
    });
  };

  const handleNextButtonOnClick = () => {
    animationControls.start({ ...fade.out, ...slide.left }).then(() => {
      nextStep();
      animationControls.start({ ...start.right }).then(() => {
        animationControls.start({ ...fade.in, ...reset });
      });
    });
  };

  const isPrevDisabled = step === 0;

  return {
    // State from store
    step,
    questionnaires,
    
    // Animation controls
    animationControls,
    
    // Actions
    handlePrevButtonOnClick,
    handleNextButtonOnClick,
    
    // Computed properties
    isPrevDisabled,
  };
}