"use client";

import React, { useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import ChatbotInterface from "@/components/pre-assessment/ChatbotInterface";
import PreAssessmentInitialCheckList from "@/components/pre-assessment/forms/ChecklistForm";
import ModeSelectionForm from "@/components/pre-assessment/forms/ModeSelectionForm";
import QuestionnaireForm from "@/components/pre-assessment/forms/QuestionnaireForm";
import SnapshotForm from "@/components/pre-assessment/forms/SnapshotForm";
import { usePreAssessment } from "@/hooks/pre-assessment/usePreAssessment";

type AssessmentMode = 'selection' | 'checklist' | 'chatbot';

function AssessmentPageContent() {
  const router = useRouter();
  const [mode, setMode] = useState<AssessmentMode>('selection');
  const { step, handleNextButtonOnClick } = usePreAssessment();

  const handleBack = () => {
    if (mode === 'selection') {
      router.push("/client");
    } else {
      setMode('selection');
    }
  };

  const getTitle = () => {
    if (mode === 'selection') return "Assessment Selection";
    if (mode === 'checklist') return "Structured Assessment";
    return "Clinical Assessment";
  };

  const renderContent = () => {
    if (mode === 'selection') {
      return (
        <div className="flex-1 overflow-y-auto pb-8">
          <div className="max-w-3xl mx-auto w-full pt-8">
            <ModeSelectionForm onSelectMode={(m) => setMode(m)} />
          </div>
        </div>
      );
    }

    if (mode === 'chatbot') {
      return (
        <ChatbotInterface
          onComplete={() => router.push("/client/therapist")}
          onCancel={() => setMode('selection')}
          hideHeader={true}
        />
      );
    }

    // Checklist Mode
    if (step === 0) {
      return (
        <div className="flex-1 overflow-y-auto pb-8">
          <div className="max-w-3xl mx-auto w-full pt-8">
            <PreAssessmentInitialCheckList
              handleNextButtonOnClick={handleNextButtonOnClick}
            />
          </div>
        </div>
      );
    } else if (step === 1) {
      return (
        <div className="flex-1 overflow-y-auto pb-8">
          <div className="max-w-3xl mx-auto w-full pt-8">
            <QuestionnaireForm handleNextButtonOnClick={handleNextButtonOnClick} />
          </div>
        </div>
      );
    } else if (step === 2) {
      return (
        <div className="flex-1 overflow-y-auto pb-8">
          <div className="max-w-3xl mx-auto w-full pt-8 px-4">
            <SnapshotForm />
            <div className="mt-8 flex justify-center pb-12">
              <Button
                onClick={() => router.push("/client/therapist")}
                size="lg"
                className="w-full max-w-md font-bold"
              >
                Find My Therapist
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="bg-white h-[calc(100vh-64px)] w-full flex flex-col overflow-hidden">
      {/* Integrated Navigation */}
      <nav className="flex items-center justify-between p-4 px-6 border-b border-gray-200 bg-white shrink-0">
        <div className="flex items-center gap-4">
          <Button
            onClick={handleBack}
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </Button>
          <div className="flex flex-col">
            <h1 className="text-sm font-bold tracking-tight text-gray-900">
              {getTitle()}
            </h1>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">AURIS AI Active</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 w-full overflow-hidden flex flex-col">
        {renderContent()}
      </main>
    </div>
  );
}

export default function AssessmentPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-gray-600">Loading assessment...</div>
      </div>
    }>
      <AssessmentPageContent />
    </Suspense>
  );
}
