"use client";
import React from "react";
import PreAssessmentInitialCheckList from "./checklist-initial";
import PreAssessmentProgressBar from "./checklist-progress-bar";
import { create } from "zustand";

interface PreAssessmentChecklistState {
  step: number;
  setStep: (to: number) => void;
}

export const usePreAssessmentChecklistStore =
  create<PreAssessmentChecklistState>()((set) => ({
    step: 0,
    setStep: (to) => set((state) => ({ ...state, step: to })),
  }));

export default function PreAssessmentChecklist() {
  const { step } = usePreAssessmentChecklistStore();

  return (
    <div className="bg-primary-foreground rounded-3xl shadow-lg overflow-hidden max-w-[500px] max-h-[1000px] w-full h-full">
      <PreAssessmentProgressBar />

      {step === 0 ? (
        <PreAssessmentInitialCheckList />
      ) : (
        <div>something else</div>
      )}
    </div>
  );
}
