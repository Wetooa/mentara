import React from "react";
import { usePreAssessmentChecklistStore } from "@/store/pre-assessment";
import { CheckCircle, Circle } from "lucide-react";

export default function PreAssessmentProgressBar() {
  const { step, rapportStep, flatAnswers } = usePreAssessmentChecklistStore();

  const totalRapportQuestions = 5;
  const totalAssessmentQuestions = flatAnswers.length > 0 ? flatAnswers.length : 1;

  const checklistWeight = totalRapportQuestions;
  const assessmentWeight = totalAssessmentQuestions;
  const signUpWeight = 2; // registration + verification
  const totalWeight = checklistWeight + assessmentWeight + signUpWeight;

  // Calculate current progress based on the simplified 3 steps
  let currentProgress = 0;

  if (step === 0) {
    // In checklist (Rapport Wizard)
    currentProgress = rapportStep;
  } else if (step === 1) {
    // In assessment (Shuffled Array)
    const answersSubmitted = flatAnswers.filter(a => a !== -1).length;
    currentProgress = checklistWeight + answersSubmitted;
  } else if (step === 2) {
    // In snapshot view
    currentProgress = checklistWeight + assessmentWeight;
  } else if (step === 3) {
    // In registration form
    currentProgress = checklistWeight + assessmentWeight + 1;
  } else {
    // In verification
    currentProgress = checklistWeight + assessmentWeight + 2;
  }

  const progressPercent = (currentProgress / totalWeight) * 100;

  // Calculate section boundaries as percentages for the visual lines
  const checklistEnd = (checklistWeight / totalWeight) * 100;
  const assessmentEnd = ((checklistWeight + assessmentWeight) / totalWeight) * 100;

  const majorSections = [
    { label: "Rapport", stepNum: 0, canNavigate: step > 0 },
    { label: "Screening", stepNum: 1, canNavigate: step > 1 },
    { label: "Snapshot", stepNum: 2, canNavigate: step > 2 },
    { label: "Sign Up", stepNum: 3, canNavigate: false },
  ];

  const isSectionCompleted = (sectionStep: number) => step > sectionStep;
  const isSectionActive = (sectionStep: number) => step === sectionStep;
  const isSectionPartial = (sectionStep: number) => {
    if (sectionStep === 0) return step === 0 && rapportStep > 0;
    if (sectionStep === 1) return step === 1 && flatAnswers.some(a => a !== -1);
    if (sectionStep === 2) return step === 2;
    if (sectionStep === 3) return step === 3;
    return false;
  };

  return (
    <div className="p-6 sm:p-8 bg-primary/5 border-b border-gray-200" role="progressbar" aria-valuenow={Math.round(progressPercent)} aria-valuemin={0} aria-valuemax={100} aria-label={`Assessment progress: ${Math.round(progressPercent)}% complete`}>
      {/* Major Sections Progress - Smaller */}
      <div className="mb-2 flex items-center justify-between relative" role="list" aria-label="Assessment sections">
        {majorSections.map((section, index) => {
          const isCompleted = isSectionCompleted(section.stepNum);
          const isActive = isSectionActive(section.stepNum);
          const isPartial = isSectionPartial(section.stepNum);
          const isLast = index === majorSections.length - 1;

          return (
            <React.Fragment key={section.label}>
              <div className="flex flex-col items-center relative z-10" role="listitem">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${isCompleted
                    ? "bg-primary text-white shadow-md"
                    : isActive && isPartial
                      ? "bg-secondary/30 text-secondary ring-2 ring-secondary shadow-md shadow-secondary/20 animate-pulse"
                      : isActive
                        ? "bg-primary/20 text-primary ring-2 ring-primary/50"
                        : "bg-gray-200 text-gray-400"
                    }`}
                  aria-label={`${section.label} section: ${isCompleted ? 'completed' : isActive ? 'in progress' : 'not started'}`}
                >
                  {isCompleted ? (
                    <CheckCircle className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Circle className="h-3 w-3 fill-current" aria-hidden="true" />
                  )}
                </div>
                <span
                  className={`text-[10px] mt-1 font-medium ${isActive || isCompleted ? "text-primary" : "text-gray-500"
                    }`}
                >
                  {section.label}
                </span>
              </div>

              {!isLast && (
                <div className="flex-1 h-0.5 bg-gray-200 relative -mt-6">
                  <div
                    className={`absolute left-0 top-0 h-full transition-all duration-500 ${isSectionCompleted(section.stepNum)
                      ? "bg-primary w-full"
                      : "bg-gray-200 w-0"
                      }`}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      <div className="mt-4">
        <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden" role="progressbar" aria-valuenow={Math.round(progressPercent)} aria-valuemin={0} aria-valuemax={100}>
          <div
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary via-primary/90 to-primary/80 transition-all duration-300 shadow-sm"
            style={{ width: `${progressPercent}%` }}
            aria-hidden="true"
          />

          <div className="absolute top-0 h-full w-1 bg-primary/60 shadow-sm z-10" style={{ left: `${checklistEnd}%` }} title="Rapport → Screening" />
          <div className="absolute top-0 h-full w-1 bg-primary/60 shadow-sm z-10" style={{ left: `${assessmentEnd}%` }} title="Screening → Snapshot" />
        </div>

        <div className="mt-2 text-center">
          <p className="text-xs text-gray-600" aria-live="polite" aria-atomic="true">
            <span className="sr-only">Progress: </span>
            {Math.round(progressPercent)}% Complete

            {step === 0 && (
              <span className="ml-2">• Impact {rapportStep + 1} of 5</span>
            )}

            {step === 1 && (
              <span className="ml-2">• Question {flatAnswers.filter(a => a !== -1).length + 1} of {totalAssessmentQuestions}</span>
            )}

            {step === 2 && (
              <span className="ml-2">• Your Clinical Snapshot</span>
            )}
            {step === 3 && (
              <span className="ml-2">• Step 1 of 2: Registration</span>
            )}
            {step > 3 && (
              <span className="ml-2">• Step 2 of 2: Verification</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
