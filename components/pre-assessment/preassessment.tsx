"use client";
import { create } from "zustand";
import { ListOfQuestionnaires } from "@/const/list-of-questionnaires";
import PreAssessmentBaseForm from "./base-form";
import PreAssessmentProgressBar from "./progress-bar";

interface PreAssessmentChecklistState {
  step: number;
  setStep: (to: number) => void;
  increaseStep: () => void;
  decreaseStep: () => void;

  questionnaires: ListOfQuestionnaires[];
  setQuestionnaires: (to: ListOfQuestionnaires[]) => void;
}

export const usePreAssessmentChecklistStore =
  create<PreAssessmentChecklistState>()((set) => ({
    step: 0,
    setStep: (to) => set((state) => ({ ...state, step: to })),
    increaseStep: () => set((state) => ({ ...state, step: state.step + 1 })),
    decreaseStep: () => set((state) => ({ ...state, step: state.step - 1 })),

    questionnaires: [],
    setQuestionnaires: (to) =>
      set((state) => ({ ...state, questionnaires: to })),
  }));

export default function PreAssessmentChecklist() {
  return (
    <div className="bg-primary-foreground rounded-3xl shadow-lg overflow-hidden max-w-[500px] max-h-[1000px] w-full h-full">
      <PreAssessmentProgressBar />
      <PreAssessmentBaseForm />
    </div>
  );
}
