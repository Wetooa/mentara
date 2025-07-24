"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Calendar,
  Clock,
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  Save,
  Copy,
  Grid3X3,
  List,
  AlertTriangle,
} from "lucide-react";
import { useTherapistAvailability } from "@/hooks/therapist/useTherapistAvailability";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
  { value: "MONDAY", label: "Monday" },
  { value: "TUESDAY", label: "Tuesday" },
  { value: "WEDNESDAY", label: "Wednesday" },
  { value: "THURSDAY", label: "Thursday" },
  { value: "FRIDAY", label: "Friday" },
  { value: "SATURDAY", label: "Saturday" },
  { value: "SUNDAY", label: "Sunday" },
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

// Animation variants
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 }
  }
};

const scaleVariants = {
  hidden: { scale: 0.95, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.2 }
  },
  exit: {
    scale: 0.95,
    opacity: 0,
    transition: { duration: 0.15 }
  }
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

  // Local state for view mode and features
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showConflicts, setShowConflicts] = useState(true);
  const [copyFromDay, setCopyFromDay] = useState<string>('');

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

  // Copy availability from one day to another
  const handleCopyDay = async (fromDay: string, toDay: string) => {
    const sourceSlots = availabilityByDay[fromDay] || [];
    
    if (sourceSlots.length === 0) {
      toast.error('No availability slots to copy from the selected day');
      return;
    }

    try {
      // Create new slots for the target day
      for (const slot of sourceSlots) {
        await createAvailability({
          dayOfWeek: toDay,
          startTime: slot.startTime,
          endTime: slot.endTime,
          timezone: slot.timezone,
          notes: slot.notes,
        });
      }
      toast.success(`Copied ${sourceSlots.length} availability slots to ${DAYS_OF_WEEK.find(d => d.value === toDay)?.label}`);
    } catch (error) {
      toast.error('Failed to copy availability slots');
    }
  };

  const handleCancelEdit = () => {
    setEditingSlot(null);
    setIsAddDialogOpen(false);
    resetForm();
  };

  // Group availability by day of week and detect conflicts
  const availabilityByDay = useMemo(() => {
    return availability.reduce((acc, slot) => {
      if (!acc[slot.dayOfWeek]) {
        acc[slot.dayOfWeek] = [];
      }
      acc[slot.dayOfWeek].push(slot);
      return acc;
    }, {} as Record<string, AvailabilitySlot[]>);
  }, [availability]);

  // Detect time conflicts
  const conflicts = useMemo(() => {
    const conflictPairs: Array<{ day: string; slots: AvailabilitySlot[] }> = [];
    
    Object.entries(availabilityByDay).forEach(([day, slots]) => {
      for (let i = 0; i < slots.length; i++) {
        for (let j = i + 1; j < slots.length; j++) {
          const slot1 = slots[i];
          const slot2 = slots[j];
          
          // Check for time overlap
          if (isTimeOverlap(slot1.startTime, slot1.endTime, slot2.startTime, slot2.endTime)) {
            conflictPairs.push({ day, slots: [slot1, slot2] });
          }
        }
      }
    });
    
    return conflictPairs;
  }, [availabilityByDay]);

  // Helper function to check time overlap
  const isTimeOverlap = (start1: string, end1: string, start2: string, end2: string): boolean => {
    const parseTime = (time: string) => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };
    
    const s1 = parseTime(start1);
    const e1 = parseTime(end1);
    const s2 = parseTime(start2);
    const e2 = parseTime(end2);
    
    return s1 < e2 && s2 < e1;
  };

  // Check if a slot has conflicts
  const hasConflict = (slotId: string): boolean => {
    return conflicts.some(conflict => 
      conflict.slots.some(slot => slot.id === slotId)
    );
  };

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

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Availability Calendar
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your weekly availability schedule
              </p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 hover:shadow-lg transition-all duration-300">
                    <motion.div 
                      animate={{ rotate: isAddDialogOpen ? 45 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Plus className="h-4 w-4" />
                    </motion.div>
                    Add Availability
                  </Button>
                </motion.div>
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
                        {DAYS_OF_WEEK.map((day) => (
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
                      {(isCreating || isUpdating) ? (
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
            <div className="text-center py-8">
              <div className="rounded-full bg-blue-100 p-6 mb-4 mx-auto w-fit">
                <Calendar className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">No availability set</h3>
              <p className="text-slate-600 mb-4 max-w-md mx-auto">
                Set your weekly availability to let clients book sessions with you.
              </p>
              <Button 
                onClick={() => setIsAddDialogOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Availability
              </Button>
            </div>
          ) : (
            <>
              {/* View Controls and Conflict Alert */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6" role="region" aria-label="Calendar view controls">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant={viewMode === 'grid' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                        className={cn(
                          "transition-all duration-200 hover:shadow-md",
                          viewMode === 'grid' && "bg-blue-600 hover:bg-blue-700"
                        )}
                        aria-pressed={viewMode === 'grid'}
                        aria-label="Switch to grid view"
                      >
                        <Grid3X3 className="h-4 w-4 mr-1" aria-hidden="true" />
                        Grid
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant={viewMode === 'list' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                        className={cn(
                          "transition-all duration-200 hover:shadow-md",
                          viewMode === 'list' && "bg-blue-600 hover:bg-blue-700"
                        )}
                        aria-pressed={viewMode === 'list'}
                        aria-label="Switch to list view"
                      >
                        <List className="h-4 w-4 mr-1" aria-hidden="true" />
                        List
                      </Button>
                    </motion.div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Switch
                      id="show-conflicts"
                      checked={showConflicts}
                      onCheckedChange={setShowConflicts}
                    />
                    <Label htmlFor="show-conflicts" className="text-sm font-medium">
                      Highlight conflicts
                    </Label>
                  </div>
                </div>

                {conflicts.length > 0 && showConflicts && (
                  <Alert className="border-amber-200 bg-amber-50">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-800">
                      {conflicts.length} time conflict{conflicts.length > 1 ? 's' : ''} detected
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Copy Feature */}
              <div className="mb-6 p-4 bg-slate-50 rounded-lg border">
                <h4 className="font-medium text-slate-900 mb-3">Quick Copy</h4>
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-sm text-slate-600">Copy availability from:</span>
                  <Select value={copyFromDay} onValueChange={setCopyFromDay}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS_OF_WEEK.filter(day => availabilityByDay[day.value]?.length > 0).map((day) => (
                        <SelectItem key={day.value} value={day.value}>
                          {day.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-slate-600">to:</span>
                  {copyFromDay && DAYS_OF_WEEK.filter(day => day.value !== copyFromDay).map((day) => (
                    <Button
                      key={day.value}
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyDay(copyFromDay, day.value)}
                      disabled={isCreating}
                      className="text-xs"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      {day.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Calendar View */}
              {viewMode === 'grid' ? (
                <WeeklyCalendarGrid 
                  availabilityByDay={availabilityByDay}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  hasConflict={hasConflict}
                  showConflicts={showConflicts}
                  isDeleting={isDeleting}
                />
              ) : (
                <WeeklyListView 
                  availabilityByDay={availabilityByDay}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  hasConflict={hasConflict}
                  showConflicts={showConflicts}
                  isDeleting={isDeleting}
                />
              )}
            </>
          )}
        </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

// Weekly Calendar Grid Component
interface WeeklyCalendarGridProps {
  availabilityByDay: Record<string, AvailabilitySlot[]>;
  onEdit: (slot: AvailabilitySlot) => void;
  onDelete: (id: string) => void;
  hasConflict: (slotId: string) => boolean;
  showConflicts: boolean;
  isDeleting: boolean;
}

function WeeklyCalendarGrid({ 
  availabilityByDay, 
  onEdit, 
  onDelete, 
  hasConflict, 
  showConflicts,
  isDeleting 
}: WeeklyCalendarGridProps) {
  return (
    <motion.div 
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      role="grid"
      aria-label="Weekly availability schedule in grid format"
    >
      {DAYS_OF_WEEK.map((day, index) => {
        const daySlots = availabilityByDay[day.value] || [];
        return (
          <motion.div
            key={day.value}
            variants={itemVariants}
            custom={index}
          >
            <Card className="border border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-blue-900 flex items-center justify-between">
                {day.label}
                <Badge variant="outline" className="text-xs font-medium">
                  {daySlots.length} slot{daySlots.length !== 1 ? 's' : ''}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {daySlots.length === 0 ? (
                <div className="text-center py-6">
                  <Clock className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                  <p className="text-sm text-slate-500">No availability</p>
                </div>
              ) : (
                daySlots.map((slot, slotIndex) => {
                  const hasSlotConflict = showConflicts && hasConflict(slot.id);
                  return (
                    <motion.div
                      key={slot.id}
                      variants={scaleVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      transition={{ delay: slotIndex * 0.05 }}
                      layout
                    >
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <motion.div 
                            className={cn(
                              "p-3 rounded-lg border transition-all duration-200 hover:shadow-md cursor-pointer",
                              hasSlotConflict 
                                ? "border-amber-300 bg-amber-50" 
                                : "border-slate-200 bg-white hover:border-blue-300"
                            )}
                            whileHover={{ 
                              scale: 1.02, 
                              boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
                              y: -2
                            }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Clock className="h-3 w-3 text-slate-500" />
                                <span className="font-medium text-sm text-slate-900">
                                  {slot.startTime} - {slot.endTime}
                                </span>
                                {hasSlotConflict && (
                                  <AlertTriangle className="h-3 w-3 text-amber-600" />
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-slate-500">
                                {slot.timezone}
                              </span>
                              <div className="flex items-center gap-1">
                                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onEdit(slot)}
                                    className="h-6 w-6 p-0 hover:bg-blue-100 hover:shadow-md transition-all duration-200"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                </motion.div>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 text-red-600 hover:bg-red-100 hover:shadow-md transition-all duration-200"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </motion.div>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Availability</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Delete {slot.startTime} - {slot.endTime} on {day.label}?
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => onDelete(slot.id)}
                                        disabled={isDeleting}
                                        className="bg-red-600 hover:bg-red-700"
                                      >
                                        {isDeleting ? "Deleting..." : "Delete"}
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>
                            
                            {slot.notes && (
                              <p className="text-xs text-slate-600 mt-1 italic">
                                {slot.notes}
                              </p>
                            )}
                          </motion.div>
                        </TooltipTrigger>
                          <TooltipContent>
                            <div className="text-xs">
                              <p className="font-medium">{slot.startTime} - {slot.endTime}</p>
                              <p>{slot.timezone}</p>
                              {slot.notes && <p className="italic mt-1">{slot.notes}</p>}
                              {hasSlotConflict && (
                                <p className="text-amber-600 mt-1">⚠️ Time conflict detected</p>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </motion.div>
                  );
                })
              )}
            </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

// Weekly List View Component
interface WeeklyListViewProps {
  availabilityByDay: Record<string, AvailabilitySlot[]>;
  onEdit: (slot: AvailabilitySlot) => void;
  onDelete: (id: string) => void;
  hasConflict: (slotId: string) => boolean;
  showConflicts: boolean;
  isDeleting: boolean;
}

function WeeklyListView({ 
  availabilityByDay, 
  onEdit, 
  onDelete, 
  hasConflict, 
  showConflicts,
  isDeleting 
}: WeeklyListViewProps) {
  return (
    <motion.div 
      className="space-y-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {DAYS_OF_WEEK.map((day, index) => {
        const daySlots = availabilityByDay[day.value] || [];
        return (
          <motion.div
            key={day.value}
            variants={itemVariants}
            custom={index}
          >
            <Card className="border border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-blue-900 flex items-center justify-between">
                {day.label}
                <Badge variant="outline" className="text-xs font-medium">
                  {daySlots.length} slot{daySlots.length !== 1 ? 's' : ''}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {daySlots.length === 0 ? (
                <p className="text-sm text-slate-500 py-2">No availability set</p>
              ) : (
                <div className="space-y-2">
                  {daySlots.map((slot, slotIndex) => {
                    const hasSlotConflict = showConflicts && hasConflict(slot.id);
                    return (
                      <motion.div
                        key={slot.id}
                        variants={scaleVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        transition={{ delay: slotIndex * 0.05 }}
                        layout
                        className={cn(
                          "flex items-center justify-between p-3 rounded-lg border transition-all",
                          hasSlotConflict
                            ? "border-amber-300 bg-amber-50"
                            : "border-slate-200 bg-slate-50 hover:bg-white"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Clock className="h-4 w-4 text-slate-500" />
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm text-slate-900">
                                {slot.startTime} - {slot.endTime}
                              </p>
                              {hasSlotConflict && (
                                <AlertTriangle className="h-4 w-4 text-amber-600" />
                              )}
                            </div>
                            <p className="text-xs text-slate-500">{slot.timezone}</p>
                            {slot.notes && (
                              <p className="text-xs text-slate-600 mt-1 italic">{slot.notes}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={slot.isAvailable ? "default" : "secondary"}
                            className="text-xs bg-blue-100 text-blue-800 border-blue-200"
                          >
                            {slot.isAvailable ? "Available" : "Unavailable"}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(slot)}
                            className="h-8 w-8 p-0 hover:bg-blue-100"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-600 hover:bg-red-100"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Availability</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Delete {slot.startTime} - {slot.endTime} on {day.label}?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => onDelete(slot.id)}
                                  disabled={isDeleting}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  {isDeleting ? "Deleting..." : "Delete"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}