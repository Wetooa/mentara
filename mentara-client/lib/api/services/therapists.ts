import { AxiosInstance } from "axios";
import {
  TherapistRecommendation,
  MatchCriteria,
  TherapistAvailability,
  TherapistRecommendationResponse,
  TherapistSearchParams,
  TherapistDashboardData,
  PatientData,
  MeetingData,
  TherapistApplication,
  CreateApplicationRequest,
  UpdateApplicationRequest,
  ApplicationListParams,
  PersonalInfo,
  LicenseInfo,
  ProfessionalProfile,
  AvailabilityServices,
  TeletherapyInfo,
  DocumentInfo,
  WorksheetAssignment,
  TherapistCredentials,
} from "@/types/api/therapists";

// Therapist service factory
export const createTherapistService = (client: AxiosInstance) => ({
  // Get therapist recommendations
  getRecommendations: (
    params: TherapistSearchParams = {}
  ): Promise<TherapistRecommendationResponse> => {
    const searchParams = new URLSearchParams();

    if (params.limit) searchParams.append("limit", params.limit.toString());
    if (params.includeInactive !== undefined)
      searchParams.append("includeInactive", params.includeInactive.toString());
    if (params.province) searchParams.append("province", params.province);
    if (params.maxHourlyRate)
      searchParams.append("maxHourlyRate", params.maxHourlyRate.toString());
    if (params.specialties?.length)
      searchParams.append("specialties", params.specialties.join(","));
    if (params.minRating)
      searchParams.append("minRating", params.minRating.toString());
    if (params.offset) searchParams.append("offset", params.offset.toString());

    const queryString = searchParams.toString()
      ? `?${searchParams.toString()}`
      : "";
    return client.get(`/therapist-recommendations${queryString}`);
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

  // Get therapist profile (BACKEND ENDPOINT MISSING - needs implementation)
  // getProfile: (id: string): Promise<TherapistRecommendation> =>
  //   client.get(`/therapists/${id}`),

  // Admin methods for application management
  getApplications: (
    params: ApplicationListParams = {}
  ): Promise<{
    applications: TherapistApplication[];
    totalCount: number;
    page: number;
    totalPages: number;
  }> => {
    const searchParams = new URLSearchParams();

    if (params.status) searchParams.append("status", params.status);
    if (params.limit) searchParams.append("limit", params.limit.toString());
    if (params.offset)
      searchParams.append(
        "page",
        Math.floor((params.offset || 0) / (params.limit || 10) + 1).toString()
      );

    const queryString = searchParams.toString()
      ? `?${searchParams.toString()}`
      : "";
    return client.get(`/therapist/application${queryString}`);
  },

  getApplicationById: (id: string): Promise<TherapistApplication> =>
    client.get(`/therapist/application/${id}`),

  updateApplicationStatus: (
    applicationId: string,
    data: { status: string; reviewedBy?: string; notes?: string }
  ): Promise<{ success: boolean; message: string; credentials?: TherapistCredentials }> =>
    client.put(`/therapist/application/${applicationId}/status`, data),

  // Application management
  application: {
    // Submit new application
    submit: (data: CreateApplicationRequest): Promise<TherapistApplication> =>
      client.post("/therapist/application", data),

    // Get applications list
    getList: (
      params: ApplicationListParams = {}
    ): Promise<{ applications: TherapistApplication[]; total: number }> => {
      const searchParams = new URLSearchParams();

      if (params.status) searchParams.append("status", params.status);
      if (params.limit) searchParams.append("limit", params.limit.toString());
      if (params.offset)
        searchParams.append("offset", params.offset.toString());
      if (params.sortBy) searchParams.append("sortBy", params.sortBy);
      if (params.sortOrder) searchParams.append("sortOrder", params.sortOrder);

      const queryString = searchParams.toString()
        ? `?${searchParams.toString()}`
        : "";
      return client.get(`/therapist/application${queryString}`);
    },

    // Get application by ID
    getById: (id: string): Promise<TherapistApplication> =>
      client.get(`/therapist/application/${id}`),

    // Update application
    update: (
      id: string,
      data: UpdateApplicationRequest
    ): Promise<TherapistApplication> =>
      client.put(`/therapist/application/${id}/status`, data),

    // Get my application (BACKEND ENDPOINT MISSING - needs implementation)
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

    // BACKEND ENDPOINTS MISSING - These need to be implemented:
    // updateNotes: Update session notes
    // getSessions: Get client sessions
    // getWorksheets: Get client worksheets
    // assignWorksheet: Assign worksheet to client
    // Commenting out until backend implementation is ready
  },

  // Therapist worksheets management
  worksheets: {
    // Get all worksheets created by the therapist
    getAll: (
      params: { status?: string; clientId?: string; limit?: number; offset?: number } = {}
    ): Promise<any[]> => {
      const searchParams = new URLSearchParams();

      if (params.status) searchParams.append("status", params.status);
      if (params.clientId) searchParams.append("clientId", params.clientId);
      if (params.limit) searchParams.append("limit", params.limit.toString());
      if (params.offset) searchParams.append("offset", params.offset.toString());

      const queryString = searchParams.toString()
        ? `?${searchParams.toString()}`
        : "";
      return client.get(`/therapist/worksheets${queryString}`);
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
    getList: (
      params: { status?: string; limit?: number; offset?: number } = {}
    ): Promise<MeetingData[]> => {
      const searchParams = new URLSearchParams();

      if (params.status) searchParams.append("status", params.status);
      if (params.limit) searchParams.append("limit", params.limit.toString());
      if (params.offset)
        searchParams.append("offset", params.offset.toString());

      const queryString = searchParams.toString()
        ? `?${searchParams.toString()}`
        : "";
      return client.get(`/booking/meetings${queryString}`);
    },

    // Get meeting by ID
    getById: (meetingId: string): Promise<MeetingData> =>
      client.get(`/booking/meetings/${meetingId}`),

    // Update meeting (corrected method and path)
    updateStatus: (
      meetingId: string,
      status: MeetingData["status"]
    ): Promise<MeetingData> =>
      client.put(`/booking/meetings/${meetingId}`, { status }),

    // Start a meeting (BACKEND ENDPOINT MISSING - needs implementation)
    // start: (meetingId: string): Promise<{ meetingUrl: string }> =>
    //   client.post(`/booking/meetings/${meetingId}/start`),
  },

  // Enhanced request management endpoints for Module 2
  getClientRequests: (params: {
    status?: 'pending' | 'accepted' | 'declined' | 'expired';
    priority?: 'high' | 'medium' | 'low';
    dateRange?: 'today' | 'week' | 'month' | 'all';
    sortBy?: 'newest' | 'oldest' | 'priority' | 'match_score';
    search?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{
    requests: any[];
    total: number;
    page: number;
    totalPages: number;
  }> => {
    const searchParams = new URLSearchParams();
    
    if (params.status) searchParams.append('status', params.status);
    if (params.priority) searchParams.append('priority', params.priority);
    if (params.dateRange) searchParams.append('dateRange', params.dateRange);
    if (params.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params.search) searchParams.append('search', params.search);
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.offset) searchParams.append('offset', params.offset.toString());

    const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return client.get(`/therapist/requests${queryString}`);
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
