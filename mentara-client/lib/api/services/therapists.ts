import { AxiosInstance } from 'axios';

// Types
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
  availability?: any;
}

export interface TherapistRecommendationResponse {
  therapists: TherapistRecommendation[];
  total: number;
  hasMore: boolean;
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

export interface TherapistApplication {
  id: string;
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  notes?: string;
  // Application data
  personalInfo: any;
  licenseInfo: any;
  professionalProfile: any;
  availabilityServices: any;
  teletherapy: any;
  documents: any;
}

export interface CreateApplicationRequest {
  personalInfo: any;
  licenseInfo: any;
  professionalProfile: any;
  availabilityServices: any;
  teletherapy: any;
  documents?: any;
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
  sortOrder?: 'asc' | 'desc';
}

// Therapist service factory
export const createTherapistService = (client: AxiosInstance) => ({
  // Get therapist recommendations
  getRecommendations: (params: TherapistSearchParams = {}): Promise<TherapistRecommendationResponse> => {
    const searchParams = new URLSearchParams();
    
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.includeInactive !== undefined) searchParams.append('includeInactive', params.includeInactive.toString());
    if (params.province) searchParams.append('province', params.province);
    if (params.maxHourlyRate) searchParams.append('maxHourlyRate', params.maxHourlyRate.toString());
    if (params.specialties?.length) searchParams.append('specialties', params.specialties.join(','));
    if (params.minRating) searchParams.append('minRating', params.minRating.toString());
    if (params.offset) searchParams.append('offset', params.offset.toString());

    const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return client.get(`/therapist-recommendations${queryString}`);
  },

  // Get therapist profile
  getProfile: (id: string): Promise<TherapistRecommendation> =>
    client.get(`/therapists/${id}`),

  // Application management
  application: {
    // Submit new application
    submit: (data: CreateApplicationRequest): Promise<TherapistApplication> =>
      client.post('/therapist/application', data),

    // Get applications list
    getList: (params: ApplicationListParams = {}): Promise<{ applications: TherapistApplication[]; total: number }> => {
      const searchParams = new URLSearchParams();
      
      if (params.status) searchParams.append('status', params.status);
      if (params.limit) searchParams.append('limit', params.limit.toString());
      if (params.offset) searchParams.append('offset', params.offset.toString());
      if (params.sortBy) searchParams.append('sortBy', params.sortBy);
      if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);

      const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
      return client.get(`/therapist/application${queryString}`);
    },

    // Get application by ID
    getById: (id: string): Promise<TherapistApplication> =>
      client.get(`/therapist/application/${id}`),

    // Update application
    update: (id: string, data: UpdateApplicationRequest): Promise<TherapistApplication> =>
      client.put(`/therapist/application/${id}`, data),

    // Get my application (for therapists)
    getMy: (): Promise<TherapistApplication> =>
      client.get('/therapist/application/me'),
  },
});

export type TherapistService = ReturnType<typeof createTherapistService>;