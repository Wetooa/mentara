"use client";

import React, { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import ChatbotInterface from "@/components/pre-assessment/ChatbotInterface";
import PreAssessmentInitialCheckList from "@/components/pre-assessment/forms/ChecklistForm";
import { usePreAssessment } from "@/hooks/pre-assessment/usePreAssessment";

function AssessmentPageContent() {
  const router = useRouter();
  const { step, handleNextButtonOnClick } = usePreAssessment();

  return (
    <div className="bg-white h-[calc(100vh-64px)] w-full flex flex-col overflow-hidden">
      {/* Integrated Navigation */}
      <nav className="flex items-center justify-between p-4 px-6 border-b border-gray-200 bg-white shrink-0">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => router.push("/client")}
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </Button>
          <div className="flex flex-col">
            <h1 className="text-sm font-bold tracking-tight text-gray-900">
              {step === 0 ? "Initial Checklist" : "Clinical Assessment"}
            </h1>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">AURIS AI Active</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content - Checklist then Full Screen Chat */}
      <main className="flex-1 w-full overflow-hidden flex flex-col">
        {step === 0 ? (
          <div className="flex-1 overflow-y-auto pb-8">
            <div className="max-w-3xl mx-auto w-full pt-8">
              <PreAssessmentInitialCheckList
                handleNextButtonOnClick={handleNextButtonOnClick}
              />
            </div>
          </div>
        ) : (
          <ChatbotInterface
            onComplete={() => router.push("/client/therapist")}
            onCancel={() => router.push("/client")}
            hideHeader={true}
          />
        )}
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
