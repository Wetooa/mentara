export interface MeetingCreateDto {
  therapistId: string;
  dateTime: Date;
  duration: number;
  notes?: string;
  meetingType: 'online' | 'in-person';
}

export interface MeetingUpdateDto {
  dateTime?: Date;
  duration?: number;
  notes?: string;
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