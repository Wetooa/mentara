"use client";

import dynamic from "next/dynamic";

// Dynamically import the client component with no SSR
const ErrorPageContent = dynamic(
  () => import("./ErrorPageContent"),
  { 
    ssr: false,
    loading: () => <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }
);

export default function ApplicationErrorPage() {
  return <ErrorPageContent />;
}
