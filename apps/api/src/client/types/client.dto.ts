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
  profileImage?: string | undefined;
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

// Client preferences DTOs
export interface CreateClientPreferencesDto {
  genderPreference?: string;
  agePreference?: string;
  languagePreferences?: string[];
  treatmentApproaches?: string[];
  sessionFormat?: string;
  sessionFrequency?: string;
  budgetRange?: string;
  locationPreference?: string;
  availabilityPreference?: string[];
  specialConsiderations?: string;
}

export interface UpdateClientPreferencesDto {
  genderPreference?: string;
  agePreference?: string;
  languagePreferences?: string[];
  treatmentApproaches?: string[];
  sessionFormat?: string;
  sessionFrequency?: string;
  budgetRange?: string;
  locationPreference?: string;
  availabilityPreference?: string[];
  specialConsiderations?: string;
}

export interface ClientPreferencesDto {
  id: string;
  clientId: string;
  genderPreference?: string;
  agePreference?: string;
  languagePreferences: string[];
  treatmentApproaches: string[];
  sessionFormat?: string;
  sessionFrequency?: string;
  budgetRange?: string;
  locationPreference?: string;
  availabilityPreference: string[];
  specialConsiderations?: string;
  createdAt: string;
  updatedAt: string;
}
