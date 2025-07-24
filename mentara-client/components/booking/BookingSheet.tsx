"use client";

import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
  Loader2,
  AlertCircle,
  CheckCircle,
  X,
} from "lucide-react";
import { TherapistCardData } from "@/types/therapist";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useBookingModal } from "@/hooks/booking/useBookingModal";

interface BookingSheetProps {
  therapist: TherapistCardData | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (meeting: any) => void;
}

export function BookingSheet({
  therapist,
  isOpen,
  onClose,
  onSuccess,
}: BookingSheetProps) {
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
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-4xl overflow-hidden">
        <SheetHeader className="pb-6">
          <div className="flex items-start justify-between">
            <SheetTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <CalendarIcon className="h-6 w-6 text-blue-600" />
              Book Session with {therapist.name}
            </SheetTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        <ScrollArea className="h-full pr-4">
          <div className="space-y-6">
            {/* Payment Status Alerts */}
            {!subscriptionLoading && (
              <div className="space-y-3">
                {isPastDue && (
                  <Alert variant="destructive" className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Your payment is past due. Please update your payment method to continue booking sessions.
                    </AlertDescription>
                  </Alert>
                )}
                
                {needsPaymentMethod && (
                  <Alert variant="destructive" className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Please add a payment method to book therapy sessions.
                    </AlertDescription>
                  </Alert>
                )}
                
                {!isActive && !isTrial && (
                  <Alert variant="destructive" className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      An active subscription is required to book sessions. Please upgrade your plan.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Date Selection */}
              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="p-6">
                  <Label className="text-lg font-semibold mb-4 block text-gray-900">
                    Select Date
                  </Label>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date() || date.getDay() === 0} // Disable past dates and Sundays
                    className="rounded-md border shadow-sm"
                  />
                </CardContent>
              </Card>

              {/* Time Slots and Details */}
              <div className="space-y-6">
                {/* Available Time Slots */}
                {selectedDate && (
                  <Card>
                    <CardContent className="p-6">
                      <Label className="text-lg font-semibold mb-4 block text-gray-900">
                        Available Time Slots
                      </Label>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {slotsLoading && (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                            <span className="ml-2 text-gray-600">Loading available slots...</span>
                          </div>
                        )}

                        {slotsError && (
                          <Alert className="border-orange-200 bg-orange-50">
                            <AlertCircle className="h-4 w-4 text-orange-600" />
                            <AlertDescription className="text-orange-700">
                              Failed to load available slots. Please try again.
                            </AlertDescription>
                          </Alert>
                        )}

                        {!slotsLoading &&
                          !slotsError &&
                          availableSlots.length === 0 && (
                            <div className="text-center py-8">
                              <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                              <p className="text-gray-500 font-medium">No available slots for this date</p>
                              <p className="text-sm text-gray-400 mt-1">Try selecting a different date</p>
                            </div>
                          )}

                        {availableSlots.map((slot: any, index: number) => (
                          <Card
                            key={index}
                            className={`cursor-pointer transition-all duration-200 ${
                              selectedSlot === slot
                                ? "ring-2 ring-blue-500 bg-blue-50 border-blue-200"
                                : "hover:bg-gray-50 hover:shadow-sm"
                            }`}
                            onClick={() => setSelectedSlot(slot)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className={`p-2 rounded-full ${
                                    selectedSlot === slot ? 'bg-blue-100' : 'bg-gray-100'
                                  }`}>
                                    <Clock className={`h-4 w-4 ${
                                      selectedSlot === slot ? 'text-blue-600' : 'text-gray-500'
                                    }`} />
                                  </div>
                                  <span className="font-semibold text-gray-900">
                                    {new Date(slot.startTime).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                </div>
                                <Badge variant="secondary" className="bg-green-100 text-green-700">
                                  {slot.availableDurations.length} duration
                                  {slot.availableDurations.length !== 1 ? "s" : ""}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Duration Selection */}
                {selectedSlot && (
                  <Card>
                    <CardContent className="p-6">
                      <Label className="text-lg font-semibold mb-4 block text-gray-900">
                        Session Duration
                      </Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {selectedSlot.availableDurations.map((duration) => (
                          <Card
                            key={duration.id}
                            className={`cursor-pointer transition-all duration-200 ${
                              selectedDuration?.id === duration.id
                                ? "ring-2 ring-blue-500 bg-blue-50 border-blue-200"
                                : "hover:bg-gray-50 hover:shadow-sm"
                            }`}
                            onClick={() => setSelectedDuration(duration)}
                          >
                            <CardContent className="p-4 text-center">
                              <div className="font-semibold text-gray-900">{duration.name}</div>
                              <div className="text-sm text-gray-600 mt-1">
                                {duration.duration} minutes
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Meeting Type */}
                {selectedDuration && (
                  <Card>
                    <CardContent className="p-6">
                      <Label className="text-lg font-semibold mb-4 block text-gray-900">
                        Meeting Type
                      </Label>
                      <Select
                        value={meetingType}
                        onValueChange={(value: any) => setMeetingType(value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="video">
                            <div className="flex items-center gap-2">
                              <Video className="h-4 w-4 text-blue-600" />
                              <span>Video Call</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Session Details */}
            {selectedDuration && (
              <Card>
                <CardContent className="p-6">
                  <Label className="text-lg font-semibold mb-4 block text-gray-900">
                    Session Details
                  </Label>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                        Session Title
                      </Label>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter session title"
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                        Description (Optional)
                      </Label>
                      <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="What would you like to discuss in this session?"
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Booking Summary */}
            {canBook && (
              <Card className="border-l-4 border-l-green-500 bg-green-50/50">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900">Booking Summary</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-600 block">Therapist</span>
                      <div className="font-semibold text-gray-900">{therapist.name}</div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600 block">Date & Time</span>
                      <div className="font-semibold text-gray-900">
                        {selectedDate?.toLocaleDateString()} at{" "}
                        {selectedSlot &&
                          new Date(selectedSlot.startTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600 block">Duration</span>
                      <div className="font-semibold text-gray-900">{selectedDuration?.name}</div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600 block">Type</span>
                      <div className="font-semibold text-gray-900 flex items-center gap-2">
                        <Video className="h-4 w-4 text-blue-600" />
                        Video Call
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Error Display */}
            {createMeetingError && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {createMeetingError instanceof Error
                    ? createMeetingError.message
                    : "Failed to book session. Please try again."}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </ScrollArea>

        {/* Action Buttons - Fixed at bottom */}
        <div className="sticky bottom-0 bg-white border-t pt-4 mt-6">
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleBooking}
              disabled={!canBook || isCreatingMeeting}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
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
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default BookingSheet;