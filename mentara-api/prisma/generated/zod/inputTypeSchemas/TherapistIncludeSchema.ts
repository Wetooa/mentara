import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"
import { MeetingFindManyArgsSchema } from "../outputTypeSchemas/MeetingFindManyArgsSchema"
import { TherapistAvailabilityFindManyArgsSchema } from "../outputTypeSchemas/TherapistAvailabilityFindManyArgsSchema"
import { WorksheetFindManyArgsSchema } from "../outputTypeSchemas/WorksheetFindManyArgsSchema"
import { ClientTherapistFindManyArgsSchema } from "../outputTypeSchemas/ClientTherapistFindManyArgsSchema"
import { TherapistCountOutputTypeArgsSchema } from "../outputTypeSchemas/TherapistCountOutputTypeArgsSchema"

export const TherapistIncludeSchema: z.ZodType<Prisma.TherapistInclude> = z.object({
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  meetings: z.union([z.boolean(),z.lazy(() => MeetingFindManyArgsSchema)]).optional(),
  therapistAvailabilities: z.union([z.boolean(),z.lazy(() => TherapistAvailabilityFindManyArgsSchema)]).optional(),
  worksheets: z.union([z.boolean(),z.lazy(() => WorksheetFindManyArgsSchema)]).optional(),
  assignedClients: z.union([z.boolean(),z.lazy(() => ClientTherapistFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => TherapistCountOutputTypeArgsSchema)]).optional(),
}).strict()

export default TherapistIncludeSchema;
