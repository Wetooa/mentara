import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { WorksheetSubmissionWhereInputSchema } from '../inputTypeSchemas/WorksheetSubmissionWhereInputSchema'

export const WorksheetSubmissionDeleteManyArgsSchema: z.ZodType<Prisma.WorksheetSubmissionDeleteManyArgs> = z.object({
  where: WorksheetSubmissionWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default WorksheetSubmissionDeleteManyArgsSchema;
