import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"
import { AdminArgsSchema } from "../outputTypeSchemas/AdminArgsSchema"
import { MeetingFindManyArgsSchema } from "../outputTypeSchemas/MeetingFindManyArgsSchema"
import { TherapistAvailabilityFindManyArgsSchema } from "../outputTypeSchemas/TherapistAvailabilityFindManyArgsSchema"
import { WorksheetFindManyArgsSchema } from "../outputTypeSchemas/WorksheetFindManyArgsSchema"
import { ClientTherapistFindManyArgsSchema } from "../outputTypeSchemas/ClientTherapistFindManyArgsSchema"
import { ReviewFindManyArgsSchema } from "../outputTypeSchemas/ReviewFindManyArgsSchema"
import { TherapistFilesFindManyArgsSchema } from "../outputTypeSchemas/TherapistFilesFindManyArgsSchema"
import { TherapistCountOutputTypeArgsSchema } from "../outputTypeSchemas/TherapistCountOutputTypeArgsSchema"

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
  areasOfExpertise: z.boolean().optional(),
  assessmentTools: z.boolean().optional(),
  therapeuticApproachesUsedList: z.boolean().optional(),
  languagesOffered: z.boolean().optional(),
  providedOnlineTherapyBefore: z.boolean().optional(),
  comfortableUsingVideoConferencing: z.boolean().optional(),
  preferredSessionLength: z.boolean().optional(),
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
  sessionLength: z.boolean().optional(),
  hourlyRate: z.boolean().optional(),
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

export default TherapistSelectSchema;
