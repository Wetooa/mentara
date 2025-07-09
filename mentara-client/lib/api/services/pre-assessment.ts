import { AxiosInstance } from 'axios';
import {
  CreatePreAssessmentDto,
  UpdatePreAssessmentDto,
  PreAssessment,
  PreAssessmentListParams,
  PreAssessmentListResponse,
  AIServiceHealthResponse,
  ReprocessRequest,
} from '@/types/api/pre-assessment';

export interface PreAssessmentService {
  create(data: CreatePreAssessmentDto): Promise<PreAssessment>;
  getAll(params?: PreAssessmentListParams): Promise<PreAssessmentListResponse>;
  getById(id: string): Promise<PreAssessment>;
  update(id: string, data: UpdatePreAssessmentDto): Promise<PreAssessment>;
  delete(id: string): Promise<void>;
  
  // Get current user's assessment
  getMy(): Promise<PreAssessment | null>;
  
  // Reprocess assessment through AI
  reprocess(id: string, data?: ReprocessRequest): Promise<PreAssessment>;
  
  // Admin operations
  admin: {
    getAIServiceHealth(): Promise<AIServiceHealthResponse>;
    reprocessAll(params?: { force?: boolean; olderThan?: string }): Promise<{ queued: number }>;
  };
}

export const createPreAssessmentService = (client: AxiosInstance): PreAssessmentService => ({
  create: (data: CreatePreAssessmentDto): Promise<PreAssessment> =>
    client.post('/pre-assessment', data),

  getAll: (params: PreAssessmentListParams = {}): Promise<PreAssessmentListResponse> => {
    const searchParams = new URLSearchParams();
    
    if (params.userId) searchParams.append('userId', params.userId);
    if (params.isProcessed !== undefined) searchParams.append('isProcessed', params.isProcessed.toString());
    if (params.overallRisk) searchParams.append('overallRisk', params.overallRisk);
    if (params.processedAfter) searchParams.append('processedAfter', params.processedAfter);
    if (params.processedBefore) searchParams.append('processedBefore', params.processedBefore);
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.offset) searchParams.append('offset', params.offset.toString());
    if (params.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);

    const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return client.get(`/pre-assessment${queryString}`);
  },

  getById: (id: string): Promise<PreAssessment> =>
    client.get(`/pre-assessment/${id}`),

  update: (id: string, data: UpdatePreAssessmentDto): Promise<PreAssessment> =>
    client.put(`/pre-assessment/${id}`, data),

  delete: (id: string): Promise<void> =>
    client.delete(`/pre-assessment/${id}`),

  // Get current user's assessment
  getMy: (): Promise<PreAssessment | null> =>
    client.get('/pre-assessment/my'),

  // Reprocess assessment through AI
  reprocess: (id: string, data: ReprocessRequest = {}): Promise<PreAssessment> =>
    client.post(`/pre-assessment/${id}/reprocess`, data),

  // Admin operations
  admin: {
    getAIServiceHealth: (): Promise<AIServiceHealthResponse> =>
      client.get('/pre-assessment/ai-service/health'),

    reprocessAll: (params: { force?: boolean; olderThan?: string } = {}): Promise<{ queued: number }> =>
      client.post('/admin/pre-assessment/reprocess-all', params),
  },
});