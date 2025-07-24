// Worksheets DTOs matching backend exactly

export interface WorksheetCreateInputDto {
  title: string;
  instructions?: string;
  dueDate: string;
  userId: string; // client/patient ID
  therapistId: string;
  materials?: WorksheetMaterial[];
}

export interface WorksheetUpdateInputDto {
  title?: string;
  instructions?: string;
  dueDate?: string;
  isCompleted?: boolean;
  feedback?: string;
  status?: WorksheetStatus;
}

export interface Worksheet {
  id: string;
  title: string;
  instructions?: string;
  dueDate: string;
  status: WorksheetStatus;
  clientId: string;
  client: {
    userId: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      avatarUrl: string;
    };
  };
  therapistId: string;
  therapist: {
    userId: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      avatarUrl: string;
    };
  };
  // Backend uses arrays for materials instead of objects
  materialUrls: string[];
  materialNames: string[];
  // Backend returns singular submission, not plural submissions
  submission: WorksheetSubmission | null;
  createdAt: string;
  updatedAt: string;
}

export enum WorksheetStatus {
  ASSIGNED = "ASSIGNED",
  SUBMITTED = "SUBMITTED",
  REVIEWED = "REVIEWED",
  OVERDUE = "OVERDUE",
}

export interface WorksheetMaterial {
  id: string;
  worksheetId: string;
  filename: string;
  url: string;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
}

export interface WorksheetSubmissionCreateInputDto {
  worksheetId: string;
  filename: string;
  url: string;
  fileSize?: number;
  fileType?: string;
}

export interface WorksheetSubmission {
  id: string;
  worksheetId: string;
  // Backend uses arrays for multiple file support
  fileUrls: string[];
  fileNames: string[];
  fileSizes: number[];
  submittedAt: string;
  feedback?: string;
}

export interface WorksheetListParams {
  userId?: string;
  therapistId?: string;
  status?: string;
  isCompleted?: boolean;
  overdue?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: "dueDate" | "createdAt" | "title";
  sortOrder?: "asc" | "desc";
}

export interface WorksheetListResponse {
  worksheets: Worksheet[];
  total: number;
  hasMore: boolean;
}

export interface SubmitWorksheetRequest {
  submissions?: {
    filename: string;
    url: string;
    fileSize?: number;
    fileType?: string;
  }[];
  complete: boolean;
}

export interface WorksheetStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
}

export interface UserInfo {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
}

export interface ClientInfo {
  userId: string;
  hasSeenTherapistRecommendations: boolean;
  createdAt: string;
  updatedAt: string;
  user: UserInfo;
}

export interface TherapistInfo {
  userId: string;
  mobile: string;
  province: string;
  timezone: string;
  status: string;
  submissionDate: string;
  processingDate: string;
  processedByAdminId: string | null;
  providerType: string;
  professionalLicenseType: string;
  isPRCLicensed: string;
  prcLicenseNumber: string;
  expirationDateOfLicense: string;
  practiceStartDate: string;
  licenseVerified: boolean;
  licenseVerifiedAt: string | null;
  licenseVerifiedBy: string | null;
  certifications: string | null;
  certificateUrls: string[];
  certificateNames: string[];
  licenseUrls: string[];
  licenseNames: string[];
  documentUrls: string[];
  documentNames: string[];
  yearsOfExperience: number | null;
  educationBackground: string | null;
  specialCertifications: string[];
  practiceLocation: string | null;
  acceptsInsurance: boolean;
  acceptedInsuranceTypes: string[];
  areasOfExpertise: string[];
  assessmentTools: string[];
  therapeuticApproachesUsedList: string[];
  languagesOffered: string[];
  providedOnlineTherapyBefore: boolean;
  comfortableUsingVideoConferencing: boolean;
  preferredSessionLength: number[];
  privateConfidentialSpace: string;
  compliesWithDataPrivacyAct: boolean;
  professionalLiabilityInsurance: string;
  complaintsOrDisciplinaryActions: string;
  willingToAbideByPlatformGuidelines: boolean;
  expertise: string[];
  approaches: string[];
  languages: string[];
  illnessSpecializations: string[];
  acceptTypes: string[];
  treatmentSuccessRates: {
    trauma: number;
    anxiety: number;
    depression: number;
  };
  sessionLength: string;
  hourlyRate: string;
  createdAt: string;
  updatedAt: string;
  user: UserInfo;
}

export interface WorksheetSubmissionInfo {
  id: string;
  worksheetId: string;
  fileUrls: string[];
  fileNames: string[];
  fileSizes: number[];
  submittedAt: string;
  feedback: string | null;
}

export interface WorksheetMaterial {
  id: string;
  filename: string;
  url: string;
  fileType: string;
  fileSize: number;
}

export interface WorksheetDetailDTO {
  id: string;
  clientId: string;
  therapistId: string;
  title: string;
  instructions: string;
  dueDate: string;
  status: "ASSIGNED" | "SUBMITTED" | "REVIEWED" | "OVERDUE";
  materialUrls: string[];
  materialNames: string[];
  createdAt: string;
  updatedAt: string;
  client: ClientInfo;
  therapist: TherapistInfo;
  submission: WorksheetSubmissionInfo | null;
  materials: WorksheetMaterial[];
}

// Optional: Response wrapper if the API returns additional metadata
export interface WorksheetDetailResponse {
  worksheet: WorksheetDetailDTO;
  assignment?: {
    clientName: string;
    assignedAt: string;
  };
  submission?: WorksheetSubmissionInfo;
}
