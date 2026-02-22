"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Video, MessageSquare, FileText, Clock, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { getInitials } from "@/lib/utils/common";

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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0, scale: 0.95 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
};

export default function DashboardPatientList({
  appointments,
}: DashboardPatientListProps) {
  const [hoveredAppointment, setHoveredAppointment] = useState<string | null>(
    null
  );

  if (appointments.length === 0) {
    return (
      <Card className="border-gray-200 shadow-lg bg-white">
        <CardContent className="p-12 text-center">
          <div className="rounded-xl bg-gray-50 p-4 w-fit mx-auto mb-4">
            <Clock className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2 text-gray-900">
            No appointments today
          </h3>
          <p className="text-gray-600">
            Your schedule is clear. Enjoy your free time!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {appointments.map((appointment, index) => (
        <motion.div
          key={appointment.id}
          variants={itemVariants}
          whileHover={{ y: -4, scale: 1.02, transition: { duration: 0.2 } }}
          onMouseEnter={() => setHoveredAppointment(appointment.id)}
          onMouseLeave={() => setHoveredAppointment(null)}
        >
          <Card className="relative overflow-hidden border-2 hover:border-secondary/30 shadow-md hover:shadow-xl transition-all duration-300 bg-white group">
            {/* Accent bar with secondary color */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-secondary to-secondary/70" />

            <CardContent className="p-6">
              {/* Patient Info Header */}
              <div className="flex items-start gap-4 mb-4">
                <Avatar className="h-14 w-14 border-2 border-secondary/20 shadow-md ring-2 ring-secondary/10">
                  <AvatarImage
                    src={appointment.patientAvatar || "/avatar-placeholder.png"}
                    alt={appointment.patientName}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-gradient-to-br from-secondary/20 to-secondary/10 text-secondary font-bold text-base">
                    {getInitials(appointment.patientName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base text-gray-900 truncate mb-1">
                    {appointment.patientName}
                  </h3>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/10 rounded-lg w-fit">
                    <Clock className="h-3.5 w-3.5 text-secondary" />
                    <span className="text-sm font-semibold text-secondary">
                      {appointment.time}
                    </span>
                  </div>
                </div>
              </div>

              {/* Condition Badge */}
              <div className="mb-4">
                <Badge
                  variant="secondary"
                  className="text-xs font-medium px-3 py-1 bg-gray-100 text-gray-700 border-gray-200"
                >
                  {appointment.condition}
                </Badge>
              </div>

              {/* Action Buttons - Modern Grid Layout */}
              <div className="grid grid-cols-3 gap-2">
                {appointment.reportId && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs hover:bg-secondary/10 hover:border-secondary/30 hover:text-secondary"
                    asChild
                  >
                    <Link
                      href={`/therapist/patients/${appointment.patientId}/reports/${appointment.reportId}`}
                    >
                      <FileText className="h-3.5 w-3.5" />
                      Report
                    </Link>
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs hover:bg-secondary/10 hover:border-secondary/30 hover:text-secondary"
                  asChild
                >
                  <Link href={`/therapist/patients/${appointment.patientId}`}>
                    <MessageSquare className="h-3.5 w-3.5" />
                    Chat
                  </Link>
                </Button>
                <Button
                  size="sm"
                  className="gap-1.5 text-xs bg-secondary hover:bg-secondary/90 shadow-sm"
                  asChild
                >
                  <Link
                    href={`/therapist/patients/${appointment.patientId}/video`}
                  >
                    <Video className="h-3.5 w-3.5" />
                    Video
                  </Link>
                </Button>
              </div>

              {/* Subtle gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
