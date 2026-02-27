import { UserRole } from '../../common/types';

export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  user: UserResponse;
  token: string;
  refreshToken?: string;
  message?: string;
}

export type LoginResponse = AuthResponse
export type RegisterResponse = AuthResponse
