"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Logo from "@/components/Logo";
import PreAssessmentInitialCheckList from "@/components/pre-assessment/forms/ChecklistForm";
import QuestionnaireForm from "@/components/pre-assessment/forms/QuestionnaireForm";
import PreAssessmentSignUp from "@/components/pre-assessment/forms/PreAssessmentSignUp";
import VerifyAccount from "@/components/auth/VerifyAccount";
import PreAssessmentProgressBar from "@/components/pre-assessment/ProgressBar";
import { Button } from "@/components/ui/button";
import { fadeDown } from "@/lib/animations";
import { usePreAssessment } from "@/hooks/pre-assessment/usePreAssessment";

export function PreAssessmentPage() {
  const {
    step,
    questionnaires,
    animationControls,
    handlePrevButtonOnClick,
    handleNextButtonOnClick,
    isPrevDisabled,
  } = usePreAssessment();

  const getCurrentForm = () => {
    if (step === 0) {
      return (
        <PreAssessmentInitialCheckList
          handleNextButtonOnClick={handleNextButtonOnClick}
        />
      );
    } else if (step < questionnaires.length + 1) {
      return (
        <QuestionnaireForm handleNextButtonOnClick={handleNextButtonOnClick} />
      );
    } else if (step === questionnaires.length + 1) {
      return <PreAssessmentSignUp />;
    } else {
      return <VerifyAccount />;
    }
  };

  return (
    <div className="bg-gradient-to-b from-tertiary to-transparent w-full h-full">
      <motion.nav
        variants={fadeDown}
        className="flex justify-between p-4 fixed w-full"
      >
        <Button
          disabled={isPrevDisabled}
          onClick={handlePrevButtonOnClick}
          className="rounded-full aspect-square font-bold"
        >
          <ArrowLeft />
        </Button>

        <Logo />
      </motion.nav>

      <main className="flex flex-col items-center justify-center h-full">
        <motion.div
          variants={fadeDown}
          className="bg-primary-foreground rounded-3xl shadow-lg overflow-hidden max-w-[400px] w-full"
        >
          <PreAssessmentProgressBar />

          <div className="w-full">
            <motion.div animate={animationControls} variants={fadeDown}>
              {getCurrentForm()}
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

export default PreAssessmentPage;
