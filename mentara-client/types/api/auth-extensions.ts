// Frontend-specific auth types that extend or complement commons types
// These types are not part of the API contract but are used in frontend

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
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

// Pre-assessment related types
export interface PreAssessmentSubmission {
  answerMatrix: number[][];
  metadata?: Record<string, any>;
}

export interface CommunityAssignmentResponse {
  success: boolean;
  assignedCommunities: string[];
}

export interface ForceLogoutRequest {
  userId: string;
  reason?: string;
}

export interface ForceLogoutResponse {
  success: boolean;
  message: string;
}