import { ListOfQuestionnaires } from "@/const/list-of-questionnaires";
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
    questionnaires: inProd ? [] : [],
    answers: inProd ? [] : [],

    setQuestionnaires: (to) =>
      set((state) => ({
        ...state,
        questionnaires: to,
        answers: Array(to.length).fill([]),
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

    step: inProd ? 0 : 0,
    miniStep: inProd ? 0 : 0,

    nextStep: () =>
      set((state) => {
        // Initial Form
        if (state.step === 0) {
          return { ...state, step: state.step + 1, miniStep: 0 };
        }

        // Moving to next step
        if (state.miniStep < state.questionnaires[state.step - 1].length - 1) {
          return { ...state, miniStep: state.miniStep + 1 };
        }

        // Moving to next questionnaire
        return { ...state, step: state.step + 1, miniStep: 0 };
      }),

    prevStep: () =>
      set((state) => {
        // Initial Form or First Questionnaire
        if (state.step <= 1) {
          return { ...state, step: 0, miniStep: 0 };
        }

        // Moving to previous question
        if (state.miniStep > 0) {
          return { ...state, miniStep: state.miniStep - 1 };
        }

        // Moving to previous questionnaire
        return {
          ...state,
          miniStep: state.questionnaires[state.step - 1].length - 1,
          step: state.step - 1,
        };
      }),
  }));
