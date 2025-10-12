"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
    const [startHour, startMin] = slot.startTime.split(':').map(Number);
    const [endHour, endMin] = slot.endTime.split(':').map(Number);
    const hours = (endHour + endMin / 60) - (startHour + startMin / 60);
    return total + hours;
  }, 0);

  // Calculate hours per day
  const hoursPerDay: Record<string, number> = {};
  DAYS_OF_WEEK.forEach(day => {
    const daySlots = availabilityByDay[day.value] || [];
    hoursPerDay[day.value] = daySlots.reduce((total, slot) => {
      if (!slot.isAvailable) return total;
      const [startHour, startMin] = slot.startTime.split(':').map(Number);
      const [endHour, endMin] = slot.endTime.split(':').map(Number);
      const hours = (endHour + endMin / 60) - (startHour + startMin / 60);
      return total + hours;
    }, 0);
  });

  return (
    <div className="space-y-6">
      {/* Weekly Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-2 border-secondary/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-secondary rounded-xl">
                <Clock className="h-6 w-6 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Weekly Hours</p>
                <p className="text-3xl font-bold text-gray-900">{totalHoursPerWeek.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-2 border-secondary/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-secondary/80 rounded-xl">
                <Calendar className="h-6 w-6 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Days</p>
                <p className="text-3xl font-bold text-gray-900">
                  {Object.values(hoursPerDay).filter(h => h > 0).length}/7
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-2 border-secondary/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-secondary/60 rounded-xl">
                <Users className="h-6 w-6 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Time Slots</p>
                <p className="text-3xl font-bold text-gray-900">{availability.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-2 hover:border-secondary/30 transition-all">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Calendar className="h-5 w-5 text-secondary" />
                Weekly Availability Calendar
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Visual overview of your weekly schedule • {totalHoursPerWeek.toFixed(1)} hours/week
              </p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2 bg-secondary hover:bg-secondary/90">
                  <Plus className="h-4 w-4" />
                  Add Slot
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingSlot ? "Edit Availability" : "Add Availability"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="dayOfWeek">Day of Week *</Label>
                    <Select
                      value={formData.dayOfWeek}
                      onValueChange={(value) =>
                        setFormData({ ...formData, dayOfWeek: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select day" />
                      </SelectTrigger>
                      <SelectContent>
                        {DAYS_OF_WEEK.map((day, _) => (
                          <SelectItem key={day.value} value={day.value}>
                            {day.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startTime">Start Time *</Label>
                      <Select
                        value={formData.startTime}
                        onValueChange={(value) =>
                          setFormData({ ...formData, startTime: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Start" />
                        </SelectTrigger>
                        <SelectContent>
                          {TIME_SLOTS.map((slot) => (
                            <SelectItem key={slot.value} value={slot.value}>
                              {slot.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="endTime">End Time *</Label>
                      <Select
                        value={formData.endTime}
                        onValueChange={(value) =>
                          setFormData({ ...formData, endTime: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="End" />
                        </SelectTrigger>
                        <SelectContent>
                          {TIME_SLOTS.map((slot) => (
                            <SelectItem key={slot.value} value={slot.value}>
                              {slot.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select
                      value={formData.timezone}
                      onValueChange={(value) =>
                        setFormData({ ...formData, timezone: value })
                      }
                    >
                      <SelectTrigger>
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
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      placeholder="Add any notes about this availability slot..."
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isCreating || isUpdating}
                      className="flex items-center gap-2"
                    >
                      {isCreating || isUpdating ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          {editingSlot ? "Updating..." : "Creating..."}
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          {editingSlot ? "Update" : "Create"}
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
              <div className="bg-gradient-to-br from-secondary/20 to-secondary/10 p-6 rounded-2xl w-fit mx-auto mb-6">
                <Calendar className="h-16 w-16 text-secondary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Availability Set</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Set your weekly availability to let clients book sessions with you. 
                Define your working hours for each day of the week.
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)} className="bg-secondary hover:bg-secondary/90 shadow-md">
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
                  <div key={day.value} className="border-2 border-gray-200 rounded-xl p-5 bg-gradient-to-r from-white to-gray-50 hover:border-secondary/30 transition-all">
                    {/* Day Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-12 rounded-full ${dayHours > 0 ? 'bg-secondary' : 'bg-gray-200'}`}></div>
                        <div>
                          <h4 className="font-bold text-lg text-gray-900">{day.label}</h4>
                          <p className="text-sm text-gray-600">
                            {dayHours > 0 ? `${dayHours.toFixed(1)} hours available` : 'Not available'}
                          </p>
                        </div>
                      </div>
                      {dayHours > 0 && (
                        <Badge className="bg-secondary/10 text-secondary border-secondary/30">
                          {daySlots.length} {daySlots.length === 1 ? 'slot' : 'slots'}
                        </Badge>
                      )}
                    </div>

                    {/* Time Slots */}
                    {daySlots.length === 0 ? (
                      <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                        <Clock className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No time slots set for this day</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {daySlots.map((slot, index) => {
                          const [startHour, startMin] = slot.startTime.split(':').map(Number);
                          const [endHour, endMin] = slot.endTime.split(':').map(Number);
                          const duration = (endHour + endMin / 60) - (startHour + startMin / 60);
                          
                          return (
                            <div
                              key={slot.id}
                              className="group relative flex items-center justify-between p-4 bg-secondary/5 rounded-lg border-2 border-secondary/20 hover:border-secondary/40 hover:shadow-md transition-all"
                            >
                              {/* Time Block Visualization */}
                              <div className="flex items-center gap-4 flex-1">
                                <div className="flex items-center gap-3">
                                  <div className="p-2.5 bg-secondary rounded-lg">
                                    <Clock className="h-5 w-5 text-secondary-foreground" />
                                  </div>
                                  <div>
                                    <p className="font-bold text-base text-gray-900">
                                      {new Date(`1970-01-01T${slot.startTime}`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                                      {' → '}
                                      {new Date(`1970-01-01T${slot.endTime}`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                                    </p>
                                    <div className="flex items-center gap-3 mt-1">
                                      <p className="text-xs text-gray-600">
                                        {slot.timezone}
                                      </p>
                                      <Badge variant="outline" className="text-xs bg-secondary/10 text-secondary border-secondary/30">
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
                                  className={slot.isAvailable ? "bg-green-100 text-green-700 border-green-200" : "bg-gray-100 text-gray-600"}
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
                                        This will remove the {new Date(`1970-01-01T${slot.startTime}`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} - {new Date(`1970-01-01T${slot.endTime}`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} slot on {day.label}. This action cannot be undone.
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
