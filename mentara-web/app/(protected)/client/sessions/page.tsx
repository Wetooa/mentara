"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SessionsList, SessionStats } from "@/components/sessions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, CheckCircle, XCircle, Plus, CreditCard, LayoutGrid, List, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import type { Meeting } from "@/lib/api/services/meetings";
import { PaymentMethodsSheet } from "@/components/billing";
import { SessionsCalendarView } from "@/components/sessions/SessionsCalendarView";

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

const getStatusColor = (status: Meeting["status"]) => {
  switch (status) {
    case 'SCHEDULED':
    case 'CONFIRMED':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'IN_PROGRESS':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'COMPLETED':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'CANCELLED':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusText = (status: Meeting["status"]) => {
  switch (status) {
    case 'SCHEDULED': return 'Scheduled';
    case 'CONFIRMED': return 'Confirmed';
    case 'IN_PROGRESS': return 'In Progress';
    case 'COMPLETED': return 'Completed';
    case 'CANCELLED': return 'Cancelled';
    default: return status;
  }
};

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return 'Invalid date';
  }
};

const formatTime = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return 'Invalid time';
  }
};

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

export default function SessionsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [paymentMethodsOpen, setPaymentMethodsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'split' | 'list'>('split');
  const [selectedSession, setSelectedSession] = useState<Meeting | null>(null);

  const handleScheduleSession = () => {
    router.push('/client/booking');
  };

  const handleSessionClick = (session: Meeting) => {
    if (viewMode === 'split') {
      setSelectedSession(session);
    } else {
      router.push(`/client/sessions/${session.id}`);
    }
  };

  const handleManagePaymentMethods = () => {
    setPaymentMethodsOpen(true);
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
      className="w-full h-full p-4 sm:p-6 space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Compact Header with Stats */}
      <motion.div variants={itemVariants}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">My Sessions</h1>
            <p className="text-sm text-muted-foreground">
              Manage and view your therapy sessions
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
              <Button
                variant={viewMode === 'split' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('split')}
                className="gap-2"
              >
                <LayoutGrid className="h-4 w-4" />
                <span className="hidden sm:inline">Split</span>
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="gap-2"
              >
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">List</span>
              </Button>
            </div>
            <Button onClick={handleScheduleSession} className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Schedule</span>
            </Button>
          </div>
        </div>

        {/* Compact Session Statistics */}
        <SessionStats showTrends={false} />
      </motion.div>

      {/* Quick Actions Card - Smaller */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Button 
                variant="outline" 
                className="justify-center gap-2 h-10 text-sm"
                onClick={handleScheduleSession}
              >
                <Plus className="h-4 w-4" />
                <span>Book</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="justify-center gap-2 h-10 text-sm"
                onClick={() => setActiveTab("upcoming")}
              >
                <Clock className="h-4 w-4" />
                <span>Upcoming</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="justify-center gap-2 h-10 text-sm"
                onClick={() => router.push('/client/therapist')}
              >
                <Calendar className="h-4 w-4" />
                <span>Find Therapist</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="justify-center gap-2 h-10 text-sm"
                onClick={handleManagePaymentMethods}
              >
                <CreditCard className="h-4 w-4" />
                <span>Payment</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Sessions Content - Split Panel or List View */}
      <motion.div variants={itemVariants}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 lg:w-fit lg:grid-cols-4 bg-gray-100">
            {tabs.map((tab) => (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id}
                className="flex items-center gap-2 transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="space-y-4 mt-4">
              {viewMode === 'split' ? (
                // Split Panel Layout
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-[calc(100vh-450px)] min-h-[500px]">
                  {/* Left: Compact Sessions List */}
                  <div className="lg:col-span-2 space-y-3 overflow-y-auto pr-2">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-600">
                        {tab.description}
                      </p>
                    </div>
                    <SessionsList
                      defaultStatus={tab.status}
                      showFilters={false}
                      showStats={false}
                      showJoinButtons={tab.id === "upcoming"}
                      onSessionClick={handleSessionClick}
                      variant="compact"
                    />
                  </div>

                  {/* Right: Calendar or Selected Session */}
                  <div className="lg:col-span-3 hidden lg:block">
                    {selectedSession ? (
                      <Card className="h-full overflow-y-auto shadow-lg border-primary/20">
                        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-primary" />
                            Session Details
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                              {selectedSession.title || `Session with ${selectedSession.therapist?.user.firstName} ${selectedSession.therapist?.user.lastName}`}
                            </h3>
                            <div className="flex items-center gap-2 mb-4">
                              <Badge className={getStatusColor(selectedSession.status)}>
                                {getStatusText(selectedSession.status)}
                              </Badge>
                            </div>
                          </div>

                          {selectedSession.description && (
                            <div>
                              <p className="text-sm font-semibold text-gray-700 mb-2">Description</p>
                              <p className="text-sm text-gray-600">{selectedSession.description}</p>
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                              <div className="flex items-center gap-2 mb-1">
                                <Calendar className="h-4 w-4 text-blue-600" />
                                <span className="text-xs font-semibold text-blue-900">Date</span>
                              </div>
                              <p className="text-sm font-bold text-blue-700">
                                {formatDate(selectedSession.startTime)}
                              </p>
                            </div>
                            <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                              <div className="flex items-center gap-2 mb-1">
                                <Clock className="h-4 w-4 text-purple-600" />
                                <span className="text-xs font-semibold text-purple-900">Time</span>
                              </div>
                              <p className="text-sm font-bold text-purple-700">
                                {formatTime(selectedSession.startTime)}
                              </p>
                            </div>
                          </div>

                          {selectedSession.therapist && (
                            <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-4 rounded-xl border border-primary/20">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-12 w-12 border-2 border-primary/30">
                                  <AvatarImage src={selectedSession.therapist.user.profilePicture} />
                                  <AvatarFallback className="bg-primary text-primary-foreground">
                                    {getInitials(`${selectedSession.therapist.user.firstName} ${selectedSession.therapist.user.lastName}`)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-semibold text-gray-900">
                                    {selectedSession.therapist.user.firstName} {selectedSession.therapist.user.lastName}
                                  </p>
                                  <p className="text-xs text-gray-600">Your Therapist</p>
                                </div>
                              </div>
                            </div>
                          )}

                          <Button 
                            className="w-full gap-2"
                            onClick={() => router.push(`/client/sessions/${selectedSession.id}`)}
                          >
                            <ExternalLink className="h-4 w-4" />
                            View Full Details
                          </Button>
                        </CardContent>
                      </Card>
                    ) : (
                      <SessionsCalendarView 
                        onSessionClick={handleSessionClick}
                        filterStatus={tab.status}
                      />
                    )}
                  </div>
                </div>
              ) : (
                // Traditional List Layout
                <SessionsList
                  defaultStatus={tab.status}
                  showFilters={tab.id === "all"}
                  showStats={false}
                  showJoinButtons={tab.id === "upcoming"}
                  onSessionClick={handleSessionClick}
                  variant="default"
                />
              )}
            </TabsContent>
          ))}
        </Tabs>
      </motion.div>

      {/* Payment Methods Sheet */}
      <PaymentMethodsSheet
        open={paymentMethodsOpen}
        onOpenChange={setPaymentMethodsOpen}
      />
    </motion.div>
  );
}