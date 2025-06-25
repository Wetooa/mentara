import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ClientArgsSchema } from "../outputTypeSchemas/ClientArgsSchema"

export const PreAssessmentIncludeSchema: z.ZodType<Prisma.PreAssessmentInclude> = z.object({
  client: z.union([z.boolean(),z.lazy(() => ClientArgsSchema)]).optional(),
}).strict()

export default PreAssessmentIncludeSchema;
