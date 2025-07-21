/**
 * User Module DTOs - Data Transfer Objects for user operations
 * These are pure TypeScript interfaces without validation logic
 */

// Path parameter types
export interface UserIdParam {
  id: string;
}

// User deactivation DTO
export interface DeactivateUserDto {
  reason: string;
}

// User update DTO (comprehensive interface for user profile updates)
export interface UpdateUserRequest {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  birthDate?: string;
  address?: string;
  bio?: string;
  avatarUrl?: string;
  coverImageUrl?: string;
  timezone?: string;
  language?: string;
  theme?: string;
  isActive?: boolean;
  role?: string;
}

// User DTO (output type for API responses)
export interface UserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  role: string;
  isEmailVerified: boolean;
  isActive: boolean;
  avatarUrl?: string;
  coverImageUrl?: string;
  phoneNumber?: string;
  birthDate?: string;
  address?: string;
  bio?: string;
  timezone?: string;
  language?: string;
  theme?: string;
  createdAt: string;
  updatedAt: string;
}