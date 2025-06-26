import {
  IsString,
  IsOptional,
  IsDateString,
  IsNumber,
  IsIn,
  Min,
  Max,
} from 'class-validator';

export class MeetingCreateDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  startTime!: string;

  @IsNumber()
  @IsIn([30, 60, 90, 120])
  duration!: number;

  @IsOptional()
  @IsString()
  status?: MeetingStatus;

  @IsOptional()
  @IsString()
  meetingType?: string;

  @IsString()
  therapistId!: string;

  @IsOptional()
  @IsDateString()
  createdAt?: string;

  @IsOptional()
  @IsDateString()
  updatedAt?: string;
}

export class MeetingUpdateDto extends MeetingCreateDto {}

export class TherapistAvailabilityCreateDto {
  @IsNumber()
  @Min(0)
  @Max(6)
  dayOfWeek!: number;

  @IsString()
  startTime!: string;

  @IsString()
  endTime!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class TherapistAvailabilityUpdateDto extends TherapistAvailabilityCreateDto {}

export type MeetingResponse = {
  id: string;
  title: string;
  description: string;
  startTime: Date;
  duration: number;
  status: string;
  meetingType: string;
  meetingUrl: string;

  createdAt: Date;
  updatedAt: Date;
};

export type MeetingNotesResponse = {
  id: string;
  meetingId: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
};

export type TherapistAvailabilityResponse = {
  id: string;
  therapistId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  notes: string;
};
