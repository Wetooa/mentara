"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Plus,
  Edit,
  Trash2,
  Save,
  RefreshCw,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useApi } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24
    }
  }
};

interface AvailabilitySlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  isRecurring: boolean;
  recurringPattern?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
    endDate?: string;
  };
}

interface NewAvailabilityData {
  date: string;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  recurringPattern?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
    endDate?: string;
  };
}

// const WEEK_DAYS = [
//   'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
// ];

const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0');
  return [`${hour}:00`, `${hour}:30`];
}).flat();

export default function AvailabilityManager() {
  const api = useApi();
  const queryClient = useQueryClient();
  
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingSlot, setEditingSlot] = useState<AvailabilitySlot | null>(null);
  const [newAvailability, setNewAvailability] = useState<NewAvailabilityData>({
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '17:00',
    isRecurring: false,
  });

  // Fetch availability slots
  const { data: availability, isLoading, error, refetch } = useQuery({
    queryKey: ['therapist', 'availability'],
    queryFn: () => api.booking.availability.get(),
  });

  // Create availability mutation
  const createAvailabilityMutation = useMutation({
    mutationFn: (data: NewAvailabilityData) => api.booking.availability.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['therapist', 'availability'] });
      toast.success('Availability added successfully!');
      setShowAddDialog(false);
      resetForm();
    },
    onError: (error) => {
      console.error('Error creating availability:', error);
      toast.error('Failed to add availability. Please try again.');
    },
  });

  // Update availability mutation
  const updateAvailabilityMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AvailabilitySlot> }) =>
      api.booking.availability.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['therapist', 'availability'] });
      toast.success('Availability updated successfully!');
      setEditingSlot(null);
    },
    onError: (error) => {
      console.error('Error updating availability:', error);
      toast.error('Failed to update availability. Please try again.');
    },
  });

  // Delete availability mutation
  const deleteAvailabilityMutation = useMutation({
    mutationFn: (id: string) => api.booking.availability.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['therapist', 'availability'] });
      toast.success('Availability deleted successfully!');
    },
    onError: (error) => {
      console.error('Error deleting availability:', error);
      toast.error('Failed to delete availability. Please try again.');
    },
  });

  const resetForm = () => {
    setNewAvailability({
      date: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '17:00',
      isRecurring: false,
    });
  };

  const handleAddAvailability = () => {
    createAvailabilityMutation.mutate(newAvailability);
  };

  const handleUpdateAvailability = () => {
    if (!editingSlot) return;
    
    updateAvailabilityMutation.mutate({
      id: editingSlot.id,
      data: editingSlot,
    });
  };

  const handleDeleteAvailability = (id: string) => {
    if (confirm('Are you sure you want to delete this availability slot?')) {
      deleteAvailabilityMutation.mutate(id);
    }
  };

  const handleToggleAvailability = (slot: AvailabilitySlot) => {
    updateAvailabilityMutation.mutate({
      id: slot.id,
      data: { isAvailable: !slot.isAvailable },
    });
  };

  const formatTime = (time: string) => {
    const [hour, minute] = time.split(':');
    const hourNum = parseInt(hour);
    const ampm = hourNum >= 12 ? 'PM' : 'AM';
    const displayHour = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;
    return `${displayHour}:${minute} ${ampm}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const groupAvailabilityByDate = (slots: AvailabilitySlot[]) => {
    return slots.reduce((groups, slot) => {
      const date = slot.date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(slot);
      return groups;
    }, {} as Record<string, AvailabilitySlot[]>);
  };

  const isProcessing = createAvailabilityMutation.isPending || 
                     updateAvailabilityMutation.isPending || 
                     deleteAvailabilityMutation.isPending;

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Availability</h2>
          <p className="text-muted-foreground mb-4">
            Unable to load your availability settings. Please try again.
          </p>
          <Button onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
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
      {/* Header */}
      <motion.div 
        className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0"
        variants={itemVariants}
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Availability Management</h1>
          <p className="text-gray-600">Manage your schedule and available time slots</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Availability
        </Button>
      </motion.div>

      {/* Quick Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {availability?.filter(slot => slot.isAvailable).length || 0}
                </p>
                <p className="text-sm text-muted-foreground">Available Slots</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {availability?.filter(slot => slot.isRecurring).length || 0}
                </p>
                <p className="text-sm text-muted-foreground">Recurring Slots</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {availability?.length || 0}
                </p>
                <p className="text-sm text-muted-foreground">Total Slots</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Availability List */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Your Availability Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                Loading availability...
              </div>
            ) : !availability || availability.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No availability set</h3>
                <p className="text-muted-foreground mb-4">
                  Start by adding your available time slots
                </p>
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Slot
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupAvailabilityByDate(availability)).map(([date, slots]) => (
                  <div key={date}>
                    <h3 className="font-semibold text-lg mb-3">{formatDate(date)}</h3>
                    <div className="grid gap-3">
                      {slots.map((slot) => (
                        <div
                          key={slot.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center gap-4">
                            <Switch
                              checked={slot.isAvailable}
                              onCheckedChange={() => handleToggleAvailability(slot)}
                              disabled={isProcessing}
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">
                                  {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                {slot.isRecurring && (
                                  <Badge variant="outline">
                                    Recurring {slot.recurringPattern?.frequency}
                                  </Badge>
                                )}
                                <Badge 
                                  variant={slot.isAvailable ? "default" : "secondary"}
                                >
                                  {slot.isAvailable ? "Available" : "Disabled"}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingSlot(slot)}
                              disabled={isProcessing}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteAvailability(slot.id)}
                              disabled={isProcessing}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Add Availability Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Availability</DialogTitle>
            <DialogDescription>
              Set up your available time slots for client bookings.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={newAvailability.date}
                onChange={(e) => setNewAvailability(prev => ({ ...prev, date: e.target.value }))}
                className="mt-1"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Time</Label>
                <Select
                  value={newAvailability.startTime}
                  onValueChange={(value) => setNewAvailability(prev => ({ ...prev, startTime: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map((time) => (
                      <SelectItem key={time} value={time}>
                        {formatTime(time)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>End Time</Label>
                <Select
                  value={newAvailability.endTime}
                  onValueChange={(value) => setNewAvailability(prev => ({ ...prev, endTime: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map((time) => (
                      <SelectItem key={time} value={time}>
                        {formatTime(time)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label>Make this recurring</Label>
              <Switch
                checked={newAvailability.isRecurring}
                onCheckedChange={(checked) => setNewAvailability(prev => ({ ...prev, isRecurring: checked }))}
              />
            </div>

            {newAvailability.isRecurring && (
              <div className="space-y-3 p-4 border rounded-lg">
                <div>
                  <Label>Frequency</Label>
                  <Select
                    value={newAvailability.recurringPattern?.frequency || 'weekly'}
                    onValueChange={(value) => setNewAvailability(prev => ({
                      ...prev,
                      recurringPattern: {
                        ...prev.recurringPattern,
                        frequency: value as 'daily' | 'weekly' | 'monthly',
                        interval: 1,
                      }
                    }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>End Date (Optional)</Label>
                  <Input
                    type="date"
                    value={newAvailability.recurringPattern?.endDate || ''}
                    onChange={(e) => setNewAvailability(prev => ({
                      ...prev,
                      recurringPattern: {
                        ...prev.recurringPattern,
                        frequency: prev.recurringPattern?.frequency || 'weekly',
                        interval: 1,
                        endDate: e.target.value || undefined,
                      }
                    }))}
                    className="mt-1"
                    min={newAvailability.date}
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddAvailability}
              disabled={createAvailabilityMutation.isPending}
            >
              {createAvailabilityMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  Adding...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Add Availability
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Availability Dialog */}
      <Dialog open={!!editingSlot} onOpenChange={() => setEditingSlot(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Availability</DialogTitle>
            <DialogDescription>
              Update your availability slot details.
            </DialogDescription>
          </DialogHeader>
          
          {editingSlot && (
            <div className="space-y-4">
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={editingSlot.date}
                  onChange={(e) => setEditingSlot(prev => prev ? ({ ...prev, date: e.target.value }) : null)}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Time</Label>
                  <Select
                    value={editingSlot.startTime}
                    onValueChange={(value) => setEditingSlot(prev => prev ? ({ ...prev, startTime: value }) : null)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_SLOTS.map((time) => (
                        <SelectItem key={time} value={time}>
                          {formatTime(time)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>End Time</Label>
                  <Select
                    value={editingSlot.endTime}
                    onValueChange={(value) => setEditingSlot(prev => prev ? ({ ...prev, endTime: value }) : null)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_SLOTS.map((time) => (
                        <SelectItem key={time} value={time}>
                          {formatTime(time)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label>Available</Label>
                <Switch
                  checked={editingSlot.isAvailable}
                  onCheckedChange={(checked) => setEditingSlot(prev => prev ? ({ ...prev, isAvailable: checked }) : null)}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingSlot(null)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateAvailability}
              disabled={updateAvailabilityMutation.isPending}
            >
              {updateAvailabilityMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}