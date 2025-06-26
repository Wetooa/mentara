import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { WorksheetMaterialFindManyArgsSchema } from "../outputTypeSchemas/WorksheetMaterialFindManyArgsSchema"
import { WorksheetSubmissionFindManyArgsSchema } from "../outputTypeSchemas/WorksheetSubmissionFindManyArgsSchema"
import { ClientArgsSchema } from "../outputTypeSchemas/ClientArgsSchema"
import { TherapistArgsSchema } from "../outputTypeSchemas/TherapistArgsSchema"
import { WorksheetCountOutputTypeArgsSchema } from "../outputTypeSchemas/WorksheetCountOutputTypeArgsSchema"

export const WorksheetSelectSchema: z.ZodType<Prisma.WorksheetSelect> = z.object({
  id: z.boolean().optional(),
  clientId: z.boolean().optional(),
  therapistId: z.boolean().optional(),
  title: z.boolean().optional(),
  description: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  materials: z.union([z.boolean(),z.lazy(() => WorksheetMaterialFindManyArgsSchema)]).optional(),
  submissions: z.union([z.boolean(),z.lazy(() => WorksheetSubmissionFindManyArgsSchema)]).optional(),
  client: z.union([z.boolean(),z.lazy(() => ClientArgsSchema)]).optional(),
  therapist: z.union([z.boolean(),z.lazy(() => TherapistArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => WorksheetCountOutputTypeArgsSchema)]).optional(),
}).strict()

export default WorksheetSelectSchema;
