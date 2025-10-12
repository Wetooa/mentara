import React from "react";
import { usePreAssessmentChecklistStore } from "@/store/pre-assessment";
import { QUESTIONNAIRE_MAP } from "@/constants/questionnaire/questionnaire-mapping";
import { CheckCircle, Circle } from "lucide-react";

export default function PreAssessmentProgressBar() {
  const { step, miniStep, questionnaires } = usePreAssessmentChecklistStore();

  const questionnaireLength =
    1 <= step && step <= questionnaires.length
      ? QUESTIONNAIRE_MAP[questionnaires[step - 1]].questions.length
      : 1;
  const totalSteps = questionnaires.length + 2;

  const stepValue = step / totalSteps;
  const miniStepValue = miniStep / questionnaireLength;
  const value = (stepValue + miniStepValue / totalSteps) * 100;

  // Define major sections
  const majorSections = [
    { label: "Checklist", step: 0 },
    { label: "Assessment", step: questionnaires.length > 0 ? 1 : 1 },
    { label: "Sign Up", step: questionnaires.length + 1 },
  ];

  // Calculate if each major section is completed
  const isSectionCompleted = (sectionStep: number) => step > sectionStep;
  const isSectionActive = (sectionStep: number) => step === sectionStep;

  return (
    <div className="p-6">
      {/* Major Sections Progress */}
      <div className="mb-2 flex items-center justify-between relative">
        {majorSections.map((section, index) => {
          const isCompleted = isSectionCompleted(section.step);
          const isActive = isSectionActive(section.step);
          const isLast = index === majorSections.length - 1;

          return (
            <React.Fragment key={section.label}>
              <div className="flex flex-col items-center relative z-10">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    isCompleted
                      ? "bg-primary text-white shadow-md"
                      : isActive
                        ? "bg-primary/20 text-primary ring-2 ring-primary/50"
                        : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <Circle className="h-4 w-4 fill-current" />
                  )}
                </div>
                <span
                  className={`text-xs mt-1.5 font-medium ${
                    isActive || isCompleted ? "text-primary" : "text-gray-500"
                  }`}
                >
                  {section.label}
                </span>
              </div>

              {/* Connection line between sections */}
              {!isLast && (
                <div className="flex-1 h-0.5 bg-gray-200 relative -mt-8">
                  <div
                    className={`absolute left-0 top-0 h-full transition-all ${
                      isSectionCompleted(section.step)
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

      {/* Detailed Progress Bar with Mini Steps */}
      <div className="mt-6">
        <div className="relative">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-300 rounded-full"
              style={{ width: `${value}%` }}
            />
          </div>
          
          {/* Minor separator indicators for questions */}
          {step > 0 && step <= questionnaires.length && (
            <div className="absolute top-0 left-0 right-0 h-2 flex">
              {Array.from({ length: questionnaireLength }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 relative"
                  style={{ width: `${100 / questionnaireLength}%` }}
                >
                  {i < questionnaireLength - 1 && (
                    <div className="absolute right-0 top-0 w-px h-full bg-white/50" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="mt-2 text-center">
          <p className="text-xs text-gray-600">
            {Math.round(value)}% Complete
            {step > 0 && step <= questionnaires.length && (
              <span className="ml-2">• Question {miniStep + 1} of {questionnaireLength}</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
