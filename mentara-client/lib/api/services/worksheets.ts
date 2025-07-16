import { AxiosInstance } from 'axios';
import {
  WorksheetCreateInputDto,
  WorksheetUpdateInputDto,
  Worksheet,
  WorksheetQuery,
  WorksheetSubmissionCreateInputDto,
  WorksheetSubmission,
  CreateSubmissionDto,
  ReviewSubmissionDto,
  WorksheetAssignment,
  CreateAssignmentDto,
  UpdateAssignmentDto,
  WorksheetIdParam,
  AssignmentIdParam,
  SubmissionIdParam,
  WorksheetParamsDto,
  WorksheetsQueryDto,
  SubmissionParamsDto,
} from 'mentara-commons';

// Extended interfaces for UI-specific data structures
export interface WorksheetListParams {
  userId?: string;
  therapistId?: string;
  isCompleted?: boolean;
  overdue?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface WorksheetListResponse {
  worksheets: Worksheet[];
  total: number;
  hasMore: boolean;
}

export interface SubmitWorksheetRequest {
  responses: Record<string, any>;
  attachments?: string[];
  notes?: string;
  timeSpent?: number;
}

export interface WorksheetStats {
  totalWorksheets: number;
  completedWorksheets: number;
  pendingWorksheets: number;
  overdueWorksheets: number;
  averageCompletionTime: number;
  completionRate: number;
  recentActivity: Array<{
    id: string;
    title: string;
    status: string;
    completedAt?: string;
    dueDate?: string;
  }>;
}

export interface WorksheetsService {
  getAll(params?: WorksheetListParams): Promise<WorksheetListResponse>;
  getById(id: string): Promise<Worksheet>;
  create(data: WorksheetCreateInputDto): Promise<Worksheet>;
  update(id: string, data: WorksheetUpdateInputDto): Promise<Worksheet>;
  delete(id: string): Promise<void>;
  
  // Submissions
  submissions: {
    add(data: WorksheetSubmissionCreateInputDto): Promise<WorksheetSubmission>;
    delete(id: string): Promise<void>;
  };
  
  // Submit worksheet (mark as completed)
  submit(id: string, data: SubmitWorksheetRequest): Promise<Worksheet>;
  
  // Statistics
  getStats(params?: { userId?: string; therapistId?: string }): Promise<WorksheetStats>;
  
  // File upload for worksheets
  uploadFile(file: File, worksheetId: string, type: 'material' | 'submission'): Promise<{
    id: string;
    filename: string;
    url: string;
    fileSize: number;
    fileType: string;
  }>;
}

export const createWorksheetsService = (client: AxiosInstance): WorksheetsService => ({
  getAll: (params: WorksheetListParams = {}): Promise<WorksheetListResponse> => {
    const searchParams = new URLSearchParams();
    
    if (params.userId) searchParams.append('userId', params.userId);
    if (params.therapistId) searchParams.append('therapistId', params.therapistId);
    if (params.isCompleted !== undefined) searchParams.append('isCompleted', params.isCompleted.toString());
    if (params.overdue !== undefined) searchParams.append('overdue', params.overdue.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.offset) searchParams.append('offset', params.offset.toString());
    if (params.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);

    const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return client.get(`/worksheets${queryString}`);
  },

  getById: (id: string): Promise<Worksheet> =>
    client.get(`/worksheets/${id}`),

  create: (data: WorksheetCreateInputDto): Promise<Worksheet> =>
    client.post('/worksheets', data),

  update: (id: string, data: WorksheetUpdateInputDto): Promise<Worksheet> =>
    client.put(`/worksheets/${id}`, data),

  delete: (id: string): Promise<void> =>
    client.delete(`/worksheets/${id}`),

  // Submissions
  submissions: {
    add: (data: WorksheetSubmissionCreateInputDto): Promise<WorksheetSubmission> =>
      client.post('/worksheets/submissions', data),

    delete: (id: string): Promise<void> =>
      client.delete(`/worksheets/submissions/${id}`),
  },

  // Submit worksheet (mark as completed)
  submit: (id: string, data: SubmitWorksheetRequest): Promise<Worksheet> =>
    client.post(`/worksheets/${id}/submit`, data),

  // Statistics
  getStats: (params: { userId?: string; therapistId?: string } = {}): Promise<WorksheetStats> => {
    const searchParams = new URLSearchParams();
    if (params.userId) searchParams.append('userId', params.userId);
    if (params.therapistId) searchParams.append('therapistId', params.therapistId);

    const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return client.get(`/worksheets/stats${queryString}`);
  },

  // File upload for worksheets
  uploadFile: (file: File, worksheetId: string, type: 'material' | 'submission'): Promise<{
    id: string;
    filename: string;
    url: string;
    fileSize: number;
    fileType: string;
  }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('worksheetId', worksheetId);
    formData.append('type', type);

    return client.post('/worksheets/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
});