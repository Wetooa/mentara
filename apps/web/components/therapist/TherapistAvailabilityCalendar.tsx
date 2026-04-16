"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  Clock,
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  Save,
  Users,
} from "lucide-react";
import { useTherapistAvailability } from "@/hooks/therapist/useTherapistAvailability";
import { toast } from "sonner";

interface AvailabilitySlot {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  timezone: string;
  isAvailable: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const DAYS_OF_WEEK = [
  { value: "0", label: "Sunday" },
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
  { value: "6", label: "Saturday" },
];

const COMMON_TIMEZONES = [
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "Eastern Time" },
  { value: "America/Chicago", label: "Central Time" },
  { value: "America/Denver", label: "Mountain Time" },
  { value: "America/Los_Angeles", label: "Pacific Time" },
  { value: "Europe/London", label: "London" },
  { value: "Europe/Paris", label: "Paris" },
  { value: "Asia/Tokyo", label: "Tokyo" },
  { value: "Asia/Shanghai", label: "Shanghai" },
  { value: "Australia/Sydney", label: "Sydney" },
];

const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minute = i % 2 === 0 ? "00" : "30";
  const time = `${hour.toString().padStart(2, "0")}:${minute}`;
  const label = new Date(`1970-01-01T${time}`).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
  return { value: time, label };
});

// Helper functions for time conversion
const timeToSliderValue = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 2 + (minutes >= 30 ? 1 : 0); // 30-min intervals (0-47)
};

const sliderValueToTime = (value: number): string => {
  const hours = Math.floor(value / 2);
  const minutes = value % 2 === 0 ? "00" : "30";
  return `${hours.toString().padStart(2, "0")}:${minutes}`;
};

const formatTimeDisplay = (timeStr: string): string => {
  const date = new Date(`1970-01-01T${timeStr}`);
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
};

