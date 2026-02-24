"use client";

import React, { useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import ChatbotInterface from "@/components/pre-assessment/ChatbotInterface";
import PreAssessmentInitialCheckList from "@/components/pre-assessment/forms/ChecklistForm";
import ModeSelectionForm from "@/components/pre-assessment/forms/ModeSelectionForm";
import QuestionnaireForm from "@/components/pre-assessment/forms/QuestionnaireForm";
import { usePreAssessment } from "@/hooks/pre-assessment/usePreAssessment";
import { useCreatePreAssessment } from "@/hooks/pre-assessment/usePreAssessmentData";
import { usePreAssessmentChecklistStore } from "@/store/pre-assessment";
import { calculateDetailedResults } from "@/lib/assessment-scoring";
import { Loader2, Sparkles } from "lucide-react";

type AssessmentMode = 'selection' | 'checklist' | 'chatbot';

function AssessmentPageContent() {
  const router = useRouter();
  const [mode, setMode] = useState<AssessmentMode>('selection');
  const { step, handleNextButtonOnClick } = usePreAssessment();
  const { mutateAsync: saveAssessment } = useCreatePreAssessment();
  const { questionnaires, flatAnswers, rapportAnswers } = usePreAssessmentChecklistStore();
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  // Auto-save and redirect when reaching step 2 (Snapshot stage)
  React.useEffect(() => {
    if (mode === 'checklist' && step === 2 && !isAutoSaving) {
      const performAutoSave = async () => {
        setIsAutoSaving(true);
        try {
          const seed = rapportAnswers.join(",");
          const results = calculateDetailedResults(questionnaires, flatAnswers, seed);
          
          const questionnaireScores: Record<string, { score: number; severity: string }> = {};
          results.forEach(result => {
            questionnaireScores[result.name] = {
              score: result.score,
              severity: result.severity,
            };
          });

          await saveAssessment({
            method: 'CHECKLIST',
            completedAt: new Date().toISOString(),
            data: { questionnaireScores },
            pastTherapyExperiences: null,
            medicationHistory: null,
            accessibilityNeeds: null,
            assessmentId: null,
          });

          router.push("/client/results");
        } catch (error) {
          console.error("Failed to auto-save assessment:", error);
          // If save fails, we still want to let them see results or retry
          // For now, redirecting anyway as results might be in state or they can refresh
          router.push("/client/results");
        }
      };

      performAutoSave();
    }
  }, [mode, step, isAutoSaving, questionnaires, flatAnswers, rapportAnswers, saveAssessment, router]);

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
          onComplete={() => {
            router.push("/client/results");
          }}
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
                  <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 p-8 animate-in fade-in duration-500">
                      <div className="p-4 rounded-full bg-primary/10 ring-8 ring-primary/5">
                          <Loader2 className="h-8 w-8 text-primary animate-spin" />
                      </div>
                      <div className="text-center space-y-2">
                          <h2 className="text-2xl font-bold text-gray-900">Finalizing Your Results</h2>
                          <p className="text-gray-500 max-w-xs mx-auto">
                              Please wait while we securely save your assessment data and prepare your profile.
                          </p>
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
