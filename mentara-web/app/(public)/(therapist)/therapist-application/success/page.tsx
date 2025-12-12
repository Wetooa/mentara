"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

// Force dynamic rendering to prevent prerender errors
export const dynamic = 'force-dynamic';
export const runtime = 'edge';

// Dynamically import the client component with no SSR
const ApplicationSuccessContent = dynamic(
  () => import("./ApplicationSuccessContent"),
  { 
    ssr: false,
    loading: () => <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }
);

export default function ApplicationSuccessPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <ApplicationSuccessContent />
    </Suspense>
  );
}
