export enum UserRole {
  USER = 'user',
  CLIENT = 'client',
  THERAPIST = 'therapist',
  ADMIN = 'admin',
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface FilterQuery {
  search?: string;
  status?: string;
  userId?: string;
  therapistId?: string;
  [key: string]: any;
}

export interface SuccessResponse {
  success: boolean;
  message: string;
}
