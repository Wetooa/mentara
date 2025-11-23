"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Logo from "@/components/Logo";
import PreAssessmentInitialCheckList from "@/components/pre-assessment/forms/ChecklistForm";
import QuestionnaireForm from "@/components/pre-assessment/forms/QuestionnaireForm";
import PreAssessmentSignUp from "@/components/pre-assessment/forms/PreAssessmentSignUp";
import VerifyAccount from "@/components/auth/VerifyAccount";
import PreAssessmentProgressBar from "@/components/pre-assessment/ProgressBar";
import ModeSelectionForm from "@/components/pre-assessment/forms/ModeSelectionForm";
import ChatbotInterface from "@/components/pre-assessment/ChatbotInterface";
import { Button } from "@/components/ui/button";
import { fadeDown } from "@/lib/animations";
import { usePreAssessment } from "@/hooks/pre-assessment/usePreAssessment";
import { useRouter, usePathname } from "next/navigation";
import { usePreAssessmentChecklistStore } from "@/store/pre-assessment";

export function PreAssessmentPage() {
  const pathname = usePathname();
  // Determine initial mode based on route
  const getInitialMode = (): 'selection' | 'checklist' | 'chatbot' => {
    if (pathname?.includes('/checklist')) return 'checklist';
    if (pathname?.includes('/chat')) return 'chatbot';
    return 'selection';
  };
  
  const [mode, setMode] = useState<'selection' | 'checklist' | 'chatbot'>(getInitialMode());
  const router = useRouter();
  const { setQuestionnaires, nextStep } = usePreAssessmentChecklistStore();
  const {
    step,
    questionnaires,
    animationControls,
    handlePrevButtonOnClick,
    handleNextButtonOnClick,
    isPrevDisabled,
  } = usePreAssessment();

  const handleModeSelection = (selectedMode: 'checklist' | 'chatbot') => {
    setMode(selectedMode);
  };

  const handleChatbotComplete = (results: {
    scores: Record<string, { score: number; severity: string }>;
    severityLevels: Record<string, string>;
  }) => {
    // Redirect to results or dashboard
    router.push('/dashboard');
  };

  const handleChatbotCancel = () => {
    setMode('selection');
  };

  const getCurrentForm = () => {
    // Mode selection screen
    if (mode === 'selection') {
      return <ModeSelectionForm onSelectMode={handleModeSelection} />;
    }

    // Chatbot mode
    if (mode === 'chatbot') {
      return (
        <ChatbotInterface
          onComplete={handleChatbotComplete}
          onCancel={handleChatbotCancel}
        />
      );
    }

    // Checklist mode - show questionnaire selection first (step 0), then questionnaires
    if (step === 0) {
      return (
        <PreAssessmentInitialCheckList
          handleNextButtonOnClick={handleNextButtonOnClick}
        />
      );
    } else if (step > 0 && step < questionnaires.length + 1) {
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
        className="flex items-center justify-between p-4 fixed w-full z-10 bg-gradient-to-b from-tertiary/10 via-transparent to-transparent"
      >
        <Button
          disabled={mode === 'selection' || (mode === 'checklist' && isPrevDisabled)}
          onClick={() => {
            if (mode === 'chatbot') {
              setMode('selection');
            } else {
              handlePrevButtonOnClick();
            }
          }}
          className="rounded-full aspect-square font-bold flex-shrink-0"
        >
          <ArrowLeft />
        </Button>

        <div className="absolute left-1/2 transform -translate-x-1/2">
          <Logo />
        </div>

        <div className="w-10" /> {/* Spacer to balance the back button */}
      </motion.nav>

      <main className="flex flex-col items-center justify-center h-full">
        <motion.div
          variants={fadeDown}
          className="bg-primary-foreground rounded-3xl shadow-lg overflow-hidden max-w-[400px] w-full"
        >
          {mode === 'checklist' && <PreAssessmentProgressBar />}

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
