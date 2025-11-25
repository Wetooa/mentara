"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";

// Force dynamic rendering to avoid static generation issues with useSearchParams
export const dynamic = 'force-dynamic';

const VerifyAccount = dynamic(
  () => import("@/components/auth/VerifyAccount"),
  {
    ssr: false,
    loading: () => <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }
);

export default function VerifyAccountPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <VerifyAccount />
    </Suspense>
  );
}
