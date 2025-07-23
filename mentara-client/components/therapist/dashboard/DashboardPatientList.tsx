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
      staggerChildren: 0.1
    }
  }
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
      damping: 24
    }
  }
};

export default function DashboardPatientList({
  appointments,
}: DashboardPatientListProps) {
  const [hoveredAppointment, setHoveredAppointment] = useState<string | null>(
    null
  );

  if (appointments.length === 0) {
    return (
      <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
        <CardContent className="p-12 text-center">
          <div className="rounded-xl bg-muted/50 p-4 w-fit mx-auto mb-4">
            <Clock className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No appointments today</h3>
          <p className="text-muted-foreground">
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
          <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-card/50 backdrop-blur-sm group">
            {/* Accent line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
            
            <CardContent className="p-6">
              {/* Patient Info */}
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-12 w-12 border-2 border-background shadow-md">
                  <AvatarImage 
                    src={appointment.patientAvatar || "/avatar-placeholder.png"} 
                    alt={appointment.patientName} 
                  />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {appointment.patientName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm sm:text-base truncate">
                    {appointment.patientName}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {appointment.time}
                  </div>
                </div>
              </div>

              {/* Condition */}
              <div className="space-y-2 mb-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Condition
                </p>
                <Badge variant="secondary" className="text-xs font-medium">
                  {appointment.condition}
                </Badge>
              </div>

              {/* Action Buttons - Always visible in modern design */}
              <div className="flex gap-2">
                {appointment.reportId && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex-1 gap-2 text-xs" 
                    asChild
                  >
                    <Link href={`/therapist/patients/${appointment.patientId}/reports/${appointment.reportId}`}>
                      <FileText className="h-3 w-3" />
                      Report
                    </Link>
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="gap-2 text-xs" 
                  asChild
                >
                  <Link href={`/therapist/patients/${appointment.patientId}`}>
                    <MessageSquare className="h-3 w-3" />
                    Chat
                  </Link>
                </Button>
                <Button 
                  variant="default" 
                  size="sm" 
                  className="gap-2 text-xs"
                  asChild
                >
                  <Link href={`/therapist/patients/${appointment.patientId}/video`}>
                    <Video className="h-3 w-3" />
                    Video
                  </Link>
                </Button>
              </div>

              {/* Subtle gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
