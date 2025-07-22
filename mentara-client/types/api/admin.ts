// Admin management and therapist application types

export interface PendingTherapistFiltersDto {
  status?: 'pending' | 'under-review' | 'approved' | 'rejected';
  specializations?: string[];
  location?: string;
  applicationDate?: {
    from: string;
    to: string;
  };
  experienceRange?: {
    min: number;
    max: number;
  };
  sortBy?: 'applicationDate' | 'experience' | 'rating' | 'name';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ApproveTherapistDto {
  therapistId: string;
  approvalNotes?: string;
  conditions?: string[];
  initialPermissions?: string[];
  mentorTherapistId?: string;
  trialPeriodDays?: number;
}

export interface RejectTherapistDto {
  therapistId: string;
  rejectionReason: string;
  rejectionNotes?: string;
  allowReapplication?: boolean;
  reapplicationDate?: string;
  suggestedImprovements?: string[];
}

export interface UpdateTherapistStatusDto {
  therapistId: string;
  status: 'active' | 'inactive' | 'suspended' | 'under-review';
  reason?: string;
  notes?: string;
  effectiveDate?: string;
  reviewDate?: string;
  notifyTherapist?: boolean;
}

export interface TherapistApplication {
  id: string;
  therapistId: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  };
  professionalInfo: {
    licenseNumber: string;
    licenseState: string;
    licenseExpiry: string;
    specializations: string[];
    experience: number;
    education: Array<{
      degree: string;
      institution: string;
      graduationYear: number;
    }>;
    certifications: Array<{
      name: string;
      issuer: string;
      issueDate: string;
      expiryDate?: string;
    }>;
  };
  documents: Array<{
    id: string;
    type: 'license' | 'degree' | 'certification' | 'resume' | 'background-check' | 'other';
    filename: string;
    url: string;
    uploadedAt: string;
    verificationStatus: 'pending' | 'verified' | 'rejected';
    verificationNotes?: string;
  }>;
  applicationStatus: 'pending' | 'under-review' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
  approvalConditions?: string[];
}

export interface TherapistListResponse {
  therapists: TherapistApplication[];
  total: number;
  hasMore: boolean;
  filters: PendingTherapistFiltersDto;
  summary: {
    pendingCount: number;
    underReviewCount: number;
    approvedCount: number;
    rejectedCount: number;
  };
}

export interface TherapistApplicationDetailsResponse {
  application: TherapistApplication;
  verificationChecks: {
    licenseVerified: boolean;
    backgroundCheckPassed: boolean;
    educationVerified: boolean;
    referencesChecked: boolean;
    documentsComplete: boolean;
  };
  reviewHistory: Array<{
    id: string;
    action: 'created' | 'updated' | 'reviewed' | 'approved' | 'rejected' | 'suspended';
    performedBy: string;
    performedAt: string;
    notes?: string;
    changes?: Record<string, any>;
  }>;
  relatedData: {
    existingClients: number;
    scheduledSessions: number;
    averageRating?: number;
    totalReviews: number;
  };
}

export interface TherapistActionResponse {
  success: boolean;
  message: string;
  therapistId: string;
  newStatus: string;
  effectiveDate: string;
  nextSteps?: string[];
  notifications: {
    therapistNotified: boolean;
    clientsNotified: boolean;
    systemUpdated: boolean;
  };
}