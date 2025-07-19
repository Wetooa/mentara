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
  Video, 
  Phone, 
  MessageSquare,
  Loader2,
  AlertCircle,
  CheckCircle,
  User
} from "lucide-react";
import { Patient } from "@/types/patient";
import { MeetingType } from "@/types/booking";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Image from "next/image";
import { useApi } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSubscriptionStatus } from "@/hooks/billing";

interface SessionSchedulingModalProps {
  patient: Patient | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (meeting: unknown) => void;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

interface SessionDuration {
  value: number;
  label: string;
}

const AVAILABLE_DURATIONS: SessionDuration[] = [
  { value: 30, label: "30 minutes" },
  { value: 45, label: "45 minutes" },
  { value: 60, label: "1 hour" },
  { value: 90, label: "1.5 hours" },
];

const MEETING_TYPES = [
  { value: MeetingType.VIDEO, label: "Video Call", icon: Video },
  { value: MeetingType.AUDIO, label: "Audio Call", icon: Phone },
  { value: MeetingType.CHAT, label: "Chat Session", icon: MessageSquare },
];

// Generate time slots from 9 AM to 6 PM
const generateTimeSlots = (): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  for (let hour = 9; hour < 18; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push({ time, available: true });
    }
  }
  return slots;
};

export function SessionSchedulingModal({
  patient,
  isOpen,
  onClose,
  onSuccess,
}: SessionSchedulingModalProps) {
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
  
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedDuration, setSelectedDuration] = useState<number>(60);
  const [meetingType, setMeetingType] = useState<MeetingType>(MeetingType.VIDEO);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(generateTimeSlots());

  // Create meeting mutation
  const createMeetingMutation = useMutation({
    mutationFn: async (meetingData: {
      clientId: string;
      startTime: string;
      duration: number;
      title: string;
      description?: string;
      meetingType: MeetingType;
    }) => {
      const endTime = new Date(new Date(meetingData.startTime).getTime() + meetingData.duration * 60000).toISOString();
      
      return api.booking.meetings.create({
        clientId: meetingData.clientId,
        startTime: meetingData.startTime,
        endTime,
        title: meetingData.title,
        description: meetingData.description,
        meetingType: meetingData.meetingType,
        status: 'scheduled',
      });
    },
    onSuccess: (meeting) => {
      // Invalidate meetings queries to refresh the lists
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      queryClient.invalidateQueries({ queryKey: ['therapist', 'meetings'] });
      
      toast.success('Session scheduled successfully!');
      onSuccess?.(meeting);
      onClose();
    },
    onError: (error) => {
      console.error('Error creating meeting:', error);
      setError(error instanceof Error ? error.message : 'Failed to schedule session');
      toast.error('Failed to schedule session. Please try again.');
    },
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen && patient) {
      setSelectedDate(undefined);
      setSelectedTime("");
      setSelectedDuration(60);
      setMeetingType(MeetingType.VIDEO);
      setTitle(`Therapy Session - ${patient.name}`);
      setDescription("");
      setError(null);
      setTimeSlots(generateTimeSlots());
    }
  }, [isOpen, patient]);

  // Generate datetime from selected date and time
  const createDateTime = (date: Date, time: string): Date => {
    const [hours, minutes] = time.split(':').map(Number);
    const dateTime = new Date(date);
    dateTime.setHours(hours, minutes, 0, 0);
    return dateTime;
  };

  // Check if current date/time combination is in the past
  const isSlotInPast = (date: Date, time: string): boolean => {
    const slotDateTime = createDateTime(date, time);
    return slotDateTime < new Date();
  };

  const handleScheduleSession = async () => {
    if (!patient || !selectedDate || !selectedTime || !title.trim()) {
      setError("Please fill in all required fields");
      return;
    }

    // Payment verification
    if (!isActive && !isTrial) {
      setError("Active subscription required to schedule sessions. Please upgrade your plan.");
      return;
    }

    if (hasPaymentIssue) {
      setError("Please resolve payment issues before scheduling sessions. Check your billing settings.");
      return;
    }

    if (needsPaymentMethod) {
      setError("Please add a payment method to schedule sessions.");
      return;
    }

    const startTime = createDateTime(selectedDate, selectedTime);
    
    // Check if the selected slot is in the past
    if (isSlotInPast(selectedDate, selectedTime)) {
      setError("Cannot schedule sessions in the past");
      return;
    }

    setError(null);
    
    createMeetingMutation.mutate({
      clientId: patient.id,
      startTime: startTime.toISOString(),
      duration: selectedDuration,
      title: title.trim(),
      description: description.trim(),
      meetingType,
    });
  };

  const isFormValid = selectedDate && 
    selectedTime && 
    title.trim() && 
    !createMeetingMutation.isPending &&
    (isActive || isTrial) && 
    !hasPaymentIssue && 
    !needsPaymentMethod;

  if (!patient) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="truncate">Schedule Session with {patient.name}</span>
          </DialogTitle>
        </DialogHeader>

        {/* Payment Status Alerts */}
        {!subscriptionLoading && (
          <>
            {isPastDue && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Your payment is past due. Please update your payment method to continue scheduling sessions.
                </AlertDescription>
              </Alert>
            )}
            
            {needsPaymentMethod && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please add a payment method to schedule therapy sessions.
                </AlertDescription>
              </Alert>
            )}
            
            {!isActive && !isTrial && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  An active subscription is required to schedule sessions. Please upgrade your plan.
                </AlertDescription>
              </Alert>
            )}
          </>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
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

            {/* Patient Info Card */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      {patient.avatar ? (
                        <Image 
                          src={patient.avatar} 
                          alt={patient.name}
                          width={48}
                          height={48}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-6 w-6 text-primary" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{patient.name}</h3>
                    <p className="text-sm text-muted-foreground truncate">{patient.diagnosis}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        Session {patient.currentSession + 1}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Progress: {patient.progress}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Time Selection and Details */}
          <div className="space-y-4">
            {/* Available Time Slots */}
            {selectedDate && (
              <div>
                <Label className="text-base font-semibold">Available Time Slots</Label>
                <div className="mt-2 grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                  {timeSlots.map((slot) => {
                    const isDisabled = isSlotInPast(selectedDate, slot.time);
                    return (
                      <Button
                        key={slot.time}
                        variant={selectedTime === slot.time ? "default" : "outline"}
                        size="sm"
                        disabled={isDisabled}
                        onClick={() => setSelectedTime(slot.time)}
                        className={`text-xs ${isDisabled ? 'opacity-50' : ''}`}
                      >
                        {slot.time}
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Duration Selection */}
            {selectedTime && (
              <div>
                <Label className="text-base font-semibold">Session Duration</Label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {AVAILABLE_DURATIONS.map((duration) => (
                    <Button
                      key={duration.value}
                      variant={selectedDuration === duration.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedDuration(duration.value)}
                    >
                      {duration.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Meeting Type */}
            {selectedDuration && (
              <div>
                <Label className="text-base font-semibold">Meeting Type</Label>
                <Select value={meetingType} onValueChange={setMeetingType}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MEETING_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="h-4 w-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Session Details */}
            {selectedDuration && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="title">Session Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter session title"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Session Notes (Optional)</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add any preparation notes or session goals..."
                    className="mt-1"
                    rows={3}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Scheduling Summary */}
        {isFormValid && (
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Session Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Patient:</span>
                <div className="font-medium">{patient.name}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Date & Time:</span>
                <div className="font-medium">
                  {selectedDate?.toLocaleDateString()} at {selectedTime}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Duration:</span>
                <div className="font-medium">
                  {AVAILABLE_DURATIONS.find(d => d.value === selectedDuration)?.label}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Type:</span>
                <div className="font-medium">
                  {MEETING_TYPES.find(t => t.value === meetingType)?.label}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 justify-end border-t pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleScheduleSession}
            disabled={!isFormValid}
          >
            {createMeetingMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Scheduling...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Schedule Session
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}