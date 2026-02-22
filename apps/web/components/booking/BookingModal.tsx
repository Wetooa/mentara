"use client";

import React from "react";
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
  MapPin,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { TherapistCardData } from "@/types/therapist";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useBookingModal } from "@/hooks/booking/useBookingModal";

interface BookingModalProps {
  therapist: TherapistCardData | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (meeting: any) => void;
}

export default function BookingModal({
  therapist,
  isOpen,
  onClose,
  onSuccess,
}: BookingModalProps) {
  const {
    // State
    selectedDate,
    setSelectedDate,
    selectedSlot,
    setSelectedSlot,
    selectedDuration,
    setSelectedDuration,
    meetingType,
    setMeetingType,
    title,
    setTitle,
    description,
    setDescription,
    
    // Data
    availableSlots,
    
    // Loading states
    slotsLoading,
    slotsError,
    subscriptionLoading,
    
    // Payment status
    isActive,
    isTrial,
    isPastDue,
    hasPaymentIssue,
    needsPaymentMethod,
    
    // Actions
    handleBooking,
    
    // Mutations
    isCreatingMeeting,
    createMeetingError,
    
    // Validation
    canBook,
  } = useBookingModal(therapist, isOpen, onSuccess, onClose);

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

                  {availableSlots.map((slot: any, index: number) => (
                    <Card
                      key={index}
                      className={`cursor-pointer transition-colors ${
                        selectedSlot === slot
                          ? "ring-2 ring-blue-500 bg-blue-50"
                          : "hover:bg-gray-50"
                      }`}
                      onClick={() => setSelectedSlot(slot)}
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
                <Label htmlFor="session-type" className="text-base font-semibold">Select Session Type</Label>
                <Select
                  value={meetingType}
                  onValueChange={(value: string) => setMeetingType(value as "online" | "in-person")}
                >
                  <SelectTrigger id="session-type" className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">
                      <div className="flex items-center gap-2">
                        <Video className="h-4 w-4" />
                        Teletherapy
                      </div>
                    </SelectItem>
                    <SelectItem value="in-person">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        In-Person
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
        {canBook && (
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
                  {meetingType === "in-person" ? "In-Person" : "Teletherapy"}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {createMeetingError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {createMeetingError instanceof Error
                ? createMeetingError.message
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
            disabled={!canBook || isCreatingMeeting}
          >
            {isCreatingMeeting ? (
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
