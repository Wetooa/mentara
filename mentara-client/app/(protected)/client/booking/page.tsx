"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Calendar,
  Clock,
  Video,
  User,
  AlertCircle,
} from "lucide-react";
import BookingCalendar from "@/components/booking/BookingCalendar";
import { ClientBookingInterface } from "@/components/client/ClientBookingInterface";
import { useBooking, useMeetings } from "@/hooks/useBooking";
import { useTherapist } from "@/hooks/useTherapist";
import { MeetingStatus } from "@/types/booking";
import { TimeSlot } from "@/hooks/useAvailableSlots";
import { toast } from "sonner";

export default function BookingPage() {
  const [selectedTherapistId, setSelectedTherapistId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Get user's assigned therapists
  const { therapist } = useTherapist();
  const therapists = therapist ? [therapist] : [];
  const therapistsLoading = false;

  // Get user's meetings
  const { meetings, isLoading: meetingsLoading } = useMeetings({
    limit: 10,
    status: 'SCHEDULED,CONFIRMED',
  });

  // Get booking utilities
  const { cancelMeeting, isCancelling } = useBooking();

  const handleSlotSelect = (date: string, timeSlot: TimeSlot) => {
    setSelectedDate(new Date(date));
    setSelectedTimeSlot(timeSlot);
    setShowBookingModal(true);
  };

  const handleBookingSuccess = () => {
    toast.success("Session booked successfully!");
    setShowBookingModal(false);
    setSelectedTimeSlot(null);
  };

  const handleCancelMeeting = async (meetingId: string) => {
    if (confirm("Are you sure you want to cancel this meeting?")) {
      cancelMeeting(meetingId);
    }
  };

  const getStatusBadge = (status: MeetingStatus) => {
    switch (status) {
      case MeetingStatus.SCHEDULED:
        return <Badge variant="secondary">Scheduled</Badge>;
      case MeetingStatus.CONFIRMED:
        return <Badge variant="default">Confirmed</Badge>;
      case MeetingStatus.IN_PROGRESS:
        return <Badge variant="destructive">In Progress</Badge>;
      case MeetingStatus.COMPLETED:
        return <Badge variant="outline">Completed</Badge>;
      case MeetingStatus.CANCELLED:
        return <Badge variant="outline">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getMeetingTypeIcon = () => {
    // All meetings are video-only now
    return <Video className="h-4 w-4" />;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Book a Session</h1>
          <p className="text-muted-foreground">
            Schedule your therapy sessions with your assigned therapists
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Therapist Selection */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Select Therapist
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {therapistsLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : therapists.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No assigned therapists found. Please contact support.
                  </AlertDescription>
                </Alert>
              ) : (
                therapists.map((therapist) => (
                  <Card
                    key={therapist.id}
                    className={`cursor-pointer transition-colors ${
                      selectedTherapistId === therapist.id
                        ? "ring-2 ring-blue-500 bg-blue-50"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => setSelectedTherapistId(therapist.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">{therapist.firstName} {therapist.lastName}</div>
                          <div className="text-sm text-muted-foreground">
                            {therapist.specialties?.join(", ") || "General Therapy"}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>

          {/* Upcoming Sessions */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {meetingsLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : (Array.isArray(meetings) ? meetings : meetings?.meetings || []).length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  <Calendar className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p>No upcoming sessions</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(Array.isArray(meetings) ? meetings : meetings?.meetings || []).slice(0, 5).map((meeting) => (
                    <Card key={meeting.id} className="border border-gray-200">
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {getMeetingTypeIcon()}
                              <span className="font-medium text-sm">
                                {meeting.title || "Therapy Session"}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground space-y-1">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(meeting.startTime).toLocaleDateString()} at{" "}
                                {new Date(meeting.startTime).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                              <div>{meeting.duration} minutes</div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            {getStatusBadge(meeting.status as unknown as MeetingStatus)}
                            {(meeting.status === "scheduled" || 
                              meeting.status === "confirmed") && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCancelMeeting(meeting.id)}
                                disabled={isCancelling}
                                className="text-xs h-6 px-2"
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Calendar Section */}
        <div className="lg:col-span-2">
          {selectedTherapistId ? (
            <BookingCalendar
              therapistId={selectedTherapistId}
              onSlotSelect={handleSlotSelect}
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
            />
          ) : (
            <Card>
              <CardContent className="p-8">
                <div className="text-center text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <h3 className="text-lg font-medium mb-2">Select a Therapist</h3>
                  <p>Choose a therapist from the list to view available time slots</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Booking Interface */}
      <ClientBookingInterface
        therapistId={selectedTherapistId}
        isOpen={showBookingModal}
        onClose={() => {
          setShowBookingModal(false);
          setSelectedTimeSlot(null);
        }}
        onSuccess={handleBookingSuccess}
      />
    </div>
  );
}