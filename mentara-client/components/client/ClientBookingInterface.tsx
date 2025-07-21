"use client";

import React, { useState } from "react";
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
import { useApi } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BookingCalendar } from "@/components/booking/BookingCalendar";

interface TherapistProfile {
  id: string;
  name: string;
  title: string;
  specialties: string[];
  hourlyRate: number;
  rating: number;
  avatarUrl?: string;
  bio?: string;
}

interface TimeSlot {
  time: string;
  startTime: string;
  endTime: string;
  availableDurations: Array<{
    id: string;
    name: string;
    duration: number;
  }>;
}

interface BookingStep {
  step: number;
  title: string;
  description: string;
}

interface ClientBookingInterfaceProps {
  therapistId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const BOOKING_STEPS: BookingStep[] = [
  {
    step: 1,
    title: "Select Date & Time",
    description: "Choose when you'd like to meet with your therapist",
  },
  {
    step: 2,
    title: "Session Details",
    description: "Add session information and preferences",
  },
  {
    step: 3,
    title: "Payment & Confirmation",
    description: "Review and confirm your booking",
  },
];

export function ClientBookingInterface({
  therapistId,
  isOpen,
  onClose,
  onSuccess,
}: ClientBookingInterfaceProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<{
    id: string;
    name: string;
    duration: number;
  } | null>(null);
  const [sessionTitle, setSessionTitle] = useState("");
  const [sessionDescription, setSessionDescription] = useState("");
  const [paymentMethodId, setPaymentMethodId] = useState("");

  const api = useApi();
  const queryClient = useQueryClient();

  // Get therapist profile
  const {
    data: therapist,
    isLoading: therapistLoading,
    error: therapistError,
  } = useQuery({
    queryKey: ["therapist-profile", therapistId],
    queryFn: () => api.therapists.getTherapistProfile(therapistId),
    enabled: isOpen && !!therapistId,
  });

  // Get payment methods
  const {
    data: paymentMethods = [],
    isLoading: paymentMethodsLoading,
  } = useQuery({
    queryKey: ["payment-methods"],
    queryFn: () => api.booking.payment.getPaymentMethods(),
    enabled: currentStep === 3,
  });

  // Get durations
  const {
    data: durations = [],
    isLoading: durationsLoading,
  } = useQuery({
    queryKey: ["meeting-durations"],
    queryFn: () => api.booking.durations.getAll(),
    enabled: isOpen,
  });

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: async () => {
      if (!selectedTimeSlot || !selectedDuration || !paymentMethodId) {
        throw new Error("Missing required booking information");
      }

      // Create the meeting first
      const meeting = await api.booking.meetings.create({
        therapistId,
        startTime: selectedTimeSlot.startTime,
        duration: selectedDuration.duration,
        title: sessionTitle || `Session with ${therapist?.name}`,
        description: sessionDescription,
        meetingType: "video",
      });

      // Process payment for the session
      const payment = await api.booking.payment.processSessionPayment({
        meetingId: meeting.id,
        paymentMethodId,
        amount: therapist?.hourlyRate * (selectedDuration.duration / 60) || 0,
        currency: "USD",
      });

      return { meeting, payment };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      queryClient.invalidateQueries({ queryKey: ["available-slots"] });
      toast.success("Session booked successfully!");
      onSuccess?.();
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to book session. Please try again.");
    },
  });

  const resetForm = () => {
    setCurrentStep(1);
    setSelectedDate(undefined);
    setSelectedTimeSlot(null);
    setSelectedDuration(null);
    setSessionTitle("");
    setSessionDescription("");
    setPaymentMethodId("");
  };

  const handleSlotSelect = (date: string, timeSlot: TimeSlot) => {
    setSelectedTimeSlot(timeSlot);
    // Auto-select first duration if only one available
    if (timeSlot.availableDurations.length === 1) {
      setSelectedDuration(timeSlot.availableDurations[0]);
    }
    setCurrentStep(2);
  };

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleConfirmBooking = () => {
    createBookingMutation.mutate();
  };

  const isStep1Complete = selectedTimeSlot && selectedDuration;
  const isStep2Complete = sessionTitle.trim() && isStep1Complete;
  const isStep3Complete = paymentMethodId && isStep2Complete;

  if (therapistLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
                      {selectedDate?.toLocaleDateString()} at {selectedTimeSlot.time}
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
                        <div className="font-medium">{therapist.name}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Session:</span>
                        <div className="font-medium">{sessionTitle}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Date & Time:</span>
                        <div className="font-medium">
                          {selectedDate?.toLocaleDateString()} at {selectedTimeSlot?.time}
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
        {createBookingMutation.error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {createBookingMutation.error instanceof Error
                ? createBookingMutation.error.message
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
                disabled={!isStep3Complete || createBookingMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {createBookingMutation.isPending ? (
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