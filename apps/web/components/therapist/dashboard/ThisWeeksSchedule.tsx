import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Calendar,
  Clock,
  User,
} from "lucide-react";
import { format, parseISO, isToday, isTomorrow, startOfWeek, isSameDay } from "date-fns";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { getInitials } from "@/lib/utils/common";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Appointment {
  id: string;
  patientName: string;
  patientAvatar?: string;
  startTime: string;
  endTime?: string;
  type?: string;
  status?: string;
}

interface ThisWeeksScheduleProps {
  appointments: Appointment[];
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

export default function ThisWeeksSchedule({ appointments, onViewAll }: ThisWeeksScheduleProps) {
  const router = useRouter();

  // Group appointments by day
  const groupedAppointments = appointments.reduce((acc, appointment) => {
    if (!appointment.startTime) return acc;
    
    try {
      const date = parseISO(appointment.startTime);
      const dayKey = format(date, "yyyy-MM-dd");
      
      if (!acc[dayKey]) {
        acc[dayKey] = [];
      }
      acc[dayKey].push(appointment);
      return acc;
    } catch {
      return acc;
    }
  }, {} as Record<string, Appointment[]>);

  // Sort days
  const sortedDays = Object.keys(groupedAppointments).sort();

  const handleViewAll = () => {
    onViewAll?.();
  };

  const handleAppointmentClick = (appointmentId: string) => {
    router.push(`/therapist/schedule`);
  };

  const getDayLabel = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      if (isToday(date)) {
        return "Today";
      } else if (isTomorrow(date)) {
        return "Tomorrow";
      } else {
        return format(date, "EEEE, MMM d");
      }
    } catch {
      return dateString;
    }
  };

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
              <h2 className="text-lg font-bold">This Week's Schedule</h2>
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
          <motion.div className="space-y-6" variants={containerVariants}>
            {sortedDays.length > 0 ? (
              sortedDays.slice(0, 4).map((dayKey) => (
                <motion.div key={dayKey} variants={sectionVariants}>
                  <h3 className={`text-md font-semibold mb-3 ${
                    isToday(parseISO(dayKey)) ? "text-secondary" : "text-muted-foreground"
                  }`}>
                    {getDayLabel(dayKey)}
                  </h3>
                  <div className="space-y-3">
                    {groupedAppointments[dayKey].slice(0, 3).map((appointment, index) => (
                      <AppointmentCard
                        key={appointment.id}
                        appointment={appointment}
                        index={index}
                        onClick={() => handleAppointmentClick(appointment.id)}
                      />
                    ))}
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div
                className="text-center py-12 text-muted-foreground"
                variants={sectionVariants}
              >
                <div className="bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-10 w-10 text-secondary/40" />
                </div>
                <p className="text-sm font-medium text-gray-600 mb-1">No appointments this week</p>
                <p className="text-xs text-gray-500">Check back later for updates</p>
              </motion.div>
            )}
          </motion.div>
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

  const appointmentTime = format(startTime, "h:mm a");
  const initials = getInitials(appointment.patientName);

  return (
    <motion.div
      variants={appointmentCardVariants}
      whileHover={{
        scale: 1.02,
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        transition: { duration: 0.2 },
      }}
      className="p-3 sm:p-4 rounded-lg border bg-card cursor-pointer hover:bg-secondary/5 hover:border-secondary/30 transition-all"
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <motion.div
          className="p-2 bg-secondary/10 rounded-md flex-shrink-0"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            delay: 0.2 + index * 0.1,
            type: "spring",
            stiffness: 300,
            damping: 20,
          }}
        >
          <Avatar className="h-8 w-8 bg-secondary text-secondary-foreground">
            <AvatarImage src={appointment.patientAvatar} />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
        </motion.div>

        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm sm:text-base truncate">
            {appointment.patientName}
          </h4>
          <p className="text-xs sm:text-sm text-muted-foreground truncate">
            {appointment.type || "Session"}
          </p>
        </div>

        <div className="text-right flex-shrink-0">
          <div className="flex items-center text-xs text-muted-foreground gap-1">
            <Clock size={14} />
            <span className="font-medium">{appointmentTime}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

