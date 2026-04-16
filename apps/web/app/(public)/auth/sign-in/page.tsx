"use client";

import { Suspense } from "react";
import { motion } from "framer-motion";
import { UnifiedSignIn } from "@/components/auth/UnifiedSignIn";
import { fadeDown } from "@/lib/animations";

// Force dynamic rendering to avoid static generation issues with useSearchParams
export const dynamic = 'force-dynamic';

function SignInContent() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen w-full bg-gradient-to-br from-background via-tertiary/5 to-background p-4 sm:p-6 lg:p-8">
      <motion.div
        variants={fadeDown}
        initial="initial"
        animate="animate"
        className="w-full max-w-md"
      >
        <UnifiedSignIn />
      </motion.div>
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen" aria-live="polite" aria-busy="true">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" aria-label="Loading sign in page"></div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}
