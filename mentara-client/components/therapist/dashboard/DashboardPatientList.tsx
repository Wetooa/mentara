"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Video, MessageSquare } from "lucide-react";

interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientAvatar: string;
  time: string;
  condition: string;
  reportId?: string;
}

interface DashboardPatientListProps {
  appointments: Appointment[];
}

export default function DashboardPatientList({
  appointments,
}: DashboardPatientListProps) {
  const [hoveredAppointment, setHoveredAppointment] = useState<string | null>(
    null
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {appointments.map((appointment) => (
        <div
          key={appointment.id}
          className="bg-white rounded-lg shadow p-4 relative"
          onMouseEnter={() => setHoveredAppointment(appointment.id)}
          onMouseLeave={() => setHoveredAppointment(null)}
        >
          <div className="flex items-center mb-3">
            <div className="h-10 w-10 rounded-full bg-gray-200 mr-3 overflow-hidden">
              <Image
                src={appointment.patientAvatar || "/avatar-placeholder.png"}
                alt={appointment.patientName}
                width={40}
                height={40}
              />
            </div>
            <div>
              <h3 className="font-medium">{appointment.patientName}</h3>
              <p className="text-sm text-gray-500">{appointment.time}</p>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-700">Condition</p>
            <p className="font-medium">{appointment.condition}</p>
          </div>

          {/* Hover actions */}
          {hoveredAppointment === appointment.id && (
            <div className="absolute inset-0 bg-white bg-opacity-95 rounded-lg flex flex-col items-center justify-center">
              {appointment.reportId && (
                <Link
                  href={`/therapist/patients/${appointment.patientId}/reports/${appointment.reportId}`}
                  className="text-primary hover:underline flex items-center mb-3"
                >
                  <span className="mr-1">View Report</span> &gt;
                </Link>
              )}
              <div className="flex space-x-2">
                <Link
                  href={`/therapist/patients/${appointment.patientId}`}
                  className="p-2 bg-primary text-white rounded-full"
                >
                  <MessageSquare className="h-5 w-5" />
                </Link>
                <Link
                  href={`/therapist/patients/${appointment.patientId}/video`}
                  className="p-2 bg-blue-600 text-white rounded-full"
                >
                  <Video className="h-5 w-5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
