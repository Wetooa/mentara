import { Patient } from "@/types/patient";

// Get API base URL from environment variable with fallback
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// API response types
interface ApiUser {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  avatarUrl?: string;
  email?: string;
  phone?: string;
  birthDate?: string;
}

interface ApiClient {
  userId: string;
  user?: ApiUser;
  age?: number;
  diagnosis?: string;
  treatmentPlan?: string;
  currentSession?: number;
  totalSessions?: number;
  status?: string;
  assignedAt?: string;
  lastSession?: string;
  nextSession?: string;
  progress?: number;
}

interface ApiMeeting {
  id: string;
  sessionNumber?: number;
  startTime: string;
  duration: number;
  status: string;
  notes?: string;
  meetingType?: string;
  meetingUrl?: string;
}

interface ApiWorksheet {
  id: string;
  title: string;
  createdAt: string;
  dueDate: string;
  isCompleted: boolean;
  instructions?: string;
}

// Patient management API client for therapists
export const patientsApi = {
  // Get all patients assigned to the current therapist
  async getAllPatients(): Promise<Patient[]> {
    const response = await fetch(`${API_URL}/therapist-management/all-clients`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // Add authorization header if needed
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        error.message || `Failed to fetch patients: ${response.status}`
      );
    }

    const clients = await response.json();
    
    // Transform API response to match frontend Patient interface
    return clients.map((client: ApiClient) => ({
      id: client.userId,
      name: `${client.user?.firstName || ''} ${client.user?.lastName || ''}`.trim() || 'Unknown',
      fullName: `${client.user?.firstName || ''} ${client.user?.middleName || ''} ${client.user?.lastName || ''}`.trim(),
      avatar: client.user?.avatarUrl || null,
      email: client.user?.email || '',
      phone: client.user?.phone || '',
      age: client.age || calculateAge(client.user?.birthDate),
      diagnosis: client.diagnosis || 'Not specified',
      treatmentPlan: client.treatmentPlan || 'To be determined',
      currentSession: client.currentSession || 0,
      totalSessions: client.totalSessions || 0,
      status: client.status || 'active',
      assignedAt: client.assignedAt,
      lastSession: client.lastSession,
      nextSession: client.nextSession,
      progress: client.progress || 0,
      sessions: [], // Will be populated when needed
      worksheets: [], // Will be populated when needed
    }));
  },

  // Get specific patient by ID with detailed information
  async getPatientById(patientId: string): Promise<Patient> {
    const response = await fetch(`${API_URL}/therapist-management/client/${patientId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        error.message || `Failed to fetch patient: ${response.status}`
      );
    }

    const client: ApiClient = await response.json();
    
    // Fetch related data (sessions, worksheets) in parallel
    const [sessions, worksheets] = await Promise.allSettled([
      this.getPatientSessions(patientId),
      this.getPatientWorksheets(patientId),
    ]);

    return {
      id: client.userId,
      name: `${client.user?.firstName || ''} ${client.user?.lastName || ''}`.trim() || 'Unknown',
      fullName: `${client.user?.firstName || ''} ${client.user?.middleName || ''} ${client.user?.lastName || ''}`.trim(),
      avatar: client.user?.avatarUrl || null,
      email: client.user?.email || '',
      phone: client.user?.phone || '',
      age: client.age || calculateAge(client.user?.birthDate),
      diagnosis: client.diagnosis || 'Not specified',
      treatmentPlan: client.treatmentPlan || 'To be determined',
      currentSession: client.currentSession || 0,
      totalSessions: client.totalSessions || 0,
      status: client.status || 'active',
      assignedAt: client.assignedAt,
      lastSession: client.lastSession,
      nextSession: client.nextSession,
      progress: client.progress || 0,
      sessions: sessions.status === 'fulfilled' ? sessions.value : [],
      worksheets: worksheets.status === 'fulfilled' ? worksheets.value : [],
    };
  },

  // Get patient sessions/meetings
  async getPatientSessions(patientId: string): Promise<{ id: string; number: number; date: string; duration: number; status: string; notes: string; meetingType?: string; meetingUrl?: string }[]> {
    try {
      const response = await fetch(`${API_URL}/booking/meetings?clientId=${patientId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.warn(`Failed to fetch sessions for patient ${patientId}`);
        return [];
      }

      const meetings: ApiMeeting[] = await response.json();
      
      return meetings.map((meeting: ApiMeeting) => ({
        id: meeting.id,
        number: meeting.sessionNumber || 1,
        date: meeting.startTime,
        duration: meeting.duration,
        status: meeting.status,
        notes: meeting.notes || '',
        meetingType: meeting.meetingType,
        meetingUrl: meeting.meetingUrl,
      }));
    } catch (error) {
      console.error(`Error fetching sessions for patient ${patientId}:`, error);
      return [];
    }
  },

  // Get patient worksheets
  async getPatientWorksheets(patientId: string): Promise<{ id: string; title: string; assignedDate: string; dueDate?: string; status: string; instructions?: string; progress: number }[]> {
    try {
      const response = await fetch(`${API_URL}/worksheets?userId=${patientId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.warn(`Failed to fetch worksheets for patient ${patientId}`);
        return [];
      }

      const worksheets: ApiWorksheet[] = await response.json();
      
      return worksheets.map((worksheet: ApiWorksheet) => ({
        id: worksheet.id,
        title: worksheet.title,
        assignedDate: worksheet.createdAt,
        dueDate: worksheet.dueDate,
        status: worksheet.isCompleted ? 'completed' : 
                (new Date(worksheet.dueDate) < new Date() ? 'overdue' : 'pending'),
        instructions: worksheet.instructions,
        progress: worksheet.isCompleted ? 100 : 0,
      }));
    } catch (error) {
      console.error(`Error fetching worksheets for patient ${patientId}:`, error);
      return [];
    }
  },

  // Search patients by name, diagnosis, or treatment plan
  async searchPatients(query: string): Promise<Patient[]> {
    const patients = await this.getAllPatients();
    
    if (!query.trim()) {
      return patients;
    }

    const searchTerm = query.toLowerCase();
    return patients.filter(
      (patient) =>
        patient.name.toLowerCase().includes(searchTerm) ||
        patient.fullName.toLowerCase().includes(searchTerm) ||
        patient.diagnosis.toLowerCase().includes(searchTerm) ||
        patient.treatmentPlan.toLowerCase().includes(searchTerm) ||
        patient.email.toLowerCase().includes(searchTerm)
    );
  },

  // Update patient information (basic info only)
  async updatePatient(
    patientId: string,
    updates: {
      diagnosis?: string;
      treatmentPlan?: string;
      totalSessions?: number;
      currentSession?: number;
      progress?: number;
    }
  ): Promise<Patient> {
    const response = await fetch(`${API_URL}/therapist-management/client/${patientId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        error.message || `Failed to update patient: ${response.status}`
      );
    }

    return response.json();
  },

  // Create a new session/meeting
  async scheduleSession(data: {
    clientId: string;
    startTime: string;
    duration: number;
    title?: string;
    description?: string;
    meetingType?: string;
  }): Promise<ApiMeeting> {
    const response = await fetch(`${API_URL}/booking/meetings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        error.message || `Failed to schedule session: ${response.status}`
      );
    }

    return response.json();
  },

  // Update session notes
  async updateSessionNotes(
    meetingId: string,
    notes: string
  ): Promise<ApiMeeting> {
    const response = await fetch(`${API_URL}/booking/meetings/${meetingId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ notes }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        error.message || `Failed to update session notes: ${response.status}`
      );
    }

    return response.json();
  },

  // Assign worksheet to patient
  async assignWorksheet(data: {
    clientId: string;
    title: string;
    instructions?: string;
    dueDate: string;
    materials?: {
      filename: string;
      url: string;
      fileSize?: number;
      fileType?: string;
    }[];
  }): Promise<ApiWorksheet> {
    const response = await fetch(`${API_URL}/worksheets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...data,
        userId: data.clientId, // API expects userId
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        error.message || `Failed to assign worksheet: ${response.status}`
      );
    }

    return response.json();
  },
};

// Helper function to calculate age from birth date
function calculateAge(birthDate?: string): number {
  if (!birthDate) return 0;
  
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}