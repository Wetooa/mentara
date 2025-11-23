"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MessageSquare, ClipboardList, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Logo from "@/components/Logo";
import { fadeDown } from "@/lib/animations";

export default function PreAssessmentChoicePage() {
  const router = useRouter();

  return (
    <div className="bg-gradient-to-b from-tertiary to-transparent w-full min-h-screen flex flex-col items-center justify-center p-4">
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
        className="w-full max-w-4xl space-y-8"
      >
        <div className="text-center space-y-4 mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-gray-900">
              How would you like to get started?
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose the assessment method that feels most comfortable for you. 
            Both options will help us understand your needs and match you with the right therapist.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* AI Chatbot Option */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card className="h-full border-2 hover:border-primary/50 transition-all cursor-pointer group hover:shadow-xl">
              <CardHeader className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                    <MessageSquare className="h-8 w-8 text-primary" />
                  </div>
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/30">
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
                >
                  Start Chat Assessment
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Checklist Option */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card className="h-full border-2 hover:border-primary/50 transition-all cursor-pointer group hover:shadow-xl">
              <CardHeader className="space-y-3">
                <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
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
                >
                  Start Checklist Assessment
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
          className="text-center text-sm text-gray-500 mt-8"
        >
          Both methods will help us understand your needs and match you with the perfect therapist. 
          Choose the one that feels right for you.
        </motion.p>
      </motion.div>
    </div>
  );
}