"use client";

import React, { Suspense } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Logo from "@/components/Logo";
import { fadeDown } from "@/lib/animations";
import { PreAssessmentSignUp } from "@/components/pre-assessment/forms/PreAssessmentSignUp";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

function SignUpSkipAssessmentContent() {
  const router = useRouter();

  return (
    <div className="bg-gradient-to-b from-tertiary to-transparent w-full min-h-screen flex flex-col items-center justify-center p-4">
      <motion.nav
        variants={fadeDown}
        initial="hidden"
        animate="visible"
        className="absolute top-4 left-4 flex items-center gap-4"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/auth/sign-in")}
          className="rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Logo />
      </motion.nav>

      <motion.div
        variants={fadeDown}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md bg-white rounded-3xl shadow-lg overflow-hidden"
      >
        <PreAssessmentSignUp
          onSuccess={() => {
            router.push("/auth/sign-in");
          }}
        />
      </motion.div>
    </div>
  );
}

export default function SignUpSkipAssessmentPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <SignUpSkipAssessmentContent />
    </Suspense>
  );
}

