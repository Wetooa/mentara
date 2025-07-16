export interface TherapistApplicationResponse {
  id: string;
  status: string;
  submissionDate: string;
  processingDate?: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  province: string;
  providerType: string;
  professionalLicenseType: string;
  isPRCLicensed: string;
  prcLicenseNumber: string;
  expirationDateOfLicense: string;
  isLicenseActive: string;
  practiceStartDate: string;
  yearsOfExperience: string;
  areasOfExpertise: string[];
  assessmentTools: string[];
  therapeuticApproachesUsedList: string[];
  languagesOffered: string[];
  providedOnlineTherapyBefore: string;
  comfortableUsingVideoConferencing: string;
  weeklyAvailability: string;
  preferredSessionLength: string;
  accepts: string[];
  privateConfidentialSpace: string;
  compliesWithDataPrivacyAct: string;
  professionalLiabilityInsurance: string;
  complaintsOrDisciplinaryActions: string;
  willingToAbideByPlatformGuidelines: string;
  bio?: string;
  hourlyRate?: number;
  files?: Array<{
    id: string;
    fileUrl: string;
    fileName: string;
    uploadedAt: string;
  }>;
}

export interface ApplicationStatusUpdateDto {
  status: 'approved' | 'rejected' | 'pending';
  adminNotes?: string;
  credentials?: {
    email: string;
    temporaryPassword: string;
  };
}
