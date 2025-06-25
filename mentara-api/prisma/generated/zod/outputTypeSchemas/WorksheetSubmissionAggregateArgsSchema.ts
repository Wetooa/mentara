import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { WorksheetSubmissionWhereInputSchema } from '../inputTypeSchemas/WorksheetSubmissionWhereInputSchema'
import { WorksheetSubmissionOrderByWithRelationInputSchema } from '../inputTypeSchemas/WorksheetSubmissionOrderByWithRelationInputSchema'
import { WorksheetSubmissionWhereUniqueInputSchema } from '../inputTypeSchemas/WorksheetSubmissionWhereUniqueInputSchema'

export const WorksheetSubmissionAggregateArgsSchema: z.ZodType<Prisma.WorksheetSubmissionAggregateArgs> = z.object({
  where: WorksheetSubmissionWhereInputSchema.optional(),
  orderBy: z.union([ WorksheetSubmissionOrderByWithRelationInputSchema.array(),WorksheetSubmissionOrderByWithRelationInputSchema ]).optional(),
  cursor: WorksheetSubmissionWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default WorksheetSubmissionAggregateArgsSchema;