export function TherapistAvailabilityCalendar() {
  const {
    // State
    isAddDialogOpen,
    setIsAddDialogOpen,
    editingSlot,
    setEditingSlot,
    formData,
    setFormData,

    // Data
    availability = [],
    isLoading,
    error,

    // Actions
    createAvailability,
    updateAvailability,
    deleteAvailability,

    // Mutations loading states
    isCreating,
    isUpdating,
    isDeleting,

    // Utilities
    resetForm,
    handleEditSlot,
  } = useTherapistAvailability();

  // Slider state for time range
  const [timeRange, setTimeRange] = React.useState<number[]>([18, 34]); // 9:00 AM - 5:00 PM default

  // Update slider when form data changes
  React.useEffect(() => {
    if (formData.startTime && formData.endTime) {
      setTimeRange([
        timeToSliderValue(formData.startTime),
        timeToSliderValue(formData.endTime),
      ]);
    }
  }, [formData.startTime, formData.endTime]);

  // Update form data when slider changes
  const handleTimeRangeChange = (values: number[]) => {
    setTimeRange(values);
    setFormData({
      ...formData,
      startTime: sliderValueToTime(values[0]),
      endTime: sliderValueToTime(values[1]),
    });
  };

  // Get occupied time ranges for the selected day (excluding current editing slot)
  const getOccupiedRanges = (): Array<{ start: number; end: number }> => {
    if (!formData.dayOfWeek) return [];

    const daySlots = availability.filter(
      (slot) =>
        slot.dayOfWeek === formData.dayOfWeek &&
        (!editingSlot || slot.id !== editingSlot.id)
    );

    return daySlots.map((slot) => ({
      start: timeToSliderValue(slot.startTime),
      end: timeToSliderValue(slot.endTime),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.dayOfWeek || !formData.startTime || !formData.endTime) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.startTime >= formData.endTime) {
      toast.error("End time must be after start time");
      return;
    }

    const submitData = {
      ...formData,
      notes: formData.notes || undefined,
    };

    try {
      if (editingSlot) {
        await updateAvailability(editingSlot.id, submitData);
      } else {
        await createAvailability(submitData);
      }
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleEdit = (slot: AvailabilitySlot) => {
    handleEditSlot(slot);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAvailability(id);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleCancelEdit = () => {
    setEditingSlot(null);
    setIsAddDialogOpen(false);
    resetForm();
  };

  // Group availability by day of week
  const availabilityByDay = availability.reduce(
    (acc, slot) => {
      if (!acc[slot.dayOfWeek]) {
        acc[slot.dayOfWeek] = [];
      }
      acc[slot.dayOfWeek].push(slot);
      return acc;
    },
    {} as Record<string, AvailabilitySlot[]>
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Availability Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Availability Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load availability data. Please try again.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Calculate total hours per week
  const totalHoursPerWeek = availability.reduce((total, slot) => {
    if (!slot.isAvailable) return total;
    const [startHour, startMin] = slot.startTime.split(":").map(Number);
    const [endHour, endMin] = slot.endTime.split(":").map(Number);
    const hours = endHour + endMin / 60 - (startHour + startMin / 60);
    return total + hours;
  }, 0);

  // Calculate hours per day
  const hoursPerDay: Record<string, number> = {};
  DAYS_OF_WEEK.forEach((day) => {
    const daySlots = availabilityByDay[day.value] || [];
    hoursPerDay[day.value] = daySlots.reduce((total, slot) => {
      if (!slot.isAvailable) return total;
      const [startHour, startMin] = slot.startTime.split(":").map(Number);
      const [endHour, endMin] = slot.endTime.split(":").map(Number);
      const hours = endHour + endMin / 60 - (startHour + startMin / 60);
      return total + hours;
    }, 0);
  });

  const handleDayClick = (dayValue: string) => {
    const defaultStart = "09:00";
    const defaultEnd = "17:00";
    setFormData({
      ...formData,
      dayOfWeek: dayValue,
      startTime: defaultStart,
      endTime: defaultEnd,
    });
    setTimeRange([
      timeToSliderValue(defaultStart),
      timeToSliderValue(defaultEnd),
    ]);
    setIsAddDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Weekly Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-secondary rounded-xl">
                <Clock className="h-6 w-6 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Weekly Hours</p>
                <p className="text-3xl font-bold text-secondary">
                  {totalHoursPerWeek.toFixed(1)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary rounded-xl">
                <Calendar className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Days</p>
                <p className="text-3xl font-bold text-primary">
                  {Object.values(hoursPerDay).filter((h) => h > 0).length}/7
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-secondary rounded-xl">
                <Users className="h-6 w-6 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Time Slots</p>
                <p className="text-3xl font-bold text-secondary">
                  {availability.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-md hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <div className="p-2 bg-secondary rounded-lg">
                  <Calendar className="h-5 w-5 text-secondary-foreground" />
                </div>
                <span className="text-gray-900">Weekly Availability Calendar</span>
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1 ml-11">
                Visual overview of your weekly schedule •{" "}
                <span className="font-semibold text-secondary">
                  {totalHoursPerWeek.toFixed(1)}
                </span>{" "}
                hours/week
              </p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2 bg-secondary hover:bg-secondary/90 shadow-md">
                  <Plus className="h-4 w-4" />
                  Add Slot
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle className="text-2xl flex items-center gap-3">
                    <div className="p-2 bg-secondary rounded-lg">
                      <Calendar className="h-5 w-5 text-secondary-foreground" />
                    </div>
                    <span className="text-gray-900">
                      {editingSlot
                        ? "Edit Availability Slot"
                        : "Add Availability Slot"}
                    </span>
                  </DialogTitle>
                  <p className="text-sm text-gray-600 ml-11">
                    {editingSlot
                      ? "Update your availability details"
                      : "Define when you're available for client sessions"}
                  </p>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                  {/* Day Selection - Button Group */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-gray-900">
                      Day of Week *
                    </Label>
                    <div className="grid grid-cols-4 gap-2">
                      {DAYS_OF_WEEK.map((day, idx) => (
                        <Button
                          key={day.value}
                          type="button"
                          variant={
                            formData.dayOfWeek === day.value
                              ? "default"
                              : "outline"
                          }
                          onClick={() =>
                            setFormData({ ...formData, dayOfWeek: day.value })
                          }
                          className={`h-11 ${
                            formData.dayOfWeek === day.value
                              ? idx === 1 || idx === 3 || idx === 5
                                ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                                : "bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                              : "hover:bg-secondary/10 hover:border-secondary/30"
                          }`}
                        >
                          {day.label.slice(0, 3)}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Time Range Slider */}
                  <div className="space-y-4">
                    <Label className="text-sm font-semibold text-gray-900">
                      Time Range *
                    </Label>

                    {/* Selected Time Display */}
                    <div className="flex items-center justify-between p-3 bg-secondary/5 rounded-lg border border-secondary/20">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-secondary rounded-md">
                          <Clock className="h-3.5 w-3.5 text-secondary-foreground" />
                        </div>
                        <span className="text-sm font-bold text-gray-900">
                          {formatTimeDisplay(formData.startTime || "09:00")}
                        </span>
                        <span className="text-sm text-gray-600">to</span>
                        <span className="text-sm font-bold text-gray-900">
                          {formatTimeDisplay(formData.endTime || "17:00")}
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-secondary/10 text-secondary border-secondary/30"
                      >
                        {(() => {
                          const [startHour, startMin] = (
                            formData.startTime || "09:00"
                          )
                            .split(":")
                            .map(Number);
                          const [endHour, endMin] = (
                            formData.endTime || "17:00"
                          )
                            .split(":")
                            .map(Number);
                          const duration =
                            endHour + endMin / 60 - (startHour + startMin / 60);
                          return `${duration.toFixed(1)}h`;
                        })()}
                      </Badge>
                    </div>

                    {/* Visual Timeline with Occupied Slots */}
                    <div className="space-y-3">
                      {/* Hour markers */}
                      <div className="relative h-6">
                        <div className="absolute inset-0 flex justify-between text-xs text-gray-500">
                          <span>12 AM</span>
                          <span>6 AM</span>
                          <span>12 PM</span>
                          <span>6 PM</span>
                          <span>12 AM</span>
                        </div>
                      </div>

                      {/* Occupied slots visualization */}
                      {formData.dayOfWeek && (
                        <div className="relative h-8 bg-gray-100 rounded-lg mb-2">
                          {getOccupiedRanges().map((range, idx) => {
                            const leftPercent = (range.start / 48) * 100;
                            const widthPercent =
                              ((range.end - range.start) / 48) * 100;
                            return (
                              <div
                                key={idx}
                                className="absolute top-0 h-full bg-red-200 border-l-2 border-r-2 border-red-400 rounded"
                                style={{
                                  left: `${leftPercent}%`,
                                  width: `${widthPercent}%`,
                                }}
                                title="Already occupied"
                              />
                            );
                          })}
                          {/* Current selection indicator */}
                          <div
                            className="absolute top-0 h-full bg-secondary/30 border-l-2 border-r-2 border-secondary rounded"
                            style={{
                              left: `${(timeRange[0] / 48) * 100}%`,
                              width: `${((timeRange[1] - timeRange[0]) / 48) * 100}%`,
                            }}
                          />
                        </div>
                      )}

                      {/* Range Slider */}
                      <div className="px-1">
                        <Slider
                          value={timeRange}
                          onValueChange={handleTimeRangeChange}
                          min={0}
                          max={47}
                          step={1}
                          className="w-full"
                        />
                      </div>

                      {/* Quick time presets */}
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleTimeRangeChange([18, 34])}
                          className="text-xs"
                        >
                          9 AM - 5 PM
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleTimeRangeChange([16, 32])}
                          className="text-xs"
                        >
                          8 AM - 4 PM
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleTimeRangeChange([20, 36])}
                          className="text-xs"
                        >
                          10 AM - 6 PM
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleTimeRangeChange([26, 40])}
                          className="text-xs"
                        >
                          1 PM - 8 PM
                        </Button>
                      </div>
                    </div>

                    {/* Warning for overlaps */}
                    {formData.dayOfWeek &&
                      getOccupiedRanges().some(
                        (range) =>
                          timeRange[0] < range.end && timeRange[1] > range.start
                      ) && (
                        <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-red-600" />
                            <p className="text-sm text-red-700">
                              This time range overlaps with existing
                              availability
                            </p>
                          </div>
                        </div>
                      )}
                  </div>

                  {/* Timezone */}
                  <div className="space-y-3">
                    <Label
                      htmlFor="timezone"
                      className="text-sm font-semibold text-gray-900"
                    >
                      Timezone
                    </Label>
                    <Select
                      value={formData.timezone}
                      onValueChange={(value) =>
                        setFormData({ ...formData, timezone: value })
                      }
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COMMON_TIMEZONES.map((tz) => (
                          <SelectItem key={tz.value} value={tz.value}>
                            {tz.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Notes */}
                  <div className="space-y-3">
                    <Label
                      htmlFor="notes"
                      className="text-sm font-semibold text-gray-900"
                    >
                      Notes{" "}
                      <span className="text-xs text-gray-500 font-normal">
                        (Optional)
                      </span>
                    </Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      placeholder="e.g., Available for regular client sessions, Preferred for new clients, etc."
                      rows={3}
                      className="resize-none"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancelEdit}
                      className="min-w-24"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isCreating || isUpdating}
                      className="flex items-center gap-2 bg-secondary hover:bg-secondary/90 min-w-24"
                    >
                      {isCreating || isUpdating ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          {editingSlot ? "Updating..." : "Creating..."}
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          {editingSlot ? "Update Slot" : "Add Slot"}
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {availability.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-secondary/10 p-6 rounded-2xl w-fit mx-auto mb-6">
                <Calendar className="h-16 w-16 text-secondary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No Availability Set
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Set your weekly availability to let clients book sessions with
                you. Define your working hours for each day of the week.
              </p>
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                className="bg-secondary hover:bg-secondary/90 shadow-md"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Availability
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {DAYS_OF_WEEK.map((day) => {
                const daySlots = availabilityByDay[day.value] || [];
                const dayHours = hoursPerDay[day.value] || 0;

                return (
                  <div
                    key={day.value}
                    className="border border-gray-200 rounded-xl p-5 bg-white hover:border-gray-300 hover:shadow-md transition-all"
                  >
                     {/* Day Header - Clickable */}
                     <div
                       className="flex items-center justify-between mb-4 cursor-pointer group"
                       onClick={() => handleDayClick(day.value)}
                     >
                       <div className="flex items-center gap-3">
                         <div
                           className={`w-2 h-12 rounded-full transition-colors ${dayHours > 0 ? "bg-secondary" : "bg-gray-200 group-hover:bg-secondary/30"}`}
                         ></div>
                         <div>
                           <h4 className="font-bold text-lg text-gray-900 group-hover:text-secondary transition-colors">
                             {day.label}
                           </h4>
                           <p className="text-sm text-gray-600">
                             {dayHours > 0
                               ? `${dayHours.toFixed(1)} hours available`
                               : "Click to add availability"}
                           </p>
                         </div>
                       </div>
                       <div className="flex items-center gap-2">
                         {dayHours > 0 && (
                           <Badge
                             variant="outline"
                             className="bg-gray-50 text-gray-700 border-gray-200"
                           >
                             {daySlots.length}{" "}
                             {daySlots.length === 1 ? "slot" : "slots"}
                           </Badge>
                         )}
                         <div className="p-1 bg-secondary/10 rounded-md group-hover:bg-secondary/20 transition-colors">
                           <Plus className="h-4 w-4 text-secondary transition-colors" />
                         </div>
                       </div>
                     </div>

                    {/* Time Slots */}
                    {daySlots.length === 0 ? (
                      <div
                        className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-200 cursor-pointer hover:border-gray-300 hover:bg-gray-100 transition-all"
                        onClick={() => handleDayClick(day.value)}
                      >
                        <Clock className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">
                          Click to add time slots
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {daySlots.map((slot, index) => {
                          const [startHour, startMin] = slot.startTime
                            .split(":")
                            .map(Number);
                          const [endHour, endMin] = slot.endTime
                            .split(":")
                            .map(Number);
                          const duration =
                            endHour + endMin / 60 - (startHour + startMin / 60);

                          return (
                          <div
                            key={slot.id}
                               className="group relative flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-secondary/30 hover:shadow-sm transition-all"
                          >
                              {/* Time Block Visualization */}
                              <div className="flex items-center gap-4 flex-1">
                            <div className="flex items-center gap-3">
                                  <div className="p-2.5 bg-secondary rounded-lg">
                                    <Clock className="h-5 w-5 text-secondary-foreground" />
                                  </div>
                              <div>
                                    <p className="font-bold text-base text-gray-900">
                                      {new Date(
                                        `1970-01-01T${slot.startTime}`
                                      ).toLocaleTimeString([], {
                                        hour: "numeric",
                                        minute: "2-digit",
                                      })}
                                      {" → "}
                                      {new Date(
                                        `1970-01-01T${slot.endTime}`
                                      ).toLocaleTimeString([], {
                                        hour: "numeric",
                                        minute: "2-digit",
                                      })}
                                    </p>
                                    <div className="flex items-center gap-3 mt-1">
                                      <p className="text-xs text-gray-600">
                                  {slot.timezone}
                                </p>
                                      <Badge
                                        variant="outline"
                                        className="text-xs bg-gray-100 text-gray-700 border-gray-200"
                                      >
                                        {duration.toFixed(1)}h
                                      </Badge>
                                    </div>
                                {slot.notes && (
                                      <p className="text-xs text-gray-600 mt-2 italic">
                                        "{slot.notes}"
                                  </p>
                                )}
                              </div>
                            </div>
                              </div>

                              {/* Actions */}
                            <div className="flex items-center gap-2">
                              <Badge
                                  className={
                                    slot.isAvailable
                                      ? "bg-green-100 text-green-700 border-green-200"
                                      : "bg-gray-100 text-gray-600"
                                  }
                                >
                                  {slot.isAvailable ? "Available" : "Blocked"}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(slot)}
                                  className="h-9 w-9 p-0 hover:bg-secondary/10 hover:text-secondary"
                              >
                                  <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                      className="h-9 w-9 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                                  >
                                      <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                        Delete Availability Slot?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will remove the{" "}
                                        {new Date(
                                          `1970-01-01T${slot.startTime}`
                                        ).toLocaleTimeString([], {
                                          hour: "numeric",
                                          minute: "2-digit",
                                        })}{" "}
                                        -{" "}
                                        {new Date(
                                          `1970-01-01T${slot.endTime}`
                                        ).toLocaleTimeString([], {
                                          hour: "numeric",
                                          minute: "2-digit",
                                        })}{" "}
                                        slot on {day.label}. This action cannot
                                        be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(slot.id)}
                                      disabled={isDeleting}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      {isDeleting ? "Deleting..." : "Delete"}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
