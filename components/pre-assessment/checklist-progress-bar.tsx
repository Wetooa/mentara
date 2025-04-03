import React from "react";
import { Progress } from "../ui/progress";

export default function PreAssessmentProgressBar({ value }: { value: number }) {
  return (
    <div className="p-6">
      <Progress value={value} />
    </div>
  );
}
