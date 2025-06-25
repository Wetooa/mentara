import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { PreAssessmentWhereInputSchema } from '../inputTypeSchemas/PreAssessmentWhereInputSchema'
import { PreAssessmentOrderByWithRelationInputSchema } from '../inputTypeSchemas/PreAssessmentOrderByWithRelationInputSchema'
import { PreAssessmentWhereUniqueInputSchema } from '../inputTypeSchemas/PreAssessmentWhereUniqueInputSchema'

export const PreAssessmentAggregateArgsSchema: z.ZodType<Prisma.PreAssessmentAggregateArgs> = z.object({
  where: PreAssessmentWhereInputSchema.optional(),
  orderBy: z.union([ PreAssessmentOrderByWithRelationInputSchema.array(),PreAssessmentOrderByWithRelationInputSchema ]).optional(),
  cursor: PreAssessmentWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default PreAssessmentAggregateArgsSchema;
