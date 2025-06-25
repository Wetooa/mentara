import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { WorksheetArgsSchema } from "../outputTypeSchemas/WorksheetArgsSchema"
import { ClientArgsSchema } from "../outputTypeSchemas/ClientArgsSchema"

export const WorksheetSubmissionIncludeSchema: z.ZodType<Prisma.WorksheetSubmissionInclude> = z.object({
  worksheet: z.union([z.boolean(),z.lazy(() => WorksheetArgsSchema)]).optional(),
  client: z.union([z.boolean(),z.lazy(() => ClientArgsSchema)]).optional(),
}).strict()

export default WorksheetSubmissionIncludeSchema;
