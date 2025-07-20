import { usePreAssessmentChecklistStore } from "@/store/pre-assessment";
import { QUESTIONNAIRE_MAP } from "@/constants/questionnaires";

export interface UsePreAssessmentQuestionnaireReturn {
  // Question data
  question: {
    prefix: string;
    question: string;
    options: string[];
  };
  
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

  const questionnaireId = questionnaires[formIndex];
  const questions = QUESTIONNAIRE_MAP[questionnaireId].questions;
  const question = questions[questionIndex];

  const currentAnswer = answers[formIndex][questionIndex];
  const isLastQuestion = questions.length - 1 === questionIndex;

  const handleSelectAnswer = (answer: number) => {
    const previousAnswers: number[] = answers[formIndex];
    
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