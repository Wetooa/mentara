import React from "react";
import { Progress } from "../ui/progress";
import { usePreAssessmentChecklistStore } from "./preassessment";

export default function PreAssessmentProgressBar() {
  const { step, questionnaires } = usePreAssessmentChecklistStore();
  const totalSteps = questionnaires.length + 1;
  const value = step / totalSteps;

  return (
    <div className="p-6">
      <Progress value={value} />
    </div>
  );
}
