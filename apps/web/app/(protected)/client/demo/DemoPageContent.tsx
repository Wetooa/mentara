"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardList,
  MessageSquare,
  ArrowRight,
  Sparkles,
  Users,
  RefreshCcw,
  Lock,
  Brain,
  AlertTriangle,
  Activity,
  ShieldCheck,
  FileText,
  Download,
} from "lucide-react";

import { calculateDetailedResults } from "@/lib/assessment-scoring";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import Logo from "@/components/Logo";
import PreAssessmentInitialCheckList from "@/components/pre-assessment/forms/ChecklistForm";
import QuestionnaireForm from "@/components/pre-assessment/forms/QuestionnaireForm";
import { usePreAssessment } from "@/hooks/pre-assessment/usePreAssessment";
import PreAssessmentProgressBar from "@/components/pre-assessment/ProgressBar";
import { usePreAssessmentChecklistStore } from "@/store/pre-assessment";
import { useWelcomeRecommendations, useCarouselRecommendations } from "@/hooks/therapist/useRecommendedTherapists";
import RecommendedSection from "@/components/therapist/listing/RecommendedSection";
import type { RecommendedCommunityDto } from "api-client";

import { useAuth } from "@/contexts/AuthContext";
import ChatbotInterface from "@/components/pre-assessment/ChatbotInterface";
import Link from "next/link";
import { useCreatePreAssessment, useHasPreAssessment } from "@/hooks/pre-assessment/usePreAssessmentData";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { toast } from "sonner";

// ─── Types ─────────────────────────────────────────────────────────────────────
type DemoStep = "choice" | "checklist" | "chatbot" | "results";

const fadeSlide = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2 } },
};

// Maps raw questionnaire keys / scores back to a human-readable condition label.
// Mirrors the backend questionnairePatterns in recommendations.service.ts.
const QUESTIONNAIRE_PATTERNS: { pattern: RegExp; condition: string }[] = [
  { pattern: /GAD7|anxiety/i, condition: 'anxiety' },
  { pattern: /PHQ9|PHQ-9|depression/i, condition: 'depression' },
  { pattern: /ISI|insomnia/i, condition: 'insomnia' },
  { pattern: /ASRS|adhd/i, condition: 'adhd' },
  { pattern: /AUDIT|alcohol/i, condition: 'alcohol' },
  { pattern: /DAST10|drug-abuse/i, condition: 'drug_abuse' },
  { pattern: /PCL-5|ptsd/i, condition: 'ptsd' },
  { pattern: /MDQ|mood-disorder|bipolar/i, condition: 'bipolar' },
  { pattern: /EDEQ|binge-eating|eating-disorder/i, condition: 'eating_disorder' },
  { pattern: /burnout/i, condition: 'burnout' },
  { pattern: /obsessional-compulsive|ocd/i, condition: 'ocd' },
  { pattern: /panic-disorder|panic/i, condition: 'panic' },
  { pattern: /stress/i, condition: 'stress' },
  { pattern: /social-phobia|social-anxiety/i, condition: 'social_anxiety' },
  { pattern: /phobia/i, condition: 'phobia' },
];

/** Converts a raw questionnaire key (e.g. 'GAD7', 'drug_abuse') to a Title Case label. */
function prettifyCondition(raw: string): string {
  const match = QUESTIONNAIRE_PATTERNS.find(({ pattern }) => pattern.test(raw));
  const condition = match ? match.condition : raw;
  // Replace underscores/hyphens with spaces, then Title Case each word
  return condition
    .replace(/[_-]/g, ' ')
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}



