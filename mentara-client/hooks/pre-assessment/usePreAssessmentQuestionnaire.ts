import { usePreAssessmentChecklistStore } from "@/store/pre-assessment";
import { useQuestionnaireQuestions } from "./useQuestionnaires";

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

  // Get questionnaire ID from store
  const questionnaireId = questionnaires[formIndex];
  
  // Fetch questions from API
  const { 
    data: questions, 
    isLoading, 
    error,
    questionnaire 
  } = useQuestionnaireQuestions(questionnaireId || "");

  // Get current question
  const rawQuestion = questions && questions.length > questionIndex ? questions[questionIndex] : null;
  
  // Transform question to expected format
  const question = rawQuestion ? {
    prefix: questionnaire?.name || "Assessment",
    question: rawQuestion.text,
    options: rawQuestion.options.map(option => option.label)
  } : null;

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