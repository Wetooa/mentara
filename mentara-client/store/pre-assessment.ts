import {
  type ListOfQuestionnaires,
  QUESTIONNAIRE_MAP,
} from "@/constants/questionnaires";
import { create } from "zustand";

const inProd = process.env.NODE_ENV === "production";

export interface PreAssessmentChecklistState {
  step: number;
  miniStep: number;
  nextStep: () => void;
  prevStep: () => void;

  questionnaires: ListOfQuestionnaires[];
  setQuestionnaires: (to: ListOfQuestionnaires[]) => void;

  answers: number[][];
  setAnswers: (index: number, to: number[]) => void;
}

export const usePreAssessmentChecklistStore =
  create<PreAssessmentChecklistState>()((set) => ({
    step: inProd ? 0 : 0,
    miniStep: inProd ? 0 : 0,
    nextStep: () =>
      set((state) => {
        // Initial Form
        if (
          state.step === 0 ||
          state.step === state.questionnaires.length + 1
        ) {
          return { ...state, step: state.step + 1, miniStep: 0 };
        }

        // Moving to next step
        if (
          state.miniStep <
          QUESTIONNAIRE_MAP[state.questionnaires[state.step - 1]].questions
            .length -
            1
        ) {
          return { ...state, miniStep: state.miniStep + 1 };
        }

        // Moving to next questionnaire
        return { ...state, step: state.step + 1, miniStep: 0 };
      }),
    prevStep: () =>
      set((state) => {
        // Moving to previous question
        if (state.miniStep > 0) {
          return { ...state, miniStep: state.miniStep - 1 };
        }

        // Initial Form or First Questionnaire
        if (state.step <= 1) {
          return { ...state, step: 0, miniStep: 0 };
        }

        // Last Questionnaire
        if (state.step === state.questionnaires.length + 2) {
          return { ...state, step: state.step - 1, miniStep: 0 };
        }

        // Moving to previous questionnaire
        return {
          ...state,
          miniStep:
            QUESTIONNAIRE_MAP[state.questionnaires[state.step - 2]].questions
              .length - 1,
          step: state.step - 1,
        };
      }),

    questionnaires: inProd ? [] : [],
    answers: inProd ? [] : [],

    setQuestionnaires: (to) =>
      set((state) => ({
        ...state,
        questionnaires: to,
        answers: to.map((questionnaire) =>
          Array(QUESTIONNAIRE_MAP[questionnaire].questions.length).fill(-1)
        ),
      })),

    setAnswers: (index, to) =>
      set((state) => ({
        ...state,
        answers: [
          ...state.answers.slice(0, index),
          to,
          ...state.answers.slice(index + 1),
        ],
      })),
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
