import { usePreAssessmentChecklistStore } from "@/store/pre-assessment";
import { QUESTIONNAIRE_MAP } from "@/constants/questionnaire/questionnaire-mapping";

export interface UsePreAssessmentQuestionnaireReturn {
  // Question data
  question: {
    prefix: string;
    question: string;
    options: string[];
  } | null;
  
  // Loading states
  isLoading: boolean;
  error: any;
  
  // State
  currentAnswer: number;
  
  // Actions
  handleSelectAnswer: (answer: number) => void;
  
  // Computed properties
  isLastQuestion: boolean;
  isAnswerDisabled: boolean;
  buttonText: string;
}

export function usePreAssessmentQuestionnaire(): UsePreAssessmentQuestionnaireReturn {
  const { step, miniStep, questionnaires, answers, setAnswers } = usePreAssessmentChecklistStore();

  const formIndex = step - 1;
  const questionIndex = miniStep;

  // Get questionnaire name from store
  const questionnaireName = questionnaires[formIndex];
  
  // Get questionnaire data from static mapping
  const questionnaireData = questionnaireName ? QUESTIONNAIRE_MAP[questionnaireName] : null;
  const questions = questionnaireData?.questions || [];
  
  // Get current question directly
  const rawQuestion = questions.length > questionIndex ? questions[questionIndex] : null;
  
  // Transform question to expected format
  const question = rawQuestion ? {
    prefix: rawQuestion.prefix || questionnaireData?.title || "Assessment", 
    question: rawQuestion.question,
    options: rawQuestion.options
  } : null;

  // No loading or error states needed for static data
  const isLoading = false;
  const error = null;

  const currentAnswer = answers[formIndex]?.[questionIndex] ?? -1;
  const isLastQuestion = questions ? questions.length - 1 === questionIndex : false;

  const handleSelectAnswer = (answer: number) => {
    if (!questions || formIndex < 0 || questionIndex < 0) return;
    
    const previousAnswers: number[] = answers[formIndex] || [];
    
    const formAnswers: number[] = [
      ...previousAnswers.slice(0, questionIndex),
      answer,
      ...previousAnswers.slice(questionIndex + 1),
    ];

    setAnswers(formIndex, formAnswers);
  };

  const isAnswerDisabled = currentAnswer === -1;
  const buttonText = isLastQuestion ? "Next form..." : "Continue";

  return {
    // Question data
    question,
    
    // Loading states
    isLoading,
    error,
    
    // State
    currentAnswer,
    
    // Actions
    handleSelectAnswer,
    
    // Computed properties
    isLastQuestion,
    isAnswerDisabled,
    buttonText,
  };
}