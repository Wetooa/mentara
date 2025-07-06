import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
} from 'class-validator';

export class TherapistRecommendationRequest {
  @IsString()
  userId!: string;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsBoolean()
  includeInactive?: boolean;

  @IsOptional()
  @IsString()
  province?: string;

  @IsOptional()
  @IsNumber()
  maxHourlyRate?: number;
}

export class TherapistRecommendationResponse {
  @IsNumber()
  totalCount!: number;

  @IsArray()
  @IsString({ each: true })
  userConditions!: string[];

  @IsArray()
  therapists!: any[]; // TherapistWithUser with matchScore

  matchCriteria!: {
    primaryConditions: string[];
    secondaryConditions: string[];
    severityLevels: Record<string, string>;
  };

  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  pageSize?: number;
}

export class TherapistApplicationDto {
  @IsString()
  userId!: string;

  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsString()
  email!: string;

  @IsString()
  mobile!: string;

  @IsString()
  province!: string;

  @IsString()
  providerType!: string;

  @IsString()
  professionalLicenseType!: string;

  @IsString()
  isPRCLicensed!: string;

  @IsOptional()
  @IsString()
  prcLicenseNumber?: string;

  @IsOptional()
  @IsString()
  isLicenseActive?: string;

  @IsOptional()
  @IsString()
  expirationDateOfLicense?: string;

  @IsString()
  practiceStartDate!: string;

  @IsArray()
  areasOfExpertise!: string[];

  @IsArray()
  assessmentTools!: string[];

  @IsArray()
  therapeuticApproachesUsedList!: string[];

  @IsArray()
  languagesOffered!: string[];

  @IsBoolean()
  providedOnlineTherapyBefore!: boolean;

  @IsBoolean()
  comfortableUsingVideoConferencing!: boolean;

  @IsBoolean()
  privateConfidentialSpace!: boolean;

  @IsBoolean()
  compliesWithDataPrivacyAct!: boolean;

  @IsString()
  weeklyAvailability!: string;

  @IsString()
  preferredSessionLength!: string;

  @IsArray()
  accepts!: string[];

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsNumber()
  hourlyRate?: number;

  // Compliance fields
  @IsString()
  professionalLiabilityInsurance!: string;

  @IsString()
  complaintsOrDisciplinaryActions!: string;

  @IsOptional()
  @IsString()
  complaintsOrDisciplinaryActions_specify?: string;

  @IsBoolean()
  willingToAbideByPlatformGuidelines!: boolean;
}
