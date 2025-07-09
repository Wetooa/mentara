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

  // Get therapist profile
  getProfile: (id: string): Promise<TherapistRecommendation> =>
    client.get(`/therapists/${id}`),

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
  ): Promise<{ success: boolean; message: string; credentials?: any }> =>
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

    // Get my application (for therapists)
    getMy: (): Promise<TherapistApplication> =>
      client.get("/therapist/application/me"),
  },

  // Dashboard and patient management
  dashboard: {
    // Get therapist dashboard data
    getData: (): Promise<TherapistDashboardData> =>
      client.get("/therapist/dashboard"),

    // Get dashboard stats
    getStats: (): Promise<TherapistDashboardData["stats"]> =>
      client.get("/therapist/dashboard/stats"),

    // Get upcoming appointments
    getUpcomingAppointments: (): Promise<
      TherapistDashboardData["upcomingAppointments"]
    > => client.get("/therapist/dashboard/appointments"),
  },

  // Patient management
  patients: {
    // Get assigned patients list
    getList: (): Promise<PatientData[]> => client.get("/therapist/patients"),

    // Get specific patient details
    getById: (patientId: string): Promise<PatientData> =>
      client.get(`/therapist/patients/${patientId}`),

    // Update patient notes
    updateNotes: (
      patientId: string,
      sessionId: string,
      notes: string
    ): Promise<void> =>
      client.patch(
        `/therapist/patients/${patientId}/sessions/${sessionId}/notes`,
        { notes }
      ),

    // Get patient sessions
    getSessions: (patientId: string): Promise<PatientData["sessions"]> =>
      client.get(`/therapist/patients/${patientId}/sessions`),

    // Get patient worksheets
    getWorksheets: (patientId: string): Promise<PatientData["worksheets"]> =>
      client.get(`/therapist/patients/${patientId}/worksheets`),

    // Assign worksheet to patient
    assignWorksheet: (patientId: string, worksheetData: WorksheetAssignment): Promise<void> =>
      client.post(`/therapist/patients/${patientId}/worksheets`, worksheetData),
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

    // Update meeting status
    updateStatus: (
      meetingId: string,
      status: MeetingData["status"]
    ): Promise<MeetingData> =>
      client.patch(`/booking/meetings/${meetingId}/status`, { status }),

    // Start a meeting
    start: (meetingId: string): Promise<{ meetingUrl: string }> =>
      client.post(`/booking/meetings/${meetingId}/start`),
  },
});

export type TherapistService = ReturnType<typeof createTherapistService>;
