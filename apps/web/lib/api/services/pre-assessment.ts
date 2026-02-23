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
    // PRE-ASSESSMENT OPERATIONS
    // ================================
    /**
     * Create a new pre-assessment
     * POST /pre-assessment
     */
    async create(data: CreatePreAssessmentDto): Promise<PreAssessment> {
      const response = await client.post("/pre-assessment", data);
      return response.data;
    },

    /**
     * Create a new anonymous pre-assessment
     * POST /pre-assessment/anonymous
     */
    async createAnonymous(sessionId: string, data: CreatePreAssessmentDto): Promise<PreAssessment> {
      const response = await client.post("/pre-assessment/anonymous", { sessionId, data });
      return response.data;
    },

    /**
     * Link an anonymous pre-assessment to a logged-in user
     * POST /pre-assessment/link
     */
    async link(sessionId: string): Promise<PreAssessment> {
      const response = await client.post("/pre-assessment/link", { sessionId });
      return response.data;
    },

    /**
     * Get user's pre-assessment
     * GET /pre-assessment
     */
    async getUserAssessment(): Promise<PreAssessment> {
      const response = await client.get("/pre-assessment");
      return response.data;
    },

    /**
     * Get pre-assessment by ID (admin/therapist access)
     * GET /pre-assessment/:id
     */
    async getById(id: string): Promise<PreAssessment> {
      const response = await client.get(`/pre-assessment/${id}`);
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
      const response = await client.get(`/pre-assessment/${id}/insights`);
      return response.data;
    },


  };
}

// Type for the pre-assessment service
export type PreAssessmentService = ReturnType<typeof createPreAssessmentService>;