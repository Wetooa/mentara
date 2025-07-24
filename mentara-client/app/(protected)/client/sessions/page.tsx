"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SessionsList, SessionStats } from "@/components/sessions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, CheckCircle, XCircle, Plus } from "lucide-react";
import { motion } from "framer-motion";
import type { Meeting } from "@/lib/api/services/meetings";

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

export default function SessionsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");

  const handleScheduleSession = () => {
    router.push('/client/booking');
  };

  const handleSessionClick = (session: Meeting) => {
    router.push(`/client/sessions/${session.id}`);
  };

  const tabs = [
    {
      id: "all",
      label: "All Sessions",
      icon: <Calendar className="h-4 w-4" />,
      description: "View all your sessions",
    },
    {
      id: "upcoming",
      label: "Upcoming",
      icon: <Clock className="h-4 w-4" />,
      description: "Sessions scheduled for the future",
      status: "SCHEDULED" as const,
    },
    {
      id: "completed",
      label: "Completed",
      icon: <CheckCircle className="h-4 w-4" />,
      description: "Successfully finished sessions",
      status: "COMPLETED" as const,
    },
    {
      id: "cancelled",
      label: "Cancelled",
      icon: <XCircle className="h-4 w-4" />,
      description: "Cancelled or missed sessions",
      status: "CANCELLED" as const,
    },
  ];

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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Sessions</h1>
          <p className="text-muted-foreground">
            Manage and view your therapy sessions
          </p>
        </div>
        <Button onClick={handleScheduleSession} className="gap-2 w-fit">
          <Plus className="h-4 w-4" />
          Schedule Session
        </Button>
      </motion.div>

      {/* Session Statistics */}
      <motion.div variants={itemVariants}>
        <SessionStats showTrends={true} />
      </motion.div>

      {/* Quick Actions Card */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="justify-start gap-2 h-12"
                onClick={handleScheduleSession}
              >
                <Plus className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Book Session</div>
                  <div className="text-xs text-muted-foreground">Schedule with therapist</div>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="justify-start gap-2 h-12"
                onClick={() => setActiveTab("upcoming")}
              >
                <Clock className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">View Upcoming</div>
                  <div className="text-xs text-muted-foreground">Check scheduled sessions</div>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="justify-start gap-2 h-12"
                onClick={() => router.push('/client/therapist')}
              >
                <Calendar className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Find Therapist</div>
                  <div className="text-xs text-muted-foreground">Browse available therapists</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Sessions Tabs */}
      <motion.div variants={itemVariants}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-fit lg:grid-cols-4">
            {tabs.map((tab) => (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id}
                className="flex items-center gap-2 transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm hover:bg-muted"
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="space-y-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                {tab.icon}
                <span>{tab.description}</span>
              </div>
              
              <SessionsList
                defaultStatus={tab.status}
                showFilters={tab.id === "all"}
                showStats={false}
                showJoinButtons={tab.id === "upcoming"}
                onSessionClick={handleSessionClick}
                variant="default"
              />
            </TabsContent>
          ))}
        </Tabs>
      </motion.div>
    </motion.div>
  );
}