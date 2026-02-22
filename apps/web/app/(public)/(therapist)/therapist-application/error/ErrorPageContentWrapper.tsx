"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";

const ErrorPageContent = dynamic(
  () => import("./ErrorPageContent"),
  { 
    ssr: false,
    loading: () => <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }
);

export default function ErrorPageContentWrapper() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <ErrorPageContent />
    </Suspense>
  );
}

