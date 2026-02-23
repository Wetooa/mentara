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

    // ================================
    // CHATBOT OPERATIONS
    // ================================
    /**
     * Start a new chatbot session
     * POST /pre-assessment/chatbot/start
     */
    async startChatbotSession(): Promise<{ sessionId: string }> {
      console.log('[API] Starting chatbot session...');
      try {
        const response = await client.post("/pre-assessment/chatbot/start");
        console.log('[API] Chatbot session started:', response.data);
        return response.data;
      } catch (error) {
        console.error('[API] Failed to start chatbot session:', error);
        throw error;
      }
    },

    /**
     * Send a message to the chatbot
     * POST /pre-assessment/chatbot/message
     */
    async sendChatbotMessage(sessionId: string, message: string): Promise<{
      response: string;
      isComplete: boolean;
      currentQuestionnaire?: string;
      toolCall?: {
        tool: string;
        questionId: string;
        topic?: string;
        question: string;
        options: Array<{ value: number; label: string }>;
      };
    }> {
      const startTime = Date.now();
      console.log('[API] 📤 Sending chatbot message:', {
        sessionId,
        messageLength: message.length,
        messagePreview: message.substring(0, 100),
        timestamp: new Date().toISOString(),
      });

      try {
        // Use extended timeout for AI operations (180 seconds for Ollama)
        const response = await client.post("/pre-assessment/chatbot/message", {
          sessionId,
          message,
        }, {
          timeout: 180000, // 180 seconds (3 minutes) for AI operations - increased for Ollama
        });

        const duration = Date.now() - startTime;
        console.log('[API] ✅ Chatbot response received:', {
          duration: `${duration}ms`,
          responseLength: response.data?.response?.length || 0,
          isComplete: response.data?.isComplete,
          currentQuestionnaire: response.data?.currentQuestionnaire,
          hasToolCall: !!response.data?.toolCall,
          toolCallDetails: response.data?.toolCall ? JSON.stringify(response.data.toolCall, null, 2) : 'none',
        });

        return response.data;
      } catch (error: any) {
        const duration = Date.now() - startTime;
        const isTimeout = error.code === 'ECONNABORTED' || error.message?.includes('timeout');
        const isNetworkError = !error.response && error.request;

        console.error('[API] ❌ Failed to send chatbot message:', {
          errorType: isTimeout ? 'TIMEOUT' : isNetworkError ? 'NETWORK_ERROR' : 'API_ERROR',
          duration: `${duration}ms`,
          timeout: isTimeout ? 'Request exceeded 180s timeout' : undefined,
          status: error.response?.status,
          statusText: error.response?.statusText,
          message: error.message,
          code: error.code,
          url: error.config?.url,
          baseURL: error.config?.baseURL,
          fullUrl: `${error.config?.baseURL || ''}${error.config?.url || ''}`,
          responseData: error.response?.data,
          requestData: error.config?.data ? JSON.parse(error.config.data) : undefined,
        });

        // Re-throw with more context
        if (isTimeout) {
          const timeoutError = new Error(
            `Request timeout: The AI response took longer than 3 minutes. This may indicate the backend is processing a complex request. Please try again.`
          );
          (timeoutError as any).code = 'TIMEOUT';
          (timeoutError as any).originalError = error;
          throw timeoutError;
        }

        throw error;
      }
    },

    /**
     * Submit a structured answer from a tool call question
     * POST /pre-assessment/chatbot/answer
     */
    async submitStructuredAnswer(
      sessionId: string,
      questionId: string,
      answer: number
    ): Promise<{
      success: boolean;
      acknowledged: string;
    }> {
      console.log('[API] Submitting structured answer:', { sessionId, questionId, answer });
      try {
        const response = await client.post("/pre-assessment/chatbot/answer", {
          sessionId,
          questionId,
          answer,
        });
        console.log('[API] Structured answer submitted:', response.data);
        return response.data;
      } catch (error) {
        console.error('[API] Failed to submit structured answer:', error);
        console.error('[API] Error details:', {
          status: (error as any)?.response?.status,
          data: (error as any)?.response?.data,
          message: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }
    },

    /**
     * Complete chatbot session and get results
     * POST /pre-assessment/chatbot/complete
     */
    async completeChatbotSession(sessionId: string): Promise<{
      success: boolean;
      sessionId?: string;
    }> {
      const response = await client.post("/pre-assessment/chatbot/complete", {
        sessionId,
      });
      return response.data;
    },

    /**
     * Get chatbot session state
     * GET /pre-assessment/chatbot/session/:sessionId
     */
    async getChatbotSession(sessionId: string): Promise<{
      sessionId: string;
      currentQuestionnaire: string | null;
      completedQuestionnaires: string[];
      isComplete: boolean;
      startedAt: string;
    }> {
      const response = await client.get(`/pre-assessment/chatbot/session/${sessionId}`);
      return response.data;
    },

    /**
     * Get all chatbot sessions for user
     * GET /pre-assessment/chatbot/sessions
     */
    async getUserChatbotSessions(): Promise<Array<{
      sessionId: string;
      startedAt: string;
      completedAt: string | null;
      isComplete: boolean;
      completedQuestionnaires: string[];
    }>> {
      const response = await client.get("/pre-assessment/chatbot/sessions");
      return response.data;
    },

    /**
     * Get chatbot session insights
     * GET /pre-assessment/chatbot/sessions/:sessionId/insights
     */
    async getChatbotSessionInsights(sessionId: string): Promise<{
      insights: any;
    }> {
      const response = await client.get(`/pre-assessment/chatbot/sessions/${sessionId}/insights`);
      return response.data;
    },

    /**
     * Resume a chatbot session
     * POST /pre-assessment/chatbot/sessions/:sessionId/resume
     */
    async resumeChatbotSession(sessionId: string): Promise<{
      sessionId: string;
      currentQuestionnaire: string | null;
      isComplete: boolean;
      startedAt: string;
    }> {
      const response = await client.post(`/pre-assessment/chatbot/sessions/${sessionId}/resume`);
      return response.data;
    },

    /**
     * Suggest questionnaires based on conversation
     * POST /pre-assessment/chatbot/suggest-questionnaires
     */
    async suggestQuestionnaires(sessionId: string): Promise<{
      suggestedQuestionnaires: Array<{
        questionnaire: string;
        priority: number;
        reasoning: string;
        confidence: number;
      }>;
      recommendedOrder: string[];
      urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
    }> {
      const response = await client.post("/pre-assessment/chatbot/suggest-questionnaires", {
        sessionId,
      });
      return response.data;
    },

    /**
     * Link an anonymous chatbot session to the authenticated user
     * POST /pre-assessment/chatbot/link-session
     */
    async linkAnonymousSession(sessionId: string): Promise<{
      scores: Record<string, { score: number; severity: string }>;
      severityLevels: Record<string, string>;
      preAssessment: PreAssessment;
    }> {
      const response = await client.post("/pre-assessment/chatbot/link-session", {
        sessionId,
      });
      return response.data;
    },
  };
}

// Type for the pre-assessment service
export type PreAssessmentService = ReturnType<typeof createPreAssessmentService>;