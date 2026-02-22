"use client";

import React, { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import PreAssessmentInitialCheckList from "@/components/pre-assessment/forms/ChecklistForm";
import QuestionnaireForm from "@/components/pre-assessment/forms/QuestionnaireForm";
import PreAssessmentSignUp from "@/components/pre-assessment/forms/PreAssessmentSignUp";
import SnapshotForm from "@/components/pre-assessment/forms/SnapshotForm";
import VerifyAccount from "@/components/auth/VerifyAccount";
import PreAssessmentProgressBar from "@/components/pre-assessment/ProgressBar";
import ModeSelectionForm from "@/components/pre-assessment/forms/ModeSelectionForm";
import ChatbotInterface from "@/components/pre-assessment/ChatbotInterface";
import { fadeDown } from "@/lib/animations";
import { usePreAssessment } from "@/hooks/pre-assessment/usePreAssessment";
import { usePreAssessmentChecklistStore } from "@/store/pre-assessment";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

function PreAssessmentPageContentInner() {
  const [mounted, setMounted] = useState(false);

  // Use window.location instead of usePathname to avoid SSR issues
  const getInitialMode = (): 'selection' | 'checklist' => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      if (pathname.includes('/checklist')) return 'checklist';
    }
    return 'selection';
  };

  const [mode, setMode] = useState<'selection' | 'checklist' | 'chatbot' | 'registration'>('selection');
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    // Set mode only after mount
    if (typeof window !== 'undefined') {
      setMode(getInitialMode());
    }
  }, []);
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

  const handleChatbotComplete = () => {
    // After chatbot assessment is complete, redirect to therapist page or dashboard
    router.push('/client/therapist');
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

    // Registration mode (after checklist completion)
    if (mode === 'registration') {
      return <PreAssessmentSignUp />;
    }

    // Checklist mode - routing based on new unified step logic
    if (step === 0) {
      return (
        <PreAssessmentInitialCheckList
          handleNextButtonOnClick={handleNextButtonOnClick}
        />
      );
    } else if (step === 1) {
      return (
        <QuestionnaireForm handleNextButtonOnClick={handleNextButtonOnClick} />
      );
    } else if (step === 2) {
      return <SnapshotForm />;
    } else if (step === 3) {
      return <PreAssessmentSignUp />;
    } else {
      return <VerifyAccount />;
    }
  };

  if (!mounted) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="w-full">
      {mode === 'chatbot' ? (
        // Chatbot takes full width and doesn't need the card wrapper
        <div className="w-full h-full">
          {getCurrentForm()}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg w-full mx-auto overflow-visible">
          {mode === 'checklist' && <PreAssessmentProgressBar />}

          <div className="w-full">
            <motion.div animate={animationControls} variants={fadeDown}>
              {getCurrentForm()}
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}

function PreAssessmentPageContent() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <PreAssessmentPageContentInner />
    </Suspense>
  );
}

export { PreAssessmentPageContent as default };
