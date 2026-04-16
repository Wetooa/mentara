import { usePreAssessmentChecklistStore } from "@/store/pre-assessment";
import { 
  getFlatQuestions,
  FlatQuestion 
} from "@/lib/assessment-scoring";
import { useMemo } from "react";

export interface UsePreAssessmentQuestionnaireReturn {
  question: FlatQuestion | null;
  isLoading: boolean;
  error: Error | null;
  currentAnswer: number;
  handleSelectAnswer: (answer: number) => void;
  isLastQuestion: boolean;
  isAnswerDisabled: boolean;
  buttonText: string;
}

export function usePreAssessmentQuestionnaire(): UsePreAssessmentQuestionnaireReturn {
  const {
    questionnaires,
    flatAnswers,
    setFlatAnswer,
    rapportAnswers
  } = usePreAssessmentChecklistStore();

  // 1. Generate the flattened, deterministically shuffled array of questions
  const flatQuestions = useMemo(() => {
    const seed = rapportAnswers.join(",");
    return getFlatQuestions(questionnaires, seed);
  }, [questionnaires, rapportAnswers]);

  // Determine current active question
  const currentQuestionIndex = useMemo(() => {
    const idx = flatAnswers.findIndex(a => a === -1);
    return idx === -1 ? flatAnswers.length - 1 : idx;
  }, [flatAnswers]);

  const question = flatQuestions[currentQuestionIndex] || null;
  const currentAnswer = flatAnswers[currentQuestionIndex] ?? -1;
  const isLastQuestion = currentQuestionIndex === flatQuestions.length - 1;

  const handleSelectAnswer = (answer: number) => {
    setFlatAnswer(currentQuestionIndex, answer);
  };

  const isAnswerDisabled = currentAnswer === -1;
  const buttonText = isLastQuestion ? "Finish Assessment" : "Continue";

  return {
    question,
    isLoading: false,
    error: null,
    currentAnswer,
    handleSelectAnswer,
    isLastQuestion,
    isAnswerDisabled,
    buttonText,
  };
}