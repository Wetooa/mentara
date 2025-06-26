import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { PreAssessmentWhereInputSchema } from '../inputTypeSchemas/PreAssessmentWhereInputSchema'
import { PreAssessmentOrderByWithAggregationInputSchema } from '../inputTypeSchemas/PreAssessmentOrderByWithAggregationInputSchema'
import { PreAssessmentScalarFieldEnumSchema } from '../inputTypeSchemas/PreAssessmentScalarFieldEnumSchema'
import { PreAssessmentScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/PreAssessmentScalarWhereWithAggregatesInputSchema'

export const PreAssessmentGroupByArgsSchema: z.ZodType<Prisma.PreAssessmentGroupByArgs> = z.object({
  where: PreAssessmentWhereInputSchema.optional(),
  orderBy: z.union([ PreAssessmentOrderByWithAggregationInputSchema.array(),PreAssessmentOrderByWithAggregationInputSchema ]).optional(),
  by: PreAssessmentScalarFieldEnumSchema.array(),
  having: PreAssessmentScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default PreAssessmentGroupByArgsSchema;
