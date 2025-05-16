import { Task, TaskFile } from "@/components/worksheets/types";

// API endpoints for worksheets
export const submitTherapistApplication = async (data: any) => {
  // Implementation in another file
  return {} as any;
};

// Get API base URL from environment variable with fallback
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Worksheet API client
export const worksheetsApi = {
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

    const response = await fetch(`${API_URL}/worksheets${queryString}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        error.message || `Failed to fetch worksheets: ${response.status}`
      );
    }

    return response.json();
  },

  // Get a single worksheet by ID
  async getById(id: string): Promise<Task> {
    const response = await fetch(`${API_URL}/worksheets/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        error.message || `Failed to fetch worksheet: ${response.status}`
      );
    }

    return response.json();
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
    const response = await fetch(`${API_URL}/worksheets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        error.message || `Failed to create worksheet: ${response.status}`
      );
    }

    return response.json();
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
    const response = await fetch(`${API_URL}/worksheets/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        error.message || `Failed to update worksheet: ${response.status}`
      );
    }

    return response.json();
  },

  // Delete a worksheet
  async delete(id: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_URL}/worksheets/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        error.message || `Failed to delete worksheet: ${response.status}`
      );
    }

    return response.json();
  },

  // Add a submission to a worksheet
  async addSubmission(data: {
    worksheetId: string;
    filename: string;
    url: string;
    fileSize?: number;
    fileType?: string;
  }): Promise<TaskFile> {
    const response = await fetch(`${API_URL}/worksheets/submissions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        error.message || `Failed to add submission: ${response.status}`
      );
    }

    return response.json();
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
    const response = await fetch(`${API_URL}/worksheets/${id}/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        error.message || `Failed to submit worksheet: ${response.status}`
      );
    }

    return response.json();
  },

  // Delete a submission
  async deleteSubmission(
    id: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_URL}/worksheets/submissions/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        error.message || `Failed to delete submission: ${response.status}`
      );
    }

    return response.json();
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
    const formData = new FormData();
    formData.append("file", file);
    formData.append("worksheetId", worksheetId);
    formData.append("type", type);

    const response = await fetch(`${API_URL}/worksheets/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        error.message || `Failed to upload file: ${response.status}`
      );
    }

    return response.json();
  },
};
