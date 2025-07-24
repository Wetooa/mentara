export interface UpdateClientDto {
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatarUrl?: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
  gender?: string;
  location?: string;
  emergencyContact?: string;
}

export interface TherapistRecommendation {
  id: string;
  firstName: string;
  lastName: string;
  title: string;
  specialties: string[];
  hourlyRate: number;
  experience: number;
  province: string | null;
  isActive: boolean;
  bio?: string;
  profileImage?: string;
}

// Client profile DTO interface
export interface ClientProfileDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}
