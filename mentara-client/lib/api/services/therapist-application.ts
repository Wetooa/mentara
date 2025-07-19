import { AxiosInstance } from 'axios';
import {
  TherapistApplication,
  ApplicationStatusUpdateDto,
  ApplicationListParams,
  ApplicationListResponse,
  SubmitApplicationWithDocumentsRequest,
  SubmitApplicationResponse,
  ApplicationStatusUpdateResponse,
} from 'mentara-commons';

export interface TherapistApplicationService {
  // Public submission (no auth required)
  submitWithDocuments(data: SubmitApplicationWithDocumentsRequest): Promise<SubmitApplicationResponse>;
  
  // Admin operations (auth required)
  admin: {
    getAll(params?: ApplicationListParams): Promise<ApplicationListResponse>;
    getById(id: string): Promise<TherapistApplication>;
    updateStatus(id: string, data: ApplicationStatusUpdateDto): Promise<ApplicationStatusUpdateResponse>;
    getFiles(id: string): Promise<{ files: TherapistApplication['documents'] }>;
    downloadFile(fileId: string): Promise<Blob>;
  };
  
  // Applicant operations (auth required)
  applicant: {
    getMy(): Promise<TherapistApplication | null>;
    getStatus(id: string): Promise<{ status: TherapistApplication['status']; adminNotes?: string }>;
  };
}

export const createTherapistApplicationService = (client: AxiosInstance): TherapistApplicationService => ({
  // Public submission (no auth required)
  submitWithDocuments: (data: SubmitApplicationWithDocumentsRequest): Promise<SubmitApplicationResponse> => {
    const formData = new FormData();
    
    // Add application data as JSON string
    formData.append('applicationDataJson', JSON.stringify(data.application));
    
    // Add files to form data
    data.files.forEach((file) => {
      formData.append('files', file);
    });
    
    // Add file type mappings
    formData.append('fileTypes', JSON.stringify(data.fileTypes));

    return client.post('/auth/therapist/apply-with-documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Admin operations (auth required)
  admin: {
    getAll: (params: ApplicationListParams = {}): Promise<ApplicationListResponse> => {
      const searchParams = new URLSearchParams();
      
      if (params.status) searchParams.append('status', params.status);
      if (params.submittedAfter) searchParams.append('submittedAfter', params.submittedAfter);
      if (params.submittedBefore) searchParams.append('submittedBefore', params.submittedBefore);
      if (params.reviewedBy) searchParams.append('reviewedBy', params.reviewedBy);
      if (params.specialty) searchParams.append('specialty', params.specialty);
      if (params.state) searchParams.append('state', params.state);
      if (params.limit) searchParams.append('limit', params.limit.toString());
      if (params.offset) searchParams.append('offset', params.offset.toString());
      if (params.sortBy) searchParams.append('sortBy', params.sortBy);
      if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);

      const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
      return client.get(`/therapist/application${queryString}`);
    },

    getById: (id: string): Promise<TherapistApplication> =>
      client.get(`/therapist/application/${id}`),

    updateStatus: (id: string, data: ApplicationStatusUpdateDto): Promise<ApplicationStatusUpdateResponse> =>
      client.put(`/therapist/application/${id}/status`, data),

    getFiles: (id: string): Promise<{ files: TherapistApplication['documents'] }> =>
      client.get(`/therapist/application/${id}/files`),

    downloadFile: (fileId: string): Promise<Blob> =>
      client.get(`/admin/files/${fileId}/download`, {
        responseType: 'blob',
      }),
  },

  // Applicant operations (auth required)
  applicant: {
    getMy: (): Promise<TherapistApplication | null> =>
      client.get('/therapist/application/my'),

    getStatus: (id: string): Promise<{ status: TherapistApplication['status']; adminNotes?: string }> =>
      client.get(`/therapist/application/${id}/status`),
  },
});