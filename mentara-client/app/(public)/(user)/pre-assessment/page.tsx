"use client";

import Logo from "@/components/Logo";
import PreAssessmentInitialCheckList from "@/components/pre-assessment/forms/checklist";
import QuestionnaireForm from "@/components/pre-assessment/forms/QuestionnaireForm";
import PreAssessmentSignUp from "@/components/auth/RegistrationWithVerification";
import VerifyAccount from "@/components/auth/VerifyAccount";
import PreAssessmentProgressBar from "@/components/pre-assessment/ProgressBar";
import { Button } from "@/components/ui/button";
import { fade, fadeDown, reset, slide, start } from "@/lib/animations";
import { usePreAssessmentChecklistStore } from "@/store/pre-assessment";
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

  let form = null;
  if (step === 0) {
    form = (
      <PreAssessmentInitialCheckList
        handleNextButtonOnClick={handleNextButtonOnClick}
      />
    );
  } else if (step < questionnaires.length + 1) {
    form = (
      <QuestionnaireForm handleNextButtonOnClick={handleNextButtonOnClick} />
    );
  } else if (step === questionnaires.length + 1) {
    form = (
      <PreAssessmentSignUp />
    );
  } else {
    form = <VerifyAccount />;
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
              {form}
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
