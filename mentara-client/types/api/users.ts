// User management DTOs matching backend exactly

export interface User {
  id: string;
  email: string;
  firstName: string;
  middleName: string;
  lastName: string;
  birthDate: string;
  address: string;
  avatarUrl: string;
  role: 'client' | 'therapist' | 'moderator' | 'admin';
  bio: string;
  coverImageUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  email: string;
  firstName: string;
  middleName: string;
  lastName: string;
  birthDate: string;
  address: string;
  avatarUrl: string;
  role: 'client' | 'therapist' | 'moderator' | 'admin';
  bio: string;
  coverImageUrl: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  birthDate?: string;
  address?: string;
  avatarUrl?: string;
  bio?: string;
  coverImageUrl?: string;
  isActive?: boolean;
}

export interface UserDeactivationDto {
  reason?: string;
  deactivatedBy?: string;
}

export interface UserListParams {
  role?: string;
  status?: string;
  limit?: number;
  offset?: number;
  includeInactive?: boolean;
}

export interface UserListResponse {
  users: User[];
  total: number;
  hasMore: boolean;
}