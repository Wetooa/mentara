import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { WorksheetSubmissionUpdateManyMutationInputSchema } from '../inputTypeSchemas/WorksheetSubmissionUpdateManyMutationInputSchema'
import { WorksheetSubmissionUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/WorksheetSubmissionUncheckedUpdateManyInputSchema'
import { WorksheetSubmissionWhereInputSchema } from '../inputTypeSchemas/WorksheetSubmissionWhereInputSchema'

export const WorksheetSubmissionUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.WorksheetSubmissionUpdateManyAndReturnArgs> = z.object({
  data: z.union([ WorksheetSubmissionUpdateManyMutationInputSchema,WorksheetSubmissionUncheckedUpdateManyInputSchema ]),
  where: WorksheetSubmissionWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default WorksheetSubmissionUpdateManyAndReturnArgsSchema;
