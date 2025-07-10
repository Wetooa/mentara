// Therapist DTOs matching backend exactly

export interface TherapistRecommendation {
  id: string;
  firstName: string;
  lastName: string;
  title: string;
  specialties: string[];
  hourlyRate: number;
  experience: number;
  province: string;
  isActive: boolean;
  rating?: number;
  totalReviews?: number;
  bio?: string;
  profileImage?: string;
  availability?: TherapistAvailability;
  matchScore?: number; // Added for recommendation scoring
}

export interface MatchCriteria {
  primaryConditions: string[];
  secondaryConditions: string[];
  severityLevels: Record<string, string>;
}

export interface TherapistAvailability {
  timezone: string;
  weeklySchedule: Record<string, Array<{ start: string; end: string }>>;
  exceptions?: Array<{
    date: string;
    isAvailable: boolean;
    timeSlots?: Array<{ start: string; end: string }>;
  }>;
}

export interface TherapistRecommendationResponse {
  therapists: TherapistRecommendation[];
  totalCount: number;
  userConditions: string[];
  matchCriteria: MatchCriteria;
  page: number;
  pageSize: number;
}

export interface TherapistSearchParams {
  limit?: number;
  includeInactive?: boolean;
  province?: string;
  maxHourlyRate?: number;
  specialties?: string[];
  minRating?: number;
  offset?: number;
}

export interface TherapistDashboardData {
  therapist: {
    id: string;
    name: string;
    avatar: string;
  };
  stats: {
    activePatients: number;
    rescheduled: number;
    cancelled: number;
    income: number;
    patientStats: {
      total: number;
      percentage: number;
      months: number;
      chartData: Array<{
        month: string;
        value: number;
      }>;
    };
  };
  upcomingAppointments: Array<{
    id: string;
    patientId: string;
    patientName: string;
    time: string;
    date: string;
    type: string;
    status: string;
  }>;
}

export interface PatientData {
  id: string;
  name: string;
  fullName: string;
  avatar: string;
  email: string;
  phone: string;
  age: number;
  diagnosis: string;
  treatmentPlan: string;
  currentSession: number;
  totalSessions: number;
  sessions: Array<{
    id: string;
    number: number;
    date: string;
    notes: string;
  }>;
  worksheets: Array<{
    id: string;
    title: string;
    assignedDate: string;
    status: "pending" | "completed" | "in_progress";
  }>;
}

export interface MeetingData {
  id: string;
  title: string;
  therapistId: string;
  therapistName: string;
  status: "scheduled" | "started" | "completed" | "cancelled";
  dateTime: string;
  duration: number;
  timeToStart?: string;
}

export interface TherapistApplication {
  id: string;
  status: "pending" | "approved" | "rejected" | "under_review";
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

export interface CreateApplicationRequest {
  personalInfo: PersonalInfo;
  licenseInfo: LicenseInfo;
  professionalProfile: ProfessionalProfile;
  availabilityServices: AvailabilityServices;
  teletherapy: TeletherapyInfo;
  documents?: DocumentInfo[];
}

export interface UpdateApplicationRequest {
  status?: string;
  notes?: string;
  reviewedBy?: string;
}

export interface ApplicationListParams {
  status?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  province: string;
}

export interface LicenseInfo {
  providerType: string;
  professionalLicenseType: string;
  isPRCLicensed: string;
  prcLicenseNumber: string;
  expirationDateOfLicense: string;
  isLicenseActive: string;
  practiceStartDate: string;
  yearsOfExperience: string;
}

export interface ProfessionalProfile {
  areasOfExpertise: string[];
  assessmentTools: string[];
  therapeuticApproachesUsedList: string[];
  languagesOffered: string[];
  bio?: string;
  hourlyRate?: number;
}

export interface AvailabilityServices {
  weeklyAvailability: string;
  preferredSessionLength: string;
  accepts: string[];
}

export interface TeletherapyInfo {
  providedOnlineTherapyBefore: string;
  comfortableUsingVideoConferencing: string;
  privateConfidentialSpace: string;
  compliesWithDataPrivacyAct: string;
  professionalLiabilityInsurance: string;
  complaintsOrDisciplinaryActions: string;
  willingToAbideByPlatformGuidelines: string;
}

export interface DocumentInfo {
  id: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  uploadedAt: string;
}

export interface WorksheetAssignment {
  worksheetId: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority: "low" | "medium" | "high";
  instructions?: string;
}

export interface TherapistCredentials {
  userId: string;
  therapistId: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt: string;
  permissions: string[];
}