// ─── Community Card ─────────────────────────────────────────────────────────────
function DemoCommunityCard({
  community,
  rank,
}: {
  community: RecommendedCommunityDto;
  rank: number;
}) {
  const gradients = [
    "from-violet-500 to-indigo-500",
    "from-emerald-500 to-teal-500",
    "from-orange-500 to-amber-500",
  ];
  const gradient = gradients[(community.name.length % gradients.length)];

  return (
    <Card className="group h-full flex flex-col hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/30 overflow-hidden">
      <div className={cn("h-1.5 w-full bg-gradient-to-r", gradient)} />

      <CardHeader className="pt-5 pb-3 space-y-3">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-sm",
              gradient
            )}
          >
            {community.name[0]}
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-base text-gray-900 group-hover:text-primary transition-colors truncate">
                {community.name}
              </h3>
              <Badge className="bg-primary text-primary-foreground text-[10px] py-0 px-2 shrink-0">
                #{rank} Pick
              </Badge>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <Sparkles className="h-3 w-3 text-primary" />
              <span className="text-xs font-bold text-primary">
                {community.matchScore}% match
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-3 pt-0">
        <p className="text-sm text-gray-600 line-clamp-2">{community.description}</p>

        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Users className="h-3.5 w-3.5" />
          <span>{community.memberCount?.toLocaleString() ?? "—"} members</span>
        </div>

        {community.matchReasons && community.matchReasons.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Why this community?
            </p>
            <div className="flex flex-wrap gap-1">
              {community.matchReasons.slice(0, 2).map((reason, idx) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className="bg-primary/5 text-primary border-primary/10 text-[10px] py-0.5 px-2"
                >
                  {reason}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-2 pb-5">
        <Button
          variant="outline"
          className="w-full font-semibold gap-2 group-hover:border-primary group-hover:text-primary transition-colors"
        >
          Explore Community
        </Button>
      </CardFooter>
    </Card>
  );
}

// ─── Step 1: Choice ─────────────────────────────────────────────────────────────
function ChoiceStep({
  onSelect,
  isAuthenticated,
}: {
  onSelect: (choice: "checklist" | "chatbot" | "skip") => void;
  isAuthenticated: boolean;
}) {
  return (
    <motion.div
      variants={fadeSlide}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="w-full max-w-4xl space-y-8"
    >
      <header className="text-center space-y-3">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold text-gray-900">Try Mentara</h1>
        </div>
        <p className="text-gray-600 max-w-xl mx-auto">
          Choose an assessment method and we&apos;ll instantly show you your best-matched
          therapists and communities — no account needed for the checklist.
        </p>
      </header>

      <div className="grid sm:grid-cols-2 gap-6 items-stretch">
        {/* ── Checklist ── */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="h-full">
          <Card
            className="h-full border-2 border-primary/20 hover:border-primary transition-all cursor-pointer group hover:shadow-2xl bg-white/70 backdrop-blur-sm relative overflow-hidden"
            onClick={() => onSelect("checklist")}
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-violet-500" />
            <div className="absolute top-3 right-3">
              <Badge className="bg-primary text-white text-xs">No login needed</Badge>
            </div>
            <CardHeader className="pt-7 space-y-3">
              <div className="p-3 bg-primary/10 rounded-2xl w-fit group-hover:bg-primary/20 transition-colors">
                <ClipboardList className="h-9 w-9 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold">Quick Checklist</CardTitle>
                <CardDescription className="mt-1.5">
                  5 simple questions about how you&apos;ve been feeling. Takes under 2 minutes.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm text-gray-600">
                {[
                  "5 curated questions",
                  "AI-powered matching",
                  "Instant results",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button
                className="w-full shadow-lg shadow-primary/20 font-semibold"
                size="lg"
              >
                Start Checklist
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Chatbot (AURIS) ── */}
        <motion.div
          whileHover={isAuthenticated ? { scale: 1.02 } : {}}
          whileTap={isAuthenticated ? { scale: 0.98 } : {}}
          className="h-full"
        >
          <Card
            className={cn(
              "h-full border-2 transition-all relative overflow-hidden",
              isAuthenticated
                ? "hover:border-primary/50 cursor-pointer group hover:shadow-xl bg-white/70 backdrop-blur-sm"
                : "bg-gray-50/80 border-gray-200 cursor-not-allowed"
            )}
            onClick={() => isAuthenticated && onSelect("chatbot")}
          >
            {/* Lock overlay for unauthenticated */}
            {!isAuthenticated && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-gray-900/5 backdrop-blur-[1px] p-6 text-center">
                <div className="bg-white/90 p-3 rounded-full shadow-lg mb-3">
                  <Lock className="h-6 w-6 text-gray-500" />
                </div>
                <p className="text-sm font-semibold text-gray-900 bg-white/80 px-3 py-1 rounded-full shadow-sm border border-gray-200 mb-2">
                  Login required
                </p>
                <Link
                  href="/auth/sign-in?callbackUrl=/client/demo"
                  className="text-xs text-primary underline font-medium"
                  onClick={(e) => e.stopPropagation()}
                >
                  Sign in to unlock AURIS
                </Link>
              </div>
            )}

            <CardHeader className="pt-7 space-y-3">
              <div className="flex items-center justify-between">
                <div
                  className={cn(
                    "p-3 rounded-2xl w-fit transition-colors",
                    isAuthenticated
                      ? "bg-primary/10 group-hover:bg-primary/20"
                      : "bg-gray-200"
                  )}
                >
                  <MessageSquare
                    className={cn(
                      "h-9 w-9",
                      isAuthenticated ? "text-primary" : "text-gray-400"
                    )}
                  />
                </div>
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-xs",
                    isAuthenticated
                      ? "bg-primary/10 text-primary border-primary/30"
                      : "bg-gray-200 text-gray-500"
                  )}
                >
                  AURIS AI
                </Badge>
              </div>
              <div>
                <CardTitle className="text-xl font-bold">AI Chatbot Assessment</CardTitle>
                <CardDescription className="mt-1.5">
                  Chat naturally with AURIS, our AI assistant. Deeply personalized and more
                  accurate than a checklist.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm text-gray-500">
                {[
                  "Natural conversation flow",
                  "Deeply personalized & accurate",
                  "Takes about 15–30 minutes",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5">
                    <div
                      className={cn(
                        "w-1.5 h-1.5 rounded-full shrink-0",
                        isAuthenticated ? "bg-primary" : "bg-gray-300"
                      )}
                    />
                    {item}
                  </li>
                ))}
              </ul>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  if (isAuthenticated) onSelect("chatbot");
                }}
                variant={isAuthenticated ? "default" : "outline"}
                className={cn(
                  "w-full font-semibold",
                  isAuthenticated
                    ? "shadow-lg shadow-primary/10"
                    : "border-gray-300 text-gray-400"
                )}
                size="lg"
                disabled={!isAuthenticated}
              >
                {isAuthenticated ? "Start Chat Assessment" : "Login to Access"}
                {isAuthenticated && (
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Skip option */}
      <div className="flex justify-center">
        <button
          onClick={() => onSelect("skip")}
          className="text-sm text-gray-500 hover:text-primary underline-offset-4 hover:underline transition-colors"
        >
          Skip assessment — just show me general recommendations →
        </button>
      </div>
    </motion.div>
  );
}

