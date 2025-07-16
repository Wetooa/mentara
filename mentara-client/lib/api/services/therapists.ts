import { AxiosInstance } from "axios";
import {
  TherapistRecommendation,
  MatchCriteria,
  TherapistRecommendationResponse,
  TherapistSearchParams,
  TherapistDashboardData,
  PatientData,
  TherapistApplication,
  CreateApplicationRequest,
  UpdateApplicationRequest,
  ApplicationListParams,
  PersonalInfo,
  ProfessionalInfo,
  PracticeInfo,
  TherapistWorksheetAssignment,
  TherapistCredentials,
  TherapistRecommendationResponseDto,
  TherapistRecommendationQuery,
  WelcomeRecommendationQuery,
  TherapistApplicationCreateDto,
  TherapistApplicationIdParam,
  ApplicationStatusUpdateDto,
  RegisterTherapistDto,
  UpdateTherapistDto,
  TherapistIdParam,
  TherapistWorksheetQueryDto,
  TherapistMeetingQueryDto,
  TherapistClientRequestQueryDto,
  TherapistApplicationListDto,
  TherapistRecommendationQuerySchema,
  TherapistWorksheetQueryDtoSchema,
  TherapistMeetingQueryDtoSchema,
  TherapistClientRequestQueryDtoSchema,
  TherapistApplicationListDtoSchema,
  Meeting,
} from 'mentara-commons';

// Re-export commons types for backward compatibility
export type {
  TherapistRecommendation,
  MatchCriteria,
  TherapistRecommendationResponse,
  TherapistSearchParams,
  TherapistDashboardData,
  PatientData,
  TherapistApplication,
  CreateApplicationRequest,
  UpdateApplicationRequest,
  ApplicationListParams,
  PersonalInfo,
  ProfessionalInfo,
  PracticeInfo,
  TherapistWorksheetAssignment,
  TherapistCredentials,
  TherapistRecommendationResponseDto,
  TherapistRecommendationQuery,
  WelcomeRecommendationQuery,
  TherapistApplicationCreateDto,
  TherapistApplicationIdParam,
  ApplicationStatusUpdateDto,
  RegisterTherapistDto,
  UpdateTherapistDto,
  TherapistIdParam,
  TherapistWorksheetQueryDto,
  TherapistMeetingQueryDto,
  TherapistClientRequestQueryDto,
  TherapistApplicationListDto,
  Meeting,
};

// Extended interfaces for complex UI data structures
export interface TherapistAvailability {
  timezone: string;
  weeklySchedule: Record<string, Array<{ start: string; end: string }>>;
  exceptions?: Array<{
    date: string;
    isAvailable: boolean;
    timeSlots?: Array<{ start: string; end: string }>;
  }>;
}

// Using Meeting type from mentara-commons instead of local MeetingData
export interface MeetingWithClient extends Meeting {
  client: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string;
  };
}

export interface DocumentInfo {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  fileType: 'resume' | 'license' | 'certification' | 'transcript' | 'other';
  uploadedAt: string;
}

