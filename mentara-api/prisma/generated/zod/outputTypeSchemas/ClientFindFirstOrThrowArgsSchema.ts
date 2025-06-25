import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ClientIncludeSchema } from '../inputTypeSchemas/ClientIncludeSchema'
import { ClientWhereInputSchema } from '../inputTypeSchemas/ClientWhereInputSchema'
import { ClientOrderByWithRelationInputSchema } from '../inputTypeSchemas/ClientOrderByWithRelationInputSchema'
import { ClientWhereUniqueInputSchema } from '../inputTypeSchemas/ClientWhereUniqueInputSchema'
import { ClientScalarFieldEnumSchema } from '../inputTypeSchemas/ClientScalarFieldEnumSchema'
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"
import { WorksheetFindManyArgsSchema } from "../outputTypeSchemas/WorksheetFindManyArgsSchema"
import { PreAssessmentArgsSchema } from "../outputTypeSchemas/PreAssessmentArgsSchema"
import { WorksheetSubmissionFindManyArgsSchema } from "../outputTypeSchemas/WorksheetSubmissionFindManyArgsSchema"
import { ClientMedicalHistoryFindManyArgsSchema } from "../outputTypeSchemas/ClientMedicalHistoryFindManyArgsSchema"
import { ClientPreferenceFindManyArgsSchema } from "../outputTypeSchemas/ClientPreferenceFindManyArgsSchema"
import { ClientTherapistFindManyArgsSchema } from "../outputTypeSchemas/ClientTherapistFindManyArgsSchema"
import { MeetingFindManyArgsSchema } from "../outputTypeSchemas/MeetingFindManyArgsSchema"
import { ClientCountOutputTypeArgsSchema } from "../outputTypeSchemas/ClientCountOutputTypeArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const ClientSelectSchema: z.ZodType<Prisma.ClientSelect> = z.object({
  userId: z.boolean().optional(),
  hasSeenTherapistRecommendations: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  worksheets: z.union([z.boolean(),z.lazy(() => WorksheetFindManyArgsSchema)]).optional(),
  preAssessment: z.union([z.boolean(),z.lazy(() => PreAssessmentArgsSchema)]).optional(),
  worksheetSubmissions: z.union([z.boolean(),z.lazy(() => WorksheetSubmissionFindManyArgsSchema)]).optional(),
  clientMedicalHistory: z.union([z.boolean(),z.lazy(() => ClientMedicalHistoryFindManyArgsSchema)]).optional(),
  clientPreferences: z.union([z.boolean(),z.lazy(() => ClientPreferenceFindManyArgsSchema)]).optional(),
  assignedTherapists: z.union([z.boolean(),z.lazy(() => ClientTherapistFindManyArgsSchema)]).optional(),
  meetings: z.union([z.boolean(),z.lazy(() => MeetingFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => ClientCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const ClientFindFirstOrThrowArgsSchema: z.ZodType<Prisma.ClientFindFirstOrThrowArgs> = z.object({
  select: ClientSelectSchema.optional(),
  include: z.lazy(() => ClientIncludeSchema).optional(),
  where: ClientWhereInputSchema.optional(),
  orderBy: z.union([ ClientOrderByWithRelationInputSchema.array(),ClientOrderByWithRelationInputSchema ]).optional(),
  cursor: ClientWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ClientScalarFieldEnumSchema,ClientScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export default ClientFindFirstOrThrowArgsSchema;
