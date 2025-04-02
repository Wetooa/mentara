"use client";
import React from "react";
import PreAssessmentInitialCheckList from "./checklist-initial";
import PreAssessmentProgressBar from "./checklist-progress-bar";

export default function PreAssessmentChecklist() {
  const [progressBarValue, setProgressBarValue] = React.useState(0);

  return (
    <div className="bg-primary-foreground rounded-3xl shadow-lg max-w-[700px] max-h-[1000px] w-full h-full p-6">
      <PreAssessmentProgressBar value={progressBarValue} />

      {progressBarValue === 0 ? (
        <PreAssessmentInitialCheckList />
      ) : (
        <div>something else</div>
      )}
    </div>
  );
}
