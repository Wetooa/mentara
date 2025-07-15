import {
  IsString,
  IsEmail,
  IsOptional,
  IsDateString,
  IsBoolean,
  IsJSON,
  IsDecimal,
  MinLength,
} from 'class-validator';

export class RegisterTherapistDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password!: string;

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

  @IsBoolean()
  isPRCLicensed!: boolean;

  @IsString()
  prcLicenseNumber!: string;

  @IsOptional()
  @IsDateString()
  expirationDateOfLicense?: string;

  @IsBoolean()
  isLicenseActive!: boolean;

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

  @IsBoolean()
  providedOnlineTherapyBefore!: boolean;

  @IsBoolean()
  comfortableUsingVideoConferencing!: boolean;

  @IsString()
  weeklyAvailability!: string;

  @IsString()
  preferredSessionLength!: string;

  @IsJSON()
  accepts!: any;

  @IsOptional()
  @IsBoolean()
  privateConfidentialSpace?: boolean;

  @IsOptional()
  @IsBoolean()
  compliesWithDataPrivacyAct?: boolean;

  @IsOptional()
  @IsBoolean()
  professionalLiabilityInsurance?: boolean;

  @IsOptional()
  @IsBoolean()
  complaintsOrDisciplinaryActions?: boolean;

  @IsOptional()
  @IsBoolean()
  willingToAbideByPlatformGuidelines?: boolean;

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
