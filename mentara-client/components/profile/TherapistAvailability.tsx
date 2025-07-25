"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  User
} from 'lucide-react';
import { PublicProfileResponse } from '@/lib/api/services/profile';

interface TherapistAvailabilityProps {
  availability: NonNullable<PublicProfileResponse['therapist']>['availability'];
}

interface GroupedAvailability {
  [dayOfWeek: string]: Array<{
    id: string;
    startTime: string;
    endTime: string;
    timezone: string;
    isAvailable: boolean;
    notes?: string;
    bookedSlots?: Array<{
      id: string;
      startTime: string;
      endTime: string;
      status: string;
    }>;
  }>;
}

export function TherapistAvailability({ availability }: TherapistAvailabilityProps) {
  if (!availability || availability.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="w-5 h-5" />
            Availability
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 italic">
            No availability information provided
          </p>
        </CardContent>
      </Card>
    );
  }

  // Group availability by day of week
  const groupedAvailability = availability.reduce<GroupedAvailability>((acc, slot) => {
    if (!acc[slot.dayOfWeek]) {
      acc[slot.dayOfWeek] = [];
    }
    acc[slot.dayOfWeek].push(slot);
    return acc;
  }, {});

  // Order days of week properly
  const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const orderedDays = dayOrder.filter(day => groupedAvailability[day]);

  const formatTime = (timeString: string) => {
    try {
      // Handle time strings in HH:MM format
      const [hours, minutes] = timeString.split(':').map(Number);
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);
      return date.toLocaleTimeString([], { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } catch (error) {
      return timeString;
    }
  };

  const getAvailabilityStatus = (slot: any) => {
    if (!slot.isAvailable) {
      return { text: 'Unavailable', color: 'bg-red-100 text-red-700', icon: XCircle };
    }
    
    const hasBookings = slot.bookedSlots && slot.bookedSlots.length > 0;
    if (hasBookings) {
      return { text: 'Partially Booked', color: 'bg-yellow-100 text-yellow-700', icon: User };
    }
    
    return { text: 'Available', color: 'bg-green-100 text-green-700', icon: CheckCircle };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="w-5 h-5" />
          Weekly Availability
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {orderedDays.map((dayOfWeek) => (
          <div key={dayOfWeek} className="space-y-2">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {dayOfWeek}
            </h3>
            
            <div className="space-y-2 ml-6">
              {groupedAvailability[dayOfWeek].map((slot) => {
                const status = getAvailabilityStatus(slot);
                const StatusIcon = status.icon;
                
                return (
                  <div 
                    key={slot.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-medium text-gray-900">
                        {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                      </div>
                      
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${status.color} border-current`}
                      >
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {status.text}
                      </Badge>
                      
                      {slot.timezone && slot.timezone !== 'UTC' && (
                        <span className="text-xs text-gray-500">
                          ({slot.timezone})
                        </span>
                      )}
                    </div>
                    
                    {slot.bookedSlots && slot.bookedSlots.length > 0 && (
                      <div className="text-xs text-gray-600">
                        {slot.bookedSlots.length} booking{slot.bookedSlots.length !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Show notes if any slot has notes */}
            {groupedAvailability[dayOfWeek].some(slot => slot.notes) && (
              <div className="ml-6 mt-2">
                {groupedAvailability[dayOfWeek]
                  .filter(slot => slot.notes)
                  .map(slot => (
                    <p key={`${slot.id}-note`} className="text-xs text-gray-600 italic">
                      Note: {slot.notes}
                    </p>
                  ))}
              </div>
            )}
          </div>
        ))}
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-600" />
              Available for booking
            </div>
            <div className="flex items-center gap-1">
              <User className="w-3 h-3 text-yellow-600" />
              Partially booked
            </div>
            <div className="flex items-center gap-1">
              <XCircle className="w-3 h-3 text-red-600" />
              Unavailable
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default TherapistAvailability;