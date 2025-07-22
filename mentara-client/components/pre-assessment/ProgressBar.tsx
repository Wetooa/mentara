import React from "react";
import { Progress } from "@/components/ui/progress";
import { usePreAssessmentChecklistStore } from "@/store/pre-assessment";
import { QUESTIONNAIRE_MAP } from "@/constants/questionnaire/questionnaire-mapping";

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

  return (
    <div className="p-6">
      <Progress value={value} />
    </div>
  );
}
