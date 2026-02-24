// Base types for therapist application form
export interface TherapistApplicationFormData {
  // Basic Info
  firstName: string;
  lastName: string;
  mobile: string;
  email: string;
  province: string;
  providerType: string;

  // License Info
  professionalLicenseType: string;
  professionalLicenseType_specify?: string;
  prcLicenseNumber: string;
  expirationDateOfLicense: string;
  practiceStartDate: string;
  yearsOfExperience: number;
  educationBackground: string;
  practiceLocation: string;

  // Teletherapy
  providedOnlineTherapyBefore: string;
  comfortableUsingVideoConferencing: string;
  privateConfidentialSpace: string;
  compliesWithDataPrivacyAct: string;

  // Professional Profile
  areasOfExpertise: string[];
  otherAreaOfExpertise?: string;
  therapeuticApproachesUsedList: string[];
  therapeuticApproachesUsedList_specify?: string;
  languagesOffered: string[];
  languagesOffered_specify?: string;
  complaintsOrDisciplinaryActions: string;
  complaintsOrDisciplinaryActions_specify?: string;
  willingToAbideByPlatformGuidelines: string;

  // Availability & Services
  weeklyAvailability: string;
  preferredSessionLength: string[];
  preferredSessionLength_specify?: string;
  preferOnlineOrOffline: string;
  willingToCaterOutsideCebu: string;
  preferredPayrollAccount: string;
  hourlyRate?: number;
  bio?: string;

  // Review
  consentChecked: boolean;
}

// Form field option interface
export interface FormFieldOption {
  label: string;
  value: string;
  hasSpecify?: boolean;
  description?: string;
}

// Watched values interface for conditional rendering
export interface TherapistApplicationWatchedValues {
  firstName?: string;
  lastName?: string;
  email?: string;
  mobile?: string;
  province?: string;
  providerType?: string;
  professionalLicenseType?: string;
  professionalLicenseType_specify?: string;
  yearsOfExperience?: number;
  areasOfExpertise?: string[];
  therapeuticApproachesUsedList?: string[];
  languagesOffered?: string[];
  complaintsOrDisciplinaryActions?: string;
  preferredSessionLength?: string[];
  preferOnlineOrOffline?: string;
  willingToCaterOutsideCebu?: string;
  practiceStartDate?: string;
  educationBackground?: string;
  practiceLocation?: string;
}

// Document upload interface
export interface DocumentUpload {
  [key: string]: File[];
}

// Section interface for application sections
export interface ApplicationSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  estimatedTime: string;
  fields: string[];
  isRequired: boolean;
}

// Completion status interface
export interface CompletionStatus {
  completed: number;
  total: number;
  percentage: number;
}