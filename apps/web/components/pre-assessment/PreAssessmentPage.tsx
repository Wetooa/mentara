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
import { useRouter } from "next/navigation";

function PreAssessmentPageContentInner() {
  const [mounted, setMounted] = useState(false);

  // Use window.location instead of usePathname to avoid SSR issues
  const getInitialMode = (): 'selection' | 'checklist' | 'chatbot' => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      if (pathname.includes('/checklist')) return 'checklist';
      if (pathname.includes('/chat')) return 'chatbot';
    }
    return 'selection';
  };

  const [mode, setMode] = useState<'selection' | 'checklist' | 'chatbot' | 'registration'>(getInitialMode());
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    step,
    animationControls,
    handleNextButtonOnClick,
  } = usePreAssessment();

  const handleModeSelection = (selectedMode: 'checklist' | 'chatbot') => {
    setMode(selectedMode);
  };

  const handleChatbotComplete = () => {
    router.push('/client/results');
  };

  const handleChatbotCancel = () => {
    setMode('selection');
  };

  const getCurrentForm = () => {
    if (mode === 'selection') {
      return <ModeSelectionForm onSelectMode={handleModeSelection} />;
    }

    if (mode === 'chatbot') {
      return (
        <ChatbotInterface
          onComplete={handleChatbotComplete}
          onCancel={handleChatbotCancel}
        />
      );
    }

    if (mode === 'registration') {
      return <PreAssessmentSignUp />;
    }

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
      return <SnapshotForm onComplete={() => router.push('/client/results')} />;
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
    <div className="w-full h-full">
      {mode === 'chatbot' ? (
        <div className="w-full h-full flex flex-col">
          {getCurrentForm()}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xl w-full max-w-4xl mx-auto overflow-visible mt-8 p-1">
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
