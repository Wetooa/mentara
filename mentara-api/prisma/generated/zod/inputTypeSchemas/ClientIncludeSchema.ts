import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"
import { WorksheetFindManyArgsSchema } from "../outputTypeSchemas/WorksheetFindManyArgsSchema"
import { PreAssessmentArgsSchema } from "../outputTypeSchemas/PreAssessmentArgsSchema"
import { WorksheetSubmissionFindManyArgsSchema } from "../outputTypeSchemas/WorksheetSubmissionFindManyArgsSchema"
import { ClientMedicalHistoryFindManyArgsSchema } from "../outputTypeSchemas/ClientMedicalHistoryFindManyArgsSchema"
import { ClientPreferenceFindManyArgsSchema } from "../outputTypeSchemas/ClientPreferenceFindManyArgsSchema"
import { ClientTherapistFindManyArgsSchema } from "../outputTypeSchemas/ClientTherapistFindManyArgsSchema"
import { MeetingFindManyArgsSchema } from "../outputTypeSchemas/MeetingFindManyArgsSchema"
import { ReviewFindManyArgsSchema } from "../outputTypeSchemas/ReviewFindManyArgsSchema"
import { ClientCountOutputTypeArgsSchema } from "../outputTypeSchemas/ClientCountOutputTypeArgsSchema"

export const ClientIncludeSchema: z.ZodType<Prisma.ClientInclude> = z.object({
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  worksheets: z.union([z.boolean(),z.lazy(() => WorksheetFindManyArgsSchema)]).optional(),
  preAssessment: z.union([z.boolean(),z.lazy(() => PreAssessmentArgsSchema)]).optional(),
  worksheetSubmissions: z.union([z.boolean(),z.lazy(() => WorksheetSubmissionFindManyArgsSchema)]).optional(),
  clientMedicalHistory: z.union([z.boolean(),z.lazy(() => ClientMedicalHistoryFindManyArgsSchema)]).optional(),
  clientPreferences: z.union([z.boolean(),z.lazy(() => ClientPreferenceFindManyArgsSchema)]).optional(),
  assignedTherapists: z.union([z.boolean(),z.lazy(() => ClientTherapistFindManyArgsSchema)]).optional(),
  meetings: z.union([z.boolean(),z.lazy(() => MeetingFindManyArgsSchema)]).optional(),
  reviews: z.union([z.boolean(),z.lazy(() => ReviewFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => ClientCountOutputTypeArgsSchema)]).optional(),
}).strict()

export default ClientIncludeSchema;
