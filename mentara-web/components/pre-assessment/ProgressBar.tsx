import React from "react";
import { usePreAssessmentChecklistStore } from "@/store/pre-assessment";
import { QUESTIONNAIRE_MAP } from "@/constants/questionnaire/questionnaire-mapping";
import { CheckCircle } from "lucide-react";

export default function PreAssessmentProgressBar() {
  const { step, miniStep, questionnaires } = usePreAssessmentChecklistStore();

  // Calculate total questions across all questionnaires
  const totalQuestions = questionnaires.reduce((sum, qName) => {
    return sum + (QUESTIONNAIRE_MAP[qName]?.questions.length || 0);
  }, 0);

  // Calculate section weights (proportional to their complexity)
  const checklistWeight = 1; // 1 step
  const assessmentWeight = totalQuestions || 1; // Total questions
  const signUpWeight = 2; // 2 sub-steps (registration + verification)
  const totalWeight = checklistWeight + assessmentWeight + signUpWeight;

  // Calculate current progress
  let currentProgress = 0;

  if (step === 0) {
    // In checklist - no progress until questionnaires are selected
    currentProgress = 0;
  } else if (step >= 1 && step <= questionnaires.length) {
    // In assessment - count completed questionnaires + current question
    let completedQuestions = 0;
    for (let i = 0; i < step - 1; i++) {
      completedQuestions +=
        QUESTIONNAIRE_MAP[questionnaires[i]]?.questions.length || 0;
    }
    completedQuestions += miniStep;
    currentProgress = checklistWeight + completedQuestions;
  } else if (step === questionnaires.length + 1) {
    // In registration form (first half of sign up)
    currentProgress = checklistWeight + assessmentWeight;
  } else {
    // In verification (second half of sign up)
    currentProgress = checklistWeight + assessmentWeight + 1;
  }

  const progressPercent = (currentProgress / totalWeight) * 100;

  // Calculate section boundaries as percentages
  const checklistEnd = (checklistWeight / totalWeight) * 100;
  const assessmentEnd =
    ((checklistWeight + assessmentWeight) / totalWeight) * 100;

  // Define major sections with navigation capability
  const majorSections = [
    {
      label: "Checklist",
      stepNum: 0,
      canNavigate: step > 0,
    },
    {
      label: "Assessment",
      stepNum: 1,
      canNavigate: step > questionnaires.length,
    },
    {
      label: "Sign Up",
      stepNum: questionnaires.length + 1,
      canNavigate: false,
    },
  ];

  const isSectionCompleted = (sectionStep: number) => {
    if (sectionStep === 0) return step > 0;
    if (sectionStep === 1) return step > questionnaires.length;
    return step > questionnaires.length + 1;
  };

  const isSectionActive = (sectionStep: number) => {
    if (sectionStep === 0) return step === 0;
    if (sectionStep === 1) return step >= 1 && step <= questionnaires.length;
    return step >= questionnaires.length + 1;
  };

  const isSectionPartial = (sectionStep: number) => {
    // Assessment is partial if currently in it and has progress
    if (sectionStep === 1)
      return step >= 1 && step <= questionnaires.length && miniStep > 0;
    // Sign up is partial if in registration step
    if (sectionStep === questionnaires.length + 1)
      return step === questionnaires.length + 1;
    return false;
  };

  return (
    <div className="p-6">
      {/* Major Sections Progress - Smaller */}
      <div className="mb-2 flex items-center justify-between relative">
        {majorSections.map((section, index) => {
          const isCompleted = isSectionCompleted(section.stepNum);
          const isActive = isSectionActive(section.stepNum);
          const isPartial = isSectionPartial(section.stepNum);
          const isLast = index === majorSections.length - 1;

          return (
            <React.Fragment key={section.label}>
              <div className="flex flex-col items-center relative z-10">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                    isCompleted
                      ? "bg-primary text-white shadow-md"
                      : isActive && isPartial
                        ? "bg-secondary/30 text-secondary ring-2 ring-secondary shadow-md shadow-secondary/20 animate-pulse"
                        : isActive
                          ? "bg-primary/20 text-primary ring-2 ring-primary/50"
                          : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <div className="h-3 w-3 rounded-full bg-current" />
                  )}
                </div>
                <span
                  className={`text-[10px] mt-1 font-medium ${
                    isActive || isCompleted ? "text-primary" : "text-gray-500"
                  }`}
                >
                  {section.label}
                </span>
              </div>

              {/* Connection line between sections */}
              {!isLast && (
                <div className="flex-1 h-0.5 bg-gray-200 relative -mt-6">
                  <div
                    className={`absolute left-0 top-0 h-full transition-all duration-500 ${
                      isSectionCompleted(section.stepNum)
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

      {/* Detailed Progress Bar with Proportional Separators */}
      <div className="mt-4">
        <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
          {/* Progress fill */}
          <div
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary via-primary/90 to-primary/80 transition-all duration-300 shadow-sm"
            style={{ width: `${progressPercent}%` }}
          />

          {/* MAJOR checkpoint separators (bold dark green lines) */}
          <div
            className="absolute top-0 h-full w-1 bg-primary/60 shadow-sm z-10"
            style={{ left: `${checklistEnd}%` }}
            title="Checklist → Assessment"
          />
          <div
            className="absolute top-0 h-full w-1 bg-primary/60 shadow-sm z-10"
            style={{ left: `${assessmentEnd}%` }}
            title="Assessment → Sign Up"
          />

          {/* MINOR separators for questions in assessment (lighter lines) */}
          {questionnaires.map((qName, qIdx) => {
            const questionsInThisQuestionnaire =
              QUESTIONNAIRE_MAP[qName]?.questions.length || 0;

            // Calculate how many questions came before this questionnaire
            let questionsBefore = 0;
            for (let i = 0; i < qIdx; i++) {
              questionsBefore +=
                QUESTIONNAIRE_MAP[questionnaires[i]]?.questions.length || 0;
            }

            return Array.from({ length: questionsInThisQuestionnaire }).map(
              (_, qIndex) => {
                if (qIndex === 0) return null; // Skip first question separator

                const totalQuestionsSoFar = questionsBefore + qIndex;
                const progressInAssessment =
                  totalQuestionsSoFar / (totalQuestions || 1);
                const positionPercent =
                  checklistEnd +
                  progressInAssessment * (assessmentEnd - checklistEnd);

                return (
                  <div
                    key={`q-${qName}-${qIndex}`}
                    className="absolute top-0 h-full w-px bg-primary/20"
                    style={{ left: `${positionPercent}%` }}
                  />
                );
              }
            );
          })}

          {/* MINOR separator for sign up (between registration and verification) */}
          <div
            className="absolute top-0 h-full w-px bg-primary/20"
            style={{
              left: `${assessmentEnd + (100 - assessmentEnd) / 2}%`,
            }}
            title="Registration → Verification"
          />
        </div>

        <div className="mt-2 text-center">
          <p className="text-xs text-gray-600">
            {Math.round(progressPercent)}% Complete
            {step > 0 && step <= questionnaires.length && (
              <span className="ml-2">
                • Question {miniStep + 1} of{" "}
                {QUESTIONNAIRE_MAP[questionnaires[step - 1]]?.questions
                  .length || 0}
              </span>
            )}
            {step === questionnaires.length + 1 && (
              <span className="ml-2">• Step 1 of 2: Registration</span>
            )}
            {step > questionnaires.length + 1 && (
              <span className="ml-2">• Step 2 of 2: Verification</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
