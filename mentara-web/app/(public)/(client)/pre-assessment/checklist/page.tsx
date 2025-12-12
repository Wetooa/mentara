"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';
export const runtime = 'edge';

const PreAssessmentPageContent = dynamic(
  () => import("@/components/pre-assessment/PreAssessmentPage"),
  { 
    ssr: false,
    loading: () => <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }
);

export default function ChecklistPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <PreAssessmentPageContent />
    </Suspense>
  );
}
