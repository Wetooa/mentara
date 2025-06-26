import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { WorksheetSubmissionCreateManyInputSchema } from '../inputTypeSchemas/WorksheetSubmissionCreateManyInputSchema'

export const WorksheetSubmissionCreateManyArgsSchema: z.ZodType<Prisma.WorksheetSubmissionCreateManyArgs> = z.object({
  data: z.union([ WorksheetSubmissionCreateManyInputSchema,WorksheetSubmissionCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default WorksheetSubmissionCreateManyArgsSchema;
