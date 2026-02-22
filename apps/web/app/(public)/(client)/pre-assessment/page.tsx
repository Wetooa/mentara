"use client";


import React, { Suspense } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MessageSquare, ClipboardList, ArrowRight, Sparkles, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Logo from "@/components/Logo";
import { fadeDown } from "@/lib/animations";

function PreAssessmentChoicePageContent() {
  const router = useRouter();

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

        <div className="grid md:grid-cols-2 gap-6" role="group" aria-label="Assessment method selection">
          {/* AI Chatbot Option */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card className="h-full border-2 hover:border-primary/50 transition-all cursor-pointer group hover:shadow-xl" role="button" tabIndex={0} aria-label="Start AI chatbot assessment" onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                router.push("/pre-assessment/chat");
              }
            }}>
              <CardHeader className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors" aria-hidden="true">
                    <MessageSquare className="h-8 w-8 text-primary" />
                  </div>
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/30" aria-label="New feature">
                    New
                  </Badge>
                </div>
                <CardTitle className="text-2xl">AI Chatbot Assessment</CardTitle>
                <CardDescription className="text-base">
                  Have a conversation with our AI assistant. Answer questions naturally 
                  through chat - it's quick, easy, and feels like talking to a friend.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Natural conversation flow
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Quick and approachable
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Takes about 5-10 minutes
                  </li>
                </ul>
                <Button
                  onClick={() => router.push("/pre-assessment/chat")}
                  className="w-full group-hover:bg-primary/90 transition-colors"
                  size="lg"
                  aria-label="Start AI chatbot assessment"
                >
                  Start Chat Assessment
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Checklist Option */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card className="h-full border-2 hover:border-primary/50 transition-all cursor-pointer group hover:shadow-xl" role="button" tabIndex={0} aria-label="Start traditional checklist assessment" onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                router.push("/pre-assessment/checklist");
              }
            }}>
              <CardHeader className="space-y-3">
                <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors" aria-hidden="true">
                  <ClipboardList className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Traditional Checklist</CardTitle>
                <CardDescription className="text-base">
                  Complete a structured questionnaire with checklists and forms. 
                  This traditional method provides a comprehensive assessment.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Structured questionnaire format
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Comprehensive assessment
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Takes about 10-15 minutes
                  </li>
                </ul>
                <Button
                  onClick={() => router.push("/pre-assessment/checklist")}
                  variant="outline"
                  className="w-full group-hover:bg-primary/10 group-hover:border-primary/50 transition-colors"
                  size="lg"
                  aria-label="Start traditional checklist assessment"
                >
                  Start Checklist Assessment
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </Button>
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