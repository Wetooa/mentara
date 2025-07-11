import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { UserDashboardData } from "@/lib/api/types/dashboard";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format, parseISO, isToday, addMinutes } from "date-fns";

interface UpcomingSessionsProps {
  sessions: UserDashboardData["upcomingSessions"];
}

export default function UpcomingSessions({ sessions }: UpcomingSessionsProps) {
  // Function to format the session time
  const formatSessionTime = (dateTimeStr: string, durationMinutes: number) => {
    const dateTime = parseISO(dateTimeStr);
    const endTime = addMinutes(dateTime, durationMinutes);

    return `${format(dateTime, "h:mm a")} - ${format(endTime, "h:mm a")}`;
  };

  // Function to format the date with special handling for today
  const formatSessionDate = (dateTimeStr: string) => {
    const dateTime = parseISO(dateTimeStr);

    if (isToday(dateTime)) {
      return "Today";
    }

    return format(dateTime, "EEEE, MMMM d");
  };

  // Check if there are any sessions scheduled for today
  const todaySessions = sessions.filter((session) =>
    isToday(parseISO(session.dateTime))
  );

  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Upcoming Sessions</h2>
          <Button variant="ghost" size="sm" className="text-primary gap-1">
            View All <ArrowRight size={16} />
          </Button>
        </div>

        {sessions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No upcoming sessions scheduled
          </div>
        ) : (
          <div className="space-y-6">
            {/* Today's sessions (if any) */}
            {todaySessions.length > 0 && (
              <div>
                <h3 className="text-md font-semibold mb-3 text-primary">
                  Today
                </h3>
                <div className="space-y-4">
                  {todaySessions.map((session) => (
                    <SessionCard key={session.id} session={session} />
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming sessions (excluding today) */}
            <div>
              <h3 className="text-md font-semibold mb-3 text-muted-foreground">
                Upcoming
              </h3>
              <div className="space-y-4">
                {sessions
                  .filter((session) => !isToday(parseISO(session.dateTime)))
                  .map((session) => (
                    <SessionCard key={session.id} session={session} />
                  ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Helper component for individual session card
function SessionCard({
  session,
}: {
  session: UserDashboardData["upcomingSessions"][0];
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
    <div
      className={`p-4 rounded-lg border ${isSessionLive ? "bg-green-50 border-green-200" : "bg-card"}`}
    >
      <div className="flex items-center gap-4">
        <Avatar className="h-12 w-12 bg-primary text-white">
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="flex items-center gap-1">
            <h4 className="font-semibold">{session.title}</h4>
            {isSessionLive && (
              <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full">
                Live
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {session.therapistName}
          </p>
        </div>

        <div className="text-right">
          <div className="flex items-center text-xs text-muted-foreground gap-1 mb-1">
            <Calendar size={14} />
            <span>{sessionDate}</span>
          </div>
          <div className="flex items-center text-xs text-muted-foreground gap-1 mb-3">
            <Clock size={14} />
            <span>{sessionTime}</span>
          </div>
          <Button
            size="sm"
            className={isSessionLive ? "bg-green-600 hover:bg-green-700" : ""}
          >
            {isSessionLive ? "Join Now" : "View Details"}
          </Button>
        </div>
      </div>
    </div>
  );
}
