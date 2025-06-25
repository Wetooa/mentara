import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { TherapistIncludeSchema } from '../inputTypeSchemas/TherapistIncludeSchema'
import { TherapistUpdateInputSchema } from '../inputTypeSchemas/TherapistUpdateInputSchema'
import { TherapistUncheckedUpdateInputSchema } from '../inputTypeSchemas/TherapistUncheckedUpdateInputSchema'
import { TherapistWhereUniqueInputSchema } from '../inputTypeSchemas/TherapistWhereUniqueInputSchema'
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"
import { MeetingFindManyArgsSchema } from "../outputTypeSchemas/MeetingFindManyArgsSchema"
import { TherapistAvailabilityFindManyArgsSchema } from "../outputTypeSchemas/TherapistAvailabilityFindManyArgsSchema"
import { WorksheetFindManyArgsSchema } from "../outputTypeSchemas/WorksheetFindManyArgsSchema"
import { ClientTherapistFindManyArgsSchema } from "../outputTypeSchemas/ClientTherapistFindManyArgsSchema"
import { TherapistCountOutputTypeArgsSchema } from "../outputTypeSchemas/TherapistCountOutputTypeArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const TherapistSelectSchema: z.ZodType<Prisma.TherapistSelect> = z.object({
  userId: z.boolean().optional(),
  approved: z.boolean().optional(),
  status: z.boolean().optional(),
  submissionDate: z.boolean().optional(),
  processingDate: z.boolean().optional(),
  processedBy: z.boolean().optional(),
  applicationData: z.boolean().optional(),
  firstName: z.boolean().optional(),
  lastName: z.boolean().optional(),
  email: z.boolean().optional(),
  mobile: z.boolean().optional(),
  province: z.boolean().optional(),
  providerType: z.boolean().optional(),
  professionalLicenseType: z.boolean().optional(),
  isPRCLicensed: z.boolean().optional(),
  prcLicenseNumber: z.boolean().optional(),
  expirationDateOfLicense: z.boolean().optional(),
  isLicenseActive: z.boolean().optional(),
  practiceStartDate: z.boolean().optional(),
  areasOfExpertise: z.boolean().optional(),
  assessmentTools: z.boolean().optional(),
  therapeuticApproachesUsedList: z.boolean().optional(),
  languagesOffered: z.boolean().optional(),
  providedOnlineTherapyBefore: z.boolean().optional(),
  comfortableUsingVideoConferencing: z.boolean().optional(),
  weeklyAvailability: z.boolean().optional(),
  preferredSessionLength: z.boolean().optional(),
  accepts: z.boolean().optional(),
  sessionLength: z.boolean().optional(),
  hourlyRate: z.boolean().optional(),
  expertise: z.boolean().optional(),
  approaches: z.boolean().optional(),
  languages: z.boolean().optional(),
  illnessSpecializations: z.boolean().optional(),
  acceptTypes: z.boolean().optional(),
  treatmentSuccessRates: z.boolean().optional(),
  uploadedFiles: z.boolean().optional(),
  bio: z.boolean().optional(),
  profileImageUrl: z.boolean().optional(),
  profileComplete: z.boolean().optional(),
  isActive: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  meetings: z.union([z.boolean(),z.lazy(() => MeetingFindManyArgsSchema)]).optional(),
  therapistAvailabilities: z.union([z.boolean(),z.lazy(() => TherapistAvailabilityFindManyArgsSchema)]).optional(),
  worksheets: z.union([z.boolean(),z.lazy(() => WorksheetFindManyArgsSchema)]).optional(),
  assignedClients: z.union([z.boolean(),z.lazy(() => ClientTherapistFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => TherapistCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const TherapistUpdateArgsSchema: z.ZodType<Prisma.TherapistUpdateArgs> = z.object({
  select: TherapistSelectSchema.optional(),
  include: z.lazy(() => TherapistIncludeSchema).optional(),
  data: z.union([ TherapistUpdateInputSchema,TherapistUncheckedUpdateInputSchema ]),
  where: TherapistWhereUniqueInputSchema,
}).strict() ;

export default TherapistUpdateArgsSchema;