// ─── Step 2a: Checklist (full rapport + questionnaire) ──────────────────────────
function ChecklistStep({ onComplete }: { onComplete: () => void }) {
  const { step, handleNextButtonOnClick } = usePreAssessment();
  const { questionnaires, flatAnswers, rapportAnswers } = usePreAssessmentChecklistStore();
  const { mutateAsync: createPreAssessment } = useCreatePreAssessment();
  const [isSaving, setIsSaving] = React.useState(false);

  // When the store reaches step 2, save and move to results
  React.useEffect(() => {
    if (step === 2 && !isSaving) {
      const save = async () => {
        setIsSaving(true);
        try {
          const seed = rapportAnswers.join(",");
          const detailedResults = calculateDetailedResults(questionnaires, flatAnswers, seed);
          const questionnaireScores: Record<string, { score: number; severity: string }> = {};
          detailedResults.forEach((result) => {
            questionnaireScores[result.name] = { score: result.score, severity: result.severity };
          });
          await createPreAssessment({
            data: {
              assessmentId: null,
              method: "CHECKLIST",
              completedAt: new Date().toISOString(),
              data: { questionnaireScores },
              pastTherapyExperiences: null,
              medicationHistory: null,
              accessibilityNeeds: null,
            },
          });
        } catch (e) {
          console.error("Failed to save pre-assessment", e);
        } finally {
          onComplete();
        }
      };
      save();
    }
  }, [step, isSaving, rapportAnswers, questionnaires, flatAnswers, createPreAssessment, onComplete]);

  if (step === 2 || isSaving) {
    return (
      <motion.div
        variants={fadeSlide}
        initial="hidden"
        animate="visible"
        className="w-full max-w-2xl"
      >
        <Card className="bg-white/80 backdrop-blur-sm border-2 border-gray-100 shadow-xl">
          <CardContent className="pt-16 pb-16 flex flex-col items-center gap-5">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
            >
              <Sparkles className="h-8 w-8 text-primary" />
            </motion.div>
            <div className="text-center space-y-1.5">
              <h2 className="text-xl font-bold text-gray-900">Analyzing your responses…</h2>
              <p className="text-sm text-gray-500">Finding your best matches</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={fadeSlide}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="w-full max-w-2xl"
    >
      <Card className="w-full bg-white rounded-2xl border border-gray-200 shadow-xl overflow-visible">
        {step === 0 ? (
          <>
            <PreAssessmentProgressBar />
            <PreAssessmentInitialCheckList
              handleNextButtonOnClick={handleNextButtonOnClick}
            />
          </>
        ) : (
          <>
            <PreAssessmentProgressBar />
            <QuestionnaireForm handleNextButtonOnClick={handleNextButtonOnClick} />
          </>
        )}
      </Card>
    </motion.div>
  );
}

// ─── Step 2b: Chatbot ───────────────────────────────────────────────────────────
function ChatbotStep({
  onComplete,
  onCancel,
}: {
  onComplete: () => void;
  onCancel: () => void;
}) {
  return (
    <motion.div
      variants={fadeSlide}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="flex-1 flex flex-col min-h-0 w-full"
    >
      <ChatbotInterface
        onComplete={onComplete}
        onCancel={onCancel}
      />
    </motion.div>
  );
}

// ─── Severity helpers (mirror ChatbotSnapshotForm) ───────────────────────────────
function getSeverityMeta(severity: string) {
  const s = severity.toLowerCase();
  if (s.includes("severe") || s.includes("high") || s.includes("significant") || s.includes("likely")) {
    return {
      cardColor: "bg-rose-50 border-rose-100",
      badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
      icon: <AlertTriangle className="h-4 w-4 text-rose-500" />,
    };
  }
  if (s.includes("moderate") || s.includes("mild")) {
    return {
      cardColor: "bg-amber-50 border-amber-100",
      badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
      icon: <Activity className="h-4 w-4 text-amber-500" />,
    };
  }
  return {
    cardColor: "bg-emerald-50 border-emerald-100",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: <ShieldCheck className="h-4 w-4 text-emerald-500" />,
  };
}

// ─── Step 3: Results ─────────────────────────────────────────────────────────────
function ResultsStep({ onReset }: { onReset: () => void }) {
  const { communities, isLoading: isLoadingCommunities } = useWelcomeRecommendations();
  const { therapists, isLoading: isLoadingTherapists } = useCarouselRecommendations();
  const { assessment } = useHasPreAssessment();
  const top3Communities = useMemo(() => communities.slice(0, 3), [communities]);
  const [isDownloadingSummary, setIsDownloadingSummary] = useState(false);
  const [isDownloadingHistory, setIsDownloadingHistory] = useState(false);


  const downloadPdf = (type: 'summary' | 'history') => {
    const documents = assessment?.data?.documents;
    if (!documents) return;
    
    const setDownloading = type === 'summary' ? setIsDownloadingSummary : setIsDownloadingHistory;
    
    setDownloading(true);
    try {
      const endpoint = type === 'summary' ? documents.soapAnalysisUrl : documents.conversationHistoryUrl;
      
      if (!endpoint) {
        toast.error(`The ${type === 'summary' ? 'Clinical Summary' : 'Chat History'} is not available yet.`);
        return;
      }

      // Prepend the API URL
      const baseUrl = process.env.NEXT_PUBLIC_FLASk_URL || 'http://localhost:5000';
      // Ensure we don't double slash if endpoint has a leading slash
      const url = `${baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

      window.open(url, '_blank', 'noopener,noreferrer');
      toast.success(`Opening ${type === 'summary' ? 'Clinical Summary' : 'Chat History'}...`);
    } catch (error) {
      console.error(`Failed to open PDF (${type}):`, error);
      toast.error(`Failed to open ${type === 'summary' ? 'Clinical Summary' : 'Chat History'}.`);
    } finally {
      setDownloading(false);
    }
  };

  const snapshotResults = useMemo(() => {
    if (!assessment?.data?.questionnaireScores) return [];

    return Object.entries(assessment.data.questionnaireScores).map(([name, data]) => ({
      name: prettifyCondition(name),
      score: data.score,
      severity: data.severity,
    }));
  }, [assessment]);

  const isLoading = isLoadingTherapists || isLoadingCommunities;

  return (
    <motion.div
      variants={fadeSlide}
      initial="hidden"
      animate="visible"
      className="w-full max-w-6xl space-y-12"
    >
      {/* Header */}
      <div className="text-center space-y-3">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: "spring" }}
          className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full font-bold text-sm"
        >
          <Sparkles className="h-4 w-4" />
          Your Personalized Results
        </motion.div>
        <h1 className="text-3xl font-bold text-gray-900">
          We found your perfect matches!
        </h1>
        <p className="text-gray-600 max-w-xl mx-auto">
          Based on your responses, here are therapists and communities tailored just for
          you. Sign up for free to connect with them.
        </p>
      </div>

      {/* ── Snapshot section ── */}
      {snapshotResults.length > 0 && (
        <section className="space-y-5">
          <div className="space-y-0.5">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              AI Clinical Snapshot
            </h2>
            <p className="text-sm text-gray-500">
              The AI identified that you might be experiencing the following
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {snapshotResults.map((result, idx) => {
              const meta = getSeverityMeta(result.severity);
              // Some severities are composite, e.g. "Exhaustion: Moderate, Depersonalization: Mild"
              const severityParts = result.severity.split(",").map((s: string) => s.trim()).filter(Boolean);
              return (
                <motion.div
                  key={result.name}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                >
                  <Card className={`border shadow-sm rounded-2xl h-full ${meta.cardColor}`}>
                    <CardHeader className="py-4">
                      <CardTitle className="text-base font-bold text-gray-900 leading-tight flex items-center gap-2">
                        {meta.icon}
                        {result.name}
                      </CardTitle>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {severityParts.map((part: string, i: number) => (
                          <Badge
                            key={i}
                            variant="outline"
                            className={`${meta.badgeColor} font-semibold px-2.5 py-0.5 text-xs`}
                          >
                            {part}
                          </Badge>
                        ))}
                      </div>
                    </CardHeader>
                  </Card>
                </motion.div>
              );
            })}
          </div>
          <p className="text-xs text-gray-400 text-center">
            This is a preliminary screening only and not a clinical diagnosis. A licensed therapist will review these areas with you.
          </p>

          {/* AI PDF Reports (Only show if assessment was from Chatbot/AURIS and we have a sessionId) */}
          {assessment?.method === 'CHATBOT' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 pt-4 border-t flex flex-col sm:flex-row gap-3 justify-center items-center"
            >
              <Button 
                variant="outline" 
                className="w-full sm:w-auto gap-2 text-primary border-primary/20 hover:bg-primary/5"
                onClick={() => downloadPdf('summary')}
                disabled={isDownloadingSummary}
              >
                <FileText className="h-4 w-4" />
                Download Clinical Summary
                <Download className={`h-3.5 w-3.5 ml-1 opacity-70 ${isDownloadingSummary ? 'animate-bounce' : ''}`} />
              </Button>
              <Button 
                variant="outline" 
                className="w-full sm:w-auto gap-2 text-gray-600 hover:bg-gray-50"
                onClick={() => downloadPdf('history')}
                disabled={isDownloadingHistory}
              >
                <MessageSquare className="h-4 w-4" />
                Download Chat History
                <Download className={`h-3.5 w-3.5 ml-1 opacity-70 ${isDownloadingHistory ? 'animate-bounce' : ''}`} />
              </Button>
            </motion.div>
          )}
        </section>
      )}

      {/* Therapists — reuse the same RecommendedSection as client/therapist */}
      <section className="space-y-5 w-full">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-0.5">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Recommended Therapists
            </h2>
            <p className="text-sm text-gray-500">
              AI-matched based on your assessment responses
            </p>
          </div>
          {!isLoadingTherapists && therapists.length > 0 && (
            <div className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 text-primary px-3 py-1.5 rounded-full text-sm font-semibold">
              <Sparkles className="h-3.5 w-3.5" />
              {therapists.length} recommendation{therapists.length !== 1 ? "s" : ""} found
            </div>
          )}
        </div>
        <RecommendedSection />
      </section>

      {/* Communities */}
      <section className="space-y-5">
        <div className="space-y-0.5">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Top 3 Communities For You
          </h2>
          <p className="text-sm text-gray-500">
            Peer-support communities where you&apos;ll feel at home
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[320px] rounded-xl overflow-hidden border">
                <Skeleton className="h-full w-full" />
              </div>
            ))}
          </div>
        ) : top3Communities.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No community recommendations available at this moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {top3Communities.map((community, idx) => (
              <DemoCommunityCard
                key={community.id}
                community={community}
                rank={idx + 1}
              />
            ))}
          </div>
        )}
      </section>
    </motion.div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────
export default function DemoPageContent() {
  const [demoStep, setDemoStep] = useState<DemoStep>("choice");
  const { isAuthenticated } = useAuth();
  const { setRapportAnswer, calculateTopQuestionnaires } =
    usePreAssessmentChecklistStore();
  const queryClient = useQueryClient();

  const resetAssessment = () => {
    for (let i = 0; i < 5; i++) setRapportAnswer(i, -1);
    usePreAssessmentChecklistStore.setState({
      rapportStep: 0,
      step: 0,
      questionnaires: [],
      flatAnswers: [],
    });
    setDemoStep("choice");
  };

  const handleChoice = (choice: "checklist" | "chatbot" | "skip") => {
    if (choice === "skip") {
      calculateTopQuestionnaires();
      setDemoStep("results");
    } else {
      setDemoStep(choice);
    }
  };

  // Chatbot can also complete and show results
  const handleChatbotComplete = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.preAssessment.all });
    setDemoStep("results");
  };

  // Checklist complete — invalidate so ResultsStep sees the saved pre-assessment
  const handleChecklistComplete = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.preAssessment.all });
    setDemoStep("results");
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-tertiary/60 via-white to-transparent">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-3">
            {demoStep !== "choice" && (
              <Button
                variant="ghost"
                onClick={resetAssessment}
                size="sm"
                className="text-gray-500 gap-1.5"
              >
                <RefreshCcw className="h-3.5 w-3.5" />
                Start Over
              </Button>
            )}
            <Badge
              variant="outline"
              className="border-primary/30 text-primary font-semibold hidden sm:flex"
            >
              🎯 Demo Mode
            </Badge>
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className={demoStep === "chatbot" ? "flex-1 flex flex-col min-h-0 overflow-hidden" : "max-w-7xl mx-auto px-4 sm:px-6 py-10 flex flex-col items-center"}>
        <div className={demoStep === "chatbot" ? "flex-1 flex flex-col min-h-0" : "contents"}>
          <AnimatePresence mode="wait">
            {demoStep === "choice" && (
              <ChoiceStep
                key="choice"
                onSelect={handleChoice}
                isAuthenticated={isAuthenticated}
              />
            )}
            {demoStep === "checklist" && (
              <ChecklistStep
                key="checklist"
                onComplete={handleChecklistComplete}
              />
            )}
            {demoStep === "chatbot" && (
              <ChatbotStep
                key="chatbot"
                onComplete={handleChatbotComplete}
                onCancel={resetAssessment}
              />
            )}
            {demoStep === "results" && (
              <ResultsStep key="results" onReset={resetAssessment} />
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
