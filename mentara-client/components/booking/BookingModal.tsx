"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  Phone,
  MessageSquare,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useApi } from "@/lib/api";
import {
  AvailableSlot,
  MeetingDuration,
  MeetingType,
  CreateMeetingRequest,
} from "@/types/booking";
import { TherapistCardData } from "@/types/therapist";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSubscriptionStatus } from "@/hooks/billing";

interface BookingModalProps {
  therapist: TherapistCardData | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (meeting: CreateMeetingRequest) => void;
}

export default function BookingModal({
  therapist,
  isOpen,
  onClose,
  onSuccess,
}: BookingModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [selectedDuration, setSelectedDuration] =
    useState<MeetingDuration | null>(null);
  const [meetingType, setMeetingType] = useState<MeetingType>(
    MeetingType.VIDEO
  );
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const api = useApi();
  const queryClient = useQueryClient();
  
  // Payment verification
  const {
    isActive,
    isTrial,
    isPastDue,
    hasPaymentIssue,
    needsPaymentMethod,
    isLoading: subscriptionLoading
  } = useSubscriptionStatus();

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen && therapist) {
      setSelectedDate(undefined);
      setSelectedSlot(null);
      setSelectedDuration(null);
      setMeetingType(MeetingType.VIDEO);
      setTitle(`Session with ${therapist.name}`);
      setDescription("");
    }
  }, [isOpen, therapist]);

  // Get available durations
  // const { data: durations = [] } = useQuery({
  //   queryKey: ["meeting-durations"],
  //   queryFn: () => api.booking.durations.getAll(),
  //   enabled: isOpen,
  // });

  // Get available slots for selected date
  const {
    data: availableSlots = [],
    isLoading: slotsLoading,
    error: slotsError,
  } = useQuery({
    queryKey: ["available-slots", therapist?.id, selectedDate?.toISOString()],
    queryFn: () => {
      if (!therapist || !selectedDate) return [];
      return api.booking.availability.getSlots(
        therapist.id,
        selectedDate.toISOString().split("T")[0]
      );
    },
    enabled: !!(therapist && selectedDate),
  });

  // Create meeting mutation
  const createMeetingMutation = useMutation({
    mutationFn: (meetingData: CreateMeetingRequest) => {
      return api.booking.meetings.create(meetingData);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      queryClient.invalidateQueries({ queryKey: ["available-slots"] });
      onSuccess?.(data);
      onClose();
    },
  });

  const handleBooking = () => {
    if (!therapist || !selectedSlot || !selectedDuration || !selectedDate) {
      return;
    }

    // Payment verification
    if (!isActive && !isTrial) {
      toast.error("Active subscription required to book sessions. Please upgrade your plan.");
      return;
    }

    if (hasPaymentIssue) {
      toast.error("Please resolve payment issues before booking sessions. Check your billing settings.");
      return;
    }

    if (needsPaymentMethod) {
      toast.error("Please add a payment method to book sessions.");
      return;
    }

    const startTime = new Date(selectedSlot.startTime);

    const meetingData: CreateMeetingRequest = {
      therapistId: therapist.id,
      startTime: startTime.toISOString(),
      duration: selectedDuration.duration,
      title: title || `Session with ${therapist.name}`,
      description,
      meetingType,
    };

    createMeetingMutation.mutate(meetingData);
  };

  const isFormValid =
    selectedDate && 
    selectedSlot && 
    selectedDuration && 
    title.trim() &&
    (isActive || isTrial) && 
    !hasPaymentIssue && 
    !needsPaymentMethod;

  if (!therapist) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Book Session with {therapist.name}
          </DialogTitle>
        </DialogHeader>

        {/* Payment Status Alerts */}
        {!subscriptionLoading && (
          <>
            {isPastDue && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Your payment is past due. Please update your payment method to continue booking sessions.
                </AlertDescription>
              </Alert>
            )}
            
            {needsPaymentMethod && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please add a payment method to book therapy sessions.
                </AlertDescription>
              </Alert>
            )}
            
            {!isActive && !isTrial && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  An active subscription is required to book sessions. Please upgrade your plan.
                </AlertDescription>
              </Alert>
            )}
          </>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Date Selection */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold">Select Date</Label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date() || date.getDay() === 0} // Disable past dates and Sundays
                className="rounded-md border mt-2"
              />
            </div>
          </div>

          {/* Time Slots and Details */}
          <div className="space-y-4">
            {/* Available Time Slots */}
            {selectedDate && (
              <div>
                <Label className="text-base font-semibold">
                  Available Time Slots
                </Label>
                <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
                  {slotsLoading && (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span className="ml-2">Loading available slots...</span>
                    </div>
                  )}

                  {slotsError && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Failed to load available slots. Please try again.
                      </AlertDescription>
                    </Alert>
                  )}

                  {!slotsLoading &&
                    !slotsError &&
                    availableSlots.length === 0 && (
                      <div className="text-center py-4 text-muted-foreground">
                        No available slots for this date.
                      </div>
                    )}

                  {availableSlots.map((slot: AvailableSlot, index: number) => (
                    <Card
                      key={index}
                      className={`cursor-pointer transition-colors ${
                        selectedSlot === slot
                          ? "ring-2 ring-blue-500 bg-blue-50"
                          : "hover:bg-gray-50"
                      }`}
                      onClick={() => {
                        setSelectedSlot(slot);
                        setSelectedDuration(null);
                      }}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              {new Date(slot.startTime).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <Badge variant="secondary">
                            {slot.availableDurations.length} duration
                            {slot.availableDurations.length !== 1 ? "s" : ""}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Duration Selection */}
            {selectedSlot && (
              <div>
                <Label className="text-base font-semibold">
                  Session Duration
                </Label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {selectedSlot.availableDurations.map((duration) => (
                    <Card
                      key={duration.id}
                      className={`cursor-pointer transition-colors ${
                        selectedDuration?.id === duration.id
                          ? "ring-2 ring-blue-500 bg-blue-50"
                          : "hover:bg-gray-50"
                      }`}
                      onClick={() => setSelectedDuration(duration)}
                    >
                      <CardContent className="p-3 text-center">
                        <div className="font-medium">{duration.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {duration.duration} minutes
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Meeting Type */}
            {selectedDuration && (
              <div>
                <Label className="text-base font-semibold">Meeting Type</Label>
                <Select
                  value={meetingType}
                  onValueChange={(value: MeetingType) => setMeetingType(value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={MeetingType.VIDEO}>
                      <div className="flex items-center gap-2">
                        <Video className="h-4 w-4" />
                        Video Call
                      </div>
                    </SelectItem>
                    <SelectItem value={MeetingType.AUDIO}>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Audio Call
                      </div>
                    </SelectItem>
                    <SelectItem value={MeetingType.CHAT}>
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Chat Session
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Session Details */}
            {selectedDuration && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="title">Session Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter session title"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What would you like to discuss in this session?"
                    className="mt-1"
                    rows={3}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Booking Summary */}
        {isFormValid && (
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Booking Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Therapist:</span>
                <div className="font-medium">{therapist.name}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Date & Time:</span>
                <div className="font-medium">
                  {selectedDate?.toLocaleDateString()} at{" "}
                  {selectedSlot &&
                    new Date(selectedSlot.startTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Duration:</span>
                <div className="font-medium">{selectedDuration?.name}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Type:</span>
                <div className="font-medium">
                  {meetingType === MeetingType.VIDEO && "Video Call"}
                  {meetingType === MeetingType.AUDIO && "Audio Call"}
                  {meetingType === MeetingType.CHAT && "Chat Session"}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {createMeetingMutation.error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {createMeetingMutation.error instanceof Error
                ? createMeetingMutation.error.message
                : "Failed to book session. Please try again."}
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 justify-end border-t pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleBooking}
            disabled={!isFormValid || createMeetingMutation.isPending}
          >
            {createMeetingMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Booking...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Book Session
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
