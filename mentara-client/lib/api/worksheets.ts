import { Task, TaskFile } from "@/components/worksheets/types";
import { useAuth } from "@clerk/nextjs";

// Get API base URL from environment variable with fallback  
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Helper function to make authenticated requests
async function makeAuthenticatedRequest<T>(
  endpoint: string,
  getToken: () => Promise<string | null>,
  options: RequestInit = {}
): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  } else {
    console.warn("No auth token available for worksheets API request");
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    console.error("Worksheets API Error:", {
      status: response.status,
      statusText: response.statusText,
      error,
      endpoint,
    });
    throw new Error(
      error.message || `Failed to complete request: ${response.status}`
    );
  }

  return response.json();
}

// Create worksheets API client that requires a getToken function
export const createWorksheetsApi = (getToken: () => Promise<string | null>) => ({
  // Get all worksheets with optional filters
  async getAll(
    userId?: string,
    therapistId?: string,
    status?: string
  ): Promise<Task[]> {
    // Build query parameters if provided
    const params = new URLSearchParams();
    if (userId) params.append("userId", userId);
    if (therapistId) params.append("therapistId", therapistId);
    if (status) params.append("status", status);

    const queryString = params.toString() ? `?${params.toString()}` : "";

    return makeAuthenticatedRequest<Task[]>(
      `/worksheets${queryString}`,
      getToken,
      { method: "GET" }
    );
  },

  // Get a single worksheet by ID
  async getById(id: string): Promise<Task> {
    return makeAuthenticatedRequest<Task>(
      `/worksheets/${id}`,
      getToken,
      { method: "GET" }
    );
  },

  // Create a new worksheet
  async create(data: {
    title: string;
    instructions?: string;
    dueDate: string;
    userId: string;
    therapistId: string;
    materials?: {
      filename: string;
      url: string;
      fileSize?: number;
      fileType?: string;
    }[];
  }): Promise<Task> {
    return makeAuthenticatedRequest<Task>(
      `/worksheets`,
      getToken,
      { method: "POST", body: JSON.stringify(data) }
    );
  },

  // Update an existing worksheet
  async update(
    id: string,
    data: {
      title?: string;
      instructions?: string;
      dueDate?: string;
      status?: "upcoming" | "past_due" | "completed";
      isCompleted?: boolean;
      submittedAt?: string;
      feedback?: string;
    }
  ): Promise<Task> {
    return makeAuthenticatedRequest<Task>(
      `/worksheets/${id}`,
      getToken,
      { method: "PUT", body: JSON.stringify(data) }
    );
  },

  // Delete a worksheet
  async delete(id: string): Promise<{ success: boolean; message: string }> {
    return makeAuthenticatedRequest<{ success: boolean; message: string }>(
      `/worksheets/${id}`,
      getToken,
      { method: "DELETE" }
    );
  },

  // Add a submission to a worksheet
  async addSubmission(data: {
    worksheetId: string;
    filename: string;
    url: string;
    fileSize?: number;
    fileType?: string;
  }): Promise<TaskFile> {
    return makeAuthenticatedRequest<TaskFile>(
      `/worksheets/submissions`,
      getToken,
      { method: "POST", body: JSON.stringify(data) }
    );
  },

  // Submit a worksheet (mark as completed)
  async submitWorksheet(
    id: string,
    data: {
      submissions?: {
        filename: string;
        url: string;
        fileSize?: number;
        fileType?: string;
      }[];
      complete: boolean;
    }
  ): Promise<Task> {
    return makeAuthenticatedRequest<Task>(
      `/worksheets/${id}/submit`,
      getToken,
      { method: "POST", body: JSON.stringify(data) }
    );
  },

  // Delete a submission
  async deleteSubmission(
    id: string
  ): Promise<{ success: boolean; message: string }> {
    return makeAuthenticatedRequest<{ success: boolean; message: string }>(
      `/worksheets/submissions/${id}`,
      getToken,
      { method: "DELETE" }
    );
  },

  // Upload a file for a worksheet (material or submission)
  async uploadFile(
    file: File,
    worksheetId: string,
    type: "material" | "submission"
  ): Promise<{
    id: string;
    filename: string;
    url: string;
    fileSize: number;
    fileType: string;
  }> {
    const token = await getToken();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("worksheetId", worksheetId);
    formData.append("type", type);

    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/worksheets/upload`, {
      method: "POST",
      headers,
      body: formData,
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error("Worksheets Upload Error:", {
        status: response.status,
        statusText: response.statusText,
        error,
      });
      throw new Error(
        error.message || `Failed to upload file: ${response.status}`
      );
    }

    return response.json();
  },
});

// Export a default instance that can be used without authentication (backward compatibility)
// This will be deprecated once all components are updated
export const worksheetsApi = {
  async getAll(): Promise<Task[]> {
    throw new Error("Please use createWorksheetsApi with authentication");
  },
  async getById(): Promise<Task> {
    throw new Error("Please use createWorksheetsApi with authentication");
  },
  async create(): Promise<Task> {
    throw new Error("Please use createWorksheetsApi with authentication");
  },
  async update(): Promise<Task> {
    throw new Error("Please use createWorksheetsApi with authentication");
  },
  async delete(): Promise<{ success: boolean; message: string }> {
    throw new Error("Please use createWorksheetsApi with authentication");
  },
  async addSubmission(): Promise<TaskFile> {
    throw new Error("Please use createWorksheetsApi with authentication");
  },
  async submitWorksheet(): Promise<Task> {
    throw new Error("Please use createWorksheetsApi with authentication");
  },
  async deleteSubmission(): Promise<{ success: boolean; message: string }> {
    throw new Error("Please use createWorksheetsApi with authentication");
  },
  async uploadFile(): Promise<any> {
    throw new Error("Please use createWorksheetsApi with authentication");
  },
};
