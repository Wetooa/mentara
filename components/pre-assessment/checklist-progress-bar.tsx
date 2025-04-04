import React from "react";
import { Progress } from "../ui/progress";
import { usePreAssessmentChecklistStore } from "./checklist";

export default function PreAssessmentProgressBar() {
  const { step } = usePreAssessmentChecklistStore();

  return (
    <div className="p-6">
      <Progress value={step} />
    </div>
  );
}
