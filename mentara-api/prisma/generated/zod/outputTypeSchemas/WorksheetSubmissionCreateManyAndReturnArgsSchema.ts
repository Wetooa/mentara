import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { WorksheetSubmissionCreateManyInputSchema } from '../inputTypeSchemas/WorksheetSubmissionCreateManyInputSchema'

export const WorksheetSubmissionCreateManyAndReturnArgsSchema: z.ZodType<Prisma.WorksheetSubmissionCreateManyAndReturnArgs> = z.object({
  data: z.union([ WorksheetSubmissionCreateManyInputSchema,WorksheetSubmissionCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default WorksheetSubmissionCreateManyAndReturnArgsSchema;
