import {
  IsString,
  IsOptional,
  IsEmail,
  IsEnum,
  IsDate,
  IsBoolean,
  IsArray,
  IsJSON,
  IsNumber,
} from 'class-validator';
import { JsonValue, Decimal } from '@prisma/client/runtime/library';

export enum UserRole {
  CLIENT = 'client',
  THERAPIST = 'therapist',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
}

export class UserCreateDto {
  @IsEmail()
  email!: string;

  @IsString()
  firstName!: string;

  @IsString()
  middleName!: string;

  @IsString()
  lastName!: string;

  @IsString()
  birthDate!: string;

  @IsString()
  address!: string;

  @IsString()
  avatarUrl!: string;

  @IsEnum(UserRole)
  role!: string;

  @IsString()
  bio!: string;

  @IsString()
  coverImageUrl!: string;

  @IsOptional()
  isActive!: boolean;
}

export class ClientCreateDto {
  user!: UserCreateDto;
}

export class ClientUpdateDto extends UserCreateDto {}

export class TherapistCreateDto extends UserCreateDto {
  user!: UserCreateDto;

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
  @IsDate()
  expirationDateOfLicense!: Date;
  @IsDate()
  practiceStartDate!: Date;

  @IsArray()
  @IsString({ each: true })
  areasOfExpertise!: string[];
  @IsArray()
  @IsString({ each: true })
  assessmentTools!: string[];
  @IsArray()
  @IsString({ each: true })
  therapeuticApproachesUsedList!: string[];
  @IsArray()
  @IsString({ each: true })
  languagesOffered!: string[];

  @IsBoolean()
  providedOnlineTherapyBefore!: boolean;
  @IsBoolean()
  comfortableUsingVideoConferencing!: boolean;
  @IsArray()
  @IsNumber({}, { each: true })
  preferredSessionLength!: number[];

  @IsString()
  @IsOptional()
  privateConfidentialSpace!: string;
  @IsBoolean()
  @IsOptional()
  compliesWithDataPrivacyAct!: boolean;
  @IsString()
  @IsOptional()
  professionalLiabilityInsurance!: string;
  @IsString()
  @IsOptional()
  complaintsOrDisciplinaryActions!: string;
  @IsBoolean()
  willingToAbideByPlatformGuidelines!: boolean;

  @IsArray()
  @IsString({ each: true })
  expertise!: string[];
  @IsArray()
  @IsString({ each: true })
  approaches!: string[];
  @IsArray()
  @IsString({ each: true })
  languages!: string[];
  @IsArray()
  @IsString({ each: true })
  illnessSpecializations!: string[];
  @IsArray()
  @IsString({ each: true })
  acceptTypes!: string[];
  @IsJSON()
  treatmentSuccessRates!: Record<string, number>;

  @IsString()
  sessionLength!: string;
  @IsNumber()
  hourlyRate!: number;
}

export class TherapistUpdateDto {
  @IsString()
  @IsOptional()
  mobile?: string;

  @IsString()
  @IsOptional()
  province?: string;

  @IsString()
  @IsOptional()
  providerType?: string;

  @IsString()
  @IsOptional()
  professionalLicenseType?: string;

  @IsString()
  @IsOptional()
  isPRCLicensed?: string;

  @IsString()
  @IsOptional()
  prcLicenseNumber?: string;

  @IsDate()
  @IsOptional()
  expirationDateOfLicense?: Date;

  @IsDate()
  @IsOptional()
  practiceStartDate?: Date;

  @IsArray()
  @IsOptional()
  areasOfExpertise?: string[];

  @IsArray()
  @IsOptional()
  assessmentTools?: string[];

  @IsArray()
  @IsOptional()
  therapeuticApproachesUsedList?: string[];

  @IsArray()
  @IsOptional()
  languagesOffered?: string[];

  @IsBoolean()
  @IsOptional()
  providedOnlineTherapyBefore?: boolean;

  @IsBoolean()
  @IsOptional()
  comfortableUsingVideoConferencing?: boolean;

  @IsArray()
  @IsOptional()
  preferredSessionLength?: number[];

  @IsString()
  @IsOptional()
  privateConfidentialSpace?: string;

  @IsBoolean()
  @IsOptional()
  compliesWithDataPrivacyAct?: boolean;

  @IsString()
  @IsOptional()
  professionalLiabilityInsurance?: string;

  @IsString()
  @IsOptional()
  complaintsOrDisciplinaryActions?: string;

  @IsBoolean()
  @IsOptional()
  willingToAbideByPlatformGuidelines?: boolean;

  @IsArray()
  @IsOptional()
  expertise?: string[];

  @IsArray()
  @IsOptional()
  approaches?: string[];

  @IsArray()
  @IsOptional()
  languages?: string[];

  @IsArray()
  @IsOptional()
  illnessSpecializations?: string[];

  @IsArray()
  @IsOptional()
  acceptTypes?: string[];

  @IsOptional()
  treatmentSuccessRates?: Record<string, number>;

  @IsString()
  @IsOptional()
  sessionLength?: string;

  @IsNumber()
  @IsOptional()
  hourlyRate?: number;
}

export type UserResponse = {
  id: string;
  email: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  birthDate: Date | null;
  address: string | null;
  avatarUrl: string | null;
  role: string;
  bio: string | null;
  coverImageUrl: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type ClientResponse = {
  userId: string;
  user: UserResponse;
  hasSeenTherapistRecommendations: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type TherapistResponse = {
  userId: string;
  user: UserResponse;

  status: string;
  submissionDate: Date;
  processingDate: Date;

  mobile: string;
  province: string;

  providerType: string;
  professionalLicenseType: string;
  isPRCLicensed: string;
  prcLicenseNumber: string;
  expirationDateOfLicense: Date;
  practiceStartDate: Date;

  areasOfExpertise: string[];
  assessmentTools: string[];
  therapeuticApproachesUsedList: string[];
  languagesOffered: string[];

  providedOnlineTherapyBefore: boolean;
  comfortableUsingVideoConferencing: boolean;
  preferredSessionLength: number[];

  privateConfidentialSpace: string | null;
  compliesWithDataPrivacyAct: boolean;
  professionalLiabilityInsurance: string | null;
  complaintsOrDisciplinaryActions: string | null;
  willingToAbideByPlatformGuidelines: boolean;

  expertise: string[];
  approaches: string[];
  languages: string[];
  illnessSpecializations: string[];
  acceptTypes: string[];
  treatmentSuccessRates: JsonValue;

  sessionLength: string;
  hourlyRate: Decimal;

  createdAt: Date;
  updatedAt: Date;

  processedByAdminId: string | null;
};
