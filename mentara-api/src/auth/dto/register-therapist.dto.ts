import { IsString, IsOptional, IsDateString, IsObject } from 'class-validator';

export class RegisterTherapistDto {
  @IsString()
  email: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  role: string;

  @IsOptional()
  @IsString()
  middleName?: string;

  @IsOptional()
  @IsDateString()
  birthDate?: Date;

  @IsOptional()
  @IsString()
  address?: string;

  @IsString()
  mobile: string;

  @IsString()
  province: string;

  @IsString()
  providerType: string;

  @IsString()
  professionalLicenseType: string;

  @IsString()
  isPRCLicensed: string;

  @IsString()
  prcLicenseNumber: string;

  @IsOptional()
  @IsDateString()
  expirationDateOfLicense?: Date;

  @IsString()
  isLicenseActive: string;

  @IsDateString()
  practiceStartDate: Date;

  @IsObject()
  areasOfExpertise: Record<string, any>;

  @IsObject()
  assessmentTools: Record<string, any>;

  @IsObject()
  therapeuticApproachesUsedList: Record<string, any>;

  @IsObject()
  languagesOffered: Record<string, any>;

  @IsString()
  providedOnlineTherapyBefore: string;

  @IsString()
  comfortableUsingVideoConferencing: string;

  @IsString()
  weeklyAvailability: string;

  @IsString()
  preferredSessionLength: string;

  @IsObject()
  accepts: Record<string, any>;

  @IsString()
  privateConfidentialSpace: string;

  @IsString()
  compliesWithDataPrivacyAct: string;

  @IsString()
  professionalLiabilityInsurance: string;

  @IsString()
  complaintsOrDisciplinaryActions: string;

  @IsString()
  willingToAbideByPlatformGuidelines: string;
}
