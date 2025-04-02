import React from "react";
import { Progress } from "../ui/progress";

export default function PreAssessmentProgressBar({ value }: { value: number }) {
  return <Progress value={value} />;
}
