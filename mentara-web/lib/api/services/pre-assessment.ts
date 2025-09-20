import { AxiosInstance } from "axios";
import {
  CreatePreAssessmentDto,
  UpdatePreAssessmentDto,
  PreAssessment,
  PreAssessmentListParams,
  PreAssessmentListResponse,
  AIServiceHealthResponse,
  ReprocessRequest,
} from "@/types/api/pre-assessment";
import { QuestionnaireDefinition } from "@/types/api/questionnaires";
import { SuccessMessageResponse } from "@/types/auth";

/**
 * Pre-Assessment Service
 * Handles all pre-assessment related API operations
 * Maps directly to backend pre-assessment controller
 */
export function createPreAssessmentService(client: AxiosInstance) {
  return {
    // ================================
    // QUESTIONNAIRE OPERATIONS
    // ================================
    /**
     * Get available questionnaires
     * GET /pre-assessment/questionnaires
     */
    async getQuestionnaires(): Promise<QuestionnaireDefinition[]> {
      const response = await client.get("pre-assessment/questionnaires");
      return response.data;
    },

    // ================================
    // PRE-ASSESSMENT OPERATIONS
    // ================================
    /**
     * Create a new pre-assessment
     * POST /pre-assessment
     */
    async create(data: CreatePreAssessmentDto): Promise<PreAssessment> {
      const response = await client.post("pre-assessment", data);
      return response.data;
    },

    /**
     * Get user's pre-assessment
     * GET /pre-assessment
     */
    async getUserAssessment(): Promise<PreAssessment> {
      const response = await client.get("pre-assessment");
      return response.data;
    },

    /**
     * Get pre-assessment by ID (admin/therapist access)
     * GET /pre-assessment/:id
     */
    async getById(id: string): Promise<PreAssessment> {
      const response = await client.get(`pre-assessment/${id}`);
      return response.data;
    },

    /**
     * Update pre-assessment
     * PUT /pre-assessment
     */
    async update(data: UpdatePreAssessmentDto): Promise<PreAssessment> {
      const response = await client.put("pre-assessment", data);
      return response.data;
    },

    /**
     * Update pre-assessment by ID (admin access)
     * PUT /pre-assessment/:id
     */
    async updateById(id: string, data: UpdatePreAssessmentDto): Promise<PreAssessment> {
      const response = await client.put(`pre-assessment/${id}`, data);
      return response.data;
    },

    /**
     * Delete user's pre-assessment
     * DELETE /pre-assessment
     */
    async delete(): Promise<SuccessMessageResponse> {
      const response = await client.delete("pre-assessment");
      return response.data;
    },

    /**
     * Delete pre-assessment by ID (admin access)
     * DELETE /pre-assessment/:id
     */
    async deleteById(id: string): Promise<SuccessMessageResponse> {
      const response = await client.delete(`pre-assessment/${id}`);
      return response.data;
    },

    /**
     * List pre-assessments (admin access)
     * GET /pre-assessment/list
     */
    async list(params?: PreAssessmentListParams): Promise<PreAssessmentListResponse> {
      const response = await client.get("pre-assessment/list", { params });
      return response.data;
    },

    // ================================
    // AI SERVICE OPERATIONS
    // ================================
    /**
     * Get AI service health status
     * GET /pre-assessment/ai-service/health
     */
    async getAIServiceHealth(): Promise<AIServiceHealthResponse> {
      const response = await client.get("pre-assessment/ai-service/health");
      return response.data;
    },

    /**
     * Reprocess pre-assessment with AI
     * POST /pre-assessment/:id/reprocess
     */
    async reprocess(id: string, data?: ReprocessRequest): Promise<PreAssessment> {
      const response = await client.post(`pre-assessment/${id}/reprocess`, data);
      return response.data;
    },

    // ================================
    // CLINICAL ANALYSIS
    // ================================
    /**
     * Get clinical insights from pre-assessment
     * GET /pre-assessment/:id/insights
     */
    async getClinicalInsights(id: string): Promise<any> {
      const response = await client.get(`pre-assessment/${id}/insights`);
      return response.data;
    },
  };
}

// Type for the pre-assessment service
export type PreAssessmentService = ReturnType<typeof createPreAssessmentService>;