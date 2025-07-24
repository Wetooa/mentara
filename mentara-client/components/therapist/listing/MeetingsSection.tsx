import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Loader2, AlertCircle } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useUpcomingSessions } from "@/hooks/sessions/useSessions";
import { format, parseISO } from "date-fns";

export default function MeetingsSection() {
  // Fetch upcoming meetings using React Query
  const { data: meetingsResponse, isLoading, error } = useUpcomingSessions(3);
  const meetings = meetingsResponse?.meetings || [];
  
  // Handle loading state
  if (isLoading) {
    return (
      <div className="space-y-4 mt-8">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Meetings</h2>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading meetings...</span>
          </div>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="space-y-4 mt-8">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Meetings</h2>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>Failed to load meetings. Please try again later.</span>
          </div>
        </div>
      </div>
    );
  }
  
  // Get only the first 3 meetings to display
  const displayMeetings = meetings.slice(0, 3);

  // Handle empty state
  if (meetings.length === 0) {
    return (
      <div className="space-y-4 mt-8">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Meetings</h2>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="text-center text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No upcoming meetings</p>
            <p className="text-sm">Your scheduled sessions will appear here.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Meetings</h2>
        {meetings.length > 3 && (
          <Button variant="ghost" size="sm">
            See all
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {displayMeetings
          .map((meeting) => {
          // Check if startTime exists before parsing
          if (!meeting.startTime) {
            console.warn('Meeting missing startTime:', meeting);
            return null;
          }
          
          // Parse the date from ISO string
          const meetingDate = parseISO(meeting.startTime);
          const formattedDate = format(meetingDate, "MMM d, yyyy");
          const formattedTime =
            format(meetingDate, "h:mm a") +
            " - " +
            format(
              new Date(meetingDate.getTime() + meeting.duration * 60000),
              "h:mm a"
            );

          // Generate therapist name and initials
          const therapistName = meeting.therapist
            ? `${meeting.therapist.user.firstName} ${meeting.therapist.user.lastName}`
            : "Unknown Therapist";
            
          const initials = meeting.therapist
            ? `${meeting.therapist.user.firstName.charAt(0)}${meeting.therapist.user.lastName.charAt(0)}`
            : "??";

          // Map status to UI states (API uses uppercase, UI expects lowercase)
          const statusLower = meeting.status.toLowerCase();
          const isStarted = statusLower === "in_progress";
          const isScheduled = statusLower === "scheduled" || statusLower === "confirmed";

          return (
            <Card
              key={meeting.id}
              className={`overflow-hidden ${isStarted ? "bg-green-50" : ""}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 bg-primary text-white">
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-bold">{meeting.title || "Therapy Session"}</h3>
                      <p className="text-sm text-muted-foreground">
                        {therapistName}
                      </p>
                      {isStarted && (
                        <p className="text-xs text-green-600 mt-1">
                          The session has started
                        </p>
                      )}
                      {isScheduled && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Upcoming session
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    <div className="flex items-center text-xs text-muted-foreground gap-1 mb-2">
                      <Calendar size={14} />
                      <span>{formattedDate}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">
                      {formattedTime}
                    </div>
                    <Button size="sm" className="mt-auto">
                      {isStarted ? "Join" : "View"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })
        .filter(Boolean)}
      </div>
    </div>
  );
}
