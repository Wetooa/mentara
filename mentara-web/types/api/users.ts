// User management DTOs matching backend exactly

interface User {
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

interface CreateUserRequest {
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

interface UpdateUserRequest {
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

interface UserDeactivationDto {
  reason?: string;
  deactivatedBy?: string;
}

interface UserListParams {
  role?: string;
  status?: string;
  limit?: number;
  offset?: number;
  includeInactive?: boolean;
}

interface UserListResponse {
  users: User[];
  total: number;
  hasMore: boolean;
}

export interface UserFavorite {
  id: string;
  userId: string;
  therapistId: string;
  createdAt: string;
}
