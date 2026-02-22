import { usePreAssessmentChecklistStore } from "@/store/pre-assessment";
import { QUESTIONNAIRE_MAP } from "@/constants/questionnaire/questionnaire-mapping";
import { useMemo } from "react";

export interface FlatQuestion {
  originalIndex: number;
  sourceToolId: string;
  prefix: string;
  question: string;
  options: string[];
}

export interface UsePreAssessmentQuestionnaireReturn {
  question: FlatQuestion | null;
  isLoading: boolean;
  error: any;
  currentAnswer: number;
  handleSelectAnswer: (answer: number) => void;
  isLastQuestion: boolean;
  isAnswerDisabled: boolean;
  buttonText: string;
}

// Simple deterministic shuffle based on a seed string
function seededShuffle<T>(array: T[], seed: string): T[] {
  let m = array.length, t, i;
  let seedNum = Array.from(seed).reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const result = [...array];
  // While there remain elements to shuffle…
  while (m) {
    // Pick a remaining element using the seed
    seedNum = (seedNum * 9301 + 49297) % 233280;
    i = Math.floor((seedNum / 233280) * m--);

    // And swap it with the current element.
    t = result[m];
    result[m] = result[i];
    result[i] = t;
  }
  return result;
}

export function usePreAssessmentQuestionnaire(): UsePreAssessmentQuestionnaireReturn {
  const {
    step,
    questionnaires,
    flatAnswers,
    setFlatAnswer,
    nextStep,
    rapportAnswers
  } = usePreAssessmentChecklistStore();

  // 1. Generate the flattened, deterministically shuffled array of questions
  const flatQuestions = useMemo(() => {
    if (questionnaires.length === 0) return [];

    const allQuestions: FlatQuestion[] = [];

    questionnaires.forEach(qName => {
      const qData = QUESTIONNAIRE_MAP[qName];
      if (qData && qData.questions) {
        qData.questions.forEach((q, index) => {
          allQuestions.push({
            originalIndex: index,
            sourceToolId: qName,
            prefix: q.prefix || qData.title || "Assessment",
            question: q.question,
            options: q.options
          });
        });
      }
    });

    // We use the stringified rapportAnswers as the deterministic seed 
    // so the shuffle order stays consistent across re-renders for this user's session
    const seed = rapportAnswers.join(",");
    return seededShuffle(allQuestions, seed);
  }, [questionnaires, rapportAnswers]);

  // Determine current active question
  // In a flat array, the current question is simply the first index that doesn't have an answer yet
  // If all are answered (or we just clicked next on the last one), we are at the end

  // Note: we can also track progression by just looking for the next -1 in flatAnswers
  const currentQuestionIndex = useMemo(() => {
    const idx = flatAnswers.findIndex(a => a === -1);
    return idx === -1 ? flatAnswers.length - 1 : idx; // If all answered, stay on last until advance
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