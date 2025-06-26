import { z } from 'zod';
import { JsonValueSchema } from '../inputTypeSchemas/JsonValueSchema'
import { Prisma } from '@prisma/client'

/////////////////////////////////////////
// THERAPIST SCHEMA
/////////////////////////////////////////

export const TherapistSchema = z.object({
  userId: z.string(),
  approved: z.boolean(),
  status: z.string(),
  submissionDate: z.coerce.date(),
  processingDate: z.coerce.date().nullable(),
  processedBy: z.string().nullable(),
  applicationData: JsonValueSchema.nullable(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  mobile: z.string(),
  province: z.string(),
  providerType: z.string(),
  professionalLicenseType: z.string(),
  isPRCLicensed: z.string(),
  prcLicenseNumber: z.string(),
  expirationDateOfLicense: z.coerce.date().nullable(),
  isLicenseActive: z.string(),
  practiceStartDate: z.coerce.date(),
  yearsOfExperience: z.string().nullable(),
  areasOfExpertise: JsonValueSchema,
  assessmentTools: JsonValueSchema,
  therapeuticApproachesUsedList: JsonValueSchema,
  languagesOffered: JsonValueSchema,
  providedOnlineTherapyBefore: z.string(),
  comfortableUsingVideoConferencing: z.string(),
  weeklyAvailability: z.string(),
  preferredSessionLength: z.string(),
  accepts: JsonValueSchema,
  privateConfidentialSpace: z.string().nullable(),
  compliesWithDataPrivacyAct: z.string().nullable(),
  professionalLiabilityInsurance: z.string().nullable(),
  complaintsOrDisciplinaryActions: z.string().nullable(),
  willingToAbideByPlatformGuidelines: z.string().nullable(),
  expertise: JsonValueSchema.nullable(),
  approaches: JsonValueSchema.nullable(),
  languages: JsonValueSchema.nullable(),
  illnessSpecializations: JsonValueSchema.nullable(),
  acceptTypes: JsonValueSchema.nullable(),
  treatmentSuccessRates: JsonValueSchema.nullable(),
  uploadedFiles: JsonValueSchema.nullable(),
  sessionLength: z.string().nullable(),
  hourlyRate: z.instanceof(Prisma.Decimal, { message: "Field 'hourlyRate' must be a Decimal. Location: ['Models', 'Therapist']"}).nullable(),
  bio: z.string().nullable(),
  profileImageUrl: z.string().nullable(),
  profileComplete: z.boolean(),
  isActive: z.boolean(),
  patientSatisfaction: z.instanceof(Prisma.Decimal, { message: "Field 'patientSatisfaction' must be a Decimal. Location: ['Models', 'Therapist']"}).nullable(),
  totalPatients: z.number().int(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Therapist = z.infer<typeof TherapistSchema>

export default TherapistSchema;
