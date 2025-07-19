import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { UserDashboardData } from "@/lib/api/types/dashboard";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format, parseISO, isToday, addMinutes } from "date-fns";
import { motion } from "framer-motion";

interface UpcomingSessionsProps {
  sessions: UserDashboardData["upcomingSessions"];
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
      staggerChildren: 0.1
    }
  }
};

const sessionCardVariants = {
  hidden: { opacity: 0, x: -20, scale: 0.95 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24
    }
  }
};

export default function UpcomingSessions({ sessions }: UpcomingSessionsProps) {
  // Function to format the session time
  // const formatSessionTime = (dateTimeStr: string, durationMinutes: number) => {
  //   const dateTime = parseISO(dateTimeStr);
  //   const endTime = addMinutes(dateTime, durationMinutes);

  //   return `${format(dateTime, "h:mm a")} - ${format(endTime, "h:mm a")}`;
  // };

  // Function to format the date with special handling for today
  // const formatSessionDate = (dateTimeStr: string) => {
  //   const dateTime = parseISO(dateTimeStr);

  //   if (isToday(dateTime)) {
  //     return "Today";
  //   }

  //   return format(dateTime, "EEEE, MMMM d");
  // };

  // Check if there are any sessions scheduled for today
  const todaySessions = sessions.filter((session) =>
    isToday(parseISO(session.dateTime))
  );

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <Card className="shadow-sm">
        <CardContent className="p-4 sm:p-6">
          <motion.div 
            className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-2"
            variants={sectionVariants}
          >
            <h2 className="text-lg sm:text-xl font-bold">Upcoming Sessions</h2>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button variant="ghost" size="sm" className="text-primary gap-1 self-start">
                View All <ArrowRight size={16} />
              </Button>
            </motion.div>
          </motion.div>

          {sessions.length === 0 ? (
            <motion.div 
              className="text-center py-8 text-muted-foreground"
              variants={sectionVariants}
            >
              No upcoming sessions scheduled
            </motion.div>
          ) : (
            <motion.div 
              className="space-y-6"
              variants={containerVariants}
            >
              {/* Today's sessions (if any) */}
              {todaySessions.length > 0 && (
                <motion.div variants={sectionVariants}>
                  <h3 className="text-md font-semibold mb-3 text-primary">
                    Today
                  </h3>
                  <div className="space-y-4">
                    {todaySessions.map((session, index) => (
                      <SessionCard 
                        key={session.id} 
                        session={session} 
                        index={index}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Upcoming sessions (excluding today) */}
              <motion.div variants={sectionVariants}>
                <h3 className="text-md font-semibold mb-3 text-muted-foreground">
                  Upcoming
                </h3>
                <div className="space-y-4">
                  {sessions
                    .filter((session) => !isToday(parseISO(session.dateTime)))
                    .map((session, index) => (
                      <SessionCard 
                        key={session.id} 
                        session={session} 
                        index={index}
                      />
                    ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Helper component for individual session card
function SessionCard({
  session,
  index = 0,
}: {
  session: UserDashboardData["upcomingSessions"][0];
  index?: number;
}) {
  const dateTime = parseISO(session.dateTime);
  const endTime = addMinutes(dateTime, session.duration);
  const sessionTime = `${format(dateTime, "h:mm a")} - ${format(endTime, "h:mm a")}`;
  const sessionDate = isToday(dateTime)
    ? "Today"
    : format(dateTime, "EEEE, MMMM d");

  // Get initials for avatar fallback
  const initials = session.therapistName
    .split(" ")
    .map((name) => name.charAt(0))
    .join("");

  // Check if session is happening now
  const now = new Date();
  const isSessionLive = now >= dateTime && now <= endTime;

  return (
    <motion.div
      variants={sessionCardVariants}
      whileHover={{ 
        scale: 1.02, 
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        transition: { duration: 0.2 }
      }}
      className={`p-3 sm:p-4 rounded-lg border ${isSessionLive ? "bg-green-50 border-green-200" : "bg-card"}`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 + index * 0.1, type: "spring", stiffness: 300 }}
          className="flex-shrink-0"
        >
          <Avatar className="h-10 w-10 sm:h-12 sm:w-12 bg-primary text-white">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </motion.div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <h4 className="font-semibold text-sm sm:text-base truncate">{session.title}</h4>
            {isSessionLive && (
              <motion.span 
                className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full self-start"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                Live
              </motion.span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground truncate">
            {session.therapistName}
          </p>
          
          {/* Mobile: Show date/time below therapist name */}
          <div className="flex flex-col sm:hidden gap-1 mt-2">
            <div className="flex items-center text-xs text-muted-foreground gap-1">
              <Calendar size={12} />
              <span>{sessionDate}</span>
            </div>
            <div className="flex items-center text-xs text-muted-foreground gap-1">
              <Clock size={12} />
              <span>{sessionTime}</span>
            </div>
          </div>
        </div>

        {/* Desktop: Show date/time and button on the right */}
        <div className="hidden sm:block text-right flex-shrink-0">
          <div className="flex items-center text-xs text-muted-foreground gap-1 mb-1">
            <Calendar size={14} />
            <span>{sessionDate}</span>
          </div>
          <div className="flex items-center text-xs text-muted-foreground gap-1 mb-3">
            <Clock size={14} />
            <span>{sessionTime}</span>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              size="sm"
              className={isSessionLive ? "bg-green-600 hover:bg-green-700" : ""}
            >
              {isSessionLive ? "Join Now" : "View Details"}
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
              className={`w-full ${isSessionLive ? "bg-green-600 hover:bg-green-700" : ""}`}
            >
              {isSessionLive ? "Join Now" : "View Details"}
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
