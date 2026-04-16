"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, ArrowRight, Users } from "lucide-react";
import { motion } from "framer-motion";

export default function AssessmentPromptCard() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/30 via-white to-blue-50/20 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card className="border-2 shadow-lg">
          <CardHeader className="text-center space-y-4 pb-6">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full opacity-20 blur-xl"></div>
                <div className="relative bg-gradient-to-br from-emerald-500/10 to-blue-500/10 p-6 rounded-full border border-emerald-200/50">
                  <Users className="h-12 w-12 text-emerald-600" />
                </div>
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900">
              Complete Your Assessment First
            </CardTitle>
            <CardDescription className="text-base">
              To access communities and connect with others who share similar experiences, 
              please complete your mental health assessment.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl p-6 space-y-4">
              <h3 className="font-semibold text-gray-900 mb-3">Why complete the assessment?</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-600"></div>
                  </div>
                  <span className="text-sm text-gray-700">
                    Get matched with communities that align with your needs and experiences
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                  </div>
                  <span className="text-sm text-gray-700">
                    Connect with peers who understand your journey
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-600"></div>
                  </div>
                  <span className="text-sm text-gray-700">
                    Access personalized resources and support groups
                  </span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => router.push("/client/assessment")}
                className="flex-1 gap-2"
                size="lg"
              >
                <FileText className="h-5 w-5" />
                Start Assessment
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => router.push("/client")}
                variant="outline"
                className="flex-1"
                size="lg"
              >
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

