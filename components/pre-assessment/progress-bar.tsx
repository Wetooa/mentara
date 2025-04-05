import React from "react";
import { Progress } from "../ui/progress";
import { usePreAssessmentChecklistStore } from "@/store/preassessment";

export default function PreAssessmentProgressBar() {
  const { step, miniStep, questionnaires } = usePreAssessmentChecklistStore();

  const questionnaireLength =
    1 <= step && step <= questionnaires.length
      ? questionnaires[step - 1].length
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
