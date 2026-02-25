"use client";

import React, { Suspense } from "react";
import DemoPageContent from "./DemoPageContent";

export default function DemoPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          Loading...
        </div>
      }
    >
      <DemoPageContent />
    </Suspense>
  );
}
