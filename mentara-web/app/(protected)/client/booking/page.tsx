"use client";

import React, { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { Suspense } from "react";
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
  MapPin,
  ExternalLink,
} from "lucide-react";
// Lazy load heavy booking components
const BookingCalendar = dynamic(() => import("@/components/booking/BookingCalendar").then(mod => ({ default: mod.default })), {
  ssr: false,
  loading: () => <Skeleton className="h-96 w-full" />
});

const ClientBookingInterface = dynamic(() => import("@/components/client/ClientBookingInterface").then(mod => ({ default: mod.default })), {
  ssr: false
});
import { useBooking, useMeetings } from "@/hooks/booking/useBooking";
import { useAssignedTherapists } from "@/hooks/therapist/useTherapist";
import { MeetingStatus } from "@/types/booking";
import { TimeSlot } from "@/hooks/booking/useAvailableSlots";
import { DurationOption } from "@/components/booking/DurationSelector";
import { toast } from "sonner";

export default function BookingPage() {
  const [selectedTherapistId, setSelectedTherapistId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(
    null
  );
  const [selectedDuration, setSelectedDuration] =
    useState<DurationOption | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Get user's assigned therapists
  const {
    data: therapists = [],
    isLoading: therapistsLoading,
    error: therapistsError,
  } = useAssignedTherapists();

  // Get user's meetings
  const { meetings, isLoading: meetingsLoading } = useMeetings({
    limit: 10,
    status: "SCHEDULED,CONFIRMED",
  });

  // Get booking utilities
  const { cancelMeeting, isCancelling } = useBooking();

  // Auto-select first therapist if there's only one
  useEffect(() => {
    if (!therapistsLoading && !selectedTherapistId && therapists.length === 1) {
      setSelectedTherapistId(therapists[0].id);
    }
  }, [therapists, therapistsLoading, selectedTherapistId]);

  // Memoize callbacks to prevent unnecessary re-renders
  const handleSlotSelect = useCallback((date: string, timeSlot: TimeSlot) => {
    setSelectedDate(new Date(date));
    setSelectedTimeSlot(timeSlot);
    setShowBookingModal(true);
  }, []);

  const handleBookingSuccess = useCallback(() => {
    toast.success("Session booked successfully!");
    setShowBookingModal(false);
    setSelectedTimeSlot(null);
    setSelectedDuration(null);
  }, []);

  const handleDurationSelect = useCallback((duration: DurationOption) => {
    setSelectedDuration(duration);
  }, []);

  const handleCancelMeeting = useCallback(async (meetingId: string) => {
    if (confirm("Are you sure you want to cancel this meeting?")) {
      cancelMeeting(meetingId);
    }
  }, [cancelMeeting]);

  // Memoize utility functions
  const getStatusBadge = useCallback((status: MeetingStatus) => {
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
  }, []);

  const getMeetingTypeIcon = useCallback(() => {
    // All meetings are video-only now
    return <Video className="h-4 w-4" />;
  }, []);

  const handleCloseBooking = useCallback(() => {
    setShowBookingModal(false);
    setSelectedTimeSlot(null);
  }, []);

  return (
    <main className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Book a Session</h1>
          <p className="text-muted-foreground">
            Schedule your therapy sessions with your assigned therapists
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Therapist Selection */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Select Therapist
                {selectedTherapistId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedTherapistId("");
                      setSelectedDate(undefined);
                    }}
                    className="ml-auto text-xs"
                  >
                    Clear
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {therapistsLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : therapistsError ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Failed to load assigned therapists. Please try refreshing
                    the page.
                  </AlertDescription>
                </Alert>
              ) : therapists.length === 0 ? (
                <Alert role="alert">
                  <AlertCircle className="h-4 w-4" aria-hidden="true" />
                  <AlertDescription>
                    No assigned therapists found. Please contact support.
                  </AlertDescription>
                </Alert>
              ) : (
                therapists.map((therapist, index) => (
                  <Card
                    key={`therapist-${therapist.id}-${index}`}
                    className={`cursor-pointer transition-colors ${
                      selectedTherapistId === therapist.id
                        ? "ring-2 ring-blue-500 bg-blue-50"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => {
                      setSelectedTherapistId(therapist.id);
                      // Reset selected date when changing therapist to show fresh availability
                      setSelectedDate(undefined);
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`Select therapist ${therapist.firstName} ${therapist.lastName}`}
                    aria-pressed={selectedTherapistId === therapist.id}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedTherapistId(therapist.id);
                        setSelectedDate(undefined);
                      }
                    }}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center" aria-hidden="true">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">
                            {therapist.firstName} {therapist.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {therapist.specialties?.join(", ") ||
                              "General Therapy"}
                          </div>
                          {therapist.experience && (
                            <div className="text-xs text-blue-600 mt-1">
                              {therapist.experience}+ years experience
                            </div>
                          )}
                        </div>
                        {selectedTherapistId === therapist.id && (
                          <div className="text-blue-600" aria-label="Selected therapist">
                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center" aria-hidden="true">
                              <span aria-hidden="true">✓</span>
                            </div>
                          </div>
                        )}
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
              ) : (Array.isArray(meetings)
                  ? meetings
                  : meetings?.meetings || []
                ).length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  <Calendar className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p>No upcoming sessions</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(Array.isArray(meetings)
                    ? meetings
                    : meetings?.meetings || []
                  )
                    .slice(0, 5)
                    .map((meeting, index) => (
                      <Card
                        key={`meeting-${meeting.id}-${index}`}
                        className="border border-gray-200"
                      >
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
                                  {new Date(
                                    meeting.startTime
                                  ).toLocaleDateString()}{" "}
                                  at{" "}
                                  {new Date(
                                    meeting.startTime
                                  ).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </div>
                                <div>{meeting.duration} minutes</div>
                              </div>

                              {/* Meeting URL Display */}
                              {meeting.meetingUrl && (
                                <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                                  <div className="flex items-start gap-2">
                                    {meeting.meetingUrl.includes("http") ? (
                                      <Video className="h-3 w-3 text-blue-600 mt-0.5" />
                                    ) : (
                                      <MapPin className="h-3 w-3 text-blue-600 mt-0.5" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-medium text-blue-900">
                                        {meeting.meetingUrl.includes("http")
                                          ? "Video Meeting"
                                          : "Location"}
                                      </p>
                                      <p className="text-xs text-blue-800 break-all">
                                        {meeting.meetingUrl}
                                      </p>
                                      {meeting.meetingUrl.includes("http") && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            window.open(
                                              meeting.meetingUrl,
                                              "_blank"
                                            );
                                          }}
                                          className="text-xs text-blue-600 hover:text-blue-800 underline mt-1 flex items-center gap-1"
                                        >
                                          <ExternalLink className="h-2 w-2" />
                                          Join Meeting
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              {getStatusBadge(
                                meeting.status as unknown as MeetingStatus
                              )}
                              {(meeting.status === "scheduled" ||
                                meeting.status === "confirmed") && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleCancelMeeting(meeting.id)
                                  }
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

        {/* Calendar Section with Duration-First Selection */}
        <div className="lg:col-span-2">
          {selectedTherapistId ? (
            <Suspense fallback={<Skeleton className="h-96 w-full" />}>
              <BookingCalendar
              therapistId={selectedTherapistId}
              onSlotSelect={handleSlotSelect}
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              selectedDuration={selectedDuration}
              onDurationSelect={handleDurationSelect}
            />
            </Suspense>
          ) : (
            <Card>
              <CardContent className="p-8">
                <div className="text-center text-muted-foreground" role="status" aria-live="polite">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-30" aria-hidden="true" />
                  <h3 className="text-lg font-medium mb-2">
                    Select a Therapist
                  </h3>
                  <p>
                    Choose a therapist from the list to view available time
                    slots
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Booking Interface */}
      {selectedTimeSlot && selectedDate && (
        <Suspense fallback={null}>
          <ClientBookingInterface
            therapistId={selectedTherapistId}
            selectedSlot={selectedTimeSlot}
            selectedDate={selectedDate}
            isOpen={showBookingModal}
            onClose={handleCloseBooking}
            onSuccess={handleBookingSuccess}
          />
        </Suspense>
      )}
    </main>
  );
}
