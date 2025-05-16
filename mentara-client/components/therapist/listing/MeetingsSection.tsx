import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { mockMeetings } from "@/data/mockTherapistListingData";
import { format, parseISO } from "date-fns";

export default function MeetingsSection() {
  // Get only the first 3 meetings to display
  const displayMeetings = mockMeetings.slice(0, 3);

  return (
    <div className="space-y-4 mt-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Meetings</h2>
        {mockMeetings.length > 3 && (
          <Button variant="ghost" size="sm">
            See all
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {displayMeetings.map((meeting) => {
          // Parse the date from ISO string
          const meetingDate = parseISO(meeting.dateTime);
          const formattedDate = format(meetingDate, "MMM d, yyyy");
          const formattedTime =
            format(meetingDate, "h:mm a") +
            " - " +
            format(
              parseISO(meeting.dateTime).setMinutes(
                parseISO(meeting.dateTime).getMinutes() + meeting.duration
              ),
              "h:mm a"
            );

          // Generate initials for the avatar
          const initials = meeting.therapistName
            .split(" ")
            .map((name) => name.charAt(0))
            .join("");

          return (
            <Card
              key={meeting.id}
              className={`overflow-hidden ${meeting.status === "started" ? "bg-green-50" : ""}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 bg-primary text-white">
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-bold">{meeting.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {meeting.therapistName}
                      </p>
                      {meeting.status === "started" && (
                        <p className="text-xs text-green-600 mt-1">
                          The session has started
                        </p>
                      )}
                      {meeting.status === "scheduled" &&
                        meeting.timeToStart && (
                          <p className="text-xs text-muted-foreground mt-1">
                            The session is {meeting.timeToStart}
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
                      {meeting.status === "started" ? "Join" : "View"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
