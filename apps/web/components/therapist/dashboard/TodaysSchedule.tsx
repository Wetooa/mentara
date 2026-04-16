import React, { memo, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, Clock, ArrowRight, Video } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format, parseISO, isToday, addMinutes, isAfter, isBefore } from "date-fns";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { getInitials } from "@/lib/utils/common";

interface Appointment {
  id: string;
  patientName: string;
  patientAvatar?: string;
  startTime: string;
  endTime?: string;
  type?: string;
  status?: string;
}

interface TodaysScheduleProps {
  appointments: Appointment[];
  isLoading?: boolean;
  onViewAll?: () => void;
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 24,
      staggerChildren: 0.1,
    },
  },
};

const appointmentCardVariants = {
  hidden: { opacity: 0, x: -20, scale: 0.95 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 24,
    },
  },
};

function TodaysSchedule({ appointments, isLoading = false, onViewAll }: TodaysScheduleProps) {
  const router = useRouter();

  // Group appointments by time of day
  const groupedAppointments = useMemo(() => {
    const now = new Date();
    const morning: Appointment[] = [];
    const afternoon: Appointment[] = [];
    const evening: Appointment[] = [];

    appointments.forEach((appointment) => {
      if (!appointment.startTime) return;
      
      try {
        const startTime = parseISO(appointment.startTime);
        const hour = startTime.getHours();

        if (hour < 12) {
          morning.push(appointment);
        } else if (hour < 17) {
          afternoon.push(appointment);
        } else {
          evening.push(appointment);
        }
      } catch {
        // Skip invalid dates
      }
    });

    return { morning, afternoon, evening };
  }, [appointments]);

  // Memoize callback
  const handleViewAll = useCallback(() => {
    onViewAll?.();
  }, [onViewAll]);

  const handleAppointmentClick = useCallback((appointmentId: string) => {
    router.push(`/therapist/schedule`);
  }, [router]);

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="h-full">
      <Card className="shadow-sm hover:shadow-md transition-shadow overflow-hidden border-border/50 p-0 h-full flex flex-col">
        <div className="bg-gradient-to-br from-secondary/10 via-secondary/5 to-secondary/5 px-4 sm:px-5 py-4 border-b border-border/50">
          <motion.div
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            variants={sectionVariants}
          >
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-secondary" />
              <h2 className="text-lg font-bold">Today's Schedule</h2>
            </div>
            {appointments.length > 0 && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-secondary hover:text-secondary/80 hover:bg-secondary/10 gap-1 self-start"
                  onClick={handleViewAll}
                >
                  View All <ArrowRight size={16} />
                </Button>
              </motion.div>
            )}
          </motion.div>
        </div>
        <div className="p-4 sm:p-5 flex-1">
          {isLoading ? (
            <div className="space-y-6">
              <div>
                <div className="h-6 w-20 bg-gray-200 rounded mb-3 animate-pulse" />
                <div className="space-y-3">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
                  ))}
                </div>
              </div>
            </div>
          ) : appointments.length === 0 ? (
            <motion.div
              className="text-center py-12 text-muted-foreground"
              variants={sectionVariants}
            >
              <div className="bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-10 w-10 text-secondary/40" />
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">No appointments today</p>
              <p className="text-xs text-gray-500">Your schedule is clear</p>
            </motion.div>
          ) : (
            <motion.div className="space-y-6" variants={containerVariants}>
              {/* Morning Appointments */}
              {groupedAppointments.morning.length > 0 && (
                <motion.div variants={sectionVariants}>
                  <h3 className="text-md font-semibold mb-3 text-secondary">
                    Morning
                  </h3>
                  <div className="space-y-4">
                    {groupedAppointments.morning.map((appointment, index) => (
                      <AppointmentCard
                        key={appointment.id}
                        appointment={appointment}
                        index={index}
                        onClick={() => handleAppointmentClick(appointment.id)}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Afternoon Appointments */}
              {groupedAppointments.afternoon.length > 0 && (
                <motion.div variants={sectionVariants}>
                  <h3 className="text-md font-semibold mb-3 text-secondary">
                    Afternoon
                  </h3>
                  <div className="space-y-4">
                    {groupedAppointments.afternoon.map((appointment, index) => (
                      <AppointmentCard
                        key={appointment.id}
                        appointment={appointment}
                        index={index}
                        onClick={() => handleAppointmentClick(appointment.id)}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Evening Appointments */}
              {groupedAppointments.evening.length > 0 && (
                <motion.div variants={sectionVariants}>
                  <h3 className="text-md font-semibold mb-3 text-secondary">
                    Evening
                  </h3>
                  <div className="space-y-4">
                    {groupedAppointments.evening.map((appointment, index) => (
                      <AppointmentCard
                        key={appointment.id}
                        appointment={appointment}
                        index={index}
                        onClick={() => handleAppointmentClick(appointment.id)}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

// Helper component for individual appointment card
function AppointmentCard({
  appointment,
  index = 0,
  onClick,
}: {
  appointment: Appointment;
  index?: number;
  onClick?: () => void;
}) {
  if (!appointment.startTime) {
    return (
      <div className="p-4 rounded-lg border bg-red-50 border-red-200">
        <p className="text-red-600">Invalid appointment data</p>
      </div>
    );
  }

  const startTime = parseISO(appointment.startTime);
  if (isNaN(startTime.getTime())) {
    return (
      <div className="p-4 rounded-lg border bg-red-50 border-red-200">
        <p className="text-red-600">Invalid appointment time</p>
      </div>
    );
  }

  // Calculate end time
  const endTime = appointment.endTime
    ? parseISO(appointment.endTime)
    : addMinutes(startTime, 60);
  const appointmentTime = `${format(startTime, "h:mm a")} - ${format(endTime, "h:mm a")}`;

  // Check if appointment is happening now
  const now = new Date();
  const isLive = isAfter(now, startTime) && isBefore(now, endTime);

  const initials = getInitials(appointment.patientName);

  return (
    <motion.div
      variants={appointmentCardVariants}
      whileHover={{
        scale: 1.02,
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        transition: { duration: 0.2 },
      }}
      className={`p-3 sm:p-4 rounded-lg border cursor-pointer ${
        isLive ? "bg-secondary/10 border-secondary/30" : "bg-card"
      }`}
      onClick={onClick}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            delay: 0.2 + index * 0.1,
            type: "spring",
            stiffness: 300,
          }}
          className="flex-shrink-0"
        >
          <Avatar className="h-10 w-10 sm:h-12 sm:w-12 bg-secondary text-secondary-foreground">
            <AvatarImage src={appointment.patientAvatar} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </motion.div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <h4 className="font-semibold text-sm sm:text-base truncate">
              {appointment.patientName}
            </h4>
            {isLive && (
              <motion.span
                className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full self-start"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                Live
              </motion.span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground truncate">
            {appointment.type || "Session"}
          </p>

          {/* Mobile: Show time below patient name */}
          <div className="flex flex-col sm:hidden gap-1 mt-2">
            <div className="flex items-center text-xs text-muted-foreground gap-1">
              <Clock size={12} />
              <span>{appointmentTime}</span>
            </div>
          </div>
        </div>

        {/* Desktop: Show time and button on the right */}
        <div className="hidden sm:block text-right flex-shrink-0">
          <div className="flex items-center text-xs text-muted-foreground gap-1 mb-3">
            <Clock size={14} />
            <span>{appointmentTime}</span>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="sm"
              className={isLive ? "bg-secondary hover:bg-secondary/90" : ""}
            >
              {isLive ? (
                <>
                  <Video className="h-4 w-4 mr-1" />
                  Join Now
                </>
              ) : (
                "View Details"
              )}
            </Button>
          </motion.div>
        </div>

        {/* Mobile: Show button at the bottom */}
        <div className="w-full sm:hidden mt-2">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full"
          >
            <Button
              size="sm"
              className={`w-full ${isLive ? "bg-secondary hover:bg-secondary/90" : ""}`}
            >
              {isLive ? (
                <>
                  <Video className="h-4 w-4 mr-1" />
                  Join Now
                </>
              ) : (
                "View Details"
              )}
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

// Memoize AppointmentCard to prevent unnecessary re-renders
const MemoizedAppointmentCard = memo(AppointmentCard);

// Memoize main component
const MemoizedTodaysSchedule = memo(TodaysSchedule);

// Export both default and named for compatibility
export default MemoizedTodaysSchedule;
export { MemoizedTodaysSchedule as TodaysSchedule };

