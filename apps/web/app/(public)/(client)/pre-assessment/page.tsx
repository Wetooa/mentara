"use client";


import React, { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MessageSquare, ClipboardList, ArrowRight, Sparkles, UserPlus, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Logo from "@/components/Logo";
import { fadeDown } from "@/lib/animations";
import { useAuth } from "@/contexts/AuthContext";

function PreAssessmentChoicePageContent() {
  const router = useRouter();
  const { isAuthenticated, userRole } = useAuth();

  useEffect(() => {
    if (isAuthenticated && userRole === "client") {
      router.push("/client/assessment");
    }
  }, [isAuthenticated, userRole, router]);

  return (
    <div className="bg-gradient-to-b from-tertiary to-transparent w-full min-h-screen flex flex-col items-center justify-center p-4">
      <nav
        className="absolute top-4 left-4"
        aria-label="Main navigation"
      >
        <Logo />
      </nav>

      <motion.div
        variants={fadeDown}
        initial="hidden"
        animate="visible"
        className="w-full max-w-4xl space-y-8"
      >
        <header className="text-center space-y-4 mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-primary" aria-hidden="true" />
            <h1 className="text-4xl font-bold text-gray-900">
              How would you like to get started?
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose the assessment method that feels most comfortable for you. 
            Both options will help us understand your needs and match you with the right therapist.
            Or skip the assessment and register directly.
            </p>
          </header>

        <div className="grid md:grid-cols-2 gap-8 items-stretch" role="group" aria-label="Assessment method selection">
          {/* Checklist Option - PRIMARY */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="h-full"
          >
            <Card className="h-full border-2 border-primary/20 hover:border-primary transition-all cursor-pointer group hover:shadow-2xl bg-white/50 backdrop-blur-sm relative overflow-hidden" role="button" tabIndex={0} aria-label="Start traditional checklist assessment" onClick={() => router.push("/pre-assessment/checklist")} onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                router.push("/pre-assessment/checklist");
              }
            }}>
              <div className="absolute top-0 right-0 p-4">
                <Badge className="bg-primary text-white">Recommended</Badge>
              </div>
              <CardHeader className="space-y-4 pt-8">
                <div className="p-4 bg-primary/10 rounded-2xl w-fit group-hover:bg-primary/20 transition-colors" aria-hidden="true">
                  <ClipboardList className="h-10 w-10 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-foreground">Traditional Checklist</CardTitle>
                  <CardDescription className="text-base mt-2">
                    Complete a structured questionnaire with checklists and forms. 
                    This traditional method provides a comprehensive assessment.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    Structured questionnaire format
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    Quick but generic assessment
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    Takes about 5-15 minutes
                  </li>
                </ul>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push("/pre-assessment/checklist");
                  }}
                  className="w-full shadow-lg shadow-primary/20 group-hover:scale-[1.02] transition-transform"
                  size="lg"
                  aria-label="Start traditional checklist assessment"
                >
                  Start Checklist Assessment
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* AI Chatbot Option - LOCKED IF NOT LOGGED IN */}
          <motion.div
            whileHover={isAuthenticated ? { scale: 1.02 } : {}}
            whileTap={isAuthenticated ? { scale: 0.98 } : {}}
            className="h-full"
          >
            <Card 
              className={`h-full border-2 transition-all relative overflow-hidden ${
                isAuthenticated 
                  ? "hover:border-primary/50 cursor-pointer group hover:shadow-xl bg-white/50 backdrop-blur-sm" 
                  : "bg-gray-50/80 grayscale opacity-80 cursor-not-allowed border-gray-200"
              }`} 
              role="button" 
              tabIndex={isAuthenticated ? 0 : -1} 
              aria-label={isAuthenticated ? "Start AI chatbot assessment" : "AI chatbot assessment (Login required)"}
              onClick={() => isAuthenticated && router.push("/pre-assessment/chat")}
              onKeyDown={(e) => {
                if (isAuthenticated && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  router.push("/pre-assessment/chat");
                }
              }}
            >
              {!isAuthenticated && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-gray-900/5 backdrop-blur-[1px] p-6 text-center">
                  <div className="bg-white/90 p-3 rounded-full shadow-lg mb-3">
                    <Lock className="h-6 w-6 text-gray-600" />
                  </div>
                  <p className="text-sm font-semibold text-gray-900 bg-white/80 px-3 py-1 rounded-full shadow-sm border border-gray-200">
                    Login required
                  </p>
                </div>
              )}
              
              <CardHeader className="space-y-4 pt-8">
                <div className="flex items-center justify-between">
                  <div className={`p-4 rounded-2xl w-fit transition-colors ${
                    isAuthenticated ? "bg-primary/10 group-hover:bg-primary/20" : "bg-gray-200"
                  }`} aria-hidden="true">
                    <MessageSquare className={`h-10 w-10 ${isAuthenticated ? "text-primary" : "text-gray-400"}`} />
                  </div>
                  <Badge variant="secondary" className={`${isAuthenticated ? "bg-primary/10 text-primary border-primary/30" : "bg-gray-200 text-gray-500"}`}>
                    AURIS AI
                  </Badge>
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold">AI Chatbot Assessment</CardTitle>
                  <CardDescription className="text-base mt-2">
                    Have a conversation with AURIS, our AI assistant. Answer questions naturally 
                    through chat. Time varies depending on the depth of your details.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3 text-sm text-gray-500">
                  <li className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${isAuthenticated ? "bg-primary" : "bg-gray-300"}`} />
                    Natural conversation flow
                  </li>
                  <li className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${isAuthenticated ? "bg-primary" : "bg-gray-300"}`} />
                    Deeply personalized & accurate
                  </li>
                  <li className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${isAuthenticated ? "bg-primary" : "bg-gray-300"}`} />
                    Takes about 15-30 minutes
                  </li>
                </ul>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isAuthenticated) {
                      router.push("/pre-assessment/chat");
                    } else {
                      router.push("/auth/sign-in?callbackUrl=/pre-assessment");
                    }
                  }}
                  variant={isAuthenticated ? "default" : "outline"}
                  className={`w-full ${isAuthenticated ? "group-hover:bg-primary/90 shadow-lg shadow-primary/10" : "border-gray-300 text-gray-500"}`}
                  size="lg"
                  aria-label={isAuthenticated ? "Start AI chatbot assessment" : "Login to use Chatbot"}
                >
                  {isAuthenticated ? "Start Chat Assessment" : "Login to Access"}
                  {isAuthenticated && <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />}
                </Button>
                {!isAuthenticated && (
                  <p className="text-[11px] text-center text-gray-400 font-medium">
                    Available for registered users only
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Skip Assessment Option */}
        <motion.div
          variants={fadeDown}
          initial="hidden"
          animate="visible"
          className="mt-6"
        >
          <Card className="border-2 border-dashed hover:border-primary/50 transition-all">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-3 bg-gray-100 rounded-xl" aria-hidden="true">
                  <UserPlus className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Skip Assessment</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Register directly without completing an assessment. You can always complete an assessment later from your dashboard.
                  </p>
                </div>
                <Button
                  onClick={() => router.push("/auth/sign-up/skip-assessment")}
                  variant="outline"
                  className="w-full md:w-auto"
                  size="lg"
                  aria-label="Sign up without completing assessment"
                >
                  Sign Up Without Assessment
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.p
          variants={fadeDown}
          initial="hidden"
          animate="visible"
          className="text-center text-sm text-gray-500 mt-8"
        >
          Both methods will help us understand your needs and match you with the perfect therapist. 
          Choose the one that feels right for you.
        </motion.p>
      </motion.div>
    </div>
  );
}

export default function PreAssessmentChoicePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <PreAssessmentChoicePageContent />
    </Suspense>
  );
}