import { AxiosInstance } from "axios";
import {
  Worksheet,
  WorksheetCreateInputDto,
  WorksheetUpdateInputDto,
  WorksheetListParams,
  WorksheetListResponse,
  WorksheetSubmissionCreateInputDto,
  WorksheetSubmission,
  SubmitWorksheetRequest,
  WorksheetStats,
} from "@/types/api/worksheets";

/**
 * Worksheets Service
 * Handles all worksheet-related API operations
 * Maps directly to backend worksheets controller endpoints
 */
export function createWorksheetService(client: AxiosInstance) {
  return {
    /**
     * Get all worksheets with optional filtering
     * GET /worksheets
     */
    async getAll(params?: WorksheetListParams) : Promise<WorksheetListResponse> {
      const response = await client.get("worksheets", { params });
      return response.data;
    },

    /**
     * Get worksheet by ID
     * GET /worksheets/:id
     */
    async getById(id: string): Promise<Worksheet> {
      const response = await client.get(`worksheets/${id}`);
      return response.data;
    },

    /**
     * Create a new worksheet
     * POST /worksheets
     */
    async create(data: WorksheetCreateInputDto): Promise<Worksheet> {
      const response = await client.post("worksheets", data);
      return response.data;
    },

    /**
     * Update an existing worksheet
     * PUT /worksheets/:id
     */
    async update(id: string, data: WorksheetUpdateInputDto): Promise<Worksheet> {
      const response = await client.put(`worksheets/${id}`, data);
      return response.data;
    },

    /**
     * Delete a worksheet
     * DELETE /worksheets/:id
     */
    async delete(id: string): Promise<{ success: boolean; message: string }> {
      const response = await client.delete(`worksheets/${id}`);
      return response.data;
    },

    /**
     * Submit a worksheet
     * POST /worksheets/:id/submit
     */
    async submit(id: string, data: SubmitWorksheetRequest): Promise<{
      worksheetId: string;
      submissionId: string;
      status: string;
      submittedAt: string;
      message: string;
    }> {
      const response = await client.post(`worksheets/${id}/submit`, data);
      return response.data;
    },

    /**
     * Add a submission to a worksheet
     * POST /worksheets/submissions
     */
    async addSubmission(data: WorksheetSubmissionCreateInputDto): Promise<{
      id: string;
      worksheetId: string;
      clientId: string;
      status: string;
      submittedAt: string;
    }> {
      const response = await client.post("worksheets/submissions", data);
      return response.data;
    },

    /**
     * Delete a worksheet submission
     * DELETE /worksheets/submissions/:id
     */
    async deleteSubmission(id: string): Promise<{ success: boolean; message: string }> {
      const response = await client.delete(`worksheets/submissions/${id}`);
      return response.data;
    },

    /**
     * Upload file for worksheet submission
     * POST /worksheets/:id/upload
     */
    async uploadFile(
      file: File,
      worksheetId: string,
      type: "submission" | "material" = "submission"
    ): Promise<{
      id: string;
      filename: string;
      url: string;
      originalName: string;
      size: number;
      mimeType: string;
      uploadedAt: string;
    }> {
      // Validate file before upload
      const validation = this.validateFile(file);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

      const response = await client.post(`worksheets/${worksheetId}/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },

    /**
     * Validate file for worksheet upload
     */
    validateFile(file: File, maxSize: number = 5 * 1024 * 1024): { isValid: boolean; error?: string } {
      // Check file size (default 5MB for worksheets)
      if (file.size > maxSize) {
        return {
          isValid: false,
          error: `File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`
        };
      }

      // Check file type - worksheet specific allowed types
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'image/jpeg',
        'image/png',
      ];

      if (!allowedTypes.includes(file.type)) {
        return {
          isValid: false,
          error: "Invalid file type. Please upload PDF, DOC, DOCX, TXT, JPG, or PNG files only."
        };
      }

      return { isValid: true };
    },

    /**
     * Get worksheet statistics
     * GET /worksheets/stats
     */
    async getStats(params?: { userId?: string; therapistId?: string }): Promise<WorksheetStats> {
      const response = await client.get("worksheets/stats", { params });
      return response.data;
    },
  };
}

// Type for the worksheets service
export type WorksheetsService = ReturnType<typeof createWorksheetService>;