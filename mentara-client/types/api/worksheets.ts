// Worksheets DTOs matching backend exactly

export interface WorksheetCreateInputDto {
  title: string;
  instructions?: string;
  dueDate: string;
  userId: string; // client/patient ID
  therapistId: string;
  materials?: WorksheetMaterial[];
}

export interface WorksheetUpdateInputDto {
  title?: string;
  instructions?: string;
  dueDate?: string;
  isCompleted?: boolean;
  feedback?: string;
}

export interface Worksheet {
  id: string;
  title: string;
  instructions?: string;
  dueDate: string;
  status: WorksheetStatus;
  clientId: string;
  client: {
    userId: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      avatarUrl: string;
    };
  };
  therapistId: string;
  therapist: {
    userId: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      avatarUrl: string;
    };
  };
  // Backend uses arrays for materials instead of objects
  materialUrls: string[];
  materialNames: string[];
  // Backend returns singular submission, not plural submissions
  submission: WorksheetSubmission | null;
  createdAt: string;
  updatedAt: string;
}

export enum WorksheetStatus {
  ASSIGNED = 'ASSIGNED',
  SUBMITTED = 'SUBMITTED', 
  REVIEWED = 'REVIEWED',
  OVERDUE = 'OVERDUE'
}

export interface WorksheetMaterial {
  id: string;
  worksheetId: string;
  filename: string;
  url: string;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
}

export interface WorksheetSubmissionCreateInputDto {
  worksheetId: string;
  filename: string;
  url: string;
  fileSize?: number;
  fileType?: string;
}

export interface WorksheetSubmission {
  id: string;
  worksheetId: string;
  // Backend uses arrays for multiple file support
  fileUrls: string[];
  fileNames: string[];
  fileSizes: number[];
  submittedAt: string;
  feedback?: string;
}

export interface WorksheetListParams {
  userId?: string;
  therapistId?: string;
  isCompleted?: boolean;
  overdue?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: 'dueDate' | 'createdAt' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export interface WorksheetListResponse {
  worksheets: Worksheet[];
  total: number;
  hasMore: boolean;
}

export interface SubmitWorksheetRequest {
  submissions?: {
    filename: string;
    url: string;
    fileSize?: number;
    fileType?: string;
  }[];
  complete: boolean;
}

export interface WorksheetStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
}