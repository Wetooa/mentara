import { IsString, IsEmail, IsOptional, IsDateString, IsBoolean, IsArray, IsJSON, IsDecimal } from 'class-validator';

export class RegisterTherapistDto {
  @IsString()
  userId!: string; // Clerk user ID

  @IsEmail()
  email!: string;

  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

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

  @IsString()
  prcLicenseNumber!: string;

  @IsOptional()
  @IsDateString()
  expirationDateOfLicense?: string;

  @IsString()
  isLicenseActive!: string;

  @IsDateString()
  practiceStartDate!: string;

  @IsOptional()
  @IsString()
  yearsOfExperience?: string;

  @IsJSON()
  areasOfExpertise!: any;

  @IsJSON()
  assessmentTools!: any;

  @IsJSON()
  therapeuticApproachesUsedList!: any;

  @IsJSON()
  languagesOffered!: any;

  @IsString()
  providedOnlineTherapyBefore!: string;

  @IsString()
  comfortableUsingVideoConferencing!: string;

  @IsString()
  weeklyAvailability!: string;

  @IsString()
  preferredSessionLength!: string;

  @IsJSON()
  accepts!: any;

  @IsOptional()
  @IsString()
  privateConfidentialSpace?: string;

  @IsOptional()
  @IsString()
  compliesWithDataPrivacyAct?: string;

  @IsOptional()
  @IsString()
  professionalLiabilityInsurance?: string;

  @IsOptional()
  @IsString()
  complaintsOrDisciplinaryActions?: string;

  @IsOptional()
  @IsString()
  willingToAbideByPlatformGuidelines?: string;

  @IsOptional()
  @IsString()
  sessionLength?: string;

  @IsOptional()
  @IsDecimal()
  hourlyRate?: number;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  profileImageUrl?: string;

  @IsOptional()
  @IsJSON()
  applicationData?: any;
}

export class UpdateTherapistDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  mobile?: string;

  @IsOptional()
  @IsString()
  province?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  profileImageUrl?: string;

  @IsOptional()
  @IsDecimal()
  hourlyRate?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsJSON()
  expertise?: any;

  @IsOptional()
  @IsJSON()
  approaches?: any;

  @IsOptional()
  @IsJSON()
  languages?: any;

  @IsOptional()
  @IsJSON()
  illnessSpecializations?: any;
}