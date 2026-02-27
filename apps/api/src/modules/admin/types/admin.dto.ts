import { UserRole } from '../../../common/types';

export interface AdminUpdateUserDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: UserRole;
  isActive?: boolean;
  bio?: string;
  avatarUrl?: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
  gender?: string;
  location?: string;
}

export interface AdminUserQuery {
  search?: string;
  role?: UserRole;
  isActive?: boolean;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface AdminUpdateTherapistDto {
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  areasOfExpertise?: string[];
  hourlyRate?: number;
  yearsOfExperience?: number;
  licenseNumber?: string;
  licenseType?: string;
  education?: string[];
  certifications?: string[];
  languages?: string[];
  province?: string;
  city?: string;
  timezone?: string;
  profileSummary?: string;
}

export interface AdminTherapistQuery {
  search?: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  specialties?: string[];
  location?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface CreateAdminAccountDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'moderator';
}

export interface CreateAdminDto {
  userId: string;
  permissions: string[];
  adminLevel?: string;
}

export interface UpdateAdminDto {
  permissions?: string[];
  adminLevel?: string;
}

export interface AdminResponseDto {
  userId: string;
  permissions: string[];
  adminLevel: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminAccountQuery {
  search?: string;
  role?: 'admin' | 'moderator';
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Additional admin therapist DTOs
export interface ApproveTherapistDto {
  reason?: string;
  welcomeMessage?: string;
  verifyLicense?: boolean;
  approvalMessage?: string;
}

export interface RejectTherapistDto {
  reason: string;
  rejectionMessage?: string;
  allowReapplication?: boolean;
  rejectionReason?: string;
}

export interface UpdateTherapistStatusDto {
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  reason?: string;
  notes?: string;
}

export interface PendingTherapistFiltersDto {
  search?: string;
  status?: string;
  province?: string;
  submittedAfter?: string;
  processedBy?: string;
  providerType?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Response types
export interface TherapistApplicationDetailsResponse {
  id: string;
  status: string;
  submittedAt: string;
  user: any;
  application: any;
}

export interface TherapistActionResponse {
  success: boolean;
  message: string;
  therapistId: string;
}

export interface TherapistApplicationMetricsResponse {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  suspended: number;
}

export interface TherapistListResponse {
  therapists: any[];
  total: number;
  page: number;
  limit: number;
}