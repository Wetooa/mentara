import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { TherapistIncludeSchema } from '../inputTypeSchemas/TherapistIncludeSchema'
import { TherapistWhereUniqueInputSchema } from '../inputTypeSchemas/TherapistWhereUniqueInputSchema'
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"
import { AdminArgsSchema } from "../outputTypeSchemas/AdminArgsSchema"
import { MeetingFindManyArgsSchema } from "../outputTypeSchemas/MeetingFindManyArgsSchema"
import { TherapistAvailabilityFindManyArgsSchema } from "../outputTypeSchemas/TherapistAvailabilityFindManyArgsSchema"
import { WorksheetFindManyArgsSchema } from "../outputTypeSchemas/WorksheetFindManyArgsSchema"
import { ClientTherapistFindManyArgsSchema } from "../outputTypeSchemas/ClientTherapistFindManyArgsSchema"
import { ReviewFindManyArgsSchema } from "../outputTypeSchemas/ReviewFindManyArgsSchema"
import { TherapistFilesFindManyArgsSchema } from "../outputTypeSchemas/TherapistFilesFindManyArgsSchema"
import { TherapistCountOutputTypeArgsSchema } from "../outputTypeSchemas/TherapistCountOutputTypeArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const TherapistSelectSchema: z.ZodType<Prisma.TherapistSelect> = z.object({
  userId: z.boolean().optional(),
  mobile: z.boolean().optional(),
  province: z.boolean().optional(),
  status: z.boolean().optional(),
  submissionDate: z.boolean().optional(),
  processingDate: z.boolean().optional(),
  processedByAdminId: z.boolean().optional(),
  providerType: z.boolean().optional(),
  professionalLicenseType: z.boolean().optional(),
  isPRCLicensed: z.boolean().optional(),
  prcLicenseNumber: z.boolean().optional(),
  expirationDateOfLicense: z.boolean().optional(),
  practiceStartDate: z.boolean().optional(),
  yearsOfExperience: z.boolean().optional(),
  areasOfExpertise: z.boolean().optional(),
  assessmentTools: z.boolean().optional(),
  therapeuticApproachesUsedList: z.boolean().optional(),
  languagesOffered: z.boolean().optional(),
  providedOnlineTherapyBefore: z.boolean().optional(),
  comfortableUsingVideoConferencing: z.boolean().optional(),
  preferredSessionLength: z.boolean().optional(),
<<<<<<< HEAD
  accepts: z.boolean().optional(),
=======
>>>>>>> 370c253f5291a6f156c41c45aa1da22a5b06d279
  privateConfidentialSpace: z.boolean().optional(),
  compliesWithDataPrivacyAct: z.boolean().optional(),
  professionalLiabilityInsurance: z.boolean().optional(),
  complaintsOrDisciplinaryActions: z.boolean().optional(),
  willingToAbideByPlatformGuidelines: z.boolean().optional(),
  expertise: z.boolean().optional(),
  approaches: z.boolean().optional(),
  languages: z.boolean().optional(),
  illnessSpecializations: z.boolean().optional(),
  acceptTypes: z.boolean().optional(),
  treatmentSuccessRates: z.boolean().optional(),
<<<<<<< HEAD
  uploadedFiles: z.boolean().optional(),
  sessionLength: z.boolean().optional(),
  hourlyRate: z.boolean().optional(),
  bio: z.boolean().optional(),
  profileImageUrl: z.boolean().optional(),
  profileComplete: z.boolean().optional(),
  isActive: z.boolean().optional(),
  patientSatisfaction: z.boolean().optional(),
  totalPatients: z.boolean().optional(),
=======
  sessionLength: z.boolean().optional(),
  hourlyRate: z.boolean().optional(),
>>>>>>> 370c253f5291a6f156c41c45aa1da22a5b06d279
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  processedByAdmin: z.union([z.boolean(),z.lazy(() => AdminArgsSchema)]).optional(),
  meetings: z.union([z.boolean(),z.lazy(() => MeetingFindManyArgsSchema)]).optional(),
  therapistAvailabilities: z.union([z.boolean(),z.lazy(() => TherapistAvailabilityFindManyArgsSchema)]).optional(),
  worksheets: z.union([z.boolean(),z.lazy(() => WorksheetFindManyArgsSchema)]).optional(),
  assignedClients: z.union([z.boolean(),z.lazy(() => ClientTherapistFindManyArgsSchema)]).optional(),
  reviews: z.union([z.boolean(),z.lazy(() => ReviewFindManyArgsSchema)]).optional(),
  therapistFiles: z.union([z.boolean(),z.lazy(() => TherapistFilesFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => TherapistCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const TherapistFindUniqueArgsSchema: z.ZodType<Prisma.TherapistFindUniqueArgs> = z.object({
  select: TherapistSelectSchema.optional(),
  include: z.lazy(() => TherapistIncludeSchema).optional(),
  where: TherapistWhereUniqueInputSchema,
}).strict() ;

export default TherapistFindUniqueArgsSchema;
