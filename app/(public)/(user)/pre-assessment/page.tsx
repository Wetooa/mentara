"use client";

import Logo from "@/components/logo";
import PreAssessmentInitialCheckList from "@/components/pre-assessment/forms/checklist-form";
import QuestionnaireForm from "@/components/pre-assessment/forms/questionnaire-form";
import PreAssessmentSignUp from "@/components/pre-assessment/forms/sign-up";
import VerifyAccount from "@/components/pre-assessment/forms/verify-account";
import PreAssessmentProgressBar from "@/components/pre-assessment/progress-bar";
import { Button } from "@/components/ui/button";
import { fade, fadeDown, reset, slide, start } from "@/lib/animations";
import { usePreAssessmentChecklistStore } from "@/store/preassessment";
import { motion, useAnimationControls } from "framer-motion";
import { ArrowLeft } from "lucide-react";

export interface PreAssessmentPageFormProps {
  handleNextButtonOnClick: () => void;
}

export default function PreAssessmentPage() {
  const animationControls = useAnimationControls();

  const { step, nextStep, prevStep, questionnaires } =
    usePreAssessmentChecklistStore();

  function handlePrevButtonOnClick() {
    animationControls.start({ ...fade.out, ...slide.right }).then(() => {
      prevStep();
      animationControls.start({ ...start.left }).then(() => {
        animationControls.start({ ...fade.in, ...reset });
      });
    });
  }

  function handleNextButtonOnClick() {
    animationControls.start({ ...fade.out, ...slide.left }).then(() => {
      nextStep();
      animationControls.start({ ...start.right }).then(() => {
        animationControls.start({ ...fade.in, ...reset });
      });
    });
  }

  return (
    <div className="bg-gradient-to-b from-tertiary to-transparent w-full h-full">
      <motion.nav
        variants={fadeDown}
        className="flex justify-between p-4 fixed w-full"
      >
        <Button
          disabled={step === 0}
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
              {(() => {
                if (step === 0) {
                  return (
                    <PreAssessmentInitialCheckList
                      handleNextButtonOnClick={handleNextButtonOnClick}
                    />
                  );
                } else if (step < questionnaires.length + 1) {
                  return (
                    <QuestionnaireForm
                      handleNextButtonOnClick={handleNextButtonOnClick}
                    />
                  );
                } else if (step === questionnaires.length + 1) {
                  return (
                    <PreAssessmentSignUp
                      handleNextButtonOnClick={handleNextButtonOnClick}
                    />
                  );
                } else {
                  return <VerifyAccount />;
                }
              })()}
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
