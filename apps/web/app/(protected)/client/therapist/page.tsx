"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useHasPreAssessment } from "@/hooks/pre-assessment/usePreAssessmentData";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ClipboardList, ArrowRight, Sparkles } from "lucide-react";
import { scaleIn } from "@/lib/animations";

// Lazy load heavy therapist dashboard component
const TherapistDashboard = dynamic(() => import("@/components/therapist/dashboard/TherapistDashboard").then(mod => ({ default: mod.default })), {
  ssr: false,
  loading: () => (
    <div className="space-y-6 p-6">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
});

function AssessmentRequiredView() {
  const router = useRouter();

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center p-4 bg-gradient-to-b from-tertiary/10 to-transparent">
      <motion.div
        variants={scaleIn}
        initial="initial"
        animate="animate"
        className="max-w-md w-full text-center space-y-8 p-8 border-2 border-primary/10 rounded-3xl bg-white/50 backdrop-blur-sm shadow-xl"
      >
        <div className="flex justify-center">
          <motion.div 
            initial={{ rotate: -10, scale: 0.9 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ 
              type: "spring",
              stiffness: 260,
              damping: 20
            }}
            className="p-6 bg-primary/10 rounded-2xl relative"
          >
            <ClipboardList className="h-16 w-16 text-primary" />
            <Sparkles className="h-6 w-6 text-primary absolute -top-2 -right-2 animate-pulse" />
          </motion.div>
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Complete Your Assessment
          </h1>
          <p className="text-gray-600 leading-relaxed">
            To match you with the most suitable therapist, we first need to understand your needs through a personalized assessment.
          </p>
        </div>

        <div className="space-y-3">
          <Button 
            onClick={() => router.push("/client/assessment")}
            className="w-full text-lg h-14 rounded-2xl shadow-lg shadow-primary/20 group"
            size="lg"
          >
            Start Assessment
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        <div className="pt-6 border-t border-gray-100 grid grid-cols-2 gap-4 text-left">
          <div className="space-y-1">
            <p className="text-xs font-bold text-primary uppercase tracking-wider">Expert Matching</p>
            <p className="text-[11px] text-gray-500">Found the right fit for your unique situation</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-primary uppercase tracking-wider">Clinical Insight</p>
            <p className="text-[11px] text-gray-500">Helping therapists understand you better from day one</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function TherapistPage() {
  const { hasAssessment, isLoading } = useHasPreAssessment();

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center p-4 bg-gradient-to-b from-tertiary/10 to-transparent">
        <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-500">
          <div className="relative">
            <div className="h-16 w-16 rounded-2xl border-4 border-primary/20 border-t-primary animate-spin" />
            <Sparkles className="h-6 w-6 text-primary absolute -top-2 -right-2 animate-pulse" />
          </div>
          <p className="text-sm font-medium text-gray-500 animate-pulse">
            Checking your assessment status...
          </p>
        </div>
      </div>
    );
  }

  if (!hasAssessment) {
    return <AssessmentRequiredView />;
  }

  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center p-4">
        <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      </div>
    }>
      <main>
        <TherapistDashboard />
      </main>
    </Suspense>
  );
}