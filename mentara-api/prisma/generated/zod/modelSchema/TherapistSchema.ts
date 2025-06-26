import { z } from 'zod';
import { JsonValueSchema } from '../inputTypeSchemas/JsonValueSchema'
import { Prisma } from '@prisma/client'

/////////////////////////////////////////
// THERAPIST SCHEMA
/////////////////////////////////////////

export const TherapistSchema = z.object({
  userId: z.string(),
  mobile: z.string(),
  province: z.string(),
  status: z.string(),
  submissionDate: z.coerce.date(),
  processingDate: z.coerce.date(),
  processedByAdminId: z.string().nullable(),
  providerType: z.string(),
  professionalLicenseType: z.string(),
  isPRCLicensed: z.string(),
  prcLicenseNumber: z.string(),
  expirationDateOfLicense: z.coerce.date(),
  practiceStartDate: z.coerce.date(),
<<<<<<< HEAD
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
=======
  areasOfExpertise: z.string().array(),
  assessmentTools: z.string().array(),
  therapeuticApproachesUsedList: z.string().array(),
  languagesOffered: z.string().array(),
  providedOnlineTherapyBefore: z.boolean(),
  comfortableUsingVideoConferencing: z.boolean(),
  preferredSessionLength: z.number().int().array(),
  privateConfidentialSpace: z.string().nullable(),
  compliesWithDataPrivacyAct: z.boolean(),
  professionalLiabilityInsurance: z.string().nullable(),
  complaintsOrDisciplinaryActions: z.string().nullable(),
  willingToAbideByPlatformGuidelines: z.boolean(),
  expertise: z.string().array(),
  approaches: z.string().array(),
  languages: z.string().array(),
  illnessSpecializations: z.string().array(),
  acceptTypes: z.string().array(),
  treatmentSuccessRates: JsonValueSchema,
  sessionLength: z.string(),
  hourlyRate: z.instanceof(Prisma.Decimal, { message: "Field 'hourlyRate' must be a Decimal. Location: ['Models', 'Therapist']"}),
>>>>>>> 370c253f5291a6f156c41c45aa1da22a5b06d279
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Therapist = z.infer<typeof TherapistSchema>

export default TherapistSchema;
