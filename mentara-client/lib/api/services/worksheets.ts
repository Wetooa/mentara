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
    async create(data: WorksheetCreateInputDto | FormData): Promise<Worksheet> {
      if (typeof FormData !== 'undefined' && data instanceof FormData) {
        const response = await client.post("worksheets", data, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return response.data;
      } else {
        const response = await client.post("worksheets", data);
        return response.data;
      }
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

    /**
     * Turn in worksheet (create empty submission)
     * POST /worksheets/:id/turn-in
     */
    async turnIn(id: string): Promise<{
      success: boolean;
      message: string;
      data: Worksheet;
    }> {
      const response = await client.post(`worksheets/${id}/turn-in`);
      return response.data;
    },

    /**
     * Unturn in worksheet (delete submission) 
     * POST /worksheets/:id/unturn-in
     */
    async unturnIn(id: string): Promise<{
      success: boolean;
      message: string;
      data: Worksheet;
    }> {
      const response = await client.post(`worksheets/${id}/unturn-in`);
      return response.data;
    },

    /**
     * Upload submission file for worksheet
     * Uses existing uploadFile method but with enhanced submission support
     */
    async uploadSubmissionFile(
      file: File,
      worksheetId: string
    ): Promise<{
      id: string;
      filename: string;
      url: string;
      originalName: string;
      size: number;
      mimeType: string;
      uploadedAt: string;
    }> {
      return this.uploadFile(file, worksheetId, "submission");
    },

    /**
     * Upload multiple submission files
     */
    async uploadSubmissionFiles(
      files: File[],
      worksheetId: string
    ): Promise<Array<{
      id: string;
      filename: string;
      url: string;
      originalName: string;
      size: number;
      mimeType: string;
      uploadedAt: string;
    }>> {
      const uploadPromises = files.map(file => 
        this.uploadSubmissionFile(file, worksheetId)
      );
      return Promise.all(uploadPromises);
    },

    /**
     * Submit worksheet with files (combines turn-in with file uploads)
     */
    async submitWithFiles(worksheetId: string, files: File[] = []): Promise<{
      success: boolean;
      message: string;
      data: Worksheet;
      uploadedFiles?: Array<{
        id: string;
        filename: string;
        url: string;
        originalName: string;
        size: number;
        mimeType: string;
        uploadedAt: string;
      }>;
    }> {
      let uploadedFiles = [];
      
      // Upload files first if provided
      if (files.length > 0) {
        uploadedFiles = await this.uploadSubmissionFiles(files, worksheetId);
      }

      // Turn in the worksheet
      const turnInResult = await this.turnIn(worksheetId);

      return {
        ...turnInResult,
        uploadedFiles,
      };
    },
  };
}

// Type for the worksheets service
export type WorksheetsService = ReturnType<typeof createWorksheetService>;