// Therapist service factory
export const createTherapistService = (client: AxiosInstance) => ({
  // ===== BACKEND ENDPOINT ANALYSIS =====
  // 
  // FIXED: HTTP Method Mismatches Resolved
  // All endpoints now correctly use GET methods with query parameters:
  // 1. getApplications() - Uses GET /admin/therapists/applications with query params
  // 2. worksheets.getAll() - Uses GET /therapist/worksheets with query params
  // 3. meetings.getList() - Uses GET /booking/meetings with query params  
  // 4. getClientRequests() - Uses GET /therapist/requests with query params
  //
  // Get therapist recommendations
  getRecommendations: async (
    params: TherapistRecommendationQuery = {}
  ): Promise<TherapistRecommendationResponseDto> => {
    const validatedParams = TherapistRecommendationQuerySchema.parse(params);
    return client.post('/therapist-recommendations', validatedParams);
  },

  // Enhanced recommendation endpoints for Module 2
  getPersonalizedRecommendations: (): Promise<{
    recommendations: any[];
    averageMatchScore: number;
    totalRecommendations: number;
    matchCriteria: {
      primaryConditions: string[];
      secondaryConditions: string[];
      preferences: Record<string, any>;
    };
  }> => client.get('/therapists/recommendations/personalized'),

  sendTherapistRequests: (data: {
    therapistIds: string[];
    message?: string;
  }): Promise<{
    success: boolean;
    requestsSent: number;
    failedRequests: string[];
    message: string;
  }> => client.post('/therapists/requests/send', data),

  // ===== BACKEND ENDPOINT ISSUES =====
  // 
  // MISSING: GET /therapists/:id - Get therapist profile by ID
  // Purpose: Retrieve public therapist profile information for client viewing
  // Current backend: Has GET /therapist/profile (current user) but missing public profile endpoint
  // Expected response: TherapistRecommendation object with public profile data
  // Priority: HIGH - needed for therapist directory and client selection
  // getProfile: (id: string): Promise<TherapistRecommendation> =>
  //   client.get(`/therapists/${id}`),

  // Admin methods for application management
  getApplications: async (
    params: TherapistApplicationListDto = {}
  ): Promise<{
    applications: TherapistApplication[];
    totalCount: number;
    page: number;
    totalPages: number;
  }> => {
    const validatedParams = TherapistApplicationListDtoSchema.parse(params);
    return client.get('/admin/therapists/applications', { params: validatedParams });
  },

  getApplicationById: (id: string): Promise<TherapistApplication> =>
    client.get(`/therapist/application/${id}`),

  updateApplicationStatus: (
    applicationId: string,
    data: ApplicationStatusUpdateDto
  ): Promise<{ success: boolean; message: string; credentials?: TherapistCredentials }> =>
    client.put(`/therapist/application/${applicationId}/status`, data),

  // Application management
  application: {
    // Submit new application
    submit: (data: TherapistApplicationCreateDto): Promise<TherapistApplication> =>
      client.post("/therapist/application", data),

    // Get applications list
    getList: async (
      params: TherapistApplicationListDto = {}
    ): Promise<{ applications: TherapistApplication[]; total: number }> => {
      const validatedParams = TherapistApplicationListDtoSchema.parse(params);
      return client.get('/admin/therapists/applications', { params: validatedParams });
    },

    // Get application by ID
    getById: (id: string): Promise<TherapistApplication> =>
      client.get(`/therapist/application/${id}`),

    // Update application
    update: (
      id: string,
      data: ApplicationStatusUpdateDto
    ): Promise<TherapistApplication> =>
      client.put(`/therapist/application/${id}/status`, data),

    // ===== BACKEND ENDPOINT ISSUES =====
    // 
    // MISSING: GET /therapist/application/me - Get current user's application
    // Purpose: Allow therapists to view their own application status
    // Current backend: Has GET /auth/therapist/applications but different path structure
    // Expected response: TherapistApplication object for current user
    // Priority: MEDIUM - needed for therapist self-service application management
    // SOLUTION: Either implement endpoint or use GET /auth/therapist/applications
    // getMy: (): Promise<TherapistApplication> =>
    //   client.get("/therapist/application/me"),
  },

  // Dashboard and patient management
  dashboard: {
    // Get therapist dashboard data (corrected path)
    getData: (): Promise<TherapistDashboardData> =>
      client.get("/dashboard/therapist"),

    // Dashboard stats and appointments are included in main dashboard data
    // Separate endpoints not available in backend
  },

  // Patient management
  patients: {
    // Get assigned clients list (corrected path)
    getList: (): Promise<PatientData[]> => client.get("/therapist/clients/assigned"),

    // Get specific client details (corrected path)
    getById: (patientId: string): Promise<PatientData> =>
      client.get(`/therapist/clients/${patientId}`),

    // ===== BACKEND ENDPOINT ISSUES =====
    // 
    // MISSING: PUT /therapist/clients/:id/notes - Update client session notes
    // Purpose: Allow therapists to update session notes for specific clients
    // Current backend: Missing - would need to be implemented in TherapistClientController
    // Expected response: Updated PatientData object with new notes
    // Priority: HIGH - critical for session management
    // updateNotes: (clientId: string, notes: string): Promise<PatientData> =>
    //   client.put(`/therapist/clients/${clientId}/notes`, { notes }),
    
    // MISSING: GET /therapist/clients/:id/sessions - Get client sessions
    // Purpose: Retrieve all sessions for a specific client
    // Current backend: Missing - would need to be implemented
    // Expected response: Array of session objects
    // Priority: HIGH - needed for session history and management
    // getSessions: (clientId: string): Promise<Session[]> =>
    //   client.get(`/therapist/clients/${clientId}/sessions`),
    
    // MISSING: GET /therapist/clients/:id/worksheets - Get client worksheets
    // Purpose: Retrieve all worksheets assigned to a specific client
    // Current backend: Missing - would need to be implemented
    // Expected response: Array of worksheet objects
    // Priority: MEDIUM - needed for worksheet management
    // getWorksheets: (clientId: string): Promise<Worksheet[]> =>
    //   client.get(`/therapist/clients/${clientId}/worksheets`),
    
    // MISSING: POST /therapist/clients/:id/worksheets - Assign worksheet to client
    // Purpose: Allow therapists to assign worksheets to specific clients
    // Current backend: Missing - would need to be implemented
    // Expected response: Assignment confirmation
    // Priority: MEDIUM - needed for worksheet assignment workflow
    // assignWorksheet: (clientId: string, worksheetId: string): Promise<void> =>
    //   client.post(`/therapist/clients/${clientId}/worksheets`, { worksheetId }),
  },

  // Therapist worksheets management
  worksheets: {
    // Get all worksheets created by the therapist
    getAll: async (
      params: TherapistWorksheetQueryDto = {}
    ): Promise<any[]> => {
      const validatedParams = TherapistWorksheetQueryDtoSchema.parse(params);
      return client.get('/therapist/worksheets', { params: validatedParams });
    },

    // Get worksheet by ID (corrected path)
    getById: (worksheetId: string): Promise<any> =>
      client.get(`/therapist/worksheets/${worksheetId}`),

    // Create new worksheet (corrected path)
    create: (worksheetData: any): Promise<any> =>
      client.post(`/therapist/worksheets`, worksheetData),

    // Update worksheet (corrected path)
    update: (worksheetId: string, worksheetData: any): Promise<any> =>
      client.put(`/therapist/worksheets/${worksheetId}`, worksheetData),
  },

  // Meetings and sessions
  meetings: {
    // Get therapist meetings/sessions
    getList: async (
      params: TherapistMeetingQueryDto = {}
    ): Promise<MeetingWithClient[]> => {
      const validatedParams = TherapistMeetingQueryDtoSchema.parse(params);
      return client.get('/booking/meetings', { params: validatedParams });
    },

    // Get meeting by ID
    getById: (meetingId: string): Promise<MeetingWithClient> =>
      client.get(`/booking/meetings/${meetingId}`),

    // Update meeting (corrected method and path)
    updateStatus: (
      meetingId: string,
      status: Meeting["status"]
    ): Promise<MeetingWithClient> =>
      client.put(`/booking/meetings/${meetingId}`, { status }),

    // ===== BACKEND ENDPOINT ISSUES =====
    // 
    // MISSING: POST /booking/meetings/:id/start - Start a meeting
    // Purpose: Initialize a therapy session and provide meeting URL
    // Current backend: Missing - would need to be implemented in BookingController
    // Expected response: { meetingUrl: string } - video call URL
    // Priority: HIGH - critical for session management
    // start: (meetingId: string): Promise<{ meetingUrl: string }> =>
    //   client.post(`/booking/meetings/${meetingId}/start`),
  },

  // Enhanced request management endpoints for Module 2
  getClientRequests: async (params: TherapistClientRequestQueryDto = {}): Promise<{
    requests: any[];
    total: number;
    page: number;
    totalPages: number;
  }> => {
    const validatedParams = TherapistClientRequestQueryDtoSchema.parse(params);
    return client.get('/therapist/requests', { params: validatedParams });
  },

  getRequestStatistics: (): Promise<{
    overview: {
      totalRequests: number;
      pendingRequests: number;
      acceptedToday: number;
      declinedToday: number;
      averageResponseTime: number;
      responseRate: number;
    };
    trends: {
      weeklyRequests: number;
      weeklyAccepted: number;
      weeklyDeclined: number;
      weeklyChange: number;
    };
    performance: {
      averageMatchScore: number;
      clientSatisfaction: number;
      conversionRate: number;
      averageSessionsPerClient: number;
    };
    timeDistribution: {
      morning: number;
      afternoon: number;
      evening: number;
    };
  }> => client.get('/therapist/requests/statistics'),

  respondToClientRequest: (requestId: string, response: {
    action: 'accept' | 'decline' | 'request_info';
    message?: string;
    availableSlots?: Array<{
      date: string;
      time: string;
      duration: number;
    }>;
    questions?: string[];
    includeIntroCall?: boolean;
  }): Promise<{
    success: boolean;
    message: string;
    requestId: string;
    status: string;
  }> => client.post(`/therapist/requests/${requestId}/respond`, response),
});

export type TherapistService = ReturnType<typeof createTherapistService>;
