"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Clock,
  Video,
  User,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { BookingCalendar } from "@/components/booking/BookingCalendar";
import { useClientBooking } from "@/hooks/booking";
import { TimezoneUtils } from "@/lib/utils/timezone";


interface ClientBookingInterfaceProps {
  therapistId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ClientBookingInterface({
  therapistId,
  isOpen,
  onClose,
  onSuccess,
}: ClientBookingInterfaceProps) {
  // Use the comprehensive booking hook that handles all business logic
  const {
    // Form state
    currentStep,
    selectedDate,
    setSelectedDate,
    selectedTimeSlot,
    selectedDuration,
    setSelectedDuration,
    sessionTitle,
    setSessionTitle,
    sessionDescription,
    setSessionDescription,
    paymentMethodId,
    setPaymentMethodId,
    
    // Data
    therapist,
    paymentMethods,
    durations,
    
    // Loading states
    therapistLoading,
    paymentMethodsLoading,
    durationsLoading,
    isBooking,
    
    // Error states
    therapistError,
    bookingError,
    
    // Actions
    handleSlotSelect,
    handleNextStep,
    handlePrevStep,
    handleConfirmBooking,
    
    // Validation
    isStep1Complete,
    isStep2Complete,
    isStep3Complete,
    
    // Constants
    BOOKING_STEPS,
  } = useClientBooking({
    therapistId,
    enabled: isOpen,
    onSuccess,
    onClose,
  });

  if (therapistLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <VisuallyHidden.Root asChild>
            <DialogTitle>Loading Booking Interface</DialogTitle>
          </VisuallyHidden.Root>
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (therapistError || !therapist) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <VisuallyHidden.Root asChild>
            <DialogTitle>Booking Error</DialogTitle>
          </VisuallyHidden.Root>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load therapist information. Please try again.
            </AlertDescription>
          </Alert>
          <Button onClick={onClose} className="w-full">
            Close
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Book Session with {therapist.name}
          </DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          {BOOKING_STEPS.map((step, index) => (
            <div
              key={step.step}
              className={`flex items-center ${
                index < BOOKING_STEPS.length - 1 ? "flex-1" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step.step
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {currentStep > step.step ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    step.step
                  )}
                </div>
                <div className="hidden md:block">
                  <div className="font-medium text-sm">{step.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {step.description}
                  </div>
                </div>
              </div>
              {index < BOOKING_STEPS.length - 1 && (
                <div className="flex-1 h-px bg-gray-200 mx-4" />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Therapist Info Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Therapist Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                    {therapist.avatarUrl ? (
                      <img
                        src={therapist.avatarUrl}
                        alt={therapist.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{therapist.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {therapist.title}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium mb-2">Specialties</div>
                  <div className="flex flex-wrap gap-1">
                    {therapist.specialties?.slice(0, 3).map((specialty) => (
                      <Badge key={specialty} variant="outline" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium">Rate</div>
                  <div className="text-lg font-bold text-green-600">
                    ${therapist.hourlyRate}/hour
                  </div>
                </div>

                {therapist.rating && (
                  <div>
                    <div className="text-sm font-medium">Rating</div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{therapist.rating}</span>
                      <span className="text-yellow-500">★★★★★</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Session Summary */}
            {selectedTimeSlot && selectedDuration && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-lg">Session Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="text-sm text-muted-foreground">Date & Time</div>
                    <div className="font-medium">
                      {selectedDate ? TimezoneUtils.format(selectedDate, 'MMM d, yyyy') : ''} at {selectedTimeSlot.time}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Duration</div>
                    <div className="font-medium">{selectedDuration.name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Type</div>
                    <div className="flex items-center gap-1">
                      <Video className="h-4 w-4" />
                      <span className="font-medium">Video Call</span>
                    </div>
                  </div>
                  <div className="border-t pt-3">
                    <div className="text-sm text-muted-foreground">Total Cost</div>
                    <div className="text-lg font-bold text-green-600">
                      ${((therapist.hourlyRate * selectedDuration.duration) / 60).toFixed(2)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Date & Time Selection */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Select Date & Time
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Choose a convenient time slot for your therapy session
                  </p>
                </div>

                <BookingCalendar
                  therapistId={therapistId}
                  onSlotSelect={handleSlotSelect}
                  selectedDate={selectedDate}
                  onDateSelect={setSelectedDate}
                />

                {/* Duration Selection */}
                {selectedTimeSlot && selectedTimeSlot.availableDurations.length > 1 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Session Duration</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-3">
                        {selectedTimeSlot.availableDurations.map((duration) => (
                          <Card
                            key={duration.id}
                            className={`cursor-pointer transition-colors ${
                              selectedDuration?.id === duration.id
                                ? "ring-2 ring-green-500 bg-green-50"
                                : "hover:bg-gray-50"
                            }`}
                            onClick={() => setSelectedDuration(duration)}
                          >
                            <CardContent className="p-3 text-center">
                              <div className="font-medium">{duration.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {duration.duration} minutes
                              </div>
                              <div className="text-sm font-medium text-green-600">
                                ${((therapist.hourlyRate * duration.duration) / 60).toFixed(2)}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Step 2: Session Details */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Session Details</h3>
                  <p className="text-muted-foreground mb-4">
                    Add information about what you'd like to discuss
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="sessionTitle">Session Title *</Label>
                    <Input
                      id="sessionTitle"
                      value={sessionTitle}
                      onChange={(e) => setSessionTitle(e.target.value)}
                      placeholder="e.g., Initial Consultation, Follow-up Session"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="sessionDescription">
                      What would you like to discuss? (Optional)
                    </Label>
                    <Textarea
                      id="sessionDescription"
                      value={sessionDescription}
                      onChange={(e) => setSessionDescription(e.target.value)}
                      placeholder="Share what you'd like to focus on in this session. This helps your therapist prepare."
                      rows={4}
                      className="mt-1"
                    />
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Your session information is confidential and will only be shared with your therapist.
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            )}

            {/* Step 3: Payment & Confirmation */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Payment & Confirmation</h3>
                  <p className="text-muted-foreground mb-4">
                    Review your booking and complete payment
                  </p>
                </div>

                {/* Payment Method Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Payment Method
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {paymentMethodsLoading ? (
                      <Skeleton className="h-12 w-full" />
                    ) : paymentMethods.length === 0 ? (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          No payment methods available. Please add a payment method first.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <Select value={paymentMethodId} onValueChange={setPaymentMethodId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                        <SelectContent>
                          {paymentMethods.map((method: any) => (
                            <SelectItem key={method.id} value={method.id}>
                              <div className="flex items-center gap-2">
                                <CreditCard className="h-4 w-4" />
                                <span>
                                  {method.cardBrand} •••• {method.cardLast4}
                                  {method.isDefault && (
                                    <Badge variant="secondary" className="ml-2">
                                      Default
                                    </Badge>
                                  )}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </CardContent>
                </Card>

                {/* Final Review */}
                <Card>
                  <CardHeader>
                    <CardTitle>Booking Review</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Therapist:</span>
                        <div className="font-medium">{therapist?.name}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Session:</span>
                        <div className="font-medium">{sessionTitle}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Date & Time:</span>
                        <div className="font-medium">
                          {selectedDate ? TimezoneUtils.format(selectedDate, 'MMM d, yyyy') : ''} at {selectedTimeSlot?.time}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Duration:</span>
                        <div className="font-medium">{selectedDuration?.name}</div>
                      </div>
                    </div>
                    
                    <div className="border-t pt-3">
                      <div className="flex items-center justify-between text-lg font-semibold">
                        <span>Total Amount:</span>
                        <span className="text-green-600">
                          ${selectedDuration ? ((therapist.hourlyRate * selectedDuration.duration) / 60).toFixed(2) : '0.00'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>

        {/* Error Display */}
        {bookingError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {bookingError instanceof Error
                ? bookingError.message
                : "Failed to book session. Please try again."}
            </AlertDescription>
          </Alert>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between border-t pt-4">
          <Button
            variant="outline"
            onClick={currentStep === 1 ? onClose : handlePrevStep}
          >
            {currentStep === 1 ? (
              "Cancel"
            ) : (
              <>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </>
            )}
          </Button>

          <div className="flex gap-2">
            {currentStep < 3 && (
              <Button
                onClick={handleNextStep}
                disabled={
                  (currentStep === 1 && !isStep1Complete) ||
                  (currentStep === 2 && !isStep2Complete)
                }
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}

            {currentStep === 3 && (
              <Button
                onClick={handleConfirmBooking}
                disabled={!isStep3Complete || isBooking}
                className="bg-green-600 hover:bg-green-700"
              >
                {isBooking ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Booking...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirm Booking
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}