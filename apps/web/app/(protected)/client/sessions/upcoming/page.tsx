"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SessionsList, SessionStats } from "@/components/sessions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Calendar, ArrowLeft, Bell, Video, CreditCard } from "lucide-react";
import { CalendarModal } from "@/components/calendar/CalendarModal";
import { motion } from "framer-motion";
import type { Meeting } from "@/lib/api/services/meetings";
import { PaymentMethodsSheet } from "@/components/billing";

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

export default function UpcomingSessionsPage() {
  const router = useRouter();

  const handleSessionClick = (session: Meeting) => {
    router.push(`/client/sessions/${session.id}`);
  };

  const handleBackToSessions = () => {
    router.push('/client/sessions');
  };

  const handleScheduleSession = () => {
    router.push('/client/booking');
  };

  const [calendarModalOpen, setCalendarModalOpen] = useState(false);
  const [paymentMethodsOpen, setPaymentMethodsOpen] = useState(false);

  const handleViewCalendar = () => {
    setCalendarModalOpen(true);
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
              <Clock className="h-6 w-6 text-blue-600" />
              <h1 className="text-3xl font-bold tracking-tight">Upcoming Sessions</h1>
            </div>
            <p className="text-muted-foreground">
              Your scheduled therapy appointments and reminders
            </p>
          </div>
        </div>
        <Button onClick={handleScheduleSession} className="gap-2 w-fit">
          <Calendar className="h-4 w-4" />
          Schedule Session
        </Button>
      </motion.div>

      {/* Session Statistics */}
      <motion.div variants={itemVariants}>
        <SessionStats showTrends={true} />
      </motion.div>

      {/* Quick Actions and Reminders */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-600" />
              Session Preparation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="h-auto p-4 justify-start"
                onClick={handleViewCalendar}
              >
                <Calendar className="h-5 w-5 mr-3 text-blue-600" />
                <div className="text-left">
                  <div className="font-medium">Calendar View</div>
                  <div className="text-xs text-muted-foreground">See all appointments</div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-auto p-4 justify-start"
                onClick={() => router.push('/client/worksheets')}
              >
                <Video className="h-5 w-5 mr-3 text-green-600" />
                <div className="text-left">
                  <div className="font-medium">Prepare Materials</div>
                  <div className="text-xs text-muted-foreground">Review worksheets</div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-auto p-4 justify-start"
                onClick={() => router.push('/client/messages')}
              >
                <Bell className="h-5 w-5 mr-3 text-purple-600" />
                <div className="text-left">
                  <div className="font-medium">Message Therapist</div>
                  <div className="text-xs text-muted-foreground">Ask questions</div>
                </div>
              </Button>

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

      {/* Upcoming Sessions List */}
      <motion.div variants={itemVariants}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold">Your Upcoming Appointments</h2>
            </div>
          </div>
          
          <SessionsList
            defaultStatus="SCHEDULED,CONFIRMED"
            showFilters={true}
            showStats={false}
            showJoinButtons={true}
            onSessionClick={handleSessionClick}
            variant="default"
            emptyStateProps={{
              title: "No Upcoming Sessions",
              description: "Schedule your next therapy session to continue your mental health journey.",
              icon: Clock,
              actionButton: {
                label: "Schedule Session Now",
                onClick: handleScheduleSession
              }
            }}
          />
        </div>
      </motion.div>

      {/* Calendar Modal */}
      <CalendarModal
        isOpen={calendarModalOpen}
        onOpenChange={setCalendarModalOpen}
      />

      {/* Payment Methods Sheet */}
      <PaymentMethodsSheet
        open={paymentMethodsOpen}
        onOpenChange={setPaymentMethodsOpen}
      />
    </motion.div>
  );
}