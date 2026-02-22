"use client";

import React, { useState, use, useMemo } from "react";
import Image from "next/image";
import {
  Video,
  MessageSquare,
  Calendar,
  Stethoscope,
  FileText,
  Clock,
  User,
  Mail,
  Phone,
  AlertCircle,
} from "lucide-react";
import PatientInfoCard from "@/components/therapist/patient/PatientInfoCard";
import PatientSessionNotes from "@/components/therapist/patient/PatientSessionNotes";
import PatientWorksheets from "@/components/therapist/patient/PatientWorksheets";
import PatientProgressDashboard from "@/components/therapist/patient/PatientProgressDashboard";
import { SessionSchedulingModal } from "@/components/therapist/patient/SessionSchedulingModal";
import { usePatientData, usePatientSessions, usePatientWorksheets } from "@/hooks/therapist/usePatientsList";
import { PageBreadcrumbs } from "@/components/navigation/PageBreadcrumbs";
import { BackButton } from "@/components/navigation/BackButton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function PatientDetailPage(
  props: {
    params: Promise<{ patientId: string }>;
  }
) {
  const params = use(props.params);
  const { patientId } = params;
  const { data: patientData, isLoading, error } = usePatientData(patientId);
  const { data: sessionsData = [] } = usePatientSessions(patientId);
  const { data: worksheetsData = [] } = usePatientWorksheets(patientId);
  const [activeTab, setActiveTab] = useState<"notes" | "worksheets" | "progress">("notes");
  const [isSchedulingModalOpen, setIsSchedulingModalOpen] = useState(false);

  // Transform backend response to frontend format
  const patient = useMemo(() => {
    if (!patientData) return null;

    const user = (patientData as any).user || {};
    const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Unknown";
    
    // Transform sessions to match PatientSessionNotes expected format
    const transformedSessions = (sessionsData || []).map((session: any, index: number) => ({
      id: session.id || `session-${index}`,
      number: index + 1,
      date: session.startTime || session.dateTime || session.createdAt || new Date().toISOString(),
      notes: session.notes || session.sessionData?.notes || "",
      duration: session.duration || 60,
      status: session.status?.toLowerCase() || "scheduled",
      meetingType: session.meetingType || session.type || "video",
    }));

    // Transform worksheets to match PatientWorksheets expected format
    const transformedWorksheets = (worksheetsData || []).map((worksheet: any) => ({
      id: worksheet.id,
      title: worksheet.title || "Untitled Worksheet",
      assignedDate: worksheet.assignedDate || worksheet.createdAt || new Date().toISOString(),
      status: worksheet.status || (worksheet.isCompleted ? "completed" : "pending"),
    }));

    return {
      id: (patientData as any).userId || patientId,
      name: fullName,
      fullName,
      avatar: user.avatarUrl || "/avatar-placeholder.png",
      email: user.email || "",
      phone: user.phoneNumber || "",
      age: user.birthDate ? Math.floor((Date.now() - new Date(user.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 0,
      diagnosis: (patientData as any).diagnosis || "Not specified",
      treatmentPlan: (patientData as any).treatmentPlan || "Not specified",
      currentSession: transformedSessions.filter((s: any) => s.status === "completed").length + 1,
      totalSessions: transformedSessions.length || 10,
      sessions: transformedSessions,
      worksheets: transformedWorksheets,
    };
  }, [patientData, sessionsData, worksheetsData, patientId]);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-3">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading patient data</AlertTitle>
          <AlertDescription>
            {error?.message || "Patient not found. Please try again or contact support."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumbs and Back Button */}
      <div className="space-y-3">
        <PageBreadcrumbs
          context={{
            patientName: patient.name,
          }}
        />
        <BackButton
          label="Back to Patients"
          href="/therapist/patients"
          variant="ghost"
        />
      </div>

      {/* Patient header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 rounded-full overflow-hidden border-2 border-border">
                <Image
                  src={patient.avatar || "/avatar-placeholder.png"}
                  alt={patient.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-foreground mb-1">{patient.name}</h1>
                <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                  Active Client
                </Badge>
              </div>
            </div>

            <div className="flex gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="h-10 w-10">
                    <Video className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Start Video Call</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="h-10 w-10">
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Send Message</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => setIsSchedulingModalOpen(true)}
                    size="icon"
                    className="h-10 w-10"
                  >
                    <Calendar className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Schedule Session</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patient info cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PatientInfoCard
          icon={
            <div className="p-2 rounded-md bg-blue-50 text-blue-600 w-fit h-fit flex-shrink-0">
              <Stethoscope className="h-4 w-4" />
            </div>
          }
          label="Diagnosis"
          value={patient.diagnosis}
        />
        <PatientInfoCard
          icon={
            <div className="p-2 rounded-md bg-purple-50 text-purple-600 w-fit h-fit flex-shrink-0">
              <FileText className="h-4 w-4" />
            </div>
          }
          label="Treatment Plan"
          value={patient.treatmentPlan}
        />
        <PatientInfoCard
          icon={
            <div className="p-2 rounded-md bg-orange-50 text-orange-600 w-fit h-fit flex-shrink-0">
              <Clock className="h-4 w-4" />
            </div>
          }
          label="Session Progress"
          value={`${patient.currentSession} of ${patient.totalSessions}`}
        />
      </div>

      {/* Personal Information */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Full Name</p>
                <p className="text-sm font-medium">{patient.fullName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Mail className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium">{patient.email || "Not provided"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Phone className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="text-sm font-medium">{patient.phone || "Not provided"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Age</p>
                <p className="text-sm font-medium">{patient.age || "Not provided"}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tab navigation and content */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
        <TabsList className="mb-6">
          <TabsTrigger value="notes">Session Notes</TabsTrigger>
          <TabsTrigger value="worksheets">Worksheets</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="notes" className="mt-0">
          <PatientSessionNotes
            sessions={patient.sessions || []}
            patientId={patientId}
          />
        </TabsContent>

        <TabsContent value="worksheets" className="mt-0">
          <PatientWorksheets
            worksheets={patient.worksheets || []}
            patientId={patientId}
          />
        </TabsContent>

        <TabsContent value="progress" className="mt-0">
          <PatientProgressDashboard
            patient={patient}
          />
        </TabsContent>
      </Tabs>

      {/* Session Scheduling Modal */}
      <SessionSchedulingModal
        patient={patient}
        isOpen={isSchedulingModalOpen}
        onClose={() => setIsSchedulingModalOpen(false)}
        onSuccess={() => {
          // Session scheduled successfully - modal will show success feedback
        }}
      />
    </div>
  );
}
