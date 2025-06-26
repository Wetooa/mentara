import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { PreAssessmentWhereInputSchema } from '../inputTypeSchemas/PreAssessmentWhereInputSchema'

export const PreAssessmentDeleteManyArgsSchema: z.ZodType<Prisma.PreAssessmentDeleteManyArgs> = z.object({
  where: PreAssessmentWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default PreAssessmentDeleteManyArgsSchema;
