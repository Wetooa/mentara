"use client";

import React, { useState, use } from "react";
import Image from "next/image";
import { Video, MessageSquare, Calendar } from "lucide-react";
import PatientInfoCard from "@/components/therapist/patient/PatientInfoCard";
import PatientSessionNotes from "@/components/therapist/patient/PatientSessionNotes";
import PatientWorksheets from "@/components/therapist/patient/PatientWorksheets";
import PatientProgressDashboard from "@/components/therapist/patient/PatientProgressDashboard";
import { SessionSchedulingModal } from "@/components/therapist/patient/SessionSchedulingModal";
import { usePatientData } from "@/hooks/therapist/usePatientsList";

export default function PatientDetailPage(
  props: {
    params: Promise<{ patientId: string }>;
  }
) {
  const params = use(props.params);
  const { patientId } = params;
  const { data: patient, isLoading, error } = usePatientData(patientId);
  const [activeTab, setActiveTab] = useState<"notes" | "worksheets" | "progress">("notes");
  const [isSchedulingModalOpen, setIsSchedulingModalOpen] = useState(false);

  if (isLoading) {
    return <div className="p-6">Loading patient data...</div>;
  }

  if (error || !patient) {
    return (
      <div className="p-6 text-red-500">
        Error loading patient data: {error?.message}
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Patient header with info */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="relative h-20 w-20 rounded-full overflow-hidden mr-4 border-2 border-primary">
              <Image
                src={patient.avatar || "/avatar-placeholder.png"}
                alt={patient.name}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <div className="text-gray-500 text-sm">Patient name</div>
              <h1 className="text-2xl font-bold">{patient.name}</h1>
            </div>
          </div>

          <div className="flex space-x-2">
            <button className="p-2 rounded-md bg-green-100 text-primary">
              <Video className="h-5 w-5" />
            </button>
            <button className="p-2 rounded-md bg-green-100 text-primary">
              <MessageSquare className="h-5 w-5" />
            </button>
            <button 
              className="p-2 rounded-md bg-green-100 text-primary hover:bg-green-200 transition-colors"
              onClick={() => setIsSchedulingModalOpen(true)}
              title="Schedule Session"
            >
              <Calendar className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Patient info cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <PatientInfoCard
          icon={
            <div className="p-2 rounded-md bg-blue-100 text-blue-600">D</div>
          }
          label="DIAGNOSIS"
          value={patient.diagnosis}
        />
        <PatientInfoCard
          icon={
            <div className="p-2 rounded-md bg-purple-100 text-purple-600">
              T
            </div>
          }
          label="TREATMENT PLAN"
          value={patient.treatmentPlan}
        />
        <PatientInfoCard
          icon={
            <div className="p-2 rounded-md bg-orange-100 text-orange-600">
              S
            </div>
          }
          label="SESSION"
          value={`${patient.currentSession} out of ${patient.totalSessions}`}
        />
      </div>

      {/* Personal Information */}
      <div className="mb-6">
        <button className="py-2 px-4 rounded-md border border-gray-300 text-gray-700 font-medium">
          Personal Information
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <div className="flex items-center">
          <div className="mr-4 text-gray-500">
            <span className="inline-block p-2 rounded-full bg-gray-100">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20 21V19C20 16.7909 18.2091 15 16 15H8C5.79086 15 4 16.7909 4 19V21"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-500">Full Name</p>
            <p className="font-medium">{patient.fullName}</p>
          </div>
        </div>

        <div className="flex items-center">
          <div className="mr-4 text-gray-500">
            <span className="inline-block p-2 rounded-full bg-gray-100">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 8L10.8906 13.2604C11.5624 13.7083 12.4376 13.7083 13.1094 13.2604L21 8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <rect
                  x="3"
                  y="5"
                  width="18"
                  height="14"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium">{patient.email}</p>
          </div>
        </div>

        <div className="flex items-center">
          <div className="mr-4 text-gray-500">
            <span className="inline-block p-2 rounded-full bg-gray-100">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 4H9L11 9L8.5 10.5C9.57096 12.6715 11.3285 14.429 13.5 15.5L15 13L20 15V19C20 19.5523 19.5523 20 19 20C10.7157 20 4 13.2843 4 5C4 4.44772 4.44772 4 5 4Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-500">Phone</p>
            <p className="font-medium">{patient.phone}</p>
          </div>
        </div>

        <div className="flex items-center">
          <div className="mr-4 text-gray-500">
            <span className="inline-block p-2 rounded-full bg-gray-100">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 6V12L16 14"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-500">Age</p>
            <p className="font-medium">{patient.age}</p>
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex space-x-6">
          <button
            onClick={() => setActiveTab("notes")}
            className={`py-2 ${
              activeTab === "notes"
                ? "text-primary border-b-2 border-primary"
                : "text-gray-500"
            }`}
          >
            Session Notes
          </button>
          <button
            onClick={() => setActiveTab("worksheets")}
            className={`py-2 ${
              activeTab === "worksheets"
                ? "text-primary border-b-2 border-primary"
                : "text-gray-500"
            }`}
          >
            Worksheets
          </button>
          <button
            onClick={() => setActiveTab("progress")}
            className={`py-2 ${
              activeTab === "progress"
                ? "text-primary border-b-2 border-primary"
                : "text-gray-500"
            }`}
          >
            Progress
          </button>
        </div>
      </div>

      {/* Tab content */}
      <div>
        {activeTab === "notes" && (
          <PatientSessionNotes
            sessions={patient.sessions}
            patientId={patientId}
          />
        )}
        {activeTab === "worksheets" && (
          <PatientWorksheets
            worksheets={patient.worksheets}
            patientId={patientId}
          />
        )}
        {activeTab === "progress" && (
          <PatientProgressDashboard
            patient={patient}
          />
        )}
      </div>

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
