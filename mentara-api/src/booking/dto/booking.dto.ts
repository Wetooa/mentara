import {
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
  IsEnum,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';

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

export class CreateMeetingDto {
  @IsString()
  therapistId: string;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsNumber()
  @Min(15)
  @Max(480) // 8 hours max
  duration: number;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(MeetingType)
  meetingType?: MeetingType;
}

export class UpdateMeetingDto {
  @IsOptional()
  @IsEnum(MeetingStatus)
  status?: MeetingStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  meetingUrl?: string;
}

export class CreateAvailabilityDto {
  @IsNumber()
  @Min(0)
  @Max(6)
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.

  @IsString()
  startTime: string; // HH:MM format

  @IsString()
  endTime: string; // HH:MM format

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateAvailabilityDto {
  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class GetAvailableSlotsDto {
  @IsString()
  therapistId: string;

  @IsDateString()
  date: string;
}
