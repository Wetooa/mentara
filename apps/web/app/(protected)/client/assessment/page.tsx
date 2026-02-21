"use client";

import React, { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import PreAssessmentPageContent from "@/components/pre-assessment/PreAssessmentPage";

function AssessmentPageContent() {
  const router = useRouter();

  return (
    <div className="bg-white min-h-screen w-full">
      {/* Clean Navigation */}
      <nav className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
        <Button
          onClick={() => router.push("/client")}
          variant="ghost"
          size="icon"
          className="rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-700" />
        </Button>

        <div className="flex-1 flex justify-center">
          <h1 className="text-lg font-semibold text-gray-900">Assessment</h1>
        </div>

        <div className="w-10" /> {/* Spacer to balance */}
      </nav>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] py-4 px-4 sm:px-6">
        <div className="w-full max-w-4xl">
          <PreAssessmentPageContent />
        </div>
      </main>
    </div>
  );
}

export default function AssessmentPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-gray-600">Loading...</div>
      </div>
    }>
      <AssessmentPageContent />
    </Suspense>
  );
}

