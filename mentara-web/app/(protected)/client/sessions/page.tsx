"use client";

import { useState, useCallback, useMemo, memo } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, CheckCircle, XCircle, Plus, CreditCard, LayoutGrid, List, ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Meeting } from "@/lib/api/services/meetings";
import { logger } from "@/lib/logger";

// Lazy load heavy session components
const SessionsList = dynamic(() => import("@/components/sessions").then(mod => ({ default: mod.SessionsList })), {
  ssr: false,
  loading: () => <Skeleton className="h-64 w-full" />
});

const SessionStats = dynamic(() => import("@/components/sessions").then(mod => ({ default: mod.SessionStats })), {
  ssr: false,
  loading: () => <Skeleton className="h-24 w-full" />
});

const PaymentMethodsSheet = dynamic(() => import("@/components/billing").then(mod => ({ default: mod.PaymentMethodsSheet })), {
  ssr: false
});

const SessionsCalendarView = dynamic(() => import("@/components/sessions/SessionsCalendarView").then(mod => ({ default: mod.SessionsCalendarView })), {
  ssr: false,
  loading: () => <Skeleton className="h-96 w-full" />
});

// Lazy load framer-motion
const MotionDiv = dynamic(() => import("framer-motion").then(mod => mod.motion.div), {
  ssr: false,
  loading: () => <div className="w-full h-full p-4 sm:p-6 space-y-6" />
});

// Memoize utility functions
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

  // Memoize callbacks
  const handleScheduleSession = useCallback(() => {
    router.push('/client/booking');
  }, [router]);

  const handleSessionClick = useCallback((session: Meeting) => {
    if (viewMode === 'split') {
      setSelectedSession(session);
    } else {
      router.push(`/client/sessions/${session.id}`);
    }
  }, [viewMode, router]);

  const handleManagePaymentMethods = useCallback(() => {
    setPaymentMethodsOpen(true);
  }, []);

  // Memoize tabs configuration
  const tabs = useMemo(() => [
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
  ], []);

  return (
    <MotionDiv
      className="w-full h-full p-4 sm:p-6 space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Compact Header with Stats */}
      <Suspense fallback={<Skeleton className="h-24 w-full" />}>
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
      </Suspense>

      {/* Quick Actions - Reorganized with Sections */}
      <div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Session Actions */}
          <Card className="border-primary/20 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Session Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start gap-3 h-11 hover:bg-primary/10 hover:border-primary/30 hover:text-primary group"
                onClick={handleScheduleSession}
              >
                <div className="p-1.5 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                  <Plus className="h-4 w-4 text-primary" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold text-sm">Book New Session</div>
                  <div className="text-xs text-muted-foreground">Schedule with therapist</div>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start gap-3 h-11 hover:bg-blue-50 hover:border-blue-200 group"
                onClick={() => setActiveTab("upcoming")}
              >
                <div className="p-1.5 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <Clock className="h-4 w-4 text-blue-600" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold text-sm">View Upcoming</div>
                  <div className="text-xs text-muted-foreground">Scheduled sessions</div>
                </div>
              </Button>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card className="border-purple-200/50 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-purple-600" />
                Account Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start gap-3 h-11 hover:bg-purple-50 hover:border-purple-200 group"
                onClick={() => router.push('/client/therapist')}
              >
                <div className="p-1.5 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                  <Calendar className="h-4 w-4 text-purple-600" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold text-sm">Find Therapist</div>
                  <div className="text-xs text-muted-foreground">Browse providers</div>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start gap-3 h-11 hover:bg-green-50 hover:border-green-200 group"
                onClick={handleManagePaymentMethods}
              >
                <div className="p-1.5 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                  <CreditCard className="h-4 w-4 text-green-600" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold text-sm">Payment Methods</div>
                  <div className="text-xs text-muted-foreground">Manage billing</div>
                </div>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sessions Content - Split Panel or List View */}
      <div>
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
                  <div className="lg:col-span-2">
                    <Card className="h-full shadow-lg border-border/50 p-0 flex flex-col">
                      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-5 py-4 border-b border-blue-200/50">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-blue-100 rounded-lg">
                            {tab.icon}
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-gray-900">{tab.label}</h3>
                            <p className="text-xs text-gray-600">{tab.description}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 overflow-y-auto p-4">
                        <SessionsList
                          defaultStatus={tab.status}
                          showFilters={false}
                          showStats={false}
                          showJoinButtons={tab.id === "upcoming"}
                          onSessionClick={handleSessionClick}
                          variant="compact"
                        />
                      </div>
                    </Card>
                  </div>

                  {/* Right: Calendar or Selected Session */}
                  <div className="lg:col-span-3 hidden lg:block">
                    {selectedSession ? (
                      <Card className="h-full overflow-y-auto shadow-lg border-primary/20 p-0 flex flex-col">
                        <div className="bg-gradient-to-r from-primary/5 to-primary/10 px-6 py-4 border-b">
                          <div className="text-lg font-bold flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-primary" />
                            Session Details
                          </div>
                        </div>
                        <div className="p-6 space-y-4 flex-1 overflow-y-auto">
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
                        </div>
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
      </div>

      {/* Payment Methods Sheet */}
      <Suspense fallback={null}>
        <PaymentMethodsSheet
          open={paymentMethodsOpen}
          onOpenChange={setPaymentMethodsOpen}
        />
      </Suspense>
    </MotionDiv>
  );
}