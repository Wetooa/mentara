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
  matchScore?: number; // Added for recommendation scoring
}

export interface MatchCriteria {
  primaryConditions: string[];
  secondaryConditions: string[];
  severityLevels: Record<string, string>;
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
    status: 'pending' | 'completed' | 'in_progress';
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

  // Dashboard and patient management
  dashboard: {
    // Get therapist dashboard data
    getData: (): Promise<TherapistDashboardData> =>
      client.get('/therapist/dashboard'),

    // Get dashboard stats
    getStats: (): Promise<TherapistDashboardData['stats']> =>
      client.get('/therapist/dashboard/stats'),

    // Get upcoming appointments
    getUpcomingAppointments: (): Promise<TherapistDashboardData['upcomingAppointments']> =>
      client.get('/therapist/dashboard/appointments'),
  },

  // Patient management
  patients: {
    // Get assigned patients list
    getList: (): Promise<PatientData[]> =>
      client.get('/therapist/patients'),

    // Get specific patient details
    getById: (patientId: string): Promise<PatientData> =>
      client.get(`/therapist/patients/${patientId}`),

    // Update patient notes
    updateNotes: (patientId: string, sessionId: string, notes: string): Promise<void> =>
      client.patch(`/therapist/patients/${patientId}/sessions/${sessionId}/notes`, { notes }),

    // Get patient sessions
    getSessions: (patientId: string): Promise<PatientData['sessions']> =>
      client.get(`/therapist/patients/${patientId}/sessions`),

    // Get patient worksheets
    getWorksheets: (patientId: string): Promise<PatientData['worksheets']> =>
      client.get(`/therapist/patients/${patientId}/worksheets`),

    // Assign worksheet to patient
    assignWorksheet: (patientId: string, worksheetData: any): Promise<void> =>
      client.post(`/therapist/patients/${patientId}/worksheets`, worksheetData),
  },

  // Meetings and sessions
  meetings: {
    // Get therapist meetings/sessions
    getList: (params: { status?: string; limit?: number; offset?: number } = {}): Promise<MeetingData[]> => {
      const searchParams = new URLSearchParams();
      
      if (params.status) searchParams.append('status', params.status);
      if (params.limit) searchParams.append('limit', params.limit.toString());
      if (params.offset) searchParams.append('offset', params.offset.toString());

      const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
      return client.get(`/booking/meetings${queryString}`);
    },

    // Get meeting by ID
    getById: (meetingId: string): Promise<MeetingData> =>
      client.get(`/booking/meetings/${meetingId}`),

    // Update meeting status
    updateStatus: (meetingId: string, status: MeetingData['status']): Promise<MeetingData> =>
      client.patch(`/booking/meetings/${meetingId}/status`, { status }),

    // Start a meeting
    start: (meetingId: string): Promise<{ meetingUrl: string }> =>
      client.post(`/booking/meetings/${meetingId}/start`),
  },
});

export type TherapistService = ReturnType<typeof createTherapistService>;