import { z } from 'zod';

export const TherapistIdParamSchema = z.object({
  id: z.string().uuid('Invalid therapist ID format'),
});

export const CreateTherapistSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
  mobile: z.string().min(1, 'Mobile is required'),
  province: z.string().min(1, 'Province is required'),
  timezone: z.string().optional().default('UTC'),
  providerType: z.enum(['LICENSED_PSYCHOLOGIST', 'LICENSED_GUIDANCE_COUNSELOR']),
  professionalLicenseType: z.string().min(1, 'Professional license type is required'),
  prcLicenseNumber: z.string().min(1, 'PRC license number is required'),
  expirationDateOfLicense: z.union([z.string(), z.date()]),
  practiceStartDate: z.union([z.string(), z.date()]),
  certifications: z.any().optional(),
  certificateUrls: z.array(z.string().url()).optional(),
  certificateNames: z.array(z.string()).optional(),
  licenseUrls: z.array(z.string().url()).optional(),
  licenseNames: z.array(z.string()).optional(),
  documentUrls: z.array(z.string().url()).optional(),
  documentNames: z.array(z.string()).optional(),
  yearsOfExperience: z.number().int().min(0).optional(),
  educationBackground: z.string().optional(),
  specialCertifications: z.array(z.string()).optional(),
  practiceLocation: z.string().optional(),
  acceptsInsurance: z.boolean().optional(),
  acceptedInsuranceTypes: z.array(z.string()).optional(),
  areasOfExpertise: z.array(z.string()).optional(),
  otherAreaOfExpertise: z.string().optional(),
  therapeuticApproachesUsedList: z.array(z.string()).optional(),
  languagesOffered: z.array(z.string()).optional(),
  providedOnlineTherapyBefore: z.boolean(),
  comfortableUsingVideoConferencing: z.boolean(),
  preferredSessionLength: z.array(z.number().int().positive()),
  privateConfidentialSpace: z.string().optional(),
  compliesWithDataPrivacyAct: z.boolean(),
  complaintsOrDisciplinaryActions: z.string().optional(),
  willingToAbideByPlatformGuidelines: z.boolean(),
  expertise: z.array(z.string()).optional(),
  approaches: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  illnessSpecializations: z.array(z.string()).optional(),
  acceptTypes: z.array(z.string()).optional(),
  treatmentSuccessRates: z.any(),
  sessionLength: z.string(),
  hourlyRate: z.number().positive(),
  preferOnlineOrOffline: z.string().optional(),
  willingToCaterOutsideCebu: z.boolean().default(false),
  preferredPayrollAccount: z.string().optional(),
}).strict();

export const UpdateTherapistSchema = CreateTherapistSchema.partial()
  .omit({ userId: true })
  .extend({
    status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
  })
  .strict();
