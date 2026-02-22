export interface MeetingCreateDto {
  therapistId: string;
  dateTime: Date;
  startTime?: Date | string; // Alternative property name for dateTime
  duration: number;
  notes?: string;
  meetingType: 'online' | 'in-person';
}

export interface MeetingUpdateDto {
  dateTime?: Date;
  startTime?: Date | string; // Alternative property name for dateTime
  duration?: number;
  notes?: string;
  title?: string;
  description?: string;
  meetingUrl?: string;
  meetingType?: 'online' | 'in-person';
  status?: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
}

export interface BookingMeetingParamsDto {
  id: string;
}

export interface TherapistAvailabilityCreateDto {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  notes?: string;
  isRecurring: boolean;
  specificDate?: Date;
}

export interface TherapistAvailabilityUpdateDto {
  dayOfWeek?: number;
  startTime?: string;
  endTime?: string;
  isRecurring?: boolean;
  specificDate?: Date;
}

export interface AvailabilityParamsDto {
  id: string;
}

export interface GetAvailableSlotsQueryDto {
  therapistId: string;
  date: string;
}