// Therapist Application DTOs matching backend exactly

export interface TherapistApplicationDto {
  personalInfo: {
    firstName: string;
    lastName: string;
    middleName?: string;
    email: string;
    phone: string;
    birthDate: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  professionalInfo: {
    licenseNumber: string;
    licenseState: string;
    licenseExpiration: string;
    specialties: string[];
    yearsOfExperience: number;
    education: {
      degree: string;
      institution: string;
      graduationYear: number;
    }[];
    certifications: {
      name: string;
      issuingOrganization: string;
      issueDate: string;
      expirationDate?: string;
    }[];
    languages: string[];
    bio: string;
    approach: string;
  };
  practiceInfo: {
    sessionFormats: ('in-person' | 'video' | 'phone')[];
    availability: {
      timezone: string;
      schedule: {
        [day: string]: {
          isAvailable: boolean;
          startTime?: string;
          endTime?: string;
        };
      };
    };
    pricing: {
      sessionFee: number;
      currency: string;
      acceptsInsurance: boolean;
      insuranceProviders?: string[];
    };
  };
  documents?: {
    resume?: File;
    license?: File;
    certifications?: File[];
    transcript?: File;
    other?: File[];
  };
}

export interface TherapistApplication {
  id: string;
  applicantId: string;
  applicant: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  personalInfo: TherapistApplicationDto['personalInfo'];
  professionalInfo: TherapistApplicationDto['professionalInfo'];
  practiceInfo: TherapistApplicationDto['practiceInfo'];
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'additional_info_required';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  adminNotes?: string;
  rejectionReason?: string;
  documents: {
    id: string;
    filename: string;
    originalName: string;
    url: string;
    fileType: 'resume' | 'license' | 'certification' | 'transcript' | 'other';
    uploadedAt: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationStatusUpdateDto {
  status: 'approved' | 'rejected' | 'additional_info_required';
  adminNotes?: string;
  rejectionReason?: string;
  credentials?: {
    email: string;
    password: string;
  };
}

export interface ApplicationListParams {
  status?: 'pending' | 'under_review' | 'approved' | 'rejected' | 'additional_info_required';
  submittedAfter?: string;
  submittedBefore?: string;
  reviewedBy?: string;
  specialty?: string;
  state?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'submittedAt' | 'reviewedAt' | 'firstName' | 'lastName';
  sortOrder?: 'asc' | 'desc';
}

export interface ApplicationListResponse {
  applications: TherapistApplication[];
  total: number;
  hasMore: boolean;
}

export interface SubmitApplicationWithDocumentsRequest {
  application: TherapistApplicationDto;
  files: File[];
  fileTypes: Record<string, 'resume' | 'license' | 'certification' | 'transcript' | 'other'>;
}

export interface SubmitApplicationResponse {
  success: boolean;
  message: string;
  applicationId: string;
  uploadedFiles: {
    id: string;
    fileName: string;
    url: string;
  }[];
}

export interface ApplicationStatusUpdateResponse {
  success: boolean;
  message: string;
  credentials?: {
    email: string;
    password: string;
  };
}