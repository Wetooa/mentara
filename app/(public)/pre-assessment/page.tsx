"use client";

import PreAssessmentNavbar from "@/components/pre-assessment/navbar";
import PreAssessmentChecklist from "@/components/pre-assessment/pre-assessment";
import { useAnimationControls } from "framer-motion";

export default function PreAssessmentPage() {
  const animationControls = useAnimationControls();

  return (
    <div className="bg-gradient-to-b from-tertiary to-transparent w-full h-full">
      <PreAssessmentNavbar animationControls={animationControls} />

      <main className="flex flex-col items-center justify-center h-full">
        <PreAssessmentChecklist animationControls={animationControls} />
      </main>
    </div>
  );
}
