"use client";

import { Suspense } from "react";
import VerifyAccount from "@/components/auth/VerifyAccount";

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';

export default function VerifyAccountPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <VerifyAccount />
    </Suspense>
  );
}
