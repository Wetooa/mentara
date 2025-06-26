import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { WorksheetSubmissionWhereInputSchema } from '../inputTypeSchemas/WorksheetSubmissionWhereInputSchema'
import { WorksheetSubmissionOrderByWithAggregationInputSchema } from '../inputTypeSchemas/WorksheetSubmissionOrderByWithAggregationInputSchema'
import { WorksheetSubmissionScalarFieldEnumSchema } from '../inputTypeSchemas/WorksheetSubmissionScalarFieldEnumSchema'
import { WorksheetSubmissionScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/WorksheetSubmissionScalarWhereWithAggregatesInputSchema'

export const WorksheetSubmissionGroupByArgsSchema: z.ZodType<Prisma.WorksheetSubmissionGroupByArgs> = z.object({
  where: WorksheetSubmissionWhereInputSchema.optional(),
  orderBy: z.union([ WorksheetSubmissionOrderByWithAggregationInputSchema.array(),WorksheetSubmissionOrderByWithAggregationInputSchema ]).optional(),
  by: WorksheetSubmissionScalarFieldEnumSchema.array(),
  having: WorksheetSubmissionScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default WorksheetSubmissionGroupByArgsSchema;
