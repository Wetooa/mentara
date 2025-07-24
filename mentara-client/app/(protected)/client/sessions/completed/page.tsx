"use client";

import { useRouter } from "next/navigation";
import { SessionsList, SessionStats } from "@/components/sessions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Calendar, ArrowLeft, TrendingUp, CreditCard } from "lucide-react";
import { motion } from "framer-motion";
import type { Meeting } from "@/lib/api/services/meetings";
import { PaymentMethodsSheet } from "@/components/billing";
import { useState } from "react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24
    }
  }
};

export default function CompletedSessionsPage() {
  const router = useRouter();
  const [paymentMethodsOpen, setPaymentMethodsOpen] = useState(false);

  const handleSessionClick = (session: Meeting) => {
    router.push(`/client/sessions/${session.id}`);
  };

  const handleBackToSessions = () => {
    router.push('/client/sessions');
  };

  const handleScheduleNewSession = () => {
    router.push('/client/booking');
  };

  const handleManagePaymentMethods = () => {
    setPaymentMethodsOpen(true);
  };

  return (
    <motion.div
      className="w-full h-full p-6 space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Page Header */}
      <motion.div 
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        variants={itemVariants}
      >
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBackToSessions}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Sessions
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <h1 className="text-3xl font-bold tracking-tight">Completed Sessions</h1>
            </div>
            <p className="text-muted-foreground">
              Review your therapy progress and session history
            </p>
          </div>
        </div>
        <Button onClick={handleScheduleNewSession} className="gap-2 w-fit">
          <Calendar className="h-4 w-4" />
          Schedule New Session
        </Button>
      </motion.div>

      {/* Session Statistics */}
      <motion.div variants={itemVariants}>
        <SessionStats showTrends={true} />
      </motion.div>

      {/* Progress Insights */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Your Progress Journey
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">✨</div>
                <div className="text-sm font-medium">Sessions Completed</div>
                <div className="text-xs text-muted-foreground">Building consistency</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">📈</div>
                <div className="text-sm font-medium">Progress Made</div>
                <div className="text-xs text-muted-foreground">Tracking improvements</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">🎯</div>
                <div className="text-sm font-medium">Goals Achieved</div>
                <div className="text-xs text-muted-foreground">Celebrating milestones</div>
              </div>
              <Button
                variant="outline"
                className="h-auto p-4 justify-start"
                onClick={handleManagePaymentMethods}
              >
                <CreditCard className="h-5 w-5 mr-3 text-blue-600" />
                <div className="text-left">
                  <div className="font-medium">Payment Methods</div>
                  <div className="text-xs text-muted-foreground">Manage payments</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Completed Sessions List */}
      <motion.div variants={itemVariants}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <h2 className="text-xl font-semibold">Completed Sessions</h2>
            </div>
          </div>
          
          <SessionsList
            defaultStatus="COMPLETED"
            showFilters={true}
            showStats={false}
            showJoinButtons={false}
            onSessionClick={handleSessionClick}
            variant="default"
            emptyStateProps={{
              title: "No Completed Sessions Yet",
              description: "Your completed therapy sessions will appear here once you finish them.",
              icon: CheckCircle,
              actionButton: {
                label: "Schedule Your First Session",
                onClick: handleScheduleNewSession
              }
            }}
          />
        </div>
      </motion.div>

      {/* Payment Methods Sheet */}
      <PaymentMethodsSheet
        open={paymentMethodsOpen}
        onOpenChange={setPaymentMethodsOpen}
      />
    </motion.div>
  );
}