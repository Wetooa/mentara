import { TherapistApplicationStatus } from '@prisma/client';

export interface CreateTherapistDto {
  userId: string;
  mobile: string;
  province: string;
  timezone?: string;
  providerType: string;
  professionalLicenseType: string;
  isPRCLicensed: string;
  prcLicenseNumber: string;
  expirationDateOfLicense: Date | string;
  practiceStartDate: Date | string;
  certifications?: any;
  certificateUrls?: string[];
  certificateNames?: string[];
  licenseUrls?: string[];
  licenseNames?: string[];
  documentUrls?: string[];
  documentNames?: string[];
  yearsOfExperience?: number;
  educationBackground?: string;
  specialCertifications?: string[];
  practiceLocation?: string;
  acceptsInsurance?: boolean;
  acceptedInsuranceTypes?: string[];
  areasOfExpertise?: string[];
  assessmentTools?: string[];
  therapeuticApproachesUsedList?: string[];
  languagesOffered?: string[];
  providedOnlineTherapyBefore: boolean;
  comfortableUsingVideoConferencing: boolean;
  preferredSessionLength: number[];
  privateConfidentialSpace?: string;
  compliesWithDataPrivacyAct: boolean;
  professionalLiabilityInsurance?: string;
  complaintsOrDisciplinaryActions?: string;
  willingToAbideByPlatformGuidelines: boolean;
  expertise?: string[];
  approaches?: string[];
  languages?: string[];
  illnessSpecializations?: string[];
  acceptTypes?: string[];
  treatmentSuccessRates: any;
  sessionLength: string;
  hourlyRate: number;
}

export interface UpdateTherapistDto extends Partial<Omit<CreateTherapistDto, 'userId'>> {
  status?: TherapistApplicationStatus;
}

export interface TherapistDto extends CreateTherapistDto {
  status: TherapistApplicationStatus;
  submissionDate: Date;
  processingDate: Date;
  processedByAdminId?: string;
  licenseVerified: boolean;
  licenseVerifiedAt?: Date;
  licenseVerifiedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}
