import {
  type ListOfQuestionnaires,
  QUESTIONNAIRE_MAP,
} from "@/constants/questionnaire/questionnaire-mapping";
import { RAPPORT_QUESTIONS } from "@/constants/questionnaire/rapport-mapping";
import { create } from "zustand";

const inProd = process.env.NODE_ENV === "production";

export interface PreAssessmentChecklistState {
  rapportStep: number;
  rapportAnswers: number[];
  setRapportAnswer: (step: number, choiceIndex: number) => void;
  calculateTopQuestionnaires: () => void;

  step: number; // 0=Rapport, 1=Screening, 2=Wait/Registration

  flatAnswers: number[];
  setFlatAnswer: (index: number, answer: number) => void;

  nextStep: () => void;
  prevStep: () => void;

  questionnaires: ListOfQuestionnaires[];
  setQuestionnaires: (to: ListOfQuestionnaires[]) => void;
}

export const usePreAssessmentChecklistStore =
  create<PreAssessmentChecklistState>()((set, get) => ({
    rapportStep: 0,
    rapportAnswers: Array(5).fill(-1),
    setRapportAnswer: (stepIndex, choiceIndex) =>
      set((state) => {
        const newAnswers = [...state.rapportAnswers];
        newAnswers[stepIndex] = choiceIndex;
        return { ...state, rapportAnswers: newAnswers };
      }),
    calculateTopQuestionnaires: () => {
      const state = get();
      const scores: Partial<Record<ListOfQuestionnaires, number>> = {};

      state.rapportAnswers.forEach((choiceIndex, qIndex) => {
        if (choiceIndex !== -1) {
          const question = RAPPORT_QUESTIONS[qIndex];
          const choice = question.choices[choiceIndex];
          if (choice && choice.weights) {
            Object.entries(choice.weights).forEach(([tool, weight]) => {
              const qTool = tool as ListOfQuestionnaires;
              scores[qTool] = (scores[qTool] || 0) + (weight as number);
            });
          }
        }
      });

      const sortedTools = Object.entries(scores)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .map(([tool]) => tool as ListOfQuestionnaires);

      const top3 = sortedTools.slice(0, 3);
      if (top3.length === 0) {
        // Fallback robust defaults if they skipped everything somehow
        top3.push("Stress", "Anxiety", "Depression");
      }

      state.setQuestionnaires(top3);
    },

    step: inProd ? 0 : 0,

    flatAnswers: [],

    setFlatAnswer: (index, answer) =>
      set((state) => {
        const newAnswers = [...state.flatAnswers];
        newAnswers[index] = answer;
        return { ...state, flatAnswers: newAnswers };
      }),

    nextStep: () =>
      set((state) => {
        // Step 0: Rapport Wizard
        if (state.step === 0) {
          if (state.rapportStep < 4) {
            return { rapportStep: state.rapportStep + 1 };
          } else {
            // Final rapport step: calculate top questionnaires and move to screening
            state.calculateTopQuestionnaires();
            return { step: 1 };
          }
        }

        // Step 1: Screening Assessment
        if (state.step === 1) {
          // Assessment completion -> Move to snapshot
          return { step: 2 };
        }

        // Step 2: Snapshot View
        if (state.step === 2) {
          // Snapshot viewed -> Move to registration
          return { step: 3 };
        }

        return state;
      }),

    prevStep: () =>
      set((state) => {
        // Step 0: Rapport Wizard
        if (state.step === 0) {
          if (state.rapportStep > 0) {
            return { rapportStep: state.rapportStep - 1 };
          }
          return state;
        }

        // Step 1: Screening Assessment
        if (state.step === 1) {
          // Back to final rapport step
          return { step: 0, rapportStep: 4 };
        }

        // Step 2: Snapshot View
        if (state.step === 2) {
          // Back to assessment
          return { step: 1 };
        }

        // Step 3: Registration
        if (state.step === 3) {
          // Back to snapshot
          return { step: 2 };
        }

        return state;
      }),

    questionnaires: inProd ? [] : [],

    setQuestionnaires: (to) =>
      set((state) => {
        // Calculate the total number of questions for the newly selected Top 3
        const totalQuestions = to.reduce((acc, q) => acc + (QUESTIONNAIRE_MAP[q]?.questions.length || 0), 0);
        return {
          ...state,
          questionnaires: to,
          flatAnswers: Array(totalQuestions).fill(-1),
        };
      }),
  }));

interface Details {
  email: string;
  nickName: string;
}

export interface SignUpStore {
  details: Details;
  setDetails: (details: Details) => void;
}

export const useSignUpStore = create<SignUpStore>()((set) => ({
  details: { email: "", nickName: "" },
  setDetails: (details) => set({ details }),
}));

// Assessment data interface
interface AssessmentData {
  questionnaires: ListOfQuestionnaires[];
  answers: number[][];
  step: number;
  miniStep: number;
}

// Assessment data store for registration flow
export interface PreAssessmentStore {
  assessmentData: AssessmentData | null;
  setAssessmentData: (data: AssessmentData) => void;
  getAssessmentData: () => AssessmentData | null;
  clearAssessmentData: () => void;
}

export const usePreAssessmentStore = create<PreAssessmentStore>()((set, get) => ({
  assessmentData: null,
  setAssessmentData: (data) => set({ assessmentData: data }),
  getAssessmentData: () => get().assessmentData,
  clearAssessmentData: () => set({ assessmentData: null }),
}));
