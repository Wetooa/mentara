"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  MessageSquare,
  ClipboardList,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Logo from "@/components/Logo";
import { fadeDown } from "@/lib/animations";

export default function PreAssessmentChoicePage() {
  const router = useRouter();

  return (
    <div className="bg-gradient-to-b from-tertiary to-transparent w-full min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      <motion.nav
        variants={fadeDown}
        initial="hidden"
        animate="visible"
        className="absolute top-4 left-4"
      >
        <Logo />
      </motion.nav>

      <motion.div
        variants={fadeDown}
        initial="hidden"
        animate="visible"
        className="w-full max-w-4xl space-y-6 sm:space-y-8 mt-16 sm:mt-0"
      >
        <div className="text-center space-y-3 sm:space-y-4 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mb-3 sm:mb-4">
            <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 px-4">
              How would you like to get started?
            </h1>
          </div>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            Choose the assessment method that feels most comfortable for you.
            Both options will help us understand your needs and match you with
            the right therapist.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* AI Chatbot Option */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Card className="h-full border-2 hover:border-primary/50 transition-all cursor-pointer group hover:shadow-xl">
              <CardHeader className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2 sm:p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                    <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-primary/10 text-primary border-primary/30 text-xs sm:text-sm"
                  >
                    New
                  </Badge>
                </div>
                <CardTitle className="text-xl sm:text-2xl">
                  AI Chatbot Assessment
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Have a conversation with our AI assistant. Answer questions
                  naturally through chat - it's quick, easy, and feels like
                  talking to a friend.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-xs sm:text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                    Natural conversation flow
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                    Quick and approachable
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                    Takes about 5-10 minutes
                  </li>
                </ul>
                <Button
                  onClick={() => router.push("/pre-assessment/chat")}
                  className="w-full group-hover:bg-primary/90 transition-colors"
                  size="lg"
                >
                  <span className="text-sm sm:text-base">
                    Start Chat Assessment
                  </span>
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Checklist Option */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Card className="h-full border-2 hover:border-primary/50 transition-all cursor-pointer group hover:shadow-xl">
              <CardHeader className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2 sm:p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                    <ClipboardList className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-xl sm:text-2xl">
                  Traditional Checklist
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Complete a structured questionnaire with checklists and forms.
                  This traditional method provides a comprehensive assessment.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-xs sm:text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                    Structured questionnaire format
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                    Comprehensive assessment
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                    Takes about 10-15 minutes
                  </li>
                </ul>
                <Button
                  onClick={() => router.push("/pre-assessment/checklist")}
                  variant="outline"
                  className="w-full group-hover:bg-primary/10 group-hover:border-primary/50 transition-colors"
                  size="lg"
                >
                  <span className="text-sm sm:text-base">
                    Start Checklist Assessment
                  </span>
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.p
          variants={fadeDown}
          initial="hidden"
          animate="visible"
          className="text-center text-xs sm:text-sm text-gray-500 mt-6 sm:mt-8 px-4"
        >
          Both methods will help us understand your needs and match you with the
          perfect therapist. Choose the one that feels right for you.
        </motion.p>
      </motion.div>
    </div>
  );
}
