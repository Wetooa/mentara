// Booking TypeScript interfaces

export enum MeetingStatus {
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

export enum MeetingType {
  VIDEO = 'video',
  AUDIO = 'audio',
  CHAT = 'chat',
}

export interface CreateMeetingRequest {
  therapistId: string;
  startTime: string;
  endTime: string;
  duration: number;
  title?: string;
  description?: string;
  meetingType?: MeetingType;
}

export interface MeetingDuration {
  id: string;
  name: string;
  duration: number; // in minutes
  isActive: boolean;
  sortOrder: number;
}

export interface AvailableSlot {
  startTime: string;
  endTime: string;
  availableDurations: MeetingDuration[];
}

export interface Meeting {
  id: string;
  title?: string;
  description?: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: MeetingStatus;
  meetingType?: MeetingType;
  meetingUrl?: string;
  notes?: string;
  clientId: string;
  therapistId: string;
  client?: {
    id: string;
    user: {
      firstName: string | null;
      lastName: string | null;
      email: string | null;
    };
  };
  therapist?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  durationConfig?: MeetingDuration;
  createdAt: string;
  updatedAt: string;
}

export interface BookingFormData {
  date: string;
  timeSlot: AvailableSlot;
  duration: MeetingDuration;
  meetingType: MeetingType;
  title: string;
  description: string;
}