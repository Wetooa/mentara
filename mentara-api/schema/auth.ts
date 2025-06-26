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
  user: UserCreateDto;
}

export class ClientUpdateDto extends UserCreateDto {}

export class TherapistCreateDto extends UserCreateDto {
  user: UserCreateDto;

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

  @IsArray(IsString())
  areasOfExpertise!: string[];
  @IsArray(IsString())
  assessmentTools!: string[];
  @IsArray(IsString())
  therapeuticApproachesUsedList!: string[];
  @IsArray(IsString())
  languagesOffered!: string[];

  @IsBoolean()
  providedOnlineTherapyBefore!: boolean;
  @IsBoolean()
  comfortableUsingVideoConferencing!: boolean;
  @IsArray(IsNumber())
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

  @IsArray(IsString())
  expertise!: string[];
  @IsArray(IsString())
  approaches!: string[];
  @IsArray(IsString())
  languages!: string[];
  @IsArray(IsString())
  illnessSpecializations!: string[];
  @IsArray(IsString())
  acceptTypes!: string[];
  @IsJSON()
  treatmentSuccessRates!: Record<string, number>;

  @IsString()
  sessionLength!: string;
  @IsNumber()
  hourlyRate!: number;
}

export class TherapistUpdateDto extends UserCreateDto {}

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
  treatmentSuccessRates: Record<string, any>;

  sessionLength: string;
  hourlyRate: number;

  createdAt: Date;
  updatedAt: Date;

  processedByAdminId: string | null;
};
