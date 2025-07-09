// Auth-related DTOs matching backend exactly

export interface RegisterClientDto {
  user: {
    email: string;
    firstName: string;
    middleName: string;
    lastName: string;
    birthDate: string;
    address: string;
    avatarUrl: string;
    role: 'client';
    bio: string;
    coverImageUrl: string;
    isActive: boolean;
  };
}

export interface RegisterTherapistDto {
  user: {
    email: string;
    firstName: string;
    middleName: string;
    lastName: string;
    birthDate: string;
    address: string;
    avatarUrl: string;
    role: 'therapist';
    bio: string;
    coverImageUrl: string;
    isActive: boolean;
  };
}

export interface UpdateClientDto {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  birthDate?: string;
  address?: string;
  avatarUrl?: string;
  bio?: string;
  coverImageUrl?: string;
}

export interface UpdateTherapistDto {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  birthDate?: string;
  address?: string;
  avatarUrl?: string;
  bio?: string;
  coverImageUrl?: string;
}

export interface AuthUser {
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

export interface ForceLogoutRequest {
  userId: string;
  reason?: string;
}

export interface ForceLogoutResponse {
  success: boolean;
  message: string;
}

// Pre-assessment related types
export interface PreAssessmentSubmission {
  answerMatrix: number[][];
  metadata?: Record<string, any>;
}

export interface CommunityAssignmentResponse {
  success: boolean;
  assignedCommunities: string[];
}

export interface FirstSignInResponse {
  isFirstSignIn: boolean;
}

// For backward compatibility with existing code
export interface RegisterUserRequest extends RegisterClientDto {}